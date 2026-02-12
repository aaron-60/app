const express = require('express');
const { v4: uuidv4 } = require('uuid');
const { db } = require('../db/init');
const { auth, optionalAuth } = require('../middleware/auth');

const router = express.Router();

// GET /api/posts/feed - Get feed posts from connections + own posts
router.get('/feed', auth, (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const offset = (page - 1) * limit;

    // Get posts from connections and own posts
    const posts = db.prepare(`
      SELECT p.*,
        u.first_name, u.last_name, u.headline as author_headline, u.avatar as author_avatar
      FROM posts p
      JOIN users u ON p.user_id = u.id
      WHERE p.user_id = ?
        OR p.user_id IN (
          SELECT CASE
            WHEN c.requester_id = ? THEN c.receiver_id
            ELSE c.requester_id
          END
          FROM connections c
          WHERE (c.requester_id = ? OR c.receiver_id = ?) AND c.status = 'accepted'
        )
      ORDER BY p.created_at DESC
      LIMIT ? OFFSET ?
    `).all(req.user.id, req.user.id, req.user.id, req.user.id, limit, offset);

    // Add like status for current user
    const postsWithDetails = posts.map(post => {
      const liked = db.prepare('SELECT id FROM post_likes WHERE post_id = ? AND user_id = ?').get(post.id, req.user.id);
      return { ...post, liked: !!liked };
    });

    const total = db.prepare(`
      SELECT COUNT(*) as count FROM posts p
      WHERE p.user_id = ?
        OR p.user_id IN (
          SELECT CASE
            WHEN c.requester_id = ? THEN c.receiver_id
            ELSE c.requester_id
          END
          FROM connections c
          WHERE (c.requester_id = ? OR c.receiver_id = ?) AND c.status = 'accepted'
        )
    `).get(req.user.id, req.user.id, req.user.id, req.user.id).count;

    res.json({
      posts: postsWithDetails,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get feed error:', error);
    res.status(500).json({ error: 'Server error fetching feed' });
  }
});

// POST /api/posts - Create post
router.post('/', auth, (req, res) => {
  try {
    const { content, image } = req.body;

    if (!content || content.trim().length === 0) {
      return res.status(400).json({ error: 'Post content is required' });
    }

    const id = uuidv4();

    db.prepare(`
      INSERT INTO posts (id, user_id, content, image)
      VALUES (?, ?, ?, ?)
    `).run(id, req.user.id, content, image || null);

    const post = db.prepare(`
      SELECT p.*,
        u.first_name, u.last_name, u.headline as author_headline, u.avatar as author_avatar
      FROM posts p
      JOIN users u ON p.user_id = u.id
      WHERE p.id = ?
    `).get(id);

    res.status(201).json({ post: { ...post, liked: false } });
  } catch (error) {
    console.error('Create post error:', error);
    res.status(500).json({ error: 'Server error creating post' });
  }
});

// POST /api/posts/:id/like - Toggle like/unlike
router.post('/:id/like', auth, (req, res) => {
  try {
    const { id } = req.params;

    const post = db.prepare('SELECT * FROM posts WHERE id = ?').get(id);
    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }

    const existingLike = db.prepare('SELECT id FROM post_likes WHERE post_id = ? AND user_id = ?').get(id, req.user.id);

    if (existingLike) {
      // Unlike
      db.prepare('DELETE FROM post_likes WHERE id = ?').run(existingLike.id);
      db.prepare('UPDATE posts SET likes_count = likes_count - 1 WHERE id = ?').run(id);

      const updatedPost = db.prepare('SELECT likes_count FROM posts WHERE id = ?').get(id);
      res.json({ liked: false, likes_count: updatedPost.likes_count });
    } else {
      // Like
      const likeId = uuidv4();
      db.prepare('INSERT INTO post_likes (id, post_id, user_id) VALUES (?, ?, ?)').run(likeId, id, req.user.id);
      db.prepare('UPDATE posts SET likes_count = likes_count + 1 WHERE id = ?').run(id);

      // Create notification (only if liking someone else's post)
      if (post.user_id !== req.user.id) {
        const notificationId = uuidv4();
        db.prepare(`
          INSERT INTO notifications (id, user_id, type, reference_id, message)
          VALUES (?, ?, 'post_like', ?, ?)
        `).run(notificationId, post.user_id, id, `${req.user.first_name} ${req.user.last_name} liked your post`);
      }

      const updatedPost = db.prepare('SELECT likes_count FROM posts WHERE id = ?').get(id);
      res.json({ liked: true, likes_count: updatedPost.likes_count });
    }
  } catch (error) {
    console.error('Toggle like error:', error);
    res.status(500).json({ error: 'Server error toggling like' });
  }
});

