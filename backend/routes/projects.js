const express = require('express');
const { body } = require('express-validator');
const {
  getProjects,
  getProject,
  createProject,
  updateProject,
  deleteProject,
  addCollaborator,
  addComment,
  getAvailableJobs,
  getEditorProjects,
  requestReedit,
  getPayments,
  addReview,
  getReviews,
  getFaqs,
  submitSupportRequest,
  getEditorEarnings,
  getEditorReviews,
} = require('../controllers/projectController');
const { auth } = require('../middleware/auth');
const Message = require('../models/Message');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { chatStorage, revisionStorage, rawStorage } = require('../middleware/cloudinaryStorage');

const router = express.Router();

const chatUpload = multer({ storage: chatStorage, limits: { fileSize: 100 * 1024 * 1024 } });
const revisionUpload = multer({ storage: revisionStorage, limits: { fileSize: 100 * 1024 * 1024 } });
const projectMediaUpload = multer({ storage: rawStorage, limits: { fileSize: 100 * 1024 * 1024 } });

// @route   GET /api/projects
// @desc    Get all projects for user
// @access  Private
router.get('/', auth, getProjects);

// Add new routes for editor dashboard (must be before /:id)
router.get('/available-jobs', auth, getAvailableJobs);
router.get('/editor-projects', auth, getEditorProjects);

// @route   GET /api/projects/:id
// @desc    Get single project
// @access  Private
router.get('/:id', auth, getProject);

// @route   POST /api/projects
// @desc    Create new project (with optional multiple image/video uploads, any field name)
// @access  Private
router.post(
  '/',
  projectMediaUpload.any(),
  [
    auth,
    body('title', 'Title is required').not().isEmpty(),
    body('description', 'Description is required').not().isEmpty(),
    body('category', 'Category must be valid')
      .optional()
      .isIn(['marketing', 'educational', 'entertainment', 'corporate', 'personal', 'other']),
  ],
  async (req, res, next) => {
    try {
      // Limit to 10 files
      if (req.files && req.files.length > 10) {
        return res.status(400).json({ message: 'You can upload a maximum of 10 files per project.' });
      }
      // Handle multiple files from any field name
      let mediaFiles = [];
      if (req.files && req.files.length > 0) {
        mediaFiles = req.files.map(file => ({
          url: file.secure_url || file.url || file.path,
          public_id: file.public_id || file.filename,
          originalname: file.originalname,
          resource_type: file.resource_type || file.mimetype,
          size: file.bytes || file.size,
          uploadedAt: new Date()
        }));
      }
      req.body.mediaFiles = mediaFiles;
      await createProject(req, res, next);
    } catch (err) {
      next(err);
    }
  }
);

// @route   PUT /api/projects/:id
// @desc    Update project
// @access  Private
router.put(
  '/:id',
  [
    auth,
    body('title', 'Title cannot be empty').optional().not().isEmpty(),
    body('description', 'Description cannot be empty').optional().not().isEmpty(),
    body('category', 'Category must be valid')
      .optional()
      .isIn(['marketing', 'educational', 'entertainment', 'corporate', 'personal', 'other']),
    body('status', 'Status must be valid')
      .optional()
      .isIn(['draft', 'in-progress', 'review', 'completed', 'archived']),
  ],
  updateProject
);

// @route   DELETE /api/projects/:id
// @desc    Delete project
// @access  Private
router.delete('/:id', auth, deleteProject);

// @route   POST /api/projects/:id/collaborators
// @desc    Add collaborator to project
// @access  Private
router.post(
  '/:id/collaborators',
  [
    auth,
    body('userId', 'User ID is required').not().isEmpty(),
    body('role', 'Role must be valid')
      .optional()
      .isIn(['viewer', 'editor', 'admin']),
  ],
  addCollaborator
);

// @route   POST /api/projects/:id/comments
// @desc    Add comment to project
// @access  Private
router.post(
  '/:id/comments',
  [
    auth,
    body('text', 'Comment text is required').not().isEmpty(),
  ],
  addComment
);

// Request re-edit (business user)
router.post('/:projectId/reedit', auth, requestReedit);

// Get all messages for a project
router.get('/:projectId/messages', auth, async (req, res) => {
  try {
    // Check if user has access to this project
    const Project = require('../models/Project');
    const project = await Project.findById(req.params.projectId);
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    const hasAccess = project.owner.toString() === req.user._id.toString() ||
                     project.collaborators.some(collab => collab.user.toString() === req.user._id.toString()) ||
                     project.isPublic;

    if (!hasAccess) {
      return res.status(403).json({ message: 'Access denied to project messages' });
    }

    const messages = await Message.find({ projectId: req.params.projectId })
      .sort({ timestamp: 1 })
      .populate('sender', 'name email profilePicture')
      .populate('recipient', 'name email profilePicture');
    res.json({ messages });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch messages' });
  }
});

