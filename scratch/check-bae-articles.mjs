import { readFileSync } from 'fs';

const html = readFileSync('scratch/bae.html', 'utf8');
const articleRegex = /<article[^>]*>([\s\S]*?)<\/article>/gi;
let match;
let count = 0;
while ((match = articleRegex.exec(html)) !== null && count < 5) {
  const content = match[1];
  console.log(`\n=== Article ${++count} ===`);
  const titleMatch = content.match(/<h[23][^>]*>([\s\S]*?)<\/h[23]>/i);
  if (titleMatch) {
    console.log("Title:", titleMatch[1].replace(/<[^>]*>/g, '').trim());
  }
  const imgMatch = content.match(/<img[^>]+src=["']([^"']+)["']/i) || content.match(/data-src=["']([^"']+)["']/i);
  if (imgMatch) {
    console.log("Image src:", imgMatch[1]);
  }
}
