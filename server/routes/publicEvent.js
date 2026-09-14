/**
 * PUBLIC & PRIVATE SHARE EVENT RENDERER ROUTE
 * Handles public viewing, draft restrictions, and passcode/token gating for private shares.
 */

const express = require('express');
const router = express.Router();
const db = require('../database/db');
const { optionalAuth } = require('../middleware/auth');
const { verifyPassword } = require('../config/security');

// Infallible template definitions to ensure showcases never 404 in serverless / ephemeral environments
function getStaticTemplate(slug) {
  if (slug === 'vijay-rashima-wedding') {
    return {
      event: {
        id: 1,
        slug: 'vijay-rashima-wedding',
        event_type: 'indian_wedding',
        title: 'The Royal Wedding Celebration',
        headline: 'Two Souls, One Heartbeat, A Lifetime of Laughter',
        primary_names: 'Vijay & Rashima',
        event_date: '2026-12-14',
        venue_name: 'The Oberoi Udaivilas & Royal Grounds',
        venue_address: 'Haridas Ji Ki Magri, Lake Pichola, Udaipur, Rajasthan 313001',
        venue_map_url: 'https://maps.google.com/?q=The+Oberoi+Udaivilas+Udaipur',
        visibility: 'public',
        theme_id: 'luxury_pastel',
        hero_image_url: 'assets/images/hero_couple.jpg',
        hashtag: '#ViShimaForever',
        is_preview: false
      },
      sections: [
        { section_key: 'hero', title: 'Hero Banner', custom_content_json: JSON.stringify({ subtitle: 'We Are Getting Married!', quote: 'Join us in Udaipur for our dream nuptials.' }) },
        { section_key: 'reveal', title: 'Auspicious Countdown & Scratch Reveal', custom_content_json: JSON.stringify({ scratchText: 'DECEMBER 14, 2026 • THE OBEROI UDAIVILAS' }) },
        { section_key: 'story', title: 'Our Love Story', custom_content_json: JSON.stringify({
          milestones: [
            { title: 'The Serendipitous Hello', date: 'October 2022', desc: 'Introduced by mutual friends during Diwali sparklers.' },
            { title: 'The 4-Hour Coffee Date', date: 'November 2022', desc: 'A quick coffee that turned into hours of shared dreams.', img: 'assets/images/first_date_couple.jpg' },
            { title: 'The Sunset Lake Proposal', date: 'February 2025', desc: 'Overlooking Lake Pichola at sunset, she said YES!', img: 'assets/images/proposal_couple.jpg' },
            { title: 'Forever Begins', date: 'December 2026', desc: 'Our sacred vows under the royal mandap.' }
          ]
        }) },
        { section_key: 'events', title: 'Wedding Ceremonies Itinerary', custom_content_json: '{}' },
        { section_key: 'gallery', title: 'Couple Gallery', custom_content_json: JSON.stringify({
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
        }) },
        { section_key: 'venue', title: 'Wedding Venue & Directions', custom_content_json: '{}' },
        { section_key: 'family', title: 'Meet The Family', custom_content_json: JSON.stringify({
          groomSide: [
            { name: 'Rajesh & Sunita Kapur', relation: 'Parents of the Groom', quote: 'Blessed to welcome Rashima into our lives!' },
            { name: 'Kabir Kapur', relation: 'Brother & Best Man', quote: 'Loudest cheerleader on the Sangeet dance floor!' }
          ],
          brideSide: [
            { name: 'Devendra & Meenakshi Sharma', relation: 'Parents of the Bride', quote: 'Our princess has found her prince charming.' },
            { name: 'Isha Sharma', relation: 'Sister & Maid of Honor', quote: 'Official lehenga fluffer and secret keeper!' }
          ]
        }) },
        { section_key: 'dress_code', title: 'Dress Code Guide', custom_content_json: '{}' },
        { section_key: 'travel', title: 'Travel & Accommodation', custom_content_json: JSON.stringify({
          airport: 'Maharana Pratap Airport (UDR) - 35 mins away',
          hotelPromo: 'Promo Code: #VISHIMA2026 at Udaivilas / Trident'
        }) },
        { section_key: 'rsvp', title: 'RSVP & Guest Confirmation', custom_content_json: '{}' },
        { section_key: 'guestbook', title: 'Digital Guestbook', custom_content_json: '{}' },
        { section_key: 'faqs', title: 'Frequently Asked Questions', custom_content_json: JSON.stringify({
          questions: [
            { q: 'What is the dress code?', a: 'Haldi: Yellow, Mehendi: Green, Sangeet: Indo-Western Glam, Wedding: Red & Pastels, Reception: Black Tie.' },
            { q: 'Are children invited?', a: 'Yes, kids are warmly welcome! Childcare is available at the resort.' },
            { q: 'What is the gift policy?', a: 'Your loving presence and blessings are our greatest gift.' }
          ]
        }) },
        { section_key: 'thank_you', title: 'Thank You & Love Note', custom_content_json: '{}' }
      ],
      functions: [
        { function_key: 'haldi', title: 'Haldi Ceremony', subtitle: 'Pithi & Phoolon Ki Holi', date_time: 'Dec 12, 2026 • 10:00 AM', venue_name: 'Chandani Courtyard', dress_code: 'Sunburst Yellow & Floral Jewelry', palette_colors_json: JSON.stringify(['#FFD700', '#FFA000', '#FFF9C4']), illustration_url: 'assets/images/haldi_couple.jpg', description: 'Turmeric blessings, marigold showers, and joyful laughter.' },
        { function_key: 'mehendi', title: 'Mehendi Carnival', subtitle: 'Henna & Rajasthani Folk Beats', date_time: 'Dec 12, 2026 • 04:30 PM', venue_name: 'Poolside Palm Gardens', dress_code: 'Emerald Greens & Boho Florals', palette_colors_json: JSON.stringify(['#2E7D32', '#81C784', '#E8F5E9']), illustration_url: 'assets/images/mehendi_couple.jpg', description: 'Artisan mehendi, bangles bazaar, and delicious chaat street food.' },
        { function_key: 'sangeet', title: 'Sangeet Extravaganza', subtitle: 'Dance Face-Off & DJ Night', date_time: 'Dec 13, 2026 • 07:00 PM', venue_name: 'Royal Grand Ballroom', dress_code: 'Midnight Blue, Glitz & Indo-Western', palette_colors_json: JSON.stringify(['#1A237E', '#D4AF37', '#EDE7F6']), illustration_url: 'assets/images/sangeet_couple.jpg', description: 'Family dance showdown, live percussionists, and celebrity DJ sets.' },
        { function_key: 'wedding', title: 'The Sacred Wedding', subtitle: 'Baraat, Varmala & Saat Phere', date_time: 'Dec 14, 2026 • 10:30 AM', venue_name: 'Lakeside Floral Mandap', dress_code: 'Regal Crimson, Ivory & Royal Pastels', palette_colors_json: JSON.stringify(['#B71C1C', '#D4AF37', '#FFF8E1']), illustration_url: 'assets/images/wedding_couple.jpg', description: 'Royal Baraat procession and holy Vedic mantras overlooking the lake.' },
        { function_key: 'reception', title: 'Grand Wedding Reception', subtitle: 'Black Tie Gala Banquet', date_time: 'Dec 14, 2026 • 07:30 PM', venue_name: 'The Palace Grand Lawn', dress_code: 'Black Tie, Tuxedos & Evening Gowns', palette_colors_json: JSON.stringify(['#212121', '#F8BBD0', '#F5F5F5']), illustration_url: 'assets/images/reception_couple.jpg', description: 'A night of elegance, toasts, champagne, and live symphony music.' }
      ]
    };
  }

  if (slug === 'zain-ayla-nikah') {
    return {
      event: {
        id: 2,
        slug: 'zain-ayla-nikah',
        event_type: 'muslim_wedding',
        title: 'A Celebration of Two Souls & Sacred Nikah',
        headline: 'And We created you in pairs — Surah An-Naba (78:8)',
        primary_names: 'Zain & Ayla',
        event_date: '2026-11-20',
        venue_name: 'The Grand Serena & Crystal Ballroom',
        venue_address: 'Club Road, Islamabad 44000',
        venue_map_url: 'https://maps.google.com/?q=Serena+Hotel+Islamabad',
        visibility: 'public',
        theme_id: 'emerald_ivory',
        hero_image_url: 'assets/images/muslim_couple.jpg',
        hashtag: '#ZainWedsAyla',
        is_preview: false
      },
      sections: [
        { section_key: 'hero', title: 'Hero Banner', custom_content_json: JSON.stringify({ subtitle: 'In the Name of Allah, the Most Gracious, the Most Merciful', quote: 'Together with our families, we invite you to celebrate our union.' }) },
        { section_key: 'reveal', title: 'Auspicious Date & Scratch Reveal', custom_content_json: JSON.stringify({ scratchText: 'NOVEMBER 20, 2026 • THE SERENA CRYSTAL BALLROOM' }) },
        { section_key: 'story', title: 'Our Journey of Faith & Love', custom_content_json: JSON.stringify({
          milestones: [
            { title: 'Families Meet', date: 'January 2024', desc: 'A blessed evening where our parents first connected over tea and prayers.' },
            { title: 'The Baat Pakki', date: 'April 2024', desc: 'An intimate family gathering formalizing our blessed commitment.', img: 'assets/images/first_date_couple.jpg' },
            { title: 'The Engagement Dua', date: 'December 2024', desc: 'Ring exchange surrounded by Qur’anic recitations and warm duas.', img: 'assets/images/proposal_couple.jpg' },
            { title: 'The Sacred Nikah', date: 'November 2026', desc: 'Signing the marriage contract and beginning our eternal life together.' }
          ]
        }) },
        { section_key: 'events', title: 'Nikah & Wedding Ceremonies', custom_content_json: '{}' },
        { section_key: 'gallery', title: 'Celebration Gallery', custom_content_json: JSON.stringify({
          photos: [
            { src: 'assets/images/muslim_couple.jpg', caption: 'Zain & Ayla Sacred Nikah Portrait' },
            { src: 'assets/images/proposal_couple.jpg', caption: 'Engagement Blessings' },
            { src: 'assets/images/haldi_couple.jpg', caption: 'Mayun & Dholki Festivities' },
            { src: 'assets/images/mehendi_couple.jpg', caption: 'Mehendi Night Elegance' },
            { src: 'assets/images/reception_couple.jpg', caption: 'Walima Grand Banquet' }
          ]
        }) },
        { section_key: 'venue', title: 'Venue & Directions', custom_content_json: '{}' },
        { section_key: 'family', title: 'Meet The Families', custom_content_json: JSON.stringify({
          groomSide: [
            { name: 'Tariq & Nabila Siddiqui', relation: 'Parents of the Groom', quote: 'Alhamdulillah for blessing our son with such a pious partner.' }
          ],
          brideSide: [
            { name: 'Dr. Farooq & Shahnaz Khan', relation: 'Parents of the Bride', quote: 'Sending our daughter with prayers and endless love.' }
          ]
        }) },
        { section_key: 'dress_code', title: 'Modest Dress Code', custom_content_json: '{}' },
        { section_key: 'rsvp', title: 'RSVP & Guest Attendance', custom_content_json: '{}' },
        { section_key: 'guestbook', title: 'Duas & Wishes Wall', custom_content_json: '{}' },
        { section_key: 'faqs', title: 'Guest FAQs', custom_content_json: JSON.stringify({
          questions: [
            { q: 'Are prayers accommodated at the venue?', a: 'Yes, designated prayer areas for men and women are available.' },
            { q: 'What is the dress code?', a: 'Modest formal wear in emerald, gold, ivory, or pastel tones.' }
          ]
        }) },
        { section_key: 'thank_you', title: 'JazakAllah Khair', custom_content_json: '{}' }
      ],
      functions: [
        { function_key: 'dholki', title: 'Dholki & Mayun Night', subtitle: 'Folk Tappay & Ubtan Ceremony', date_time: 'Nov 18, 2026 • 07:00 PM', venue_name: 'Siddiqui Family Courtyard', dress_code: 'Ochre, Mustard & Marigold', palette_colors_json: JSON.stringify(['#FFB300', '#FFF59D', '#FFE082']), illustration_url: 'assets/images/haldi_couple.jpg', description: 'Traditional dholak rhythms, ubtan blessings, and family folk singing.' },
        { function_key: 'mehendi', title: 'Mehendi Celebration', subtitle: 'Henna & Festive Elegance', date_time: 'Nov 19, 2026 • 06:30 PM', venue_name: 'Emerald Pavilion', dress_code: 'Forest Green & Olive', palette_colors_json: JSON.stringify(['#2E7D32', '#A5D6A7', '#1B5E20']), illustration_url: 'assets/images/mehendi_couple.jpg', description: 'Artisan henna application, live sufi melodies, and traditional feast.' },
        { function_key: 'nikah', title: 'The Sacred Nikah Ceremony', subtitle: 'Ijab-e-Qubool & Khutbah', date_time: 'Nov 20, 2026 • 04:30 PM', venue_name: 'Grand Noor Hall', dress_code: 'Ivory, White & Soft Gold', palette_colors_json: JSON.stringify(['#FFFFFF', '#D4AF37', '#004D40']), illustration_url: 'assets/images/muslim_couple.jpg', description: 'Solemnization of the sacred marriage contract followed by dua.' },
        { function_key: 'walima', title: 'Grand Walima Banquet', subtitle: 'A Night of Elegance & Gratitude', date_time: 'Nov 21, 2026 • 07:30 PM', venue_name: 'The Crystal Ballroom', dress_code: 'Navy & Champagne', palette_colors_json: JSON.stringify(['#1A237E', '#D4AF37', '#F5F5F5']), illustration_url: 'assets/images/reception_couple.jpg', description: 'Opulent banquet reception hosted with gratitude by the groom’s family.' }
      ]
    };
  }

  if (slug === 'arias-sweet-16') {
    return {
      event: {
        id: 3,
        slug: 'arias-sweet-16',
        event_type: 'birthday',
        title: "Aria's Sweet 16 Neon Sparkle Bash",
        headline: 'Celebrating 16 Years of Magic, Laughter & Joy!',
        primary_names: 'Aria',
        event_date: '2026-10-18',
        venue_name: 'Skyline Terrace Lounge & Penthouse',
        venue_address: 'Penthouse Level, Grand Tower, City Center',
        venue_map_url: 'https://maps.google.com/?q=Grand+Tower+City+Center',
        visibility: 'public',
        theme_id: 'princess_pink',
        hero_image_url: 'assets/images/birthday_hero.jpg',
        hashtag: '#AriaSweet16',
        is_preview: false
      },
      sections: [
        { section_key: 'hero', title: 'Welcome Banner', custom_content_json: JSON.stringify({ subtitle: "Chapter 16: Let's Glow!", quote: 'Join us for an unforgettable night of music, confetti, and sweet memories.' }) },
        { section_key: 'reveal', title: 'Mystery Scratch Card & Date', custom_content_json: JSON.stringify({ scratchText: 'OCTOBER 18, 2026 • SKYLINE TERRACE LOUNGE' }) },
        { section_key: 'events', title: 'Party Itinerary & Activities', custom_content_json: '{}' },
        { section_key: 'gallery', title: 'Photo Highlights', custom_content_json: JSON.stringify({
          photos: [
            { src: 'assets/images/birthday_hero.jpg', caption: 'Sweet 16 Birthday Portrait' },
            { src: 'assets/images/first_date_couple.jpg', caption: 'Childhood Throwback Memories' },
            { src: 'assets/images/reception_couple.jpg', caption: 'Party Vibes' }
          ]
        }) },
        { section_key: 'venue', title: 'Party Venue & Map', custom_content_json: '{}' },
        { section_key: 'dress_code', title: 'Party Dress Code', custom_content_json: '{}' },
        { section_key: 'registry', title: 'Wishlist & Gift Links', custom_content_json: '{}' },
        { section_key: 'rsvp', title: 'Party RSVP', custom_content_json: '{}' },
        { section_key: 'guestbook', title: 'Birthday Wishes Wall', custom_content_json: '{}' },
        { section_key: 'faqs', title: 'Party FAQs', custom_content_json: JSON.stringify({
          questions: [
            { q: 'Is there parking at the venue?', a: 'Yes, complimentary valet parking is provided at the main entrance.' },
            { q: 'What is the theme?', a: 'Neon Sparkle & Pastel Glam!' }
          ]
        }) },
        { section_key: 'thank_you', title: 'Thank You Note', custom_content_json: '{}' }
      ],
      functions: [
        { function_key: 'welcome', title: 'Red Carpet Welcome & Mocktails', subtitle: 'Arrivals & Photo Booth', date_time: 'Oct 18, 2026 • 06:00 PM', venue_name: 'Glasshouse Foyer', dress_code: 'Pastel Glam', palette_colors_json: JSON.stringify(['#F8BBD0', '#E1BEE7']), illustration_url: 'assets/images/birthday_hero.jpg', description: 'Signature mocktails, glitter polaroid photo booth, and red carpet walk.' },
        { function_key: 'games', title: 'Trivia & Interactive Games', subtitle: 'Fun Challenges & Prizes', date_time: 'Oct 18, 2026 • 07:00 PM', venue_name: 'Main Lounge', dress_code: 'Party Chic', palette_colors_json: JSON.stringify(['#FFD54F', '#80DEEA']), illustration_url: 'assets/images/first_date_couple.jpg', description: 'Hilarious childhood trivia, musical chairs remix, and cute prizes.' },
        { function_key: 'cake_cutting', title: 'Grand Cake Cutting Ceremony', subtitle: 'Make a Wish & Candle Blow', date_time: 'Oct 18, 2026 • 08:15 PM', venue_name: 'The Cake Stage', dress_code: 'Shimmer & Shine', palette_colors_json: JSON.stringify(['#F48FB1', '#FFD700']), illustration_url: 'assets/images/birthday_hero.jpg', description: '3-tier handcrafted strawberry macaron cake, confetti cannons, and cheers!' },
        { function_key: 'dinner', title: 'Gourmet Dinner & Dessert Buffet', subtitle: 'Artisanal Street & Italian Cuisine', date_time: 'Oct 18, 2026 • 08:45 PM', venue_name: 'Terrace Banquet', dress_code: 'Casual Chic', palette_colors_json: JSON.stringify(['#A5D6A7', '#FFE082']), illustration_url: 'assets/images/reception_couple.jpg', description: 'Wood-fired pizzas, taco bar, gourmet sliders, and warm churros station.' },
        { function_key: 'entertainment', title: 'DJ Dance Floor Madness', subtitle: 'Beat Drops & Glow Sticks', date_time: 'Oct 18, 2026 • 09:30 PM', venue_name: 'Neon Ballroom', dress_code: 'Dancing Shoes Required', palette_colors_json: JSON.stringify(['#BA68C8', '#4FC3F7']), illustration_url: 'assets/images/sangeet_couple.jpg', description: 'DJ playing top hits, neon glow sticks, and dancing till midnight!' }
      ]
    };
  }

  return null;
}

