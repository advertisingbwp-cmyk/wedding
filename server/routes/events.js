/**
 * EVENT MANAGEMENT ROUTES
 * Enforces Row-Level Security: users only manage their own events.
 */

const express = require('express');
const router = express.Router();
const db = require('../database/db');
const { requireAuth } = require('../middleware/auth');
const { requireEventOwnership } = require('../middleware/rbac');
const upload = require('../middleware/upload');

// 1. List user's events with RSVP counts
router.get('/', requireAuth, (req, res) => {
  try {
    const events = db.prepare(`
      SELECT 
        e.*,
        (SELECT COUNT(*) FROM rsvps r WHERE r.event_id = e.id) as rsvp_count,
        (SELECT COUNT(*) FROM rsvps r WHERE r.event_id = e.id AND r.attendance = 'attending') as attending_count,
        (SELECT COUNT(*) FROM guestbook_messages g WHERE g.event_id = e.id) as guestbook_count
      FROM events e
      WHERE e.owner_user_id = ?
      ORDER BY e.created_at DESC
    `).all(req.user.id);

    res.json({ events });
  } catch (err) {
    console.error('Fetch events error:', err);
    res.status(500).json({ error: 'Failed to retrieve events.' });
  }
});

// 2. Create a new event with category presets
router.post('/', requireAuth, (req, res) => {
  try {
    const {
      event_type,
      title,
      headline,
      primary_names,
      event_date,
      venue_name,
      venue_address,
      theme_id,
      hashtag
    } = req.body;

    if (!event_type || !title || !primary_names || !event_date) {
      return res.status(400).json({ error: 'Event type, title, primary names, and date are required.' });
    }

    // Generate clean unique slug
    const baseSlug = primary_names
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
    let slug = baseSlug || 'event';
    const exists = db.prepare('SELECT id FROM events WHERE slug = ?').get(slug);
    if (exists) {
      slug = `${slug}-${Date.now().toString().slice(-4)}`;
    }

    const defaultImages = {
      indian_wedding: 'assets/images/hero_couple.jpg',
      muslim_wedding: 'assets/images/muslim_couple.jpg',
      birthday: 'assets/images/birthday_hero.jpg'
    };

    const heroImage = defaultImages[event_type] || defaultImages.indian_wedding;

    const insert = db.prepare(`
      INSERT INTO events (
        owner_user_id, slug, event_type, title, headline, primary_names,
        event_date, venue_name, venue_address, visibility, theme_id,
        hero_image_url, hashtag
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'draft', ?, ?, ?)
    `);

    const result = insert.run(
      req.user.id,
      slug,
      event_type,
      title.trim(),
      headline ? headline.trim() : '',
      primary_names.trim(),
      event_date,
      venue_name ? venue_name.trim() : '',
      venue_address ? venue_address.trim() : '',
      theme_id || 'luxury_pastel',
      heroImage,
      hashtag ? hashtag.trim() : `#${primary_names.replace(/[^a-zA-Z0-9]/g, '')}`
    );

    const eventId = result.lastInsertRowid;

    // Initialize Default Sections based on Event Type
    const insertSection = db.prepare(`
      INSERT INTO event_sections (event_id, section_key, title, is_enabled, sort_order, custom_content_json)
      VALUES (?, ?, ?, ?, ?, ?)
    `);

    const insertFunction = db.prepare(`
      INSERT INTO event_functions (event_id, function_key, title, subtitle, date_time, venue_name, dress_code, palette_colors_json, illustration_url, description, sort_order)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    if (event_type === 'indian_wedding') {
      const defaultSections = [
        ['hero', 'Hero Banner', 1, 0, '{}'],
        ['reveal', 'Auspicious Countdown & Scratch Card', 1, 1, '{}'],
        ['story', 'Our Love Story', 1, 2, '{}'],
        ['events', 'Wedding Ceremonies Itinerary', 1, 3, '{}'],
        ['gallery', 'Couple Gallery', 1, 4, '{}'],
        ['venue', 'Wedding Venue & Directions', 1, 5, '{}'],
        ['family', 'Meet The Family', 1, 6, '{}'],
        ['dress_code', 'Dress Code Guide', 1, 7, '{}'],
        ['travel', 'Travel & Accommodation', 1, 8, '{}'],
        ['rsvp', 'RSVP & Guest Confirmation', 1, 9, '{}'],
        ['guestbook', 'Digital Guestbook', 1, 10, '{}'],
        ['faqs', 'Frequently Asked Questions', 1, 11, '{}'],
        ['thank_you', 'Thank You Note', 1, 12, '{}']
      ];
      defaultSections.forEach(([k, t, e, o, c]) => insertSection.run(eventId, k, t, e, o, c));

      // 5 Authentic Indian Wedding Functions with custom illustrations
      const defaultFunctions = [
        ['haldi', 'Haldi Ceremony', 'Pithi & Phoolon Ki Holi', '10:00 AM', 'Courtyard', 'Sunburst Yellow', JSON.stringify(['#FFD700', '#FFA000']), 'assets/images/haldi_couple.jpg', 'Turmeric blessings and cheerful smiles.', 0],
        ['mehendi', 'Mehendi Carnival', 'Henna & Folk Vibes', '04:30 PM', 'Poolside Garden', 'Emerald & Mint', JSON.stringify(['#2E7D32', '#81C784']), 'assets/images/mehendi_couple.jpg', 'Artisan mehendi and live folk music.', 1],
        ['sangeet', 'Sangeet Extravaganza', 'Dance & Glitz', '07:00 PM', 'Royal Ballroom', 'Midnight Blue & Gold', JSON.stringify(['#1A237E', '#D4AF37']), 'assets/images/sangeet_couple.jpg', 'High-energy dance performances and DJ night.', 2],
        ['wedding', 'The Sacred Wedding', 'Baraat & Saat Phere', '10:30 AM', 'Lakeside Mandap', 'Royal Crimson & Ivory', JSON.stringify(['#B71C1C', '#D4AF37']), 'assets/images/wedding_couple.jpg', 'Sacred vows around the holy fire.', 3],
        ['reception', 'Grand Reception', 'An Evening of Elegance', '07:30 PM', 'Palace Lawn', 'Black Tie & Rose Gold', JSON.stringify(['#212121', '#F8BBD0']), 'assets/images/reception_couple.jpg', 'Dinner banquet and champagne toast.', 4]
      ];
      defaultFunctions.forEach(([k, t, s, d, v, dc, p, i, desc, o]) => insertFunction.run(eventId, k, t, s, d, v, dc, p, i, desc, o));
    } else if (event_type === 'muslim_wedding') {
      const defaultSections = [
        ['hero', 'Hero Banner', 1, 0, '{}'],
        ['reveal', 'Auspicious Date & Scratch Card', 1, 1, '{}'],
        ['story', 'Our Journey of Faith & Love', 1, 2, '{}'],
        ['events', 'Nikah & Wedding Ceremonies', 1, 3, '{}'],
        ['gallery', 'Celebration Gallery', 1, 4, '{}'],
        ['venue', 'Venue & Navigation', 1, 5, '{}'],
        ['family', 'Meet The Families', 1, 6, '{}'],
        ['dress_code', 'Modest Dress Code', 1, 7, '{}'],
        ['rsvp', 'RSVP & Guest Attendance', 1, 8, '{}'],
        ['guestbook', 'Duas & Wishes Wall', 1, 9, '{}'],
        ['faqs', 'Helpful Guest FAQs', 1, 10, '{}'],
        ['thank_you', 'JazakAllah Khair', 1, 11, '{}']
      ];
      defaultSections.forEach(([k, t, e, o, c]) => insertSection.run(eventId, k, t, e, o, c));

      // Muslim Wedding Functions
      const defaultFunctions = [
        ['dholki', 'Dholki & Mayun Night', 'Folk Tappay & Ubtan', '07:00 PM', 'Family Courtyard', 'Ochre & Marigold', JSON.stringify(['#FFB300', '#FFF59D']), 'assets/images/haldi_couple.jpg', 'Traditional dholak rhythms and family laughter.', 0],
        ['mehendi', 'Mehendi Celebration', 'Henna & Festive Attire', '06:30 PM', 'Emerald Pavilion', 'Forest Green & Olive', JSON.stringify(['#2E7D32', '#A5D6A7']), 'assets/images/mehendi_couple.jpg', 'Artisan henna application and sufi music.', 1],
        ['nikah', 'The Sacred Nikah Ceremony', 'Ijab-e-Qubool & Dua', '04:30 PM', 'Grand Noor Hall', 'Ivory & Emerald', JSON.stringify(['#FFFFFF', '#D4AF37', '#004D40']), 'assets/images/muslim_couple.jpg', 'Solemnization of the sacred marriage contract.', 2],
        ['walima', 'Grand Walima Banquet', 'A Night of Elegance & Gratitude', '07:30 PM', 'Royal Ballroom', 'Navy & Champagne', JSON.stringify(['#1A237E', '#D4AF37']), 'assets/images/reception_couple.jpg', 'Opulent banquet hosted by the groom’s family.', 3]
      ];
      defaultFunctions.forEach(([k, t, s, d, v, dc, p, i, desc, o]) => insertFunction.run(eventId, k, t, s, d, v, dc, p, i, desc, o));
    } else {
      // Birthday Celebration
      const defaultSections = [
        ['hero', 'Welcome Banner', 1, 0, '{}'],
        ['reveal', 'Mystery Scratch Card & Date', 1, 1, '{}'],
        ['events', 'Party Itinerary & Activities', 1, 2, '{}'],
        ['gallery', 'Photo Highlights', 1, 3, '{}'],
        ['venue', 'Party Venue & Map', 1, 4, '{}'],
        ['dress_code', 'Party Dress Code', 1, 5, '{}'],
        ['registry', 'Wishlist & Gift Links', 1, 6, '{}'],
        ['rsvp', 'Party RSVP', 1, 7, '{}'],
        ['guestbook', 'Birthday Wishes Wall', 1, 8, '{}'],
        ['faqs', 'Party FAQs', 1, 9, '{}'],
        ['thank_you', 'Thank You Note', 1, 10, '{}']
      ];
      defaultSections.forEach(([k, t, e, o, c]) => insertSection.run(eventId, k, t, e, o, c));

      // Birthday Activities
      const defaultFunctions = [
        ['welcome', 'Red Carpet Welcome & Mocktails', 'Arrivals & Photo Booth', '06:00 PM', 'Lounge Foyer', 'Pastel Chic', JSON.stringify(['#F8BBD0', '#E1BEE7']), 'assets/images/birthday_hero.jpg', 'Red carpet entrance with signature party mocktails.', 0],
        ['games', 'Fun Games & Trivia', 'Challenges & Prizes', '07:00 PM', 'Main Area', 'Casual Fun', JSON.stringify(['#FFD54F', '#80DEEA']), 'assets/images/first_date_couple.jpg', 'Trivia challenges and prize giveaways.', 1],
        ['cake_cutting', 'Grand Cake Cutting', 'Candles & Confetti', '08:15 PM', 'The Cake Stage', 'Shimmer & Shine', JSON.stringify(['#F48FB1', '#FFD700']), 'assets/images/birthday_hero.jpg', 'Handcrafted 3-tier birthday cake and confetti canons!', 2],
        ['dinner', 'Gourmet Dinner Buffet', 'Feast & Delicacies', '08:45 PM', 'Terrace Dining', 'Party Chic', JSON.stringify(['#A5D6A7', '#FFE082']), 'assets/images/reception_couple.jpg', 'Delicious multi-cuisine dinner buffet.', 3],
        ['entertainment', 'DJ Dance Floor Party', 'Beats & Glow Sticks', '09:30 PM', 'Dance Floor', 'Dancing Shoes', JSON.stringify(['#BA68C8', '#4FC3F7']), 'assets/images/sangeet_couple.jpg', 'Non-stop music, neon glow sticks, and dancing.', 4]
      ];
      defaultFunctions.forEach(([k, t, s, d, v, dc, p, i, desc, o]) => insertFunction.run(eventId, k, t, s, d, v, dc, p, i, desc, o));
    }

    res.status(201).json({
      message: 'Event created successfully!',
      eventId,
      slug
    });
  } catch (err) {
    console.error('Create event error:', err);
    res.status(500).json({ error: 'Failed to create event.' });
  }
});

// Quick 1-Click Launch from Pre-Built Template ("Try This Template")
router.post('/from-template', requireAuth, (req, res) => {
  try {
    const { template_type } = req.body;
    const presets = {
      indian_wedding: {
        event_type: 'indian_wedding',
        title: 'The Royal Wedding Celebration',
        headline: 'Two Souls, One Heartbeat, A Lifetime of Laughter',
        primary_names: 'Vijay & Rashima',
        event_date: '2026-12-14',
        venue_name: 'The Oberoi Udaivilas & Royal Grounds, Udaipur',
        venue_address: 'Haridas Ji Ki Magri, Lake Pichola, Udaipur, Rajasthan 313001',
        theme_id: 'luxury_pastel',
        hashtag: '#ViShimaForever',
        hero_image_url: 'assets/images/hero_couple.jpg'
      },
      muslim_wedding: {
        event_type: 'muslim_wedding',
        title: 'A Celebration of Two Souls & Sacred Nikah',
        headline: 'And We created you in pairs — Surah An-Naba (78:8)',
        primary_names: 'Zain & Ayla',
        event_date: '2026-11-20',
        venue_name: 'The Grand Serena & Crystal Ballroom',
        venue_address: 'Club Road, Islamabad 44000',
        theme_id: 'emerald_ivory',
        hashtag: '#ZainWedsAyla',
        hero_image_url: 'assets/images/muslim_couple.jpg'
      },
      birthday: {
        event_type: 'birthday',
        title: "Aria's Sweet 16 Neon Sparkle Bash",
        headline: 'Celebrating 16 Years of Magic, Laughter & Joy!',
        primary_names: 'Aria',
        event_date: '2026-10-25',
        venue_name: 'Skyline Terrace Lounge & Rooftop',
        venue_address: 'Penthouse Level, Grand Tower, City Center',
        theme_id: 'princess_pink',
        hashtag: '#AriaSweet16',
        hero_image_url: 'assets/images/birthday_hero.jpg'
      }
    };

    const chosen = presets[template_type] || presets.indian_wedding;
    const baseSlug = (chosen.primary_names + '-template')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
    const slug = `${baseSlug}-${Date.now().toString().slice(-4)}`;

    const insertEvent = db.prepare(`
      INSERT INTO events (
        owner_user_id, slug, event_type, title, headline, primary_names,
        event_date, venue_name, venue_address, visibility, theme_id,
        hero_image_url, hashtag
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'draft', ?, ?, ?)
    `);

    const result = insertEvent.run(
      req.user.id,
      slug,
      chosen.event_type,
      chosen.title,
      chosen.headline,
      chosen.primary_names,
      chosen.event_date,
      chosen.venue_name,
      chosen.venue_address,
      chosen.theme_id,
      chosen.hero_image_url,
      chosen.hashtag
    );

    const eventId = result.lastInsertRowid;

    // Default Sections
    const insertSection = db.prepare(`
      INSERT INTO event_sections (event_id, section_key, title, is_enabled, sort_order, custom_content_json)
      VALUES (?, ?, ?, ?, ?, ?)
    `);

    // Default Functions
    const insertFunction = db.prepare(`
      INSERT INTO event_functions (event_id, function_key, title, subtitle, date_time, venue_name, dress_code, palette_colors_json, illustration_url, description, sort_order)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    if (chosen.event_type === 'indian_wedding') {
      const defaultSections = [
        ['hero', 'Hero Banner', 1, 0, '{}'],
        ['reveal', 'Auspicious Countdown & Scratch Card', 1, 1, '{}'],
        ['story', 'Our Love Story', 1, 2, '{}'],
        ['events', 'Wedding Ceremonies Itinerary', 1, 3, '{}'],
        ['gallery', 'Couple Gallery', 1, 4, '{}'],
        ['venue', 'Wedding Venue & Directions', 1, 5, '{}'],
        ['family', 'Meet The Family', 1, 6, '{}'],
        ['dress_code', 'Dress Code Guide', 1, 7, '{}'],
        ['travel', 'Travel & Accommodation', 1, 8, '{}'],
        ['rsvp', 'RSVP & Guest Confirmation', 1, 9, '{}'],
        ['guestbook', 'Digital Guestbook', 1, 10, '{}'],
        ['faqs', 'Frequently Asked Questions', 1, 11, '{}'],
        ['thank_you', 'Thank You Note', 1, 12, '{}']
      ];
      defaultSections.forEach(([k, t, e, o, c]) => insertSection.run(eventId, k, t, e, o, c));

      const defaultFunctions = [
        ['haldi', 'Haldi Ceremony', 'Pithi & Phoolon Ki Holi', '10:00 AM', 'Courtyard', 'Sunburst Yellow', JSON.stringify(['#FFD700', '#FFA000']), 'assets/images/haldi_couple.jpg', 'Turmeric blessings and cheerful smiles.', 0],
        ['mehendi', 'Mehendi Carnival', 'Henna & Folk Vibes', '04:30 PM', 'Poolside Garden', 'Emerald & Mint', JSON.stringify(['#2E7D32', '#81C784']), 'assets/images/mehendi_couple.jpg', 'Artisan mehendi and live folk music.', 1],
        ['sangeet', 'Sangeet Extravaganza', 'Dance & Glitz', '07:00 PM', 'Royal Ballroom', 'Midnight Blue & Gold', JSON.stringify(['#1A237E', '#D4AF37']), 'assets/images/sangeet_couple.jpg', 'High-energy dance performances and DJ night.', 2],
        ['wedding', 'The Sacred Wedding', 'Baraat & Saat Phere', '10:30 AM', 'Lakeside Mandap', 'Royal Crimson & Ivory', JSON.stringify(['#B71C1C', '#D4AF37']), 'assets/images/wedding_couple.jpg', 'Sacred vows around the holy fire.', 3],
        ['reception', 'Grand Reception', 'An Evening of Elegance', '07:30 PM', 'Palace Lawn', 'Black Tie & Rose Gold', JSON.stringify(['#212121', '#F8BBD0']), 'assets/images/reception_couple.jpg', 'Dinner banquet and champagne toast.', 4]
      ];
      defaultFunctions.forEach(([k, t, s, d, v, dc, p, i, desc, o]) => insertFunction.run(eventId, k, t, s, d, v, dc, p, i, desc, o));
    } else if (chosen.event_type === 'muslim_wedding') {
      const defaultSections = [
        ['hero', 'Hero Banner', 1, 0, '{}'],
        ['reveal', 'Auspicious Date & Scratch Card', 1, 1, '{}'],
        ['story', 'Our Journey of Faith & Love', 1, 2, '{}'],
        ['events', 'Nikah & Wedding Ceremonies', 1, 3, '{}'],
        ['gallery', 'Celebration Gallery', 1, 4, '{}'],
        ['venue', 'Venue & Navigation', 1, 5, '{}'],
        ['family', 'Meet The Families', 1, 6, '{}'],
        ['dress_code', 'Modest Dress Code', 1, 7, '{}'],
        ['rsvp', 'RSVP & Guest Attendance', 1, 8, '{}'],
        ['guestbook', 'Duas & Wishes Wall', 1, 9, '{}'],
        ['faqs', 'Helpful Guest FAQs', 1, 10, '{}'],
        ['thank_you', 'JazakAllah Khair', 1, 11, '{}']
      ];
      defaultSections.forEach(([k, t, e, o, c]) => insertSection.run(eventId, k, t, e, o, c));

      const defaultFunctions = [
        ['dholki', 'Dholki & Mayun Night', 'Folk Tappay & Ubtan', '07:00 PM', 'Family Courtyard', 'Ochre & Marigold', JSON.stringify(['#FFB300', '#FFF59D']), 'assets/images/haldi_couple.jpg', 'Traditional dholak rhythms and family laughter.', 0],
        ['mehendi', 'Mehendi Celebration', 'Henna & Festive Attire', '06:30 PM', 'Emerald Pavilion', 'Forest Green & Olive', JSON.stringify(['#2E7D32', '#A5D6A7']), 'assets/images/mehendi_couple.jpg', 'Artisan henna application and sufi music.', 1],
        ['nikah', 'The Sacred Nikah Ceremony', 'Ijab-e-Qubool & Dua', '04:30 PM', 'Grand Noor Hall', 'Ivory & Emerald', JSON.stringify(['#FFFFFF', '#D4AF37', '#004D40']), 'assets/images/muslim_couple.jpg', 'Solemnization of the sacred marriage contract.', 2],
        ['walima', 'Grand Walima Banquet', 'A Night of Elegance & Gratitude', '07:30 PM', 'Royal Ballroom', 'Navy & Champagne', JSON.stringify(['#1A237E', '#D4AF37']), 'assets/images/reception_couple.jpg', 'Opulent banquet hosted by the groom’s family.', 3]
      ];
      defaultFunctions.forEach(([k, t, s, d, v, dc, p, i, desc, o]) => insertFunction.run(eventId, k, t, s, d, v, dc, p, i, desc, o));
    } else {
      const defaultSections = [
        ['hero', 'Welcome Banner', 1, 0, '{}'],
        ['reveal', 'Mystery Scratch Card & Date', 1, 1, '{}'],
        ['events', 'Party Itinerary & Activities', 1, 2, '{}'],
        ['gallery', 'Photo Highlights', 1, 3, '{}'],
        ['venue', 'Party Venue & Map', 1, 4, '{}'],
        ['dress_code', 'Party Dress Code', 1, 5, '{}'],
        ['registry', 'Wishlist & Gift Links', 1, 6, '{}'],
        ['rsvp', 'Party RSVP', 1, 7, '{}'],
        ['guestbook', 'Birthday Wishes Wall', 1, 8, '{}'],
        ['faqs', 'Party FAQs', 1, 9, '{}'],
        ['thank_you', 'Thank You Note', 1, 10, '{}']
      ];
      defaultSections.forEach(([k, t, e, o, c]) => insertSection.run(eventId, k, t, e, o, c));

      const defaultFunctions = [
        ['welcome', 'Red Carpet Welcome & Mocktails', 'Arrivals & Photo Booth', '06:00 PM', 'Lounge Foyer', 'Pastel Chic', JSON.stringify(['#F8BBD0', '#E1BEE7']), 'assets/images/birthday_hero.jpg', 'Red carpet entrance with signature party mocktails.', 0],
        ['games', 'Fun Games & Trivia', 'Challenges & Prizes', '07:00 PM', 'Main Area', 'Casual Fun', JSON.stringify(['#FFD54F', '#80DEEA']), 'assets/images/first_date_couple.jpg', 'Trivia challenges and prize giveaways.', 1],
        ['cake_cutting', 'Grand Cake Cutting', 'Candles & Confetti', '08:15 PM', 'The Cake Stage', 'Shimmer & Shine', JSON.stringify(['#F48FB1', '#FFD700']), 'assets/images/birthday_hero.jpg', 'Handcrafted 3-tier birthday cake and confetti canons!', 2],
        ['dinner', 'Gourmet Dinner Buffet', 'Feast & Delicacies', '08:45 PM', 'Terrace Dining', 'Party Chic', JSON.stringify(['#A5D6A7', '#FFE082']), 'assets/images/reception_couple.jpg', 'Delicious multi-cuisine dinner buffet.', 3],
        ['entertainment', 'DJ Dance Floor Party', 'Beats & Glow Sticks', '09:30 PM', 'Dance Floor', 'Dancing Shoes', JSON.stringify(['#BA68C8', '#4FC3F7']), 'assets/images/sangeet_couple.jpg', 'Non-stop music, neon glow sticks, and dancing.', 4]
      ];
      defaultFunctions.forEach(([k, t, s, d, v, dc, p, i, desc, o]) => insertFunction.run(eventId, k, t, s, d, v, dc, p, i, desc, o));
    }

    res.status(201).json({
      message: 'Template initialized successfully!',
      eventId,
      slug
    });
  } catch (err) {
    console.error('Try template error:', err);
    res.status(500).json({ error: 'Failed to launch template.' });
  }
});

// 3. Get Full Event details with Sections and Functions (Owner only)
router.get('/:id', requireAuth, requireEventOwnership, (req, res) => {
  try {
    const event = req.event;
    const sections = db.prepare('SELECT * FROM event_sections WHERE event_id = ? ORDER BY sort_order ASC').all(event.id);
    const functions = db.prepare('SELECT * FROM event_functions WHERE event_id = ? ORDER BY sort_order ASC').all(event.id);

    res.json({
      event,
      sections,
      functions
    });
  } catch (err) {
    console.error('Get event error:', err);
    res.status(500).json({ error: 'Failed to fetch event.' });
  }
});

// 4. Update Event Info (Owner only)
router.put('/:id', requireAuth, requireEventOwnership, (req, res) => {
  try {
    const {
      title,
      headline,
      primary_names,
      event_date,
      venue_name,
      venue_address,
      venue_map_url,
      visibility,
      theme_id,
      hero_image_url,
      hashtag
    } = req.body;

    db.prepare(`
      UPDATE events
      SET 
        title = COALESCE(?, title),
        headline = COALESCE(?, headline),
        primary_names = COALESCE(?, primary_names),
        event_date = COALESCE(?, event_date),
        venue_name = COALESCE(?, venue_name),
        venue_address = COALESCE(?, venue_address),
        venue_map_url = COALESCE(?, venue_map_url),
        visibility = COALESCE(?, visibility),
        theme_id = COALESCE(?, theme_id),
        hero_image_url = COALESCE(?, hero_image_url),
        hashtag = COALESCE(?, hashtag),
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).run(
      title, headline, primary_names, event_date, venue_name,
      venue_address, venue_map_url, visibility, theme_id,
      hero_image_url, hashtag, req.event.id
    );

    res.json({ message: 'Event updated successfully.' });
  } catch (err) {
    console.error('Update event error:', err);
    res.status(500).json({ error: 'Failed to update event.' });
  }
});

// 5. Delete Event (Owner only)
router.delete('/:id', requireAuth, requireEventOwnership, (req, res) => {
  try {
    db.prepare('DELETE FROM events WHERE id = ?').run(req.event.id);
    res.json({ message: 'Event deleted successfully.' });
  } catch (err) {
    console.error('Delete event error:', err);
    res.status(500).json({ error: 'Failed to delete event.' });
  }
});

// 6. Update / Reorder Sections
router.put('/:id/sections', requireAuth, requireEventOwnership, (req, res) => {
  try {
    const { sections } = req.body; // array of { id, title, is_enabled, sort_order, custom_content_json }
    if (!Array.isArray(sections)) {
      return res.status(400).json({ error: 'Sections array is required.' });
    }

    const updateStmt = db.prepare(`
      UPDATE event_sections
      SET title = ?, is_enabled = ?, sort_order = ?, custom_content_json = ?
      WHERE id = ? AND event_id = ?
    `);

    for (let s of sections) {
      updateStmt.run(
        s.title,
        s.is_enabled ? 1 : 0,
        s.sort_order || 0,
        typeof s.custom_content_json === 'object' ? JSON.stringify(s.custom_content_json) : (s.custom_content_json || '{}'),
        s.id,
        req.event.id
      );
    }

    res.json({ message: 'Sections updated successfully.' });
  } catch (err) {
    console.error('Update sections error:', err);
    res.status(500).json({ error: 'Failed to update sections.' });
  }
});

// 7. Add Function / Ceremony
router.post('/:id/functions', requireAuth, requireEventOwnership, (req, res) => {
  try {
    const {
      function_key,
      title,
      subtitle,
      date_time,
      venue_name,
      dress_code,
      palette_colors,
      illustration_url,
      description
    } = req.body;

    const count = db.prepare('SELECT COUNT(*) as count FROM event_functions WHERE event_id = ?').get(req.event.id);
    const sort_order = count ? count.count : 0;

    const result = db.prepare(`
      INSERT INTO event_functions (
        event_id, function_key, title, subtitle, date_time,
        venue_name, dress_code, palette_colors_json,
        illustration_url, description, sort_order
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      req.event.id,
      function_key || 'custom_' + Date.now(),
      title || 'New Ceremony',
      subtitle || '',
      date_time || '',
      venue_name || '',
      dress_code || '',
      JSON.stringify(palette_colors || ['#D4AF37', '#FCE4EC']),
      illustration_url || 'assets/images/hero_couple.jpg',
      description || '',
      sort_order
    );

    res.status(201).json({
      message: 'Function added successfully!',
      functionId: result.lastInsertRowid
    });
  } catch (err) {
    console.error('Add function error:', err);
    res.status(500).json({ error: 'Failed to add function.' });
  }
});

// 8. Update Function / Ceremony
router.put('/:id/functions/:funcId', requireAuth, requireEventOwnership, (req, res) => {
  try {
    const { funcId } = req.params;
    const {
      title,
      subtitle,
      date_time,
      venue_name,
      dress_code,
      palette_colors,
      illustration_url,
      description,
      sort_order
    } = req.body;

    db.prepare(`
      UPDATE event_functions
      SET
        title = COALESCE(?, title),
        subtitle = COALESCE(?, subtitle),
        date_time = COALESCE(?, date_time),
        venue_name = COALESCE(?, venue_name),
        dress_code = COALESCE(?, dress_code),
        palette_colors_json = COALESCE(?, palette_colors_json),
        illustration_url = COALESCE(?, illustration_url),
        description = COALESCE(?, description),
        sort_order = COALESCE(?, sort_order)
      WHERE id = ? AND event_id = ?
    `).run(
      title, subtitle, date_time, venue_name, dress_code,
      palette_colors ? JSON.stringify(palette_colors) : null,
      illustration_url, description, sort_order,
      funcId, req.event.id
    );

    res.json({ message: 'Function updated successfully.' });
  } catch (err) {
    console.error('Update function error:', err);
    res.status(500).json({ error: 'Failed to update function.' });
  }
});

// 9. Delete Function / Ceremony
router.delete('/:id/functions/:funcId', requireAuth, requireEventOwnership, (req, res) => {
  try {
    const { funcId } = req.params;
    db.prepare('DELETE FROM event_functions WHERE id = ? AND event_id = ?').run(funcId, req.event.id);
    res.json({ message: 'Function deleted successfully.' });
  } catch (err) {
    console.error('Delete function error:', err);
    res.status(500).json({ error: 'Failed to delete function.' });
  }
});

// 10. Secure Image Upload
router.post('/upload', requireAuth, upload.single('image'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No image file uploaded.' });
    }
    const fileUrl = `/uploads/${req.file.filename}`;
    res.json({
      message: 'Image uploaded successfully!',
      url: fileUrl
    });
  } catch (err) {
    console.error('Upload error:', err);
    res.status(500).json({ error: 'Image upload failed.' });
  }
});

module.exports = router;
