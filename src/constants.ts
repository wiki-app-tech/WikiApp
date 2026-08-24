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
        name: 'Radio Nacional Ushuaia',
        city: 'Ushuaia',
        frequency: 'AM 780',
        logoUrl: 'https://www.radionacional.com.ar/wp-content/uploads/2020/03/LOGO-LRA10-USHUAIA-E-ISLAS-MALVINAS.png',
        streamUrl: 'https://sa.mp3.icecast.magma.edge-access.net/sc_rad10'
    },
    {
        name: 'Radio Argentina Ushuaia',
        city: 'Ushuaia',
        frequency: '97.9 FM',
        logoUrl: 'https://www.radioargentinaushuaia.com/wp-content/uploads/2020/radio-argentina-ushuaia-logo.png',
        streamUrl: 'https://proxy.turadioinfo.com/6334;live'
    },
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
        streamUrl: 'https://v2.tustreaming.tv/8030/'
    },
    {
        name: 'La 97 Radio Fueguina',
        city: 'Río Grande',
        frequency: '96.9 FM',
        logoUrl: 'https://www.radiofueguina.com/wp-content/uploads/2020/08/logo-radio-fueguina-97.png',
        streamUrl: 'http://streamall.alsolnet.com/radiofueguina/radiofueguina.stream'
    },
    {
        name: 'Estación del Siglo',
        city: 'Río Grande',
        frequency: '105.3 FM',
        logoUrl: 'https://estaciondelsiglo.net/wp-content/uploads/2020/01/cropped-logo-estacion-del-siglo.png',
        streamUrl: 'http://streamall.alsolnet.com/estaciondelsigloaudio'
    },
];

export const LIVE_CAMERAS: LiveCamera[] = [
    {
        location: 'Plaza Islas Malvinas',
        embedUrl: 'https://www.skylinewebcams.com/es/player/1769-plaza-islas-malvinas.html',
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
        cityOrCountry: 'Ushuaia, TDF',
        streamUrl: 'https://www.youtube.com/embed/videoseries?list=PL_TVPUB_TDF',
        type: 'youtube',
        description: 'Televisión Pública de Tierra del Fuego - Canal 11 Ushuaia',
        isLive: true,
    },
    {
        id: 'tv-publica-fueguina-rg',
        name: 'TV Pública Fueguina (Canal 13)',
        division: 'provincial',
        cityOrCountry: 'Río Grande, TDF',
        streamUrl: '',
        type: 'youtube',
        description: 'Canal 13 Río Grande - Transmisión Oficial',
        isLive: false,
    },
    {
        id: 'aire-libre-tv',
        name: 'Aire Libre TV',
        division: 'provincial',
        cityOrCountry: 'Río Grande, TDF',
        streamUrl: '',
        type: 'youtube',
        description: 'Streaming en vivo Aire Libre FM 96.3',
        isLive: false,
    },
    {
        id: 'radio-fueguina-tv',
        name: 'Radio Fueguina Streaming',
        division: 'provincial',
        cityOrCountry: 'Río Grande, TDF',
        streamUrl: '',
        type: 'youtube',
        description: 'Señal en vivo de La 97 Radio Fueguina',
        isLive: false,
    },
    {
        id: 'camara-malvinas-ushuaia',
        name: 'Cámara Plaza Islas Malvinas',
        division: 'provincial',
        cityOrCountry: 'Ushuaia, TDF',
        streamUrl: 'https://www.skylinewebcams.com/es/player/1769-plaza-islas-malvinas.html',
        type: 'iframe',
        description: 'Vista panorámica en tiempo real de la Plaza Islas Malvinas',
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
        streamUrl: 'https://www.youtube.com/embed/live_stream?channel=UCFgk2Q2mNloj6_V4iyxHQ9w',
        type: 'youtube',
        description: 'Noticias y actualidad argentina las 24 horas',
        isLive: true,
    },
    {
        id: 'lnplus-envivo',
        name: 'LN+ (La Nación Mas)',
        division: 'nacional',
        cityOrCountry: 'Buenos Aires, Argentina',
        streamUrl: 'https://www.youtube.com/embed/live_stream?channel=UCx8321vN2_w999a-X_9w12Q',
        type: 'youtube',
        description: 'Canal de noticias de La Nación',
        isLive: true,
    },
    {
        id: 'tvpublica-arg',
        name: 'Televisión Pública Argentina',
        division: 'nacional',
        cityOrCountry: 'Argentina',
        streamUrl: 'https://www.youtube.com/embed/live_stream?channel=UCx8321vN2_w999a-X_9w12Q',
        type: 'youtube',
        description: 'Cadena nacional pública de televisión',
        isLive: true,
    },
    {
        id: 'cronica-tv',
        name: 'Crónica HD',
        division: 'nacional',
        cityOrCountry: 'Buenos Aires, Argentina',
        streamUrl: 'https://www.youtube.com/embed/live_stream?channel=UC7k_M9pM47J89M40-Q7-h8Q',
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
        streamUrl: 'https://www.youtube.com/embed/v9XN3V4n2X4',
        type: 'youtube',
        description: 'Deutsche Welle noticias en español en vivo',
        isLive: true,
    },
    {
        id: 'france24-espanol',
        name: 'France 24 Español',
        division: 'internacional',
        cityOrCountry: 'Francia / Internacional',
        streamUrl: 'https://www.youtube.com/embed/live_stream?channel=UC4OKmag40Tq804G5-aO__Fw',
        type: 'youtube',
        description: 'Información internacional las 24 horas',
        isLive: true,
    },
    {
        id: 'rt-espanol',
        name: 'RT en Español',
        division: 'internacional',
        cityOrCountry: 'Internacional',
        streamUrl: '',
        type: 'youtube',
        description: 'Cadena internacional de noticias en español',
        isLive: false,
    },
    {
        id: 'euronews-espanol',
        name: 'Euronews Español',
        division: 'internacional',
        cityOrCountry: 'Europa / Internacional',
        streamUrl: 'https://www.youtube.com/embed/live_stream?channel=UC2_ZqP-O9j79j9V0',
        type: 'youtube',
        description: 'Perspectivas europeas e internacionales en vivo',
        isLive: true,
    },
];

