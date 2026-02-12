const jwt = require('jsonwebtoken');
const { db } = require('../db/init');

const JWT_SECRET = 'jobconnect_secret_key_2024';
const JWT_EXPIRES_IN = '7d';

function generateToken(userId) {
  return jwt.sign({ id: userId }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
}

function auth(req, res, next) {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'No token provided, authorization denied' });
    }

    const token = authHeader.split(' ')[1];

    const decoded = jwt.verify(token, JWT_SECRET);

    const user = db.prepare('SELECT id, email, first_name, last_name, headline, summary, avatar, location, industry, experience_years, skills, created_at FROM users WHERE id = ?').get(decoded.id);

    if (!user) {
      return res.status(401).json({ error: 'Token is valid but user not found' });
    }

    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ error: 'Invalid token' });
    }
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Token has expired' });
    }
    return res.status(500).json({ error: 'Server error during authentication' });
  }
}

// Optional auth - attaches user if token present but doesn't block
function optionalAuth(req, res, next) {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      req.user = null;
      return next();
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, JWT_SECRET);

    const user = db.prepare('SELECT id, email, first_name, last_name, headline, summary, avatar, location, industry, experience_years, skills, created_at FROM users WHERE id = ?').get(decoded.id);

    req.user = user || null;
    next();
  } catch (error) {
    req.user = null;
    next();
  }
}

module.exports = { auth, optionalAuth, generateToken };
