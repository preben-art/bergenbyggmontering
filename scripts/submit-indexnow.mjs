import { readFile } from 'node:fs/promises';
const config = JSON.parse(await readFile(new URL('../indexnow-config.json', import.meta.url), 'utf8'));
const sitemap = await fetch(`https://${config.host}/sitemap.xml`);
if (!sitemap.ok) throw new Error(`Sitemap HTTP ${sitemap.status}`);
const xml = await sitemap.text();
const urls = [...xml.matchAll(/<loc>\s*(.*?)\s*<\/loc>/g)].map(m => m[1].replaceAll('&amp;', '&'));
if (!urls.length || urls.some(url => new URL(url).hostname !== config.host)) throw new Error('Invalid sitemap URLs');
const keyResponse = await fetch(config.keyLocation);
if (!keyResponse.ok || (await keyResponse.text()).trim() !== config.key) throw new Error('Public key does not match');
if (!process.argv.includes('--submit')) { console.log(`Validated ${urls.length} URLs and public key. Add --submit after publishing changes.`); } else {
const response = await fetch('https://api.indexnow.org/indexnow', {method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({...config,urlList:urls})});
console.log(`IndexNow HTTP ${response.status}: ${urls.length} URLs submitted`);
if (!response.ok) throw new Error(await response.text());

}
