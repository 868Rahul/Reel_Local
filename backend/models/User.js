const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please add a name'],
    trim: true
  },
  email: {
    type: String,
    required: [true, 'Please add an email'],
    unique: true,
    lowercase: true,
    match: [
      /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
      'Please add a valid email'
    ]
  },
  password: {
    type: String,
    required: [true, 'Please add a password'],
    minlength: 6,
    select: false
  },
  role: {
    type: String,
    enum: ['user', 'editor', 'business', 'admin'],
    default: 'user'
  },
  profilePicture: {
    type: String,
    default: ''
  },
  isActive: {
    type: Boolean,
    default: true
  },
  lastLogin: {
    type: Date
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  },
  earnings: {
    type: Number,
    default: 0
  },
  payouts: [
    {
      amount: Number,
      date: { type: Date, default: Date.now },
      status: { type: String, enum: ['pending', 'paid', 'failed'], default: 'pending' },
      reference: String
    }
  ],
  paymentStatus: {
    type: String,
    enum: ['pending', 'paid', 'failed'],
    default: 'pending'
  },
  bio: {
    type: String,
    default: ''
  },
  languages: [{ type: String }],
  skills: [{ type: String }],
  portfolio: [
    {
      url: String,
      title: String,
      type: String // e.g. 'video', 'image', 'link'
    }
  ],
  pricing: {
    type: Number,
    default: 0
  },
  deliverySpeed: {
    type: String,
    enum: ['24hr', '48hr', '72hr', 'custom'],
    default: '48hr'
  },
  available: {
    type: Boolean,
    default: true
  },
  subscription: {
    plan: { type: String, enum: ['Free', 'Pro', 'Premium'], default: 'Free' },
    status: { type: String, enum: ['active', 'expired', 'cancelled'], default: 'active' },
    startDate: { type: Date },
    endDate: { type: Date }
  }
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) {
    next();
  }
  
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Update the updatedAt field before saving
userSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Match user entered password to hashed password in database
userSchema.methods.matchPassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
