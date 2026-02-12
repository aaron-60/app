const express = require('express');
const { v4: uuidv4 } = require('uuid');
const { db } = require('../db/init');
const { auth } = require('../middleware/auth');

const router = express.Router();

// GET /api/connections - Get accepted connections
router.get('/', auth, (req, res) => {
  try {
    const connections = db.prepare(`
      SELECT c.id as connection_id, c.created_at as connected_since,
        CASE
          WHEN c.requester_id = ? THEN c.receiver_id
          ELSE c.requester_id
        END as user_id,
        u.first_name, u.last_name, u.headline, u.avatar, u.location, u.industry
      FROM connections c
      JOIN users u ON u.id = CASE
        WHEN c.requester_id = ? THEN c.receiver_id
        ELSE c.requester_id
      END
      WHERE (c.requester_id = ? OR c.receiver_id = ?) AND c.status = 'accepted'
      ORDER BY c.created_at DESC
    `).all(req.user.id, req.user.id, req.user.id, req.user.id);

    res.json({ connections });
  } catch (error) {
    console.error('Get connections error:', error);
    res.status(500).json({ error: 'Server error fetching connections' });
  }
});

// GET /api/connections/pending - Get pending connection requests received
router.get('/pending', auth, (req, res) => {
  try {
    const pending = db.prepare(`
      SELECT c.id as connection_id, c.created_at as requested_at,
        u.id as user_id, u.first_name, u.last_name, u.headline, u.avatar, u.location, u.industry
      FROM connections c
      JOIN users u ON u.id = c.requester_id
      WHERE c.receiver_id = ? AND c.status = 'pending'
      ORDER BY c.created_at DESC
    `).all(req.user.id);

    res.json({ pending_requests: pending });
  } catch (error) {
    console.error('Get pending connections error:', error);
    res.status(500).json({ error: 'Server error fetching pending connections' });
  }
});

// GET /api/connections/suggestions - Suggest users who aren't already connected
router.get('/suggestions', auth, (req, res) => {
  try {
    const suggestions = db.prepare(`
      SELECT u.id, u.first_name, u.last_name, u.headline, u.avatar, u.location, u.industry, u.skills
      FROM users u
      WHERE u.id != ?
        AND u.id NOT IN (
          SELECT CASE
            WHEN c.requester_id = ? THEN c.receiver_id
            ELSE c.requester_id
          END
          FROM connections c
          WHERE (c.requester_id = ? OR c.receiver_id = ?)
            AND c.status IN ('pending', 'accepted')
        )
      ORDER BY RANDOM()
      LIMIT 10
    `).all(req.user.id, req.user.id, req.user.id, req.user.id);

    res.json({ suggestions });
  } catch (error) {
    console.error('Get connection suggestions error:', error);
    res.status(500).json({ error: 'Server error fetching suggestions' });
  }
});

// POST /api/connections/request/:userId - Send connection request
router.post('/request/:userId', auth, (req, res) => {
  try {
    const { userId } = req.params;

    // Cannot connect with yourself
    if (userId === req.user.id) {
      return res.status(400).json({ error: 'Cannot send a connection request to yourself' });
    }

    // Check if target user exists
    const targetUser = db.prepare('SELECT id, first_name, last_name FROM users WHERE id = ?').get(userId);
    if (!targetUser) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Check if connection already exists
    const existingConnection = db.prepare(`
      SELECT id, status FROM connections
      WHERE (requester_id = ? AND receiver_id = ?) OR (requester_id = ? AND receiver_id = ?)
    `).get(req.user.id, userId, userId, req.user.id);

    if (existingConnection) {
      if (existingConnection.status === 'accepted') {
        return res.status(400).json({ error: 'You are already connected with this user' });
      }
      if (existingConnection.status === 'pending') {
        return res.status(400).json({ error: 'A connection request is already pending' });
      }
      if (existingConnection.status === 'rejected') {
        // Allow re-requesting after rejection: update the existing connection
        db.prepare(`
          UPDATE connections SET requester_id = ?, receiver_id = ?, status = 'pending', created_at = CURRENT_TIMESTAMP WHERE id = ?
        `).run(req.user.id, userId, existingConnection.id);

        // Create notification
        const notificationId = uuidv4();
        db.prepare(`
          INSERT INTO notifications (id, user_id, type, reference_id, message)
          VALUES (?, ?, 'connection_request', ?, ?)
        `).run(notificationId, userId, existingConnection.id, `${req.user.first_name} ${req.user.last_name} sent you a connection request`);

        const connection = db.prepare('SELECT * FROM connections WHERE id = ?').get(existingConnection.id);
        return res.status(201).json({ connection });
      }
    }

    // Create connection request
    const connectionId = uuidv4();
    db.prepare(`
      INSERT INTO connections (id, requester_id, receiver_id, status)
      VALUES (?, ?, ?, 'pending')
    `).run(connectionId, req.user.id, userId);

    // Create notification for receiver
    const notificationId = uuidv4();
    db.prepare(`
      INSERT INTO notifications (id, user_id, type, reference_id, message)
      VALUES (?, ?, 'connection_request', ?, ?)
    `).run(notificationId, userId, connectionId, `${req.user.first_name} ${req.user.last_name} sent you a connection request`);

    const connection = db.prepare('SELECT * FROM connections WHERE id = ?').get(connectionId);

    res.status(201).json({ connection });
  } catch (error) {
    console.error('Send connection request error:', error);
    res.status(500).json({ error: 'Server error sending connection request' });
  }
});

