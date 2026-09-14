/**
 * ROW-LEVEL SECURITY & ROLE-BASED ACCESS CONTROL (RBAC) MIDDLEWARE
 * 
 * Distinct Roles:
 * - owner: Full access (deletion, publishing, visibility, member management, full RSVP details, API keys)
 * - editor: Can edit content and design only; CANNOT delete events, change ownerId, change visibility, manage members, access API keys, or view private RSVP phone numbers
 * - viewer: Can only view private event content shared with them; cannot edit anything
 * - guest: Can view only intentionally public event content
 */

const db = require('../database/db');

/**
 * Determine a user's role on an event
 */
function getEventRole(userId, event) {
  if (!userId || !event) return null;
  if (event.owner_user_id === userId) return 'owner';

  const member = db.prepare('SELECT role FROM event_members WHERE event_id = ? AND user_id = ?').get(event.id, userId);
  return member ? member.role : null;
}

/**
 * Require OWNER role strictly (deletion, publishing, visibility, member management, full RSVP details)
 */
function requireEventOwner(req, res, next) {
  const eventId = req.params.id || req.params.eventId;
  if (!eventId) {
    return res.status(400).json({ error: 'Event identifier is required.' });
  }

  const event = db.prepare('SELECT * FROM events WHERE id = ?').get(eventId);
  if (!event) {
    return res.status(404).json({ error: 'Event not found.' });
  }

  if (event.owner_user_id !== req.user.id) {
    db.prepare(`
      INSERT INTO audit_logs (user_id, event_id, action, details)
      VALUES (?, ?, 'unauthorized_owner_access_attempt', ?)
    `).run(req.user.id, event.id, `User ${req.user.id} tried owner action on Event ${event.id}`);

    return res.status(403).json({ error: 'Access denied: Only the event owner can perform this action.' });
  }

  req.event = event;
  req.userRole = 'owner';
  next();
}

/**
 * Require EDITOR or OWNER role (editing content, functions, galleries; blocks ownerId/visibility/member tampering)
 */
function requireEventEditor(req, res, next) {
  const eventId = req.params.id || req.params.eventId;
  if (!eventId) {
    return res.status(400).json({ error: 'Event identifier is required.' });
  }

  const event = db.prepare('SELECT * FROM events WHERE id = ?').get(eventId);
  if (!event) {
    return res.status(404).json({ error: 'Event not found.' });
  }

  const role = getEventRole(req.user.id, event);
  if (role !== 'owner' && role !== 'editor') {
    db.prepare(`
      INSERT INTO audit_logs (user_id, event_id, action, details)
      VALUES (?, ?, 'unauthorized_edit_attempt', ?)
    `).run(req.user.id, event.id, `User ${req.user.id} with role '${role || 'none'}' tried to edit Event ${event.id}`);

    return res.status(403).json({ error: 'Access denied: You need editor or owner privileges to modify this event.' });
  }

  // Safety check: editors cannot alter owner_user_id or visibility in update payloads
  if (role === 'editor') {
    if (req.body && req.body.owner_user_id !== undefined && req.body.owner_user_id !== event.owner_user_id) {
      return res.status(403).json({ error: 'Editors cannot transfer event ownership.' });
    }
    if (req.body && req.body.visibility !== undefined && req.body.visibility !== event.visibility) {
      return res.status(403).json({ error: 'Editors cannot modify event visibility or privacy settings.' });
    }
  }

  req.event = event;
  req.userRole = role;
  next();
}

/**
 * Require VIEWER, EDITOR, or OWNER role (viewing private event content)
 */
function requireEventViewer(req, res, next) {
  const eventId = req.params.id || req.params.eventId;
  if (!eventId) {
    return res.status(400).json({ error: 'Event identifier is required.' });
  }

  const event = db.prepare('SELECT * FROM events WHERE id = ?').get(eventId);
  if (!event) {
    return res.status(404).json({ error: 'Event not found.' });
  }

  // Public events can be viewed by anyone
  if (event.visibility === 'public') {
    req.event = event;
    req.userRole = req.user ? getEventRole(req.user.id, event) || 'guest' : 'guest';
    return next();
  }

  // Private events require authentication
  if (!req.user) {
    return res.status(401).json({ error: 'Authentication required to view this private event.' });
  }

  const role = getEventRole(req.user.id, event);
  if (!role) {
    return res.status(403).json({ error: 'Access denied: You are not an invited member of this private event.' });
  }

  req.event = event;
  req.userRole = role;
  next();
}

// Backward compatibility alias
const requireEventOwnership = requireEventOwner;

module.exports = {
  getEventRole,
  requireEventOwner,
  requireEventEditor,
  requireEventViewer,
  requireEventOwnership
};
