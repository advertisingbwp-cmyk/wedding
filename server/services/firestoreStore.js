/**
 * CLOUD FIRESTORE DATA STORE SERVICE
 * Handles persistent multi-tenant event website data in Cloud Firestore.
 * 
 * Collections:
 * - users/{uid}
 * - templates/{templateId}
 * - events/{eventId}
 * - events/{eventId}/sections/{sectionId}
 * - events/{eventId}/functions/{functionId}
 * - events/{eventId}/members/{uid}
 * - events/{eventId}/rsvps/{rsvpId}
 * - events/{eventId}/guestbook/{messageId}
 */

const { firestore } = require('../config/firebaseAdmin');

// Canonical Curated Templates
const CANONICAL_TEMPLATES = {
  indian_wedding: {
    id: 'indian_wedding',
    slug: 'vijay-rashima-wedding',
    templateId: 'indian_wedding',
    eventType: 'indian_wedding',
    event_type: 'indian_wedding',
    title: 'Vijay & Rashima Wedding Celebration',
    headline: 'Two Souls, Two Families, Bound by Love and Sacred Traditions',
    primary_names: 'Vijay & Rashima',
    event_date: '2026-11-24',
    venue_name: 'The Leela Palace & Royal Heritage Grounds',
    venue_address: 'Lake Pichola Road, Udaipur, Rajasthan 313001',
    venue_map_url: 'https://maps.google.com/?q=The+Leela+Palace+Udaipur',
    theme_id: 'luxury_pastel',
    hero_image_url: 'assets/images/hero_couple.jpg',
    hashtag: '#VijayWedsRashima',
    isTemplate: true,
    isPublic: true,
    description: 'Pre-configured with Haldi, Mehendi, Sangeet, Sacred Mandap Wedding, and Grand Reception. Featuring photorealistic editorial photography.',
    sections: [
      { id: 'hero', section_key: 'hero', title: 'Welcome Banner', is_enabled: true, sort_order: 0, custom_content_json: JSON.stringify({ subtitle: 'We Invite You to Share Our Joy', quote: 'Two souls, one destiny. Celebrate our beginning.' }) },
      { id: 'reveal', section_key: 'reveal', title: 'Secret Date Reveal & Scratch Card', is_enabled: true, sort_order: 1, custom_content_json: JSON.stringify({ scratchText: 'NOVEMBER 24, 2026 • THE LEELA PALACE, UDAIPUR' }) },
      { id: 'story', section_key: 'story', title: 'Our Love Story', is_enabled: true, sort_order: 2, custom_content_json: JSON.stringify({
        milestones: [
          { title: 'A Serendipitous Coffee in Mumbai', date: 'October 2021', desc: 'A rainy afternoon, two cups of filter coffee, and an effortless conversation that stretched into hours.', img: 'assets/images/first_date_couple.jpg' },
          { title: 'The Sunset Proposal at Udaipur', date: 'December 2025', desc: 'Overlooking Lake Pichola as the palace lights mirrored on still waters, Vijay went down on one knee.', img: 'assets/images/proposal_couple.jpg' },
          { title: 'The Sacred Vows Ahead', date: 'November 2026', desc: 'Surrounded by seven sacred flames, ancient mantras, and our dearest loved ones.', img: 'assets/images/reception_couple.jpg' }
        ]
      }) },
      { id: 'events', section_key: 'events', title: 'Celebration Itinerary & Functions', is_enabled: true, sort_order: 3, custom_content_json: '{}' },
      { id: 'gallery', section_key: 'gallery', title: 'Editorial Photo Gallery', is_enabled: true, sort_order: 4, custom_content_json: JSON.stringify({
        photos: [
          { src: 'assets/images/hero_couple.jpg', caption: 'Palace Courtyard Editorial Portrait' },
          { src: 'assets/images/haldi_couple.jpg', caption: 'Joyful Haldi Ceremony Moments' },
          { src: 'assets/images/mehendi_couple.jpg', caption: 'Artisan Henna Application' },
          { src: 'assets/images/sangeet_couple.jpg', caption: 'Choreographed Sangeet Performance' },
          { src: 'assets/images/wedding_couple.jpg', caption: 'The Sacred Varmala Ritual' },
          { src: 'assets/images/reception_couple.jpg', caption: 'Grand Reception Elegance' }
        ]
      }) },
      { id: 'venue', section_key: 'venue', title: 'Venue Location & Map', is_enabled: true, sort_order: 5, custom_content_json: '{}' },
      { id: 'family', section_key: 'family', title: 'Hosts & Family Tree', is_enabled: true, sort_order: 6, custom_content_json: JSON.stringify({
        members: [
          { name: 'Dr. Anand & Mrs. Sunita Sharma', role: 'Parents of the Groom', relation: 'Groom Family' },
          { name: 'Mr. Rajesh & Mrs. Meenakshi Verma', role: 'Parents of the Bride', relation: 'Bride Family' },
          { name: 'Rohan Sharma', role: 'Best Man / Brother of Groom', relation: 'Sibling' }
        ]
      }) },
      { id: 'dress_code', section_key: 'dress_code', title: 'Dress Codes & Styling Guide', is_enabled: true, sort_order: 7, custom_content_json: JSON.stringify({
        guidelines: [
          { event: 'Haldi', attire: 'Bright Yellow, Mustard & Raw Silk Tones' },
          { event: 'Mehendi', attire: 'Forest Green, Mint & Floral Lehengas' },
          { event: 'Sangeet', attire: 'Glam Indo-Western, Royal Blue & Rose Gold' },
          { event: 'Sacred Mandap', attire: 'Traditional Heritage Festive (Gold, Ivory, Crimson)' },
          { event: 'Reception', attire: 'Black Tie, Formal Sherwani or Evening Gowns' }
        ]
      }) },
      { id: 'travel', section_key: 'travel', title: 'Travel & Accommodation Guide', is_enabled: true, sort_order: 8, custom_content_json: JSON.stringify({
        airports: 'Maharana Pratap Airport (UDR) — 45 mins from venue',
        hotels: 'Complimentary luxury suites reserved for all confirmed guests at The Leela Palace.',
        transfers: 'Chauffeured airport shuttle cars scheduled upon RSVP confirmation.'
      }) },
      { id: 'registry', section_key: 'registry', title: 'Gift Registry & Blessings', is_enabled: true, sort_order: 9, custom_content_json: JSON.stringify({
        note: 'Your presence and heartfelt blessings are our most treasured gifts. If you insist on honoring us, contributions to our chosen education charity are deeply appreciated.',
        charityName: 'Smile Foundation — Child Education Initiative'
      }) },
      { id: 'rsvp', section_key: 'rsvp', title: 'Guest RSVP', is_enabled: true, sort_order: 10, custom_content_json: '{}' },
      { id: 'guestbook', section_key: 'guestbook', title: 'Wishes Wall & Blessings', is_enabled: true, sort_order: 11, custom_content_json: '{}' },
      { id: 'faqs', section_key: 'faqs', title: 'Frequently Asked Questions', is_enabled: true, sort_order: 12, custom_content_json: JSON.stringify({
        questions: [
          { q: 'Can I bring a plus one or children?', a: 'Yes! Please indicate your total party count when filling the RSVP form.' },
          { q: 'Is valet parking available?', a: 'Complimentary valet is stationed at the Grand Porte Cochere.' }
        ]
      }) }
    ],
    functions: [
      { id: 'haldi', function_key: 'haldi', title: 'Auspicious Haldi Ceremony', subtitle: 'Turmeric Glow & Marigold Showers', date_time: 'Nov 22, 2026 • 10:30 AM', venue_name: 'Sunrise Courtyard, The Leela', dress_code: 'Yellow & Ochre Traditional', palette_colors_json: JSON.stringify(['#FFC107', '#FFF3E0', '#FF9800']), illustration_url: 'assets/images/haldi_couple.jpg', description: 'Fresh turmeric paste blessings, traditional folk dholak, and marigold petal celebrations.', sort_order: 0 },
      { id: 'mehendi', function_key: 'mehendi', title: 'Artisan Mehendi Soirée', subtitle: 'Henna Swirls & Folk Melodies', date_time: 'Nov 22, 2026 • 04:30 PM', venue_name: 'The Poolside Pavilion', dress_code: 'Emerald & Mint Greens', palette_colors_json: JSON.stringify(['#2E7D32', '#E8F5E9', '#81C784']), illustration_url: 'assets/images/mehendi_couple.jpg', description: 'Artisan bridal henna application, live bangles artisan stall, and high-tea treats.', sort_order: 1 },
      { id: 'sangeet', function_key: 'sangeet', title: 'Glitz & Glam Sangeet Night', subtitle: 'Dance Battles & Live Performances', date_time: 'Nov 23, 2026 • 07:00 PM', venue_name: 'The Grand Mewar Ballroom', dress_code: 'Indo-Western Glitz & Sparkle', palette_colors_json: JSON.stringify(['#1A237E', '#E8EAF6', '#D4AF37']), illustration_url: 'assets/images/sangeet_couple.jpg', description: 'Family dance performances, live percussion troupe, cocktail bar, and DJ afterparty.', sort_order: 2 },
      { id: 'mandap', function_key: 'mandap', title: 'The Sacred Mandap Ceremony', subtitle: 'Vedic Pheras & Eternal Vows', date_time: 'Nov 24, 2026 • 10:00 AM', venue_name: 'The Lakeside Island Mandap', dress_code: 'Regal Heritage & Pastel Gold', palette_colors_json: JSON.stringify(['#B71C1C', '#FFFDE7', '#D4AF37']), illustration_url: 'assets/images/wedding_couple.jpg', description: 'Vedic rituals, Varmala garland exchange over lake water, and seven sacred rounds.', sort_order: 3 },
      { id: 'reception', function_key: 'reception', title: 'The Grand Royal Reception', subtitle: 'Banquet Dinner & Toasting', date_time: 'Nov 24, 2026 • 07:30 PM', venue_name: 'The Royal Palace Lawns', dress_code: 'Formal Black-Tie & Tuxedos', palette_colors_json: JSON.stringify(['#212121', '#FAFAFA', '#D4AF37']), illustration_url: 'assets/images/reception_couple.jpg', description: 'Gourmet banquet dinner featuring royal Rajasthani and global cuisine.', sort_order: 4 }
    ]
  },

  muslim_wedding: {
    id: 'muslim_wedding',
    slug: 'zain-ayla-nikah',
    templateId: 'muslim_wedding',
    eventType: 'muslim_wedding',
    event_type: 'muslim_wedding',
    title: 'Zain & Ayla Sacred Nikah Celebration',
    headline: 'And We Created You in Pairs — Surah An-Naba',
    primary_names: 'Zain & Ayla',
    event_date: '2026-11-20',
    venue_name: 'Grand Noor Convention Center & Banquet',
    venue_address: 'Al-Madina Avenue, Noor Park Estate',
    venue_map_url: 'https://maps.google.com/?q=Grand+Noor+Convention+Center',
    theme_id: 'islamic_emerald',
    hero_image_url: 'assets/images/muslim_couple.jpg',
    hashtag: '#ZainAylaNikah',
    isTemplate: true,
    isPublic: true,
    description: 'Dholki, Mehendi, Sacred Nikah & Grand Walima with emerald, ivory, and gold elegance.',
    sections: [
      { id: 'hero', section_key: 'hero', title: 'Welcome Banner', is_enabled: true, sort_order: 0, custom_content_json: JSON.stringify({ subtitle: 'Bismillah-ir-Rahman-ir-Rahim', quote: 'And among His signs is that He created for you spouses from among yourselves.' }) },
      { id: 'reveal', section_key: 'reveal', title: 'The Sacred Date Reveal', is_enabled: true, sort_order: 1, custom_content_json: JSON.stringify({ scratchText: 'NOVEMBER 20, 2026 • GRAND NOOR CONVENTION CENTER' }) },
      { id: 'events', section_key: 'events', title: 'Nikah & Walima Itinerary', is_enabled: true, sort_order: 2, custom_content_json: '{}' },
      { id: 'gallery', section_key: 'gallery', title: 'Celebration Photography', is_enabled: true, sort_order: 3, custom_content_json: JSON.stringify({
        photos: [
          { src: 'assets/images/muslim_couple.jpg', caption: 'Nikah Couple Portrait in Emerald & White' },
          { src: 'assets/images/mehendi_couple.jpg', caption: 'Mehendi Ceremony Festivities' },
          { src: 'assets/images/reception_couple.jpg', caption: 'Walima Banquet Splendor' }
        ]
      }) },
      { id: 'venue', section_key: 'venue', title: 'Venue Location & Prayer Amenities', is_enabled: true, sort_order: 4, custom_content_json: '{}' },
      { id: 'dress_code', section_key: 'dress_code', title: 'Modest Dress Guide', is_enabled: true, sort_order: 5, custom_content_json: '{}' },
      { id: 'registry', section_key: 'registry', title: 'Duas & Gift Information', is_enabled: true, sort_order: 6, custom_content_json: '{}' },
      { id: 'rsvp', section_key: 'rsvp', title: 'Guest RSVP', is_enabled: true, sort_order: 7, custom_content_json: '{}' },
      { id: 'guestbook', section_key: 'guestbook', title: 'Warm Duas & Messages', is_enabled: true, sort_order: 8, custom_content_json: '{}' },
      { id: 'faqs', section_key: 'faqs', title: 'Guest FAQs', is_enabled: true, sort_order: 9, custom_content_json: JSON.stringify({
        questions: [
          { q: 'Are prayers accommodated at the venue?', a: 'Yes, designated prayer areas for men and women are available.' },
          { q: 'What is the dress code?', a: 'Modest formal wear in emerald, gold, ivory, or pastel tones.' }
        ]
      }) }
    ],
    functions: [
      { id: 'dholki', function_key: 'dholki', title: 'Dholki & Mayun Night', subtitle: 'Folk Tappay & Ubtan Ceremony', date_time: 'Nov 18, 2026 • 07:00 PM', venue_name: 'Siddiqui Family Courtyard', dress_code: 'Ochre, Mustard & Marigold', palette_colors_json: JSON.stringify(['#FFB300', '#FFF59D', '#FFE082']), illustration_url: 'assets/images/haldi_couple.jpg', description: 'Traditional dholak rhythms, ubtan blessings, and family folk singing.', sort_order: 0 },
      { id: 'mehendi', function_key: 'mehendi', title: 'Mehendi Celebration', subtitle: 'Henna & Festive Elegance', date_time: 'Nov 19, 2026 • 06:30 PM', venue_name: 'Emerald Pavilion', dress_code: 'Forest Green & Olive', palette_colors_json: JSON.stringify(['#2E7D32', '#A5D6A7', '#1B5E20']), illustration_url: 'assets/images/mehendi_couple.jpg', description: 'Artisan henna application, live sufi melodies, and traditional feast.', sort_order: 1 },
      { id: 'nikah', function_key: 'nikah', title: 'The Sacred Nikah Ceremony', subtitle: 'Ijab-e-Qubool & Khutbah', date_time: 'Nov 20, 2026 • 04:30 PM', venue_name: 'Grand Noor Hall', dress_code: 'Ivory, White & Soft Gold', palette_colors_json: JSON.stringify(['#FFFFFF', '#D4AF37', '#004D40']), illustration_url: 'assets/images/muslim_couple.jpg', description: 'Solemnization of the sacred marriage contract followed by dua.', sort_order: 2 },
      { id: 'walima', function_key: 'walima', title: 'Grand Walima Banquet', subtitle: 'A Night of Elegance & Gratitude', date_time: 'Nov 21, 2026 • 07:30 PM', venue_name: 'The Crystal Ballroom', dress_code: 'Navy & Champagne', palette_colors_json: JSON.stringify(['#1A237E', '#D4AF37', '#F5F5F5']), illustration_url: 'assets/images/reception_couple.jpg', description: 'Opulent banquet reception hosted with gratitude by the groom’s family.', sort_order: 3 }
    ]
  },

  birthday: {
    id: 'birthday',
    slug: 'arias-sweet-16',
    templateId: 'birthday',
    eventType: 'birthday',
    event_type: 'birthday',
    title: "Aria's Sweet 16 Neon Sparkle Bash",
    headline: 'Celebrating 16 Years of Magic, Laughter & Joy!',
    primary_names: 'Aria',
    event_date: '2026-10-18',
    venue_name: 'Skyline Terrace Lounge & Penthouse',
    venue_address: 'Penthouse Level, Grand Tower, City Center',
    venue_map_url: 'https://maps.google.com/?q=Grand+Tower+City+Center',
    theme_id: 'princess_pink',
    hero_image_url: 'assets/images/birthday_hero.jpg',
    hashtag: '#AriaSweet16',
    isTemplate: true,
    isPublic: true,
    description: 'Welcome mocktails, party games, cake cutting, buffet dinner, and DJ dance party with realistic photography.',
    sections: [
      { id: 'hero', section_key: 'hero', title: 'Welcome Banner', is_enabled: true, sort_order: 0, custom_content_json: JSON.stringify({ subtitle: "Chapter 16: Let's Glow!", quote: 'Join us for an unforgettable night of music, confetti, and sweet memories.' }) },
      { id: 'reveal', section_key: 'reveal', title: 'Mystery Scratch Card & Date', is_enabled: true, sort_order: 1, custom_content_json: JSON.stringify({ scratchText: 'OCTOBER 18, 2026 • SKYLINE TERRACE LOUNGE' }) },
      { id: 'events', section_key: 'events', title: 'Party Itinerary & Activities', is_enabled: true, sort_order: 2, custom_content_json: '{}' },
      { id: 'gallery', section_key: 'gallery', title: 'Photo Highlights', is_enabled: true, sort_order: 3, custom_content_json: JSON.stringify({
        photos: [
          { src: 'assets/images/birthday_hero.jpg', caption: 'Sweet 16 Birthday Portrait' },
          { src: 'assets/images/first_date_couple.jpg', caption: 'Childhood Memories' },
          { src: 'assets/images/reception_couple.jpg', caption: 'Party Vibes' }
        ]
      }) },
      { id: 'venue', section_key: 'venue', title: 'Party Venue & Map', is_enabled: true, sort_order: 4, custom_content_json: '{}' },
      { id: 'dress_code', section_key: 'dress_code', title: 'Party Dress Code', is_enabled: true, sort_order: 5, custom_content_json: '{}' },
      { id: 'registry', section_key: 'registry', title: 'Wishlist & Gift Links', is_enabled: true, sort_order: 6, custom_content_json: '{}' },
      { id: 'rsvp', section_key: 'rsvp', title: 'Party RSVP', is_enabled: true, sort_order: 7, custom_content_json: '{}' },
      { id: 'guestbook', section_key: 'guestbook', title: 'Birthday Wishes Wall', is_enabled: true, sort_order: 8, custom_content_json: '{}' },
      { id: 'faqs', section_key: 'faqs', title: 'Party FAQs', is_enabled: true, sort_order: 9, custom_content_json: JSON.stringify({
        questions: [
          { q: 'Is there parking at the venue?', a: 'Yes, complimentary valet parking is provided at the main entrance.' },
          { q: 'What is the theme?', a: 'Neon Sparkle & Pastel Glam!' }
        ]
      }) }
    ],
    functions: [
      { id: 'welcome', function_key: 'welcome', title: 'Red Carpet Welcome & Mocktails', subtitle: 'Arrivals & Photo Booth', date_time: 'Oct 18, 2026 • 06:00 PM', venue_name: 'Glasshouse Foyer', dress_code: 'Pastel Glam', palette_colors_json: JSON.stringify(['#F8BBD0', '#E1BEE7']), illustration_url: 'assets/images/birthday_hero.jpg', description: 'Signature mocktails, glitter polaroid photo booth, and red carpet walk.', sort_order: 0 },
      { id: 'games', function_key: 'games', title: 'Trivia & Interactive Games', subtitle: 'Fun Challenges & Prizes', date_time: 'Oct 18, 2026 • 07:00 PM', venue_name: 'Main Lounge', dress_code: 'Party Chic', palette_colors_json: JSON.stringify(['#FFD54F', '#80DEEA']), illustration_url: 'assets/images/first_date_couple.jpg', description: 'Hilarious childhood trivia, musical chairs remix, and cute prizes.', sort_order: 1 },
      { id: 'cake_cutting', function_key: 'cake_cutting', title: 'Grand Cake Cutting Ceremony', subtitle: 'Make a Wish & Candle Blow', date_time: 'Oct 18, 2026 • 08:15 PM', venue_name: 'The Cake Stage', dress_code: 'Shimmer & Shine', palette_colors_json: JSON.stringify(['#F48FB1', '#FFD700']), illustration_url: 'assets/images/birthday_hero.jpg', description: '3-tier handcrafted strawberry macaron cake, confetti cannons, and cheers!', sort_order: 2 },
      { id: 'dinner', function_key: 'dinner', title: 'Gourmet Dinner & Dessert Buffet', subtitle: 'Artisanal Street & Italian Cuisine', date_time: 'Oct 18, 2026 • 08:45 PM', venue_name: 'Terrace Banquet', dress_code: 'Casual Chic', palette_colors_json: JSON.stringify(['#A5D6A7', '#FFE082']), illustration_url: 'assets/images/reception_couple.jpg', description: 'Wood-fired pizzas, taco bar, gourmet sliders, and warm churros station.', sort_order: 3 },
      { id: 'entertainment', function_key: 'entertainment', title: 'DJ Dance Floor Madness', subtitle: 'Beat Drops & Glow Sticks', date_time: 'Oct 18, 2026 • 09:30 PM', venue_name: 'Neon Ballroom', dress_code: 'Dancing Shoes Required', palette_colors_json: JSON.stringify(['#BA68C8', '#4FC3F7']), illustration_url: 'assets/images/sangeet_couple.jpg', description: 'DJ playing top hits, neon glow sticks, and dancing till midnight!', sort_order: 4 }
    ]
  }
};

