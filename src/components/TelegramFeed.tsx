import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Search, Calendar, Info, Shield, ExternalLink, CloudRain, Car, FileText, AlertTriangle, BookOpen, Share2 } from 'lucide-react';
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

export default function TelegramFeed({ articles = [], onSelectArticle }: TelegramFeedProps) {
  const [searchTerm, setSearchTerm] = useState('');
  
  // Alert messages (simulated official alerts)
  const alerts: TelegramMessage[] = [
    {
      id: 1,
      date: '2026-08-04',
      time: '10:45',
      sender: 'Defensa Civil TDF',
      category: 'clima',
      content: '⚠️ ALERTA METEOROLÓGICA: Se registran ráfagas intensas superiores a 90 km/h en la zona norte y centro de la provincia. Se aconseja no asegurar elementos sueltos en techos o patios y evitar circular a pie o en vehículos de gran porte si no es estrictamente necesario.',
      isImportant: true
    },
    {
      id: 2,
      date: '2026-08-04',
      time: '09:12',
      sender: 'Vialidad Provincial TDF',
      category: 'transito',
      content: '🚗 ESTADO DE RUTA 3: Calzada transitable con extrema precaución en el tramo Tolhuin - Ushuaia (Paso Garibaldi). Presencia de escarcha y nieve volada en sectores altos. Equipos de vialidad operando con fundentes. Portación de cubiertas térmicas u obligatoriedad de cadenas.',
      isImportant: false
    },
    {
      id: 3,
      date: '2026-08-03',
      time: '18:30',
      sender: 'Gobierno de Tierra del Fuego',
      category: 'institucional',
      content: '📢 COMUNICADO OFICIAL: Se encuentra abierta la inscripción para el Programa de Fortalecimiento Educativo Provincial para docentes y estudiantes avanzados de nivel superior. Accedé a las bases y condiciones en el portal oficial del Ministerio de Educación.',
      isImportant: false
    },
    {
      id: 4,
      date: '2026-08-03',
      time: '15:20',
      sender: 'Defensa Civil Ushuaia',
      category: 'seguridad',
      content: '🚨 ATENCIÓN CIUDADANA: Se recuerda la vigencia de la prohibición de encendido de fuego en zonas agrestes y boscosas no habilitadas por el plan provincial de manejo del fuego. Evitemos incendios forestales. Denuncias al 103 o 911.',
      isImportant: true
    },
    {
      id: 5,
      date: '2026-08-02',
      time: '11:05',
      sender: 'Ministerio de Salud TDF',
      category: 'institucional',
      content: '🏥 CAMPAÑA DE VACUNACIÓN: Mañana inicia el cronograma de refuerzos de vacuna antigripal en todos los centros de salud provinciales (CAPS) de Ushuaia, Tolhuin y Río Grande. Presentarse con libreta de vacunación y DNI.',
      isImportant: false
    }
  ];

  // Merge alerts and news articles into a single chronological feed
  const unifiedFeed = useMemo(() => {
    const items: UnifiedFeedItem[] = [];

    // Add alerts
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

    // Add loaded news articles
    articles.forEach(article => {
      const dateObj = new Date(article.pubDate);
      const timeStr = !isNaN(dateObj.getTime())
        ? dateObj.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })
        : '00:00';

      items.push({
        id: `article-${article.id}`,
        date: isNaN(dateObj.getTime()) ? new Date() : dateObj,
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

    // Sort by date descending (newest first)
    return items.sort((a, b) => b.date.getTime() - a.date.getTime());
  }, [articles]);

  // Filter feed items by search input
  const filteredFeed = useMemo(() => {
    if (!searchTerm.trim()) return unifiedFeed.slice(0, 30); // limit to top 30 items for speed

    return unifiedFeed.filter(item =>
      item.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.title && item.title.toLowerCase().includes(searchTerm.toLowerCase())) ||
      item.sender.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.category.toLowerCase().includes(searchTerm.toLowerCase())
    ).slice(0, 30);
  }, [searchTerm, unifiedFeed]);

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
      className="bg-white dark:bg-[#0e0e0e] border border-slate-200 dark:border-[#1f1f1f] rounded-3xl p-5 md:p-6 shadow-2xl flex flex-col gap-5 overflow-hidden w-full mt-6"
    >
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
              <span className="hidden sm:inline-block px-2 py-0.5 bg-blue-600 text-white rounded-md text-[8px] font-black uppercase tracking-widest">
                En Vivo
              </span>
            </div>
            <p className="text-slate-500 dark:text-gray-400 text-xs">
              Repositorio de alertas oficiales y noticias provinciales en tiempo real.
            </p>
          </div>
        </div>

        {/* Buscador y Botón de Unirse */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative">
            <input
              type="text"
              placeholder="Buscar noticias..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="bg-slate-50 dark:bg-black/40 border border-slate-200 dark:border-white/5 rounded-xl py-2 pl-3 pr-8 text-xs font-medium text-slate-700 dark:text-gray-200 focus:outline-none focus:border-blue-500 transition-all w-full sm:w-48"
            />
            <Search className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
          </div>

          <a
            href="https://t.me/+rkKMfpVR3G0yMDBh"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-[10px] font-black uppercase tracking-widest transition-all shadow-md hover:shadow-blue-500/10 active:scale-95 shrink-0"
          >
            Unirse al Canal <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>

      {/* FEED DE MENSAJES */}
      <div className="max-h-[420px] overflow-y-auto pr-1 flex flex-col gap-4 scrollbar-thin scrollbar-thumb-slate-200 dark:scrollbar-thumb-white/5">
        <AnimatePresence mode="popLayout">
          {filteredFeed.map((item, idx) => {
            const badge = getCategoryBadge(item.category);
            return (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                transition={{ delay: Math.min(idx * 0.05, 0.3) }}
                className={`p-4 rounded-2xl border transition-all flex flex-col gap-2.5 relative group ${
                  item.isImportant
                    ? 'bg-red-500/[0.02] border-red-500/25 dark:border-red-500/20'
                    : 'bg-slate-50/50 dark:bg-white/[0.01] border-slate-200 dark:border-white/5 hover:border-blue-500/20 dark:hover:border-blue-500/15'
                }`}
              >
                {/* Cabecera del mensaje */}
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

                    {/* Hora */}
                    <span className="text-[9px] text-slate-400 dark:text-gray-500 font-mono font-bold flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {item.timeStr} hs
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
                        className="flex items-center gap-1.5 text-[9.5px] font-black uppercase text-violet-500 hover:text-violet-400 transition-colors"
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
          <div className="text-center py-10 text-slate-400 dark:text-gray-500 flex flex-col items-center justify-center gap-2">
            <Send className="w-8 h-8 opacity-30 rotate-[345deg] text-blue-500 mb-1" />
            <span className="text-xs font-black uppercase tracking-wider">No se encontraron noticias ni alertas</span>
          </div>
        )}
      </div>
    </motion.div>
  );
}
