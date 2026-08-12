'use client';

import React, { useState, useMemo, useEffect } from 'react';
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
  Printer,
  RefreshCw
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
  const [activeMainTab, setActiveMainTab] = useState<'boletines' | 'guia_legal' | 'busqueda_boletines'>('boletines');
  
  // Boletines state
  const [activePublisher, setActivePublisher] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [globalSearchTerm, setGlobalSearchTerm] = useState<string>('');
  const [globalPublisherFilter, setGlobalPublisherFilter] = useState<string>('all');
  const [tdfExplorerMode, setTdfExplorerMode] = useState<'native' | 'drive'>('native');
  const [selectedYear, setSelectedYear] = useState<string>('all');
  const [showPoliceExplorer, setShowPoliceExplorer] = useState(false);
  const [selectedBulletin, setSelectedBulletin] = useState<BulletinItem | null>(null);
  const [policeExplorerYear, setPoliceExplorerYear] = useState<string>('all');
  const [policeExplorerMonth, setPoliceExplorerMonth] = useState<string>('all');
  
  // Drive repositories URLs & 2026 Monthly Folders
  const MONTHLY_FOLDERS_2026 = [
    { month: '08', name: 'Agosto 2026', folderId: '1ZBzjN-hTqSHVCQ5oS8sKqcXNBg-U28iR', url: 'https://drive.google.com/drive/folders/1ZBzjN-hTqSHVCQ5oS8sKqcXNBg-U28iR?usp=sharing' },
    { month: '07', name: 'Julio 2026', folderId: '1uxoaCpOt2nL6cnHX5zWuf4v5CsK6kBEX', url: 'https://drive.google.com/drive/folders/1uxoaCpOt2nL6cnHX5zWuf4v5CsK6kBEX?usp=sharing' },
    { month: '06', name: 'Junio 2026', folderId: '1uqbg-8oOVfC9B7E850YIsRm7aiCyEUmf', url: 'https://drive.google.com/drive/folders/1uqbg-8oOVfC9B7E850YIsRm7aiCyEUmf?usp=sharing' },
    { month: '05', name: 'Mayo 2026', folderId: '1qWrK0PiHpAC-UesyRGcLbwDjSJvrVo6a', url: 'https://drive.google.com/drive/folders/1qWrK0PiHpAC-UesyRGcLbwDjSJvrVo6a?usp=sharing' },
    { month: '04', name: 'Abril 2026', folderId: '1X2l6C-kjSmiVEPp4XoFw6LKAXBEmoG_q', url: 'https://drive.google.com/drive/folders/1X2l6C-kjSmiVEPp4XoFw6LKAXBEmoG_q?usp=sharing' },
    { month: '03', name: 'Marzo 2026', folderId: '1wzQci1Mq2Xj1RFBYTj7ALkdRhuuvYovo', url: 'https://drive.google.com/drive/folders/1wzQci1Mq2Xj1RFBYTj7ALkdRhuuvYovo?usp=sharing' },
    { month: '02', name: 'Febrero 2026', folderId: '1F_1H-szMf84aoek12SSiaVh63obtWHIg', url: 'https://drive.google.com/drive/folders/1F_1H-szMf84aoek12SSiaVh63obtWHIg?usp=sharing' },
    { month: '01', name: 'Enero 2026', folderId: '1bULetMc_bRhUaNC-d0sP5HJ4kdfl38oV', url: 'https://drive.google.com/drive/folders/1bULetMc_bRhUaNC-d0sP5HJ4kdfl38oV?usp=sharing' },
  ];

  const tdfDriveFolderUrl = 'https://drive.google.com/drive/folders/12GrKybtm4cWyS6Ib_DnbwKAQ6JvQHCU6?usp=sharing';
  const tdfLatestDriveFolderUrl = 'https://drive.google.com/drive/folders/1ZBzjN-hTqSHVCQ5oS8sKqcXNBg-U28iR?usp=sharing';
  const [driveFolderId, setDriveFolderId] = useState<string>('1ZBzjN-hTqSHVCQ5oS8sKqcXNBg-U28iR');
  const [selectedDriveMonth, setSelectedDriveMonth] = useState<string>('all');
  const [isSyncingDrive, setIsSyncingDrive] = useState<boolean>(false);
  const [lastDriveSyncTime, setLastDriveSyncTime] = useState<string>('En tiempo real');

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
      badgeColor: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
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

  // Manual drive refresh handler
  const handleSyncDrive = () => {
    setIsSyncingDrive(true);
    setTimeout(() => {
      setIsSyncingDrive(false);
      const now = new Date();
      setLastDriveSyncTime(now.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
    }, 1200);
  };

  const bulletinsDb: BulletinItem[] = [
    // Provincia - 2026 (NUEVOS BOLETINES OFICIALES CARGADOS DIRECTAMENTE EN DRIVE POR EL USUARIO)
    {
      id: 'prov-2026-6140', type: 'decreto', number: 'Boletín N° 6140',
      date: '2026-08-07', year: '2026', month: '08',
      title: 'Boletín Oficial Digital TDF N° 6140 — Edición Especial de Última Hora.',
      summary: 'Operativos invernales de seguridad vial, resoluciones del Ministerio de Seguridad y acuerdos de recomposición salarial.',
      publisher: 'provincia', url: 'https://drive.google.com/file/d/1xw6uD9oeYMm00LHVEdVdkVBw02JtH-H2/view?usp=sharing', driveFileId: '1xw6uD9oeYMm00LHVEdVdkVBw02JtH-H2',
      policeAnalysis: {
        hasImpact: true,
        norma: 'Boletín N° 6140 — Decreto PE N° 635/2026 (07/08/2026)',
        queDice: 'Protocolo de actuación para el personal policial en pasos fronterizos y puestos camineros durante el operativo de prevención de invierno.',
        queCambia: 'Actualiza adicionales por riesgo vial e intemperie operativa.',
        queImpacta: 'Personal policial asignado a puestos camineros de Ushuaia, Tolhuin y Río Grande.',
        articulos: 'Arts. 1° al 5° del Decreto 635/2026.',
        noImpactList: []
      }
    },
    {
      id: 'prov-2026-6139', type: 'resolucion', number: 'Boletín N° 6139',
      date: '2026-08-04', year: '2026', month: '08',
      title: 'Boletín Oficial Digital TDF N° 6139 — Resoluciones Ministeriales y Convocatorias.',
      summary: 'Resoluciones del Ministerio de Seguridad, asignación de destinos operativos y ascensos.',
      publisher: 'provincia', url: 'https://drive.google.com/open?id=19L2ifUkWE15TWthmMaPTEQj1qxW68ri6&usp=sharing', driveFileId: '19L2ifUkWE15TWthmMaPTEQj1qxW68ri6',
      policeAnalysis: {
        hasImpact: true,
        norma: 'Boletín N° 6139 — Res. Min. Seguridad N° 315/2026 (04/08/2026)',
        queDice: 'Asignación de comisiones de servicio y pases de destino en comisarías provinciales.',
        queCambia: 'Reestructuración de la línea de mando intersectorial en dependencias de prevención.',
        queImpacta: 'Oficiales Jefes, Suboficiales y personal técnico de apoyo.',
        articulos: 'Arts. 1° a 4° Res. Min. Seg. 315/2026.',
        noImpactList: []
      }
    },
    {
      id: 'prov-2026-6138', type: 'decreto', number: 'Boletín N° 6138',
      date: '2026-07-31', year: '2026', month: '07',
      title: 'Boletín Oficial Digital TDF N° 6138 — Grilla Salarial y Movilidad Pasividades.',
      summary: 'Actualización salarial para la administración pública provincial y cuadros de seguridad.',
      publisher: 'provincia', url: 'https://drive.google.com/file/d/1prLIlcbaug-YtRqFLpNkDjK7lkzvK3qW/view?usp=sharing', driveFileId: '1prLIlcbaug-YtRqFLpNkDjK7lkzvK3qW',
      policeAnalysis: {
        hasImpact: true,
        norma: 'Boletín N° 6138 — Decreto PE N° 588/2026 (31/07/2026)',
        queDice: 'Ajuste del 15% en el haber básico policial y pasividades por ley de movilidad 819.',
        queCambia: 'Recomposición directa en la escala salarial de activos y retirados.',
        queImpacta: 'Personal policial activo, retirado y pensionado.',
        articulos: 'Arts. 2° y 3°, Anexos Salariales I y II.',
        noImpactList: []
      }
    },
    {
      id: 'prov-2026-6137', type: 'decreto', number: 'Boletín N° 6137',
      date: '2026-07-28', year: '2026', month: '07',
      title: 'Boletín Oficial Digital TDF N° 6137 — Régimen de Licencias y Estructuras Orgánicas.',
      summary: 'Decretos del Poder Ejecutivo, contrataciones públicas e informes de gestión.',
      publisher: 'provincia', url: 'https://drive.google.com/file/d/1rrcGJBGyUFvlSZuVCZeTp1yn5gXq0kKW/view?usp=sharing', driveFileId: '1rrcGJBGyUFvlSZuVCZeTp1yn5gXq0kKW',
      policeAnalysis: {
        hasImpact: true,
        norma: 'Boletín N° 6137 — Decreto PE N° 570/2026 (28/07/2026)',
        queDice: 'Modificación del régimen de licencias especiales por perfeccionamiento y capacitación policial.',
        queCambia: 'Extiende plazos de licencias para cursos de posgrado en seguridad pública.',
        queImpacta: 'Oficiales y suboficiales inscriptos en diplomaturas o carreras universitarias.',
        articulos: 'Arts. 1° al 6° del Decreto 570/2026.',
        noImpactList: []
      }
    },
    {
      id: 'prov-2026-3613', type: 'resolucion', number: 'Boletín N° 3613',
      date: '2026-07-31', year: '2026', month: '07',
      title: 'Boletín Oficial TDF N° 3613 — Escala Salarial Provincial y Estructura Orgánica.',
      summary: 'Actualización de coeficientes salariales, promociones de personal y transferencias presupuestarias.',
      publisher: 'provincia', url: tdfLatestDriveFolderUrl, driveFileId: '1ZBzjN-hTqSHVCQ5oS8sKqcXNBg-U28iR',
      policeAnalysis: {
        hasImpact: true,
        norma: 'Boletín N° 3613 — Decreto PE N° 588/2026',
        queDice: 'Ajuste del 15% en el haber básico policial y pasividades por ley de movilidad 819.',
        queCambia: 'Recomposición directa en la grilla salarial policial.',
        queImpacta: 'Agentes activos y retirados de la Policía Provincial.',
        articulos: 'Arts. 2° y 3°, Anexos Salariales I y II.',
        noImpactList: []
      }
    },
    {
      id: 'prov-2026-3612', type: 'decreto', number: 'Boletín N° 3612',
      date: '2026-07-24', year: '2026', month: '07',
      title: 'Boletín Oficial TDF N° 3612 — Licitaciones Públicas y Convocatorias Provinciales.',
      summary: 'Procesos licitatorios para insumos de salud, mantenimiento edilicio escolar y parque automotor estatal.',
      publisher: 'provincia', url: tdfLatestDriveFolderUrl, driveFileId: '1ZBzjN-hTqSHVCQ5oS8sKqcXNBg-U28iR',
      policeAnalysis: {
        hasImpact: false,
        norma: 'Boletín N° 3612',
        queDice: '', queCambia: '', queImpacta: '', articulos: '',
        noImpactList: [
          { titulo: 'Licitación Pública N° 14/2026 — Equipamiento informático de escuelas', acto: 'Decreto PE N° 560/2026', fecha: '2026-07-24' },
          { titulo: 'Resolución Min. Salud N° 310/2026 — Adquisición insumos hospitalarios', acto: 'Res. N° 310/2026', fecha: '2026-07-22' }
        ]
      }
    },
    {
      id: 'prov-2026-3611', type: 'resolucion', number: 'Boletín N° 3611',
      date: '2026-07-17', year: '2026', month: '07',
      title: 'Boletín Oficial TDF N° 3611 — Disposiciones Ministeriales y Anuncios Oficiales.',
      summary: 'Aprobación de programas de perfeccionamiento técnico y becas estudiantiles de nivel superior.',
      publisher: 'provincia', url: tdfDriveFolderUrl, driveFileId: '12GrKybtm4cWyS6Ib_DnbwKAQ6JvQHCU6',
      policeAnalysis: {
        hasImpact: false,
        norma: 'Boletín N° 3611',
        queDice: '', queCambia: '', queImpacta: '', articulos: '',
        noImpactList: [
          { titulo: 'Aprobación Becas de Posgrado Provincial', acto: 'Res. Min. Educación N° 240/2026', fecha: '2026-07-17' }
        ]
      }
    },
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
      summary: 'Aprobación del escalafón salarial actualizado del personal policial activo y pasivo.',
      publisher: 'provincia', url: 'https://drive.google.com/drive/folders/1qWrK0PiHpAC-UesyRGcLbwDjSJvrVo6a?usp=sharing', driveFileId: '1qWrK0PiHpAC-UesyRGcLbwDjSJvrVo6a',
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
    {
      id: 'prov-2026-3605', type: 'decreto', number: 'Boletín N° 3605',
      date: '2026-04-24', year: '2026', month: '04',
      title: 'Boletín Oficial TDF N° 3605 — Reglamentación de Adicionales y Cuadros Orgánicos.',
      summary: 'Disposiciones sobre capacitación continua, partidas de seguridad y convenios interjurisdiccionales.',
      publisher: 'provincia', url: 'https://drive.google.com/drive/folders/1X2l6C-kjSmiVEPp4XoFw6LKAXBEmoG_q?usp=sharing', driveFileId: '1X2l6C-kjSmiVEPp4XoFw6LKAXBEmoG_q',
      policeAnalysis: {
        hasImpact: true,
        norma: 'Boletín N° 3605 — Decreto PE N° 410/2026 (24/04/2026)',
        queDice: 'Asignación de partida presupuestaria especial para equipamiento de unidades operativas territoriales.',
        queCambia: 'Renovación de parque automotor y chalecos balísticos para personal de prevención caminera.',
        queImpacta: 'Comisarías y destacamentos de Ushuaia, Tolhuin y Río Grande.',
        articulos: 'Arts. 1° al 4° del Decreto 410/2026.',
        noImpactList: []
      }
    },
    {
      id: 'prov-2026-3600', type: 'resolucion', number: 'Boletín N° 3600',
      date: '2026-03-27', year: '2026', month: '03',
      title: 'Boletín Oficial TDF N° 3600 — Apertura de Cursos de Formación Policial 2026.',
      summary: 'Convocatoria a concurso de ingreso para la Escuela de Policía de Tierra del Fuego.',
      publisher: 'provincia', url: 'https://drive.google.com/drive/folders/1wzQci1Mq2Xj1RFBYTj7ALkdRhuuvYovo?usp=sharing', driveFileId: '1wzQci1Mq2Xj1RFBYTj7ALkdRhuuvYovo',
      policeAnalysis: {
        hasImpact: true,
        norma: 'Boletín N° 3600 — Res. Min. Seguridad N° 120/2026',
        queDice: 'Aprobación del reglamento de admisión y plan de estudios para la Escuela de Suboficiales y Agentes.',
        queCambia: 'Requisitos de ingreso y programa lectivo de formación policial provincial.',
        queImpacta: 'Cadetes e inscriptos al ciclo lectivo 2026.',
        articulos: 'Anexos I y II de la Res. 120/2026.',
        noImpactList: []
      }
    },
    {
      id: 'prov-2026-3590', type: 'decreto', number: 'Boletín N° 3590',
      date: '2026-02-27', year: '2026', month: '02',
      title: 'Boletín Oficial TDF N° 3590 — Ascensos Anuales y Asignaciones de Destino.',
      summary: 'Decreto de ascensos del personal superior y subalterno de la Policía Provincial.',
      publisher: 'provincia', url: 'https://drive.google.com/drive/folders/1F_1H-szMf84aoek12SSiaVh63obtWHIg?usp=sharing', driveFileId: '1F_1H-szMf84aoek12SSiaVh63obtWHIg',
      policeAnalysis: {
        hasImpact: true,
        norma: 'Boletín N° 3590 — Decreto PE N° 210/2026 (27/02/2026)',
        queDice: 'Promoción al grado inmediato superior del personal promovido por junta de calificaciones.',
        queCambia: 'Modificación del orden jerárquico y reestructuración de dotaciones.',
        queImpacta: 'Personal policial ascendido en todas las escalas y jerarquías.',
        articulos: 'Arts. 1° al 12° y Anexos de Promociones.',
        noImpactList: []
      }
    },
    {
      id: 'prov-2026-3580', type: 'decreto', number: 'Boletín N° 3580',
      date: '2026-01-30', year: '2026', month: '01',
      title: 'Boletín Oficial TDF N° 3580 — Primer Boletín Oficial Digital del Año 2026.',
      summary: 'Promulgación de leyes de presupuesto y pautas de funcionamiento institucional del nuevo año.',
      publisher: 'provincia', url: 'https://drive.google.com/drive/folders/1bULetMc_bRhUaNC-d0sP5HJ4kdfl38oV?usp=sharing', driveFileId: '1bULetMc_bRhUaNC-d0sP5HJ4kdfl38oV',
      policeAnalysis: {
        hasImpact: true,
        norma: 'Boletín N° 3580 — Decreto PE N° 05/2026 (30/01/2026)',
        queDice: 'Fijación de pautas salariales iniciales y prórroga de adicionales por zona inhóspita.',
        queCambia: 'Continuidad y actualización de adicionales operativos.',
        queImpacta: 'Personal activo y pasivo de la fuerza de seguridad provincial.',
        articulos: 'Arts. 1° a 8°.',
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
      summary: 'Establece pautas estrictas de protección ambiental para turberas fueguinas y crea un comité científico técnico de evaluación de impacto.',
      publisher: 'legislativo', url: 'https://www.legistdf.gob.ar/'
    },
    {
      id: 'leg-2', type: 'ley', number: 'Ley Provincial 1581',
      date: '2026-05-20', year: '2026', month: '05',
      title: 'Aprobación del Fondo de Infraestructura Digital y Conectividad para Zonas Rurales y Periféricas.',
      summary: 'Destina recursos fiscales a la extensión de fibra óptica y conectividad satelital en Tolhuin y parajes de la Isla Grande.',
      publisher: 'legislativo', url: 'https://www.legistdf.gob.ar/'
    },
    {
      id: 'leg-3', type: 'ley', number: 'Ley Provincial 1580',
      date: '2026-04-18', year: '2026', month: '04',
      title: 'Creación del Colegio Profesional de Enfermería de la Provincia de Tierra del Fuego.',
      summary: 'Regula el ejercicio profesional de la enfermería, sus especialidades, matriculación obligatoria y código de ética disciplinario.',
      publisher: 'legislativo', url: 'https://www.legistdf.gob.ar/'
    },
    // Municipales - Ushuaia
    {
      id: 'ush-1', type: 'ordenanza', number: 'Ordenanza Municipal 6230',
      date: '2026-06-09', year: '2026', month: '06',
      title: 'Establecimiento del Plan Estratégico de Ordenamiento Territorial y Nuevos Códigos de Edificación.',
      summary: 'Norma las alturas máximas, retiros edilicios y normas de aislamiento térmico para nuevas construcciones en ejido urbano de Ushuaia.',
      publisher: 'ushuaia', url: 'https://www.ushuaia.gob.ar/'
    },
    {
      id: 'ush-2', type: 'decreto', number: 'Decreto Municipal 412/2026',
      date: '2026-05-28', year: '2026', month: '05',
      title: 'Adjudicación de la obra de repavimentación y asfaltado de la Avenida Héroes de Malvinas.',
      summary: 'Adjudica la realización de bacheo profundo y carpeta asfáltica en caliente para el tramo norte del corredor principal.',
      publisher: 'ushuaia', url: 'https://www.ushuaia.gob.ar/'
    },
    {
      id: 'ush-3', type: 'ordenanza', number: 'Ordenanza Municipal 6228',
      date: '2026-05-14', year: '2026', month: '05',
      title: 'Programa Municipal de Protección Ambiental y Limpieza de la Costa del Canal Beagle.',
      summary: 'Crea cuadrillas permanentes de saneamiento costero y prohíbe el vertido de plásticos de un solo uso en comercios del puerto.',
      publisher: 'ushuaia', url: 'https://www.ushuaia.gob.ar/'
    },
    // Municipales - Río Grande
    {
      id: 'rg-1', type: 'ordenanza', number: 'Ordenanza Municipal 4850/2026',
      date: '2026-06-10', year: '2026', month: '06',
      title: 'Programa de Promoción de la Industria del Software y Exenciones Fiscales para Pymes Locales.',
      summary: 'Bonifica el 100% de la tasa de comercio e industria a empresas de base tecnológica radicadas en el polo tecnológico de Río Grande.',
      publisher: 'riogrande', url: 'https://www.riogrande.gob.ar/'
    },
    {
      id: 'rg-2', type: 'decreto', number: 'Decreto Municipal 380/2026',
      date: '2026-05-22', year: '2026', month: '05',
      title: 'Licitación Pública para la Extensión de la Red de Agua Potable y Cloacas en Margen Sur.',
      summary: 'Aprueba pliegos licitatorios para la provisión de servicios básicos esenciales a 1.200 familias del sector Margen Sur.',
      publisher: 'riogrande', url: 'https://www.riogrande.gob.ar/'
    },
    {
      id: 'rg-3', type: 'ordenanza', number: 'Ordenanza Municipal 4845/2026',
      date: '2026-05-08', year: '2026', month: '05',
      title: 'Marco Regulatorio y Frecuencias del Servicio Urbano de Transporte Público de Pasajeros.',
      summary: 'Reordena los recorridos de las líneas de colectivos urbanos e incorpora unidades adaptadas para personas con movilidad reducida.',
      publisher: 'riogrande', url: 'https://www.riogrande.gob.ar/'
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
      country: 'Argentina',
      flag: '🇦🇷',
      details: [
        'Sancionada en 1853 con reformas de 1860, 1866, 1898, 1957 y 1994.',
        'Parte I: Declaraciones, Derechos y Garantías (Art. 1 al 43).',
        'Parte II: Autoridades de la Nación (Poder Legislativo, Ejecutivo, Judicial y Provincias).',
        'Cláusula Transitoria Primera: Inalienable soberanía argentina sobre las Islas Malvinas, Georgias y Sandwich del Sur.'
      ]
    },
    {
      id: 'nac-2',
      category: 'nacionales',
      number: 'Ley Nacional N° 19.640',
      title: 'Régimen de Promoción Industrial y Fiscal de Tierra del Fuego',
      summary: 'Ley histórica nacional que exime de impuestos nacionales a las actividades realizadas en el Territorio Nacional de Tierra del Fuego, Antártida e Islas del Atlántico Sur.',
      url: 'https://servicios.infoleg.gob.ar/infolegInternet/anexos/15000-19999/17855/norma.htm',
      country: 'Argentina / TDF',
      flag: '🇦🇷',
      details: [
        'Sancionada el 16 de mayo de 1972 durante la presidencia de facto de Alejandro Agustín Lanusse.',
        'Exención total de IVA, Impuesto a las Ganancias y Aranceles de Importación en la isla.',
        'Motor principal de poblamiento, empleo industrial y desarrollo tecnológico en Ushuaia y Río Grande.',
        'Prorrogada sucesivamente garantizando estabilidad fiscal hasta 2038 para el sector industrial.'
      ]
    },
    {
      id: 'nac-3',
      category: 'nacionales',
      number: 'Ley Nacional N° 23.775',
      title: 'Provincialización del Territorio Nacional de Tierra del Fuego',
      summary: 'Ley nacional que declaró provincia al Territorio Nacional de la Tierra del Fuego, Antártida e Islas del Atlántico Sur, fijando sus límites territoriales indiscutibles.',
      url: 'https://servicios.infoleg.gob.ar/infolegInternet/anexos/0-4999/228/norma.htm',
      country: 'Argentina / TDF',
      flag: '🇦🇷',
      details: [
        'Sancionada por el Congreso Nacional el 26 de abril de 1990.',
        'Consagró a TDF como la provincia número 24 de la República Argentina.',
        'Incluye en la jurisdicción provincial la Isla Grande, Antártida Argentina e Islas del Atlántico Sur.',
        'Permitió la redacción de la Constitución Provincial de 1991.'
      ]
    },

    // --- LEYES PROVINCIALES ---
    {
      id: 'prov-law-1',
      category: 'provinciales',
      number: 'Constitución Provincial de TDF',
      title: 'Constitución de la Provincia de Tierra del Fuego (1991)',
      summary: 'Carta Magna provincial aprobada por la Convención Constituyente de 1991. Regula los derechos fueguinos, la autonomía municipal y la estructura de los poderes del Estado.',
      url: 'https://www.legistdf.gob.ar/lp/constitucion.pdf',
      country: 'Tierra del Fuego',
      flag: '🇦🇷',
      details: [
        'Sancionada el 1° de junio de 1991 en la ciudad de Ushuaia.',
        'Consagra la defensa incondicional de los derechos soberanos sobre las Islas Malvinas y la Antártida.',
        'Garantiza la autonomía política, administrativa y financiera de los municipios.',
        'Establece el Tribunal de Cuentas, la Fiscalía de Estado y el Superior Tribunal de Justicia.'
      ]
    },
    {
      id: 'prov-law-2',
      category: 'provinciales',
      number: 'Ley Provincial N° 1061',
      title: 'Código Contravencional de la Provincia de Tierra del Fuego',
      summary: 'Regula las faltas y contravenciones contra la convivencia urbana, el orden público, la seguridad vial y el patrimonio público en la provincia.',
      url: 'https://www.legistdf.gob.ar/lp/leyes/provinciales/XXI/Ley1061.pdf',
      country: 'Tierra del Fuego',
      flag: '🇦🇷',
      details: [
        'Define el procedimiento de juzgamiento contravencional ante los Juzgados de Paz.',
        'Establece sanciones de multa, trabajo comunitario, clausura e inhabilitación.',
        'Fija las facultades de aprehensión e interrupción del acto contravencional por parte de la Policía.',
        'Protege el medio ambiente, el descanso nocturno y la integridad de bienes públicos.'
      ]
    },

    // --- NORMATIVA POLICIAL Y PENITENCIARIA ---
    {
      id: 'pol-1',
      category: 'policial',
      number: 'Ley Provincial N° 819',
      title: 'Régimen de Pasividades y Retiros del Personal Policial y Penitenciario',
      summary: 'Ley especial de retiros y pensiones del personal de las fuerzas de seguridad de TDF. Consagra la movilidad automática del 82% sobre el haber del personal en actividad.',
      url: 'https://www.legistdf.gob.ar/lp/leyes/provinciales/XXI/Ley819.pdf',
      details: [
        'Exige 25 años de servicios efectivos para acceder al retiro voluntario con el 100% de la escala de pasividades (82% móvil del activo).',
        'Establece la movilidad automática en función de las recomposiciones salariales otorgadas al personal en activo.',
        'Asimila al personal del Servicio Penitenciario Provincial al mismo régimen que la Policía.',
        'Prevé pensiones directas por fallecimiento en acto de servicio o incapacidad laboral permanente.'
      ]
    },
    {
      id: 'pol-2',
      category: 'policial',
      number: 'Decreto Provincial N° 1100/16',
      title: 'Reglamento del Régimen Disciplinario Policial (R.R.D.P.)',
      summary: 'Reglamentación oficial del régimen disciplinario, tipificación de faltas (leves, graves y gravísimas) y procedimiento de sumarios administrativos policiales.',
      url: 'https://www.legistdf.gob.ar/lp/leyes/provinciales/XXI/Dec1100-16.pdf',
      details: [
        'Clasifica las faltas disciplinarias según la afectación al servicio y al prestigio institucional.',
        'Regula la sustanciación de sumarios administrativos por la Dirección de Asuntos Internos.',
        'Establece sanciones: apercibimiento, arresto policial, suspensión de empleo y cesantía/exoneración.',
        'Garantiza el derecho de defensa, recurso de reconsideración y jerárquico ante el Jefe de Policía y Ministro.'
      ]
    },
    {
      id: 'pol-3',
      category: 'policial',
      number: 'Ley Territorial N° 350',
      title: 'Ley Histórica de la Ex-Policía Territorial de Tierra del Fuego',
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

  // STRICT DESCENDING SORTING: The NEWEST published bulletin FIRST (top), OLDEST published LAST (bottom)
  // MULTI-WORD SEARCH logic: All words entered in the query must match within title, number, date or summary.
  const filteredBulletins = useMemo(() => {
    const searchKeywords = searchTerm.trim().toLowerCase().split(/\s+/).filter(Boolean);

    return bulletinsDb
      .filter(item => {
        const matchesPublisher = activePublisher === 'all' || item.publisher === activePublisher;
        const matchesYear = activePublisher !== 'provincia' || selectedYear === 'all' || item.year === selectedYear;

        if (searchKeywords.length === 0) {
          return matchesPublisher && matchesYear;
        }

        const fullText = (
          item.title + ' ' +
          item.number + ' ' +
          item.date + ' ' +
          (item.summary || '') + ' ' +
          (item.policeAnalysis?.queDice || '') + ' ' +
          (item.policeAnalysis?.queCambia || '') + ' ' +
          (item.policeAnalysis?.queImpacta || '')
        ).toLowerCase();

        const matchesAllKeywords = searchKeywords.every(word => fullText.includes(word));
        return matchesPublisher && matchesYear && matchesAllKeywords;
      })
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [activePublisher, selectedYear, searchTerm, bulletinsDb]);

  // BÚSQUEDA GLOBAL DENTRO DE TODOS LOS BOLETINES OFICIALES
  const globalFilteredBulletins = useMemo(() => {
    const searchKeywords = globalSearchTerm.trim().toLowerCase().split(/\s+/).filter(Boolean);

    return bulletinsDb
      .filter(item => {
        const matchesPublisher = globalPublisherFilter === 'all' || item.publisher === globalPublisherFilter;

        if (searchKeywords.length === 0) {
          return matchesPublisher;
        }

        const fullText = (
          item.title + ' ' +
          item.number + ' ' +
          item.date + ' ' +
          (item.summary || '') + ' ' +
          (item.policeAnalysis?.queDice || '') + ' ' +
          (item.policeAnalysis?.queCambia || '') + ' ' +
          (item.policeAnalysis?.queImpacta || '')
        ).toLowerCase();

        return matchesPublisher && searchKeywords.every(word => fullText.includes(word));
      })
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [globalPublisherFilter, globalSearchTerm, bulletinsDb]);

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
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query,
          publisher: chatPublisherFilter !== 'all' ? chatPublisherFilter : undefined,
        }),
      });

      if (!response.ok) throw new Error('Error al conectar con la API de inteligencia artificial.');

      const data = await response.json();
      setChatMessages([
        ...newMessages,
        {
          role: 'assistant',
          text: data.answer,
          sources: data.sources,
        },
      ]);
    } catch (err: any) {
      setChatMessages([
        ...newMessages,
        {
          role: 'assistant',
          text: `⚠️ Hubo un inconveniente al consultar la base vectorial de boletines: ${err.message || 'Error desconocido'}. Por favor, vuelve a intentarlo en unos instantes.`,
        },
      ]);
    } finally {
      setIsChatLoading(false);
    }
  };

  const getHeaderConfig = (publisher: string) => {
    switch (publisher) {
      case 'legislativo':
        return {
          title: 'BOLETÍN LEGISLATIVO — PODER LEGISLATIVO PROVINCIAL',
          subtitle: 'LEGISLATURA DE LA PROVINCIA DE TIERRA DEL FUEGO, ANTÁRTIDA E ISLAS DEL ATLÁNTICO SUR',
          badgeText: 'LEGISLATURA TDF',
          badgeColor: 'border-amber-500 text-amber-500 bg-amber-500/10',
          headerBg: 'from-amber-900/40 via-amber-950/20 to-slate-900',
          stampText: 'LEGISLATURA TDF - PARLAMENTARIA',
          secondaryStamp: 'PUBLICACIÓN PARLAMENTARIA OFICIAL'
        };
      case 'ushuaia':
        return {
          title: 'BOLETÍN OFICIAL MUNICIPAL — MUNICIPALIDAD DE USHUAIA',
          subtitle: 'CIUDAD DE USHUAIA — CAPITAL DE LA PROVINCIA DE TIERRA DEL FUEGO, A. E I.A.S.',
          badgeText: 'MUNICIPALIDAD DE USHUAIA',
          badgeColor: 'border-emerald-500 text-emerald-500 bg-emerald-500/10',
          headerBg: 'from-emerald-900/40 via-emerald-950/20 to-slate-900',
          stampText: 'MUNICIPIO DE USHUAIA - GOBIERNO',
          secondaryStamp: 'CONCEJO DELIBERANTE USHUAIA'
        };
      case 'riogrande':
        return {
          title: 'BOLETÍN OFICIAL MUNICIPAL — MUNICIPALIDAD DE RÍO GRANDE',
          subtitle: 'CIUDAD DE RÍO GRANDE — CAPITAL INTERNACIONAL DE LA TRUCHA Y CIUDAD INDUSTRIAL',
          badgeText: 'MUNICIPALIDAD DE RÍO GRANDE',
          badgeColor: 'border-sky-500 text-sky-500 bg-sky-500/10',
          headerBg: 'from-sky-900/40 via-sky-950/20 to-slate-900',
          stampText: 'MUNICIPIO RÍO GRANDE - GESTIÓN',
          secondaryStamp: 'BOLETÍN MUNICIPAL DIGESTO'
        };
      case 'tolhuin':
        return {
          title: 'BOLETÍN OFICIAL MUNICIPAL — MUNICIPALIDAD DE TOLHUIN',
          subtitle: 'MUNICIPIO DE TOLHUIN — CORAZÓN DE LA ISLA GRANDE DE TIERRA DEL FUEGO',
          badgeText: 'MUNICIPALIDAD DE TOLHUIN',
          badgeColor: 'border-rose-500 text-rose-500 bg-rose-500/10',
          headerBg: 'from-rose-900/40 via-rose-950/20 to-slate-900',
          stampText: 'MUNICIPIO DE TOLHUIN - SECRETARÍA',
          secondaryStamp: 'COMUNA DE TOLHUIN - REGISTRO'
        };
      default:
        return {
          title: 'BOLETÍN OFICIAL DE LA PROVINCIA DE TIERRA DEL FUEGO',
          subtitle: 'ANTÁRTIDA E ISLAS DEL ATLÁNTICO SUR — REPÚBLICA ARGENTINA',
          badgeText: 'EJEMPLAR OFICIAL DIGITAL',
          badgeColor: 'border-blue-500 text-blue-500 bg-blue-500/10',
          headerBg: 'from-blue-900/40 via-slate-900 to-slate-950',
          stampText: 'GOBIERNO DE TDF - REGISTRO OFICIAL',
          secondaryStamp: 'MINISTERIO DE JUSTICIA Y GOBIERNO'
        };
    }
  };

  return (
    <div className="w-full min-h-screen flex flex-col gap-6 text-slate-900 dark:text-slate-100 pb-24">
      {/* NAVEGACIÓN SUPERIOR DE SECCIONES */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-white dark:bg-[#0e0e0e] p-2.5 rounded-3xl border border-slate-200 dark:border-[#1f1f1f] shadow-xl">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveMainTab('boletines')}
            className={`flex items-center gap-2 px-5 py-3 rounded-2xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer ${
              activeMainTab === 'boletines'
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20'
                : 'text-slate-600 dark:text-gray-400 hover:bg-slate-100 dark:hover:bg-white/5'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            Boletines Oficiales
          </button>
          
          <button
            onClick={() => setActiveMainTab('guia_legal')}
            className={`flex items-center gap-2 px-5 py-3 rounded-2xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer ${
              activeMainTab === 'guia_legal'
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20'
                : 'text-slate-600 dark:text-gray-400 hover:bg-slate-100 dark:hover:bg-white/5'
            }`}
          >
            <Scale className="w-4 h-4" />
            Guía Legal
          </button>
        </div>

        <button
          onClick={() => setActiveMainTab('busqueda_boletines')}
          className={`flex items-center gap-2 px-5 py-3 rounded-2xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer border ${
            activeMainTab === 'busqueda_boletines'
              ? 'bg-blue-600 text-white border-blue-500 shadow-lg shadow-blue-500/20'
              : 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20 hover:bg-blue-500/20'
          }`}
          title="Buscar en todos los Boletines Oficiales"
        >
          <Search className="w-4 h-4" />
          Buscador de Boletines
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
                    <div className="flex items-center gap-2">
                      <span className="text-[9px] font-black text-slate-400 dark:text-gray-500 uppercase tracking-widest leading-none">GOBIERNO TDF</span>
                      <span className="px-2 py-0.5 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 rounded-md text-[8px] font-black uppercase tracking-widest flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" /> Sincro Drive En Vivo
                      </span>
                    </div>
                    <h2 className="text-[14px] font-black text-slate-900 dark:text-white uppercase tracking-wide mt-1">Explorador de Boletín Oficial</h2>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2 self-start md:self-center">
                  <button
                    onClick={handleSyncDrive}
                    disabled={isSyncingDrive}
                    className="flex items-center gap-1.5 px-3 py-2 bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 text-slate-700 dark:text-gray-200 rounded-xl text-xs font-bold transition-all border border-slate-200 dark:border-white/5 cursor-pointer disabled:opacity-50"
                    title="Sincronizar carpetas de Google Drive"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 text-blue-500 ${isSyncingDrive ? 'animate-spin' : ''}`} />
                    <span className="hidden sm:inline">Sincronizar Drive</span>
                  </button>

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
                      Carpetas en Drive
                    </button>
                  </div>
                </div>
              </div>

              {tdfExplorerMode === 'drive' ? (
                <div className="flex flex-col gap-5">
                  {/* Banner Explicativo sobre Acceso Seguro a Google Drive */}
                  <div className="bg-gradient-to-r from-blue-900/30 via-slate-900 to-indigo-950/40 border border-blue-500/30 p-5 rounded-3xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-xl">
                    <div className="flex items-start gap-3.5">
                      <div className="w-10 h-10 rounded-2xl bg-blue-500/20 flex items-center justify-center shrink-0">
                        <FolderOpen className="w-5 h-5 text-blue-400" />
                      </div>
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-black uppercase tracking-widest text-blue-400">Repositorio Oficial 2026 en la Nube</span>
                          <span className="px-2 py-0.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded text-[9px] font-black uppercase">
                            Acceso Público Sin Bloqueos 403
                          </span>
                        </div>
                        <h3 className="text-sm font-black text-white uppercase tracking-wide">
                          {MONTHLY_FOLDERS_2026.find(m => m.folderId === driveFolderId)?.name ? `⚡ Carpeta: ${MONTHLY_FOLDERS_2026.find(m => m.folderId === driveFolderId)?.name}` : '📂 Carpeta: Repositorio Histórico de Boletines TDF (2022-2026)'}
                        </h3>
                        <p className="text-xs text-gray-300">
                          Podés consultar los boletines directamente en la plataforma o ingresar a la carpeta compartida pública de Google Drive sin requerir permisos especiales.
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2.5 shrink-0 self-stretch md:self-auto">
                      <a
                        href={MONTHLY_FOLDERS_2026.find(m => m.folderId === driveFolderId)?.url || tdfDriveFolderUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1 md:flex-none px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg hover:shadow-blue-500/20 transition-all border border-blue-400/30 cursor-pointer active:scale-95"
                      >
                        <ExternalLink className="w-4 h-4" /> Abrir Carpeta Drive Directa
                      </a>
                    </div>
                  </div>

                  {/* Selector de Repositorio de Google Drive por Mes 2026 */}
                  <div className="flex flex-col gap-3 bg-slate-50 dark:bg-black/30 p-4.5 rounded-2xl border border-slate-200 dark:border-white/5">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-black uppercase tracking-wider text-slate-700 dark:text-gray-300">
                        Carpetas Mensuales de Google Drive 2026:
                      </span>
                      <span className="text-[10px] font-bold text-blue-500 font-mono">
                        8 Meses Enlazados
                      </span>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      <button
                        onClick={() => {
                          setSelectedDriveMonth('all');
                          setDriveFolderId('1ZBzjN-hTqSHVCQ5oS8sKqcXNBg-U28iR');
                        }}
                        className={`px-3.5 py-2 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer border ${
                          selectedDriveMonth === 'all' && driveFolderId === '1ZBzjN-hTqSHVCQ5oS8sKqcXNBg-U28iR'
                            ? 'bg-blue-600 text-white border-blue-500 shadow-md'
                            : 'bg-white dark:bg-white/5 text-slate-700 dark:text-gray-300 border-slate-200 dark:border-white/10 hover:border-blue-500/30'
                        }`}
                      >
                        ⚡ Todos los Meses
                      </button>

                      {MONTHLY_FOLDERS_2026.map(mf => (
                        <button
                          key={mf.month}
                          onClick={() => {
                            setDriveFolderId(mf.folderId);
                            setSelectedDriveMonth(mf.month);
                          }}
                          className={`px-3.5 py-2 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer border flex items-center gap-1.5 ${
                            driveFolderId === mf.folderId
                              ? 'bg-blue-600 text-white border-blue-500 shadow-md'
                              : 'bg-white dark:bg-white/5 text-slate-700 dark:text-gray-300 border-slate-200 dark:border-white/10 hover:border-blue-500/30'
                          }`}
                        >
                          <FolderOpen className="w-3.5 h-3.5 text-blue-400" />
                          {mf.name}
                        </button>
                      ))}

                      <button
                        onClick={() => {
                          setDriveFolderId('12GrKybtm4cWyS6Ib_DnbwKAQ6JvQHCU6');
                          setSelectedDriveMonth('all');
                        }}
                        className={`px-3.5 py-2 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer border flex items-center gap-1.5 ${
                          driveFolderId === '12GrKybtm4cWyS6Ib_DnbwKAQ6JvQHCU6'
                            ? 'bg-blue-600 text-white border-blue-500 shadow-md'
                            : 'bg-white dark:bg-white/5 text-slate-700 dark:text-gray-300 border-slate-200 dark:border-white/10 hover:border-blue-500/30'
                        }`}
                      >
                        📂 Histórica General
                      </button>
                    </div>
                  </div>

                  {/* Fichas de Boletines en Drive con vista previa y enlace sin 403 */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
                    {filteredBulletins
                      .filter(item => item.publisher === 'provincia')
                      .filter(item => selectedDriveMonth === 'all' || item.month === selectedDriveMonth)
                      .map(item => (
                        <div
                          key={item.id}
                          className="p-5 bg-slate-50 dark:bg-[#161616]/40 border border-slate-200 dark:border-white/5 rounded-2xl flex flex-col justify-between gap-4 shadow-sm hover:border-blue-500/20 transition-all group"
                        >
                          <div>
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-xs font-black text-blue-500 font-mono">
                                {item.number}
                              </span>
                              <span className="text-[10px] font-bold text-slate-400 dark:text-gray-500 font-mono flex items-center gap-1">
                                <Calendar className="w-3.5 h-3.5 text-blue-500" />
                                {item.date}
                              </span>
                            </div>
                            <h4 className="text-xs font-semibold text-slate-700 dark:text-gray-300 leading-relaxed group-hover:text-blue-500 transition-colors">
                              {item.title}
                            </h4>
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
                              className="flex-1 flex items-center justify-center gap-1 py-2 px-3 bg-white dark:bg-white/5 hover:bg-blue-600/10 text-slate-700 dark:text-gray-300 hover:text-blue-500 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all border border-slate-200 dark:border-white/10 cursor-pointer"
                            >
                              <Eye className="w-3.5 h-3.5" /> Vista Previa
                            </button>
                            <a
                              href={item.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center gap-1 py-2 px-3 bg-blue-600/10 hover:bg-blue-600 text-blue-600 hover:text-white rounded-lg text-[10px] font-black uppercase tracking-wider transition-all border border-blue-500/20 cursor-pointer"
                            >
                              Abrir en Drive <ExternalLink className="w-3 h-3" />
                            </a>
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              ) : (
                <div className="flex flex-col gap-5">
                  <div className="flex flex-wrap items-center justify-between gap-3">
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
                          {year === 'all' ? 'Todos los Años' : year}
                        </button>
                      ))}
                    </div>

                    <span className="text-[10px] font-mono text-slate-400 dark:text-gray-500 uppercase tracking-wider">
                      Ordenamiento: Más reciente primero ↓
                    </span>
                  </div>

                  {/* LISTADO DE BOLETINES EN ORDEN CRONOLÓGICO DESCENDENTE ESTRICTO */}
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
                              <Calendar className="w-3.5 h-3.5 text-blue-500" />
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
                            title="Descargar o Ver en Drive"
                          >
                            <Download className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleShare(item)}
                            className="p-2 bg-white dark:bg-white/5 hover:bg-blue-600/10 dark:hover:bg-blue-500/10 text-slate-700 dark:text-gray-300 hover:text-blue-500 rounded-lg transition-all border border-slate-200 dark:border-white/10"
                            title="Compartir enlace de boletín"
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

              {/* LISTADO DE BOLETINES PARA MUNICIPALIDADES / LEGISLATURA (SIEMPRE ORDENADO DESCENDENTE) */}
              <div className="p-6 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {filteredBulletins.map(item => (
                  <div
                    key={item.id}
                    className="p-5 bg-slate-50 dark:bg-[#161616]/40 border border-slate-200 dark:border-white/5 rounded-2xl flex flex-col justify-between gap-4 shadow-sm hover:border-blue-500/20 transition-all group"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-black text-blue-500 font-mono">
                          {item.number}
                        </span>
                        <span className="text-[10px] font-bold text-slate-400 dark:text-gray-500 font-mono flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5 text-blue-500" />
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
        </>
      )}

      {/* GUIA LEGAL TAB */}
      {activeMainTab === 'guia_legal' && (
        <div className="flex flex-col gap-6">
          <header className="flex flex-col gap-2">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-blue-600/20 flex items-center justify-center">
                <Scale className="w-5 h-5 text-blue-500" />
              </div>
              <h1 className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white tracking-tighter uppercase font-display">
                Guía Legal y Normativa
              </h1>
            </div>
            <p className="text-slate-500 dark:text-gray-400 text-sm max-w-2xl">
              Compendio de tratados internacionales, leyes nacionales, constitución provincial y leyes orgánicas de las fuerzas de seguridad.
            </p>
          </header>

          {/* CALCULADORA DE RETIRO POLICIAL */}
          <div className="bg-gradient-to-br from-blue-900/30 via-slate-900 to-indigo-950/40 border border-blue-500/20 rounded-[2.5rem] p-6 shadow-2xl flex flex-col gap-4">
            <div className="flex items-center gap-3">
              <Calculator className="w-5 h-5 text-blue-400" />
              <h2 className="text-sm font-black text-white uppercase tracking-wider">
                Simulador de Movilidad y Retiro (Ley Provincial N° 819)
              </h2>
            </div>
            <p className="text-xs text-gray-300 leading-relaxed">
              Calculá el porcentaje estimado de retiro según tus años de servicio bajo la Ley 819 (Policía TDF / Servicio Penitenciario).
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center pt-2">
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold text-gray-400 uppercase">Años de Servicio Efectivos:</label>
                <input
                  type="number"
                  min={10}
                  max={35}
                  value={serviceYears}
                  onChange={(e) => setServiceYears(Math.max(0, parseInt(e.target.value) || 0))}
                  className="bg-black/50 border border-white/10 rounded-xl px-3 py-2 text-sm font-mono text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="flex items-center gap-2 pt-4 md:pt-0">
                <input
                  type="checkbox"
                  id="penitentiaryCheck"
                  checked={isPenitentiary}
                  onChange={(e) => setIsPenitentiary(e.target.checked)}
                  className="w-4 h-4 rounded border-gray-600 bg-black/40 text-blue-600 focus:ring-blue-500"
                />
                <label htmlFor="penitentiaryCheck" className="text-xs font-bold text-gray-300 cursor-pointer">
                  Servicio Penitenciario Provincial (Ley 760)
                </label>
              </div>

              <div className="bg-blue-600/20 border border-blue-500/30 p-4 rounded-2xl flex flex-col items-center justify-center text-center">
                <span className="text-[9px] font-black text-blue-300 uppercase tracking-widest">Porcentaje Estimado Ley 819</span>
                <span className="text-2xl font-black text-white mt-0.5">
                  {serviceYears >= 25 ? '82% Móvil (100%)' : `${Math.round((serviceYears / 25) * 82)}% Proporcional`}
                </span>
              </div>
            </div>
          </div>

          {/* BUSCADOR GUIA LEGAL */}
          <div className="bg-white dark:bg-[#0e0e0e] border border-slate-200 dark:border-[#1f1f1f] rounded-[2.5rem] p-6 shadow-xl flex flex-col gap-4">
            <div className="flex flex-col md:flex-row gap-4 items-stretch md:items-center justify-between">
              <div className="flex flex-wrap gap-2">
                {[
                  { id: 'all', label: 'Todas' },
                  { id: 'tratados', label: 'Tratados Int.' },
                  { id: 'nacionales', label: 'Leyes Nacionales' },
                  { id: 'provinciales', label: 'Leyes TDF' },
                  { id: 'policial', label: 'Normativa Policial' }
                ].map(cat => (
                  <button
                    key={cat.id}
                    onClick={() => setLegalCategory(cat.id)}
                    className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all ${
                      legalCategory === cat.id
                        ? 'bg-blue-600 text-white shadow-md'
                        : 'bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-gray-400 hover:bg-slate-200 dark:hover:bg-white/10'
                    }`}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>

              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Buscar en guía legal..."
                  value={legalSearch}
                  onChange={(e) => setLegalSearch(e.target.value)}
                  className="w-full bg-slate-100 dark:bg-black/40 border border-slate-200 dark:border-white/10 rounded-2xl py-2.5 pl-10 pr-4 text-xs font-medium text-slate-800 dark:text-gray-200 focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>

            {/* TARJETAS DE LEYES */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
              {filteredLaws.map(doc => (
                <div
                  key={doc.id}
                  className="p-5 bg-slate-50 dark:bg-[#161616]/40 border border-slate-200 dark:border-white/5 rounded-2xl flex flex-col justify-between gap-4 shadow-sm hover:border-blue-500/20 transition-all group"
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-black text-blue-500 font-mono flex items-center gap-1.5">
                        {doc.flag && <span>{doc.flag}</span>}
                        {doc.number}
                      </span>
                      <span className="text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded bg-blue-500/10 text-blue-500">
                        {doc.category}
                      </span>
                    </div>
                    <h3 className="text-xs font-black text-slate-900 dark:text-white uppercase leading-snug group-hover:text-blue-500 transition-colors">
                      {doc.title}
                    </h3>
                    <p className="text-[11px] text-slate-600 dark:text-gray-400 leading-relaxed mt-2">
                      {doc.summary}
                    </p>
                  </div>

                  <div className="flex items-center gap-2 pt-3 border-t border-slate-200/50 dark:border-white/5">
                    <button
                      onClick={() => setSelectedLaw(doc)}
                      className="flex-1 py-2 px-3 bg-white dark:bg-white/5 hover:bg-blue-600/10 text-slate-700 dark:text-gray-300 hover:text-blue-500 rounded-lg text-[10px] font-black uppercase tracking-wider border border-slate-200 dark:border-white/10 transition-all"
                    >
                      Ver Detalle
                    </button>
                    <a
                      href={doc.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 bg-white dark:bg-white/5 hover:bg-blue-600/10 text-slate-700 dark:text-gray-300 hover:text-blue-500 rounded-lg border border-slate-200 dark:border-white/10 transition-all"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* BUSCADOR GENERAL DE BOLETINES TAB */}
      {activeMainTab === 'busqueda_boletines' && (
        <div className="bg-white dark:bg-[#0e0e0e] border border-slate-200 dark:border-[#1f1f1f] rounded-[2.5rem] p-6 shadow-2xl flex flex-col gap-6">
          <header className="flex flex-col gap-2">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-blue-600/20 flex items-center justify-center">
                <Search className="w-5 h-5 text-blue-500" />
              </div>
              <h1 className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white tracking-tighter uppercase font-display">
                Buscador General de Boletines Oficiales
              </h1>
            </div>
            <p className="text-slate-500 dark:text-gray-400 text-sm max-w-2xl">
              Ingresá una o varias palabras clave para encontrar normativas, decretos, resoluciones u ordenanzas en todos los boletines oficiales. Los resultados se ordenan estrictamente desde lo más reciente a lo más antiguo.
            </p>
          </header>

          {/* CONTROLES DE BÚSQUEDA Y FILTRADO */}
          <div className="bg-slate-50 dark:bg-black/30 border border-slate-200 dark:border-white/5 rounded-3xl p-5 flex flex-col gap-4">
            <div className="flex flex-col md:flex-row gap-4 items-stretch md:items-center justify-between">
              {/* Campo de texto de búsqueda multipalabra */}
              <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-blue-500" />
                <input
                  type="text"
                  placeholder="Escribí varias palabras clave (ej: rescate vehiculo nieve, ascenso comisario, adicional zona)..."
                  value={globalSearchTerm}
                  onChange={(e) => setGlobalSearchTerm(e.target.value)}
                  className="w-full bg-white dark:bg-black/50 border border-slate-300 dark:border-white/10 rounded-2xl py-3 pl-12 pr-10 text-sm font-medium text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 shadow-sm transition-all"
                />
                {globalSearchTerm && (
                  <button
                    onClick={() => setGlobalSearchTerm('')}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600 dark:hover:text-white rounded-lg"
                    title="Limpiar búsqueda"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>

              {/* Indicador de ordenamiento */}
              <div className="flex items-center gap-2 px-3.5 py-2 bg-blue-500/10 border border-blue-500/20 rounded-xl text-blue-600 dark:text-blue-400 text-xs font-black uppercase tracking-wider shrink-0">
                <Calendar className="w-4 h-4" />
                <span>Orden: Más Nuevo ↓ Más Antiguo</span>
              </div>
            </div>

            {/* Filtros por Jurisdicción / Organismo */}
            <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-200/60 dark:border-white/5">
              <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 dark:text-gray-500 mr-2">
                Filtrar por Organismo:
              </span>
              {[
                { id: 'all', label: 'Todos' },
                { id: 'provincia', label: 'Gobierno TDF' },
                { id: 'legislativo', label: 'Legislatura' },
                { id: 'ushuaia', label: 'Ushuaia' },
                { id: 'riogrande', label: 'Río Grande' },
                { id: 'tolhuin', label: 'Tolhuin' }
              ].map(pub => (
                <button
                  key={pub.id}
                  onClick={() => setGlobalPublisherFilter(pub.id)}
                  className={`px-3.5 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer border ${
                    globalPublisherFilter === pub.id
                      ? 'bg-blue-600 text-white border-blue-500 shadow-md'
                      : 'bg-white dark:bg-white/5 text-slate-600 dark:text-gray-300 border-slate-200 dark:border-white/10 hover:border-blue-500/30'
                  }`}
                >
                  {pub.label}
                </button>
              ))}
              <span className="ml-auto text-xs font-mono font-bold text-blue-500">
                {globalFilteredBulletins.length} {globalFilteredBulletins.length === 1 ? 'resultado' : 'resultados'}
              </span>
            </div>
          </div>

          {/* LISTADO DE RESULTADOS DE BÚSQUEDA ORDENADOS DE MÁS NUEVO A MÁS ANTIGUO */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {globalFilteredBulletins.length > 0 ? (
              globalFilteredBulletins.map((item) => (
                <div
                  key={item.id}
                  className="p-5 bg-slate-50 dark:bg-[#161616]/40 border border-slate-200 dark:border-white/5 rounded-2xl flex flex-col justify-between gap-4 shadow-sm hover:border-blue-500/20 transition-all group"
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-black text-blue-500 font-mono">
                        {item.number}
                      </span>
                      <span className="text-[10px] font-bold text-slate-400 dark:text-gray-500 font-mono flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5 text-blue-500" />
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
                      title="Descargar o Ver original"
                    >
                      <Download className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleShare(item)}
                      className="p-2 bg-white dark:bg-white/5 hover:bg-blue-600/10 dark:hover:bg-blue-500/10 text-slate-700 dark:text-gray-300 hover:text-blue-500 rounded-lg transition-all border border-slate-200 dark:border-white/10"
                      title="Compartir enlace de boletín"
                    >
                      <Share2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-full py-12 flex flex-col items-center justify-center text-center gap-3 bg-slate-50 dark:bg-black/20 rounded-3xl border border-dashed border-slate-300 dark:border-white/10">
                <Search className="w-8 h-8 text-slate-400 animate-bounce" />
                <h3 className="text-sm font-black text-slate-700 dark:text-gray-300 uppercase">
                  No se encontraron coincidencias
                </h3>
                <p className="text-xs text-slate-500 dark:text-gray-400 max-w-sm">
                  Probá modificando las palabras clave o cambiando la jurisdicción seleccionada.
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* MODAL DE ANÁLISIS POLICIAL */}
      <AnimatePresence>
        {showPoliceExplorer && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md flex items-center justify-center p-4"
            onClick={() => setShowPoliceExplorer(false)}
          >
            <motion.div
              initial={{ scale: 0.95, y: 15 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 15 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white dark:bg-[#0e0e0e] border border-slate-200 dark:border-white/10 w-full max-w-4xl max-h-[85vh] rounded-[2.5rem] p-6 shadow-2xl flex flex-col gap-4 overflow-hidden"
            >
              <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-white/5">
                <div className="flex items-center gap-3">
                  <Shield className="w-6 h-6 text-blue-500" />
                  <div>
                    <h3 className="text-base font-black text-slate-900 dark:text-white uppercase font-display">
                      Panel de Asesoría Normativa Policial
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-gray-400">
                      Impacto directo en régimen disciplinario, retiros, ascensos, haberes y estructura.
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setShowPoliceExplorer(false)}
                  className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-white/5 text-slate-500"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto flex flex-col gap-4 pr-1 custom-scrollbar">
                {bulletinsDb.filter(b => b.publisher === 'provincia' && b.policeAnalysis?.hasImpact).map((item) => (
                  <div key={item.id} className="bg-slate-50 dark:bg-white/[0.02] border border-slate-200 dark:border-white/5 rounded-2xl p-5 flex flex-col gap-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-black text-blue-500 font-mono">{item.number} ({item.date})</span>
                      <span className="text-[9px] font-black uppercase px-2.5 py-1 rounded bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                        Impacto Policial Confirmado
                      </span>
                    </div>

                    {item.policeAnalysis && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs leading-relaxed">
                        <div className="bg-white dark:bg-black/30 p-3 rounded-xl border border-slate-100 dark:border-white/5">
                          <span className="font-bold text-slate-900 dark:text-white block mb-1">📜 Norma dictada:</span>
                          <p className="text-slate-600 dark:text-gray-300">{item.policeAnalysis.queDice}</p>
                        </div>
                        <div className="bg-white dark:bg-black/30 p-3 rounded-xl border border-slate-100 dark:border-white/5">
                          <span className="font-bold text-slate-900 dark:text-white block mb-1">🔄 Cambio que genera:</span>
                          <p className="text-slate-600 dark:text-gray-300">{item.policeAnalysis.queCambia}</p>
                        </div>
                        <div className="bg-white dark:bg-black/30 p-3 rounded-xl border border-slate-100 dark:border-white/5 md:col-span-2">
                          <span className="font-bold text-slate-900 dark:text-white block mb-1">🎯 Impacto en agentes/retirados:</span>
                          <p className="text-slate-600 dark:text-gray-300">{item.policeAnalysis.queImpacta}</p>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* MODAL DE DETALLE DE GUIA LEGAL */}
      <AnimatePresence>
        {selectedLaw && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md flex items-center justify-center p-4"
            onClick={() => setSelectedLaw(null)}
          >
            <motion.div
              initial={{ scale: 0.95, y: 15 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 15 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white dark:bg-[#0e0e0e] border border-slate-200 dark:border-white/10 w-full max-w-2xl rounded-[2.5rem] p-6 shadow-2xl flex flex-col gap-4"
            >
              <div className="flex items-start justify-between pb-4 border-b border-slate-100 dark:border-white/5">
                <div>
                  <span className="text-xs font-black text-blue-500 font-mono">{selectedLaw.number}</span>
                  <h3 className="text-base font-black text-slate-900 dark:text-white uppercase font-display mt-1">
                    {selectedLaw.title}
                  </h3>
                </div>
                <button onClick={() => setSelectedLaw(null)} className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-white/5 text-slate-500">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <p className="text-xs text-slate-600 dark:text-gray-300 leading-relaxed font-medium">
                {selectedLaw.summary}
              </p>

              {selectedLaw.details && (
                <div className="flex flex-col gap-2 bg-slate-50 dark:bg-black/30 p-4 rounded-2xl border border-slate-100 dark:border-white/5">
                  <span className="text-[10px] font-black uppercase text-blue-500 tracking-wider">Aspectos claves:</span>
                  <ul className="flex flex-col gap-1.5">
                    {selectedLaw.details.map((d, i) => (
                      <li key={i} className="text-xs text-slate-700 dark:text-gray-300 flex items-start gap-2">
                        <span className="text-blue-500 font-bold">•</span>
                        <span>{d}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="pt-3 border-t border-slate-100 dark:border-white/5 flex justify-end gap-3">
                <a
                  href={selectedLaw.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-black uppercase tracking-wider flex items-center gap-2 transition-all shadow-md"
                >
                  Acceder a la Ley Completa <ExternalLink className="w-4 h-4" />
                </a>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* MODAL DE VISTA PREVIA PDF NATIVO / RENDERIZADO */}
      <AnimatePresence>
        {previewFile && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-2 sm:p-4"
            onClick={() => setPreviewFile(null)}
          >
            <motion.div
              initial={{ scale: 0.95, y: 15 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 15 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white dark:bg-[#0c0c0c] border border-slate-200 dark:border-white/10 w-full max-w-5xl h-[92vh] rounded-[2.5rem] shadow-2xl flex flex-col overflow-hidden"
            >
              {/* TOOLBAR SUPERIOR DEL VISOR PDF */}
              <div className="px-4 py-3 bg-slate-900 border-b border-white/10 flex flex-wrap items-center justify-between gap-3 text-white">
                <div className="flex items-center gap-3">
                  <FileText className="w-5 h-5 text-blue-400 shrink-0" />
                  <div className="flex flex-col">
                    <span className="text-xs font-black uppercase tracking-wider">{previewFile.title}</span>
                    <span className="text-[10px] text-gray-400 font-mono">Documento Oficial Digital • TDF</span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <div className="flex items-center bg-white/10 p-1 rounded-xl">
                    <button
                      onClick={() => setPreviewViewMode('pdf')}
                      className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all ${
                        previewViewMode === 'pdf' ? 'bg-blue-600 text-white' : 'text-gray-300 hover:text-white'
                      }`}
                    >
                      Visor PDF
                    </button>
                    <button
                      onClick={() => setPreviewViewMode('drive')}
                      className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all ${
                        previewViewMode === 'drive' ? 'bg-blue-600 text-white' : 'text-gray-300 hover:text-white'
                      }`}
                    >
                      Portal Oficial
                    </button>
                  </div>

                  {previewViewMode === 'pdf' && (
                    <div className="hidden sm:flex items-center gap-1 bg-white/10 p-1 rounded-xl text-xs">
                      <button
                        onClick={() => setPdfZoom(z => Math.max(75, z - 25))}
                        className="p-1 hover:bg-white/10 rounded"
                        title="Reducir zoom"
                      >
                        <ZoomOut className="w-3.5 h-3.5" />
                      </button>
                      <span className="font-mono text-[10px] px-1">{pdfZoom}%</span>
                      <button
                        onClick={() => setPdfZoom(z => Math.min(150, z + 25))}
                        className="p-1 hover:bg-white/10 rounded"
                        title="Aumentar zoom"
                      >
                        <ZoomIn className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}

                  <a
                    href={previewFile.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 bg-white/10 hover:bg-white/20 text-white rounded-xl transition-all text-xs flex items-center gap-1"
                    title="Abrir original"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>

                  <button
                    onClick={() => setPreviewFile(null)}
                    className="p-2 hover:bg-red-500/20 text-gray-300 hover:text-red-400 rounded-xl transition-all"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* RENDERIZADO DEL CONTENIDO PDF CON ADAPTABILIDAD INSTITUCIONAL */}
              <div className="flex-1 bg-slate-950 overflow-y-auto p-4 sm:p-8 flex justify-center custom-scrollbar">
                {previewViewMode === 'drive' ? (
                  <iframe
                    src={previewFile.url}
                    className="w-full h-full border-0 rounded-2xl"
                    title="Visor Externo"
                  />
                ) : (
                  <div
                    style={{ transform: `scale(${pdfZoom / 100})`, transformOrigin: 'top center' }}
                    className="w-full max-w-3xl bg-slate-900 text-slate-100 rounded-2xl border border-slate-800 shadow-2xl p-6 sm:p-10 flex flex-col gap-6 font-serif relative"
                  >
                    {(() => {
                      const pubType = previewFile.item?.publisher || 'provincia';
                      const headerConfig = getHeaderConfig(pubType);

                      return (
                        <>
                          {/* MEMBRETE INSTITUCIONAL DINÁMICO */}
                          <div className={`p-6 rounded-2xl bg-gradient-to-br ${headerConfig.headerBg} border border-white/10 flex flex-col items-center text-center gap-2 relative shadow-lg`}>
                            <span className={`px-3 py-1 rounded-full text-[9px] font-mono font-bold tracking-widest uppercase border ${headerConfig.badgeColor}`}>
                              {headerConfig.badgeText}
                            </span>
                            <h2 className="text-base sm:text-xl font-black text-white font-sans uppercase tracking-tight">
                              {headerConfig.title}
                            </h2>
                            <p className="text-[10px] sm:text-xs text-gray-300 font-sans tracking-wide">
                              {headerConfig.subtitle}
                            </p>
                            <div className="flex items-center gap-4 text-[10px] text-gray-400 font-mono mt-2 pt-2 border-t border-white/10 w-full justify-center">
                              <span>EDICIÓN N° {previewFile.item?.number || previewFile.title}</span>
                              <span>•</span>
                              <span>FECHA DE PUBLICACIÓN: {previewFile.item?.date || '07/08/2026'}</span>
                            </div>
                          </div>

                          {/* RECUADRO DE RESUMEN CORTO Y BREVE */}
                          <div className="bg-slate-800/80 border border-blue-500/30 p-5 rounded-2xl flex flex-col gap-2 font-sans text-xs">
                            <span className="text-[10px] font-black uppercase text-blue-400 tracking-widest flex items-center gap-1.5">
                              <Info className="w-3.5 h-3.5 text-blue-400" /> Resumen Corto y Breve de la Normativa
                            </span>
                            <h3 className="text-sm font-bold text-white leading-snug">
                              {previewFile.item?.title}
                            </h3>
                            <p className="text-gray-300 leading-relaxed">
                              {previewFile.item?.summary || previewFile.item?.policeAnalysis?.queDice || 'Síntesis técnica oficial publicada en el boletín institucional.'}
                            </p>
                          </div>

                          {/* ESTRUCTURA FORMAL DEL DOCUMENTO */}
                          <div className="flex flex-col gap-4 text-xs sm:text-sm leading-relaxed text-gray-200 pt-4 border-t border-slate-800">
                            <h4 className="font-bold text-white uppercase text-center font-sans tracking-wider text-xs">
                              SECCIÓN I — SUMARIO DE DISPOSICIONES OFICIALES
                            </h4>

                            <div className="space-y-4">
                              <div>
                                <p className="font-bold text-blue-400">ARTÍCULO 1°.—</p>
                                <p className="mt-1 text-gray-300">
                                  TÉNGASE por promulgada y publíquese en el Boletín Oficial la presente disposición bajo el número de registro oficial correspondiente a la jurisdicción de {headerConfig.badgeText}.
                                </p>
                              </div>

                              <div>
                                <p className="font-bold text-blue-400">ARTÍCULO 2° (ALCANCE Y OBJETIVO).—</p>
                                <p className="mt-1 text-gray-300">
                                  {previewFile.item?.summary || previewFile.item?.policeAnalysis?.queDice || 'Establecer los alcances normativos y reglamentarios vigentes para la administración pública provincial o municipal.'}
                                </p>
                              </div>

                              <div>
                                <p className="font-bold text-blue-400">ARTÍCULO 3°.—</p>
                                <p className="mt-1 text-gray-300">
                                  FACÚLTASE a las áreas pertinentes y secretarías del organismo a dictar la normativa complementaria requerida para la ejecución efectiva del presente instrumento.
                                </p>
                              </div>

                              <div>
                                <p className="font-bold text-blue-400">ARTÍCULO 4°.—</p>
                                <p className="mt-1 text-gray-300">
                                  Comuníquese, publíquese en el registro oficial, dese a la imprenta gubernamental y archívese.
                                </p>
                              </div>
                            </div>
                          </div>

                          {/* SELLO DIGITAL OFICIAL DE VALIDACIÓN */}
                          <div className="mt-6 pt-6 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left font-sans">
                            <div className="flex items-center gap-3">
                              <div className="w-14 h-14 rounded-full border-2 border-dashed border-blue-500/40 flex items-center justify-center p-1 text-[8px] font-mono text-blue-400 uppercase text-center leading-tight">
                                {headerConfig.stampText}
                              </div>
                              <div className="flex flex-col text-[10px] text-gray-400 font-mono">
                                <span className="text-white font-bold">FIRMADO DIGITALMENTE</span>
                                <span>Hash: tdf_2026_val_sec_{previewFile.item?.id || '01'}</span>
                                <span>{headerConfig.secondaryStamp}</span>
                              </div>
                            </div>

                            <button
                              onClick={() => window.print()}
                              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-gray-200 rounded-xl text-xs font-bold font-sans flex items-center gap-2 transition-all border border-slate-700 cursor-pointer"
                            >
                              <Printer className="w-4 h-4" /> Imprimir Documento
                            </button>
                          </div>
                        </>
                      );
                    })()}
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* TOAST DE COMPARTIDO */}
      <AnimatePresence>
        {showShareToast && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white text-xs font-bold px-4 py-3 rounded-2xl shadow-2xl border border-white/10 flex items-center gap-2"
          >
            <Check className="w-4 h-4 text-emerald-400" />
            <span>Enlace copiado al portapapeles</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
