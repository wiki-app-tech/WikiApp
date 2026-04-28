const https = require('https');
const http = require('http');

const urls = [
    'https://www.radios-argentinas.org/radio-provincia-999',
    'https://www.radios-argentinas.org/radio-argentina-ushuaia',
    'https://www.radios-argentinas.org/fm-fuego',
    'https://www.radios-argentinas.org/estacion-del-siglo',
    'https://www.radios-argentinas.org/fm-ushuaia',
    'https://www.radios-argentinas.org/aire-libre-fm',
    'https://www.radiofmcentro.com/',
    'https://www.radiofueguina.com/en-vivo/',
    'https://onlineradiobox.com/ar/lra24/',
    'https://onlineradiobox.com/ar/cadenafm/?cs=ar.lra24'
];

async function fetchUrl(url) {
    return new Promise((resolve, reject) => {
        const client = url.startsWith('https') ? https : http;
        client.get(url, { headers: { 'User-Agent': 'Mozilla/5.0' } }, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => resolve({url, data}));
        }).on('error', err => reject(err));
    });
}

async function run() {
    for (const u of urls) {
        try {
            const {url, data} = await fetchUrl(u);
            const streams = [...data.matchAll(/(https?:\/\/[^\s\"\'<>]+(?:\.mp3|\.aac|\.m3u8|\/stream|\/live|8000|8080|9037|8192|8130)[^\s\"\'<>]*)/g)].map(m => m[1]);
            const sources = [...data.matchAll(/<source\s+[^>]*src=[\"\']([^\"\']+)[\"\']/g)].map(m => m[1]);
            const orbStreams = [...data.matchAll(/data-stream=[\"\']([^\"\']+)[\"\']/g)].map(m => m[1]);
            const raStreams = [...data.matchAll(/data-radio-url=[\"\']([^\"\']+)[\"\']/g)].map(m => m[1]);
            
            const allStreams = [...new Set([...streams, ...sources, ...orbStreams, ...raStreams])];
            console.log(`${url}:`, allStreams);
        } catch (e) {
            console.log(`${u}: Error`, e.message);
        }
    }
}

run();
