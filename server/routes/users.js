const express = require('express');
const { db } = require('../db/init');
const { auth, optionalAuth } = require('../middleware/auth');

const router = express.Router();

// GET /api/users/search?q=query - Search users by name, headline, skills
router.get('/search', optionalAuth, (req, res) => {
  try {
    const { q } = req.query;

    if (!q || q.trim().length === 0) {
      return res.status(400).json({ error: 'Search query is required' });
    }

    const searchTerm = `%${q.trim()}%`;

    const users = db.prepare(`
      SELECT id, email, first_name, last_name, headline, summary, avatar, location, industry, experience_years, skills, created_at
      FROM users
      WHERE first_name LIKE ? OR last_name LIKE ? OR headline LIKE ? OR skills LIKE ?
      OR (first_name || ' ' || last_name) LIKE ?
      ORDER BY created_at DESC
      LIMIT 50
    `).all(searchTerm, searchTerm, searchTerm, searchTerm, searchTerm);

    res.json({ users });
  } catch (error) {
    console.error('Search users error:', error);
    res.status(500).json({ error: 'Server error searching users' });
  }
});

// GET /api/users/:id - Get user profile with connection status
router.get('/:id', optionalAuth, (req, res) => {
  try {
    const { id } = req.params;

    const user = db.prepare(`
      SELECT id, email, first_name, last_name, headline, summary, avatar, location, industry, experience_years, skills, created_at
      FROM users WHERE id = ?
    `).get(id);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Get connection status if current user is logged in
    let connectionStatus = null;
    let connectionId = null;

    if (req.user && req.user.id !== id) {
      const connection = db.prepare(`
        SELECT id, status, requester_id, receiver_id FROM connections
        WHERE (requester_id = ? AND receiver_id = ?) OR (requester_id = ? AND receiver_id = ?)
      `).get(req.user.id, id, id, req.user.id);

      if (connection) {
        connectionStatus = connection.status;
        connectionId = connection.id;
      }
    }

    // Get connection count
    const connectionCount = db.prepare(`
      SELECT COUNT(*) as count FROM connections
      WHERE (requester_id = ? OR receiver_id = ?) AND status = 'accepted'
    `).get(id, id).count;

    // Get post count
    const postCount = db.prepare('SELECT COUNT(*) as count FROM posts WHERE user_id = ?').get(id).count;

    res.json({
      user: {
        ...user,
        connection_status: connectionStatus,
        connection_id: connectionId,
        connection_count: connectionCount,
        post_count: postCount
      }
    });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ error: 'Server error fetching user profile' });
  }
});

// PUT /api/users/profile - Update own profile
router.put('/profile', auth, (req, res) => {
  try {
    const {
      first_name, last_name, headline, summary, avatar,
      location, industry, experience_years, skills
    } = req.body;

    const updates = [];
    const values = [];

    if (first_name !== undefined) { updates.push('first_name = ?'); values.push(first_name); }
    if (last_name !== undefined) { updates.push('last_name = ?'); values.push(last_name); }
    if (headline !== undefined) { updates.push('headline = ?'); values.push(headline); }
    if (summary !== undefined) { updates.push('summary = ?'); values.push(summary); }
    if (avatar !== undefined) { updates.push('avatar = ?'); values.push(avatar); }
    if (location !== undefined) { updates.push('location = ?'); values.push(location); }
    if (industry !== undefined) { updates.push('industry = ?'); values.push(industry); }
    if (experience_years !== undefined) { updates.push('experience_years = ?'); values.push(experience_years); }
    if (skills !== undefined) { updates.push('skills = ?'); values.push(skills); }

    if (updates.length === 0) {
      return res.status(400).json({ error: 'No fields to update' });
    }

    values.push(req.user.id);

    db.prepare(`UPDATE users SET ${updates.join(', ')} WHERE id = ?`).run(...values);

    const updatedUser = db.prepare(`
      SELECT id, email, first_name, last_name, headline, summary, avatar, location, industry, experience_years, skills, created_at
      FROM users WHERE id = ?
    `).get(req.user.id);

    res.json({ user: updatedUser });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ error: 'Server error updating profile' });
  }
});

// GET /api/users/:id/posts - Get user's posts
router.get('/:id/posts', optionalAuth, (req, res) => {
  try {
    const { id } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const offset = (page - 1) * limit;

    // Verify user exists
    const user = db.prepare('SELECT id FROM users WHERE id = ?').get(id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const posts = db.prepare(`
      SELECT p.*,
        u.first_name, u.last_name, u.headline as author_headline, u.avatar as author_avatar
      FROM posts p
      JOIN users u ON p.user_id = u.id
      WHERE p.user_id = ?
      ORDER BY p.created_at DESC
      LIMIT ? OFFSET ?
    `).all(id, limit, offset);

    // Add like status if user is logged in
    const postsWithLikeStatus = posts.map(post => {
      let liked = false;
      if (req.user) {
        const like = db.prepare('SELECT id FROM post_likes WHERE post_id = ? AND user_id = ?').get(post.id, req.user.id);
        liked = !!like;
      }
      return { ...post, liked };
    });

    const total = db.prepare('SELECT COUNT(*) as count FROM posts WHERE user_id = ?').get(id).count;

    res.json({
      posts: postsWithLikeStatus,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get user posts error:', error);
    res.status(500).json({ error: 'Server error fetching user posts' });
  }
});

module.exports = router;
