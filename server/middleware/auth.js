/**
 * AUTHENTICATION MIDDLEWARE DELEGATOR
 * Points all authentication to Firebase Admin SDK ID token verification.
 * Eliminates legacy SQLite user table lookup and local JWTs.
 */

const { requireFirebaseAuth, optionalFirebaseAuth } = require('./requireFirebaseAuth');

module.exports = {
  requireAuth: requireFirebaseAuth,
  optionalAuth: optionalFirebaseAuth,
  requireFirebaseAuth,
  optionalFirebaseAuth
};
