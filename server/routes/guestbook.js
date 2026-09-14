/**
 * GUESTBOOK ROUTES
 */

const express = require('express');
const router = express.Router();
const db = require('../database/db');
const { requireAuth } = require('../middleware/auth');
const { requireEventOwnership } = require('../middleware/rbac');
const { checkRateLimit } = require('../services/firestoreSubmission');

// 1. Post a wish to guestbook
router.post('/:id/guestbook', (req, res) => {
  try {
    const clientIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress || '127.0.0.1';
    if (!checkRateLimit(clientIp, 10)) {
      return res.status(429).json({ error: 'Too many submissions. Please wait a minute.' });
    }

    if (req.body._hp_honey_field) {
      return res.status(400).json({ error: 'Automated submission rejected.' });
    }

    const eventId = req.params.id;
    const { guest_name, relation, emoji, message } = req.body;

    if (!guest_name || !message) {
      return res.status(400).json({ error: 'Name and message are required.' });
    }

    const insert = db.prepare(`
      INSERT INTO guestbook_messages (event_id, guest_name, relation, emoji, message, is_approved)
      VALUES (?, ?, ?, ?, ?, 1)
    `);

    insert.run(
      eventId,
      guest_name.trim(),
      relation ? relation.trim() : 'Well-wisher',
      emoji || '❤️',
      message.trim()
    );

    res.status(201).json({ message: 'Wish added to guestbook!' });
  } catch (err) {
    console.error('Guestbook error:', err);
    res.status(500).json({ error: 'Failed to post message.' });
  }
});

// 2. Fetch wishes for event
router.get('/:id/guestbook', (req, res) => {
  try {
    const eventId = req.params.id;
    const messages = db.prepare(`
      SELECT id, guest_name, relation, emoji, message, created_at
      FROM guestbook_messages
      WHERE event_id = ? AND is_approved = 1
      ORDER BY created_at DESC
    `).all(eventId);

    res.json({ messages });
  } catch (err) {
    console.error('Get guestbook error:', err);
    res.status(500).json({ error: 'Failed to fetch guestbook.' });
  }
});

// 3. Owner moderation: Delete message
router.delete('/:id/guestbook/:msgId', requireAuth, requireEventOwnership, (req, res) => {
  try {
    const { msgId } = req.params;
    db.prepare('DELETE FROM guestbook_messages WHERE id = ? AND event_id = ?').run(msgId, req.event.id);
    res.json({ message: 'Message deleted.' });
  } catch (err) {
    console.error('Delete guestbook msg error:', err);
    res.status(500).json({ error: 'Failed to delete message.' });
  }
});

module.exports = router;
