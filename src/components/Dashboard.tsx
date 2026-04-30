'use client';

import React, { useState, useMemo } from 'react';
import type { Article, FeedSource } from '@/types';
import { LayoutDashboard, Compass, Settings, Bookmark, Search, Cloud, ChevronRight, LayoutGrid, List, LayoutTemplate, X, ExternalLink, Plus, BookmarkCheck, Share2, MoreHorizontal, CheckCircle2, PlayCircle, Flame, Send, MessageCircle, Map, MapPin, Car, ShieldAlert, Anchor, Plane, FileText, Bell, ShieldCheck, TrendingUp, Shield, ListFilter, Radio, Sun, Moon } from 'lucide-react';
import { useTheme } from 'next-themes';
import WeatherDashboard from './WeatherDashboard';
import RadioDashboard from './RadioDashboard';
import { motion, AnimatePresence } from 'framer-motion';

import dynamic from 'next/dynamic';

const WeatherAlertMap = dynamic(() => import('./WeatherAlertMap'), {
    ssr: false,
    loading: () => (
      <div className="w-full h-full flex flex-col items-center justify-center bg-slate-50 dark:bg-[#0a0a0a] text-slate-500 dark:text-gray-500 rounded-xl border border-slate-300 dark:border-[#222]">
        <ShieldAlert className="w-8 h-8 mb-4 animate-pulse text-yellow-500" /> 
        <span className="text-xs font-bold uppercase tracking-widest">Sincronizando Alertas...</span>
      </div>
    )
  });

