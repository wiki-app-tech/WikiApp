const fs = require('fs');

const data = JSON.parse(fs.readFileSync('public/data/feeds.json', 'utf8'));

const newData = data.filter(d => d.category !== 'diseno').map(feed => {
  const text = (feed.name + ' ' + feed.id + ' ' + feed.url).toLowerCase();
  
  if (text.includes('gremial')) {
    feed.category = 'gremial';
  } else if (text.includes('politica') || text.includes('política')) {
    feed.category = 'politica';
  } else if (text.match(/deporte|futbol|fútbol|ole/)) {
    feed.category = 'deporte';
  } else if (text.includes('sociedad')) {
    feed.category = 'sociedad';
  }
  
  return feed;
});

// Since maybe we don't have enough 'sociedad' or 'deporte', let's manually re-assign a few if needed,
// but the prompt just says to group news into these new categories.

fs.writeFileSync('public/data/feeds.json', JSON.stringify(newData, null, 4));
console.log('Feeds updated.');