const FirestoreStore = {
  // Canonical templates
  getCanonicalTemplate(templateIdOrSlug) {
    if (CANONICAL_TEMPLATES[templateIdOrSlug]) return CANONICAL_TEMPLATES[templateIdOrSlug];
    return Object.values(CANONICAL_TEMPLATES).find(t => t.slug === templateIdOrSlug) || null;
  },

  getAllTemplates() {
    return Object.values(CANONICAL_TEMPLATES).map(t => ({
      id: t.id,
      slug: t.slug,
      eventType: t.eventType,
      title: t.title,
      headline: t.headline,
      primary_names: t.primary_names,
      event_date: t.event_date,
      venue_name: t.venue_name,
      hero_image_url: t.hero_image_url,
      description: t.description,
      isPublic: true,
      isTemplate: true
    }));
  },

  // Seed / ensure templates exist in Firestore templates/{templateId}
  async seedTemplatesIfMissing() {
    try {
      for (const [id, tpl] of Object.entries(CANONICAL_TEMPLATES)) {
        const docRef = firestore.collection('templates').doc(id);
        const snap = await docRef.get();
        if (!snap.exists) {
          await docRef.set({
            ...tpl,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          });
        }
      }
    } catch (e) {
      console.warn('Template seed note:', e.message);
    }
  },

  // Clone Template -> New Draft Event owned by req.user.uid
  async cloneTemplate(templateId, user) {
    if (!user || !user.uid) {
      throw new Error('Please sign in to create your private event website.');
    }

    const tpl = this.getCanonicalTemplate(templateId);
    if (!tpl) {
      throw new Error('Selected template not found.');
    }

    // Generate unique event ID & slug
    const cleanNames = user.full_name || 'My Celebration';
    const baseSlug = cleanNames.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    const uniqueSuffix = Date.now().toString().slice(-6);
    const eventSlug = `${baseSlug || 'celebration'}-${uniqueSuffix}`;
    const newEventId = `ev_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

    // Safe Event Document
    const eventPayload = {
      id: newEventId,
      ownerId: user.uid,
      owner_user_id: user.uid,
      slug: eventSlug,
      eventType: tpl.eventType,
      event_type: tpl.eventType,
      title: `${cleanNames} — ${tpl.eventType === 'birthday' ? 'Birthday Celebration' : 'Wedding Celebration'}`,
      headline: tpl.headline,
      primary_names: cleanNames,
      event_date: tpl.event_date,
      venue_name: tpl.venue_name,
      venue_address: tpl.venue_address,
      venue_map_url: tpl.venue_map_url,
      theme_id: tpl.theme_id,
      hero_image_url: tpl.hero_image_url,
      hashtag: `#${cleanNames.replace(/[^a-zA-Z0-9]/g, '')}`,
      visibility: 'draft',
      isTemplate: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    // Save event doc
    await firestore.collection('events').doc(newEventId).set(eventPayload);

    // Copy sections subcollection
    const sectionsCol = firestore.collection('events').doc(newEventId).collection('sections');
    for (const sec of tpl.sections) {
      await sectionsCol.doc(sec.id || sec.section_key).set({
        section_key: sec.section_key,
        title: sec.title,
        is_enabled: sec.is_enabled !== false,
        sort_order: sec.sort_order || 0,
        custom_content_json: sec.custom_content_json || '{}',
        updatedAt: new Date().toISOString()
      });
    }

    // Copy functions subcollection
    const functionsCol = firestore.collection('events').doc(newEventId).collection('functions');
    for (const func of tpl.functions) {
      await functionsCol.doc(func.id || func.function_key).set({
        function_key: func.function_key,
        title: func.title,
        subtitle: func.subtitle || '',
        date_time: func.date_time || '',
        venue_name: func.venue_name || '',
        dress_code: func.dress_code || '',
        palette_colors_json: func.palette_colors_json || '[]',
        illustration_url: func.illustration_url || '',
        description: func.description || '',
        sort_order: func.sort_order || 0,
        updatedAt: new Date().toISOString()
      });
    }

    // Add owner to members subcollection
    await firestore.collection('events').doc(newEventId).collection('members').doc(user.uid).set({
      uid: user.uid,
      role: 'owner',
      addedAt: new Date().toISOString()
    });

    return {
      eventId: newEventId,
      slug: eventSlug,
      title: eventPayload.title,
      message: 'Your template is ready. Add your names, date, venue, photos, and functions.'
    };
  },

  // Fetch events for a user
  async getUserEvents(uid) {
    const eventsRef = firestore.collection('events');
    const snap = await eventsRef.where('ownerId', '==', uid).get();
    const userEvents = snap.docs.map(d => ({ id: d.id, ...d.data(), user_role: 'owner' }));

    // Sort descending by createdAt
    userEvents.sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || ''));
    return userEvents;
  },

  // Get full event details
  async getEventWithDetails(eventId, requestingUid = null) {
    const docRef = firestore.collection('events').doc(eventId);
    const snap = await docRef.get();

    if (!snap.exists) {
      return null;
    }

    const event = { id: snap.id, ...snap.data() };

    // Determine role
    let role = 'guest';
    if (requestingUid && event.ownerId === requestingUid) {
      role = 'owner';
    } else if (requestingUid) {
      const memberSnap = await docRef.collection('members').doc(requestingUid).get().catch(() => null);
      if (memberSnap && memberSnap.exists) {
        role = memberSnap.data().role || 'viewer';
      }
    }

    // Fetch sections
    const secSnap = await docRef.collection('sections').get();
    const sections = secSnap.docs.map(d => ({ id: d.id, ...d.data() }));
    sections.sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0));

    // Fetch functions
    const funcSnap = await docRef.collection('functions').get();
    const functions = funcSnap.docs.map(d => ({ id: d.id, ...d.data() }));
    functions.sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0));

    return {
      event,
      sections,
      functions,
      role
    };
  },

  // Update Event
  async updateEvent(eventId, uid, updates) {
    const docRef = firestore.collection('events').doc(eventId);
    const snap = await docRef.get();
    if (!snap.exists) throw new Error('Event not found.');

    const eventData = snap.data();
    if (eventData.ownerId !== uid) {
      // Check editor role
      const memberSnap = await docRef.collection('members').doc(uid).get().catch(() => null);
      if (!memberSnap || !memberSnap.exists || memberSnap.data().role !== 'editor') {
        throw new Error('You do not have permission to edit this celebration.');
      }
      // Editors cannot change ownership or visibility
      delete updates.ownerId;
      delete updates.visibility;
    }

    // Protect immutable fields
    delete updates.id;
    delete updates.ownerId;
    delete updates.createdAt;
    updates.updatedAt = new Date().toISOString();

    await docRef.update(updates);
    return { ok: true };
  },

  // Delete Event (Owner only)
  async deleteEvent(eventId, uid) {
    const docRef = firestore.collection('events').doc(eventId);
    const snap = await docRef.get();
    if (!snap.exists) throw new Error('Event not found.');

    if (snap.data().ownerId !== uid) {
      throw new Error('Only the event owner can delete this event.');
    }

    await docRef.delete();
    return { ok: true };
  }
};

module.exports = FirestoreStore;
