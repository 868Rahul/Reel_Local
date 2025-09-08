const Notification = require('../models/Notification');

// Get all notifications for the logged-in user
const getNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.json({ notifications });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Create a notification
const createNotification = async (req, res) => {
  try {
    const { user, type, message, link } = req.body;
    const notification = await Notification.create({ user, type, message, link });
    res.status(201).json(notification);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Mark a notification as read
const markNotificationRead = async (req, res) => {
  try {
    const notification = await Notification.findById(req.params.id);
    if (!notification) return res.status(404).json({ message: 'Notification not found' });
    if (notification.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Access denied' });
    }
    notification.read = true;
    await notification.save();
    res.json(notification);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  getNotifications,
  createNotification,
  markNotificationRead,
}; 