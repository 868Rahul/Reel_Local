const Project = require('../models/Project');

exports.getStats = async (req, res) => {
  try {
    const totalProjects = await Project.countDocuments();
    // For demo, hardcode satisfactionRate and averageDelivery
    const satisfactionRate = 98;
    const averageDelivery = '24hrs';
    res.json({ totalProjects, satisfactionRate, averageDelivery });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch stats' });
  }
}; 