/**
 * FIREBASE AUTHENTICATION MIDDLEWARE
 * Verifies Firebase ID Tokens using Firebase Admin SDK.
 * Auto-provisions the user profile in Firestore if absent to guarantee "User not found" never occurs.
 */

const { firebaseAdminAuth, firestore } = require('../config/firebaseAdmin');

async function requireFirebaseAuth(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        error: 'Please sign in to create your private event website.'
      });
    }

    const idToken = authHeader.split('Bearer ')[1].trim();
    if (!idToken) {
      return res.status(401).json({
        error: 'Please sign in to create your private event website.'
      });
    }

    // Verify token with Firebase Admin SDK (checkRevoked = true)
    let decodedToken;
    try {
      decodedToken = await firebaseAdminAuth.verifyIdToken(idToken, true);
    } catch (authErr) {
      return res.status(401).json({
        error: 'Authentication session expired or invalid. Please sign in again.'
      });
    }

    if (!decodedToken || !decodedToken.uid) {
      return res.status(401).json({
        error: 'Authentication failed. Invalid identity token.'
      });
    }

    // Derive verified user identity exclusively from the decoded token
    const uid = decodedToken.uid;
    const email = (decodedToken.email || `${uid}@firebase.user`).toLowerCase();
    const fullName = decodedToken.name || (decodedToken.email ? decodedToken.email.split('@')[0] : 'Riwaayat Host');

    // Automatically ensure user profile exists in Firestore users/{uid}
    const userDocRef = firestore.collection('users').doc(uid);
    try {
      const userSnap = await userDocRef.get();
      if (!userSnap.exists) {
        await userDocRef.set({
          uid,
          email,
          full_name: fullName,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }, { merge: true });
      }
    } catch (storeErr) {
      console.warn('Firestore profile sync note:', storeErr.message);
    }

    req.user = {
      uid,
      id: uid,
      email,
      full_name: fullName,
      email_verified: !!decodedToken.email_verified,
      tokenClaims: decodedToken
    };

    next();
  } catch (err) {
    console.error('requireFirebaseAuth unexpected error:', err.message);
    return res.status(401).json({
      error: 'Please sign in to access your event dashboard.'
    });
  }
}

// Optional Auth (for public routes that optionally enrich data if authenticated)
async function optionalFirebaseAuth(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const idToken = authHeader.split('Bearer ')[1].trim();
      if (idToken) {
        const decodedToken = await firebaseAdminAuth.verifyIdToken(idToken, false).catch(() => null);
        if (decodedToken && decodedToken.uid) {
          req.user = {
            uid: decodedToken.uid,
            id: decodedToken.uid,
            email: decodedToken.email,
            full_name: decodedToken.name,
            email_verified: !!decodedToken.email_verified,
            tokenClaims: decodedToken
          };
        }
      }
    }
  } catch (_) {}
  next();
}

module.exports = {
  requireFirebaseAuth,
  optionalFirebaseAuth
};
