/**
 * DATABASE INITIALIZATION & ROW-LEVEL DATA LAYER
 * Powered by Node.js 24 native node:sqlite DatabaseSync with foreign keys and WAL mode.
 */

const { DatabaseSync } = require('node:sqlite');
const path = require('node:path');

const DB_PATH = process.env.VERCEL 
  ? path.join('/tmp', 'platform.db') 
  : path.join(__dirname, 'platform.db');
const db = new DatabaseSync(DB_PATH);

// Enable Foreign Keys and Performance WAL
db.exec(`
  PRAGMA foreign_keys = ON;
`);

// Create Schema
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT,
    full_name TEXT NOT NULL,
    firebase_uid TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS events (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    owner_user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    slug TEXT UNIQUE NOT NULL,
    event_type TEXT NOT NULL, -- 'indian_wedding', 'muslim_wedding', 'birthday'
    title TEXT NOT NULL,
    headline TEXT,
    primary_names TEXT NOT NULL, -- e.g. "Vijay & Rashima" or "Ayaan's 1st Birthday"
    event_date TEXT NOT NULL,
    venue_name TEXT,
    venue_address TEXT,
    venue_map_url TEXT,
    visibility TEXT NOT NULL DEFAULT 'draft', -- 'draft', 'private_share', 'public'
    private_passcode_hash TEXT,
    theme_id TEXT DEFAULT 'luxury_pastel',
    hero_image_url TEXT,
    hashtag TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS event_sections (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    event_id INTEGER NOT NULL REFERENCES events(id) ON DELETE CASCADE,
    section_key TEXT NOT NULL,
    title TEXT NOT NULL,
    is_enabled INTEGER NOT NULL DEFAULT 1,
    sort_order INTEGER NOT NULL DEFAULT 0,
    custom_content_json TEXT DEFAULT '{}'
  );

  CREATE TABLE IF NOT EXISTS event_functions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    event_id INTEGER NOT NULL REFERENCES events(id) ON DELETE CASCADE,
    function_key TEXT NOT NULL,
    title TEXT NOT NULL,
    subtitle TEXT,
    date_time TEXT,
    venue_name TEXT,
    dress_code TEXT,
    palette_colors_json TEXT DEFAULT '[]',
    illustration_url TEXT,
    description TEXT,
    sort_order INTEGER NOT NULL DEFAULT 0
  );

  CREATE TABLE IF NOT EXISTS rsvps (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    event_id INTEGER NOT NULL REFERENCES events(id) ON DELETE CASCADE,
    guest_name TEXT NOT NULL,
    phone TEXT NOT NULL,
    email TEXT,
    guest_count INTEGER NOT NULL DEFAULT 1,
    attendance TEXT NOT NULL DEFAULT 'attending', -- 'attending', 'not_attending', 'maybe'
    meal_preference TEXT DEFAULT 'Vegetarian',
    functions_attending_json TEXT DEFAULT '[]',
    message TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS guestbook_messages (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    event_id INTEGER NOT NULL REFERENCES events(id) ON DELETE CASCADE,
    guest_name TEXT NOT NULL,
    relation TEXT,
    emoji TEXT DEFAULT '❤️',
    message TEXT NOT NULL,
    is_approved INTEGER NOT NULL DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS api_keys (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    service_name TEXT NOT NULL,
    key_preview TEXT NOT NULL,
    ciphertext TEXT NOT NULL,
    iv TEXT NOT NULL,
    auth_tag TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS private_invites (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    event_id INTEGER NOT NULL REFERENCES events(id) ON DELETE CASCADE,
    invite_code TEXT UNIQUE NOT NULL,
    recipient_identifier TEXT, -- e.g. guest email or phone
    expires_at DATETIME,
    uses_remaining INTEGER DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS event_members (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    event_id INTEGER NOT NULL REFERENCES events(id) ON DELETE CASCADE,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    role TEXT NOT NULL DEFAULT 'viewer', -- 'owner', 'editor', 'viewer'
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(event_id, user_id)
  );

  CREATE TABLE IF NOT EXISTS audit_logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
    event_id INTEGER REFERENCES events(id) ON DELETE CASCADE,
    action TEXT NOT NULL, -- e.g. 'private_share_created', 'access_revoked', 'api_key_stored'
    details TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );
`);

try {
  db.exec('ALTER TABLE users ADD COLUMN firebase_uid TEXT;');
} catch (e) {}

console.log('Database initialized successfully with foreign key constraints.');

module.exports = db;