// Send a message (text or file)
router.post('/:projectId/messages', auth, chatUpload.single('file'), async (req, res) => {
  try {
    // Check if user has access to this project
    const Project = require('../models/Project');
    const project = await Project.findById(req.params.projectId);
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    const hasAccess = project.owner.toString() === req.user._id.toString() ||
                     project.collaborators.some(collab => collab.user.toString() === req.user._id.toString()) ||
                     project.isPublic;

    if (!hasAccess) {
      return res.status(403).json({ message: 'Access denied to project messages' });
    }

    const { text, recipient, type } = req.body;
    let file = null;
    if (req.file) {
      file = {
        url: req.file.secure_url || req.file.url || req.file.path,
        public_id: req.file.public_id || req.file.filename,
        originalname: req.file.originalname,
        resource_type: req.file.resource_type || req.file.mimetype,
        size: req.file.bytes || req.file.size,
        uploadedAt: new Date()
      };
    }
    const message = new Message({
      projectId: req.params.projectId,
      sender: req.user._id,
      recipient,
      text,
      type: req.file ? 'file' : (type || 'text'),
      file
    });
    await message.save();
    await message.populate('sender', 'name email profilePicture');
    await message.populate('recipient', 'name email profilePicture');
    res.json({ message });
  } catch (err) {
    res.status(500).json({ message: 'Failed to send message' });
  }
});

// Mark all messages as read for user in a project
router.patch('/:projectId/messages/read', auth, async (req, res) => {
  try {
    await Message.updateMany({ projectId: req.params.projectId, recipient: req.user._id, read: false }, { $set: { read: true } });
    res.json({ message: 'Messages marked as read' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to mark as read' });
  }
});

// Get payment history for a project
router.get('/:projectId/payments', auth, getPayments);

// Add a review to a project
router.post('/:projectId/reviews', auth, addReview);

// Get all reviews for a project
router.get('/:projectId/reviews', getReviews);

// Get FAQs
router.get('/faqs', getFaqs);

// Submit support request
router.post('/support', auth, submitSupportRequest);

// Get editor earnings, payouts, and payment status
router.get('/editor/earnings', auth, getEditorEarnings);

// Upload a revision (editor)
router.post('/:projectId/revisions', auth, revisionUpload.single('file'), async (req, res) => {
  try {
    const Project = require('../models/Project');
    const project = await Project.findById(req.params.projectId);
    if (!project) return res.status(404).json({ message: 'Project not found' });
    // Only allow editor collaborators
    const isEditor = project.collaborators.some(c => c.user.toString() === req.user._id.toString() && c.role === 'editor');
    if (!isEditor) return res.status(403).json({ message: 'Only assigned editor can upload revisions' });
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }
    
    project.revisions.push({
      file: {
        url: req.file.secure_url || req.file.url,
        public_id: req.file.public_id,
        originalname: req.file.originalname,
        resource_type: req.file.resource_type || req.file.mimetype,
        size: req.file.bytes || req.file.size,
        uploadedAt: new Date()
      },
      uploadedBy: req.user._id,
      comment: req.body.comment || ''
    });
    await project.save();
    res.json({ message: 'Revision uploaded', revisions: project.revisions });
  } catch (err) {
    res.status(500).json({ message: 'Failed to upload revision' });
  }
});

// Mark project as delivered (editor)
router.patch('/:projectId/deliver', auth, async (req, res) => {
  try {
    const Project = require('../models/Project');
    const Notification = require('../models/Notification');
    const project = await Project.findById(req.params.projectId);
    if (!project) return res.status(404).json({ message: 'Project not found' });
    // Only allow editor collaborators
    const isEditor = project.collaborators.some(c => c.user.toString() === req.user._id.toString() && c.role === 'editor');
    if (!isEditor) return res.status(403).json({ message: 'Only assigned editor can mark as delivered' });
    project.status = 'completed';
    project.deliveredAt = new Date();
    await project.save();

    // Notify business owner
    try {
      await Notification.create({
        user: project.owner,
        type: 'delivery',
        message: `Your project '${project.title}' has been delivered!`,
        link: `/project/${project._id}`
      });
    } catch (notifErr) {
      console.error('Notification creation failed:', notifErr);
      return res.status(500).json({ message: 'Notification creation failed', error: notifErr.message });
    }

    res.json({ message: 'Project marked as delivered', deliveredAt: project.deliveredAt });
  } catch (err) {
    console.error('Deliver endpoint error:', err);
    res.status(500).json({ message: 'Failed to mark as delivered', error: err.message });
  }
});

// Get all reviews for an editor
router.get('/editor/:editorId/reviews', getEditorReviews);

module.exports = router;
