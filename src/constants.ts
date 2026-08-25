import { NewsCategory, PrintEditionSource, NewsSource, RadioStation, LiveCamera, LiveStreamChannel } from './types';

export const PRINT_EDITION_SOURCES: Record<string, PrintEditionSource[]> = {
    [NewsCategory.INTERNATIONAL]: [
        { name: 'El País (España)', logoUrl: 'https://img.kiosko.net/{{DATE}}/es/elpais.750.jpg', url: 'https://elpais.com/' },
        { name: 'El Mundo (España)', logoUrl: 'https://img.kiosko.net/{{DATE}}/es/elmundo.750.jpg', url: 'https://www.elmundo.es/' },
        { name: 'La Vanguardia (España)', logoUrl: 'https://img.kiosko.net/{{DATE}}/es/lavanguardia.750.jpg', url: 'https://www.lavanguardia.com/' },
        { name: 'The New York Times (EE.UU.)', logoUrl: 'https://img.kiosko.net/{{DATE}}/us/nytimes.750.jpg', url: 'https://www.nytimes.com/' },
    ],
    [NewsCategory.NATIONAL]: [
        { name: 'Clarín', logoUrl: 'https://img.kiosko.net/{{DATE}}/ar/ar_clarin.750.jpg', url: 'https://www.clarin.com/' },
        { name: 'La Nación', logoUrl: 'https://img.kiosko.net/{{DATE}}/ar/ar_nacion.750.jpg', url: 'https://www.lanacion.com.ar/' },
        { name: 'Página 12', logoUrl: 'https://img.kiosko.net/{{DATE}}/ar/pagina12.750.jpg', url: 'https://www.pagina12.com.ar/' },
    ],
    [NewsCategory.PROVINCIAL]: [
        { name: 'Tiempo Fueguino', logoUrl: 'https://www.tiempofueguino.com/wp-content/uploads/2020/09/LOGO-TF-220-X-150.png', url: 'https://www.tiempofueguino.com/portadas/' },
        { name: 'Diario Prensa', logoUrl: 'https://www.diarioprensa.com.ar/wp-content/uploads/2021/11/logo_prensa_web_2.png', url: 'https://www.diarioprensa.com.ar/category/en-papel/' },
        { name: 'El Diario del Fin del Mundo', logoUrl: 'https://www.eldiariodelfindelmundo.com/wp-content/uploads/2020/12/logo-el-diario-del-fin-del-mundo-2.png', url: 'https://www.eldiariodelfindelmundo.com/ediciones/' },
    ],
};

