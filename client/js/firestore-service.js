/**
 * FIRESTORE SERVICE ENGINE — RIWAAYAT VENUE
 * Implements strict client-side Firestore access adhering to Firestore Security Rules.
 * 
 * Architecture Rules:
 * 1. "Rules are not filters": Queries must explicitly match security predicates (e.g. where("ownerId", "==", uid)).
 * 2. Public vs Private Segregation: Public visitors only read `events/{eventId}` where visibility == 'public'.
 * 3. Private data (credentials, unlisted guest lists) lives in `events/{eventId}/private/{docId}`.
 * 4. Submissions (RSVP & Guestbook) route through Cloud Function / Server Endpoint for rate-limiting & anti-spam.
 */

import { initializeApp, getApps, getApp } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-auth.js";
import { 
  getFirestore, 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  setDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy,
  serverTimestamp 
} from "https://www.gstatic.com/firebasejs/10.8.1/firebase-firestore.js";

// Initialize Firebase App
const firebaseConfig = {
  apiKey: "AIzaSyBgFCtxtFswlCUdmkKraJWo6TbTGrKC7Ac",
  authDomain: "wedding-28db4.firebaseapp.com",
  projectId: "wedding-28db4",
  storageBucket: "wedding-28db4.firebasestorage.app",
  messagingSenderId: "632488301739",
  appId: "1:632488301739:web:94b785b0aecc0c119193ee",
  measurementId: "G-DW6RSKTWKC"
};

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
export const auth = getAuth(app);
export const db = getFirestore(app);

export const FirestoreService = {
  /**
   * Fetch current user's isolated profile document (/users/{uid})
   */
  async getUserProfile(uid) {
    if (!auth.currentUser || auth.currentUser.uid !== uid) {
      throw new Error("Access denied: You can only read your own profile.");
    }
    const snap = await getDoc(doc(db, "users", uid));
    return snap.exists() ? { id: snap.id, ...snap.data() } : null;
  },

  /**
   * Save user profile (/users/{uid})
   */
  async saveUserProfile(uid, data) {
    if (!auth.currentUser || auth.currentUser.uid !== uid) {
      throw new Error("Access denied: You can only update your own profile.");
    }
    await setDoc(doc(db, "users", uid), {
      ...data,
      updatedAt: serverTimestamp()
    }, { merge: true });
  },

  /**
   * Create an event (/events/{eventId})
   * Enforces: request.resource.data.ownerId == request.auth.uid
   */
  async createEvent(eventId, eventData) {
    const user = auth.currentUser;
    if (!user) throw new Error("Authentication required to create an event.");

    const eventDocRef = doc(db, "events", eventId);
    const payload = {
      ...eventData,
      ownerId: user.uid, // Strictly locked to logged-in user
      visibility: eventData.visibility || "private", // 'private' | 'public'
      eventType: eventData.eventType || "indian-wedding", // 'indian-wedding' | 'muslim-wedding' | 'birthday'
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    };

    await setDoc(eventDocRef, payload);
    return { id: eventId, ...payload };
  },

  /**
   * Get events owned by the current user.
   * NOTE: "Rules are not filters" — rule permits read only if ownerId == auth.uid or visibility == 'public'.
   * Query must explicitly filter by ownerId.
   */
  async getMyEvents() {
    const user = auth.currentUser;
    if (!user) throw new Error("Authentication required.");

    const q = query(
      collection(db, "events"), 
      where("ownerId", "==", user.uid)
    );
    const snap = await getDocs(q);
    return snap.docs.map(d => ({ id: d.id, ...d.data() }));
  },

  /**
   * Read public event website details (names, dates, public itinerary, themes)
   * Allowed if visibility == "public" or canManage(eventId)
   */
  async getEvent(eventId) {
    const snap = await getDoc(doc(db, "events", eventId));
    if (!snap.exists()) return null;
    return { id: snap.id, ...snap.data() };
  },

  /**
   * Update event document.
   * Rule enforces: canManage(eventId) && request.resource.data.ownerId == resource.data.ownerId
   */
  async updateEvent(eventId, patchData) {
    const eventRef = doc(db, "events", eventId);
    // Ensure ownerId is never tampered
    delete patchData.ownerId;
    delete patchData.createdAt;

    await updateDoc(eventRef, {
      ...patchData,
      updatedAt: serverTimestamp()
    });
  },

  /**
   * Delete event (Strictly owner only)
   */
  async deleteEvent(eventId) {
    await deleteDoc(doc(db, "events", eventId));
  },

  /**
   * Invite a member with specific role (editor | viewer)
   * Stored at /events/{eventId}/members/{uid}
   */
  async addEventMember(eventId, memberUid, role = "editor") {
    const memberRef = doc(db, "events", eventId, "members", memberUid);
    await setDoc(memberRef, {
      role, // 'editor' | 'viewer'
      addedAt: serverTimestamp()
    });
  },

  /**
   * Private Document Partition:
   * Stored at /events/{eventId}/private/{docId}
   * Completely inaccessible to public visitors, accessible only to owner & editors.
   */
  async getPrivateSettings(eventId, docId = "settings") {
    const snap = await getDoc(doc(db, "events", eventId, "private", docId));
    return snap.exists() ? snap.data() : null;
  },

  async savePrivateSettings(eventId, docId = "settings", data = {}) {
    const ref = doc(db, "events", eventId, "private", docId);
    await setDoc(ref, {
      ...data,
      updatedAt: serverTimestamp()
    }, { merge: true });
  },

  /**
   * RSVPs - Read by Owner/Editor
   */
  async getRSVPs(eventId) {
    const rsvpCol = collection(db, "events", eventId, "rsvps");
    const snap = await getDocs(rsvpCol);
    return snap.docs.map(d => ({ id: d.id, ...d.data() }));
  },

  /**
   * Guestbook - Read by Owner/Editor
   */
  async getGuestbook(eventId) {
    const gbCol = collection(db, "events", eventId, "guestbook");
    const snap = await getDocs(gbCol);
    return snap.docs.map(d => ({ id: d.id, ...d.data() }));
  }
};

window.FirestoreService = FirestoreService;
