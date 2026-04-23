'use client';

import React, { useState, useMemo } from 'react';
import type { Article, FeedSource } from '@/types';
import { LayoutDashboard, Compass, Settings, Bookmark, Search, Cloud, ChevronRight, LayoutGrid, List, LayoutTemplate, X, ExternalLink, Plus, BookmarkCheck, Share2, MoreHorizontal, CheckCircle2, PlayCircle, Flame, Send, MessageCircle, Map, MapPin, Car, ShieldAlert, Anchor } from 'lucide-react';
import { useTheme } from 'next-themes';
import WeatherDashboard from './WeatherDashboard';
import { motion, AnimatePresence } from 'framer-motion';

type ViewMode = 'list' | 'grid' | 'magazine';

export default function Dashboard({ initialArticles, feeds }: { initialArticles: Article[], feeds: FeedSource[] }) {
  const [activeTab, setActiveTab] = useState('home');
  const [search, setSearch] = useState('');
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);
  const [activeCategory, setActiveCategory] = useState<string>('all');
  
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);
  React.useEffect(() => setMounted(true), []);

  // Extraction of dynamic categories
  const allCategories = useMemo(() => {
     return Array.from(new Set(feeds.map(f => f.category))).filter(Boolean);
  }, [feeds]);

  const dashboardCats = ['all', 'internacional', 'nacional', 'provincial'];
  const feedSideCats = useMemo(() => allCategories.filter(c => !['internacional', 'nacional', 'provincial'].includes(c as string)), [allCategories]);

  // Enhanced Filter Logic
  const filteredArticles = useMemo(() => {
    let result = initialArticles;
    
    // Category filter
    if (activeCategory !== 'all') {
        result = result.filter(a => {
            const feed = feeds.find(f => f.id === a.sourceId);
            return feed && feed.category === activeCategory;
        });
    }

    // Keyword filter
    if (search.trim()) {
        const lowerSearch = search.toLowerCase();
        result = result.filter(a => {
          const sourceName = feeds.find(f => f.id === a.sourceId)?.name || '';
          return (
            a.title.toLowerCase().includes(lowerSearch) ||
            (a.description && a.description.toLowerCase().includes(lowerSearch)) ||
            sourceName.toLowerCase().includes(lowerSearch)
          );
        });
    }
    return result;
  }, [initialArticles, search, feeds, activeCategory]);

  const stripHtml = (html: string) => html.replace(/<[^>]*>?/gm, '');

  const getRelativeTime = (isoString: string) => {
    const diff = Date.now() - new Date(isoString).getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    if (hours < 1) return 'Reciente';
    if (hours < 24) return `${hours}h`;
    return `${Math.floor(hours/24)}d`;
  };

  const isYouTube = (url: string) => url?.includes('youtube.com') || url?.includes('youtu.be');

  // Separating articles for the Top Visual Widget
  const topVisualArticles = !search && activeCategory === 'all' ? filteredArticles.slice(0, 3) : [];
  
  // Logic for the main feed display: on home we show less, on explore we show more
  const feedArticlesToDisplay = useMemo(() => {
    const base = topVisualArticles.length > 0 ? filteredArticles.slice(3) : filteredArticles;
    if (activeTab === 'home' && !search) return base.slice(0, 10);
    return base.slice(0, 50);
  }, [filteredArticles, topVisualArticles, activeTab, search]);

  return (
    <div className="flex h-screen bg-[#070707] dark:bg-[#070707] text-[#e0e0e0] font-sans overflow-hidden transition-colors duration-200">
      
      {/* 1. ULTRA SLIM FIXED SIDEBAR */}
      <aside className="w-[72px] bg-[#0c0c0c]/80 backdrop-blur-xl border-r border-[#1a1a1a] hidden lg:flex flex-col items-center shrink-0 z-20 py-4 gap-6">
        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-700 rounded-xl flex items-center justify-center text-white font-bold tracking-tighter shadow-[0_0_15px_rgba(59,130,246,0.3)] cursor-pointer group hover:scale-105 transition-transform">
          MW
        </div>
        <nav className="flex-1 w-full space-y-4 overflow-y-auto scrollbar-hide py-2">
          <div className="text-[8px] font-black text-gray-600 uppercase tracking-widest text-center mt-2 mb-2 w-full">Principal</div>
          
          <button onClick={() => setActiveTab('home')} className={`relative w-full flex flex-col items-center justify-center gap-1.5 py-3 group transition-colors ${activeTab === 'home' ? 'text-blue-500' : 'text-gray-500 hover:text-gray-300'}`}>
            {activeTab === 'home' && <div className="absolute left-0 top-1/4 bottom-1/4 w-1 bg-blue-500 rounded-r-md"></div>}
            <LayoutDashboard className="w-5 h-5" />
            <span className="text-[9px] font-bold">Home</span>
          </button>
          
          <button onClick={() => setActiveTab('explore')} className={`relative w-full flex flex-col items-center justify-center gap-1.5 py-3 group transition-colors ${activeTab === 'explore' ? 'text-blue-500' : 'text-gray-500 hover:text-gray-300'}`}>
            {activeTab === 'explore' && <div className="absolute left-0 top-1/4 bottom-1/4 w-1 bg-blue-500 rounded-r-md"></div>}
            <Compass className="w-5 h-5" />
            <span className="text-[9px] font-bold">Feeds</span>
          </button>

          <button onClick={() => setActiveTab('weather')} className={`relative w-full flex flex-col items-center justify-center gap-1.5 py-3 group transition-colors ${activeTab === 'weather' ? 'text-blue-500' : 'text-gray-500 hover:text-gray-300'}`}>
            {activeTab === 'weather' && <div className="absolute left-0 top-1/4 bottom-1/4 w-1 bg-blue-500 rounded-r-md"></div>}
            <Cloud className="w-5 h-5" />
            <span className="text-[9px] font-bold">Clima</span>
          </button>
        </nav>
        <div className="w-full space-y-4 pb-4 border-t border-[#1a1a1a] pt-4">
            <button onClick={() => setSearch(search ? '' : ' ')} className="w-full flex justify-center text-gray-500 hover:text-gray-300 transition-colors"><Search className="w-5 h-5" /></button>
            <button className="w-full flex justify-center text-gray-500 hover:text-gray-300 transition-colors"><Settings className="w-5 h-5" /></button>
        </div>
      </aside>

      {/* 2. MAIN CONTENT AREA */}
      <main className="flex-1 flex flex-col min-w-0 relative">
        
        {/* INOREADER STYLE TOP NAVIGATION */}
        <div className="px-4 py-3 md:px-8 shrink-0 z-30 sticky top-0 bg-[#070707]/90 backdrop-blur-xl border-b border-[#1a1a1a]">
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                   <h1 className="text-xl font-bold text-white tracking-tight">
                       {activeTab === 'home' ? 'Dashboards' : activeTab === 'explore' ? 'Feeds' : 'Clima'}
                   </h1>
                   <ChevronRight className="w-4 h-4 text-gray-500" />
                </div>
                <div className="flex items-center gap-4 text-gray-400">
                    <button className="hover:text-white transition-colors"><Cloud className="w-4 h-4" /></button>
                    <button className="hover:text-white transition-colors"><MoreHorizontal className="w-4 h-4" /></button>
                </div>
            </div>
            
            {/* Dynamic Category Tabs for Home */}
            {activeTab === 'home' && (
                <div className="flex gap-6 overflow-x-auto scrollbar-hide text-[11px] font-black tracking-wider uppercase items-center pb-2">
                    {dashboardCats.map(cat => {
                        const label = cat === 'all' ? 'HOME' : cat === 'internacional' ? 'INTERNACIONALES' : cat === 'nacional' ? 'ARGENTINAS' : cat === 'provincial' ? 'TIERRA DEL FUEGO' : cat;
                        return (
                           <button 
                              key={cat} 
                              onClick={() => setActiveCategory(cat)}
                              className={`whitespace-nowrap pb-2 border-b-2 transition-colors ${activeCategory === cat ? 'border-blue-500 text-blue-500' : 'border-transparent text-gray-500 hover:text-gray-300'}`}
                           >
                               {label}
                           </button>
                        )
                    })}
                    
                    {/* Visual View Toggles for Home */}
                    <div className="ml-auto flex bg-[#121212] border border-[#222] rounded-md p-0.5">
                      <button onClick={() => setViewMode('list')} className={`p-1 rounded ${viewMode === 'list' ? 'bg-[#222] text-white' : 'text-gray-500 hover:text-gray-300'}`}><List className="w-3.5 h-3.5" /></button>
                      <button onClick={() => setViewMode('grid')} className={`p-1 rounded ${viewMode === 'grid' ? 'bg-[#222] text-white' : 'text-gray-500 hover:text-gray-300'}`}><LayoutGrid className="w-3.5 h-3.5" /></button>
                      <button onClick={() => setViewMode('magazine')} className={`p-1 rounded ${viewMode === 'magazine' ? 'bg-[#222] text-white' : 'text-gray-500 hover:text-gray-300'}`}><LayoutTemplate className="w-3.5 h-3.5" /></button>
                    </div>
                </div>
            )}
        </div>

        {/* CONTENIDO SCROLL */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden p-4 md:p-6 lg:p-8">
          <div className="max-w-[1400px] mx-auto space-y-6">
            
            {activeTab === 'weather' ? (
              <WeatherDashboard />
            ) : (
              <div className="flex flex-col gap-8">
                  
                  {/* Búsqueda activa info */}
                  {search && (
                    <div className="w-full bg-[#121212] border border-[#222] rounded-xl p-4 flex items-center justify-between">
                        <input 
                            type="text"
                            placeholder="Buscar en el universo de feeds..."
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            className="bg-transparent text-white outline-none w-full text-sm font-medium"
                            autoFocus
                        />
                        <Search className="w-4 h-4 text-gray-500" />
                    </div>
                  )}

                  {/* TOP VISUAL WIDGET (SOLO EN HOME SIN FILTRO) */}
                  {!search && activeTab === 'home' && topVisualArticles.length > 0 && (
                     <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {topVisualArticles.map((article, idx) => {
                            const isVid = isYouTube(article.link);
                            return (
                               <motion.div 
                                  initial={{ opacity: 0, y: 10 }}
                                  animate={{ opacity: 1, y: 0 }}
                                  transition={{ delay: idx * 0.1 }}
                                  key={'top-'+article.id}
                                  onClick={() => setSelectedArticle(article)}
                                  className="group relative h-64 md:h-80 bg-[#111] rounded-2xl overflow-hidden border border-[#222] cursor-pointer shadow-2xl"
                               >
                                  {article.thumbnail ? (
                                      <img src={article.thumbnail} className="w-full h-full object-cover opacity-60 group-hover:scale-105 group-hover:opacity-80 transition-all duration-700" alt="" />
                                  ) : (
                                      <div className="w-full h-full bg-gradient-to-br from-[#1a1a1a] to-black"></div>
                                  )}
                                  <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent"></div>
                                  
                                  {/* YouTube overlay if applicable */}
                                  {isVid && (
                                     <div className="absolute top-4 right-4 bg-red-600/90 text-white p-2 rounded-full backdrop-blur shadow-lg">
                                        <PlayCircle className="w-6 h-6" />
                                     </div>
                                  )}
                                  {idx === 0 && !isVid && (
                                     <div className="absolute top-4 right-4 bg-orange-600/90 text-white px-3 py-1 rounded-full text-[10px] font-black uppercase shadow-lg flex items-center gap-1 backdrop-blur">
                                        <Flame className="w-3 h-3" /> Fuego
                                     </div>
                                  )}

                                  <div className="absolute inset-x-0 bottom-0 p-5 flex flex-col gap-2 transform group-hover:-translate-y-2 transition-transform duration-300">
                                      <span className="text-[10px] font-black text-blue-400 uppercase tracking-widest bg-black/50 w-max px-2 py-1 rounded-md mb-1 border border-white/5 backdrop-blur-md">
                                          {feeds.find(f => f.id === article.sourceId)?.name}
                                      </span>
                                      <h3 className="text-xl md:text-2xl font-bold text-white leading-tight line-clamp-3 text-shadow-md">
                                          {article.title}
                                      </h3>
                                  </div>
                               </motion.div>
                            )
                        })}
                     </div>
                  )}

                  <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
                      {/* MAIN CONTENT FEED LIST */}
                      <div className="xl:col-span-8 flex flex-col gap-6">
                         <div className="bg-[#0e0e0e] border border-[#1f1f1f] rounded-2xl overflow-hidden shadow-2xl flex flex-col">
                            <div className="flex items-center justify-between p-4 border-b border-[#1f1f1f] bg-[#0e0e0e]/90 backdrop-blur-sm sticky top-0 z-10">
                                <div className="flex items-center gap-3">
                                    <div className="w-6 h-6 rounded bg-blue-600/20 flex items-center justify-center">
                                        <BookmarkCheck className="w-3.5 h-3.5 text-blue-500" />
                                    </div>
                                    <h2 className="text-[13px] font-bold text-gray-200 tracking-wide uppercase">
                                        {activeCategory === 'all' ? 'Flujo Dinámico' : activeCategory.replace(/-/g, ' ')}
                                        <span className="text-gray-500 ml-2 font-normal text-[11px]">{feedArticlesToDisplay.length} resultados</span>
                                    </h2>
                                </div>
                            </div>
                            
                            <motion.div layout className={`flex ${viewMode === 'list' ? 'flex-col' : viewMode === 'grid' ? 'flex-row flex-wrap p-4 gap-4' : 'flex-col p-4 gap-6'}`}>
                                <AnimatePresence>
                                    {feedArticlesToDisplay.map(article => {
                                        const sourceName = feeds.find(f => f.id === article.sourceId)?.name || 'Fuente';
                                        const isVid = isYouTube(article.link);

                                        // VIEW: LIST
                                        if (viewMode === 'list') return (
                                            <motion.div 
                                                initial={{ opacity: 0 }}
                                                animate={{ opacity: 1 }}
                                                exit={{ opacity: 0 }}
                                                key={article.id} 
                                                onClick={() => setSelectedArticle(article)}
                                                className="group flex flex-col sm:flex-row sm:items-center px-4 py-2.5 border-b border-[#181818] hover:bg-[#161616] cursor-pointer transition-colors"
                                            >
                                                <div className="hidden sm:flex w-6 shrink-0 items-center justify-center text-gray-600 group-hover:text-blue-500">
                                                    {isVid ? <PlayCircle className="w-4 h-4 text-red-500/80 group-hover:text-red-500" /> : <ChevronRight className="w-4 h-4" />}
                                                </div>
                                                <div className="flex-1 min-w-0 pr-4 pl-2">
                                                    <h3 className="text-sm font-semibold text-gray-300 group-hover:text-white truncate">
                                                        {article.title}
                                                    </h3>
                                                    <div className="hidden sm:block text-[11px] text-gray-500 truncate mt-0.5">
                                                        {stripHtml(article.description || '').slice(0, 100)}...
                                                    </div>
                                                </div>
                                                <div className="flex items-center justify-between sm:justify-end gap-3 mt-2 sm:mt-0 shrink-0 w-full sm:w-48 text-[11px] text-gray-500 font-medium">
                                                   <span className="truncate max-w-[100px] border border-[#222] px-2 py-0.5 rounded backdrop-blur bg-[#111]">{sourceName}</span>
                                                   <span className="shrink-0">{getRelativeTime(article.pubDate)}</span>
                                                </div>
                                            </motion.div>
                                        );

                                        // VIEW: GRID
                                        if (viewMode === 'grid') return (
                                            <motion.div 
                                                initial={{ scale: 0.9, opacity: 0 }}
                                                animate={{ scale: 1, opacity: 1 }}
                                                key={article.id}
                                                onClick={() => setSelectedArticle(article)}
                                                className="w-full sm:w-[calc(50%-8px)] lg:w-[calc(33.333%-11px)] bg-[#141414] border border-[#222] rounded-xl overflow-hidden cursor-pointer hover:border-gray-600 transition-all flex flex-col group"
                                            >
                                                {article.thumbnail && (
                                                   <div className="w-full h-32 relative overflow-hidden">
                                                      <img src={article.thumbnail} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" alt=""/>
                                                      {isVid && <div className="absolute inset-0 flex items-center justify-center bg-black/30"><PlayCircle className="w-8 h-8 text-white drop-shadow-md" /></div>}
                                                   </div>
                                                )}
                                                <div className="p-4 flex-1 flex flex-col z-10 w-full min-w-0">
                                                   <div className="text-[9px] font-black text-blue-500 uppercase tracking-widest mb-2 line-clamp-1">{sourceName}</div>
                                                   <h3 className="text-[14px] font-bold text-gray-200 line-clamp-2 leading-snug group-hover:text-blue-400 mb-2">{article.title}</h3>
                                                   <p className="text-[11px] text-gray-400 line-clamp-3 leading-relaxed mb-3 flex-1 flex-col justify-start">
                                                       {stripHtml(article.description || '')}
                                                   </p>
                                                   <div className="mt-auto flex items-center justify-between border-t border-[#1f1f1f] pt-3">
                                                       <span className="text-[10px] text-gray-600">{getRelativeTime(article.pubDate)}</span>
                                                       <div className="flex items-center gap-2 shrink-0">
                                                            <button 
                                                                onClick={(e) => { e.stopPropagation(); window.open(`https://wa.me/?text=${encodeURIComponent(article.title + ' ' + article.link)}`, '_blank'); }}
                                                                className="text-gray-500 hover:text-green-500 transition-colors p-1 bg-[#1a1a1a] hover:bg-[#222] rounded shadow-sm"
                                                                title="Compartir en WhatsApp"
                                                            >
                                                                <MessageCircle className="w-4 h-4" />
                                                            </button>
                                                            <button 
                                                                onClick={(e) => { e.stopPropagation(); window.open(`https://t.me/share/url?url=${encodeURIComponent(article.link)}&text=${encodeURIComponent(article.title)}`, '_blank'); }}
                                                                className="text-gray-500 hover:text-blue-400 transition-colors p-1 bg-[#1a1a1a] hover:bg-[#222] rounded shadow-sm"
                                                                title="Compartir en Telegram"
                                                            >
                                                               <Send className="w-4 h-4" />
                                                            </button>
                                                       </div>
                                                   </div>
                                                </div>
                                            </motion.div>
                                        );

                                        // VIEW: MAGAZINE
                                        return (
                                            <motion.div 
                                                initial={{ y: 20, opacity: 0 }}
                                                animate={{ y: 0, opacity: 1 }}
                                                key={article.id}
                                                onClick={() => setSelectedArticle(article)}
                                                className="w-full group bg-transparent border-none cursor-pointer flex flex-col md:flex-row gap-6 mb-2 hover:bg-[#111] p-2 rounded-xl transition-colors"
                                            >
                                                {article.thumbnail && (
                                                   <div className="w-full md:w-64 h-48 md:h-36 shrink-0 relative rounded-xl overflow-hidden">
                                                      <img src={article.thumbnail} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" alt=""/>
                                                      {isVid && <div className="absolute inset-0 flex items-center justify-center bg-black/40"><PlayCircle className="w-10 h-10 text-red-500 drop-shadow-lg" /></div>}
                                                   </div>
                                                )}
                                                <div className="flex-1 py-1">
                                                   <div className="flex items-center gap-2 mb-2">
                                                      <span className="text-[10px] font-black text-blue-500 uppercase bg-blue-500/10 px-2 py-0.5 rounded">{sourceName}</span>
                                                      <span className="text-[11px] text-gray-500">{getRelativeTime(article.pubDate)}</span>
                                                   </div>
                                                   <h3 className="text-xl font-bold text-gray-200 line-clamp-2 leading-tight group-hover:text-blue-400 mb-2">{article.title}</h3>
                                                   <p className="text-sm text-gray-500 line-clamp-2">{stripHtml(article.description || '')}</p>
                                                </div>
                                            </motion.div>
                                        );
                                    })}
                                </AnimatePresence>
                                 {feedArticlesToDisplay.length === 0 && (
                                    <div className="p-8 text-center text-sm text-gray-500">Sin artículos recientes compatibles.</div>
                                 )}
                                 
                                 {/* VER + BUTTON FOR HOME */}
                                 {activeTab === 'home' && !search && (filteredArticles.length - topVisualArticles.length) > 10 && (
                                    <div className="p-6 border-t border-[#1f1f1f] flex justify-center bg-[#0e0e0e]/50">
                                        <button 
                                            onClick={() => setActiveTab('explore')}
                                            className="flex items-center gap-2 px-6 py-2.5 bg-[#1a1a1a] hover:bg-[#222] border border-[#333] rounded-full text-[11px] font-black uppercase tracking-widest text-blue-500 hover:text-blue-400 transition-all group font-bold"
                                        >
                                            Ver + Noticias <ChevronRight className="w-3.5 h-3.5 transform group-hover:translate-x-1 transition-transform" />
                                        </button>
                                    </div>
                                 )}
                             </motion.div>
                          </div>

                          {/* SHIP TRAFFIC SECTION - NEW */}
                          {activeTab === 'home' && !search && (
                             <div className="bg-[#0e0e0e] border border-[#1f1f1f] rounded-2xl overflow-hidden shadow-2xl flex flex-col mb-10">
                                <div className="flex items-center justify-between px-6 py-5 border-b border-[#1f1f1f] bg-[#0e0e0e]/90 backdrop-blur-sm">
                                    <div className="flex items-center gap-3">
                                        <div className="w-6 h-6 rounded bg-blue-600/20 flex items-center justify-center">
                                            <Anchor className="w-3.5 h-3.5 text-blue-500" />
                                        </div>
                                        <h2 className="text-[13px] font-bold text-gray-200 tracking-wide uppercase">
                                            Arribo de Barcos y Cruceros
                                        </h2>
                                    </div>
                                    <a 
                                        href="https://www.argentina.gob.ar/economia/agencia-nacional-de-puertos-y-navegacion/puertos/puerto-de-ushuaia" 
                                        target="_blank" 
                                        rel="noopener noreferrer"
                                        className="text-[10px] font-bold text-gray-500 hover:text-white flex items-center gap-1 transition-colors"
                                    >
                                        INFO OFICIAL <ExternalLink className="w-3 h-3" />
                                    </a>
                                </div>
                                <div className="w-full h-[450px] relative bg-[#0c0c0c]">
                                    <iframe 
                                        src="https://www.marinetraffic.com/en/ais/embed/zoom:9/centery:-54.7/centerx:-67.5/maptype:0/shownames:false"
                                        className="w-full h-full border-none opacity-90 hover:opacity-100 transition-opacity"
                                        title="Marine Traffic - Puerto de Ushuaia"
                                        loading="lazy"
                                    />
                                </div>
                             </div>
                           )}
                      </div>

                      {/* RIGHT COLUMN (CHECKLIST) FOR HOME */}
                      {activeTab === 'home' && (
                        <div className="hidden xl:flex xl:col-span-4 flex-col gap-6">
                            <div className="bg-[#0e0e0e] border border-[#1f1f1f] rounded-2xl p-5 shadow-2xl flex flex-col gap-6">
                                <div className="flex items-center justify-between text-gray-300">
                                    <h2 className="text-[13px] font-bold tracking-wide flex items-center gap-2">
                                        <Map className="w-4 h-4 text-orange-500" />
                                        Estado de Rutas TDF
                                    </h2>
                                    <span className="flex h-2 w-2 relative">
                                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                        <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                                    </span>
                                </div>
                                <div className="flex flex-col gap-4">
                                    
                                    {/* TRAMO 1 */}
                                    <div className="bg-[#161616]/40 backdrop-blur-md border border-[#222] rounded-2xl p-4 flex flex-col gap-2 relative group hover:border-blue-500/50 hover:bg-[#1a1a1a]/60 cursor-pointer transition-all shadow-sm">
                                        <div className="absolute top-4 right-4"><Car className="w-4 h-4 text-blue-500"/></div>
                                        <h4 className="text-[10px] uppercase font-black tracking-widest text-gray-500">Tramo Norte</h4>
                                        <h3 className="text-[13px] font-bold text-white">San Sebastián - Río Grande</h3>
                                        <p className="text-[11px] text-gray-400 mt-1 mb-2 leading-relaxed opacity-80 group-hover:opacity-100">Tránsito habilitado. Monitoreo oficial por condiciones climáticas de la zona.</p>
                                        <a href="https://www.facebook.com/SuDefensaCivil/" target="_blank" rel="noopener noreferrer" className="mt-auto pt-3 border-t border-[#222] flex items-center justify-between text-[10px] uppercase font-bold text-blue-500 hover:text-blue-400 transition-colors">
                                            Fuente: Defensa Civil <ExternalLink className="w-3 h-3"/>
                                        </a>
                                    </div>

                                    {/* TRAMO 2 */}
                                    <div className="bg-[#161616]/40 backdrop-blur-md border border-[#222] rounded-2xl p-4 flex flex-col gap-2 relative group hover:border-emerald-500/50 hover:bg-[#1a1a1a]/60 cursor-pointer transition-all shadow-sm">
                                        <div className="absolute top-4 right-4"><Car className="w-4 h-4 text-emerald-500"/></div>
                                        <h4 className="text-[10px] uppercase font-black tracking-widest text-gray-500">Tramo Centro</h4>
                                        <h3 className="text-[13px] font-bold text-white">Río Grande - Tolhuin</h3>
                                        <p className="text-[11px] text-gray-400 mt-1 mb-2 leading-relaxed opacity-80 group-hover:opacity-100">Precaución permanente en zona geológica. Reportarse a los puestos de control.</p>
                                        <a href="https://www.argentina.gob.ar/transporte/vialidad-nacional/estado-de-rutas" target="_blank" rel="noopener noreferrer" className="mt-auto pt-3 border-t border-[#222] flex items-center justify-between text-[10px] uppercase font-bold text-emerald-500 hover:text-emerald-400 transition-colors">
                                            Fuente: Vialidad Nacional <ExternalLink className="w-3 h-3"/>
                                        </a>
                                    </div>

                                    {/* TRAMO 3 */}
                                    <div className="bg-[#161616]/40 backdrop-blur-md border border-[#222] rounded-2xl p-4 flex flex-col gap-2 relative group hover:border-orange-500/50 hover:bg-[#1a1a1a]/60 cursor-pointer transition-all shadow-sm">
                                        <div className="absolute top-4 right-4"><Car className="w-4 h-4 text-orange-400"/></div>
                                        <h4 className="text-[10px] uppercase font-black tracking-widest text-gray-500">Tramo Sur</h4>
                                        <h3 className="text-[13px] font-bold text-white">Tolhuin - Lapataia</h3>
                                        <p className="text-[11px] text-gray-400 mt-1 mb-2 leading-relaxed opacity-80 group-hover:opacity-100">Zona de montaña. Transitabilidad sujeta a condiciones de hielo y nieve diaria.</p>
                                        <a href="https://www.facebook.com/direccionprovincialdevialidadTDF/?locale=es_LA" target="_blank" rel="noopener noreferrer" className="mt-auto pt-3 border-t border-[#222] flex items-center justify-between text-[10px] uppercase font-bold text-orange-400 hover:text-orange-300 transition-colors">
                                            Fuente: Vialidad Pcial <ExternalLink className="w-3 h-3"/>
                                        </a>
                                    </div>

                                </div>
                            </div>
                        </div>
                      )}

                      {/* SIDE PANEL FOR EXPLORE (FEEDS) */}
                      {activeTab === 'explore' && (
                        <div className="hidden xl:flex xl:col-span-4 flex-col gap-6 sticky top-20">
                            <div className="bg-[#0e0e0e] border border-[#1f1f1f] rounded-2xl p-5 shadow-2xl flex flex-col gap-4">
                                <h2 className="text-[13px] font-bold text-gray-300 tracking-wide uppercase mb-2">Categorías Feeds</h2>
                                <button 
                                   onClick={() => setActiveCategory('all')}
                                   className={`text-left px-4 py-2.5 rounded-xl text-[13px] font-bold transition-all ${activeCategory === 'all' ? 'bg-blue-600/10 text-blue-500 border border-blue-500/20' : 'text-gray-400 hover:bg-[#1a1a1a] hover:text-gray-200 border border-transparent'}`}
                                >
                                   Todos los Feeds
                                </button>
                                {feedSideCats.map(cat => (
                                   <button 
                                      key={cat}
                                      onClick={() => setActiveCategory(cat as string)}
                                      className={`text-left px-4 py-2.5 rounded-xl text-[13px] font-bold transition-all capitalize ${activeCategory === cat ? 'bg-blue-600/10 text-blue-500 border border-blue-500/20' : 'text-gray-400 hover:bg-[#1a1a1a] hover:text-gray-200 border border-transparent'}`}
                                   >
                                      {(cat as string).replace(/-/g, ' ')}
                                   </button>
                                ))}
                            </div>
                        </div>
                      )}
                  </div>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* MOBILE FLOATING BOTTOM NAV (Si fuera necesario ajustar luego) */}
      <div className="lg:hidden fixed bottom-6 left-4 right-4 z-40">
        <nav className="bg-[#111]/90 backdrop-blur-xl border border-[#333] shadow-2xl rounded-2xl h-16 flex items-center justify-around px-2">
            {['home', 'explore', 'weather'].map((tab) => {
               const icons: any = { home: LayoutDashboard, explore: Compass, weather: Cloud };
               const Icon = icons[tab];
               const titles: any = { home: 'INICIO', explore: 'FEEDS', weather: 'CLIMA' };
               return (
                <button 
                  key={tab}
                  onClick={() => setActiveTab(tab)} 
                  className={`flex flex-col items-center justify-center p-2 rounded-xl transition-all duration-200 w-16 ${activeTab === tab ? 'text-blue-500 bg-blue-500/10' : 'text-gray-500 hover:text-gray-300'}`}
                >
                  <Icon className="w-5 h-5" />
                  <span className="text-[9px] font-bold mt-1">{titles[tab]}</span>
                </button>
               );
            })}
        </nav>
      </div>
      
      {/* 4. MODAL LECTOR */}
      <AnimatePresence>
        {selectedArticle && (
           <motion.div 
             initial={{ opacity: 0 }}
             animate={{ opacity: 1 }}
             exit={{ opacity: 0 }}
             className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/80 backdrop-blur-sm p-0 sm:p-4 md:p-12"
             onClick={() => setSelectedArticle(null)}
           >
              <motion.div 
                 initial={{ y: "100%" }}
                 animate={{ y: 0 }}
                 exit={{ y: "100%" }}
                 transition={{ type: "spring", damping: 25, stiffness: 300 }}
                 className="bg-[#0a0a0a] w-full max-w-4xl h-[95vh] sm:h-full max-h-[900px] rounded-t-2xl sm:rounded-2xl shadow-2xl flex flex-col border border-[#222] overflow-hidden"
                 onClick={e => e.stopPropagation()}
              >
                 <div className="flex items-center justify-between p-4 border-b border-[#1f1f1f] bg-[#0c0c0c]">
                    <span className="text-[11px] font-bold text-gray-500 uppercase tracking-widest pl-2">Lector de Artículos</span>
                    <button onClick={() => setSelectedArticle(null)} className="p-2 rounded-lg hover:bg-[#1f1f1f] transition-colors text-gray-400">
                       <X className="w-5 h-5" />
                    </button>
                 </div>
                 <div className="flex-1 overflow-y-auto p-6 md:p-12 scrollbar-smooth bg-[#0a0a0a]">
                    <div className="max-w-2xl mx-auto">
                       <div className="flex items-center gap-3">
                          <span className="text-xs font-black text-blue-500 uppercase tracking-widest">
                            {feeds.find(f => f.id === selectedArticle.sourceId)?.name || 'Central'}
                          </span>
                          {isYouTube(selectedArticle.link) && (
                              <span className="bg-red-600/20 text-red-500 px-2 py-0.5 rounded text-[10px] font-bold uppercase border border-red-500/30 flex items-center gap-1">
                                 <PlayCircle className="w-3 h-3"/> Video
                              </span>
                          )}
                       </div>
                       
                       <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight mt-5 leading-tight text-white mb-6">
                          {selectedArticle.title}
                       </h1>
                       
                       {selectedArticle.thumbnail && (
                           <div className="w-full h-auto mt-4 mb-8 rounded-xl overflow-hidden border border-[#222] relative group">
                              <img src={selectedArticle.thumbnail} alt="" className="w-full h-full object-cover" />
                              {isYouTube(selectedArticle.link) && (
                                  <a href={selectedArticle.link} target="_blank" rel="noopener noreferrer" className="absolute inset-0 flex items-center justify-center bg-black/40 group-hover:bg-black/60 transition-colors">
                                      <PlayCircle className="w-16 h-16 text-red-500 drop-shadow-xl transform group-hover:scale-110 transition-transform" />
                                  </a>
                              )}
                           </div>
                       )}

                       <div className="prose prose-invert prose-p:text-gray-300 prose-headings:text-white mt-8 leading-relaxed max-w-none text-[16px] md:text-[18px]" 
                            dangerouslySetInnerHTML={{ __html: selectedArticle.description || '<p>Contenido principal no provisto por la fuente.</p>' }} 
                       />
                       
                       <div className="mt-16 pt-8 border-t border-[#1f1f1f] flex justify-center">
                          <a href={selectedArticle.link} target="_blank" rel="noopener noreferrer" className={`flex items-center gap-2 ${isYouTube(selectedArticle.link) ? 'bg-red-600 hover:bg-red-700 text-white border-transparent' : 'bg-[#1a1a1a] hover:bg-[#222] text-gray-200 border border-[#333]'} px-8 py-4 rounded-full text-sm font-bold transition-all shadow-lg`}>
                            {isYouTube(selectedArticle.link) ? 'VER EN YOUTUBE' : 'LEER EN ORIGEN'} <ExternalLink className="w-4 h-4 ml-2" />
                          </a>
                       </div>
                    </div>
                 </div>
              </motion.div>
           </motion.div>
        )}
      </AnimatePresence>
      
    </div>
  );
}
