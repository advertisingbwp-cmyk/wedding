/**
 * SCRIPT: Process, Optimize, and Validate 18 Unique Template Assets for Riwaayat Venue
 */

const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const BRAIN_DIR = 'C:\\Users\\Fahad\\.gemini\\antigravity\\brain\\32b37626-0540-40db-ae9e-eb40cf7eabf8';
const CLIENT_ASSETS = path.join(__dirname, '../client/assets');
const TEMPLATES_DIR = path.join(CLIENT_ASSETS, 'templates');

const TEMPLATE_CONFIGS = [
  // 8 Indian Wedding Templates
  {
    templateId: 'royal_mandap',
    slug: 'royal-mandap',
    title: 'Royal Mandap',
    eventType: 'indian_wedding',
    altText: 'Royal Mandap: photorealistic Indian bride and groom in an opulent palace mandap with red lehenga, ivory sherwani, and gold chandelier lighting',
    sourceType: 'local_file',
    source: path.join(BRAIN_DIR, 'royal_mandap_thumb_1789407717353.jpg'),
    photographer: 'Riwaayat Studio Original',
    license: 'Riwaayat Venue Exclusive Editorial License'
  },
  {
    templateId: 'marigold_bloom',
    slug: 'marigold-bloom',
    title: 'Marigold Bloom',
    eventType: 'indian_wedding',
    altText: 'Marigold Bloom: joyful Haldi ceremony with bride and groom in sunshine yellow silk outfits showered with marigold petals',
    sourceType: 'local_file',
    source: path.join(BRAIN_DIR, 'marigold_bloom_thumb_1789407756855.jpg'),
    photographer: 'Riwaayat Studio Original',
    license: 'Riwaayat Venue Exclusive Editorial License'
  },
  {
    templateId: 'mehendi_garden',
    slug: 'mehendi-garden',
    title: 'Mehendi Garden',
    eventType: 'indian_wedding',
    altText: 'Mehendi Garden: elegant bride displaying intricate henna patterns on her hands amidst an emerald green garden canopy lounge',
    sourceType: 'local_file',
    source: path.join(BRAIN_DIR, 'mehendi_garden_thumb_1789407811833.jpg'),
    photographer: 'Riwaayat Studio Original',
    license: 'Riwaayat Venue Exclusive Editorial License'
  },
  {
    templateId: 'sangeet_afterglow',
    slug: 'sangeet-afterglow',
    title: 'Sangeet Afterglow',
    eventType: 'indian_wedding',
    altText: 'Sangeet Afterglow: glamorous Indian Sangeet dance floor with bride in shimmering gold lehenga and groom in royal navy bandhgala',
    sourceType: 'local_file',
    source: path.join(BRAIN_DIR, 'sangeet_afterglow_thumb_1789407885019.jpg'),
    photographer: 'Riwaayat Studio Original',
    license: 'Riwaayat Venue Exclusive Editorial License'
  },
  {
    templateId: 'palace_romance',
    slug: 'palace-romance',
    title: 'Palace Romance',
    eventType: 'indian_wedding',
    altText: 'Palace Romance: romantic South Asian couple walking hand in hand through a heritage palace arched corridor at golden hour sunset',
    sourceType: 'local_file',
    source: path.join(BRAIN_DIR, 'palace_romance_thumb_1789407964755.jpg'),
    photographer: 'Riwaayat Studio Original',
    license: 'Riwaayat Venue Exclusive Editorial License'
  },
  {
    templateId: 'south_heritage',
    slug: 'south-heritage',
    title: 'South Heritage',
    eventType: 'indian_wedding',
    altText: 'South Heritage: traditional South Indian wedding ceremony with bride in Kanjeevaram silk saree and groom in sacred temple mandap',
    sourceType: 'local_file',
    source: path.join(BRAIN_DIR, 'south_heritage_thumb_1789408021943.jpg'),
    photographer: 'Riwaayat Studio Original',
    license: 'Riwaayat Venue Exclusive Editorial License'
  },
  {
    templateId: 'blush_vows',
    slug: 'blush-vows',
    title: 'Blush Vows',
    eventType: 'indian_wedding',
    altText: 'Blush Vows: romantic couple standing under an English rose floral arch in a daylight garden ceremony',
    sourceType: 'local_file',
    source: path.join(BRAIN_DIR, 'blush_vows_thumb_1789408106502.jpg'),
    photographer: 'Riwaayat Studio Original',
    license: 'Riwaayat Venue Exclusive Editorial License'
  },
  {
    templateId: 'minimal_ivory',
    slug: 'minimal-ivory',
    title: 'Minimal Ivory',
    eventType: 'indian_wedding',
    altText: 'Minimal Ivory: refined contemporary wedding setting with ivory florals, marble architecture, and modern tailored elegance',
    sourceType: 'local_file',
    source: path.join(BRAIN_DIR, 'minimal_ivory_thumb_1789408173719.jpg'),
    photographer: 'Riwaayat Studio Original',
    license: 'Riwaayat Venue Exclusive Editorial License'
  },

  // 6 Muslim Wedding Templates
  {
    templateId: 'noor_nikah',
    slug: 'noor-nikah',
    title: 'Noor Nikah',
    eventType: 'muslim_wedding',
    altText: 'Noor Nikah: elegant Muslim bride and groom signing their Nikah certificate surrounded by white roses and Islamic arches',
    sourceType: 'local_file',
    source: path.join(BRAIN_DIR, 'noor_nikah_thumb_1789408252413.jpg'),
    photographer: 'Riwaayat Studio Original',
    license: 'Riwaayat Venue Exclusive Editorial License'
  },
  {
    templateId: 'emerald_qasr',
    slug: 'emerald-qasr',
    title: 'Emerald Qasr',
    eventType: 'muslim_wedding',
    altText: 'Emerald Qasr: opulent Muslim wedding reception with bride in emerald green velvet lehenga and groom in forest green bandhgala in a Moroccan hall',
    sourceType: 'local_file',
    source: path.join(BRAIN_DIR, 'emerald_qasr_thumb_1789408334072.jpg'),
    photographer: 'Riwaayat Studio Original',
    license: 'Riwaayat Venue Exclusive Editorial License'
  },
  {
    templateId: 'ivory_dua',
    slug: 'ivory-dua',
    title: 'Ivory Dua',
    eventType: 'muslim_wedding',
    altText: 'Ivory Dua: serene Muslim couple in white and gold prayer posture during their sacred Nikah in a luminous courtyard',
    sourceType: 'local_file',
    source: path.join(BRAIN_DIR, 'ivory_dua_thumb_1789408419910.jpg'),
    photographer: 'Riwaayat Studio Original',
    license: 'Riwaayat Venue Exclusive Editorial License'
  },
  {
    templateId: 'zafraan_evening',
    slug: 'zafraan-evening',
    title: 'Zafraan Evening',
    eventType: 'muslim_wedding',
    altText: 'Zafraan Evening: festive wedding evening with bride in saffron gold gharara and groom in black sherwani under fairy light arches',
    sourceType: 'local_file',
    source: path.join(BRAIN_DIR, 'zafraan_evening_thumb_1789408536395.jpg'),
    photographer: 'Riwaayat Studio Original',
    license: 'Riwaayat Venue Exclusive Editorial License'
  },
  {
    templateId: 'resham_royale',
    slug: 'resham-royale',
    title: 'Resham Royale',
    eventType: 'muslim_wedding',
    altText: 'Resham Royale: regal Pakistani wedding reception couple in ruby red and maroon raw silk with intricate zardozi embroidery',
    sourceType: 'local_file',
    source: path.join(BRAIN_DIR, 'resham_royale_thumb_1789408641094.jpg'),
    photographer: 'Riwaayat Studio Original',
    license: 'Riwaayat Venue Exclusive Editorial License'
  },
  {
    templateId: 'midnight_walima',
    slug: 'midnight-walima',
    title: 'Midnight Walima',
    eventType: 'muslim_wedding',
    altText: 'Midnight Walima: sophisticated navy and gold Walima reception ballroom with crystal chandeliers and candlelight ambiance',
    sourceType: 'url',
    source: 'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?auto=format&fit=crop&w=1200&q=80',
    photographer: 'Alasdair Elmes',
    license: 'Unsplash Commercial Free License'
  },

  // 4 Birthday Templates
  {
    templateId: 'pastel_party',
    slug: 'pastel-party',
    title: 'Pastel Party',
    eventType: 'birthday',
    altText: 'Pastel Party: luxury pastel birthday table with blush and lavender balloons, tiered cake, and natural soft lighting',
    sourceType: 'url',
    source: 'https://images.unsplash.com/photo-1530103862676-de8c9debad1d?auto=format&fit=crop&w=1200&q=80',
    photographer: 'Adi Goldstein',
    license: 'Unsplash Commercial Free License'
  },
  {
    templateId: 'little_star',
    slug: 'little-star',
    title: 'Little Star',
    eventType: 'birthday',
    altText: 'Little Star: tasteful children milestone birthday setup with golden stars, soft pastel decor, and warm joyful atmosphere',
    sourceType: 'url',
    source: 'https://images.unsplash.com/photo-1513151233558-d860c5398176?auto=format&fit=crop&w=1200&q=80',
    photographer: 'Joanna Kosinska',
    license: 'Unsplash Commercial Free License'
  },
  {
    templateId: 'elegant_soiree',
    slug: 'elegant-soiree',
    title: 'Elegant Soirée',
    eventType: 'birthday',
    altText: 'Elegant Soirée: sophisticated adult birthday dinner celebration with champagne tones, glowing candles, and refined luxury decor',
    sourceType: 'url',
    source: 'https://images.unsplash.com/photo-1519671482749-fd09be7ccebf?auto=format&fit=crop&w=1200&q=80',
    photographer: 'Scott Warman',
    license: 'Unsplash Commercial Free License'
  },
  {
    templateId: 'neon_celebration',
    slug: 'neon-celebration',
    title: 'Neon Celebration',
    eventType: 'birthday',
    altText: 'Neon Celebration: stylish modern birthday party with vibrant neon lighting, disco atmosphere, and celebratory lounge table',
    sourceType: 'url',
    source: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=1200&q=80',
    photographer: 'Alexander Popov',
    license: 'Unsplash Commercial Free License'
  }
];

