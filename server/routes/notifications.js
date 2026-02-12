const express = require('express');
const { db } = require('../db/init');
const { auth } = require('../middleware/auth');

const router = express.Router();

// GET /api/notifications/unread-count - Get unread notification count
// (defined before /:id to avoid route conflict)
router.get('/unread-count', auth, (req, res) => {
  try {
    const result = db.prepare('SELECT COUNT(*) as count FROM notifications WHERE user_id = ? AND is_read = 0').get(req.user.id);

    res.json({ unread_count: result.count });
  } catch (error) {
    console.error('Get unread count error:', error);
    res.status(500).json({ error: 'Server error fetching unread count' });
  }
});

// PUT /api/notifications/read-all - Mark all notifications as read
// (defined before /:id to avoid route conflict)
router.put('/read-all', auth, (req, res) => {
  try {
    db.prepare('UPDATE notifications SET is_read = 1 WHERE user_id = ? AND is_read = 0').run(req.user.id);

    res.json({ message: 'All notifications marked as read' });
  } catch (error) {
    console.error('Mark all read error:', error);
    res.status(500).json({ error: 'Server error marking notifications as read' });
  }
});

// GET /api/notifications - Get notifications for current user
router.get('/', auth, (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 30;
    const offset = (page - 1) * limit;

    const notifications = db.prepare(`
      SELECT * FROM notifications
      WHERE user_id = ?
      ORDER BY created_at DESC
      LIMIT ? OFFSET ?
    `).all(req.user.id, limit, offset);

    const total = db.prepare('SELECT COUNT(*) as count FROM notifications WHERE user_id = ?').get(req.user.id).count;

    res.json({
      notifications,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get notifications error:', error);
    res.status(500).json({ error: 'Server error fetching notifications' });
  }
});

// PUT /api/notifications/:id/read - Mark notification as read
router.put('/:id/read', auth, (req, res) => {
  try {
    const { id } = req.params;

    const notification = db.prepare('SELECT * FROM notifications WHERE id = ? AND user_id = ?').get(id, req.user.id);
    if (!notification) {
      return res.status(404).json({ error: 'Notification not found' });
    }

    db.prepare('UPDATE notifications SET is_read = 1 WHERE id = ?').run(id);

    const updatedNotification = db.prepare('SELECT * FROM notifications WHERE id = ?').get(id);

    res.json({ notification: updatedNotification });
  } catch (error) {
    console.error('Mark notification read error:', error);
    res.status(500).json({ error: 'Server error marking notification as read' });
  }
});

module.exports = router;
