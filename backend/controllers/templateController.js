const Template = require('../models/Template');

exports.getAllTemplates = async (req, res) => {
  try {
    const templates = await Template.find().sort({ createdAt: -1 });
    res.json({ templates });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch templates' });
  }
}; 