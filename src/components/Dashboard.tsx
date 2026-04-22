'use client';

import React, { useState, useMemo } from 'react';
import type { Article, FeedSource } from '@/types';
import { LayoutDashboard, Compass, Settings, Bookmark, Search, Clock, ChevronRight, Moon, Sun, Cloud, LayoutGrid, List, LayoutTemplate, X, ExternalLink } from 'lucide-react';
import { useTheme } from 'next-themes';
import WeatherDashboard from './WeatherDashboard';
import { motion, AnimatePresence } from 'framer-motion';

type ViewMode = 'grid' | 'list' | 'magazine';

export default function Dashboard({ initialArticles, feeds }: { initialArticles: Article[], feeds: FeedSource[] }) {
  const [activeTab, setActiveTab] = useState('home');
  const [search, setSearch] = useState('');
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);
  
  const { theme, setTheme } = useTheme();
  
  const [mounted, setMounted] = React.useState(false);
  React.useEffect(() => setMounted(true), []);

  // Filter Logic
  const filteredArticles = useMemo(() => {
    if (!search.trim()) return initialArticles.slice(0, 50); // Muestra 50 por defecto para rendimiento
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

  return (
    <div className="flex h-screen bg-[var(--color-surface-primary)] text-[var(--color-text-primary)] font-sans overflow-hidden transition-colors duration-200">
      
      {/* 1. FIXED SIDEBAR */}
      <aside className="w-64 bg-[var(--color-surface-elevated)] border-r border-[var(--color-border-subtle)] hidden lg:flex flex-col shrink-0 z-20">
        <div className="h-20 flex items-center px-6">
          <div className="flex items-center gap-3 cursor-pointer group">
            <div className="w-9 h-9 bg-[var(--color-accent-primary)] rounded-xl flex items-center justify-center text-white font-bold tracking-tighter text-sm shadow-md transition-transform duration-200 group-hover:scale-105">
              MW
            </div>
            <h1 className="font-bold text-xl tracking-tight">MediosWiki</h1>
          </div>
        </div>

        <nav className="flex-1 py-4 px-4 space-y-2 overflow-y-auto scrollbar-hide">
          <div className="text-[11px] font-bold text-[var(--color-text-tertiary)] uppercase tracking-widest mb-3 px-2">Explorar</div>
          
          <button onClick={() => setActiveTab('home')} className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 ${activeTab === 'home' ? 'bg-[var(--color-accent-primary)] text-white shadow-md' : 'text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-sunken)] hover:text-[var(--color-text-primary)]'}`}>
            <LayoutDashboard className={`w-5 h-5 ${activeTab === 'home' ? 'opacity-100' : 'opacity-70'}`} /> Titulares
          </button>
          
          <button onClick={() => setActiveTab('explore')} className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 ${activeTab === 'explore' ? 'bg-[var(--color-accent-primary)] text-white shadow-md' : 'text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-sunken)] hover:text-[var(--color-text-primary)]'}`}>
            <Compass className={`w-5 h-5 ${activeTab === 'explore' ? 'opacity-100' : 'opacity-70'}`} /> Explorar
          </button>

          <button onClick={() => setActiveTab('saved')} className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 ${activeTab === 'saved' ? 'bg-[var(--color-accent-primary)] text-white shadow-md' : 'text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-sunken)] hover:text-[var(--color-text-primary)]'}`}>
            <Bookmark className={`w-5 h-5 ${activeTab === 'saved' ? 'opacity-100' : 'opacity-70'}`} /> Guardados
          </button>

          <button onClick={() => setActiveTab('weather')} className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 ${activeTab === 'weather' ? 'bg-[var(--color-accent-primary)] text-white shadow-md' : 'text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-sunken)] hover:text-[var(--color-text-primary)]'}`}>
            <Cloud className={`w-5 h-5 ${activeTab === 'weather' ? 'opacity-100' : 'opacity-70'}`} /> Clima <span className="ml-auto text-[9px] bg-red-500 text-white px-1.5 py-0.5 rounded-md">LIVE</span>
          </button>

          {/* Quick Widgets panel en sidebar */}
          <div className="mt-8 mb-3 px-2 text-[11px] font-bold text-[var(--color-text-tertiary)] uppercase tracking-widest">Widgets</div>
          <div className="mx-2 p-3 bg-[var(--color-surface-sunken)] rounded-xl border border-[var(--color-border-subtle)] space-y-3">
             <div className="flex justify-between items-center text-xs">
                <span className="font-semibold text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] cursor-pointer">Estado Rutas TDF</span>
                <span className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]"></span>
             </div>
             <div className="w-full h-px bg-[var(--color-border-subtle)]" />
             <div className="flex flex-col text-xs cursor-pointer group">
                <span className="font-semibold text-[var(--color-text-secondary)] group-hover:text-[var(--color-text-primary)] mb-1">Efemérides ({new Date().getDate()}/{new Date().getMonth()+1})</span>
                <span className="text-[10px] text-[var(--color-text-tertiary)] leading-tight">Día de la Tierra y concientización ambiental.</span>
             </div>
          </div>
        </nav>
      </aside>

      {/* 2. MAIN CONTENT AREA */}
      <main className="flex-1 flex flex-col min-w-0 relative">
        
        {/* Floating Top Navigation Pro */}
        <div className="px-4 py-4 md:px-8 md:py-6 shrink-0 z-30 sticky top-0">
            <header className="h-14 bg-[var(--color-surface-elevated)]/80 backdrop-blur-lg border border-[var(--color-border-subtle)] rounded-2xl flex items-center justify-between px-4 sm:px-6 shadow-sm shadow-slate-900/5">
                <div className="flex items-center flex-1 max-w-xl">
                    <div className="relative w-full max-w-md hidden sm:block">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--color-text-tertiary)]" />
                        <input 
                            type="text" 
                            placeholder="Buscar titulares o palabras clave..." 
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 bg-[var(--color-surface-sunken)] border border-[var(--color-border-subtle)] focus:bg-[var(--color-surface-elevated)] focus:border-[var(--color-accent-primary)] rounded-xl text-sm font-medium outline-none transition-all duration-200"
                        />
                    </div>
                </div>
                
                {/* View Controls & Settings */}
                <div className="flex items-center gap-2 sm:gap-4">
                    {activeTab === 'home' && (
                      <div className="hidden md:flex bg-[var(--color-surface-sunken)] p-1 rounded-xl border border-[var(--color-border-subtle)]">
                        <button onClick={() => setViewMode('grid')} className={`p-1.5 rounded-lg transition-colors ${viewMode === 'grid' ? 'bg-[var(--color-surface-elevated)] text-[var(--color-accent-primary)] shadow-sm' : 'text-[var(--color-text-tertiary)] hover:text-[var(--color-text-primary)]'}`}>
                           <LayoutGrid className="w-4 h-4" />
                        </button>
                        <button onClick={() => setViewMode('list')} className={`p-1.5 rounded-lg transition-colors ${viewMode === 'list' ? 'bg-[var(--color-surface-elevated)] text-[var(--color-accent-primary)] shadow-sm' : 'text-[var(--color-text-tertiary)] hover:text-[var(--color-text-primary)]'}`}>
                           <List className="w-4 h-4" />
                        </button>
                        <button onClick={() => setViewMode('magazine')} className={`p-1.5 rounded-lg transition-colors ${viewMode === 'magazine' ? 'bg-[var(--color-surface-elevated)] text-[var(--color-accent-primary)] shadow-sm' : 'text-[var(--color-text-tertiary)] hover:text-[var(--color-text-primary)]'}`}>
                           <LayoutTemplate className="w-4 h-4" />
                        </button>
                      </div>
                    )}

                    <div className="w-px h-5 bg-[var(--color-border-subtle)] hidden sm:block mx-1"></div>

                    {mounted && (
                        <button onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')} className="p-2 text-[var(--color-text-tertiary)] hover:text-[var(--color-accent-primary)] rounded-xl transition-colors duration-200">
                            {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                        </button>
                    )}
                    <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[var(--color-accent-primary)] to-[var(--color-accent-secondary)] ml-2 shadow-sm cursor-pointer border-2 border-transparent hover:border-[var(--color-surface-elevated)] transition-all"></div>
                </div>
            </header>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto px-4 md:px-8 pb-32">
          <div className="max-w-7xl mx-auto space-y-6">
            
            {activeTab === 'weather' ? (
              <WeatherDashboard />
            ) : (
              <>
                <div className="flex items-center justify-between mb-8 px-2">
                  <div>
                    <h2 className="text-3xl font-bold tracking-tight text-[var(--color-text-primary)]">
                       {search ? `Resultados de: "${search}"` : 'Titulares Globales'}
                    </h2>
                    <p className="text-sm text-[var(--color-text-tertiary)] mt-1 font-medium bg-gradient-to-r from-red-500 to-orange-500 bg-clip-text text-transparent">
                      Actualización automática ISR corriendo.
                    </p>
                  </div>
                  <div className="hidden sm:inline-flex text-xs font-bold text-[var(--color-accent-primary)] bg-[var(--color-accent-primary)]/10 px-3 py-1.5 rounded-lg border border-[var(--color-accent-primary)]/20 shadow-sm">
                    {filteredArticles.length} RESULTADOS
                  </div>
                </div>

                {filteredArticles.length === 0 && (
                  <div className="text-center py-24 bg-[var(--color-surface-elevated)] rounded-3xl border border-[var(--color-border-subtle)] border-dashed">
                     <Search className="w-12 h-12 text-[var(--color-text-tertiary)] opacity-50 mx-auto mb-4" />
                     <h3 className="text-lg font-bold text-[var(--color-text-primary)]">No se encontraron noticias</h3>
                     <p className="text-sm text-[var(--color-text-tertiary)]">Intenta con otros términos de búsqueda.</p>
                  </div>
                )}

                {/* Animated Layout Grid/List/Magazine */}
                <motion.div 
                  layout
                  className={
                    viewMode === 'list' ? "flex flex-col gap-3" : 
                    viewMode === 'magazine' ? "columns-1 md:columns-2 xl:columns-3 gap-6 space-y-6" :
                    "grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6"
                  }
                >
                  <AnimatePresence>
                    {filteredArticles.map((article, idx) => {
                      const sourceName = feeds.find(f => f.id === article.sourceId)?.name || 'FUENTE';
                      const formattedTime = new Date(article.pubDate).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
                      const cleanDesc = stripHtml(article.description || '');

                      // GRID VIEW
                      if (viewMode === 'grid') {
                        return (
                          <motion.article 
                            layout
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            transition={{ duration: 0.3, delay: idx * 0.05 }}
                            key={article.id} 
                            className="cursor-pointer group flex flex-col bg-[var(--color-surface-elevated)] border border-[var(--color-border-subtle)] rounded-2xl overflow-hidden hover:border-[var(--color-accent-primary)]/50 hover:shadow-xl hover:shadow-[var(--color-accent-primary)]/5 transition-all"
                            onClick={() => setSelectedArticle(article)}
                          >
                            <div className="p-6 flex-1">
                              <div className="flex items-center gap-3 mb-4">
                                <span className="text-[10px] font-black text-[var(--color-accent-primary)] uppercase tracking-widest bg-[var(--color-accent-primary)]/10 px-2 py-1 rounded-md">{sourceName}</span>
                                <span className="text-[11px] font-semibold text-[var(--color-text-tertiary)]">{formattedTime}</span>
                              </div>
                              <h3 className="font-bold text-[var(--color-text-primary)] text-lg leading-tight mb-3 group-hover:text-[var(--color-accent-primary)] transition-colors line-clamp-3">{article.title}</h3>
                              <p className="text-sm font-medium text-[var(--color-text-tertiary)] line-clamp-2">{cleanDesc || 'Sin descripción'}</p>
                            </div>
                          </motion.article>
                        );
                      }

                      // LIST VIEW
                      if (viewMode === 'list') {
                        return (
                          <motion.article 
                            layout
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 20 }}
                            key={article.id}
                            className="cursor-pointer group flex items-center gap-4 bg-[var(--color-surface-elevated)] p-4 border border-[var(--color-border-subtle)] rounded-xl hover:border-[var(--color-accent-primary)]/50 transition-all"
                            onClick={() => setSelectedArticle(article)}
                          >
                            <div className="w-16 flex-shrink-0 text-center flex flex-col items-center justify-center border-r border-[var(--color-border-subtle)] pr-4">
                                <span className="text-xs font-bold text-[var(--color-accent-primary)] uppercase truncate w-full">{sourceName}</span>
                                <span className="text-[10px] text-[var(--color-text-tertiary)] mt-1">{formattedTime}</span>
                            </div>
                            <h3 className="flex-1 font-bold text-[var(--color-text-primary)] text-[15px] group-hover:text-[var(--color-accent-primary)] transition-colors truncate">{article.title}</h3>
                          </motion.article>
                        );
                      }

                      // MAGAZINE VIEW
                      return (
                        <motion.article 
                            layout
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            key={article.id}
                            className="break-inside-avoid cursor-pointer group flex flex-col bg-[var(--color-surface-elevated)] border border-[var(--color-border-subtle)] rounded-3xl overflow-hidden hover:border-[var(--color-accent-primary)]/80 shadow-sm transition-all"
                            onClick={() => setSelectedArticle(article)}
                        >
                            {article.thumbnail && (
                               <div className="w-full h-48 bg-[var(--color-surface-sunken)] overflow-hidden">
                                  <img src={article.thumbnail} alt={article.title} loading="lazy" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                               </div>
                            )}
                            <div className="p-6 md:p-8">
                                <h3 className="font-extrabold text-[var(--color-text-primary)] text-xl md:text-2xl leading-tight mb-4 group-hover:text-[var(--color-accent-primary)] transition-colors">{article.title}</h3>
                                <p className="text-sm md:text-base font-medium text-[var(--color-text-secondary)] leading-relaxed mb-6">{cleanDesc || 'Visualización de artículo sin descripción extendida disponible. Toque para leer.'}</p>
                                <div className="flex items-center justify-between border-t border-[var(--color-border-subtle)] pt-4 mt-auto">
                                    <span className="text-xs font-bold text-[var(--color-text-tertiary)]">{sourceName} • {formattedTime}</span>
                                    <ChevronRight className="w-5 h-5 text-[var(--color-text-tertiary)] group-hover:text-[var(--color-accent-primary)] transform group-hover:block transition-all" />
                                </div>
                            </div>
                        </motion.article>
                      );
                    })}
                  </AnimatePresence>
                </motion.div>
              </>
            )}

          </div>
        </div>
      </main>
      
      {/* 3. MOBILE FLOATING BOTTOM NAV */}
      <div className="lg:hidden fixed bottom-6 left-4 right-4 z-40">
        <nav className="bg-[var(--color-surface-elevated)]/90 backdrop-blur-xl border border-[var(--color-border-subtle)] shadow-xl shadow-slate-900/10 rounded-2xl h-16 flex items-center justify-around px-2">
            {['home', 'explore', 'saved', 'weather'].map((tab) => {
               const icons: any = { home: LayoutDashboard, explore: Compass, saved: Bookmark, weather: Cloud };
               const Icon = icons[tab];
               const titles: any = { home: 'INICIO', explore: 'DESCUBRIR', saved: 'MARCADORES', weather: 'CLIMA' };
               return (
                <button 
                  key={tab}
                  onClick={() => setActiveTab(tab)} 
                  className={`flex flex-col items-center justify-center p-2 rounded-xl transition-all duration-200 w-16 ${activeTab === tab ? 'text-[var(--color-accent-primary)] bg-[var(--color-accent-primary)]/10' : 'text-[var(--color-text-tertiary)] hover:text-[var(--color-text-secondary)]'}`}
                >
                  <Icon className="w-5 h-5" />
                  <span className="text-[9px] font-bold mt-1">{titles[tab]}</span>
                </button>
               );
            })}
        </nav>
      </div>

      {/* 4. MODAL LECTOR (READER VIEW) */}
      <AnimatePresence>
        {selectedArticle && (
           <motion.div 
             initial={{ opacity: 0 }}
             animate={{ opacity: 1 }}
             exit={{ opacity: 0 }}
             className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm p-0 sm:p-4 md:p-12"
             onClick={() => setSelectedArticle(null)}
           >
              <motion.div 
                 initial={{ y: "100%" }}
                 animate={{ y: 0 }}
                 exit={{ y: "100%" }}
                 transition={{ type: "spring", damping: 25, stiffness: 300 }}
                 className="bg-[var(--color-surface-primary)] w-full max-w-4xl h-[90vh] sm:h-full max-h-[850px] rounded-t-3xl sm:rounded-3xl shadow-2xl flex flex-col border border-[var(--color-border-subtle)] overflow-hidden"
                 onClick={e => e.stopPropagation()} // Evita cerrar si clickeas adentro
              >
                 {/* Modal Header */}
                 <div className="flex items-center justify-between p-4 border-b border-[var(--color-border-subtle)] bg-[var(--color-surface-elevated)]">
                    <span className="text-xs font-bold text-[var(--color-text-tertiary)] uppercase tracking-widest pl-2">Lector MediosWiki</span>
                    <button onClick={() => setSelectedArticle(null)} className="p-2 rounded-full hover:bg-[var(--color-surface-sunken)] transition-colors text-[var(--color-text-secondary)]">
                       <X className="w-6 h-6" />
                    </button>
                 </div>
                 
                 {/* Modal Body / Reader View */}
                 <div className="flex-1 overflow-y-auto p-6 md:p-12 bg-[var(--color-surface-primary)]">
                    <div className="max-w-2xl mx-auto">
                       <span className="text-sm font-bold text-[var(--color-accent-primary)] uppercase bg-[var(--color-accent-primary)]/10 px-3 py-1 rounded-lg">
                          {feeds.find(f => f.id === selectedArticle.sourceId)?.name || 'Desconocido'}
                       </span>
                       <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight mt-6 leading-tight text-[var(--color-text-primary)]">
                          {selectedArticle.title}
                       </h1>
                       <div className="flex items-center gap-4 text-sm font-medium text-[var(--color-text-tertiary)] mt-6 border-y border-[var(--color-border-subtle)] py-4">
                          <span>Publicado: {new Date(selectedArticle.pubDate).toLocaleString('es-AR')}</span>
                       </div>

                       {selectedArticle.thumbnail && (
                           <div className="w-full h-auto mt-8 rounded-2xl overflow-hidden border border-[var(--color-border-subtle)]">
                              <img src={selectedArticle.thumbnail} alt="Thumbnail" className="w-full h-full object-cover" />
                           </div>
                       )}

                       <div className="prose prose-lg dark:prose-invert mt-8 text-[var(--color-text-secondary)] leading-relaxed" 
                            dangerouslySetInnerHTML={{ __html: selectedArticle.description || '<p>Contenido no disponible.</p>' }} 
                       />
                    </div>
                 </div>

                 {/* Modal Footer */}
                 <div className="p-4 md:p-6 border-t border-[var(--color-border-subtle)] bg-[var(--color-surface-elevated)] flex justify-end">
                    <a href={selectedArticle.link} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 bg-[var(--color-text-primary)] text-[var(--color-surface-primary)] px-6 py-3 rounded-xl font-bold hover:opacity-90 transition-opacity">
                      Leer artículo completo en el sitio <ExternalLink className="w-4 h-4" />
                    </a>
                 </div>
              </motion.div>
           </motion.div>
        )}
      </AnimatePresence>
      
    </div>
  );
}
