import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Search, Calendar, Info, Shield, ExternalLink, CloudRain, Car, FileText, AlertTriangle, BookOpen, X, Filter, RefreshCw, Wifi, Radio } from 'lucide-react';
import type { Article } from '@/types';

interface TelegramMessage {
  id: number;
  date: string;
  time: string;
  sender: string;
  category: 'clima' | 'transito' | 'institucional' | 'seguridad';
  content: string;
  isImportant?: boolean;
}

interface TelegramFeedProps {
  articles?: Article[];
  onSelectArticle?: (article: Article) => void;
}

interface UnifiedFeedItem {
  id: string;
  date: Date;
  timeStr: string;
  sender: string;
  category: 'clima' | 'transito' | 'institucional' | 'seguridad' | 'noticia';
  title?: string;
  content: string;
  thumbnail?: string;
  link?: string;
  isImportant?: boolean;
  rawArticle?: Article;
}

// Helper to strip HTML tags from RSS descriptions
function stripHtml(html: string = '') {
  return html.replace(/<[^>]*>/g, '').trim();
}

// Helper to format Date into YYYY-MM-DD in local time
function formatYMD(d: Date): string {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

// Helper to display friendly date & time string
function formatDisplayDate(d: Date, timeStr: string): string {
  const todayYMD = formatYMD(new Date());
  const itemYMD = formatYMD(d);
  
  if (itemYMD === todayYMD) {
    return `Hoy ${timeStr} hs`;
  }
  
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  if (itemYMD === formatYMD(yesterday)) {
    return `Ayer ${timeStr} hs`;
  }
  
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  return `${day}/${month} ${timeStr} hs`;
}

export default function TelegramFeed({ articles = [], onSelectArticle }: TelegramFeedProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDate, setSelectedDate] = useState<string>(''); // YYYY-MM-DD format
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [feedArticles, setFeedArticles] = useState<Article[]>(articles);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [autoSeconds, setAutoSeconds] = useState(25);
  const [lastSyncTime, setLastSyncTime] = useState<string>('En tiempo real');
  const [liveToast, setLiveToast] = useState<string | null>(null);

  // Synchronize internal state if parent prop updates
  useEffect(() => {
    if (articles && articles.length > 0) {
      setFeedArticles(articles);
    }
  }, [articles]);

  // Alert messages (simulated official alerts) with recent timestamps
  const alerts: TelegramMessage[] = [
    {
      id: 1,
      date: '2026-08-07',
      time: '11:30',
      sender: 'Defensa Civil TDF',
      category: 'clima',
      content: '⚠️ ALERTA METEOROLÓGICA: Se registran ráfagas intensas superiores a 95 km/h en el área del Canal Beagle y zona centro. Se solicita precaución extrema en la vía pública y asegurar chapas o estructuras de obra.',
      isImportant: true
    },
    {
      id: 2,
      date: '2026-08-07',
      time: '10:15',
      sender: 'Vialidad Provincial TDF',
      category: 'transito',
      content: '🚗 ESTADO DE RUTA 3: Calzada transitable con extrema precaución entre Tolhuin y Ushuaia (Paso Garibaldi). Presencia de hielo negro y nieve escarchada en zonas de sombra. Equipos invernales esparciendo sal y urea.',
      isImportant: false
    },
    {
      id: 3,
      date: '2026-08-07',
      time: '08:45',
      sender: 'Gobierno de Tierra del Fuego',
      category: 'institucional',
      content: '📢 COMUNICADO OFICIAL: Apertura de la inscripción online al Programa Provincial de Becas Universitarias y Terciarias 2026. Consultá requisitos y documentación en el sitio oficial del Ministerio de Educación.',
      isImportant: false
    },
    {
      id: 4,
      date: '2026-08-06',
      time: '19:20',
      sender: 'Defensa Civil Ushuaia',
      category: 'seguridad',
      content: '🚨 ATENCIÓN CIUDADANA: Se recuerda la vigencia de la prohibición de encendido de fuego en zonas boscosas no habilitadas por el Plan Provincial de Manejo del Fuego. Denuncias preventivas al 103 o 911.',
      isImportant: true
    },
    {
      id: 5,
      date: '2026-08-06',
      time: '14:10',
      sender: 'Ministerio de Salud TDF',
      category: 'institucional',
      content: '🏥 CAMPAÑA DE SALUD: Cronograma de vacunación antigripal y libreta sanitaria en los Centros de Atención Primaria (CAPS) de Río Grande, Tolhuin y Ushuaia.',
      isImportant: false
    },
    {
      id: 6,
      date: '2026-08-05',
      time: '16:50',
      sender: 'Policía de Tierra del Fuego',
      category: 'seguridad',
      content: '🛡️ OPERATIVO CONTROL DE TRÁNSITO: Se despliegan controles vehiculares preventivos y de verificación de cubiertas sílice/cadenas en los accesos a Río Grande y Ushuaia.',
      isImportant: false
    }
  ];

  // REAL-TIME FETCH FUNCTION (impacts view automatically)
  const fetchLiveFeeds = async (showNotification = false) => {
    setIsRefreshing(true);
    try {
      const res = await fetch('/api/articles');
      if (res.ok) {
        const data = await res.json();
        if (data.articles && Array.isArray(data.articles) && data.articles.length > 0) {
          const prevLength = feedArticles.length;
          setFeedArticles(data.articles);
          
          const now = new Date();
          const timeStr = now.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
          setLastSyncTime(timeStr);

          if (showNotification || data.articles.length > prevLength) {
            setLiveToast(`📡 Noticias en tiempo real sincronizadas (${timeStr} hs)`);
            setTimeout(() => setLiveToast(null), 3500);
          }
        }
      }
    } catch (err) {
      console.warn('Live RSS feed poll failed, retaining cache:', err);
    } finally {
      setIsRefreshing(false);
      setAutoSeconds(25);
    }
  };

  // AUTOMATED REAL-TIME POLLING EFFECT (Runs every 25 seconds)
  useEffect(() => {
    const timer = setInterval(() => {
      setAutoSeconds(prev => {
        if (prev <= 1) {
          fetchLiveFeeds(false);
          return 25;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [feedArticles]);

  // Merge alerts and news articles into a single chronological feed
  const unifiedFeed = useMemo(() => {
    const items: UnifiedFeedItem[] = [];

    // Add official alerts
    alerts.forEach(alert => {
      const dateObj = new Date(`${alert.date}T${alert.time}:00`);
      items.push({
        id: `alert-${alert.id}`,
        date: dateObj,
        timeStr: alert.time,
        sender: alert.sender,
        category: alert.category,
        content: alert.content,
        isImportant: alert.isImportant
      });
    });

    // Add loaded live news articles
    feedArticles.forEach(article => {
      const dateObj = new Date(article.pubDate);
      const isValid = !isNaN(dateObj.getTime());
      const timeStr = isValid
        ? dateObj.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })
        : '00:00';

      items.push({
        id: `article-${article.id}`,
        date: isValid ? dateObj : new Date(),
        timeStr: timeStr,
        sender: article.sourceName || 'Noticias TDF',
        category: 'noticia',
        title: article.title,
        content: stripHtml(article.description),
        thumbnail: article.thumbnail,
        link: article.link,
        rawArticle: article
      });
    });

    // STRICT SORT: Descending by date and time (newest uploaded item FIRST at index 0)
    return items.sort((a, b) => b.date.getTime() - a.date.getTime());
  }, [alerts, feedArticles]);

  // Filter feed items by search input & selected calendar date
  const filteredFeed = useMemo(() => {
    let result = unifiedFeed;

    // Filter by selected date (YYYY-MM-DD)
    if (selectedDate) {
      result = result.filter(item => formatYMD(item.date) === selectedDate);
    }

    // Filter by search text
    if (searchTerm.trim()) {
      const query = searchTerm.toLowerCase();
      result = result.filter(item =>
        item.content.toLowerCase().includes(query) ||
        (item.title && item.title.toLowerCase().includes(query)) ||
        item.sender.toLowerCase().includes(query) ||
        item.category.toLowerCase().includes(query)
      );
    }

    return result.slice(0, 50); // display top 50 matches
  }, [searchTerm, selectedDate, unifiedFeed]);

  const getCategoryBadge = (category: string) => {
    switch (category) {
      case 'clima':
        return {
          icon: <CloudRain className="w-3 h-3 text-sky-500" />,
          classes: 'bg-sky-500/10 text-sky-600 dark:text-sky-400 border-sky-500/20'
        };
      case 'transito':
        return {
          icon: <Car className="w-3 h-3 text-emerald-500" />,
          classes: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20'
        };
      case 'institucional':
        return {
          icon: <FileText className="w-3 h-3 text-blue-500" />,
          classes: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20'
        };
      case 'seguridad':
        return {
          icon: <Shield className="w-3 h-3 text-orange-500" />,
          classes: 'bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-500/20'
        };
      case 'noticia':
        return {
          icon: <Send className="w-3 h-3 text-violet-500" />,
          classes: 'bg-violet-500/10 text-violet-600 dark:text-violet-400 border-violet-500/20'
        };
      default:
        return {
          icon: <Info className="w-3 h-3 text-slate-500" />,
          classes: 'bg-slate-500/10 text-slate-600 dark:text-slate-400 border-slate-500/20'
        };
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="bg-white dark:bg-[#0e0e0e] border border-slate-200 dark:border-[#1f1f1f] rounded-3xl p-5 md:p-6 shadow-2xl flex flex-col gap-5 overflow-hidden w-full mt-6 relative"
    >
      {/* REAL-TIME TOAST ALERT */}
      <AnimatePresence>
        {liveToast && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            className="absolute top-3 left-1/2 -translate-x-1/2 z-50 bg-blue-600 text-white text-xs font-bold px-4 py-2 rounded-full shadow-xl flex items-center gap-2 border border-blue-400"
          >
            <Radio className="w-4 h-4 animate-pulse" />
            {liveToast}
          </motion.div>
        )}
      </AnimatePresence>

      {/* HEADER DE LA TARJETA */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-3 border-b border-slate-100 dark:border-white/5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-blue-500/15 flex items-center justify-center relative shadow-inner">
            <Send className="w-5 h-5 text-blue-500 rotate-[345deg]" />
            <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
            </span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm md:text-base font-black text-slate-900 dark:text-white uppercase tracking-wider font-display">
                Últimas noticias
              </h2>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 rounded-md text-[9px] font-black uppercase tracking-widest">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                En Vivo ({autoSeconds}s)
              </span>
            </div>
            <p className="text-slate-500 dark:text-gray-400 text-xs flex items-center gap-1.5 mt-0.5">
              Repositorio de alertas oficiales y noticias provinciales en tiempo real. 
              <span className="text-[10px] font-mono text-slate-400 hidden sm:inline">Última sincro: {lastSyncTime}</span>
            </p>
          </div>
        </div>

        {/* CONTROLES: Actualizar en Vivo, Buscador, Calendario y Canal */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Botón de Sincronización Manual */}
          <button
            onClick={() => fetchLiveFeeds(true)}
            disabled={isRefreshing}
            className="flex items-center gap-1.5 px-3 py-2 bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 text-slate-700 dark:text-gray-200 rounded-xl text-xs font-bold transition-all border border-slate-200 dark:border-white/5 cursor-pointer disabled:opacity-50"
            title="Sincronizar noticias en vivo ahora"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-blue-500 ${isRefreshing ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">Sincronizar</span>
          </button>

          {/* Buscador de texto */}
          <div className="relative">
            <input
              type="text"
              placeholder="Buscar noticias..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="bg-slate-50 dark:bg-black/40 border border-slate-200 dark:border-white/5 rounded-xl py-2 pl-3 pr-8 text-xs font-medium text-slate-700 dark:text-gray-200 focus:outline-none focus:border-blue-500 transition-all w-32 sm:w-40"
            />
            <Search className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
          </div>

          {/* Botón de Calendario para Filtro por Día */}
          <div className="relative">
            <button
              onClick={() => setShowDatePicker(!showDatePicker)}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all border cursor-pointer ${
                selectedDate
                  ? 'bg-blue-600 text-white border-blue-500 shadow-md'
                  : 'bg-slate-50 dark:bg-black/40 text-slate-700 dark:text-gray-300 border-slate-200 dark:border-white/5 hover:border-blue-500/30'
              }`}
              title="Filtrar noticias por día"
            >
              <Calendar className={`w-3.5 h-3.5 ${selectedDate ? 'text-white' : 'text-blue-500'}`} />
              <span className="text-[11px]">
                {selectedDate ? selectedDate.split('-').reverse().join('/') : 'Fecha'}
              </span>
              {selectedDate && (
                <span 
                  onClick={(e) => { e.stopPropagation(); setSelectedDate(''); }}
                  className="ml-1 hover:bg-white/20 p-0.5 rounded-full transition-colors"
                  title="Quitar filtro de fecha"
                >
                  <X className="w-3 h-3 text-white" />
                </span>
              )}
            </button>

            {/* Dropdown de Selector de Fecha */}
            <AnimatePresence>
              {showDatePicker && (
                <motion.div
                  initial={{ opacity: 0, y: 8, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 8, scale: 0.95 }}
                  className="absolute right-0 top-full mt-2 z-50 p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl flex flex-col gap-3 min-w-[240px]"
                >
                  <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
                    <span className="text-[10px] font-black uppercase tracking-wider text-slate-500 dark:text-gray-400 flex items-center gap-1">
                      <Calendar className="w-3 h-3 text-blue-500" /> Filtrar noticias por día
                    </span>
                    <button 
                      onClick={() => setShowDatePicker(false)}
                      className="text-slate-400 hover:text-slate-600 dark:hover:text-white p-1"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-bold text-slate-600 dark:text-gray-400 uppercase">
                      Seleccionar Fecha:
                    </label>
                    <input
                      type="date"
                      value={selectedDate}
                      onChange={(e) => {
                        setSelectedDate(e.target.value);
                        setShowDatePicker(false);
                      }}
                      className="w-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-mono text-slate-800 dark:text-white focus:outline-none focus:border-blue-500 cursor-pointer"
                    />
                  </div>

                  {/* Acceso Rápido: Hoy / Ayer / Ver Todas */}
                  <div className="flex items-center gap-1.5 pt-2 border-t border-slate-100 dark:border-slate-800">
                    <button
                      onClick={() => {
                        setSelectedDate(formatYMD(new Date()));
                        setShowDatePicker(false);
                      }}
                      className="flex-1 py-1.5 px-2 bg-blue-500/10 text-blue-600 dark:text-blue-400 hover:bg-blue-500/20 rounded-lg text-[9px] font-black uppercase text-center cursor-pointer"
                    >
                      Hoy
                    </button>
                    <button
                      onClick={() => {
                        const y = new Date();
                        y.setDate(y.getDate() - 1);
                        setSelectedDate(formatYMD(y));
                        setShowDatePicker(false);
                      }}
                      className="flex-1 py-1.5 px-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-gray-300 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg text-[9px] font-black uppercase text-center cursor-pointer"
                    >
                      Ayer
                    </button>
                    {selectedDate && (
                      <button
                        onClick={() => {
                          setSelectedDate('');
                          setShowDatePicker(false);
                        }}
                        className="py-1.5 px-2 bg-red-500/10 text-red-500 hover:bg-red-500/20 rounded-lg text-[9px] font-black uppercase text-center cursor-pointer"
                      >
                        Todas
                      </button>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <a
            href="https://t.me/+rkKMfpVR3G0yMDBh"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-[10px] font-black uppercase tracking-widest transition-all shadow-md hover:shadow-blue-500/10 active:scale-95 shrink-0"
          >
            Canal <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>

      {/* Indicador de Filtro Activo por Fecha */}
      {selectedDate && (
        <div className="flex items-center justify-between bg-blue-500/10 border border-blue-500/20 rounded-xl px-3.5 py-2 text-xs">
          <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400 font-medium">
            <Filter className="w-3.5 h-3.5" />
            <span>Filtro de fecha activo: <strong>{selectedDate.split('-').reverse().join('/')}</strong></span>
            <span className="text-[10px] opacity-75">({filteredFeed.length} noticias encontradas)</span>
          </div>
          <button
            onClick={() => setSelectedDate('')}
            className="text-[10px] font-black uppercase text-blue-500 hover:underline cursor-pointer"
          >
            Mostrar todas las noticias
          </button>
        </div>
      )}

      {/* FEED DE MENSAJES — EN TIEMPO REAL Y ORDENADO CRONOLÓGICAMENTE */}
      <div className="max-h-[460px] overflow-y-auto pr-1 flex flex-col gap-4 scrollbar-thin scrollbar-thumb-slate-200 dark:scrollbar-thumb-white/5">
        <AnimatePresence mode="popLayout">
          {filteredFeed.map((item, idx) => {
            const badge = getCategoryBadge(item.category);
            const friendlyDateStr = formatDisplayDate(item.date, item.timeStr);

            return (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                transition={{ delay: Math.min(idx * 0.04, 0.3) }}
                className={`p-4 rounded-2xl border transition-all flex flex-col gap-2.5 relative group ${
                  item.isImportant
                    ? 'bg-red-500/[0.02] border-red-500/25 dark:border-red-500/20'
                    : 'bg-slate-50/50 dark:bg-white/[0.01] border-slate-200 dark:border-white/5 hover:border-blue-500/20 dark:hover:border-blue-500/15'
                }`}
              >
                {/* Cabecera del mensaje con emisor, categoría y fecha/hora exacta */}
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-black uppercase text-slate-800 dark:text-white tracking-wider flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                      {item.sender}
                    </span>
                    {item.isImportant && (
                      <span className="text-[8px] font-black uppercase px-2 py-0.5 bg-red-500/10 text-red-500 border border-red-500/20 rounded flex items-center gap-1">
                        <AlertTriangle className="w-2.5 h-2.5" /> Importante
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    {/* Badge de Categoría */}
                    <div className={`px-2 py-0.5 rounded-md border text-[9px] font-bold uppercase tracking-wider flex items-center gap-1.5 ${badge.classes}`}>
                      {badge.icon}
                      {item.category === 'clima' ? 'Clima' : item.category === 'transito' ? 'Rutas' : item.category === 'institucional' ? 'Gobierno' : item.category === 'seguridad' ? 'Seguridad' : 'Noticia'}
                    </div>

                    {/* Fecha y Hora Exacta de Publicación */}
                    <span className="text-[9.5px] text-slate-500 dark:text-gray-400 font-mono font-bold flex items-center gap-1 bg-slate-100 dark:bg-white/5 px-2 py-0.5 rounded-md border border-slate-200 dark:border-white/5">
                      <Calendar className="w-3 h-3 text-blue-500" />
                      {friendlyDateStr}
                    </span>
                  </div>
                </div>

                {/* Contenido (con thumbnail si tiene) */}
                <div className="flex flex-col md:flex-row gap-4 items-start">
                  {item.thumbnail && (
                    <div className="w-full md:w-40 aspect-[16/10] shrink-0 overflow-hidden rounded-xl relative shadow-md border border-slate-200 dark:border-white/5">
                      <img src={item.thumbnail} alt="" className="w-full h-full object-cover" />
                    </div>
                  )}
                  <div className="flex-1 flex flex-col gap-1.5">
                    {item.title && (
                      <h3 className="text-xs sm:text-sm font-black text-slate-900 dark:text-white leading-snug font-display">
                        {item.title}
                      </h3>
                    )}
                    <p className="text-xs md:text-[12.5px] leading-relaxed text-slate-700 dark:text-gray-300 font-medium whitespace-pre-wrap line-clamp-3">
                      {item.content}
                    </p>
                  </div>
                </div>

                {/* Pie con enlaces interactivos (Instant View / Open link / Share) */}
                <div className="pt-2 border-t border-slate-100 dark:border-white/5 flex flex-wrap gap-3 justify-between items-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <span className="text-[8.5px] text-slate-400 dark:text-gray-500 uppercase tracking-widest font-mono">
                    {item.link ? 'Instant View disponible' : 'Canal ID: +rkKMfpVR3G0yMDBh'}
                  </span>
                  
                  <div className="flex items-center gap-3">
                    {/* Botón de Vista Rápida (Instant View) */}
                    {item.rawArticle && onSelectArticle && (
                      <button
                        onClick={() => onSelectArticle(item.rawArticle!)}
                        className="flex items-center gap-1.5 text-[9.5px] font-black uppercase text-violet-500 hover:text-violet-400 transition-colors cursor-pointer"
                        title="Abrir vista de lectura limpia"
                      >
                        <BookOpen className="w-3.5 h-3.5" /> Vista Rápida
                      </button>
                    )}

                    {/* Botón de Enlace Original */}
                    {item.link ? (
                      <a
                        href={item.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[9.5px] font-black uppercase text-blue-500 hover:text-blue-400 flex items-center gap-1 tracking-wider transition-colors"
                      >
                        Ver Original <ExternalLink className="w-3 h-3" />
                      </a>
                    ) : (
                      <a
                        href="https://t.me/+rkKMfpVR3G0yMDBh"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[9.5px] font-black uppercase text-blue-500 hover:text-blue-400 flex items-center gap-1 tracking-wider transition-colors"
                      >
                        Ver en Telegram <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>

        {filteredFeed.length === 0 && (
          <div className="text-center py-12 text-slate-400 dark:text-gray-500 flex flex-col items-center justify-center gap-2">
            <Send className="w-8 h-8 opacity-30 rotate-[345deg] text-blue-500 mb-1" />
            <span className="text-xs font-black uppercase tracking-wider">No se encontraron noticias ni alertas</span>
            {selectedDate && (
              <button
                onClick={() => setSelectedDate('')}
                className="mt-2 text-xs font-bold text-blue-500 hover:underline cursor-pointer"
              >
                Limpiar filtro de fecha ({selectedDate})
              </button>
            )}
          </div>
        )}
      </div>
    </motion.div>
  );
}
