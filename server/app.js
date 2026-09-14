/**
 * MAIN SERVER ENTRY POINT
 * Premium Multi-Tenant Event Website Builder Platform
 */

const express = require('express');
const cors = require('cors');
const path = require('node:path');

const authRoutes = require('./routes/auth');
const eventRoutes = require('./routes/events');
const rsvpRoutes = require('./routes/rsvp');
const guestbookRoutes = require('./routes/guestbook');
const sharingRoutes = require('./routes/sharing');
const apiKeysRoutes = require('./routes/apiKeys');
const publicEventRoutes = require('./routes/publicEvent');
const templateRoutes = require('./routes/templates');

const app = express();
const PORT = process.env.PORT || 4000;

// Security & Parsing Middleware
app.use(cors({ origin: true, credentials: true }));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Static Assets
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));
app.use(express.static(path.join(__dirname, '../client')));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/templates', templateRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/events', rsvpRoutes);
app.use('/api/events', guestbookRoutes);
app.use('/api/events', sharingRoutes);
app.use('/api/keys', apiKeysRoutes);
app.use('/api/public/event', publicEventRoutes);

// Frontend Page Routing
app.get('/login', (req, res) => {
  res.sendFile(path.join(__dirname, '../client/login.html'));
});

app.get('/dashboard', (req, res) => {
  res.sendFile(path.join(__dirname, '../client/dashboard.html'));
});

app.get('/editor', (req, res) => {
  res.sendFile(path.join(__dirname, '../client/editor.html'));
});

app.get('/privacy', (req, res) => {
  res.sendFile(path.join(__dirname, '../client/privacy.html'));
});

app.get('/terms', (req, res) => {
  res.sendFile(path.join(__dirname, '../client/terms.html'));
});

// Event Website Viewers: /event/:slug or /e/:slug
app.get('/event/:slug', (req, res) => {
  res.sendFile(path.join(__dirname, '../client/event-view.html'));
});

app.get('/e/:slug', (req, res) => {
  res.sendFile(path.join(__dirname, '../client/event-view.html'));
});

// Fallback for root
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../client/index.html'));
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('Server error:', err.stack);
  res.status(500).json({ error: 'An unexpected server error occurred.' });
});

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`✨ Event Platform Server running at http://localhost:${PORT}`);
  });
}

module.exports = app;