// POST /api/posts/:id/comment - Add comment
router.post('/:id/comment', auth, (req, res) => {
  try {
    const { id } = req.params;
    const { content } = req.body;

    if (!content || content.trim().length === 0) {
      return res.status(400).json({ error: 'Comment content is required' });
    }

    const post = db.prepare('SELECT * FROM posts WHERE id = ?').get(id);
    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }

    const commentId = uuidv4();

    db.prepare(`
      INSERT INTO post_comments (id, post_id, user_id, content)
      VALUES (?, ?, ?, ?)
    `).run(commentId, id, req.user.id, content);

    // Update comments count
    db.prepare('UPDATE posts SET comments_count = comments_count + 1 WHERE id = ?').run(id);

    // Create notification (only if commenting on someone else's post)
    if (post.user_id !== req.user.id) {
      const notificationId = uuidv4();
      db.prepare(`
        INSERT INTO notifications (id, user_id, type, reference_id, message)
        VALUES (?, ?, 'post_comment', ?, ?)
      `).run(notificationId, post.user_id, id, `${req.user.first_name} ${req.user.last_name} commented on your post`);
    }

    const comment = db.prepare(`
      SELECT pc.*,
        u.first_name, u.last_name, u.headline as author_headline, u.avatar as author_avatar
      FROM post_comments pc
      JOIN users u ON pc.user_id = u.id
      WHERE pc.id = ?
    `).get(commentId);

    const updatedPost = db.prepare('SELECT comments_count FROM posts WHERE id = ?').get(id);

    res.status(201).json({ comment, comments_count: updatedPost.comments_count });
  } catch (error) {
    console.error('Add comment error:', error);
    res.status(500).json({ error: 'Server error adding comment' });
  }
});

// GET /api/posts/:id/comments - Get comments for a post
router.get('/:id/comments', optionalAuth, (req, res) => {
  try {
    const { id } = req.params;

    const post = db.prepare('SELECT id FROM posts WHERE id = ?').get(id);
    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;
    const offset = (page - 1) * limit;

    const comments = db.prepare(`
      SELECT pc.*,
        u.first_name, u.last_name, u.headline as author_headline, u.avatar as author_avatar
      FROM post_comments pc
      JOIN users u ON pc.user_id = u.id
      WHERE pc.post_id = ?
      ORDER BY pc.created_at ASC
      LIMIT ? OFFSET ?
    `).all(id, limit, offset);

    const total = db.prepare('SELECT COUNT(*) as count FROM post_comments WHERE post_id = ?').get(id).count;

    res.json({
      comments,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get comments error:', error);
    res.status(500).json({ error: 'Server error fetching comments' });
  }
});

// DELETE /api/posts/:id - Delete own post
router.delete('/:id', auth, (req, res) => {
  try {
    const { id } = req.params;

    const post = db.prepare('SELECT * FROM posts WHERE id = ?').get(id);
    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }

    if (post.user_id !== req.user.id) {
      return res.status(403).json({ error: 'Not authorized to delete this post' });
    }

    // Delete related data
    db.prepare('DELETE FROM post_likes WHERE post_id = ?').run(id);
    db.prepare('DELETE FROM post_comments WHERE post_id = ?').run(id);
    db.prepare('DELETE FROM posts WHERE id = ?').run(id);

    res.json({ message: 'Post deleted successfully' });
  } catch (error) {
    console.error('Delete post error:', error);
    res.status(500).json({ error: 'Server error deleting post' });
  }
});

module.exports = router;
