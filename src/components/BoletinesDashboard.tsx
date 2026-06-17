'use client';

import React, { useState, useMemo } from 'react';
import { 
  Building, 
  Landmark, 
  Search, 
  FileText, 
  ExternalLink, 
  Download, 
  Calendar, 
  ChevronRight, 
  MapPin, 
  Info,
  Scale,
  Sparkles,
  BookOpen
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface BulletinItem {
  id: string;
  type: 'decreto' | 'ley' | 'ordenanza' | 'resolucion' | 'general';
  number: string;
  date: string;
  title: string;
  publisher: 'provincia' | 'legislativo' | 'ushuaia' | 'riogrande' | 'tolhuin';
  url: string;
}

export default function BoletinesDashboard() {
  const [activePublisher, setActivePublisher] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');

  const publishersInfo = [
    { 
      id: 'provincia', 
      name: 'Gobierno de Tierra del Fuego', 
      short: 'Provincial',
      logoText: 'GP',
      desc: 'Boletín Oficial de la Provincia de Tierra del Fuego, Antártida e Islas del Atlántico Sur.',
      url: 'https://boletinoficial.tierradelfuego.gob.ar/',
      system: 'DeCoLey (Sistema de Consulta Online de Normativa)',
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
    // Provincia
    {
      id: 'prov-1',
      type: 'decreto',
      number: 'Decreto 1254/2026',
      date: '2026-06-10',
      title: 'Aprobación de la reglamentación de la Ley Provincial de Promoción de la Economía del Conocimiento.',
      publisher: 'provincia',
      url: 'https://boletinoficial.tierradelfuego.gob.ar/'
    },
    {
      id: 'prov-2',
      type: 'resolucion',
      number: 'Resolución M.E. y F. 482/2026',
      date: '2026-06-08',
      title: 'Modificación de la reglamentación impositiva provincial y regímenes especiales para PyMEs.',
      publisher: 'provincia',
      url: 'https://boletinoficial.tierradelfuego.gob.ar/'
    },
    {
      id: 'prov-3',
      type: 'decreto',
      number: 'Decreto 1220/2026',
      date: '2026-06-01',
      title: 'Llamado a licitación pública nacional para la pavimentación de la Ruta Provincial 30.',
      publisher: 'provincia',
      url: 'https://boletinoficial.tierradelfuego.gob.ar/'
    },
    // Legislativo
    {
      id: 'leg-1',
      type: 'ley',
      number: 'Ley Provincial 1582',
      date: '2026-06-05',
      title: 'Declaración de Interés Provincial del plan integral de conservación del ecosistema de turberas.',
      publisher: 'legislativo',
      url: 'https://www.legistdf.gob.ar/'
    },
    {
      id: 'leg-2',
      type: 'ley',
      number: 'Ley Provincial 1581',
      date: '2026-05-28',
      title: 'Ley de fomento, radicación y desarrollo de las Energías Renovables en el ámbito provincial.',
      publisher: 'legislativo',
      url: 'https://www.legistdf.gob.ar/'
    },
    {
      id: 'leg-3',
      type: 'resolucion',
      number: 'Resolución L.P. 145/2026',
      date: '2026-05-22',
      title: 'Convocatoria a sesión ordinaria legislativa y orden del día establecido.',
      publisher: 'legislativo',
      url: 'https://www.legistdf.gob.ar/'
    },
    // Ushuaia
    {
      id: 'ush-1',
      type: 'ordenanza',
      number: 'Ordenanza Municipal 6230',
      date: '2026-06-09',
      title: 'Establecimiento del Plan Estratégico de Ordenamiento Territorial y Nuevos Códigos de Edificación.',
      publisher: 'ushuaia',
      url: 'https://www.ushuaia.gob.ar/'
    },
    {
      id: 'ush-2',
      type: 'decreto',
      number: 'Decreto Municipal 345/2026',
      date: '2026-06-03',
      title: 'Reglamentación del cuadro tarifario general para el servicio de transporte público urbano de pasajeros.',
      publisher: 'ushuaia',
      url: 'https://www.ushuaia.gob.ar/'
    },
    {
      id: 'ush-3',
      type: 'resolucion',
      number: 'Resolución Municipal 112/2026',
      date: '2026-05-25',
      title: 'Adjudicación de la obra de embellecimiento y senderos peatonales en el Paseo del Centenario.',
      publisher: 'ushuaia',
      url: 'https://www.ushuaia.gob.ar/'
    },
    // Rio Grande
    {
      id: 'rg-1',
      type: 'decreto',
      number: 'Decreto Municipal 870/2026',
      date: '2026-06-11',
      title: 'Puesta en marcha del Plan Estratégico de Obras Hidráulicas contra inundaciones estacionales.',
      publisher: 'riogrande',
      url: 'https://www.riogrande.gob.ar/'
    },
    {
      id: 'rg-2',
      type: 'ordenanza',
      number: 'Ordenanza Municipal 5820',
      date: '2026-06-04',
      title: 'Aprobación del programa de incentivos fiscales y exenciones tributarias para PyMEs radicadas en el Parque Industrial.',
      publisher: 'riogrande',
      url: 'https://www.riogrande.gob.ar/'
    },
    {
      id: 'rg-3',
      type: 'decreto',
      number: 'Decreto Municipal 825/2026',
      date: '2026-05-29',
      title: 'Llamado a licitación para la adquisición de equipamiento médico especializado para el Centro de Salud N° 3.',
      publisher: 'riogrande',
      url: 'https://www.riogrande.gob.ar/'
    },
    // Tolhuin
    {
      id: 'tol-1',
      type: 'ordenanza',
      number: 'Ordenanza Municipal 1240',
      date: '2026-06-12',
      title: 'Creación del Registro Único de Emprendedores y Artesanos Locales con acceso a créditos blandos municipales.',
      publisher: 'tolhuin',
      url: 'https://tolhuin.gob.ar/'
    },
    {
      id: 'tol-2',
      type: 'decreto',
      number: 'Decreto Municipal 198/2026',
      date: '2026-06-02',
      title: 'Aprobación del Plan de Reforestación y Cuidado Biológico del Bosque Andino Patagónico.',
      publisher: 'tolhuin',
      url: 'https://tolhuin.gob.ar/'
    },
    {
      id: 'tol-3',
      type: 'resolucion',
      number: 'Resolución Municipal 085/2026',
      date: '2026-05-26',
      title: 'Licitación y adjudicación de obras de extensión de redes de servicios básicos en barrios de Tolhuin.',
      publisher: 'tolhuin',
      url: 'https://tolhuin.gob.ar/'
    }
  ];

  const filteredBulletins = useMemo(() => {
    return bulletinsDb.filter(item => {
      const matchesPublisher = activePublisher === 'all' || item.publisher === activePublisher;
      const matchesSearch = item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            item.number.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            item.date.includes(searchTerm);
      return matchesPublisher && matchesSearch;
    });
  }, [activePublisher, searchTerm]);

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
          Portal de acceso y consulta rápida a los decretos, resoluciones, ordenanzas y leyes del Gobierno de Tierra del Fuego, su Legislatura y las tres ciudades de la provincia.
        </p>
      </header>

      {/* PORTALS LINKS CARD SECTION */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 md:gap-6">
        {publishersInfo.map((pub, idx) => {
          const Icon = pub.icon;
          return (
            <motion.div
              key={pub.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
              className="bg-white dark:bg-[#0e0e0e] border border-slate-200 dark:border-[#1f1f1f] rounded-[2rem] p-5 md:p-6 shadow-xl flex flex-col justify-between hover:border-blue-500/20 transition-all group hover-lift relative overflow-hidden"
            >
              {/* Subtle visual gradient on hover */}
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

              <div className="pt-4 border-t border-slate-100 dark:border-white/5 flex flex-col gap-3">
                <div className="flex items-center gap-2 text-[10px] text-slate-400">
                  <Info className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                  <span className="truncate">Acceso: {pub.system}</span>
                </div>
                <button
                  onClick={() => window.open(pub.url, '_blank')}
                  className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-slate-50 hover:bg-blue-600/10 dark:bg-white/5 dark:hover:bg-blue-500/10 text-slate-700 dark:text-gray-300 hover:text-blue-500 dark:hover:text-blue-400 rounded-xl text-xs font-black uppercase tracking-wider transition-all border border-slate-200 dark:border-white/10"
                >
                  Ir al Portal Oficial <ExternalLink className="w-3.5 h-3.5" />
                </button>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* SEARCH AND INTERACTIVE CONSULTATION PORTAL */}
      <div className="bg-white dark:bg-[#0e0e0e] border border-slate-200 dark:border-[#1f1f1f] rounded-[2.5rem] overflow-hidden shadow-2xl flex flex-col">
        {/* Sub Header / Control panel */}
        <div className="p-6 border-b border-slate-200 dark:border-[#1f1f1f] bg-slate-50/50 dark:bg-[#0a0a0a]/50 flex flex-col gap-4">
          <div className="flex items-center gap-3">
            <Sparkles className="w-4 h-4 text-blue-500 animate-pulse" />
            <h2 className="text-[12px] font-black text-slate-700 dark:text-gray-300 tracking-widest uppercase">
              Buscador Digital de Normativa Fueguina
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
                    : 'bg-slate-100/80 dark:bg-white/5 text-slate-600 dark:text-gray-400 hover:bg-slate-200/50 dark:hover:bg-white/10'
                }`}
              >
                Todos
              </button>
              {publishersInfo.map(pub => (
                <button
                  key={pub.id}
                  onClick={() => setActivePublisher(pub.id)}
                  className={`px-4 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all ${
                    activePublisher === pub.id 
                      ? 'bg-blue-600 text-white shadow-md' 
                      : 'bg-slate-100/80 dark:bg-white/5 text-slate-600 dark:text-gray-400 hover:bg-slate-200/50 dark:hover:bg-white/10'
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
                className="w-full bg-slate-100/50 dark:bg-black/40 border border-slate-200 dark:border-white/10 rounded-2xl py-3 pl-11 pr-4 text-[13px] font-medium text-slate-800 dark:text-gray-200 placeholder:text-slate-500 focus:outline-none focus:border-blue-500/50 focus:ring-4 focus:ring-blue-500/10 transition-all"
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
                      {/* Logo Badge */}
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
                        onClick={() => window.open(item.url, '_blank')}
                        className="flex items-center gap-1.5 py-2.5 px-4 bg-white dark:bg-white/5 hover:bg-blue-600 dark:hover:bg-blue-600 hover:text-white text-slate-700 dark:text-gray-300 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all border border-slate-200 dark:border-white/10 shadow-sm"
                      >
                        Ver Documento <ExternalLink className="w-3 h-3" />
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
                <p className="text-xs mt-1 text-center">Intenta buscar con otra palabra clave o cambia de filtro geográfico.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
