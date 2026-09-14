process.env.NODE_ENV = 'test';
process.env.FIREBASE_ADMIN_MOCK = 'true';

const http = require('http');
const app = require('../server/app');

async function runPreviewTests() {
  const server = http.createServer(app);
  await new Promise((resolve) => server.listen(0, resolve));
  const port = server.address().port;
  console.log(`Test server running on port ${port}`);

  const templateSlugs = ['vijay-rashima-wedding', 'zain-ayla-nikah', 'arias-sweet-16'];

  for (const slug of templateSlugs) {
    // 1. Test HTML route /event/:slug
    const htmlRes = await fetch(`http://localhost:${port}/event/${slug}`);
    if (htmlRes.status !== 200) {
      throw new Error(`HTML route /event/${slug} returned status ${htmlRes.status}`);
    }
    const htmlText = await htmlRes.text();
    if (!htmlText.includes('dynamic-sections')) {
      throw new Error(`HTML route /event/${slug} missing dynamic-sections`);
    }
    console.log(`✅ /event/${slug} serves event-view.html (Status: ${htmlRes.status})`);

    // 2. Test API route /api/public/event/:slug
    const apiRes = await fetch(`http://localhost:${port}/api/public/event/${slug}`);
    if (apiRes.status !== 200) {
      throw new Error(`API route /api/public/event/${slug} returned status ${apiRes.status}`);
    }
    const data = await apiRes.json();
    if (!data.event || data.event.slug !== slug) {
      throw new Error(`API route /api/public/event/${slug} returned invalid event object: ${JSON.stringify(data)}`);
    }
    if (!Array.isArray(data.sections) || data.sections.length === 0) {
      throw new Error(`API route /api/public/event/${slug} returned empty sections`);
    }
    if (!Array.isArray(data.functions) || data.functions.length === 0) {
      throw new Error(`API route /api/public/event/${slug} returned empty functions`);
    }
    console.log(`✅ /api/public/event/${slug} returns complete template data (${data.sections.length} sections, ${data.functions.length} functions)`);
  }

  server.close();
  console.log('\n🎉 ALL TEMPLATE PREVIEW TESTS PASSED SUCCESSFULLY!');
}

runPreviewTests().catch((err) => {
  console.error('❌ Test failed:', err);
  process.exit(1);
});
