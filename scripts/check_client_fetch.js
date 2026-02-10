const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();

  console.log('Opening /community and capturing requests...');

  page.on('request', (req) => {
    const url = req.url();
    const method = req.method();
    if (url.includes('/api/posts') || url.includes('/auth/v1') || url.includes('supabase')) {
      console.log(`REQUEST ${method} ${url}`);
    }
  });

  const path = process.argv[2] || '/community';
  try {
    await page.goto(`http://localhost:3000${path}`, { waitUntil: 'networkidle2', timeout: 30000 });
    // give client scripts a moment to run
    await new Promise((r) => setTimeout(r, 2000));
  } catch (e) {
    console.error('Page load error:', e.message);
  }

  await browser.close();
  console.log('Done.');
})();
