/**
 * RIWAAYAT VENUE — 18 DISTINCT TEMPLATE LAYOUT RENDERERS
 * Defines unique DOM layouts, hero compositions, ceremony itinerary structures,
 * and signature interactive showcase components for all 18 canonical templates.
 */

const SLUG_TO_TEMPLATE_KEY = {
  'aditya-radhika-mandap': 'royal_mandap',
  'ishaan-ananya-marigold': 'marigold_bloom',
  'kabir-diya-mehendi': 'mehendi_garden',
  'dev-tara-afterglow': 'sangeet_afterglow',
  'vijay-rashima-wedding': 'palace_romance',
  'karthik-meera-heritage': 'south_heritage',
  'aarav-siya-blush': 'blush_vows',
  'rohan-alisha-ivory': 'minimal_ivory',
  'zain-ayla-nikah': 'noor_nikah',
  'hamza-zoya-qasr': 'emerald_qasr',
  'bilal-noor-dua': 'ivory_dua',
  'daniyal-mahnoor-zafraan': 'zafraan_evening',
  'shahmeer-hania-royale': 'resham_royale',
  'farhan-sarah-walima': 'midnight_walima',
  'farhan-aliza-walima': 'midnight_walima',
  'arias-sweet-16': 'pastel_party',
  'liam-first-birthday': 'little_star',
  'natasha-30th-soiree': 'elegant_soiree',
  'reyansh-neon-glow-bash': 'neon_celebration'
};

const THEME_TO_TEMPLATE_KEY = {
  'royal_heritage': 'royal_mandap',
  'sunshine_yellow': 'marigold_bloom',
  'botanical_mint': 'mehendi_garden',
  'midnight_sparkle': 'sangeet_afterglow',
  'luxury_pastel': 'palace_romance',
  'temple_tradition': 'south_heritage',
  'blush_rose': 'blush_vows',
  'architectural_ivory': 'minimal_ivory',
  'sacred_gold': 'noor_nikah',
  'islamic_emerald': 'emerald_qasr',
  'moroccan_emerald': 'emerald_qasr',
  'pure_ivory': 'ivory_dua',
  'saffron_amber': 'zafraan_evening',
  'crimson_silk': 'resham_royale',
  'sapphire_midnight': 'midnight_walima',
  'birthday_pastel': 'pastel_party',
  'candy_pastel': 'pastel_party',
  'celestial_gold': 'little_star',
  'art_deco_champagne': 'elegant_soiree',
  'cyber_neon': 'neon_celebration'
};

function resolveTemplateKey(event) {
  if (!event) return 'royal_mandap';
  if (event.template_id && TEMPLATE_RENDERERS[event.template_id]) return event.template_id;
  if (event.templateId && TEMPLATE_RENDERERS[event.templateId]) return event.templateId;
  if (event.id && TEMPLATE_RENDERERS[event.id]) return event.id;
  if (event.slug && SLUG_TO_TEMPLATE_KEY[event.slug]) return SLUG_TO_TEMPLATE_KEY[event.slug];
  if (event.theme_id && THEME_TO_TEMPLATE_KEY[event.theme_id]) return THEME_TO_TEMPLATE_KEY[event.theme_id];
  if (event.event_type === 'muslim_wedding') return 'noor_nikah';
  if (event.event_type === 'birthday') return 'pastel_party';
  return 'royal_mandap';
}

