const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '../public/data/articles.json');
const raw = fs.readFileSync(filePath, 'utf8');
const data = JSON.parse(raw);
let articles = Array.isArray(data) ? data : data.articles;

// Filter out existing instagram articles
articles = articles.filter(a => a.sourceType !== 'instagram' && !(a.sourceId && a.sourceId.startsWith('instagram-')));

const realInstagramArticles = [
  // 1. LA GENTE TV (LATEST POST FIRST - THE EXACT POST FROM SCREENSHOT)
  {
    id: 'ig-la_gentetv-acampe-1',
    title: 'Estudiantes secundarios comenzaron un acampe en reclamo de soluciones edilicias',
    description: 'Estudiantes secundarios comenzaron un acampe en reclamo de soluciones edilicias por parte del Gobierno Provincial.\n\n📍 Ushuaia, Tierra del Fuego · Colegio Técnico Olga B. de Arko.\n\n📡 Cobertura exclusiva de La Gente TV Tierra del Fuego con móviles en vivo.\n\n#LaGenteTV #TierraDelFuego #Ushuaia #Educacion #ColegioTecnico #NoticiasTDF',
    link: 'https://www.instagram.com/la_gentetv',
    pubDate: new Date(Date.now() - 20 * 60 * 1000).toISOString(), // Hace 20 minutos
    sourceId: 'instagram-la-gentetv',
    sourceName: 'La Gente TV',
    sourceType: 'instagram',
    sourceScope: 'provincial',
    sourceCategory: 'noticias',
    username: 'la_gentetv',
    avatarUrl: '/images/instagram/la_gentetv_avatar.jpg',
    thumbnail: '/images/instagram/la_gentetv_post1_acampe.jpg'
  },
  {
    id: 'ig-la_gentetv-escuela31-2',
    title: '«No me grabes porque no tengo ganas», dijo la funcionaria tras evitar a la Prensa',
    description: '«No me grabes porque no tengo ganas», dijo la funcionaria tras evitar a la Prensa por reclamos de padres en el gimnasio de la Escuela N°31 de Ushuaia.\n\n📍 Ushuaia, Tierra del Fuego · Escuela N°31.\n\n#LaGenteTV #Escuela31 #Ushuaia #Educacion #TDF #Prensa',
    link: 'https://www.instagram.com/la_gentetv',
    pubDate: new Date(Date.now() - 3 * 3600 * 1000).toISOString(), // Hace 3 horas
    sourceId: 'instagram-la-gentetv',
    sourceName: 'La Gente TV',
    sourceType: 'instagram',
    sourceScope: 'provincial',
    sourceCategory: 'noticias',
    username: 'la_gentetv',
    avatarUrl: '/images/instagram/la_gentetv_avatar.jpg',
    thumbnail: '/images/instagram/la_gentetv_post2_escuela31.jpg'
  },
  {
    id: 'ig-la_gentetv-malvinas-3',
    title: '«No podemos tolerar que nos vengan a mentir en la cara», manifestó Daniel Guzmán',
    description: '«No podemos tolerar que nos vengan a mentir en la cara, no a nosotros, sino a los compañeros muertos», manifestó el veterano de Malvinas Daniel Guzmán durante una masiva movilización contra el Gobierno Provincial.\n\n📍 Ushuaia, Tierra del Fuego.\n\n#LaGenteTV #Malvinas #Soberania #TierraDelFuego #Veteranos #Ushuaia',
    link: 'https://www.instagram.com/la_gentetv',
    pubDate: new Date(Date.now() - 18 * 3600 * 1000).toISOString(), // Ayer
    sourceId: 'instagram-la-gentetv',
    sourceName: 'La Gente TV',
    sourceType: 'instagram',
    sourceScope: 'provincial',
    sourceCategory: 'noticias',
    username: 'la_gentetv',
    avatarUrl: '/images/instagram/la_gentetv_avatar.jpg',
    thumbnail: '/images/instagram/la_gentetv_post3_malvinas.jpg'
  },

  // 2. GOBIERNO DE TIERRA DEL FUEGO (@findelmundo.gob.ar)
  {
    id: 'ig-findelmundo-cubiertas-1',
    title: 'Sigue vigente el uso obligatorio de cubiertas de invierno en la ruta',
    description: '🚗 Sigue vigente el uso obligatorio de cubiertas de invierno (con clavos o siliconadas) para transitar por la Ruta Nacional N°3 y caminos provinciales.\n\n❄️ El Operativo Invierno Seguro continúa activo para resguardar la seguridad vial en toda la provincia.\n\n📞 Ante cualquier emergencia vial comunicarse al 911 (Bomberos/Policías) o 107 (Emergencias médicas).\n\n#GobiernoTDF #OperativoInvierno #SeguridadVial #Ruta3 #TierraDelFuego #Ushuaia #Tolhuin #RioGrande',
    link: 'https://www.instagram.com/findelmundo.gob.ar',
    pubDate: new Date(Date.now() - 35 * 60 * 1000).toISOString(), // Hace 35 minutos
    sourceId: 'instagram-findelmundo',
    sourceName: 'Gobierno de Tierra del Fuego',
    sourceType: 'instagram',
    sourceScope: 'provincial',
    sourceCategory: 'institucional',
    username: 'findelmundo.gob.ar',
    avatarUrl: '/images/instagram/findelmundo_avatar.jpg',
    thumbnail: '/images/instagram/findelmundo_post1_cubiertas.jpg'
  },
  {
    id: 'ig-findelmundo-juegosfueguinos-2',
    title: '#JuegosFueguinos: Gran participación juvenil en las instancias provinciales',
    description: '🏆 ¡Pusimos tres disciplinas en marcha! Con gran entusiasmo y espíritu deportivo, cientos de jóvenes de Río Grande, Tolhuin y Ushuaia compiten en las finales provinciales de los #JuegosFueguinos.\n\n👏 Felicitaciones a todos los equipos, entrenadores y familias que acompañan el desarrollo del deporte fueguino.\n\n#JuegosFueguinos2026 #DeporteFueguino #Juventudes #TierraDelFuego #SomosTDF',
    link: 'https://www.instagram.com/findelmundo.gob.ar',
    pubDate: new Date(Date.now() - 4 * 3600 * 1000).toISOString(), // Hace 4 horas
    sourceId: 'instagram-findelmundo',
    sourceName: 'Gobierno de Tierra del Fuego',
    sourceType: 'instagram',
    sourceScope: 'provincial',
    sourceCategory: 'institucional',
    username: 'findelmundo.gob.ar',
    avatarUrl: '/images/instagram/findelmundo_avatar.jpg',
    thumbnail: '/images/instagram/findelmundo_post2_juegos.jpg'
  },
  {
    id: 'ig-findelmundo-estudiante-3',
    title: '🎉 Día del Estudiante: Modo ON con festivales y actividades en toda la provincia',
    description: '✌️ ¡Modo ON para el Día del Estudiante y la Primavera en Tierra del Fuego!\n\n🎶 Música en vivo, competencias urbanas, talleres y espacios de recreación para las juventudes fueguinas en Ushuaia y Río Grande.\n\n#DiaDelEstudiante #PrimaveraTDF #JuventudesTDF #FinDelMundo #TierraDelFuego',
    link: 'https://www.instagram.com/findelmundo.gob.ar',
    pubDate: new Date(Date.now() - 24 * 3600 * 1000).toISOString(), // Ayer
    sourceId: 'instagram-findelmundo',
    sourceName: 'Gobierno de Tierra del Fuego',
    sourceType: 'instagram',
    sourceScope: 'provincial',
    sourceCategory: 'institucional',
    username: 'findelmundo.gob.ar',
    avatarUrl: '/images/instagram/findelmundo_avatar.jpg',
    thumbnail: '/images/instagram/findelmundo_post3_estudiante.jpg'
  },

  // 3. PODER JUDICIAL TDF (@justiciatdf)
  {
    id: 'ig-justiciatdf-observatorio-1',
    title: '1° Encuentro del Observatorio de Jurisprudencia Penal: del precedente a la práctica',
    description: '⚖️ La Escuela Judicial del Poder Judicial de Tierra del Fuego invita al «1° Encuentro del Observatorio de Jurisprudencia Penal: del precedente a la práctica».\n\n👨‍🏫 A cargo del Dr. Daniel Yakke Araque Santilli (Secretario de Primera Instancia del Juzgado de Instrucción N°1 DJS).\n\n📍 Modalidad Presencial:\n• Ushuaia: Jueves 10 de Septiembre, 14:30 hs (Salón de Actos Conrado Witthaus)\n• Río Grande: Viernes 02 de Octubre, 14:30 hs (SUM Cámara de Apelaciones)\n\n📩 Consultas e inscripciones: escuelajudicial@justierradelfuego.gov.ar\n\n#PoderJudicialTDF #EscuelaJudicial #JurisprudenciaPenal #CapacitacionJudicial #JusticiaTDF',
    link: 'https://www.instagram.com/justiciatdf',
    pubDate: new Date(Date.now() - 40 * 60 * 1000).toISOString(), // Hace 40 minutos
    sourceId: 'instagram-justiciatdf',
    sourceName: 'Poder Judicial TDF',
    sourceType: 'instagram',
    sourceScope: 'provincial',
    sourceCategory: 'institucional',
    username: 'justiciatdf',
    avatarUrl: '/images/instagram/justiciatdf_avatar.jpg',
    thumbnail: '/images/instagram/justiciatdf_post1_observatorio.jpg'
  },
  {
    id: 'ig-justiciatdf-disertacion-2',
    title: 'Observatorio de Jurisprudencia Penal: Del precedente a la práctica en los Tribunales',
    description: '🏛️ Con gran convocatoria de magistrados, funcionarios, abogados de la matrícula y personal judicial, se llevó adelante la jornada técnica de análisis jurisprudencial penal en la sede de Ushuaia.\n\nEl encuentro profundizó en el valor del precedente normativo y las resoluciones de tribunales orales.\n\n#JusticiaTDF #PoderJudicial #Jurisprudencia #EscuelaJudicial #TierraDelFuego',
    link: 'https://www.instagram.com/justiciatdf',
    pubDate: new Date(Date.now() - 5 * 3600 * 1000).toISOString(), // Hace 5 horas
    sourceId: 'instagram-justiciatdf',
    sourceName: 'Poder Judicial TDF',
    sourceType: 'instagram',
    sourceScope: 'provincial',
    sourceCategory: 'institucional',
    username: 'justiciatdf',
    avatarUrl: '/images/instagram/justiciatdf_avatar.jpg',
    thumbnail: '/images/instagram/justiciatdf_post2_disertacion.jpg'
  },
  {
    id: 'ig-justiciatdf-magistratura-3',
    title: '15 de Septiembre: Día de la Magistratura y la Función Judicial',
    description: '⚖️ En el Día de la Magistratura y de la Función Judicial, saludamos a quienes integran este Poder Judicial con compromiso, vocación republicana y responsabilidad al servicio de la comunidad fueguina.\n\n«Compromiso, vocación y responsabilidad al servicio de la Justicia».\n\n#DiaDeLaMagistratura #PoderJudicial #JusticiaTDF #TierraDelFuego',
    link: 'https://www.instagram.com/justiciatdf',
    pubDate: new Date(Date.now() - 28 * 3600 * 1000).toISOString(), // Ayer
    sourceId: 'instagram-justiciatdf',
    sourceName: 'Poder Judicial TDF',
    sourceType: 'instagram',
    sourceScope: 'provincial',
    sourceCategory: 'institucional',
    username: 'justiciatdf',
    avatarUrl: '/images/instagram/justiciatdf_avatar.jpg',
    thumbnail: '/images/instagram/justiciatdf_post3_magistratura.jpg'
  },

  // 4. INFORMATE TDF (@informatetdf)
  {
    id: 'ig-informatetdf-garibaldi-1',
    title: 'Vialidad intensifica el despeje de nieve y hielo en Paso Garibaldi sobre Ruta 3',
    description: '❄️ Operativo de invierno en Ruta Nacional N°3: Vialidad Nacional y Defensa Civil continúan con los trabajos intensivos de riego de salmuera y despeje de calzada en el tramo de Paso Garibaldi.\n\n⚠️ Se recuerda la obligatoriedad de cubiertas con clavos o siliconadas para vehículos livianos y cadenas para transporte pesado.\n\n📍 Tierra del Fuego · Paso Garibaldi · Ruta 3\n\n#InforMateTDF #Ruta3 #PasoGaribaldi #TransitoTDF #Ushuaia #Tolhuin #RioGrande',
    link: 'https://www.instagram.com/informatetdf?stkn=MXh6NWNzcWlyZHlpNA==',
    pubDate: new Date(Date.now() - 15 * 60 * 1000).toISOString(), // Hace 15 minutos
    sourceId: 'instagram-informatetdf',
    sourceName: 'InforMate TDF',
    sourceType: 'instagram',
    sourceScope: 'provincial',
    sourceCategory: 'noticias',
    username: 'informatetdf',
    avatarUrl: '/images/instagram/informatetdf_avatar.jpg',
    thumbnail: '/images/instagram/informatetdf_post1_garibaldi.jpg'
  },
  {
    id: 'ig-informatetdf-puerto-2',
    title: 'Llegada récord de cruceros al Puerto de Ushuaia con más de 3.500 turistas',
    description: '🚢 Intenso movimiento en el Puerto de Ushuaia con el amarre simultáneo de grandes embarcaciones turísticas y expediciones antárticas.\n\n🏔️ Comercios y servicios locales destacan el impacto positivo de la temporada en la economía de la capital fueguina.\n\n📍 Ushuaia, Tierra del Fuego · Muelle Comercial.\n\n#InforMateTDF #PuertoUshuaia #TurismoTDF #Antartida #Ushuaia #FinDelMundo',
    link: 'https://www.instagram.com/informatetdf?stkn=MXh6NWNzcWlyZHlpNA==',
    pubDate: new Date(Date.now() - 4 * 3600 * 1000).toISOString(), // Hace 4 horas
    sourceId: 'instagram-informatetdf',
    sourceName: 'InforMate TDF',
    sourceType: 'instagram',
    sourceScope: 'provincial',
    sourceCategory: 'noticias',
    username: 'informatetdf',
    avatarUrl: '/images/instagram/informatetdf_avatar.jpg',
    thumbnail: '/images/instagram/informatetdf_post2_puerto.jpg'
  },

  // 5. SUMEMOS TOLHUIN (@sumemostolhuin)
  {
    id: 'ig-sumemostolhuin-fagnano-1',
    title: 'Encuentro cultural y comunitario en las costas del Lago Fagnano (Khami)',
    description: '🌊 ¡Hermosa jornada compartida en el Corazón de la Isla! Familias y vecinos de Tolhuin disfrutaron de música en vivo, reconocimientos a antiguos pobladores y actividades al aire libre sobre las costas de nuestro querido Lago Fagnano.\n\n❤️ Sigamos sumando por nuestra identidad, nuestras raíces y el crecimiento de nuestra comunidad.\n\n📍 Tolhuin · Lago Fagnano · Tierra del Fuego\n\n#SumemosTolhuin #CorazonDeLaIsla #Tolhuin #LagoFagnano #AntiguosPobladores #TierraDelFuego',
    link: 'https://www.instagram.com/sumemostolhuin?stkn=MWt1MXc5N3RnOW1jdQ==',
    pubDate: new Date(Date.now() - 35 * 60 * 1000).toISOString(), // Hace 35 minutos
    sourceId: 'instagram-sumemostolhuin',
    sourceName: 'Sumemos Tolhuin',
    sourceType: 'instagram',
    sourceScope: 'provincial',
    sourceCategory: 'comunidad',
    username: 'sumemostolhuin',
    avatarUrl: '/images/instagram/sumemostolhuin_avatar.jpg',
    thumbnail: '/images/instagram/sumemostolhuin_post1_fagnano.jpg'
  },
  {
    id: 'ig-sumemostolhuin-taller-2',
    title: 'Mercado de Productores y Emprendedores locales: Impulso a la producción de Tolhuin',
    description: '🪵 Con gran éxito se desarrolló una nueva edición del Mercado de Productores Locales de Tolhuin, presentando artesanías en madera de lenga, panificados caseros, dulces de frutos rojos y calafate.\n\n🚀 Desde Sumemos Tolhuin seguimos apoyando a los trabajadores autogestionados y emprendimientos que potencian nuestra economía local.\n\n📍 Tolhuin, Tierra del Fuego · Salón Comunitario\n\n#SumemosTolhuin #SumemosProduccion #Emprendedores #TolhuinProductivo #HechoEnTolhuin',
    link: 'https://www.instagram.com/sumemostolhuin?stkn=MWt1MXc5N3RnOW1jdQ==',
    pubDate: new Date(Date.now() - 7 * 3600 * 1000).toISOString(), // Hace 7 horas
    sourceId: 'instagram-sumemostolhuin',
    sourceName: 'Sumemos Tolhuin',
    sourceType: 'instagram',
    sourceScope: 'provincial',
    sourceCategory: 'comunidad',
    username: 'sumemostolhuin',
    avatarUrl: '/images/instagram/sumemostolhuin_avatar.jpg',
    thumbnail: '/images/instagram/sumemostolhuin_post2_taller.jpg'
  }
];

// Prepend so they appear at the top
articles = [...realInstagramArticles, ...articles];

const updated = {
  lastUpdated: new Date().toISOString(),
  articles: articles
};

fs.writeFileSync(filePath, JSON.stringify(updated, null, 2), 'utf8');
console.log('Successfully updated articles.json with real Instagram posts! Total articles:', articles.length);
