import fs from 'fs';

const content = fs.readFileSync('src/components/Dashboard.tsx', 'utf8');
const lines = content.split(/\r?\n/);
for (let i = 1998; i <= 2044; i++) {
  console.log(`Line ${i + 1}: ${JSON.stringify(lines[i])}`);
}
