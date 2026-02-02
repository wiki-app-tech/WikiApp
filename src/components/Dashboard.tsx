'use client';

import { useState, useMemo, useEffect } from 'react';
import type { Article, FeedSource } from '@/types';

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
    const [activeTab, setActiveTab] = useState<'home' | 'search' | 'folders'>('home');
    const [currentTelegramIndex, setCurrentTelegramIndex] = useState(0);

    const telegramArticles = useMemo(() =>
        initialArticles.filter(a => a.sourceType === 'telegram'),
        [initialArticles]);

    useEffect(() => {
        if (telegramArticles.length <= 1) return;

        const interval = setInterval(() => {
            setCurrentTelegramIndex(prev => (prev + 1) % telegramArticles.length);
        }, 5000);

        return () => clearInterval(interval);
    }, [telegramArticles.length]);

    const toggleCategory = (category: string) => {
        setCollapsedCategories(prev => ({
            ...prev,
            [category]: !prev[category]
        }));
    };

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
    };

    const categories = useMemo(() => Array.from(new Set(feeds.map(f => f.category))), [feeds]);

    return (
        <div className="flex flex-col lg:flex-row h-screen bg-black text-white font-sans overflow-hidden">
            {/* Sidebar (Tablet/Desktop) / Hamburger Menu (Mobile) */}
            <aside className={`
                fixed inset-0 z-40 lg:relative lg:inset-auto lg:z-auto
                w-full lg:w-64 border-r border-zinc-800 flex flex-col p-4 bg-zinc-950/95 lg:bg-zinc-950 backdrop-blur-xl lg:backdrop-blur-none
                transition-all duration-300 ease-in-out
                ${isMobileMenuOpen || (!selectedArticleId && activeTab === 'folders')
                    ? 'translate-x-0 opacity-100'
                    : '-translate-x-full opacity-0 lg:translate-x-0 lg:opacity-100'}
                ${selectedArticleId ? 'hidden lg:flex' : ''}
            `}>
                <div className="flex items-center justify-between mb-8">
                    <h1 className="text-xl font-bold tracking-tighter text-blue-500">RSS DASH</h1>
                    <button
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="lg:hidden p-3 -mr-3 text-zinc-400 hover:text-white min-w-[44px] min-h-[44px]"
                    >
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6L6 18M6 6l12 12" /></svg>
                    </button>
                </div>

                <nav className="flex-1 space-y-1 overflow-y-auto scrollbar-hide">
                    <button
                        onClick={() => setSelectedFeed(null)}
                        className={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors mb-4 ${!selectedFeed ? 'bg-zinc-800 text-white' : 'hover:bg-zinc-900 text-zinc-400'}`}
                    >
                        Todos los feeds
                    </button>

                    {categories.map(category => (
                        <div key={category} className="mb-2">
                            <button
                                onClick={() => toggleCategory(category)}
                                className="w-full flex items-center justify-between px-3 py-2 hover:bg-zinc-900 rounded-md group transition-colors"
                            >
                                <span className="text-[10px] font-bold text-zinc-500 group-hover:text-zinc-300 uppercase tracking-widest">{category}</span>
                                <svg
                                    width="10"
                                    height="10"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="3"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    className={`text-zinc-600 transition-transform duration-200 ${collapsedCategories[category] ? '-rotate-90' : ''}`}
                                >
                                    <path d="m6 9 6 6 6-6" />
                                </svg>
                            </button>

                            {!collapsedCategories[category] && (
                                <div className="mt-1 space-y-0.5">
                                    {feeds.filter(f => f.category === category).map(feed => (
                                        <button
                                            key={feed.id}
                                            onClick={() => setSelectedFeed(feed.id)}
                                            className={`w-full text-left px-3 py-1.5 ml-1 rounded-md text-sm flex items-center gap-2 transition-colors ${selectedFeed === feed.id ? 'bg-zinc-800 text-white' : 'hover:bg-zinc-900 text-zinc-400'}`}
                                        >
                                            <FeedIcon type={feed.type} />
                                            <span className="truncate">{feed.name}</span>
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    ))}
                </nav>
            </aside>

            {/* Main Content */}
            <main className="flex-1 flex flex-col min-w-0 bg-black">
                {/* Header/Search */}
                <header className="h-14 border-b border-zinc-800 flex items-center px-6 gap-4">
                    <div className="relative flex-1 max-w-lg">
                        <input
                            type="text"
                            placeholder="Buscar noticias..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full bg-zinc-900 border-none rounded-full px-4 py-1.5 text-sm focus:ring-1 focus:ring-blue-500"
                        />
                    </div>
                    {telegramArticles.length > 0 && (
                        <div className="hidden lg:flex items-center flex-1 max-w-md bg-zinc-900 rounded-lg px-3 py-1.5 overflow-hidden border border-zinc-800 relative">
                            <div className="flex items-center gap-2 mr-3 shrink-0">
                                <FeedIcon type="telegram" />
                                <span className="text-[10px] font-bold text-blue-500 uppercase tracking-tighter">LIVE</span>
                            </div>
                            <div className="relative flex-1 h-5 overflow-hidden">
                                {telegramArticles.map((article, idx) => (
                                    <a
                                        key={article.id}
                                        href={article.link}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className={`absolute inset-0 text-xs truncate transition-all duration-500 ease-in-out ${idx === currentTelegramIndex
                                            ? 'opacity-100 translate-y-0'
                                            : 'opacity-0 translate-y-4'
                                            }`}
                                    >
                                        {article.title}
                                    </a>
                                ))}
                            </div>
                        </div>
                    )}
                    <div className="text-xs text-zinc-500 ml-auto">
                        {filteredArticles.length} artículos
                    </div>
                </header>

                {/* Article Grid / Master-Detail */}
                <div className="flex-1 flex overflow-hidden">
                    {/* List (Master) */}
                    <div className={`flex-1 overflow-y-auto p-6 scroll-smooth transition-all duration-300 ${selectedArticleId ? 'hidden md:block md:w-1/3 border-r border-zinc-800' : 'w-full'}`}>
                        <div className={`grid gap-6 ${selectedArticleId ? 'grid-cols-1' : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'}`}>
                            {filteredArticles.map(article => (
                                <button
                                    key={article.id}
                                    onClick={() => setSelectedArticleId(article.id)}
                                    className={`group text-left p-4 rounded-xl border transition-all duration-200 ${selectedArticleId === article.id
                                        ? 'bg-blue-500/10 border-blue-500/50 shadow-[0_0_20px_rgba(59,130,246,0.1)]'
                                        : 'bg-zinc-950 border-zinc-800 hover:border-zinc-700'
                                        }`}
                                >
                                    <div className="flex items-center gap-2 mb-3">
                                        <FeedIcon type={article.sourceType} />
                                        <span className="text-[10px] font-medium text-zinc-500 uppercase">{article.sourceName}</span>
                                    </div>
                                    <h2 className={`text-base font-semibold mb-2 transition-colors line-clamp-2 leading-tight ${selectedArticleId === article.id ? 'text-blue-400' : 'group-hover:text-blue-400'}`}>
                                        {article.title}
                                    </h2>
                                    <p className="text-sm text-zinc-400 line-clamp-3 leading-relaxed">
                                        {article.description}
                                    </p>
                                    <div className="mt-4 text-[10px] text-zinc-600">
                                        {new Date(article.pubDate).toLocaleDateString('es-AR')}
                                    </div>
                                </button>
                            ))}
                        </div>

                        {filteredArticles.length === 0 && (
                            <div className="h-full flex flex-col items-center justify-center text-zinc-500">
                                <p>No se encontraron resultados</p>
                            </div>
                        )}
                    </div>

                    {/* Reader (Detail) */}
                    {selectedArticle && (
                        <ArticleReader
                            article={selectedArticle}
                            onClose={() => setSelectedArticleId(null)}
                            onNavigate={handleNavigate}
                        />
                    )}
                </div>
            </main>
        </div>
    );
}

function ArticleReader({
    article,
    onClose,
    onNavigate
}: {
    article: Article,
    onClose: () => void,
    onNavigate: (dir: 'next' | 'prev') => void
}) {
    const [touchStart, setTouchStart] = useState<number | null>(null);
    const [touchEnd, setTouchEnd] = useState<number | null>(null);

    const minSwipeDistance = 50;

    const onTouchStart = (e: React.TouchEvent) => {
        setTouchEnd(null);
        setTouchStart(e.targetTouches[0].clientX);
    };

    const onTouchMove = (e: React.TouchEvent) => setTouchEnd(e.targetTouches[0].clientX);

    const onTouchEnd = () => {
        if (!touchStart || !touchEnd) return;
        const distance = touchStart - touchEnd;
        const isLeftSwipe = distance > minSwipeDistance;
        const isRightSwipe = distance < -minSwipeDistance;

        if (isLeftSwipe) onNavigate('next');
        if (isRightSwipe) onNavigate('prev');
    };

    return (
        <div
            className="fixed inset-0 z-50 bg-black md:relative md:flex-[2] md:inset-auto md:bg-zinc-950 flex flex-col border-l border-zinc-800 animate-in slide-in-from-right duration-300"
            onTouchStart={onTouchStart}
            onTouchMove={onTouchMove}
            onTouchEnd={onTouchEnd}
        >
            <header className="h-14 border-b border-zinc-800 flex items-center px-4 justify-between bg-zinc-950/80 backdrop-blur-md sticky top-0 z-10">
                <button onClick={onClose} className="p-2 hover:bg-zinc-900 rounded-full text-zinc-400 transition-colors">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="m15 18-6-6 6-6" />
                    </svg>
                </button>
                <div className="flex items-center gap-2">
                    <button onClick={() => onNavigate('prev')} className="p-2 hover:bg-zinc-900 rounded-full text-zinc-400">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6" /></svg>
                    </button>
                    <button onClick={() => onNavigate('next')} className="p-2 hover:bg-zinc-900 rounded-full text-zinc-400">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6" /></svg>
                    </button>
                    <a
                        href={article.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="ml-2 bg-blue-600 hover:bg-blue-500 text-white text-[10px] font-bold px-3 py-1.5 rounded-full transition-all uppercase tracking-wider"
                    >
                        Abrir Original
                    </a>
                </div>
            </header>

            <article className="flex-1 overflow-y-auto p-6 md:p-12 scroll-smooth">
                <div className="max-w-3xl mx-auto space-y-8">
                    <div className="space-y-4">
                        <div className="flex items-center gap-2">
                            <FeedIcon type={article.sourceType} />
                            <span className="text-xs font-bold text-zinc-500 uppercase tracking-widest">{article.sourceName}</span>
                            <span className="text-zinc-700">•</span>
                            <span className="text-xs text-zinc-500">{new Date(article.pubDate).toLocaleString('es-AR')}</span>
                        </div>
                        <h1 className="text-3xl md:text-4xl font-bold leading-tight tracking-tight text-white">
                            {article.title}
                        </h1>
                    </div>

                    <div className="h-px bg-zinc-800 w-full" />

                    <div className="text-zinc-300 text-lg leading-relaxed space-y-4 whitespace-pre-wrap font-serif">
                        {article.description}
                    </div>
                </div>
            </article>
        </div>
    );
}

function FeedIcon({ type }: { type: FeedSource['type'] }) {
    const iconSize = 14;
    switch (type) {
        case 'instagram':
            return (
                <svg width={iconSize} height={iconSize} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-pink-500">
                    <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
                    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
                </svg>
            );
        case 'facebook':
            return (
                <svg width={iconSize} height={iconSize} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-blue-600">
                    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path>
                </svg>
            );
        case 'x':
            return (
                <svg width={iconSize} height={iconSize} viewBox="0 0 24 24" fill="white" strokeWidth="0">
                    <path d="M18.901 1.153h3.68l-8.04 9.19L24 22.846h-7.406l-5.8-7.584-6.638 7.584H.474l8.6-9.83L0 1.154h7.594l5.243 6.932ZM17.61 20.644h2.039L6.486 3.24H4.298Z"></path>
                </svg>
            );
        case 'telegram':
            return (
                <svg width={iconSize} height={iconSize} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-blue-400">
                    <line x1="22" y1="2" x2="11" y2="13"></line>
                    <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
                </svg>
            );
        default:
            return (
                <svg width={iconSize} height={iconSize} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-orange-500">
                    <path d="M4 11a9 9 0 0 1 9 9"></path>
                    <path d="M4 4a16 16 0 0 1 16 16"></path>
                    <circle cx="5" cy="19" r="1"></circle>
                </svg>
            );
    }
}
