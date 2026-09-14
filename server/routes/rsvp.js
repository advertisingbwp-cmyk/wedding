/**
 * RSVP ROUTES
 * Guest submissions are public; viewing/exporting is strictly OWNER-ONLY.
 */

const express = require('express');
const router = express.Router();
const db = require('../database/db');
const { requireAuth } = require('../middleware/auth');
const { requireEventOwnership } = require('../middleware/rbac');
const { checkRateLimit } = require('../services/firestoreSubmission');

// 1. Public / Guest RSVP submission
router.post('/:id/rsvp', (req, res) => {
  try {
    const clientIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress || '127.0.0.1';
    if (!checkRateLimit(clientIp, 10)) {
      return res.status(429).json({ error: 'Too many submissions. Please wait a minute.' });
    }

    if (req.body._hp_honey_field) {
      return res.status(400).json({ error: 'Automated submission rejected.' });
    }

    const eventId = req.params.id;
    const event = db.prepare('SELECT id, visibility FROM events WHERE id = ?').get(eventId);

    if (!event) {
      return res.status(404).json({ error: 'Event not found.' });
    }

    const {
      guest_name,
      phone,
      email,
      guest_count,
      attendance,
      meal_preference,
      functions_attending,
      message
    } = req.body;

    if (!guest_name || !phone) {
      return res.status(400).json({ error: 'Guest name and phone number are required.' });
    }

    const validAttendances = ['attending', 'not_attending', 'maybe'];
    const sanitizedAttendance = validAttendances.includes(attendance) ? attendance : 'attending';

    const insert = db.prepare(`
      INSERT INTO rsvps (
        event_id, guest_name, phone, email, guest_count,
        attendance, meal_preference, functions_attending_json, message
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    insert.run(
      event.id,
      guest_name.trim(),
      phone.trim(),
      email ? email.trim() : null,
      parseInt(guest_count, 10) || 1,
      sanitizedAttendance,
      meal_preference || 'Vegetarian',
      JSON.stringify(functions_attending || []),
      message ? message.trim() : null
    );

    res.status(201).json({
      message: 'Thank you! Your RSVP has been confirmed.'
    });
  } catch (err) {
    console.error('RSVP submission error:', err);
    res.status(500).json({ error: 'Failed to record RSVP.' });
  }
});

// 2. Owner-Only: Get all RSVPs & summary metrics
router.get('/:id/rsvps', requireAuth, requireEventOwnership, (req, res) => {
  try {
    const rsvps = db.prepare(`
      SELECT * FROM rsvps
      WHERE event_id = ?
      ORDER BY created_at DESC
    `).all(req.event.id);

    // Compute summary metrics
    let totalGuests = 0;
    let attendingGuests = 0;
    let decliningCount = 0;
    let maybeCount = 0;
    const mealBreakdown = {};

    for (let r of rsvps) {
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

    res.json({
      metrics: {
        totalRsvps: rsvps.length,
        totalGuests,
        attendingGuests,
        decliningCount,
        maybeCount,
        mealBreakdown
      },
      rsvps
    });
  } catch (err) {
    console.error('Fetch RSVPs error:', err);
    res.status(500).json({ error: 'Failed to retrieve RSVPs.' });
  }
});

// 3. Owner-Only: Export RSVPs as CSV
router.get('/:id/rsvps/export', requireAuth, requireEventOwnership, (req, res) => {
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
