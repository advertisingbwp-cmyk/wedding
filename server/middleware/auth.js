/**
 * AUTHENTICATION MIDDLEWARE
 * Verifies JWT session token and populates req.user.
 */

const { verifySessionToken } = require('../config/security');
const db = require('../database/db');

function requireAuth(req, res, next) {
  let token = null;

  // Check Authorization header: Bearer <token>
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.substring(7);
  } else if (req.headers.cookie) {
    // Check cookies for session_token
    const match = req.headers.cookie.match(/session_token=([^;]+)/);
    if (match) token = match[1];
  }

  if (!token) {
    return res.status(401).json({ error: 'Authentication required. Please log in.' });
  }

  const payload = verifySessionToken(token);
  if (!payload || !payload.userId) {
    return res.status(401).json({ error: 'Session expired or invalid. Please log in again.' });
  }

  const user = db.prepare('SELECT id, email, full_name, created_at FROM users WHERE id = ?').get(payload.userId);
  if (!user) {
    return res.status(401).json({ error: 'User account not found.' });
  }

  req.user = user;
  next();
}

/**
 * Optional Auth - populates req.user if present, but doesn't block if absent
 */
function optionalAuth(req, res, next) {
  let token = null;
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.substring(7);
  } else if (req.headers.cookie) {
    const match = req.headers.cookie.match(/session_token=([^;]+)/);
    if (match) token = match[1];
  }

  if (token) {
    const payload = verifySessionToken(token);
    if (payload && payload.userId) {
      const user = db.prepare('SELECT id, email, full_name FROM users WHERE id = ?').get(payload.userId);
      if (user) req.user = user;
    }
  }
  next();
}

module.exports = {
  requireAuth,
  optionalAuth
};