const TEMPLATE_RENDERERS = {
  // 1. ROYAL MANDAP (Heritage Palace Majestic)
  royal_mandap: {
    id: 'royal_mandap',
    name: 'Royal Mandap',
    archetype: 'Heritage Palace Majestic',
    renderHero(content, event) {
      return `
        <section class="regal-arch-hero">
          <div class="arch-pillars-frame">
            <div class="pillar-content">
              <div class="sanskrit-shloka-header">॥ श्री गणेशाय नमः ॥ Royal Mandap</div>
              <div class="badge-status badge-public" style="margin-bottom: 14px;">
                <i class="fa-solid fa-crown"></i> ${content.subtitle || 'Royal Palace Union'}
              </div>
              <h1 style="font-family: var(--font-display); font-size: 3.8rem; line-height: 1.15; color: #8B0000; margin-bottom: 12px;">
                ${event.primary_names}
              </h1>
              <div style="font-family: var(--font-display); font-size: 1.3rem; letter-spacing: 2px; color: var(--primary-gold-dark); margin-bottom: 16px;">
                ${event.title}
              </div>
              <p style="font-size: 1.05rem; color: #554840; margin-bottom: 28px; font-style: italic;">
                "${event.headline || 'Two royal heritages united under sacred Vedic mantras and grand palace arches.'}"
              </p>
              <div style="display: flex; gap: 14px; flex-wrap: wrap;">
                <a href="#section-rsvp" class="btn-gold" style="padding: 12px 30px;"><i class="fa-solid fa-scroll"></i> Royal RSVP</a>
                <a href="#section-reveal" class="btn-outline" style="padding: 12px 26px;"><i class="fa-solid fa-gem"></i> Auspicious Date</a>
              </div>
            </div>
            <div class="hero-avatar-box" style="border: 4px solid #D4AF37; border-radius: 20px; overflow: hidden; box-shadow: 0 16px 36px rgba(139,0,0,0.18);">
              <img src="${event.hero_image_url || '/assets/templates/royal-mandap/hero.webp'}" alt="${event.primary_names}" class="hero-avatar-img">
            </div>
          </div>
        </section>
      `;
    },
    renderFunctions(functions, event) {
      const cards = functions.map((f, i) => `
        <div class="royal-decree-card">
          <div class="wax-seal-stamp"><i class="fa-solid fa-crown"></i></div>
          <span style="font-size: 0.8rem; font-weight: 700; color: #8B0000; text-transform: uppercase; letter-spacing: 1.5px;">Royal Rite 0${i + 1}</span>
          <h3 style="font-size: 1.7rem; font-family: var(--font-display); color: #2F200A; margin: 8px 0;">${f.title}</h3>
          ${f.subtitle ? `<div style="color: #7B6858; font-size: 0.92rem; margin-bottom: 12px;">${f.subtitle}</div>` : ''}
          <div style="font-size: 0.92rem; margin-bottom: 12px;">
            <div><i class="fa-regular fa-clock" style="color: #D4AF37;"></i> ${f.date_time || 'Auspicious Muhurtha'}</div>
            <div><i class="fa-solid fa-location-dot" style="color: #D4AF37;"></i> ${f.venue_name || event.venue_name}</div>
            ${f.dress_code ? `<div><i class="fa-solid fa-shirt" style="color: #D4AF37;"></i> <strong>Poshak:</strong> ${f.dress_code}</div>` : ''}
          </div>
          <p style="font-size: 0.9rem; color: #554840;">${f.description || ''}</p>
        </div>
      `).join('');
      return `
        <section class="event-section-wrap royal-courtyard-section" style="background: #FFFDF7;">
          <div class="section-header">
            <span class="section-subtitle">Ceremonial Order</span>
            <h2 class="section-title">Royal Courtyard Itinerary</h2>
          </div>
          <div class="royal-courtyard-grid">${cards}</div>
        </section>
      `;
    },
    renderSignatureSection(event) {
      const vows = [
        { num: 'I', text: 'To nourish each other with wholesome sustenance and honor divine presence.' },
        { num: 'II', text: 'To protect our home with strength, courage, and spiritual resilience.' },
        { num: 'III', text: 'To cultivate prosperity and wealth through righteous living.' },
        { num: 'IV', text: 'To acquire wisdom and lifelong companionship in all life stages.' },
        { num: 'V', text: 'To share happiness, sorrow, and mutual devotion across generations.' },
        { num: 'VI', text: 'To remain faithful and steadfast in all seasons of our union.' },
        { num: 'VII', text: 'To live as true eternal friends, bound by sacred fire and divine grace.' }
      ];
      const vowsHtml = vows.map(v => `
        <div class="sacred-vow-card">
          <span style="font-family: var(--font-display); font-weight: 700; color: #8B0000;">Vow ${v.num}</span>
          <p style="margin: 6px 0 0; font-size: 0.92rem; color: #44372F;">${v.text}</p>
        </div>
      `).join('');
      return `
        <section class="vedic-sacred-fire-wrap">
          <div class="section-header">
            <span class="section-subtitle">Sacred Vedic Rituals</span>
            <h2 class="section-title">Agni Kund & The Seven Vows (Saat Phere)</h2>
            <p style="max-width: 650px; margin: 10px auto 0; color: #7B6858;">Circumambulating the sacred fire seven times to solemnize eternal marital bonds.</p>
          </div>
          <div class="seven-vows-grid">${vowsHtml}</div>
        </section>
      `;
    }
  },

  // 2. MARIGOLD BLOOM (Festive Sunlight & Phoolon Ki Holi)
  marigold_bloom: {
    id: 'marigold_bloom',
    name: 'Marigold Bloom',
    archetype: 'Festive Sunlight & Phoolon Ki Holi',
    renderHero(content, event) {
      return `
        <section class="marigold-sunshine-hero">
          <div class="garland-drape-bar">🌼 🌻 🌼 🌻 🌼 🌻 🌼 🌻 🌼</div>
          <div class="marigold-hero-container">
            <div class="badge-status" style="background: #F57F17; color: #FFF; margin-bottom: 14px;">
              <i class="fa-solid fa-sun"></i> ${content.subtitle || 'Haldi & Sunshine Festivities'}
            </div>
            <h1 style="font-family: var(--font-display); font-size: 3.6rem; color: #BF360C; margin-bottom: 8px;">
              ${event.primary_names}
            </h1>
            <p style="font-size: 1.15rem; color: #4E342E; max-width: 700px; margin: 0 auto 24px;">
              "${event.headline || 'Yellow silks, fragrant turmeric, singing dholaks, and cheerful laughter.'}"
            </p>
            <div style="max-width: 700px; width: 100%; border-radius: 24px; overflow: hidden; border: 6px solid #FFF; box-shadow: 0 16px 36px rgba(245,127,23,0.25); margin-bottom: 24px;">
              <img src="${event.hero_image_url || '/assets/templates/marigold-bloom/hero.webp'}" alt="${event.primary_names}" style="width: 100%; display: block;">
            </div>
            <div style="display: flex; gap: 14px;">
              <a href="#section-rsvp" class="btn-gold" style="background: #F57F17; border-color: #E65100; color: #FFF;"><i class="fa-solid fa-seedling"></i> Join The Fun</a>
              <a href="#section-reveal" class="btn-outline" style="border-color: #F57F17; color: #BF360C;"><i class="fa-solid fa-calendar"></i> Ceremony Date</a>
            </div>
          </div>
        </section>
      `;
    },
    renderFunctions(functions, event) {
      const steps = functions.map((f, i) => `
        <div class="petal-timeline-step">
          <div style="display: flex; flex-direction: column; justify-content: center; align-items: center; background: #FFF9C4; border-radius: 12px; padding: 12px;">
            <span style="font-size: 1.4rem; font-weight: 800; color: #F57F17;">0${i + 1}</span>
            <span style="font-size: 0.75rem; text-transform: uppercase; font-weight: 700; color: #BF360C;">Ritual</span>
          </div>
          <div>
            <h3 style="font-size: 1.5rem; color: #BF360C; margin: 0 0 6px;">${f.title}</h3>
            <div style="color: #E65100; font-size: 0.9rem; margin-bottom: 8px;"><i class="fa-regular fa-clock"></i> ${f.date_time || 'Auspicious Morning'}</div>
            <p style="margin: 0; font-size: 0.92rem; color: #5D4037;">${f.description || ''}</p>
          </div>
        </div>
      `).join('');
      return `
        <section class="event-section-wrap" style="background: #FFFDE7;">
          <div class="section-header">
            <span class="section-subtitle" style="color: #F57F17;">Saffron & Turmeric Hours</span>
            <h2 class="section-title" style="color: #BF360C;">Festive Haldi Timeline</h2>
          </div>
          <div class="marigold-timeline">${steps}</div>
        </section>
      `;
    },
    renderSignatureSection(event) {
      return `
        <section class="phoolon-holi-section">
          <div class="section-header">
            <span class="section-subtitle" style="color: #F57F17;">Interactive Ritual</span>
            <h2 class="section-title" style="color: #BF360C;">Phoolon Ki Holi Petal Shower</h2>
            <p style="max-width: 600px; margin: 8px auto 0; color: #5D4037;">Shower the couple with marigold and rose petals in the festive courtyard!</p>
          </div>
          <div id="holi-petal-canvas" style="display:flex; align-items:center; justify-content:center; font-family: var(--font-display); font-size: 1.2rem; color: #E65100;">
            🌸 🌼 Phoolon Ki Holi Blessing Chamber 🌼 🌸
          </div>
        </section>
      `;
    }
  },

  // 3. MEHENDI GARDEN (Bohemian Botanical Glasshouse)
  mehendi_garden: {
    id: 'mehendi_garden',
    name: 'Mehendi Garden',
    archetype: 'Bohemian Botanical Glasshouse',
    renderHero(content, event) {
      return `
        <section class="glasshouse-botanical-hero">
          <div class="conservatory-split-box">
            <div>
              <div class="badge-status" style="background: #2E7D32; color: #FFF; margin-bottom: 16px;">
                <i class="fa-solid fa-leaf"></i> ${content.subtitle || 'Botanical Henna High Tea'}
              </div>
              <h1 style="font-family: var(--font-display); font-size: 3.4rem; color: #1B5E20; margin-bottom: 12px;">
                ${event.primary_names}
              </h1>
              <p style="font-size: 1.05rem; color: #2E7D32; margin-bottom: 24px; line-height: 1.6;">
                "${event.headline || 'Intricate henna swirls, artisanal mocktails, and acoustic melodies amidst blooming jasmine.'}"
              </p>
              <div style="display: flex; gap: 12px;">
                <a href="#section-rsvp" class="btn-gold" style="background: #2E7D32; border-color: #1B5E20; color: #FFF;">Reserve Your Spot</a>
                <a href="#section-reveal" class="btn-outline" style="border-color: #2E7D32; color: #1B5E20;">Henna Itinerary</a>
              </div>
            </div>
            <div style="border-radius: 20px; overflow: hidden; border: 4px solid #A5D6A7; box-shadow: 0 12px 30px rgba(46,125,50,0.15);">
              <img src="${event.hero_image_url || '/assets/templates/mehendi-garden/hero.webp'}" alt="${event.primary_names}" style="width: 100%; height: 380px; object-fit: cover;">
            </div>
          </div>
        </section>
      `;
    },
    renderFunctions(functions, event) {
      const cards = functions.map((f, i) => `
        <div class="henna-lounge-card">
          <span style="font-size: 0.8rem; font-weight: 700; color: #2E7D32; text-transform: uppercase;">Garden Stop 0${i + 1}</span>
          <h3 style="font-size: 1.5rem; color: #1B5E20; margin: 8px 0;">${f.title}</h3>
          <div style="font-size: 0.9rem; color: #388E3C; margin-bottom: 8px;"><i class="fa-regular fa-clock"></i> ${f.date_time}</div>
          <p style="font-size: 0.9rem; color: #4E6550;">${f.description || ''}</p>
        </div>
      `).join('');
      return `
        <section class="event-section-wrap" style="background: #F1F8E9;">
          <div class="section-header">
            <span class="section-subtitle" style="color: #2E7D32;">Lawn & High Tea</span>
            <h2 class="section-title" style="color: #1B5E20;">Henna Conservatory Lounge</h2>
          </div>
          <div class="henna-lounge-scroll">${cards}</div>
        </section>
      `;
    },
    renderSignatureSection(event) {
      return `
        <section class="event-section-wrap" style="background: #FFFFFF;">
          <div class="section-header">
            <span class="section-subtitle" style="color: #2E7D32;">Henna Craftsmanship</span>
            <h2 class="section-title" style="color: #1B5E20;">Artisan Bridal Motifs & High Tea</h2>
          </div>
          <div class="henna-motifs-guide">
            <div class="motif-card">
              <i class="fa-solid fa-feather-pointed" style="font-size: 2rem; color: #2E7D32;"></i>
              <h4 style="margin: 10px 0 4px; color: #1B5E20;">Mayur (Peacock)</h4>
              <p style="font-size: 0.85rem; color: #4E6550;">Grace and eternal beauty</p>
            </div>
            <div class="motif-card">
              <i class="fa-solid fa-circle-notch" style="font-size: 2rem; color: #2E7D32;"></i>
              <h4 style="margin: 10px 0 4px; color: #1B5E20;">Mandala Circle</h4>
              <p style="font-size: 0.85rem; color: #4E6550;">Universal wholeness & blessing</p>
            </div>
            <div class="motif-card">
              <i class="fa-solid fa-mug-hot" style="font-size: 2rem; color: #2E7D32;"></i>
              <h4 style="margin: 10px 0 4px; color: #1B5E20;">Cardamom High Tea</h4>
              <p style="font-size: 0.85rem; color: #4E6550;">Warm saffron brew & petit fours</p>
            </div>
          </div>
        </section>
      `;
    }
  },

  // 4. SANGEET AFTERGLOW (Midnight Glamour & Neon Stage)
  sangeet_afterglow: {
    id: 'sangeet_afterglow',
    name: 'Sangeet Afterglow',
    archetype: 'Midnight Glamour & Neon Stage',
    renderHero(content, event) {
      return `
        <section class="midnight-stage-hero">
          <div class="soundwave-bars">
            <div class="soundwave-bar" style="height: 14px;"></div>
            <div class="soundwave-bar" style="height: 32px;"></div>
            <div class="soundwave-bar" style="height: 20px;"></div>
            <div class="soundwave-bar" style="height: 38px;"></div>
            <div class="soundwave-bar" style="height: 16px;"></div>
          </div>
          <div class="badge-status" style="background: #8A2BE2; color: #FFF; display: inline-block; margin-bottom: 14px;">
            <i class="fa-solid fa-bolt"></i> VIP All-Access Pass
          </div>
          <h1 style="font-family: var(--font-display); font-size: 3.8rem; color: #FFF; text-shadow: 0 0 20px rgba(138,43,226,0.6); margin-bottom: 8px;">
            ${event.primary_names}
          </h1>
          <p style="color: #D1C4E9; max-width: 650px; margin: 0 auto 24px;">
            "${event.headline || 'High-voltage bass drops, choreographed family battles, and after-party glamour.'}"
          </p>
          <div style="display: flex; justify-content: center; gap: 14px;">
            <a href="#section-rsvp" class="btn-gold" style="background: #FF007F; border-color: #D8006C; color: #FFF;">Get Guestlist Access</a>
            <a href="#section-reveal" class="btn-outline" style="border-color: #8A2BE2; color: #E1BEE7;">Setlist Times</a>
          </div>
        </section>
      `;
    },
    renderFunctions(functions, event) {
      const cards = functions.map((f, i) => `
        <div class="festival-stage-card">
          <div style="display: flex; justify-content: space-between; color: #FF007F; font-size: 0.85rem; font-weight: 700;">
            <span>STAGE 0${i + 1}</span>
            <span>128 BPM</span>
          </div>
          <h3 style="color: #FFF; font-size: 1.5rem; margin: 8px 0;">${f.title}</h3>
          <div style="color: #BA68C8; font-size: 0.9rem; margin-bottom: 10px;"><i class="fa-regular fa-clock"></i> ${f.date_time}</div>
          <p style="color: #B39DDB; font-size: 0.9rem;">${f.description || ''}</p>
        </div>
      `).join('');
      return `
        <section class="event-section-wrap" style="background: #0E091B;">
          <div class="section-header">
            <span class="section-subtitle" style="color: #FF007F;">Live Soundstage</span>
            <h2 class="section-title" style="color: #FFF;">Festival Lineup & DJ Setlist</h2>
          </div>
          <div class="festival-lineup-grid">${cards}</div>
        </section>
      `;
    },
    renderSignatureSection(event) {
      return `
        <section class="event-section-wrap" style="background: #150E28; text-align: center;">
          <div class="section-header">
            <span class="section-subtitle" style="color: #8A2BE2;">Headliner Showcase</span>
            <h2 class="section-title" style="color: #FFF;">Midnight Afterglow Dance Battle</h2>
          </div>
          <p style="color: #D1C4E9; max-width: 600px; margin: 0 auto 20px;">Team Bride vs Team Groom epic dance-off soundtracking top Bollywood remixes till 2 AM.</p>
          <div style="display: inline-flex; align-items: center; gap: 12px; background: #261642; border: 1px solid #8A2BE2; border-radius: 999px; padding: 10px 24px;">
            <i class="fa-solid fa-headphones" style="color: #FF007F;"></i>
            <span style="color: #FFF; font-weight: 600;">After-Hours Club Lounge & Sliders Bar Open</span>
          </div>
        </section>
      `;
    }
  },

  // 5. PALACE ROMANCE (Lakeside Fort & Rajputana Courtyard)
  palace_romance: {
    id: 'palace_romance',
    name: 'Palace Romance',
    archetype: 'Lakeside Fort & Rajputana Courtyard',
    renderHero(content, event) {
      return `
        <section class="lakeside-panoramic-hero">
          <div style="max-width: 1100px; margin: 0 auto; text-align: center;">
            <div class="badge-status badge-public" style="margin-bottom: 12px;"><i class="fa-solid fa-water"></i> Lake Palace Nuptials</div>
            <h1 style="font-family: var(--font-display); font-size: 3.6rem; color: #4A154B;">${event.primary_names}</h1>
            <p style="font-style: italic; color: #614D59; max-width: 650px; margin: 10px auto 24px;">"${event.headline || 'Where tranquil waters mirror ancient marble forts and royal promises.'}"</p>
            <div style="max-width: 800px; margin: 0 auto 24px; border-radius: 20px; overflow: hidden; border: 5px solid #FFF; box-shadow: 0 16px 36px rgba(74,21,75,0.18);">
              <img src="${event.hero_image_url || '/assets/templates/palace-romance/hero.webp'}" alt="${event.primary_names}" style="width: 100%; display: block;">
            </div>
            <div style="display: flex; justify-content: center; gap: 12px;">
              <a href="#section-rsvp" class="btn-gold">Royal RSVP</a>
              <a href="#section-reveal" class="btn-outline">Fort Itinerary</a>
            </div>
          </div>
        </section>
      `;
    },
    renderFunctions(functions, event) {
      const cards = functions.map((f, i) => `
        <div style="background: #FFF; border: 1px solid #E8D0D8; border-radius: 12px; padding: 24px; margin-bottom: 16px;">
          <span style="font-size: 0.8rem; font-weight: 700; color: #C48B9F; text-transform: uppercase;">Courtyard Gathering 0${i + 1}</span>
          <h3 style="font-size: 1.6rem; color: #4A154B; margin: 6px 0;">${f.title}</h3>
          <div style="color: #8C6A7B; font-size: 0.9rem; margin-bottom: 8px;"><i class="fa-solid fa-ship"></i> ${f.venue_name || event.venue_name} &bull; ${f.date_time}</div>
          <p style="font-size: 0.9rem; color: #5D4D55; margin: 0;">${f.description || ''}</p>
        </div>
      `).join('');
      return `
        <section class="event-section-wrap" style="background: #FAF2F4;">
          <div class="section-header">
            <span class="section-subtitle">Rajputana Heritage</span>
            <h2 class="section-title">Lakeside Ceremonies</h2>
          </div>
          <div style="max-width: 860px; margin: 0 auto;">${cards}</div>
        </section>
      `;
    },
    renderSignatureSection(event) {
      return `
        <section class="event-section-wrap" style="background: #FFF;">
          <div class="section-header">
            <span class="section-subtitle">Dynasty & Heritage</span>
            <h2 class="section-title">Two-Family Heritage Heraldry</h2>
          </div>
          <div class="two-family-heraldry-wrap">
            <div class="heritage-crest-box">
              <i class="fa-solid fa-shield-halved" style="font-size: 2.2rem; color: #D4AF37;"></i>
              <h4 style="margin: 10px 0 4px; color: #4A154B;">House of Groom</h4>
              <p style="font-size: 0.88rem; color: #7B6858;">Lineage of Royal Valor & Tradition</p>
            </div>
            <div style="font-size: 1.8rem; color: #D4AF37;">&amp;</div>
            <div class="heritage-crest-box">
              <i class="fa-solid fa-crown" style="font-size: 2.2rem; color: #D4AF37;"></i>
              <h4 style="margin: 10px 0 4px; color: #4A154B;">House of Bride</h4>
              <p style="font-size: 0.88rem; color: #7B6858;">Lineage of Grace & Scholarly Heritage</p>
            </div>
          </div>
        </section>
      `;
    }
  },

  // 6. SOUTH HERITAGE (Traditional Temple Dravidian Heritage)
  south_heritage: {
    id: 'south_heritage',
    name: 'South Heritage',
    archetype: 'Traditional Temple Dravidian Heritage',
    renderHero(content, event) {
      return `
        <section class="temple-gopuram-hero">
          <div class="gopuram-pinnacle-bar">🛕 🔔 🛕 🔔 🛕</div>
          <div style="max-width: 1040px; margin: 0 auto; text-align: center;">
            <span style="font-weight: 700; color: #BF360C; text-transform: uppercase; letter-spacing: 2px;">Mangala Vadhyam &bull; Vedic Muhurtham</span>
            <h1 style="font-family: var(--font-display); font-size: 3.6rem; color: #B71C1C; margin: 12px 0;">${event.primary_names}</h1>
            <p style="color: #5D4037; font-size: 1.1rem; max-width: 650px; margin: 0 auto 24px;">"${event.headline || 'Sacred Kanjeevaram silks, fragrant jasmine gajras, and Nadaswaram notes.'}"</p>
            <div style="max-width: 760px; margin: 0 auto 24px; border-radius: 16px; overflow: hidden; border: 5px solid #FF8F00;">
              <img src="${event.hero_image_url || '/assets/templates/south-heritage/hero.webp'}" alt="${event.primary_names}" style="width: 100%; display: block;">
            </div>
            <div style="display: flex; justify-content: center; gap: 12px;">
              <a href="#section-rsvp" class="btn-gold" style="background: #D84315; border-color: #BF360C; color: #FFF;">Kalyana RSVP</a>
              <a href="#section-reveal" class="btn-outline" style="border-color: #D84315; color: #BF360C;">Muhurtham Timings</a>
            </div>
          </div>
        </section>
      `;
    },
    renderFunctions(functions, event) {
      const cards = functions.map((f, i) => `
        <div style="background: #FFF; border-left: 5px solid #E65100; border-radius: 8px; padding: 20px; box-shadow: 0 4px 12px rgba(0,0,0,0.05);">
          <span style="font-weight: 700; color: #E65100; font-size: 0.8rem; text-transform: uppercase;">Kalyana Vidhi 0${i + 1}</span>
          <h3 style="color: #B71C1C; margin: 6px 0;">${f.title}</h3>
          <div style="color: #D84315; font-size: 0.9rem;"><i class="fa-regular fa-clock"></i> ${f.date_time}</div>
          <p style="font-size: 0.9rem; color: #5D4037; margin-top: 6px;">${f.description || ''}</p>
        </div>
      `).join('');
      return `
        <section class="event-section-wrap" style="background: #FFF8E1;">
          <div class="section-header">
            <span class="section-subtitle" style="color: #E65100;">Vedic Chronology</span>
            <h2 class="section-title" style="color: #B71C1C;">Muhurtham &amp; Kalyana Itinerary</h2>
          </div>
          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 20px; max-width: 1040px; margin: 0 auto;">${cards}</div>
        </section>
      `;
    },
    renderSignatureSection(event) {
      return `
        <section class="elai-sappadu-wrap">
          <div class="section-header" style="text-align: center;">
            <span class="section-subtitle" style="color: #FFD54F;">Traditional Feast</span>
            <h2 class="section-title" style="color: #FFF;">Banana Leaf Feast (Elai Sappadu)</h2>
            <p style="color: #E8F5E9; max-width: 600px; margin: 8px auto 0;">Served traditionally on fresh plantain leaves in true South Indian wedding hospitality.</p>
          </div>
          <div class="banana-leaf-grid">
            <div class="leaf-dish-pill">Pappadam &amp; Payasam</div>
            <div class="leaf-dish-pill">Avial &amp; Poriyal</div>
            <div class="leaf-dish-pill">Medu Vada &amp; Sambar</div>
            <div class="leaf-dish-pill">Rasam &amp; Curd Rice</div>
          </div>
        </section>
      `;
    }
  },

  // 7. BLUSH VOWS (Modern Editorial Romance & Pastel Minimalism)
  blush_vows: {
    id: 'blush_vows',
    name: 'Blush Vows',
    archetype: 'Modern Editorial Romance & Pastel Minimalism',
    renderHero(content, event) {
      return `
        <section class="vogue-editorial-hero">
          <div class="magazine-masthead">RIWAAYAT VOWS &bull; ISSUE N° 26</div>
          <div style="max-width: 1000px; margin: 0 auto; display: grid; grid-template-columns: 1fr 1fr; gap: 36px; align-items: center;">
            <div>
              <span style="text-transform: uppercase; font-size: 0.75rem; letter-spacing: 2px; font-weight: 700; color: #880E4F;">Exclusive Wedding Feature</span>
              <h1 style="font-family: var(--font-display); font-size: 3.4rem; color: #4A154B; margin: 12px 0;">${event.primary_names}</h1>
              <p style="font-size: 1.05rem; color: #554840; line-height: 1.6; margin-bottom: 24px;">"${event.headline || 'Minimalist elegance, soft blush silks, and heartfelt vows spoken under open skies.'}"</p>
              <div style="display: flex; gap: 12px;">
                <a href="#section-rsvp" class="btn-gold" style="background: #4A154B; border-color: #4A154B; color: #FFF;">RSVP to the Feature</a>
                <a href="#section-reveal" class="btn-outline">Itinerary Details</a>
              </div>
            </div>
            <div style="border-radius: 12px; overflow: hidden; box-shadow: 0 12px 28px rgba(0,0,0,0.1);">
              <img src="${event.hero_image_url || '/assets/templates/blush-vows/hero.webp'}" alt="${event.primary_names}" style="width: 100%; display: block;">
            </div>
          </div>
        </section>
      `;
    },
    renderFunctions(functions, event) {
      const rows = functions.map(f => `
        <div class="swiss-row">
          <div style="font-weight: 700; color: #4A154B;">${f.date_time}</div>
          <div>
            <div style="font-size: 1.2rem; font-weight: 600; color: #212121;">${f.title}</div>
            <div style="font-size: 0.9rem; color: #757575;">${f.venue_name || event.venue_name}</div>
          </div>
          <div style="text-align: right; font-size: 0.85rem; color: #880E4F;">${f.dress_code || 'Pastel Formal'}</div>
        </div>
      `).join('');
      return `
        <section class="event-section-wrap" style="background: #FFF;">
          <div class="section-header">
            <span class="section-subtitle">The Schedule</span>
            <h2 class="section-title">Editorial Timeline</h2>
          </div>
          <div class="swiss-grid-itinerary">${rows}</div>
        </section>
      `;
    },
    renderSignatureSection(event) {
      return `
        <section class="event-section-wrap" style="background: #FCE4EC; text-align: center;">
          <blockquote style="font-family: var(--font-display); font-size: 1.5rem; color: #4A154B; max-width: 720px; margin: 0 auto; font-style: italic;">
            "We wanted a celebration that felt like us—uncluttered, deeply personal, and surrounded only by genuine love."
          </blockquote>
          <div style="margin-top: 14px; font-weight: 600; color: #880E4F;">— ${event.primary_names} in Editorial Interview</div>
        </section>
      `;
    }
  },

  // 8. MINIMAL IVORY (Contemporary Architectural Serenity)
  minimal_ivory: {
    id: 'minimal_ivory',
    name: 'Minimal Ivory',
    archetype: 'Contemporary Architectural Serenity',
    renderHero(content, event) {
      return `
        <section class="architectural-minimal-hero">
          <div class="hairline-grid-box">
            <div style="display: flex; justify-content: space-between; border-bottom: 1px solid #212121; padding-bottom: 12px; font-size: 0.85rem; letter-spacing: 2px;">
              <span>INVITATION // SPEC N° 01</span>
              <span>${event.event_date || 'AUTUMN 2026'}</span>
            </div>
            <h1 style="font-family: var(--font-display); font-size: 4rem; color: #212121; margin: 30px 0 10px;">${event.primary_names}</h1>
            <p style="font-size: 1.1rem; color: #616161; max-width: 600px; margin-bottom: 30px;">${event.headline || 'A contemporary architectural union centered on pure form and timeless devotion.'}</p>
            <div style="display: flex; gap: 14px;">
              <a href="#section-rsvp" class="btn-gold" style="background: #212121; border-color: #212121; color: #FFF; border-radius: 0;">RSVP GUEST</a>
              <a href="#section-reveal" class="btn-outline" style="border-color: #212121; color: #212121; border-radius: 0;">VIEW SCHEDULE</a>
            </div>
          </div>
        </section>
      `;
    },
    renderFunctions(functions, event) {
      const steps = functions.map((f, i) => `
        <div class="agenda-step-row">
          <div class="agenda-step-num">0${i + 1}</div>
          <div>
            <h3 style="margin: 0 0 4px; font-size: 1.3rem; color: #212121;">${f.title}</h3>
            <div style="font-size: 0.85rem; color: #757575;">${f.date_time} &bull; ${f.venue_name || event.venue_name}</div>
            <p style="margin: 8px 0 0; font-size: 0.9rem; color: #424242;">${f.description || ''}</p>
          </div>
        </div>
      `).join('');
      return `
        <section class="event-section-wrap" style="background: #FFF;">
          <div class="section-header">
            <span class="section-subtitle" style="color: #212121;">Sequence</span>
            <h2 class="section-title">Numbered Architectural Agenda</h2>
          </div>
          <div class="minimal-stepper-agenda">${steps}</div>
        </section>
      `;
    },
    renderSignatureSection(event) {
      return `
        <section class="event-section-wrap" style="background: #F5F5F5; text-align: center;">
          <div style="max-width: 600px; margin: 0 auto; border: 1px solid #BDBDBD; padding: 32px; background: #FFF;">
            <h4 style="margin: 0 0 8px; font-size: 1.1rem; letter-spacing: 2px;">HIS &amp; HER VOWS</h4>
            <p style="font-size: 0.9rem; color: #616161;">Simple words, unshakeable commitments, shared silently under architectural beams.</p>
          </div>
        </section>
      `;
    }
  },

  // 9. NOOR NIKAH (Sacred Ivory & Arabesque Grace)
  noor_nikah: {
    id: 'noor_nikah',
    name: 'Noor Nikah',
    archetype: 'Sacred Ivory & Arabesque Grace',
    renderHero(content, event) {
      return `
        <section class="arabesque-arch-hero">
          <div style="max-width: 1040px; margin: 0 auto; text-align: center;">
            <div class="arabic-bismillah" style="font-size: 2.4rem; color: #004D40; margin-bottom: 14px;">بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ</div>
            <div class="badge-status" style="background: #004D40; color: #FFF; margin-bottom: 12px;"><i class="fa-solid fa-moon"></i> Sacred Nikah Ceremony</div>
            <h1 style="font-family: var(--font-display); font-size: 3.6rem; color: #004D40;">${event.primary_names}</h1>
            <p style="font-style: italic; color: #2E5C50; max-width: 650px; margin: 8px auto 24px;">"${event.headline || 'And We created you in pairs — Quran 78:8'}"</p>
            <div style="max-width: 720px; margin: 0 auto 24px; border-radius: 30px; overflow: hidden; border: 4px solid #004D40;">
              <img src="${event.hero_image_url || '/assets/templates/noor-nikah/hero.webp'}" alt="${event.primary_names}" style="width: 100%; display: block;">
            </div>
            <div style="display: flex; justify-content: center; gap: 12px;">
              <a href="#section-rsvp" class="btn-gold" style="background: #004D40; border-color: #004D40; color: #FFF;">Send Dua &amp; RSVP</a>
              <a href="#section-reveal" class="btn-outline" style="border-color: #004D40; color: #004D40;">Nikah Program</a>
            </div>
          </div>
        </section>
      `;
    },
    renderFunctions(functions, event) {
      const cards = functions.map((f, i) => `
        <div class="dome-header-card">
          <span style="font-size: 0.8rem; font-weight: 700; color: #004D40; text-transform: uppercase;">Barakah Step 0${i + 1}</span>
          <h3 style="color: #004D40; margin: 8px 0;">${f.title}</h3>
          <div style="color: #00796B; font-size: 0.9rem; margin-bottom: 8px;"><i class="fa-regular fa-clock"></i> ${f.date_time}</div>
          <p style="font-size: 0.9rem; color: #37474F;">${f.description || ''}</p>
        </div>
      `).join('');
      return `
        <section class="event-section-wrap" style="background: #E8F5E9;">
          <div class="section-header">
            <span class="section-subtitle" style="color: #004D40;">Sacred Order</span>
            <h2 class="section-title" style="color: #004D40;">Nikah &amp; Walima Program</h2>
          </div>
          <div class="islamic-dome-grid">${cards}</div>
        </section>
      `;
    },
    renderSignatureSection(event) {
      return `
        <section class="surah-ar-rum-section">
          <h4 style="color: #004D40; margin: 0 0 8px; font-size: 1.2rem;">Surah Ar-Rum (30:21)</h4>
          <p style="font-size: 1.05rem; font-style: italic; color: #1B5E20; max-width: 700px; margin: 0 auto;">
            "And of His signs is that He created for you from yourselves mates that you may find tranquility in them; and He placed between you affection and mercy."
          </p>
        </section>
      `;
    }
  },

  // 10. EMERALD QASR (Moroccan Lanterns & Emerald Velvet)
  emerald_qasr: {
    id: 'emerald_qasr',
    name: 'Emerald Qasr',
    archetype: 'Moroccan Lanterns & Emerald Velvet',
    renderHero(content, event) {
      return `
        <section class="emerald-qasr-hero">
          <div class="hanging-lantern-wrap">
            <i class="fa-solid fa-lightbulb"></i>
            <i class="fa-solid fa-lightbulb"></i>
            <i class="fa-solid fa-lightbulb"></i>
          </div>
          <div style="max-width: 900px; margin: 0 auto;">
            <h1 style="font-family: var(--font-display); font-size: 3.6rem; color: #FFD700; margin-bottom: 8px;">${event.primary_names}</h1>
            <p style="color: #A7D7C5; font-size: 1.1rem; margin-bottom: 24px;">"${event.headline || 'Opulent emerald velvet, glowing brass lanterns, and soulful Sufi harmonies.'}"</p>
            <div style="display: flex; justify-content: center; gap: 14px;">
              <a href="#section-rsvp" class="btn-gold" style="background: #D4AF37; color: #022B24;">Confirm Presence</a>
              <a href="#section-reveal" class="btn-outline" style="border-color: #D4AF37; color: #FFD700;">Qasr Banquet</a>
            </div>
          </div>
        </section>
      `;
    },
    renderFunctions(functions, event) {
      const cards = functions.map(f => `
        <div class="majlis-floor-card">
          <h3 style="color: #FFD700; margin: 0 0 6px;">${f.title}</h3>
          <div style="color: #80CBC4; font-size: 0.9rem;"><i class="fa-regular fa-clock"></i> ${f.date_time}</div>
          <p style="color: #E0F2F1; font-size: 0.9rem; margin-top: 8px;">${f.description || ''}</p>
        </div>
      `).join('');
      return `
        <section class="event-section-wrap" style="background: #011E18;">
          <div class="section-header">
            <span class="section-subtitle" style="color: #D4AF37;">Majlis Gathering</span>
            <h2 class="section-title" style="color: #FFD700;">Qawwali &amp; Royal Banquet Timeline</h2>
          </div>
          <div class="majlis-lounge-timeline">${cards}</div>
        </section>
      `;
    },
    renderSignatureSection(event) {
      return `
        <section class="event-section-wrap" style="background: #022620; text-align: center;">
          <h3 style="color: #FFD700; font-family: var(--font-display);">Moroccan Mint Tea &amp; Baklava Service</h3>
          <p style="color: #A7D7C5; max-width: 600px; margin: 8px auto 0;">Poured from heirloom brass samovars throughout the festive night.</p>
        </section>
      `;
    }
  },

  // 11. IVORY DUA (Modest Elegance & Floral Quranic Blessing)
  ivory_dua: {
    id: 'ivory_dua',
    name: 'Ivory Dua',
    archetype: 'Modest Elegance & Floral Quranic Blessing',
    renderHero(content, event) {
      return `
        <section class="ivory-dua-hero">
          <div class="olive-wreath-frame">
            <div style="font-size: 1.8rem; color: #5D4037; margin-bottom: 8px;">🌿 🕊️ 🌿</div>
            <h1 style="font-family: var(--font-display); font-size: 3.4rem; color: #3E2723;">${event.primary_names}</h1>
            <p style="font-style: italic; color: #6D4C41; max-width: 600px; margin: 10px auto 20px;">"${event.headline || 'Modest grace, pure intentions, and sincere prayers for an auspicious beginning.'}"</p>
            <div style="display: flex; justify-content: center; gap: 12px;">
              <a href="#section-rsvp" class="btn-gold" style="background: #8D6E63; border-color: #8D6E63; color: #FFF;">Offer Dua &amp; Attend</a>
            </div>
          </div>
        </section>
      `;
    },
    renderFunctions(functions, event) {
      const cards = functions.map(f => `
        <div class="prayer-time-card">
          <div style="font-weight: 700; color: #5D4037;">${f.date_time}</div>
          <div>
            <h4 style="margin: 0 0 4px; color: #3E2723;">${f.title}</h4>
            <p style="margin: 0; font-size: 0.9rem; color: #795548;">${f.description || ''}</p>
          </div>
        </div>
      `).join('');
      return `
        <section class="event-section-wrap" style="background: #F5EBE6;">
          <div class="section-header">
            <span class="section-subtitle">Prayer Alignments</span>
            <h2 class="section-title">Spiritual Ceremony Hours</h2>
          </div>
          <div class="spiritual-prayer-timeline">${cards}</div>
        </section>
      `;
    },
    renderSignatureSection(event) {
      return `
        <section class="event-section-wrap" style="background: #FFF; text-align: center;">
          <div style="max-width: 650px; margin: 0 auto; border: 1px dashed #BCAAA4; padding: 24px; border-radius: 12px;">
            <h4 style="margin: 0 0 6px; color: #4E342E;">Family Supplications</h4>
            <p style="font-size: 0.9rem; color: #6D4C41;">May Allah bless this union with tranquility, righteous lineage, and everlasting joy.</p>
          </div>
        </section>
      `;
    }
  },

  // 12. ZAFRAAN EVENING (Amber Saffron & Mughal Courtyard)
  zafraan_evening: {
    id: 'zafraan_evening',
    name: 'Zafraan Evening',
    archetype: 'Amber Saffron & Mughal Courtyard',
    renderHero(content, event) {
      return `
        <section class="mughal-jharokha-hero">
          <div class="jharokha-arch-box">
            <span style="color: #E65100; font-weight: 700; letter-spacing: 2px; text-transform: uppercase;">Mughal Saffron Courtyard</span>
            <h1 style="font-family: var(--font-display); font-size: 3.6rem; color: #BF360C; margin: 10px 0;">${event.primary_names}</h1>
            <p style="color: #5D4037; font-size: 1.05rem; margin-bottom: 24px;">"${event.headline || 'Warm amber sunsets, traditional dholak rhythms, and royal Mughal hospitality.'}"</p>
            <div style="display: flex; gap: 12px;">
              <a href="#section-rsvp" class="btn-gold" style="background: #E65100; border-color: #BF360C; color: #FFF;">Courtyard RSVP</a>
              <a href="#section-reveal" class="btn-outline" style="border-color: #E65100; color: #BF360C;">Dholki Night</a>
            </div>
          </div>
        </section>
      `;
    },
    renderFunctions(functions, event) {
      const cards = functions.map(f => `
        <div style="background: #FFF; border: 2px solid #FFB74D; border-radius: 12px; padding: 20px;">
          <h3 style="color: #E65100; margin: 0 0 6px;">${f.title}</h3>
          <div style="color: #BF360C; font-size: 0.9rem;"><i class="fa-regular fa-clock"></i> ${f.date_time}</div>
          <p style="color: #5D4037; font-size: 0.9rem; margin-top: 6px;">${f.description || ''}</p>
        </div>
      `).join('');
      return `
        <section class="event-section-wrap" style="background: #FFF3E0;">
          <div class="section-header">
            <span class="section-subtitle" style="color: #E65100;">Folk Celebrations</span>
            <h2 class="section-title" style="color: #BF360C;">Dholki, Mayun &amp; Sangeet Itinerary</h2>
          </div>
          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 20px; max-width: 1040px; margin: 0 auto;">${cards}</div>
        </section>
      `;
    },
    renderSignatureSection(event) {
      return `
        <section class="folk-songbook-wrap">
          <h3 style="text-align: center; color: #BF360C; font-family: var(--font-display);">Traditional Tappay &amp; Dholki Songbook</h3>
          <p style="text-align: center; color: #6D4C41; font-size: 0.9rem;">Join the bride's and groom's family in singing classic folk songs under the amber lamps.</p>
        </section>
      `;
    }
  },

  // 13. RESHAM ROYALE (Regal Jamawar & Deep Crimson Silk)
  resham_royale: {
    id: 'resham_royale',
    name: 'Resham Royale',
    archetype: 'Regal Jamawar & Deep Crimson Silk',
    renderHero(content, event) {
      return `
        <section class="resham-royale-hero">
          <div style="max-width: 960px; margin: 0 auto;">
            <span style="color: #FFD700; letter-spacing: 3px; text-transform: uppercase;">Regal Jamawar Heritage</span>
            <h1 style="font-family: var(--font-display); font-size: 3.8rem; color: #FFD700; margin: 12px 0;">${event.primary_names}</h1>
            <p style="color: #F8BBD0; font-size: 1.1rem; margin-bottom: 24px;">"${event.headline || 'Deep crimson silks, gold zari brocades, and imperial Shehnai fanfares.'}"</p>
            <div style="display: flex; justify-content: center; gap: 14px;">
              <a href="#section-rsvp" class="btn-gold" style="background: #D4AF37; color: #3B0910;">Imperial RSVP</a>
              <a href="#section-reveal" class="btn-outline" style="border-color: #D4AF37; color: #FFD700;">Procession Schedule</a>
            </div>
          </div>
        </section>
      `;
    },
    renderFunctions(functions, event) {
      const cards = functions.map(f => `
        <div class="procession-stage-card">
          <h3 style="color: #FFD700; margin: 0 0 6px;">${f.title}</h3>
          <div style="color: #F48FB1; font-size: 0.9rem;"><i class="fa-solid fa-horse"></i> ${f.date_time}</div>
          <p style="color: #FCE4EC; font-size: 0.9rem; margin-top: 6px;">${f.description || ''}</p>
        </div>
      `).join('');
      return `
        <section class="event-section-wrap" style="background: #27040A;">
          <div class="section-header">
            <span class="section-subtitle" style="color: #FFD700;">Royal Entrance</span>
            <h2 class="section-title" style="color: #FFD700;">Imperial Baraat &amp; Nikah Procession</h2>
          </div>
          <div class="imperial-baraat-timeline">${cards}</div>
        </section>
      `;
    },
    renderSignatureSection(event) {
      return `
        <section class="event-section-wrap" style="background: #3B0910; text-align: center;">
          <h3 style="color: #FFD700; font-family: var(--font-display);">Jamawar Silk &amp; Family Heirloom Tribute</h3>
          <p style="color: #F8BBD0; max-width: 600px; margin: 8px auto 0;">Celebrating generations of artisans and cherished antique family jewels.</p>
        </section>
      `;
    }
  },

  // 14. MIDNIGHT WALIMA (Black-Tie Sapphire & Modern Celestial)
  midnight_walima: {
    id: 'midnight_walima',
    name: 'Midnight Walima',
    archetype: 'Black-Tie Sapphire & Modern Celestial',
    renderHero(content, event) {
      return `
        <section class="midnight-walima-hero">
          <div style="max-width: 900px; margin: 0 auto;">
            <span style="color: #64B5F6; letter-spacing: 3px;">BLACK-TIE RECEPTION GALA</span>
            <h1 style="font-family: var(--font-display); font-size: 3.8rem; color: #FFF; margin: 12px 0;">${event.primary_names}</h1>
            <p style="color: #90CAF9; max-width: 650px; margin: 0 auto 24px;">"${event.headline || 'Midnight sapphire tones, candlelight toasting, and modern black-tie sophistication.'}"</p>
            <div style="display: flex; justify-content: center; gap: 12px;">
              <a href="#section-rsvp" class="btn-gold" style="background: #1976D2; border-color: #1565C0; color: #FFF;">Confirm Black-Tie Seat</a>
              <a href="#section-reveal" class="btn-outline" style="border-color: #64B5F6; color: #BBDEFB;">Gala Itinerary</a>
            </div>
          </div>
        </section>
      `;
    },
    renderFunctions(functions, event) {
      const cards = functions.map(f => `
        <div class="course-timing-card">
          <h3 style="color: #90CAF9; margin: 0 0 6px;">${f.title}</h3>
          <div style="color: #64B5F6; font-size: 0.9rem;"><i class="fa-solid fa-champagne-glasses"></i> ${f.date_time}</div>
          <p style="color: #E3F2FD; font-size: 0.9rem; margin-top: 6px;">${f.description || ''}</p>
        </div>
      `).join('');
      return `
        <section class="event-section-wrap" style="background: #040913;">
          <div class="section-header">
            <span class="section-subtitle" style="color: #64B5F6;">Banquet Order</span>
            <h2 class="section-title" style="color: #FFF;">Black-Tie Dinner Courses</h2>
          </div>
          <div class="blacktie-banquet-schedule">${cards}</div>
        </section>
      `;
    },
    renderSignatureSection(event) {
      return `
        <section class="event-section-wrap" style="background: #0A162B; text-align: center;">
          <h3 style="color: #90CAF9; font-family: var(--font-display);">Dress Code: Black-Tie &amp; Sapphire Evening Wear</h3>
          <p style="color: #BBDEFB; max-width: 600px; margin: 8px auto 0;">Formal tuxedos and floor-length evening gowns requested in midnight blue, black, or gold.</p>
        </section>
      `;
    }
  },

  // 15. PASTEL PARTY (Sweet 16 & Golden Birthday Chic)
  pastel_party: {
    id: 'pastel_party',
    name: 'Pastel Party',
    archetype: 'Sweet 16 & Golden Birthday Chic',
    renderHero(content, event) {
      return `
        <section class="pastel-party-hero">
          <div class="floating-balloons-header">🎈 🍬 🎈 🎂 🎈 🍭 🎈</div>
          <div style="max-width: 900px; margin: 0 auto; text-align: center;">
            <span style="background: #FFF; color: #E91E63; padding: 6px 18px; border-radius: 999px; font-weight: 700; font-size: 0.85rem;">MILESTONE CELEBRATION</span>
            <h1 style="font-family: var(--font-display); font-size: 3.6rem; color: #880E4F; margin: 12px 0;">${event.primary_names}</h1>
            <p style="color: #4A154B; font-size: 1.1rem; max-width: 650px; margin: 0 auto 24px;">"${event.headline || 'Pastel balloons, artisanal macaron towers, polaroid photo booths, and red carpet glamour.'}"</p>
            <div style="display: flex; justify-content: center; gap: 12px;">
              <a href="#section-rsvp" class="btn-gold" style="background: #E91E63; border-color: #C2185B; color: #FFF;">VIP RSVP</a>
              <a href="#section-reveal" class="btn-outline" style="border-color: #E91E63; color: #880E4F;">Party Schedule</a>
            </div>
          </div>
        </section>
      `;
    },
    renderFunctions(functions, event) {
      const cards = functions.map(f => `
        <div class="vip-party-card">
          <h3 style="color: #C2185B; margin: 0 0 6px;">${f.title}</h3>
          <div style="color: #E91E63; font-size: 0.9rem;"><i class="fa-solid fa-sparkles"></i> ${f.date_time}</div>
          <p style="color: #4A154B; font-size: 0.9rem; margin-top: 6px;">${f.description || ''}</p>
        </div>
      `).join('');
      return `
        <section class="event-section-wrap" style="background: #FFF0F5;">
          <div class="section-header">
            <span class="section-subtitle" style="color: #E91E63;">VIP Run of Show</span>
            <h2 class="section-title" style="color: #880E4F;">Party Highlights &amp; DJ Madness</h2>
          </div>
          <div class="sweet16-party-timeline">${cards}</div>
        </section>
      `;
    },
    renderSignatureSection(event) {
      return `
        <section class="event-section-wrap" style="background: #FFF; text-align: center;">
          <h3 style="color: #880E4F; font-family: var(--font-display);">3-Tier Artisanal Macaron &amp; Dessert Tower</h3>
          <p style="color: #C2185B; max-width: 600px; margin: 8px auto 0;">Handcrafted strawberry lavender macarons, glitter mocktail bar, and sweet treats.</p>
        </section>
      `;
    }
  },

  // 16. LITTLE STAR (Whimsical 1st Birthday & Celestial Keepsake)
  little_star: {
    id: 'little_star',
    name: 'Little Star',
    archetype: 'Whimsical 1st Birthday & Celestial Keepsake',
    renderHero(content, event) {
      return `
        <section class="little-star-hero">
          <div style="max-width: 900px; margin: 0 auto; text-align: center;">
            <span style="background: #FFA000; color: #FFF; padding: 6px 16px; border-radius: 999px; font-weight: 700; font-size: 0.85rem;">⭐ ONE YEAR OLD! ⭐</span>
            <h1 style="font-family: var(--font-display); font-size: 3.6rem; color: #E65100; margin: 12px 0;">${event.primary_names}</h1>
            <p style="color: #5D4037; font-size: 1.1rem; max-width: 650px; margin: 0 auto 24px;">"${event.headline || 'Golden moon cradles, vanilla clouds, sensory soft play, and smash cake giggles.'}"</p>
            <div style="display: flex; justify-content: center; gap: 12px;">
              <a href="#section-rsvp" class="btn-gold" style="background: #FFA000; border-color: #FF8F00; color: #FFF;">Join the Party</a>
              <a href="#section-reveal" class="btn-outline" style="border-color: #FFA000; color: #E65100;">Play Schedule</a>
            </div>
          </div>
        </section>
      `;
    },
    renderFunctions(functions, event) {
      const cards = functions.map(f => `
        <div style="background: #FFF; border: 2px solid #FFE082; border-radius: 16px; padding: 20px; box-shadow: 0 4px 12px rgba(255,160,0,0.1);">
          <h3 style="color: #E65100; margin: 0 0 6px;">${f.title}</h3>
          <div style="color: #FFA000; font-size: 0.9rem;"><i class="fa-solid fa-child"></i> ${f.date_time}</div>
          <p style="color: #5D4037; font-size: 0.9rem; margin-top: 6px;">${f.description || ''}</p>
        </div>
      `).join('');
      return `
        <section class="event-section-wrap" style="background: #FFFDE7;">
          <div class="section-header">
            <span class="section-subtitle" style="color: #FFA000;">Little Adventurer</span>
            <h2 class="section-title" style="color: #E65100;">Smash Cake &amp; Sensory Play Timetable</h2>
          </div>
          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); gap: 20px; max-width: 1040px; margin: 0 auto;">${cards}</div>
        </section>
      `;
    },
    renderSignatureSection(event) {
      const months = ['Month 1: First Smile', 'Month 3: Rolling Over', 'Month 6: First Giggle', 'Month 9: Standing Tall', 'Month 12: Big Steps!'];
      const cards = months.map(m => `<div class="month-milestone-card"><span style="font-weight: 700; color: #E65100; font-size: 0.9rem;">${m}</span></div>`).join('');
      return `
        <section class="event-section-wrap" style="background: #FFF;">
          <div class="section-header">
            <span class="section-subtitle" style="color: #FFA000;">Milestone Story</span>
            <h2 class="section-title" style="color: #E65100;">First Trip Around the Sun</h2>
          </div>
          <div class="twelve-months-grid">${cards}</div>
        </section>
      `;
    }
  },

  // 17. ELEGANT SOIRÉE (Silver 25th / Golden 50th Jubilee Gala)
  elegant_soiree: {
    id: 'elegant_soiree',
    name: 'Elegant Soirée',
    archetype: 'Silver 25th / Golden 50th Jubilee Gala',
    renderHero(content, event) {
      return `
        <section class="art-deco-soiree-hero">
          <div style="max-width: 900px; margin: 0 auto;">
            <span style="color: #F59E0B; letter-spacing: 3px; font-weight: 700;">GOLDEN JUBILEE CELEBRATION</span>
            <h1 style="font-family: var(--font-display); font-size: 3.8rem; color: #FEF3C7; margin: 12px 0;">${event.primary_names}</h1>
            <p style="color: #D6D3D1; font-size: 1.1rem; max-width: 650px; margin: 0 auto 24px;">"${event.headline || 'Refined champagne toasts, milestone retrospectives, and an intimate candlelit dinner.'}"</p>
            <div style="display: flex; justify-content: center; gap: 12px;">
              <a href="#section-rsvp" class="btn-gold" style="background: #D4AF37; color: #1C1917;">Confirm Dinner Attendance</a>
              <a href="#section-reveal" class="btn-outline" style="border-color: #D4AF37; color: #FEF3C7;">Toast Schedule</a>
            </div>
          </div>
        </section>
      `;
    },
    renderFunctions(functions, event) {
      const cards = functions.map(f => `
        <div class="retrospective-decade-card">
          <h3 style="color: #1C1917; margin: 0 0 6px;">${f.title}</h3>
          <div style="color: #B45309; font-size: 0.9rem;"><i class="fa-solid fa-wine-glass"></i> ${f.date_time}</div>
          <p style="color: #44403C; font-size: 0.9rem; margin-top: 6px;">${f.description || ''}</p>
        </div>
      `).join('');
      return `
        <section class="event-section-wrap" style="background: #FAFAF9;">
          <div class="section-header">
            <span class="section-subtitle" style="color: #B45309;">Evening Agenda</span>
            <h2 class="section-title" style="color: #1C1917;">Formal Jubilee Dinner &amp; Speeches</h2>
          </div>
          <div class="decade-retrospective-timeline">${cards}</div>
        </section>
      `;
    },
    renderSignatureSection(event) {
      return `
        <section class="event-section-wrap" style="background: #FFF; text-align: center;">
          <h3 style="font-family: var(--font-display); color: #1C1917;">Decade-by-Decade Milestone Retrospective</h3>
          <p style="color: #78716C; max-width: 600px; margin: 8px auto 0;">Honoring five decades of wisdom, enduring friendships, and remarkable achievements.</p>
        </section>
      `;
    }
  },

  // 18. NEON CELEBRATION (Cyberpunk Neon & Glow Dance Bash)
  neon_celebration: {
    id: 'neon_celebration',
    name: 'Neon Celebration',
    archetype: 'Cyberpunk Neon & Glow Dance Bash',
    renderHero(content, event) {
      return `
        <section class="cyberpunk-neon-hero">
          <div style="max-width: 900px; margin: 0 auto;">
            <span style="background: #FF007F; color: #FFF; padding: 4px 14px; border-radius: 4px; font-weight: 800; letter-spacing: 2px;">CYBER NIGHTLIFE</span>
            <h1 style="font-family: var(--font-display); font-size: 4rem; color: #00FFFF; text-shadow: 0 0 15px #00FFFF; margin: 14px 0;">${event.primary_names}</h1>
            <p style="color: #FFF; font-size: 1.1rem; max-width: 650px; margin: 0 auto 24px;">"${event.headline || 'UV lights, electric beats, laser projections, and arcade cocktail battles.'}"</p>
            <div style="display: flex; justify-content: center; gap: 12px;">
              <a href="#section-rsvp" class="btn-gold" style="background: #00FFFF; border-color: #00FFFF; color: #000; font-weight: 700;">Join the Rave</a>
              <a href="#section-reveal" class="btn-outline" style="border-color: #FF007F; color: #FF007F;">DJ Lineup</a>
            </div>
          </div>
        </section>
      `;
    },
    renderFunctions(functions, event) {
      const cards = functions.map(f => `
        <div class="neon-set-card">
          <h3 style="color: #00FFFF; margin: 0 0 6px;">${f.title}</h3>
          <div style="color: #FF007F; font-size: 0.9rem;"><i class="fa-solid fa-compact-disc"></i> ${f.date_time}</div>
          <p style="color: #E0E0E0; font-size: 0.9rem; margin-top: 6px;">${f.description || ''}</p>
        </div>
      `).join('');
      return `
        <section class="event-section-wrap" style="background: #020108;">
          <div class="section-header">
            <span class="section-subtitle" style="color: #FF007F;">Nightclub Schedule</span>
            <h2 class="section-title" style="color: #00FFFF;">DJ Timetable &amp; UV Rave Countdown</h2>
          </div>
          <div class="neon-stage-timetable">${cards}</div>
        </section>
      `;
    },
    renderSignatureSection(event) {
      return `
        <section class="event-section-wrap" style="background: #0B061A; text-align: center;">
          <h3 style="color: #00FFFF; font-family: var(--font-display);">Electric Neon Bar &amp; Glow Attire Guide</h3>
          <p style="color: #FF007F; max-width: 600px; margin: 8px auto 0;">Dress to glow under blacklight. Complimentary neon glowsticks and body-paint stations at the entrance.</p>
        </section>
      `;
    }
  }
};

// Export for Node environments and window for Browser
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    SLUG_TO_TEMPLATE_KEY,
    THEME_TO_TEMPLATE_KEY,
    resolveTemplateKey,
    TEMPLATE_RENDERERS
  };
}
if (typeof window !== 'undefined') {
  window.TemplateRenderers = {
    SLUG_TO_TEMPLATE_KEY,
    THEME_TO_TEMPLATE_KEY,
    resolveTemplateKey,
    TEMPLATE_RENDERERS
  };
}


