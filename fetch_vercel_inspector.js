const fs = require('fs');
const url = process.argv[2];
const token = process.env.VERCEL_TOKEN;
const { chromium } = require('playwright');
(async () => {
  if (!url) { console.error('Usage: node fetch_vercel_inspector.js <url>'); process.exit(2);}
  const browser = await chromium.launch({ args: ['--no-sandbox'] });
  const page = await browser.newPage();
  const logs = [];
  page.on('console', msg => logs.push({type:'console', text: msg.text(), location: msg.location()}));
  page.on('pageerror', err => logs.push({type:'pageerror', text: err.message}));
  if (token) await page.setExtraHTTPHeaders({ Authorization: `Bearer ${token}` });
  await page.goto(url, { waitUntil: 'networkidle', timeout: 120000 });
  await page.waitForTimeout(3000);
  const html = await page.content();
  fs.writeFileSync('inspector_rendered.html', html);
  fs.writeFileSync('inspector_console.json', JSON.stringify(logs, null, 2));
  console.log('Saved inspector_rendered.html and inspector_console.json');
  await browser.close();
})().catch(e=>{ console.error(e); process.exit(1); });
