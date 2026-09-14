/**
 * TEMPLATES ROUTER
 * Public previewing and authenticated 1-click cloning into private user events.
 */

const express = require('express');
const router = express.Router();
const FirestoreStore = require('../services/firestoreStore');
const { requireFirebaseAuth } = require('../middleware/requireFirebaseAuth');

// 1. GET /api/templates - List public templates with optional type and style filters
router.get('/', (req, res) => {
  try {
    const { type, style } = req.query;
    const templates = FirestoreStore.getAllTemplates(type, style);
    res.json({ templates });
  } catch (err) {
    res.status(500).json({ error: 'Failed to retrieve templates.' });
  }
});

// 2. GET /api/templates/:templateId - Public preview of template (no login required)
router.get('/:templateId', (req, res) => {
  try {
    const { templateId } = req.params;
    const tpl = FirestoreStore.getCanonicalTemplate(templateId);
    if (!tpl) {
      return res.status(404).json({ error: 'Template not found.' });
    }

    // Return strictly public-safe template structure
    res.json({
      template: {
        id: tpl.id,
        slug: tpl.slug,
        eventType: tpl.eventType,
        title: tpl.title,
        headline: tpl.headline,
        primary_names: tpl.primary_names,
        event_date: tpl.event_date,
        venue_name: tpl.venue_name,
        venue_address: tpl.venue_address,
        venue_map_url: tpl.venue_map_url,
        theme_id: tpl.theme_id,
        hero_image_url: tpl.hero_image_url,
        hashtag: tpl.hashtag,
        description: tpl.description,
        isPublic: true,
        isTemplate: true
      },
      sections: tpl.sections,
      functions: tpl.functions
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to load template preview.' });
  }
});

// 3. POST /api/templates/:templateId/clone - 1-Click clone into authenticated user account
router.post('/:templateId/clone', requireFirebaseAuth, async (req, res) => {
  try {
    const { templateId } = req.params;
    const user = req.user;

    const result = await FirestoreStore.cloneTemplate(templateId, user);
    res.status(201).json(result);
  } catch (err) {
    console.error('Template clone error:', err.message);
    res.status(500).json({ error: err.message || 'We could not create your event. Please try again.' });
  }
});

module.exports = router;
