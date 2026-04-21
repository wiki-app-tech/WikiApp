'use client';

import React, { useState } from 'react';
import type { Article, FeedSource } from '@/types';
import { LayoutDashboard, Compass, Settings, Bookmark, Search, Clock, ChevronRight } from 'lucide-react';

export default function Dashboard({ initialArticles, feeds }: { initialArticles: Article[], feeds: FeedSource[] }) {
  const [activeTab, setActiveTab] = useState('home');
  const [search, setSearch] = useState('');

  return (
    <div className="flex h-screen bg-slate-50 text-slate-900 font-sans overflow-hidden">
      
      {/* 1. FIXED SIDEBAR (Barra lateral fija) */}
      <aside className="w-64 bg-white border-r border-slate-200 flex flex-col hidden md:flex shrink-0">
        <div className="h-16 flex items-center px-6 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold tracking-tighter text-sm">
              MW
            </div>
            <h1 className="font-bold text-lg tracking-tight">MediosWiki</h1>
          </div>
        </div>

        <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
          <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 px-3">Principal</div>
          
          <button 
            onClick={() => setActiveTab('home')}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${activeTab === 'home' ? 'bg-blue-50 text-blue-700' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'}`}
          >
            <LayoutDashboard className="w-5 h-5 opacity-80" />
            Titulares
          </button>
          
          <button 
            onClick={() => setActiveTab('explore')}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${activeTab === 'explore' ? 'bg-blue-50 text-blue-700' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'}`}
          >
            <Compass className="w-5 h-5 opacity-80" />
            Explorar
          </button>

          <button 
            onClick={() => setActiveTab('saved')}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${activeTab === 'saved' ? 'bg-blue-50 text-blue-700' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'}`}
          >
            <Bookmark className="w-5 h-5 opacity-80" />
            Guardados
          </button>

          <div className="mt-8 mb-2 px-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">Fuentes</div>
          <div className="space-y-0.5">
            {feeds.slice(0, 5).map(feed => (
              <button key={feed.id} className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm text-slate-600 hover:bg-slate-50 hover:text-slate-900 group">
                <span className="truncate">{feed.name}</span>
                <ChevronRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
              </button>
            ))}
          </div>
        </nav>

        <div className="p-4 border-t border-slate-100">
          <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-50 hover:text-slate-900">
            <Settings className="w-5 h-5 opacity-80" />
            Ajustes
          </button>
        </div>
      </aside>

      {/* 2. MAIN CONTENT AREA */}
      <main className="flex-1 flex flex-col min-w-0">
        
        {/* Header / Top Bar */}
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 shrink-0 z-10 sticky top-0">
          <div className="flex items-center flex-1 max-w-xl">
            <div className="relative w-full max-w-md hidden sm:block">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input 
                type="text" 
                placeholder="Buscar noticias..." 
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-slate-100 border-transparent focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-100 rounded-lg text-sm outline-none transition-all"
              />
            </div>
          </div>
          <div className="flex items-center gap-4">
             <button className="p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 transition-colors">
               <Clock className="w-5 h-5" />
             </button>
             <div className="w-8 h-8 rounded-full bg-slate-200 border border-slate-300"></div>
          </div>
        </header>

        {/* Cuerpos de Vistas */}
        <div className="flex-1 overflow-y-auto p-6 md:p-8">
          <div className="max-w-5xl mx-auto space-y-6">
            
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-2xl font-bold text-slate-900">Titulares</h2>
                <p className="text-sm text-slate-500 mt-1">Lo más reciente de tus fuentes</p>
              </div>
              <div className="text-sm font-medium text-blue-600 bg-blue-50 px-3 py-1.5 rounded-full">
                {initialArticles.length} Artículos
              </div>
            </div>

            {/* Grid de Artículos estilo Material (Cards limpias y funcionales) */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {initialArticles.slice(0, 12).map((article) => (
                <article key={article.id} className="bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow overflow-hidden flex flex-col cursor-pointer group">
                  <div className="p-5 flex-1">
                    <div className="flex items-center gap-2 mb-3">
                      <span className="text-xs font-semibold text-blue-600 uppercase tracking-wider">
                        {feeds.find(f => f.id === article.sourceId)?.name || 'Fuente'}
                      </span>
                      <span className="w-1 h-1 rounded-full bg-slate-300"></span>
                      <span className="text-xs text-slate-400">
                        {new Date(article.pubDate).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                      </span>
                    </div>
                    <h3 className="font-bold text-slate-900 text-base leading-snug mb-2 group-hover:text-blue-600 transition-colors line-clamp-3">
                      {article.title}
                    </h3>
                    <p className="text-sm text-slate-600 line-clamp-2">
                      {article.description?.replace(/<[^>]*>?/gm, '') || 'Sin descripción...'}
                    </p>
                  </div>
                  <div className="px-5 py-3 border-t border-slate-100 bg-slate-50 flex justify-between items-center mt-auto">
                    <span className="text-xs font-medium text-slate-500">Leer nota</span>
                    <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-blue-600 group-hover:translate-x-1 transition-all" />
                  </div>
                </article>
              ))}
            </div>

            {initialArticles.length === 0 && (
              <div className="text-center py-20 bg-white rounded-2xl border border-slate-200 border-dashed">
                 <LayoutDashboard className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                 <h3 className="text-lg font-bold text-slate-700">Sin artículos</h3>
                 <p className="text-slate-500">No hay contenido reciente disponible de tus fuentes.</p>
              </div>
            )}

          </div>
        </div>
      </main>
      
      {/* 3. MOBILE BOTTOM NAV (Utilitario, tipo App Android) */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-white border-t border-slate-200 flex items-center justify-around z-40 pb-safe">
        <button onClick={() => setActiveTab('home')} className={`flex flex-col items-center gap-1 w-16 ${activeTab === 'home' ? 'text-blue-600' : 'text-slate-500'}`}>
          <LayoutDashboard className={`w-5 h-5 ${activeTab==='home' ? 'fill-blue-50' : ''}`} />
          <span className="text-[10px] font-medium">Inicio</span>
        </button>
        <button onClick={() => setActiveTab('explore')} className={`flex flex-col items-center gap-1 w-16 ${activeTab === 'explore' ? 'text-blue-600' : 'text-slate-500'}`}>
          <Compass className={`w-5 h-5 ${activeTab==='explore' ? 'fill-blue-50' : ''}`} />
          <span className="text-[10px] font-medium">Explorar</span>
        </button>
        <button onClick={() => setActiveTab('saved')} className={`flex flex-col items-center gap-1 w-16 ${activeTab === 'saved' ? 'text-blue-600' : 'text-slate-500'}`}>
          <Bookmark className={`w-5 h-5 ${activeTab==='saved' ? 'fill-blue-50' : ''}`} />
          <span className="text-[10px] font-medium">Guardado</span>
        </button>
      </nav>
      
    </div>
  );
}
