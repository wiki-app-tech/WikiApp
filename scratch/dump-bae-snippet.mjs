import { readFileSync } from 'fs';

const html = readFileSync('scratch/bae.html', 'utf8');
const articleRegex = /<article[^>]*>([\s\S]*?)<\/article>/gi;
let match;
while ((match = articleRegex.exec(html)) !== null) {
  const content = match[1];
  if (content.toLowerCase().includes('tapa de bae')) {
    console.log(content);
  }
}
