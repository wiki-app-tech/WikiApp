'use client';

import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ExternalLink, 
  Copy, 
  Check, 
  Sparkles, 
  ChevronRight,
  ChevronLeft,
  RefreshCw,
  Radio,
  Play,
  Pause,
  Maximize2,
  Calendar,
  Clock,
  Columns,
  LayoutGrid,
  X,
  Share2
} from 'lucide-react';
import type { Article } from '@/types';

// Ícono SVG oficial de Instagram
export const InstagramIcon = ({ className = "w-5 h-5" }: { className?: string }) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
    <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
  </svg>
);

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

interface HomeInstagramSectionProps {
  articles: Article[];
  onViewFullFeed: () => void;
}

// Limpieza de HTML
function stripHtml(html: string = '') {
  return html.replace(/<[^>]*>/g, '').replace(/&nbsp;/g, ' ').replace(/\s+/g, ' ').trim();
}

// Helper para redacción corta (sin cortar palabras bruscamente)
function getShortContent(text: string = '', maxLength: number = 170): string {
  const clean = stripHtml(text);
  if (clean.length <= maxLength) return clean;
  return clean.slice(0, maxLength).trim() + '...';
}

// Formateo de fecha y hora exacta
function formatArticleDateTime(isoStr: string) {
  try {
    const d = new Date(isoStr);
    if (isNaN(d.getTime())) {
      return {
        dateFormatted: 'Reciente',
        friendlyDate: 'Reciente',
        formattedTime: 'En vivo'
      };
    }

    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    const dateFormatted = `${day}/${month}/${year}`;

    const hours = String(d.getHours()).padStart(2, '0');
    const minutes = String(d.getMinutes()).padStart(2, '0');
    const formattedTime = `${hours}:${minutes} hs`;

    const now = new Date();
    const isToday = d.toDateString() === now.toDateString();
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const isYesterday = d.toDateString() === yesterday.toDateString();

    let friendlyDate = `${day}/${month}`;
    if (isToday) {
      friendlyDate = `Hoy · ${day}/${month}`;
    } else if (isYesterday) {
      friendlyDate = `Ayer · ${day}/${month}`;
    } else {
      friendlyDate = `${day}/${month}/${year}`;
    }

    return {
      dateFormatted,
      friendlyDate,
      formattedTime
    };
  } catch {
    return {
      dateFormatted: 'Reciente',
      friendlyDate: 'Reciente',
      formattedTime: 'En vivo'
    };
  }
}

