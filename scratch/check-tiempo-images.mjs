import { readFileSync } from 'fs';

const html = readFileSync('scratch/tiempo.html', 'utf8');
const imgRegex = /<img[^>]+src=["']([^"']+)["']/gi;
let match;
const allImgs = [];
while ((match = imgRegex.exec(html)) !== null) {
  allImgs.push(match[1]);
}
console.log("All images in tiempo.html:", allImgs.length);
console.log(allImgs.slice(0, 30));
