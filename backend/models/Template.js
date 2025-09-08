const mongoose = require('mongoose');

const templateSchema = new mongoose.Schema({
  name: { type: String, required: true },
  category: { type: String, required: true },
  duration: { type: String, required: true },
  price: { type: String, required: true },
  thumbnail: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Template', templateSchema); 