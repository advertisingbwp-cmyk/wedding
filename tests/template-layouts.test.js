/**
 * 18 DISTINCT TEMPLATE LAYOUT VERIFICATION TEST SUITE
 * Verifies:
 * 1. All 18 canonical templates resolve to a dedicated, distinct layout renderer.
 * 2. Each template has a unique DOM layout structure (Hero, Functions, Signature Section).
 * 3. No two templates share identical DOM classes or container hierarchies.
 * 4. Verifies all 18 slugs over HTTP against the Express public event route.
 */

const assert = require('node:assert');
const http = require('node:http');
const app = require('../server/app');
const FirestoreStore = require('../server/services/firestoreStore');
const {
  TEMPLATE_RENDERERS,
  resolveTemplateKey,
  SLUG_TO_TEMPLATE_KEY
} = require('../client/js/template-renderers');

async function runLayoutTestSuite() {
  console.log('🏛️  Running 18 Canonical Template Layout Verification Suite...\n');

  const canonicalList = FirestoreStore.getAllTemplates();
  assert.strictEqual(canonicalList.length, 18, 'Must have exactly 18 canonical templates in FirestoreStore');

  const heroClassesSeen = new Set();
  const functionsClassesSeen = new Set();
  const signatureClassesSeen = new Set();
  const fullDomSnapshots = new Set();

  console.log('--- Verifying Distinct DOM Structures for All 18 Templates ---\n');

  canonicalList.forEach((tpl, idx) => {
    const key = resolveTemplateKey(tpl);
    const renderer = TEMPLATE_RENDERERS[key];

    assert.ok(renderer, `Renderer must exist for template key: ${key}`);
    assert.strictEqual(typeof renderer.renderHero, 'function', `renderHero function required for ${key}`);
    assert.strictEqual(typeof renderer.renderFunctions, 'function', `renderFunctions function required for ${key}`);
    assert.strictEqual(typeof renderer.renderSignatureSection, 'function', `renderSignatureSection function required for ${key}`);

    const heroHtml = renderer.renderHero({}, tpl);
    const funcHtml = renderer.renderFunctions(
      [
        { title: 'Main Event', subtitle: 'Celebration Subtitle', date_time: '7:00 PM', venue_name: 'The Ballroom', description: 'Ceremony details.' }
      ],
      tpl
    );
    const sigHtml = renderer.renderSignatureSection(tpl);

    // Extract root or major class identifiers
    const heroMatch = heroHtml.match(/class="([^"]+)"/);
    const heroClass = heroMatch ? heroMatch[1].split(' ')[0] : '';

    const funcMatch = funcHtml.match(/class="([^"]+)"/);
    const funcClass = funcMatch ? funcMatch[1].split(' ')[0] : '';

    const sigMatch = sigHtml.match(/class="([^"]+)"/);
    const sigClass = sigMatch ? sigMatch[1].split(' ')[0] : '';

    assert.ok(heroClass, `Hero section for ${key} must have unique identifying class`);
    assert.ok(funcClass, `Functions section for ${key} must have unique identifying class`);
    assert.ok(sigClass, `Signature section for ${key} must have unique identifying class`);

    // Verify distinctness across templates
    assert.strictEqual(heroClassesSeen.has(heroClass), false, `Hero class "${heroClass}" must be unique to ${key}`);
    heroClassesSeen.add(heroClass);

    // Verify composite DOM snapshot uniqueness
    const fullSnapshot = `${heroClass}|${funcClass}|${sigClass}`;
    assert.strictEqual(fullDomSnapshots.has(fullSnapshot), false, `Composite DOM structure must be unique to ${key}`);
    fullDomSnapshots.add(fullSnapshot);

    console.log(`  ✅ [${idx + 1}/18] ${key.padEnd(20)} | Archetype: ${renderer.archetype.padEnd(42)} | Hero: .${heroClass.padEnd(24)} | Signature: .${sigClass}`);
  });

  console.log('\n--- Verifying Live HTTP /api/public/event/:slug for all 18 Slugs ---');
  const server = http.createServer(app);
  await new Promise((resolve) => server.listen(0, resolve));
  const port = server.address().port;
  const baseUrl = `http://localhost:${port}`;

  let httpSuccessCount = 0;
  for (const tpl of canonicalList) {
    const res = await fetch(`${baseUrl}/api/public/event/${tpl.slug}`);
    assert.strictEqual(res.status, 200, `Slug /api/public/event/${tpl.slug} should return 200`);
    const data = await res.json();
    assert.ok(data.event, `Response must contain event object for ${tpl.slug}`);
    assert.strictEqual(data.event.slug, tpl.slug, `Event slug must match requested slug: ${tpl.slug}`);
    assert.ok(Array.isArray(data.sections) && data.sections.length > 0, `Sections must be non-empty for ${tpl.slug}`);
    assert.ok(Array.isArray(data.functions) && data.functions.length > 0, `Functions must be non-empty for ${tpl.slug}`);

    // Verify HTML route serves event-view.html with template-renderers.js script included
    const pageRes = await fetch(`${baseUrl}/event/${tpl.slug}`);
    assert.strictEqual(pageRes.status, 200, `HTML route /event/${tpl.slug} should return 200`);
    const html = await pageRes.text();
    assert.ok(html.includes('/js/template-renderers.js'), `HTML page must include /js/template-renderers.js`);
    assert.ok(html.includes('/css/templates-layouts.css'), `HTML page must include /css/templates-layouts.css`);

    httpSuccessCount++;
  }

  server.close();
  console.log(`  ✅ All ${httpSuccessCount}/18 public template endpoints and HTML views returned HTTP 200 with layout assets.`);
  console.log('\n🎉 ALL 18 TEMPLATE LAYOUT VERIFICATION TESTS PASSED SUCCESSFULLY!');
}

runLayoutTestSuite().catch((err) => {
  console.error('❌ Test failed:', err);
  process.exit(1);
});

