const fs = require('fs');
const path = require('path');

const opmlPath = path.join(__dirname, 'data.opml');
let opmlStr;
try {
   opmlStr = fs.readFileSync(opmlPath, 'utf-8');
} catch(e) {
   console.error("No file found at", opmlPath);
   process.exit(1);
}

const lines = opmlStr.split('\n');

const feeds = [];
let currentCategory = 'otras';

const slugify = (text) => text.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

for (const line of lines) {
    const categoryMatch = line.match(/<outline\s+text="([^"]+)"\s+title="([^"]+)">/);
    if (categoryMatch) {
        currentCategory = slugify(categoryMatch[1]);
        continue;
    }

    const feedMatch = line.match(/<outline\s+text="([^"]+)".*?xmlUrl="([^"]+)".*?htmlUrl="([^"]+)"/);
    if (feedMatch) {
        const title = feedMatch[1];
        const xmlUrl = feedMatch[2];
        const htmlUrl = feedMatch[3];
        
        let type = 'rss';
        if (xmlUrl.includes('youtube.com')) {
            type = 'youtube';
        }

        feeds.push({
            id: slugify(title),
            name: title,
            url: xmlUrl,
            type: 'rss', 
            category: currentCategory
        });
    }
    
    const singleMatch = line.match(/<outline\s+text="([^"]+)".*?xmlUrl="([^"]+)".*?\/>/);
    if (singleMatch && !line.includes('title="TECNOLOGIA"')) { 
       if (!feedMatch) {
          feeds.push({
             id: slugify(singleMatch[1]),
             name: singleMatch[1],
             url: singleMatch[2],
             type: 'rss',
             category: currentCategory === 'otras' ? 'nacionales' : currentCategory 
          });
       }
    }
}

const uniqueFeeds = [];
const ids = new Set();
for (const feed of feeds) {
    if (!ids.has(feed.id)) {
        ids.add(feed.id);
        uniqueFeeds.push(feed);
    }
}

const outPath = path.join(__dirname, '../public/data/feeds.json');
fs.writeFileSync(outPath, JSON.stringify(uniqueFeeds, null, 4));
console.log('Saved', uniqueFeeds.length, 'feeds to public/data/feeds.json');
