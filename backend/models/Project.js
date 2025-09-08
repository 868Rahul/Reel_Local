const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Please add a project title'],
    trim: true
  },
  description: {
    type: String,
    required: [true, 'Please add a project description'],
    trim: true
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  collaborators: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    role: {
      type: String,
      enum: ['viewer', 'editor', 'admin'],
      default: 'viewer'
    },
    addedAt: {
      type: Date,
      default: Date.now
    }
  }],
  videoFile: {
    filename: String,
    originalName: String,
    mimeType: String,
    size: Number,
    path: String,
    uploadedAt: {
      type: Date,
      default: Date.now
    }
  },
  finalVideoFile: {
    filename: String,
    originalName: String,
    mimeType: String,
    size: Number,
    path: String,
    uploadedAt: {
      type: Date,
      default: Date.now
    }
  },
  thumbnailFile: {
    filename: String,
    originalName: String,
    mimeType: String,
    size: Number,
    path: String,
    uploadedAt: {
      type: Date,
      default: Date.now
    }
  },
  status: {
    type: String,
    enum: ['draft', 'in-progress', 'review', 'completed', 'archived'],
    default: 'draft'
  },
  tags: [{
    type: String,
    trim: true
  }],
  category: {
    type: String,
    enum: ['marketing', 'educational', 'entertainment', 'corporate', 'personal', 'other'],
    default: 'other'
  },
  isPublic: {
    type: Boolean,
    default: false
  },
  views: {
    type: Number,
    default: 0
  },
  likes: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    likedAt: {
      type: Date,
      default: Date.now
    }
  }],
  comments: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    text: {
      type: String,
      required: true,
      trim: true
    },
    timestamp: {
      type: Date,
      default: Date.now
    },
    replies: [{
      user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
      },
      text: {
        type: String,
        required: true,
        trim: true
      },
      timestamp: {
        type: Date,
        default: Date.now
      }
    }]
  }],
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  },
  shopDetails: {
    name: { type: String },
    tagline: { type: String },
    address: { type: String },
    offer: { type: String }
  },
  addons: {
    voiceover: { type: Boolean, default: false },
    script: { type: Boolean, default: false },
    subtitles: { type: Boolean, default: false }
  },
  transitions: { type: Boolean, default: false },
  textOverlays: { type: Boolean, default: false },
  colorGrading: { type: Boolean, default: false },
  multipleClips: { type: Boolean, default: false },
  aspectRatioOptimization: { type: Boolean, default: false },
  soundDesign: { type: Boolean, default: false },
  reeditRequests: [
    {
      requestedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      reason: { type: String },
      requestedAt: { type: Date, default: Date.now },
      status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' }
    }
  ],
  payments: [
    {
      orderId: String,
      paymentId: String,
      amount: Number,
      status: { type: String, enum: ['created', 'paid', 'failed'], default: 'created' },
      date: { type: Date, default: Date.now },
      invoiceUrl: String
    }
  ],
  reviews: [
    {
      user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      rating: { type: Number, min: 1, max: 5, required: true },
      comment: { type: String },
      createdAt: { type: Date, default: Date.now }
    }
  ],
  revisions: [
    {
      file: {
        filename: String,
        originalName: String,
        mimeType: String,
        size: Number,
        path: String,
        uploadedAt: { type: Date, default: Date.now }
      },
      uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      comment: String,
      timestamp: { type: Date, default: Date.now }
    }
  ],
  deliveredAt: { type: Date },
  rawFiles: [
    {
      url: String,
      public_id: String,
      originalname: String,
      resource_type: String,
      size: Number,
      uploadedAt: { type: Date, default: Date.now }
    }
  ],
  finalFile: {
    url: String,
    public_id: String,
    originalname: String,
    resource_type: String,
    size: Number,
    uploadedAt: { type: Date, default: Date.now }
  },
  mediaFiles: [
    {
      url: String,
      public_id: String,
      originalname: String,
      resource_type: String,
      size: Number,
      uploadedAt: { type: Date, default: Date.now }
    }
  ],
  budget: { type: Number },
  deadline: { type: String },
  industry: { type: String },
  totalPrice: { type: Number }
});

// Update the updatedAt field before saving
projectSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Index for search functionality
projectSchema.index({ title: 'text', description: 'text', tags: 'text' });

module.exports = mongoose.model('Project', projectSchema);
