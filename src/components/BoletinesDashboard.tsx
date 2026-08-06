'use client';

import React, { useState, useMemo } from 'react';
import { 
  Building, 
  Search, 
  FileText, 
  ExternalLink, 
  Download, 
  Calendar, 
  MapPin, 
  Info,
  Scale,
  Sparkles,
  BookOpen,
  Share2,
  FolderOpen,
  Eye,
  X,
  Copy,
  Check,
  Globe,
  Shield,
  FileCheck,
  ChevronRight,
  Calculator,
  Send,
  Bot,
  User,
  MessageSquare,
  Loader2,
  ZoomIn,
  ZoomOut,
  ChevronLeft,
  Printer
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface PoliceAnalysis {
  norma: string;
  queDice: string;
  queCambia: string;
  queImpacta: string;
  articulos: string;
  hasImpact: boolean;
  noImpactList?: Array<{ titulo: string; acto: string; fecha: string }>;
}

interface BulletinItem {
  id: string;
  type: 'decreto' | 'ley' | 'ordenanza' | 'resolucion' | 'general';
  number: string;
  date: string;
  year: string;
  month: string;
  title: string;
  summary?: string;
  publisher: 'provincia' | 'legislativo' | 'ushuaia' | 'riogrande' | 'tolhuin';
  url: string;
  driveFileId?: string;
  policeAnalysis?: PoliceAnalysis;
}

interface LegalDocItem {
  id: string;
  category: 'tratados' | 'nacionales' | 'provinciales' | 'policial';
  number: string;
  title: string;
  summary: string;
  url: string;
  details?: string[];
  country?: string;
  flag?: string;
}

export default function BoletinesDashboard() {
  const [activeMainTab, setActiveMainTab] = useState<'boletines' | 'guia_legal' | 'asistente_ia'>('boletines');
  
  // Boletines state
  const [activePublisher, setActivePublisher] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [tdfExplorerMode, setTdfExplorerMode] = useState<'native' | 'drive'>('native');
  const [selectedYear, setSelectedYear] = useState<string>('all');
  const [showPoliceExplorer, setShowPoliceExplorer] = useState(false);
  const [selectedBulletin, setSelectedBulletin] = useState<BulletinItem | null>(null);
  const [policeExplorerYear, setPoliceExplorerYear] = useState<string>('all');
  const [policeExplorerMonth, setPoliceExplorerMonth] = useState<string>('all');
  
  // Guia Legal state
  const [legalCategory, setLegalCategory] = useState<string>('all');
  const [legalSearch, setLegalSearch] = useState<string>('');
  const [selectedLaw, setSelectedLaw] = useState<LegalDocItem | null>(null);

  // Calculator state for Police retirement
  const [serviceYears, setServiceYears] = useState<number>(25);
  const [isPenitentiary, setIsPenitentiary] = useState<boolean>(false);
  
  // Modal & Toast states
  const [previewFile, setPreviewFile] = useState<{ title: string; url: string; driveFileId?: string; item?: BulletinItem } | null>(null);
  const [previewViewMode, setPreviewViewMode] = useState<'pdf' | 'drive'>('pdf');
  const [pdfPage, setPdfPage] = useState<number>(1);
  const [pdfZoom, setPdfZoom] = useState<number>(100);
  const [showShareToast, setShowShareToast] = useState<string | null>(null);

  const tdfDriveFolderUrl = 'https://drive.google.com/drive/folders/12GrKybtm4cWyS6Ib_DnbwKAQ6JvQHCU6';

  const publishersInfo = [
    { 
      id: 'provincia', 
      name: 'Gobierno de Tierra del Fuego', 
      short: 'Provincial',
      logoText: 'GP',
      desc: 'Boletín Oficial de la Provincia de Tierra del Fuego, Antártida e Islas del Atlántico Sur.',
      url: tdfDriveFolderUrl,
      system: 'Repositorio Google Drive / DeCoLey',
      icon: Building,
      color: 'from-blue-500 to-indigo-600',
      badgeColor: 'bg-blue-500/10 text-blue-500 dark:text-blue-400'
    },
    { 
      id: 'legislativo', 
      name: 'Poder Legislativo Provincial', 
      short: 'Legislatura',
      logoText: 'PL',
      desc: 'Leyes provinciales, resoluciones de presidencia y convocatorias del poder legislativo.',
      url: 'https://www.legistdf.gob.ar/',
      system: 'Portal Legislativo de Consulta de Leyes y Resoluciones',
      icon: Scale,
      color: 'from-amber-500 to-orange-600',
      badgeColor: 'bg-amber-500/10 text-amber-500 dark:text-amber-400'
    },
    { 
      id: 'ushuaia', 
      name: 'Municipalidad de Ushuaia', 
      short: 'Ushuaia',
      logoText: 'MU',
      desc: 'Boletines oficiales municipales, ordenanzas del Concejo Deliberante y decretos del ejecutivo.',
      url: 'https://www.ushuaia.gob.ar/',
      system: 'Boletín Oficial Municipal - Archivo Digital de Decretos y Ordenanzas',
      icon: MapPin,
      color: 'from-emerald-500 to-teal-600',
      badgeColor: 'bg-emerald-500/10 text-emerald-500 dark:text-emerald-400'
    },
    { 
      id: 'riogrande', 
      name: 'Municipalidad de Río Grande', 
      short: 'Río Grande',
      logoText: 'RG',
      desc: 'Decretos municipales, licitaciones públicas, ordenanzas fiscales y de planeamiento urbano.',
      url: 'https://www.riogrande.gob.ar/',
      system: 'Portal Institucional y Boletín Oficial Municipal',
      icon: MapPin,
      color: 'from-sky-500 to-blue-600',
      badgeColor: 'bg-sky-500/10 text-sky-500 dark:text-sky-400'
    },
    { 
      id: 'tolhuin', 
      name: 'Municipalidad de Tolhuin', 
      short: 'Tolhuin',
      logoText: 'MT',
      desc: 'Decretos ejecutivos locales, resoluciones administrativas y actas del Concejo Deliberante.',
      url: 'https://tolhuin.gob.ar/boletin-oficial/',
      system: 'Boletines Oficiales y Resoluciones del Municipio de Tolhuin',
      icon: MapPin,
      color: 'from-rose-500 to-red-600',
      badgeColor: 'bg-rose-500/10 text-rose-500 dark:text-rose-400'
    }
  ];

  const MONTHS: Record<string,string> = { '01':'Enero','02':'Febrero','03':'Marzo','04':'Abril','05':'Mayo','06':'Junio','07':'Julio','08':'Agosto','09':'Septiembre','10':'Octubre','11':'Noviembre','12':'Diciembre' };

  const bulletinsDb: BulletinItem[] = [
    // Provincia - 2026
    {
      id: 'prov-2026-1', type: 'decreto', number: 'Boletín N° 3610',
      date: '2026-06-12', year: '2026', month: '06',
      title: 'Boletín Oficial TDF N° 3610 — Decretos, Resoluciones Ministeriales y Convocatorias.',
      publisher: 'provincia', url: tdfDriveFolderUrl, driveFileId: '12GrKybtm4cWyS6Ib_DnbwKAQ6JvQHCU6',
      policeAnalysis: {
        hasImpact: true,
        norma: 'Boletín N° 3610 — Decreto del P.E. (12/06/2026)',
        queDice: 'Decreto de designación interina de un funcionario en el área de Seguridad Interior y resolución ministerial de ascenso por mérito extraordinario al grado de Comisario Mayor.',
        queCambia: 'Modifica la estructura de conducción policial a nivel ministerial. Incorpora un comisario mayor a la jefatura operativa provincial.',
        queImpacta: 'El personal de la jerarquía de Comisario ve alterada la línea de mando directa. Posible efecto en destinos y comisiones de servicio.',
        articulos: 'Arts. 3°, 7° y Anexo I del Decreto. Res. Min. Seguridad N° 214/2026.',
        noImpactList: []
      }
    },
    {
      id: 'prov-2026-2', type: 'resolucion', number: 'Boletín N° 3609',
      date: '2026-06-05', year: '2026', month: '06',
      title: 'Boletín Oficial TDF N° 3609 — Adjudicaciones, Licitaciones y Leyes Provinciales promulgadas.',
      publisher: 'provincia', url: tdfDriveFolderUrl, driveFileId: '12GrKybtm4cWyS6Ib_DnbwKAQ6JvQHCU6',
      policeAnalysis: {
        hasImpact: false,
        norma: 'Boletín N° 3609',
        queDice: '', queCambia: '', queImpacta: '', articulos: '',
        noImpactList: [
          { titulo: 'Adjudicación Licitación Pública N° 08/2026 — Obra vial Ruta N° 3', acto: 'Decreto PE N° 512/2026', fecha: '2026-06-05' },
          { titulo: 'Promulgación Ley Provincial N° 1581 — Presupuesto Complementario', acto: 'Ley N° 1581', fecha: '2026-06-03' },
          { titulo: 'Resolución Ministerio de Educación — Apertura inscripción docente 2026', acto: 'Res. Min. Educación N° 188/2026', fecha: '2026-06-04' },
        ]
      }
    },
    {
      id: 'prov-2026-3', type: 'decreto', number: 'Boletín N° 3608',
      date: '2026-05-29', year: '2026', month: '05',
      title: 'Boletín Oficial TDF N° 3608 — Decretos del Poder Ejecutivo e informes institucionales.',
      publisher: 'provincia', url: tdfDriveFolderUrl, driveFileId: '12GrKybtm4cWyS6Ib_DnbwKAQ6JvQHCU6',
      policeAnalysis: {
        hasImpact: true,
        norma: 'Boletín N° 3608 — Decreto PE N° 498/2026 (29/05/2026)',
        queDice: 'Decreto que aprueba el escalafón salarial actualizado del personal policial activo y pasivo, con incremento del 18% en los adicionales especiales por zona austral.',
        queCambia: 'Actualización de la grilla salarial policial. Modifica haberes activos y, por movilidad 82% Ley 819, impacta en los pasivos.',
        queImpacta: 'Todo el personal activo percibe incremento en adicionales de zona. Retirados y pensionados ven actualizado su haber por movilidad automática.',
        articulos: 'Art. 1° al 5° del Decreto 498/2026. Anexo I — Planilla salarial actualizada.',
        noImpactList: []
      }
    },
    // Provincia - 2025
    {
      id: 'prov-2025-1', type: 'decreto', number: 'Boletín N° 3550',
      date: '2025-12-19', year: '2025', month: '12',
      title: 'Boletín Oficial TDF N° 3550 — Edición Especial de Cierre de Ejercicio y Normativas Generales.',
      publisher: 'provincia', url: tdfDriveFolderUrl, driveFileId: '12GrKybtm4cWyS6Ib_DnbwKAQ6JvQHCU6',
      policeAnalysis: {
        hasImpact: true,
        norma: 'Boletín N° 3550 — Decretos PE N° 1101 y 1102/2025 (19/12/2025)',
        queDice: 'Retiro voluntario de 3 oficiales con 25 años de servicio. Designación de nuevas autoridades en la Jefatura de la Policía de TDF para el ejercicio 2026.',
        queCambia: 'Cambio en la conducción institucional de la fuerza. Vacantes en escalafón de Oficiales Superiores cubiertas por concurso de méritos.',
        queImpacta: 'Personal retirado: inicia percepción del 82% móvil. Oficiales ascendidos: nuevos destinos y responsabilidades de mando.',
        articulos: 'Decreto N° 1101/2025 (retiros). Decreto N° 1102/2025 (designaciones). Resolución Min. Seguridad N° 412/2025.',
        noImpactList: []
      }
    },
    // Provincia - 2024
    {
      id: 'prov-2024-1', type: 'decreto', number: 'Boletín N° 3480',
      date: '2024-12-20', year: '2024', month: '12',
      title: 'Boletín Oficial TDF N° 3480 — Presupuesto General y Anexos Impositivos.',
      publisher: 'provincia', url: tdfDriveFolderUrl, driveFileId: '12GrKybtm4cWyS6Ib_DnbwKAQ6JvQHCU6',
      policeAnalysis: {
        hasImpact: true,
        norma: 'Boletín N° 3480 — Ley de Presupuesto Provincial 2025',
        queDice: 'Aprobación del Presupuesto General 2025 con partidas específicas para el Ministerio de Seguridad: equipamiento, infraestructura y fondo de capacitación policial.',
        queCambia: 'Asignación presupuestaria 2025 para la fuerza. Define el techo de gasto en personal, bienes y servicios policiales.',
        queImpacta: 'Incide en disponibilidad de recursos para capacitación, uniformes, armamento y vehículos operativos del personal policial.',
        articulos: 'Anexo III — Planilla de gastos Ministerio de Seguridad. Art. 18° — Fondo de capacitación fuerzas de seguridad.',
        noImpactList: []
      }
    },
    // Provincia - 2023
    {
      id: 'prov-2023-1', type: 'decreto', number: 'Boletín N° 3370',
      date: '2023-12-22', year: '2023', month: '12',
      title: 'Boletín Oficial TDF N° 3370 — Decretos Reglamentarios de Estructura de Ministerios.',
      publisher: 'provincia', url: tdfDriveFolderUrl, driveFileId: '12GrKybtm4cWyS6Ib_DnbwKAQ6JvQHCU6',
      policeAnalysis: {
        hasImpact: true,
        norma: 'Boletín N° 3370 — Decreto PE N° 2210/2023 (22/12/2023)',
        queDice: 'Reestructuración del organigrama del Ministerio de Seguridad. Crea la Subsecretaría de Inteligencia Criminal y modifica la dependencia orgánica de la Policía Provincial.',
        queCambia: 'Reforma de la estructura orgánica policial. La nueva Subsecretaría concentra funciones de análisis e inteligencia criminal provincial.',
        queImpacta: 'Personal con funciones de inteligencia: nuevos cargos, responsabilidades y línea de reporte. Impacto en destinos de oficiales especializados.',
        articulos: 'Arts. 1° a 9° del Decreto 2210/2023. Anexo Organigrama — Ministerio de Seguridad TDF.',
        noImpactList: []
      }
    },
    // Provincia - 2022
    {
      id: 'prov-2022-1', type: 'decreto', number: 'Boletín N° 3260',
      date: '2022-12-16', year: '2022', month: '12',
      title: 'Boletín Oficial TDF N° 3260 — Normativa de fomento a la producción local.',
      publisher: 'provincia', url: tdfDriveFolderUrl, driveFileId: '12GrKybtm4cWyS6Ib_DnbwKAQ6JvQHCU6',
      policeAnalysis: {
        hasImpact: false,
        norma: 'Boletín N° 3260',
        queDice: '', queCambia: '', queImpacta: '', articulos: '',
        noImpactList: [
          { titulo: 'Decreto PE N° 1980/2022 — Régimen de fomento industria local', acto: 'Decreto N° 1980/2022', fecha: '2022-12-16' },
          { titulo: 'Resolución Min. Economía — Exención impositiva sector tecnológico', acto: 'Res. N° 890/2022', fecha: '2022-12-14' },
          { titulo: 'Convocatoria concurso público — Cargos Ministerio de Producción', acto: 'Resolución N° 345/2022', fecha: '2022-12-10' },
        ]
      }
    },
    // Legislativo
    {
      id: 'leg-1', type: 'ley', number: 'Ley Provincial 1582',
      date: '2026-06-05', year: '2026', month: '06',
      title: 'Declaración de Interés Provincial del plan integral de conservación del ecosistema de turberas.',
      publisher: 'legislativo', url: 'https://www.legistdf.gob.ar/'
    },
    // Municipales - Ushuaia
    {
      id: 'ush-1', type: 'ordenanza', number: 'Ordenanza Municipal 6230',
      date: '2026-06-09', year: '2026', month: '06',
      title: 'Establecimiento del Plan Estratégico de Ordenamiento Territorial y Nuevos Códigos de Edificación.',
      publisher: 'ushuaia', url: 'https://www.ushuaia.gob.ar/'
    },
    // Municipales - Tolhuin
    {
      id: 'tol-1', type: 'ordenanza', number: 'Ordenanza Municipal 1240/2026',
      date: '2026-06-12', year: '2026', month: '06',
      title: 'Creación del Registro Único de Emprendedores y Artesanos Locales con acceso a créditos blandos municipales.',
      summary: 'Incentiva la producción artesanal local y define líneas de financiamiento subsidiado directas para microemprendedores de la comuna.',
      publisher: 'tolhuin', url: 'https://tolhuin.gob.ar/boletin-oficial/'
    },
    {
      id: 'tol-2', type: 'decreto', number: 'Decreto Municipal 198/2026',
      date: '2026-06-02', year: '2026', month: '06',
      title: 'Aprobación del Plan de Reforestación y Cuidado Biológico del Bosque Andino Patagónico en la cuenca del Lago Fagnano.',
      summary: 'Establece pautas obligatorias de regeneración de flora nativa y penalizaciones para la tala de árboles milenarios.',
      publisher: 'tolhuin', url: 'https://tolhuin.gob.ar/boletin-oficial/'
    },
    {
      id: 'tol-3', type: 'resolucion', number: 'Resolución Municipal 085/2026',
      date: '2026-05-26', year: '2026', month: '05',
      title: 'Adjudicación de obras de tendido eléctrico y extensión de redes de servicios básicos en barrios de Tolhuin.',
      summary: 'Asigna fondos para el soterramiento y distribución eléctrica en zonas periurbanas de crecimiento demográfico reciente.',
      publisher: 'tolhuin', url: 'https://tolhuin.gob.ar/boletin-oficial/'
    },
    {
      id: 'tol-4', type: 'ordenanza', number: 'Ordenanza Municipal 1238/2026',
      date: '2026-05-18', year: '2026', month: '05',
      title: 'Regulación y tarifas del servicio de recolección de residuos áridos e industriales y zonificación de depósitos transitorios.',
      summary: 'Define el marco operativo de higiene urbana aplicable a industrias madereras y turberas del ejido urbano.',
      publisher: 'tolhuin', url: 'https://tolhuin.gob.ar/boletin-oficial/'
    },
    {
      id: 'tol-5', type: 'decreto', number: 'Decreto Municipal 182/2026',
      date: '2026-05-10', year: '2026', month: '05',
      title: 'Llamado a licitación pública para la adquisición de maquinaria vial pesada destinada al mantenimiento de calles.',
      summary: 'Proceso de compra pública de motoniveladoras y palas cargadoras con equipamiento invernal de despeje de nieve.',
      publisher: 'tolhuin', url: 'https://tolhuin.gob.ar/boletin-oficial/'
    }
  ];


  // LEGAL GUIDE DATABASE
  const legalDocsDb: LegalDocItem[] = [
    // --- TRATADOS INTERNACIONALES ---
    {
      id: 'tr-1',
      category: 'tratados',
      number: 'Pacto de San José de Costa Rica',
      title: 'Convención Americana sobre Derechos Humanos',
      summary: 'Tratado internacional fundamental de la OEA con jerarquía constitucional en Argentina. Establece derechos de libertad personal, garantías judiciales y protección legal.',
      url: 'https://servicios.infoleg.gob.ar/infolegInternet/anexos/0-4999/18/norma.htm',
      country: 'Argentina / OEA',
      flag: '🇦🇷',
      details: [
        'Jerarquía constitucional en Argentina según el Art. 75, inc. 22 de la Constitución Nacional.',
        'Establece el derecho a la vida, la integridad y la libertad personal.',
        'Garantiza las debidas garantías judiciales (plazo razonable, presunción de inocencia).',
        'Consagra la prohibición de la tortura y tratos crueles, inhumanos o degradantes.'
      ]
    },
    {
      id: 'tr-2',
      category: 'tratados',
      number: 'Tratado de Paz y Amistad de 1984',
      title: 'Tratado de Paz y Amistad entre Argentina y Chile',
      summary: 'Acuerdo histórico binacional clave para Tierra del Fuego. Delimitó la frontera marítima del Canal de Beagle e islas del sur, garantizando la paz permanente entre ambos países.',
      url: 'https://servicios.infoleg.gob.ar/infolegInternet/anexos/25000-29999/28224/norma.htm',
      country: 'Argentina / Chile',
      flag: '🇦🇷',
      details: [
        'Firmado bajo la mediación papal de Juan Pablo II.',
        'Definió los límites de soberanía en la zona del Canal Beagle y del Cabo de Hornos.',
        'Estableció la libre navegación para buques de todas las banderas en las zonas demarcadas.',
        'Incluye un sistema de solución pacífica de controversias jurídicas obligatoria.'
      ]
    },
    {
      id: 'tr-3',
      category: 'tratados',
      number: 'Declaración Universal de los Derechos Humanos',
      title: 'Declaración Universal de los DD.HH. - ONU',
      summary: 'Documento fundacional global adoptado por la Asamblea General de la ONU. Proclama los derechos inalienables de todos los seres humanos independientemente de su nacionalidad.',
      url: 'https://www.un.org/es/about-us/universal-declaration-of-human-rights',
      country: 'Global / ONU',
      flag: '🇺🇳',
      details: [
        'Adoptada en París el 10 de diciembre de 1948.',
        'Contiene 30 artículos con libertades y derechos civiles, políticos, económicos y culturales.',
        'Sirve como base de todos los tratados internacionales de derechos humanos modernos.',
        'Reconoce la dignidad intrínseca de todas las personas.'
      ]
    },

    // --- LEYES NACIONALES ---
    {
      id: 'nac-1',
      category: 'nacionales',
      number: 'Constitución Nacional',
      title: 'Constitución de la Nación Argentina',
      summary: 'Ley fundamental de la República Argentina. Establece la forma de gobierno representativa, republicana y federal, y la primera parte de declaraciones, derechos y garantías.',
      url: 'https://servicios.infoleg.gob.ar/infolegInternet/anexos/0-4999/171/norma.htm',
      details: [
        'Sancionada originalmente en 1853, reformada en 1994.',
        'Art. 14: Derechos individuales (trabajar, navegar, peticionar, asociarse).',
        'Art. 14 bis: Protección del trabajo, convenios, seguro social y jubilaciones.',
        'Art. 75 inc. 22: Otorga jerarquía constitucional a tratados internacionales clave.'
      ]
    },
    {
      id: 'nac-2',
      category: 'nacionales',
      number: 'Ley N° 26.994',
      title: 'Código Civil y Comercial de la Nación',
      summary: 'Norma que unifica y regula todas las relaciones jurídicas privadas de las personas en la Argentina, desde el nacimiento hasta las relaciones contractuales y reales.',
      url: 'https://servicios.infoleg.gob.ar/infolegInternet/anexos/235000-239999/235971/norma.htm',
      details: [
        'Vigente desde el 1° de agosto de 2015.',
        'Regula la capacidad de las personas jurídicas y físicas.',
        'Unifica las obligaciones civiles y comerciales en un único cuerpo normativo.',
        'Protege la vivienda, derechos del consumidor y regula las relaciones familiares.'
      ]
    },
    {
      id: 'nac-3',
      category: 'nacionales',
      number: 'Ley N° 24.059',
      title: 'Ley de Seguridad Interior de la Nación',
      summary: 'Establece las bases jurídicas, orgánicas y funcionales del sistema de seguridad interior para resguardar la vida, la libertad y el patrimonio de los habitantes.',
      url: 'https://servicios.infoleg.gob.ar/infolegInternet/anexos/0-4999/262/norma.htm',
      details: [
        'Define el rol de las fuerzas policiales provinciales y de seguridad federales.',
        'Establece el Consejo de Seguridad Interior para coordinar acciones a nivel nacional.',
        'Fija los límites y condiciones para el empleo de las Fuerzas Armadas en seguridad interior.',
        'Determina las pautas de planificación de políticas preventivas coordinadas.'
      ]
    },

    // --- LEYES PROVINCIALES ---
    {
      id: 'prov-l1',
      category: 'provinciales',
      number: 'Constitución de Tierra del Fuego',
      title: 'Constitución Provincial de Tierra del Fuego, Antártida e I.A.S.',
      summary: 'Carta Magna de la provincia. Sancionada en 1991 tras la provincialización de la isla. Establece la autonomía, organización del poder y los derechos especiales de los fueguinos.',
      url: 'https://www.legistdf.gob.ar/lp/constitucion/Constitucion%20Provincial.pdf',
      details: [
        'Sancionada el 1° de Junio de 1991 en Ushuaia.',
        'Establece las bases para la autonomía de los municipios y la creación de sus cartas orgánicas.',
        'Dedica apartados al cuidado de los recursos naturales y la soberanía del sector antártico.',
        'Regula el funcionamiento de la Legislatura unicameral y del Poder Judicial local.'
      ]
    },
    {
      id: 'prov-l2',
      category: 'provinciales',
      number: 'Ley Nacional N° 19.640',
      title: 'Régimen de Promoción Industrial y Fiscal de Tierra del Fuego',
      summary: 'Ley nacional fundamental para el desarrollo geopolítico y económico de la provincia. Establece la liberación de impuestos nacionales y aranceles a la importación.',
      url: 'https://servicios.infoleg.gob.ar/infolegInternet/anexos/105000-109999/108990/norma.htm',
      details: [
        'Sancionada en 1972 con carácter geopolítico de poblamiento y soberanía.',
        'Exime de impuestos nacionales (IVA, Ganancias, Bienes Personales) a residentes y empresas.',
        'Permite la importación de insumos extranjeros sin aranceles bajo el Área Aduanera Especial (AAE).',
        'Clave para la radicación del polo de fabricación tecnológica en Río Grande y Ushuaia.'
      ]
    },

    // --- SEGURIDAD Y RETIRO POLICIAL (TDF) ---
    {
      id: 'pol-1',
      category: 'policial',
      number: 'Ley Provincial N° 819',
      title: 'Régimen de Retiros y Pensiones del Personal Policial y Penitenciario',
      summary: 'Ley provincial fundamental que regula el derecho al retiro voluntario, retiro obligatorio y las pensiones de derechohabientes para el personal policial y penitenciario de TDF.',
      url: 'https://www.legistdf.gob.ar/lp/leyes/provinciales/XXI/Ley819.pdf',
      details: [
        'Establece que el retiro voluntario es un derecho con 25 años de servicios efectivos continuos o alternados (mínimo 15 en la provincia).',
        'Consagra el beneficio del 82% móvil del haber para el cálculo básico de retiro voluntario.',
        'Regula la movilidad jubilatoria directa vinculada a los aumentos salariales del personal en actividad.',
        'Establece los regímenes proporcionales por retiro obligatorio por incapacidad o límite de edad.'
      ]
    },
    {
      id: 'pol-2',
      category: 'policial',
      number: 'Ley Provincial N° 1360',
      title: 'Modificación de Movilidad y Liquidación a la Ley 819',
      summary: 'Actualización legislativa que modificó pautas de liquidación de haberes para retirados, garantizando la velocidad en el traslado de aumentos de activos a pasivos policiales.',
      url: 'https://www.legistdf.gob.ar/lp/leyes/provinciales/XXVIII/Ley1360.pdf',
      details: [
        'Acelera los plazos para que la Caja de Previsión (CPSPTDF) aplique los aumentos acordados.',
        'Garantiza la estricta proporcionalidad del escalafón con el personal policial activo.',
        'Aclara el cómputo de ciertos adicionales especiales creados con posterioridad a la Ley 819.'
      ]
    },
    {
      id: 'pol-3',
      category: 'policial',
      number: 'Ley Territorial N° 350',
      title: 'Ley Orgánica del Personal de la Policía del Ex-Territorio',
      summary: 'Normativa histórica de la época del Territorio Nacional de Tierra del Fuego. Clave para el reconocimiento de antigüedad, jerarquías y servicios del personal transferido en la transición a provincia.',
      url: 'https://www.legistdf.gob.ar/lp/leyes/territoriales/LeyT350.pdf',
      details: [
        'Reguló a la policía territorial hasta la provincialización e instalación de la Ley Orgánica 735.',
        'Reconocida para el cómputo del retiro y antigüedad del personal policial que inició su carrera antes de 1991.',
        'Fijó el régimen disciplinario y de ascensos histórico del ex-territorio nacional.'
      ]
    },
    {
      id: 'pol-4',
      category: 'policial',
      number: 'Ley Provincial N° 735',
      title: 'Ley Orgánica de la Policía de la Provincia de Tierra del Fuego',
      summary: 'Determina las misiones, atribuciones, deberes y organización jerárquica de la Policía de la provincia, subordinada al Poder Ejecutivo Provincial.',
      url: 'https://www.legistdf.gob.ar/lp/leyes/provinciales/XXI/Ley735.pdf',
      details: [
        'Establece la estructura orgánica: Jefatura, Subjefatura y Direcciones Generales.',
        'Fija el estado policial y los deberes éticos y operativos obligatorios del uniformado.',
        'Regula la atribución preventiva y represiva en carácter de auxiliar de la justicia local.'
      ]
    },
    {
      id: 'pol-5',
      category: 'policial',
      number: 'Ley Provincial N° 760',
      title: 'Ley Orgánica del Servicio Penitenciario de Tierra del Fuego',
      summary: 'Regula las bases del Servicio Penitenciario Provincial, sus misiones de custodia de internos, reinserción y administración de complejos carcelarios.',
      url: 'https://www.legistdf.gob.ar/lp/leyes/provinciales/XXI/Ley760.pdf',
      details: [
        'Crea el Servicio Penitenciario dependiente del Ministerio de Gobierno.',
        'Asimila el escalafón jerárquico y el régimen disciplinario para el personal penitenciario.',
        'Adhiere formalmente al régimen de retiros establecido por la Ley 819.'
      ]
    }
  ];

  const filteredBulletins = useMemo(() => {
    return bulletinsDb.filter(item => {
      const matchesPublisher = activePublisher === 'all' || item.publisher === activePublisher;
      const matchesYear = activePublisher !== 'provincia' || selectedYear === 'all' || item.year === selectedYear;
      const matchesSearch = item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            item.number.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            item.date.includes(searchTerm) ||
                            (item.summary && item.summary.toLowerCase().includes(searchTerm.toLowerCase()));
      return matchesPublisher && matchesYear && matchesSearch;
    });
  }, [activePublisher, selectedYear, searchTerm]);

  const filteredLaws = useMemo(() => {
    return legalDocsDb.filter(doc => {
      const matchesCat = legalCategory === 'all' || doc.category === legalCategory;
      const matchesSearch = doc.title.toLowerCase().includes(legalSearch.toLowerCase()) ||
                            doc.number.toLowerCase().includes(legalSearch.toLowerCase()) ||
                            doc.summary.toLowerCase().includes(legalSearch.toLowerCase());
      return matchesCat && matchesSearch;
    });
  }, [legalCategory, legalSearch]);

  const handleShare = (item: { number: string; url: string }) => {
    const text = `Te comparto: ${item.number}. Consúltalo aquí: ${item.url}`;
    
    if (navigator.share) {
      navigator.share({
        title: item.number,
        text: text,
        url: item.url
      }).catch(err => console.log(err));
    } else {
      navigator.clipboard.writeText(item.url);
      setShowShareToast(item.number);
      setTimeout(() => setShowShareToast(null), 3000);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setShowShareToast("Enlace copiado");
    setTimeout(() => setShowShareToast(null), 3000);
  };

  // Asistente IA Chatbot State
  const [chatMessages, setChatMessages] = useState<Array<{
    role: 'user' | 'assistant';
    text: string;
    sources?: Array<{ id: string; numero: string; publisher: string; fecha: string; pagina: number; score: number }>;
  }>>([
    {
      role: 'assistant',
      text: '¡Hola! Soy tu Asistente Legal Inteligente para los Boletines Oficiales de Tierra del Fuego. Pregúntame lo que necesites buscar dentro de la normativa o documentos oficiales, y te responderé con la cita de las fuentes correspondientes.',
    }
  ]);
  const [chatInput, setChatInput] = useState('');
  const [isChatLoading, setIsChatLoading] = useState(false);
  const [chatPublisherFilter, setChatPublisherFilter] = useState('all');

  const handleSendChatMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const query = chatInput.trim();
    if (!query) return;

    const newMessages = [...chatMessages, { role: 'user' as const, text: query }];
    setChatMessages(newMessages);
    setChatInput('');
    setIsChatLoading(true);

    try {
      const response = await fetch('/api/chat-boletines', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: query,
          publisher: chatPublisherFilter,
        }),
      });

      if (!response.ok) {
        throw new Error('Error al conectar con el servidor.');
      }

      const data = await response.json();
      setChatMessages([
        ...newMessages,
        {
          role: 'assistant',
          text: data.answer,
          sources: data.sources,
        },
      ]);
    } catch (error: any) {
      console.error('Error in chat request:', error);
      setChatMessages([
        ...newMessages,
        {
          role: 'assistant',
          text: 'Lo siento, ocurrió un error al procesar tu consulta con la IA. Asegúrate de haber indexado los PDFs primero y que la API Key de Gemini esté configurada.',
        },
      ]);
    } finally {
      setIsChatLoading(false);
    }
  };

  // Google Drive folder embed URL
  const driveEmbedUrl = `https://drive.google.com/embeddedfolderview?id=12GrKybtm4cWyS6Ib_DnbwKAQ6JvQHCU6#grid`;

  // Calculated retirement percentage
  const calculatedBenefit = useMemo(() => {
    if (serviceYears < 15) return { percentage: 0, text: 'No computa retiro voluntario básico (mínimo provincial no cumplido)' };
    if (serviceYears < 20) return { percentage: 55, text: 'Retiro voluntario proporcional (requiere aportes adicionales)' };
    if (serviceYears < 25) return { percentage: 70, text: 'Retiro voluntario proporcional' };
    if (serviceYears === 25) return { percentage: 82, text: 'Retiro Voluntario Completo (Ley 819) - 82% móvil garantizado' };
    if (serviceYears > 25) {
      const extra = Math.min(100, 82 + (serviceYears - 25) * 2);
      return { percentage: extra, text: `Retiro Voluntario con años excedentes (${extra}% móvil)` };
    }
    return { percentage: 82, text: 'Régimen general Ley 819' };
  }, [serviceYears]);

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col gap-6 md:gap-8 pb-20 max-w-[100vw] overflow-x-hidden"
    >
      {/* SEGMENTED MAIN TABS */}
      <div className="flex bg-slate-100 dark:bg-white/5 p-1 rounded-2xl border border-slate-200 dark:border-white/5 max-w-lg self-center md:self-start w-full">
        <button
          onClick={() => setActiveMainTab('boletines')}
          className={`flex-1 py-2.5 px-3 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer ${
            activeMainTab === 'boletines' 
              ? 'bg-blue-600 text-white shadow-md' 
              : 'text-slate-500 hover:text-slate-800 dark:text-gray-400 dark:hover:text-white'
          }`}
        >
          <div className="flex items-center justify-center gap-1.5">
            <BookOpen className="w-3.5 h-3.5" />
            Boletines
          </div>
        </button>
        <button
          onClick={() => setActiveMainTab('guia_legal')}
          className={`flex-1 py-2.5 px-3 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer ${
            activeMainTab === 'guia_legal' 
              ? 'bg-blue-600 text-white shadow-md' 
              : 'text-slate-500 hover:text-slate-800 dark:text-gray-400 dark:hover:text-white'
          }`}
        >
          <div className="flex items-center justify-center gap-1.5">
            <Scale className="w-3.5 h-3.5" />
            Guía Legal
          </div>
        </button>
        <button
          onClick={() => setActiveMainTab('asistente_ia')}
          className={`flex-1 py-2.5 px-3 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer ${
            activeMainTab === 'asistente_ia' 
              ? 'bg-blue-600 text-white shadow-md' 
              : 'text-slate-500 hover:text-slate-800 dark:text-gray-400 dark:hover:text-white'
          }`}
        >
          <div className="flex items-center justify-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5" />
            Asistente IA
          </div>
        </button>
      </div>

      {activeMainTab === 'boletines' && (
        <>
          {/* HEADER */}
          <header className="flex flex-col gap-2">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-blue-600/20 flex items-center justify-center">
                <BookOpen className="w-5 h-5 text-blue-500" />
              </div>
              <h1 className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white tracking-tighter uppercase font-display">
                Boletines Oficiales
              </h1>
            </div>
            <p className="text-slate-500 dark:text-gray-400 text-sm max-w-2xl">
              Portal de consulta rápida a decretos, resoluciones, ordenanzas y leyes de la provincia de Tierra del Fuego y sus tres municipios.
            </p>
          </header>

          {/* PORTALS CARD SECTION */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 md:gap-6">
            {publishersInfo.map((pub, idx) => {
              const Icon = pub.icon;
              const isActive = activePublisher === pub.id;
              return (
                <motion.div
                  key={pub.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  onClick={() => {
                    setActivePublisher(pub.id);
                    if (pub.id === 'provincia') {
                      setTdfExplorerMode('native');
                      setSelectedYear('all');
                    }
                  }}
                  className={`bg-white dark:bg-[#0e0e0e] border rounded-[2rem] p-5 md:p-6 shadow-xl flex flex-col justify-between hover:border-blue-500/20 transition-all group hover-lift relative overflow-hidden cursor-pointer ${
                    isActive ? 'border-blue-500 ring-2 ring-blue-500/20' : 'border-slate-200 dark:border-[#1f1f1f]'
                  }`}
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-500/0 via-blue-500/0 to-blue-500/[0.02] dark:to-blue-500/[0.03] opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${pub.color} flex items-center justify-center text-white font-black text-base shadow-lg shadow-blue-500/10`}>
                        <Icon className="w-5 h-5 text-white" />
                      </div>
                      <span className={`text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded-md ${pub.badgeColor}`}>
                        {pub.short}
                      </span>
                    </div>
                    
                    <h3 className="text-[14px] font-black text-slate-900 dark:text-white uppercase tracking-wide group-hover:text-blue-500 transition-colors mb-2">
                      {pub.name}
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-gray-400 leading-relaxed mb-4">
                      {pub.desc}
                    </p>
                  </div>

                  <div className="pt-4 border-t border-slate-100 dark:border-white/5 flex flex-col gap-3" onClick={(e) => e.stopPropagation()}>
                    <div className="flex items-center gap-2 text-[10px] text-slate-400">
                      <Info className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                      <span className="truncate">Acceso: {pub.system}</span>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => window.open(pub.url, '_blank')}
                        className="flex-1 flex items-center justify-center gap-2 py-3 px-3 bg-slate-50 hover:bg-blue-600/10 dark:bg-white/5 dark:hover:bg-blue-500/10 text-slate-700 dark:text-gray-300 hover:text-blue-500 dark:hover:text-blue-400 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all border border-slate-200 dark:border-white/10"
                      >
                        Portal Oficial <ExternalLink className="w-3.5 h-3.5" />
                      </button>
                      {pub.id === 'provincia' && (
                        <button
                          onClick={() => { setActivePublisher('provincia'); setTdfExplorerMode('drive'); }}
                          className="flex items-center justify-center p-3 bg-blue-500/10 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400 hover:bg-blue-650 hover:text-white rounded-xl transition-all border border-blue-500/25"
                          title="Explorar Carpeta de Google Drive"
                        >
                          <FolderOpen className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>

          {/* TDF GOVERNMENT BULLETINS CUSTOM EXPLORER */}
          {activePublisher === 'provincia' && (
            <motion.div 
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white dark:bg-[#0e0e0e] border border-slate-200 dark:border-[#1f1f1f] rounded-[2.5rem] overflow-hidden shadow-2xl flex flex-col gap-5 p-6"
            >
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-white/5">
                <div className="flex items-center gap-3">
                  <Building className="w-5 h-5 text-blue-500" />
                  <div className="flex flex-col">
                    <span className="text-[9px] font-black text-slate-400 dark:text-gray-500 uppercase tracking-widest leading-none">GOBIERNO TDF</span>
                    <h2 className="text-[14px] font-black text-slate-900 dark:text-white uppercase tracking-wide mt-1">Explorador de Boletín Oficial</h2>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2 self-start md:self-center">
                  <button
                    onClick={() => setShowPoliceExplorer(true)}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer bg-blue-900/80 hover:bg-blue-800 text-blue-300 border border-blue-700/50 shadow-sm"
                    title="Ver análisis policial de cada boletín"
                  >
                    <Shield className="w-3.5 h-3.5" /> Análisis Policial
                  </button>
                  <div className="flex items-center bg-slate-100 dark:bg-white/5 p-1 rounded-xl border border-slate-200 dark:border-white/5">
                  <button
                    onClick={() => setTdfExplorerMode('native')}
                    className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer ${
                      tdfExplorerMode === 'native' 
                        ? 'bg-blue-600 text-white shadow-sm' 
                        : 'text-slate-500 hover:text-slate-800 dark:text-gray-400 dark:hover:text-white'
                    }`}
                  >
                    Vista por Año
                  </button>
                  <button
                    onClick={() => setTdfExplorerMode('drive')}
                    className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer ${
                      tdfExplorerMode === 'drive' 
                        ? 'bg-blue-600 text-white shadow-sm' 
                        : 'text-slate-500 hover:text-slate-800 dark:text-gray-400 dark:hover:text-white'
                    }`}
                  >
                    Carpeta en Drive
                  </button>
                </div>
              </div>
              </div>

              {tdfExplorerMode === 'drive' ? (
                <div className="flex flex-col gap-4">
                  <div className="flex items-start gap-3 bg-blue-500/5 dark:bg-blue-500/10 border border-blue-500/20 p-4 rounded-2xl text-xs text-slate-700 dark:text-slate-350">
                    <Info className="w-4.5 h-4.5 text-blue-500 shrink-0 mt-0.5" />
                    <div className="flex flex-col gap-1.5">
                      <p className="font-bold">Repositorio Oficial en la Nube</p>
                      <p>Estás navegando la carpeta oficial de Google Drive. Puedes abrir subcarpetas por año, previsualizar directamente y descargar cada PDF utilizando los controles nativos de Google Drive.</p>
                      <a href={tdfDriveFolderUrl} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline font-bold flex items-center gap-1 mt-1">
                        Abrir en pestaña nueva <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  </div>

                  <div className="relative w-full h-[600px] rounded-3xl overflow-hidden border border-slate-200 dark:border-white/10 shadow-inner bg-slate-50 dark:bg-black/25">
                    <iframe
                      src={driveEmbedUrl}
                      className="w-full h-full border-0"
                      title="Google Drive Folder Explorer"
                      allow="autoplay"
                    />
                  </div>
                </div>
              ) : (
                <div className="flex flex-col gap-5">
                  <div className="flex flex-wrap gap-2">
                    {['all', '2026', '2025', '2024', '2023', '2022'].map(year => (
                      <button
                        key={year}
                        onClick={() => setSelectedYear(year)}
                        className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all ${
                          selectedYear === year 
                            ? 'bg-blue-600 text-white shadow-md' 
                            : 'bg-slate-100/80 dark:bg-white/5 text-slate-600 dark:text-gray-400 hover:bg-slate-200/50 dark:hover:bg-white/10'
                        }`}
                      >
                        {year === 'all' ? 'Todos' : year}
                      </button>
                    ))}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {filteredBulletins.map(item => (
                      <div 
                        key={item.id}
                        className="p-4 bg-slate-50 dark:bg-[#161616]/40 border border-slate-200 dark:border-white/5 rounded-2xl flex flex-col justify-between gap-4 shadow-sm hover:border-blue-500/20 transition-all group"
                      >
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-xs font-black text-blue-500 font-mono">
                              {item.number}
                            </span>
                            <span className="text-[10px] font-bold text-slate-400 dark:text-gray-500 font-mono flex items-center gap-1">
                              <Calendar className="w-3.5 h-3.5" />
                              {item.date}
                            </span>
                          </div>
                          <p className="text-xs font-semibold text-slate-700 dark:text-gray-300 leading-relaxed group-hover:text-blue-500 transition-colors">
                            {item.title}
                          </p>
                          {item.summary && (
                            <p className="text-[11px] text-slate-500 dark:text-gray-400 leading-relaxed mt-1 font-medium">
                              {item.summary}
                            </p>
                          )}
                        </div>

                        <div className="flex items-center gap-2 pt-3 border-t border-slate-200/50 dark:border-white/5">
                          <button
                            onClick={() => {
                              setPreviewFile({ title: item.number, url: item.url, driveFileId: item.driveFileId, item });
                              setPreviewViewMode('pdf');
                              setPdfPage(1);
                              setPdfZoom(100);
                            }}
                            className="flex-1 flex items-center justify-center gap-1 py-2 px-3 bg-white dark:bg-white/5 hover:bg-blue-600/10 dark:hover:bg-blue-500/10 text-slate-700 dark:text-gray-300 hover:text-blue-500 dark:hover:text-blue-400 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all border border-slate-200 dark:border-white/10"
                          >
                            <Eye className="w-3.5 h-3.5" /> Vista Previa
                          </button>
                          <button
                            onClick={() => window.open(item.url, '_blank')}
                            className="p-2 bg-white dark:bg-white/5 hover:bg-blue-600/10 dark:hover:bg-blue-500/10 text-slate-700 dark:text-gray-300 hover:text-blue-500 rounded-lg transition-all border border-slate-200 dark:border-white/10"
                          >
                            <Download className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleShare(item)}
                            className="p-2 bg-white dark:bg-white/5 hover:bg-blue-600/10 dark:hover:bg-blue-500/10 text-slate-700 dark:text-gray-300 hover:text-blue-500 rounded-lg transition-all border border-slate-200 dark:border-white/10"
                          >
                            <Share2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          )}

          {/* OTHER PUBLISHERS SEARCHER */}
          {activePublisher !== 'provincia' && (
            <div className="bg-white dark:bg-[#0e0e0e] border border-slate-200 dark:border-[#1f1f1f] rounded-[2.5rem] overflow-hidden shadow-2xl flex flex-col">
              <div className="p-6 border-b border-slate-200 dark:border-[#1f1f1f] bg-slate-50/50 dark:bg-[#0a0a0a]/50 flex flex-col gap-4">
                <div className="flex items-center gap-3">
                  <Sparkles className="w-4 h-4 text-blue-500 animate-pulse" />
                  <h2 className="text-[12px] font-black text-slate-700 dark:text-gray-300 tracking-widest uppercase">
                    Buscador de Normativa Municipal y Legislativa
                  </h2>
                </div>

                <div className="flex flex-col xl:flex-row gap-4 items-stretch xl:items-center">
                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() => setActivePublisher('all')}
                      className={`px-4 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all ${
                        activePublisher === 'all' 
                          ? 'bg-blue-600 text-white shadow-md' 
                          : 'bg-slate-100/80 dark:bg-white/5 text-slate-600 dark:text-gray-400 hover:bg-slate-200/50'
                      }`}
                    >
                      Todos
                    </button>
                    {publishersInfo.map(pub => (
                      <button
                        key={pub.id}
                        onClick={() => {
                          setActivePublisher(pub.id);
                          if (pub.id === 'provincia') {
                            setTdfExplorerMode('native');
                            setSelectedYear('all');
                          }
                        }}
                        className={`px-4 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all ${
                          activePublisher === pub.id 
                            ? 'bg-blue-600 text-white shadow-md' 
                            : 'bg-slate-100/80 dark:bg-white/5 text-slate-600 dark:text-gray-400 hover:bg-slate-200/50'
                        }`}
                      >
                        {pub.short}
                      </button>
                    ))}
                  </div>

                  <div className="relative flex-1 group">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
                    <input
                      type="text"
                      placeholder="Buscar por palabra clave, número o año..."
                      value={searchTerm}
                      onChange={e => setSearchTerm(e.target.value)}
                      className="w-full bg-slate-100/50 dark:bg-black/40 border border-slate-200 dark:border-white/10 rounded-2xl py-3 pl-11 pr-4 text-[13px] font-medium text-slate-800 dark:text-gray-200 placeholder:text-slate-500 focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all"
                    />
                  </div>
                </div>
              </div>

              <div className="p-6 min-h-[300px] flex flex-col gap-4">
                <div className="flex flex-col gap-3">
                  <AnimatePresence mode="popLayout">
                    {filteredBulletins.map((item, idx) => {
                      const pubInfo = publishersInfo.find(p => p.id === item.publisher);
                      return (
                        <motion.div
                          key={item.id}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: 10 }}
                          transition={{ delay: idx * 0.02 }}
                          className="p-4 bg-slate-50 dark:bg-[#161616]/40 border border-slate-200 dark:border-white/5 rounded-2xl hover:border-blue-500/20 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4 group"
                        >
                          <div className="flex items-start gap-4">
                            <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${pubInfo?.color} flex items-center justify-center text-white text-[11px] font-black shrink-0 shadow-sm`}>
                              {pubInfo?.logoText}
                            </div>
                            <div className="flex flex-col min-w-0">
                              <div className="flex items-center gap-2 flex-wrap mb-1">
                                <span className="text-xs font-black text-slate-900 dark:text-white uppercase leading-none font-mono">
                                  {item.number}
                                </span>
                                <span className="text-[9px] font-bold text-slate-400 uppercase font-mono flex items-center gap-1">
                                  <Calendar className="w-3 h-3" />
                                  {item.date}
                                </span>
                              </div>
                              <p className="text-sm font-semibold text-slate-700 dark:text-gray-300 leading-snug group-hover:text-blue-500 transition-colors">
                                {item.title}
                              </p>
                              {item.summary && (
                                <p className="text-xs text-slate-500 dark:text-gray-400 leading-relaxed mt-1 font-medium">
                                  {item.summary}
                                </p>
                              )}
                            </div>
                          </div>

                          <div className="flex items-center gap-2 shrink-0 self-end md:self-center">
                            <button
                              onClick={() => {
                                setPreviewFile({ title: item.number, url: item.url, driveFileId: item.driveFileId, item });
                                setPreviewViewMode('pdf');
                                setPdfPage(1);
                                setPdfZoom(100);
                              }}
                              className="flex items-center gap-1.5 py-2.5 px-4 bg-white dark:bg-white/5 hover:bg-blue-600 dark:hover:bg-blue-600 hover:text-white text-slate-700 dark:text-gray-300 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all border border-slate-200 dark:border-white/10"
                            >
                              Vista Previa <Eye className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => window.open(item.url, '_blank')}
                              className="p-2 bg-white dark:bg-white/5 hover:bg-blue-600/10 dark:hover:bg-blue-500/10 text-slate-700 dark:text-gray-300 rounded-xl transition-all border border-slate-200 dark:border-white/10"
                            >
                              <Download className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </motion.div>
                      );
                    })}
                  </AnimatePresence>

                  {filteredBulletins.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-16 text-slate-400 dark:text-gray-500">
                      <FileText className="w-12 h-12 mb-4 opacity-40" />
                      <p className="text-sm font-bold uppercase tracking-wider text-center">No se encontraron boletines oficiales</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </>
      )}

      {activeMainTab === 'guia_legal' && (
        <>
          {/* HEADER */}
          <header className="flex flex-col gap-2">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-amber-600/20 flex items-center justify-center">
                <Scale className="w-5 h-5 text-amber-500" />
              </div>
              <h1 className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white tracking-tighter uppercase font-display">
                Guía Legal y Normativa
              </h1>
            </div>
            <p className="text-slate-500 dark:text-gray-400 text-sm max-w-2xl">
              Compendio legislativo interactivo de tratados internacionales, leyes nacionales, normativa de Tierra del Fuego y regulaciones especiales de retiro.
            </p>
          </header>

          {/* POLICE RETIREMENT SPECIAL CALCULATOR & GUIDE CARD */}
          <div className="bg-gradient-to-r from-slate-900 to-indigo-950 dark:from-[#0a0f1d] dark:to-[#05060b] border border-slate-800 dark:border-[#1e293b]/30 rounded-[2.5rem] p-6 md:p-8 text-white shadow-2xl flex flex-col lg:flex-row gap-8 items-stretch relative overflow-hidden">
            <div className="absolute right-0 top-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute left-0 bottom-0 w-96 h-96 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none" />

            {/* Left Column - Explanation of Pension Law */}
            <div className="flex-1 flex flex-col justify-between z-10 gap-4">
              <div>
                <div className="flex items-center gap-2.5 mb-4">
                  <span className="p-2 bg-blue-500/20 rounded-xl border border-blue-500/30">
                    <Shield className="w-5 h-5 text-blue-400" />
                  </span>
                  <span className="text-[10px] font-black uppercase tracking-widest text-blue-400">
                    Régimen de Seguridad Provincial
                  </span>
                </div>
                <h2 className="text-xl md:text-2xl font-black tracking-tight uppercase leading-snug">
                  Retiros Policiales y Penitenciarios (Ley 819)
                </h2>
                <p className="text-xs md:text-sm text-slate-350 leading-relaxed mt-3">
                  La **Ley Provincial N° 819** regula los retiros del personal de la Policía y del Servicio Penitenciario de Tierra del Fuego. Cuenta con una movilidad jubilatoria directa vinculada al personal activo (**82% móvil**) y reconoce los servicios históricos prestados bajo el **Ex-Territorio Nacional (Ley Territorial 350)**.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-800">
                <div className="flex flex-col">
                  <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider">Retiro Voluntario</span>
                  <span className="text-sm font-black text-slate-200 mt-1">25 años de servicio</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider">Haber de Retiro</span>
                  <span className="text-sm font-black text-slate-200 mt-1">82% Móvil inicial</span>
                </div>
              </div>
            </div>

            {/* Right Column - Interactive Calculator */}
            <div className="w-full lg:w-96 bg-slate-950/45 dark:bg-black/40 border border-slate-800/80 dark:border-white/5 rounded-3xl p-5 md:p-6 flex flex-col justify-between z-10">
              <div className="flex items-center gap-2.5 mb-4 border-b border-slate-800 pb-3">
                <Calculator className="w-4.5 h-4.5 text-blue-400" />
                <h3 className="text-xs font-black uppercase tracking-wider text-slate-200">
                  Simulador de Porcentaje de Retiro
                </h3>
              </div>

              <div className="flex flex-col gap-4">
                {/* Sliders and controls */}
                <div className="flex flex-col gap-2">
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-400 font-medium">Años de Servicio Efectivos:</span>
                    <span className="font-mono font-bold text-blue-400 text-sm">{serviceYears} años</span>
                  </div>
                  <input
                    type="range"
                    min="10"
                    max="35"
                    value={serviceYears}
                    onChange={(e) => setServiceYears(parseInt(e.target.value))}
                    className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-blue-500 focus:outline-none"
                  />
                  <div className="flex justify-between text-[9px] text-slate-500 font-mono">
                    <span>10 años</span>
                    <span>25 años (Completo)</span>
                    <span>35 años</span>
                  </div>
                </div>

                <div className="flex items-center justify-between p-3 bg-slate-900/60 rounded-xl border border-slate-800">
                  <span className="text-xs text-slate-300 font-medium">Fuerza Provincial:</span>
                  <div className="flex items-center bg-slate-950 p-1 rounded-lg border border-slate-850">
                    <button
                      onClick={() => setIsPenitentiary(false)}
                      className={`px-3 py-1 rounded text-[9px] font-bold uppercase tracking-wider transition-all ${
                        !isPenitentiary ? 'bg-blue-600 text-white shadow' : 'text-slate-400'
                      }`}
                    >
                      Policía
                    </button>
                    <button
                      onClick={() => setIsPenitentiary(true)}
                      className={`px-3 py-1 rounded text-[9px] font-bold uppercase tracking-wider transition-all ${
                        isPenitentiary ? 'bg-blue-600 text-white shadow' : 'text-slate-400'
                      }`}
                    >
                      S.P.P.
                    </button>
                  </div>
                </div>

                {/* Calculation Output */}
                <div className="p-4 bg-blue-500/10 rounded-2xl border border-blue-500/20 flex flex-col items-center gap-1.5">
                  <span className="text-[10px] font-bold text-blue-400 uppercase tracking-widest leading-none">Haber Estimado</span>
                  <span className="text-3xl font-black text-white leading-none font-mono">
                    {calculatedBenefit.percentage}% <span className="text-xs font-bold text-blue-400">móvil</span>
                  </span>
                  <p className="text-[10px] text-slate-350 text-center font-medium leading-tight mt-1">
                    {calculatedBenefit.text}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* MAIN LAWS DIRECTORY */}
          <div className="flex flex-col xl:flex-row gap-6 items-start">
            {/* Left column / Filters */}
            <div className="w-full xl:w-64 shrink-0 flex flex-row xl:flex-col flex-wrap gap-2">
              {[
                { id: 'all', label: 'Toda la Normativa', icon: Scale },
                { id: 'tratados', label: 'Tratados Internacionales', icon: Globe },
                { id: 'nacionales', label: 'Leyes Nacionales', icon: FileCheck },
                { id: 'provinciales', label: 'Leyes Provinciales TDF', icon: MapPin },
                { id: 'policial', label: 'Leyes Policía y Retiro', icon: Shield }
              ].map(cat => {
                const Icon = cat.icon;
                const isActive = legalCategory === cat.id;
                return (
                  <button
                    key={cat.id}
                    onClick={() => setLegalCategory(cat.id)}
                    className={`flex-1 xl:flex-none flex items-center justify-center xl:justify-start gap-3 px-4 py-3 rounded-2xl text-[11px] font-black uppercase tracking-wider transition-all border ${
                      isActive 
                        ? 'bg-blue-600 text-white border-blue-500 shadow-md' 
                        : 'bg-white hover:bg-slate-50 dark:bg-[#0e0e0e] dark:hover:bg-white/5 text-slate-600 dark:text-gray-400 border-slate-200 dark:border-[#1f1f1f]'
                    }`}
                  >
                    <Icon className="w-4 h-4 shrink-0" />
                    <span className="truncate">{cat.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Right column / Search + Grid list */}
            <div className="flex-1 w-full flex flex-col gap-4">
              {/* Search bar */}
              <div className="relative group">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
                <input
                  type="text"
                  placeholder="Buscar leyes por número, título o descripción..."
                  value={legalSearch}
                  onChange={e => setLegalSearch(e.target.value)}
                  className="w-full bg-white dark:bg-[#0e0e0e] border border-slate-200 dark:border-[#1f1f1f] rounded-2xl py-3.5 pl-11 pr-4 text-[13px] font-medium text-slate-800 dark:text-gray-200 placeholder:text-slate-500 focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all shadow-sm"
                />
              </div>

              {/* Grid of Law items */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredLaws.map(doc => (
                  <div
                    key={doc.id}
                    onClick={() => setSelectedLaw(doc)}
                    className="p-5 bg-white dark:bg-[#0e0e0e] border border-slate-200 dark:border-[#1f1f1f] hover:border-blue-500/30 rounded-3xl shadow-md hover:shadow-xl transition-all cursor-pointer flex flex-col justify-between gap-4 group hover-lift"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-xs font-black text-blue-500 uppercase tracking-wider font-mono">
                          {doc.number}
                        </span>
                        {doc.category === 'tratados' && doc.flag && (
                          <span className="text-xs flex items-center gap-1 font-mono font-bold text-slate-400">
                            {doc.flag} {doc.country}
                          </span>
                        )}
                        {doc.category === 'policial' && (
                          <span className="text-[9px] font-black uppercase tracking-widest px-2 py-0.5 bg-blue-500/10 text-blue-500 rounded flex items-center gap-1">
                            <Shield className="w-3 h-3" /> Seguridad
                          </span>
                        )}
                      </div>
                      <h3 className="text-[14px] font-black text-slate-900 dark:text-white uppercase leading-snug group-hover:text-blue-500 transition-colors mb-2">
                        {doc.title}
                      </h3>
                      <p className="text-xs text-slate-500 dark:text-gray-400 leading-relaxed line-clamp-3">
                        {doc.summary}
                      </p>
                    </div>

                    <div className="pt-3 border-t border-slate-100 dark:border-white/5 flex items-center justify-between text-[11px] text-slate-400">
                      <span className="font-bold uppercase tracking-wider group-hover:text-blue-500 transition-colors flex items-center gap-1">
                        Ver análisis y artículos <ChevronRight className="w-3.5 h-3.5 transform group-hover:translate-x-1 transition-transform" />
                      </span>
                      <button 
                        onClick={(e) => { e.stopPropagation(); handleShare(doc); }}
                        className="p-1.5 hover:bg-slate-100 dark:hover:bg-white/5 rounded-lg text-slate-400 hover:text-slate-700 transition-colors"
                        title="Compartir enlace"
                      >
                        <Share2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </>
      )}

      {activeMainTab === 'asistente_ia' && (
        <>
          {/* HEADER */}
          <header className="flex flex-col gap-2">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-amber-600/20 flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-amber-500" />
              </div>
              <h1 className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white tracking-tighter uppercase font-display">
                Asistente Legal IA
              </h1>
            </div>
            <p className="text-slate-500 dark:text-gray-400 text-sm max-w-2xl">
              Realiza preguntas en lenguaje natural sobre el contenido de los Boletines Oficiales y obtén respuestas fundamentadas con citas de documentos oficiales.
            </p>
          </header>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-stretch">
            {/* Panel de control lateral del chat (1/4 col) */}
            <div className="lg:col-span-1 bg-white dark:bg-[#0e0e0e] border border-slate-200 dark:border-[#1f1f1f] rounded-[2rem] p-5 flex flex-col gap-4 shadow-md">
              <h3 className="text-xs font-black text-slate-800 dark:text-slate-200 uppercase tracking-widest flex items-center gap-2">
                <Shield className="w-4 h-4 text-blue-500" /> Filtros del Asistente
              </h3>
              
              <div className="flex flex-col gap-2">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  Organismo / Jurisdicción
                </label>
                <div className="flex flex-col gap-1.5">
                  {[
                    { id: 'all', label: 'Todos los Boletines', short: 'Todos' },
                    { id: 'provincia', label: 'Gobierno Provincial (DeCoLey)', short: 'Provincial' },
                    { id: 'ushuaia', label: 'Municipalidad de Ushuaia', short: 'Ushuaia' },
                    { id: 'riogrande', label: 'Municipalidad de Río Grande', short: 'Río Grande' },
                    { id: 'tolhuin', label: 'Municipalidad de Tolhuin', short: 'Tolhuin' },
                  ].map(pub => (
                    <button
                      key={pub.id}
                      onClick={() => setChatPublisherFilter(pub.id)}
                      className={`w-full text-left px-3.5 py-2.5 rounded-xl text-[11px] font-black uppercase tracking-wider transition-all border ${
                        chatPublisherFilter === pub.id
                          ? 'bg-blue-600 border-blue-500 text-white shadow-sm'
                          : 'bg-slate-50 dark:bg-white/5 border-slate-200 dark:border-white/5 text-slate-600 dark:text-gray-400 hover:bg-slate-100 dark:hover:bg-white/10'
                      }`}
                    >
                      {pub.short}
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 dark:border-white/5 flex flex-col gap-2">
                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Sugerencias de búsqueda:</span>
                <div className="flex flex-col gap-1.5">
                  {[
                    '¿Cuáles son los requisitos de retiro de la Ley 819?',
                    '¿Qué decretos regulan el tendido eléctrico en Tolhuin?',
                    '¿Qué ordenanza regula el ordenamiento territorial en Ushuaia?',
                    '¿Cómo se regula la reforestación nativa en el Lago Fagnano?'
                  ].map((sug, i) => (
                    <button
                      key={i}
                      onClick={() => setChatInput(sug)}
                      className="text-left text-[11px] text-slate-600 dark:text-slate-400 hover:text-blue-500 dark:hover:text-blue-400 leading-snug p-2.5 bg-slate-50 dark:bg-white/5 rounded-xl hover:border-blue-500/20 border border-slate-200 dark:border-white/5 transition-all"
                    >
                      {sug}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Ventana de chat (3/4 col) */}
            <div className="lg:col-span-3 bg-white dark:bg-[#0e0e0e] border border-slate-200 dark:border-[#1f1f1f] rounded-[2.5rem] flex flex-col justify-between h-[650px] shadow-2xl overflow-hidden">
              {/* Chat Header */}
              <div className="p-4 md:p-5 border-b border-slate-200 dark:border-[#1f1f1f] bg-slate-50/50 dark:bg-[#0a0a0a]/50 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-blue-500/10 flex items-center justify-center">
                    <Bot className="w-4.5 h-4.5 text-blue-500" />
                  </div>
                  <div>
                    <h3 className="text-xs font-black text-slate-800 dark:text-white uppercase tracking-wider">
                      Asistente Virtual TDF
                    </h3>
                    <span className="text-[9px] font-bold text-emerald-500 uppercase flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                      Gemini 1.5 Flash Conectado
                    </span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setChatMessages([
                    {
                      role: 'assistant',
                      text: '¡Hola! Soy tu Asistente Legal Inteligente para los Boletines Oficiales de Tierra del Fuego. Pregúntame lo que necesites buscar dentro de la normativa o documentos oficiales, y te responderé con la cita de las fuentes correspondientes.',
                    }
                  ])}
                  className="px-3 py-1.5 bg-slate-100 hover:bg-red-500/10 dark:bg-white/5 text-slate-500 hover:text-red-500 rounded-xl transition-all border border-slate-200 dark:border-white/5 text-[10px] font-black uppercase tracking-wider cursor-pointer"
                >
                  Limpiar Conversación
                </button>
              </div>

              {/* Chat Messages */}
              <div className="flex-1 p-5 overflow-y-auto flex flex-col gap-4 bg-slate-50/30 dark:bg-black/10">
                {chatMessages.map((msg, index) => (
                  <div
                    key={index}
                    className={`flex gap-3 max-w-[85%] ${
                      msg.role === 'user' ? 'self-end flex-row-reverse' : 'self-start'
                    }`}
                  >
                    <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 border shadow-sm ${
                      msg.role === 'user'
                        ? 'bg-blue-600 border-blue-500 text-white'
                        : 'bg-white dark:bg-[#1a1a1a] border-slate-200 dark:border-white/10 text-blue-500'
                    }`}>
                      {msg.role === 'user' ? <User className="w-4.5 h-4.5" /> : <Bot className="w-4.5 h-4.5" />}
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <div className={`p-4 rounded-3xl text-[12.5px] leading-relaxed shadow-sm ${
                        msg.role === 'user'
                          ? 'bg-blue-600 text-white rounded-tr-none'
                          : 'bg-white dark:bg-[#121212] border border-slate-200 dark:border-white/5 text-slate-800 dark:text-gray-200 rounded-tl-none'
                      }`}>
                        <div className="whitespace-pre-line font-medium">{msg.text}</div>
                      </div>

                      {/* Display Sources inside AI Response */}
                      {msg.role === 'assistant' && msg.sources && msg.sources.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 mt-1 px-1">
                          <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider self-center mr-1">
                            Fuentes Citadas:
                          </span>
                          {msg.sources.map((src, i) => (
                            <button
                              key={i}
                              type="button"
                              onClick={() => {
                                const pubInfo = publishersInfo.find(p => p.id === src.publisher);
                                const matchItem = bulletinsDb.find(b => b.number.includes(src.numero) || b.id === src.numero);
                                setPreviewFile({
                                  title: src.numero,
                                  url: pubInfo?.url || tdfDriveFolderUrl,
                                  item: matchItem
                                });
                                setPreviewViewMode('pdf');
                                setPdfPage(1);
                                setPdfZoom(100);
                              }}
                              className="px-2 py-1 bg-blue-500/10 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400 rounded-lg text-[9.5px] font-black uppercase tracking-wider border border-blue-500/20 hover:bg-blue-600 hover:text-white transition-all flex items-center gap-1 cursor-pointer"
                              title={`Página ${src.pagina} | Confianza: ${src.score}%`}
                            >
                              <FileText className="w-3 h-3" />
                              {src.numero} (Pág. {src.pagina})
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                ))}

                {isChatLoading && (
                  <div className="flex gap-3 self-start max-w-[80%]">
                    <div className="w-8 h-8 rounded-xl bg-white dark:bg-[#1a1a1a] border border-slate-200 dark:border-white/10 text-blue-500 flex items-center justify-center shrink-0 shadow-sm">
                      <Loader2 className="w-4.5 h-4.5 animate-spin" />
                    </div>
                    <div className="bg-white dark:bg-[#121212] border border-slate-200 dark:border-white/5 text-slate-450 dark:text-gray-400 rounded-3xl rounded-tl-none p-4 text-[12px] font-medium flex items-center gap-2 shadow-sm">
                      <span>Procesando consulta en los boletines oficiales...</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Chat Input Form */}
              <form
                onSubmit={handleSendChatMessage}
                className="p-4 border-t border-slate-200 dark:border-[#1f1f1f] bg-slate-50/50 dark:bg-[#0a0a0a]/50 flex gap-3 items-center"
              >
                <div className="relative flex-1">
                  <input
                    type="text"
                    placeholder="Haz una pregunta sobre decretos, ordenanzas, leyes o retiros..."
                    value={chatInput}
                    onChange={e => setChatInput(e.target.value)}
                    disabled={isChatLoading}
                    className="w-full bg-white dark:bg-black/40 border border-slate-200 dark:border-white/10 rounded-2xl py-3.5 pl-4 pr-12 text-[13px] font-medium text-slate-800 dark:text-gray-200 placeholder:text-slate-500 focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all disabled:opacity-50"
                  />
                  <button
                    type="submit"
                    disabled={isChatLoading || !chatInput.trim()}
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition-all shadow-md disabled:opacity-30 disabled:hover:bg-blue-600 cursor-pointer"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </div>
              </form>
            </div>
          </div>
        </>
      )}

      {/* DETAILED LAW DETAIL MODAL */}
      <AnimatePresence>
        {selectedLaw && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 dark:bg-black/80 backdrop-blur-md">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white dark:bg-[#0c0c0c] border border-slate-200 dark:border-white/10 rounded-[2.5rem] shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[85vh]"
            >
              {/* Modal Header */}
              <div className="p-6 border-b border-slate-100 dark:border-white/5 flex items-center justify-between bg-slate-50/50 dark:bg-[#070707]/30">
                <div className="flex items-center gap-3">
                  <Scale className="w-5 h-5 text-blue-500" />
                  <div className="flex flex-col">
                    <span className="text-[10px] font-black text-blue-500 uppercase tracking-widest font-mono">{selectedLaw.number}</span>
                    <h3 className="text-sm md:text-base font-black text-slate-900 dark:text-white uppercase tracking-wide leading-none mt-1">
                      Ficha de Análisis Jurídico
                    </h3>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedLaw(null)}
                  className="p-2 bg-slate-100 hover:bg-red-500/10 dark:bg-white/5 text-slate-500 hover:text-red-500 rounded-xl transition-all border border-slate-200 dark:border-white/5 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Modal Content */}
              <div className="p-6 overflow-y-auto flex flex-col gap-5">
                <div>
                  <h4 className="text-base font-black text-slate-900 dark:text-white uppercase tracking-wide leading-snug">
                    {selectedLaw.title}
                  </h4>
                  <p className="text-xs md:text-sm text-slate-650 dark:text-gray-300 leading-relaxed mt-3 p-4 bg-slate-50 dark:bg-white/[0.02] border border-slate-150 dark:border-white/5 rounded-2xl">
                    {selectedLaw.summary}
                  </p>
                </div>

                {/* Key Details bullet points */}
                {selectedLaw.details && selectedLaw.details.length > 0 && (
                  <div className="flex flex-col gap-3">
                    <h5 className="text-[10px] font-black uppercase tracking-widest text-slate-450 dark:text-gray-500">
                      Puntos Clave y Disposiciones:
                    </h5>
                    <ul className="flex flex-col gap-2.5">
                      {selectedLaw.details.map((bullet, idx) => (
                        <li key={idx} className="flex gap-2.5 text-xs text-slate-600 dark:text-gray-400 leading-relaxed items-start">
                          <span className="w-1.5 h-1.5 rounded-full bg-blue-500 shrink-0 mt-2" />
                          <span>{bullet}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              {/* Modal Footer */}
              <div className="p-6 border-t border-slate-100 dark:border-white/5 bg-slate-50/50 dark:bg-[#070707]/30 flex flex-col sm:flex-row items-center justify-between gap-3">
                <button
                  onClick={() => handleShare({ number: selectedLaw.number, url: selectedLaw.url })}
                  className="w-full sm:w-auto flex items-center justify-center gap-2 py-3 px-4 bg-white dark:bg-white/5 hover:bg-blue-600/10 text-slate-700 dark:text-gray-300 hover:text-blue-500 rounded-xl text-xs font-black uppercase tracking-wider transition-all border border-slate-200 dark:border-white/10"
                >
                  Compartir Normativa <Share2 className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => window.open(selectedLaw.url, '_blank')}
                  className="w-full sm:w-auto flex items-center justify-center gap-2 py-3 px-5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-black uppercase tracking-wider transition-all shadow-md shadow-blue-500/10 cursor-pointer"
                >
                  Ver Texto Completo Oficial <ExternalLink className="w-3.5 h-3.5" />
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* DYNAMIC PDF PREVIEW MODAL */}
      <AnimatePresence>
        {previewFile && (() => {
          const item = previewFile.item || bulletinsDb.find(b => b.number === previewFile.title || b.title.includes(previewFile.title) || b.number.includes(previewFile.title));
          const bulletinNum = item?.number || previewFile.title || 'Boletín N° 3610';
          const bulletinDate = item?.date || '2026-06-12';
          const cleanNum = bulletinNum.replace(/\D/g, '') || '3610';

          return (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-2 md:p-6 bg-slate-950/80 backdrop-blur-md">
              <motion.div 
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                className="bg-slate-900 border border-slate-700/60 rounded-[2.5rem] shadow-2xl w-full max-w-5xl overflow-hidden flex flex-col h-[90vh]"
              >
                {/* PDF Viewer Chrome Toolbar */}
                <div className="p-4 bg-slate-950 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3 text-white">
                  {/* Left: Document Info */}
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-red-500/20 border border-red-500/30 flex items-center justify-center text-red-400">
                      <FileText className="w-5 h-5" />
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[9px] font-black text-red-400 uppercase tracking-widest leading-none">Visor PDF Oficial</span>
                      <h3 className="text-xs md:text-sm font-black text-white uppercase tracking-wide font-mono mt-1">
                        Boletin_Oficial_TDF_{cleanNum}.pdf
                      </h3>
                    </div>
                  </div>

                  {/* Middle: PDF Reader Controls */}
                  <div className="flex items-center gap-2 bg-slate-900 p-1 rounded-xl border border-slate-800">
                    <button
                      onClick={() => setPreviewViewMode('pdf')}
                      className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer ${
                        previewViewMode === 'pdf' ? 'bg-red-600 text-white shadow' : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      📄 Documento PDF
                    </button>
                    <button
                      onClick={() => setPreviewViewMode('drive')}
                      className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer ${
                        previewViewMode === 'drive' ? 'bg-red-600 text-white shadow' : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      📁 Drive Oficial
                    </button>

                    {previewViewMode === 'pdf' && (
                      <>
                        <div className="w-px h-4 bg-slate-800 mx-1" />
                        <button
                          onClick={() => setPdfPage(p => Math.max(1, p - 1))}
                          disabled={pdfPage === 1}
                          className="p-1.5 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white disabled:opacity-30 cursor-pointer"
                          title="Página Anterior"
                        >
                          <ChevronLeft className="w-4 h-4" />
                        </button>
                        <span className="text-[10px] font-mono font-bold text-slate-300 px-1">
                          Pág. {pdfPage} / 2
                        </span>
                        <button
                          onClick={() => setPdfPage(p => Math.min(2, p + 1))}
                          disabled={pdfPage === 2}
                          className="p-1.5 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white disabled:opacity-30 cursor-pointer"
                          title="Página Siguiente"
                        >
                          <ChevronRight className="w-4 h-4" />
                        </button>

                        <div className="w-px h-4 bg-slate-800 mx-1" />
                        <button
                          onClick={() => setPdfZoom(z => Math.max(75, z - 15))}
                          className="p-1.5 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white cursor-pointer"
                          title="Alejar Zoom"
                        >
                          <ZoomOut className="w-4 h-4" />
                        </button>
                        <span className="text-[10px] font-mono font-bold text-slate-300 w-10 text-center">
                          {pdfZoom}%
                        </span>
                        <button
                          onClick={() => setPdfZoom(z => Math.min(150, z + 15))}
                          className="p-1.5 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white cursor-pointer"
                          title="Acercar Zoom"
                        >
                          <ZoomIn className="w-4 h-4" />
                        </button>
                      </>
                    )}
                  </div>

                  {/* Right: Actions & Close */}
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => handleShare({ number: bulletinNum, url: previewFile.url })}
                      className="p-2 hover:bg-slate-800 text-slate-400 hover:text-white rounded-xl transition-all border border-slate-800 cursor-pointer"
                      title="Compartir"
                    >
                      <Share2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => window.open(previewFile.url, '_blank')}
                      className="p-2 hover:bg-slate-800 text-slate-400 hover:text-white rounded-xl transition-all border border-slate-800 cursor-pointer"
                      title="Abrir original en Google Drive"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setPreviewFile(null)}
                      className="p-2 bg-red-600/20 hover:bg-red-600 text-red-300 hover:text-white rounded-xl transition-all border border-red-500/30 cursor-pointer"
                      title="Cerrar Previsualización"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* PDF Viewer Body Canvas */}
                <div className="flex-1 bg-slate-950 overflow-y-auto p-4 md:p-8 flex justify-center items-start">
                  {previewViewMode === 'pdf' ? (
                    <div 
                      className="bg-white text-slate-900 shadow-2xl rounded-sm font-serif p-8 md:p-14 max-w-3xl w-full border border-slate-300 min-h-[850px] relative transition-transform duration-200 origin-top flex flex-col justify-between"
                      style={{ transform: `scale(${pdfZoom / 100})`, transformOrigin: 'top center' }}
                    >
                      {/* Page Content */}
                      {pdfPage === 1 ? (
                        <div className="flex flex-col gap-6">
                          {/* Official Header Banner */}
                          <div className="border-b-4 border-double border-slate-900 pb-4 text-center flex flex-col items-center gap-2">
                            <div className="flex items-center gap-3">
                              {/* Tierra del Fuego Coat of Arms Emblem SVG */}
                              <svg className="w-12 h-12 text-blue-900" viewBox="0 0 100 100" fill="currentColor">
                                <circle cx="50" cy="50" r="45" fill="none" stroke="currentColor" strokeWidth="4" />
                                <path d="M50 15 L60 35 L80 35 L65 48 L70 70 L50 55 L30 70 L35 48 L20 35 L40 35 Z" fill="#1e3a8a" />
                                <text x="50" y="88" textAnchor="middle" fontSize="10" fontWeight="bold" fontFamily="sans-serif">TDF</text>
                              </svg>
                              <div className="text-left">
                                <span className="text-[10px] font-sans font-bold text-slate-500 uppercase tracking-widest block">REPÚBLICA ARGENTINA</span>
                                <h1 className="text-base md:text-lg font-sans font-black text-slate-950 uppercase tracking-tight leading-tight">
                                  BOLETÍN OFICIAL DE LA PROVINCIA DE TIERRA DEL FUEGO
                                </h1>
                                <span className="text-[9px] font-sans text-slate-600 uppercase tracking-wider block font-semibold">
                                  ANTÁRTIDA E ISLAS DEL ATLÁNTICO SUR — REGISTRO DECOLEY
                                </span>
                              </div>
                            </div>

                            <div className="w-full bg-slate-100 dark:bg-slate-200 border-y border-slate-900 py-1.5 px-4 flex justify-between items-center text-xs font-sans font-bold text-slate-900 mt-2">
                              <span>EDICIÓN OFICIAL N° {cleanNum}</span>
                              <span>USHUAIA, {bulletinDate}</span>
                              <span>AÑO XXXV</span>
                            </div>
                          </div>

                          {/* Sumario Section */}
                          <div className="flex flex-col gap-2">
                            <h2 className="text-xs font-sans font-black uppercase tracking-widest text-slate-900 border-b border-slate-400 pb-1">
                              SECCIÓN I — SUMARIO Y DISPOSICIONES OFICIALES
                            </h2>
                            <p className="text-xs text-slate-700 leading-relaxed font-sans italic">
                              Publicación oficial correspondiente a los actos administrativos sancionados por el Poder Ejecutivo Provincial y Ministerios.
                            </p>
                          </div>

                          {/* Main Decretos Body */}
                          <div className="flex flex-col gap-4">
                            <h2 className="text-xs font-sans font-black uppercase tracking-widest text-slate-900 border-b border-slate-400 pb-1">
                              SECCIÓN II — PODER EJECUTIVO PROVINCIAL
                            </h2>

                            {item?.policeAnalysis?.hasImpact ? (
                              <div className="bg-slate-50 p-5 rounded border border-slate-300 flex flex-col gap-3 font-serif">
                                <div className="font-sans font-black text-xs uppercase text-blue-950">
                                  {item.policeAnalysis.norma}
                                </div>
                                <p className="text-xs text-slate-800 leading-relaxed">
                                  <strong>VISTO:</strong> Las facultades conferidas al Poder Ejecutivo por la Constitución Provincial y las normativas vigentes relativas al personal de las Fuerzas de Seguridad de Tierra del Fuego; y
                                </p>
                                <p className="text-xs text-slate-800 leading-relaxed">
                                  <strong>CONSIDERANDO:</strong> {item.policeAnalysis.queDice}
                                </p>
                                <p className="text-xs text-slate-800 leading-relaxed font-bold uppercase font-sans text-center my-1">
                                  EL GOBERNADOR DE LA PROVINCIA DE TIERRA DEL FUEGO RESUELVE:
                                </p>
                                <div className="text-xs text-slate-800 leading-relaxed flex flex-col gap-2">
                                  <p><strong>ARTÍCULO 1°.-</strong> {item.policeAnalysis.queDice}</p>
                                  <p><strong>ARTÍCULO 2°.-</strong> {item.policeAnalysis.queCambia}</p>
                                  <p><strong>ARTÍCULO 3°.-</strong> {item.policeAnalysis.queImpacta}</p>
                                  <p><strong>ARTÍCULO 4°.-</strong> {item.policeAnalysis.articulos}</p>
                                  <p><strong>ARTÍCULO 5°.-</strong> Comuníquese, publíquese en el Boletín Oficial Provincial y archívese.</p>
                                </div>
                              </div>
                            ) : item?.policeAnalysis?.noImpactList && item.policeAnalysis.noImpactList.length > 0 ? (
                              <div className="flex flex-col gap-3">
                                {item.policeAnalysis.noImpactList.map((act, idx) => (
                                  <div key={idx} className="bg-slate-50 p-4 rounded border border-slate-250 flex flex-col gap-1 text-xs">
                                    <span className="font-sans font-bold text-blue-900 uppercase">{act.acto} ({act.fecha})</span>
                                    <p className="text-slate-800 font-serif leading-relaxed">{act.titulo}</p>
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <div className="bg-slate-50 p-5 rounded border border-slate-300 flex flex-col gap-3 text-xs">
                                <span className="font-sans font-bold text-slate-900 uppercase">DECRETO PROVINCIAL N° {cleanNum}/2026</span>
                                <p className="text-slate-800 leading-relaxed">
                                  Disposición administrativa oficial aprobada y registrada en el sistema de gestión legal DeCoLey del Gobierno de Tierra del Fuego.
                                </p>
                              </div>
                            )}
                          </div>
                        </div>
                      ) : (
                        /* Page 2 Content */
                        <div className="flex flex-col gap-6">
                          <div className="border-b border-slate-400 pb-2 text-center">
                            <span className="text-[9px] font-sans font-bold text-slate-500 uppercase tracking-widest">
                              BOLETÍN OFICIAL DE TIERRA DEL FUEGO — EDICIÓN N° {cleanNum} (CONT.)
                            </span>
                          </div>

                          <div className="flex flex-col gap-4">
                            <h2 className="text-xs font-sans font-black uppercase tracking-widest text-slate-900 border-b border-slate-400 pb-1">
                              SECCIÓN III — RESOLUCIONES MINISTERIALES Y ANEXOS
                            </h2>
                            <div className="bg-slate-50 p-5 rounded border border-slate-300 flex flex-col gap-2 text-xs">
                              <span className="font-sans font-bold text-slate-900 uppercase">RESOLUCIÓN MINISTERIO DE SEGURIDAD Y JUSTICIA</span>
                              <p className="text-slate-800 leading-relaxed">
                                Dispónese la publicación formal del presente anexo regulatorio en el Registro Oficial. Corresponde a los folios digitalizados del archivo original depositado en la Dirección General del Boletín Oficial.
                              </p>
                            </div>

                            <h2 className="text-xs font-sans font-black uppercase tracking-widest text-slate-900 border-b border-slate-400 pb-1 mt-4">
                              SECCIÓN IV — EDICTOS JUDICIALES Y CONVOCATORIAS
                            </h2>
                            <div className="p-4 border border-dashed border-slate-400 rounded text-xs text-slate-700 leading-relaxed">
                              Convocatoria a Licitaciones Públicas y Notificaciones Legales vigentes para la Provincia de Tierra del Fuego, Antártida e Islas del Atlántico Sur.
                            </div>
                          </div>

                          {/* Formal Signature & Official Digital Seal */}
                          <div className="pt-10 mt-10 border-t border-slate-300 flex justify-between items-end font-sans">
                            <div className="flex flex-col items-center">
                              {/* Stamp simulation */}
                              <div className="w-20 h-20 rounded-full border-2 stroke-dasharray border-blue-900 text-blue-900 flex flex-col items-center justify-center p-1 text-[7px] font-bold uppercase text-center leading-tight opacity-80 rotate-[-12deg]">
                                <span>GOBIERNO TDF</span>
                                <span>BOLETÍN OFICIAL</span>
                                <span>DIGITAL</span>
                              </div>
                            </div>
                            <div className="text-center font-sans text-xs flex flex-col items-center gap-1">
                              <div className="w-48 border-b border-slate-900 pb-1 font-serif italic text-slate-500">Firmado digitalmente</div>
                              <span className="font-bold text-slate-900">Dirección General del Boletín Oficial</span>
                              <span className="text-[9px] text-slate-500 uppercase">Secretaría de Legal y Técnica — Gobierno TDF</span>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* PDF Footer Bar */}
                      <div className="pt-6 border-t border-slate-300 flex justify-between items-center text-[10px] font-sans font-bold text-slate-500">
                        <span>DOCUMENTO OFICIAL DIGITALIZADO — REPOSITORIO DECOLEY TDF</span>
                        <span>PÁGINA {pdfPage} DE 2</span>
                      </div>
                    </div>
                  ) : (
                    /* Drive View Mode */
                    <div className="w-full h-[700px] rounded-2xl overflow-hidden border border-slate-800 bg-slate-900">
                      <iframe
                        src={
                          previewFile.url.includes('drive.google.com') 
                            ? `https://drive.google.com/embeddedfolderview?id=12GrKybtm4cWyS6Ib_DnbwKAQ6JvQHCU6#list`
                            : `https://docs.google.com/viewer?url=${encodeURIComponent(previewFile.url)}&embedded=true`
                        }
                        className="w-full h-full border-0"
                        title="Google Drive Document Embed"
                        allow="autoplay"
                      />
                    </div>
                  )}
                </div>

                {/* Footer status bar */}
                <div className="p-3 bg-slate-950 border-t border-slate-800 text-[10px] font-mono text-slate-400 flex items-center justify-between px-6">
                  <span className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-500" />
                    Documento PDF generado dinámicamente según el Boletín Oficial seleccionado.
                  </span>
                  <a href={previewFile.url} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline font-bold">
                    Abrir carpeta en Google Drive &rarr;
                  </a>
                </div>
              </motion.div>
            </div>
          );
        })()}
      </AnimatePresence>


      {/* POLICE BULLETIN EXPLORER MODAL */}
      <AnimatePresence>
        {showPoliceExplorer && (() => {
          const provBulletins = bulletinsDb.filter(b => b.publisher === 'provincia');
          const years = ['all', ...Array.from(new Set(provBulletins.map(b => b.year))).sort((a,b) => b.localeCompare(a))];
          const filtered = provBulletins.filter(b => {
            const okYear = policeExplorerYear === 'all' || b.year === policeExplorerYear;
            const okMonth = policeExplorerMonth === 'all' || b.month === policeExplorerMonth;
            return okYear && okMonth;
          });
          const availableMonths = Array.from(new Set(
            provBulletins.filter(b => policeExplorerYear === 'all' || b.year === policeExplorerYear).map(b => b.month)
          )).sort();
          return (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-3 md:p-6 bg-slate-900/70 dark:bg-black/85 backdrop-blur-md">
              <motion.div
                initial={{ scale: 0.96, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.96, opacity: 0 }}
                className="bg-white dark:bg-[#080c14] border border-slate-200 dark:border-blue-900/30 rounded-[2.5rem] shadow-2xl w-full max-w-5xl flex flex-col max-h-[90vh] overflow-hidden"
              >
                {/* Header */}
                <div className="p-5 md:p-6 border-b border-slate-100 dark:border-white/5 bg-gradient-to-r from-slate-900 to-blue-950 flex items-center justify-between gap-4 shrink-0 rounded-t-[2.5rem]">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-blue-500/20 border border-blue-500/30 flex items-center justify-center">
                      <Shield className="w-5 h-5 text-blue-400" />
                    </div>
                    <div>
                      <span className="text-[9px] font-black text-blue-400 uppercase tracking-widest block">Asesor Normativo Policial</span>
                      <h2 className="text-sm md:text-base font-black text-white uppercase tracking-wide">Explorador de Boletines — Análisis Policial</h2>
                    </div>
                  </div>
                  <button onClick={() => { setShowPoliceExplorer(false); setSelectedBulletin(null); }} className="p-2 bg-white/10 hover:bg-red-500/20 text-slate-300 hover:text-red-400 rounded-xl transition-all border border-white/10 cursor-pointer">
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div className="flex flex-1 overflow-hidden">
                  {/* Left panel — filter + list */}
                  <div className="w-full md:w-72 shrink-0 flex flex-col border-r border-slate-100 dark:border-white/5 overflow-y-auto">
                    {/* Filters */}
                    <div className="p-4 border-b border-slate-100 dark:border-white/5 bg-slate-50/60 dark:bg-black/20 flex flex-col gap-3 shrink-0">
                      <div className="flex flex-col gap-1.5">
                        <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Año</span>
                        <div className="flex flex-wrap gap-1.5">
                          {years.map(y => (
                            <button key={y} onClick={() => { setPoliceExplorerYear(y); setPoliceExplorerMonth('all'); setSelectedBulletin(null); }}
                              className={`px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-wider transition-all ${policeExplorerYear === y ? 'bg-blue-600 text-white shadow-sm' : 'bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-600 dark:text-gray-400 hover:bg-slate-100'}`}>
                              {y === 'all' ? 'Todos' : y}
                            </button>
                          ))}
                        </div>
                      </div>
                      {availableMonths.length > 1 && (
                        <div className="flex flex-col gap-1.5">
                          <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Mes</span>
                          <div className="flex flex-wrap gap-1.5">
                            <button onClick={() => setPoliceExplorerMonth('all')}
                              className={`px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-wider transition-all ${policeExplorerMonth === 'all' ? 'bg-blue-600 text-white shadow-sm' : 'bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-600 dark:text-gray-400 hover:bg-slate-100'}`}>
                              Todos
                            </button>
                            {availableMonths.map(m => (
                              <button key={m} onClick={() => setPoliceExplorerMonth(m)}
                                className={`px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-wider transition-all ${policeExplorerMonth === m ? 'bg-blue-600 text-white shadow-sm' : 'bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-600 dark:text-gray-400 hover:bg-slate-100'}`}>
                                {MONTHS[m] || m}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Bulletin list */}
                    <div className="flex flex-col gap-1 p-3 overflow-y-auto">
                      {filtered.map(b => {
                        const hasImpact = b.policeAnalysis?.hasImpact;
                        const isActive = selectedBulletin?.id === b.id;
                        return (
                          <button key={b.id} onClick={() => setSelectedBulletin(b)}
                            className={`text-left p-3 rounded-2xl border transition-all flex flex-col gap-1 cursor-pointer ${isActive ? 'bg-blue-600 border-blue-500 text-white' : 'bg-white dark:bg-[#0e0e0e] border-slate-200 dark:border-white/5 hover:border-blue-400/40 text-slate-700 dark:text-gray-300'}`}>
                            <div className="flex items-center justify-between gap-2">
                              <span className={`text-[10px] font-black ${isActive ? 'text-blue-200' : 'text-blue-500'} font-mono`}>{b.number}</span>
                              <span className={`text-[8px] font-black uppercase px-2 py-0.5 rounded-full ${
                                hasImpact
                                  ? isActive ? 'bg-amber-400/30 text-amber-200' : 'bg-amber-500/15 text-amber-600 dark:text-amber-400'
                                  : isActive ? 'bg-slate-400/30 text-slate-200' : 'bg-slate-100 dark:bg-white/5 text-slate-400'
                              }`}>
                                {hasImpact ? '⚠ Impacto' : '✓ Sin impacto'}
                              </span>
                            </div>
                            <span className={`text-[10px] leading-snug font-medium ${isActive ? 'text-blue-100' : 'text-slate-500 dark:text-gray-400'}`}>{b.date} — {MONTHS[b.month]}</span>
                          </button>
                        );
                      })}
                      {filtered.length === 0 && (
                        <div className="text-center py-10 text-slate-400 text-xs">No hay boletines para el filtro seleccionado</div>
                      )}
                    </div>
                  </div>

                  {/* Right panel — analysis */}
                  <div className="flex-1 overflow-y-auto p-5 md:p-6">
                    {!selectedBulletin ? (
                      <div className="h-full flex flex-col items-center justify-center text-center gap-4 text-slate-400 dark:text-gray-600">
                        <Shield className="w-12 h-12 opacity-20" />
                        <p className="text-sm font-bold uppercase tracking-wider">Seleccioná un boletín para ver su análisis policial</p>
                        <p className="text-xs max-w-sm">El análisis identifica normas con impacto en ascensos, retiros, haberes, estructura orgánica y régimen disciplinario del personal policial y penitenciario de TDF.</p>
                      </div>
                    ) : selectedBulletin.policeAnalysis?.hasImpact ? (
                      <div className="flex flex-col gap-5">
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <span className="text-[9px] font-black text-blue-500 uppercase tracking-widest font-mono">{selectedBulletin.number}</span>
                            <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wide mt-1">{selectedBulletin.title}</h3>
                            <span className="text-[10px] text-slate-400 font-mono">{selectedBulletin.date}</span>
                          </div>
                          <span className="shrink-0 px-3 py-1.5 bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/20 rounded-xl text-[9px] font-black uppercase tracking-widest flex items-center gap-1">
                            ⚠ Impacto Policial Identificado
                          </span>
                        </div>

                        {[
                          { num: '1', label: 'Norma o documento', value: selectedBulletin.policeAnalysis.norma, color: 'border-blue-500/30 bg-blue-500/5' },
                          { num: '2', label: 'Qué dice', value: selectedBulletin.policeAnalysis.queDice, color: 'border-slate-200 dark:border-white/10 bg-slate-50/60 dark:bg-white/[0.02]' },
                          { num: '3', label: 'Qué cambia para la Policía', value: selectedBulletin.policeAnalysis.queCambia, color: 'border-orange-500/30 bg-orange-500/5' },
                          { num: '4', label: 'Qué impacta sobre el personal', value: selectedBulletin.policeAnalysis.queImpacta, color: 'border-red-500/30 bg-red-500/5' },
                          { num: '5', label: 'Artículos o anexos relevantes', value: selectedBulletin.policeAnalysis.articulos, color: 'border-emerald-500/30 bg-emerald-500/5' },
                        ].map(row => (
                          <div key={row.num} className={`border rounded-2xl p-4 flex flex-col gap-1.5 ${row.color}`}>
                            <span className="text-[9px] font-black text-slate-400 dark:text-gray-500 uppercase tracking-widest">{row.num}. {row.label}</span>
                            <p className="text-xs font-semibold text-slate-800 dark:text-gray-200 leading-relaxed">{row.value}</p>
                          </div>
                        ))}

                        <div className="flex gap-2 pt-2 border-t border-slate-100 dark:border-white/5">
                          <button onClick={() => {
                            setPreviewFile({ title: selectedBulletin.number, url: selectedBulletin.url, driveFileId: selectedBulletin.driveFileId, item: selectedBulletin });
                            setPreviewViewMode('pdf');
                            setPdfPage(1);
                            setPdfZoom(100);
                          }}
                            className="flex-1 flex items-center justify-center gap-2 py-2.5 px-4 bg-slate-50 dark:bg-white/5 hover:bg-blue-600/10 text-slate-700 dark:text-gray-300 hover:text-blue-500 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all border border-slate-200 dark:border-white/10">
                            <Eye className="w-3.5 h-3.5" /> Ver PDF
                          </button>
                          <button onClick={() => window.open(selectedBulletin.url, '_blank')}
                            className="flex items-center justify-center gap-2 py-2.5 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-[10px] font-black uppercase tracking-wider transition-all shadow-md">
                            <ExternalLink className="w-3.5 h-3.5" /> Drive
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex flex-col gap-5">
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <span className="text-[9px] font-black text-blue-500 uppercase tracking-widest font-mono">{selectedBulletin.number}</span>
                            <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wide mt-1">{selectedBulletin.title}</h3>
                            <span className="text-[10px] text-slate-400 font-mono">{selectedBulletin.date}</span>
                          </div>
                          <span className="shrink-0 px-3 py-1.5 bg-slate-100 dark:bg-white/10 text-slate-500 dark:text-gray-400 border border-slate-200 dark:border-white/10 rounded-xl text-[9px] font-black uppercase tracking-widest flex items-center gap-1">
                            ✓ Sin Impacto Policial
                          </span>
                        </div>
                        <div className="p-4 bg-slate-50 dark:bg-white/[0.02] border border-slate-200 dark:border-white/5 rounded-2xl">
                          <p className="text-xs text-slate-500 dark:text-gray-400 italic leading-relaxed mb-4">
                            No existe impacto identificado a lo policial. Listado de contenidos del boletín:
                          </p>
                          {selectedBulletin.policeAnalysis?.noImpactList && selectedBulletin.policeAnalysis.noImpactList.length > 0 ? (
                            <div className="flex flex-col gap-2">
                              {selectedBulletin.policeAnalysis.noImpactList.map((item, i) => (
                                <div key={i} className="flex items-start gap-3 py-2 border-b border-slate-100 dark:border-white/5 last:border-0">
                                  <span className="text-[9px] font-black text-slate-400 w-4 shrink-0 mt-0.5">{i+1}.</span>
                                  <div className="flex flex-col gap-0.5">
                                    <span className="text-[11px] font-bold text-slate-700 dark:text-gray-300 leading-snug">{item.titulo}</span>
                                    <div className="flex gap-2 text-[9px] text-slate-400 font-mono">
                                      <span>{item.acto}</span>
                                      <span>—</span>
                                      <span>{item.fecha}</span>
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <p className="text-xs text-slate-400 italic">Sin actos administrativos registrados en este boletín.</p>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            </div>
          );
        })()}
      </AnimatePresence>

      {/* SHARE TOAST */}
      <AnimatePresence>
        {showShareToast && (
          <div className="fixed bottom-20 left-1/2 -translate-x-1/2 z-50 bg-slate-900/90 dark:bg-white/95 text-white dark:text-black py-2.5 px-5 rounded-full shadow-premium backdrop-blur-md flex items-center gap-2 border border-white/10 dark:border-black/10">
            <Check className="w-4 h-4 text-emerald-500" />
            <span className="text-xs font-bold font-sans uppercase tracking-wider">{showShareToast}</span>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
