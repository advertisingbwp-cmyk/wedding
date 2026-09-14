/**
 * ROW-LEVEL SECURITY & ACCESS CONTROL MIDDLEWARE
 * Enforces strict isolation: users can ONLY access events, RSVPs,
 * and data belonging strictly to their own user ID.
 */

const db = require('../database/db');

function requireEventOwnership(req, res, next) {
  const eventId = req.params.id || req.params.eventId;

  if (!eventId) {
    return res.status(400).json({ error: 'Event identifier is required.' });
  }

  const event = db.prepare('SELECT * FROM events WHERE id = ?').get(eventId);

  if (!event) {
    return res.status(404).json({ error: 'Event not found.' });
  }

  // Strict Row-Level Security check
  if (event.owner_user_id !== req.user.id) {
    // Log security audit for unauthorized cross-tenant attempt
    db.prepare(`
      INSERT INTO audit_logs (user_id, event_id, action, details)
      VALUES (?, ?, 'unauthorized_access_attempt', ?)
    `).run(req.user.id, event.id, `User ${req.user.id} tried to modify Event ${event.id} owned by ${event.owner_user_id}`);

    return res.status(403).json({ error: 'Access denied: You are not authorized to manage this event.' });
  }

  req.event = event;
  next();
}

module.exports = {
  requireEventOwnership
};
