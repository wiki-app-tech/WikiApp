'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { motion } from 'framer-motion';
import { 
  ExternalLink, 
  MessageCircle, 
  Copy, 
  Check, 
  Sparkles, 
  ChevronRight,
  ChevronDown,
  ChevronUp,
  RefreshCw,
  Radio
} from 'lucide-react';
import type { Article } from '@/types';

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

interface HomeInstagramSectionProps {
  articles: Article[];
  onViewFullFeed: () => void;
}

export default function HomeInstagramSection({ articles, onViewFullFeed }: HomeInstagramSectionProps) {
  const [liveArticles, setLiveArticles] = useState<Article[]>(articles);
  const [selectedAccount, setSelectedAccount] = useState<string>('all');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [expandedCards, setExpandedCards] = useState<Record<string, boolean>>({});
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [lastSyncTime, setLastSyncTime] = useState<Date>(new Date());

  // Actualizar si las props iniciales cambian
  useEffect(() => {
    if (articles && articles.length > 0) {
      setLiveArticles(articles);
    }
  }, [articles]);

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
        setLastSyncTime(new Date());
      }
    } catch (err) {
      console.warn('Auto-update sync warning:', err);
    } finally {
      if (!silent) setIsRefreshing(false);
    }
  }, []);

  // Intervalo de auto-actualización cada 45 segundos + listener cuando el usuario vuelve a la pestaña activa
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

  // Lista única de cuentas
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

  // Filtrado por cuenta seleccionada (máximo 6 en home para mantener fluidez)
  const displayedArticles = useMemo(() => {
    const filtered = instagramArticles.filter(art => {
      if (selectedAccount === 'all') return true;
      const uname = art.username || art.sourceId.replace('instagram-', '');
      return uname.toLowerCase() === selectedAccount.toLowerCase();
    });
    return filtered.slice(0, 6);
  }, [instagramArticles, selectedAccount]);

  const toggleExpand = (id: string) => {
    setExpandedCards(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const handleCopyLink = (url: string, id: string) => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(url);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2500);
    }
  };

  const formatPostDate = (isoStr: string) => {
    try {
      const date = new Date(isoStr);
      if (isNaN(date.getTime())) return 'Reciente';

      const diff = Date.now() - date.getTime();
      const hours = Math.floor(diff / (1000 * 60 * 60));
      if (hours < 1) return 'Hace instantes';
      if (hours === 1) return 'Hace 1 hora';
      if (hours < 24) return `Hace ${hours} horas`;
      
      const days = Math.floor(hours / 24);
      if (days === 1) return 'Ayer';
      if (days < 7) return `Hace ${days} días`;

      return date.toLocaleDateString('es-AR', {
        day: 'numeric',
        month: 'short',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return 'Reciente';
    }
  };

  const renderFormattedCaption = (text: string) => {
    if (!text) return null;
    const parts = text.split(/(#[a-zA-Z0-9_áéíóúÁÉÍÓÚñÑ]+)/g);
    return parts.map((part, index) => {
      if (part.startsWith('#')) {
        return (
          <span key={index} className="text-blue-500 dark:text-blue-400 font-semibold hover:underline cursor-pointer">
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
    <section className="w-full bg-gradient-to-b from-slate-50 to-white dark:from-[#101216] dark:to-[#0c0d10] border border-slate-200/80 dark:border-white/10 rounded-3xl p-5 md:p-7 shadow-xl space-y-6">
      {/* 1. HEADER DE LA SECCIÓN */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-4 border-b border-slate-200/80 dark:border-white/5">
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
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                En Vivo
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-gray-400 mt-0.5">
              Publicaciones destacadas y actualizadas en tiempo real de medios y organismos provinciales.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 shrink-0 w-full md:w-auto justify-end">
          <button
            onClick={() => syncInstagramFeed(false)}
            disabled={isRefreshing}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold border border-slate-200 dark:border-white/10 hover:border-rose-500/30 text-slate-700 dark:text-gray-200 bg-white dark:bg-white/5 hover:bg-rose-500/5 active:scale-95 transition-all shadow-sm"
            title="Sincronizar y verificar nuevos posteos de Instagram"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-rose-500 ${isRefreshing ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">{isRefreshing ? 'Sincronizando...' : 'Actualizar'}</span>
          </button>

          <button
            onClick={onViewFullFeed}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider bg-gradient-to-r from-rose-500 to-purple-600 hover:from-rose-600 hover:to-purple-700 text-white shadow-md shadow-rose-500/20 hover:shadow-lg transition-all group shrink-0"
          >
            <span>Ver Módulo Completo</span>
            <ChevronRight className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </div>

      {/* 2. CHIPS DE FILTRO POR CUENTA */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-hide">
        <button
          onClick={() => setSelectedAccount('all')}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 ${
            selectedAccount === 'all'
              ? 'bg-rose-500 text-white shadow-sm shadow-rose-500/30'
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
              onClick={() => setSelectedAccount(acc.username)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 border ${
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

      {/* 3. GRILLA DE TARJETAS DE INSTAGRAM EN HOME */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {displayedArticles.map((art, idx) => {
          const username = art.username || art.sourceId.replace('instagram-', '');
          const isExpanded = !!expandedCards[art.id];
          const isLongText = (art.description || '').length > 140;
          const postUrl = art.link || `https://www.instagram.com/${username}`;
          const isNewest = idx === 0 && selectedAccount === 'all';

          return (
            <motion.article
              key={art.id}
              layout
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25 }}
              className={`group flex flex-col bg-white dark:bg-[#14161b] border rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 ${
                isNewest
                  ? 'border-rose-500/50 ring-1 ring-rose-500/20 shadow-rose-500/5'
                  : 'border-slate-200/90 dark:border-white/10 hover:border-rose-500/30'
              }`}
            >
              {/* CABECERA DE LA TARJETA */}
              <div className="p-3.5 flex items-center justify-between border-b border-slate-100 dark:border-white/5 bg-slate-50/50 dark:bg-white/[0.01]">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-8 h-8 rounded-full p-[1.5px] bg-gradient-to-tr from-amber-500 via-rose-500 to-purple-600 shrink-0">
                    <div className="w-full h-full rounded-full bg-white dark:bg-[#14161b] flex items-center justify-center overflow-hidden">
                      {art.avatarUrl ? (
                        <img src={art.avatarUrl} alt={username} className="w-full h-full object-cover" />
                      ) : (
                        <InstagramIcon className="w-4 h-4 text-rose-500" />
                      )}
                    </div>
                  </div>
                  <div className="min-w-0 flex flex-col">
                    <span className="text-xs font-bold text-slate-900 dark:text-white truncate">
                      {art.sourceName}
                    </span>
                    <span className="text-[10px] font-mono text-slate-500 dark:text-gray-400 truncate">
                      @{username}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {isNewest && (
                    <span className="hidden sm:inline-flex items-center gap-1 text-[9px] font-black uppercase tracking-wider text-rose-600 dark:text-rose-400 bg-rose-500/10 border border-rose-500/20 px-2 py-0.5 rounded-full">
                      <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-ping" />
                      Más Reciente
                    </span>
                  )}
                  <span className="text-[10px] font-medium text-slate-400 dark:text-gray-500 font-mono">
                    {formatPostDate(art.pubDate)}
                  </span>
                </div>
              </div>

              {/* IMAGEN PRINCIPAL */}
              {art.thumbnail && (
                <div className="relative aspect-[4/5] w-full bg-slate-900 overflow-hidden flex items-center justify-center">
                  <img
                    src={art.thumbnail}
                    alt={art.title}
                    loading="lazy"
                    decoding="async"
                    className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
                    onError={(e) => {
                      (e.currentTarget as HTMLElement).style.display = 'none';
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-3">
                    <span className="text-[10px] font-bold text-white bg-black/50 backdrop-blur-md px-2.5 py-1 rounded-lg">
                      Publicación Original
                    </span>
                  </div>
                </div>
              )}

              {/* CONTENIDO DEL POST / COPY */}
              <div className="p-4 flex-1 flex flex-col justify-between gap-3">
                <div className="space-y-1.5">
                  <h3 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white leading-snug font-display line-clamp-2">
                    {art.title}
                  </h3>

                  {art.description && (
                    <div className="text-[11px] sm:text-xs text-slate-600 dark:text-gray-300 leading-relaxed whitespace-pre-line">
                      {isExpanded ? (
                        renderFormattedCaption(art.description)
                      ) : (
                        renderFormattedCaption(
                          isLongText 
                            ? art.description.slice(0, 130).trim() + '...' 
                            : art.description
                        )
                      )}
                    </div>
                  )}

                  {isLongText && (
                    <button
                      onClick={() => toggleExpand(art.id)}
                      className="text-[10px] font-bold text-rose-500 hover:text-rose-600 dark:text-rose-400 flex items-center gap-0.5 pt-0.5"
                    >
                      {isExpanded ? (
                        <>Mostrar menos <ChevronUp className="w-3 h-3" /></>
                      ) : (
                        <>Ver copy completo <ChevronDown className="w-3 h-3" /></>
                      )}
                    </button>
                  )}
                </div>

                {/* BOTONES DE ACCIÓN */}
                <div className="pt-2 border-t border-slate-100 dark:border-white/5 flex items-center justify-between gap-2">
                  <a
                    href={postUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-gradient-to-r from-rose-500 to-purple-600 hover:from-rose-600 hover:to-purple-700 text-white text-[11px] font-bold transition-all shadow-sm shadow-rose-500/20 active:scale-95"
                  >
                    <span>Ver en Instagram</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>

                  <button
                    onClick={() => handleCopyLink(postUrl, art.id)}
                    className="p-2 rounded-xl border border-slate-200 dark:border-white/10 hover:bg-slate-100 dark:hover:bg-white/5 text-slate-600 dark:text-gray-300 transition-colors"
                    title="Copiar enlace"
                  >
                    {copiedId === art.id ? (
                      <Check className="w-3.5 h-3.5 text-emerald-500" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                  </button>

                  <button
                    onClick={() => {
                      const shareText = `${art.title} - Publicación de @${username} en Instagram: ${postUrl}`;
                      window.open(`https://wa.me/?text=${encodeURIComponent(shareText)}`, '_blank');
                    }}
                    className="p-2 rounded-xl border border-slate-200 dark:border-white/10 hover:bg-emerald-500/10 hover:border-emerald-500/30 text-slate-600 dark:text-gray-300 hover:text-emerald-500 transition-colors"
                    title="Compartir por WhatsApp"
                  >
                    <MessageCircle className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </motion.article>
          );
        })}
      </div>

      {/* 4. FOOTER DE LA SECCIÓN CON ACCESO COMPLETO */}
      <div className="flex items-center justify-center pt-2">
        <button
          onClick={onViewFullFeed}
          className="flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-black uppercase tracking-wider text-rose-600 dark:text-rose-400 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 transition-all group"
        >
          <span>Explorar todas las publicaciones de @la_gentetv, @findelmundo.gob.ar y @justiciatdf</span>
          <ChevronRight className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" />
        </button>
      </div>
    </section>
  );
}
