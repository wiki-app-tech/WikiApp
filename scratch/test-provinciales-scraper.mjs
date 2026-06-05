import fetch from 'node-fetch';

async function testScrape() {
  const sources = [
    {
      name: 'Tiempo Fueguino',
      url: 'https://www.tiempofueguino.com/portadas/',
      regex: /https:\/\/www\.tiempofueguino\.com\/wp-content\/uploads\/\d{4}\/\d{2}\/[^"'\s)(]+\.jpe?g/gi
    },
    {
      name: 'Diario Prensa',
      url: 'https://www.diarioprensa.com.ar/category/en-papel/',
      regex: /https:\/\/www\.diarioprensa\.com\.ar\/wp-content\/uploads\/\d{4}\/\d{2}\/[^"'\s)(]+\.jpe?g/gi
    },
    {
      name: 'El Diario del Fin del Mundo',
      url: 'https://www.eldiariodelfindelmundo.com/ediciones/',
      regex: /https:\/\/www\.eldiariodelfindelmundo\.com\/uploads\/imagenes\/repositorio\/\d{4}\/\d{2}\/\d{2}\/[^"'\s)(]+\.jpe?g/gi
    },
    {
      name: 'Provincia 23',
      url: 'https://www.provincia23.com.ar/diario-papel/',
      regex: /https:\/\/www\.provincia23\.com\.ar\/wp-content\/uploads\/\d{4}\/\d{2}\/[^"'\s)(]+\.jpe?g/gi
    },
    {
      name: 'El Sureño',
      url: 'https://www.surenio.com.ar/categorias/tapa/',
      regex: /https?:\/\/[^"'\s)(]+\/wp-content\/uploads\/\d{4}\/\d{2}\/[^"'\s)(]+\.jpe?g/gi
    }
  ];

  for (const src of sources) {
    try {
      const res = await fetch(src.url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        }
      });
      const html = await res.text();
      
      // Unescape slashes just in case they are escaped in JSON-LD
      const unescapedHtml = html.replace(/\\\/|\\/g, '/');

      const matches = unescapedHtml.match(src.regex);
      if (matches) {
        console.log(`\n--- ${src.name} matches ---`);
        // Filter out logos or common UI items
        const filtered = matches.map(u => {
          // Strip dimensions like -696x891 or -768x1051 or -660x365
          return u.replace(/-\d+x\d+(\.jpe?g)$/i, '$1');
        }).filter(u => {
          const lower = u.toLowerCase();
          return !lower.includes('logo') && !lower.includes('avatar') && !lower.includes('icon') && !lower.includes('publicidad') && !lower.includes('banner');
        });
        
        console.log("Latest Cover:", filtered[0]);
        console.log("Alt matches found:", [...new Set(filtered)].slice(0, 5));
      } else {
        console.log(`\n--- ${src.name}: No matches found ---`);
      }
    } catch (err) {
      console.error(`Error scraping ${src.name}:`, err.message);
    }
  }
}

testScrape();
