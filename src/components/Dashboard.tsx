'use client';

import React, { useState, useMemo } from 'react';
import type { Article, FeedSource } from '@/types';
import { LayoutDashboard, Compass, Settings, Bookmark, Search, Clock, ChevronRight, Moon, Sun, Cloud, LayoutGrid, List, LayoutTemplate, X, ExternalLink, Menu, Plus, BookmarkCheck, Share2, MoreHorizontal, CheckCircle2 } from 'lucide-react';
import { useTheme } from 'next-themes';
import WeatherDashboard from './WeatherDashboard';
import { motion, AnimatePresence } from 'framer-motion';

type ViewMode = 'grid' | 'list' | 'magazine';

export default function Dashboard({ initialArticles, feeds }: { initialArticles: Article[], feeds: FeedSource[] }) {
  const [activeTab, setActiveTab] = useState('home');
  const [search, setSearch] = useState('');
  const [viewMode, setViewMode] = useState<ViewMode>('list'); // Default a list en este nuevo diseño oscuro
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);
  
  const { theme, setTheme } = useTheme();
  
  const [mounted, setMounted] = React.useState(false);
  React.useEffect(() => setMounted(true), []);

  // Filter Logic
  const filteredArticles = useMemo(() => {
    if (!search.trim()) return initialArticles.slice(0, 50); 
    const lowerSearch = search.toLowerCase();
    return initialArticles.filter(a => {
      const sourceName = feeds.find(f => f.id === a.sourceId)?.name || '';
      return (
        a.title.toLowerCase().includes(lowerSearch) ||
        (a.description && a.description.toLowerCase().includes(lowerSearch)) ||
        sourceName.toLowerCase().includes(lowerSearch)
      );
    }).slice(0, 50);
  }, [initialArticles, search, feeds]);

  const stripHtml = (html: string) => {
    return html.replace(/<[^>]*>?/gm, '');
  };

  const getRelativeTime = (isoString: string) => {
    const diff = Date.now() - new Date(isoString).getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    if (hours < 1) return 'Reciente';
    if (hours < 24) return `${hours}h`;
    return `${Math.floor(hours/24)}d`;
  };

  return (
    // Color base ultra-oscuro estilo Inoreader
    <div className="flex h-screen bg-[#070707] dark:bg-[#070707] text-[#e0e0e0] font-sans overflow-hidden transition-colors duration-200">
      
      {/* 1. ULTRA SLIM FIXED SIDEBAR */}
      <aside className="w-[72px] bg-[#0c0c0c] border-r border-[#1a1a1a] hidden lg:flex flex-col items-center shrink-0 z-20 py-4 gap-6">
        
        {/* LOGO */}
        <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold tracking-tighter shadow-md cursor-pointer group hover:scale-105 transition-transform">
          MW
        </div>

        {/* NAV ITEMS */}
        <nav className="flex-1 w-full space-y-4 overflow-y-auto scrollbar-hide py-2">
          
          <div className="text-[8px] font-black text-gray-600 uppercase tracking-widest text-center mt-2 mb-2 w-full">Principal</div>
          
          <button onClick={() => setActiveTab('home')} className={`relative w-full flex flex-col items-center justify-center gap-1.5 py-3 group transition-colors ${activeTab === 'home' ? 'text-blue-500' : 'text-gray-500 hover:text-gray-300'}`}>
            {activeTab === 'home' && <div className="absolute left-0 top-1/4 bottom-1/4 w-1 bg-blue-500 rounded-r-md"></div>}
            <LayoutDashboard className="w-5 h-5" />
            <span className="text-[9px] font-bold">Home</span>
          </button>
          
          <button onClick={() => setActiveTab('explore')} className={`w-full flex flex-col items-center justify-center gap-1.5 py-3 group transition-colors ${activeTab === 'explore' ? 'text-blue-500' : 'text-gray-500 hover:text-gray-300'}`}>
            {activeTab === 'explore' && <div className="absolute left-0 top-1/4 bottom-1/4 w-1 bg-blue-500 rounded-r-md"></div>}
            <Compass className="w-5 h-5" />
            <span className="text-[9px] font-bold">Feeds</span>
          </button>

          <button onClick={() => setActiveTab('saved')} className={`w-full flex flex-col items-center justify-center gap-1.5 py-3 group transition-colors ${activeTab === 'saved' ? 'text-blue-500' : 'text-gray-500 hover:text-gray-300'}`}>
            {activeTab === 'saved' && <div className="absolute left-0 top-1/4 bottom-1/4 w-1 bg-blue-500 rounded-r-md"></div>}
            <Bookmark className="w-5 h-5" />
            <span className="text-[9px] font-bold">Saved</span>
          </button>

          <button onClick={() => setActiveTab('weather')} className={`w-full flex flex-col items-center justify-center gap-1.5 py-3 group transition-colors ${activeTab === 'weather' ? 'text-blue-500' : 'text-gray-500 hover:text-gray-300'}`}>
            {activeTab === 'weather' && <div className="absolute left-0 top-1/4 bottom-1/4 w-1 bg-blue-500 rounded-r-md"></div>}
            <Cloud className="w-5 h-5" />
            <span className="text-[9px] font-bold">Clima</span>
          </button>
          
          <div className="w-full flex justify-center py-4">
             <div className="w-6 h-px bg-[#262626]"></div>
          </div>
          
          <button className="w-full flex flex-col items-center justify-center gap-1.5 py-3 text-gray-500 hover:text-gray-300 transition-colors pointer-events-none">
            <Plus className="w-5 h-5" />
            <span className="text-[9px] font-bold">Add</span>
          </button>
        </nav>

        {/* BOTTOM ICONS */}
        <div className="w-full space-y-4 pb-4 border-t border-[#1a1a1a] pt-4">
            <button className="w-full flex justify-center text-gray-500 hover:text-gray-300 transition-colors">
              <Search className="w-5 h-5" />
            </button>
            <button className="w-full flex justify-center text-gray-500 hover:text-gray-300 transition-colors">
              <Settings className="w-5 h-5" />
            </button>
        </div>
      </aside>

      {/* 2. MAIN CONTENT AREA */}
      <main className="flex-1 flex flex-col min-w-0 relative">
        
        {/* INOREADER STYLE TOP NAVIGATION */}
        <div className="px-4 py-3 md:px-8 shrink-0 z-30 sticky top-0 bg-[#070707]/90 backdrop-blur-xl border-b border-[#1a1a1a]">
            {/* Header Level 1 */}
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                   <h1 className="text-xl font-bold text-white tracking-tight">Dashboards</h1>
                   <ChevronRight className="w-4 h-4 text-gray-500 transform rotate-90" />
                </div>
                <div className="flex items-center gap-4 text-gray-400">
                    <button className="hover:text-white transition-colors"><div className="text-[14px] font-bold border border-gray-600 px-2 py-0.5 rounded text-gray-300">Aa</div></button>
                    <button className="hover:text-white transition-colors"><Search className="w-4 h-4" /></button>
                    <button className="hover:text-white transition-colors"><Cloud className="w-4 h-4" /></button>
                    <button className="hover:text-white transition-colors"><MoreHorizontal className="w-4 h-4" /></button>
                </div>
            </div>
            
            {/* Header Tabs */}
            <div className="flex items-center gap-6 text-[11px] font-black tracking-wider uppercase">
                <button className={`pb-2 border-b-2 transition-colors ${!search ? 'border-blue-500 text-blue-500' : 'border-transparent text-gray-500 hover:text-gray-300'}`}>
                    DEFAULT DASHBOARD
                </button>
                <button className={`pb-2 border-b-2 transition-colors ${search ? 'border-blue-500 text-blue-500' : 'border-transparent text-gray-500 hover:text-gray-300'}`}>
                    EXPLOTACIÓN DE MEDIOS
                </button>
                <button className="pb-2 text-gray-600 hover:text-gray-300"><Plus className="w-4 h-4" /></button>
            </div>
        </div>

        {/* CONTENIDO SCROLL */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden p-4 md:p-6 lg:p-8">
          <div className="max-w-[1400px] mx-auto h-full space-y-6">
            
            {/* Si está en WEATHER */}
            {activeTab === 'weather' ? (
              <WeatherDashboard />
            ) : (
              /* DASHBOARD LAYOUT (INOREADER STYLE) */
              <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
                  
                  {/* LEFT COLUMN (WIDGETS PRINCIPALES) */}
                  <div className="xl:col-span-8 flex flex-col gap-6">
                      
                      {/* Búsqueda activa info (si la hay) */}
                      {search && (
                        <div className="w-full bg-[#121212] border border-[#222] rounded-xl p-4 flex items-center justify-between">
                            <input 
                                type="text"
                                placeholder="Buscar en resultados..."
                                value={search}
                                onChange={e => setSearch(e.target.value)}
                                className="bg-transparent text-white outline-none w-full text-sm font-medium"
                                autoFocus
                            />
                            <Search className="w-4 h-4 text-gray-500" />
                        </div>
                      )}

                      {/* WIDGET 1: LISTA DENSA DE NOTICIAS */}
                      <div className="bg-[#0e0e0e] border border-[#1f1f1f] rounded-2xl overflow-hidden shadow-2xl flex flex-col">
                          <div className="flex items-center justify-between p-4 border-b border-[#1f1f1f] bg-[#0e0e0e]/50 backdrop-blur-sm sticky top-0 z-10">
                              <div className="flex items-center gap-3">
                                  <div className="w-6 h-6 rounded bg-blue-600/20 flex items-center justify-center">
                                      <BookmarkCheck className="w-3.5 h-3.5 text-blue-500" />
                                  </div>
                                  <h2 className="text-[13px] font-bold text-gray-200 tracking-wide">
                                      Flujo Dinámico - Principales <span className="text-gray-500 ml-1 font-normal">{filteredArticles.length} <ChevronRight className="inline w-3 h-3"/></span>
                                  </h2>
                              </div>
                              <div className="flex items-center gap-3 text-gray-500">
                                  <button className="hover:text-white"><Share2 className="w-4 h-4" /></button>
                                  <button className="hover:text-white"><MoreHorizontal className="w-4 h-4" /></button>
                              </div>
                          </div>
                          
                          <div className="flex flex-col">
                              {filteredArticles.slice(0, 15).map(article => (
                                  <div 
                                      key={article.id} 
                                      onClick={() => setSelectedArticle(article)}
                                      className="group flex flex-col sm:flex-row sm:items-center px-4 py-2.5 border-b border-[#181818] hover:bg-[#161616] cursor-pointer transition-colors"
                                  >
                                      {/* Icon/Save button */}
                                      <div className="hidden sm:flex w-6 shrink-0 items-center justify-center text-gray-600 group-hover:text-gray-400">
                                          <Bookmark className="w-3.5 h-3.5" />
                                      </div>
                                      
                                      {/* Contenido (Textos trancados) */}
                                      <div className="flex-1 min-w-0 pr-4">
                                          <h3 className="text-sm font-semibold text-gray-300 group-hover:text-white truncate">
                                              {article.title}
                                          </h3>
                                          <div className="hidden sm:block text-[11px] text-gray-500 truncate mt-0.5">
                                              {stripHtml(article.description || '').slice(0, 100)}...
                                          </div>
                                      </div>
                                      
                                      {/* Metadatos (Fuente y Tiempo) */}
                                      <div className="flex items-center justify-between sm:justify-end gap-3 mt-2 sm:mt-0 shrink-0 w-full sm:w-48 text-[11px] text-gray-500">
                                         <span className="truncate">{feeds.find(f => f.id === article.sourceId)?.name || 'Fuente'}</span>
                                         <span className="shrink-0">{getRelativeTime(article.pubDate)}</span>
                                         <MoreHorizontal className="w-3.5 h-3.5 hidden sm:block opacity-0 group-hover:opacity-100 transition-opacity" />
                                      </div>
                                  </div>
                              ))}
                              {filteredArticles.length === 0 && (
                                  <div className="p-8 text-center text-sm text-gray-500">No hay contenido con esos criterios.</div>
                              )}
                          </div>
                      </div>

                      {/* WIDGET 2: LEER MÁS TARDE (TIRA HORIZONTAL) */}
                      {!search && (
                          <div className="bg-[#0e0e0e] border border-[#1f1f1f] rounded-2xl overflow-hidden shadow-2xl flex flex-col relative group">
                              <div className="flex items-center justify-between p-4 border-b border-[#1f1f1f]">
                                  <div className="flex items-center gap-2 text-gray-300">
                                      <Bookmark className="w-4 h-4 ml-1" />
                                      <h2 className="text-[13px] font-bold tracking-wide">Leer más tarde</h2>
                                  </div>
                                  <div className="flex items-center gap-3 text-gray-500">
                                      <button className="hover:text-white"><Share2 className="w-4 h-4" /></button>
                                      <button className="hover:text-white"><MoreHorizontal className="w-4 h-4" /></button>
                                  </div>
                              </div>
                              
                              {/* Horizontal Scroll Area */}
                              <div className="flex overflow-x-auto p-4 gap-4 scrollbar-hide snap-x relative">
                                  {initialArticles.filter(a => a.thumbnail).slice(0, 6).map(article => (
                                      <div key={'rml-'+article.id} onClick={() => setSelectedArticle(article)} className="shrink-0 w-64 flex flex-col gap-3 group/card cursor-pointer snap-start">
                                          <div className="w-full h-36 bg-[#1a1a1a] rounded-lg overflow-hidden border border-[#2a2a2a] relative">
                                              {article.thumbnail && <img src={article.thumbnail} alt="" className="w-full h-full object-cover opacity-80 group-hover/card:opacity-100 group-hover/card:scale-105 transition-all duration-500"/>}
                                              <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent"></div>
                                          </div>
                                          <h3 className="text-sm font-bold text-gray-300 group-hover/card:text-blue-400 line-clamp-2 leading-snug">{article.title}</h3>
                                          <div className="flex items-center justify-between text-[11px] text-gray-500">
                                              <span>{feeds.find(f => f.id === article.sourceId)?.name}</span>
                                              <div className="flex gap-2">
                                                  <Bookmark className="w-3 h-3 text-yellow-600" />
                                                  <MoreHorizontal className="w-3 h-3" />
                                              </div>
                                          </div>
                                      </div>
                                  ))}
                                  {/* Flechita flotante scroll */}
                                  <div className="hidden group-hover:flex absolute right-4 top-1/2 -translate-y-1/2 w-8 h-8 bg-[#2a2a2a] rounded-full items-center justify-center text-white shadow-lg cursor-pointer">
                                      <ChevronRight className="w-5 h-5" />
                                  </div>
                              </div>
                          </div>
                      )}

                  </div>


                  {/* RIGHT COLUMN (CHECKLIST & TRENDING) */}
                  <div className="xl:col-span-4 flex flex-col gap-6">
                      
                      {/* WIDGET CHECKLIST / PERFIL / ESTADO */}
                      <div className="bg-[#0e0e0e] border border-[#1f1f1f] rounded-2xl p-5 shadow-2xl flex flex-col gap-6">
                          <div className="flex items-center justify-between text-gray-300">
                              <h2 className="text-[13px] font-bold tracking-wide">Estatus Operativo</h2>
                              <button className="text-gray-500 hover:text-white"><MoreHorizontal className="w-4 h-4" /></button>
                          </div>
                          
                          <div className="flex flex-col gap-1">
                              <div className="flex items-center justify-between text-[11px] font-bold text-gray-400 mb-1">
                                 <span>Todos los sistemas arriba</span>
                                 <span>100%</span>
                              </div>
                              <div className="w-full h-1 bg-[#1a1a1a] rounded-full overflow-hidden">
                                  <div className="h-full bg-emerald-500 w-full shadow-[0_0_10px_rgba(16,185,129,0.5)]"></div>
                              </div>
                          </div>

                          <div className="flex flex-col gap-4">
                              <div className="flex items-center gap-3 text-[13px] group opacity-80 hover:opacity-100 cursor-pointer">
                                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                                  <span className="text-emerald-50 text-decoration-line: line-through font-medium text-gray-400">Actualización ISR Vercel</span>
                              </div>
                              <div className="flex items-center gap-3 text-[13px] group opacity-80 hover:opacity-100 cursor-pointer">
                                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                                  <span className="text-emerald-50 text-decoration-line: line-through font-medium text-gray-400">Rutas Tierra del Fuego - Transitables</span>
                              </div>
                              <div className="flex items-center justify-between text-[13px] group cursor-pointer">
                                  <div className="flex items-center gap-3">
                                      <div className="w-4 h-4 rounded-full border border-gray-600"></div>
                                      <span className="text-gray-300 font-medium group-hover:text-white transition-colors">Efemérides Nacionales</span>
                                  </div>
                                  <ChevronRight className="w-3.5 h-3.5 text-gray-600" />
                              </div>
                              <div className="flex items-center justify-between text-[13px] group cursor-pointer">
                                  <div className="flex items-center gap-3">
                                      <div className="w-4 h-4 rounded-full border border-gray-600"></div>
                                      <span className="text-gray-300 font-medium group-hover:text-white transition-colors">Estado de Puertos (TDF)</span>
                                  </div>
                                  <ChevronRight className="w-3.5 h-3.5 text-gray-600" />
                              </div>
                          </div>
                      </div>

                      {/* WIDGET TRENDING */}
                      {!search && initialArticles[0] && (
                        <div className="bg-[#0e0e0e] border border-[#1f1f1f] rounded-2xl overflow-hidden shadow-2xl flex flex-col">
                            <div className="flex items-center justify-between p-4 border-b border-[#1f1f1f] text-gray-300">
                                <h2 className="text-[13px] font-bold tracking-wide">Trending</h2>
                                <button className="text-gray-500 hover:text-white"><MoreHorizontal className="w-4 h-4" /></button>
                            </div>
                            <div className="p-4 bg-[#111] flex items-center gap-4 text-[10px] font-black uppercase tracking-widest text-gray-500 border-b border-[#1a1a1a]">
                                <span className="text-gray-300">CANDENTE</span>
                                <span className="hover:text-gray-300 cursor-pointer">TOP HOY</span>
                                <span className="hover:text-gray-300 cursor-pointer">TOP ESTA SEMANA</span>
                            </div>
                            <div 
                                className="group relative w-full h-64 bg-[#1a1a1a] cursor-pointer overflow-hidden"
                                onClick={() => setSelectedArticle(initialArticles[0])}
                            >
                                {initialArticles[0].thumbnail ? (
                                    <img src={initialArticles[0].thumbnail} className="w-full h-full object-cover opacity-60 group-hover:opacity-80 group-hover:scale-105 transition-all duration-700" alt="Trending" />
                                ) : (
                                    <div className="w-full h-full bg-gradient-to-br from-blue-900/40 to-black"></div>
                                )}
                                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent"></div>
                                <div className="absolute inset-x-0 bottom-0 p-6 flex flex-col gap-2">
                                    <span className="text-[10px] font-black text-blue-500 uppercase tracking-widest break-words bg-black/50 w-max px-2 py-1 rounded">
                                        {feeds.find(f => f.id === initialArticles[0].sourceId)?.name}
                                    </span>
                                    <h3 className="text-lg md:text-xl font-bold text-white leading-tight mt-1">
                                        {initialArticles[0].title}
                                    </h3>
                                </div>
                            </div>
                        </div>
                      )}

                  </div>
              </div>
            )}

          </div>
        </div>
      </main>
      
      {/* 4. MODAL LECTOR (READER VIEW OSCURO) */}
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
                 className="bg-[#0a0a0a] w-full max-w-4xl h-[90vh] sm:h-full max-h-[850px] rounded-t-2xl sm:rounded-2xl shadow-2xl flex flex-col border border-[#222] overflow-hidden"
                 onClick={e => e.stopPropagation()}
              >
                 <div className="flex items-center justify-between p-4 border-b border-[#1f1f1f] bg-[#0c0c0c]">
                    <span className="text-[11px] font-bold text-gray-500 uppercase tracking-widest pl-2">Lector MediosWiki</span>
                    <button onClick={() => setSelectedArticle(null)} className="p-2 rounded-lg hover:bg-[#1f1f1f] transition-colors text-gray-400">
                       <X className="w-5 h-5" />
                    </button>
                 </div>
                 
                 <div className="flex-1 overflow-y-auto p-6 md:p-12 scrollbar-smooth bg-[#0a0a0a]">
                    <div className="max-w-2xl mx-auto">
                       <span className="text-xs font-black text-blue-500 uppercase tracking-widest">
                          {feeds.find(f => f.id === selectedArticle.sourceId)?.name || 'Central'}
                       </span>
                       <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight mt-5 leading-tight text-white">
                          {selectedArticle.title}
                       </h1>
                       <div className="flex items-center gap-4 text-xs font-medium text-gray-500 mt-6 border-y border-[#1f1f1f] py-4">
                          <span>{new Date(selectedArticle.pubDate).toLocaleString('es-AR')}</span>
                       </div>

                       {selectedArticle.thumbnail && (
                           <div className="w-full h-auto mt-8 rounded-xl overflow-hidden border border-[#1f1f1f]">
                              <img src={selectedArticle.thumbnail} alt="Thumbnail" className="w-full h-full object-cover" />
                           </div>
                       )}

                       <div className="prose prose-invert prose-p:text-gray-300 prose-headings:text-white mt-8 leading-relaxed max-w-none text-[15px]" 
                            dangerouslySetInnerHTML={{ __html: selectedArticle.description || '<p>Contenido no disponible.</p>' }} 
                       />
                       
                       <div className="mt-16 pt-8 border-t border-[#1f1f1f] flex justify-center">
                          <a href={selectedArticle.link} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 bg-[#1a1a1a] hover:bg-[#222] text-gray-200 border border-[#333] px-6 py-3 rounded-full text-sm font-bold transition-all">
                            VISITAR SITIO ORIGINAL <ExternalLink className="w-4 h-4 ml-2" />
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
