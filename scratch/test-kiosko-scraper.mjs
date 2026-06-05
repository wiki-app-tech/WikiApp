import fetch from 'node-fetch';

async function testKiosko() {
  const url = 'https://es.kiosko.net/es/np/abc.html';
  try {
    const res = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      }
    });
    const html = await res.text();
    const regex = /(?:https?:)?\/\/img\.kiosko\.net\/\d{4}\/\d{2}\/\d{2}\/[^"'\s)(]+\.750\.jpg/gi;
    const matches = html.match(regex);
    if (matches) {
      console.log("Kiosko Match found:", matches[0]);
    } else {
      console.log("No Kiosko match found. Let's search for any image on img.kiosko.net:");
      const anyImgRegex = /(?:https?:)?\/\/img\.kiosko\.net\/[^"'\s)(]+\.jpg/gi;
      const anyMatches = html.match(anyImgRegex);
      console.log(anyMatches ? anyMatches.slice(0, 5) : "None");
    }
  } catch (err) {
    console.error(err);
  }
}

testKiosko();