export const NEWS_SITES: Record<string, NewsSource[]> = {
    [NewsCategory.INTERNATIONAL]: [
        { name: 'BBC News', url: 'https://www.bbc.com/news', logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/62/BBC_News_2022.svg/2560px-BBC_News_2022.svg.png', rssUrl: 'http://feeds.bbci.co.uk/news/world/rss.xml' },
        { name: 'Al Jazeera', url: 'https://www.aljazeera.com/', logo: 'https://upload.wikimedia.org/wikipedia/en/thumb/f/f2/Aljazeera_eng.svg/1200px-Aljazeera_eng.svg.png', rssUrl: 'https://www.aljazeera.com/xml/rss/all.xml' },
    ],
    [NewsCategory.NATIONAL]: [
        { name: 'Clarín', url: 'https://www.clarin.com/', logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/18/Clarin_logo_2020.svg/1200px-Clarin_logo_2020.svg.png', rssUrl: 'https://www.clarin.com/rss/lo-ultimo/' },
        { name: 'La Nación', url: 'https://www.lanacion.com.ar/', logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d5/La_Nacion_logo_2020.svg/2560px-La_Nacion_logo_2020.svg.png', rssUrl: 'https://www.lanacion.com.ar/arc/outboundfeeds/rss/?outputType=xml' },
    ],
    [NewsCategory.PROVINCIAL]: [
        { name: 'Ushuaia Noticias', url: 'https://ushuaianoticias.com/', logo: 'https://ushuaianoticias.com/wp-content/uploads/2021/08/logo-un.png', rssUrl: 'https://ushuaianoticias.com/feed/' },
        { name: 'TDF al Día', url: 'https://tdfaldia.com.ar/', logo: 'https://tdfaldia.com.ar/wp-content/uploads/2021/08/logo-tdf-al-dia.png', rssUrl: 'https://tdfaldia.com.ar/feed/' },
        { name: 'Resumen Policial', url: 'https://www.resumenpolicial.com.ar/', logo: 'https://www.resumenpolicial.com.ar/wp-content/uploads/2020/03/logo_encab_old.png', rssUrl: 'https://www.resumenpolicial.com.ar/feed/' },
    ],
};

export const RADIO_STATIONS: RadioStation[] = [
    {
        name: 'Radio Provincia',
        city: 'Ushuaia',
        frequency: '99.5 FM',
        logoUrl: 'https://www.tierradelfuego.gob.ar/wp-content/uploads/2023/03/logo-99-5-1.png',
        streamUrl: 'https://server.streamcasthd.com/8192/stream'
    },
    {
        name: 'FM Fuego',
        city: 'Río Grande',
        frequency: '90.1 FM',
        logoUrl: 'https://static.mytuner.mobi/media/tvos_radios/256/m4af5hsyv65k.png',
        streamUrl: 'https://media.siglocero.net:8004/stream'
    },
    {
        name: 'Estación del Siglo',
        city: 'Río Grande',
        frequency: '105.3 FM',
        logoUrl: 'https://estaciondelsiglo.net/wp-content/uploads/2020/01/cropped-logo-estacion-del-siglo.png',
        streamUrl: 'http://streamall.alsolnet.com/estaciondelsigloaudio'
    },
    {
        name: 'Aire Libre FM',
        city: 'Río Grande',
        frequency: '96.3 FM',
        logoUrl: 'https://www.airelibre.com.ar/wp-content/uploads/2021/04/logo-airelibre.png',
        streamUrl: 'https://cdn.instream.audio:9037/stream'
    },
    {
        name: "FM Master's",
        city: 'Ushuaia',
        frequency: '102.7 FM',
        logoUrl: 'https://www.radiomasters.com.ar/logo.png',
        streamUrl: 'https://streamingradiolinks.xyz/8130'
    },
    {
        name: 'La 97 Radio Fueguina',
        city: 'Río Grande',
        frequency: '96.9 FM',
        logoUrl: 'https://www.radiofueguina.com/wp-content/uploads/2020/08/logo-radio-fueguina-97.png',
        streamUrl: 'https://streamlky.alsolnet.com/radiofueguina'
    },
    {
        name: 'Radio Nacional Ushuaia (LRA 10)',
        city: 'Ushuaia',
        frequency: 'AM 780',
        logoUrl: 'https://www.radionacional.com.ar/wp-content/uploads/2020/03/LOGO-LRA10-USHUAIA-E-ISLAS-MALVINAS.png',
        streamUrl: 'https://sa.mp3.icecast.magma.edge-access.net/sc_rad10'
    },
    {
        name: 'Radio Nacional Río Grande (LRA 24)',
        city: 'Río Grande',
        frequency: 'AM 640',
        logoUrl: 'https://www.radionacional.com.ar/wp-content/uploads/2020/03/LOGO-LRA24-RIO-GRANDE.png',
        streamUrl: 'https://sa.mp3.icecast.magma.edge-access.net/sc_rad24'
    },
    {
        name: 'Radio Argentina Ushuaia',
        city: 'Ushuaia',
        frequency: '97.9 FM',
        logoUrl: 'https://www.radioargentinaushuaia.com/wp-content/uploads/2020/radio-argentina-ushuaia-logo.png',
        streamUrl: 'https://proxy.turadioinfo.com/6334;live'
    },
    {
        name: 'FM Espectáculo',
        city: 'Ushuaia',
        frequency: '93.1 FM',
        logoUrl: 'https://fmespectaculo.com/logo.png',
        streamUrl: 'https://emisorasdigitales2.com:8058/stream'
    },
    {
        name: 'Infinito 911',
        city: 'Ushuaia',
        frequency: '91.1 FM',
        logoUrl: '',
        streamUrl: 'https://stream.radioinfo.ar/5752/stream/'
    },
    {
        name: 'Cadena FM',
        city: 'Tierra del Fuego',
        frequency: 'Online',
        logoUrl: '',
        streamUrl: 'https://playerservices.streamtheworld.com/api/livestream-redirect/RADIO3.mp3?dist=onlineradiobox'
    },
    {
        name: 'Stylo FM',
        city: 'Río Grande',
        frequency: '101.1 FM',
        logoUrl: '',
        streamUrl: 'https://cdn.instream.audio:9272/stream'
    },
    {
        name: 'FM Ushuaia',
        city: 'Ushuaia',
        frequency: '103.3 FM',
        logoUrl: '',
        streamUrl: 'https://stream.tustreaming.cl/8030/stream'
    },
    {
        name: 'Radio FM Centro',
        city: 'Ushuaia',
        frequency: '100.7 FM',
        logoUrl: 'https://www.radiofmcentro.com/logo.png',
        streamUrl: 'https://stream.tustreaming.cl/9037/stream'
    },
    {
        name: 'La Tecno FM',
        city: 'Río Grande',
        frequency: '95.9 FM',
        logoUrl: '',
        streamUrl: 'https://stream.radioinfo.ar/latecno'
    },
    {
        name: 'Radio Pública Fueguina',
        city: 'Tierra del Fuego',
        frequency: 'Online',
        logoUrl: '',
        streamUrl: 'https://www.youtube.com/@radiopublicafueguina'
    }
];

export const LIVE_CAMERAS: LiveCamera[] = [
    {
        location: 'Plaza Islas Malvinas',
        embedUrl: 'https://www.youtube.com/live/aweQQwQgvdE?si=lefLZGtJfgyrq44y',
    },
    {
        location: 'Río Grande',
        embedUrl: 'https://www.youtube.com/live/dSOWER6MtKo?si=nBBDlcacAcNjGeze',
    },
    {
        location: 'Tolhuin',
        embedUrl: 'https://www.youtube.com/live/BZCkK1pRO3k?si=rfVPMR-TyVDoCRxp',
    },
    {
        location: 'Tren del Fin del Mundo',
        embedUrl: 'https://www.skylinewebcams.com/es/player/2218-tren-del-fin-del-mundo.html',
    },
    {
        location: 'Centro de Ushuaia',
        embedUrl: 'https://www.skylinewebcams.com/es/player/1722-ushuaia.html',
    },
];

export const LIVE_STREAM_CHANNELS: LiveStreamChannel[] = [
    // PROVINCIAL (Tierra del Fuego)
    {
        id: '93-uno-tv',
        name: '93 UNO Ushuaia',
        division: 'provincial',
        cityOrCountry: 'Ushuaia, TDF',
        streamUrl: 'https://www.youtube.com/live/DarizlkL2vI?si=6iId3lEz44CuB9vR',
        type: 'youtube',
        description: 'Streaming en vivo 93 UNO Ushuaia',
        isLive: true,
    },
    {
        id: 'tv-publica-fueguina-ushuaia',
        name: 'TV Pública Fueguina (Canal 11)',
        division: 'provincial',
        cityOrCountry: 'Tierra del Fuego',
        streamUrl: 'https://nd106.republicaservers.com/c8094.html',
        type: 'iframe',
        description: 'Televisión Pública de Tierra del Fuego - Transmisión en Vivo',
        isLive: true,
    },
    {
        id: 'aire-libre-tv',
        name: 'Aire Libre TV (Río Grande)',
        division: 'provincial',
        cityOrCountry: 'Río Grande, TDF',
        streamUrl: 'https://www.youtube.com/live/TOWKuu_OTzU?si=d96VtkWki9Qpn9HA',
        type: 'youtube',
        description: 'Streaming en vivo Aire Libre FM 96.3 Río Grande',
        isLive: true,
    },
    {
        id: 'radio-centro-ushuaia-tv',
        name: 'Radio Centro Ushuaia',
        division: 'provincial',
        cityOrCountry: 'Ushuaia, TDF',
        streamUrl: 'https://www.youtube.com/live/62yCcI9ILYA?si=YjHleeHcbkvYYJFX',
        type: 'youtube',
        description: 'Streaming en vivo Radio Centro Ushuaia',
        isLive: true,
    },
    {
        id: 'camara-malvinas-ushuaia',
        name: 'Cámara Plaza Islas Malvinas',
        division: 'provincial',
        cityOrCountry: 'Ushuaia, TDF',
        streamUrl: 'https://www.youtube.com/live/aweQQwQgvdE?si=lefLZGtJfgyrq44y',
        type: 'youtube',
        description: 'Vista panorámica en tiempo real de la Plaza Islas Malvinas',
        isLive: true,
    },
    {
        id: 'camara-rio-grande',
        name: 'Cámara en Vivo Río Grande',
        division: 'provincial',
        cityOrCountry: 'Río Grande, TDF',
        streamUrl: 'https://www.youtube.com/live/dSOWER6MtKo?si=nBBDlacAcNjGeze',
        type: 'youtube',
        description: 'Vista panorámica en tiempo real de Río Grande',
        isLive: true,
    },
    {
        id: 'camara-tolhuin',
        name: 'Cámara en Vivo Tolhuin',
        division: 'provincial',
        cityOrCountry: 'Tolhuin, TDF',
        streamUrl: 'https://www.youtube.com/live/BZCkK1pRO3k?si=rfVPMR-TyVDoCRxp',
        type: 'youtube',
        description: 'Vista panorámica en tiempo real de Tolhuin',
        isLive: true,
    },

    // NACIONAL (Argentina)
    {
        id: 'tn-envivo',
        name: 'TN - Todo Noticias',
        division: 'nacional',
        cityOrCountry: 'Buenos Aires, Argentina',
        streamUrl: 'https://www.youtube.com/embed/cb12KmMMDJA',
        type: 'youtube',
        description: 'Noticias de Argentina y el mundo en vivo 24 horas',
        isLive: true,
    },
    {
        id: 'c5n-envivo',
        name: 'C5N - En Vivo',
        division: 'nacional',
        cityOrCountry: 'Buenos Aires, Argentina',
        streamUrl: 'https://www.youtube.com/live/j6oh4Kqz3UM?si=3UhM7mSEFl3THePL',
        type: 'youtube',
        description: 'Noticias y actualidad argentina las 24 horas',
        isLive: true,
    },
    {
        id: 'lnplus-envivo',
        name: 'LN+ (La Nación Mas)',
        division: 'nacional',
        cityOrCountry: 'Buenos Aires, Argentina',
        streamUrl: 'https://www.youtube.com/live/FEWZjXJ7M0c?si=GaHdGy1WeBsHIaeP',
        type: 'youtube',
        description: 'Canal de noticias de La Nación en vivo',
        isLive: true,
    },
    {
        id: 'tvpublica-arg',
        name: 'Televisión Pública Argentina',
        division: 'nacional',
        cityOrCountry: 'Argentina',
        streamUrl: 'https://www.youtube.com/live/zOCZ8Bj5nJ4?si=IIZOgTyIaXl31NGt',
        type: 'youtube',
        description: 'Cadena nacional pública de televisión en vivo',
        isLive: true,
    },
    {
        id: 'cronica-tv',
        name: 'Crónica HD',
        division: 'nacional',
        cityOrCountry: 'Buenos Aires, Argentina',
        streamUrl: 'https://www.youtube.com/live/hw4uHyct4vg?si=bxqSuEBAx4s3_KVf',
        type: 'youtube',
        description: 'Transmisión en vivo de Crónica Televisión',
        isLive: true,
    },

    // INTERNACIONAL
    {
        id: 'dw-espanol',
        name: 'DW Español',
        division: 'internacional',
        cityOrCountry: 'Alemania / Internacional',
        streamUrl: 'https://www.youtube.com/live/yZh3xsFqCt8?si=WW5YDlEyvjxgkxcI',
        type: 'youtube',
        description: 'Deutsche Welle noticias en español en vivo',
        isLive: true,
    },
    {
        id: 'france24-espanol',
        name: 'France 24 Español',
        division: 'internacional',
        cityOrCountry: 'Francia / Internacional',
        streamUrl: 'https://www.youtube.com/live/zTv0hCakAhg?si=SpTJLywmU4uv-P8v',
        type: 'youtube',
        description: 'Información internacional las 24 horas',
        isLive: true,
    },
    {
        id: 'euronews-espanol',
        name: 'Euronews Español',
        division: 'internacional',
        cityOrCountry: 'Europa / Internacional',
        streamUrl: 'https://www.youtube.com/live/O9mOtdZ-nSk?si=geAqpRrG5B55AjK2',
        type: 'youtube',
        description: 'Perspectivas europeas e internacionales en vivo',
        isLive: true,
    },
];

