import Parser from 'rss-parser';

const parser = new Parser({
    headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:91.0) Gecko/20100101 Firefox/91.0',
        'Accept': 'application/rss+xml, application/xml, text/xml, */*'
    },
    timeout: 10000,
});

async function run() {
  console.log("Fetching and parsing RSS feed from Resumen Policial...");
  try {
    const feed = await parser.parseURL('https://www.resumenpolicial.com.ar/feed/');
    console.log("Feed Title:", feed.title);
    console.log("Feed Description:", feed.description);
    console.log("Number of items found:", feed.items.length);
    if (feed.items.length > 0) {
      console.log("\n--- Sample Item ---");
      const sample = feed.items[0];
      console.log("Title:", sample.title);
      console.log("Link:", sample.link);
      console.log("PubDate:", sample.pubDate || sample.isoDate);
      console.log("Snippet:", sample.contentSnippet || sample.content || "");
    }
  } catch (err) {
    console.error("Error fetching/parsing feed:", err);
  }
}

run();
