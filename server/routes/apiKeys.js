/**
 * API KEYS & THIRD-PARTY INTEGRATIONS ROUTES
 * Stores API keys encrypted at rest with AES-256-GCM.
 * Never leaks raw keys to frontend; only returns masked previews.
 */

const express = require('express');
const router = express.Router();
const db = require('../database/db');
const { requireAuth } = require('../middleware/auth');
const { encryptApiKey, maskApiKey } = require('../config/security');

// 1. List user's stored integrations (Masked Only)
router.get('/', requireAuth, (req, res) => {
  try {
    const keys = db.prepare(`
      SELECT id, service_name, key_preview, created_at
      FROM api_keys
      WHERE user_id = ?
      ORDER BY created_at DESC
    `).all(req.user.id);

    res.json({ keys });
  } catch (err) {
    console.error('Fetch API keys error:', err);
    res.status(500).json({ error: 'Failed to retrieve integration keys.' });
  }
});

// 2. Add / Update Integration Key (Encrypted at Rest)
router.post('/', requireAuth, (req, res) => {
  try {
    const { service_name, api_key } = req.body;

    if (!service_name || !api_key) {
      return res.status(400).json({ error: 'Service name and API key are required.' });
    }

    const preview = maskApiKey(api_key);
    const { ciphertext, iv, authTag } = encryptApiKey(api_key.trim());

    // Check if key for service already exists for this user
    const existing = db.prepare('SELECT id FROM api_keys WHERE user_id = ? AND service_name = ?').get(req.user.id, service_name);

    if (existing) {
      db.prepare(`
        UPDATE api_keys
        SET key_preview = ?, ciphertext = ?, iv = ?, auth_tag = ?, created_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `).run(preview, ciphertext, iv, authTag, existing.id);

      db.prepare(`
        INSERT INTO audit_logs (user_id, action, details)
        VALUES (?, 'api_key_updated', ?)
      `).run(req.user.id, `Updated API key for service: ${service_name}`);

      return res.json({ message: `API key for ${service_name} updated successfully.`, preview });
    }

    const insert = db.prepare(`
      INSERT INTO api_keys (user_id, service_name, key_preview, ciphertext, iv, auth_tag)
      VALUES (?, ?, ?, ?, ?, ?)
    `);

    insert.run(req.user.id, service_name, preview, ciphertext, iv, authTag);

    db.prepare(`
      INSERT INTO audit_logs (user_id, action, details)
      VALUES (?, 'api_key_stored', ?)
    `).run(req.user.id, `Stored encrypted API key for service: ${service_name}`);

    res.status(201).json({
      message: `API key for ${service_name} securely encrypted and stored.`,
      preview
    });
  } catch (err) {
    console.error('Store API key error:', err);
    res.status(500).json({ error: 'Failed to securely store API key.' });
  }
});

// 3. Delete / Revoke Key
router.delete('/:id', requireAuth, (req, res) => {
  try {
    const key = db.prepare('SELECT * FROM api_keys WHERE id = ? AND user_id = ?').get(req.params.id, req.user.id);
    if (!key) {
      return res.status(404).json({ error: 'Key not found or unauthorized.' });
    }

    db.prepare('DELETE FROM api_keys WHERE id = ?').run(key.id);

    db.prepare(`
      INSERT INTO audit_logs (user_id, action, details)
      VALUES (?, 'api_key_revoked', ?)
    `).run(req.user.id, `Revoked API key for service: ${key.service_name}`);

    res.json({ message: `Integration key for ${key.service_name} revoked.` });
  } catch (err) {
    console.error('Delete API key error:', err);
    res.status(500).json({ error: 'Failed to revoke API key.' });
  }
});

module.exports = router;
