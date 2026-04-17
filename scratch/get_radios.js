const https = require('https');
const http = require('http');

const urls = [
  'https://www.radios-argentinas.org/radio-provincia-999',
  'https://www.radios-argentinas.org/radio-argentina-ushuaia',
  'https://www.radios-argentinas.org/fm-fuego',
  'https://www.radios-argentinas.org/the-cabinn-radio',
  'http://e.radios-argentinas.org/embed/estacion-del-siglo-485368',
  'https://www.radios-argentinas.org/fm-ushuaia',
  'http://e.radios-argentinas.org/embed/aire-libre-fm-417666',
  'https://tustreaming.co/AUDIO/FMESPE/',
  'https://www.laretrofm.com.ar/',
  'https://www.radiofueguina.com/'
];

function fetchHTML(url) {
  return new Promise((resolve, reject) => {
    const client = url.startsWith('https') ? https : http;
    client.get(url, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve({url, data}));
    }).on('error', reject);
  });
}

Promise.all(urls.map(u => fetchHTML(u).catch(e => ({url: u, data: ''})))).then(results => {
  results.forEach(res => {
    console.log(`\nURL: ${res.url}`);
    
    // Look for typical stream patterns:
    const audioSrc = res.data.match(/<audio.*?src=["'](.*?)["']/i);
    const sourceSrc = res.data.match(/<source.*?src=["'](.*?)["']/i);
    const dataStream = res.data.match(/data-stream=["'](.*?)["']/i);
    const streamUrl = res.data.match(/stream[A-Za-z]+=["']?([^"'>\s]+)/i);
    const varStream = res.data.match(/var stream = ["'](.*?)["']/i);
    
    if (audioSrc) console.log('Audio Src:', audioSrc[1]);
    if (sourceSrc) console.log('Source Src:', sourceSrc[1]);
    if (dataStream) console.log('Data Stream:', dataStream[1]);
    if(varStream) console.log('Var stream:', varStream[1]);
  });
});
