import { NewsCategory, PrintEditionSource, NewsSource, RadioStation, LiveCamera } from './types';

export const PRINT_EDITION_SOURCES: Record<NewsCategory, PrintEditionSource[]> = {
  [NewsCategory.INTERNATIONAL]: [
    { name: 'El País (España)', logoUrl: 'https://img.kiosko.net/{{DATE}}/es/elpais.750.jpg', url: 'https://elpais.com/' },
    { name: 'El Mundo (España)', logoUrl: 'https://img.kiosko.net/{{DATE}}/es/elmundo.750.jpg', url: 'https://www.elmundo.es/' },
    { name: 'La Vanguardia (España)', logoUrl: 'https://img.kiosko.net/{{DATE}}/es/lavanguardia.750.jpg', url: 'https://www.lavanguardia.com/' },
    { name: 'La Razón (España)', logoUrl: 'https://img.kiosko.net/{{DATE}}/es/larazon.750.jpg', url: 'https://www.larazon.es/' },
    { name: 'ABC (España)', logoUrl: 'https://img.kiosko.net/{{DATE}}/es/abc.750.jpg', url: 'https://www.abc.es/' },
    { name: 'El Mercurio (Chile)', logoUrl: 'https://img.kiosko.net/{{DATE}}/cl/cl_mercurio.750.jpg', url: 'https://www.emol.com/' },
    { name: 'El País (Uruguay)', logoUrl: 'https://img.kiosko.net/{{DATE}}/uy/uy_elpais.750.jpg', url: 'https://www.elpais.com.uy/' },
    { name: 'La Nación (Paraguay)', logoUrl: 'https://img.kiosko.net/{{DATE}}/py/nacion.750.jpg', url: 'https://www.lanacion.com.py/' },
    { name: 'El Potosí (Bolivia)', logoUrl: 'https://img.kiosko.net/{{DATE}}/bo/potosi.750.jpg', url: 'https://elpotosi.net/' },
    { name: 'O Globo (Brasil)', logoUrl: 'https://img.kiosko.net/{{DATE}}/br/br_oglobo.750.jpg', url: 'https://oglobo.globo.com/' },
    { name: 'El Tiempo (Colombia)', logoUrl: 'https://img.kiosko.net/{{DATE}}/co/co_eltiempo.750.jpg', url: 'https://www.eltiempo.com/' },
    { name: 'Reforma (México)', logoUrl: 'https://img.kiosko.net/{{DATE}}/mx/reforma.750.jpg', url: 'https://www.reforma.com/' },
    { name: 'The New York Times (EE.UU.)', logoUrl: 'https://img.kiosko.net/{{DATE}}/us/nytimes.750.jpg', url: 'https://www.nytimes.com/' },
    { name: 'The Wall Street Journal (EE.UU.)', logoUrl: 'https://img.kiosko.net/{{DATE}}/us/wsj.750.jpg', url: 'https://www.wsj.com/' },
    { name: 'The Guardian (Reino Unido)', logoUrl: 'https://img.kiosko.net/{{DATE}}/uk/guardian.750.jpg', url: 'https://www.theguardian.com/' },
    { name: 'Le Monde (Francia)', logoUrl: 'https://img.kiosko.net/{{DATE}}/fr/lemonde.750.jpg', url: 'https://www.lemonde.fr/' },
    { name: 'Corriere della Sera (Italia)', logoUrl: 'https://img.kiosko.net/{{DATE}}/it/corriere.750.jpg', url: 'https://www.corriere.it/' },
  ],
  [NewsCategory.NATIONAL]: [
    { name: 'Clarín', logoUrl: 'https://img.kiosko.net/{{DATE}}/ar/ar_clarin.750.jpg', url: 'https://www.clarin.com/' },
    { name: 'La Nación', logoUrl: 'https://img.kiosko.net/{{DATE}}/ar/ar_nacion.750.jpg', url: 'https://www.lanacion.com.ar/' },
    { name: 'Página 12', logoUrl: 'https://img.kiosko.net/{{DATE}}/ar/pagina12.750.jpg', url: 'https://www.pagina12.com.ar/' },
    { name: 'Perfil', logoUrl: 'https://img.kiosko.net/{{DATE}}/ar/perfil.750.jpg', url: 'https://www.perfil.com/' },
    { name: 'Ámbito Financiero', logoUrl: 'https://img.kiosko.net/{{DATE}}/ar/ar_ambito.750.jpg', url: 'https://www.ambito.com/' },
    { name: 'El Cronista', logoUrl: 'https://img.kiosko.net/{{DATE}}/ar/ar_cronista.750.jpg', url: 'https://www.cronista.com/' },
    { name: 'Crónica', logoUrl: 'https://img.kiosko.net/{{DATE}}/ar/cronica.750.jpg', url: 'https://www.cronica.com.ar/' },
    { name: 'Diario Popular', logoUrl: 'https://img.kiosko.net/{{DATE}}/ar/popular.750.jpg', url: 'https://www.diariopopular.com.ar/' },
    { name: 'Bae Negocios', logoUrl: 'https://img.kiosko.net/{{DATE}}/ar/bae_negocios.750.jpg', url: 'https://www.baenegocios.com/' },
    { name: 'La Voz (Córdoba)', logoUrl: 'https://img.kiosko.net/{{DATE}}/ar/lavoz_del_interior.750.jpg', url: 'https://www.lavoz.com.ar/' },
    { name: 'Los Andes (Mendoza)', logoUrl: 'https://img.kiosko.net/{{DATE}}/ar/los_andes.750.jpg', url: 'https://www.losandes.com.ar/' },
    { name: 'La Gaceta (Tucumán)', logoUrl: 'https://img.kiosko.net/{{DATE}}/ar/gaceta_tucuman.750.jpg', url: 'https://www.lagaceta.com.ar/' },
    { name: 'El Día (La Plata)', logoUrl: 'https://img.kiosko.net/{{DATE}}/ar/dia_la_plata.750.jpg', url: 'https://www.eldia.com/' },
  ],
  [NewsCategory.SPORTS]: [
    { name: 'Olé (Argentina)', logoUrl: 'https://img.kiosko.net/{{DATE}}/ar/ole.750.jpg', url: 'https://www.ole.com.ar/' },
    { name: 'Marca (España)', logoUrl: 'https://img.kiosko.net/{{DATE}}/es/marca.750.jpg', url: 'https://www.marca.com/' },
    { name: 'AS (España)', logoUrl: 'https://img.kiosko.net/{{DATE}}/es/as.750.jpg', url: 'https://as.com/' },
    { name: 'Mundo Deportivo (España)', logoUrl: 'https://img.kiosko.net/{{DATE}}/es/mundo_deportivo.750.jpg', url: 'https://www.mundodeportivo.com/' },
    { name: 'Sport (España)', logoUrl: 'https://img.kiosko.net/{{DATE}}/es/sport.750.jpg', url: 'https://www.sport.es/' },
  ],
  [NewsCategory.PROVINCIAL]: [
    { name: 'Tiempo Fueguino', logoUrl: 'https://www.tiempofueguino.com/wp-content/uploads/2020/09/LOGO-TF-220-X-150.png', url: 'https://www.tiempofueguino.com/portadas/' },
    { name: 'Diario Prensa', logoUrl: 'https://www.diarioprensa.com.ar/wp-content/uploads/2021/11/logo_prensa_web_2.png', url: 'https://www.diarioprensa.com.ar/category/en-papel/' },
    { name: 'El Diario del Fin del Mundo', logoUrl: 'https://www.eldiariodelfindelmundo.com/wp-content/uploads/2020/12/logo-el-diario-del-fin-del-mundo-2.png', url: 'https://www.eldiariodelfindelmundo.com/ediciones/' },
    { name: 'Provincia 23', logoUrl: 'https://www.provincia23.com.ar/wp-content/uploads/2021/04/logo_provincia_23.png', url: 'https://www.provincia23.com.ar/diario-papel/' },
    { name: 'El Sureño', logoUrl: 'https://www.surenio.com.ar/wp-content/uploads/2020/09/logosurenio.png', url: 'https://www.surenio.com.ar/categorias/tapa/' },
  ],
};

