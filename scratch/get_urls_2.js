const https = require('https');
const http = require('http');

const urls = [
    'https://onlineradiobox.com/ar/infinito911/',
    'https://onlineradiobox.com/ar/espectaculo/',
    'http://onlineradiobox.com/ar/masters/',
    'https://onlineradiobox.com/ar/stylofm/',
    'https://onlineradiobox.com/ar/latecno/',
    'https://onlineradiobox.com/ar/publicafueguina/'
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
            const orbStreams = [...data.matchAll(/data-stream=[\"\']([^\"\']+)[\"\']/g)].map(m => m[1]);
            const streams = [...data.matchAll(/(https?:\/\/[^\s\"\'<>]+(?:\.mp3|\.aac|\.m3u8|\/stream|\/live|8000|8080|9037|8192|8130)[^\s\"\'<>]*)/g)].map(m => m[1]);
            
            const allStreams = [...new Set([...orbStreams, ...streams])];
            console.log(`${url}:`, allStreams);
        } catch (e) {
            console.log(`${u}: Error`, e.message);
        }
    }
}

run();
