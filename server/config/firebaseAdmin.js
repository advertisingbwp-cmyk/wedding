/**
 * FIREBASE ADMIN SDK INITIALIZATION
 * Connects securely to Firebase Authentication & Cloud Firestore.
 * Strictly avoids logging or exposing service account credentials, keys, or tokens.
 */

const admin = require('firebase-admin');

let firebaseAdminAuth = null;
let firestore = null;
let initialized = false;

// Mock provider used strictly in local automated test suites when environment variable is not present
function createMockFirebaseAdmin() {
  const usersStore = new Map();
  const collectionsStore = new Map(); // collectionName -> Map of docId -> data

  function getCollection(colPath) {
    if (!collectionsStore.has(colPath)) {
      collectionsStore.set(colPath, new Map());
    }
    return collectionsStore.get(colPath);
  }

  const mockAuth = {
    async verifyIdToken(idToken, checkRevoked = false) {
      if (!idToken || typeof idToken !== 'string') {
        const err = new Error('Decoding Firebase ID token failed. Invalid token.');
        err.code = 'auth/invalid-id-token';
        throw err;
      }
      if (idToken.startsWith('revoked-')) {
        const err = new Error('Firebase ID token has been revoked.');
        err.code = 'auth/id-token-revoked';
        throw err;
      }
      if (idToken.startsWith('expired-')) {
        const err = new Error('Firebase ID token has expired.');
        err.code = 'auth/id-token-expired';
        throw err;
      }

      // Handle test tokens formatted as "valid-<uid>" or JSON encoded tokens
      let uid = 'test-user-1';
      let email = 'testuser@riwaayat.com';
      let name = 'Riwaayat Test User';

      if (idToken.startsWith('valid-')) {
        uid = idToken.replace('valid-', '');
        email = `${uid}@riwaayat.com`;
        name = `User ${uid}`;
      } else {
        try {
          const parsed = JSON.parse(Buffer.from(idToken.split('.')[1] || idToken, 'base64').toString('utf8'));
          if (parsed.uid || parsed.user_id) uid = parsed.uid || parsed.user_id;
          if (parsed.email) email = parsed.email;
          if (parsed.name) name = parsed.name;
        } catch (_) {}
      }

      return {
        uid,
        user_id: uid,
        email,
        name,
        email_verified: true,
        auth_time: Math.floor(Date.now() / 1000),
        iat: Math.floor(Date.now() / 1000),
        exp: Math.floor(Date.now() / 1000) + 3600
      };
    },

    async getUser(uid) {
      return usersStore.get(uid) || { uid, email: `${uid}@riwaayat.com` };
    }
  };

  const mockFirestore = {
    collection(colName) {
      const col = getCollection(colName);
      return {
        doc(docId) {
          return {
            id: docId,
            collection(subColName) {
              return mockFirestore.collection(`${colName}/${docId}/${subColName}`);
            },
            async get() {
              const data = col.get(docId);
              return {
                id: docId,
                exists: !!data,
                data: () => (data ? { ...data } : undefined)
              };
            },
            async set(data, options = {}) {
              if (options.merge) {
                const existing = col.get(docId) || {};
                col.set(docId, { ...existing, ...data });
              } else {
                col.set(docId, { ...data });
              }
              return { writeTime: Date.now() };
            },
            async update(data) {
              const existing = col.get(docId);
              if (!existing) {
                throw new Error(`No document to update: ${colName}/${docId}`);
              }
              col.set(docId, { ...existing, ...data });
              return { writeTime: Date.now() };
            },
            async delete() {
              col.delete(docId);
              return { writeTime: Date.now() };
            }
          };
        },
        async get() {
          const docs = Array.from(col.entries()).map(([id, data]) => ({
            id,
            exists: true,
            data: () => ({ ...data })
          }));
          return { docs, empty: docs.length === 0, size: docs.length };
        },
        async add(data) {
          const autoId = `doc_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
          col.set(autoId, { ...data });
          return this.doc(autoId);
        },
        where(field, op, val) {
          return {
            async get() {
              const allDocs = Array.from(col.entries()).filter(([_, data]) => {
                if (op === '==') return data[field] === val;
                if (op === '!=') return data[field] !== val;
                return true;
              });
              const docs = allDocs.map(([id, data]) => ({
                id,
                exists: true,
                data: () => ({ ...data })
              }));
              return { docs, empty: docs.length === 0, size: docs.length };
            }
          };
        }
      };
    }
  };

  return {
    admin: {
      firestore: {
        FieldValue: {
          serverTimestamp: () => new Date().toISOString()
        }
      }
    },
    firebaseAdminAuth: mockAuth,
    firestore: mockFirestore
  };
}

function init() {
  if (initialized) {
    return;
  }

  const rawSecret = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;

  if (!rawSecret) {
    // In automated test environments without credentials, use the test mock
    if (process.env.NODE_ENV === 'test' || process.env.FIREBASE_ADMIN_MOCK === 'true') {
      const mock = createMockFirebaseAdmin();
      firebaseAdminAuth = mock.firebaseAdminAuth;
      firestore = mock.firestore;
      initialized = true;
      return;
    }
    throw new Error('Missing FIREBASE_SERVICE_ACCOUNT_JSON environment variable. Please configure it in your environment.');
  }

  let serviceAccount;
  try {
    serviceAccount = JSON.parse(rawSecret);
  } catch (_) {
    try {
      const decoded = Buffer.from(rawSecret, 'base64').toString('utf8');
      serviceAccount = JSON.parse(decoded);
    } catch (err) {
      throw new Error('Firebase Admin initialization failed: Invalid service account JSON format.');
    }
  }

  try {
    const app = admin.apps.length > 0
      ? admin.app()
      : admin.initializeApp({
          credential: admin.credential.cert(serviceAccount)
        });

    firebaseAdminAuth = app.auth();
    firestore = app.firestore();
    initialized = true;
  } catch (err) {
    throw new Error('Firebase Admin initialization failed: Could not initialize with provided credentials.');
  }
}

// Initialize on first access
init();

module.exports = {
  admin,
  get firebaseAdminAuth() {
    if (!initialized) init();
    return firebaseAdminAuth;
  },
  get firestore() {
    if (!initialized) init();
    return firestore;
  },
  init
};
