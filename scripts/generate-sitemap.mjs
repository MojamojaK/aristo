import { writeFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import { createRequire } from 'module';

const __dirname = dirname(fileURLToPath(import.meta.url));
const require = createRequire(import.meta.url);

const cultivationLogs = require('../src/data/cultivationLogs.json');
const greenhousePages = require('../src/data/greenhousePages.json');

const BASE_URL = 'https://mojamojak.github.io/aristo';
const today = new Date().toISOString().split('T')[0];

const urls = [
  { loc: `${BASE_URL}/`, priority: '1.0' },
  { loc: `${BASE_URL}/purchasing/retail`, priority: '0.6' },
];

for (const log of cultivationLogs) {
  urls.push({ loc: `${BASE_URL}/cultivation_logs/${log.slug}`, priority: '0.8' });
}

for (const page of greenhousePages) {
  urls.push({ loc: `${BASE_URL}${page.url}`, priority: '0.7' });
}

const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map(u => `  <url>
    <loc>${u.loc}</loc>
    <lastmod>${today}</lastmod>
    <priority>${u.priority}</priority>
  </url>`).join('\n')}
</urlset>
`;

const outPath = resolve(__dirname, '..', 'public', 'sitemap.xml');
writeFileSync(outPath, sitemap, 'utf-8');
console.log(`Generated sitemap.xml with ${urls.length} URLs`);