export const NEWS_SITES: Record<NewsCategory, NewsSource[]> = {
  [NewsCategory.INTERNATIONAL]: [
    { name: 'BBC News', url: 'https://www.bbc.com/news', logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/62/BBC_News_2022.svg/2560px-BBC_News_2022.svg.png', rssUrl: 'http://feeds.bbci.co.uk/news/world/rss.xml' },
    { name: 'Al Jazeera', url: 'https://www.aljazeera.com/', logo: 'https://upload.wikimedia.org/wikipedia/en/thumb/f/f2/Aljazeera_eng.svg/1200px-Aljazeera_eng.svg.png', rssUrl: 'https://www.aljazeera.com/xml/rss/all.xml' },
    { name: 'La Opinión', url: 'https://laopinion.com/', logo: 'https://pbs.twimg.com/profile_images/1131920875323555840/7-_m2s_4_400x400.png', rssUrl: 'https://laopinion.com/feed/' },
    { name: 'El Diario NY', url: 'https://www.eldiariony.com/', logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a2/El_Diario_La_Prensa_logo.svg/1200px-El_Diario_La_Prensa_logo.svg.png', rssUrl: 'https://eldiariony.com/feed/' },
    { name: 'The New York Times (Español)', url: 'https://www.nytimes.com/es/', logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/77/The_New_York_Times_logo.png/640px-The_New_York_Times_logo.png', rssUrl: 'https://www.nytimes.com/es/rss.xml' },
    { name: 'El Planeta (Boston)', url: 'https://elplaneta.com/', logo: 'https://elplaneta.com/wp-content/uploads/2022/03/logo-elplaneta.png', rssUrl: 'https://elplaneta.com/feed/' },
    { name: 'El Mundo (Las Vegas)', url: 'https://elmundonv.com/', logo: 'https://elmundonv.com/wp-content/uploads/2021/04/el-mundo-logo.png', rssUrl: 'https://elmundonv.com/feed/' },
    { name: 'La Tribuna Hispana USA', url: 'https://latribunanj.com/', logo: 'https://latribunanj.com/wp-content/uploads/2021/02/LOGO-LT-USA-1-e1613275727986.png', rssUrl: 'https://latribunanj.com/feed/' },
  ],
  [NewsCategory.NATIONAL]: [
    { name: 'Clarín', url: 'https://www.clarin.com/', logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/18/Clarin_logo_2020.svg/1200px-Clarin_logo_2020.svg.png', rssUrl: 'https://www.clarin.com/rss/lo-ultimo/' },
    { name: 'La Nación', url: 'https://www.lanacion.com.ar/', logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d5/La_Nacion_logo_2020.svg/2560px-La_Nacion_logo_2020.svg.png', rssUrl: 'https://www.lanacion.com.ar/arc/outboundfeeds/rss/?outputType=xml' },
    { name: 'Página 12', url: 'https://www.pagina12.com.ar/', logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b3/P%C3%A1gina_12_logo.svg/1200px-P%C3%A1gina_12_logo.svg.png', rssUrl: 'https://www.pagina12.com.ar/rss/portada' },
    { name: 'La Prensa', url: 'https://www.laprensa.com.ar/', logo: 'https://upload.wikimedia.org/wikipedia/commons/3/3f/Diario_La_Prensa_de_Argentina.png', rssUrl: 'https://www.laprensa.com.ar/rss/home.xml' },
    { name: 'Crónica', url: 'https://www.cronica.com.ar/', logo: 'https://www.cronica.com.ar/__export/1645362590113/sites/diariocronica/arte/apps/logo-cronica-2022.svg', rssUrl: 'https://www.cronica.com.ar/rss/' },
    { name: 'Diario Popular', url: 'https://www.diariopopular.com.ar/', logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b1/Diario_Popular_logo.svg/1200px-Diario_Popular_logo.svg.png', rssUrl: 'https://www.diariopopular.com.ar/rss' },
    { name: 'BAE Negocios', url: 'https://www.baenegocios.com/', logo: 'https://www.baenegocios.com/images/logo-bae.svg', rssUrl: 'https://www.baenegocios.com/rss' },
    { name: 'Todo Noticias (TN)', url: 'https://tn.com.ar/', logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d3/Todo_Noticias_logo_2016.svg/1280px-Todo_Noticias_logo_2016.svg.png', rssUrl: 'https://tn.com.ar/rss.xml' },
    { name: 'Ámbito Financiero', url: 'https://www.ambito.com/', logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a2/Ambito_Financiero_logo_2014.svg/2560px-Ambito_Financiero_logo_2014.svg.png', rssUrl: 'https://www.ambito.com/rss/home.xml' },
    { name: 'Perfil', url: 'https://www.perfil.com/', logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/90/Perfil_logo.svg/1200px-Perfil_logo.svg.png', rssUrl: 'https://www.perfil.com/rss' },
    { name: 'La Voz del Interior', url: 'https://www.lavoz.com.ar/', logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/40/La_Voz_del_Interior_logo_2018.svg/1200px-La_Voz_del_Interior_logo_2018.svg.png', rssUrl: 'https://www.lavoz.com.ar/rss/' },
    { name: 'La Capital (Rosario)', url: 'https://www.lacapital.com.ar/', logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/91/La_Capital_logo.svg/2560px-La_Capital_logo.svg.png', rssUrl: 'https://www.lacapital.com.ar/rss/home.xml' },
    { name: 'Los Andes', url: 'https://www.losandes.com.ar/', logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/0b/Diario_Los_Andes.svg/1200px-Diario_Los_Andes.svg.png', rssUrl: 'https://www.losandes.com.ar/rss/' },
    { name: 'Diario Uno (Mendoza)', url: 'https://www.diariouno.com.ar/', logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4b/Diario_UNO_logo_2019.svg/1200px-Diario_UNO_logo_2019.svg.png', rssUrl: 'https://www.diariouno.com.ar/rss' },
    { name: 'La Gaceta', url: 'https://www.lagaceta.com.ar/', logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c1/La_Gaceta_logo.svg/1200px-La_Gaceta_logo.svg.png', rssUrl: 'https://www.lagaceta.com.ar/rss' },
    { name: 'El Día (La Plata)', url: 'https://www.eldia.com/', logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/ca/El_D%C3%ADa_logo.svg/1200px-El_D%C3%ADa_logo.svg.png', rssUrl: 'https://www.eldia.com/rss/' },
    { name: 'La Capital (Mar del Plata)', url: 'https://www.lacapitalmdp.com/', logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e5/La_Capital_de_Mar_del_Plata.svg/1200px-La_Capital_de_Mar_del_Plata.svg.png', rssUrl: 'https://www.lacapitalmdp.com/feed/' },
  ],
  [NewsCategory.SPORTS]: [
    { name: 'Olé', url: 'https://www.ole.com.ar/', logo: 'https://pbs.twimg.com/profile_images/1131920875323555840/7-_m2s_4_400x400.png', rssUrl: 'https://www.ole.com.ar/rss/ultimas-noticias/' },
    { name: 'TyC Sports', url: 'https://www.tycsports.com/', logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/35/TyC_Sports_logo.svg/2560px-TyC_Sports_logo.svg.png', rssUrl: 'https://www.tycsports.com/rss.xml' },
  ],
  [NewsCategory.PROVINCIAL]: [
    { name: 'Ushuaia Noticias', url: 'https://ushuaianoticias.com/', logo: 'https://ushuaianoticias.com/wp-content/uploads/2021/08/logo-un.png', rssUrl: 'https://ushuaianoticias.com/feed/' },
    { name: 'TDF al Día', url: 'https://tdfaldia.com.ar/', logo: 'https://tdfaldia.com.ar/wp-content/uploads/2021/08/logo-tdf-al-dia.png', rssUrl: 'https://tdfaldia.com.ar/feed/' },
    { name: 'Reporte Austral', url: 'https://reporteaustral.com.ar/', logo: 'https://reporteaustral.com.ar/wp-content/uploads/2021/10/LOGO-WEB-RA.png', rssUrl: 'https://reporteaustral.com.ar/feed/' },
    { name: 'Crítica Sur', url: 'https://criticasur.com.ar/', logo: 'https://criticasur.com.ar/wp-content/uploads/2022/10/logo-critica-sur-2022.png', rssUrl: 'https://criticasur.com.ar/feed/' },
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
    name: 'Radio UNTDF',
    city: 'Ushuaia',
    frequency: '93.5 FM',
    logoUrl: 'https://www.untdf.edu.ar/gestion/medios/radio/assets/img/logo-radio-header.png',
    streamUrl: 'http://sonido.untdf.edu.ar:8000/radioenvivo'
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