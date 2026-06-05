import { readFileSync } from 'fs';

const html = readFileSync('scratch/tiempo.html', 'utf8');
const bgRegex = /url\(['"]?([^'"()]+)['"]?\)/gi;
let match;
const urls = [];
while ((match = bgRegex.exec(html)) !== null) {
  urls.push(match[1]);
}
console.log("Found background URLs:", urls.length);
console.log(urls.filter(u => u.includes('uploads') || u.includes('.jpg') || u.includes('.jpeg') || u.includes('.png')));
