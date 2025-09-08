const { validationResult } = require('express-validator');
const Project = require('../models/Project');
const Notification = require('../models/Notification');
const User = require('../models/User');

// @desc    Get all projects for user
// @route   GET /api/projects
// @access  Private
const getProjects = async (req, res) => {
  try {
    const { page = 1, limit = 10, status, category, search } = req.query;
    const query = {
      $or: [
        { owner: req.user._id },
        { 'collaborators.user': req.user._id }
      ]
    };

    // Add filters
    if (status) query.status = status;
    if (category) query.category = category;
    if (search) {
      query.$text = { $search: search };
    }

    const projects = await Project.find(query)
      .populate('owner', 'name email')
      .populate('collaborators.user', 'name email')
      .populate('reviews.user', 'name email profilePicture')
      .sort({ updatedAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Project.countDocuments(query);

    res.json({
      projects,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get single project
// @route   GET /api/projects/:id
// @access  Private
const getProject = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id)
      .populate('owner', 'name email')
      .populate('collaborators.user', 'name email')
      .populate('comments.user', 'name email')
      .populate('comments.replies.user', 'name email')
      .populate('reviews.user', 'name email profilePicture');

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    // Check if user has access to this project
    const isEditor = req.user.role === 'editor';
    const hasAccess = project.owner._id.toString() === req.user._id.toString() ||
                     project.collaborators.some(collab => collab.user._id.toString() === req.user._id.toString()) ||
                     project.isPublic ||
                     isEditor;

    if (!hasAccess) {
      return res.status(403).json({ message: 'Access denied' });
    }

    // Increment views if not owner
    if (project.owner._id.toString() !== req.user._id.toString()) {
      project.views += 1;
      await project.save();
    }

    res.json(project);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Create new project
// @route   POST /api/projects
// @access  Private
const createProject = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { title, description, category, tags, isPublic, shopDetails, editor, addons, budget, deadline, industry, totalPrice } = req.body;
    // mediaFiles is always set by the route handler and is an array
    const mediaFilesArr = req.body.mediaFiles || [];

    const project = await Project.create({
      title,
      description,
      category,
      tags: Array.isArray(tags) ? tags : [],
      isPublic: isPublic || false,
      owner: req.user._id,
      shopDetails,
      collaborators: editor ? [{ user: editor, role: 'editor' }] : [],
      addons,
      budget,
      deadline,
      industry,
      totalPrice,
      mediaFiles: mediaFilesArr,
      rawFiles: mediaFilesArr // <-- Copy mediaFiles to rawFiles on creation
    });

    const populatedProject = await Project.findById(project._id)
      .populate('owner', 'name email');

    // Notify business user (order placed)
    await Notification.create({
      user: req.user._id,
      type: 'order',
      message: `Your order '${title}' has been placed successfully!`,
      link: `/project/${project._id}`
    });
    // Notify selected editor
    if (editor) {
      await Notification.create({
        user: editor,
        type: 'job',
        message: `You have been assigned to a new project: '${title}'.`,
        link: `/project/${project._id}`
      });
    }

    res.status(201).json(populatedProject);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Update project
// @route   PUT /api/projects/:id
// @access  Private
const updateProject = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    // Check if user is owner or has admin access
    const isOwner = project.owner.toString() === req.user._id.toString();
    const hasAdminAccess = project.collaborators.some(
      collab => collab.user.toString() === req.user._id.toString() && collab.role === 'admin'
    );

    if (!isOwner && !hasAdminAccess) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const { title, description, category, tags, isPublic, status } = req.body;

    project.title = title || project.title;
    project.description = description || project.description;
    project.category = category || project.category;
    project.tags = tags ? tags.split(',').map(tag => tag.trim()) : project.tags;
    project.isPublic = isPublic !== undefined ? isPublic : project.isPublic;
    project.status = status || project.status;

    const updatedProject = await project.save();
    await updatedProject.populate('owner', 'name email');

    // Notify business owner and editor(s)
    if (status === 'completed') {
      await Notification.create({
        user: project.owner,
        type: 'delivery',
        message: `Your project '${project.title}' has been delivered!`,
        link: `/project/${project._id}`
      });
      for (const collab of project.collaborators) {
        if (collab.role === 'editor') {
          await Notification.create({
            user: collab.user,
            type: 'delivery',
            message: `Project '${project.title}' marked as delivered.`,
            link: `/project/${project._id}`
          });
        }
      }
    }

    res.json(updatedProject);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Delete project
// @route   DELETE /api/projects/:id
// @access  Private
const deleteProject = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    // Only owner can delete project
    if (project.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Access denied' });
    }

    await Project.findByIdAndDelete(req.params.id);
    res.json({ message: 'Project deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Add collaborator to project
// @route   POST /api/projects/:id/collaborators
// @access  Private
const addCollaborator = async (req, res) => {
  try {
    const { userId, role } = req.body;
    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    // Only owner can add collaborators, except:
    // Allow an editor to add themselves as 'editor' if no editor exists yet
    const isOwner = project.owner.toString() === req.user._id.toString();
    const isSelfEditor = req.user._id.toString() === userId && role === 'editor' && req.user.role === 'editor';
    const hasEditor = project.collaborators.some(collab => collab.role === 'editor');

    if (!isOwner && !(isSelfEditor && !hasEditor)) {
      return res.status(403).json({ message: 'Access denied' });
    }

    // Check if user is already a collaborator
    const existingCollaborator = project.collaborators.find(
      collab => collab.user.toString() === userId
    );

    if (existingCollaborator) {
      return res.status(400).json({ message: 'User is already a collaborator' });
    }

    project.collaborators.push({
      user: userId,
      role: role || 'viewer'
    });

    // If editor is being added and there was no editor before, set status to in-progress
    if (role === 'editor' && !hasEditor) {
      project.status = 'in-progress';
    }

    await project.save();
    await project.populate('collaborators.user', 'name email');

    // Notify editor if added as editor
    if (role === 'editor') {
      await Notification.create({
        user: userId,
        type: 'job',
        message: `You have been assigned to a new project: '${project.title}'.`,
        link: `/project/${project._id}`
      });
    }
    // Notify business owner when editor accepts
    if (role === 'editor' && !isOwner) {
      await Notification.create({
        user: project.owner,
        type: 'order',
        message: `An editor has accepted your project: '${project.title}'.`,
        link: `/project/${project._id}`
      });
    }

    res.json(project);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Add comment to project
// @route   POST /api/projects/:id/comments
// @access  Private
const addComment = async (req, res) => {
  try {
    const { text } = req.body;
    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    // Check if user has access to this project
    const hasAccess = project.owner.toString() === req.user._id.toString() ||
                     project.collaborators.some(collab => collab.user.toString() === req.user._id.toString()) ||
                     project.isPublic;

    if (!hasAccess) {
      return res.status(403).json({ message: 'Access denied' });
    }

    project.comments.push({
      user: req.user._id,
      text
    });

    await project.save();
    await project.populate('comments.user', 'name email');

    res.json(project);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Get available jobs for editors (no editor collaborator assigned)
const getAvailableJobs = async (req, res) => {
  try {
    const jobs = await Project.find({
      'collaborators.role': { $ne: 'editor' }
    })
      .populate('owner', 'name email')
      .sort({ createdAt: -1 })
      .lean();
    // Ensure totalPrice is set for all jobs
    jobs.forEach(job => {
      if (typeof job.totalPrice === 'string') {
        job.totalPrice = Number(job.totalPrice);
      } else if (typeof job.totalPrice !== 'number' || isNaN(job.totalPrice)) {
        job.totalPrice = typeof job.budget === 'number' ? job.budget : Number(job.budget) || 0;
      }
    });
    res.json({ jobs });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Get projects assigned to this editor
const getEditorProjects = async (req, res) => {
  try {
    const projects = await Project.find({
      'collaborators': {
        $elemMatch: { user: req.user._id, role: 'editor' }
      }
    })
      .populate('owner', 'name email')
      .populate('reviews.user', 'name email profilePicture')
      .sort({ updatedAt: -1 })
      .lean();
    res.json({ projects });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Request re-edit within 72 hours of delivery
const requestReedit = async (req, res) => {
  try {
    const { projectId } = req.params;
    const { reason } = req.body;
    const userId = req.user._id;
    const project = await Project.findById(projectId);
    if (!project) return res.status(404).json({ message: 'Project not found' });
    if (project.owner.toString() !== userId.toString()) {
      return res.status(403).json({ message: 'Only the project owner can request a re-edit' });
    }
    if (!project.finalVideoFile || !project.finalVideoFile.uploadedAt) {
      return res.status(400).json({ message: 'Final reel not delivered yet' });
    }
    const deliveredAt = new Date(project.finalVideoFile.uploadedAt);
    const now = new Date();
    const hoursSinceDelivery = (now - deliveredAt) / (1000 * 60 * 60);
    if (hoursSinceDelivery > 72) {
      return res.status(400).json({ message: 'Re-edit request window has expired' });
    }
    // Only allow one pending re-edit request at a time
    const hasPending = project.reeditRequests.some(r => r.status === 'pending');
    if (hasPending) {
      return res.status(400).json({ message: 'A re-edit request is already pending' });
    }
    project.reeditRequests.push({
      requestedBy: userId,
      reason,
      requestedAt: now,
      status: 'pending'
    });
    await project.save();
    res.json({ message: 'Re-edit request submitted', reeditRequests: project.reeditRequests });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Get payment history for a project
const getPayments = async (req, res) => {
  try {
    const { projectId } = req.params;
    const project = await Project.findById(projectId);
    if (!project) return res.status(404).json({ message: 'Project not found' });
    res.json({ payments: project.payments || [] });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch payments' });
  }
};

// Add a review to a project
const addReview = async (req, res) => {
  try {
    const { projectId } = req.params;
    const { rating, comment } = req.body;
    const userId = req.user._id;
    
    console.log('Adding review:', { projectId, rating, comment, userId });
    
    const project = await Project.findById(projectId);
    if (!project) {
      console.log('Project not found:', projectId);
      return res.status(404).json({ message: 'Project not found' });
    }
    
    console.log('Project status:', project.status);
    console.log('Project owner:', project.owner.toString());
    console.log('User ID:', userId.toString());
    
    if (project.status !== 'completed' && project.status !== 'delivered') {
      console.log('Invalid project status for review:', project.status);
      return res.status(400).json({ message: 'Can only review completed or delivered projects' });
    }
    
    // Only allow owner to review
    if (project.owner.toString() !== userId.toString()) {
      console.log('User is not project owner');
      return res.status(403).json({ message: 'Only the project owner can review' });
    }
    
    // Only one review per user per project
    if (project.reviews.some(r => r.user.toString() === userId.toString())) {
      console.log('User has already reviewed this project');
      return res.status(400).json({ message: 'You have already reviewed this project' });
    }
    
    project.reviews.push({ user: userId, rating, comment });
    await project.save();
    
    console.log('Review added successfully');
    res.json({ message: 'Review added', reviews: project.reviews });
  } catch (err) {
    console.error('Error adding review:', err);
    res.status(500).json({ message: 'Failed to add review' });
  }
};

// Get all reviews for a project
const getReviews = async (req, res) => {
  try {
    const { projectId } = req.params;
    const project = await Project.findById(projectId).populate('reviews.user', 'name email profilePicture');
    if (!project) return res.status(404).json({ message: 'Project not found' });
    res.json({ reviews: project.reviews || [] });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch reviews' });
  }
};

// Get FAQs (static for now)
const getFaqs = (req, res) => {
  res.json({
    faqs: [
      { q: 'How do I create a new project?', a: 'Go to the dashboard and click New Project.' },
      { q: 'How do I contact my editor?', a: 'Use the in-app chat in your project details.' },
      { q: 'How do I request a re-edit?', a: 'Go to your project, click Request Re-edit if eligible.' },
      { q: 'How do I download my final reel?', a: 'Open your completed project and click Download.' },
      { q: 'How do I get support?', a: 'Use the support form below or email us at support@reellocalspark.com.' }
    ]
  });
};

// Submit a support request
const submitSupportRequest = async (req, res) => {
  try {
    const { subject, message, email } = req.body;
    const user = req.user?._id;
    const SupportRequest = require('../models/SupportRequest');
    const support = new SupportRequest({ user, email, subject, message });
    await support.save();
    res.json({ message: 'Support request submitted' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to submit support request' });
  }
};

// Get editor earnings, payouts, and payment status
const getEditorEarnings = async (req, res) => {
  try {
    const userId = req.user._id;
    // Find all completed/paid projects where user is an editor
    const projects = await Project.find({
      status: 'completed',
      collaborators: { $elemMatch: { user: userId, role: 'editor' } },
      payments: { $elemMatch: { status: 'paid' } }
    });
    // Calculate total earnings (sum of all paid project payments for this editor)
    let totalEarnings = 0;
    let projectEarnings = [];
    projects.forEach(project => {
      const totalPaid = (project.payments || []).filter(p => p.status === 'paid').reduce((sum, p) => sum + (p.amount || 0), 0);
      totalEarnings += totalPaid;
      projectEarnings.push({
        projectId: project._id,
        title: project.title,
        amount: totalPaid,
        deliveredAt: project.finalVideoFile?.uploadedAt || project.updatedAt
      });
    });
    // Get payout history and payment status from user
    const user = await User.findById(userId);
    res.json({
      totalEarnings,
      projectEarnings,
      payouts: user.payouts || [],
      paymentStatus: user.paymentStatus || 'pending'
    });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch editor earnings' });
  }
};

// Get all reviews for an editor
const getEditorReviews = async (req, res) => {
  try {
    const { editorId } = req.params;
    const Project = require('../models/Project');
    // Find all completed projects where this user is an editor
    const projects = await Project.find({
      status: 'completed',
      collaborators: { $elemMatch: { user: editorId, role: 'editor' } }
    }).populate('reviews.user', 'name email profilePicture');
    // Aggregate all reviews
    let allReviews = [];
    projects.forEach(project => {
      allReviews = allReviews.concat(project.reviews || []);
    });
    const avgRating = allReviews.length > 0 ? (allReviews.reduce((sum, r) => sum + (r.rating || 0), 0) / allReviews.length).toFixed(2) : null;
    res.json({
      reviews: allReviews,
      averageRating: avgRating,
      completedProjects: projects.length
    });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch editor reviews' });
  }
};

module.exports = {
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
};
