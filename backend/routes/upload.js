const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { auth } = require('../middleware/auth');
const { rawStorage, finalStorage } = require('../middleware/cloudinaryStorage');
const Project = require('../models/Project');
const Notification = require('../models/Notification');

const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadPath = path.join(__dirname, '../uploads');
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const fileFilter = (req, file, cb) => {
  // Check file type
  if (file.fieldname === 'video') {
    if (file.mimetype.startsWith('video/')) {
      cb(null, true);
    } else {
      cb(new Error('Only video files are allowed for video upload'), false);
    }
  } else if (file.fieldname === 'thumbnail') {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed for thumbnail upload'), false);
    }
  } else {
    cb(new Error('Unexpected field'), false);
  }
};

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 100 * 1024 * 1024, // 100MB limit
  },
  fileFilter: fileFilter
});

// Raw file upload (business owner)
const uploadRaw = multer({ 
  storage: rawStorage,
  limits: {
    fileSize: 100 * 1024 * 1024, // 100MB limit
  },
  fileFilter: (req, file, cb) => {
    // Allow video and image files
    if (file.mimetype.startsWith('video/') || file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only video and image files are allowed'), false);
    }
  }
});

router.post('/raw/:projectId', auth, uploadRaw.array('files'), async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: 'No files uploaded' });
    }
    
    const project = await Project.findById(req.params.projectId);
    if (!project) return res.status(404).json({ error: 'Project not found' });
    
    // Check if user has permission to upload to this project
    const hasPermission = project.owner.toString() === req.user._id.toString() ||
                         project.collaborators.some(collab => 
                           collab.user.toString() === req.user._id.toString() && 
                           ['editor', 'admin'].includes(collab.role)
                         );

    if (!hasPermission) {
      return res.status(403).json({ error: 'Access denied' });
    }
    
    const files = req.files.map(file => {
      return {
        url: file.secure_url || file.url, // Cloudinary provides secure_url
        public_id: file.public_id || file.filename,
        originalname: file.originalname,
        resource_type: file.resource_type || file.mimetype,
        size: file.bytes || file.size,
        uploadedAt: new Date()
      };
    });
    
    project.rawFiles = (project.rawFiles || []).concat(files);
    await project.save();
    
    res.json({ success: true, files });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Final file upload (editor)
const uploadFinal = multer({ 
  storage: finalStorage,
  limits: {
    fileSize: 100 * 1024 * 1024, // 100MB limit
  },
  fileFilter: (req, file, cb) => {
    // Allow video and image files
    if (file.mimetype.startsWith('video/') || file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only video and image files are allowed'), false);
    }
  }
});

router.post('/final/:projectId', auth, uploadFinal.single('file'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }
  
  const project = await Project.findById(req.params.projectId);
  if (!project) return res.status(404).json({ error: 'Project not found' });
  
  // Check if user has permission to upload to this project
  const hasPermission = project.owner.toString() === req.user._id.toString() ||
                       project.collaborators.some(collab => 
                         collab.user.toString() === req.user._id.toString() && 
                         ['editor', 'admin'].includes(collab.role)
                       );

  if (!hasPermission) {
    return res.status(403).json({ error: 'Access denied' });
  }
  
  const file = req.file;
  let url = file.secure_url || file.url || file.path;
  if (!url && file.public_id) {
    // Construct the Cloudinary URL manually as a fallback
    const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
    const ext = file.originalname.split('.').pop();
    // Default to video resource type for final files
    url = `https://res.cloudinary.com/${cloudName}/video/upload/${file.public_id}.${ext}`;
  }
  project.finalFile = {
    url,
    public_id: file.public_id || file.filename,
    originalname: file.originalname,
    resource_type: file.resource_type || file.mimetype,
    size: file.bytes || file.size,
    uploadedAt: new Date()
  };
  project.status = 'completed';
  project.deliveredAt = new Date();
  
  await project.save();
  res.json({ success: true, file: project.finalFile });
});

