'use client';

import React, { useState, useMemo } from 'react';
import type { Article, FeedSource } from '@/types';
import { LayoutDashboard, Compass, Settings, Bookmark, Search, Cloud, ChevronRight, LayoutGrid, List, LayoutTemplate, X, ExternalLink, Plus, BookmarkCheck, Share2, MoreHorizontal, CheckCircle2, PlayCircle, Flame, Send, MessageCircle, Map, MapPin, Car, ShieldAlert, Anchor, Plane, FileText, Bell, ShieldCheck, TrendingUp, Shield, ListFilter } from 'lucide-react';
import { useTheme } from 'next-themes';
import WeatherDashboard from './WeatherDashboard';
import { motion, AnimatePresence } from 'framer-motion';

import dynamic from 'next/dynamic';

const WeatherAlertMap = dynamic(() => import('./WeatherAlertMap'), {
    ssr: false,
    loading: () => (
      <div className="w-full h-full flex flex-col items-center justify-center bg-[#0a0a0a] text-gray-500 rounded-xl border border-[#222]">
        <ShieldAlert className="w-8 h-8 mb-4 animate-pulse text-yellow-500" /> 
        <span className="text-xs font-bold uppercase tracking-widest">Sincronizando Alertas...</span>
      </div>
    )
  });

const SecurityHeatMap = dynamic(() => import('./SecurityHeatMap'), {
    ssr: false,
    loading: () => (
      <div className="w-full h-full flex flex-col items-center justify-center bg-[#0a0a0a] text-gray-500 rounded-xl border border-[#222]">
        <ShieldAlert className="w-8 h-8 mb-4 animate-pulse text-red-500" /> 
        <span className="text-xs font-bold uppercase tracking-widest">Cargando Inteligencia Crítica...</span>
      </div>
    )
  });

type ViewMode = 'list' | 'grid' | 'magazine';

