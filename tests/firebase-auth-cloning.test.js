/**
 * FIREBASE AUTHENTICATION & TEMPLATE ONBOARDING TEST SUITE
 * Verifies:
 * 1. Firebase ID Token Verification via Firebase Admin SDK
 * 2. Auto-provisioning of users/{uid} (never returning "User not found")
 * 3. Public template preview without login (no sensitive data exposed)
 * 4. 1-Click template cloning into user-owned draft event in Firestore
 * 5. Data isolation: no private data, RSVPs, or attendee details copied
 */

const assert = require('node:assert');
const http = require('node:http');

// Set test environment flag for Firebase Admin Mock
process.env.NODE_ENV = 'test';
process.env.FIREBASE_ADMIN_MOCK = 'true';

const app = require('../server/app');
const FirestoreStore = require('../server/services/firestoreStore');
const { firestore } = require('../server/config/firebaseAdmin');

async function runSuite() {
  console.log('🚀 Running Firebase Authentication & Template Onboarding Test Suite...\n');

  const server = http.createServer(app);
  await new Promise((resolve) => server.listen(0, resolve));
  const port = server.address().port;
  const baseUrl = `http://localhost:${port}`;

  try {
    // -------------------------------------------------------------
    // Test 1: Public Template Preview (No Auth Required)
    // -------------------------------------------------------------
    console.log('Test 1: Public Template Preview without Authentication');
    const tplListRes = await fetch(`${baseUrl}/api/templates`);
    assert.strictEqual(tplListRes.status, 200, 'GET /api/templates should succeed without auth');
    const tplListData = await tplListRes.json();
    assert.strictEqual(Array.isArray(tplListData.templates), true, 'Templates list is an array');
    assert.strictEqual(tplListData.templates.length, 18, 'Must have 18 curated templates');
    console.log(`  ✅ Passed: Exactly 18 canonical templates listed (${tplListData.templates.map(t => t.id).slice(0, 5).join(', ')}...)`);

    // Test filter by type
    const indianListRes = await fetch(`${baseUrl}/api/templates?type=indian_wedding`);
    const indianListData = await indianListRes.json();
    assert.strictEqual(indianListData.templates.length, 8, 'Must have 8 Indian Wedding templates');
    console.log('  ✅ Passed: Type filtering returns 8 Indian Wedding templates');

    const muslimListRes = await fetch(`${baseUrl}/api/templates?type=muslim_wedding`);
    const muslimListData = await muslimListRes.json();
    assert.strictEqual(muslimListData.templates.length, 6, 'Must have 6 Muslim Wedding templates');
    console.log('  ✅ Passed: Type filtering returns 6 Muslim Wedding templates');

    const bdayListRes = await fetch(`${baseUrl}/api/templates?type=birthday`);
    const bdayListData = await bdayListRes.json();
    assert.strictEqual(bdayListData.templates.length, 4, 'Must have 4 Birthday templates');
    console.log('  ✅ Passed: Type filtering returns 4 Birthday templates');

    for (const tplId of ['royal_mandap', 'noor_nikah', 'pastel_party', 'indian_wedding']) {
      const previewRes = await fetch(`${baseUrl}/api/templates/${tplId}`);
      assert.strictEqual(previewRes.status, 200, `GET /api/templates/${tplId} should return 200`);
      const previewData = await previewRes.json();
      assert.strictEqual(previewData.template.isPublic, true, 'Template is public');
      assert.strictEqual(previewData.template.isTemplate, true, 'Template is marked as template');
      assert.strictEqual(Array.isArray(previewData.sections), true, 'Has sections array');
      assert.strictEqual(Array.isArray(previewData.functions), true, 'Has functions array');

      // Security check: no private info exposed
      assert.strictEqual(previewData.rsvps, undefined, 'RSVPs must NOT be exposed in preview');
      assert.strictEqual(previewData.api_keys, undefined, 'API keys must NOT be exposed in preview');
      assert.strictEqual(previewData.invites, undefined, 'Private invites must NOT be exposed');
    }
    console.log('  ✅ Passed: Canonical and legacy templates preview without login and expose zero sensitive data.');

    // -------------------------------------------------------------
    // Test 2: Firebase ID Token Authentication & Auto-Profile Provisioning
    // -------------------------------------------------------------
    console.log('\nTest 2: Firebase ID Token Verification & Profile Auto-Upsert (/api/auth/firebase-login)');
    
    // Missing token returns 400
    const emptyRes = await fetch(`${baseUrl}/api/auth/firebase-login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({})
    });
    assert.strictEqual(emptyRes.status, 400, 'Empty idToken must return 400');

    // Valid Firebase ID Token
    const testUid = 'firebase_user_xyz_789';
    const validToken = `valid-${testUid}`;
    const loginRes = await fetch(`${baseUrl}/api/auth/firebase-login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ idToken: validToken })
    });
    assert.strictEqual(loginRes.status, 200, 'Valid Firebase token must return 200');
    const loginData = await loginRes.json();
    assert.strictEqual(loginData.user.uid, testUid, 'User UID derived exclusively from token');
    assert.strictEqual(loginData.user.email, `${testUid}@riwaayat.com`, 'User email derived from token');

    // Verify user profile document exists in Cloud Firestore at users/{uid}
    const userDocSnap = await firestore.collection('users').doc(testUid).get();
    assert.strictEqual(userDocSnap.exists, true, 'users/{uid} document must exist in Firestore');
    assert.strictEqual(userDocSnap.data().uid, testUid, 'Profile UID matches');
    console.log('  ✅ Passed: Verified token creates/upserts profile in users/{uid}; "User not found" is impossible.');

    // -------------------------------------------------------------
    // Test 3: requireFirebaseAuth Middleware Protection
    // -------------------------------------------------------------
    console.log('\nTest 3: requireFirebaseAuth Middleware Enforcement');
    
    // Unauthorized request to /api/auth/me returns 401
    const unauthMe = await fetch(`${baseUrl}/api/auth/me`);
    assert.strictEqual(unauthMe.status, 401, 'Request without Bearer token must return 401');

    // Invalid token returns 401
    const invalidMe = await fetch(`${baseUrl}/api/auth/me`, {
      headers: { 'Authorization': 'Bearer revoked-token-123' }
    });
    assert.strictEqual(invalidMe.status, 401, 'Revoked token must return 401');

    // Valid Bearer token succeeds and returns Firestore profile
    const authMe = await fetch(`${baseUrl}/api/auth/me`, {
      headers: { 'Authorization': `Bearer ${validToken}` }
    });
    assert.strictEqual(authMe.status, 200, 'Valid Bearer token must succeed');
    const meData = await authMe.json();
    assert.strictEqual(meData.user.uid, testUid, 'req.user.uid matches verified token');
    console.log('  ✅ Passed: requireFirebaseAuth verifies Bearer token and attaches verified user.');

    // -------------------------------------------------------------
    // Test 4: Automatic Template Cloning (POST /api/templates/:templateId/clone)
    // -------------------------------------------------------------
    console.log('\nTest 4: Automatic Template Cloning to User-Owned Draft Event');

    // Unauthenticated clone attempt returns 401
    const unauthClone = await fetch(`${baseUrl}/api/templates/indian_wedding/clone`, {
      method: 'POST'
    });
    assert.strictEqual(unauthClone.status, 401, 'Cloning requires verified Firebase authentication');

    // Authenticated clone creates draft event in Firestore
    const cloneRes = await fetch(`${baseUrl}/api/templates/indian_wedding/clone`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${validToken}`,
        'Content-Type': 'application/json'
      }
    });
    assert.strictEqual(cloneRes.status, 201, 'Cloning must return 201 Created');
    const cloneData = await cloneRes.json();
    assert.ok(cloneData.eventId, 'Must return new event ID');
    assert.ok(cloneData.slug, 'Must return new event slug');
    assert.ok(
      cloneData.message.includes('Your template is ready. Add your names, date, venue, photos'),
      'Must return user-facing onboarding message'
    );

    // Verify Firestore event document
    const eventDoc = await firestore.collection('events').doc(cloneData.eventId).get();
    assert.strictEqual(eventDoc.exists, true, 'Event must exist in Firestore');
    const eventData = eventDoc.data();
    assert.strictEqual(eventData.ownerId, testUid, 'Event ownerId must strictly equal user.uid');
    assert.strictEqual(eventData.visibility, 'draft', 'Cloned event must start in draft visibility');
    assert.strictEqual(eventData.isTemplate, false, 'Cloned event isTemplate must be false');
    assert.strictEqual(eventData.eventType, 'indian_wedding', 'Event type matches template');

    // Verify subcollections were copied
    const sectionsSnap = await firestore.collection('events').doc(cloneData.eventId).collection('sections').get();
    assert.strictEqual(sectionsSnap.docs.length > 0, true, 'Sections subcollection must be populated');

    const functionsSnap = await firestore.collection('events').doc(cloneData.eventId).collection('functions').get();
    assert.strictEqual(functionsSnap.docs.length > 0, true, 'Functions subcollection must be populated');

    // Verify NO attendee/RSVP/guestbook/private data was copied
    const rsvpSnap = await firestore.collection('events').doc(cloneData.eventId).collection('rsvps').get();
    assert.strictEqual(rsvpSnap.docs.length, 0, 'No RSVP data must be copied from template');

    const gbSnap = await firestore.collection('events').doc(cloneData.eventId).collection('guestbook').get();
    assert.strictEqual(gbSnap.docs.length, 0, 'No guestbook data must be copied from template');

    console.log(`  ✅ Passed: Cloned template into event ${cloneData.eventId} owned by ${testUid} (draft mode, zero private data copied).`);

    // -------------------------------------------------------------
    // Test 5: Cloned Event Retrieval via Events API
    // -------------------------------------------------------------
    console.log('\nTest 5: Cloned Event Retrieval via Events API (/api/events)');
    const listRes = await fetch(`${baseUrl}/api/events`, {
      headers: { 'Authorization': `Bearer ${validToken}` }
    });
    assert.strictEqual(listRes.status, 200, 'GET /api/events must return 200');
    const listData = await listRes.json();
    assert.ok(Array.isArray(listData.events), 'Events list is array');
    const foundEvent = listData.events.find(e => e.id === cloneData.eventId);
    assert.ok(foundEvent, 'Cloned event must be present in user events list');
    assert.strictEqual(foundEvent.ownerId, testUid, 'Owner ID matches');
    console.log('  ✅ Passed: User events list immediately displays cloned celebration.');

    console.log('\n🎉 ALL FIREBASE AUTHENTICATION & TEMPLATE ONBOARDING TESTS PASSED SUCCESSFULLY!\n');
  } finally {
    server.close();
  }
}

runSuite().catch((err) => {
  console.error('❌ Test suite failed:', err);
  process.exit(1);
});