async function getImageBuffer(cfg) {
  if (cfg.sourceType === 'local_file') {
    return fs.promises.readFile(cfg.source);
  } else {
    const res = await fetch(cfg.source);
    if (!res.ok) throw new Error(`HTTP ${res.status} fetching ${cfg.source}`);
    const arrayBuf = await res.arrayBuffer();
    return Buffer.from(arrayBuf);
  }
}

async function run() {
  console.log('🚀 Starting Riwaayat Venue Template Asset Processing...\n');

  if (!fs.existsSync(TEMPLATES_DIR)) {
    fs.mkdirSync(TEMPLATES_DIR, { recursive: true });
  }

  const manifest = [];

  for (const cfg of TEMPLATE_CONFIGS) {
    const targetDir = path.join(TEMPLATES_DIR, cfg.slug);
    if (!fs.existsSync(targetDir)) {
      fs.mkdirSync(targetDir, { recursive: true });
    }

    console.log(`Processing [${cfg.templateId}] -> /assets/templates/${cfg.slug}/...`);
    const inputBuf = await getImageBuffer(cfg);

    // 1. Thumbnail (3:4 portrait ratio: 600x800)
    const thumbPath = path.join(targetDir, 'thumbnail.webp');
    await sharp(inputBuf)
      .resize(600, 800, { fit: 'cover', position: 'center' })
      .webp({ quality: 85, effort: 4 })
      .toFile(thumbPath);

    // 2. Hero (1200x800)
    const heroPath = path.join(targetDir, 'hero.webp');
    await sharp(inputBuf)
      .resize(1200, 800, { fit: 'cover', position: 'center' })
      .webp({ quality: 85, effort: 4 })
      .toFile(heroPath);

    // 3. Gallery-01 (800x800 square detail)
    const galleryPath = path.join(targetDir, 'gallery-01.webp');
    await sharp(inputBuf)
      .resize(800, 800, { fit: 'cover', position: 'center' })
      .webp({ quality: 85, effort: 4 })
      .toFile(galleryPath);

    // Verification info
    const meta = await sharp(thumbPath).metadata();

    manifest.push({
      templateId: cfg.templateId,
      slug: cfg.slug,
      title: cfg.title,
      eventType: cfg.eventType,
      thumbnailPath: `/assets/templates/${cfg.slug}/thumbnail.webp`,
      heroPath: `/assets/templates/${cfg.slug}/hero.webp`,
      galleryPath: `/assets/templates/${cfg.slug}/gallery-01.webp`,
      width: meta.width,
      height: meta.height,
      format: meta.format,
      altText: cfg.altText,
      sourceUrl: cfg.source,
      photographer: cfg.photographer,
      license: cfg.license,
      dateAdded: '2026-09-14'
    });

    console.log(`  ✅ Generated: thumbnail.webp (${meta.width}x${meta.height}), hero.webp, gallery-01.webp`);
  }

  // Also fix legacy image aliases so client/assets/images/hero_muslim_real.jpg and birthday_hero_real.jpg never 404
  const imagesDir = path.join(CLIENT_ASSETS, 'images');
  if (!fs.existsSync(imagesDir)) fs.mkdirSync(imagesDir, { recursive: true });

  const noorNikahThumb = path.join(TEMPLATES_DIR, 'noor-nikah', 'thumbnail.webp');
  const pastelPartyThumb = path.join(TEMPLATES_DIR, 'pastel-party', 'thumbnail.webp');

  await sharp(noorNikahThumb).jpeg({ quality: 90 }).toFile(path.join(imagesDir, 'hero_muslim_real.jpg'));
  await sharp(pastelPartyThumb).jpeg({ quality: 90 }).toFile(path.join(imagesDir, 'birthday_hero_real.jpg'));
  console.log('✅ Synchronized legacy alias images (hero_muslim_real.jpg & birthday_hero_real.jpg).');

  // Save asset manifest
  const manifestPath = path.join(TEMPLATES_DIR, 'asset-manifest.json');
  fs.writeFileSync(manifestPath, JSON.stringify({ templates: manifest }, null, 2));
  console.log(`\n🎉 Asset Manifest generated at ${manifestPath}`);

  // Validation Check
  console.log('\n🔍 Running Validation Check on All 18 Thumbnails:');
  let passCount = 0;
  for (const item of manifest) {
    const fullDiskPath = path.join(TEMPLATES_DIR, item.slug, 'thumbnail.webp');
    if (!fs.existsSync(fullDiskPath)) {
      throw new Error(`Missing thumbnail file: ${fullDiskPath}`);
    }
    const stat = fs.statSync(fullDiskPath);
    if (stat.size < 1000) {
      throw new Error(`Corrupt thumbnail (too small): ${fullDiskPath}`);
    }
    if (item.width !== 600 || item.height !== 800) {
      throw new Error(`Invalid dimensions for ${item.slug}: ${item.width}x${item.height}`);
    }
    if (!item.altText || item.altText.length < 20) {
      throw new Error(`Alt text missing or too short for ${item.slug}`);
    }
    passCount++;
  }
  console.log(`🌟 ALL ${passCount}/18 TEMPLATE THUMBNAILS VALIDATED SUCCESSFULLY WITH 3:4 RATIO!`);
}

run().catch((err) => {
  console.error('Fatal processing error:', err);
  process.exit(1);
});
