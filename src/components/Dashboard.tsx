'use client';

import { useState, useMemo, useEffect } from 'react';
import type { Article, FeedSource } from '@/types';
import ArticleCard from '@/components/ArticleCard';
import LayoutSwitcher from '@/components/LayoutSwitcher';
import Clock from '@/components/Clock';
import WeatherCard from '@/components/WeatherCard';
import ArticleReader from '@/components/ArticleReader';
import RoadStatus from '@/components/RoadStatus';
import { NavIcon, CategoryButton, MobileTab } from '@/components/DashboardUI';
import {
    LayoutIcon,
    RssIcon,
    BookmarkIcon,
    ZapIcon,
    SearchIcon,
    SettingsIcon,
    FolderIcon,
    ChevronIcon
} from '@/components/Icons';

export default function Dashboard({
    initialArticles,
    feeds
}: {
    initialArticles: Article[],
    feeds: FeedSource[]
}) {
    const [search, setSearch] = useState('');
    const [selectedFeed, setSelectedFeed] = useState<string | null>(null);
    const [selectedArticleId, setSelectedArticleId] = useState<string | null>(null);
    const [collapsedCategories, setCollapsedCategories] = useState<Record<string, boolean>>({});
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [activeTab, setActiveTab] = useState<'home' | 'search' | 'folders' | 'saved' | 'automate' | 'settings'>('home');
    const [viewMode, setViewMode] = useState<'list' | 'card' | 'magazine'>('card');
    const [isSummarizing, setIsSummarizing] = useState(false);
    const [mockSummary, setMockSummary] = useState<string | null>(null);

    // Persistence
    useEffect(() => {
        const savedMode = localStorage.getItem('wikiAppViewMode') as 'list' | 'card' | 'magazine';
        if (savedMode) setViewMode(savedMode);
    }, []);

    const handleViewModeChange = (mode: 'list' | 'card' | 'magazine') => {
        setViewMode(mode);
        localStorage.setItem('wikiAppViewMode', mode);
    };

    const cities = useMemo(() => ({
        "Ushuaia": { lat: -54.8019, lon: -68.303 },
        "Río Grande": { lat: -53.784, lon: -67.701 },
        "Tolhuin": { lat: -54.510, lon: -67.193 },
        "Antártida": { lat: -63.398, lon: -56.996 },
        "Malvinas": { lat: -51.694, lon: -57.851 }
    }), []);

    const filteredArticles = useMemo(() => {
        return initialArticles.filter(a => {
            const matchesSearch = a.title.toLowerCase().includes(search.toLowerCase()) ||
                a.description.toLowerCase().includes(search.toLowerCase());
            const matchesFeed = selectedFeed ? a.sourceId === selectedFeed : true;
            return matchesSearch && matchesFeed;
        });
    }, [initialArticles, search, selectedFeed]);

    const selectedArticle = useMemo(() =>
        initialArticles.find(a => a.id === selectedArticleId) || null
        , [initialArticles, selectedArticleId]);

    const handleNavigate = (direction: 'next' | 'prev') => {
        const currentIndex = filteredArticles.findIndex(a => a.id === selectedArticleId);
        if (currentIndex === -1) return;

        let nextIndex = direction === 'next' ? currentIndex + 1 : currentIndex - 1;
        if (nextIndex < 0) nextIndex = filteredArticles.length - 1;
        if (nextIndex >= filteredArticles.length) nextIndex = 0;

        setSelectedArticleId(filteredArticles[nextIndex].id);
        setMockSummary(null);
    };

    const handleSummarize = () => {
        setIsSummarizing(true);
        setTimeout(() => {
            setMockSummary("Este artículo analiza las tendencias clave en la industria, destacando el impacto de la tecnología en los procesos actuales. Se recomienda prestar especial atención a las secciones de innovación y escalabilidad.");
            setIsSummarizing(false);
        }, 1500);
    };

    const categories = useMemo(() => Array.from(new Set(feeds.map(f => f.category))), [feeds]);

    return (
        <div className="flex h-screen bg-white text-zinc-900 font-sans overflow-hidden">
            {/* Sidebar 1: Icon Bar (Narrow) */}
            <aside className="hidden lg:flex w-16 bg-[#002b4e] flex-col items-center py-6 gap-6 shrink-0 z-50">
                <div className="w-8 h-8 rounded-full bg-blue-500 shadow-lg shadow-blue-500/20 mb-4" />
                <NavIcon active={activeTab === 'home'} onClick={() => setActiveTab('home')} label="Dashboard"><LayoutIcon /></NavIcon>
                <NavIcon active={activeTab === 'folders'} onClick={() => setActiveTab('folders')} label="Feeds"><RssIcon /></NavIcon>
                <NavIcon active={activeTab === 'saved'} onClick={() => setActiveTab('saved')} label="Saved"><BookmarkIcon /></NavIcon>
                <NavIcon active={activeTab === 'automate'} onClick={() => setActiveTab('automate')} label="Automate"><ZapIcon /></NavIcon>
                <NavIcon active={activeTab === 'search'} onClick={() => setActiveTab('search')} label="Search"><SearchIcon /></NavIcon>
                <div className="mt-auto flex flex-col gap-6">
                    <NavIcon active={activeTab === 'settings'} onClick={() => setActiveTab('settings')} label="Settings"><SettingsIcon /></NavIcon>
                </div>
            </aside>

            {/* Sidebar 2: Categories Panel */}
            <aside className={`
                fixed inset-0 z-40 lg:relative lg:inset-auto lg:z-auto
                h-full border-r border-zinc-200 flex flex-col bg-[#f8fafc] transition-all duration-500 ease-in-out overflow-hidden
                ${isMobileMenuOpen || activeTab === 'folders'
                    ? 'w-full lg:w-72 opacity-100 translate-x-0'
                    : 'w-0 opacity-0 -translate-x-full lg:translate-x-0 pointer-events-none lg:pointer-events-auto'}
                ${selectedArticleId && !isMobileMenuOpen ? 'hidden lg:flex' : 'flex'}
            `}>
                <div className="p-6 flex flex-col h-full">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-sm font-black tracking-[0.2em] text-zinc-400 uppercase">Biblioteca</h2>
                        <button onClick={() => setIsMobileMenuOpen(false)} className="lg:hidden p-1 text-zinc-400">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" /></svg>
                        </button>
                    </div>

                    <div className="relative mb-8">
                        <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 w-4 h-4" />
                        <input
                            type="text"
                            placeholder="Buscar en feeds..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full bg-zinc-200/50 border-none rounded-xl pl-10 pr-4 py-2 text-sm focus:ring-2 focus:ring-blue-500/20"
                        />
                    </div>

                    <nav className="space-y-1 overflow-y-auto max-h-[calc(100vh-250px)] scrollbar-hide">
                        <CategoryButton
                            active={!selectedFeed}
                            onClick={() => { setSelectedFeed(null); setIsMobileMenuOpen(false); }}
                            label="Todos los feeds"
                            icon={<LayoutIcon className="w-4 h-4" />}
                        />

                        {categories.map(category => (
                            <div key={category} className="mt-4">
                                <button
                                    onClick={() => setCollapsedCategories(prev => ({ ...prev, [category]: !prev[category] }))}
                                    className="w-full flex items-center gap-3 px-3 py-2 text-zinc-600 hover:text-zinc-900 rounded-lg group transition-colors"
                                >
                                    <FolderIcon className="w-4 h-4" />
                                    <span className="text-sm font-semibold capitalize flex-1 text-left">{category}</span>
                                    <ChevronIcon className={`w-3 h-3 transition-transform ${collapsedCategories[category] ? '-rotate-90' : ''}`} />
                                </button>

                                {!collapsedCategories[category] && (
                                    <div className="mt-1 space-y-0.5 pl-7">
                                        {feeds.filter(f => f.category === category).map(feed => (
                                            <button
                                                key={feed.id}
                                                onClick={() => { setSelectedFeed(feed.id); setIsMobileMenuOpen(false); }}
                                                className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${selectedFeed === feed.id ? 'bg-white text-blue-600 shadow-sm font-bold' : 'text-zinc-500 hover:text-zinc-900'}`}
                                            >
                                                {feed.name}
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                        ))}
                    </nav>

                    <div className="mt-auto pt-8 border-t border-zinc-200">
                        <button className="w-full flex items-center gap-3 px-3 py-2 text-zinc-600 hover:text-zinc-900 rounded-lg group transition-colors">
                            <ZapIcon className="w-4 h-4 text-orange-500" />
                            <span className="text-sm font-bold">Inoreader Pro+</span>
                        </button>
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 flex flex-col min-w-0 bg-white relative">
                <header className="h-20 glass-header flex flex-col md:flex-row items-center px-4 justify-between sticky top-0 z-30 py-2 md:py-0 border-b border-zinc-200/50">
                    <div className="flex items-center justify-between w-full md:w-auto gap-3">
                        <div className="flex items-center gap-3">
                            <button
                                onClick={() => setIsMobileMenuOpen(true)}
                                className="lg:hidden p-2 -ml-2 text-zinc-600 active:bg-zinc-100 rounded-full"
                                aria-label="Open Menu"
                            >
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="18" x2="21" y2="18" /></svg>
                            </button>
                            <div>
                                <h1 className="text-xl md:text-3xl font-black tracking-tighter text-zinc-900 leading-none">WikiApp</h1>
                                <p className="text-[9px] md:text-[11px] font-black text-blue-600 uppercase tracking-[0.2em] mt-1">Premium News</p>
                            </div>
                        </div>

                        {/* Date and Time extracted to Clock component */}
                        <Clock />
                    </div>

                    <div className="flex items-center gap-4">
                        <LayoutSwitcher currentMode={viewMode} onModeChange={handleViewModeChange} />
                        <span className="text-[10px] md:text-xs font-bold text-white bg-zinc-900 px-3 py-1 rounded-full shrink-0">
                            {filteredArticles.length} artículos
                        </span>
                    </div>
                </header>

                <div className="flex-1 flex overflow-hidden">
                    {/* Master: Article List */}
                    <div className={`flex-1 overflow-y-auto p-6 md:p-8 scroll-smooth transition-all duration-300 ${selectedArticleId ? 'hidden md:block md:w-1/3' : 'w-full'}`}>
                        <div className="max-w-6xl mx-auto space-y-8 pb-32">
                            {/* Weather section extracted to WeatherCard */}
                            <WeatherCard cities={cities} />

                            {/* Section Header */}
                            <div className="flex items-center justify-between">
                                <h1 className="text-3xl font-black text-zinc-900 tracking-tight">
                                    {selectedFeed ? feeds.find(f => f.id === selectedFeed)?.name : 'Todo el Contenido'}
                                </h1>
                                {selectedFeed && (
                                    <button onClick={() => setSelectedFeed(null)} className="text-xs font-bold text-orange-600 hover:underline">VOLVER A TODOS</button>
                                )}
                            </div>

                            {/* Grid */}
                            <div className={
                                viewMode === 'list'
                                    ? "flex flex-col border border-zinc-200/50 rounded-2xl overflow-hidden divide-y divide-zinc-200/30 shadow-xl bg-white"
                                    : viewMode === 'magazine'
                                        ? "grid grid-cols-1 lg:grid-cols-2 gap-8"
                                        : "grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-8"
                            }>
                                {filteredArticles.map(article => (
                                    <ArticleCard
                                        key={article.id}
                                        article={article}
                                        viewMode={viewMode}
                                        isSelected={selectedArticleId === article.id}
                                        onClick={() => setSelectedArticleId(article.id)}
                                    />
                                ))}
                            </div>

                            {/* Empty State */}
                            {filteredArticles.length === 0 && (
                                <div className="flex flex-col items-center justify-center py-20 text-center">
                                    <div className="w-16 h-16 bg-zinc-100 rounded-full flex items-center justify-center mb-4">
                                        <SearchIcon className="w-8 h-8 text-zinc-300" />
                                    </div>
                                    <h3 className="text-lg font-bold text-zinc-900">No hay artículos</h3>
                                    <p className="text-sm text-zinc-500 max-w-xs mx-auto mt-2">Prueba con otra búsqueda o selecciona una fuente diferente.</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Detail: Reader extracted to ArticleReader */}
                    {selectedArticle && (
                        <ArticleReader
                            article={selectedArticle}
                            onClose={() => setSelectedArticleId(null)}
                            onNavigate={handleNavigate}
                            onSummarize={handleSummarize}
                            isSummarizing={isSummarizing}
                            summary={mockSummary}
                        />
                    )}
                </div>

                {/* Mobile Bottom Nav */}
                <nav className="lg:hidden fixed bottom-0 left-0 right-0 h-20 glass-header border-t border-zinc-200/50 flex items-center justify-around px-4 z-40 pb-safe shadow-[0_-10px_40px_-15px_rgba(0,0,0,0.1)]">
                    <MobileTab active={activeTab === 'home' && !selectedArticleId} onClick={() => { setActiveTab('home'); setSelectedFeed(null); setSelectedArticleId(null); setIsMobileMenuOpen(false); }} label="Inicio" icon={<LayoutIcon className="w-6 h-6" />} />
                    <MobileTab active={activeTab === 'folders'} onClick={() => { setActiveTab('folders'); setIsMobileMenuOpen(true); }} label="Feeds" icon={<RssIcon className="w-6 h-6" />} />
                    <MobileTab active={activeTab === 'search'} onClick={() => { setActiveTab('search'); setSelectedArticleId(null); setIsMobileMenuOpen(false); }} label="Buscar" icon={<SearchIcon className="w-6 h-6" />} />
                    <MobileTab active={false} onClick={() => { }} label="Perfil" icon={<BookmarkIcon className="w-6 h-6" />} />
                </nav>
            </main>
        </div>
    );
}
