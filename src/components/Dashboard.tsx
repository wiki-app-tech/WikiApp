'use client';

import { useState, useMemo, useEffect, useCallback } from 'react';
import type { Article, FeedSource } from '@/types';
import ArticleCard from '@/components/ArticleCard';
import LayoutSwitcher from '@/components/LayoutSwitcher';
import Clock from '@/components/Clock';
import WeatherCard from '@/components/WeatherCard';
import ArticleReader from '@/components/ArticleReader';
import RoadStatus from '@/components/RoadStatus';
import NewsCarousel from '@/components/NewsCarousel';
import RefreshIndicator from '@/components/RefreshIndicator';
import MediosWikiAppLogo from '@/components/MediosWikiAppLogo';
import { useAutoRefresh } from '@/hooks/useAutoRefresh';
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
    const [articles, setArticles] = useState<Article[]>(initialArticles);
    const [isRefreshing, setIsRefreshing] = useState(false);

    // Persistence
    useEffect(() => {
        const savedMode = localStorage.getItem('mediosWikiAppViewMode') as 'list' | 'card' | 'magazine';
        if (savedMode) setViewMode(savedMode);
    }, []);

    const handleViewModeChange = (mode: 'list' | 'card' | 'magazine') => {
        setViewMode(mode);
        localStorage.setItem('mediosWikiAppViewMode', mode);
    };

    const cities = useMemo(() => ({
        "Ushuaia": { lat: -54.8019, lon: -68.303 },
        "Río Grande": { lat: -53.784, lon: -67.701 },
        "Tolhuin": { lat: -54.510, lon: -67.193 },
        "Antártida": { lat: -63.398, lon: -56.996 },
        "Malvinas": { lat: -51.694, lon: -57.851 }
    }), []);

    // Auto-refresh: Recargar artículos cada 5 minutos
    const refreshArticles = useCallback(async () => {
        setIsRefreshing(true);
        try {
            const response = await fetch('/data/articles.json');
            const data = await response.json();
            setArticles(data.articles || []);
        } catch (error) {
            console.error('Error al actualizar artículos:', error);
        } finally {
            setIsRefreshing(false);
        }
    }, []);

    const { lastUpdate } = useAutoRefresh(refreshArticles, {
        interval: 5 * 60 * 1000, // 5 minutos
        enabled: true
    });

    const filteredArticles = useMemo(() => {
        return articles
            .filter(a => {
                const matchesSearch = a.title.toLowerCase().includes(search.toLowerCase()) ||
                    a.description.toLowerCase().includes(search.toLowerCase());
                const matchesFeed = selectedFeed ? a.sourceId === selectedFeed : true;
                return matchesSearch && matchesFeed;
            })
            .sort((a, b) => new Date(b.pubDate).getTime() - new Date(a.pubDate).getTime());
    }, [articles, search, selectedFeed]);

    const selectedArticle = useMemo(() =>
        articles.find(a => a.id === selectedArticleId) || null
        , [articles, selectedArticleId]);

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
        <div className="flex h-screen bg-[#F1F4F9] text-zinc-900 font-sans overflow-hidden">
            {/* Sidebar 1: Icon Bar (Narrow) */}
            <aside className="hidden lg:flex w-20 bg-white flex-col items-center py-8 gap-8 shrink-0 z-50 shadow-xl shadow-blue-500/5 border-r border-zinc-100">
                <div className="mb-6">
                    <MediosWikiAppLogo className="w-12 h-12" />
                </div>
                <NavIcon active={activeTab === 'home'} onClick={() => setActiveTab('home')} label="Dashboard"><LayoutIcon /></NavIcon>
                <NavIcon active={activeTab === 'folders'} onClick={() => setActiveTab('folders')} label="Library"><RssIcon /></NavIcon>
                <NavIcon active={activeTab === 'saved'} onClick={() => setActiveTab('saved')} label="Saved"><BookmarkIcon /></NavIcon>
                <NavIcon active={activeTab === 'automate'} onClick={() => setActiveTab('automate')} label="Automate"><ZapIcon /></NavIcon>
                <NavIcon active={activeTab === 'search'} onClick={() => setActiveTab('search')} label="Global Search"><SearchIcon /></NavIcon>
                <div className="mt-auto flex flex-col gap-8">
                    <NavIcon active={activeTab === 'settings'} onClick={() => setActiveTab('settings')} label="Settings"><SettingsIcon /></NavIcon>
                </div>
            </aside>

            {/* Sidebar 2: Categories Panel */}
            <aside className={`
                fixed inset-0 z-40 lg:relative lg:inset-auto lg:z-auto
                h-full border-r border-zinc-100 flex flex-col bg-white transition-all duration-500 ease-in-out overflow-hidden
                ${isMobileMenuOpen || activeTab === 'folders'
                    ? 'w-full lg:w-80 opacity-100 translate-x-0'
                    : 'w-0 opacity-0 -translate-x-full lg:translate-x-0 pointer-events-none lg:pointer-events-auto shadow-2xl shadow-blue-500/10'}
                ${selectedArticleId && !isMobileMenuOpen ? 'hidden lg:flex' : 'flex'}
            `}>
                <div className="p-8 flex flex-col h-full">
                    <div className="flex items-center justify-between mb-10">
                        <h2 className="text-[11px] font-bold tracking-tight text-zinc-400 uppercase">Library View</h2>
                        <button onClick={() => setIsMobileMenuOpen(false)} className="lg:hidden p-2 text-zinc-400 hover:bg-zinc-50 rounded-2xl transition-colors">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" /></svg>
                        </button>
                    </div>

                    <div className="relative mb-8">
                        <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-300 w-4 h-4" />
                        <input
                            type="text"
                            placeholder="Find in feeds..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full bg-zinc-50 border-zinc-100 border rounded-2xl pl-12 pr-5 py-3.5 text-sm font-medium focus:ring-4 focus:ring-blue-500/5 focus:bg-white focus:border-blue-200 transition-all outline-none"
                        />
                    </div>

                    <nav className="space-y-2 overflow-y-auto max-h-[calc(100vh-250px)] scrollbar-hide">
                        <CategoryButton
                            active={!selectedFeed}
                            onClick={() => { setSelectedFeed(null); setIsMobileMenuOpen(false); }}
                            label="All Discoveries"
                            icon={<LayoutIcon className="w-4 h-4" />}
                        />

                        {categories.map(category => (
                            <div key={category} className="mt-6">
                                <button
                                    onClick={() => setCollapsedCategories(prev => ({ ...prev, [category]: !prev[category] }))}
                                    className="w-full flex items-center gap-3 px-4 py-3 text-zinc-400 hover:text-zinc-900 rounded-[1.25rem] group transition-all hover:bg-zinc-50"
                                >
                                    <FolderIcon className="w-4 h-4" />
                                    <span className="text-sm font-bold capitalize flex-1 text-left tracking-tight">{category}</span>
                                    <ChevronIcon className={`w-3 h-3 transition-transform ${collapsedCategories[category] ? '-rotate-90' : ''}`} />
                                </button>

                                {!collapsedCategories[category] && (
                                    <div className="mt-2 space-y-1 pl-6">
                                        {feeds.filter(f => f.category === category).map(feed => (
                                            <button
                                                key={feed.id}
                                                onClick={() => { setSelectedFeed(feed.id); setIsMobileMenuOpen(false); }}
                                                className={`w-full text-left px-4 py-2.5 rounded-xl text-sm transition-all ${selectedFeed === feed.id ? 'bg-blue-50 text-blue-600 font-bold' : 'text-zinc-400 hover:text-zinc-700 hover:bg-zinc-50/50'}`}
                                            >
                                                {feed.name}
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                        ))}
                    </nav>

                    <div className="mt-auto pt-8 border-t border-zinc-50">
                        <button className="w-full flex items-center gap-4 px-4 py-4 bg-orange-50 text-orange-600 rounded-[1.5rem] group transition-all hover:shadow-xl hover:shadow-orange-500/10">
                            <div className="w-8 h-8 rounded-xl bg-orange-500 flex items-center justify-center text-white shadow-lg shadow-orange-500/30">
                                <ZapIcon className="w-4 h-4" />
                            </div>
                            <span className="text-sm font-bold tracking-tight">Upgrade to Pro+</span>
                        </button>
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 flex flex-col min-w-0 bg-[#F1F4F9] relative">
                <header className="h-24 glass-header flex flex-col md:flex-row items-center px-8 justify-between sticky top-0 z-30 py-2 md:py-0">
                    <div className="flex items-center justify-between w-full md:w-auto gap-10">
                        <div className="flex items-center gap-5">
                            <button
                                onClick={() => setIsMobileMenuOpen(true)}
                                className="lg:hidden p-2 -ml-2 text-zinc-600 active:bg-zinc-100 rounded-2xl"
                                aria-label="Open Menu"
                            >
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="18" x2="21" y2="18" /></svg>
                            </button>
                            <div>
                                <h1 className="text-2xl md:text-3xl font-black tracking-tighter text-zinc-900 leading-none">MediosWikiApp</h1>
                                <p className="text-[10px] md:text-[11px] font-bold text-blue-600 uppercase tracking-tight mt-1.5">Smart Dashboard</p>
                            </div>
                        </div>

                        {/* Date and Time */}
                        <Clock />
                    </div>

                    <div className="flex items-center gap-4">
                        <RefreshIndicator lastUpdate={lastUpdate} isRefreshing={isRefreshing} />
                        <LayoutSwitcher currentMode={viewMode} onModeChange={handleViewModeChange} />
                        <div className="px-5 py-2.5 bg-zinc-900 rounded-[1.25rem] shadow-xl shadow-black/10 flex items-center gap-2.5">
                            <div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
                            <span className="text-[11px] font-bold text-white uppercase tracking-tight">
                                {filteredArticles.length} News Available
                            </span>
                        </div>
                    </div>
                </header>

                <div className="flex-1 flex overflow-hidden">
                    {/* Master: Article List */}
                    <div className={`flex-1 overflow-y-auto p-8 md:p-12 scroll-smooth transition-all duration-300 ${selectedArticleId ? 'hidden md:block md:w-1/3' : 'w-full'}`}>
                        <div className="max-w-7xl mx-auto space-y-12 pb-40">
                            {/* Weather section extracted to WeatherCard */}
                            <WeatherCard cities={cities} />
                            <RoadStatus />

                            {/* Section Header */}
                            <div className="flex items-center justify-between">
                                <div>
                                    <h1 className="text-4xl font-black text-zinc-900 tracking-tight">
                                        {selectedFeed ? feeds.find(f => f.id === selectedFeed)?.name : 'Discovery Center'}
                                    </h1>
                                    <p className="text-zinc-400 font-medium mt-2">Personalized stream for you</p>
                                </div>
                                {selectedFeed && (
                                    <button onClick={() => setSelectedFeed(null)} className="px-5 py-2.5 bg-blue-600 text-white rounded-2xl text-[11px] font-bold tracking-tight shadow-xl shadow-blue-500/30">BACK TO HOME</button>
                                )}
                            </div>

                            {/* Category Grouped Carousels or Single Feed Grid */}
                            {!selectedFeed ? (
                                <div className="space-y-20">
                                    {categories.map(category => {
                                        const categoryArticles = filteredArticles.filter(a => a.sourceCategory === category);
                                        if (categoryArticles.length === 0) return null;

                                        return (
                                            <section key={category} className="space-y-8">
                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center gap-5">
                                                        <div className="h-10 w-2.5 bg-blue-600 rounded-full" />
                                                        <h2 className="text-3xl font-black text-zinc-900 tracking-tight capitalize">
                                                            {category}
                                                        </h2>
                                                    </div>
                                                    <button className="text-[11px] font-bold text-blue-600 tracking-tight hover:underline underline-offset-4 decoration-blue-200">VIEW ALL</button>
                                                </div>

                                                <NewsCarousel
                                                    articles={categoryArticles}
                                                    viewMode={viewMode}
                                                    selectedArticleId={selectedArticleId}
                                                    onArticleClick={(id) => setSelectedArticleId(id)}
                                                />
                                            </section>
                                        );
                                    })}
                                </div>
                            ) : (
                                <div className={
                                    viewMode === 'list'
                                        ? "flex flex-col bg-white border border-white rounded-[2.5rem] overflow-hidden divide-y divide-zinc-50 shadow-2xl shadow-blue-500/5"
                                        : viewMode === 'magazine'
                                            ? "grid grid-cols-1 lg:grid-cols-2 gap-10"
                                            : "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-10"
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
                            )}

                            {/* Empty State */}
                            {filteredArticles.length === 0 && (
                                <div className="flex flex-col items-center justify-center py-32 text-center bg-white rounded-[3rem] shadow-xl shadow-blue-500/5 border border-white">
                                    <div className="w-20 h-20 bg-zinc-50 rounded-3xl flex items-center justify-center mb-6 shadow-inner">
                                        <SearchIcon className="w-8 h-8 text-zinc-300" />
                                    </div>
                                    <h3 className="text-xl font-bold text-zinc-900 tracking-tight">No articles found</h3>
                                    <p className="text-sm text-zinc-400 max-w-xs mx-auto mt-3 font-medium">Try a different search or refine your library filters.</p>
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
