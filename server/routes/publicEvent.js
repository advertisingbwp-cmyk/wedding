/**
 * PUBLIC & PRIVATE SHARE EVENT RENDERER ROUTE
 *
 * One renderer for both saved events and all canonical template previews.
 * Canonical previews are resolved directly by id/templateId/slug so every
 * published template can be opened from /event/:slug without depending on
 * list/filter behavior.
 */

const express = require('express');
const router = express.Router();
const db = require('../database/db');
const FirestoreStore = require('../services/firestoreStore');
const { optionalAuth } = require('../middleware/auth');
const { verifyPassword } = require('../config/security');

function findCanonicalTemplate(identifier) {
  const value = String(identifier || '').trim();
  if (!value) return null;

  // getCanonicalTemplate already supports both canonical IDs and public slugs.
  const byDirectLookup = typeof FirestoreStore.getCanonicalTemplate === 'function'
    ? FirestoreStore.getCanonicalTemplate(value)
    : null;
  if (byDirectLookup) return byDirectLookup;

  // Defensive fallback for any legacy alias/templateId mismatch.
  if (typeof FirestoreStore.getAllTemplates === 'function') {
    const templates = FirestoreStore.getAllTemplates() || [];
    return templates.find((tpl) => (
      tpl && (
        String(tpl.id || '') === value ||
        String(tpl.templateId || '') === value ||
        String(tpl.slug || '') === value
      )
    )) || null;
  }

  return null;
}

function serializeTemplate(tpl) {
  return {
    event: {
      id: tpl.id,
      slug: tpl.slug,
      event_type: tpl.eventType || tpl.event_type,
      eventType: tpl.eventType || tpl.event_type,
      title: tpl.title,
      headline: tpl.headline,
      primary_names: tpl.primary_names,
      event_date: tpl.event_date,
      venue_name: tpl.venue_name,
      venue_address: tpl.venue_address,
      venue_map_url: tpl.venue_map_url,
      visibility: 'public',
      theme_id: tpl.theme_id,
      hero_image_url: tpl.hero_image_url,
      hashtag: tpl.hashtag,
      is_preview: false,
      isPublic: true,
      isTemplate: true
    },
    sections: Array.isArray(tpl.sections) ? tpl.sections : [],
    functions: Array.isArray(tpl.functions) ? tpl.functions : []
  };
}

router.get('/:slug', optionalAuth, (req, res) => {
  try {
    const { slug } = req.params;
    const { invite, passcode } = req.query;

    // FIRST: canonical template preview.
    const canonicalTemplate = findCanonicalTemplate(slug);
    if (canonicalTemplate) {
      return res.json(serializeTemplate(canonicalTemplate));
    }

    // SECOND: saved/user event lookup.
    const event = db.prepare('SELECT * FROM events WHERE slug = ?').get(slug);
    if (!event) {
      return res.status(404).json({ error: 'Event not found.' });
    }

    const isOwner = req.user && String(req.user.id) === String(event.owner_user_id);

    // Draft events are only visible to their owner.
    if (event.visibility === 'draft' && !isOwner) {
      return res.status(403).json({
        error: 'This event website is currently in private Draft mode and can only be viewed by its owner.',
        visibility: 'draft'
      });
    }

    // Private share events require an invite or passcode unless the owner is viewing.
    if (event.visibility === 'private_share' && !isOwner) {
      let authorized = false;

      if (invite) {
        const inviteRecord = db.prepare(`
          SELECT * FROM private_invites
          WHERE event_id = ? AND invite_code = ?
        `).get(event.id, invite);

        if (inviteRecord) {
          const notExpired = !inviteRecord.expires_at || new Date(inviteRecord.expires_at) > new Date();
          const hasUses = Number(inviteRecord.uses_remaining) > 0;
          if (notExpired && hasUses) {
            authorized = true;
            db.prepare(
              'UPDATE private_invites SET uses_remaining = uses_remaining - 1 WHERE id = ?'
            ).run(inviteRecord.id);
          }
        }
      }

      if (!authorized && passcode && event.private_passcode_hash) {
        authorized = verifyPassword(passcode, event.private_passcode_hash);
      }

      if (!authorized) {
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
      SELECT function_key, title, subtitle, date_time, venue_name, dress_code,
             palette_colors_json, illustration_url, description
      FROM event_functions
      WHERE event_id = ?
      ORDER BY sort_order ASC
    `).all(event.id);

    return res.json({
      event: safeEvent,
      sections,
      functions
    });
  } catch (err) {
    console.error('Public event fetch error:', err);
    return res.status(500).json({ error: 'Failed to render event website.' });
  }
});

router.post('/:slug/verify-passcode', (req, res) => {
  try {
    const { slug } = req.params;
    const { passcode } = req.body || {};
    const event = db.prepare(
      'SELECT id, private_passcode_hash FROM events WHERE slug = ?'
    ).get(slug);

    if (!event) return res.status(404).json({ error: 'Event not found.' });

    if (!event.private_passcode_hash || !verifyPassword(passcode || '', event.private_passcode_hash)) {
      return res.status(401).json({ error: 'Incorrect passcode. Please try again.' });
    }

    return res.json({ success: true, message: 'Passcode verified successfully!' });
  } catch (err) {
    console.error('Passcode verification error:', err);
    return res.status(500).json({ error: 'Verification failed.' });
  }
});

module.exports = router;
