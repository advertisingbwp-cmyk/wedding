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

// 18 Canonical Curated Templates with original content and styling
const CANONICAL_TEMPLATES = {
  // --- 8 INDIAN WEDDING TEMPLATES ---
  royal_mandap: {
    id: 'royal_mandap',
    slug: 'aditya-radhika-mandap',
    templateId: 'royal_mandap',
    eventType: 'indian_wedding',
    event_type: 'indian_wedding',
    title: 'Aditya & Radhika Royal Mandap Ceremony',
    headline: 'Two Dynasties, Sacred Agni, and an Eternal Union of Souls',
    primary_names: 'Aditya & Radhika',
    event_date: '2026-12-10',
    venue_name: 'Umaid Bhawan Palace & Heritage Courtyard',
    venue_address: 'Circuit House Rd, Cantt Area, Jodhpur, Rajasthan 342006',
    venue_map_url: 'https://maps.google.com/?q=Umaid+Bhawan+Palace+Jodhpur',
    theme_id: 'royal_mandap_gold',
    hero_image_url: 'assets/images/wedding_couple.jpg',
    hashtag: '#AdityaWedsRadhika',
    isTemplate: true,
    isPublic: true,
    styleTags: ['Royal', 'Traditional', 'Luxury'],
    description: 'Grand royal palace setting with sacred Vedic rituals, regal vermillion and antique gold accents, and opulent courtyard ceremonies.',
    sections: [
      { id: 'hero', section_key: 'hero', title: 'Royal Welcome', is_enabled: true, sort_order: 0, custom_content_json: JSON.stringify({ subtitle: 'Under Royal Auspices', quote: 'Where centuries of royal heritage meet an everlasting promise of love.' }) },
      { id: 'reveal', section_key: 'reveal', title: 'Royal Date Reveal', is_enabled: true, sort_order: 1, custom_content_json: JSON.stringify({ scratchText: 'DECEMBER 10, 2026 • UMAID BHAWAN PALACE' }) },
      { id: 'story', section_key: 'story', title: 'The Royal Chronicle', is_enabled: true, sort_order: 2, custom_content_json: JSON.stringify({
        milestones: [
          { title: 'The Royal Polo Match Encounter', date: 'January 2022', desc: 'Introduced by royal families amid cheering polo grounds in Jodhpur.', img: 'assets/images/first_date_couple.jpg' },
          { title: 'The Lake Pichola Ring Exchange', date: 'November 2025', desc: 'Surrounded by illuminated palace walls, Aditya pledged his heart.', img: 'assets/images/proposal_couple.jpg' }
        ]
      }) },
      { id: 'events', section_key: 'events', title: 'Royal Ceremonies & Functions', is_enabled: true, sort_order: 3, custom_content_json: '{}' },
      { id: 'gallery', section_key: 'gallery', title: 'Royal Portraiture', is_enabled: true, sort_order: 4, custom_content_json: JSON.stringify({
        photos: [
          { src: 'assets/images/wedding_couple.jpg', caption: 'Sacred Mandap Saat Phere Ritual' },
          { src: 'assets/images/hero_couple.jpg', caption: 'Heritage Courtyard Portrait' },
          { src: 'assets/images/reception_couple.jpg', caption: 'Grand Reception Banquet' }
        ]
      }) },
      { id: 'venue', section_key: 'venue', title: 'Palace Grounds & Arrival Guide', is_enabled: true, sort_order: 5, custom_content_json: '{}' },
      { id: 'family', section_key: 'family', title: 'Royal Hosts & Lineage', is_enabled: true, sort_order: 6, custom_content_json: '{}' },
      { id: 'dress_code', section_key: 'dress_code', title: 'Regal Attire Guidelines', is_enabled: true, sort_order: 7, custom_content_json: JSON.stringify({
        guidelines: [
          { event: 'Sacred Mandap', attire: 'Deep Crimson, Brocade Sherwani & Royal Bandhani' },
          { event: 'Royal Banquet', attire: 'Formal Tuxedo or Zardozi Lehengas' }
        ]
      }) },
      { id: 'rsvp', section_key: 'rsvp', title: 'Royal Guest RSVP', is_enabled: true, sort_order: 8, custom_content_json: '{}' },
      { id: 'guestbook', section_key: 'guestbook', title: 'Royal Wishes & Blessings', is_enabled: true, sort_order: 9, custom_content_json: '{}' },
      { id: 'faqs', section_key: 'faqs', title: 'Guest FAQs & Royal Protocol', is_enabled: true, sort_order: 10, custom_content_json: '{}' }
    ],
    functions: [
      { id: 'roka', function_key: 'roka', title: 'Auspicious Roka & Shagun', subtitle: 'Royal Family Alliance', date_time: 'Dec 08, 2026 • 11:00 AM', venue_name: 'Zanana Courtyard', dress_code: 'Heritage Silk Kurta & Sarees', palette_colors_json: JSON.stringify(['#C2185B', '#FFF8E1']), illustration_url: 'assets/images/haldi_couple.jpg', description: 'Traditional dry fruit trays and royal Tilak blessings.', sort_order: 0 },
      { id: 'haldi', function_key: 'haldi', title: 'Marigold Haldi Ceremony', subtitle: 'Sunlit Turmeric Blessings', date_time: 'Dec 09, 2026 • 10:00 AM', venue_name: 'Palace Gardens', dress_code: 'Ochre Yellow & Raw Silk', palette_colors_json: JSON.stringify(['#FFB300', '#FFFDE7']), illustration_url: 'assets/images/haldi_couple_real.jpg', description: 'Fresh herbal turmeric paste applied with traditional folk chants.', sort_order: 1 },
      { id: 'mehendi', function_key: 'mehendi', title: 'Heritage Mehendi Soirée', subtitle: 'Detailed Zardozi Henna Art', date_time: 'Dec 09, 2026 • 04:00 PM', venue_name: 'Baradari Pavilion', dress_code: 'Emerald & Peacock Green', palette_colors_json: JSON.stringify(['#2E7D32', '#E8F5E9']), illustration_url: 'assets/images/mehendi_couple_real.jpg', description: 'Master henna artists creating intricate bridal designs.', sort_order: 2 },
      { id: 'sangeet', function_key: 'sangeet', title: 'Royal Sangeet & Musical Extravaganza', subtitle: 'Rajasthani Troupe & Dance', date_time: 'Dec 09, 2026 • 07:30 PM', venue_name: 'Grand Ballroom', dress_code: 'Sparkling Indo-Western', palette_colors_json: JSON.stringify(['#4A148C', '#EDE7F6']), illustration_url: 'assets/images/sangeet_couple.jpg', description: 'Spectacular choreographed performances and fireworks over the ramparts.', sort_order: 3 },
      { id: 'baraat', function_key: 'baraat', title: 'The Royal Baraat Procession', subtitle: 'Decorated Steeds & Royal Brass Band', date_time: 'Dec 10, 2026 • 04:00 PM', venue_name: 'Main Fort Gate to Courtyard', dress_code: 'Bandhgala & Safa (Turban)', palette_colors_json: JSON.stringify(['#B71C1C', '#D4AF37']), illustration_url: 'assets/images/wedding_couple.jpg', description: 'Grand arrival of the groom with ceremonial royal escorts.', sort_order: 4 },
      { id: 'mandap', function_key: 'mandap', title: 'The Sacred Vedic Mandap & Pheras', subtitle: 'Seven Sacred Vows Around Fire', date_time: 'Dec 10, 2026 • 06:30 PM', venue_name: 'Central Marble Mandap', dress_code: 'Regal Traditional & Gold', palette_colors_json: JSON.stringify(['#B71C1C', '#FFFDE7', '#D4AF37']), illustration_url: 'assets/images/wedding_couple.jpg', description: 'Vedic chants, Varmala exchange, and solemnizing the seven vows.', sort_order: 5 },
      { id: 'vidaai', function_key: 'vidaai', title: 'The Poignant Vidaai', subtitle: 'Blessings & Emotional Farewell', date_time: 'Dec 10, 2026 • 10:30 PM', venue_name: 'Palace Archway', dress_code: 'Traditional', palette_colors_json: JSON.stringify(['#D32F2F', '#FFFFFF']), illustration_url: 'assets/images/hero_couple.jpg', description: 'Rose petal showers as the bride embarks on her new life.', sort_order: 6 },
      { id: 'reception', function_key: 'reception', title: 'The Grand Imperial Reception', subtitle: 'Banquet & Champagne Toasting', date_time: 'Dec 11, 2026 • 08:00 PM', venue_name: 'Imperial Lawn & Crystal Pavilion', dress_code: 'Formal Black Tie & Tuxedo', palette_colors_json: JSON.stringify(['#212121', '#FAFAFA', '#D4AF37']), illustration_url: 'assets/images/reception_couple.jpg', description: 'Gourmet banquet dinner featuring royal Rajasthani and Michelin-curated menus.', sort_order: 7 }
    ]
  },

  marigold_bloom: {
    id: 'marigold_bloom',
    slug: 'ishaan-ananya-marigold',
    templateId: 'marigold_bloom',
    eventType: 'indian_wedding',
    event_type: 'indian_wedding',
    title: 'Ishaan & Ananya Marigold Bloom Celebration',
    headline: 'Bathed in Sunshine, Marigolds, and Heartwarming Traditions',
    primary_names: 'Ishaan & Ananya',
    event_date: '2026-11-15',
    venue_name: 'Amaryllis Heritage Farm & Floral Courtyards',
    venue_address: 'Mehrauli-Gurgaon Rd, Sultanpur, New Delhi 110030',
    venue_map_url: 'https://maps.google.com/?q=New+Delhi+Heritage+Farm',
    theme_id: 'marigold_ochre',
    hero_image_url: 'assets/images/haldi_couple_real.jpg',
    hashtag: '#IshaanAnanyaBloom',
    isTemplate: true,
    isPublic: true,
    styleTags: ['Floral', 'Traditional'],
    description: 'Vibrant outdoor floral extravaganza highlighting marigold yellow, saffron orange, rustic brass bells, and joyous open-air festivities.',
    sections: [
      { id: 'hero', section_key: 'hero', title: 'Marigold Welcome', is_enabled: true, sort_order: 0, custom_content_json: JSON.stringify({ subtitle: 'Sunshine & Petals', quote: 'A celebration wrapped in warmth, marigolds, and boundless laughter.' }) },
      { id: 'reveal', section_key: 'reveal', title: 'Celebration Date Reveal', is_enabled: true, sort_order: 1, custom_content_json: JSON.stringify({ scratchText: 'NOVEMBER 15, 2026 • AMARYLLIS FARM' }) },
      { id: 'story', section_key: 'story', title: 'Our Journey in Bloom', is_enabled: true, sort_order: 2, custom_content_json: JSON.stringify({
        milestones: [
          { title: 'College Fest in Delhi', date: 'March 2020', desc: 'Met at the annual cultural festival under yellow blossoming gulmohar trees.', img: 'assets/images/first_date_couple.jpg' },
          { title: 'Picnic in Lodhi Gardens', date: 'October 2024', desc: 'Ishaan surprised Ananya with homemade treats and a sparkling diamond ring.', img: 'assets/images/proposal_couple.jpg' }
        ]
      }) },
      { id: 'events', section_key: 'events', title: 'Festive Itinerary', is_enabled: true, sort_order: 3, custom_content_json: '{}' },
      { id: 'gallery', section_key: 'gallery', title: 'Moments in Sunlight', is_enabled: true, sort_order: 4, custom_content_json: JSON.stringify({
        photos: [
          { src: 'assets/images/haldi_couple_real.jpg', caption: 'Marigold Shower Moments' },
          { src: 'assets/images/mehendi_couple_real.jpg', caption: 'Henna & Sunshine' },
          { src: 'assets/images/wedding_couple.jpg', caption: 'Vedic Ceremony' }
        ]
      }) },
      { id: 'venue', section_key: 'venue', title: 'Farm Location & Map', is_enabled: true, sort_order: 5, custom_content_json: '{}' },
      { id: 'rsvp', section_key: 'rsvp', title: 'RSVP Card', is_enabled: true, sort_order: 6, custom_content_json: '{}' },
      { id: 'guestbook', section_key: 'guestbook', title: 'Blessings Wall', is_enabled: true, sort_order: 7, custom_content_json: '{}' }
    ],
    functions: [
      { id: 'haldi', function_key: 'haldi', title: 'The Grand Marigold Haldi', subtitle: 'Phoolon Ki Holi & Turmeric', date_time: 'Nov 14, 2026 • 10:30 AM', venue_name: 'The Sunken Lawn', dress_code: 'Yellow & Ochre Traditional', palette_colors_json: JSON.stringify(['#FBC02D', '#FFF9C4']), illustration_url: 'assets/images/haldi_couple_real.jpg', description: 'Fresh marigold petal showers, dholak beats, and turmeric glow.', sort_order: 0 },
      { id: 'mehendi', function_key: 'mehendi', title: 'Floral Mehendi Rass', subtitle: 'Henna, Chaat & Folk Music', date_time: 'Nov 14, 2026 • 04:00 PM', venue_name: 'Banyan Tree Courtyard', dress_code: 'Bright Orange & Lime Green', palette_colors_json: JSON.stringify(['#E65100', '#F1F8E9']), illustration_url: 'assets/images/mehendi_couple_real.jpg', description: 'Traditional chaat street food, henna cones, and live folk singers.', sort_order: 1 },
      { id: 'wedding', function_key: 'wedding', title: 'Vedic Mandap & Vivah', subtitle: 'Sacred Seven Steps', date_time: 'Nov 15, 2026 • 11:00 AM', venue_name: 'Open Air Floral Mandap', dress_code: 'Traditional Pastel & Gold', palette_colors_json: JSON.stringify(['#D84315', '#FFF3E0']), illustration_url: 'assets/images/wedding_couple.jpg', description: 'Day wedding surrounded by thousands of fresh marigold strands.', sort_order: 2 }
    ]
  },

  mehendi_garden: {
    id: 'mehendi_garden',
    slug: 'kabir-diya-mehendi',
    templateId: 'mehendi_garden',
    eventType: 'indian_wedding',
    event_type: 'indian_wedding',
    title: 'Kabir & Diya Mehendi Garden Soirée',
    headline: 'Intricate Henna, Blooming Flora, and Musical Celebrations',
    primary_names: 'Kabir & Diya',
    event_date: '2026-11-28',
    venue_name: 'Greenwood Botanical Glasshouse & Gardens',
    venue_address: 'Botanical Garden Rd, Bangalore 560004',
    venue_map_url: 'https://maps.google.com/?q=Bangalore+Botanical+Gardens',
    theme_id: 'emerald_floral',
    hero_image_url: 'assets/images/mehendi_couple_real.jpg',
    hashtag: '#KabirDiyaGarden',
    isTemplate: true,
    isPublic: true,
    styleTags: ['Floral', 'Modern'],
    description: 'Botanical wonderland filled with emerald foliage, artisan henna swings, live acoustic music, and vibrant floral cocktails.',
    sections: [
      { id: 'hero', section_key: 'hero', title: 'Garden Welcome', is_enabled: true, sort_order: 0, custom_content_json: JSON.stringify({ subtitle: 'Under the Emerald Canopy', quote: 'Where love blossoms like jasmine after summer rain.' }) },
      { id: 'reveal', section_key: 'reveal', title: 'Secret Date Reveal', is_enabled: true, sort_order: 1, custom_content_json: JSON.stringify({ scratchText: 'NOVEMBER 28, 2026 • GREENWOOD GLASSHOUSE' }) },
      { id: 'events', section_key: 'events', title: 'Garden Festivities', is_enabled: true, sort_order: 2, custom_content_json: '{}' },
      { id: 'gallery', section_key: 'gallery', title: 'Floral Moments', is_enabled: true, sort_order: 3, custom_content_json: JSON.stringify({
        photos: [
          { src: 'assets/images/mehendi_couple_real.jpg', caption: 'Bridal Henna Details' },
          { src: 'assets/images/first_date_couple.jpg', caption: 'Acoustic Serenades' }
        ]
      }) },
      { id: 'venue', section_key: 'venue', title: 'Botanical Grounds', is_enabled: true, sort_order: 4, custom_content_json: '{}' },
      { id: 'rsvp', section_key: 'rsvp', title: 'Guest RSVP', is_enabled: true, sort_order: 5, custom_content_json: '{}' },
      { id: 'guestbook', section_key: 'guestbook', title: 'Wishes Wall', is_enabled: true, sort_order: 6, custom_content_json: '{}' }
    ],
    functions: [
      { id: 'mehendi', function_key: 'mehendi', title: 'Artisan Henna High Tea', subtitle: 'Floral Swings & Acoustic Notes', date_time: 'Nov 27, 2026 • 03:30 PM', venue_name: 'The Glasshouse Lawn', dress_code: 'Mint Green, Sage & Floral Prints', palette_colors_json: JSON.stringify(['#2E7D32', '#C8E6C9']), illustration_url: 'assets/images/mehendi_couple_real.jpg', description: 'Artisan henna application, lavender mocktails, and live violin.', sort_order: 0 },
      { id: 'sangeet', function_key: 'sangeet', title: 'Garden Sundowner Sangeet', subtitle: 'Sunset Beats & Cocktails', date_time: 'Nov 27, 2026 • 06:30 PM', venue_name: 'The Conservatory Lawn', dress_code: 'Cocktail Festive', palette_colors_json: JSON.stringify(['#1B5E20', '#A5D6A7']), illustration_url: 'assets/images/sangeet_couple.jpg', description: 'Live fusion band, family flash mob, and wood-fired appetizers.', sort_order: 1 },
      { id: 'vows', function_key: 'vows', title: 'Sunset Garden Vows', subtitle: 'Floral Arch Exchange', date_time: 'Nov 28, 2026 • 05:00 PM', venue_name: 'The Rose Pavillion', dress_code: 'Pastel Elegance', palette_colors_json: JSON.stringify(['#81C784', '#FFF3E0']), illustration_url: 'assets/images/wedding_couple.jpg', description: 'Intimate exchange of vows followed by a starlit sit-down dinner.', sort_order: 2 }
    ]
  },

  sangeet_afterglow: {
    id: 'sangeet_afterglow',
    slug: 'dev-tara-afterglow',
    templateId: 'sangeet_afterglow',
    eventType: 'indian_wedding',
    event_type: 'indian_wedding',
    title: 'Dev & Tara Sangeet Afterglow Celebration',
    headline: 'High Voltage Beats, Golden Lights, and Midnight Glamour',
    primary_names: 'Dev & Tara',
    event_date: '2026-12-05',
    venue_name: 'St. Regis Grand Ballroom & Penthouse Terrace',
    venue_address: 'Senapati Bapat Marg, Lower Parel, Mumbai 400013',
    venue_map_url: 'https://maps.google.com/?q=St+Regis+Mumbai',
    theme_id: 'midnight_sparkle',
    hero_image_url: 'assets/images/sangeet_couple.jpg',
    hashtag: '#DevTaraAfterglow',
    isTemplate: true,
    isPublic: true,
    styleTags: ['Dark Luxury', 'Modern'],
    description: 'Dazzling dark luxury aesthetic with deep navy, violet stage lighting, champagne gold confetti, live percussionists, and after-party glamour.',
    sections: [
      { id: 'hero', section_key: 'hero', title: 'Afterglow Welcome', is_enabled: true, sort_order: 0, custom_content_json: JSON.stringify({ subtitle: 'Turn Up the Lights', quote: 'Where music echoes into the night and celebrations never stop.' }) },
      { id: 'reveal', section_key: 'reveal', title: 'Party Date Reveal', is_enabled: true, sort_order: 1, custom_content_json: JSON.stringify({ scratchText: 'DECEMBER 05, 2026 • ST. REGIS MUMBAI' }) },
      { id: 'events', section_key: 'events', title: 'Showstopper Itinerary', is_enabled: true, sort_order: 2, custom_content_json: '{}' },
      { id: 'gallery', section_key: 'gallery', title: 'High Glamour Shots', is_enabled: true, sort_order: 3, custom_content_json: JSON.stringify({
        photos: [
          { src: 'assets/images/sangeet_couple.jpg', caption: 'Choreographed Stage Romance' },
          { src: 'assets/images/reception_couple.jpg', caption: 'First Dance in Golden Bokeh' }
        ]
      }) },
      { id: 'venue', section_key: 'venue', title: 'Penthouse Ballroom Location', is_enabled: true, sort_order: 4, custom_content_json: '{}' },
      { id: 'rsvp', section_key: 'rsvp', title: 'VIP Guest RSVP', is_enabled: true, sort_order: 5, custom_content_json: '{}' },
      { id: 'guestbook', section_key: 'guestbook', title: 'Wishes Wall', is_enabled: true, sort_order: 6, custom_content_json: '{}' }
    ],
    functions: [
      { id: 'cocktail', function_key: 'cocktail', title: 'The Prelude Cocktail Hour', subtitle: 'Signature Drinks & Red Carpet', date_time: 'Dec 04, 2026 • 07:00 PM', venue_name: 'The St. Regis Foyer', dress_code: 'Chic Evening Formal', palette_colors_json: JSON.stringify(['#0D47A1', '#FFD700']), illustration_url: 'assets/images/reception_couple.jpg', description: 'Craft mixology, live jazz saxophone, and red carpet photo-ops.', sort_order: 0 },
      { id: 'sangeet', function_key: 'sangeet', title: 'The Main Sangeet Extravaganza', subtitle: 'Family Battles & Headliner DJ', date_time: 'Dec 04, 2026 • 08:30 PM', venue_name: 'The Astor Ballroom', dress_code: 'Glitz, Sequins & Midnight Navy', palette_colors_json: JSON.stringify(['#311B92', '#D4AF37']), illustration_url: 'assets/images/sangeet_couple.jpg', description: 'Massive LED stage, family performances, and DJ afterparty.', sort_order: 1 },
      { id: 'afterglow', function_key: 'afterglow', title: 'After-Hours Lounge & Breakfast', subtitle: 'Neon Vibes & Dawn Snacks', date_time: 'Dec 05, 2026 • 01:30 AM', venue_name: 'The Penthouse Terrace', dress_code: 'Glam Casual', palette_colors_json: JSON.stringify(['#000000', '#FF4081']), illustration_url: 'assets/images/sangeet_couple.jpg', description: 'Late-night gourmet sliders, churros, and acoustic sunrise chill.', sort_order: 2 }
    ]
  },

  palace_romance: {
    id: 'palace_romance',
    slug: 'vijay-rashima-wedding',
    templateId: 'palace_romance',
    eventType: 'indian_wedding',
    event_type: 'indian_wedding',
    title: 'Vijay & Rashima Palace Romance Celebration',
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
    styleTags: ['Royal', 'Luxury', 'Pastel'],
    description: 'The definitive luxury palace celebration featuring blush pink, peach, lavender, lakeside mandap, and refined editorial wedding photography.',
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
        note: 'Your presence and heartfelt blessings are our most treasured gifts.',
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

  south_heritage: {
    id: 'south_heritage',
    slug: 'karthik-meera-heritage',
    templateId: 'south_heritage',
    eventType: 'indian_wedding',
    event_type: 'indian_wedding',
    title: 'Karthik & Meera South Heritage Wedding',
    headline: 'Sacred Nadaswaram, Kanjeevaram Silk, and Timeless Temple Traditions',
    primary_names: 'Karthik & Meera',
    event_date: '2026-12-18',
    venue_name: 'The Tamara Temple Pavilion & Kovil Estate',
    venue_address: 'Kabini River Road, Coorg, Karnataka 571201',
    venue_map_url: 'https://maps.google.com/?q=The+Tamara+Coorg',
    theme_id: 'temple_gold_crimson',
    hero_image_url: 'assets/images/proposal_couple.jpg',
    hashtag: '#KarthikMeeraHeritage',
    isTemplate: true,
    isPublic: true,
    styleTags: ['Traditional', 'Royal'],
    description: 'Rooted in timeless South Indian temple heritage: fragrant jasmine gajras, authentic nadaswaram melodies, pure Kanjeevaram weaves, and Sadhyam feast.',
    sections: [
      { id: 'hero', section_key: 'hero', title: 'Temple Welcome', is_enabled: true, sort_order: 0, custom_content_json: JSON.stringify({ subtitle: 'Mangala Vaathiyam & Blessings', quote: 'Where sacred mantras echo through fragrant temple courtyards.' }) },
      { id: 'reveal', section_key: 'reveal', title: 'Muhurtham Reveal', is_enabled: true, sort_order: 1, custom_content_json: JSON.stringify({ scratchText: 'DECEMBER 18, 2026 • THE TAMARA COORG' }) },
      { id: 'events', section_key: 'events', title: 'Muhurtham & Rituals', is_enabled: true, sort_order: 2, custom_content_json: '{}' },
      { id: 'gallery', section_key: 'gallery', title: 'Temple Portraiture', is_enabled: true, sort_order: 3, custom_content_json: JSON.stringify({
        photos: [
          { src: 'assets/images/proposal_couple.jpg', caption: 'Kanjeevaram Elegance' },
          { src: 'assets/images/wedding_couple.jpg', caption: 'Mangalya Dharanam Moment' }
        ]
      }) },
      { id: 'venue', section_key: 'venue', title: 'Pavilion Location', is_enabled: true, sort_order: 4, custom_content_json: '{}' },
      { id: 'rsvp', section_key: 'rsvp', title: 'Guest RSVP', is_enabled: true, sort_order: 5, custom_content_json: '{}' },
      { id: 'guestbook', section_key: 'guestbook', title: 'Blessings Wall', is_enabled: true, sort_order: 6, custom_content_json: '{}' }
    ],
    functions: [
      { id: 'vratham', function_key: 'vratham', title: 'The Holy Vratham & Pooja', subtitle: 'Pre-Wedding Ancestral Prayers', date_time: 'Dec 17, 2026 • 08:30 AM', venue_name: 'Temple Sanctum', dress_code: 'Traditional Veshti & Silk Saree', palette_colors_json: JSON.stringify(['#C62828', '#FFF8E1']), illustration_url: 'assets/images/haldi_couple.jpg', description: 'Ancestral blessings and tying of the sacred yellow thread.', sort_order: 0 },
      { id: 'oonjal', function_key: 'oonjal', title: 'The Oonjal Swing Ritual', subtitle: 'Folk Singing & Floral Swing', date_time: 'Dec 17, 2026 • 05:00 PM', venue_name: 'Courtyard Swing Pavilion', dress_code: 'Silk Pattu & Kurta', palette_colors_json: JSON.stringify(['#E65100', '#FFF3E0']), illustration_url: 'assets/images/mehendi_couple.jpg', description: 'Traditional swing singing, milk and banana blessings from elders.', sort_order: 1 },
      { id: 'muhurtham', function_key: 'muhurtham', title: 'The Auspicious Muhurtham', subtitle: 'Mangalya Dharanam & Saptapadi', date_time: 'Dec 18, 2026 • 06:15 AM', venue_name: 'Main Mandapam', dress_code: 'Pure Kanjeevaram & Zari Veshti', palette_colors_json: JSON.stringify(['#B71C1C', '#FFD700']), illustration_url: 'assets/images/wedding_couple.jpg', description: 'Sacred tying of the Thaali accompanied by resonant Ketty Melam.', sort_order: 2 },
      { id: 'sadhyam', function_key: 'sadhyam', title: 'Traditional Banana-Leaf Sadhyam', subtitle: 'Gourmet South Indian Feast', date_time: 'Dec 18, 2026 • 12:00 PM', venue_name: 'Sadhyam Hall', dress_code: 'Festive Traditional', palette_colors_json: JSON.stringify(['#2E7D32', '#FFFDE7']), illustration_url: 'assets/images/reception_couple.jpg', description: 'Authentic 24-course festive meal served on fresh banana leaves.', sort_order: 3 }
    ]
  },

  blush_vows: {
    id: 'blush_vows',
    slug: 'aarav-siya-blush',
    templateId: 'blush_vows',
    eventType: 'indian_wedding',
    event_type: 'indian_wedding',
    title: 'Aarav & Siya Blush Vows Celebration',
    headline: 'Gentle Pastels, Soft Florals, and Intimate Romantic Promises',
    primary_names: 'Aarav & Siya',
    event_date: '2026-11-19',
    venue_name: 'Rosewood Villa & Hillside Terrace',
    venue_address: 'Estate Hills, Shimla, Himachal Pradesh 171001',
    venue_map_url: 'https://maps.google.com/?q=Rosewood+Villa+Shimla',
    theme_id: 'blush_rose_minimal',
    hero_image_url: 'assets/images/first_date_couple.jpg',
    hashtag: '#AaravSiyaVows',
    isTemplate: true,
    isPublic: true,
    styleTags: ['Pastel', 'Floral', 'Minimal'],
    description: 'An ethereal romantic aesthetic with soft blush tones, delicate peonies, clean modern typography, and an intimate mountain terrace setting.',
    sections: [
      { id: 'hero', section_key: 'hero', title: 'Blush Welcome', is_enabled: true, sort_order: 0, custom_content_json: JSON.stringify({ subtitle: 'Whispers of Love', quote: 'In your eyes, I have found my forever home.' }) },
      { id: 'reveal', section_key: 'reveal', title: 'Wedding Date Reveal', is_enabled: true, sort_order: 1, custom_content_json: JSON.stringify({ scratchText: 'NOVEMBER 19, 2026 • ROSEWOOD VILLA' }) },
      { id: 'events', section_key: 'events', title: 'Celebration Schedule', is_enabled: true, sort_order: 2, custom_content_json: '{}' },
      { id: 'gallery', section_key: 'gallery', title: 'Intimate Moments', is_enabled: true, sort_order: 3, custom_content_json: JSON.stringify({
        photos: [
          { src: 'assets/images/first_date_couple.jpg', caption: 'Mountain Walk' },
          { src: 'assets/images/hero_couple.jpg', caption: 'Sunset in Blush' }
        ]
      }) },
      { id: 'venue', section_key: 'venue', title: 'Villa Location', is_enabled: true, sort_order: 4, custom_content_json: '{}' },
      { id: 'rsvp', section_key: 'rsvp', title: 'Guest RSVP', is_enabled: true, sort_order: 5, custom_content_json: '{}' }
    ],
    functions: [
      { id: 'ring_exchange', function_key: 'ring_exchange', title: 'Intimate Ring Exchange', subtitle: 'Pine Forest Backdrop', date_time: 'Nov 18, 2026 • 04:30 PM', venue_name: 'Hilltop Pine Terrace', dress_code: 'Soft Blush & Ivory', palette_colors_json: JSON.stringify(['#F8BBD0', '#FCE4EC']), illustration_url: 'assets/images/first_date_couple.jpg', description: 'Ring blessings under a canopy of pink peonies and white hydrangeas.', sort_order: 0 },
      { id: 'vows', function_key: 'vows', title: 'The Sunset Wedding Ceremony', subtitle: 'Sacred Pheras with Mountain Views', date_time: 'Nov 19, 2026 • 04:00 PM', venue_name: 'Valley Lawn', dress_code: 'Pastel Lehengas & Sherwanis', palette_colors_json: JSON.stringify(['#E91E63', '#FFF8E1']), illustration_url: 'assets/images/wedding_couple.jpg', description: 'Vows overlooking the misty valley followed by a starlit acoustic dinner.', sort_order: 1 }
    ]
  },

  minimal_ivory: {
    id: 'minimal_ivory',
    slug: 'rohan-alisha-ivory',
    templateId: 'minimal_ivory',
    eventType: 'indian_wedding',
    event_type: 'indian_wedding',
    title: 'Rohan & Alisha Minimal Ivory Celebration',
    headline: 'Modern Architecture, Subtle Gold Detailing, and Understated Luxury',
    primary_names: 'Rohan & Alisha',
    event_date: '2026-12-02',
    venue_name: 'The Pavilion at Lodhi Modern Arts',
    venue_address: 'Lodhi Rd, CGO Complex, Pragati Vihar, New Delhi 110003',
    venue_map_url: 'https://maps.google.com/?q=The+Lodhi+New+Delhi',
    theme_id: 'minimal_ivory_slate',
    hero_image_url: 'assets/images/reception_couple.jpg',
    hashtag: '#RohanAlishaIvory',
    isTemplate: true,
    isPublic: true,
    styleTags: ['Minimal', 'Modern', 'Luxury'],
    description: 'Monochromatic architectural elegance with pure ivory linen, brushed gold accents, geometric structures, and refined modern typography.',
    sections: [
      { id: 'hero', section_key: 'hero', title: 'Minimalist Welcome', is_enabled: true, sort_order: 0, custom_content_json: JSON.stringify({ subtitle: 'Understated Elegance', quote: 'Simplicity is the ultimate sophistication.' }) },
      { id: 'reveal', section_key: 'reveal', title: 'Event Date Reveal', is_enabled: true, sort_order: 1, custom_content_json: JSON.stringify({ scratchText: 'DECEMBER 02, 2026 • THE LODHI' }) },
      { id: 'events', section_key: 'events', title: 'Itinerary', is_enabled: true, sort_order: 2, custom_content_json: '{}' },
      { id: 'gallery', section_key: 'gallery', title: 'Editorial Still Life', is_enabled: true, sort_order: 3, custom_content_json: JSON.stringify({
        photos: [
          { src: 'assets/images/reception_couple.jpg', caption: 'Architectural Portrait' },
          { src: 'assets/images/hero_couple.jpg', caption: 'Ivory & Gold Harmony' }
        ]
      }) },
      { id: 'venue', section_key: 'venue', title: 'Gallery Venue Location', is_enabled: true, sort_order: 4, custom_content_json: '{}' },
      { id: 'rsvp', section_key: 'rsvp', title: 'RSVP Submission', is_enabled: true, sort_order: 5, custom_content_json: '{}' }
    ],
    functions: [
      { id: 'welcome', function_key: 'welcome', title: 'Architectural Welcome Toast', subtitle: 'Cocktails & Modern Canapés', date_time: 'Dec 01, 2026 • 06:30 PM', venue_name: 'Sculpture Garden', dress_code: 'Monochrome Cocktail', palette_colors_json: JSON.stringify(['#263238', '#ECEFF1']), illustration_url: 'assets/images/reception_couple.jpg', description: 'Curated mixology, artisanal cheeses, and ambient live harp.', sort_order: 0 },
      { id: 'ceremony', function_key: 'ceremony', title: 'The Minimal Mandap Ceremony', subtitle: 'Pure Ivory Vows', date_time: 'Dec 02, 2026 • 11:30 AM', venue_name: 'The Glass Pavilion', dress_code: 'White, Cream & Champagne', palette_colors_json: JSON.stringify(['#FFFFFF', '#D4AF37']), illustration_url: 'assets/images/wedding_couple.jpg', description: 'Sculptural brass and ivory floral mandap with acoustic sitar.', sort_order: 1 },
      { id: 'dinner', function_key: 'dinner', title: 'Candlelight Degustation Dinner', subtitle: 'Modern Indian Gastronomy', date_time: 'Dec 02, 2026 • 08:00 PM', venue_name: 'The Dining Room', dress_code: 'Black Tie', palette_colors_json: JSON.stringify(['#212121', '#FAFAFA']), illustration_url: 'assets/images/reception_couple.jpg', description: 'Seven-course tasting menu paired with international vintages.', sort_order: 2 }
    ]
  },

  // --- 6 MUSLIM WEDDING TEMPLATES ---
  noor_nikah: {
    id: 'noor_nikah',
    slug: 'zain-ayla-nikah',
    templateId: 'noor_nikah',
    eventType: 'muslim_wedding',
    event_type: 'muslim_wedding',
    title: 'Zain & Ayla Sacred Noor Nikah Celebration',
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
    styleTags: ['Traditional', 'Luxury', 'Floral'],
    description: 'Solemnized with Islamic grace: Dholki, Mehendi, Sacred Nikah, and Grand Walima with emerald, ivory, and calligraphy details.',
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

  emerald_qasr: {
    id: 'emerald_qasr',
    slug: 'hamza-zoya-qasr',
    templateId: 'emerald_qasr',
    eventType: 'muslim_wedding',
    event_type: 'muslim_wedding',
    title: 'Hamza & Zoya Emerald Qasr Celebration',
    headline: 'Islamic Geometric Splendor, Royal Emerald Velvets, and Sacred Promises',
    primary_names: 'Hamza & Zoya',
    event_date: '2026-12-12',
    venue_name: 'Qasr Al-Rayaan Heritage Palace & Grand Lawn',
    venue_address: 'Emirates Crescent, Diplomatic Enclave, Islamabad 44000',
    venue_map_url: 'https://maps.google.com/?q=Islamabad+Diplomatic+Enclave',
    theme_id: 'deep_emerald_plum',
    hero_image_url: 'assets/images/mehendi_couple_real.jpg',
    hashtag: '#HamzaZoyaQasr',
    isTemplate: true,
    isPublic: true,
    styleTags: ['Royal', 'Dark Luxury', 'Traditional'],
    description: 'Aristocratic Mughal & Andalusian aesthetic featuring deep emerald green velvet, deep plum hues, antique brass lanterns, and majestic arches.',
    sections: [
      { id: 'hero', section_key: 'hero', title: 'Qasr Welcome', is_enabled: true, sort_order: 0, custom_content_json: JSON.stringify({ subtitle: 'Under Royal Arches', quote: 'Where faith, tradition, and devotion unite in eternal harmony.' }) },
      { id: 'reveal', section_key: 'reveal', title: 'Ceremony Date Reveal', is_enabled: true, sort_order: 1, custom_content_json: JSON.stringify({ scratchText: 'DECEMBER 12, 2026 • QASR AL-RAYAAN' }) },
      { id: 'events', section_key: 'events', title: 'Qasr Ceremonies', is_enabled: true, sort_order: 2, custom_content_json: '{}' },
      { id: 'gallery', section_key: 'gallery', title: 'Portraits in Velvet', is_enabled: true, sort_order: 3, custom_content_json: JSON.stringify({
        photos: [
          { src: 'assets/images/mehendi_couple_real.jpg', caption: 'Emerald & Gold Embroidery' },
          { src: 'assets/images/muslim_couple.jpg', caption: 'Sacred Nikah Khutbah' }
        ]
      }) },
      { id: 'venue', section_key: 'venue', title: 'Qasr Location', is_enabled: true, sort_order: 4, custom_content_json: '{}' },
      { id: 'rsvp', section_key: 'rsvp', title: 'Guest RSVP', is_enabled: true, sort_order: 5, custom_content_json: '{}' }
    ],
    functions: [
      { id: 'mayun', function_key: 'mayun', title: 'Ubtan & Festive Mayun', subtitle: 'Marigold & Turmeric Blessings', date_time: 'Dec 10, 2026 • 07:00 PM', venue_name: 'The Courtyard Arches', dress_code: 'Mustard Yellow & Saffron', palette_colors_json: JSON.stringify(['#FF8F00', '#FFF8E1']), illustration_url: 'assets/images/haldi_couple.jpg', description: 'Traditional singing of sehra and ubtan application by elders.', sort_order: 0 },
      { id: 'nikah', function_key: 'nikah', title: 'The Royal Qubool Ceremony', subtitle: 'Sacred Nikah & Quranic Khutbah', date_time: 'Dec 11, 2026 • 04:30 PM', venue_name: 'The Grand Dome Hall', dress_code: 'Emerald Green & Ivory Brocade', palette_colors_json: JSON.stringify(['#004D40', '#D4AF37']), illustration_url: 'assets/images/muslim_couple.jpg', description: 'Solemn contract signing witnessed by family elders.', sort_order: 1 },
      { id: 'walima', function_key: 'walima', title: 'The Grand Qasr Banquet', subtitle: 'Royal Walima Dinner', date_time: 'Dec 12, 2026 • 08:00 PM', venue_name: 'Imperial Chandelier Ballroom', dress_code: 'Formal Black Tie & Velvets', palette_colors_json: JSON.stringify(['#311B92', '#004D40']), illustration_url: 'assets/images/reception_couple.jpg', description: 'Lavish traditional Mughlai cuisine, live sitar, and dessert courtyard.', sort_order: 2 }
    ]
  },

  ivory_dua: {
    id: 'ivory_dua',
    slug: 'bilal-noor-dua',
    templateId: 'ivory_dua',
    eventType: 'muslim_wedding',
    event_type: 'muslim_wedding',
    title: 'Bilal & Noor Ivory Dua Celebration',
    headline: 'Bismillah — In the Name of God, The Most Gracious, The Most Merciful',
    primary_names: 'Bilal & Noor',
    event_date: '2026-11-26',
    venue_name: 'The Palm Pavilion & Reflection Pool Gardens',
    venue_address: 'Corniche Waterfront, Jumeirah, Dubai UAE',
    venue_map_url: 'https://maps.google.com/?q=Jumeirah+Dubai',
    theme_id: 'ivory_pearl_gold',
    hero_image_url: 'assets/images/muslim_couple.jpg',
    hashtag: '#BilalNoorDua',
    isTemplate: true,
    isPublic: true,
    styleTags: ['Minimal', 'Pastel', 'Luxury'],
    description: 'Clean, serene ivory aesthetic with brushed gold accents, reflection pools, soft calligraphic titles, and heartfelt Quranic prayers.',
    sections: [
      { id: 'hero', section_key: 'hero', title: 'Ivory Welcome', is_enabled: true, sort_order: 0, custom_content_json: JSON.stringify({ subtitle: 'In Remembrance of Allah', quote: 'He placed between you love and compassion.' }) },
      { id: 'reveal', section_key: 'reveal', title: 'Nikah Date Reveal', is_enabled: true, sort_order: 1, custom_content_json: JSON.stringify({ scratchText: 'NOVEMBER 26, 2026 • PALM PAVILION' }) },
      { id: 'events', section_key: 'events', title: 'Nikah Programme', is_enabled: true, sort_order: 2, custom_content_json: '{}' },
      { id: 'gallery', section_key: 'gallery', title: 'Serene Moments', is_enabled: true, sort_order: 3, custom_content_json: JSON.stringify({
        photos: [
          { src: 'assets/images/muslim_couple.jpg', caption: 'Ivory & Pearl Nikah Attire' },
          { src: 'assets/images/reception_couple.jpg', caption: 'Family Dastarkhwan' }
        ]
      }) },
      { id: 'venue', section_key: 'venue', title: 'Waterfront Pavilion', is_enabled: true, sort_order: 4, custom_content_json: '{}' },
      { id: 'rsvp', section_key: 'rsvp', title: 'RSVP Form', is_enabled: true, sort_order: 5, custom_content_json: '{}' }
    ],
    functions: [
      { id: 'dua', function_key: 'dua', title: 'Khatam-e-Quran & Dua-e-Khair', subtitle: 'Spiritual Blessing Gathering', date_time: 'Nov 25, 2026 • 05:00 PM', venue_name: 'Garden Terrace', dress_code: 'White & Soft Beige', palette_colors_json: JSON.stringify(['#FFFDE7', '#D4AF37']), illustration_url: 'assets/images/muslim_couple.jpg', description: 'Recitation of the Holy Quran, supplications for the newlyweds.', sort_order: 0 },
      { id: 'nikah', function_key: 'nikah', title: 'Solemn Nikah Ceremony', subtitle: 'Signing of the Nikahnama', date_time: 'Nov 26, 2026 • 04:00 PM', venue_name: 'The Reflection Hall', dress_code: 'Ivory, Pearl & Champagne Gold', palette_colors_json: JSON.stringify(['#FFFFFF', '#C5A059']), illustration_url: 'assets/images/muslim_couple.jpg', description: 'The sacred Nikah ceremony followed by dates and Zamzam distribution.', sort_order: 1 },
      { id: 'dastarkhwan', function_key: 'dastarkhwan', title: 'Family Dastarkhwan Dinner', subtitle: 'A Feast of Gratitude', date_time: 'Nov 26, 2026 • 07:30 PM', venue_name: 'Waterfront Palm Lawn', dress_code: 'Modest Formal', palette_colors_json: JSON.stringify(['#ECEFF1', '#37474F']), illustration_url: 'assets/images/reception_couple.jpg', description: 'Intimate dining with traditional Arabic and South Asian delicacies.', sort_order: 2 }
    ]
  },

  zafraan_evening: {
    id: 'zafraan_evening',
    slug: 'daniyal-mahnoor-zafraan',
    templateId: 'zafraan_evening',
    eventType: 'muslim_wedding',
    event_type: 'muslim_wedding',
    title: 'Daniyal & Mahnoor Zafraan Evening',
    headline: 'Saffron Glow, Melodic Dholak Beats, and Warm Festive Joy',
    primary_names: 'Daniyal & Mahnoor',
    event_date: '2026-12-08',
    venue_name: 'Heritage Haveli Courtyard & Verandas',
    venue_address: 'Walled City Heritage Gate, Lahore 54000',
    venue_map_url: 'https://maps.google.com/?q=Lahore+Heritage+Haveli',
    theme_id: 'zafraan_saffron_gold',
    hero_image_url: 'assets/images/haldi_couple_real.jpg',
    hashtag: '#DaniyalMahnoorZafraan',
    isTemplate: true,
    isPublic: true,
    styleTags: ['Traditional', 'Royal', 'Floral'],
    description: 'Rich cultural warmth featuring saffron orange, warm terracotta, antique copper bells, and spirited family dholak songs.',
    sections: [
      { id: 'hero', section_key: 'hero', title: 'Zafraan Welcome', is_enabled: true, sort_order: 0, custom_content_json: JSON.stringify({ subtitle: 'Warm Saffron Evenings', quote: 'May our days ahead be as bright as the zafraan glow.' }) },
      { id: 'reveal', section_key: 'reveal', title: 'Celebration Date Reveal', is_enabled: true, sort_order: 1, custom_content_json: JSON.stringify({ scratchText: 'DECEMBER 08, 2026 • HERITAGE HAVELI' }) },
      { id: 'events', section_key: 'events', title: 'Celebration Itinerary', is_enabled: true, sort_order: 2, custom_content_json: '{}' },
      { id: 'gallery', section_key: 'gallery', title: 'Zafraan Moments', is_enabled: true, sort_order: 3, custom_content_json: JSON.stringify({
        photos: [
          { src: 'assets/images/haldi_couple_real.jpg', caption: 'Saffron Dholak Gatherings' },
          { src: 'assets/images/mehendi_couple_real.jpg', caption: 'Mehendi & Bangles' }
        ]
      }) },
      { id: 'venue', section_key: 'venue', title: 'Haveli Grounds', is_enabled: true, sort_order: 4, custom_content_json: '{}' },
      { id: 'rsvp', section_key: 'rsvp', title: 'Guest RSVP', is_enabled: true, sort_order: 5, custom_content_json: '{}' }
    ],
    functions: [
      { id: 'dholak', function_key: 'dholak', title: 'Haveli Dholak & Tappay', subtitle: 'Traditional Family Singing', date_time: 'Dec 06, 2026 • 07:00 PM', venue_name: 'Haveli Inner Courtyard', dress_code: 'Zafraan, Ochre & Coral', palette_colors_json: JSON.stringify(['#E65100', '#FFE0B2']), illustration_url: 'assets/images/haldi_couple_real.jpg', description: 'Traditional dholak beats, folk tappay, and piping hot jalebis.', sort_order: 0 },
      { id: 'mehendi', function_key: 'mehendi', title: 'Festive Mehendi Night', subtitle: 'Henna & Sparklers', date_time: 'Dec 07, 2026 • 06:30 PM', venue_name: 'Haveli Rooftop', dress_code: 'Bottle Green & Mustard', palette_colors_json: JSON.stringify(['#1B5E20', '#FFB300']), illustration_url: 'assets/images/mehendi_couple_real.jpg', description: 'Intricate henna application and live acoustic qawwali.', sort_order: 1 },
      { id: 'nikah', function_key: 'nikah', title: 'The Holy Nikah Ceremony', subtitle: 'Sacred Contract & Dinner', date_time: 'Dec 08, 2026 • 05:00 PM', venue_name: 'The Marble Arch Veranda', dress_code: 'Traditional Brocade & Gold', palette_colors_json: JSON.stringify(['#BF360C', '#D4AF37']), illustration_url: 'assets/images/muslim_couple.jpg', description: 'Solemnization of marriage followed by authentic Dum Biryani feast.', sort_order: 2 }
    ]
  },

  resham_royale: {
    id: 'resham_royale',
    slug: 'shahmeer-hania-royale',
    templateId: 'resham_royale',
    eventType: 'muslim_wedding',
    event_type: 'muslim_wedding',
    title: 'Shahmeer & Hania Resham Royale Celebration',
    headline: 'Fine Silk Brocades, Imperial Zardozi, and Princely Courtyard Vows',
    primary_names: 'Shahmeer & Hania',
    event_date: '2026-12-15',
    venue_name: 'Serena Grand Imperial Palace & Ballroom',
    venue_address: 'Khyaban-e-Suhrawardy, G-5/1, Islamabad 44000',
    venue_map_url: 'https://maps.google.com/?q=Serena+Hotel+Islamabad',
    theme_id: 'resham_ruby_gold',
    hero_image_url: 'assets/images/hero_couple_real.jpg',
    hashtag: '#ShahmeerHaniaRoyale',
    isTemplate: true,
    isPublic: true,
    styleTags: ['Royal', 'Luxury'],
    description: 'Brocade luxury with deep ruby red, rich gold zari work, antique brass chandeliers, and grand ancestral hospitality.',
    sections: [
      { id: 'hero', section_key: 'hero', title: 'Resham Welcome', is_enabled: true, sort_order: 0, custom_content_json: JSON.stringify({ subtitle: 'Imperial Elegance', quote: 'A celebration crafted with timeless grace and royal splendour.' }) },
      { id: 'reveal', section_key: 'reveal', title: 'Ceremony Date Reveal', is_enabled: true, sort_order: 1, custom_content_json: JSON.stringify({ scratchText: 'DECEMBER 15, 2026 • SERENA IMPERIAL PALACE' }) },
      { id: 'events', section_key: 'events', title: 'Royale Schedule', is_enabled: true, sort_order: 2, custom_content_json: '{}' },
      { id: 'gallery', section_key: 'gallery', title: 'Imperial Gallery', is_enabled: true, sort_order: 3, custom_content_json: JSON.stringify({
        photos: [
          { src: 'assets/images/hero_couple_real.jpg', caption: 'Royale Bridal Splendour' },
          { src: 'assets/images/wedding_couple.jpg', caption: 'Nikah Solemnization' }
        ]
      }) },
      { id: 'venue', section_key: 'venue', title: 'Serena Palace Location', is_enabled: true, sort_order: 4, custom_content_json: '{}' },
      { id: 'rsvp', section_key: 'rsvp', title: 'Guest RSVP', is_enabled: true, sort_order: 5, custom_content_json: '{}' }
    ],
    functions: [
      { id: 'baraat', function_key: 'baraat', title: 'Baraat & Nikah Solemnization', subtitle: 'Royal Welcome & Ijab-e-Qubool', date_time: 'Dec 14, 2026 • 07:00 PM', venue_name: 'The Sheesh Mahal Hall', dress_code: 'Ruby Red Lehengas & Raw Silk Sherwanis', palette_colors_json: JSON.stringify(['#880E4F', '#D4AF37']), illustration_url: 'assets/images/hero_couple_real.jpg', description: 'Traditional rose water welcome, Nikah contract signing, and lavish dinner.', sort_order: 0 },
      { id: 'rukhsati', function_key: 'rukhsati', title: 'The Emotional Rukhsati', subtitle: 'Holy Quranic Shadow & Blessings', date_time: 'Dec 14, 2026 • 11:30 PM', venue_name: 'Palace Grand Foyer', dress_code: 'Formal Traditional', palette_colors_json: JSON.stringify(['#4A148C', '#FFFFFF']), illustration_url: 'assets/images/muslim_couple.jpg', description: 'Departing under the shadow of the Holy Quran with heartfelt family prayers.', sort_order: 1 },
      { id: 'walima', function_key: 'walima', title: 'The Grand Royale Walima Banquet', subtitle: 'Celebratory Feast & Speeches', date_time: 'Dec 15, 2026 • 08:00 PM', venue_name: 'The Grand Ballroom & Terrace', dress_code: 'Champagne Gold & Black Tuxedo', palette_colors_json: JSON.stringify(['#212121', '#FFD700']), illustration_url: 'assets/images/reception_couple.jpg', description: 'Opulent multi-cuisine banquet hosted with gratitude by the groom’s family.', sort_order: 2 }
    ]
  },

  midnight_walima: {
    id: 'midnight_walima',
    slug: 'farhan-sarah-walima',
    templateId: 'midnight_walima',
    eventType: 'muslim_wedding',
    event_type: 'muslim_wedding',
    title: 'Farhan & Sarah Midnight Walima Soirée',
    headline: 'Starlit Skies, Crystal Chandeliers, and Contemporary Glamour',
    primary_names: 'Farhan & Sarah',
    event_date: '2026-11-30',
    venue_name: 'The Meydan Grand Ballroom & Sky Terrace',
    venue_address: 'Meydan Racecourse, Nad Al Sheba 1, Dubai UAE',
    venue_map_url: 'https://maps.google.com/?q=The+Meydan+Hotel+Dubai',
    theme_id: 'midnight_navy_silver',
    hero_image_url: 'assets/images/reception_couple.jpg',
    hashtag: '#FarhanSarahWalima',
    isTemplate: true,
    isPublic: true,
    styleTags: ['Dark Luxury', 'Modern'],
    description: 'Contemporary evening glamour with midnight navy velvet, silver chrome and crystal fixtures, gourmet dining, and starry sky terrace views.',
    sections: [
      { id: 'hero', section_key: 'hero', title: 'Midnight Welcome', is_enabled: true, sort_order: 0, custom_content_json: JSON.stringify({ subtitle: 'Under the Arabian Sky', quote: 'A night of gratitude, refined elegance, and shared smiles.' }) },
      { id: 'reveal', section_key: 'reveal', title: 'Walima Date Reveal', is_enabled: true, sort_order: 1, custom_content_json: JSON.stringify({ scratchText: 'NOVEMBER 30, 2026 • THE MEYDAN DUBAI' }) },
      { id: 'events', section_key: 'events', title: 'Evening Itinerary', is_enabled: true, sort_order: 2, custom_content_json: '{}' },
      { id: 'gallery', section_key: 'gallery', title: 'Starlit Portraits', is_enabled: true, sort_order: 3, custom_content_json: JSON.stringify({
        photos: [
          { src: 'assets/images/reception_couple.jpg', caption: 'Skyline Portrait' },
          { src: 'assets/images/muslim_couple.jpg', caption: 'Walima Elegance' }
        ]
      }) },
      { id: 'venue', section_key: 'venue', title: 'Meydan Venue Location', is_enabled: true, sort_order: 4, custom_content_json: '{}' },
      { id: 'rsvp', section_key: 'rsvp', title: 'RSVP Confirmation', is_enabled: true, sort_order: 5, custom_content_json: '{}' }
    ],
    functions: [
      { id: 'welcome', function_key: 'welcome', title: 'Red Carpet Arrivals & Mocktails', subtitle: 'Pianist & Sparkling Foyer', date_time: 'Nov 30, 2026 • 07:00 PM', venue_name: 'Meydan Grand Foyer', dress_code: 'Midnight Navy & Silver', palette_colors_json: JSON.stringify(['#0A192F', '#ECEFF1']), illustration_url: 'assets/images/reception_couple.jpg', description: 'Signature artisanal mocktails, harpist, and red carpet photographs.', sort_order: 0 },
      { id: 'walima', function_key: 'walima', title: 'The Formal Walima Banquet', subtitle: 'Speeches, Cutting of Cake & Feast', date_time: 'Nov 30, 2026 • 08:30 PM', venue_name: 'The Meydan Ballroom', dress_code: 'Black Tie & Evening Gowns', palette_colors_json: JSON.stringify(['#1A237E', '#D4AF37']), illustration_url: 'assets/images/reception_couple.jpg', description: 'Gourmet banquet dinner, speeches by family and close friends, and dessert station.', sort_order: 1 }
    ]
  },

  // --- 4 BIRTHDAY CELEBRATION TEMPLATES ---
  pastel_party: {
    id: 'pastel_party',
    slug: 'arias-sweet-16',
    templateId: 'pastel_party',
    eventType: 'birthday',
    event_type: 'birthday',
    title: "Aria's Sweet 16 Pastel Party",
    headline: 'Celebrating 16 Years of Magic, Laughter & Golden Sparkles',
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
    styleTags: ['Pastel', 'Floral'],
    description: 'Blush pink and lavender balloons, macarons, strawberry floral cake, glitter polaroid station, and sparkling dance beats.',
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
  },

  little_star: {
    id: 'little_star',
    slug: 'liam-first-birthday',
    templateId: 'little_star',
    eventType: 'birthday',
    event_type: 'birthday',
    title: "Liam's First Trip Around the Sun",
    headline: 'Twinkle Twinkle Little Star, One Whole Year of Pure Wonder',
    primary_names: 'Liam',
    event_date: '2026-10-25',
    venue_name: 'The Secret Garden Play Pavilion',
    venue_address: 'Parkview Enclave, Kensington Gardens, London W8 4PX',
    venue_map_url: 'https://maps.google.com/?q=Kensington+Gardens',
    theme_id: 'starlight_sky_gold',
    hero_image_url: 'assets/images/birthday_hero.jpg',
    hashtag: '#LiamOneAroundTheSun',
    isTemplate: true,
    isPublic: true,
    styleTags: ['Modern', 'Pastel'],
    description: 'Dreamy starry sky theme with baby blue, warm cream, golden foil stars, toddler soft-play zone, and joyful smash cake photos.',
    sections: [
      { id: 'hero', section_key: 'hero', title: 'Little Star Welcome', is_enabled: true, sort_order: 0, custom_content_json: JSON.stringify({ subtitle: 'Our Miracle at One', quote: 'From tiny fingers to big steps, what a magical first year!' }) },
      { id: 'reveal', section_key: 'reveal', title: 'Party Date Reveal', is_enabled: true, sort_order: 1, custom_content_json: JSON.stringify({ scratchText: 'OCTOBER 25, 2026 • THE SECRET GARDEN' }) },
      { id: 'events', section_key: 'events', title: 'Play & Celebration Schedule', is_enabled: true, sort_order: 2, custom_content_json: '{}' },
      { id: 'gallery', section_key: 'gallery', title: 'First Year Milestones', is_enabled: true, sort_order: 3, custom_content_json: JSON.stringify({
        photos: [
          { src: 'assets/images/birthday_hero.jpg', caption: 'Liam at 12 Months' },
          { src: 'assets/images/first_date_couple.jpg', caption: 'Candid Family Smiles' }
        ]
      }) },
      { id: 'venue', section_key: 'venue', title: 'Play Pavilion Location', is_enabled: true, sort_order: 4, custom_content_json: '{}' },
      { id: 'rsvp', section_key: 'rsvp', title: 'Guest RSVP', is_enabled: true, sort_order: 5, custom_content_json: '{}' }
    ],
    functions: [
      { id: 'welcome', function_key: 'welcome', title: 'Welcome & Toddler Soft-Play', subtitle: 'Ball Pits & Balloon Castles', date_time: 'Oct 25, 2026 • 11:00 AM', venue_name: 'Soft-Play Arena', dress_code: 'Pastel Blue & White', palette_colors_json: JSON.stringify(['#90CAF9', '#FFF9C4']), illustration_url: 'assets/images/birthday_hero.jpg', description: 'Sensory play zone, baby ball pits, and bubble artist show.', sort_order: 0 },
      { id: 'smash_cake', function_key: 'smash_cake', title: 'The Smash Cake Ceremony', subtitle: 'Pure Joy & Laughter', date_time: 'Oct 25, 2026 • 12:30 PM', venue_name: 'Starry Cake Stage', dress_code: 'Playful Festive', palette_colors_json: JSON.stringify(['#FFD54F', '#BBDEFB']), illustration_url: 'assets/images/birthday_hero.jpg', description: 'Liam smashes his organic vanilla berry cake with baby cheer!', sort_order: 1 },
      { id: 'lunch', function_key: 'lunch', title: 'Family Garden Lunch', subtitle: 'Wood-Fired Pizza & Cupcakes', date_time: 'Oct 25, 2026 • 01:00 PM', venue_name: 'The Sunlit Veranda', dress_code: 'Smart Casual', palette_colors_json: JSON.stringify(['#C8E6C9', '#FFF3E0']), illustration_url: 'assets/images/reception_couple.jpg', description: 'Artisanal sliders, mini pizzas, fresh gelato bar, and party gift bags.', sort_order: 2 }
    ]
  },

  elegant_soiree: {
    id: 'elegant_soiree',
    slug: 'natasha-30th-soiree',
    templateId: 'elegant_soiree',
    eventType: 'birthday',
    event_type: 'birthday',
    title: "Natasha's 30th Birthday Soirée",
    headline: 'Three Decades of Brilliance, Champagne Bubbles, and Midnight Jazz',
    primary_names: 'Natasha',
    event_date: '2026-11-14',
    venue_name: 'The Glass Pavilion & Botanical Rooftop',
    venue_address: 'Hudson Yards West, New York, NY 10001',
    venue_map_url: 'https://maps.google.com/?q=Hudson+Yards+New+York',
    theme_id: 'champagne_gold_black',
    hero_image_url: 'assets/images/reception_couple.jpg',
    hashtag: '#NatashaFlirtyThirty',
    isTemplate: true,
    isPublic: true,
    styleTags: ['Luxury', 'Modern', 'Minimal'],
    description: 'High-end adult birthday soirée with champagne towers, live jazz trio, black tie dress code, decadent oyster bar, and skyline views.',
    sections: [
      { id: 'hero', section_key: 'hero', title: 'Soirée Welcome', is_enabled: true, sort_order: 0, custom_content_json: JSON.stringify({ subtitle: 'Chapter 30 Unlocked', quote: 'A celebration of elegance, wisdom, and lifelong friendships.' }) },
      { id: 'reveal', section_key: 'reveal', title: 'Party Date Reveal', is_enabled: true, sort_order: 1, custom_content_json: JSON.stringify({ scratchText: 'NOVEMBER 14, 2026 • HUDSON YARDS' }) },
      { id: 'events', section_key: 'events', title: 'Evening Itinerary', is_enabled: true, sort_order: 2, custom_content_json: '{}' },
      { id: 'gallery', section_key: 'gallery', title: 'Decade Highlights', is_enabled: true, sort_order: 3, custom_content_json: JSON.stringify({
        photos: [
          { src: 'assets/images/reception_couple.jpg', caption: 'Champagne Cheers' },
          { src: 'assets/images/first_date_couple.jpg', caption: 'Through the Years' }
        ]
      }) },
      { id: 'venue', section_key: 'venue', title: 'Rooftop Venue Location', is_enabled: true, sort_order: 4, custom_content_json: '{}' },
      { id: 'rsvp', section_key: 'rsvp', title: 'Guest RSVP', is_enabled: true, sort_order: 5, custom_content_json: '{}' }
    ],
    functions: [
      { id: 'cocktails', function_key: 'cocktails', title: 'Champagne Tower & Oyster Bar', subtitle: 'Live Jazz & Canapés', date_time: 'Nov 14, 2026 • 07:30 PM', venue_name: 'The Glass Rotunda', dress_code: 'Black Tie & Cocktail Chic', palette_colors_json: JSON.stringify(['#212121', '#D4AF37']), illustration_url: 'assets/images/reception_couple.jpg', description: 'Vintage champagne poured over a 5-tier crystal coupe tower.', sort_order: 0 },
      { id: 'cake', function_key: 'cake', title: 'Midnight Birthday Toast & Cake', subtitle: 'Make a Milestone Wish', date_time: 'Nov 14, 2026 • 10:00 PM', venue_name: 'The Sky Deck', dress_code: 'Formal Black & Gold', palette_colors_json: JSON.stringify(['#000000', '#FFD700']), illustration_url: 'assets/images/birthday_hero.jpg', description: 'Handcrafted gold-leaf dark chocolate cake with city lights view.', sort_order: 1 },
      { id: 'dancing', function_key: 'dancing', title: 'After-Dark Lounge & Vinyl Beats', subtitle: 'Dancing Under the Stars', date_time: 'Nov 14, 2026 • 10:45 PM', venue_name: 'The Rooftop Lounge', dress_code: 'Cocktail Attire', palette_colors_json: JSON.stringify(['#37474F', '#CFD8DC']), illustration_url: 'assets/images/sangeet_couple.jpg', description: 'Vinyl DJ spinning disco and soulful house until 2 AM.', sort_order: 2 }
    ]
  },

  neon_celebration: {
    id: 'neon_celebration',
    slug: 'reyansh-neon-glow-bash',
    templateId: 'neon_celebration',
    eventType: 'birthday',
    event_type: 'birthday',
    title: "Reyansh's 18th Neon Glow Celebration",
    headline: 'Electrifying Bass, Neon Glow Sticks, and Non-Stop Midnight Anthems',
    primary_names: 'Reyansh',
    event_date: '2026-11-21',
    venue_name: 'Warehouse 9 Studio & Sound Stage',
    venue_address: 'Industrial Arts District, Al Quoz 1, Dubai UAE',
    venue_map_url: 'https://maps.google.com/?q=Al+Quoz+Dubai',
    theme_id: 'cyber_neon_glow',
    hero_image_url: 'assets/images/sangeet_couple.jpg',
    hashtag: '#ReyanshNeonGlow',
    isTemplate: true,
    isPublic: true,
    styleTags: ['Dark Luxury', 'Modern'],
    description: 'High-octane immersive party featuring ultraviolet blacklights, neon laser installations, arcade zone, festival-grade sound, and gourmet street food.',
    sections: [
      { id: 'hero', section_key: 'hero', title: 'Neon Welcome', is_enabled: true, sort_order: 0, custom_content_json: JSON.stringify({ subtitle: 'Enter the Neon Dimension', quote: 'Turn the music all the way up and glow in the dark!' }) },
      { id: 'reveal', section_key: 'reveal', title: 'Party Date Reveal', is_enabled: true, sort_order: 1, custom_content_json: JSON.stringify({ scratchText: 'NOVEMBER 21, 2026 • WAREHOUSE 9 DUBAI' }) },
      { id: 'events', section_key: 'events', title: 'Festival Schedule', is_enabled: true, sort_order: 2, custom_content_json: '{}' },
      { id: 'gallery', section_key: 'gallery', title: 'Neon Glow Highlights', is_enabled: true, sort_order: 3, custom_content_json: JSON.stringify({
        photos: [
          { src: 'assets/images/sangeet_couple.jpg', caption: 'Neon Lights & Beats' },
          { src: 'assets/images/birthday_hero.jpg', caption: 'Cake Drop' }
        ]
      }) },
      { id: 'venue', section_key: 'venue', title: 'Warehouse 9 Location', is_enabled: true, sort_order: 4, custom_content_json: '{}' },
      { id: 'rsvp', section_key: 'rsvp', title: 'Guest RSVP', is_enabled: true, sort_order: 5, custom_content_json: '{}' }
    ],
    functions: [
      { id: 'glow_station', function_key: 'glow_station', title: 'Neon Face Paint & Glow Bar', subtitle: 'Prep for the Beat Drop', date_time: 'Nov 21, 2026 • 08:00 PM', venue_name: 'Blacklight Foyer', dress_code: 'White or Neon UV Reactive', palette_colors_json: JSON.stringify(['#00E5FF', '#FF007F']), illustration_url: 'assets/images/birthday_hero.jpg', description: 'UV glow face painting, neon glasses, LED bracelets, and mocktails.', sort_order: 0 },
      { id: 'arcade', function_key: 'arcade', title: 'Arcade & VR Tournament', subtitle: 'Racing Simulators & Laser Tag', date_time: 'Nov 21, 2026 • 09:00 PM', venue_name: 'Studio B Gaming Zone', dress_code: 'Streetwear Chic', palette_colors_json: JSON.stringify(['#76FF03', '#D500F9']), illustration_url: 'assets/images/first_date_couple.jpg', description: 'Multiplayer VR battles, retro arcade cabinets, and leaderboard prizes.', sort_order: 1 },
      { id: 'cake_rave', function_key: 'cake_rave', title: 'Grand Cake Drop & Midnight Rave', subtitle: 'CO2 Jets & Festival DJ', date_time: 'Nov 21, 2026 • 11:30 PM', venue_name: 'Main Sound Stage', dress_code: 'Dancing Shoes Required', palette_colors_json: JSON.stringify(['#FF1744', '#00E676']), illustration_url: 'assets/images/sangeet_couple.jpg', description: 'Glow-in-the-dark neon drip cake, confetti explosion, and festival DJ set.', sort_order: 2 }
    ]
  }
};

// Aliases for legacy ID lookups
CANONICAL_TEMPLATES.indian_wedding = CANONICAL_TEMPLATES.palace_romance;
CANONICAL_TEMPLATES.muslim_wedding = CANONICAL_TEMPLATES.noor_nikah;
CANONICAL_TEMPLATES.birthday = CANONICAL_TEMPLATES.pastel_party;

const FirestoreStore = {
  // Canonical templates
  getCanonicalTemplate(templateIdOrSlug) {
    if (CANONICAL_TEMPLATES[templateIdOrSlug]) return CANONICAL_TEMPLATES[templateIdOrSlug];
    return Object.values(CANONICAL_TEMPLATES).find(t => t.slug === templateIdOrSlug) || null;
  },

  getAllTemplates(typeFilter = null, styleFilter = null) {
    // Unique 18 templates list (filtering out legacy alias keys)
    const uniqueKeys = [
      'royal_mandap', 'marigold_bloom', 'mehendi_garden', 'sangeet_afterglow',
      'palace_romance', 'south_heritage', 'blush_vows', 'minimal_ivory',
      'noor_nikah', 'emerald_qasr', 'ivory_dua', 'zafraan_evening', 'resham_royale', 'midnight_walima',
      'pastel_party', 'little_star', 'elegant_soiree', 'neon_celebration'
    ];

    let templates = uniqueKeys.map(k => CANONICAL_TEMPLATES[k]).filter(Boolean);

    // Apply type filter if provided
    if (typeFilter && typeFilter !== 'all') {
      const normalizedType = typeFilter.toLowerCase().replace(/\s+/g, '_');
      templates = templates.filter(t => t.eventType === normalizedType || t.eventType.includes(normalizedType));
    }

    // Apply style filter if provided
    if (styleFilter && styleFilter !== 'all') {
      const normalizedStyle = styleFilter.toLowerCase();
      templates = templates.filter(t => (t.styleTags || []).some(s => s.toLowerCase() === normalizedStyle || s.toLowerCase().includes(normalizedStyle)));
    }

    return templates.map(t => ({
      id: t.id,
      slug: t.slug,
      templateId: t.templateId,
      eventType: t.eventType,
      title: t.title,
      headline: t.headline,
      primary_names: t.primary_names,
      event_date: t.event_date,
      venue_name: t.venue_name,
      hero_image_url: t.hero_image_url,
      styleTags: t.styleTags || [],
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
      message: 'Your template is ready. Add your names, date, venue, photos, and celebrations.'
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