const SecurityHeatMap = dynamic(() => import('./SecurityHeatMap'), {
    ssr: false,
    loading: () => (
      <div className="w-full h-full flex flex-col items-center justify-center bg-slate-50 dark:bg-[#0a0a0a] text-slate-500 dark:text-gray-500 rounded-xl border border-slate-300 dark:border-[#222]">
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
  const [density, setDensity] = useState<'compact' | 'comfortable'>('comfortable');
  const [showSearchModal, setShowSearchModal] = useState(false);
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);
   const [activeCategory, setActiveCategory] = useState<string>('all');
   const [blocklist, setBlocklist] = useState<string[]>(['pautas', 'anuncio', 'publicidad', 'clickbait']);
   const [isFilterOpen, setIsFilterOpen] = useState(false);
   const [isSidebarExpanded, setIsSidebarExpanded] = useState(false);
  
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
  // Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setShowSearchModal(prev => !prev);
      }
      if (e.key === 'Escape') {
        setShowSearchModal(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const feedArticlesToDisplay = useMemo(() => {
    const topIds = new Set(topVisualArticles.map(a => a.id));
    const base = filteredArticles.filter(a => !topIds.has(a.id));
    if (activeTab === 'home' && !search) return base.slice(0, 10);
    return base.slice(0, 50);
  }, [filteredArticles, topVisualArticles, activeTab, search]);

  return (
    <div className="flex h-screen bg-slate-50 dark:bg-[#070707] text-slate-800 dark:text-[#e0e0e0] font-sans overflow-hidden transition-colors duration-200 relative">
      {/* Animated Mesh Gradient Background */}
      <div className="absolute inset-0 z-0 opacity-[0.08] dark:opacity-20 pointer-events-none overflow-hidden">
        <div className="absolute -top-[20%] -left-[10%] w-[60%] h-[60%] bg-blue-600/40 dark:bg-blue-600/30 rounded-full blur-[120px] animate-pulse"></div>
        <div className="absolute top-[30%] -right-[10%] w-[50%] h-[50%] bg-orange-600/30 dark:bg-orange-600/20 rounded-full blur-[100px] animate-pulse [animation-delay:2s]"></div>
        <div className="absolute -bottom-[20%] left-[20%] w-[50%] h-[50%] bg-indigo-600/30 dark:bg-red-600/20 rounded-full blur-[100px] animate-pulse [animation-delay:4s]"></div>
      </div>


      
      {/* 1. ULTRA SLIM DYNAMIC SIDEBAR */}
      <motion.aside 
        initial={false}
        animate={{ width: isSidebarExpanded ? 240 : 72 }}
        onMouseEnter={() => setIsSidebarExpanded(true)}
        onMouseLeave={() => setIsSidebarExpanded(false)}
        className="bg-white/80 dark:bg-[#0c0c0c]/80 backdrop-blur-2xl border-r border-slate-200 dark:border-white/5 hidden lg:flex flex-col items-center shrink-0 z-50 py-4 gap-6 overflow-hidden shadow-2xl transition-all duration-300 ease-in-out"
      >
        <div className="flex items-center gap-4 w-full px-4 mb-4">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-700 rounded-xl flex items-center justify-center text-white font-bold tracking-tighter shadow-lg shadow-blue-500/20 cursor-pointer group hover:scale-105 transition-transform shrink-0">
            MW
          </div>
          <AnimatePresence>
            {isSidebarExpanded && (
              <motion.span 
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                className="text-lg font-black tracking-tighter text-slate-900 dark:text-white whitespace-nowrap font-display"
              >
                WIKIAPP <span className="text-blue-500">PRO</span>
              </motion.span>
            )}
          </AnimatePresence>
        </div>

        <nav className="flex-1 w-full space-y-1 overflow-y-auto scrollbar-hide py-2 px-2">
          {[
            { id: 'home', icon: LayoutDashboard, label: 'Panel de Control', sub: 'Home' },
            { id: 'explore', icon: Compass, label: 'Fuentes de Inteligencia', sub: 'Feeds' },
            { id: 'weather', icon: Cloud, label: 'Clima & Alertas', sub: 'Clima' },
            { id: 'reports', icon: FileText, label: 'Análisis Estratégico', sub: 'Informes' },
            { id: 'security', icon: ShieldCheck, label: 'Centro de Seguridad', sub: 'Seguridad', color: 'text-red-500', activeBg: 'bg-red-500' },
            { id: 'radio', icon: Radio, label: 'Dial Fueguino', sub: 'Radio' },
            { id: 'logistics', icon: Anchor, label: 'Tráfico Regional', sub: 'Arribos' }
          ].map((item) => (
            <button 
              key={item.id}
              onClick={() => setActiveTab(item.id)} 
              className={`relative w-full flex items-center gap-4 px-3 py-3 rounded-xl group transition-all duration-200 ${activeTab === item.id ? (item.id === 'security' ? 'bg-red-500/10 text-red-500' : 'bg-blue-500/10 text-blue-500') : 'text-slate-500 dark:text-gray-500 hover:bg-slate-100 dark:hover:bg-white/5'}`}
            >
              <item.icon className={`w-5 h-5 shrink-0 ${activeTab === item.id ? (item.color || 'text-blue-500') : 'group-hover:scale-110 transition-transform'}`} />
              
              <AnimatePresence>
                {isSidebarExpanded && (
                  <motion.div 
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -10 }}
                    className="flex flex-col items-start overflow-hidden"
                  >
                    <span className="text-[13px] font-bold whitespace-nowrap">{item.label}</span>
                    <span className="text-[10px] font-medium opacity-60 uppercase tracking-widest">{item.sub}</span>
                  </motion.div>
                )}
              </AnimatePresence>
              
              {activeTab === item.id && (
                <motion.div 
                  layoutId="active-nav-indicator"
                  className={`absolute left-0 w-1 h-6 rounded-r-full ${item.id === 'security' ? 'bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.5)]' : 'bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.5)]'}`} 
                />
              )}
            </button>
          ))}
        </nav>

        <div className="w-full px-2 space-y-1 pb-4 border-t border-slate-200 dark:border-white/5 pt-4">
            <button className="w-full flex items-center gap-4 px-3 py-3 rounded-xl text-slate-500 dark:text-gray-500 hover:bg-slate-100 dark:hover:bg-white/5 transition-all group">
              <Search className="w-5 h-5 shrink-0 group-hover:scale-110 transition-transform" />
              {isSidebarExpanded && <span className="text-[13px] font-bold">Búsqueda Rápida</span>}
            </button>
            <button className="w-full flex items-center gap-4 px-3 py-3 rounded-xl text-slate-500 dark:text-gray-500 hover:bg-slate-100 dark:hover:bg-white/5 transition-all group">
              <Settings className="w-5 h-5 shrink-0 group-hover:scale-110 transition-transform" />
              {isSidebarExpanded && <span className="text-[13px] font-bold">Configuración</span>}
            </button>
        </div>
      </motion.aside>

      {/* 2. MAIN CONTENT AREA */}
      <main className="flex-1 flex flex-col min-w-0 relative">
        
        {/* PREMIUM TOP NAVIGATION */}
        <div className="px-4 py-4 md:px-8 shrink-0 z-30 sticky top-0 bg-white/60 dark:bg-[#070707]/60 backdrop-blur-2xl border-b border-slate-200 dark:border-white/10 shadow-glass">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                   <div className="lg:hidden w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-500/30 mr-2 shrink-0">
                      <LayoutDashboard className="w-5 h-5 text-white" />
                   </div>
                   <div className="flex flex-col md:flex-row md:items-baseline gap-1 md:gap-3">
                      <h1 className="text-xl md:text-2xl font-black text-slate-900 dark:text-white tracking-tighter uppercase font-display">
                         WikiApp <span className="text-[10px] bg-blue-500/20 px-2 py-0.5 rounded-full text-blue-500 font-black border border-blue-500/20 ml-1">PRO V2</span>
                      </h1>
                      <div className="flex items-center gap-2">
                        <ChevronRight className="w-3.5 h-3.5 text-slate-400 hidden md:block" />
                        <span className="text-[10px] md:text-[11px] font-bold text-slate-500 dark:text-gray-400 uppercase tracking-[0.2em] font-mono">
                            {activeTab === 'home' ? 'Monitor Regional' : activeTab === 'explore' ? 'Fuentes de Inteligencia' : activeTab === 'security' ? 'Centro de Auditoría' : activeTab === 'logistics' ? 'Control de Tráfico' : activeTab === 'radio' ? 'Dial Fueguino' : 'Sistema'}
                        </span>
                      </div>
                   </div>
                </div>
                <div className="flex items-center gap-2 md:gap-4">
                    <div className="hidden sm:flex items-center gap-2 text-[10px] font-black text-slate-500 dark:text-gray-400 uppercase tracking-widest bg-slate-100 dark:bg-white/5 px-4 py-2 rounded-full border border-slate-200 dark:border-white/5">
                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                        Sincronización <span className="text-emerald-500 ml-1">Estable</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                        <button onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')} className="p-2.5 text-slate-500 dark:text-gray-400 hover:text-blue-500 hover:bg-blue-500/10 rounded-xl transition-all" title="Cambiar Tema">
                            {mounted && theme === 'dark' ? <Sun className="w-5 h-5 text-yellow-500" /> : mounted ? <Moon className="w-5 h-5" /> : <div className="w-5 h-5" />}
                        </button>
                        <button className="p-2.5 text-slate-500 dark:text-gray-400 hover:text-blue-500 hover:bg-blue-500/10 rounded-xl transition-all"><Bell className="w-5 h-5" /></button>
                        <button className="p-2.5 text-slate-500 dark:text-gray-400 hover:text-blue-500 hover:bg-blue-500/10 rounded-xl transition-all"><Settings className="w-5 h-5" /></button>
                    </div>
                </div>
            </div>
        </div>
                     {/* 🖥️ MODERNA BARRA DE HERRAMIENTAS - SEARCH + FILTROS + TABS */}
             {/* 🖥️ MODERNA BARRA DE HERRAMIENTAS - SEARCH + FILTROS + TABS */}
            {activeTab === 'home' && (
                <div className="flex flex-col xl:flex-row items-stretch xl:items-center gap-6 py-6 px-4 md:px-8 border-b border-slate-200 dark:border-white/5 bg-white/40 dark:bg-white/[0.01] backdrop-blur-3xl sticky top-[80px] z-20">
                    
                    {/* CUADRO DE BÚSQUEDA PRO */}
                    <div className="relative w-full xl:w-96 group">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
                        <input 
                            type="text" 
                            placeholder="Buscar en el flujo de noticias..." 
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full bg-slate-100/50 dark:bg-black/40 border border-slate-200 dark:border-white/10 rounded-2xl py-3.5 pl-12 pr-4 text-[13px] font-medium text-slate-800 dark:text-gray-200 placeholder:text-slate-500 focus:outline-none focus:border-blue-500/50 focus:ring-4 focus:ring-blue-500/10 transition-all shadow-sm"
                        />
                    </div>

                    {/* FILTRO DE CATEGORÍAS (DROPDOWN) */}
                    <div className="flex items-center gap-3 w-full xl:w-auto">
                        <div className="px-4 py-3 bg-slate-100/50 dark:bg-white/5 rounded-2xl border border-slate-200 dark:border-white/10 flex items-center gap-2 shrink-0">
                            <ListFilter className="w-4 h-4 text-blue-500" />
                            <span className="text-[11px] font-bold text-slate-600 dark:text-gray-400 uppercase tracking-widest hidden sm:inline">Categoría</span>
                        </div>
                        <div className="relative flex-1 xl:w-56 group">
                            <select 
                                value={activeCategory}
                                onChange={(e) => setActiveCategory(e.target.value)}
                                className="w-full bg-slate-100/50 dark:bg-black/40 border border-slate-200 dark:border-white/10 rounded-2xl py-3 px-4 text-[12px] font-bold uppercase text-slate-700 dark:text-gray-300 focus:outline-none focus:border-blue-500/50 appearance-none cursor-pointer"
                            >
                                <option value="all">Todo el Panorama</option>
                                <option value="tecnologia">Tecnología</option>
                                <option value="economia">Economía</option>
                                <option value="seguridad">Seguridad</option>
                                <option value="educacion">Educación</option>
                                <option value="transporte">Transporte</option>
                            </select>
                            <ChevronRight className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 rotate-90 pointer-events-none" />
                        </div>
                    </div>

                    {/* PESTAÑAS GEOGRÁFICAS FIJAS */}
                    <div className="flex bg-slate-100/50 dark:bg-black/40 p-1.5 rounded-[1.25rem] border border-slate-200 dark:border-white/5 items-center">
                        {[
                            { id: 'all', label: 'Panorama' },
                            { id: 'internacional', label: 'Global' },
                            { id: 'nacional', label: 'Nacional' },
                            { id: 'provincial', label: 'Provincial' }
                        ].map((item) => (
                            <button 
                              key={item.id} 
                              onClick={() => setActiveCategory(item.id)}
                              className={`px-5 md:px-7 py-2.5 rounded-[1rem] text-[11px] font-black uppercase tracking-tight transition-all duration-300 ${activeCategory === item.id ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30' : 'text-slate-500 dark:text-gray-500 hover:text-slate-900 dark:hover:text-white hover:bg-white dark:hover:bg-white/5'}`}
                            >
                                {item.label}
                            </button>
                        ))}
                    </div>

                    {/* SELECTORES DE VISTA Y DENSIDAD */}
                    <div className="flex items-center gap-3 ml-auto">
                        {/* Density Toggle */}
                        <div className="hidden md:flex bg-slate-100/50 dark:bg-black/40 p-1 rounded-xl border border-slate-200 dark:border-white/5 items-center">
                            <button 
                                onClick={() => setDensity('compact')} 
                                className={`px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all ${density === 'compact' ? 'bg-white dark:bg-white/10 text-blue-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                            >
                                Compacto
                            </button>
                            <button 
                                onClick={() => setDensity('comfortable')} 
                                className={`px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all ${density === 'comfortable' ? 'bg-white dark:bg-white/10 text-blue-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                            >
                                Amplio
                            </button>
                        </div>

                        <div className="flex items-center gap-1 bg-slate-100/50 dark:bg-black/40 p-1.5 rounded-2xl border border-slate-200 dark:border-white/5">
                          <button onClick={() => setViewMode('list')} className={`p-2.5 rounded-xl transition-all ${viewMode === 'list' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-500 hover:text-slate-900 dark:text-gray-400 dark:hover:text-white hover:bg-white dark:hover:bg-white/5'}`} title="Vista de Lista"><List className="w-5 h-5" /></button>
                          <button onClick={() => setViewMode('grid')} className={`p-2.5 rounded-xl transition-all ${viewMode === 'grid' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-500 hover:text-slate-900 dark:text-gray-400 dark:hover:text-white hover:bg-white dark:hover:bg-white/5'}`} title="Vista de Galería"><LayoutGrid className="w-5 h-5" /></button>
                          <button onClick={() => setViewMode('magazine')} className={`p-2.5 rounded-xl transition-all ${viewMode === 'magazine' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-500 hover:text-slate-900 dark:text-gray-400 dark:hover:text-white hover:bg-white dark:hover:bg-white/5'}`} title="Vista de Revista"><LayoutTemplate className="w-5 h-5" /></button>
                        </div>
                    </div>
                </div>
            )}

        {/* CONTENIDO SCROLL */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden p-4 md:p-6 lg:p-8 relative z-10 scrollbar-hide">
          <div className="max-w-[1600px] mx-auto space-y-6">
            
            {activeTab === 'weather' ? (
              <WeatherDashboard />
            ) : (
              <div className="flex flex-col gap-8">
                  
                  {/* Búsqueda activa info */}
                  {search && (
                    <div className="w-full bg-white dark:bg-[#121212] border border-slate-300 dark:border-[#222] rounded-xl p-4 flex items-center justify-between">
                        <input 
                            type="text"
                            placeholder="Buscar en el universo de feeds..."
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            className="bg-transparent text-slate-900 dark:text-white outline-none w-full text-sm font-medium"
                            autoFocus
                        />
                        <Search className="w-4 h-4 text-slate-500 dark:text-gray-500" />
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
                                  className="group relative h-64 md:h-80 bg-white dark:bg-[#111] rounded-2xl overflow-hidden border border-slate-300 dark:border-[#222] cursor-pointer shadow-2xl"
                               >
                                  {article.thumbnail ? (
                                      <img src={article.thumbnail} className="w-full h-full object-cover opacity-60 group-hover:scale-105 group-hover:opacity-80 transition-all duration-700" alt="" />
                                  ) : (
                                      <div className="w-full h-full bg-gradient-to-br from-[#1a1a1a] to-black"></div>
                                  )}
                                  <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent"></div>
                                  
                                  {/* YouTube overlay if applicable */}
                                  {isVid && (
                                     <div className="absolute top-4 right-4 bg-red-600/90 text-slate-900 dark:text-white p-2 rounded-full backdrop-blur shadow-lg">
                                        <PlayCircle className="w-6 h-6" />
                                     </div>
                                  )}
                                  {/* Category Badge with Fire Icon */}
                                  {!isVid && (
                                     <div className="absolute top-4 right-4 bg-orange-600/90 text-slate-900 dark:text-white px-3 py-1 rounded-full text-[10px] font-black uppercase shadow-lg flex items-center gap-1 backdrop-blur ring-1 ring-white/20">
                                        <Flame className="w-3 h-3" /> 
                                        {feeds.find(f => f.id === article.sourceId)?.category === 'internacional' ? 'Internacional' : 
                                         feeds.find(f => f.id === article.sourceId)?.category === 'nacional' ? 'Argentina' : 'TDF'}
                                     </div>
                                  )}

                                  <div className="absolute inset-x-0 bottom-0 p-5 flex flex-col gap-2 transform group-hover:-translate-y-2 transition-transform duration-300">
                                      <span className="text-[10px] font-black text-blue-400 uppercase tracking-widest bg-slate-100/80 dark:bg-black/50 w-max px-2 py-1 rounded-md mb-1 border border-slate-200 dark:border-white/5 backdrop-blur-md">
                                          {feeds.find(f => f.id === article.sourceId)?.name}
                                      </span>
                                      <h3 className="text-xl md:text-2xl font-bold text-slate-900 dark:text-white leading-tight line-clamp-3 text-shadow-md">
                                          {article.title}
                                      </h3>
                                      <div className="flex items-center gap-3 mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                          <button onClick={(e) => { e.stopPropagation(); window.open(`https://wa.me/?text=${encodeURIComponent(article.title + ' ' + article.link)}`, '_blank'); }} className="p-2 bg-black/50 hover:bg-green-500 text-white rounded-lg transition-all backdrop-blur-md" title="Compartir en WhatsApp"><MessageCircle className="w-4 h-4" /></button>
                                          <button onClick={(e) => { e.stopPropagation(); window.open(`https://t.me/share/url?url=${encodeURIComponent(article.link)}&text=${encodeURIComponent(article.title)}`, '_blank'); }} className="p-2 bg-black/50 hover:bg-blue-500 text-white rounded-lg transition-all backdrop-blur-md" title="Compartir en Telegram"><Send className="w-4 h-4" /></button>
                                      </div>
                                  </div>
                               </motion.div>
                            )
                        })}
                     </div>
                  )}

                  <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
                      {/* MAIN CONTENT FEED LIST */}
                      <div className="xl:col-span-8 flex flex-col gap-6">
                         <div className="bg-white dark:bg-[#0e0e0e] border border-slate-200 dark:border-[#1f1f1f] rounded-2xl overflow-hidden shadow-2xl flex flex-col">
                            <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-[#1f1f1f] bg-white dark:bg-[#0e0e0e]/90 backdrop-blur-sm sticky top-0 z-10">
                                <div className="flex items-center gap-3">
                                    <div className="w-6 h-6 rounded bg-blue-600/20 flex items-center justify-center">
                                        <BookmarkCheck className="w-3.5 h-3.5 text-blue-500" />
                                    </div>
                                    <h2 className="text-[13px] font-bold text-slate-800 dark:text-gray-200 tracking-wide uppercase">
                                        {activeCategory === 'all' ? 'Flujo Dinámico' : activeCategory.replace(/-/g, ' ')}
                                        <span className="text-slate-500 dark:text-gray-500 ml-2 font-normal text-[11px]">{feedArticlesToDisplay.length} resultados</span>
                                    </h2>
                                </div>
                            </div>
                                                   <motion.div layout className={`flex ${viewMode === 'list' ? 'flex-col shadow-inner' : viewMode === 'grid' ? 'flex-row flex-wrap p-4 md:p-6 gap-6' : 'flex-col p-2 md:p-4'}`}>
                                <AnimatePresence mode="popLayout">
                                    {feedArticlesToDisplay.map(article => {
                                        const isVid = isYouTube(article.link);

                                        // VIEW: LIST
                                        if (viewMode === 'list') return (
                                            <motion.div 
                                                initial={{ opacity: 0, x: -10 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                exit={{ opacity: 0, x: 10 }}
                                                key={article.id} 
                                                onClick={() => setSelectedArticle(article)}
                                                className={`group flex flex-col sm:flex-row sm:items-center px-6 ${density === 'compact' ? 'py-3' : 'py-5'} border-b border-slate-200 dark:border-white/5 hover:bg-slate-50 dark:hover:bg-white/[0.03] cursor-pointer transition-all border-l-4 border-l-transparent hover:border-l-blue-600 relative overflow-hidden`}
                                            >
                                                {/* Reading Indicator Placeholder */}
                                                <div className="absolute top-0 left-0 w-full h-[2px] bg-blue-600/0 group-hover:bg-blue-600/20 transition-all"></div>
                                                
                                                <div className={`hidden sm:flex ${density === 'compact' ? 'w-10' : 'w-12'} shrink-0 items-center justify-center`}>
                                                    <div className={`${density === 'compact' ? 'w-8 h-8 rounded-lg' : 'w-10 h-10 rounded-xl'} flex items-center justify-center transition-all ${isVid ? 'bg-red-500/10 text-red-500 group-hover:bg-red-500 group-hover:text-white' : 'bg-blue-500/10 text-blue-500 group-hover:bg-blue-600 group-hover:text-white'}`}>
                                                        {isVid ? <PlayCircle className={density === 'compact' ? 'w-4 h-4' : 'w-5 h-5'} /> : <FileText className={density === 'compact' ? 'w-4 h-4' : 'w-5 h-5'} />}
                                                    </div>
                                                </div>
                                                <div className={`flex-1 min-w-0 px-4 ${density === 'compact' ? 'space-y-0.5' : 'space-y-1.5'}`}>
                                                    <h3 className={`${density === 'compact' ? 'text-[13px]' : 'text-[15px]'} font-bold text-slate-800 dark:text-gray-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 leading-snug transition-colors font-display`}>
                                                        {article.title}
                                                    </h3>
                                                    <div className="flex items-center gap-3 text-[10px] font-black uppercase tracking-widest">
                                                       <span className="text-blue-600 bg-blue-500/10 px-2 py-0.5 rounded">{sourceName}</span>
                                                       <span className="text-slate-400 dark:text-gray-500 font-mono">{getRelativeTime(article.pubDate)}</span>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-2 mt-3 sm:mt-0 shrink-0 opacity-0 group-hover:opacity-100 transition-all translate-x-2 group-hover:translate-x-0">
                                                    <button onClick={(e) => { e.stopPropagation(); window.open(`https://wa.me/?text=${encodeURIComponent(article.title + ' ' + article.link)}`, '_blank'); }} className={`${density === 'compact' ? 'p-2' : 'p-2.5'} bg-slate-100 dark:bg-white/5 hover:bg-green-500/20 text-slate-500 dark:text-gray-400 hover:text-green-500 rounded-xl transition-all`}><MessageCircle className="w-4 h-4" /></button>
                                                    <button onClick={(e) => { e.stopPropagation(); window.open(`https://t.me/share/url?url=${encodeURIComponent(article.link)}&text=${encodeURIComponent(article.title)}`, '_blank'); }} className={`${density === 'compact' ? 'p-2' : 'p-2.5'} bg-slate-100 dark:bg-white/5 hover:bg-blue-500/20 text-slate-500 dark:text-gray-400 hover:text-blue-400 rounded-xl transition-all`}><Send className="w-4 h-4" /></button>
                                                </div>
                                            </motion.div>
                                        );
                              );

                                        // VIEW: GRID
                                        if (viewMode === 'grid') return (
                                            <motion.div 
                                                initial={{ opacity: 0, scale: 0.95 }}
                                                whileHover={{ y: -5 }}
                                                animate={{ opacity: 1, scale: 1 }}
                                                exit={{ opacity: 0, scale: 0.95 }}
                                                key={article.id} 
                                                onClick={() => setSelectedArticle(article)}
                                                className={`group relative w-full sm:w-[calc(50%-12px)] lg:w-[calc(33.333%-16px)] xl:w-[calc(25%-18px)] bg-white/50 dark:bg-white/[0.02] backdrop-blur-sm border border-slate-200 dark:border-white/5 rounded-3xl overflow-hidden hover:border-blue-500/50 hover:shadow-2xl hover:shadow-blue-500/10 transition-all cursor-pointer flex flex-col`}
                                            >
                                                {article.thumbnail && (
                                                    <div className="aspect-[16/10] overflow-hidden relative">
                                                        <img src={article.thumbnail} alt="" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000" />
                                                        <div className="absolute inset-0 bg-gradient-to-t from-[#0e0e0e] via-transparent to-transparent opacity-60"></div>
                                                        {isVid && (
                                                            <div className="absolute inset-0 flex items-center justify-center">
                                                                <div className={`${density === 'compact' ? 'w-10 h-10' : 'w-14 h-14'} rounded-full bg-red-600/20 backdrop-blur-xl flex items-center justify-center border border-red-500/30 group-hover:scale-110 transition-transform`}>
                                                                    <PlayCircle className={density === 'compact' ? 'w-6 h-6' : 'w-8 h-8'} text-white />
                                                                </div>
                                                            </div>
                                                        )}
                                                        <div className="absolute top-4 left-4">
                                                            <span className="text-[9px] font-black text-white uppercase tracking-widest bg-black/40 backdrop-blur-md px-2.5 py-1 rounded-lg border border-white/10">{sourceName}</span>
                                                        </div>
                                                    </div>
                                                )}
                                                {!article.thumbnail && (
                                                    <div className={`aspect-[16/10] bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-900 dark:to-black flex items-center justify-center`}>
                                                        <FileText className={`${density === 'compact' ? 'w-8 h-8' : 'w-10 h-10'} text-slate-300 dark:text-slate-800`} />
                                                    </div>
                                                )}
                                                <div className={`${density === 'compact' ? 'p-4' : 'p-6'} flex flex-col flex-1 gap-3`}>
                                                    <div className="flex items-center justify-between">
                                                        <span className="text-[10px] text-slate-400 dark:text-gray-500 font-black uppercase tracking-widest font-mono">{getRelativeTime(article.pubDate)}</span>
                                                        <Bookmark className="w-3.5 h-3.5 text-slate-300 dark:text-gray-700 hover:text-blue-500 transition-colors" />
                                                    </div>
                                                    <h3 className={`${density === 'compact' ? 'text-[13px]' : 'text-[15px]'} font-bold text-slate-800 dark:text-gray-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 leading-tight line-clamp-3 transition-colors font-display`}>
                                                        {article.title}
                                                    </h3>
                                                </div>
                                                <div className="absolute bottom-4 right-4 flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-all translate-y-2 group-hover:translate-y-0 bg-white dark:bg-black/80 backdrop-blur-xl p-2 rounded-2xl border border-slate-200 dark:border-white/10 shadow-xl">
                                                    <button onClick={(e) => { e.stopPropagation(); window.open(`https://wa.me/?text=${encodeURIComponent(article.title + ' ' + article.link)}`, '_blank'); }} className="p-2 hover:bg-green-500/20 text-slate-600 dark:text-gray-400 hover:text-green-500 rounded-lg transition-all"><MessageCircle className="w-4 h-4" /></button>
                                                    <button onClick={(e) => { e.stopPropagation(); window.open(`https://t.me/share/url?url=${encodeURIComponent(article.link)}&text=${encodeURIComponent(article.title)}`, '_blank'); }} className="p-2 hover:bg-blue-500/20 text-slate-600 dark:text-gray-400 hover:text-blue-400 rounded-lg transition-all"><Send className="w-4 h-4" /></button>
                                                </div>
                                            </motion.div>
                                        );


                                        // VIEW: MAGAZINE
                                        if (viewMode === 'magazine') return (
                                            <motion.div 
                                                initial={{ opacity: 0, y: 30 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                exit={{ opacity: 0, y: 30 }}
                                                key={article.id} 
                                                onClick={() => setSelectedArticle(article)}
                                                className="group flex flex-col lg:flex-row gap-8 md:gap-12 p-6 md:p-10 border-b border-slate-200 dark:border-white/5 hover:bg-slate-50/50 dark:hover:bg-white/[0.01] transition-all cursor-pointer relative overflow-hidden"
                                            >
                                                <div className="w-full lg:w-[450px] aspect-[16/10] lg:h-[280px] shrink-0 overflow-hidden rounded-[2.5rem] relative shadow-2xl">
                                                    <img src={article.thumbnail || 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?auto=format&fit=crop&q=80&w=600'} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-[2000ms]" />
                                                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
                                                    {isVid && (
                                                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-20 h-20 rounded-full bg-white/20 backdrop-blur-xl flex items-center justify-center border border-white/30 opacity-0 group-hover:opacity-100 transition-all scale-90 group-hover:scale-100">
                                                            <PlayCircle className="w-10 h-10 text-white" />
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="flex flex-col flex-1 justify-center gap-6">
                                                    <div className="flex items-center gap-4">
                                                       <span className="text-[11px] font-black text-blue-600 dark:text-blue-400 uppercase tracking-[0.25em] font-mono">{sourceName}</span>
                                                       <div className="w-1.5 h-1.5 rounded-full bg-slate-300 dark:bg-slate-700"></div>
                                                       <span className="text-[11px] font-bold text-slate-500 dark:text-gray-500 uppercase tracking-widest font-mono">{getRelativeTime(article.pubDate)}</span>
                                                    </div>
                                                    <h3 className="text-3xl md:text-4xl lg:text-5xl font-black text-slate-900 dark:text-white leading-[1.05] tracking-tight transition-colors group-hover:text-blue-600 dark:group-hover:text-blue-400 font-display">
                                                        {article.title}
                                                    </h3>
                                                    <p className="text-[17px] text-slate-600 dark:text-gray-400 line-clamp-3 leading-relaxed font-medium max-w-3xl">
                                                        {stripHtml(article.description || '').slice(0, 300)}...
                                                    </p>
                                                    <div className="flex items-center gap-4 mt-2">
                                                        <span className="text-[12px] font-black text-blue-600 dark:text-blue-400 uppercase tracking-widest border-b-2 border-blue-600/20 group-hover:border-blue-600 transition-all pb-1">Seguir leyendo</span>
                                                        <div className="flex items-center gap-3 ml-auto opacity-0 group-hover:opacity-100 transition-all translate-x-4 group-hover:translate-x-0">
                                                            <button onClick={(e) => { e.stopPropagation(); window.open(`https://wa.me/?text=${encodeURIComponent(article.title + ' ' + article.link)}`, '_blank'); }} className="p-3 bg-slate-100 dark:bg-white/5 hover:bg-green-500/20 text-slate-600 dark:text-gray-400 hover:text-green-500 rounded-2xl transition-all border border-slate-200 dark:border-white/5" title="Compartir en WhatsApp"><MessageCircle className="w-5 h-5" /></button>
                                                            <button onClick={(e) => { e.stopPropagation(); window.open(`https://t.me/share/url?url=${encodeURIComponent(article.link)}&text=${encodeURIComponent(article.title)}`, '_blank'); }} className="p-3 bg-slate-100 dark:bg-white/5 hover:bg-blue-500/20 text-slate-600 dark:text-gray-400 hover:text-blue-400 rounded-2xl transition-all border border-slate-200 dark:border-white/5" title="Compartir en Telegram"><Send className="w-5 h-5" /></button>
                                                        </div>
                                                    </div>
                                                </div>
                                            </motion.div>
                                        );


                                        return null;
                                    })}
                                </AnimatePresence>
                                 {feedArticlesToDisplay.length === 0 && (
                                    <div className="p-8 text-center text-sm text-slate-500 dark:text-gray-500">Sin artículos recientes compatibles.</div>
                                 )}
                                 
                                 {/* VER + BUTTON FOR HOME */}
                                 {activeTab === 'home' && !search && (filteredArticles.length - topVisualArticles.length) > 10 && (
                                    <div className="p-6 border-t border-slate-200 dark:border-[#1f1f1f] flex justify-center bg-white dark:bg-[#0e0e0e]/50">
                                        <button 
                                            onClick={() => setActiveTab('explore')}
                                            className="flex items-center gap-2 px-6 py-2.5 bg-slate-100 dark:bg-[#1a1a1a] hover:bg-slate-200 dark:bg-[#222] border border-slate-300 dark:border-[#333] rounded-full text-[11px] font-black uppercase tracking-widest text-blue-500 hover:text-blue-400 transition-all group font-bold"
                                        >
                                            Ver + Noticias <ChevronRight className="w-3.5 h-3.5 transform group-hover:translate-x-1 transition-transform" />
                                        </button>
                                    </div>
                                 )}
                             </motion.div>
                          </div>

                  {/* 4. WEATHER DASHBOARD */}
                  {activeTab === 'weather' && <WeatherDashboard />}

                  {/* RADIO DASHBOARD */}
                  {activeTab === 'radio' && <RadioDashboard />}

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
                              <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tighter uppercase">Seguridad y Realidad Social</h1>
                           </div>
                           <p className="text-slate-500 dark:text-gray-500 text-sm max-w-2xl">Panorama estratégico integral desde la geopolítica internacional hasta la estabilidad social provincial.</p>
                        </header>

                        <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
                            {/* CONFIGURATION COLUMN */}
                            <div className="xl:col-span-4 flex flex-col gap-6">
                                <section className="bg-white dark:bg-[#0e0e0e] border border-slate-200 dark:border-[#1f1f1f] rounded-3xl p-6 flex flex-col gap-6 shadow-2xl">
                                    <div className="flex items-center justify-between">
                                        <h3 className="text-xs font-black uppercase tracking-widest text-slate-600 dark:text-gray-400">Configuración</h3>
                                        <div className="flex h-2 w-2 relative">
                                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                                            <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
                                        </div>
                                    </div>

                                    <div className="flex flex-col gap-4">
                                        <div className="flex flex-col gap-2">
                                            <label className="text-[10px] font-bold text-slate-500 dark:text-gray-500 uppercase tracking-tight">Frecuencia de Envío</label>
                                            <div className="grid grid-cols-2 gap-2 bg-slate-100 dark:bg-[#161616] p-1 rounded-xl">
                                                <button className="py-2 rounded-lg bg-blue-600 text-slate-900 dark:text-white text-[11px] font-black uppercase">Diario</button>
                                                <button className="py-2 rounded-lg text-slate-500 dark:text-gray-500 text-[11px] font-black uppercase hover:bg-slate-100 dark:bg-white/5 transition-colors">Semanal</button>
                                            </div>
                                        </div>

                                        <div className="flex flex-col gap-2">
                                            <label className="text-[10px] font-bold text-slate-500 dark:text-gray-500 uppercase tracking-tight">Destino</label>
                                            <div className="flex items-center gap-3 px-4 py-3 bg-slate-100 dark:bg-[#161616] border border-slate-300 dark:border-[#222] rounded-xl">
                                                <Bell className="w-4 h-4 text-orange-500" />
                                                <span className="text-[11px] font-bold text-slate-700 dark:text-gray-300">Notificación en App y Email</span>
                                            </div>
                                        </div>

                                        <div className="flex flex-col gap-3 mt-2">
                                            <label className="text-[10px] font-bold text-slate-500 dark:text-gray-500 uppercase tracking-tight">Ejes de Monitoreo</label>
                                            <div className="space-y-2">
                                                {['Seguridad Internacional', 'Paz Social Nacional', 'Resguardo Provincial', 'Conflictos Sociales'].map(cat => (
                                                    <div key={cat} className="flex items-center justify-between px-3 py-2 bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/5 rounded-lg">
                                                        <span className="text-[11px] font-bold text-slate-700 dark:text-gray-300">{cat}</span>
                                                        <div className="w-8 h-4 bg-orange-600 rounded-full relative"><div className="absolute right-1 top-1 w-2 h-2 bg-white rounded-full"></div></div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>

                                        <button className="mt-4 w-full py-4 bg-white text-black font-black uppercase tracking-widest text-[11px] rounded-2xl hover:bg-blue-500 hover:text-slate-900 dark:text-white transition-all shadow-xl shadow-blue-900/10 active:scale-95">
                                            Generar Reporte Ahora
                                        </button>
                                    </div>
                                </section>
                            </div>

                            {/* PREVIEW/HISTORY COLUMN */}
                            <div className="xl:col-span-8 flex flex-col gap-6">
                                <section className="bg-white dark:bg-[#0e0e0e] border border-slate-200 dark:border-[#1f1f1f] rounded-3xl p-8 flex flex-col gap-6 shadow-2xl relative overflow-hidden group">
                                    <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity">
                                        <FileText className="w-48 h-48 text-blue-500" />
                                    </div>

                                    <div className="flex flex-col gap-1 z-10">
                                        <span className="text-[10px] font-black text-orange-500 uppercase tracking-[0.2em]">Informe Semanal de Riesgos y Estabilidad</span>
                                        <h2 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">Análisis de Realidad Social Tierrafueguina</h2>
                                        <p className="text-slate-500 dark:text-gray-500 text-xs mt-1">Sintetizado el {new Date().toLocaleDateString('es-AR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
                                    </div>

                                    <div className="h-px bg-gradient-to-r from-orange-500/50 to-transparent z-10"></div>

                                    <div className="flex flex-col gap-6 z-10">
                                        {[1, 2, 3].map(i => (
                                            <div key={i} className="flex gap-4 group/item">
                                                <div className="text-orange-500 text-lg font-black italic">0{i}</div>
                                                <div className="flex flex-col gap-1">
                                                    <h4 className="text-[14px] font-bold text-slate-800 dark:text-gray-200 group-hover/item:text-orange-400 transition-colors">
                                                        {i === 1 ? 'Amenazas Geopolíticas y Fronterizas' : i === 2 ? 'Indicadores de Conflictividad Social' : 'Seguridad en Infraestructura Crítica'}
                                                    </h4>
                                                    <p className="text-[11px] text-slate-600 dark:text-gray-400 leading-relaxed max-w-xl">
                                                        {i === 1 ? 'Evaluación de los movimientos en los pasos fronterizos y dinámica migratoria regional.' : 
                                                         i === 2 ? 'Análisis de paritarias y movimientos gremiales que impactan la estabilidad local.' : 
                                                         'Detección de vulnerabilidades en servicios esenciales y logística estratégica.'}
                                                    </p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    <div className="mt-6 flex gap-4 z-10">
                                        <button className="flex items-center gap-2 px-6 py-2 bg-slate-100 dark:bg-[#1a1a1a] hover:bg-slate-200 dark:bg-[#222] border border-slate-200 dark:border-white/5 rounded-xl text-[10px] font-black uppercase text-slate-600 dark:text-gray-400 transition-all">
                                            <ExternalLink className="w-3.5 h-3.5" /> Descargar PDF
                                        </button>
                                        <button className="flex items-center gap-2 px-6 py-2 bg-slate-100 dark:bg-[#1a1a1a] hover:bg-slate-200 dark:bg-[#222] border border-slate-200 dark:border-white/5 rounded-xl text-[10px] font-black uppercase text-slate-600 dark:text-gray-400 transition-all">
                                            <Share2 className="w-3.5 h-3.5" /> Compartir Informe
                                        </button>
                                    </div>
                                </section>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="p-6 bg-white dark:bg-[#0e0e0e] border border-slate-200 dark:border-[#1f1f1f] rounded-2xl flex flex-col gap-2">
                                        <h4 className="text-[10px] font-black text-slate-500 dark:text-gray-500 uppercase">Integración IA</h4>
                                        <p className="text-[11px] text-slate-600 dark:text-gray-400">El motor de IA analiza sentimientos y tendencias automáticamente antes de compilar el informe.</p>
                                    </div>
                                    <div className="p-6 bg-white dark:bg-[#0e0e0e] border border-slate-200 dark:border-[#1f1f1f] rounded-2xl flex flex-col gap-2">
                                        <h4 className="text-[10px] font-black text-slate-500 dark:text-gray-500 uppercase">Alertas Críticas</h4>
                                        <p className="text-[11px] text-slate-600 dark:text-gray-400">Si se detecta una noticia de alta volatilidad, se genera un reporte extraordinario fuera de ciclo.</p>
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
                                <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tighter uppercase leading-none">Security Audit Center</h1>
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
                                <section className="bg-gradient-to-br from-[#111] to-[#0a0a0a] border border-slate-300 dark:border-[#222] rounded-3xl p-7 flex flex-col gap-6 shadow-2xl relative border-t-red-600/50">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <div className="w-2 h-2 rounded-full bg-red-600 animate-pulse"></div>
                                            <h3 className="text-xs font-black uppercase tracking-widest text-slate-900 dark:text-white">Dictamen de Auditoría</h3>
                                        </div>
                                        <span className="text-[10px] font-black text-slate-500 dark:text-gray-500 uppercase tracking-tighter">REF: TDF-2026-X</span>
                                    </div>

                                    <div className="space-y-6">
                                        <div className="flex flex-col gap-3">
                                            <p className="text-[11px] text-slate-600 dark:text-gray-400 leading-relaxed italic border-l-2 border-red-800 pl-4 bg-red-950/10 py-2 rounded-r-lg">
                                                "Argentina hoy no permite improvisación. Tras 30 años en seguridad, observo una mutación del crimen hacia nodos logísticos. Tierra del Fuego, por su valor estratégico, requiere una compartimentación de seguridad por ciudad y un enfoque preventivo dinámico."
                                            </p>
                                        </div>

                                        <div className="flex flex-col gap-4">
                                           <h4 className="text-[12px] font-black text-slate-900 dark:text-white uppercase tracking-tight flex items-center gap-2">
                                              <MapPin className="w-4 h-4 text-red-500" /> Desglose Operativo por Nodo
                                           </h4>
                                           <div className="space-y-5">
                                              <div className="bg-white dark:bg-white/[0.02] p-4 rounded-2xl border border-slate-200 dark:border-white/5 group hover:bg-orange-600/5 transition-colors">
                                                 <span className="text-[10px] font-black text-orange-500 uppercase tracking-widest">Río Grande: Foco Logístico</span>
                                                 <p className="text-[11px] text-slate-600 dark:text-gray-400 leading-relaxed mt-1">Alta densidad industrial. Riesgo de infiltración y robo logístico. Necesidad de control biométrico y patrullaje predictivo en parques industriales.</p>
                                              </div>
                                              <div className="bg-white dark:bg-white/[0.02] p-4 rounded-2xl border border-slate-200 dark:border-white/5 group hover:bg-blue-600/5 transition-colors">
                                                 <span className="text-[10px] font-black text-blue-500 uppercase tracking-widest">Ushuaia: Foco Turístico/Nocturno</span>
                                                 <p className="text-[11px] text-slate-600 dark:text-gray-400 leading-relaxed mt-1">Vulnerabilidad por flujo estacional. Conflictividad en nocturnidad. Propuesta: Unidades satélites de respuesta rápida.</p>
                                              </div>
                                              <div className="bg-white dark:bg-white/[0.02] p-4 rounded-2xl border border-slate-200 dark:border-white/5 group hover:bg-emerald-600/5 transition-colors">
                                                 <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">Tolhuin: Nodo de Filtrado Regional</span>
                                                 <p className="text-[11px] text-slate-600 dark:text-gray-400 leading-relaxed mt-1">Punto táctico de control de arterias. Vital para prevenir el desplazamiento delictivo entre cabeceras.</p>
                                              </div>
                                           </div>
                                        </div>

                                        <div className="bg-slate-100 dark:bg-white/5 p-5 rounded-2xl border border-slate-200 dark:border-white/5 flex flex-col gap-4">
                                            <h4 className="text-[11px] font-black text-slate-900 dark:text-white uppercase tracking-widest flex items-center gap-2">
                                                <TrendingUp className="w-4 h-4 text-emerald-500" /> Plan de Acción Preventivo
                                            </h4>
                                            <div className="grid grid-cols-1 gap-2">
                                                {[
                                                    { t: 'Prevención', d: 'Patrullaje dinámico basado en hotspots de calor.' },
                                                    { t: 'Estrategia', d: 'Protocolo de cierre de rutas USH/RGA ante incidentes.' },
                                                    { t: 'Tecnología', d: 'Sensores de movimiento en perímetros críticos.' }
                                                ].map(item => (
                                                    <div key={item.t} className="flex flex-col p-2 bg-slate-100 dark:bg-black/40 rounded-lg">
                                                        <span className="text-[9px] font-black text-slate-700 dark:text-gray-300 uppercase underline decoration-emerald-500/50">{item.t}</span>
                                                        <span className="text-[10px] text-slate-500 dark:text-gray-500 leading-tight">{item.d}</span>
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

                      {/* 7. LOGISTICS CENTER (SHIPS & FLIGHTS) */}
                      {activeTab === 'logistics' && (
                        <motion.div 
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="xl:col-span-12 flex flex-col gap-8 pb-10"
                        >
                            <header className="flex flex-col gap-2">
                               <div className="flex items-center gap-3">
                                  <div className="w-12 h-12 rounded-2xl bg-blue-600/20 flex items-center justify-center shadow-[0_0_20px_rgba(37,99,235,0.2)]">
                                     <Anchor className="w-6 h-6 text-blue-500" />
                                  </div>
                                  <div className="flex flex-col">
                                    <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tighter uppercase leading-none">Control de Arribos Regional</h1>
                                    <span className="text-[10px] font-bold text-blue-500/80 uppercase tracking-[0.3em] mt-1">Tráfico Marítimo y Aéreo en Tiempo Real</span>
                                  </div>
                               </div>
                            </header>

                            <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
                                {/* SHIP TRAFFIC SECTION */}
                                <div className="bg-white dark:bg-[#0e0e0e] border border-slate-200 dark:border-[#1f1f1f] rounded-3xl overflow-hidden shadow-2xl flex flex-col">
                                    <div className="flex items-center justify-between px-6 py-5 border-b border-slate-200 dark:border-[#1f1f1f] bg-white dark:bg-[#0e0e0e]/90 backdrop-blur-sm">
                                        <div className="flex items-center gap-3">
                                            <div className="w-6 h-6 rounded bg-blue-600/20 flex items-center justify-center">
                                                <Anchor className="w-3.5 h-3.5 text-blue-500" />
                                            </div>
                                            <h2 className="text-[13px] font-bold text-slate-800 dark:text-gray-200 tracking-wide uppercase">
                                                Arribo de Barcos y Cruceros
                                            </h2>
                                        </div>
                                        <a 
                                            href="https://www.argentina.gob.ar/economia/agencia-nacional-de-puertos-y-navegacion/puertos/puerto-de-ushuaia" 
                                            target="_blank" 
                                            rel="noopener noreferrer"
                                            className="text-[10px] font-bold text-slate-500 dark:text-gray-500 hover:text-slate-900 dark:text-white flex items-center gap-1 transition-colors"
                                        >
                                            INFO OFICIAL <ExternalLink className="w-3 h-3" />
                                        </a>
                                    </div>
                                    <div className="w-full h-[600px] relative bg-white dark:bg-[#0c0c0c]">
                                        <iframe 
                                            src="https://www.marinetraffic.com/en/ais/embed/zoom:9/centery:-54.7/centerx:-67.5/maptype:0/shownames:false"
                                            className="w-full h-full border-none opacity-90 hover:opacity-100 transition-opacity"
                                            title="Marine Traffic - Puerto de Ushuaia"
                                            loading="lazy"
                                        />
                                        
                                        {/* FLOATING ARRIVALS OVERLAY */}
                                        <div className="absolute top-4 left-4 z-10 w-64 bg-white dark:bg-[#0e0e0e]/95 backdrop-blur-xl border border-slate-200 dark:border-[#1f1f1f] rounded-2xl shadow-2xl p-4 pointer-events-auto">
                                            <div className="flex items-center gap-2 mb-3 border-b border-slate-200 dark:border-[#1f1f1f] pb-2">
                                                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
                                                <h3 className="text-[10px] font-black text-slate-600 dark:text-gray-400 uppercase tracking-widest">Estado de Arribos</h3>
                                            </div>
                                            
                                            <div className="flex flex-col gap-4">
                                                {/* CURRENT / IN PORT */}
                                                <div className="flex flex-col gap-1.5">
                                                    <div className="flex items-center justify-between">
                                                        <span className="text-[8px] font-bold text-emerald-500 uppercase">En Puerto</span>
                                                        <span className="text-[8px] font-bold text-slate-500 dark:text-gray-500">Hoy, 17:51</span>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center shrink-0">
                                                            <Anchor className="w-4 h-4 text-emerald-500" />
                                                        </div>
                                                        <div className="flex flex-col">
                                                            <span className="text-[11px] font-black text-slate-900 dark:text-white leading-tight uppercase">EZEQUIEL MB</span>
                                                            <span className="text-[9px] text-slate-600 dark:text-gray-400">Catamarán de Pasajeros</span>
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="h-px bg-[#1f1f1f]"></div>

                                                {/* UPCOMING / NEXT */}
                                                <div className="flex flex-col gap-3">
                                                    <div className="flex flex-col gap-1">
                                                        <div className="flex items-center justify-between">
                                                            <span className="text-[8px] font-bold text-blue-500 uppercase">Próximo Arribo</span>
                                                            <span className="text-[8px] font-bold text-slate-500 dark:text-gray-500">Mañana, 06:00</span>
                                                        </div>
                                                        <div className="flex items-center gap-2 group cursor-default">
                                                            <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                                                            <span className="text-[11px] font-bold text-slate-800 dark:text-gray-200 group-hover:text-slate-900 dark:text-white transition-colors">ASTURIANO III</span>
                                                            <span className="text-[9px] text-slate-500 dark:text-gray-500 ml-auto">Portacontenedores</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* FLIGHT TRAFFIC SECTION */}
                                <div className="bg-white dark:bg-[#0e0e0e] border border-slate-200 dark:border-[#1f1f1f] rounded-3xl overflow-hidden shadow-2xl flex flex-col">
                                    <div className="flex items-center justify-between px-6 py-5 border-b border-slate-200 dark:border-[#1f1f1f] bg-white dark:bg-[#0e0e0e]/90 backdrop-blur-sm">
                                        <div className="flex items-center gap-3">
                                            <div className="w-6 h-6 rounded bg-orange-600/20 flex items-center justify-center">
                                                <Plane className="w-3.5 h-3.5 text-orange-500" />
                                            </div>
                                            <h2 className="text-[13px] font-bold text-slate-800 dark:text-gray-200 tracking-wide uppercase">
                                                Control de Arribos y Salidas (Aéreo)
                                            </h2>
                                        </div>
                                        <div className="flex gap-4">
                                            <a href="https://www.aeropuertoushuaia.com/" target="_blank" rel="noopener noreferrer" className="text-[10px] font-bold text-slate-500 dark:text-gray-500 hover:text-slate-900 dark:text-white flex items-center gap-1 transition-colors">
                                                USH <ExternalLink className="w-3 h-3" />
                                            </a>
                                            <a href="https://www.aeropuertosdelmundo.com.ar/aeropuerto-RGA-llegadas/" target="_blank" rel="noopener noreferrer" className="text-[10px] font-bold text-slate-500 dark:text-gray-500 hover:text-slate-900 dark:text-white flex items-center gap-1 transition-colors">
                                                RGA <ExternalLink className="w-3 h-3" />
                                            </a>
                                        </div>
                                    </div>
                                    <div className="w-full h-[600px] relative bg-white dark:bg-[#0c0c0c]">
                                        <iframe 
                                            src="https://www.radarbox.com/widget?lat=-54.8&lon=-68.3&z=8&theme=dark"
                                            className="w-full h-full border-none opacity-90 hover:opacity-100 transition-opacity"
                                            title="RadarBox - Tierra del Fuego"
                                            loading="lazy"
                                        />
                                        
                                        {/* FLOATING FLIGHT OVERLAY */}
                                        <div className="absolute top-4 left-4 z-10 w-72 bg-white dark:bg-[#0e0e0e]/95 backdrop-blur-xl border border-slate-200 dark:border-[#1f1f1f] rounded-2xl shadow-2xl p-4 pointer-events-auto">
                                            <div className="flex items-center gap-2 mb-3 border-b border-slate-200 dark:border-[#1f1f1f] pb-2">
                                                <div className="w-1.5 h-1.5 rounded-full bg-orange-500 animate-pulse"></div>
                                                <h3 className="text-[10px] font-black text-slate-600 dark:text-gray-400 uppercase tracking-widest">Tráfico Aéreo USH/RGA</h3>
                                            </div>
                                            
                                            <div className="flex flex-col gap-4 max-h-[450px] overflow-y-auto scrollbar-hide pr-1">
                                                {/* USH ARRIVALS */}
                                                <div className="flex flex-col gap-2">
                                                    <span className="text-[9px] font-black text-slate-900 dark:text-white/40 uppercase tracking-widest border-b border-slate-200 dark:border-white/5 pb-1">Ushuaia - Arribos</span>
                                                    <div className="flex flex-col gap-2.5">
                                                        <div className="flex items-center justify-between group">
                                                            <div className="flex flex-col">
                                                                <span className="text-[11px] font-black text-slate-900 dark:text-white uppercase italic">AR 1886 <span className="text-[9px] font-normal text-slate-500 dark:text-gray-500 not-italic ml-1">AEP</span></span>
                                                                <span className="text-[9px] text-emerald-500 font-bold">Llegó 14:23</span>
                                                            </div>
                                                            <div className="px-2 py-1 bg-emerald-500/10 rounded text-emerald-500 text-[9px] font-black">EN PISTA</div>
                                                        </div>
                                                        <div className="flex items-center justify-between group">
                                                            <div className="flex flex-col">
                                                                <span className="text-[11px] font-black text-slate-900 dark:text-white uppercase italic">AR 1898 <span className="text-[9px] font-normal text-slate-500 dark:text-gray-500 not-italic ml-1">FTE</span></span>
                                                                <span className="text-[9px] text-blue-500 font-bold">Previsto 15:40</span>
                                                            </div>
                                                            <div className="px-2 py-1 bg-blue-500/10 rounded text-blue-500 text-[9px] font-black uppercase">En Vuelo</div>
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="h-px bg-[#1f1f1f]"></div>

                                                {/* RGA STATUS */}
                                                <div className="flex flex-col gap-2">
                                                    <span className="text-[9px] font-black text-slate-900 dark:text-white/40 uppercase tracking-widest border-b border-slate-200 dark:border-white/5 pb-1">Río Grande - Próximo</span>
                                                    <div className="flex items-center justify-between p-2 bg-slate-100 dark:bg-white/5 rounded-lg border border-slate-200 dark:border-white/5">
                                                        <div className="flex flex-col">
                                                            <span className="text-[11px] font-black text-slate-900 dark:text-white">AR 1866</span>
                                                            <span className="text-[9px] text-slate-600 dark:text-gray-400">Desde AEP</span>
                                                        </div>
                                                        <div className="text-right">
                                                            <span className="text-[10px] font-black text-slate-700 dark:text-gray-300">Mañana 02:20</span>
                                                            <div className="text-[8px] text-slate-500 dark:text-gray-500 uppercase font-black">Programado</div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                         </motion.div>
                      )}
                      </div>

                      {/* RIGHT COLUMN (CHECKLIST) FOR HOME */}
                      {activeTab === 'home' && (
                        <div className="hidden xl:flex xl:col-span-4 flex-col gap-6">
                            <div className="bg-white dark:bg-[#0e0e0e] border border-slate-200 dark:border-[#1f1f1f] rounded-2xl p-5 shadow-2xl flex flex-col gap-6">
                                <div className="flex items-center justify-between text-slate-700 dark:text-gray-300">
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
                                    <div className="bg-slate-100 dark:bg-[#161616]/40 backdrop-blur-md border border-slate-300 dark:border-[#222] rounded-2xl p-4 flex flex-col gap-2 relative group hover:border-blue-500/50 hover:bg-slate-100 dark:bg-[#1a1a1a]/60 cursor-pointer transition-all shadow-sm">
                                        <div className="absolute top-4 right-4"><Car className="w-4 h-4 text-blue-500"/></div>
                                        <h4 className="text-[10px] uppercase font-black tracking-widest text-slate-500 dark:text-gray-500">Tramo Norte</h4>
                                        <h3 className="text-[13px] font-bold text-slate-900 dark:text-white">San Sebastián - Río Grande</h3>
                                        <p className="text-[11px] text-slate-600 dark:text-gray-400 mt-1 mb-2 leading-relaxed opacity-80 group-hover:opacity-100">Tránsito habilitado. Monitoreo oficial por condiciones climáticas de la zona.</p>
                                        <a href="https://www.facebook.com/SuDefensaCivil/" target="_blank" rel="noopener noreferrer" className="mt-auto pt-3 border-t border-slate-300 dark:border-[#222] flex items-center justify-between text-[10px] uppercase font-bold text-blue-500 hover:text-blue-400 transition-colors">
                                            Fuente: Defensa Civil <ExternalLink className="w-3 h-3"/>
                                        </a>
                                    </div>

                                    {/* TRAMO 2 */}
                                    <div className="bg-slate-100 dark:bg-[#161616]/40 backdrop-blur-md border border-slate-300 dark:border-[#222] rounded-2xl p-4 flex flex-col gap-2 relative group hover:border-emerald-500/50 hover:bg-slate-100 dark:bg-[#1a1a1a]/60 cursor-pointer transition-all shadow-sm">
                                        <div className="absolute top-4 right-4"><Car className="w-4 h-4 text-emerald-500"/></div>
                                        <h4 className="text-[10px] uppercase font-black tracking-widest text-slate-500 dark:text-gray-500">Tramo Centro</h4>
                                        <h3 className="text-[13px] font-bold text-slate-900 dark:text-white">Río Grande - Tolhuin</h3>
                                        <p className="text-[11px] text-slate-600 dark:text-gray-400 mt-1 mb-2 leading-relaxed opacity-80 group-hover:opacity-100">Precaución permanente en zona geológica. Reportarse a los puestos de control.</p>
                                        <a href="https://www.argentina.gob.ar/transporte/vialidad-nacional/estado-de-rutas" target="_blank" rel="noopener noreferrer" className="mt-auto pt-3 border-t border-slate-300 dark:border-[#222] flex items-center justify-between text-[10px] uppercase font-bold text-emerald-500 hover:text-emerald-400 transition-colors">
                                            Fuente: Vialidad Nacional <ExternalLink className="w-3 h-3"/>
                                        </a>
                                    </div>

                                    {/* TRAMO 3 */}
                                    <div className="bg-slate-100 dark:bg-[#161616]/40 backdrop-blur-md border border-slate-300 dark:border-[#222] rounded-2xl p-4 flex flex-col gap-2 relative group hover:border-orange-500/50 hover:bg-slate-100 dark:bg-[#1a1a1a]/60 cursor-pointer transition-all shadow-sm">
                                        <div className="absolute top-4 right-4"><Car className="w-4 h-4 text-orange-400"/></div>
                                        <h4 className="text-[10px] uppercase font-black tracking-widest text-slate-500 dark:text-gray-500">Tramo Sur</h4>
                                        <h3 className="text-[13px] font-bold text-slate-900 dark:text-white">Tolhuin - Lapataia</h3>
                                        <p className="text-[11px] text-slate-600 dark:text-gray-400 mt-1 mb-2 leading-relaxed opacity-80 group-hover:opacity-100">Zona de montaña. Transitabilidad sujeta a condiciones de hielo y nieve diaria.</p>
                                        <a href="https://www.facebook.com/direccionprovincialdevialidadTDF/?locale=es_LA" target="_blank" rel="noopener noreferrer" className="mt-auto pt-3 border-t border-slate-300 dark:border-[#222] flex items-center justify-between text-[10px] uppercase font-bold text-orange-400 hover:text-orange-300 transition-colors">
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
                            <div className="bg-white dark:bg-[#0e0e0e] border border-slate-200 dark:border-[#1f1f1f] rounded-2xl p-5 shadow-2xl flex flex-col gap-4">
                                <h2 className="text-[13px] font-bold text-slate-700 dark:text-gray-300 tracking-wide uppercase mb-2">Categorías Feeds</h2>
                                <button 
                                   onClick={() => setActiveCategory('all')}
                                   className={`text-left px-4 py-2.5 rounded-xl text-[13px] font-bold transition-all ${activeCategory === 'all' ? 'bg-blue-600/10 text-blue-500 border border-blue-500/20' : 'text-slate-600 dark:text-gray-400 hover:bg-slate-100 dark:bg-[#1a1a1a] hover:text-slate-800 dark:text-gray-200 border border-transparent'}`}
                                >
                                   Todos los Feeds
                                </button>
                                {feedSideCats.map(cat => (
                                   <button 
                                      key={cat}
                                      onClick={() => setActiveCategory(cat as string)}
                                      className={`text-left px-4 py-2.5 rounded-xl text-[13px] font-bold transition-all capitalize ${activeCategory === cat ? 'bg-blue-600/10 text-blue-500 border border-blue-500/20' : 'text-slate-600 dark:text-gray-400 hover:bg-slate-100 dark:bg-[#1a1a1a] hover:text-slate-800 dark:text-gray-200 border border-transparent'}`}
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
        <nav className="bg-white dark:bg-[#0c0c0c]/90 backdrop-blur-3xl border border-slate-300 dark:border-white/10 shadow-[0_-8px_32px_rgba(0,0,0,0.5)] rounded-2xl h-18 flex items-center justify-around px-4">
            {[
              { id: 'home', icon: LayoutDashboard, label: 'Inicio' },
              { id: 'explore', icon: Compass, label: 'Feeds' },
              { id: 'weather', icon: Cloud, label: 'Clima' },
              { id: 'logistics', icon: Anchor, label: 'Arribos' },
              { id: 'reports', icon: FileText, label: 'Reportes' },
              { id: 'security', icon: ShieldCheck, label: 'Seguridad' },
              { id: 'radio', icon: Radio, label: 'Radio' }
            ].map((item) => {
               const Icon = item.icon;
               return (
                <button 
                  key={item.id}
                  onClick={() => setActiveTab(item.id)} 
                  className={`flex flex-col items-center justify-center p-2 rounded-xl transition-all duration-300 w-full ${activeTab === item.id ? 'text-blue-500 scale-110' : 'text-slate-500 dark:text-gray-500 hover:text-slate-700 dark:text-gray-300'}`}
                >
                  <Icon className={`w-5 h-5 ${activeTab === item.id ? 'drop-shadow-[0_0_8px_rgba(59,130,246,0.5)]' : ''}`} />
                  <span className={`text-[8px] font-black mt-1 uppercase tracking-tighter ${activeTab === item.id ? 'opacity-100' : 'opacity-60'}`}>{item.label}</span>
                </button>
               );
            })}
        </nav>
      </div>
      
      {/* 4. MODAL LECTOR */}
      {/* 5. OVERLAYS & HUD */}
      
      {/* GLOBAL SEARCH MODAL (Cmd+K) */}
      <AnimatePresence>
        {showSearchModal && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-start justify-center pt-[15vh] px-4 bg-slate-900/40 backdrop-blur-sm"
            onClick={() => setShowSearchModal(false)}
          >
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: -20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -20 }}
              className="w-full max-w-2xl bg-white dark:bg-[#121212] rounded-[2.5rem] shadow-2xl border border-slate-200 dark:border-white/10 overflow-hidden"
              onClick={e => e.stopPropagation()}
            >
              <div className="relative p-6 border-b border-slate-200 dark:border-white/5">
                <Search className="absolute left-10 top-1/2 -translate-y-1/2 w-6 h-6 text-blue-500" />
                <input 
                  autoFocus
                  type="text" 
                  placeholder="Comando rápido: Busca cualquier noticia..." 
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full bg-slate-100 dark:bg-white/5 border-none rounded-2xl py-5 pl-14 pr-6 text-xl font-medium text-slate-800 dark:text-white placeholder:text-slate-400 focus:ring-0"
                />
                <div className="absolute right-10 top-1/2 -translate-y-1/2 px-2 py-1 bg-slate-200 dark:bg-white/10 rounded-md text-[10px] font-black text-slate-500 uppercase">ESC</div>
              </div>
              <div className="max-h-[50vh] overflow-y-auto p-4 custom-scrollbar">
                {search.length > 0 ? (
                  <div className="space-y-2">
                    {filteredArticles.slice(0, 10).map(article => (
                      <div 
                        key={article.id} 
                        onClick={() => { setSelectedArticle(article); setShowSearchModal(false); }}
                        className="p-4 hover:bg-blue-600/10 rounded-2xl cursor-pointer transition-all border border-transparent hover:border-blue-500/20 group"
                      >
                        <h4 className="text-sm font-bold text-slate-800 dark:text-gray-200 group-hover:text-blue-500 transition-colors">{article.title}</h4>
                        <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest mt-1 block">{(feeds.find(f => f.id === article.sourceId)?.name || 'Fuente')}</span>
                      </div>
                    ))}
                    {filteredArticles.length === 0 && (
                      <div className="p-12 text-center">
                        <p className="text-slate-500">No se encontraron resultados para "{search}"</p>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="p-12 text-center opacity-40">
                    <LayoutDashboard className="w-12 h-12 mx-auto mb-4" />
                    <p className="text-sm font-bold uppercase tracking-[0.3em]">Buscador de Inteligencia WikiApp</p>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* LIVE SYNC HUD */}
      <div className="fixed bottom-8 right-8 z-[60] flex flex-col items-end gap-3 pointer-events-none">
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-black/80 backdrop-blur-2xl border border-white/10 rounded-2xl p-4 shadow-2xl flex items-center gap-4"
        >
          <div className="relative">
            <div className="w-3 h-3 bg-emerald-500 rounded-full animate-ping absolute inset-0"></div>
            <div className="w-3 h-3 bg-emerald-500 rounded-full relative"></div>
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] font-black text-white/40 uppercase tracking-widest">Estado del Sistema</span>
            <span className="text-xs font-bold text-white tracking-tight">Sincronizado: {new Date().toLocaleTimeString()}</span>
          </div>
        </motion.div>
      </div>

      <AnimatePresence>
        {selectedArticle && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[110] flex items-end sm:items-center justify-center bg-slate-900/60 backdrop-blur-md p-0 sm:p-4 md:p-12"
            onClick={() => setSelectedArticle(null)}
          >
            <motion.div 
              initial={{ y: "100%", opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: "100%", opacity: 0 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="bg-white dark:bg-[#0a0a0a] w-full max-w-4xl h-[95vh] sm:h-full max-h-[900px] rounded-t-[2.5rem] sm:rounded-[2.5rem] shadow-2xl flex flex-col border border-slate-200 dark:border-white/10 overflow-hidden"
              onClick={e => e.stopPropagation()}
            >
              <div className="flex items-center justify-between p-6 border-b border-slate-200 dark:border-white/5 bg-white dark:bg-[#0c0c0c]">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-blue-600/10 flex items-center justify-center">
                    <FileText className="w-4 h-4 text-blue-500" />
                  </div>
                  <span className="text-[11px] font-black text-slate-500 dark:text-gray-400 uppercase tracking-[0.2em]">Inteligencia Operativa</span>
                </div>
                <button onClick={() => setSelectedArticle(null)} className="p-3 rounded-2xl hover:bg-slate-100 dark:hover:bg-white/5 transition-all text-slate-600 dark:text-gray-400">
                  <X className="w-6 h-6" />
                </button>
              </div>
              
              <div className="flex-1 overflow-y-auto p-6 md:p-16 custom-scrollbar bg-white dark:bg-[#0a0a0a]">
                <div className="max-w-2xl mx-auto">
                  <div className="flex items-center gap-4 mb-6">
                    <span className="text-xs font-black text-blue-600 dark:text-blue-400 uppercase tracking-[0.2em] bg-blue-600/10 px-3 py-1.5 rounded-lg border border-blue-500/20">
                      {feeds.find(f => f.id === selectedArticle.sourceId)?.name || 'Central'}
                    </span>
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-widest font-mono">{new Date(selectedArticle.pubDate).toLocaleDateString()}</span>
                    {isYouTube(selectedArticle.link) && (
                      <span className="bg-red-600/10 text-red-500 px-3 py-1 rounded-lg text-[10px] font-black uppercase border border-red-500/20 flex items-center gap-1.5">
                        <PlayCircle className="w-3.5 h-3.5" /> Video
                      </span>
                    )}
                  </div>
                  
                  <h1 className="text-4xl md:text-5xl lg:text-6xl font-black tracking-tight leading-[1.05] text-slate-900 dark:text-white mb-10 font-display">
                    {selectedArticle.title}
                  </h1>
                  
                  {selectedArticle.thumbnail && (
                    <div className="w-full aspect-[16/10] mb-12 rounded-[2rem] overflow-hidden border border-slate-200 dark:border-white/10 relative group shadow-2xl">
                      <img src={selectedArticle.thumbnail} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-[3000ms]" />
                      {isYouTube(selectedArticle.link) && (
                        <a href={selectedArticle.link} target="_blank" rel="noopener noreferrer" className="absolute inset-0 flex items-center justify-center bg-black/20 group-hover:bg-black/40 transition-all">
                          <div className="w-20 h-20 rounded-full bg-white/20 backdrop-blur-xl flex items-center justify-center border border-white/30 transform group-hover:scale-110 transition-all">
                            <PlayCircle className="w-10 h-10 text-white" />
                          </div>
                        </a>
                      )}
                    </div>
                  )}

                  <div 
                    className="prose prose-slate dark:prose-invert max-w-none 
                      prose-p:text-lg prose-p:leading-relaxed prose-p:text-slate-600 dark:prose-p:text-gray-300
                      prose-headings:font-black prose-headings:tracking-tight prose-headings:font-display
                      prose-a:text-blue-600 prose-img:rounded-3xl prose-img:shadow-xl" 
                    dangerouslySetInnerHTML={{ __html: selectedArticle.description || '<p>Contenido principal no provisto por la fuente.</p>' }} 
                  />
                  
                  <div className="mt-20 pt-10 border-t border-slate-200 dark:border-white/5 flex flex-col items-center gap-6">
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest text-center">Continúa leyendo la versión completa en el sitio oficial</p>
                    <a 
                      href={selectedArticle.link} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className={`flex items-center gap-3 px-10 py-5 rounded-2xl text-[13px] font-black tracking-widest transition-all shadow-xl hover:shadow-2xl hover:-translate-y-1 ${
                        isYouTube(selectedArticle.link) 
                          ? 'bg-red-600 text-white hover:bg-red-700 shadow-red-600/20' 
                          : 'bg-blue-600 text-white hover:bg-blue-700 shadow-blue-600/20'
                      }`}
                    >
                      {isYouTube(selectedArticle.link) ? 'VER EN YOUTUBE' : 'ACCEDER AL SITIO WEB'} 
                      <ExternalLink className="w-4.5 h-4.5" />
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
