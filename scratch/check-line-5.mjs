import fs from 'fs';

const content = fs.readFileSync('src/components/Dashboard.tsx', 'utf8');
const lines = content.split(/\r?\n/);
for (let j = 525; j <= 630; j++) {
  console.log(`Line ${j + 1}: ${JSON.stringify(lines[j])}`);
}
