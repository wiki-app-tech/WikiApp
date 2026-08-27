'use client';

import React, { useState, useMemo } from 'react';
import { 
  Compass, Map, Trees, Mountain, ShieldAlert, Search, ExternalLink, 
  Printer, Download, ZoomIn, ZoomOut, RotateCcw, X, Info, CheckCircle2, 
  MapPin, Clock, Footprints, AlertTriangle, ChevronRight, FileText, 
  Sparkles, Award, PhoneCall, Eye, Layers, Filter, Check
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// --- DATASETS ---

export interface MapItem {
  id: string;
  title: string;
  category: 'ign' | 'protegidas' | 'bosques' | 'hidro';
  categoryLabel: string;
  source: 'Ministerio de Producción y Ambiente TDF' | 'IGN - ConocerUshuaia';
  imageUrl: string;
  downloadUrl?: string;
  description: string;
  scale?: string;
  format: 'JPG' | 'PNG' | 'ZIP' | 'PDF';
}

export interface TrailItem {
  id: string;
  name: string;
  city: 'Ushuaia' | 'Tolhuin' | 'Río Grande' | 'Parque Nacional TDF';
  difficulty: 'Muy Fácil' | 'Fácil' | 'Moderada' | 'Alta' | 'Exigente';
  difficultyColor: string;
  distance: string;
  duration: string;
  elevation: string;
  season: string;
  coordinates: string;
  description: string;
  equipment: string[];
  coverImage: string;
  requiresRegistration: boolean;
}

export interface SpeciesItem {
  id: string;
  name: string;
  scientificName: string;
  type: 'fauna' | 'flora';
  status: 'Nativa Protegida' | 'En Peligro' | 'Exótica Invasora' | 'Flora Autóctona';
  statusColor: string;
  habitat: string;
  description: string;
  curiosities: string;
  imageUrl: string;
}

const MAPS_DATA: MapItem[] = [
  // Ministerio de Producción y Ambiente TDF
  {
    id: 'map-anp',
    title: 'Sistema Provincial de Áreas Naturales Protegidas TDF',
    category: 'protegidas',
    categoryLabel: 'Áreas Protegidas',
    source: 'Ministerio de Producción y Ambiente TDF',
    imageUrl: 'https://prodyambiente.tierradelfuego.gob.ar/wp-content/uploads/2025/07/Sistema-Provincial-de-Areas-Naturales-Protegidas-TDF-scaled.jpeg',
    downloadUrl: 'https://prodyambiente.tierradelfuego.gob.ar/wp-content/uploads/2023/07/Tematico%20ResForestales.zip',
    description: 'Delimitación oficial de reservas provinciales, parques naturales y zonas de conservación biológica en la Isla Grande.',
    scale: '1:500.000',
    format: 'JPG'
  },
  {
    id: 'map-otbn-prov',
    title: 'OTBN Provincial - Ordenamiento Territorial de Bosques Nativos',
    category: 'bosques',
    categoryLabel: 'Bosques Nativos',
    source: 'Ministerio de Producción y Ambiente TDF',
    imageUrl: 'https://prodyambiente.tierradelfuego.gob.ar/wp-content/uploads/2023/07/OTBN-IMG.png',
    downloadUrl: 'https://prodyambiente.tierradelfuego.gob.ar/wp-content/uploads/2023/07/OTBN%20Provincial.zip',
    description: 'Zonificación de bosques nativos por categoría ambiental (Roja, Amarilla y Verde) según Ley Nacional 26.331.',
    scale: '1:250.000',
    format: 'ZIP'
  },
  {
    id: 'map-isla-estados',
    title: 'Reserva Provincial Isla de los Estados y Archipiélago de Año Nuevo',
    category: 'protegidas',
    categoryLabel: 'Áreas Protegidas',
    source: 'Ministerio de Producción y Ambiente TDF',
    imageUrl: 'https://prodyambiente.tierradelfuego.gob.ar/wp-content/uploads/2023/07/Mapa-Isla-De-Los-Estados-1.png',
    downloadUrl: 'https://prodyambiente.tierradelfuego.gob.ar/wp-content/uploads/2023/07/OTBN%20Isla%20Estados.zip',
    description: 'Cartografía integral de la Reserva Ecológica e Histórica Isla de los Estados, caletas y faro San Juan de Salvamento.',
    scale: '1:100.000',
    format: 'PNG'
  },
  {
    id: 'map-peninsula-mitre',
    title: 'Área Natural Protegida Península Mitre - Ley Provincial 1461',
    category: 'protegidas',
    categoryLabel: 'Áreas Protegidas',
    source: 'Ministerio de Producción y Ambiente TDF',
    imageUrl: 'https://prodyambiente.tierradelfuego.gob.ar/wp-content/uploads/2023/08/AreaProtegida-PMitre-img.png',
    downloadUrl: 'https://prodyambiente.tierradelfuego.gob.ar/wp-content/uploads/2023/07/Zonificacion%20LP1461%20Peninsula%20Mitre.jpg',
    description: 'Zonificación de conservación y resguardo de turbales y ecosistemas marinos del extremo sudoriental de la isla.',
    scale: '1:200.000',
    format: 'JPG'
  },
  {
    id: 'map-turberas',
    title: 'Mapa de Turberas y Humedales de Tierra del Fuego',
    category: 'hidro',
    categoryLabel: 'Hidrografía & Humedales',
    source: 'Ministerio de Producción y Ambiente TDF',
    imageUrl: 'https://prodyambiente.tierradelfuego.gob.ar/wp-content/uploads/2025/12/Turberas-de-Tierra-del-Fuego-scaled.jpeg',
    description: 'Ubicación y clasificación de turbales Sphagnum, reservorios globales de agua dulce y fijadores de carbono.',
    scale: '1:500.000',
    format: 'JPG'
  },
  {
    id: 'map-glaciares',
    title: 'Glaciares de Ushuaia y Cuenca Glaciar Vinciguerra',
    category: 'hidro',
    categoryLabel: 'Hidrografía & Humedales',
    source: 'Ministerio de Producción y Ambiente TDF',
    imageUrl: 'https://prodyambiente.tierradelfuego.gob.ar/wp-content/uploads/2025/12/Glaciares-de-Ushuaia.jpg',
    description: 'Inventario de campos de hielo, glaciares de circo y lenguas glaciares en los cordones Martial y Vinciguerra (RAMSAR).',
    scale: '1:50.000',
    format: 'JPG'
  },
  {
    id: 'map-cuencas',
    title: 'Ríos, Lagos y Tipos de Cuencas Hidrográficas de TDF',
    category: 'hidro',
    categoryLabel: 'Hidrografía & Humedales',
    source: 'Ministerio de Producción y Ambiente TDF',
    imageUrl: 'https://prodyambiente.tierradelfuego.gob.ar/wp-content/uploads/2025/12/Tipos-de-Cuencas-Hidrograficas-de-Tierra-del-Fuego.jpg',
    description: 'Redes fluviales, cuencas de vertiente pacífica, atlántica y Beagle de la provincia.',
    scale: '1:400.000',
    format: 'JPG'
  },
  {
    id: 'map-otbn-ushuaia',
    title: 'Ordenamiento Territorial de Bosques - Ejido Urbano Ushuaia',
    category: 'bosques',
    categoryLabel: 'Bosques Nativos',
    source: 'Ministerio de Producción y Ambiente TDF',
    imageUrl: 'https://prodyambiente.tierradelfuego.gob.ar/wp-content/uploads/2023/07/OTBN-Actualizacion-2019_Ejido-Ushuaia-1.png',
    downloadUrl: 'https://prodyambiente.tierradelfuego.gob.ar/wp-content/uploads/2023/07/OTBN%20Ush.zip',
    description: 'Delimitación de áreas boscosas protegidas e interurbana de la ciudad de Ushuaia.',
    scale: '1:25.000',
    format: 'PNG'
  },
  {
    id: 'map-otbn-riogrande',
    title: 'Ordenamiento Territorial de Bosques - Ejido Urbano Río Grande',
    category: 'bosques',
    categoryLabel: 'Bosques Nativos',
    source: 'Ministerio de Producción y Ambiente TDF',
    imageUrl: 'https://prodyambiente.tierradelfuego.gob.ar/wp-content/uploads/2023/07/OTBN-Rio-Grande.png',
    downloadUrl: 'https://prodyambiente.tierradelfuego.gob.ar/wp-content/uploads/2023/07/OTBN%20RG.zip',
    description: 'Zonificación forestal periurbana y cuenca del Río Grande.',
    scale: '1:50.000',
    format: 'PNG'
  },
  {
    id: 'map-otbn-tolhuin',
    title: 'Ordenamiento Territorial de Bosques - Ejido Urbano Tolhuin',
    category: 'bosques',
    categoryLabel: 'Bosques Nativos',
    source: 'Ministerio de Producción y Ambiente TDF',
    imageUrl: 'https://prodyambiente.tierradelfuego.gob.ar/wp-content/uploads/2023/07/OTBN-Actualizacion-2019_Ejido-Tolhuin-1.png',
    downloadUrl: 'https://prodyambiente.tierradelfuego.gob.ar/wp-content/uploads/2023/07/OTBN%20Tol.zip',
    description: 'Superficie de bosques protectores circundantes al Lago Fagnano.',
    scale: '1:25.000',
    format: 'PNG'
  },

  // Cartas Topográficas IGN - ConocerUshuaia
  {
    id: 'ign-15-ushuaia',
    title: 'Carta Topográfica IGN 15 - Ushuaia y Canal Beagle',
    category: 'ign',
    categoryLabel: 'Carta Topográfica IGN',
    source: 'IGN - ConocerUshuaia',
    imageUrl: 'https://conocerushuaia.com/wp-content/uploads/imagenes/cartas-topograficas/15-ushuaia.jpg',
    downloadUrl: 'https://conocerushuaia.com/wp-content/uploads/imagenes/cartas-topograficas/15-ushuaia.jpg',
    description: 'Carta oficial del Instituto Geográfico Nacional con curva de nivel de la ciudad de Ushuaia, montes Martial y bahía.',
    scale: '1:50.000',
    format: 'JPG'
  },
  {
    id: 'ign-16-tierramayor',
    title: 'Carta Topográfica IGN 16 - Valle Tierra Mayor y Carbajal',
    category: 'ign',
    categoryLabel: 'Carta Topográfica IGN',
    source: 'IGN - ConocerUshuaia',
    imageUrl: 'https://conocerushuaia.com/wp-content/uploads/imagenes/cartas-topograficas/16-valle-tierra-mayor.jpg',
    downloadUrl: 'https://conocerushuaia.com/wp-content/uploads/imagenes/cartas-topograficas/16-valle-tierra-mayor.jpg',
    description: 'Relevamiento topográfico de los valles glaciares de Tierra Mayor, Cerro Castor, Laguna Esmeralda y Glaciar Ojo del Albino.',
    scale: '1:50.000',
    format: 'JPG'
  },
  {
    id: 'ign-17-ranchohambre',
    title: 'Carta Topográfica IGN 17 - Rancho Hambre y Paso Garibaldi',
    category: 'ign',
    categoryLabel: 'Carta Topográfica IGN',
    source: 'IGN - ConocerUshuaia',
    imageUrl: 'https://conocerushuaia.com/wp-content/uploads/imagenes/cartas-topograficas/17-rancho-hambre.jpg',
    downloadUrl: 'https://conocerushuaia.com/wp-content/uploads/imagenes/cartas-topograficas/17-rancho-hambre.jpg',
    description: 'Cruce cordillerano de la Ruta Nacional N° 3, Paso Garibaldi y nacientes del Lago Escondido.',
    scale: '1:50.000',
    format: 'JPG'
  },
  {
    id: 'ign-18-almanza',
    title: 'Carta Topográfica IGN 18 - Puerto Almanza y Paso Mackinlay',
    category: 'ign',
    categoryLabel: 'Carta Topográfica IGN',
    source: 'IGN - ConocerUshuaia',
    imageUrl: 'https://conocerushuaia.com/wp-content/uploads/imagenes/cartas-topograficas/18-puerto-almanza.jpg',
    downloadUrl: 'https://conocerushuaia.com/wp-content/uploads/imagenes/cartas-topograficas/18-puerto-almanza.jpg',
    description: 'Zona costera de extracción centollera sobre el Canal Beagle frente a la Isla Navarino.',
    scale: '1:50.000',
    format: 'JPG'
  },
  {
    id: 'ign-19-harberton',
    title: 'Carta Topográfica IGN 19 - Estancia Harberton e Bahía Gable',
    category: 'ign',
    categoryLabel: 'Carta Topográfica IGN',
    source: 'IGN - ConocerUshuaia',
    imageUrl: 'https://conocerushuaia.com/wp-content/uploads/imagenes/cartas-topograficas/19-estancia-harberton.jpg',
    downloadUrl: 'https://conocerushuaia.com/wp-content/uploads/imagenes/cartas-topograficas/19-estancia-harberton.jpg',
    description: 'Primera estancia fueguina, pingüinera de Isla Martillo e islotes del Beagle.',
    scale: '1:50.000',
    format: 'JPG'
  },
  {
    id: 'ign-45-riogrande',
    title: 'Carta Topográfica IGN 45 - Ciudad de Río Grande',
    category: 'ign',
    categoryLabel: 'Carta Topográfica IGN',
    source: 'IGN - ConocerUshuaia',
    imageUrl: 'https://conocerushuaia.com/wp-content/uploads/imagenes/cartas-topograficas/45-rio-grande.jpg',
    downloadUrl: 'https://conocerushuaia.com/wp-content/uploads/imagenes/cartas-topograficas/45-rio-grande.jpg',
    description: 'Detalle topográfico de la desembocadura de la Ría de Río Grande, costa atlántica y ejido municipal.',
    scale: '1:50.000',
    format: 'JPG'
  },
  {
    id: 'ign-54-tolhuin',
    title: 'Carta Topográfica IGN 54 - Municipio de Tolhuin',
    category: 'ign',
    categoryLabel: 'Carta Topográfica IGN',
    source: 'IGN - ConocerUshuaia',
    imageUrl: 'https://conocerushuaia.com/wp-content/uploads/imagenes/cartas-topograficas/54-tolhuin.jpg',
    downloadUrl: 'https://conocerushuaia.com/wp-content/uploads/imagenes/cartas-topograficas/54-tolhuin.jpg',
    description: 'Cabecera oriental del Lago Fagnano, Laguna Kami y colinas de transición boscosa.',
    scale: '1:50.000',
    format: 'JPG'
  },
  {
    id: 'ign-73-lagofagnano',
    title: 'Carta Topográfica IGN 73 - Cuenca Lago Fagnano / Kami',
    category: 'ign',
    categoryLabel: 'Carta Topográfica IGN',
    source: 'IGN - ConocerUshuaia',
    imageUrl: 'https://conocerushuaia.com/wp-content/uploads/imagenes/cartas-topograficas/73-lago-fagnano.jpg',
    downloadUrl: 'https://conocerushuaia.com/wp-content/uploads/imagenes/cartas-topograficas/73-lago-fagnano.jpg',
    description: 'Eje de la falla Magallanes-Fagnano y relieve montañoso del centro insular.',
    scale: '1:50.000',
    format: 'JPG'
  },
  {
    id: 'ign-84-lagoescondido',
    title: 'Carta Topográfica IGN 84 - Lago Escondido y Sierra de San Jovita',
    category: 'ign',
    categoryLabel: 'Carta Topográfica IGN',
    source: 'IGN - ConocerUshuaia',
    imageUrl: 'https://conocerushuaia.com/wp-content/uploads/imagenes/cartas-topograficas/84-lago-escondido.jpg',
    downloadUrl: 'https://conocerushuaia.com/wp-content/uploads/imagenes/cartas-topograficas/84-lago-escondido.jpg',
    description: 'Espejo de agua glaciario, hostería histórica Petrel y serranías circundantes.',
    scale: '1:50.000',
    format: 'JPG'
  },
  {
    id: 'ign-109-bahiaaguirre',
    title: 'Carta Topográfica IGN 109 - Bahía Aguirre y Puerto Español',
    category: 'ign',
    categoryLabel: 'Carta Topográfica IGN',
    source: 'IGN - ConocerUshuaia',
    imageUrl: 'https://conocerushuaia.com/wp-content/uploads/imagenes/cartas-topograficas/109-bahia-aguirre.jpg',
    downloadUrl: 'https://conocerushuaia.com/wp-content/uploads/imagenes/cartas-topograficas/109-bahia-aguirre.jpg',
    description: 'Costa sur de Península Mitre, cuevas históricas del misionero Allen Gardiner.',
    scale: '1:50.000',
    format: 'JPG'
  },
  {
    id: 'ign-134-sanjuandesalvamento',
    title: 'Carta Topográfica IGN 134 - San Juan de Salvamento (Faro del Fin del Mundo)',
    category: 'ign',
    categoryLabel: 'Carta Topográfica IGN',
    source: 'IGN - ConocerUshuaia',
    imageUrl: 'https://conocerushuaia.com/wp-content/uploads/imagenes/cartas-topograficas/134-san-juan-de-salvamento.jpg',
    downloadUrl: 'https://conocerushuaia.com/wp-content/uploads/imagenes/cartas-topograficas/134-san-juan-de-salvamento.jpg',
    description: 'Punta Lasserre en la Isla de los Estados, sitio del legendario Faro del Fin del Mundo inmortalizado por Julio Verne.',
    scale: '1:50.000',
    format: 'JPG'
  }
];

const TRAILS_DATA: TrailItem[] = [
  {
    id: 'trail-esmeralda',
    name: 'Laguna Esmeralda',
    city: 'Ushuaia',
    difficulty: 'Moderada',
    difficultyColor: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
    distance: '9.0 km (Ida y vuelta)',
    duration: '4 a 5 horas',
    elevation: '+200 metros',
    season: 'Todo el año (crampones en invierno)',
    coordinates: '54°43\'18"S 68°07\'05"O (Ruta 3 Km 3018)',
    description: 'El trekking más popular de Tierra del Fuego. Atraviesa hermosos bosques de lengas y turberas húmedas hasta alcanzar la deslumbrante laguna de origen glaciar color verde esmeralda al pie del Cerro Bonete.',
    equipment: ['Botas impermeables de caña alta', 'Polainas (recomendadas)', 'Ropa en capas térmicas', 'Bastones de trekking', 'Comida y agua (1.5L)', 'Registro de Senderista activado'],
    coverImage: '/images/laguna-esmeralda.jpg',
    requiresRegistration: true
  },
  {
    id: 'trail-martial',
    name: 'Glaciar Martial',
    city: 'Ushuaia',
    difficulty: 'Fácil',
    difficultyColor: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20',
    distance: '6.0 km (Ida y vuelta)',
    duration: '3 a 4 horas',
    elevation: '+380 metros',
    season: 'Todo el año',
    coordinates: '54°47\'38"S 68°22\'45"O (Base Pista de Esquí)',
    description: 'Ascenso constante bordeando el arroyo Buena Esperanza hasta llegar a la morena frontal del glaciar. Ofrece una de las vistas panorámicas más deslumbrantes de la ciudad de Ushuaia y el Canal Beagle.',
    equipment: ['Calzado deportivo con buen agarre o bota', 'Abanico de abrigo cortavientos', 'Gafas de sol y filtro UV', 'Crampones en invierno/primavera'],
    coverImage: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=800&auto=format&fit=crop&q=80',
    requiresRegistration: false
  },
  {
    id: 'trail-vinciguerra',
    name: 'Glaciar Vinciguerra y Laguna de los Témpanos',
    city: 'Ushuaia',
    difficulty: 'Exigente',
    difficultyColor: 'bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20',
    distance: '13.0 km (Ida y vuelta)',
    duration: '6 a 8 horas',
    elevation: '+650 metros',
    season: 'Octubre a Mayo',
    coordinates: '54°45\'12"S 68°20\'02"O (Final del Valle de Andorra)',
    description: 'Travesía dentro del Sitio RAMSAR Internacional. Requiere cruzar turbales profundos y un ascenso de fuerte pendiente en bosque andino hasta una impresionante laguna de fusión glaciar repleta de témpanos de hielo azul.',
    equipment: ['Botas de montaña impermeables rígidas', 'Polainas obligatorias', 'Crampones de tracción', 'Linterna frontal', 'Campera impermeable (10k+)', 'Manta térmica de supervivencia'],
    coverImage: '/images/glaciar-vinciguerra.png',
    requiresRegistration: true
  },
  {
    id: 'trail-costera-pntdf',
    name: 'Senda Costera - Parque Nacional TDF',
    city: 'Parque Nacional TDF',
    difficulty: 'Moderada',
    difficultyColor: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
    distance: '8.0 km (Solo ida)',
    duration: '3.5 a 4.5 horas',
    elevation: '+120 metros',
    season: 'Octubre a Abril',
    coordinates: '54°51\'10"S 68°29\'30"O (Ensenada Zaratiegui)',
    description: 'Recorrido que serpentea las bahías costeras de Ensenada Zaratiegui y Lapataia sobre el Canal Beagle. Excelente oportunidad para el avistaje de avifauna marina, concheros yámanas e imponentes bosques costeros.',
    equipment: ['Botas de trekking', 'Ticket de entrada al Parque Nacional', 'Campera impermeable', 'Protección solar y repelente'],
    coverImage: '/images/senda-costera.jpg',
    requiresRegistration: false
  },
  {
    id: 'trail-cerro-guanaco',
    name: 'Cerro Guanaco - Cumbre PNTDF',
    city: 'Parque Nacional TDF',
    difficulty: 'Exigente',
    difficultyColor: 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20',
    distance: '12.0 km (Ida y vuelta)',
    duration: '7 a 9 horas',
    elevation: '+970 metros',
    season: 'Noviembre a Abril',
    coordinates: '54°53\'22"S 68°34\'15"O (Centro de Visitantes Alakush)',
    description: 'La cumbre más alta accesible a pie en el Parque Nacional. Un ascenso sumamente empinado que exige óptima condición física, recompensando con una deslumbrante vista de 360° sobre el Lago Acigami y la cordillera.',
    equipment: ['Botas de alta montaña rígidas', 'Bastones (imprescindibles)', 'Ropa técnica de alta montaña (-5°C)', 'Agua 2L mínimo', 'Ingreso al sendero solo antes de las 09:00 AM'],
    coverImage: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=800&auto=format&fit=crop&q=80',
    requiresRegistration: true
  },
  {
    id: 'trail-hito-xxiv',
    name: 'Hito XXIV - Frontera Chile',
    city: 'Parque Nacional TDF',
    difficulty: 'Muy Fácil',
    difficultyColor: 'bg-sky-500/10 text-sky-600 dark:text-sky-400 border-sky-500/20',
    distance: '7.0 km (Ida y vuelta)',
    duration: '2.5 a 3.5 horas',
    elevation: '+50 metros',
    season: 'Todo el año',
    coordinates: '54°51\'40"S 68°33\'50"O (Cabecera Lago Acigami)',
    description: 'Sendero llano y relajante que bordea la ribera norte del Lago Acigami (Roca) hasta la pirámide de hierro que marca el límite fronterizo entre Argentina y Chile.',
    equipment: ['Calzado cómodo de caminata', 'Campera liviana', 'Agua para hidratación'],
    coverImage: 'https://images.unsplash.com/photo-1501785888041-af3ef285b470?w=800&auto=format&fit=crop&q=80',
    requiresRegistration: false
  },
  {
    id: 'trail-san-pablo',
    name: 'Cabo San Pablo y Naufragio Desdémona',
    city: 'Río Grande',
    difficulty: 'Fácil',
    difficultyColor: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20',
    distance: '4.0 km (Ida y vuelta)',
    duration: '1.5 a 2 horas',
    elevation: '+85 metros',
    season: 'Todo el año',
    coordinates: '54°17\'55"S 66°41\'40"O (Ruta Complementaria A)',
    description: 'Recorrido costero por los acantilados del faro inclinado de Cabo San Pablo hasta la playa donde yace encallado desde 1985 el emblemático barco de carga Desdémona.',
    equipment: ['Calzado deportivo/bota', 'Abanico cortaviento de alta resistencia', 'Cámara de fotos'],
    coverImage: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&auto=format&fit=crop&q=80',
    requiresRegistration: false
  },
  {
    id: 'trail-paso-oveja',
    name: 'Travesía Paso de la Oveja (2 Días)',
    city: 'Ushuaia',
    difficulty: 'Exigente',
    difficultyColor: 'bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20',
    distance: '24.0 km (Travesía completa)',
    duration: '12 a 16 horas (2 Jornadas)',
    elevation: '+800 metros',
    season: 'Diciembre a Marzo',
    coordinates: '54°44\'00"S 68°19\'00"O (Andorra a Cañadón Oveja)',
    description: 'La travesía mítica que cruza la Cordillera Fueguina entre el Valle de Andorra y el Cañadón de la Oveja. Requiere pernoctar en carpa de montaña en vegas de altura.',
    equipment: ['Carpa de 4 estaciones', 'Bolsa de dormir confort -10°C', 'Calentador y comida de travesía', 'GPS / Mapa topográfico', 'Registro de travesías obligatoria en Defensa Civil'],
    coverImage: 'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=800&auto=format&fit=crop&q=80',
    requiresRegistration: true
  },
  {
    id: 'trail-ojo-albino-invierno',
    name: 'Glaciar Ojo del Albino (Invierno 2026)',
    city: 'Ushuaia',
    difficulty: 'Exigente',
    difficultyColor: 'bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20',
    distance: '18.0 km (Vuelta completa)',
    duration: '8 horas',
    elevation: '+850 metros',
    season: 'Invierno / Primavera',
    coordinates: '54°43\'18"S 68°07\'05"O (Estacionamiento Laguna Esmeralda RN3)',
    description: 'Desafío técnico de alta montaña cruzando Laguna Esmeralda congelada. Tramo muy exigente sobre acarreo rocoso y hielo glaciar. Se recomienda guía habilitado.',
    equipment: ['Crampones obligatorios con picos de acero', 'Bastones de trekking', 'Ropa térmica de alta montaña (-10°C)', 'Linterna frontal', 'Campera impermeable 10k+', 'Guía de montaña recomendado'],
    coverImage: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=800&auto=format&fit=crop&q=80',
    requiresRegistration: true
  },
  {
    id: 'trail-velo-de-novia',
    name: 'Cascada Velo de Novia',
    city: 'Ushuaia',
    difficulty: 'Fácil',
    difficultyColor: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20',
    distance: '6.0 km (Ida y vuelta)',
    duration: '2 horas',
    elevation: '+180 metros',
    season: 'Todo el año',
    coordinates: '54°47\'10"S 68°14\'20"O (Camping Kawi Yoppen - RN3)',
    description: 'Rincón clásico y salto de agua a pocos kilómetros de la salida de Ushuaia. Recorrido boscoso corto con descenso final sobre rocas húmedas.',
    equipment: ['Calzado de trekking con buen agarre', 'Campera impermeable o capa de agua', 'Atención en tramo final resbaladizo'],
    coverImage: 'https://images.unsplash.com/photo-1546182990-dffeafbe841d?w=800&auto=format&fit=crop&q=80',
    requiresRegistration: false
  },
  {
    id: 'trail-laguna-celeste-alvear',
    name: 'Laguna Celeste y Glaciar Alvear',
    city: 'Ushuaia',
    difficulty: 'Moderada',
    difficultyColor: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
    distance: '11.0 km (Ida y vuelta)',
    duration: '5 a 6 horas',
    elevation: '+520 metros',
    season: 'Noviembre a Mayo',
    coordinates: '54°42\'30"S 68°05\'10"O (Valle de las Cotorras - RN3)',
    description: 'Ascenso continuo bordeando el cauce del arroyo hasta una deslumbrante laguna de tono celeste turquesa al pie de las paredes del Macizo Alvear.',
    equipment: ['Botas impermeables de caña alta', 'Bastones de trekking', 'Polainas para zona de rocas', 'Agua (1.5L) y ración de marcha'],
    coverImage: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=800&auto=format&fit=crop&q=80',
    requiresRegistration: true
  },
  {
    id: 'trail-paso-aves-oculta',
    name: 'Paso de las Aves y Laguna Oculta',
    city: 'Ushuaia',
    difficulty: 'Exigente',
    difficultyColor: 'bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20',
    distance: '16.0 km (Ida y vuelta)',
    duration: '7 a 8 horas',
    elevation: '+620 metros',
    season: 'Diciembre a Abril',
    coordinates: '54°45\'00"S 68°10\'00"O (Valle del Río Chico)',
    description: 'Aventura profunda cruzando el Valle del Río Chico hasta el alto paso cordillerano que alberga las lagunas Halcón, Cóndor y la prístina Laguna Oculta.',
    equipment: ['Botas de alta montaña impermeables', 'GPS / Navegador con track', 'Linterna frontal', 'Manta térmica', 'Registro de senderistas obligatorio'],
    coverImage: 'https://images.unsplash.com/photo-1519681393784-d120267933ba?w=800&auto=format&fit=crop&q=80',
    requiresRegistration: true
  },
  {
    id: 'trail-cascada-mellizas',
    name: 'Cascada Las Mellizas',
    city: 'Ushuaia',
    difficulty: 'Fácil',
    difficultyColor: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20',
    distance: '4.5 km (Ida y vuelta)',
    duration: '1.5 a 2 horas',
    elevation: '+120 metros',
    season: 'Todo el año',
    coordinates: '54°41\'15"S 67°58\'30"O (Paso Garibaldi / Sector Gasoducto)',
    description: 'Trekking corto en inmediaciones del Paso Garibaldi. Atraviesa bosque, turbal y vadeo de arroyo hasta llegar a dos imponentes caídas de agua gemelas.',
    equipment: ['Calzado impermeable o botas de goma', 'Abrigo cortavientos', 'Precaución en cruce de río'],
    coverImage: 'https://images.unsplash.com/photo-1432405972618-c60b0225b8f9?w=800&auto=format&fit=crop&q=80',
    requiresRegistration: false
  },
  {
    id: 'trail-cerro-atukoyak',
    name: 'Cerro Atukoyak (Reserva Corazón de la Isla)',
    city: 'Tolhuin',
    difficulty: 'Fácil',
    difficultyColor: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20',
    distance: '5.0 km (Ida y vuelta)',
    duration: '2 a 2.5 horas',
    elevation: '+220 metros',
    season: 'Todo el año',
    coordinates: '54°28\'10"S 67°25\'00"O (Reserva Provincial Corazón de la Isla)',
    description: 'Sendero completamente señalizado cerca de Tolhuin. Ofrece espectaculares vistas panorámicas de la Reserva Corazón de la Isla y el gran Lago Fagnano.',
    equipment: ['Calzado de caminata cómodo', 'Campera liviana cortavientos', 'Protección solar y agua'],
    coverImage: 'https://images.unsplash.com/photo-1501785888041-af3ef285b470?w=800&auto=format&fit=crop&q=80',
    requiresRegistration: false
  },
  {
    id: 'trail-laguna-caminante',
    name: 'Laguna del Caminante (Valle de Andorra)',
    city: 'Ushuaia',
    difficulty: 'Exigente',
    difficultyColor: 'bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20',
    distance: '18.0 km (Ida y vuelta)',
    duration: '8 a 10 horas',
    elevation: '+550 metros',
    season: 'Noviembre a Abril',
    coordinates: '54°44\'30"S 68°18\'10"O (Entrada Valle de Andorra)',
    description: 'Travesía intensa atravesando turbales extensos, bosques primarios y valles glaciares hasta alcanzar una solitaria y sobrecogedora laguna de altura.',
    equipment: ['Botas impermeables de caña alta', 'Polainas impermeables', 'Linterna frontal', 'Manta térmica y botiquín', 'Registro de Senderista activado'],
    coverImage: 'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=800&auto=format&fit=crop&q=80',
    requiresRegistration: true
  },
  {
    id: 'trail-cerro-cortez',
    name: 'Cerro Cortez (Atardecer Fueguino)',
    city: 'Ushuaia',
    difficulty: 'Moderada',
    difficultyColor: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
    distance: '7.5 km (Ida y vuelta)',
    duration: '3.5 a 4.5 horas',
    elevation: '+480 metros',
    season: 'Octubre a Mayo',
    coordinates: '54°48\'05"S 68°20\'15"O (Valle de los Lobos - RN3)',
    description: 'Sendero de cumbres sobre el Valle de los Lobos ideal para apreciar atardeceres de verano sobre la Cordillera de los Andes y el Canal Beagle.',
    equipment: ['Bastones de trekking', 'Calzado técnico con buen agarre', 'Linterna frontal (imprescindible para descenso nocturno)', 'Campera de abrigo'],
    coverImage: 'https://images.unsplash.com/photo-1519681393784-d120267933ba?w=800&auto=format&fit=crop&q=80',
    requiresRegistration: false
  },
  {
    id: 'trail-terma-escondida',
    name: 'Terma Escondida de Tolhuin',
    city: 'Tolhuin',
    difficulty: 'Muy Fácil',
    difficultyColor: 'bg-sky-500/10 text-sky-600 dark:text-sky-400 border-sky-500/20',
    distance: '3.0 km (Ida y vuelta)',
    duration: '1 a 1.5 horas',
    elevation: '+40 metros',
    season: 'Todo el año',
    coordinates: '54°31\'00"S 67°12\'00"O (Sector Termas de Tolhuin)',
    description: 'Rincón escondido en el bosque de Tolhuin con pozón natural de agua termal. Caminata plácida envuelta en silencio y naturaleza silvestre.',
    equipment: ['Calzado cómodo', 'Malla de baño y toalla', 'Bolsa para residuos (Sin Huella)'],
    coverImage: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&auto=format&fit=crop&q=80',
    requiresRegistration: false
  }
];

const SPECIES_DATA: SpeciesItem[] = [
  // FAUNA
  {
    id: 'sp-zorro',
    name: 'Zorro Colorado Fueguino',
    scientificName: 'Lycalopex culpaeus lycoides',
    type: 'fauna',
    status: 'Nativa Protegida',
    statusColor: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
    habitat: 'Bosques de lenga, turberas y estepa fueguina',
    description: 'Cánido autóctono más grande de la isla. Posee una frondosa cola de punta negra y un pelaje rojizo anaranjado en la cabeza y patas. Es un depredador clave en la cadena trófica insular.',
    curiosities: 'Es una subespecie endémica de la Isla Grande de Tierra del Fuego. Está prohibida su caza y alimentación por parte de visitantes.',
    imageUrl: 'https://images.unsplash.com/photo-1474511320723-9a56873867b5?w=800&auto=format&fit=crop&q=80'
  },
  {
    id: 'sp-huillin',
    name: 'Huillín / Nutria Marina',
    scientificName: 'Lontra provocax',
    type: 'fauna',
    status: 'En Peligro',
    statusColor: 'bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20',
    habitat: 'Costas rocosas del Canal Beagle e Isla de los Estados',
    description: 'Nutria nativa semiacuática de cuerpo estilizado y denso pelaje castaño. Habita en las bahías marinas protegidas con presencia de bosques de cachiyuyo (algas gigantes).',
    curiosities: 'Es uno de los mamíferos marinos más amenazados de Argentina. Monumento Natural Provincial.',
    imageUrl: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=800&auto=format&fit=crop&q=80'
  },
  {
    id: 'sp-guanaco',
    name: 'Guanaco Fueguino',
    scientificName: 'Lama guanicoe',
    type: 'fauna',
    status: 'Nativa Protegida',
    statusColor: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
    habitat: 'Esteba del norte, ecotono y prados de altura',
    description: 'El herbívoro nativo más grande de Tierra del Fuego. Camélido de cuello largo y pelaje canela con pecho blanco. Se desplaza en tropillas lideradas por un macho relincho.',
    curiosities: 'Sus pezuñas con almohadillas blandas evitan la erosión del suelo frágil del sotobosque fueguino.',
    imageUrl: 'https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?w=800&auto=format&fit=crop&q=80'
  },
  {
    id: 'sp-carpintero',
    name: 'Carpintero Magallánico',
    scientificName: 'Campephilus magellanicus',
    type: 'fauna',
    status: 'Nativa Protegida',
    statusColor: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
    habitat: 'Bosques maduros de lenga, coihue y guindo',
    description: 'El ave carpintera más grande de Sudamérica. El macho destaca por su imponente cresta rojo carmesí brillante y cuerpo negro azabache. Se alimenta de larvas en troncos viejos.',
    curiosities: 'Produce un tamborileo característico de dos golpes resonantes en los troncos de los árboles que se escucha a cientos de metros.',
    imageUrl: 'https://images.unsplash.com/photo-1552728089-57bdde30beb3?w=800&auto=format&fit=crop&q=80'
  },
  {
    id: 'sp-pinguino-rey',
    name: 'Pingüino Rey',
    scientificName: 'Aptenodytes patagonicus',
    type: 'fauna',
    status: 'Nativa Protegida',
    statusColor: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
    habitat: 'Bahías y aguas del Atlántico Sur y Canal Beagle',
    description: 'La segunda especie de pingüino más grande del mundo. Presenta un elegante plumaje con manchas anaranjadas en el pecho y los costados de la cabeza.',
    curiosities: 'Sus pichones nacen cubiertos por un denso plumón castaño esponjoso antes de mudar al plumaje adulto impermeable.',
    imageUrl: 'https://images.unsplash.com/photo-1598439210625-5067c578f3f6?w=800&auto=format&fit=crop&q=80'
  },
  {
    id: 'sp-castor',
    name: 'Castor Americano',
    scientificName: 'Castor canadensis',
    type: 'fauna',
    status: 'Exótica Invasora',
    statusColor: 'bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-500/20',
    habitat: 'Ríos, arroyos y turbales de toda la provincia',
    description: 'Roedor introducido desde Canadá en 1946 con 25 parejas. Sin depredadores naturales, su población creció descontroladamente alterando el curso de las cuencas fluviales.',
    curiosities: 'Construye diques que inundan los bosques de lenga, secando los árboles nativos al no estar adaptados a la inundación prolongada.',
    imageUrl: 'https://images.unsplash.com/photo-1589656966895-2f33e7653819?w=800&auto=format&fit=crop&q=80'
  },

  // FLORA
  {
    id: 'sp-lenga',
    name: 'Lenga',
    scientificName: 'Nothofagus pumilio',
    type: 'flora',
    status: 'Flora Autóctona',
    statusColor: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
    habitat: 'Bosques caducifolios desde el nivel del mar hasta 600m',
    description: 'El árbol dominante del sotobosque fueguino. Pierde sus hojas en invierno tras pintar las laderas de la cordillera de intensos tonos rojos, dorados y cobrizos durante el otoño.',
    curiosities: 'En las cumbres expuestas al viento fuerte adopta una forma achaparrada y rastrera conocida como "lenga en bandera".',
    imageUrl: 'https://images.unsplash.com/photo-1448375240586-882707db888b?w=800&auto=format&fit=crop&q=80'
  },
  {
    id: 'sp-calafate',
    name: 'Calafate',
    scientificName: 'Berberis microphylla',
    type: 'flora',
    status: 'Flora Autóctona',
    statusColor: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
    habitat: 'Matorrales, ecotono y bordes de bosque',
    description: 'Arbusto espinoso de flores amarillas perfumadas que produce pequeñas bayas comestibles de color azul oscuro / violáceo con alto contenido de antioxidantes.',
    curiosities: 'Existe la mítica leyenda patagónica: *"El que come calafate, siempre ha de volver a Tierra del Fuego"*.',
    imageUrl: 'https://images.unsplash.com/photo-1528183429752-a97d0bf99b5a?w=800&auto=format&fit=crop&q=80'
  },
  {
    id: 'sp-sphagnum',
    name: 'Musgo de Turbera / Sphagnum',
    scientificName: 'Sphagnum magellanicum',
    type: 'flora',
    status: 'Flora Autóctona',
    statusColor: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
    habitat: 'Valles glaciares y cuencas húmedas de Tierra del Fuego',
    description: 'Musgo formador del ecosistema único de las turberas. Funciona como una gigantesca esponja vegetal capaz de absorber hasta 20 veces su peso en agua.',
    curiosities: 'Las turberas fueguinas almacenan más carbono atmosférico que todos los bosques de la provincia juntos.',
    imageUrl: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=800&auto=format&fit=crop&q=80'
  },
  {
    id: 'sp-barba-viejo',
    name: 'Barba de Viejo / Lichen',
    scientificName: 'Usnea barbata',
    type: 'flora',
    status: 'Flora Autóctona',
    statusColor: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
    habitat: 'Ramas de lengas y guindos en bosques maduros',
    description: 'Lichen epífito de color verde claro o pálido que cuelga como barbas de las copas de los árboles en los bosques patagónicos.',
    curiosities: 'Es un bioindicador de pureza atmosférica: solo crece en ambientes con aire 100% libre de contaminación.',
    imageUrl: 'https://images.unsplash.com/photo-1511497584788-8767611121ef?w=800&auto=format&fit=crop&q=80'
  }
];

export default function GuiaDashboard() {
  const [activeTab, setActiveTab] = useState<'maps' | 'trails' | 'fauna' | 'flora'>('trails');
  const [mapCategory, setMapCategory] = useState<string>('all');
  const [trailDifficulty, setTrailDifficulty] = useState<string>('all');
  const [trailCity, setTrailCity] = useState<string>('all');
  const [search, setSearch] = useState<string>('');

  // Modals state
  const [selectedMapZoom, setSelectedMapZoom] = useState<MapItem | null>(null);
  const [selectedPrintMap, setSelectedPrintMap] = useState<MapItem | null>(null);
  const [selectedTrailModal, setSelectedTrailModal] = useState<TrailItem | null>(null);
  const [selectedSpeciesModal, setSelectedSpeciesModal] = useState<SpeciesItem | null>(null);

  // Zoom controls for Map Viewer
  const [zoomLevel, setZoomLevel] = useState<number>(1);

  // Filtered Datasets
  const filteredMaps = useMemo(() => {
    return MAPS_DATA.filter(map => {
      const matchCat = mapCategory === 'all' || map.category === mapCategory;
      const matchSearch = !search.trim() || 
        map.title.toLowerCase().includes(search.toLowerCase()) || 
        map.description.toLowerCase().includes(search.toLowerCase()) ||
        map.source.toLowerCase().includes(search.toLowerCase());
      return matchCat && matchSearch;
    });
  }, [mapCategory, search]);

  const filteredTrails = useMemo(() => {
    return TRAILS_DATA.filter(trail => {
      const matchDiff = trailDifficulty === 'all' || trail.difficulty === trailDifficulty;
      const matchCity = trailCity === 'all' || trail.city === trailCity;
      const matchSearch = !search.trim() || 
        trail.name.toLowerCase().includes(search.toLowerCase()) || 
        trail.description.toLowerCase().includes(search.toLowerCase()) ||
        trail.equipment.some(e => e.toLowerCase().includes(search.toLowerCase()));
      return matchDiff && matchCity && matchSearch;
    });
  }, [trailDifficulty, trailCity, search]);

  const filteredFauna = useMemo(() => {
    return SPECIES_DATA.filter(sp => sp.type === 'fauna').filter(sp => {
      return !search.trim() || 
        sp.name.toLowerCase().includes(search.toLowerCase()) || 
        sp.scientificName.toLowerCase().includes(search.toLowerCase()) ||
        sp.description.toLowerCase().includes(search.toLowerCase());
    });
  }, [search]);

  const filteredFlora = useMemo(() => {
    return SPECIES_DATA.filter(sp => sp.type === 'flora').filter(sp => {
      return !search.trim() || 
        sp.name.toLowerCase().includes(search.toLowerCase()) || 
        sp.scientificName.toLowerCase().includes(search.toLowerCase()) ||
        sp.description.toLowerCase().includes(search.toLowerCase());
    });
  }, [search]);

  const handlePrintMap = (map: MapItem) => {
    setSelectedPrintMap(map);
  };

  const executeWindowPrint = () => {
    window.print();
  };

  return (
    <div className="flex flex-col gap-8 pb-16 min-h-screen">
      {/* 🌲 COMPONENT HEADER */}
      <motion.div 
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-3xl p-6 md:p-8 bg-gradient-to-r from-emerald-950 via-slate-900 to-slate-950 border border-emerald-500/20 shadow-2xl"
      >
        <div className="absolute top-0 right-0 -translate-y-12 translate-x-12 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-emerald-500/20 border border-emerald-500/30 rounded-2xl">
                <Compass className="w-6 h-6 text-emerald-400 animate-spin-slow" />
              </div>
              <span className="text-[11px] font-black uppercase tracking-[0.25em] text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">
                Cartografía & Ecosistema TDF
              </span>
            </div>

            <h1 className="text-2xl md:text-4xl font-black tracking-tight text-white font-display mt-1">
              Guía Fueguina de Senderos & Naturaleza
            </h1>
            
            <p className="text-xs md:text-sm text-slate-300 max-w-2xl leading-relaxed">
              Consulte la cartografía oficial del Ministerio de Producción y Ambiente de Tierra del Fuego, 
              cartas topográficas IGN, senderos de montaña seguros con registro provincial y catálogo de biodiversidad insular.
            </p>
          </div>

          {/* Quick Registration Button */}
          <a
            href="https://findelmundo.tur.ar/es/registro-de-senderistas"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 px-5 py-3.5 bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs uppercase tracking-wider rounded-2xl shadow-lg shadow-emerald-600/30 transition-all hover:scale-105 shrink-0"
          >
            <ShieldAlert className="w-4 h-4 text-emerald-200 animate-pulse" />
            Registro de Senderistas TDF
          </a>
        </div>

        {/* NAVIGATION TABS TOOLBAR */}
        <div className="flex items-center gap-2 mt-8 pt-6 border-t border-white/10 overflow-x-auto no-scrollbar">
          {[
            { id: 'trails', label: 'Senderos Seguros', icon: Mountain, badge: TRAILS_DATA.length },
            { id: 'maps', label: 'Cartas Topográficas & Mapas', icon: Map, badge: MAPS_DATA.length },
            { id: 'fauna', label: 'Fauna Fueguina', icon: Compass, badge: SPECIES_DATA.filter(s => s.type==='fauna').length },
            { id: 'flora', label: 'Flora Fueguina', icon: Trees, badge: SPECIES_DATA.filter(s => s.type==='flora').length },
          ].map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2.5 px-4 py-2.5 rounded-xl font-extrabold text-xs transition-all whitespace-nowrap ${
                  isActive
                    ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
                    : 'bg-white/5 text-slate-300 hover:bg-white/10 hover:text-white border border-white/5'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-slate-950' : 'text-emerald-400'}`} />
                <span>{tab.label}</span>
                <span className={`text-[10px] px-1.5 py-0.5 rounded-md font-mono ${isActive ? 'bg-slate-950/20 text-slate-950' : 'bg-white/10 text-slate-400'}`}>
                  {tab.badge}
                </span>
              </button>
            );
          })}
        </div>
      </motion.div>

      {/* 🔍 SEARCH AND FILTERS BAR */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 bg-white dark:bg-[#111114] p-4 rounded-2xl border border-slate-200 dark:border-white/10 shadow-md">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 dark:text-gray-500" />
          <input
            type="text"
            placeholder={
              activeTab === 'maps' ? "Buscar mapa, carta IGN o localidad..." :
              activeTab === 'trails' ? "Buscar sendero, laguna, dificultad..." : "Buscar especie, hábitat..."
            }
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-100 dark:bg-black/50 border border-slate-300 dark:border-white/10 rounded-xl py-2.5 pl-10 pr-4 text-xs font-semibold text-slate-800 dark:text-gray-200 placeholder:text-gray-500 focus:outline-none focus:border-emerald-500 transition-all"
          />
        </div>

        {/* Tab Specific Dropdown Filters */}
        {activeTab === 'maps' && (
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-emerald-500" />
            <select
              value={mapCategory}
              onChange={(e) => setMapCategory(e.target.value)}
              className="bg-slate-100 dark:bg-black/50 border border-slate-300 dark:border-white/10 text-slate-700 dark:text-gray-300 text-xs font-bold rounded-xl py-2.5 px-3 focus:outline-none focus:border-emerald-500"
            >
              <option value="all">Todas las Categorías de Mapas</option>
              <option value="ign">Cartas Topográficas IGN</option>
              <option value="protegidas">Áreas Protegidas y Reservas</option>
              <option value="bosques">Bosques Nativos (OTBN)</option>
              <option value="hidro">Hidrografía & Turberas</option>
            </select>
          </div>
        )}

        {activeTab === 'trails' && (
          <div className="flex flex-wrap items-center gap-2">
            <select
              value={trailDifficulty}
              onChange={(e) => setTrailDifficulty(e.target.value)}
              className="bg-slate-100 dark:bg-black/50 border border-slate-300 dark:border-white/10 text-slate-700 dark:text-gray-300 text-xs font-bold rounded-xl py-2.5 px-3 focus:outline-none focus:border-emerald-500"
            >
              <option value="all">Todas las Dificultades</option>
              <option value="Muy Fácil">Muy Fácil</option>
              <option value="Fácil">Fácil</option>
              <option value="Moderada">Moderada</option>
              <option value="Exigente">Exigente</option>
            </select>

            <select
              value={trailCity}
              onChange={(e) => setTrailCity(e.target.value)}
              className="bg-slate-100 dark:bg-black/50 border border-slate-300 dark:border-white/10 text-slate-700 dark:text-gray-300 text-xs font-bold rounded-xl py-2.5 px-3 focus:outline-none focus:border-emerald-500"
            >
              <option value="all">Todas las Ubicaciones</option>
              <option value="Ushuaia">Ushuaia</option>
              <option value="Tolhuin">Tolhuin</option>
              <option value="Parque Nacional TDF">Parque Nacional TDF</option>
              <option value="Río Grande">Río Grande / San Pablo</option>
            </select>
          </div>
        )}
      </div>

      {/* 🥾 TAB 1: SENDEROS SEGUROS */}
      {activeTab === 'trails' && (
        <div className="flex flex-col gap-6">
          {/* Safety Protocols Alert Banner */}
          <div className="bg-amber-500/10 border border-amber-500/30 rounded-2xl p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
              <div className="flex flex-col">
                <h4 className="text-xs font-extrabold text-amber-600 dark:text-amber-400 uppercase tracking-wider">
                  Recomendaciones de Seguridad en Montaña (Comisión de Auxilio TDF)
                </h4>
                <p className="text-[11px] text-slate-600 dark:text-gray-400 mt-0.5">
                  Complete obligatoriamente el Registro de Senderistas antes de salir. Salga temprano, verifique el clima, lleve calzado técnico, linterna frontal y avise a un contacto de confianza.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 shrink-0">
              <a
                href="tel:103"
                className="px-3.5 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl font-extrabold text-[11px] uppercase tracking-wider flex items-center gap-1.5 shadow-md shadow-red-600/20"
              >
                <PhoneCall className="w-3.5 h-3.5" /> Emergencias 103
              </a>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTrails.map((trail, idx) => (
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.04 }}
                key={trail.id}
                className="bg-white dark:bg-[#111114] border border-slate-200 dark:border-white/10 rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 flex flex-col justify-between group"
              >
                <div className="relative aspect-[16/10] overflow-hidden bg-black">
                  <img
                    src={trail.coverImage}
                    alt={trail.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-90 group-hover:opacity-100"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/30" />

                  <span className={`absolute top-3 left-3 text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-md border ${trail.difficultyColor} backdrop-blur-md`}>
                    {trail.difficulty}
                  </span>

                  <span className="absolute top-3 right-3 text-[10px] font-extrabold text-white bg-black/60 backdrop-blur-md px-2.5 py-1 rounded-md border border-white/10 flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-emerald-400" />
                    {trail.city}
                  </span>

                  <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-white text-[11px] font-bold">
                    <span className="flex items-center gap-1 bg-black/50 px-2 py-1 rounded-md backdrop-blur-md">
                      <Footprints className="w-3.5 h-3.5 text-emerald-400" />
                      {trail.distance}
                    </span>
                    <span className="flex items-center gap-1 bg-black/50 px-2 py-1 rounded-md backdrop-blur-md">
                      <Clock className="w-3.5 h-3.5 text-amber-400" />
                      {trail.duration}
                    </span>
                  </div>
                </div>

                <div className="p-5 flex flex-col gap-3 flex-1 justify-between">
                  <div className="flex flex-col gap-1.5">
                    <h3 className="font-black text-lg text-slate-900 dark:text-white leading-snug group-hover:text-emerald-500 transition-colors">
                      {trail.name}
                    </h3>
                    <p className="text-xs text-slate-600 dark:text-gray-400 line-clamp-3 leading-relaxed">
                      {trail.description}
                    </p>
                  </div>

                  <div className="flex flex-col gap-3 pt-3 border-t border-slate-100 dark:border-white/5">
                    <div className="flex items-center justify-between text-[11px] font-semibold text-slate-500 dark:text-gray-400">
                      <span>Desnivel: <strong className="text-slate-800 dark:text-gray-200">{trail.elevation}</strong></span>
                      <span>Época: <strong className="text-slate-800 dark:text-gray-200">{trail.season}</strong></span>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setSelectedTrailModal(trail)}
                        className="flex-1 py-2.5 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 rounded-xl font-extrabold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-1.5"
                      >
                        <Eye className="w-4 h-4" /> Detalle y Equipamiento
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* 🗺️ TAB 2: CARTAS TOPOGRÁFICAS & MAPAS DESCARGABLES */}
      {activeTab === 'maps' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredMaps.map((map, idx) => (
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.04 }}
              key={map.id}
              className="bg-white dark:bg-[#111114] border border-slate-200 dark:border-white/10 rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 flex flex-col justify-between group"
            >
              <div className="relative aspect-[4/3] overflow-hidden bg-slate-900 flex items-center justify-center">
                <img
                  src={map.imageUrl}
                  alt={map.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  onError={(e) => {
                    (e.target as HTMLElement).style.display = 'none';
                  }}
                />
                
                <div className="absolute top-3 left-3 bg-black/70 backdrop-blur-md px-2.5 py-1 rounded-md border border-white/10 text-[10px] font-black uppercase text-emerald-400">
                  {map.categoryLabel}
                </div>

                <div className="absolute top-3 right-3 bg-black/70 backdrop-blur-md px-2 py-1 rounded-md border border-white/10 text-[9px] font-bold text-gray-300">
                  Escala {map.scale || 'Oficial'}
                </div>

                {/* Quick overlay buttons */}
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 backdrop-blur-[2px]">
                  <button
                    onClick={() => { setSelectedMapZoom(map); setZoomLevel(1); }}
                    className="p-3 bg-white text-slate-900 rounded-full font-bold shadow-xl hover:scale-110 transition-transform flex items-center gap-1 text-xs"
                    title="Ampliar mapa"
                  >
                    <ZoomIn className="w-5 h-5 text-emerald-600" /> Ampliar
                  </button>
                </div>
              </div>

              <div className="p-5 flex flex-col gap-3 flex-1 justify-between">
                <div className="flex flex-col gap-1.5">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 dark:text-gray-500">
                    Fuente: {map.source}
                  </span>
                  <h3 className="font-extrabold text-base text-slate-900 dark:text-white leading-tight">
                    {map.title}
                  </h3>
                  <p className="text-xs text-slate-600 dark:text-gray-400 leading-relaxed line-clamp-2">
                    {map.description}
                  </p>
                </div>

                {/* Card Actions */}
                <div className="grid grid-cols-2 gap-2 pt-3 border-t border-slate-100 dark:border-white/5">
                  <button
                    onClick={() => handlePrintMap(map)}
                    className="py-2 px-3 bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 border border-slate-200 dark:border-white/10 rounded-xl text-xs font-bold text-slate-700 dark:text-gray-200 transition-all flex items-center justify-center gap-1.5"
                  >
                    <Printer className="w-3.5 h-3.5 text-blue-500" /> Imprimir A4
                  </button>

                  <a
                    href={map.downloadUrl || map.imageUrl}
                    target="_blank"
                    download
                    rel="noopener noreferrer"
                    className="py-2 px-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 shadow-md shadow-emerald-600/20"
                  >
                    <Download className="w-3.5 h-3.5" /> Descargar {map.format}
                  </a>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* 🦊 TAB 3 & 🌲 TAB 4: FAUNA Y FLORA FUEGUINA */}
      {(activeTab === 'fauna' || activeTab === 'flora') && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {(activeTab === 'fauna' ? filteredFauna : filteredFlora).map((sp, idx) => (
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.04 }}
              key={sp.id}
              className="bg-white dark:bg-[#111114] border border-slate-200 dark:border-white/10 rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 flex flex-col justify-between group"
            >
              <div className="relative aspect-[16/10] overflow-hidden bg-slate-900">
                <img
                  src={sp.imageUrl}
                  alt={sp.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />

                <span className={`absolute top-3 left-3 text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-md border ${sp.statusColor} backdrop-blur-md`}>
                  {sp.status}
                </span>

                <div className="absolute bottom-3 left-3 right-3 flex flex-col">
                  <h3 className="text-lg font-black text-white leading-tight">
                    {sp.name}
                  </h3>
                  <span className="text-[11px] italic text-emerald-300 font-serif">
                    {sp.scientificName}
                  </span>
                </div>
              </div>

              <div className="p-5 flex flex-col gap-3 flex-1 justify-between">
                <div className="flex flex-col gap-2">
                  <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-500 dark:text-gray-400">
                    <MapPin className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                    <span>Hábitat: <strong className="text-slate-800 dark:text-gray-200">{sp.habitat}</strong></span>
                  </div>

                  <p className="text-xs text-slate-600 dark:text-gray-400 leading-relaxed">
                    {sp.description}
                  </p>
                </div>

                <div className="bg-slate-50 dark:bg-white/[0.02] border border-slate-200 dark:border-white/5 rounded-xl p-3 mt-1">
                  <span className="text-[10px] font-black uppercase tracking-wider text-emerald-600 dark:text-emerald-400 flex items-center gap-1 mb-1">
                    <Sparkles className="w-3 h-3" /> Dato destacado
                  </span>
                  <p className="text-[11px] text-slate-600 dark:text-gray-400 italic leading-snug">
                    "{sp.curiosities}"
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* ------------------- MODALS ------------------- */}

      {/* 🔍 MAP ZOOM MODAL */}
      <AnimatePresence>
        {selectedMapZoom && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[120] bg-black/90 backdrop-blur-md flex flex-col items-center justify-between p-4"
            onClick={() => setSelectedMapZoom(null)}
          >
            {/* Top Toolbar */}
            <div 
              className="w-full max-w-5xl flex items-center justify-between bg-slate-900/90 border border-white/10 rounded-2xl p-4 text-white z-10"
              onClick={e => e.stopPropagation()}
            >
              <div className="flex flex-col">
                <h3 className="text-sm font-black uppercase tracking-wider text-emerald-400">
                  {selectedMapZoom.title}
                </h3>
                <span className="text-xs text-gray-400">
                  {selectedMapZoom.source} &bull; Escala {selectedMapZoom.scale || 'Oficial'}
                </span>
              </div>

              {/* Zoom Controls */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setZoomLevel(prev => Math.max(0.5, prev - 0.25))}
                  className="p-2 bg-white/10 hover:bg-white/20 rounded-xl transition-all"
                  title="Alejar (-)"
                >
                  <ZoomOut className="w-4 h-4" />
                </button>
                <span className="text-xs font-mono font-bold w-12 text-center">
                  {Math.round(zoomLevel * 100)}%
                </span>
                <button
                  onClick={() => setZoomLevel(prev => Math.min(3, prev + 0.25))}
                  className="p-2 bg-white/10 hover:bg-white/20 rounded-xl transition-all"
                  title="Acercar (+)"
                >
                  <ZoomIn className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setZoomLevel(1)}
                  className="p-2 bg-white/10 hover:bg-white/20 rounded-xl transition-all"
                  title="Restablecer"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>

                <div className="h-6 w-[1px] bg-white/20 mx-2" />

                <button
                  onClick={() => setSelectedMapZoom(null)}
                  className="p-2 bg-red-600/80 hover:bg-red-600 rounded-xl transition-all text-white"
                  title="Cerrar"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Map Container Viewport */}
            <div 
              className="flex-1 w-full flex items-center justify-center overflow-auto p-4 cursor-grab active:cursor-grabbing"
              onClick={e => e.stopPropagation()}
            >
              <motion.img
                src={selectedMapZoom.imageUrl}
                alt={selectedMapZoom.title}
                style={{ scale: zoomLevel }}
                transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                className="max-h-[85vh] max-w-full object-contain rounded-lg shadow-2xl border border-white/10"
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 🖨️ PRINTABLE A4 PREVIEW MODAL */}
      <AnimatePresence>
        {selectedPrintMap && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[130] bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto"
            onClick={() => setSelectedPrintMap(null)}
          >
            <div
              className="bg-white text-slate-900 w-full max-w-3xl rounded-3xl p-6 md:p-8 flex flex-col gap-6 shadow-2xl border border-slate-300 relative my-8"
              onClick={e => e.stopPropagation()}
            >
              {/* Header Bar Actions */}
              <div className="flex items-center justify-between border-b pb-4 border-slate-200">
                <div className="flex items-center gap-2">
                  <Printer className="w-5 h-5 text-blue-600" />
                  <span className="font-extrabold text-xs uppercase tracking-widest text-slate-600">
                    Vista Previa de Impresión A4
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={executeWindowPrint}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs uppercase tracking-wider rounded-xl transition-all shadow-md flex items-center gap-1.5"
                  >
                    <Printer className="w-4 h-4" /> Imprimir A4 Ahora
                  </button>
                  <button
                    onClick={() => setSelectedPrintMap(null)}
                    className="p-2 text-slate-400 hover:text-slate-700 rounded-xl hover:bg-slate-100"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Exact A4 Sheet Box Layout */}
              <div id="printable-a4-area" className="border border-slate-300 p-6 rounded-2xl flex flex-col gap-4 bg-slate-50">
                {/* Official Branding Header */}
                <div className="flex items-center justify-between border-b border-slate-300 pb-3">
                  <div className="flex flex-col">
                    <span className="text-[10px] font-black text-blue-600 uppercase tracking-widest">
                      PROVINCIA DE TIERRA DEL FUEGO, A.I.A.S.
                    </span>
                    <h2 className="text-base font-black text-slate-900 uppercase">
                      {selectedPrintMap.title}
                    </h2>
                  </div>
                  <span className="text-[9px] font-bold uppercase tracking-wider bg-slate-200 text-slate-700 px-2.5 py-1 rounded">
                    Escala {selectedPrintMap.scale || 'Oficial'}
                  </span>
                </div>

                {/* Map Frame Image */}
                <div className="w-full aspect-[4/3] bg-black rounded-xl overflow-hidden border border-slate-300 flex items-center justify-center">
                  <img
                    src={selectedPrintMap.imageUrl}
                    alt={selectedPrintMap.title}
                    className="w-full h-full object-contain"
                  />
                </div>

                {/* Footer Metadata */}
                <div className="flex items-center justify-between text-[10px] text-slate-600 border-t border-slate-300 pt-3 font-semibold">
                  <span>Fuente: {selectedPrintMap.source}</span>
                  <span>WikiApp TDF PRO &bull; Cartografía Oficial</span>
                  <span>Impresión: {new Date().toLocaleDateString()}</span>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 🥾 TRAIL DETAILS MODAL */}
      <AnimatePresence>
        {selectedTrailModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[120] bg-black/70 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto"
            onClick={() => setSelectedTrailModal(null)}
          >
            <div
              className="bg-white dark:bg-[#121215] text-slate-900 dark:text-white w-full max-w-2xl rounded-3xl p-6 md:p-8 flex flex-col gap-6 shadow-2xl border border-slate-200 dark:border-white/10 relative my-8"
              onClick={e => e.stopPropagation()}
            >
              <div className="flex items-center justify-between border-b pb-4 border-slate-100 dark:border-white/5">
                <div className="flex items-center gap-2">
                  <Mountain className="w-5 h-5 text-emerald-500" />
                  <span className="font-extrabold text-xs uppercase tracking-widest text-emerald-600 dark:text-emerald-400">
                    Ficha Técnica de Senderismo
                  </span>
                </div>
                <button
                  onClick={() => setSelectedTrailModal(null)}
                  className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-white/5"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="flex flex-col gap-4">
                <div className="relative aspect-video rounded-2xl overflow-hidden border border-slate-200 dark:border-white/10">
                  <img src={selectedTrailModal.coverImage} alt={selectedTrailModal.name} className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                  <h2 className="absolute bottom-4 left-4 text-2xl font-black text-white">
                    {selectedTrailModal.name}
                  </h2>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="bg-slate-50 dark:bg-white/5 p-3 rounded-xl border border-slate-200 dark:border-white/5 flex flex-col">
                    <span className="text-[10px] text-slate-400 uppercase font-bold">Dificultad</span>
                    <span className="text-xs font-black text-emerald-500">{selectedTrailModal.difficulty}</span>
                  </div>
                  <div className="bg-slate-50 dark:bg-white/5 p-3 rounded-xl border border-slate-200 dark:border-white/5 flex flex-col">
                    <span className="text-[10px] text-slate-400 uppercase font-bold">Distancia</span>
                    <span className="text-xs font-black">{selectedTrailModal.distance}</span>
                  </div>
                  <div className="bg-slate-50 dark:bg-white/5 p-3 rounded-xl border border-slate-200 dark:border-white/5 flex flex-col">
                    <span className="text-[10px] text-slate-400 uppercase font-bold">Tiempo Est.</span>
                    <span className="text-xs font-black">{selectedTrailModal.duration}</span>
                  </div>
                  <div className="bg-slate-50 dark:bg-white/5 p-3 rounded-xl border border-slate-200 dark:border-white/5 flex flex-col">
                    <span className="text-[10px] text-slate-400 uppercase font-bold">Desnivel</span>
                    <span className="text-xs font-black">{selectedTrailModal.elevation}</span>
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  <h4 className="text-xs font-black uppercase text-slate-400 tracking-wider">Equipamiento Obligatorio</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {selectedTrailModal.equipment.map((eq, i) => (
                      <div key={i} className="flex items-center gap-2 text-xs font-semibold text-slate-700 dark:text-gray-300 bg-slate-50 dark:bg-white/[0.02] p-2.5 rounded-xl border border-slate-200 dark:border-white/5">
                        <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                        <span>{eq}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <a
                  href="https://findelmundo.tur.ar/es/registro-de-senderistas"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-black text-xs uppercase tracking-wider text-center transition-all shadow-lg shadow-emerald-600/30 flex items-center justify-center gap-2 mt-2"
                >
                  <ShieldAlert className="w-4 h-4" /> Completar Registro Oficial de Senderista
                </a>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
