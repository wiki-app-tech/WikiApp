'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ExternalLink, 
  Search, 
  Share2, 
  MessageCircle, 
  Copy, 
  Check, 
  Sparkles, 
  Info, 
  PlusCircle, 
  X, 
  ChevronDown, 
  ChevronUp,
  RefreshCw,
  Send,
  CheckCircle2
} from 'lucide-react';
import type { Article, FeedSource } from '@/types';

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

interface InstagramFeedProps {
  articles: Article[];
  feeds?: FeedSource[];
}

export default function InstagramFeed({ articles, feeds = [] }: InstagramFeedProps) {
  const [liveArticles, setLiveArticles] = useState<Article[]>(articles);
  const [selectedAccount, setSelectedAccount] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [showAddModal, setShowAddModal] = useState<boolean>(false);
  const [expandedCards, setExpandedCards] = useState<Record<string, boolean>>({});
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [lastSyncTime, setLastSyncTime] = useState<Date>(new Date());

  // Formulario para publicar nuevo post al instante
  const [postAccount, setPostAccount] = useState<string>('la_gentetv');
  const [postTitle, setPostTitle] = useState<string>('');
  const [postDescription, setPostDescription] = useState<string>('');
  const [postThumbnail, setPostThumbnail] = useState<string>('');
  const [isSubmittingPost, setIsSubmittingPost] = useState<boolean>(false);
  const [postSuccessMsg, setPostSuccessMsg] = useState<string | null>(null);

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

  // Sincronización inmediata al montar
  useEffect(() => {
    syncInstagramFeed(true);
  }, [syncInstagramFeed]);

  // Intervalo de auto-actualización cada 20 segundos + listener cuando el usuario vuelve a la pestaña
  useEffect(() => {
    const timer = setInterval(() => {
      syncInstagramFeed(true);
    }, 20000);

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

  const handlePublishNewPost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!postTitle.trim()) return;

    setIsSubmittingPost(true);
    setPostSuccessMsg(null);

    try {
      const res = await fetch('/api/instagram', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: postAccount,
          title: postTitle.trim(),
          description: postDescription.trim() || postTitle.trim(),
          thumbnail: postThumbnail.trim() || undefined,
          pubDate: new Date().toISOString()
        })
      });

      const data = await res.json();
      if (data.success && data.article) {
        setLiveArticles(prev => [data.article, ...prev]);
        setPostSuccessMsg(`¡Publicación de @${postAccount} actualizada y visible al instante!`);
        setPostTitle('');
        setPostDescription('');
        setPostThumbnail('');
        setTimeout(() => {
          setShowAddModal(false);
          setPostSuccessMsg(null);
        }, 1800);
      }
    } catch (err: any) {
      console.error('Error publishing instagram post:', err);
    } finally {
      setIsSubmittingPost(false);
    }
  };

  // Filtrar solo artículos provenientes de Instagram ordenados por fecha más reciente
  const instagramArticles = useMemo(() => {
    const list = liveArticles.filter(
      a => a.sourceType === 'instagram' || a.sourceId?.startsWith('instagram-') || a.id?.startsWith('ig-')
    );
    return list.sort((a, b) => new Date(b.pubDate).getTime() - new Date(a.pubDate).getTime());
  }, [liveArticles]);

  // Lista única de cuentas disponibles para las pestañas de filtro
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

  // Artículos filtrados por búsqueda y por cuenta
  const filteredArticles = useMemo(() => {
    return instagramArticles.filter(art => {
      const uname = art.username || art.sourceId.replace('instagram-', '');
      const matchesAccount = selectedAccount === 'all' || uname.toLowerCase() === selectedAccount.toLowerCase();
      
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch = !q || 
        art.title.toLowerCase().includes(q) || 
        art.description.toLowerCase().includes(q) ||
        uname.toLowerCase().includes(q) ||
        art.sourceName.toLowerCase().includes(q);

      return matchesAccount && matchesSearch;
    });
  }, [instagramArticles, selectedAccount, searchQuery]);

  const toggleExpand = (id: string) => {
    setExpandedCards(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const handleCopyLink = (url: string, id: string) => {
    if (navigator.clipboard) {
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

  // Resalta hashtags en el texto con estilo distintivo
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

  return (
    <div className="w-full flex flex-col gap-6 pb-12 animate-fadeIn">
      {/* 1. HEADER PRINCIPAL */}
      <header className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 bg-white/70 dark:bg-[#121214]/80 backdrop-blur-xl border border-slate-200/80 dark:border-white/10 rounded-3xl p-6 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-500 via-rose-500 to-purple-600 p-[2px] shadow-lg shadow-rose-500/20 shrink-0">
            <div className="w-full h-full bg-white dark:bg-[#121214] rounded-[14px] flex items-center justify-center">
              <InstagramIcon className="w-6 h-6 text-rose-500" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight font-display">
                Redes Sociales & Cuentas Públicas
              </h1>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20">
                Instagram RSS
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-gray-400 mt-1">
              Publicaciones oficiales en tiempo real de medios, turismo y justicia de Tierra del Fuego.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 w-full md:w-auto justify-end flex-wrap">
          <div className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 text-xs font-bold shadow-sm">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="hidden sm:inline">Auto-actualización (45s)</span>
            <span className="sm:hidden">En Vivo</span>
          </div>

          <button
            onClick={() => syncInstagramFeed(false)}
            disabled={isRefreshing}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold border border-slate-200 dark:border-white/10 hover:border-rose-500/30 text-slate-700 dark:text-gray-200 bg-white dark:bg-white/5 hover:bg-rose-500/5 active:scale-95 transition-all shadow-sm"
            title="Sincronizar y verificar nuevos posteos de Instagram"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-rose-500 ${isRefreshing ? 'animate-spin' : ''}`} />
            <span>{isRefreshing ? 'Sincronizando...' : 'Actualizar'}</span>
          </button>

          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold bg-slate-900 text-white dark:bg-white dark:text-slate-900 hover:opacity-90 active:scale-95 transition-all shadow-sm"
          >
            <PlusCircle className="w-4 h-4 text-rose-500" />
            <span>Publicar / Sincronizar</span>
          </button>
        </div>
      </header>

      {/* 2. BARRA DE HERRAMIENTAS: FILTRO DE CUENTAS + BUSCADOR */}
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
        {/* Chips de cuentas */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 lg:pb-0 scrollbar-hide">
          <button
            onClick={() => setSelectedAccount('all')}
            className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-2 ${
              selectedAccount === 'all'
                ? 'bg-gradient-to-r from-rose-500 to-purple-600 text-white shadow-md shadow-rose-500/20'
                : 'bg-white dark:bg-[#141416] text-slate-600 dark:text-gray-400 border border-slate-200 dark:border-white/5 hover:border-slate-300 dark:hover:border-white/20'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Todas las Cuentas</span>
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
                className={`px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-2 border ${
                  isActive
                    ? 'bg-rose-500/10 border-rose-500/40 text-rose-600 dark:text-rose-400 shadow-sm'
                    : 'bg-white dark:bg-[#141416] border-slate-200 dark:border-white/5 text-slate-600 dark:text-gray-400 hover:border-slate-300 dark:hover:border-white/20'
                }`}
              >
                <div className="w-2 h-2 rounded-full bg-gradient-to-r from-amber-500 to-rose-500" />
                <span>@{acc.username}</span>
                <span className="text-[10px] opacity-70">({acc.count})</span>
              </button>
            );
          })}
        </div>

        {/* Buscador */}
        <div className="relative w-full lg:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Buscar en publicaciones..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-xl text-xs bg-white dark:bg-[#141416] border border-slate-200 dark:border-white/10 text-slate-800 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-rose-500/40 transition-all"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-white text-xs"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* 3. GRILLA DE TARJETAS DE INSTAGRAM */}
      {filteredArticles.length === 0 ? (
        <div className="w-full min-h-[320px] flex flex-col items-center justify-center p-8 bg-white/50 dark:bg-[#121214]/40 rounded-3xl border border-dashed border-slate-300 dark:border-white/10 text-center">
          <InstagramIcon className="w-12 h-12 text-slate-300 dark:text-gray-600 mb-3" />
          <h3 className="text-base font-bold text-slate-700 dark:text-gray-300">
            No se encontraron publicaciones
          </h3>
          <p className="text-xs text-slate-400 dark:text-gray-500 max-w-sm mt-1">
            Intenta cambiar el término de búsqueda o selecciona otra cuenta en la barra superior.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredArticles.map((art, idx) => {
            const username = art.username || art.sourceId.replace('instagram-', '');
            const isExpanded = !!expandedCards[art.id];
            const isLongText = (art.description || '').length > 150;
            const postUrl = art.link || `https://www.instagram.com/${username}`;
            const isNewest = idx === 0 && selectedAccount === 'all' && !searchQuery;

            return (
              <motion.article
                key={art.id}
                layout
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className={`group flex flex-col bg-white dark:bg-[#141416] border rounded-3xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 ${
                  isNewest
                    ? 'border-rose-500/60 ring-2 ring-rose-500/20 shadow-rose-500/10'
                    : 'border-slate-200/90 dark:border-white/10 hover:border-slate-300 dark:hover:border-white/20'
                }`}
              >
                {/* CABECERA DE LA TARJETA */}
                <div className="p-4 flex items-center justify-between border-b border-slate-100 dark:border-white/5 bg-slate-50/50 dark:bg-white/[0.01]">
                  <div className="flex items-center gap-3 min-w-0">
                    {/* Ring degradado característico de Instagram */}
                    <div className="w-10 h-10 rounded-full p-[2px] bg-gradient-to-tr from-amber-500 via-rose-500 to-purple-600 shrink-0 shadow-sm">
                      <div className="w-full h-full rounded-full bg-white dark:bg-[#141416] flex items-center justify-center overflow-hidden">
                        {art.avatarUrl ? (
                          <img src={art.avatarUrl} alt={username} className="w-full h-full object-cover" />
                        ) : (
                          <InstagramIcon className="w-5 h-5 text-rose-500" />
                        )}
                      </div>
                    </div>

                    <div className="min-w-0 flex flex-col">
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-bold text-slate-900 dark:text-white truncate">
                          {art.sourceName}
                        </span>
                        {art.sourceCategory && (
                          <span className="px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider bg-slate-100 dark:bg-white/10 text-slate-600 dark:text-gray-300">
                            {art.sourceCategory}
                          </span>
                        )}
                      </div>
                      <span className="text-[11px] font-mono text-slate-500 dark:text-gray-400 truncate">
                        @{username}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {isNewest && (
                      <span className="hidden sm:inline-flex items-center gap-1 text-[9px] font-black uppercase tracking-wider text-rose-600 dark:text-rose-400 bg-rose-500/10 border border-rose-500/20 px-2 py-0.5 rounded-full">
                        <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-ping" />
                        Más Reciente
                      </span>
                    )}
                    <span className="text-[11px] text-slate-400 dark:text-gray-500 font-mono shrink-0">
                      {formatPostDate(art.pubDate)}
                    </span>
                    <a
                      href={`https://www.instagram.com/${username}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-1.5 text-slate-400 hover:text-rose-500 dark:hover:text-rose-400 rounded-lg transition-colors"
                      title={`Ver perfil de @${username}`}
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>
                </div>

                {/* IMAGEN DE LA PUBLICACIÓN */}
                <div className="relative aspect-[4/5] w-full bg-slate-900 overflow-hidden flex items-center justify-center">
                  {art.thumbnail ? (
                    <img
                      src={art.thumbnail}
                      alt={art.title || `Publicación de @${username}`}
                      loading="lazy"
                      className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
                      onError={(e) => {
                        // Fallback estético si la URL de Instagram caduca
                        (e.target as HTMLElement).style.display = 'none';
                      }}
                    />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center p-6 bg-gradient-to-br from-rose-950/20 via-purple-950/20 to-slate-950/20 text-slate-400 dark:text-gray-500">
                      <InstagramIcon className="w-12 h-12 mb-2 text-rose-500/40" />
                      <span className="text-xs font-bold uppercase tracking-wider">Publicación Oficial</span>
                    </div>
                  )}

                  <div className="absolute top-3 right-3">
                    <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-black/60 text-white backdrop-blur border border-white/15 flex items-center gap-1">
                      <InstagramIcon className="w-3 h-3 text-rose-400" />
                      <span>Post</span>
                    </span>
                  </div>
                </div>

                {/* COPY / TEXTO DE LA PUBLICACIÓN */}
                <div className="p-4 flex-1 flex flex-col justify-between gap-4">
                  <div className="space-y-2">
                    {/* Titular o extracto principal */}
                    {art.title && !art.title.startsWith('@') && (
                      <h4 className="text-sm font-black text-slate-900 dark:text-white leading-snug font-display">
                        {art.title}
                      </h4>
                    )}

                    {/* Copy con soporte para Ver Más / Ver Menos */}
                    <div className="text-xs text-slate-700 dark:text-gray-300 leading-relaxed whitespace-pre-line font-normal">
                      {isExpanded || !isLongText ? (
                        renderFormattedCaption(art.description)
                      ) : (
                        renderFormattedCaption(`${art.description.slice(0, 140)}...`)
                      )}
                    </div>

                    {isLongText && (
                      <button
                        onClick={() => toggleExpand(art.id)}
                        className="text-[11px] font-bold text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 flex items-center gap-1 transition-colors"
                      >
                        {isExpanded ? (
                          <>
                            <span>Mostrar menos</span>
                            <ChevronUp className="w-3 h-3" />
                          </>
                        ) : (
                          <>
                            <span>Ver texto completo</span>
                            <ChevronDown className="w-3 h-3" />
                          </>
                        )}
                      </button>
                    )}
                  </div>

                  {/* PIE DE LA TARJETA: BOTÓN DE REDIRECCIÓN A INSTAGRAM & ACCIONES */}
                  <div className="pt-3 border-t border-slate-100 dark:border-white/5 flex items-center justify-between gap-2">
                    {/* Compartir / Copiar */}
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleCopyLink(postUrl, art.id)}
                        className="p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5 transition-colors"
                        title="Copiar enlace del post"
                      >
                        {copiedId === art.id ? (
                          <Check className="w-3.5 h-3.5 text-emerald-500" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                      </button>
                      <button
                        onClick={() => {
                          const waText = `Mirá este post de @${username} en Instagram: ${postUrl}`;
                          window.open(`https://wa.me/?text=${encodeURIComponent(waText)}`, '_blank');
                        }}
                        className="p-2 rounded-xl text-slate-400 hover:text-emerald-500 hover:bg-slate-100 dark:hover:bg-white/5 transition-colors"
                        title="Compartir en WhatsApp"
                      >
                        <MessageCircle className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {/* Botón Principal: Ver en Instagram */}
                    <a
                      href={postUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider bg-gradient-to-r from-amber-500 via-rose-500 to-purple-600 text-white shadow-md shadow-rose-500/20 hover:opacity-90 active:scale-95 transition-all"
                    >
                      <InstagramIcon className="w-3.5 h-3.5" />
                      <span>Ver en Instagram</span>
                      <ExternalLink className="w-3 h-3 opacity-80" />
                    </a>
                  </div>
                </div>
              </motion.article>
            );
          })}
        </div>
      )}

      {/* 4. MODAL / PUBLICAR O AGREGAR CUENTAS PÚBLICAS */}
      <AnimatePresence>
        {showAddModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
            <div 
              className="fixed inset-0"
              onClick={() => setShowAddModal(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-xl bg-white dark:bg-[#141416] border border-slate-200 dark:border-white/10 rounded-3xl p-6 shadow-2xl z-10 space-y-5"
            >
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-white/5 pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-500 via-rose-500 to-purple-600 p-[2px] shadow-sm">
                    <div className="w-full h-full bg-white dark:bg-[#141416] rounded-[14px] flex items-center justify-center">
                      <InstagramIcon className="w-5 h-5 text-rose-500" />
                    </div>
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-900 dark:text-white">
                      Actualización de Instagram en Vivo
                    </h3>
                    <p className="text-[11px] text-slate-500 dark:text-gray-400">
                      Publicá un posteo al instante o configurá nuevas cuentas públicas.
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setShowAddModal(false)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {postSuccessMsg ? (
                <div className="p-6 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl flex flex-col items-center justify-center text-center gap-2">
                  <CheckCircle2 className="w-10 h-10 text-emerald-500 animate-bounce" />
                  <h4 className="text-sm font-bold text-emerald-600 dark:text-emerald-400">
                    {postSuccessMsg}
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-gray-400">
                    El post ya está colocado en la primera posición de la grilla.
                  </p>
                </div>
              ) : (
                <form onSubmit={handlePublishNewPost} className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700 dark:text-gray-300">
                      Cuenta emisora
                    </label>
                    <select
                      value={postAccount}
                      onChange={(e) => setPostAccount(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl text-xs bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-rose-500/40"
                    >
                      <option value="la_gentetv">@la_gentetv (La Gente TV)</option>
                      <option value="findelmundo.gob.ar">@findelmundo.gob.ar (Gobierno TDF)</option>
                      <option value="justiciatdf">@justiciatdf (Poder Judicial TDF)</option>
                      <option value="informatetdf">@informatetdf (InforMate TDF)</option>
                      <option value="sumemostolhuin">@sumemostolhuin (Sumemos Tolhuin)</option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700 dark:text-gray-300">
                      Titular o extracto principal
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Ej: Nuevo operativo de seguridad vial en Ruta 3"
                      value={postTitle}
                      onChange={(e) => setPostTitle(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl text-xs bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-800 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-rose-500/40"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700 dark:text-gray-300">
                      Texto / Copy completo (con hashtags)
                    </label>
                    <textarea
                      rows={3}
                      placeholder="Escribí el contenido del posteo tal cual fue publicado en Instagram..."
                      value={postDescription}
                      onChange={(e) => setPostDescription(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl text-xs bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-800 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-rose-500/40 resize-none"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700 dark:text-gray-300">
                      Imagen o foto (URL o ruta local, opcional)
                    </label>
                    <input
                      type="text"
                      placeholder="Ej: /images/instagram/findelmundo_post1_cubiertas.jpg o URL web"
                      value={postThumbnail}
                      onChange={(e) => setPostThumbnail(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl text-xs bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-800 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-rose-500/40"
                    />
                  </div>

                  <div className="pt-2 flex items-center justify-between gap-3">
                    <span className="text-[11px] text-slate-400 dark:text-gray-500 flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                      Se publica al tope en vivo
                    </span>

                    <button
                      type="submit"
                      disabled={isSubmittingPost || !postTitle.trim()}
                      className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold bg-gradient-to-r from-rose-500 to-purple-600 hover:from-rose-600 hover:to-purple-700 text-white shadow-md shadow-rose-500/20 disabled:opacity-50 transition-all active:scale-95"
                    >
                      {isSubmittingPost ? (
                        <>
                          <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                          <span>Publicando...</span>
                        </>
                      ) : (
                        <>
                          <Send className="w-3.5 h-3.5" />
                          <span>Publicar y Sincronizar</span>
                        </>
                      )}
                    </button>
                  </div>
                </form>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
