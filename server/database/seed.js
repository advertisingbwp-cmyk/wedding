/**
 * SEED SCRIPT
 * Seeds demo user and authentic pre-configured events for:
 * 1. Indian Wedding
 * 2. Muslim Wedding
 * 3. Birthday Celebration
 */

const db = require('./db');
const { hashPassword } = require('../config/security');

const crypto = require('node:crypto');

function seedDatabase() {
  console.log('Seeding public template showcases (Riwaayat Venue)...');

  // 1. Internal System Template Author (No public login / credentials)
  const templateEmail = 'system-templates@riwaayatvenue.internal';
  const existingUser = db.prepare('SELECT id FROM users WHERE email = ?').get(templateEmail);
  let userId;

  if (!existingUser) {
    const unguessableHash = 'INTERNAL_TEMPLATE_LOCKED_' + crypto.randomBytes(32).toString('hex');
    const insertUser = db.prepare(`
      INSERT INTO users (email, password_hash, full_name)
      VALUES (?, ?, ?)
    `);
    const result = insertUser.run(templateEmail, unguessableHash, 'Riwaayat Venue Curated Templates');
    userId = result.lastInsertRowid;
    console.log(`Initialized internal template author with ID: ${userId}`);
  } else {
    userId = existingUser.id;
  }

  // Helper to insert section
  const insertSection = db.prepare(`
    INSERT INTO event_sections (event_id, section_key, title, is_enabled, sort_order, custom_content_json)
    VALUES (?, ?, ?, ?, ?, ?)
  `);

  // Helper to insert function
  const insertFunction = db.prepare(`
    INSERT INTO event_functions (event_id, function_key, title, subtitle, date_time, venue_name, dress_code, palette_colors_json, illustration_url, description, sort_order)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  // ============================================================
  // TEMPLATE 1: INDIAN WEDDING (Vijay & Rashima)
  // ============================================================
  const existingIndian = db.prepare('SELECT id FROM events WHERE slug = ?').get('vijay-rashima-wedding');
  if (!existingIndian) {
    const insertEvent = db.prepare(`
      INSERT INTO events (owner_user_id, slug, event_type, title, headline, primary_names, event_date, venue_name, venue_address, venue_map_url, visibility, theme_id, hero_image_url, hashtag)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    const result = insertEvent.run(
      userId,
      'vijay-rashima-wedding',
      'indian_wedding',
      'The Royal Wedding Celebration',
      'Two Souls, One Heartbeat, A Lifetime of Laughter',
      'Vijay & Rashima',
      '2026-12-14',
      'The Oberoi Udaivilas & Royal Grounds',
      'Haridas Ji Ki Magri, Lake Pichola, Udaipur, Rajasthan 313001',
      'https://maps.google.com/?q=The+Oberoi+Udaivilas+Udaipur',
      'public',
      'luxury_pastel',
      'assets/images/hero_couple.jpg',
      '#ViShimaForever'
    );
    const eventId = result.lastInsertRowid;

    // Sections
    const sections = [
      ['hero', 'Hero Banner', 1, 0, JSON.stringify({ subtitle: 'We Are Getting Married!', quote: 'Join us in Udaipur for our dream nuptials.' })],
      ['reveal', 'Auspicious Countdown & Scratch Reveal', 1, 1, JSON.stringify({ scratchText: 'DECEMBER 14, 2026 • THE OBEROI UDAIVILAS' })],
      ['story', 'Our Love Story', 1, 2, JSON.stringify({
        milestones: [
          { title: 'The Serendipitous Hello', date: 'October 2022', desc: 'Introduced by mutual friends during Diwali sparklers.' },
          { title: 'The 4-Hour Coffee Date', date: 'November 2022', desc: 'A quick coffee that turned into hours of shared dreams.', img: 'assets/images/first_date_couple.jpg' },
          { title: 'The Sunset Lake Proposal', date: 'February 2025', desc: 'Overlooking Lake Pichola at sunset, she said YES!', img: 'assets/images/proposal_couple.jpg' },
          { title: 'Forever Begins', date: 'December 2026', desc: 'Our sacred vows under the royal mandap.' }
        ]
      })],
      ['events', 'Wedding Ceremonies Itinerary', 1, 3, '{}'],
      ['gallery', 'Couple Gallery', 1, 4, JSON.stringify({
        photos: [
          { src: 'assets/images/hero_couple.jpg', caption: 'Vijay & Rashima Official Portrait' },
          { src: 'assets/images/proposal_couple.jpg', caption: 'The Lake Pichola Sunset Proposal' },
          { src: 'assets/images/first_date_couple.jpg', caption: 'Where It All Began - First Date' },
          { src: 'assets/images/haldi_couple.jpg', caption: 'Haldi Turmeric & Marigolds' },
          { src: 'assets/images/mehendi_couple.jpg', caption: 'Mehendi Folk Carnival' },
          { src: 'assets/images/sangeet_couple.jpg', caption: 'Sangeet Spotlights & Dance' },
          { src: 'assets/images/wedding_couple.jpg', caption: 'Sacred Mandap Saat Phere' },
          { src: 'assets/images/reception_couple.jpg', caption: 'Grand Reception Evening Gala' }
        ]
      })],
      ['venue', 'Wedding Venue & Directions', 1, 5, '{}'],
      ['family', 'Meet The Family', 1, 6, JSON.stringify({
        groomSide: [
          { name: 'Rajesh & Sunita Kapur', relation: 'Parents of the Groom', quote: 'Blessed to welcome Rashima into our lives!' },
          { name: 'Kabir Kapur', relation: 'Brother & Best Man', quote: 'Loudest cheerleader on the Sangeet dance floor!' }
        ],
        brideSide: [
          { name: 'Devendra & Meenakshi Sharma', relation: 'Parents of the Bride', quote: 'Our princess has found her prince charming.' },
          { name: 'Isha Sharma', relation: 'Sister & Maid of Honor', quote: 'Official lehenga fluffer and secret keeper!' }
        ]
      })],
      ['dress_code', 'Dress Code Guide', 1, 7, '{}'],
      ['travel', 'Travel & Accommodation', 1, 8, JSON.stringify({
        airport: 'Maharana Pratap Airport (UDR) - 35 mins away',
        hotelPromo: 'Promo Code: #VISHIMA2026 at Udaivilas / Trident'
      })],
      ['rsvp', 'RSVP & Guest Confirmation', 1, 9, '{}'],
      ['guestbook', 'Digital Guestbook', 1, 10, '{}'],
      ['faqs', 'Frequently Asked Questions', 1, 11, JSON.stringify({
        questions: [
          { q: 'What is the dress code?', a: 'Haldi: Yellow, Mehendi: Green, Sangeet: Indo-Western Glam, Wedding: Red & Pastels, Reception: Black Tie.' },
          { q: 'Are children invited?', a: 'Yes, kids are warmly welcome! Childcare is available at the resort.' },
          { q: 'What is the gift policy?', a: 'Your loving presence and blessings are our greatest gift.' }
        ]
      })],
      ['thank_you', 'Thank You & Love Note', 1, 12, '{}']
    ];

    sections.forEach(([key, title, enabled, order, content]) => {
      insertSection.run(eventId, key, title, enabled, order, content);
    });

    // Event Functions for Indian Wedding
    const functions = [
      ['haldi', 'Haldi Ceremony', 'Pithi & Phoolon Ki Holi', 'Dec 12, 2026 • 10:00 AM', 'Chandani Courtyard', 'Sunburst Yellow & Floral Jewelry', JSON.stringify(['#FFD700', '#FFA000', '#FFF9C4']), 'assets/images/haldi_couple.jpg', 'Turmeric blessings, marigold showers, and joyful laughter.', 0],
      ['mehendi', 'Mehendi Carnival', 'Henna & Rajasthani Folk Beats', 'Dec 12, 2026 • 04:30 PM', 'Poolside Palm Gardens', 'Emerald Greens & Boho Florals', JSON.stringify(['#2E7D32', '#81C784', '#E8F5E9']), 'assets/images/mehendi_couple.jpg', 'Artisan mehendi, bangles bazaar, and delicious chaat street food.', 1],
      ['sangeet', 'Sangeet Extravaganza', 'Dance Face-Off & DJ Night', 'Dec 13, 2026 • 07:00 PM', 'Royal Grand Ballroom', 'Midnight Blue, Glitz & Indo-Western', JSON.stringify(['#1A237E', '#D4AF37', '#EDE7F6']), 'assets/images/sangeet_couple.jpg', 'Family dance showdown, live percussionists, and celebrity DJ sets.', 2],
      ['wedding', 'The Sacred Wedding', 'Baraat, Varmala & Saat Phere', 'Dec 14, 2026 • 10:30 AM', 'Lakeside Floral Mandap', 'Regal Crimson, Ivory & Royal Pastels', JSON.stringify(['#B71C1C', '#D4AF37', '#FFF8E1']), 'assets/images/wedding_couple.jpg', 'Royal Baraat procession and holy Vedic mantras overlooking the lake.', 3],
      ['reception', 'Grand Wedding Reception', 'Black Tie Gala Banquet', 'Dec 14, 2026 • 07:30 PM', 'The Palace Grand Lawn', 'Black Tie, Tuxedos & Evening Gowns', JSON.stringify(['#212121', '#F8BBD0', '#F5F5F5']), 'assets/images/reception_couple.jpg', 'A night of elegance, toasts, champagne, and live symphony music.', 4]
    ];

    functions.forEach(([fkey, title, sub, dt, ven, dc, pal, ill, desc, order]) => {
      insertFunction.run(eventId, fkey, title, sub, dt, ven, dc, pal, ill, desc, order);
    });

    // Add some sample RSVPs
    const insertRsvp = db.prepare(`
      INSERT INTO rsvps (event_id, guest_name, phone, email, guest_count, attendance, meal_preference, message)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);
    insertRsvp.run(eventId, 'Rohit & Ananya Verma', '+919876543201', 'rohit@example.com', 2, 'attending', 'Pure Vegetarian', 'Can’t wait for the sangeet night!');
    insertRsvp.run(eventId, 'Aakash Mehta', '+919876543202', 'aakash@example.com', 1, 'attending', 'Non-Vegetarian', 'Huge congrats Vijay bro!');

    console.log('Seeded Indian Wedding template (vijay-rashima-wedding)');
  }

  // ============================================================
  // TEMPLATE 2: MUSLIM WEDDING (Zain & Ayla)
  // ============================================================
  const existingMuslim = db.prepare('SELECT id FROM events WHERE slug = ?').get('zain-ayla-nikah');
  if (!existingMuslim) {
    const insertEvent = db.prepare(`
      INSERT INTO events (owner_user_id, slug, event_type, title, headline, primary_names, event_date, venue_name, venue_address, venue_map_url, visibility, theme_id, hero_image_url, hashtag)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    const result = insertEvent.run(
      userId,
      'zain-ayla-nikah',
      'muslim_wedding',
      'The Blessed Nikah & Walima Celebration',
      'In The Name of Allah, The Most Gracious, The Most Merciful',
      'Zain & Ayla',
      '2026-11-20',
      'The Royal Palm Palace & Noor Gardens',
      'Boulevard Crescent, Emirates Hills, Dubai',
      'https://maps.google.com/?q=Emirates+Hills+Dubai',
      'public',
      'emerald_ivory',
      'assets/images/muslim_couple.jpg',
      '#ZainFoundHisAyla'
    );
    const eventId = result.lastInsertRowid;

    // Sections for Muslim Wedding
    const muslimSections = [
      ['hero', 'Hero Banner', 1, 0, JSON.stringify({ bismillah: 'بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ', subtitle: 'Barakallahu Lakuma' })],
      ['reveal', 'Auspicious Date & Scratch Reveal', 1, 1, JSON.stringify({ scratchText: 'NOVEMBER 20, 2026 • THE NOOR GRAND BALLROOM' })],
      ['story', 'Our Journey of Faith & Love', 1, 2, JSON.stringify({
        milestones: [
          { title: 'The Families Meet', date: 'August 2023', desc: 'Over sweet chai and prayers, both families felt an instant connection.' },
          { title: 'The Engagement Dua', date: 'January 2025', desc: 'Blessings exchanged with gold rings and heartfelt prayers.' },
          { title: 'The Nikah Solemnization', date: 'November 2026', desc: 'Signing the sacred marriage contract under Allah’s grace.' }
        ]
      })],
      ['events', 'Nikah & Wedding Ceremonies', 1, 3, '{}'],
      ['gallery', 'Celebration Gallery', 1, 4, JSON.stringify({
        photos: [
          { src: 'assets/images/muslim_couple.jpg', caption: 'Zain & Ayla Nikah Portrait' }
        ]
      })],
      ['venue', 'Venue & Navigation', 1, 5, '{}'],
      ['family', 'Meet The Families', 1, 6, JSON.stringify({
        groomSide: [{ name: 'Tariq & Yasmin Siddiqui', relation: 'Parents of the Groom', quote: 'May Allah bless their marriage with harmony and barakah.' }],
        brideSide: [{ name: 'Farhan & Samira Khan', relation: 'Parents of the Bride', quote: 'Alhamdulillah for uniting two wonderful souls.' }]
      })],
      ['dress_code', 'Modest Dress Code', 1, 7, '{}'],
      ['rsvp', 'RSVP & Guest Attendance', 1, 8, '{}'],
      ['guestbook', 'Duas & Wishes Wall', 1, 9, '{}'],
      ['faqs', 'Helpful Guest FAQs', 1, 10, JSON.stringify({
        questions: [
          { q: 'Is Halal food served?', a: 'Yes, 100% gourmet Halal cuisine will be served with separate vegetarian options.' },
          { q: 'Are prayer facilities available?', a: 'Dedicated Maghrib and Isha prayer rooms are reserved for gentlemen and ladies.' }
        ]
      })],
      ['thank_you', 'JazakAllah Khair & Gratitude', 1, 11, '{}']
    ];

    muslimSections.forEach(([key, title, enabled, order, content]) => {
      insertSection.run(eventId, key, title, enabled, order, content);
    });

    // Muslim Wedding Functions
    const muslimFunctions = [
      ['dholki', 'Dholki & Mayun Night', 'Folk Tappay & Haldi Ubtan', 'Nov 18, 2026 • 07:00 PM', 'Siddiqui Courtyard', 'Sunny Ochre & Marigold', JSON.stringify(['#FFB300', '#FFF59D']), 'assets/images/haldi_couple.jpg', 'Traditional dholak rhythms, laughter, and soothing ubtan blessings.', 0],
      ['mehendi', 'Mehendi Celebration', 'Henna & Festive Attire', 'Nov 19, 2026 • 06:30 PM', 'Emerald Pavilion', 'Forest Green & Olive', JSON.stringify(['#2E7D32', '#A5D6A7']), 'assets/images/mehendi_couple.jpg', 'Artisan henna artists, live sufi acoustics, and sweet jalebis.', 1],
      ['nikah', 'The Sacred Nikah Ceremony', 'Ijab-e-Qubool & Dua', 'Nov 20, 2026 • 04:30 PM', 'Grand Noor Hall', 'Ivory White, Sage & Gold', JSON.stringify(['#FFFFFF', '#D4AF37', '#81C784']), 'assets/images/muslim_couple.jpg', 'The sacred marriage contract solemnized by the Imam, followed by dates and milk sharbat.', 2],
      ['walima', 'Grand Walima Banquet', 'A Night of Elegance & Gratitude', 'Nov 21, 2026 • 07:30 PM', 'The Palace Royal Ballroom', 'Navy, Emerald & Champagne Gold', JSON.stringify(['#1A237E', '#004D40', '#D4AF37']), 'assets/images/reception_couple.jpg', 'An opulent banquet feast hosted by the groom’s family to celebrate our union.', 3]
    ];

    muslimFunctions.forEach(([fkey, title, sub, dt, ven, dc, pal, ill, desc, order]) => {
      insertFunction.run(eventId, fkey, title, sub, dt, ven, dc, pal, ill, desc, order);
    });

    console.log('Seeded Muslim Wedding template (zain-ayla-nikah)');
  }

  // ============================================================
  // TEMPLATE 3: BIRTHDAY CELEBRATION (Sophia's Sweet 16)
  // ============================================================
  const existingBday = db.prepare('SELECT id FROM events WHERE slug = ?').get('arias-sweet-16');
  if (!existingBday) {
    const insertEvent = db.prepare(`
      INSERT INTO events (owner_user_id, slug, event_type, title, headline, primary_names, event_date, venue_name, venue_address, venue_map_url, visibility, theme_id, hero_image_url, hashtag)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    const result = insertEvent.run(
      userId,
      'arias-sweet-16',
      'birthday',
      "Aria's Sweet 16 Birthday Extravaganza",
      'Sparkles, Dancing, Laughter, and Sweet Memories',
      'Aria',
      '2026-10-18',
      'The Glasshouse Lounge & Terrace',
      'Skyline Promenade, Bandra West, Mumbai',
      'https://maps.google.com/?q=Bandra+West+Mumbai',
      'public',
      'luxury_pastel',
      'assets/images/birthday_hero.jpg',
      '#Sweet16WithAria'
    );
    const eventId = result.lastInsertRowid;

    // Birthday Sections
    const bdaySections = [
      ['hero', 'Welcome Banner', 1, 0, JSON.stringify({ subtitle: "You're Invited To Celebrate!", tagline: "Turning 16 with a bang!" })],
      ['reveal', 'Mystery Scratch Card & Date', 1, 1, JSON.stringify({ scratchText: 'OCTOBER 18, 2026 • THE GLASSHOUSE LOUNGE' })],
      ['events', 'Party Itinerary', 1, 2, '{}'],
      ['gallery', 'Memories & Photo Highlights', 1, 3, JSON.stringify({
        photos: [
          { src: 'assets/images/birthday_hero.jpg', caption: 'Aria’s Birthday Cake & Crown' }
        ]
      })],
      ['venue', 'Party Venue & Map', 1, 4, '{}'],
      ['dress_code', 'Party Dress Code', 1, 5, JSON.stringify({ note: 'Pastel Chic, Glitter & Cocktail Attire' })],
      ['registry', 'Wishlist & Gifts', 1, 6, JSON.stringify({ note: 'Your presence is the best gift! If you wish to contribute to Aria’s college book fund or photography dreams, links are provided.' })],
      ['rsvp', 'Party RSVP', 1, 7, '{}'],
      ['guestbook', 'Birthday Wishes Wall', 1, 8, '{}'],
      ['faqs', 'Party FAQs', 1, 9, JSON.stringify({
        questions: [
          { q: 'Is there parking at the venue?', a: 'Yes, valet parking is provided at the entrance.' },
          { q: 'Can I bring a +1?', a: 'Please specify in your RSVP so we can reserve seats.' }
        ]
      })],
      ['thank_you', 'Thank You Note', 1, 10, '{}']
    ];

    bdaySections.forEach(([key, title, enabled, order, content]) => {
      insertSection.run(eventId, key, title, enabled, order, content);
    });

    // Birthday Party Activities / Functions
    const bdayFunctions = [
      ['welcome', 'Red Carpet Welcome & Mocktails', 'Arrivals & Photo Booth', 'Oct 18, 2026 • 06:00 PM', 'Glasshouse Foyer', 'Pastel Glam', JSON.stringify(['#F8BBD0', '#E1BEE7']), 'assets/images/birthday_hero.jpg', 'Signature mocktails, glitter polaroid photo booth, and red carpet walk.', 0],
      ['games', 'Trivia & Interactive Games', 'Fun Challenges & Prizes', 'Oct 18, 2026 • 07:00 PM', 'Main Lounge', 'Party Chic', JSON.stringify(['#FFD54F', '#80DEEA']), 'assets/images/first_date_couple.jpg', 'Hilarious childhood trivia, musical chairs remix, and cute prizes.', 1],
      ['cake_cutting', 'Grand Cake Cutting Ceremony', 'Make a Wish & Candle Blow', 'Oct 18, 2026 • 08:15 PM', 'The Cake Stage', 'Shimmer & Shine', JSON.stringify(['#F48FB1', '#FFD700']), 'assets/images/birthday_hero.jpg', '3-tier handcrafted strawberry macaron cake, confetti cannons, and cheers!', 2],
      ['dinner', 'Gourmet Dinner & Dessert Buffet', 'Artisanal Street & Italian Cuisine', 'Oct 18, 2026 • 08:45 PM', 'Terrace Banquet', 'Casual Chic', JSON.stringify(['#A5D6A7', '#FFE082']), 'assets/images/reception_couple.jpg', 'Wood-fired pizzas, taco bar, gourmet sliders, and warm churros station.', 3],
      ['entertainment', 'DJ Dance Floor Madness', 'Beat Drops & Glow Sticks', 'Oct 18, 2026 • 09:30 PM', 'Neon Ballroom', 'Dancing Shoes Required', JSON.stringify(['#BA68C8', '#4FC3F7']), 'assets/images/sangeet_couple.jpg', 'DJ playing top hits, neon glow sticks, and dancing till midnight!', 4]
    ];

    bdayFunctions.forEach(([fkey, title, sub, dt, ven, dc, pal, ill, desc, order]) => {
      insertFunction.run(eventId, fkey, title, sub, dt, ven, dc, pal, ill, desc, order);
    });

    console.log('Seeded Birthday template (arias-sweet-16)');
  }

  console.log('Database seeding finished successfully!');
}

if (require.main === module) {
  seedDatabase();
}

module.exports = { seedDatabase };
