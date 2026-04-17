const fs = require('fs');

const opmlData = fs.readFileSync('feeds.opml', 'utf-8');
const feedsPath = '../public/data/feeds.json';
const feedsData = JSON.parse(fs.readFileSync(feedsPath, 'utf-8'));

const existingUrls = new Set(feedsData.map(f => f.url));
const slugify = (str) => str.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

const categoryMap = {
  'TECNOLOGIA': 'tecnologia',
  'DISEÑO': 'diseno',
  'ECONOMIA': 'economia',
  'RELIGION': 'religion',
  'INTERNACIONAL': 'internacionales',
  'NACIONAL': 'nacionales',
  'PROVINCIAL': 'provinciales',
  'OTRAS': 'otros'
};

const lines = opmlData.split('\n');
let currentCategory = 'otros';

for (let line of lines) {
  const matchCategory = line.match(/<outline .*?title="([^"]+)".*?>$/); // e.g. <outline text="..." title="...">
  if (matchCategory && !line.includes('xmlUrl=')) {
    // This is a category outline, not a feed
    currentCategory = categoryMap[matchCategory[1]] || slugify(matchCategory[1]);
    continue;
  }
  
  if (line.includes('</outline>')) {
    // We assume mostly 1 level nesting or reset to otros
    // Given the structure, when we see </outline>, we just reset.
    currentCategory = 'otros';
  }

  const matchFeed = line.match(/<outline text="([^"]+)" title="([^"]+)" type="rss" xmlUrl="([^"]+)"/);
  if (matchFeed) {
    const title = matchFeed[1];
    const url = matchFeed[3];
    let cat = currentCategory;
    
    // Correct top level categories based on structure
    if (title === 'Infobae.com' && cat === 'otros') cat = 'nacionales';
    if (title === 'Radio Nacional' && cat === 'otros') cat = 'provinciales';

    if (!existingUrls.has(url)) {
      feedsData.push({
        id: slugify(title),
        name: title,
        url: url,
        type: 'rss',
        category: cat
      });
      existingUrls.add(url);
    }
  }
}

fs.writeFileSync(feedsPath, JSON.stringify(feedsData, null, 4));
console.log(`Successfully merged feeds into feeds.json. Total feeds: ${feedsData.length}`);
