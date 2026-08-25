import https from 'https';
import http from 'http';

const candidateRadios = [
  { name: 'Radio Provincia', freq: '99.5 FM', city: 'Ushuaia', url: 'https://server.streamcasthd.com/8192/stream' },
  { name: 'Radio Provincia (Alt)', freq: '99.5 FM', city: 'Ushuaia', url: 'http://158.69.225.155:8041/live' },
  { name: 'FM Fuego', freq: '90.1 FM', city: 'Río Grande', url: 'https://media.siglocero.net:8004/stream' },
  { name: 'Estación del Siglo', freq: '105.3 FM', city: 'Río Grande', url: 'http://streamall.alsolnet.com/estaciondelsigloaudio' },
  { name: 'Aire Libre FM', freq: '96.3 FM', city: 'Río Grande', url: 'https://cdn.instream.audio:9037/stream' },
  { name: 'FM Master\'s', freq: '102.7 FM', city: 'Ushuaia', url: 'https://streamingradiolinks.xyz/8130' },
  { name: 'La 97 Radio Fueguina', freq: '96.9 FM', city: 'Río Grande', url: 'https://streamlky.alsolnet.com/radiofueguina' },
  { name: 'Radio Nacional Ushuaia', freq: 'AM 780', city: 'Ushuaia', url: 'https://sa.mp3.icecast.magma.edge-access.net/sc_rad10' },
  { name: 'Radio Nacional Río Grande', freq: 'AM 640', city: 'Río Grande', url: 'https://sa.mp3.icecast.magma.edge-access.net/sc_rad24' },
  { name: 'Cadena FM', freq: 'Online', city: 'Tierra del Fuego', url: 'https://playerservices.streamtheworld.com/api/livestream-redirect/RADIO3.mp3?dist=onlineradiobox' },
  { name: 'Infinito 911', freq: '91.1 FM', city: 'Ushuaia', url: 'https://stream.radioinfo.ar/5752/stream/' },
  { name: 'FM Espectáculo', freq: '93.1 FM', city: 'Ushuaia', url: 'https://emisorasdigitales2.com:8058/stream' },
  { name: 'Stylo FM', freq: '101.1 FM', city: 'Río Grande', url: 'https://cdn.instream.audio:9272/stream' },
  { name: 'Radio Argentina Ushuaia', freq: '97.9 FM', city: 'Ushuaia', url: 'https://proxy.turadioinfo.com/6334;live' },
];

function checkStream(url) {
  return new Promise((resolve) => {
    try {
      const client = url.startsWith('https') ? https : http;
      const req = client.get(url, { headers: { 'User-Agent': 'Mozilla/5.0' } }, (res) => {
        resolve({ statusCode: res.statusCode, headers: res.headers });
        req.destroy();
      });
      req.on('error', (err) => resolve({ error: err.message }));
      req.setTimeout(4000, () => {
        req.destroy();
        resolve({ error: 'timeout' });
      });
    } catch (e) {
      resolve({ error: e.message });
    }
  });
}

async function run() {
  for (const r of candidateRadios) {
    const res = await checkStream(r.url);
    console.log(`${r.name} (${r.freq} - ${r.city}):`, res.statusCode || res.error);
  }
}

run();
