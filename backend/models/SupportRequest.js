const mongoose = require('mongoose');

const supportRequestSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  email: { type: String, required: true },
  subject: { type: String, required: true },
  message: { type: String, required: true },
  status: { type: String, enum: ['open', 'resolved', 'closed'], default: 'open' },
  createdAt: { type: Date, default: Date.now },
  resolvedAt: { type: Date },
  adminNotes: { type: String }
});

module.exports = mongoose.model('SupportRequest', supportRequestSchema); 