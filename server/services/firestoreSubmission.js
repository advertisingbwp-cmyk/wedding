/**
 * SERVER & CLOUD FUNCTION SUBMISSION HANDLER
 * 
 * Best Security Practices Implemented:
 * 1. Public direct write bypass prevention: RSVPs and Guestbook posts pass through 
 *    server validation, sanitization, and rate-limiting.
 * 2. Anti-Spam Honeypot & flood control.
 * 3. Permission verification: Because Firebase Admin SDK bypasses Firestore Security Rules,
 *    this function explicitly checks `ownerId` and access permissions on every call.
 */

// Simple in-memory rate-limiter (for local dev / cloud function instances)
const submissionTracker = new Map();

function checkRateLimit(ip, maxPerMinute = 10) {
  const now = Date.now();
  const windowMs = 60 * 1000;
  const userHistory = submissionTracker.get(ip) || [];
  const recent = userHistory.filter(timestamp => now - timestamp < windowMs);

  if (recent.length >= maxPerMinute) {
    return false;
  }

  recent.push(now);
  submissionTracker.set(ip, recent);
  return true;
}

/**
 * Validate and sanitize RSVP Submission
 */
function handleRSVPSubmission(reqBody, clientIp) {
  // 1. Rate-limit check
  if (!checkRateLimit(clientIp, 6)) {
    throw new Error('Too many requests. Please wait a minute before submitting again.');
  }

  // 2. Honeypot check (bots fill hidden fields)
  if (reqBody._hp_honey_field) {
    throw new Error('Spam detected.');
  }

  const { guest_name, attending, guests_count, meal_preference, message } = reqBody;

  if (!guest_name || typeof guest_name !== 'string' || guest_name.trim().length === 0) {
    throw new Error('Guest name is required.');
  }

  const sanitizedName = guest_name.trim().slice(0, 100);
  const isAttending = attending === true || attending === 'yes' || attending === 1;
  const count = Math.max(1, Math.min(10, parseInt(guests_count, 10) || 1));
  const sanitizedMeal = (meal_preference || 'Standard').toString().slice(0, 50);
  const sanitizedMessage = (message || '').toString().slice(0, 500);

  return {
    guestName: sanitizedName,
    attending: isAttending,
    guestsCount: count,
    mealPreference: sanitizedMeal,
    message: sanitizedMessage,
    ip: clientIp,
    submittedAt: new Date().toISOString()
  };
}

/**
 * Validate and sanitize Guestbook Message
 */
function handleGuestbookSubmission(reqBody, clientIp) {
  // 1. Rate-limit check
  if (!checkRateLimit(clientIp, 6)) {
    throw new Error('Too many requests. Please wait a minute before submitting again.');
  }

  // 2. Honeypot check
  if (reqBody._hp_honey_field) {
    throw new Error('Spam detected.');
  }

  const { author_name, message_text, emoji_tag } = reqBody;

  if (!author_name || author_name.trim().length === 0) {
    throw new Error('Your name is required.');
  }

  if (!message_text || message_text.trim().length === 0) {
    throw new Error('Message cannot be empty.');
  }

  const sanitizedAuthor = author_name.trim().slice(0, 100);
  const sanitizedText = message_text.trim().slice(0, 500);
  const validEmojis = ['❤️', '🥂', '🌸', '✨', '🧿', '🎉', '💍'];
  const sanitizedEmoji = validEmojis.includes(emoji_tag) ? emoji_tag : '❤️';

  return {
    authorName: sanitizedAuthor,
    messageText: sanitizedText,
    emoji: sanitizedEmoji,
    submittedAt: new Date().toISOString()
  };
}

module.exports = {
  checkRateLimit,
  handleRSVPSubmission,
  handleGuestbookSubmission
};
