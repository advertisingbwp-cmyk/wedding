/**
 * AUTHENTICATION ROUTES — RIWAAYAT VENUE
 * Exclusively uses Firebase Authentication and Cloud Firestore via Firebase Admin SDK.
 * Local SQLite user/password tables and custom JWT sessions are eliminated for production.
 */

const express = require('express');
const router = express.Router();
const { firebaseAdminAuth, firestore } = require('../config/firebaseAdmin');
const { requireFirebaseAuth } = require('../middleware/requireFirebaseAuth');

// POST /api/auth/firebase-login
// Verifies client Firebase ID token, auto-upserts users/{uid} in Firestore, returns authenticated profile
router.post('/firebase-login', async (req, res) => {
  try {
    const { idToken } = req.body;

    if (!idToken || typeof idToken !== 'string') {
      return res.status(400).json({ error: 'Firebase ID token is required.' });
    }

    // Verify token with Firebase Admin SDK (revocation check active)
    let decodedToken;
    try {
      decodedToken = await firebaseAdminAuth.verifyIdToken(idToken, true);
    } catch (verifyErr) {
      console.error('Firebase token verification error:', verifyErr.message);
      return res.status(401).json({
        error: 'Authentication failed. Invalid or expired token. Please sign in again.'
      });
    }

    if (!decodedToken || !decodedToken.uid) {
      return res.status(401).json({ error: 'Authentication failed: Token missing user UID.' });
    }

    // Never trust browser-sent fields; derive exclusively from verified claims
    const uid = decodedToken.uid;
    const email = (decodedToken.email || `${uid}@firebase.user`).toLowerCase();
    const fullName = decodedToken.name || (decodedToken.email ? decodedToken.email.split('@')[0] : 'Riwaayat Host');
    const emailVerified = !!decodedToken.email_verified;

    // Upsert user profile into Cloud Firestore at users/{uid}
    const userDocRef = firestore.collection('users').doc(uid);
    const existingSnap = await userDocRef.get().catch(() => null);

    const userProfile = {
      uid,
      id: uid,
      email,
      full_name: fullName,
      email_verified: emailVerified,
      updated_at: new Date().toISOString()
    };

    if (!existingSnap || !existingSnap.exists) {
      userProfile.created_at = new Date().toISOString();
      await userDocRef.set(userProfile);
    } else {
      await userDocRef.set(userProfile, { merge: true });
    }

    res.json({
      message: 'Your account is ready.',
      user: {
        id: uid,
        uid,
        email,
        full_name: fullName,
        email_verified: emailVerified
      }
    });
  } catch (err) {
    console.error('Firebase login error:', err.message);
    res.status(500).json({ error: 'We could not process your sign in. Please try again.' });
  }
});

// GET /api/auth/me - Current verified Firebase user profile
router.get('/me', requireFirebaseAuth, async (req, res) => {
  try {
    const uid = req.user.uid;
    const userDocRef = firestore.collection('users').doc(uid);
    const snap = await userDocRef.get();

    if (!snap.exists) {
      // Auto-provision profile so "User not found" is impossible
      const profile = {
        uid,
        id: uid,
        email: req.user.email,
        full_name: req.user.full_name,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      await userDocRef.set(profile);
      return res.json({ user: profile });
    }

    res.json({
      user: {
        id: uid,
        ...snap.data()
      }
    });
  } catch (err) {
    console.error('Fetch profile error:', err.message);
    res.status(500).json({ error: 'Failed to retrieve profile.' });
  }
});

// POST /api/auth/logout
router.post('/logout', (req, res) => {
  res.clearCookie('session_token');
  res.json({ message: 'Logged out successfully.' });
});

// Deprecated old SQLite auth endpoints redirect users to Firebase Auth
router.post('/login', (req, res) => {
  res.status(400).json({ error: 'Please use Firebase Authentication to sign in.' });
});

router.post('/register', (req, res) => {
  res.status(400).json({ error: 'Please use Firebase Authentication to create an account.' });
});

module.exports = router;
