const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/notificationController');
const { auth } = require('../middleware/auth');

router.get('/', auth, (req, res) => {
  if (typeof notificationController.getNotifications === 'function') {
    notificationController.getNotifications(req, res);
  } else {
    res.status(500).json({ message: 'Internal server error' });
  }
});

router.post('/', auth, (req, res) => {
  if (typeof notificationController.createNotification === 'function') {
    notificationController.createNotification(req, res);
  } else {
    res.status(500).json({ message: 'Internal server error' });
  }
});

router.put('/:id/read', auth, (req, res) => {
  if (typeof notificationController.markNotificationRead === 'function') {
    notificationController.markNotificationRead(req, res);
  } else {
    res.status(500).json({ message: 'Internal server error' });
  }
});

router.patch('/:id/read', auth, (req, res) => {
  if (typeof notificationController.markNotificationRead === 'function') {
    notificationController.markNotificationRead(req, res);
  } else {
    res.status(500).json({ message: 'Internal server error' });
  }
});

module.exports = router; 