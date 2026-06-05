const urls = {
  bae: 'https://www.baenegocios.com/tags/Edicion-Impresa/',
  tiempo: 'https://www.tiempofueguino.com/portadas/',
  prensa: 'https://www.diarioprensa.com.ar/category/en-papel/',
  findelmundo: 'https://www.eldiariodelfindelmundo.com/ediciones/',
  provincia23: 'https://www.provincia23.com.ar/diario-papel/',
  surenio: 'https://www.surenio.com.ar/categorias/tapa/'
};

async function testUrl(name, url) {
  try {
    const res = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.0.0 Safari/537.36'
      }
    });
    const html = await res.text();
    console.log(`\n=== ${name} (${url}) ===`);
    console.log("HTML length:", html.length);
    
    // Look for pdf links
    const pdfRegex = /href="([^"]+\.pdf)"/gi;
    const pdfs = [];
    let match;
    while ((match = pdfRegex.exec(html)) !== null && pdfs.length < 5) {
      pdfs.push(match[1]);
    }
    console.log("Found PDFs:", pdfs);

    // Look for image links
    const imgRegex = /<img[^>]+src="([^"]+)"/gi;
    const imgs = [];
    while ((match = imgRegex.exec(html)) !== null && imgs.length < 5) {
      imgs.push(match[1]);
    }
    console.log("Found Images:", imgs);
  } catch (err) {
    console.error(`Error fetching ${name}:`, err.message);
  }
}

async function run() {
  for (const [name, url] of Object.entries(urls)) {
    await testUrl(name, url);
  }
}
run();
