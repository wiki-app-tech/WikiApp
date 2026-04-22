const fs = require('fs');
const path = require('path');

const feedsPath = path.join(__dirname, '../public/data/feeds.json');
const rawData = fs.readFileSync(feedsPath, 'utf-8');
const feeds = JSON.parse(rawData);

const originalCount = feeds.length;

// Palabras o dominios clave para identificar feeds en inglés
const englishKeywords = [
    'independent.co.uk',
    'economist.com',
    'businessinsider.com',
    'thehackernews.com',
    'krebsonsecurity.com',
    'cryptopotato.com',
    'medium.muz.li',
    'hl=en',
    'the hacker news',
    'finance and economics',
    'top stories',
    'news ticker'
];

const filteredFeeds = feeds.filter(feed => {
    const isEnglish = englishKeywords.some(keyword => 
        feed.url.toLowerCase().includes(keyword) || 
        feed.name.toLowerCase().includes(keyword)
    );
    
    if (isEnglish) {
        console.log(`Borrando feed en inglés: ${feed.name} (${feed.url})`);
        return false; // se elimina
    }
    return true; // se conserva
});

const newCount = filteredFeeds.length;

fs.writeFileSync(feedsPath, JSON.stringify(filteredFeeds, null, 4));
console.log(`\nHecho. Se eliminaron ${originalCount - newCount} feeds. Total restante: ${newCount}`);
