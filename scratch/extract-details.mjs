import { readFileSync } from 'fs';

const files = ['bae', 'tiempo', 'prensa', 'findelmundo', 'provincia23', 'surenio'];

function extract(name) {
  try {
    const html = readFileSync(`scratch/${name}.html`, 'utf8');
    console.log(`\n================ ${name} ================`);
    
    // Extract Yoast schema / ld+json
    const jsonLdRegex = /<script type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/gi;
    let match;
    while ((match = jsonLdRegex.exec(html)) !== null) {
      const content = match[1];
      if (content.includes('thumbnailUrl') || content.includes('image')) {
        console.log("Found JSON-LD image references:");
        const urls = content.match(/https?:\/\/[^\s"']+/g);
        if (urls) {
          console.log(urls.filter(u => u.includes('uploads') || u.includes('.jpg') || u.includes('.png') || u.includes('.jpeg')).slice(0, 5));
        }
      }
    }

    // Extract all image tags
    const imgRegex = /<img[^>]+src=["']([^"']+)["']/gi;
    const imgs = [];
    while ((match = imgRegex.exec(html)) !== null) {
      imgs.push(match[1]);
    }
    console.log("Featured / Image tags (filtered):");
    const filteredImgs = imgs.filter(img => !img.includes('logo') && !img.includes('avatar') && !img.includes('icon') && !img.includes('theme') && !img.includes('advertisement') && !img.includes('publicidad') && !img.includes('button'));
    console.log(filteredImgs.slice(0, 10));

    // For any links to PDFs
    const pdfRegex = /href=["']([^"']+\.pdf)["']/gi;
    const pdfs = [];
    while ((match = pdfRegex.exec(html)) !== null) {
      pdfs.push(match[1]);
    }
    if (pdfs.length > 0) {
      console.log("Found PDF Links:");
      console.log(pdfs.slice(0, 5));
    }

    // Look for generic image container patterns
    const dataSrcRegex = /data-(?:lazy-)?src=["']([^"']+)["']/gi;
    const dataSrcs = [];
    while ((match = dataSrcRegex.exec(html)) !== null) {
      dataSrcs.push(match[1]);
    }
    if (dataSrcs.length > 0) {
      console.log("Found data-src attributes:");
      console.log(dataSrcs.filter(src => src.includes('.jpg') || src.includes('.jpeg') || src.includes('.png')).slice(0, 10));
    }
  } catch (err) {
    console.error(`Error reading ${name}:`, err.message);
  }
}

for (const name of files) {
  extract(name);
}
