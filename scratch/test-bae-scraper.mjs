import fetch from 'node-fetch';

async function testBae() {
  const url = 'https://www.baenegocios.com/tags/Edicion-Impresa/';
  try {
    const res = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      }
    });
    const html = await res.text();
    
    // Find the first article that has "tapa" in its title or href
    const articleRegex = /<article[^>]*>([\s\S]*?)<\/article>/gi;
    let match;
    let articleLink = '';
    
    while ((match = articleRegex.exec(html)) !== null) {
      const content = match[1];
      if (content.toLowerCase().includes('tapa')) {
        const linkMatch = content.match(/href=["']([^"']+\.html)["']/i);
        if (linkMatch) {
          articleLink = linkMatch[1];
          break;
        }
      }
    }

    if (!articleLink) {
      // Fallback: get the very first article link on the page
      const firstLinkMatch = html.match(/<article[^>]*>[\s\S]*?href=["']([^"']+\.html)["']/i);
      if (firstLinkMatch) {
        articleLink = firstLinkMatch[1];
      }
    }

    if (articleLink) {
      const fullLink = articleLink.startsWith('http') ? articleLink : `https://www.baenegocios.com${articleLink}`;
      console.log("Found Cover Article Link:", fullLink);
      
      const detailRes = await fetch(fullLink, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        }
      });
      const detailHtml = await detailRes.text();
      
      // Look for the main article image
      const imgRegex = /https:\/\/www\.baenegocios\.com\/files\/image\/\d+\/\d+\/[^"'\s)(]+\.jpg/gi;
      const imgMatches = detailHtml.match(imgRegex);
      if (imgMatches) {
        // Filter out thumbnails and keep the cleanest one
        const filtered = imgMatches.map(u => u.replace(/_\d+_\d+!\.jpg$/i, '.jpg'));
        console.log("BAE High Res Cover Image:", filtered[0]);
      } else {
        console.log("No high res image found in article page. Searching for any image tag in body:");
        const anyImg = detailHtml.match(/<img[^>]+src=["']([^"']+)["']/i);
        console.log(anyImg ? anyImg[1] : "None");
      }
    } else {
      console.log("No cover article link found in BAE tag page.");
    }
  } catch (err) {
    console.error(err);
  }
}

testBae();