// PUT /api/connections/:id/accept - Accept connection request
router.put('/:id/accept', auth, (req, res) => {
  try {
    const { id } = req.params;

    const connection = db.prepare('SELECT * FROM connections WHERE id = ?').get(id);
    if (!connection) {
      return res.status(404).json({ error: 'Connection request not found' });
    }

    // Only the receiver can accept
    if (connection.receiver_id !== req.user.id) {
      return res.status(403).json({ error: 'Not authorized to accept this connection request' });
    }

    if (connection.status !== 'pending') {
      return res.status(400).json({ error: 'This connection request is no longer pending' });
    }

    db.prepare("UPDATE connections SET status = 'accepted' WHERE id = ?").run(id);

    // Create notification for the requester
    const notificationId = uuidv4();
    db.prepare(`
      INSERT INTO notifications (id, user_id, type, reference_id, message)
      VALUES (?, ?, 'connection_accepted', ?, ?)
    `).run(notificationId, connection.requester_id, id, `${req.user.first_name} ${req.user.last_name} accepted your connection request`);

    const updatedConnection = db.prepare('SELECT * FROM connections WHERE id = ?').get(id);

    res.json({ connection: updatedConnection });
  } catch (error) {
    console.error('Accept connection error:', error);
    res.status(500).json({ error: 'Server error accepting connection' });
  }
});

// PUT /api/connections/:id/reject - Reject connection request
router.put('/:id/reject', auth, (req, res) => {
  try {
    const { id } = req.params;

    const connection = db.prepare('SELECT * FROM connections WHERE id = ?').get(id);
    if (!connection) {
      return res.status(404).json({ error: 'Connection request not found' });
    }

    // Only the receiver can reject
    if (connection.receiver_id !== req.user.id) {
      return res.status(403).json({ error: 'Not authorized to reject this connection request' });
    }

    if (connection.status !== 'pending') {
      return res.status(400).json({ error: 'This connection request is no longer pending' });
    }

    db.prepare("UPDATE connections SET status = 'rejected' WHERE id = ?").run(id);

    const updatedConnection = db.prepare('SELECT * FROM connections WHERE id = ?').get(id);

    res.json({ connection: updatedConnection });
  } catch (error) {
    console.error('Reject connection error:', error);
    res.status(500).json({ error: 'Server error rejecting connection' });
  }
});

// DELETE /api/connections/:id - Remove connection
router.delete('/:id', auth, (req, res) => {
  try {
    const { id } = req.params;

    const connection = db.prepare('SELECT * FROM connections WHERE id = ?').get(id);
    if (!connection) {
      return res.status(404).json({ error: 'Connection not found' });
    }

    // Either party can remove the connection
    if (connection.requester_id !== req.user.id && connection.receiver_id !== req.user.id) {
      return res.status(403).json({ error: 'Not authorized to remove this connection' });
    }

    db.prepare('DELETE FROM connections WHERE id = ?').run(id);

    res.json({ message: 'Connection removed successfully' });
  } catch (error) {
    console.error('Remove connection error:', error);
    res.status(500).json({ error: 'Server error removing connection' });
  }
});

module.exports = router;
