/**
 * AUTHENTICATION ROUTES
 */

const express = require('express');
const router = express.Router();
const crypto = require('node:crypto');
const db = require('../database/db');
const { hashPassword, verifyPassword, createSessionToken } = require('../config/security');
const { requireAuth } = require('../middleware/auth');

// Register
router.post('/register', (req, res) => {
  try {
    const { email, password, full_name } = req.body;

    if (!email || !password || !full_name) {
      return res.status(400).json({ error: 'Email, password, and full name are required.' });
    }

    if (password.length < 8) {
      return res.status(400).json({ error: 'Password must be at least 8 characters long.' });
    }

    const normalizedEmail = email.trim().toLowerCase();

    const existing = db.prepare('SELECT id FROM users WHERE email = ?').get(normalizedEmail);
    if (existing) {
      return res.status(409).json({ error: 'An account with this email address already exists.' });
    }

    const passwordHash = hashPassword(password);
    const insert = db.prepare(`
      INSERT INTO users (email, password_hash, full_name)
      VALUES (?, ?, ?)
    `);
    const result = insert.run(normalizedEmail, passwordHash, full_name.trim());
    const userId = result.lastInsertRowid;

    const token = createSessionToken({
      userId,
      email: normalizedEmail,
      exp: Date.now() + 1000 * 60 * 60 * 24 * 7 // 7 days
    });

    res.cookie('session_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 1000 * 60 * 60 * 24 * 7
    });

    res.status(201).json({
      message: 'Account created successfully!',
      token,
      user: {
        id: userId,
        email: normalizedEmail,
        full_name: full_name.trim()
      }
    });
  } catch (err) {
    console.error('Registration error:', err);
    res.status(500).json({ error: 'Internal server error during registration.' });
  }
});

// Login
router.post('/login', (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required.' });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const user = db.prepare('SELECT * FROM users WHERE email = ?').get(normalizedEmail);

    if (!user || !verifyPassword(password, user.password_hash)) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    const token = createSessionToken({
      userId: user.id,
      email: user.email,
      exp: Date.now() + 1000 * 60 * 60 * 24 * 7
    });

    res.cookie('session_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 1000 * 60 * 60 * 24 * 7
    });

    res.json({
      message: 'Logged in successfully!',
      token,
      user: {
        id: user.id,
        email: user.email,
        full_name: user.full_name
      }
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Internal server error during login.' });
  }
});

// Firebase OAuth (Google / Social / Phone) Login & Sync
router.post('/firebase-login', async (req, res) => {
  try {
    const { email, full_name, uid, idToken } = req.body;

    if (!email && !uid) {
      return res.status(400).json({ error: 'Email or Firebase UID is required.' });
    }

    const normalizedEmail = (email || `${uid}@firebase.user`).trim().toLowerCase();
    const displayName = (full_name && full_name.trim()) || normalizedEmail.split('@')[0];

    // Check if user already exists
    let user = db.prepare('SELECT * FROM users WHERE email = ? OR firebase_uid = ?').get(normalizedEmail, uid || '');

    if (!user) {
      // Create new user account linked to Firebase
      // Store unguessable random hash to satisfy SQLite NOT NULL password_hash constraint
      const oauthDummyHash = 'OAUTH_FIREBASE_' + crypto.randomBytes(32).toString('hex');
      const insert = db.prepare(`
        INSERT INTO users (email, password_hash, full_name, firebase_uid)
        VALUES (?, ?, ?, ?)
      `);
      const result = insert.run(normalizedEmail, oauthDummyHash, displayName, uid || null);
      user = db.prepare('SELECT * FROM users WHERE id = ?').get(result.lastInsertRowid);
      console.log(`✨ Created new user via Firebase OAuth: ${normalizedEmail} (ID: ${user.id})`);
    } else {
      // Update firebase_uid if missing
      if (!user.firebase_uid && uid) {
        db.prepare('UPDATE users SET firebase_uid = ? WHERE id = ?').run(uid, user.id);
      }
    }

    // Issue standard secure session token
    const token = createSessionToken({
      userId: user.id,
      email: user.email,
      exp: Date.now() + 1000 * 60 * 60 * 24 * 7 // 7 days
    });

    res.cookie('session_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 1000 * 60 * 60 * 24 * 7
    });

    res.json({
      message: 'Firebase OAuth login successful!',
      token,
      user: {
        id: user.id,
        email: user.email,
        full_name: user.full_name
      }
    });
  } catch (err) {
    console.error('Firebase login error:', err);
    res.status(500).json({ error: 'Failed to process Firebase authentication.' });
  }
});

// Current User Profile
router.get('/me', requireAuth, (req, res) => {
  res.json({
    user: req.user
  });
});

// Logout
router.post('/logout', (req, res) => {
  res.clearCookie('session_token');
  res.json({ message: 'Logged out successfully.' });
});

module.exports = router;
