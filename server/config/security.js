/**
 * SECURITY & CRYPTOGRAPHY ENGINE
 * Enforces AES-256-GCM encryption for API keys at rest,
 * PBKDF2 password hashing, and cryptographically secure tokens.
 */

const crypto = require('node:crypto');

// Master encryption key derived from environment or secure machine seed
const MASTER_SECRET = process.env.APP_SECRET || 'antigravity-event-platform-ultra-secure-key-2026-xyz!';
const AES_KEY = crypto.createHash('sha256').update(MASTER_SECRET).digest(); // 32 bytes for AES-256

/**
 * Hash password securely with PBKDF2
 */
function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.pbkdf2Sync(password, salt, 100000, 64, 'sha512').toString('hex');
  return `${salt}:${hash}`;
}

/**
 * Verify password with constant-time equality
 */
function verifyPassword(password, stored) {
  try {
    const [salt, originalHash] = stored.split(':');
    if (!salt || !originalHash) return false;
    const testHash = crypto.pbkdf2Sync(password, salt, 100000, 64, 'sha512').toString('hex');
    return crypto.timingSafeEqual(Buffer.from(testHash, 'hex'), Buffer.from(originalHash, 'hex'));
  } catch (err) {
    return false;
  }
}

/**
 * Encrypt sensitive third-party API key at rest using AES-256-GCM
 */
function encryptApiKey(plainKey) {
  const iv = crypto.randomBytes(12); // 96-bit IV recommended for GCM
  const cipher = crypto.createCipheriv('aes-256-gcm', AES_KEY, iv);
  let encrypted = cipher.update(plainKey, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  const authTag = cipher.getAuthTag().toString('hex');
  return {
    ciphertext: encrypted,
    iv: iv.toString('hex'),
    authTag: authTag
  };
}

/**
 * Decrypt API key (used strictly inside backend when calling third-party services)
 */
function decryptApiKey(ciphertext, ivHex, authTagHex) {
  try {
    const decipher = crypto.createDecipheriv('aes-256-gcm', AES_KEY, Buffer.from(ivHex, 'hex'));
    decipher.setAuthTag(Buffer.from(authTagHex, 'hex'));
    let decrypted = decipher.update(ciphertext, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
  } catch (err) {
    console.error('API key decryption failed:', err.message);
    return null;
  }
}

/**
 * Mask API key for secure dashboard display (e.g. sk-••••••••1234)
 */
function maskApiKey(key) {
  if (!key) return '';
  const trimmed = key.trim();
  if (trimmed.length <= 8) return '••••' + trimmed.slice(-2);
  const prefix = trimmed.slice(0, 3);
  const suffix = trimmed.slice(-4);
  return `${prefix}••••••••${suffix}`;
}

/**
 * Generate cryptographically random secure token / invite code
 */
function generateSecureToken(bytes = 24) {
  return crypto.randomBytes(bytes).toString('hex');
}

/**
 * Simple secure session token signing and verification
 */
function createSessionToken(payload) {
  const data = Buffer.from(JSON.stringify(payload)).toString('base64url');
  const hmac = crypto.createHmac('sha256', MASTER_SECRET).update(data).digest('base64url');
  return `${data}.${hmac}`;
}

function verifySessionToken(token) {
  if (!token || typeof token !== 'string') return null;
  const parts = token.split('.');
  if (parts.length !== 2) return null;
  const [data, signature] = parts;
  const expectedSig = crypto.createHmac('sha256', MASTER_SECRET).update(data).digest('base64url');
  if (crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expectedSig))) {
    try {
      const decoded = JSON.parse(Buffer.from(data, 'base64url').toString('utf8'));
      if (decoded.exp && decoded.exp < Date.now()) return null;
      return decoded;
    } catch {
      return null;
    }
  }
  return null;
}

module.exports = {
  hashPassword,
  verifyPassword,
  encryptApiKey,
  decryptApiKey,
  maskApiKey,
  generateSecureToken,
  createSessionToken,
  verifySessionToken
};
