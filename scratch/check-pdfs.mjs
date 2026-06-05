import { readFileSync } from 'fs';

const files = ['bae', 'tiempo', 'prensa', 'findelmundo', 'provincia23', 'surenio'];

for (const name of files) {
  try {
    const html = readFileSync(`scratch/${name}.html`, 'utf8');
    const pdfMatches = html.match(/[^"'\s>]+\.pdf/gi);
    if (pdfMatches) {
      console.log(`\n=== PDFs in ${name} ===`);
      console.log(pdfMatches.slice(0, 10));
    } else {
      console.log(`${name}: No PDF references found`);
    }
  } catch (err) {
    console.error(err);
  }
}