router.get('/:slug', optionalAuth, (req, res) => {
  try {
    const { slug } = req.params;
    const { invite, passcode } = req.query;

    let event = db.prepare('SELECT * FROM events WHERE slug = ?').get(slug);
    if (!event) {
      // Check if it matches a template slug; attempt auto-seed
      const templateSlugs = ['vijay-rashima-wedding', 'zain-ayla-nikah', 'arias-sweet-16'];
      if (templateSlugs.includes(slug)) {
        try {
          const { seedDatabase } = require('../database/seed');
          seedDatabase();
          event = db.prepare('SELECT * FROM events WHERE slug = ?').get(slug);
        } catch (e) {
          console.warn('Auto-seed attempt:', e.message);
        }
      }
    }

    if (!event) {
      // Infallible fallback for template showcases
      const staticTemplate = getStaticTemplate(slug);
      if (staticTemplate) {
        return res.json(staticTemplate);
      }
      return res.status(404).json({ error: 'Event not found.' });
    }

    const isOwner = req.user && req.user.id === event.owner_user_id;

    // 1. DRAFT MODE
    if (event.visibility === 'draft' && !isOwner) {
      return res.status(403).json({
        error: 'This event website is currently in private Draft mode and can only be viewed by its owner.',
        visibility: 'draft'
      });
    }

    // 2. PRIVATE SHARE MODE
    if (event.visibility === 'private_share' && !isOwner) {
      let isAuthorized = false;

      // Check invite code
      if (invite) {
        const inviteRecord = db.prepare(`
          SELECT * FROM private_invites
          WHERE event_id = ? AND invite_code = ?
        `).get(event.id, invite);

        if (inviteRecord) {
          const notExpired = !inviteRecord.expires_at || new Date(inviteRecord.expires_at) > new Date();
          const hasUses = inviteRecord.uses_remaining > 0;
          if (notExpired && hasUses) {
            isAuthorized = true;
            // Decrement use count
            db.prepare('UPDATE private_invites SET uses_remaining = uses_remaining - 1 WHERE id = ?').run(inviteRecord.id);
          }
        }
      }

      // Check passcode
      if (!isAuthorized && passcode && event.private_passcode_hash) {
        if (verifyPassword(passcode, event.private_passcode_hash)) {
          isAuthorized = true;
        }
      }

      if (!isAuthorized) {
        return res.status(401).json({
          requires_auth: true,
          event_type: event.event_type,
          title: event.title,
          primary_names: event.primary_names,
          theme_id: event.theme_id,
          message: 'This invitation is private. Please enter the invitation passcode or use your private invite link.'
        });
      }
    }

    // 3. COMPILE PUBLIC CONTENT
    // Sanitize event object: never leak passcode hashes or internal owner IDs
    const safeEvent = {
      id: event.id,
      slug: event.slug,
      event_type: event.event_type,
      title: event.title,
      headline: event.headline,
      primary_names: event.primary_names,
      event_date: event.event_date,
      venue_name: event.venue_name,
      venue_address: event.venue_address,
      venue_map_url: event.venue_map_url,
      visibility: event.visibility,
      theme_id: event.theme_id,
      hero_image_url: event.hero_image_url,
      hashtag: event.hashtag,
      is_preview: Boolean(isOwner)
    };

    const sections = db.prepare(`
      SELECT section_key, title, custom_content_json
      FROM event_sections
      WHERE event_id = ? AND is_enabled = 1
      ORDER BY sort_order ASC
    `).all(event.id);

    const functions = db.prepare(`
      SELECT function_key, title, subtitle, date_time, venue_name, dress_code, palette_colors_json, illustration_url, description
      FROM event_functions
      WHERE event_id = ?
      ORDER BY sort_order ASC
    `).all(event.id);

    res.json({
      event: safeEvent,
      sections,
      functions
    });
  } catch (err) {
    console.error('Public event fetch error:', err);
    res.status(500).json({ error: 'Failed to render event website.' });
  }
});

// Verify Passcode Endpoint (POST)
router.post('/:slug/verify-passcode', (req, res) => {
  try {
    const { slug } = req.params;
    const { passcode } = req.body;

    const event = db.prepare('SELECT id, private_passcode_hash FROM events WHERE slug = ?').get(slug);
    if (!event) return res.status(404).json({ error: 'Event not found.' });

    if (!event.private_passcode_hash || !verifyPassword(passcode || '', event.private_passcode_hash)) {
      return res.status(401).json({ error: 'Incorrect passcode. Please try again.' });
    }

    res.json({ success: true, message: 'Passcode verified successfully!' });
  } catch (err) {
    res.status(500).json({ error: 'Verification failed.' });
  }
});

module.exports = router;
