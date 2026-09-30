'use client';

import React, { useState, useMemo, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Send, 
  Search, 
  Calendar, 
  Info, 
  Shield, 
  ExternalLink, 
  CloudRain, 
  Car, 
  FileText, 
  AlertTriangle, 
  BookOpen, 
  X, 
  Filter, 
  RefreshCw, 
  Radio, 
  ChevronLeft, 
  ChevronRight, 
  Play, 
  Pause, 
  Maximize2, 
  Copy, 
  Check, 
  Share2, 
  Clock, 
  SlidersHorizontal,
  LayoutGrid,
  Columns
} from 'lucide-react';
import type { Article } from '@/types';
import { shareToTelegram, InstantViewExplainerBadge, isValidUrl } from '@/utils/telegramInstantView';

// Ícono SVG oficial de WhatsApp
function WhatsAppIcon({ className = 'w-4 h-4' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
    </svg>
  );
}

// Ícono SVG oficial de Telegram
function TelegramIcon({ className = 'w-4 h-4' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.894 8.221l-1.97 9.28c-.145.658-.537.818-1.084.508l-3-2.21-1.446 1.394c-.16.16-.295.295-.605.295l.213-3.053 5.56-5.023c.242-.213-.054-.333-.373-.121l-6.871 4.326-2.962-.924c-.643-.204-.657-.643.136-.953l11.57-4.461c.537-.197 1.006.128.832.926z"/>
    </svg>
  );
}

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

export interface UnifiedFeedItem {
  id: string;
  date: Date;
  dateFormatted: string;
  friendlyDate: string;
  timeStr: string;
  formattedTime: string;
  sender: string;
  category: 'clima' | 'transito' | 'institucional' | 'seguridad' | 'noticia';
  title: string;
  content: string;
  shortContent: string;
  thumbnail?: string;
  link?: string;
  isImportant?: boolean;
  rawArticle?: Article;
}

// Limpieza de etiquetas HTML
function stripHtml(html: string = '') {
  return html.replace(/<[^>]*>/g, '').replace(/&nbsp;/g, ' ').replace(/\s+/g, ' ').trim();
}

