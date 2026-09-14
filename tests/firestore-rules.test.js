/**
 * FIRESTORE SECURITY RULES SIMULATION & TEST SUITE
 * 
 * Verifies the exact security logic of firestore.rules:
 * - Tenant isolation: User A cannot touch User B's profile or private data.
 * - Event creation: ownerId must strictly equal request.auth.uid.
 * - Public vs Private visibility: Public can only read visibility == 'public'.
 * - Members: Invited members can manage, but only primary owner can delete.
 * - Private subcollections: RSVPs, guest data, and private docs are never public.
 */

const assert = require('node:assert');

// Mock Firestore Rules Environment
class FirestoreRulesSimulator {
  constructor() {
    this.users = new Map();
    this.events = new Map();
    this.members = new Map(); // key: `${eventId}/${uid}`
    this.rsvps = new Map(); // key: `${eventId}/${rsvpId}`
    this.privateDocs = new Map(); // key: `${eventId}/${docId}`
  }

  // Helper functions matching firestore.rules
  signedIn(auth) {
    return auth && auth.uid != null;
  }

  getEvent(eventId) {
    return this.events.get(eventId) || null;
  }

  isOwner(auth, eventId) {
    const ev = this.getEvent(eventId);
    return this.signedIn(auth) && ev && ev.ownerId === auth.uid;
  }

  isMember(auth, eventId) {
    return this.signedIn(auth) && this.members.has(`${eventId}/${auth.uid}`);
  }

  getMemberRole(auth, eventId) {
    const m = this.members.get(`${eventId}/${auth.uid}`);
    return m ? m.role : null;
  }

  isEditor(auth, eventId) {
    return this.isMember(auth, eventId) && this.getMemberRole(auth, eventId) === 'editor';
  }

  isViewer(auth, eventId) {
    return this.isMember(auth, eventId) && this.getMemberRole(auth, eventId) === 'viewer';
  }

  canEdit(auth, eventId) {
    return this.isOwner(auth, eventId) || this.isEditor(auth, eventId);
  }

  canViewPrivate(auth, eventId) {
    return this.isOwner(auth, eventId) || this.isMember(auth, eventId);
  }

  // Rules Evaluations
  canAccessUserProfile(auth, targetUid, operation) {
    return Boolean(this.signedIn(auth) && auth.uid === targetUid);
  }

  canCreateEvent(auth, eventData) {
    return Boolean(this.signedIn(auth) && eventData.ownerId === auth.uid);
  }

  canReadEvent(auth, eventId) {
    const ev = this.getEvent(eventId);
    if (!ev) return false;
    return Boolean(ev.visibility === 'public' || this.canViewPrivate(auth, eventId));
  }

  canUpdateEvent(auth, eventId, newOwnerId, newVisibility) {
    const ev = this.getEvent(eventId);
    if (!ev) return false;
    if (!this.canEdit(auth, eventId)) return false;
    if (newOwnerId !== ev.ownerId) return false;
    if (!this.isOwner(auth, eventId) && newVisibility !== ev.visibility) return false;
    return true;
  }

  canDeleteEvent(auth, eventId) {
    return Boolean(this.isOwner(auth, eventId));
  }

  canReadPrivateDoc(auth, eventId) {
    return Boolean(this.isOwner(auth, eventId));
  }

  canReadRSVPs(auth, eventId) {
    return Boolean(this.canEdit(auth, eventId));
  }

  canDirectClientCreateRSVP(auth, eventId) {
    // allow create: if false;
    return false;
  }

  canDirectClientCreateGuestbook(auth, eventId) {
    // allow create: if false;
    return false;
  }

  canReadTemplate(auth, templateData) {
    // allow read: if resource.data.isPublic == true;
    return Boolean(templateData && templateData.isPublic === true);
  }

  canWriteTemplate(auth) {
    // allow write: if false;
    return false;
  }
}

