# Riwaayat Venue — Luxury Event Website Builder Platform & Celebration Suite

> *“Every Celebration, Beautifully Yours”*

A bespoke, privacy-first, multi-tenant event website builder platform designed for **Indian Weddings**, **Muslim Weddings**, and **Birthday Celebrations** with photorealistic cinematic event imagery, realistic scratch cards, live countdowns, and granular role-based access control (RBAC).

---

## 🌟 Key Features

1. **Three Curated Celebration Presets**:
   - **Indian Wedding**: Haldi (yellow floral), Mehendi (green ethnic), Sangeet (glam Indo-western), Sacred Mandap Wedding, and Grand Reception with photorealistic editorial photography.
   - **Muslim Wedding**: Dholki & Mayun, Mehendi, Sacred Nikah, and Grand Walima with emerald, gold & ivory arabesque aesthetics.
   - **Birthday Celebration**: Red Carpet Welcome, Party Games & Trivia, Cake Cutting, Dinner Buffet, and DJ Dance Party with luxury pastel aesthetics.
2. **Interactive Elements**:
   - Realistic HTML5 Canvas Gold Foil Scratch Card
   - Live Auspicious Countdown Timer
   - Photorealistic Couple Photo Gallery with Lightbox
   - Digital Wishes Wall / Guestbook
   - Google Maps Venue Navigation
   - Synthesized Romance Ambient Audio (Web Audio API)
3. **Enterprise Privacy & Granular RBAC**:
   - Distinct Roles: `owner`, `editor`, `viewer`, `guest`
   - Cloud Firestore Security Rules (`firestore.rules`) enforcing RBAC
   - Disallowed direct client writes on RSVPs and Guestbook (routed via validated, rate-limited backend with honeypot spam protection)
   - Attendee Data Segregation: phone numbers and meal details strictly owner-only; editors receive aggregate metrics
   - Firebase Google 1-Click OAuth
   - AES-256-GCM Encrypted API Keys at rest
   - 3-Tier Visibility: Draft, Private Passcode / Expiring Link, and Public
4. **1-Click Template Cloning**:
   - Instant template cloning from the landing page or dashboard into the user's private account.
5. **Standalone Site Included**:
   - `standalone-wedding-site/`: Single static website for Vijay & Rashima.

---

## 🚀 Vercel Deployment (1-Click Import)

1. Go to your [Vercel Dashboard](https://vercel.com/dashboard).
2. Click **"Add New Project"** > **"Import Git Repository"**.
3. Select this repository: `advertisingbwp-cmyk/wedding`.
4. Keep the Framework Preset as **Other** (or Express).
5. Click **Deploy**. Vercel will automatically detect `vercel.json` and serve the application!

---

## 💻 Local Development

```bash
# Install dependencies
npm install

# Start development server
npm start
# Open http://localhost:4000

# Run Security & RBAC Tests
npm test
```

---

## 📜 License
© 2026 Riwaayat Venue. All rights reserved. Crafted with love and bank-grade privacy.