export default function Dashboard({ initialArticles, feeds }: { initialArticles: Article[], feeds: FeedSource[] }) {
  const [activeTab, setActiveTab] = useState('home');
  const [search, setSearch] = useState('');
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);
   const [activeCategory, setActiveCategory] = useState<string>('all');
   const [blocklist, setBlocklist] = useState<string[]>(['pautas', 'anuncio', 'publicidad', 'clickbait']);
   const [isFilterOpen, setIsFilterOpen] = useState(false);
  
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

    // 1. DUPLICATE DETECTION: Keep only the first unique title (normalized)
    const seen = new Set<string>();
    result = result.filter(a => {
        const signature = a.title.toLowerCase().trim().replace(/[^a-z0-9]/g, '');
        if (seen.has(signature)) return false;
        seen.add(signature);
        return true;
    });

    // 2. CONTENT FILTER: Remove articles with blocklisted words
    if (blocklist.length > 0) {
        result = result.filter(a => {
            const content = (a.title + ' ' + (a.description || '')).toLowerCase();
            return !blocklist.some(word => word.length > 2 && content.includes(word.toLowerCase()));
        });
    }

    // 3. Keyword/Search filter
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
  }, [initialArticles, search, feeds, activeCategory, blocklist]);

  const stripHtml = (html: string) => html.replace(/<[^>]*>?/gm, '');

  const getRelativeTime = (isoString: string) => {
    const diff = Date.now() - new Date(isoString).getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    if (hours < 1) return 'Reciente';
    if (hours < 24) return `${hours}h`;
    return `${Math.floor(hours/24)}d`;
  };

  const isYouTube = (url: string) => url?.includes('youtube.com') || url?.includes('youtu.be');

  // Separating articles for the Top Visual Widget: 1 International, 1 National, 1 Provincial
  const topVisualArticles = useMemo(() => {
    if (search || activeTab !== 'home' || activeCategory !== 'all') return [];
    
    const findByCategory = (cat: string) => 
        initialArticles.find(a => feeds.find(f => f.id === a.sourceId)?.category === cat);

    const inter = findByCategory('internacional');
    const nac = findByCategory('nacional');
    const prov = findByCategory('provincial');
    
    return [inter, nac, prov].filter(Boolean) as Article[];
  }, [initialArticles, search, activeTab, activeCategory, feeds]);
  
  // Logic for the main feed display: on home we show less, on explore we show more
  // Also exclude top visual articles from the main list
  const feedArticlesToDisplay = useMemo(() => {
    const topIds = new Set(topVisualArticles.map(a => a.id));
    const base = filteredArticles.filter(a => !topIds.has(a.id));
    if (activeTab === 'home' && !search) return base.slice(0, 10);
    return base.slice(0, 50);
  }, [filteredArticles, topVisualArticles, activeTab, search]);

  return (
    <div className="flex h-screen bg-[#070707] dark:bg-[#070707] text-[#e0e0e0] font-sans overflow-hidden transition-colors duration-200 relative">
      {/* Animated Mesh Gradient Background */}
      <div className="absolute inset-0 z-0 opacity-20 pointer-events-none overflow-hidden">
        <div className="absolute -top-[20%] -left-[10%] w-[60%] h-[60%] bg-blue-600/30 rounded-full blur-[120px] animate-pulse"></div>
        <div className="absolute top-[30%] -right-[10%] w-[50%] h-[50%] bg-orange-600/20 rounded-full blur-[100px] animate-pulse [animation-delay:2s]"></div>
        <div className="absolute -bottom-[20%] left-[20%] w-[50%] h-[50%] bg-red-600/20 rounded-full blur-[100px] animate-pulse [animation-delay:4s]"></div>
      </div>

      
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

          <button onClick={() => setActiveTab('reports')} className={`relative w-full flex flex-col items-center justify-center gap-1.5 py-3 group transition-colors ${activeTab === 'reports' ? 'text-blue-500' : 'text-gray-500 hover:text-gray-300'}`}>
            {activeTab === 'reports' && <div className="absolute left-0 top-1/4 bottom-1/4 w-1 bg-blue-500 rounded-r-md"></div>}
            <FileText className="w-5 h-5" />
            <span className="text-[9px] font-bold">Resúmenes</span>
          </button>

          <button onClick={() => setActiveTab('security')} className={`relative w-full flex flex-col items-center justify-center gap-1.5 py-3 group transition-colors ${activeTab === 'security' ? 'text-red-500' : 'text-gray-500 hover:text-gray-300'}`}>
            {activeTab === 'security' && <div className="absolute left-0 top-1/4 bottom-1/4 w-1 bg-red-600 rounded-r-md"></div>}
            <ShieldCheck className="w-5 h-5" />
            <span className="text-[9px] font-bold">Seguridad</span>
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
        <div className="px-4 py-4 md:px-8 shrink-0 z-30 sticky top-0 bg-[#070707]/60 backdrop-blur-2xl border-b border-white/5 shadow-[0_4px_30px_rgba(0,0,0,0.3)]">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                   <div className="lg:hidden w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center shadow-[0_0_15px_rgba(37,99,235,0.4)] mr-2 shrink-0">
                      <LayoutDashboard className="w-4 h-4 text-white" />
                   </div>
                   <div className="flex flex-col md:flex-row md:items-center gap-1 md:gap-3">
                      <h1 className="text-lg md:text-xl font-black text-white tracking-widest uppercase">
                         WikiApp <span className="text-[9px] bg-blue-500/20 px-2 py-0.5 rounded-full text-blue-400 font-black border border-blue-500/20 ml-1">PRO-V2</span>
                      </h1>
                      <div className="flex items-center gap-2">
                        <ChevronRight className="w-3 h-3 text-gray-700 hidden md:block" />
                        <span className="text-[10px] md:text-xs font-bold text-gray-500 uppercase tracking-widest">
                            {activeTab === 'home' ? 'Monitor Regional' : activeTab === 'explore' ? 'Fuentes de Inteligencia' : activeTab === 'security' ? 'Centro de Auditoría' : 'Sistema'}
                        </span>
                      </div>
                   </div>
                </div>
                <div className="flex items-center gap-2 md:gap-6">
                    <div className="hidden sm:flex items-center gap-1 text-[9px] font-black text-gray-500 uppercase tracking-widest bg-white/5 px-3 py-1.5 rounded-full border border-white/5">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse mr-1"></span>
                        Sincronización <span className="text-emerald-500/80 ml-1">OK</span>
                    </div>
                    <div className="flex items-center gap-1">
                        <button className="p-2 text-gray-500 hover:text-white transition-all hover:bg-white/5 rounded-xl"><Cloud className="w-4 h-4 md:w-5 md:h-5" /></button>
                        <button className="p-2 text-gray-500 hover:text-white transition-all hover:bg-white/5 rounded-xl"><Search className="w-4 h-4 md:w-5 md:h-5" /></button>
                        <button className="p-2 text-gray-500 hover:text-white transition-all hover:bg-white/5 rounded-xl"><MoreHorizontal className="w-4 h-4 md:w-5 md:h-5" /></button>
                    </div>
                </div>
            </div>
        </div>
                     {/* 🖥️ MODERNA BARRA DE HERRAMIENTAS - SEARCH + FILTROS + TABS */}
            {activeTab === 'home' && (
                <div className="flex flex-col xl:flex-row items-stretch xl:items-center gap-6 py-5 px-4 md:px-8 border-b border-white/5 bg-white/[0.02] backdrop-blur-3xl sticky top-[80px] z-20">
                    
                    {/* CUADRO DE BÚSQUEDA PRO */}
                    <div className="relative w-full xl:w-80 group">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 group-focus-within:text-blue-500 transition-colors" />
                        <input 
                            type="text" 
                            placeholder="Buscar noticias..." 
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full bg-black/40 border border-white/10 rounded-2xl py-3 pl-11 pr-4 text-xs font-bold text-gray-200 placeholder:text-gray-600 focus:outline-none focus:border-blue-500/50 focus:ring-4 focus:ring-blue-500/10 transition-all"
                        />
                    </div>

                    {/* FILTRO DE CATEGORÍAS (DROPDOWN) */}
                    <div className="flex items-center gap-3 w-full xl:w-auto">
                        <div className="px-3 py-2 bg-white/5 rounded-xl border border-white/10 flex items-center gap-2 shrink-0">
                            <ListFilter className="w-3.5 h-3.5 text-blue-500" />
                            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest hidden sm:inline">Filtrar</span>
                        </div>
                        <select 
                            value={activeCategory}
                            onChange={(e) => setActiveCategory(e.target.value)}
                            className="flex-1 xl:w-48 bg-black/40 border border-white/10 rounded-xl py-2 px-3 text-[11px] font-black uppercase text-gray-300 focus:outline-none focus:border-blue-500/50 appearance-none cursor-pointer"
                        >
                            <option value="all">Todas las Categorías</option>
                            <option value="tecnologia">Tecnología</option>
                            <option value="economia">Economía</option>
                            <option value="seguridad">Seguridad</option>
                            <option value="educacion">Educación</option>
                            <option value="transporte">Transporte</option>
                        </select>
                    </div>

                    {/* PESTAÑAS GEOGRÁFICAS FIJAS */}
                    <div className="flex bg-black/40 p-1 rounded-2xl border border-white/5 items-center">
                        {[
                            { id: 'all', label: 'Panorama' },
                            { id: 'internacional', label: 'Internacional' },
                            { id: 'nacional', label: 'Argentina' },
                            { id: 'provincial', label: 'Tierra del Fuego' }
                        ].map((item) => (
                            <button 
                              key={item.id} 
                              onClick={() => setActiveCategory(item.id)}
                              className={`px-4 md:px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-tighter transition-all duration-300 ${activeCategory === item.id ? 'bg-blue-600 text-white shadow-[0_0_15px_rgba(37,99,235,0.4)]' : 'text-gray-500 hover:text-gray-300 hover:bg-white/5'}`}
                            >
                                {item.label}
                            </button>
                        ))}
                    </div>

                    {/* SELECTORES DE VISTA */}
                    <div className="flex items-center gap-1 bg-black/40 p-1 rounded-xl border border-white/5 ml-auto">
                      <button onClick={() => setViewMode('list')} className={`p-2 rounded-lg transition-all ${viewMode === 'list' ? 'bg-blue-600/20 text-blue-500 ring-1 ring-blue-500/30' : 'text-gray-600 hover:text-gray-300'}`}><List className="w-4 h-4" /></button>
                      <button onClick={() => setViewMode('grid')} className={`p-2 rounded-lg transition-all ${viewMode === 'grid' ? 'bg-blue-600/20 text-blue-500 ring-1 ring-blue-500/30' : 'text-gray-600 hover:text-gray-300'}`}><LayoutGrid className="w-4 h-4" /></button>
                      <button onClick={() => setViewMode('magazine')} className={`p-2 rounded-lg transition-all ${viewMode === 'magazine' ? 'bg-blue-600/20 text-blue-500 ring-1 ring-blue-500/30' : 'text-gray-600 hover:text-gray-300'}`}><LayoutTemplate className="w-4 h-4" /></button>
                    </div>
                </div>
            )}
        </div>

        {/* CONTENIDO SCROLL */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden p-4 md:p-6 lg:p-8 relative z-10 scrollbar-hide">
          <div className="max-w-[1600px] mx-auto space-y-6">
            
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
                                  {/* Category Badge with Fire Icon */}
                                  {!isVid && (
                                     <div className="absolute top-4 right-4 bg-orange-600/90 text-white px-3 py-1 rounded-full text-[10px] font-black uppercase shadow-lg flex items-center gap-1 backdrop-blur ring-1 ring-white/20">
                                        <Flame className="w-3 h-3" /> 
                                        {feeds.find(f => f.id === article.sourceId)?.category === 'internacional' ? 'Internacional' : 
                                         feeds.find(f => f.id === article.sourceId)?.category === 'nacional' ? 'Argentina' : 'TDF'}
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
                                                   <motion.div layout className={`flex ${viewMode === 'list' ? 'flex-col shadow-inner' : viewMode === 'grid' ? 'flex-row flex-wrap p-4 md:p-6 gap-6' : 'flex-col p-2 md:p-4'}`}>
                                <AnimatePresence mode="popLayout">
                                    {feedArticlesToDisplay.map(article => {
                                        const sourceName = feeds.find(f => f.id === article.sourceId)?.name || 'Fuente';
                                        const isVid = isYouTube(article.link);

                                        // VIEW: LIST
                                        if (viewMode === 'list') return (
                                            <motion.div 
                                                initial={{ opacity: 0, x: -10 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                exit={{ opacity: 0, x: 10 }}
                                                key={article.id} 
                                                onClick={() => setSelectedArticle(article)}
                                                className="group flex flex-col sm:flex-row sm:items-center px-6 py-4 border-b border-white/5 hover:bg-white/[0.03] cursor-pointer transition-all border-l-2 border-l-transparent hover:border-l-blue-600 shadow-sm"
                                            >
                                                <div className="hidden sm:flex w-10 shrink-0 items-center justify-center">
                                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${isVid ? 'bg-red-500/10' : 'bg-blue-500/10'}`}>
                                                        {isVid ? <PlayCircle className="w-4 h-4 text-red-500" /> : <ChevronRight className="w-4 h-4 text-blue-500" />}
                                                    </div>
                                                </div>
                                                <div className="flex-1 min-w-0 pr-4 pl-2 space-y-1">
                                                    <h3 className="text-[14px] font-bold text-gray-200 group-hover:text-white truncate tracking-tight transition-colors">
                                                        {article.title}
                                                    </h3>
                                                    <div className="hidden md:flex items-center gap-2 text-[10px] text-gray-500 font-bold uppercase tracking-widest">
                                                       <span className="text-blue-500/80">{sourceName}</span>
                                                       <span className="opacity-30">•</span>
                                                       <span>{getRelativeTime(article.pubDate)}</span>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-3 mt-2 sm:mt-0 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <button onClick={(e) => { e.stopPropagation(); window.open(`https://wa.me/?text=${encodeURIComponent(article.title + ' ' + article.link)}`, '_blank'); }} className="p-2 hover:bg-green-500/20 text-gray-400 hover:text-green-500 rounded-lg transition-all"><MessageCircle className="w-4 h-4" /></button>
                                                    <button onClick={(e) => { e.stopPropagation(); window.open(`https://t.me/share/url?url=${encodeURIComponent(article.link)}&text=${encodeURIComponent(article.title)}`, '_blank'); }} className="p-2 hover:bg-blue-500/20 text-gray-400 hover:text-blue-400 rounded-lg transition-all"><Send className="w-4 h-4" /></button>
                                                </div>
                                            </motion.div>
                                        );

                                        // VIEW: GRID
                                        if (viewMode === 'grid') return (
                                            <motion.div 
                                                initial={{ opacity: 0, scale: 0.95 }}
                                                animate={{ opacity: 1, scale: 1 }}
                                                exit={{ opacity: 0, scale: 0.95 }}
                                                key={article.id} 
                                                onClick={() => setSelectedArticle(article)}
                                                className="group relative w-full sm:w-[calc(50%-12px)] lg:w-[calc(33.333%-16px)] xl:w-[calc(25%-18px)] bg-white/[0.02] border border-white/5 rounded-[1.5rem] overflow-hidden hover:border-blue-600/30 hover:bg-white/[0.04] transition-all cursor-pointer flex flex-col shadow-lg"
                                            >
                                                {article.thumbnail && (
                                                    <div className="aspect-[16/10] overflow-hidden relative">
                                                        <img src={article.thumbnail} alt="" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                                                        <div className="absolute inset-0 bg-gradient-to-t from-[#0e0e0e] to-transparent opacity-80"></div>
                                                        {isVid && (
                                                            <div className="absolute inset-0 flex items-center justify-center">
                                                                <div className="w-12 h-12 rounded-full bg-red-600/20 backdrop-blur-md flex items-center justify-center border border-red-500/30 group-hover:scale-110 transition-transform">
                                                                    <PlayCircle className="w-6 h-6 text-red-500" />
                                                                </div>
                                                            </div>
                                                        )}
                                                    </div>
                                                )}
                                                <div className="p-5 flex flex-col flex-1 gap-3">
                                                    <div className="flex items-center justify-between">
                                                        <span className="text-[9px] font-black text-blue-500 uppercase tracking-widest bg-blue-600/10 px-2 py-0.5 rounded border border-blue-500/20">{sourceName}</span>
                                                        <span className="text-[9px] text-gray-500 font-bold">{getRelativeTime(article.pubDate)}</span>
                                                    </div>
                                                    <h3 className="text-[13px] font-bold text-gray-200 group-hover:text-white leading-[1.4] line-clamp-2 transition-colors">
                                                        {article.title}
                                                    </h3>
                                                </div>
                                            </motion.div>
                                        );

                                        // VIEW: MAGAZINE
                                        if (viewMode === 'magazine') return (
                                            <motion.div 
                                                initial={{ opacity: 0, y: 20 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                exit={{ opacity: 0, y: 20 }}
                                                key={article.id} 
                                                onClick={() => setSelectedArticle(article)}
                                                className="group flex flex-col lg:flex-row gap-6 md:gap-8 p-4 md:p-8 border-b border-white/5 hover:bg-white/[0.01] transition-all cursor-pointer relative overflow-hidden"
                                            >
                                                <div className="w-full lg:w-[350px] aspect-[16/9] lg:h-[200px] shrink-0 overflow-hidden rounded-[2rem] relative shadow-2xl">
                                                    <img src={article.thumbnail || 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?auto=format&fit=crop&q=80&w=600'} alt="" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000" />
                                                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
                                                    {isVid && (
                                                        <div className="absolute bottom-4 left-4 flex items-center gap-2 bg-red-600/80 backdrop-blur-md px-3 py-1 rounded-full border border-red-500/50">
                                                            <PlayCircle className="w-4 h-4 text-white" />
                                                            <span className="text-[10px] font-black text-white uppercase tracking-widest">Video</span>
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="flex flex-col flex-1 justify-center gap-4">
                                                    <div className="flex items-center gap-4">
                                                       <span className="text-[10px] font-black text-blue-500 uppercase tracking-[0.2em]">{sourceName}</span>
                                                       <div className="w-1.5 h-1.5 rounded-full bg-blue-500/20"></div>
                                                       <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">{getRelativeTime(article.pubDate)}</span>
                                                    </div>
                                                    <h3 className="text-2xl md:text-3xl lg:text-4xl font-black text-gray-100 group-hover:text-white leading-[1.1] tracking-tighter transition-colors max-w-3xl">
                                                        {article.title}
                                                    </h3>
                                                    <p className="text-[15px] text-gray-400 line-clamp-2 leading-relaxed font-medium max-w-2xl">
                                                        {stripHtml(article.description || '').slice(0, 250)}...
                                                    </p>
                                                    <div className="flex items-center gap-3 mt-2">
                                                        <span className="text-[11px] font-black text-blue-500 uppercase tracking-widest border border-blue-500/30 px-4 py-2 rounded-full hover:bg-blue-500 hover:text-white transition-all">Leer Articulo Completo</span>
                                                    </div>
                                                </div>
                                            </motion.div>
                                        );

                                        return null;
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

                   <div className="grid grid-cols-1 md:grid-cols-1 lg:grid-cols-1 xl:grid-cols-2 gap-6 mt-6 mb-10">
                          {/* 4. WEATHER DASHBOARD */}
                  {activeTab === 'weather' && <WeatherDashboard />}

                  {/* 5. REPORTS DASHBOARD (NEW) */}
                  {activeTab === 'reports' && (
                    <motion.div 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex flex-col gap-8 pb-10"
                    >
                        <header className="flex flex-col gap-2">
                           <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-2xl bg-orange-600/20 flex items-center justify-center">
                                 <ShieldAlert className="w-5 h-5 text-orange-500" />
                              </div>
                              <h1 className="text-3xl font-black text-white tracking-tighter uppercase">Seguridad y Realidad Social</h1>
                           </div>
                           <p className="text-gray-500 text-sm max-w-2xl">Panorama estratégico integral desde la geopolítica internacional hasta la estabilidad social provincial.</p>
                        </header>

                        <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
                            {/* CONFIGURATION COLUMN */}
                            <div className="xl:col-span-4 flex flex-col gap-6">
                                <section className="bg-[#0e0e0e] border border-[#1f1f1f] rounded-3xl p-6 flex flex-col gap-6 shadow-2xl">
                                    <div className="flex items-center justify-between">
                                        <h3 className="text-xs font-black uppercase tracking-widest text-gray-400">Configuración</h3>
                                        <div className="flex h-2 w-2 relative">
                                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                                            <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
                                        </div>
                                    </div>

                                    <div className="flex flex-col gap-4">
                                        <div className="flex flex-col gap-2">
                                            <label className="text-[10px] font-bold text-gray-500 uppercase tracking-tight">Frecuencia de Envío</label>
                                            <div className="grid grid-cols-2 gap-2 bg-[#161616] p-1 rounded-xl">
                                                <button className="py-2 rounded-lg bg-blue-600 text-white text-[11px] font-black uppercase">Diario</button>
                                                <button className="py-2 rounded-lg text-gray-500 text-[11px] font-black uppercase hover:bg-white/5 transition-colors">Semanal</button>
                                            </div>
                                        </div>

                                        <div className="flex flex-col gap-2">
                                            <label className="text-[10px] font-bold text-gray-500 uppercase tracking-tight">Destino</label>
                                            <div className="flex items-center gap-3 px-4 py-3 bg-[#161616] border border-[#222] rounded-xl">
                                                <Bell className="w-4 h-4 text-orange-500" />
                                                <span className="text-[11px] font-bold text-gray-300">Notificación en App y Email</span>
                                            </div>
                                        </div>

                                        <div className="flex flex-col gap-3 mt-2">
                                            <label className="text-[10px] font-bold text-gray-500 uppercase tracking-tight">Ejes de Monitoreo</label>
                                            <div className="space-y-2">
                                                {['Seguridad Internacional', 'Paz Social Nacional', 'Resguardo Provincial', 'Conflictos Sociales'].map(cat => (
                                                    <div key={cat} className="flex items-center justify-between px-3 py-2 bg-white/5 border border-white/5 rounded-lg">
                                                        <span className="text-[11px] font-bold text-gray-300">{cat}</span>
                                                        <div className="w-8 h-4 bg-orange-600 rounded-full relative"><div className="absolute right-1 top-1 w-2 h-2 bg-white rounded-full"></div></div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>

                                        <button className="mt-4 w-full py-4 bg-white text-black font-black uppercase tracking-widest text-[11px] rounded-2xl hover:bg-blue-500 hover:text-white transition-all shadow-xl shadow-blue-900/10 active:scale-95">
                                            Generar Reporte Ahora
                                        </button>
                                    </div>
                                </section>
                            </div>

                            {/* PREVIEW/HISTORY COLUMN */}
                            <div className="xl:col-span-8 flex flex-col gap-6">
                                <section className="bg-[#0e0e0e] border border-[#1f1f1f] rounded-3xl p-8 flex flex-col gap-6 shadow-2xl relative overflow-hidden group">
                                    <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity">
                                        <FileText className="w-48 h-48 text-blue-500" />
                                    </div>

                                    <div className="flex flex-col gap-1 z-10">
                                        <span className="text-[10px] font-black text-orange-500 uppercase tracking-[0.2em]">Informe Semanal de Riesgos y Estabilidad</span>
                                        <h2 className="text-2xl font-bold text-white tracking-tight">Análisis de Realidad Social Tierrafueguina</h2>
                                        <p className="text-gray-500 text-xs mt-1">Sintetizado el {new Date().toLocaleDateString('es-AR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
                                    </div>

                                    <div className="h-px bg-gradient-to-r from-orange-500/50 to-transparent z-10"></div>

                                    <div className="flex flex-col gap-6 z-10">
                                        {[1, 2, 3].map(i => (
                                            <div key={i} className="flex gap-4 group/item">
                                                <div className="text-orange-500 text-lg font-black italic">0{i}</div>
                                                <div className="flex flex-col gap-1">
                                                    <h4 className="text-[14px] font-bold text-gray-200 group-hover/item:text-orange-400 transition-colors">
                                                        {i === 1 ? 'Amenazas Geopolíticas y Fronterizas' : i === 2 ? 'Indicadores de Conflictividad Social' : 'Seguridad en Infraestructura Crítica'}
                                                    </h4>
                                                    <p className="text-[11px] text-gray-400 leading-relaxed max-w-xl">
                                                        {i === 1 ? 'Evaluación de los movimientos en los pasos fronterizos y dinámica migratoria regional.' : 
                                                         i === 2 ? 'Análisis de paritarias y movimientos gremiales que impactan la estabilidad local.' : 
                                                         'Detección de vulnerabilidades en servicios esenciales y logística estratégica.'}
                                                    </p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    <div className="mt-6 flex gap-4 z-10">
                                        <button className="flex items-center gap-2 px-6 py-2 bg-[#1a1a1a] hover:bg-[#222] border border-white/5 rounded-xl text-[10px] font-black uppercase text-gray-400 transition-all">
                                            <ExternalLink className="w-3.5 h-3.5" /> Descargar PDF
                                        </button>
                                        <button className="flex items-center gap-2 px-6 py-2 bg-[#1a1a1a] hover:bg-[#222] border border-white/5 rounded-xl text-[10px] font-black uppercase text-gray-400 transition-all">
                                            <Share2 className="w-3.5 h-3.5" /> Compartir Informe
                                        </button>
                                    </div>
                                </section>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="p-6 bg-[#0e0e0e] border border-[#1f1f1f] rounded-2xl flex flex-col gap-2">
                                        <h4 className="text-[10px] font-black text-gray-500 uppercase">Integración IA</h4>
                                        <p className="text-[11px] text-gray-400">El motor de IA analiza sentimientos y tendencias automáticamente antes de compilar el informe.</p>
                                    </div>
                                    <div className="p-6 bg-[#0e0e0e] border border-[#1f1f1f] rounded-2xl flex flex-col gap-2">
                                        <h4 className="text-[10px] font-black text-gray-500 uppercase">Alertas Críticas</h4>
                                        <p className="text-[11px] text-gray-400">Si se detecta una noticia de alta volatilidad, se genera un reporte extraordinario fuera de ciclo.</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                  )}

                  {/* 6. SECURITY CENTER */}
                  {activeTab === 'security' && (
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.98 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="flex flex-col gap-8 pb-10 h-full"
                    >
                        <header className="flex flex-col gap-2">
                           <div className="flex items-center gap-3">
                              <div className="w-12 h-12 rounded-2xl bg-red-600/20 flex items-center justify-center shadow-[0_0_20px_rgba(220,38,38,0.2)]" id="security-icon-container">
                                 <ShieldCheck className="w-6 h-6 text-red-500" />
                              </div>
                              <div className="flex flex-col">
                                <h1 className="text-3xl font-black text-white tracking-tighter uppercase leading-none">Security Audit Center</h1>
                                <span className="text-[10px] font-bold text-red-500/80 uppercase tracking-[0.3em] mt-1">División Estratégica Regional (30A-EXP)</span>
                              </div>
                           </div>
                        </header>

                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 flex-1 min-h-[500px] lg:min-h-[700px]">
                            {/* MAP COLUMN */}
                            <div className="lg:col-span-12 xl:col-span-8 h-[400px] sm:h-[500px] xl:h-full">
                                <SecurityHeatMap />
                            </div>

                            {/* EXPERT ANALYSIS COLUMN */}
                            <div className="lg:col-span-12 xl:col-span-4 flex flex-col gap-6 overflow-y-auto pr-2 scrollbar-hide h-full max-h-[700px]">
                                <section className="bg-gradient-to-br from-[#111] to-[#0a0a0a] border border-[#222] rounded-3xl p-7 flex flex-col gap-6 shadow-2xl relative border-t-red-600/50">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <div className="w-2 h-2 rounded-full bg-red-600 animate-pulse"></div>
                                            <h3 className="text-xs font-black uppercase tracking-widest text-white">Dictamen de Auditoría</h3>
                                        </div>
                                        <span className="text-[10px] font-black text-gray-500 uppercase tracking-tighter">REF: TDF-2026-X</span>
                                    </div>

                                    <div className="space-y-6">
                                        <div className="flex flex-col gap-3">
                                            <p className="text-[11px] text-gray-400 leading-relaxed italic border-l-2 border-red-800 pl-4 bg-red-950/10 py-2 rounded-r-lg">
                                                "Argentina hoy no permite improvisación. Tras 30 años en seguridad, observo una mutación del crimen hacia nodos logísticos. Tierra del Fuego, por su valor estratégico, requiere una compartimentación de seguridad por ciudad y un enfoque preventivo dinámico."
                                            </p>
                                        </div>

                                        <div className="flex flex-col gap-4">
                                           <h4 className="text-[12px] font-black text-white uppercase tracking-tight flex items-center gap-2">
                                              <MapPin className="w-4 h-4 text-red-500" /> Desglose Operativo por Nodo
                                           </h4>
                                           <div className="space-y-5">
                                              <div className="bg-white/[0.02] p-4 rounded-2xl border border-white/5 group hover:bg-orange-600/5 transition-colors">
                                                 <span className="text-[10px] font-black text-orange-500 uppercase tracking-widest">Río Grande: Foco Logístico</span>
                                                 <p className="text-[11px] text-gray-400 leading-relaxed mt-1">Alta densidad industrial. Riesgo de infiltración y robo logístico. Necesidad de control biométrico y patrullaje predictivo en parques industriales.</p>
                                              </div>
                                              <div className="bg-white/[0.02] p-4 rounded-2xl border border-white/5 group hover:bg-blue-600/5 transition-colors">
                                                 <span className="text-[10px] font-black text-blue-500 uppercase tracking-widest">Ushuaia: Foco Turístico/Nocturno</span>
                                                 <p className="text-[11px] text-gray-400 leading-relaxed mt-1">Vulnerabilidad por flujo estacional. Conflictividad en nocturnidad. Propuesta: Unidades satélites de respuesta rápida.</p>
                                              </div>
                                              <div className="bg-white/[0.02] p-4 rounded-2xl border border-white/5 group hover:bg-emerald-600/5 transition-colors">
                                                 <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">Tolhuin: Nodo de Filtrado Regional</span>
                                                 <p className="text-[11px] text-gray-400 leading-relaxed mt-1">Punto táctico de control de arterias. Vital para prevenir el desplazamiento delictivo entre cabeceras.</p>
                                              </div>
                                           </div>
                                        </div>

                                        <div className="bg-white/5 p-5 rounded-2xl border border-white/5 flex flex-col gap-4">
                                            <h4 className="text-[11px] font-black text-white uppercase tracking-widest flex items-center gap-2">
                                                <TrendingUp className="w-4 h-4 text-emerald-500" /> Plan de Acción Preventivo
                                            </h4>
                                            <div className="grid grid-cols-1 gap-2">
                                                {[
                                                    { t: 'Prevención', d: 'Patrullaje dinámico basado en hotspots de calor.' },
                                                    { t: 'Estrategia', d: 'Protocolo de cierre de rutas USH/RGA ante incidentes.' },
                                                    { t: 'Tecnología', d: 'Sensores de movimiento en perímetros críticos.' }
                                                ].map(item => (
                                                    <div key={item.t} className="flex flex-col p-2 bg-black/40 rounded-lg">
                                                        <span className="text-[9px] font-black text-gray-300 uppercase underline decoration-emerald-500/50">{item.t}</span>
                                                        <span className="text-[10px] text-gray-500 leading-tight">{item.d}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </section>
                            </div>
                        </div>
                    </motion.div>
                  )}

                          {/* SHIP TRAFFIC SECTION */}
                          {activeTab === 'home' && !search && (
                             <div className="bg-[#0e0e0e] border border-[#1f1f1f] rounded-2xl overflow-hidden shadow-2xl flex flex-col">
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
                                    
                                    {/* FLOATING ARRIVALS OVERLAY */}
                                    <div className="absolute top-4 left-4 z-10 w-64 bg-[#0e0e0e]/95 backdrop-blur-xl border border-[#1f1f1f] rounded-2xl shadow-2xl p-4 pointer-events-auto">
                                        <div className="flex items-center gap-2 mb-3 border-b border-[#1f1f1f] pb-2">
                                            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
                                            <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Estado de Arribos</h3>
                                        </div>
                                        
                                        <div className="flex flex-col gap-4">
                                            {/* CURRENT / IN PORT */}
                                            <div className="flex flex-col gap-1.5">
                                                <div className="flex items-center justify-between">
                                                    <span className="text-[8px] font-bold text-emerald-500 uppercase">En Puerto</span>
                                                    <span className="text-[8px] font-bold text-gray-500">22 Abr, 17:51</span>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center shrink-0">
                                                        <Anchor className="w-4 h-4 text-emerald-500" />
                                                    </div>
                                                    <div className="flex flex-col">
                                                        <span className="text-[11px] font-black text-white leading-tight uppercase">EZEQUIEL MB</span>
                                                        <span className="text-[9px] text-gray-400">Catamarán de Pasajeros</span>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="h-px bg-[#1f1f1f]"></div>

                                            {/* UPCOMING / NEXT */}
                                            <div className="flex flex-col gap-3">
                                                <div className="flex flex-col gap-1">
                                                    <div className="flex items-center justify-between">
                                                        <span className="text-[8px] font-bold text-blue-500 uppercase">Próximo Arribo</span>
                                                        <span className="text-[8px] font-bold text-gray-500">28 Abr, 06:00</span>
                                                    </div>
                                                    <div className="flex items-center gap-2 group cursor-default">
                                                        <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                                                        <span className="text-[11px] font-bold text-gray-200 group-hover:text-white transition-colors">ASTURIANO III</span>
                                                        <span className="text-[9px] text-gray-500 ml-auto">Portacontenedores</span>
                                                    </div>
                                                </div>

                                                <div className="flex flex-col gap-1 opacity-70">
                                                    <div className="flex items-center justify-between">
                                                        <span className="text-[8px] font-bold text-gray-400 uppercase">Reciente</span>
                                                        <span className="text-[8px] font-bold text-gray-500">22 Abr, 17:39</span>
                                                    </div>
                                                    <div className="flex items-center gap-2 group cursor-default">
                                                        <div className="w-2 h-2 rounded-full bg-gray-600"></div>
                                                        <span className="text-[11px] font-bold text-gray-300">LM</span>
                                                        <span className="text-[9px] text-gray-500 ml-auto">Catamarán</span>
                                                    </div>
                                                </div>

                                                <div className="flex flex-col gap-1 opacity-70">
                                                    <div className="flex items-center justify-between">
                                                        <span className="text-[8px] font-bold text-gray-400 uppercase">Reciente</span>
                                                        <span className="text-[8px] font-bold text-gray-500">21 Abr, 18:05</span>
                                                    </div>
                                                    <div className="flex items-center gap-2 group cursor-default">
                                                        <div className="w-2 h-2 rounded-full bg-gray-600"></div>
                                                        <span className="text-[11px] font-bold text-gray-300">ONASHAGA</span>
                                                        <span className="text-[9px] text-gray-500 ml-auto">Pasajeros</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                             </div>
                           )}

                           {/* FLIGHT TRAFFIC SECTION - NEW */}
                           {activeTab === 'home' && !search && (
                             <div className="bg-[#0e0e0e] border border-[#1f1f1f] rounded-2xl overflow-hidden shadow-2xl flex flex-col">
                                <div className="flex items-center justify-between px-6 py-5 border-b border-[#1f1f1f] bg-[#0e0e0e]/90 backdrop-blur-sm">
                                    <div className="flex items-center gap-3">
                                        <div className="w-6 h-6 rounded bg-orange-600/20 flex items-center justify-center">
                                            <Plane className="w-3.5 h-3.5 text-orange-500" />
                                        </div>
                                        <h2 className="text-[13px] font-bold text-gray-200 tracking-wide uppercase">
                                            Control de Arribos y Salidas (Aéreo)
                                        </h2>
                                    </div>
                                    <div className="flex gap-4">
                                        <a href="https://www.aeropuertoushuaia.com/" target="_blank" rel="noopener noreferrer" className="text-[10px] font-bold text-gray-500 hover:text-white flex items-center gap-1 transition-colors">
                                            USH <ExternalLink className="w-3 h-3" />
                                        </a>
                                        <a href="https://www.aeropuertosdelmundo.com.ar/aeropuerto-RGA-llegadas/" target="_blank" rel="noopener noreferrer" className="text-[10px] font-bold text-gray-500 hover:text-white flex items-center gap-1 transition-colors">
                                            RGA <ExternalLink className="w-3 h-3" />
                                        </a>
                                    </div>
                                </div>
                                <div className="w-full h-[450px] relative bg-[#0c0c0c]">
                                    <iframe 
                                        src="https://www.radarbox.com/widget?lat=-54.8&lon=-68.3&z=8&theme=dark"
                                        className="w-full h-full border-none opacity-90 hover:opacity-100 transition-opacity"
                                        title="RadarBox - Tierra del Fuego"
                                        loading="lazy"
                                    />
                                    
                                    {/* FLOATING FLIGHT OVERLAY */}
                                    <div className="absolute top-4 left-4 z-10 w-72 bg-[#0e0e0e]/95 backdrop-blur-xl border border-[#1f1f1f] rounded-2xl shadow-2xl p-4 pointer-events-auto">
                                        <div className="flex items-center gap-2 mb-3 border-b border-[#1f1f1f] pb-2">
                                            <div className="w-1.5 h-1.5 rounded-full bg-orange-500 animate-pulse"></div>
                                            <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Tráfico Aéreo USH/RGA</h3>
                                        </div>
                                        
                                        <div className="flex flex-col gap-4 max-h-[350px] overflow-y-auto scrollbar-hide pr-1">
                                            {/* USH ARRIVALS */}
                                            <div className="flex flex-col gap-2">
                                                <span className="text-[9px] font-black text-white/40 uppercase tracking-widest border-b border-white/5 pb-1">Ushuaia - Arribos</span>
                                                <div className="flex flex-col gap-2.5">
                                                    <div className="flex items-center justify-between group">
                                                        <div className="flex flex-col">
                                                            <span className="text-[11px] font-black text-white uppercase italic">AR 1886 <span className="text-[9px] font-normal text-gray-500 not-italic ml-1">AEP</span></span>
                                                            <span className="text-[9px] text-emerald-500 font-bold">Llegó 14:23</span>
                                                        </div>
                                                        <div className="px-2 py-1 bg-emerald-500/10 rounded text-emerald-500 text-[9px] font-black">EN PISTA</div>
                                                    </div>
                                                    <div className="flex items-center justify-between group">
                                                        <div className="flex flex-col">
                                                            <span className="text-[11px] font-black text-white uppercase italic">AR 1898 <span className="text-[9px] font-normal text-gray-500 not-italic ml-1">FTE</span></span>
                                                            <span className="text-[9px] text-blue-500 font-bold">Previsto 15:40</span>
                                                        </div>
                                                        <div className="px-2 py-1 bg-blue-500/10 rounded text-blue-500 text-[9px] font-black uppercase">En Vuelo</div>
                                                    </div>
                                                    <div className="flex items-center justify-between group">
                                                        <div className="flex flex-col">
                                                            <span className="text-[11px] font-black text-white uppercase italic">AR 1926 <span className="text-[9px] font-normal text-gray-500 not-italic ml-1">EZE</span></span>
                                                            <span className="text-[9px] text-gray-400">Prog. 16:55</span>
                                                        </div>
                                                        <div className="px-2 py-1 bg-white/5 rounded text-gray-500 text-[9px] font-black uppercase">A Tiempo</div>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="h-px bg-[#1f1f1f]"></div>

                                            {/* RGA STATUS */}
                                            <div className="flex flex-col gap-2">
                                                <span className="text-[9px] font-black text-white/40 uppercase tracking-widest border-b border-white/5 pb-1">Río Grande - Próximo</span>
                                                <div className="flex items-center justify-between p-2 bg-white/5 rounded-lg border border-white/5">
                                                    <div className="flex flex-col">
                                                        <span className="text-[11px] font-black text-white">AR 1866</span>
                                                        <span className="text-[9px] text-gray-400">Desde AEP</span>
                                                    </div>
                                                    <div className="text-right">
                                                        <span className="text-[10px] font-black text-gray-300">Mañana 02:20</span>
                                                        <div className="text-[8px] text-gray-500 uppercase font-black">Programado</div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
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
              </div>
            )}
          </div>
        </div>
      </main>

      {/* MOBILE FLOATING BOTTOM NAV (Si fuera necesario ajustar luego) */}
      <div className="lg:hidden fixed bottom-6 left-4 right-4 z-40">
        <nav className="bg-[#0c0c0c]/90 backdrop-blur-3xl border border-white/10 shadow-[0_-8px_32px_rgba(0,0,0,0.5)] rounded-2xl h-18 flex items-center justify-around px-4">
            {[
              { id: 'home', icon: LayoutDashboard, label: 'Inicio' },
              { id: 'explore', icon: Compass, label: 'Feeds' },
              { id: 'weather', icon: Cloud, label: 'Clima' },
              { id: 'reports', icon: FileText, label: 'Reportes' },
              { id: 'security', icon: ShieldCheck, label: 'Seguridad' }
            ].map((item) => {
               const Icon = item.icon;
               return (
                <button 
                  key={item.id}
                  onClick={() => setActiveTab(item.id)} 
                  className={`flex flex-col items-center justify-center p-2 rounded-xl transition-all duration-300 w-full ${activeTab === item.id ? 'text-blue-500 scale-110' : 'text-gray-500 hover:text-gray-300'}`}
                >
                  <Icon className={`w-5 h-5 ${activeTab === item.id ? 'drop-shadow-[0_0_8px_rgba(59,130,246,0.5)]' : ''}`} />
                  <span className={`text-[8px] font-black mt-1 uppercase tracking-tighter ${activeTab === item.id ? 'opacity-100' : 'opacity-60'}`}>{item.label}</span>
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