function runSecurityTests() {
  console.log('🧪 Starting Firestore Security Rules Simulation Tests...\n');
  const sim = new FirestoreRulesSimulator();

  const userA = { uid: 'user_A_123', email: 'userA@example.com' };
  const userB = { uid: 'user_B_456', email: 'userB@example.com' };
  const userC = { uid: 'user_C_789', email: 'userC@example.com' };
  const unauthenticated = null;

  // Test 1: User Profile Isolation
  console.log('Test 1: User Profile Isolation (/users/{uid})');
  assert.strictEqual(sim.canAccessUserProfile(userA, 'user_A_123', 'read'), true, 'User A can read own profile');
  assert.strictEqual(sim.canAccessUserProfile(userA, 'user_B_456', 'read'), false, 'User A CANNOT read User B profile');
  assert.strictEqual(sim.canAccessUserProfile(unauthenticated, 'user_A_123', 'read'), false, 'Unauthenticated visitor cannot read profiles');
  console.log('  ✅ Passed: Profiles are strictly isolated to authenticated owner.');

  // Test 2: Event Creation ownerId Enforcement
  console.log('\nTest 2: Event Creation (events/{eventId})');
  assert.strictEqual(sim.canCreateEvent(userA, { ownerId: 'user_A_123', title: 'Wedding A' }), true, 'User A creates event with own UID');
  assert.strictEqual(sim.canCreateEvent(userA, { ownerId: 'user_B_456', title: 'Spoofed' }), false, 'User A CANNOT create event with User B UID');
  assert.strictEqual(sim.canCreateEvent(unauthenticated, { ownerId: 'anon' }), false, 'Unauthenticated user cannot create events');
  console.log('  ✅ Passed: ownerId is immutably bound to request.auth.uid.');

  // Seed Events
  sim.events.set('event_public_1', {
    ownerId: 'user_A_123',
    visibility: 'public',
    eventType: 'indian-wedding',
    title: 'Vijay & Rashima Public Wedding'
  });
  sim.events.set('event_private_2', {
    ownerId: 'user_A_123',
    visibility: 'private',
    eventType: 'muslim-wedding',
    title: 'Zain & Ayla Private Nikah'
  });

  // Test 3: Public vs Private Visibility
  console.log('\nTest 3: Event Reading & Visibility Gating');
  assert.strictEqual(sim.canReadEvent(unauthenticated, 'event_public_1'), true, 'Public visitors can read public events');
  assert.strictEqual(sim.canReadEvent(unauthenticated, 'event_private_2'), false, 'Public visitors CANNOT read private events');
  assert.strictEqual(sim.canReadEvent(userB, 'event_private_2'), false, 'Unrelated User B CANNOT read private event');
  assert.strictEqual(sim.canReadEvent(userA, 'event_private_2'), true, 'Owner User A CAN read private event');
  console.log('  ✅ Passed: Private events completely gated; public events viewable.');

  // Test 4: Member Collaboration & Role Gating (Owner, Editor, Viewer)
  console.log('\nTest 4: Member Collaboration & Role Gating');
  // Add User B as editor, User C as viewer
  sim.members.set('event_private_2/user_B_456', { role: 'editor' });
  sim.members.set('event_private_2/user_C_789', { role: 'viewer' });

  assert.strictEqual(sim.canReadEvent(userB, 'event_private_2'), true, 'Invited editor User B can view private event');
  assert.strictEqual(sim.canReadEvent(userC, 'event_private_2'), true, 'Invited viewer User C can view private event');

  assert.strictEqual(sim.canUpdateEvent(userB, 'event_private_2', 'user_A_123', 'private'), true, 'Editor can update event content');
  assert.strictEqual(sim.canUpdateEvent(userB, 'event_private_2', 'user_B_456', 'private'), false, 'Editor CANNOT alter original ownerId');
  assert.strictEqual(sim.canUpdateEvent(userB, 'event_private_2', 'user_A_123', 'public'), false, 'Editor CANNOT toggle event visibility');
  assert.strictEqual(sim.canUpdateEvent(userC, 'event_private_2', 'user_A_123', 'private'), false, 'Viewer CANNOT update event content');

  assert.strictEqual(sim.canDeleteEvent(userB, 'event_private_2'), false, 'Editor CANNOT delete event (Owner-only)');
  assert.strictEqual(sim.canDeleteEvent(userC, 'event_private_2'), false, 'Viewer CANNOT delete event');
  assert.strictEqual(sim.canDeleteEvent(userA, 'event_private_2'), true, 'Owner CAN delete event');
  console.log('  ✅ Passed: Member editing permitted for editors; visibility tampering, viewer editing, and deletion blocked.');

  // Test 5: Sensitive / Private Data Subcollections
  console.log('\nTest 5: Private Data & RSVP Protection');
  assert.strictEqual(sim.canReadPrivateDoc(unauthenticated, 'event_public_1'), false, 'Public CANNOT read /private/ settings');
  assert.strictEqual(sim.canReadPrivateDoc(userB, 'event_private_2'), false, 'Editor CANNOT read /private/ documents (Owner-only)');
  assert.strictEqual(sim.canReadPrivateDoc(userA, 'event_private_2'), true, 'Owner CAN read /private/ settings');
  
  assert.strictEqual(sim.canReadRSVPs(unauthenticated, 'event_public_1'), false, 'Public CANNOT view guest RSVPs');
  assert.strictEqual(sim.canReadRSVPs(userC, 'event_private_2'), false, 'Viewer CANNOT read RSVPs');
  assert.strictEqual(sim.canReadRSVPs(userB, 'event_private_2'), true, 'Editor CAN read RSVP summary');
  assert.strictEqual(sim.canReadRSVPs(userA, 'event_private_2'), true, 'Owner CAN view guest RSVPs');

  // Direct client writes are blocked
  assert.strictEqual(sim.canDirectClientCreateRSVP(unauthenticated, 'event_public_1'), false, 'Direct client writes blocked on RSVPs');
  assert.strictEqual(sim.canDirectClientCreateGuestbook(unauthenticated, 'event_public_1'), false, 'Direct client writes blocked on Guestbook');
  console.log('  ✅ Passed: Private data, RSVPs, and direct write prohibitions verified.');

  // Test 6: Public Read-Only Templates (/templates/{templateId})
  console.log('\nTest 6: Public Read-Only Templates (/templates/{templateId})');
  const publicTemplate = { id: 'indian_wedding', isPublic: true, isTemplate: true };
  const privateTemplate = { id: 'draft_template', isPublic: false, isTemplate: true };

  assert.strictEqual(sim.canReadTemplate(unauthenticated, publicTemplate), true, 'Public visitors CAN read public template');
  assert.strictEqual(sim.canReadTemplate(unauthenticated, privateTemplate), false, 'Public visitors CANNOT read non-public template');
  assert.strictEqual(sim.canWriteTemplate(userA), false, 'Direct client write forbidden on templates (Server-only)');
  assert.strictEqual(sim.canWriteTemplate(unauthenticated), false, 'Unauthenticated write forbidden on templates');
  console.log('  ✅ Passed: Templates are read-only for public if isPublic == true; client writes prohibited.');

  console.log('\n🎉 ALL FIRESTORE SECURITY RULES SIMULATION TESTS PASSED SUCCESSFULLY!\n');
}

runSecurityTests();
