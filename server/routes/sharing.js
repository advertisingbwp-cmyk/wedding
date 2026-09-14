/**
 * SHARING, PRIVATE ACCESS & AUDIT LOG ROUTES
 */

const express = require('express');
const router = express.Router();
const db = require('../database/db');
const { requireAuth } = require('../middleware/auth');
const { requireEventOwnership } = require('../middleware/rbac');
const { hashPassword, generateSecureToken } = require('../config/security');

// 1. Update Visibility Mode & Optional Passcode
router.put('/:id/visibility', requireAuth, requireEventOwnership, (req, res) => {
  try {
    const { visibility, passcode } = req.body;
    const allowed = ['draft', 'private_share', 'public'];

    if (!allowed.includes(visibility)) {
      return res.status(400).json({ error: 'Invalid visibility mode. Choose draft, private_share, or public.' });
    }

    let passcodeHash = null;
    if (visibility === 'private_share' && passcode && passcode.trim()) {
      passcodeHash = hashPassword(passcode.trim());
    }

    db.prepare(`
      UPDATE events
      SET visibility = ?, private_passcode_hash = COALESCE(?, private_passcode_hash), updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).run(visibility, passcodeHash, req.event.id);

    // Audit log
    db.prepare(`
      INSERT INTO audit_logs (user_id, event_id, action, details)
      VALUES (?, ?, 'visibility_changed', ?)
    `).run(req.user.id, req.event.id, `Visibility updated to ${visibility} (passcode configured: ${Boolean(passcode)})`);

    res.json({
      message: `Event visibility updated to ${visibility}.`,
      visibility
    });
  } catch (err) {
    console.error('Update visibility error:', err);
    res.status(500).json({ error: 'Failed to update visibility.' });
  }
});

// 2. Generate Private Invite Token
router.post('/:id/invites', requireAuth, requireEventOwnership, (req, res) => {
  try {
    const { recipient, expires_in_days, max_uses } = req.body;
    const inviteCode = generateSecureToken(16);

    const days = parseInt(expires_in_days, 10) || 14;
    const expiresAt = new Date(Date.now() + days * 24 * 60 * 60 * 1000).toISOString();
    const uses = parseInt(max_uses, 10) || 5;

    db.prepare(`
      INSERT INTO private_invites (event_id, invite_code, recipient_identifier, expires_at, uses_remaining)
      VALUES (?, ?, ?, ?, ?)
    `).run(req.event.id, inviteCode, recipient ? recipient.trim() : 'Guest', expiresAt, uses);

    db.prepare(`
      INSERT INTO audit_logs (user_id, event_id, action, details)
      VALUES (?, ?, 'private_invite_created', ?)
    `).run(req.user.id, req.event.id, `Created invite for ${recipient || 'Guest'} (expires in ${days} days)`);

    const inviteLink = `/event/${req.event.slug}?invite=${inviteCode}`;

    res.status(201).json({
      message: 'Private invite link generated successfully.',
      inviteCode,
      inviteLink,
      expiresAt
    });
  } catch (err) {
    console.error('Generate invite error:', err);
    res.status(500).json({ error: 'Failed to generate invite.' });
  }
});

// 3. List Active Invites
router.get('/:id/invites', requireAuth, requireEventOwnership, (req, res) => {
  try {
    const invites = db.prepare(`
      SELECT id, invite_code, recipient_identifier, expires_at, uses_remaining, created_at
      FROM private_invites
      WHERE event_id = ?
      ORDER BY created_at DESC
    `).all(req.event.id);

    res.json({ invites });
  } catch (err) {
    console.error('List invites error:', err);
    res.status(500).json({ error: 'Failed to retrieve invites.' });
  }
});

// 4. Revoke Invite
router.delete('/:id/invites/:inviteId', requireAuth, requireEventOwnership, (req, res) => {
  try {
    const { inviteId } = req.params;
    db.prepare('DELETE FROM private_invites WHERE id = ? AND event_id = ?').run(inviteId, req.event.id);

    db.prepare(`
      INSERT INTO audit_logs (user_id, event_id, action, details)
      VALUES (?, ?, 'invite_revoked', ?)
    `).run(req.user.id, req.event.id, `Revoked invite ID: ${inviteId}`);

    res.json({ message: 'Invite access revoked.' });
  } catch (err) {
    console.error('Revoke invite error:', err);
    res.status(500).json({ error: 'Failed to revoke invite.' });
  }
});

// 5. Fetch Audit Trail
router.get('/:id/audit-logs', requireAuth, requireEventOwnership, (req, res) => {
  try {
    const logs = db.prepare(`
      SELECT * FROM audit_logs
      WHERE event_id = ?
      ORDER BY created_at DESC
      LIMIT 50
    `).all(req.event.id);

    res.json({ logs });
  } catch (err) {
    console.error('Audit logs error:', err);
    res.status(500).json({ error: 'Failed to fetch audit logs.' });
  }
});

module.exports = router;
