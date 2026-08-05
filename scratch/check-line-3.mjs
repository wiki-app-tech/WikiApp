import fs from 'fs';

const content = fs.readFileSync('src/components/Dashboard.tsx', 'utf8');
const lines = content.split(/\r?\n/);
// Let's find flightsData.map in the lines
for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes('flightsData.map')) {
    for (let j = i - 2; j <= i + 40; j++) {
      console.log(`Line ${j + 1}: ${JSON.stringify(lines[j])}`);
    }
    break;
  }
}
