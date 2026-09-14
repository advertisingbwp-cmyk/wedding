/**
 * PUBLIC & PRIVATE SHARE EVENT RENDERER ROUTE
 * Handles public viewing, draft restrictions, and passcode/token gating for private shares.
 */

const express = require('express');
const router = express.Router();
const db = require('../database/db');
const { optionalAuth } = require('../middleware/auth');
const { verifyPassword } = require('../config/security');

router.get('/:slug', optionalAuth, (req, res) => {
  try {
    const { slug } = req.params;
    const { invite, passcode } = req.query;

    const event = db.prepare('SELECT * FROM events WHERE slug = ?').get(slug);
    if (!event) {
      return res.status(404).json({ error: 'Event not found.' });
    }

    const isOwner = req.user && req.user.id === event.owner_user_id;

    // 1. DRAFT MODE
    if (event.visibility === 'draft' && !isOwner) {
      return res.status(403).json({
        error: 'This event website is currently in private Draft mode and can only be viewed by its owner.',
        visibility: 'draft'
      });
    }

    // 2. PRIVATE SHARE MODE
    if (event.visibility === 'private_share' && !isOwner) {
      let isAuthorized = false;

      // Check invite code
      if (invite) {
        const inviteRecord = db.prepare(`
          SELECT * FROM private_invites
          WHERE event_id = ? AND invite_code = ?
        `).get(event.id, invite);

        if (inviteRecord) {
          const notExpired = !inviteRecord.expires_at || new Date(inviteRecord.expires_at) > new Date();
          const hasUses = inviteRecord.uses_remaining > 0;
          if (notExpired && hasUses) {
            isAuthorized = true;
            // Decrement use count
            db.prepare('UPDATE private_invites SET uses_remaining = uses_remaining - 1 WHERE id = ?').run(inviteRecord.id);
          }
        }
      }

      // Check passcode
      if (!isAuthorized && passcode && event.private_passcode_hash) {
        if (verifyPassword(passcode, event.private_passcode_hash)) {
          isAuthorized = true;
        }
      }

      if (!isAuthorized) {
        return res.status(401).json({
          requires_auth: true,
          event_type: event.event_type,
          title: event.title,
          primary_names: event.primary_names,
          theme_id: event.theme_id,
          message: 'This invitation is private. Please enter the invitation passcode or use your private invite link.'
        });
      }
    }

    // 3. COMPILE PUBLIC CONTENT
    // Sanitize event object: never leak passcode hashes or internal owner IDs
    const safeEvent = {
      id: event.id,
      slug: event.slug,
      event_type: event.event_type,
      title: event.title,
      headline: event.headline,
      primary_names: event.primary_names,
      event_date: event.event_date,
      venue_name: event.venue_name,
      venue_address: event.venue_address,
      venue_map_url: event.venue_map_url,
      visibility: event.visibility,
      theme_id: event.theme_id,
      hero_image_url: event.hero_image_url,
      hashtag: event.hashtag,
      is_preview: Boolean(isOwner)
    };

    const sections = db.prepare(`
      SELECT section_key, title, custom_content_json
      FROM event_sections
      WHERE event_id = ? AND is_enabled = 1
      ORDER BY sort_order ASC
    `).all(event.id);

    const functions = db.prepare(`
      SELECT function_key, title, subtitle, date_time, venue_name, dress_code, palette_colors_json, illustration_url, description
      FROM event_functions
      WHERE event_id = ?
      ORDER BY sort_order ASC
    `).all(event.id);

    res.json({
      event: safeEvent,
      sections,
      functions
    });
  } catch (err) {
    console.error('Public event fetch error:', err);
    res.status(500).json({ error: 'Failed to render event website.' });
  }
});

// Verify Passcode Endpoint (POST)
router.post('/:slug/verify-passcode', (req, res) => {
  try {
    const { slug } = req.params;
    const { passcode } = req.body;

    const event = db.prepare('SELECT id, private_passcode_hash FROM events WHERE slug = ?').get(slug);
    if (!event) return res.status(404).json({ error: 'Event not found.' });

    if (!event.private_passcode_hash || !verifyPassword(passcode || '', event.private_passcode_hash)) {
      return res.status(401).json({ error: 'Incorrect passcode. Please try again.' });
    }

    res.json({ success: true, message: 'Passcode verified successfully!' });
  } catch (err) {
    res.status(500).json({ error: 'Verification failed.' });
  }
});

module.exports = router;
