'use client';

import React, { useState } from 'react';
import type { Article, FeedSource } from '@/types';
import { LayoutDashboard, Compass, Settings, Bookmark, Search, Clock, ChevronRight, Moon, Sun } from 'lucide-react';
import { useTheme } from 'next-themes';

export default function Dashboard({ initialArticles, feeds }: { initialArticles: Article[], feeds: FeedSource[] }) {
  const [activeTab, setActiveTab] = useState('home');
  const [search, setSearch] = useState('');
  
  // Asumiendo que next-themes está instalado por defecto en tus versiones de la UI anteriores
  const { theme, setTheme } = useTheme();
  
  // Fix para hidratación de next-themes
  const [mounted, setMounted] = React.useState(false);
  React.useEffect(() => setMounted(true), []);

  return (
    <div className="flex h-screen bg-[var(--color-surface-primary)] text-[var(--color-text-primary)] font-sans overflow-hidden transition-colors duration-200">
      
      {/* 1. FIXED SIDEBAR (Barra lateral fija pro) */}
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
          
          <button 
            onClick={() => setActiveTab('home')}
            className={`cursor-pointer w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 ${activeTab === 'home' ? 'bg-[var(--color-accent-primary)] text-white shadow-md' : 'text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-sunken)] hover:text-[var(--color-text-primary)]'}`}
          >
            <LayoutDashboard className={`w-5 h-5 ${activeTab === 'home' ? 'opacity-100' : 'opacity-70'}`} />
            Titulares
          </button>
          
          <button 
            onClick={() => setActiveTab('explore')}
            className={`cursor-pointer w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 ${activeTab === 'explore' ? 'bg-[var(--color-accent-primary)] text-white shadow-md' : 'text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-sunken)] hover:text-[var(--color-text-primary)]'}`}
          >
            <Compass className={`w-5 h-5 ${activeTab === 'explore' ? 'opacity-100' : 'opacity-70'}`} />
            Explorar
          </button>

          <button 
            onClick={() => setActiveTab('saved')}
            className={`cursor-pointer w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 ${activeTab === 'saved' ? 'bg-[var(--color-accent-primary)] text-white shadow-md' : 'text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-sunken)] hover:text-[var(--color-text-primary)]'}`}
          >
            <Bookmark className={`w-5 h-5 ${activeTab === 'saved' ? 'opacity-100' : 'opacity-70'}`} />
            Guardados
          </button>

          <div className="mt-8 mb-3 px-2 text-[11px] font-bold text-[var(--color-text-tertiary)] uppercase tracking-widest">Fuentes ({feeds.length})</div>
          <div className="space-y-1">
            {feeds.slice(0, 5).map(feed => (
              <button key={feed.id} className="cursor-pointer w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-sunken)] hover:text-[var(--color-text-primary)] group transition-colors duration-150">
                <span className="truncate">{feed.name}</span>
                <ChevronRight className="w-4 h-4 text-[var(--color-text-tertiary)] opacity-0 group-hover:opacity-100 transition-all duration-200 -translate-x-2 group-hover:translate-x-0" />
              </button>
            ))}
          </div>
        </nav>

        <div className="p-4 border-t border-[var(--color-border-subtle)]">
          <button className="cursor-pointer w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-sunken)] hover:text-[var(--color-text-primary)] transition-colors duration-150">
            <Settings className="w-5 h-5 opacity-70" />
            Configuración
          </button>
        </div>
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
                            placeholder="Buscar en el ecosistema..." 
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 bg-[var(--color-surface-sunken)] border border-transparent focus:bg-[var(--color-surface-elevated)] focus:border-[var(--color-accent-primary)] rounded-xl text-sm font-medium outline-none transition-all duration-200"
                        />
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    {/* Theme Switcher */}
                    {mounted && (
                        <button 
                            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                            className="p-2.5 text-[var(--color-text-tertiary)] hover:text-[var(--color-accent-primary)] hover:bg-[var(--color-surface-sunken)] rounded-xl transition-colors duration-200 cursor-pointer"
                            aria-label="Toggle Theme"
                        >
                            {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                        </button>
                    )}
                    
                    <button className="p-2.5 text-[var(--color-text-tertiary)] hover:text-[var(--color-accent-primary)] hover:bg-[var(--color-surface-sunken)] rounded-xl transition-colors duration-200 cursor-pointer">
                        <Clock className="w-5 h-5" />
                    </button>
                    
                    <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[var(--color-accent-primary)] to-[var(--color-accent-secondary)] ml-2 shadow-sm cursor-pointer border-2 border-transparent hover:border-[var(--color-surface-elevated)] transition-all"></div>
                </div>
            </header>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto px-4 md:px-8 pb-32">
          <div className="max-w-7xl mx-auto space-y-6">
            
            <div className="flex items-center justify-between mb-8 px-2">
              <div>
                <h2 className="text-3xl font-bold tracking-tight text-[var(--color-text-primary)]">Titulares Globales</h2>
                <p className="text-sm text-[var(--color-text-tertiary)] mt-1 font-medium">Contenido sincronizado y procesado hoy.</p>
              </div>
              <div className="hidden sm:inline-flex text-xs font-bold text-[var(--color-accent-primary)] bg-[var(--color-accent-primary)]/10 px-3 py-1.5 rounded-lg border border-[var(--color-accent-primary)]/20 shadow-sm">
                VER {initialArticles.length} ARCHIVOS
              </div>
            </div>

            {/* Premium Article Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {initialArticles.slice(0, 12).map((article) => (
                <article 
                  key={article.id} 
                  className="cursor-pointer group flex flex-col bg-[var(--color-surface-elevated)] border border-[var(--color-border-subtle)] rounded-2xl overflow-hidden transition-all duration-300 hover:border-[var(--color-accent-primary)]/50 hover:shadow-lg hover:shadow-[var(--color-accent-primary)]/5"
                  onClick={() => window.open(article.link, '_blank')}
                >
                  <div className="p-6 flex-1">
                    <div className="flex items-center gap-3 mb-4">
                      <span className="text-[10px] font-black text-[var(--color-accent-primary)] uppercase tracking-widest bg-[var(--color-accent-primary)]/10 px-2 py-1 rounded-md">
                        {feeds.find(f => f.id === article.sourceId)?.name || 'FUENTE'}
                      </span>
                      <span className="text-[11px] font-semibold text-[var(--color-text-tertiary)]">
                        {new Date(article.pubDate).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                      </span>
                    </div>
                    <h3 className="font-bold text-[var(--color-text-primary)] text-lg leading-tight mb-3 group-hover:text-[var(--color-accent-primary)] transition-colors duration-200 line-clamp-3">
                      {article.title}
                    </h3>
                    <p className="text-sm font-medium text-[var(--color-text-tertiary)] line-clamp-2 leading-relaxed">
                      {article.description?.replace(/<[^>]*>?/gm, '') || 'Sin detalles adicionales disponibles.'}
                    </p>
                  </div>
                  <div className="px-6 py-4 border-t border-[var(--color-border-subtle)] bg-[var(--color-surface-sunken)]/50 flex justify-between items-center mt-auto group-hover:bg-[var(--color-surface-sunken)] transition-colors duration-200">
                    <span className="text-xs font-bold text-[var(--color-text-secondary)]">Leer historial</span>
                    <ChevronRight className="w-4 h-4 text-[var(--color-text-tertiary)] group-hover:text-[var(--color-accent-primary)] transform group-hover:translate-x-1 transition-all duration-200" />
                  </div>
                </article>
              ))}
            </div>

            {initialArticles.length === 0 && (
              <div className="text-center py-24 bg-[var(--color-surface-elevated)] rounded-3xl border border-[var(--color-border-subtle)] border-dashed">
                 <LayoutDashboard className="w-12 h-12 text-[var(--color-text-tertiary)] opacity-50 mx-auto mb-4" />
                 <h3 className="text-lg font-bold text-[var(--color-text-primary)]">Bandeja Vacía</h3>
                 <p className="text-sm font-medium text-[var(--color-text-tertiary)] max-w-sm mx-auto mt-2">No se han registrado artículos recientes en este espectro de búsqueda.</p>
              </div>
            )}

          </div>
        </div>
      </main>
      
      {/* 3. MOBILE FLOATING BOTTOM NAV */}
      <div className="lg:hidden fixed bottom-6 left-4 right-4 z-50">
        <nav className="bg-[var(--color-surface-elevated)]/90 backdrop-blur-xl border border-[var(--color-border-subtle)] shadow-xl shadow-slate-900/10 rounded-2xl h-16 flex items-center justify-around px-2">
            <button 
               onClick={() => setActiveTab('home')} 
               className={`cursor-pointer flex flex-col items-center justify-center p-2 rounded-xl transition-all duration-200 w-16 ${activeTab === 'home' ? 'text-[var(--color-accent-primary)] bg-[var(--color-accent-primary)]/10' : 'text-[var(--color-text-tertiary)] hover:text-[var(--color-text-secondary)]'}`}
            >
               <LayoutDashboard className="w-5 h-5" />
               <span className="text-[9px] font-bold mt-1">INICIO</span>
            </button>
            <button 
               onClick={() => setActiveTab('explore')} 
               className={`cursor-pointer flex flex-col items-center justify-center p-2 rounded-xl transition-all duration-200 w-16 ${activeTab === 'explore' ? 'text-[var(--color-accent-primary)] bg-[var(--color-accent-primary)]/10' : 'text-[var(--color-text-tertiary)] hover:text-[var(--color-text-secondary)]'}`}
            >
               <Compass className="w-5 h-5" />
               <span className="text-[9px] font-bold mt-1">DESCUBRIR</span>
            </button>
            <button 
               onClick={() => setActiveTab('saved')} 
               className={`cursor-pointer flex flex-col items-center justify-center p-2 rounded-xl transition-all duration-200 w-16 ${activeTab === 'saved' ? 'text-[var(--color-accent-primary)] bg-[var(--color-accent-primary)]/10' : 'text-[var(--color-text-tertiary)] hover:text-[var(--color-text-secondary)]'}`}
            >
               <Bookmark className="w-5 h-5" />
               <span className="text-[9px] font-bold mt-1">MARCADORES</span>
            </button>
        </nav>
      </div>
      
    </div>
  );
}
