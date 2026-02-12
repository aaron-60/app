const express = require('express');
const { v4: uuidv4 } = require('uuid');
const { db } = require('../db/init');
const { auth } = require('../middleware/auth');

const router = express.Router();

// GET /api/messages/conversations - Get list of conversations
router.get('/conversations', auth, (req, res) => {
  try {
    // Get the latest message per conversation partner (only connected users)
    const conversations = db.prepare(`
      SELECT
        m.*,
        CASE
          WHEN m.sender_id = ? THEN m.receiver_id
          ELSE m.sender_id
        END as partner_id,
        u.first_name as partner_first_name,
        u.last_name as partner_last_name,
        u.headline as partner_headline,
        u.avatar as partner_avatar,
        (
          SELECT COUNT(*) FROM messages m2
          WHERE m2.sender_id = CASE WHEN m.sender_id = ? THEN m.receiver_id ELSE m.sender_id END
            AND m2.receiver_id = ?
            AND m2.is_read = 0
        ) as unread_count
      FROM messages m
      JOIN users u ON u.id = CASE
        WHEN m.sender_id = ? THEN m.receiver_id
        ELSE m.sender_id
      END
      WHERE m.id IN (
        SELECT m3.id FROM messages m3
        WHERE (m3.sender_id = ? OR m3.receiver_id = ?)
        AND m3.created_at = (
          SELECT MAX(m4.created_at) FROM messages m4
          WHERE (m4.sender_id = m3.sender_id AND m4.receiver_id = m3.receiver_id)
             OR (m4.sender_id = m3.receiver_id AND m4.receiver_id = m3.sender_id)
        )
        AND (
          (m3.sender_id = ? AND m3.receiver_id != ?)
          OR (m3.receiver_id = ? AND m3.sender_id != ?)
        )
        GROUP BY CASE
          WHEN m3.sender_id = ? THEN m3.receiver_id
          ELSE m3.sender_id
        END
      )
      ORDER BY m.created_at DESC
    `).all(
      req.user.id, req.user.id, req.user.id,
      req.user.id, req.user.id, req.user.id,
      req.user.id, req.user.id, req.user.id, req.user.id,
      req.user.id
    );

    res.json({ conversations });
  } catch (error) {
    console.error('Get conversations error:', error);
    // Fallback: simpler query approach
    try {
      const partners = db.prepare(`
        SELECT DISTINCT
          CASE
            WHEN m.sender_id = ? THEN m.receiver_id
            ELSE m.sender_id
          END as partner_id
        FROM messages m
        WHERE m.sender_id = ? OR m.receiver_id = ?
      `).all(req.user.id, req.user.id, req.user.id);

      const conversations = partners.map(({ partner_id }) => {
        const latestMessage = db.prepare(`
          SELECT * FROM messages
          WHERE (sender_id = ? AND receiver_id = ?) OR (sender_id = ? AND receiver_id = ?)
          ORDER BY created_at DESC
          LIMIT 1
        `).get(req.user.id, partner_id, partner_id, req.user.id);

        const partner = db.prepare(`
          SELECT id, first_name, last_name, headline, avatar FROM users WHERE id = ?
        `).get(partner_id);

        const unreadCount = db.prepare(`
          SELECT COUNT(*) as count FROM messages
          WHERE sender_id = ? AND receiver_id = ? AND is_read = 0
        `).get(partner_id, req.user.id).count;

        return {
          ...latestMessage,
          partner_id,
          partner_first_name: partner ? partner.first_name : null,
          partner_last_name: partner ? partner.last_name : null,
          partner_headline: partner ? partner.headline : null,
          partner_avatar: partner ? partner.avatar : null,
          unread_count: unreadCount
        };
      });

      conversations.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

      res.json({ conversations });
    } catch (fallbackError) {
      console.error('Get conversations fallback error:', fallbackError);
      res.status(500).json({ error: 'Server error fetching conversations' });
    }
  }
});

// GET /api/messages/:userId - Get messages between current user and userId
router.get('/:userId', auth, (req, res) => {
  try {
    const { userId } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;
    const offset = (page - 1) * limit;

    // Verify the other user exists
    const otherUser = db.prepare('SELECT id, first_name, last_name, headline, avatar FROM users WHERE id = ?').get(userId);
    if (!otherUser) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Get messages
    const messages = db.prepare(`
      SELECT m.*,
        s.first_name as sender_first_name, s.last_name as sender_last_name, s.avatar as sender_avatar,
        r.first_name as receiver_first_name, r.last_name as receiver_last_name, r.avatar as receiver_avatar
      FROM messages m
      JOIN users s ON m.sender_id = s.id
      JOIN users r ON m.receiver_id = r.id
      WHERE (m.sender_id = ? AND m.receiver_id = ?) OR (m.sender_id = ? AND m.receiver_id = ?)
      ORDER BY m.created_at DESC
      LIMIT ? OFFSET ?
    `).all(req.user.id, userId, userId, req.user.id, limit, offset);

    // Mark unread messages from the other user as read
    db.prepare(`
      UPDATE messages SET is_read = 1
      WHERE sender_id = ? AND receiver_id = ? AND is_read = 0
    `).run(userId, req.user.id);

    const total = db.prepare(`
      SELECT COUNT(*) as count FROM messages
      WHERE (sender_id = ? AND receiver_id = ?) OR (sender_id = ? AND receiver_id = ?)
    `).get(req.user.id, userId, userId, req.user.id).count;

    res.json({
      messages: messages.reverse(), // Return in chronological order
      partner: otherUser,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get messages error:', error);
    res.status(500).json({ error: 'Server error fetching messages' });
  }
});

// POST /api/messages/:userId - Send message to connected user
router.post('/:userId', auth, (req, res) => {
  try {
    const { userId } = req.params;
    const { content } = req.body;

    if (!content || content.trim().length === 0) {
      return res.status(400).json({ error: 'Message content is required' });
    }

    // Cannot message yourself
    if (userId === req.user.id) {
      return res.status(400).json({ error: 'Cannot send a message to yourself' });
    }

    // Verify the other user exists
    const otherUser = db.prepare('SELECT id, first_name, last_name FROM users WHERE id = ?').get(userId);
    if (!otherUser) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Check if users are connected
    const connection = db.prepare(`
      SELECT id FROM connections
      WHERE ((requester_id = ? AND receiver_id = ?) OR (requester_id = ? AND receiver_id = ?))
        AND status = 'accepted'
    `).get(req.user.id, userId, userId, req.user.id);

    if (!connection) {
      return res.status(403).json({ error: 'You can only message users you are connected with' });
    }

    const messageId = uuidv4();

    db.prepare(`
      INSERT INTO messages (id, sender_id, receiver_id, content)
      VALUES (?, ?, ?, ?)
    `).run(messageId, req.user.id, userId, content);

    // Create notification for receiver
    const notificationId = uuidv4();
    db.prepare(`
      INSERT INTO notifications (id, user_id, type, reference_id, message)
      VALUES (?, ?, 'message', ?, ?)
    `).run(notificationId, userId, messageId, `${req.user.first_name} ${req.user.last_name} sent you a message`);

    const message = db.prepare(`
      SELECT m.*,
        s.first_name as sender_first_name, s.last_name as sender_last_name, s.avatar as sender_avatar
      FROM messages m
      JOIN users s ON m.sender_id = s.id
      WHERE m.id = ?
    `).get(messageId);

    res.status(201).json({ message });
  } catch (error) {
    console.error('Send message error:', error);
    res.status(500).json({ error: 'Server error sending message' });
  }
});

module.exports = router;
