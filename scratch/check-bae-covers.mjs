import { readFileSync } from 'fs';

const html = readFileSync('scratch/bae.html', 'utf8');
const articleRegex = /<article[^>]*>([\s\S]*?)<\/article>/gi;
let match;
while ((match = articleRegex.exec(html)) !== null) {
  const content = match[1];
  const titleMatch = content.match(/<h[23][^>]*>([\s\S]*?)<\/h[23]>/i);
  if (titleMatch) {
    const title = titleMatch[1].replace(/<[^>]*>/g, '').trim();
    if (title.toLowerCase().includes('tapa')) {
      console.log("Found Cover Article:", title);
      const imgMatch = content.match(/<img[^>]+src=["']([^"']+)["']/i) || content.match(/data-src=["']([^"']+)["']/i);
      if (imgMatch) {
        console.log("Cover Image src:", imgMatch[1]);
      }
    }
  }
}