// @route   POST /api/upload/video/:projectId
// @desc    Upload video file to project
// @access  Private
router.post('/video/:projectId', auth, upload.single('video'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: 'No video file uploaded' });
  }

  const project = await Project.findById(req.params.projectId);
  if (!project) {
    // Clean up uploaded file if project not found
    fs.unlinkSync(req.file.path);
    return res.status(404).json({ message: 'Project not found' });
  }

  // Check if user has permission to upload to this project
  const hasPermission = project.owner.toString() === req.user._id.toString() ||
                       project.collaborators.some(collab => 
                         collab.user.toString() === req.user._id.toString() && 
                         ['editor', 'admin'].includes(collab.role)
                       );

  if (!hasPermission) {
    // Clean up uploaded file if no permission
    fs.unlinkSync(req.file.path);
    return res.status(403).json({ message: 'Access denied' });
  }

  // Remove old video file if exists
  if (project.videoFile && project.videoFile.path) {
    const oldPath = project.videoFile.path;
    if (fs.existsSync(oldPath)) {
      fs.unlinkSync(oldPath);
    }
  }

  // Update project with new video file info
  project.videoFile = {
    filename: req.file.filename,
    originalName: req.file.originalname,
    mimeType: req.file.mimetype,
    size: req.file.size,
    path: req.file.path,
    uploadedAt: new Date()
  };

  await project.save();

  res.json({
    message: 'Video uploaded successfully',
    videoFile: project.videoFile
  });
});

// @route   POST /api/upload/thumbnail/:projectId
// @desc    Upload thumbnail image to project
// @access  Private
router.post('/thumbnail/:projectId', auth, upload.single('thumbnail'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: 'No thumbnail file uploaded' });
  }

  const project = await Project.findById(req.params.projectId);
  if (!project) {
    // Clean up uploaded file if project not found
    fs.unlinkSync(req.file.path);
    return res.status(404).json({ message: 'Project not found' });
  }

  // Check if user has permission to upload to this project
  const hasPermission = project.owner.toString() === req.user._id.toString() ||
                       project.collaborators.some(collab => 
                         collab.user.toString() === req.user._id.toString() && 
                         ['editor', 'admin'].includes(collab.role)
                       );

  if (!hasPermission) {
    // Clean up uploaded file if no permission
    fs.unlinkSync(req.file.path);
    return res.status(403).json({ message: 'Access denied' });
  }

  // Remove old thumbnail file if exists
  if (project.thumbnailFile && project.thumbnailFile.path) {
    const oldPath = project.thumbnailFile.path;
    if (fs.existsSync(oldPath)) {
      fs.unlinkSync(oldPath);
    }
  }

  // Update project with new thumbnail file info
  project.thumbnailFile = {
    filename: req.file.filename,
    originalName: req.file.originalname,
    mimeType: req.file.mimetype,
    size: req.file.size,
    path: req.file.path,
    uploadedAt: new Date()
  };

  await project.save();

  res.json({
    message: 'Thumbnail uploaded successfully',
    thumbnailFile: project.thumbnailFile
  });
});

// @route   DELETE /api/upload/video/:projectId
// @desc    Delete video file from project
// @access  Private
router.delete('/video/:projectId', auth, async (req, res) => {
  const project = await Project.findById(req.params.projectId);
  if (!project) {
    return res.status(404).json({ message: 'Project not found' });
  }

  // Check if user has permission
  const hasPermission = project.owner.toString() === req.user._id.toString() ||
                       project.collaborators.some(collab => 
                         collab.user.toString() === req.user._id.toString() && 
                         ['editor', 'admin'].includes(collab.role)
                       );

  if (!hasPermission) {
    return res.status(403).json({ message: 'Access denied' });
  }

  // Remove video file if exists
  if (project.videoFile && project.videoFile.path) {
    const filePath = project.videoFile.path;
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
  }

  // Clear video file info from project
  project.videoFile = undefined;
  await project.save();

  res.json({ message: 'Video file deleted successfully' });
});

// Cloudinary test endpoint
router.get('/test-cloudinary', auth, async (req, res) => {
  try {
    const cloudinary = require('../config/cloudinary');
    const result = await cloudinary.api.ping();
    res.json({ 
      success: true, 
      message: 'Cloudinary is working',
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key_set: !!process.env.CLOUDINARY_API_KEY,
      api_secret_set: !!process.env.CLOUDINARY_API_SECRET
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      error: error.message,
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key_set: !!process.env.CLOUDINARY_API_KEY,
      api_secret_set: !!process.env.CLOUDINARY_API_SECRET
    });
  }
});

module.exports = router;
