import fs from 'fs';

const content = fs.readFileSync('src/components/TapasModal.tsx', 'utf8');
const lines = content.split(/\r?\n/);
for (let j = 0; j < lines.length; j++) {
  if (lines[j].includes('tapas-carousel')) {
    console.log(`Found carousel start at line ${j + 1}`);
    for (let k = j; k < j + 80 && k < lines.length; k++) {
      console.log(`Line ${k + 1}: ${JSON.stringify(lines[k])}`);
    }
    break;
  }
}
