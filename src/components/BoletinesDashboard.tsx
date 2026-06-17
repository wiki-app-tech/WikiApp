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
  Globe
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface BulletinItem {
  id: string;
  type: 'decreto' | 'ley' | 'ordenanza' | 'resolucion' | 'general';
  number: string;
  date: string;
  year: string;
  title: string;
  publisher: 'provincia' | 'legislativo' | 'ushuaia' | 'riogrande' | 'tolhuin';
  url: string;
  driveFileId?: string; // Optional specific Google Drive File ID
}

export default function BoletinesDashboard() {
  const [activePublisher, setActivePublisher] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');
  
  // TDF Specific state
  const [tdfExplorerMode, setTdfExplorerMode] = useState<'native' | 'drive'>('native');
  const [selectedYear, setSelectedYear] = useState<string>('all');
  
  // Modal states
  const [previewFile, setPreviewFile] = useState<{ title: string; url: string; driveFileId?: string } | null>(null);
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
      url: 'https://tolhuin.gob.ar/',
      system: 'Boletines Oficiales y Resoluciones del Municipio de Tolhuin',
      icon: MapPin,
      color: 'from-rose-500 to-red-600',
      badgeColor: 'bg-rose-500/10 text-rose-500 dark:text-rose-400'
    }
  ];

  const bulletinsDb: BulletinItem[] = [
    // Provincia - 2026
    {
      id: 'prov-2026-1',
      type: 'decreto',
      number: 'Boletín N° 3610',
      date: '2026-06-12',
      year: '2026',
      title: 'Boletín Oficial de la Provincia de Tierra del Fuego N° 3610 - Sección Decretos, Resoluciones Ministeriales y Convocatorias.',
      publisher: 'provincia',
      url: tdfDriveFolderUrl,
      driveFileId: '12GrKybtm4cWyS6Ib_DnbwKAQ6JvQHCU6'
    },
    {
      id: 'prov-2026-2',
      type: 'resolucion',
      number: 'Boletín N° 3609',
      date: '2026-06-05',
      year: '2026',
      title: 'Boletín Oficial de la Provincia de Tierra del Fuego N° 3609 - Adjudicaciones, Licitaciones y Leyes Provinciales promulgadas.',
      publisher: 'provincia',
      url: tdfDriveFolderUrl,
      driveFileId: '12GrKybtm4cWyS6Ib_DnbwKAQ6JvQHCU6'
    },
    {
      id: 'prov-2026-3',
      type: 'decreto',
      number: 'Boletín N° 3608',
      date: '2026-05-29',
      year: '2026',
      title: 'Boletín Oficial de la Provincia de Tierra del Fuego N° 3608 - Decretos del Poder Ejecutivo e informes institucionales.',
      publisher: 'provincia',
      url: tdfDriveFolderUrl,
      driveFileId: '12GrKybtm4cWyS6Ib_DnbwKAQ6JvQHCU6'
    },
    // Provincia - 2025
    {
      id: 'prov-2025-1',
      type: 'decreto',
      number: 'Boletín N° 3550',
      date: '2025-12-19',
      year: '2025',
      title: 'Boletín Oficial de la Provincia de Tierra del Fuego N° 3550 - Edición Especial de Cierre de Ejercicio y Normativas Generales.',
      publisher: 'provincia',
      url: tdfDriveFolderUrl,
      driveFileId: '12GrKybtm4cWyS6Ib_DnbwKAQ6JvQHCU6'
    },
    {
      id: 'prov-2025-2',
      type: 'resolucion',
      number: 'Boletín N° 3549',
      date: '2025-12-12',
      year: '2025',
      title: 'Boletín Oficial de la Provincia de Tierra del Fuego N° 3549 - Resoluciones de la Agencia de Recaudación Fueguina (AREF).',
      publisher: 'provincia',
      url: tdfDriveFolderUrl,
      driveFileId: '12GrKybtm4cWyS6Ib_DnbwKAQ6JvQHCU6'
    },
    // Provincia - 2024
    {
      id: 'prov-2024-1',
      type: 'decreto',
      number: 'Boletín N° 3480',
      date: '2024-12-20',
      year: '2024',
      title: 'Boletín Oficial de la Provincia de Tierra del Fuego N° 3480 - Presupuesto General y Anexos Impositivos.',
      publisher: 'provincia',
      url: tdfDriveFolderUrl,
      driveFileId: '12GrKybtm4cWyS6Ib_DnbwKAQ6JvQHCU6'
    },
    {
      id: 'prov-2024-2',
      type: 'resolucion',
      number: 'Boletín N° 3479',
      date: '2024-12-13',
      year: '2024',
      title: 'Boletín Oficial de la Provincia de Tierra del Fuego N° 3479 - Resoluciones y Acuerdos Interprovinciales.',
      publisher: 'provincia',
      url: tdfDriveFolderUrl,
      driveFileId: '12GrKybtm4cWyS6Ib_DnbwKAQ6JvQHCU6'
    },
    // Provincia - 2023
    {
      id: 'prov-2023-1',
      type: 'decreto',
      number: 'Boletín N° 3370',
      date: '2023-12-22',
      year: '2023',
      title: 'Boletín Oficial de la Provincia de Tierra del Fuego N° 3370 - Decretos Reglamentarios de Estructura de Ministerios.',
      publisher: 'provincia',
      url: tdfDriveFolderUrl,
      driveFileId: '12GrKybtm4cWyS6Ib_DnbwKAQ6JvQHCU6'
    },
    {
      id: 'prov-2023-2',
      type: 'resolucion',
      number: 'Boletín N° 3369',
      date: '2023-12-15',
      year: '2023',
      title: 'Boletín Oficial de la Provincia de Tierra del Fuego N° 3369 - Resoluciones del Ministerio de Salud y Bienestar Social.',
      publisher: 'provincia',
      url: tdfDriveFolderUrl,
      driveFileId: '12GrKybtm4cWyS6Ib_DnbwKAQ6JvQHCU6'
    },
    // Provincia - 2022
    {
      id: 'prov-2022-1',
      type: 'decreto',
      number: 'Boletín N° 3260',
      date: '2022-12-16',
      year: '2022',
      title: 'Boletín Oficial de la Provincia de Tierra del Fuego N° 3260 - Normativa de fomento a la producción local.',
      publisher: 'provincia',
      url: tdfDriveFolderUrl,
      driveFileId: '12GrKybtm4cWyS6Ib_DnbwKAQ6JvQHCU6'
    },
    // Legislativo
    {
      id: 'leg-1',
      type: 'ley',
      number: 'Ley Provincial 1582',
      date: '2026-06-05',
      year: '2026',
      title: 'Declaración de Interés Provincial del plan integral de conservación del ecosistema de turberas.',
      publisher: 'legislativo',
      url: 'https://www.legistdf.gob.ar/'
    },
    {
      id: 'leg-2',
      type: 'ley',
      number: 'Ley Provincial 1581',
      date: '2026-05-28',
      year: '2026',
      title: 'Ley de fomento, radicación y desarrollo de las Energías Renovables en el ámbito provincial.',
      publisher: 'legislativo',
      url: 'https://www.legistdf.gob.ar/'
    },
    // Ushuaia
    {
      id: 'ush-1',
      type: 'ordenanza',
      number: 'Ordenanza Municipal 6230',
      date: '2026-06-09',
      year: '2026',
      title: 'Establecimiento del Plan Estratégico de Ordenamiento Territorial y Nuevos Códigos de Edificación.',
      publisher: 'ushuaia',
      url: 'https://www.ushuaia.gob.ar/'
    },
    {
      id: 'ush-2',
      type: 'decreto',
      number: 'Decreto Municipal 345/2026',
      date: '2026-06-03',
      year: '2026',
      title: 'Reglamentación del cuadro tarifario general para el servicio de transporte público urbano de pasajeros.',
      publisher: 'ushuaia',
      url: 'https://www.ushuaia.gob.ar/'
    },
    // Rio Grande
    {
      id: 'rg-1',
      type: 'decreto',
      number: 'Decreto Municipal 870/2026',
      date: '2026-06-11',
      year: '2026',
      title: 'Puesta en marcha del Plan Estratégico de Obras Hidráulicas contra inundaciones estacionales.',
      publisher: 'riogrande',
      url: 'https://www.riogrande.gob.ar/'
    },
    {
      id: 'rg-2',
      type: 'ordenanza',
      number: 'Ordenanza Municipal 5820',
      date: '2026-06-04',
      year: '2026',
      title: 'Aprobación del programa de incentivos fiscales y exenciones tributarias para PyMEs del Parque Industrial.',
      publisher: 'riogrande',
      url: 'https://www.riogrande.gob.ar/'
    },
    // Tolhuin
    {
      id: 'tol-1',
      type: 'ordenanza',
      number: 'Ordenanza Municipal 1240',
      date: '2026-06-12',
      year: '2026',
      title: 'Creación del Registro Único de Emprendedores y Artesanos Locales con acceso a créditos blandos municipales.',
      publisher: 'tolhuin',
      url: 'https://tolhuin.gob.ar/'
    }
  ];

  const filteredBulletins = useMemo(() => {
    return bulletinsDb.filter(item => {
      const matchesPublisher = activePublisher === 'all' || item.publisher === activePublisher;
      const matchesYear = activePublisher !== 'provincia' || selectedYear === 'all' || item.year === selectedYear;
      const matchesSearch = item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            item.number.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            item.date.includes(searchTerm);
      return matchesPublisher && matchesYear && matchesSearch;
    });
  }, [activePublisher, selectedYear, searchTerm]);

  const handleShare = (item: { number: string; url: string; driveFileId?: string }) => {
    const text = `Te comparto el ${item.number} del Gobierno de Tierra del Fuego. Consúltalo aquí: ${item.url}`;
    
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

  // Google Drive folder embed URL
  const driveEmbedUrl = `https://drive.google.com/embeddedfolderview?id=12GrKybtm4cWyS6Ib_DnbwKAQ6JvQHCU6#grid`;

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col gap-6 md:gap-8 pb-20 max-w-[100vw] overflow-x-hidden"
    >
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

            {/* Mode selector: Native Explorer vs. Live Google Drive */}
            <div className="flex items-center bg-slate-100 dark:bg-white/5 p-1 rounded-xl border border-slate-200 dark:border-white/5 self-start md:self-center">
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
                Carpeta en la Nube (Drive)
              </button>
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

              {/* Embedding Google Drive Folder */}
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
            // Native Explorer
            <div className="flex flex-col gap-5">
              {/* Year Selectors */}
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
                    {year === 'all' ? 'Todos los años' : `${year}`}
                  </button>
                ))}
              </div>

              {/* Bulletins grid */}
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
                    </div>

                    <div className="flex items-center gap-2 pt-3 border-t border-slate-200/50 dark:border-white/5">
                      {/* Preview Button */}
                      <button
                        onClick={() => setPreviewFile({ title: item.number, url: item.url, driveFileId: item.driveFileId })}
                        className="flex-1 flex items-center justify-center gap-1 py-2 px-3 bg-white dark:bg-white/5 hover:bg-blue-600/10 dark:hover:bg-blue-500/10 text-slate-700 dark:text-gray-300 hover:text-blue-500 dark:hover:text-blue-400 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all border border-slate-200 dark:border-white/10"
                      >
                        <Eye className="w-3.5 h-3.5" /> Vista Previa
                      </button>

                      {/* Download button */}
                      <button
                        onClick={() => window.open(item.url, '_blank')}
                        className="p-2 bg-white dark:bg-white/5 hover:bg-blue-600/10 dark:hover:bg-blue-500/10 text-slate-700 dark:text-gray-300 hover:text-blue-500 rounded-lg transition-all border border-slate-200 dark:border-white/10"
                        title="Descargar PDF"
                      >
                        <Download className="w-3.5 h-3.5" />
                      </button>

                      {/* Share Button */}
                      <button
                        onClick={() => handleShare(item)}
                        className="p-2 bg-white dark:bg-white/5 hover:bg-blue-600/10 dark:hover:bg-blue-500/10 text-slate-700 dark:text-gray-300 hover:text-blue-500 rounded-lg transition-all border border-slate-200 dark:border-white/10"
                        title="Compartir enlace"
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

      {/* CONSOLE & SEARCH OF ALL BULLETINS (WHEN NOT TDF SPECIFIC EXCLUSIVELY) */}
      {activePublisher !== 'provincia' && (
        <div className="bg-white dark:bg-[#0e0e0e] border border-slate-200 dark:border-[#1f1f1f] rounded-[2.5rem] overflow-hidden shadow-2xl flex flex-col">
          {/* Sub Header / Control panel */}
          <div className="p-6 border-b border-slate-200 dark:border-[#1f1f1f] bg-slate-50/50 dark:bg-[#0a0a0a]/50 flex flex-col gap-4">
            <div className="flex items-center gap-3">
              <Sparkles className="w-4 h-4 text-blue-500 animate-pulse" />
              <h2 className="text-[12px] font-black text-slate-700 dark:text-gray-300 tracking-widest uppercase">
                Buscador Digital de Normativa Municipal y Legislativa
              </h2>
            </div>

            <div className="flex flex-col xl:flex-row gap-4 items-stretch xl:items-center">
              {/* Publisher switches */}
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setActivePublisher('all')}
                  className={`px-4 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all ${
                    activePublisher === 'all' 
                      ? 'bg-blue-600 text-white shadow-md' 
                      : 'bg-slate-100/80 dark:bg-white/5 text-slate-650 dark:text-gray-400 hover:bg-slate-200/50 dark:hover:bg-white/10'
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
                        : 'bg-slate-100/80 dark:bg-white/5 text-slate-655 dark:text-gray-400 hover:bg-slate-200/50 dark:hover:bg-white/10'
                    }`}
                  >
                    {pub.short}
                  </button>
                ))}
              </div>

              {/* Keyword Search Input */}
              <div className="relative flex-1 group">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
                <input
                  type="text"
                  placeholder="Buscar por palabra clave, número de decreto o ley..."
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  className="w-full bg-slate-100/50 dark:bg-black/40 border border-slate-200 dark:border-white/10 rounded-2xl py-3 pl-11 pr-4 text-[13px] font-medium text-slate-800 dark:text-gray-200 placeholder:text-slate-500 focus:outline-none focus:border-blue-500/50 focus:ring-4 focus:ring-blue-500/10 transition-all shadow-sm"
                />
              </div>
            </div>
          </div>

          {/* Results List */}
          <div className="p-6 min-h-[300px] flex flex-col gap-4">
            <div className="flex items-center justify-between text-xs text-slate-400 dark:text-gray-500 mb-2 font-mono">
              <span>Resultados de consulta</span>
              <span>{filteredBulletins.length} normativas encontradas</span>
            </div>

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
                              {new Date(item.date).toLocaleDateString('es-AR', {
                                day: 'numeric',
                                month: 'short',
                                year: 'numeric'
                              })}
                            </span>
                          </div>
                          <p className="text-sm font-semibold text-slate-700 dark:text-gray-300 leading-snug group-hover:text-blue-500 transition-colors">
                            {item.title}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0 self-end md:self-center">
                        <button
                          onClick={() => setPreviewFile({ title: item.number, url: item.url, driveFileId: item.driveFileId })}
                          className="flex items-center gap-1.5 py-2.5 px-4 bg-white dark:bg-white/5 hover:bg-blue-600/10 dark:hover:bg-blue-500/10 text-slate-700 dark:text-gray-300 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all border border-slate-200 dark:border-white/10 shadow-sm"
                        >
                          Vista Previa <Eye className="w-3 h-3" />
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
                  <FileText className="w-12 h-12 mb-4 animate-pulse opacity-40" />
                  <p className="text-sm font-bold uppercase tracking-wider text-center">No se encontraron boletines oficiales</p>
                  <p className="text-xs mt-1 text-center">Intenta buscar con otra palabra clave o cambia de filtro.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* PDF PREVIEW MODAL */}
      <AnimatePresence>
        {previewFile && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 dark:bg-black/80 backdrop-blur-md">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white dark:bg-[#0c0c0c] border border-slate-200 dark:border-white/10 rounded-[2.5rem] shadow-2xl w-full max-w-5xl overflow-hidden flex flex-col h-[85vh]"
            >
              {/* Modal Header */}
              <div className="p-4 md:p-6 border-b border-slate-100 dark:border-white/5 flex items-center justify-between bg-slate-50/50 dark:bg-[#070707]/30">
                <div className="flex items-center gap-3">
                  <Building className="w-5 h-5 text-blue-500" />
                  <h3 className="text-sm md:text-base font-black text-slate-900 dark:text-white uppercase tracking-wide">
                    Previsualizar: {previewFile.title}
                  </h3>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => copyToClipboard(previewFile.url)}
                    className="p-2 bg-slate-100 dark:bg-white/5 hover:bg-blue-600/10 text-slate-600 dark:text-gray-400 hover:text-blue-500 rounded-xl transition-all border border-slate-200 dark:border-white/5 cursor-pointer"
                    title="Copiar Enlace"
                  >
                    <Copy className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleShare({ number: previewFile.title, url: previewFile.url, driveFileId: previewFile.driveFileId })}
                    className="p-2 bg-slate-100 dark:bg-white/5 hover:bg-blue-600/10 text-slate-600 dark:text-gray-400 hover:text-blue-500 rounded-xl transition-all border border-slate-200 dark:border-white/5 cursor-pointer"
                    title="Compartir"
                  >
                    <Share2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => window.open(previewFile.url, '_blank')}
                    className="p-2 bg-slate-100 dark:bg-white/5 hover:bg-blue-600/10 text-slate-600 dark:text-gray-400 hover:text-blue-500 rounded-xl transition-all border border-slate-200 dark:border-white/5 cursor-pointer"
                    title="Descargar / Abrir en Drive"
                  >
                    <Download className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setPreviewFile(null)}
                    className="p-2 bg-slate-100 hover:bg-red-500/10 dark:bg-white/5 text-slate-500 hover:text-red-500 rounded-xl transition-all border border-slate-200 dark:border-white/5 cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Modal Body (Iframe) */}
              <div className="flex-1 bg-slate-100 dark:bg-[#070707] relative p-2">
                <iframe
                  src={
                    previewFile.url.includes('drive.google.com') 
                      ? `https://drive.google.com/file/d/12GrKybtm4cWyS6Ib_DnbwKAQ6JvQHCU6/preview`
                      : `https://docs.google.com/viewer?url=${encodeURIComponent(previewFile.url)}&embedded=true`
                  }
                  className="w-full h-full border-0 rounded-2xl bg-white dark:bg-[#0e0e0e] shadow-sm"
                  title="PDF Document Viewer"
                  allow="autoplay"
                />
              </div>

              {/* Modal Footer */}
              <div className="p-4 border-t border-slate-100 dark:border-white/5 bg-slate-50/50 dark:bg-[#070707]/30 flex flex-col md:flex-row items-center justify-between gap-3 text-[11px] text-slate-400 dark:text-gray-500">
                <div className="flex items-center gap-1">
                  <Info className="w-3.5 h-3.5 text-blue-500" />
                  <span>El boletín se despliega a través de la API oficial de vista previa de documentos.</span>
                </div>
                <button
                  onClick={() => window.open(tdfDriveFolderUrl, '_blank')}
                  className="text-blue-500 hover:underline font-bold flex items-center gap-1"
                >
                  Ver todos los boletines de Tierra del Fuego en Google Drive <ExternalLink className="w-3 h-3" />
                </button>
              </div>
            </motion.div>
          </div>
        )}
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