// Formateo de fecha YYYY-MM-DD
function formatYMD(d: Date): string {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

// Formateo integral de Fecha y Hora
function formatArticleDateTime(d: Date, timeStr: string) {
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();
  const dateFormatted = `${day}/${month}/${year}`;

  const todayYMD = formatYMD(new Date());
  const itemYMD = formatYMD(d);
  let friendlyDate = `${day}/${month}`;
  if (itemYMD === todayYMD) {
    friendlyDate = 'Hoy';
  } else {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    if (itemYMD === formatYMD(yesterday)) {
      friendlyDate = 'Ayer';
    }
  }

  let formattedTime = timeStr;
  if (!formattedTime.includes(':')) {
    formattedTime = `${timeStr}:00`;
  }
  if (!formattedTime.toLowerCase().includes('hs')) {
    formattedTime = `${formattedTime} hs`;
  }

  return {
    dateFormatted,
    friendlyDate: `${friendlyDate} · ${day}/${month}`,
    formattedTime
  };
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

  // Estados del Slider Lateral
  const sliderRef = useRef<HTMLDivElement>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlay, setIsAutoPlay] = useState(true);
  const [isHovered, setIsHovered] = useState(false);
  const [viewMode, setViewMode] = useState<'slider' | 'grid'>('slider');

  // Estado para la nota ampliada (Modal de lectura)
  const [expandedItem, setExpandedItem] = useState<UnifiedFeedItem | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Sincronizar artículos si cambian los props
  useEffect(() => {
    if (articles && articles.length > 0) {
      setFeedArticles(articles);
    }
  }, [articles]);

  // Cerrar modal al presionar Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setExpandedItem(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Alertas oficiales simuladas/reales de Tierra del Fuego
  const alerts: TelegramMessage[] = [
    {
      id: 1,
      date: '2026-09-30',
      time: '09:30',
      sender: 'Defensa Civil TDF',
      category: 'clima',
      content: '⚠️ ALERTA METEOROLÓGICA: Se registran ráfagas intensas superiores a 85 km/h en el área del Canal Beagle y zona centro. Se solicita precaución extrema en la vía pública y asegurar chapas o estructuras de obra.',
      isImportant: true
    },
    {
      id: 2,
      date: '2026-09-30',
      time: '08:15',
      sender: 'Vialidad Provincial TDF',
      category: 'transito',
      content: '🚗 ESTADO DE RUTA 3: Calzada transitable con extrema precaución entre Tolhuin y Ushuaia (Paso Garibaldi). Presencia de lloviznas y escarcha en zonas de sombra. Equipos de control apostados en ruta.',
      isImportant: false
    },
    {
      id: 3,
      date: '2026-09-29',
      time: '18:45',
      sender: 'Gobierno de Tierra del Fuego',
      category: 'institucional',
      content: '📢 COMUNICADO OFICIAL: Apertura de la inscripción online al Programa Provincial de Becas Universitarias y Terciarias. Consultá requisitos y documentación en el sitio oficial del Ministerio de Educación.',
      isImportant: false
    },
    {
      id: 4,
      date: '2026-09-29',
      time: '15:20',
      sender: 'Defensa Civil Ushuaia',
      category: 'seguridad',
      content: '🚨 ATENCIÓN CIUDADANA: Se recuerda la vigencia de la prohibición de encendido de fuego en zonas boscosas no habilitadas por el Plan Provincial de Manejo del Fuego. Denuncias preventivas al 103 o 911.',
      isImportant: true
    }
  ];

  // Sincronización en tiempo real
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
          const timeStr = now.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' });
          setLastSyncTime(timeStr);

          if (showNotification || data.articles.length > prevLength) {
            setLiveToast(`📡 Noticias en tiempo real sincronizadas (${timeStr} hs)`);
            setTimeout(() => setLiveToast(null), 3500);
          }
        }
      }
    } catch (err) {
      console.warn('Live RSS feed poll failed:', err);
    } finally {
      setIsRefreshing(false);
      setAutoSeconds(25);
    }
  };

  // Temporizador de refresco periódico
  useEffect(() => {
    const timer = setInterval(() => {
      setAutoSeconds((prev) => {
        if (prev <= 1) {
          fetchLiveFeeds(false);
          return 25;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [feedArticles]);

  // Unificación de noticias y alertas en orden cronológico estricto
  const unifiedFeed: UnifiedFeedItem[] = useMemo(() => {
    const items: UnifiedFeedItem[] = [];

    // Alertas
    alerts.forEach((alert) => {
      const dateObj = new Date(`${alert.date}T${alert.time}:00`);
      const { dateFormatted, friendlyDate, formattedTime } = formatArticleDateTime(dateObj, alert.time);
      const cleanContent = stripHtml(alert.content);

      items.push({
        id: `alert-${alert.id}`,
        date: dateObj,
        dateFormatted,
        friendlyDate,
        timeStr: alert.time,
        formattedTime,
        sender: alert.sender,
        category: alert.category,
        title: alert.sender,
        content: cleanContent,
        shortContent: cleanContent.length > 170 ? cleanContent.slice(0, 170).trim() + '...' : cleanContent,
        isImportant: alert.isImportant
      });
    });

    // Artículos RSS
    feedArticles.forEach((article) => {
      const dateObj = new Date(article.pubDate);
      const isValid = !isNaN(dateObj.getTime());
      const rawDate = isValid ? dateObj : new Date();
      const timeStr = isValid
        ? dateObj.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })
        : '12:00';

      const { dateFormatted, friendlyDate, formattedTime } = formatArticleDateTime(rawDate, timeStr);
      const cleanContent = stripHtml(article.description || article.title);

      items.push({
        id: `article-${article.id}`,
        date: rawDate,
        dateFormatted,
        friendlyDate,
        timeStr,
        formattedTime,
        sender: article.sourceName || 'Noticias Regionales',
        category: 'noticia',
        title: article.title || 'Sin título',
        content: cleanContent,
        shortContent: cleanContent.length > 170 ? cleanContent.slice(0, 170).trim() + '...' : cleanContent,
        thumbnail: article.thumbnail,
        link: article.link,
        rawArticle: article
      });
    });

    // Orden descendente (la más reciente primero)
    return items.sort((a, b) => b.date.getTime() - a.date.getTime());
  }, [alerts, feedArticles]);

  // Filtrado por buscador y por fecha de calendario
  const filteredFeed = useMemo(() => {
    let result = unifiedFeed;

    if (selectedDate) {
      result = result.filter((item) => formatYMD(item.date) === selectedDate);
    }

    if (searchTerm.trim()) {
      const query = searchTerm.toLowerCase();
      result = result.filter(
        (item) =>
          item.content.toLowerCase().includes(query) ||
          item.title.toLowerCase().includes(query) ||
          item.sender.toLowerCase().includes(query) ||
          item.category.toLowerCase().includes(query)
      );
    }

    return result;
  }, [searchTerm, selectedDate, unifiedFeed]);

  // Lógica de desplazamiento del Slider Lateral
  const scrollToIndex = (index: number) => {
    if (!sliderRef.current) return;
    const container = sliderRef.current;
    const cards = container.querySelectorAll<HTMLElement>('[data-slider-card]');
    if (cards[index]) {
      const card = cards[index];
      const cardLeft = card.offsetLeft - container.offsetLeft - 16;
      container.scrollTo({
        left: Math.max(0, cardLeft),
        behavior: 'smooth'
      });
      setCurrentIndex(index);
    }
  };

  const handleNext = () => {
    if (filteredFeed.length === 0) return;
    const next = (currentIndex + 1) % filteredFeed.length;
    scrollToIndex(next);
  };

  const handlePrev = () => {
    if (filteredFeed.length === 0) return;
    const prev = (currentIndex - 1 + filteredFeed.length) % filteredFeed.length;
    scrollToIndex(prev);
  };

  // Pase automático (Autoplay) cada 4.5 segundos
  useEffect(() => {
    if (viewMode !== 'slider' || !isAutoPlay || isHovered || filteredFeed.length <= 1) return;
    const timer = setInterval(() => {
      handleNext();
    }, 4500);
    return () => clearInterval(timer);
  }, [viewMode, isAutoPlay, isHovered, currentIndex, filteredFeed.length]);

  // Detección de índice al deslizar manualmente
  const handleSliderScroll = () => {
    if (!sliderRef.current) return;
    const container = sliderRef.current;
    const scrollLeft = container.scrollLeft;
    const cards = container.querySelectorAll<HTMLElement>('[data-slider-card]');
    if (cards.length === 0) return;

    let closest = 0;
    let minDiff = Infinity;
    cards.forEach((card, idx) => {
      const cardLeft = card.offsetLeft - container.offsetLeft - 16;
      const diff = Math.abs(cardLeft - scrollLeft);
      if (diff < minDiff) {
        minDiff = diff;
        closest = idx;
      }
    });
    setCurrentIndex(closest);
  };

  // Formateo de mensaje para compartir
  const getSharePayload = (item: UnifiedFeedItem) => {
    const title = item.title || 'Noticia de Último Momento';
    const excerpt = item.shortContent || '';
    const source = item.sender || 'Noticias TDF';
    const date = item.dateFormatted;
    const time = item.formattedTime;
    const link = item.link || (typeof window !== 'undefined' ? window.location.href : '');

    const whatsappText = [
      `📰 *${title}*`,
      '',
      `${excerpt}`,
      '',
      `📌 *Fuente:* ${source}`,
      `🕒 *Fecha:* ${date} · ${time}`,
      link ? `🔗 ${link}` : ''
    ]
      .filter(Boolean)
      .join('\n');

    const telegramText = [
      `📰 ${title}`,
      '',
      `${excerpt}`,
      '',
      `📌 Fuente: ${source} (${date} · ${time})`
    ].join('\n');

    return { whatsappText, telegramText, link };
  };

  // Compartir en WhatsApp
  const handleShareWhatsApp = (item: UnifiedFeedItem, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const { whatsappText } = getSharePayload(item);
    const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(whatsappText)}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  // Compartir en Telegram (con soporte Instant View según https://instantview.telegram.org/)
  const handleShareTelegram = (item: UnifiedFeedItem, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    shareToTelegram({
      url: item.link,
      title: item.title,
      excerpt: item.shortContent,
      source: item.sender,
      date: item.dateFormatted,
      time: item.formattedTime
    });
  };

  // Copiar mensaje al portapapeles
  const handleCopyMessage = async (item: UnifiedFeedItem, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const { whatsappText } = getSharePayload(item);
    try {
      await navigator.clipboard.writeText(whatsappText);
      setCopiedId(item.id);
      setLiveToast('✅ Noticia copiada para enviar');
      setTimeout(() => {
        setCopiedId(null);
        setLiveToast(null);
      }, 2500);
    } catch (err) {
      console.warn('Copy error:', err);
    }
  };

  // Helper de badge por categoría
  const getCategoryBadge = (category: string) => {
    switch (category) {
      case 'clima':
        return {
          label: 'Clima',
          icon: <CloudRain className="w-3 h-3 text-sky-400" />,
          classes: 'bg-sky-500/10 text-sky-600 dark:text-sky-400 border-sky-500/25'
        };
      case 'transito':
        return {
          label: 'Rutas & Vialidad',
          icon: <Car className="w-3 h-3 text-emerald-400" />,
          classes: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/25'
        };
      case 'institucional':
        return {
          label: 'Oficial',
          icon: <FileText className="w-3 h-3 text-blue-400" />,
          classes: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/25'
        };
      case 'seguridad':
        return {
          label: 'Seguridad',
          icon: <Shield className="w-3 h-3 text-amber-400" />,
          classes: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/25'
        };
      case 'noticia':
      default:
        return {
          label: 'Noticia',
          icon: <Radio className="w-3 h-3 text-violet-400" />,
          classes: 'bg-violet-500/10 text-violet-600 dark:text-violet-400 border-violet-500/25'
        };
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="bg-white dark:bg-[#0b0d13] border border-slate-200 dark:border-white/10 rounded-3xl p-5 md:p-6 shadow-2xl flex flex-col gap-4 overflow-hidden w-full mt-6 relative"
    >
      {/* TOAST DE FEEDBACK EN VIVO */}
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

      {/* HEADER: TÍTULO, BADGE EN VIVO Y CONTROLES */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-3 border-b border-slate-100 dark:border-white/5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-blue-600 to-cyan-500 flex items-center justify-center relative shadow-lg shadow-blue-500/20 shrink-0">
            <Radio className="w-5 h-5 text-white animate-pulse" />
            <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
            </span>
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-sm md:text-base font-black text-slate-900 dark:text-white uppercase tracking-wider font-display">
                Últimas noticias
              </h2>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 rounded-full text-[10px] font-black uppercase tracking-widest">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
                En Vivo ({filteredFeed.length})
              </span>
              <span className="text-[10px] font-mono text-slate-400 dark:text-gray-400 hidden sm:inline">
                Sincro: {autoSeconds}s
              </span>
            </div>
            <p className="text-slate-500 dark:text-gray-400 text-xs flex items-center gap-1.5 mt-0.5">
              Slider automático en tiempo real con opción de ampliar y compartir por WhatsApp y Telegram.
            </p>
          </div>
        </div>

        {/* CONTROLES: Slider/Grid, Play/Pause, Fechas, Búsqueda y Sincro */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Switch Slider / Grilla */}
          <div className="flex items-center bg-slate-100 dark:bg-white/5 p-0.5 rounded-xl border border-slate-200 dark:border-white/10 text-xs">
            <button
              onClick={() => setViewMode('slider')}
              className={`px-2.5 py-1.5 rounded-lg flex items-center gap-1.5 font-bold transition-all cursor-pointer ${
                viewMode === 'slider'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-600 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white'
              }`}
              title="Vista de Slider Lateral"
            >
              <Columns className="w-3.5 h-3.5" />
              <span className="hidden sm:inline text-[11px]">Slider</span>
            </button>
            <button
              onClick={() => setViewMode('grid')}
              className={`px-2.5 py-1.5 rounded-lg flex items-center gap-1.5 font-bold transition-all cursor-pointer ${
                viewMode === 'grid'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-600 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white'
              }`}
              title="Vista de Grilla"
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span className="hidden sm:inline text-[11px]">Mosaico</span>
            </button>
          </div>

          {/* Controles de Reproducción y Flechas (Solo en modo Slider) */}
          {viewMode === 'slider' && (
            <div className="flex items-center gap-1 bg-slate-100 dark:bg-white/5 p-0.5 rounded-xl border border-slate-200 dark:border-white/10">
              <button
                onClick={() => setIsAutoPlay(!isAutoPlay)}
                className={`p-1.5 rounded-lg transition-all cursor-pointer ${
                  isAutoPlay
                    ? 'text-emerald-500 hover:bg-emerald-500/10'
                    : 'text-slate-400 hover:text-slate-600 dark:hover:text-white'
                }`}
                title={isAutoPlay ? 'Pausar avance automático' : 'Activar avance automático'}
              >
                {isAutoPlay ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
              </button>
              <div className="w-[1px] h-4 bg-slate-200 dark:bg-white/10" />
              <button
                onClick={handlePrev}
                className="p-1.5 rounded-lg text-slate-600 dark:text-gray-300 hover:bg-slate-200 dark:hover:bg-white/10 transition-all cursor-pointer"
                title="Noticia anterior"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={handleNext}
                className="p-1.5 rounded-lg text-slate-600 dark:text-gray-300 hover:bg-slate-200 dark:hover:bg-white/10 transition-all cursor-pointer"
                title="Noticia siguiente"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Buscador de texto */}
          <div className="relative">
            <input
              type="text"
              placeholder="Buscar..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-slate-50 dark:bg-black/40 border border-slate-200 dark:border-white/10 rounded-xl py-1.5 pl-3 pr-7 text-xs font-medium text-slate-700 dark:text-gray-200 focus:outline-none focus:border-blue-500 transition-all w-28 sm:w-36"
            />
            <Search className="absolute right-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
          </div>

          {/* Botón de Calendario para Filtro por Día */}
          <div className="relative">
            <button
              onClick={() => setShowDatePicker(!showDatePicker)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all border cursor-pointer ${
                selectedDate
                  ? 'bg-blue-600 text-white border-blue-500 shadow-md'
                  : 'bg-slate-50 dark:bg-black/40 text-slate-700 dark:text-gray-300 border-slate-200 dark:border-white/10 hover:border-blue-500/30'
              }`}
              title="Filtrar noticias por fecha"
            >
              <Calendar className={`w-3.5 h-3.5 ${selectedDate ? 'text-white' : 'text-blue-500'}`} />
              <span className="text-[11px]">
                {selectedDate ? selectedDate.split('-').reverse().join('/') : 'Fecha'}
              </span>
              {selectedDate && (
                <span
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedDate('');
                  }}
                  className="ml-1 hover:bg-white/20 p-0.5 rounded-full transition-colors"
                  title="Quitar filtro de fecha"
                >
                  <X className="w-3 h-3 text-white" />
                </span>
              )}
            </button>

            {/* Dropdown de Calendario */}
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
                      <Calendar className="w-3 h-3 text-blue-500" /> Filtrar por día
                    </span>
                    <button
                      onClick={() => setShowDatePicker(false)}
                      className="text-slate-400 hover:text-slate-600 dark:hover:text-white p-1"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <input
                    type="date"
                    value={selectedDate}
                    onChange={(e) => {
                      setSelectedDate(e.target.value);
                      setShowDatePicker(false);
                    }}
                    className="w-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-mono text-slate-800 dark:text-white focus:outline-none focus:border-blue-500 cursor-pointer"
                  />

                  <div className="flex items-center gap-1.5 pt-2 border-t border-slate-100 dark:border-slate-800">
                    <button
                      onClick={() => {
                        setSelectedDate(formatYMD(new Date()));
                        setShowDatePicker(false);
                      }}
                      className="flex-1 py-1 px-2 bg-blue-500/10 text-blue-600 dark:text-blue-400 hover:bg-blue-500/20 rounded-lg text-[9px] font-black uppercase text-center cursor-pointer"
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
                      className="flex-1 py-1 px-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-gray-300 hover:bg-slate-200 rounded-lg text-[9px] font-black uppercase text-center cursor-pointer"
                    >
                      Ayer
                    </button>
                    {selectedDate && (
                      <button
                        onClick={() => {
                          setSelectedDate('');
                          setShowDatePicker(false);
                        }}
                        className="py-1 px-2 bg-red-500/10 text-red-500 hover:bg-red-500/20 rounded-lg text-[9px] font-black uppercase text-center cursor-pointer"
                      >
                        Todas
                      </button>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Sincronización Manual */}
          <button
            onClick={() => fetchLiveFeeds(true)}
            disabled={isRefreshing}
            className="p-2 bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 text-slate-700 dark:text-gray-200 rounded-xl text-xs font-bold transition-all border border-slate-200 dark:border-white/10 cursor-pointer disabled:opacity-50"
            title="Sincronizar ahora"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-blue-500 ${isRefreshing ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* INDICADOR DE FILTRO ACTIVO */}
      {selectedDate && (
        <div className="flex items-center justify-between bg-blue-500/10 border border-blue-500/20 rounded-xl px-3.5 py-2 text-xs">
          <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400 font-medium">
            <Filter className="w-3.5 h-3.5" />
            <span>
              Filtro de fecha: <strong>{selectedDate.split('-').reverse().join('/')}</strong>
            </span>
            <span className="text-[10px] opacity-75">({filteredFeed.length} noticias)</span>
          </div>
          <button
            onClick={() => setSelectedDate('')}
            className="text-[10px] font-black uppercase text-blue-500 hover:underline cursor-pointer"
          >
            Ver todas
          </button>
        </div>
      )}

      {/* CONTENEDOR: SLIDER LATERAL O GRILLA */}
      {viewMode === 'slider' ? (
        <div className="relative group/slider w-full">
          {/* TRACK DEL SLIDER LATERAL */}
          <div
            ref={sliderRef}
            onScroll={handleSliderScroll}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            className="flex gap-4 overflow-x-auto scroll-smooth pb-4 pt-1 px-1 scrollbar-hide snap-x snap-mandatory"
          >
            {filteredFeed.map((item, idx) => {
              const badge = getCategoryBadge(item.category);

              return (
                <div
                  key={item.id}
                  data-slider-card
                  onClick={() => setExpandedItem(item)}
                  className={`snap-start shrink-0 w-[295px] sm:w-[350px] md:w-[380px] bg-slate-50/80 dark:bg-[#12151f]/90 border border-slate-200 dark:border-white/10 hover:border-blue-500/40 rounded-2xl p-4 flex flex-col justify-between gap-3 shadow-md hover:shadow-2xl transition-all duration-300 cursor-pointer relative group/card ${
                    item.isImportant ? 'border-red-500/30 bg-red-500/[0.02]' : ''
                  }`}
                >
                  {/* IMAGEN / THUMBNAIL (16:9 con hover effect) */}
                  <div className="w-full aspect-[16/9] rounded-xl overflow-hidden bg-slate-900/80 relative border border-slate-200/50 dark:border-white/5 shrink-0 shadow-inner">
                    {item.thumbnail ? (
                      <img
                        src={item.thumbnail}
                        alt={item.title}
                        className="w-full h-full object-cover group-hover/card:scale-105 transition-transform duration-500"
                        loading="lazy"
                      />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-slate-900 to-blue-950 text-slate-500 gap-2 p-3 text-center">
                        <Radio className="w-8 h-8 text-blue-500/40" />
                        <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400">
                          {item.sender}
                        </span>
                      </div>
                    )}

                    {/* Badge de Categoría flotante sobre imagen */}
                    <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5 z-10">
                      <div className={`px-2 py-0.5 rounded-md border text-[9px] font-black uppercase tracking-wider backdrop-blur-md flex items-center gap-1 ${badge.classes}`}>
                        {badge.icon}
                        <span>{badge.label}</span>
                      </div>
                      {item.isImportant && (
                        <span className="text-[8px] font-black uppercase px-2 py-0.5 bg-red-600 text-white rounded-md shadow-md animate-pulse">
                          Alerta
                        </span>
                      )}
                    </div>

                    {/* Botón flotante para Ampliar al hacer hover */}
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/card:opacity-100 transition-opacity flex items-center justify-center gap-2">
                      <span className="px-3 py-1.5 rounded-full bg-blue-600 text-white text-[11px] font-bold flex items-center gap-1.5 shadow-lg transform translate-y-2 group-hover/card:translate-y-0 transition-all">
                        <Maximize2 className="w-3.5 h-3.5" /> Ampliar Nota
                      </span>
                    </div>
                  </div>

                  {/* CUERPO: FUENTE, FECHA/HORA, TÍTULO Y REDACCIÓN CORTA */}
                  <div className="flex flex-col gap-2 flex-1">
                    {/* Fuente + Fecha y Hora exacta */}
                    <div className="flex items-center justify-between text-[10px] font-mono text-slate-500 dark:text-gray-400 border-b border-slate-100 dark:border-white/5 pb-2">
                      <span className="font-bold text-blue-600 dark:text-cyan-400 uppercase tracking-wide truncate max-w-[150px]">
                        • {item.sender}
                      </span>
                      <span className="flex items-center gap-1 shrink-0 font-medium">
                        <Clock className="w-3 h-3 text-slate-400" />
                        <span>{item.dateFormatted}</span>
                        <span className="text-slate-300 dark:text-gray-600">·</span>
                        <span className="text-slate-800 dark:text-gray-300 font-bold">{item.formattedTime}</span>
                      </span>
                    </div>

                    {/* Título de la noticia */}
                    <h3 className="text-xs sm:text-sm font-black text-slate-900 dark:text-white leading-snug line-clamp-2 font-display group-hover/card:text-blue-500 dark:group-hover/card:text-cyan-400 transition-colors">
                      {item.title}
                    </h3>

                    {/* Redacción Corta */}
                    <p className="text-[11px] sm:text-xs text-slate-600 dark:text-gray-300 line-clamp-3 leading-relaxed font-normal">
                      {item.shortContent}
                    </p>
                  </div>

                  {/* FOOTER: BOTÓN DE AMPLIAR + BOTONES RÁPIDOS DE WHATSAPP Y TELEGRAM */}
                  <div className="pt-2.5 border-t border-slate-200/70 dark:border-white/5 flex items-center justify-between gap-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setExpandedItem(item);
                      }}
                      className="flex items-center gap-1.5 text-[11px] font-bold text-blue-600 dark:text-cyan-400 hover:text-blue-700 dark:hover:text-cyan-300 transition-colors cursor-pointer"
                    >
                      <Maximize2 className="w-3.5 h-3.5" />
                      <span>Ampliar</span>
                    </button>

                    <div className="flex items-center gap-1.5">
                      {/* Compartir WhatsApp */}
                      <button
                        onClick={(e) => handleShareWhatsApp(item, e)}
                        className="px-2.5 py-1 rounded-lg bg-emerald-500/10 hover:bg-emerald-500 text-emerald-600 dark:text-emerald-400 hover:text-white border border-emerald-500/25 transition-all text-[10px] font-bold flex items-center gap-1 cursor-pointer shadow-sm"
                        title="Compartir noticia en WhatsApp"
                      >
                        <WhatsAppIcon className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline">WhatsApp</span>
                      </button>

                      {/* Compartir Telegram con Instant View */}
                      <button
                        onClick={(e) => handleShareTelegram(item, e)}
                        className="px-2.5 py-1 rounded-lg bg-sky-500/10 hover:bg-sky-500 text-sky-600 dark:text-sky-400 hover:text-white border border-sky-500/25 transition-all text-[10px] font-bold flex items-center gap-1 cursor-pointer shadow-sm group/btn"
                        title={isValidUrl(item.link) ? "Compartir en Telegram con Vista Rápida (⚡ Instant View) | instantview.telegram.org" : "Compartir noticia en Telegram"}
                      >
                        <TelegramIcon className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline">Telegram</span>
                        {isValidUrl(item.link) && (
                          <span className="text-[9px] bg-sky-500/20 text-sky-500 dark:text-sky-300 px-1 py-0.2 rounded font-black group-hover/btn:bg-white/20 group-hover/btn:text-white transition-colors" title="Instant View disponible">
                            ⚡ IV
                          </span>
                        )}
                      </button>

                      {/* Copiar Mensaje */}
                      <button
                        onClick={(e) => handleCopyMessage(item, e)}
                        className="p-1 rounded-lg bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 text-slate-500 hover:text-slate-900 dark:hover:text-white border border-slate-200 dark:border-white/10 transition-all cursor-pointer"
                        title="Copiar texto de la noticia"
                      >
                        {copiedId === item.id ? (
                          <Check className="w-3.5 h-3.5 text-emerald-500" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* BARRA DE PROGRESO Y CONTADOR DE SLIDES */}
          <div className="flex items-center justify-between pt-2 px-1 text-[11px] font-mono text-slate-400 dark:text-gray-400 border-t border-slate-100 dark:border-white/5">
            <div className="flex items-center gap-2">
              <span className="font-bold text-slate-700 dark:text-gray-200">
                Nota {currentIndex + 1} de {filteredFeed.length}
              </span>
              <span className="text-slate-300 dark:text-gray-600">·</span>
              <span className="flex items-center gap-1 text-[10px]">
                {isAutoPlay && !isHovered ? (
                  <>
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                    <span className="text-emerald-500">Pase automático activo (4.5s)</span>
                  </>
                ) : (
                  <span className="text-slate-400">Pausado (hover/manual)</span>
                )}
              </span>
            </div>

            {/* Indicador de Barra de Progreso */}
            <div className="hidden sm:flex items-center gap-1 w-32 bg-slate-200 dark:bg-white/10 h-1.5 rounded-full overflow-hidden">
              <div
                className="bg-blue-600 dark:bg-cyan-500 h-full rounded-full transition-all duration-300"
                style={{
                  width: `${Math.min(100, ((currentIndex + 1) / Math.max(1, filteredFeed.length)) * 100)}%`
                }}
              />
            </div>
          </div>
        </div>
      ) : (
        /* VISTA DE GRILLA / MOSAICO ALTERNATIVA */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-h-[600px] overflow-y-auto pr-1 scrollbar-thin">
          {filteredFeed.map((item) => {
            const badge = getCategoryBadge(item.category);

            return (
              <div
                key={item.id}
                onClick={() => setExpandedItem(item)}
                className="bg-slate-50/80 dark:bg-[#12151f]/90 border border-slate-200 dark:border-white/10 hover:border-blue-500/40 rounded-2xl p-4 flex flex-col justify-between gap-3 shadow-md hover:shadow-xl transition-all cursor-pointer group"
              >
                {item.thumbnail && (
                  <div className="w-full aspect-[16/9] rounded-xl overflow-hidden bg-slate-900 relative">
                    <img
                      src={item.thumbnail}
                      alt={item.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute top-2 left-2 px-2 py-0.5 rounded-md border text-[9px] font-black uppercase tracking-wider backdrop-blur-md flex items-center gap-1 bg-black/60 text-white border-white/20">
                      {badge.icon}
                      <span>{badge.label}</span>
                    </div>
                  </div>
                )}

                <div className="flex flex-col gap-1.5 flex-1">
                  <div className="flex items-center justify-between text-[10px] font-mono text-slate-500">
                    <span className="font-bold text-blue-600 dark:text-cyan-400 uppercase">• {item.sender}</span>
                    <span>{item.dateFormatted} · {item.formattedTime}</span>
                  </div>
                  <h3 className="text-xs sm:text-sm font-black text-slate-900 dark:text-white line-clamp-2 font-display">
                    {item.title}
                  </h3>
                  <p className="text-[11px] text-slate-600 dark:text-gray-300 line-clamp-3 leading-relaxed">
                    {item.shortContent}
                  </p>
                </div>

                <div className="pt-2 border-t border-slate-100 dark:border-white/5 flex items-center justify-between gap-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setExpandedItem(item);
                    }}
                    className="text-[11px] font-bold text-blue-600 dark:text-cyan-400 flex items-center gap-1"
                  >
                    <Maximize2 className="w-3.5 h-3.5" /> Ampliar
                  </button>
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={(e) => handleShareWhatsApp(item, e)}
                      className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500 hover:text-white transition-colors"
                      title="WhatsApp"
                    >
                      <WhatsAppIcon className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={(e) => handleShareTelegram(item, e)}
                      className="p-1.5 rounded-lg bg-sky-500/10 text-sky-500 hover:bg-sky-500 hover:text-white transition-colors relative group/tg"
                      title={isValidUrl(item.link) ? "Compartir en Telegram (⚡ Instant View) | instantview.telegram.org" : "Telegram"}
                    >
                      <TelegramIcon className="w-3.5 h-3.5" />
                      {isValidUrl(item.link) && (
                        <span className="absolute -top-1 -right-1 text-[8px] bg-amber-400 text-black px-0.5 rounded font-black leading-none" title="Instant View disponible">
                          ⚡
                        </span>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ESTADO VACÍO SI NO HAY NOTICIAS TRAS FILTRAR */}
      {filteredFeed.length === 0 && (
        <div className="text-center py-12 text-slate-400 dark:text-gray-500 flex flex-col items-center justify-center gap-2">
          <Send className="w-8 h-8 opacity-30 rotate-[345deg] text-blue-500 mb-1" />
          <span className="text-xs font-black uppercase tracking-wider">No se encontraron noticias</span>
          {selectedDate && (
            <button
              onClick={() => setSelectedDate('')}
              className="mt-2 text-xs font-bold text-blue-500 hover:underline cursor-pointer"
            >
              Quitar filtro de fecha ({selectedDate})
            </button>
          )}
        </div>
      )}

      {/* MODAL DE LECTURA AMPLIADA ("PERMITA INGRESAR Y AMPLIAR LA NOTA") */}
      <AnimatePresence>
        {expandedItem && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
            <div
              onClick={(e) => e.stopPropagation()}
              className="bg-white dark:bg-[#0e111a] border border-slate-200 dark:border-white/15 rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col shadow-2xl relative animate-in zoom-in-95 duration-200"
            >
              {/* Header del Modal */}
              <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 dark:border-white/10 bg-slate-50/50 dark:bg-white/[0.02]">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs font-black uppercase tracking-wider text-blue-600 dark:text-cyan-400 font-mono">
                    • {expandedItem.sender}
                  </span>
                  <div
                    className={`px-2 py-0.5 rounded-md border text-[9px] font-black uppercase tracking-wider flex items-center gap-1 ${
                      getCategoryBadge(expandedItem.category).classes
                    }`}
                  >
                    {getCategoryBadge(expandedItem.category).icon}
                    <span>{getCategoryBadge(expandedItem.category).label}</span>
                  </div>
                  {expandedItem.isImportant && (
                    <span className="text-[9px] font-black uppercase px-2 py-0.5 bg-red-600 text-white rounded-md">
                      Alerta Oficial
                    </span>
                  )}
                </div>

                <button
                  onClick={() => setExpandedItem(null)}
                  className="p-1.5 rounded-xl bg-slate-100 dark:bg-white/10 hover:bg-slate-200 dark:hover:bg-white/20 text-slate-500 dark:text-gray-300 transition-colors cursor-pointer"
                  title="Cerrar (Esc)"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Contenido Ampliado con Scroll */}
              <div className="p-5 md:p-6 overflow-y-auto flex flex-col gap-4 scrollbar-thin">
                {/* Imagen en Alta Resolución si existe */}
                {expandedItem.thumbnail && (
                  <div className="w-full aspect-[16/9] max-h-[320px] rounded-2xl overflow-hidden bg-slate-900 border border-slate-200 dark:border-white/10 shadow-lg shrink-0">
                    <img
                      src={expandedItem.thumbnail}
                      alt={expandedItem.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}

                {/* Fecha y Hora Exacta */}
                <div className="flex items-center gap-2 text-xs font-mono text-slate-500 dark:text-gray-400">
                  <Calendar className="w-3.5 h-3.5 text-blue-500" />
                  <span>Publicado: <strong>{expandedItem.dateFormatted}</strong></span>
                  <span className="text-slate-300 dark:text-gray-600">·</span>
                  <Clock className="w-3.5 h-3.5 text-blue-500" />
                  <span>Hora: <strong>{expandedItem.formattedTime}</strong></span>
                </div>

                {/* Título Completo */}
                <h1 className="text-base sm:text-lg md:text-xl font-black text-slate-900 dark:text-white leading-snug font-display">
                  {expandedItem.title}
                </h1>

                {/* Redacción Completa */}
                <div className="text-xs sm:text-sm text-slate-700 dark:text-gray-200 leading-relaxed font-normal whitespace-pre-wrap border-t border-slate-100 dark:border-white/10 pt-4">
                  {expandedItem.content}
                </div>
              </div>

              {/* Footer del Modal con Botones Rápidos para Compartir */}
              <div className="p-4 md:px-6 bg-slate-50 dark:bg-black/40 border-t border-slate-100 dark:border-white/10 flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2 flex-wrap">
                  {/* WhatsApp */}
                  <button
                    onClick={() => handleShareWhatsApp(expandedItem)}
                    className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-2 shadow-md shadow-emerald-600/20 transition-all cursor-pointer active:scale-95"
                  >
                    <WhatsAppIcon className="w-4 h-4" />
                    <span>Compartir en WhatsApp</span>
                  </button>

                  {/* Telegram con Instant View */}
                  <button
                    onClick={() => handleShareTelegram(expandedItem)}
                    className="px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs flex items-center gap-2 shadow-md shadow-sky-600/20 transition-all cursor-pointer active:scale-95"
                    title={isValidUrl(expandedItem.link) ? "Compartir en Telegram con Vista Rápida (Instant View sin tiempos de carga)" : "Compartir en Telegram"}
                  >
                    <TelegramIcon className="w-4 h-4" />
                    <span>Compartir en Telegram</span>
                    {isValidUrl(expandedItem.link) && (
                      <span className="text-[10px] bg-white/20 text-white px-1.5 py-0.5 rounded font-black tracking-normal">
                        ⚡ Instant View
                      </span>
                    )}
                  </button>

                  {/* Enlace oficial Instant Views Explained si existe la URL */}
                  {isValidUrl(expandedItem.link) && (
                    <InstantViewExplainerBadge />
                  )}

                  {/* Copiar */}
                  <button
                    onClick={() => handleCopyMessage(expandedItem)}
                    className="px-3 py-2 rounded-xl bg-slate-200 dark:bg-white/10 hover:bg-slate-300 dark:hover:bg-white/20 text-slate-700 dark:text-gray-200 font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer"
                  >
                    {copiedId === expandedItem.id ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-500" />
                        <span>Copiado</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Copiar Mensaje</span>
                      </>
                    )}
                  </button>
                </div>

                <div className="flex items-center gap-2 ml-auto">
                  {/* Vista de lectura limpia si está disponible */}
                  {expandedItem.rawArticle && onSelectArticle && (
                    <button
                      onClick={() => {
                        onSelectArticle(expandedItem.rawArticle!);
                        setExpandedItem(null);
                      }}
                      className="px-3 py-2 rounded-xl bg-blue-500/10 hover:bg-blue-500/20 text-blue-600 dark:text-blue-400 font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer"
                    >
                      <BookOpen className="w-3.5 h-3.5" />
                      <span>Vista Lectura</span>
                    </button>
                  )}

                  {/* Enlace original */}
                  {expandedItem.link && (
                    <a
                      href={expandedItem.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-2 rounded-xl border border-slate-300 dark:border-white/15 hover:bg-slate-100 dark:hover:bg-white/5 text-slate-600 dark:text-gray-300 text-xs font-bold flex items-center gap-1.5 transition-all"
                    >
                      <span>Web Original</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
