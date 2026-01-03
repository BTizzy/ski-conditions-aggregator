#!/usr/bin/env node
/*
  scripts/scrape_onthesnow.cjs
  Simple OnTheSnow scraper stub — fetches a provided OnTheSnow URL (or full URL) and caches the raw HTML
  to scripts/cache/onthesnow/<slug>_<ts>.html for manual inspection and later parsing.

  Usage:
    node scripts/scrape_onthesnow.cjs <url-or-slug>

  If given a short slug (no scheme present), the script will log instructions and exit. Provide a full
  https:// URL to fetch now. This intentionally keeps parsing out of the script so we can safely
  gather raw pages and iterate on robust parsers later.
*/

const fs = require('fs');
const path = require('path');

async function main() {
  const arg = process.argv[2];
  if (!arg) {
    console.error('Usage: node scripts/scrape_onthesnow.cjs <full-on-the-snow-url>');
    process.exit(2);
  }

  const url = arg.startsWith('http') ? arg : null;
  if (!url) {
    console.error('Please provide a full URL (starting with http/https). Example:');
    console.error('  node scripts/scrape_onthesnow.cjs "https://www.onthesnow.com/new-hampshire/loon/snow-report.html"');
    process.exit(2);
  }

  try {
    console.log('Fetching:', url);
    const res = await fetch(url, { headers: { 'User-Agent': 'ski-conditions-aggregator/1.0 (+https://github.com)' } });
    if (!res.ok) {
      console.error('Fetch failed:', res.status, res.statusText);
      process.exit(3);
    }
    const text = await res.text();
    const ts = new Date().toISOString().replace(/[:.]/g, '-');
    // derive a safe slug from url
    const slug = url.replace(/^https?:\/\//, '').replace(/[^a-z0-9]+/gi, '-').replace(/-+/g, '-').replace(/(^-|-$)/g, '').toLowerCase();
    const outDir = path.resolve(__dirname, 'cache', 'onthesnow');
    await fs.promises.mkdir(outDir, { recursive: true });
    const outPath = path.join(outDir, `${slug}_${ts}.html`);
    await fs.promises.writeFile(outPath, text, 'utf8');
    console.log('Saved raw HTML to', outPath);
  } catch (err) {
    console.error('Error fetching/saving OnTheSnow page:', err && err.message ? err.message : err);
    process.exit(4);
  }
}

main();
