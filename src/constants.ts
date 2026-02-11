import { NewsCategory, PrintEditionSource, NewsSource, RadioStation, LiveCamera } from './types';

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
    ],
};

export const RADIO_STATIONS: RadioStation[] = [
    {
        name: 'Radio Nacional',
        city: 'Ushuaia',
        frequency: 'AM 780',
        logoUrl: 'https://www.radionacional.com.ar/wp-content/uploads/2020/03/LOGO-LRA10-USHUAIA-E-ISLAS-MALVINAS.png',
        streamUrl: 'http://190.111.245.221:8000/stream'
    },
    {
        name: 'FM Fuego',
        city: 'Río Grande',
        frequency: '90.1 FM',
        logoUrl: 'https://static.mytuner.mobi/media/tvos_radios/256/m4af5hsyv65k.png',
        streamUrl: 'https://v2.tustreaming.tv/8030/'
    },
    {
        name: 'Estación del Siglo',
        city: 'Río Grande',
        frequency: '105.3 FM',
        logoUrl: 'https://www.estaciondelsiglo.com.ar/wp-content/uploads/2020/03/logoestaciondelsiglo-1.png',
        streamUrl: 'http://190.107.189.131:8100/stream'
    },
    {
        name: 'Radio Provincia',
        city: 'Ushuaia',
        frequency: '99.5 FM',
        logoUrl: 'https://www.tierradelfuego.gob.ar/wp-content/uploads/2023/03/logo-99-5-1.png',
        streamUrl: 'http://200.58.105.132:8000/ushuaia2'
    }
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
