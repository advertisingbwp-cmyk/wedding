/**
 * RSVP ROUTES
 * Guest submissions are public; viewing/exporting is strictly OWNER-ONLY.
 */

const express = require('express');
const router = express.Router();
const db = require('../database/db');
const { requireAuth } = require('../middleware/auth');
const { getEventRole, requireEventOwner } = require('../middleware/rbac');
const { handleRSVPSubmission, checkRateLimit } = require('../services/firestoreSubmission');

// 1. Public / Guest RSVP submission (Passed through Server Validation, Honeypot & Rate-Limiter)
router.post('/:id/rsvp', (req, res) => {
  try {
    const clientIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress || '127.0.0.1';
    const appCheckToken = req.headers['x-firebase-appcheck'];

    const eventId = req.params.id;
    const event = db.prepare('SELECT id, visibility FROM events WHERE id = ?').get(eventId);

    if (!event) {
      return res.status(404).json({ error: 'Event not found.' });
    }

    // Validate and sanitize input with honeypot, rate-limit, and XSS sanitization
    const validated = handleRSVPSubmission(req.body, clientIp, appCheckToken);

    const insert = db.prepare(`
      INSERT INTO rsvps (
        event_id, guest_name, phone, email, guest_count,
        attendance, meal_preference, functions_attending_json, message
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    insert.run(
      event.id,
      validated.publicData.guestName,
      validated.privateAttendeeData.phone,
      validated.privateAttendeeData.email,
      validated.publicData.guestsCount,
      validated.publicData.attendance,
      validated.privateAttendeeData.mealPreference,
      JSON.stringify(validated.privateAttendeeData.functionsAttending),
      validated.privateAttendeeData.privateNotes
    );

    res.status(201).json({
      message: 'Thank you! Your RSVP has been confirmed.',
      guest: validated.publicData.guestName
    });
  } catch (err) {
    if (err.message.includes('Too many requests') || err.message.includes('Spam') || err.message.includes('rejected')) {
      return res.status(429).json({ error: err.message });
    }
    if (err.message.includes('required') || err.message.includes('App Check')) {
      return res.status(400).json({ error: err.message });
    }
    console.error('RSVP submission error:', err);
    res.status(500).json({ error: 'Failed to record RSVP.' });
  }
});

// 2. Role-Gated: Get RSVPs & Summary Metrics
// - Owner: Full access with phone numbers, emails, and attendee notes
// - Editor: Aggregated summary metrics only; guest contact info redacted
// - Viewer / Guest: Completely blocked (403)
router.get('/:id/rsvps', requireAuth, (req, res) => {
  try {
    const eventId = req.params.id;
    const event = db.prepare('SELECT * FROM events WHERE id = ?').get(eventId);
    if (!event) {
      return res.status(404).json({ error: 'Event not found.' });
    }

    const role = getEventRole(req.user.id, event);
    if (role !== 'owner' && role !== 'editor') {
      return res.status(403).json({ error: 'Access denied: You do not have permission to view RSVP records.' });
    }

    const rawRsvps = db.prepare(`
      SELECT * FROM rsvps
      WHERE event_id = ?
      ORDER BY created_at DESC
    `).all(event.id);

    // Compute summary metrics
    let totalGuests = 0;
    let attendingGuests = 0;
    let decliningCount = 0;
    let maybeCount = 0;
    const mealBreakdown = {};

    for (let r of rawRsvps) {
      const count = parseInt(r.guest_count, 10) || 1;
      totalGuests += count;
      if (r.attendance === 'attending') {
        attendingGuests += count;
        const meal = r.meal_preference || 'Vegetarian';
        mealBreakdown[meal] = (mealBreakdown[meal] || 0) + count;
      } else if (r.attendance === 'not_attending') {
        decliningCount += count;
      } else {
        maybeCount += count;
      }
    }

    // Role-based redaction: only OWNER gets private phone numbers and personal notes
    const sanitizedRsvps = rawRsvps.map(r => {
      if (role === 'owner') {
        return r; // Owner gets full details
      }
      // Editors get redacted attendee data
      return {
        id: r.id,
        guest_name: r.guest_name,
        guest_count: r.guest_count,
        attendance: r.attendance,
        phone: '[REDACTED - OWNER ACCESS ONLY]',
        email: r.email ? '[REDACTED]' : null,
        meal_preference: r.meal_preference,
        created_at: r.created_at
      };
    });

    res.json({
      role,
      metrics: {
        totalRsvps: rawRsvps.length,
        totalGuests,
        attendingGuests,
        decliningCount,
        maybeCount,
        mealBreakdown
      },
      rsvps: sanitizedRsvps
    });
  } catch (err) {
    console.error('Fetch RSVPs error:', err);
    res.status(500).json({ error: 'Failed to retrieve RSVPs.' });
  }
});

// 3. Owner-Only: Export RSVPs as CSV
router.get('/:id/rsvps/export', requireAuth, requireEventOwner, (req, res) => {
  try {
    const rsvps = db.prepare('SELECT * FROM rsvps WHERE event_id = ? ORDER BY created_at ASC').all(req.event.id);

    let csv = 'ID,Guest Name,Phone,Email,Guest Count,Attendance,Meal Preference,Message,Submitted At\n';
    for (let r of rsvps) {
      const row = [
        r.id,
        `"${(r.guest_name || '').replace(/"/g, '""')}"`,
        `"${(r.phone || '').replace(/"/g, '""')}"`,
        `"${(r.email || '').replace(/"/g, '""')}"`,
        r.guest_count,
        r.attendance,
        `"${(r.meal_preference || '').replace(/"/g, '""')}"`,
        `"${(r.message || '').replace(/"/g, '""')}"`,
        r.created_at
      ];
      csv += row.join(',') + '\n';
    }

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="${req.event.slug}-rsvps.csv"`);
    res.send(csv);
  } catch (err) {
    console.error('Export RSVPs error:', err);
    res.status(500).json({ error: 'Failed to export CSV.' });
  }
});

module.exports = router;