export default function HomeInstagramSection({ articles, onViewFullFeed }: HomeInstagramSectionProps) {
  const [liveArticles, setLiveArticles] = useState<Article[]>(articles);
  const [selectedAccount, setSelectedAccount] = useState<string>('all');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [liveToast, setLiveToast] = useState<string | null>(null);

  // Estados del Slider Lateral
  const sliderRef = useRef<HTMLDivElement>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlay, setIsAutoPlay] = useState(true);
  const [isHovered, setIsHovered] = useState(false);
  const [viewMode, setViewMode] = useState<'slider' | 'grid'>('slider');

  // Estado para la nota ampliada (Modal de lectura)
  const [expandedArticle, setExpandedArticle] = useState<Article | null>(null);

  // Actualizar si las props iniciales cambian
  useEffect(() => {
    if (articles && articles.length > 0) {
      setLiveArticles(articles);
    }
  }, [articles]);

  // Cerrar modal al presionar Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setExpandedArticle(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Sincronización automática periódica con /api/instagram
  const syncInstagramFeed = useCallback(async (silent = true) => {
    if (!silent) setIsRefreshing(true);
    try {
      const res = await fetch('/api/instagram', { cache: 'no-store' });
      if (!res.ok) throw new Error('Network error');
      const data = await res.json();
      if (data.success && Array.isArray(data.articles) && data.articles.length > 0) {
        setLiveArticles(prev => {
          const nonIg = prev.filter(
            a => a.sourceType !== 'instagram' && !a.sourceId?.startsWith('instagram-') && !a.id?.startsWith('ig-')
          );
          return [...data.articles, ...nonIg];
        });

        if (!silent) {
          setLiveToast('📸 Feed de Instagram actualizado en tiempo real');
          setTimeout(() => setLiveToast(null), 3000);
        }
      }
    } catch (err) {
      console.warn('Auto-update sync warning:', err);
    } finally {
      if (!silent) setIsRefreshing(false);
    }
  }, []);

  // Intervalo de auto-actualización cada 45 segundos
  useEffect(() => {
    const timer = setInterval(() => {
      syncInstagramFeed(true);
    }, 45000);

    const handleVisibility = () => {
      if (typeof document !== 'undefined' && document.visibilityState === 'visible') {
        syncInstagramFeed(true);
      }
    };

    if (typeof document !== 'undefined') {
      document.addEventListener('visibilitychange', handleVisibility);
    }

    return () => {
      clearInterval(timer);
      if (typeof document !== 'undefined') {
        document.removeEventListener('visibilitychange', handleVisibility);
      }
    };
  }, [syncInstagramFeed]);

  // Filtrar solo artículos de Instagram ordenados estrictamente por fecha más reciente
  const instagramArticles = useMemo(() => {
    const list = liveArticles.filter(
      a => a.sourceType === 'instagram' || (a.sourceId && a.sourceId.startsWith('instagram-')) || a.id?.startsWith('ig-')
    );
    return list.sort((a, b) => new Date(b.pubDate).getTime() - new Date(a.pubDate).getTime());
  }, [liveArticles]);

  // Lista única de cuentas disponibles para filtrar
  const accounts = useMemo(() => {
    const accMap = new Map<string, { id: string; name: string; username: string; count: number }>();
    
    instagramArticles.forEach(art => {
      const uname = art.username || art.sourceId.replace('instagram-', '');
      if (!accMap.has(uname)) {
        accMap.set(uname, {
          id: art.sourceId,
          name: art.sourceName,
          username: uname,
          count: 1
        });
      } else {
        const item = accMap.get(uname)!;
        item.count += 1;
      }
    });

    return Array.from(accMap.values());
  }, [instagramArticles]);

  // Filtrado de artículos según la cuenta seleccionada
  const filteredArticles = useMemo(() => {
    if (selectedAccount === 'all') return instagramArticles;
    return instagramArticles.filter(art => {
      const uname = art.username || art.sourceId.replace('instagram-', '');
      return uname.toLowerCase() === selectedAccount.toLowerCase();
    });
  }, [instagramArticles, selectedAccount]);

  // Lógica de desplazamiento del Slider Lateral
  const scrollToIndex = (index: number) => {
    if (!sliderRef.current) return;
    const container = sliderRef.current;
    const cards = container.querySelectorAll<HTMLElement>('[data-ig-card]');
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
    if (filteredArticles.length === 0) return;
    const next = (currentIndex + 1) % filteredArticles.length;
    scrollToIndex(next);
  };

  const handlePrev = () => {
    if (filteredArticles.length === 0) return;
    const prev = (currentIndex - 1 + filteredArticles.length) % filteredArticles.length;
    scrollToIndex(prev);
  };

  // Pase automático (Autoplay) cada 4.5 segundos
  useEffect(() => {
    if (viewMode !== 'slider' || !isAutoPlay || isHovered || filteredArticles.length <= 1) return;
    const timer = setInterval(() => {
      handleNext();
    }, 4500);
    return () => clearInterval(timer);
  }, [viewMode, isAutoPlay, isHovered, currentIndex, filteredArticles.length]);

  // Detección de índice al deslizar manualmente
  const handleSliderScroll = () => {
    if (!sliderRef.current) return;
    const container = sliderRef.current;
    const scrollLeft = container.scrollLeft;
    const cards = container.querySelectorAll<HTMLElement>('[data-ig-card]');
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

  // Formateo de mensaje para compartir (WhatsApp y Telegram)
  const getSharePayload = (art: Article) => {
    const title = art.title || 'Publicación en Redes Sociales Fueguinas';
    const shortExcerpt = getShortContent(art.description || art.title);
    const username = art.username || art.sourceId?.replace('instagram-', '') || 'instagram';
    const sourceName = art.sourceName || `@${username}`;
    const { dateFormatted, formattedTime } = formatArticleDateTime(art.pubDate);
    const postUrl = art.link || `https://www.instagram.com/${username}`;

    const whatsappText = [
      `📰 *${title}*`,
      '',
      `${shortExcerpt}`,
      '',
      `📌 *Fuente:* ${sourceName} (@${username})`,
      `🕒 *Fecha:* ${dateFormatted} · ${formattedTime}`,
      `🔗 ${postUrl}`
    ].join('\n');

    const telegramText = [
      `📰 ${title}`,
      '',
      `${shortExcerpt}`,
      '',
      `📌 Fuente: ${sourceName} (@${username}) | 🕒 ${dateFormatted} · ${formattedTime}`
    ].join('\n');

    return { whatsappText, telegramText, postUrl };
  };

  // Compartir en WhatsApp
  const handleShareWhatsApp = (art: Article, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const { whatsappText } = getSharePayload(art);
    const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(whatsappText)}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  // Compartir en Telegram
  const handleShareTelegram = (art: Article, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const { telegramText, postUrl } = getSharePayload(art);
    const url = `https://t.me/share/url?url=${encodeURIComponent(postUrl)}&text=${encodeURIComponent(telegramText)}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  // Copiar mensaje al portapapeles
  const handleCopyMessage = async (art: Article, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const { whatsappText } = getSharePayload(art);
    try {
      await navigator.clipboard.writeText(whatsappText);
      setCopiedId(art.id);
      setLiveToast('✅ Publicación copiada para enviar');
      setTimeout(() => {
        setCopiedId(null);
        setLiveToast(null);
      }, 2500);
    } catch (err) {
      console.warn('Copy error:', err);
    }
  };

  // Renderizado limpio de menciones y hashtags
  const renderFormattedCaption = (text: string) => {
    if (!text) return null;
    const parts = text.split(/(#[a-zA-Z0-9_áéíóúÁÉÍÓÚñÑ]+|@[a-zA-Z0-9_.]+)/g);
    return parts.map((part, index) => {
      if (part.startsWith('#')) {
        return (
          <span key={index} className="text-rose-500 dark:text-rose-400 font-semibold hover:underline">
            {part}
          </span>
        );
      }
      if (part.startsWith('@')) {
        return (
          <span key={index} className="text-blue-500 dark:text-blue-400 font-bold hover:underline">
            {part}
          </span>
        );
      }
      return part;
    });
  };

  if (instagramArticles.length === 0) {
    return null;
  }

  return (
    <section className="w-full bg-gradient-to-b from-slate-50 to-white dark:from-[#0d0f14] dark:to-[#08090d] border border-slate-200/80 dark:border-white/10 rounded-3xl p-5 md:p-7 shadow-xl space-y-5 relative overflow-hidden">
      {/* TOAST DE CONFIRMACIÓN EN VIVO */}
      <AnimatePresence>
        {liveToast && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            className="absolute top-4 left-1/2 -translate-x-1/2 z-50 bg-gradient-to-r from-rose-600 to-purple-600 text-white text-xs font-bold px-4 py-2 rounded-full shadow-xl flex items-center gap-2 border border-rose-400/40"
          >
            <Radio className="w-4 h-4 animate-pulse" />
            <span>{liveToast}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 1. HEADER DE LA SECCIÓN */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-slate-200/80 dark:border-white/5">
        <div className="flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-amber-500 via-rose-500 to-purple-600 p-[2px] shadow-lg shadow-rose-500/25 shrink-0">
            <div className="w-full h-full bg-white dark:bg-[#121417] rounded-[14px] flex items-center justify-center">
              <InstagramIcon className="w-5 h-5 text-rose-500" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-lg md:text-xl font-black text-slate-900 dark:text-white tracking-tight font-display">
                Redes Sociales Fueguinas
              </h2>
              <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20">
                Instagram Oficial
              </span>
              <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
                En Vivo ({filteredArticles.length})
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-gray-400 mt-0.5">
              Slider automático en tiempo real con opción de lectura ampliada y compartir por WhatsApp y Telegram.
            </p>
          </div>
        </div>

        {/* CONTROLES DEL SLIDER / GRILLA, PLAY/PAUSE Y VER MÓDULO */}
        <div className="flex flex-wrap items-center gap-2.5 shrink-0 w-full lg:w-auto justify-end">
          {/* Switch Slider / Grilla */}
          <div className="flex items-center bg-slate-100 dark:bg-white/5 p-0.5 rounded-xl border border-slate-200 dark:border-white/10 text-xs">
            <button
              onClick={() => setViewMode('slider')}
              className={`px-2.5 py-1.5 rounded-lg flex items-center gap-1.5 font-bold transition-all cursor-pointer ${
                viewMode === 'slider'
                  ? 'bg-rose-500 text-white shadow-sm'
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
                  ? 'bg-rose-500 text-white shadow-sm'
                  : 'text-slate-600 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white'
              }`}
              title="Vista de Mosaico"
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
                title="Publicación anterior"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={handleNext}
                className="p-1.5 rounded-lg text-slate-600 dark:text-gray-300 hover:bg-slate-200 dark:hover:bg-white/10 transition-all cursor-pointer"
                title="Publicación siguiente"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Sincronización Manual */}
          <button
            onClick={() => syncInstagramFeed(false)}
            disabled={isRefreshing}
            className="p-2 rounded-xl text-xs font-bold border border-slate-200 dark:border-white/10 hover:border-rose-500/30 text-slate-700 dark:text-gray-200 bg-white dark:bg-white/5 hover:bg-rose-500/5 active:scale-95 transition-all shadow-sm"
            title="Sincronizar y verificar nuevos posteos de Instagram"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-rose-500 ${isRefreshing ? 'animate-spin' : ''}`} />
          </button>

          {/* Botón Módulo Completo */}
          <button
            onClick={onViewFullFeed}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-black uppercase tracking-wider bg-gradient-to-r from-rose-500 to-purple-600 hover:from-rose-600 hover:to-purple-700 text-white shadow-md shadow-rose-500/20 hover:shadow-lg transition-all group shrink-0"
          >
            <span className="hidden sm:inline">Ver Módulo Completo</span>
            <span className="sm:hidden">Ver Módulo</span>
            <ChevronRight className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </div>

      {/* 2. CHIPS DE FILTRO POR CUENTA */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-hide">
        <button
          onClick={() => {
            setSelectedAccount('all');
            setCurrentIndex(0);
            scrollToIndex(0);
          }}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 cursor-pointer ${
            selectedAccount === 'all'
              ? 'bg-gradient-to-r from-rose-500 to-purple-600 text-white shadow-sm shadow-rose-500/30'
              : 'bg-white dark:bg-white/5 text-slate-600 dark:text-gray-400 border border-slate-200 dark:border-white/5 hover:border-slate-300 dark:hover:border-white/20'
          }`}
        >
          <Sparkles className="w-3 h-3" />
          <span>Todas</span>
          <span className="px-1.5 py-0.2 rounded-full bg-black/20 text-[10px]">
            {instagramArticles.length}
          </span>
        </button>

        {accounts.map(acc => {
          const isActive = selectedAccount.toLowerCase() === acc.username.toLowerCase();
          return (
            <button
              key={acc.username}
              onClick={() => {
                setSelectedAccount(acc.username);
                setCurrentIndex(0);
                scrollToIndex(0);
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 border cursor-pointer ${
                isActive
                  ? 'bg-rose-500/10 border-rose-500/40 text-rose-600 dark:text-rose-400 shadow-sm'
                  : 'bg-white dark:bg-white/5 border-slate-200 dark:border-white/5 text-slate-600 dark:text-gray-400 hover:border-slate-300 dark:hover:border-white/20'
              }`}
            >
              <div className="w-2 h-2 rounded-full bg-gradient-to-r from-amber-500 to-rose-500" />
              <span>@{acc.username}</span>
              <span className="text-[10px] opacity-70">({acc.count})</span>
            </button>
          );
        })}
      </div>

      {/* 3. VISOR: SLIDER LATERAL AUTOMÁTICO O GRILLA */}
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
            {filteredArticles.map((art, idx) => {
              const username = art.username || art.sourceId?.replace('instagram-', '') || 'instagram';
              const { dateFormatted, friendlyDate, formattedTime } = formatArticleDateTime(art.pubDate);
              const shortExcerpt = getShortContent(art.description || art.title);
              const isNewest = idx === 0 && selectedAccount === 'all';

              return (
                <div
                  key={art.id}
                  data-ig-card
                  onClick={() => setExpandedArticle(art)}
                  className={`snap-start shrink-0 w-[295px] sm:w-[350px] md:w-[380px] bg-white dark:bg-[#12141a]/95 border rounded-2xl p-4 flex flex-col justify-between gap-3 shadow-md hover:shadow-2xl transition-all duration-300 cursor-pointer relative group/card ${
                    isNewest
                      ? 'border-rose-500/50 shadow-rose-500/5'
                      : 'border-slate-200/90 dark:border-white/10 hover:border-rose-500/35'
                  }`}
                >
                  {/* CABECERA DE LA TARJETA: FUENTE CON BADGE + FECHA Y HORA */}
                  <div className="flex items-center justify-between gap-2 border-b border-slate-100 dark:border-white/5 pb-2.5">
                    <div className="flex items-center gap-2 min-w-0">
                      <div className="w-7 h-7 rounded-full p-[1.5px] bg-gradient-to-tr from-amber-500 via-rose-500 to-purple-600 shrink-0">
                        <div className="w-full h-full rounded-full bg-white dark:bg-[#14161b] flex items-center justify-center overflow-hidden">
                          {art.avatarUrl ? (
                            <img src={art.avatarUrl} alt={username} className="w-full h-full object-cover" />
                          ) : (
                            <InstagramIcon className="w-3.5 h-3.5 text-rose-500" />
                          )}
                        </div>
                      </div>
                      <div className="min-w-0 flex flex-col">
                        <span className="text-xs font-bold text-slate-900 dark:text-white truncate">
                          • {art.sourceName}
                        </span>
                        <span className="text-[10px] font-mono text-slate-500 dark:text-gray-400 truncate">
                          @{username}
                        </span>
                      </div>
                    </div>

                    <div className="flex flex-col items-end shrink-0 text-[10px] font-mono">
                      <div className="flex items-center gap-1 text-slate-500 dark:text-gray-400 font-medium">
                        <Clock className="w-3 h-3 text-rose-500/80" />
                        <span>{friendlyDate}</span>
                      </div>
                      <span className="text-slate-800 dark:text-gray-300 font-bold">{formattedTime}</span>
                    </div>
                  </div>

                  {/* IMAGEN / MINIATURA 16:9 CON HOVER ZOOM */}
                  <div className="w-full aspect-[16/9] rounded-xl overflow-hidden bg-slate-900 relative border border-slate-200/60 dark:border-white/5 shrink-0 shadow-inner">
                    {art.thumbnail ? (
                      <img
                        src={art.thumbnail}
                        alt={art.title}
                        className="w-full h-full object-cover group-hover/card:scale-105 transition-transform duration-500"
                        loading="lazy"
                        onError={(e) => {
                          (e.currentTarget as HTMLElement).style.display = 'none';
                        }}
                      />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-slate-900 to-rose-950 text-slate-400 gap-2 p-3 text-center">
                        <InstagramIcon className="w-8 h-8 text-rose-500/40" />
                        <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400">
                          @{username}
                        </span>
                      </div>
                    )}

                    {/* Badge flotante "Más reciente" */}
                    {isNewest && (
                      <div className="absolute top-2.5 left-2.5 z-10">
                        <span className="px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-wider text-white bg-gradient-to-r from-rose-600 to-purple-600 shadow-md flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping" />
                          Más Reciente
                        </span>
                      </div>
                    )}

                    {/* Botón flotante para Ampliar al hacer hover */}
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/card:opacity-100 transition-opacity flex items-center justify-center gap-2">
                      <span className="px-3 py-1.5 rounded-full bg-rose-600 text-white text-[11px] font-bold flex items-center gap-1.5 shadow-lg transform translate-y-2 group-hover/card:translate-y-0 transition-all">
                        <Maximize2 className="w-3.5 h-3.5" /> Ampliar Nota
                      </span>
                    </div>
                  </div>

                  {/* CUERPO: TÍTULO Y REDACCIÓN CORTA */}
                  <div className="flex flex-col gap-1.5 flex-1">
                    <h3 className="text-xs sm:text-sm font-black text-slate-900 dark:text-white leading-snug line-clamp-2 font-display group-hover/card:text-rose-500 dark:group-hover/card:text-rose-400 transition-colors">
                      {art.title}
                    </h3>
                    <p className="text-[11px] sm:text-xs text-slate-600 dark:text-gray-300 line-clamp-3 leading-relaxed font-normal">
                      {shortExcerpt}
                    </p>
                  </div>

                  {/* FOOTER: BOTÓN DE AMPLIAR + BOTONES RÁPIDOS DE WHATSAPP Y TELEGRAM */}
                  <div className="pt-2.5 border-t border-slate-200/70 dark:border-white/5 flex items-center justify-between gap-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setExpandedArticle(art);
                      }}
                      className="flex items-center gap-1.5 text-[11px] font-bold text-rose-600 dark:text-rose-400 hover:text-rose-700 dark:hover:text-rose-300 transition-colors cursor-pointer"
                    >
                      <Maximize2 className="w-3.5 h-3.5" />
                      <span>Ampliar</span>
                    </button>

                    <div className="flex items-center gap-1.5">
                      {/* Compartir WhatsApp */}
                      <button
                        onClick={(e) => handleShareWhatsApp(art, e)}
                        className="px-2.5 py-1 rounded-lg bg-emerald-500/10 hover:bg-emerald-500 text-emerald-600 dark:text-emerald-400 hover:text-white border border-emerald-500/25 transition-all text-[10px] font-bold flex items-center gap-1 cursor-pointer shadow-sm"
                        title="Compartir noticia en WhatsApp"
                      >
                        <WhatsAppIcon className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline">WhatsApp</span>
                      </button>

                      {/* Compartir Telegram */}
                      <button
                        onClick={(e) => handleShareTelegram(art, e)}
                        className="px-2.5 py-1 rounded-lg bg-sky-500/10 hover:bg-sky-500 text-sky-600 dark:text-sky-400 hover:text-white border border-sky-500/25 transition-all text-[10px] font-bold flex items-center gap-1 cursor-pointer shadow-sm"
                        title="Compartir noticia en Telegram"
                      >
                        <TelegramIcon className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline">Telegram</span>
                      </button>

                      {/* Copiar Mensaje */}
                      <button
                        onClick={(e) => handleCopyMessage(art, e)}
                        className="p-1 rounded-lg bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 text-slate-500 hover:text-slate-900 dark:hover:text-white border border-slate-200 dark:border-white/10 transition-all cursor-pointer"
                        title="Copiar texto de la noticia"
                      >
                        {copiedId === art.id ? (
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
                Posteo {currentIndex + 1} de {filteredArticles.length}
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

            {/* Barra de progreso */}
            <div className="hidden sm:flex items-center gap-1 w-32 bg-slate-200 dark:bg-white/10 h-1.5 rounded-full overflow-hidden">
              <div
                className="bg-gradient-to-r from-rose-500 to-purple-600 h-full rounded-full transition-all duration-300"
                style={{
                  width: `${Math.min(100, ((currentIndex + 1) / Math.max(1, filteredArticles.length)) * 100)}%`
                }}
              />
            </div>
          </div>
        </div>
      ) : (
        /* VISTA DE GRILLA / MOSAICO ALTERNATIVA */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredArticles.map((art) => {
            const username = art.username || art.sourceId?.replace('instagram-', '') || 'instagram';
            const { dateFormatted, formattedTime } = formatArticleDateTime(art.pubDate);
            const shortExcerpt = getShortContent(art.description || art.title);

            return (
              <div
                key={art.id}
                onClick={() => setExpandedArticle(art)}
                className="bg-white dark:bg-[#12141a]/95 border border-slate-200/90 dark:border-white/10 hover:border-rose-500/35 rounded-2xl p-4 flex flex-col justify-between gap-3 shadow-md hover:shadow-xl transition-all cursor-pointer group"
              >
                {art.thumbnail && (
                  <div className="w-full aspect-[16/9] rounded-xl overflow-hidden bg-slate-900 relative">
                    <img
                      src={art.thumbnail}
                      alt={art.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute top-2 left-2 px-2 py-0.5 rounded-md border text-[9px] font-black uppercase tracking-wider backdrop-blur-md flex items-center gap-1 bg-black/60 text-white border-white/20">
                      <span>@{username}</span>
                    </div>
                  </div>
                )}

                <div className="flex flex-col gap-1.5 flex-1">
                  <div className="flex items-center justify-between text-[10px] font-mono text-slate-500">
                    <span className="font-bold text-rose-500 truncate">• {art.sourceName}</span>
                    <span>{dateFormatted} · {formattedTime}</span>
                  </div>
                  <h3 className="text-xs sm:text-sm font-black text-slate-900 dark:text-white line-clamp-2 font-display">
                    {art.title}
                  </h3>
                  <p className="text-[11px] text-slate-600 dark:text-gray-300 line-clamp-3 leading-relaxed">
                    {shortExcerpt}
                  </p>
                </div>

                <div className="pt-2 border-t border-slate-100 dark:border-white/5 flex items-center justify-between gap-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setExpandedArticle(art);
                    }}
                    className="text-[11px] font-bold text-rose-500 flex items-center gap-1"
                  >
                    <Maximize2 className="w-3.5 h-3.5" /> Ampliar
                  </button>
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={(e) => handleShareWhatsApp(art, e)}
                      className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500 hover:text-white transition-colors"
                      title="WhatsApp"
                    >
                      <WhatsAppIcon className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={(e) => handleShareTelegram(art, e)}
                      className="p-1.5 rounded-lg bg-sky-500/10 text-sky-500 hover:bg-sky-500 hover:text-white transition-colors"
                      title="Telegram"
                    >
                      <TelegramIcon className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* 4. MODAL DE LECTURA AMPLIADA ("PERMITA INGRESAR Y AMPLIAR LA NOTA") */}
      <AnimatePresence>
        {expandedArticle && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
            <div
              onClick={(e) => e.stopPropagation()}
              className="bg-white dark:bg-[#0e111a] border border-slate-200 dark:border-white/15 rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col shadow-2xl relative animate-in zoom-in-95 duration-200"
            >
              {/* Header del Modal */}
              <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 dark:border-white/10 bg-slate-50/50 dark:bg-white/[0.02]">
                <div className="flex items-center gap-2.5 flex-wrap">
                  <div className="w-7 h-7 rounded-full p-[1.5px] bg-gradient-to-tr from-amber-500 via-rose-500 to-purple-600 shrink-0">
                    <div className="w-full h-full rounded-full bg-white dark:bg-[#14161b] flex items-center justify-center overflow-hidden">
                      {expandedArticle.avatarUrl ? (
                        <img src={expandedArticle.avatarUrl} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <InstagramIcon className="w-3.5 h-3.5 text-rose-500" />
                      )}
                    </div>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-xs font-black uppercase tracking-wider text-rose-500 font-mono">
                      • {expandedArticle.sourceName}
                    </span>
                    <span className="text-[10px] font-mono text-slate-500 dark:text-gray-400">
                      @{expandedArticle.username || expandedArticle.sourceId?.replace('instagram-', '')}
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => setExpandedArticle(null)}
                  className="p-1.5 rounded-xl bg-slate-100 dark:bg-white/10 hover:bg-slate-200 dark:hover:bg-white/20 text-slate-500 dark:text-gray-300 transition-colors cursor-pointer"
                  title="Cerrar (Esc)"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Contenido Ampliado con Scroll */}
              <div className="p-5 md:p-6 overflow-y-auto flex flex-col gap-4 scrollbar-thin">
                {/* Imagen en Alta Resolución si existe */}
                {expandedArticle.thumbnail && (
                  <div className="w-full aspect-[16/9] max-h-[320px] rounded-2xl overflow-hidden bg-slate-900 border border-slate-200 dark:border-white/10 shadow-lg shrink-0">
                    <img
                      src={expandedArticle.thumbnail}
                      alt={expandedArticle.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}

                {/* Fecha y Hora Exacta */}
                <div className="flex items-center gap-2 text-xs font-mono text-slate-500 dark:text-gray-400">
                  <Calendar className="w-3.5 h-3.5 text-rose-500" />
                  <span>Publicado: <strong>{formatArticleDateTime(expandedArticle.pubDate).dateFormatted}</strong></span>
                  <span className="text-slate-300 dark:text-gray-600">·</span>
                  <Clock className="w-3.5 h-3.5 text-rose-500" />
                  <span>Hora: <strong>{formatArticleDateTime(expandedArticle.pubDate).formattedTime}</strong></span>
                </div>

                {/* Título Completo */}
                <h1 className="text-base sm:text-lg md:text-xl font-black text-slate-900 dark:text-white leading-snug font-display">
                  {expandedArticle.title}
                </h1>

                {/* Redacción Completa */}
                <div className="text-xs sm:text-sm text-slate-700 dark:text-gray-200 leading-relaxed font-normal whitespace-pre-wrap border-t border-slate-100 dark:border-white/10 pt-4">
                  {renderFormattedCaption(expandedArticle.description || expandedArticle.title)}
                </div>
              </div>

              {/* Footer del Modal con Botones Rápidos para Compartir */}
              <div className="p-4 md:px-6 bg-slate-50 dark:bg-black/40 border-t border-slate-100 dark:border-white/10 flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2 flex-wrap">
                  {/* WhatsApp */}
                  <button
                    onClick={() => handleShareWhatsApp(expandedArticle)}
                    className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-2 shadow-md shadow-emerald-600/20 transition-all cursor-pointer active:scale-95"
                  >
                    <WhatsAppIcon className="w-4 h-4" />
                    <span>Compartir en WhatsApp</span>
                  </button>

                  {/* Telegram */}
                  <button
                    onClick={() => handleShareTelegram(expandedArticle)}
                    className="px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs flex items-center gap-2 shadow-md shadow-sky-600/20 transition-all cursor-pointer active:scale-95"
                  >
                    <TelegramIcon className="w-4 h-4" />
                    <span>Compartir en Telegram</span>
                  </button>

                  {/* Copiar */}
                  <button
                    onClick={() => handleCopyMessage(expandedArticle)}
                    className="px-3 py-2 rounded-xl bg-slate-200 dark:bg-white/10 hover:bg-slate-300 dark:hover:bg-white/20 text-slate-700 dark:text-gray-200 font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer"
                  >
                    {copiedId === expandedArticle.id ? (
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
                  {/* Enlace original en Instagram */}
                  <a
                    href={expandedArticle.link || `https://www.instagram.com/${expandedArticle.username || ''}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-rose-500 to-purple-600 text-white text-xs font-bold flex items-center gap-1.5 shadow-md shadow-rose-500/20 transition-all"
                  >
                    <span>Ver en Instagram</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>
            </div>
          </div>
        )}
      </AnimatePresence>
    </section>
  );
}
