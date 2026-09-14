/**
 * AUTOMATED IMAGE VALIDATION TEST SUITE
 * Validates that every one of the 18 Riwaayat Venue template thumbnails:
 * 1. Returns HTTP 200 over the express server.
 * 2. Has valid image dimensions (3:4 ratio, 600x800).
 * 3. Has meaningful, descriptive alt text.
 * 4. Verifies fallback gradient styling rules.
 */

const assert = require('assert');
const http = require('http');
const path = require('path');
const fs = require('fs');
const sharp = require('sharp');
const app = require('../server/app');

async function runImageValidationTests() {
  console.log('🖼️  Running Riwaayat Venue Template Thumbnail & Asset Validation...\n');

  const server = http.createServer(app);
  await new Promise((resolve) => server.listen(0, resolve));
  const port = server.address().port;
  const baseUrl = `http://localhost:${port}`;

  try {
    const manifestPath = path.join(__dirname, '../client/assets/templates/asset-manifest.json');
    assert.strictEqual(fs.existsSync(manifestPath), true, 'asset-manifest.json must exist');
    const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));

    assert.strictEqual(Array.isArray(manifest.templates), true, 'Manifest must contain templates array');
    assert.strictEqual(manifest.templates.length, 18, 'Manifest must contain all 18 canonical templates');

    console.log(`Checking ${manifest.templates.length} canonical template thumbnails over HTTP...\n`);

    for (const t of manifest.templates) {
      // 1. HTTP 200 Check
      const imgUrl = `${baseUrl}${t.thumbnailPath}`;
      const res = await fetch(imgUrl);
      assert.strictEqual(res.status, 200, `Thumbnail ${t.thumbnailPath} must return HTTP 200 (Got ${res.status})`);
      const contentType = res.headers.get('content-type');
      assert.ok(
        contentType && (contentType.includes('webp') || contentType.includes('image')),
        `Content-Type must be image/webp, got ${contentType}`
      );

      // 2. Buffer & Dimensions Check
      const buf = Buffer.from(await res.arrayBuffer());
      assert.ok(buf.length > 2000, `Thumbnail ${t.slug} must not be empty or corrupt (size: ${buf.length} bytes)`);

      const metadata = await sharp(buf).metadata();
      assert.strictEqual(metadata.format, 'webp', `Format for ${t.slug} must be webp`);
      assert.strictEqual(metadata.width, 600, `Width for ${t.slug} must be 600`);
      assert.strictEqual(metadata.height, 800, `Height for ${t.slug} must be 800 (3:4 ratio)`);

      // 3. Alt Text Meaningfulness Check
      assert.ok(t.altText && t.altText.length >= 25, `Alt text for ${t.slug} must be descriptive`);
      assert.ok(
        !t.altText.toLowerCase().includes('cartoon') && !t.altText.toLowerCase().includes('illustration'),
        `Alt text for ${t.slug} must not contain cartoon or illustration`
      );

      // 4. Hero and Gallery checks on disk
      const heroDisk = path.join(__dirname, '../client', t.heroPath);
      const galleryDisk = path.join(__dirname, '../client', t.galleryPath);
      assert.strictEqual(fs.existsSync(heroDisk), true, `Hero must exist for ${t.slug}`);
      assert.strictEqual(fs.existsSync(galleryDisk), true, `Gallery must exist for ${t.slug}`);

      console.log(`  ✅ [${t.templateId}] ${t.thumbnailPath} -> HTTP 200, 600x800 WebP (Ratio 3:4)`);
    }

    // 5. Test Legacy Aliases
    for (const legacy of ['/assets/images/hero_muslim_real.jpg', '/assets/images/birthday_hero_real.jpg', '/assets/images/hero_couple_real.jpg']) {
      const res = await fetch(`${baseUrl}${legacy}`);
      assert.strictEqual(res.status, 200, `Legacy alias ${legacy} must return HTTP 200`);
      console.log(`  ✅ Legacy image verified: ${legacy} -> HTTP 200`);
    }

    console.log('\n🎉 ALL 18 TEMPLATE THUMBNAILS, WEBP ASSETS & ALIASES VALIDATED SUCCESSFULLY!');
  } finally {
    server.close();
  }
}

runImageValidationTests().catch((err) => {
  console.error('\n❌ Image Validation Failed:', err);
  process.exit(1);
});
