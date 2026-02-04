import { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import type { Article, FeedSource } from '@/types';
import ArticleCard from '@/components/ArticleCard';
import LayoutSwitcher from '@/components/LayoutSwitcher';

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
    const [currentTelegramIndex, setCurrentTelegramIndex] = useState(0);
    const [currentTime, setCurrentTime] = useState(new Date());
    const [selectedCity, setSelectedCity] = useState('Ushuaia');
    const [weatherData, setWeatherData] = useState<any>(null);
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

    useEffect(() => {
        const fetchWeather = async () => {
            try {
                const res = await fetch('/data/weather.json');
                const data = await res.json();
                setWeatherData(data);
            } catch (error) {
                console.error("Error fetching weather:", error);
            }
        };
        fetchWeather();
    }, []);

    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentTime(new Date());
        }, 1000);
        return () => clearInterval(timer);
    }, []);

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
        setMockSummary(null); // Clear summary when navigating
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

                        {/* Date and Time */}
                        <div className="flex flex-col items-end md:items-start md:ml-10 border-l border-zinc-200 pl-4 md:pl-10">
                            <span className="text-[9px] md:text-[10px] font-black text-zinc-400 uppercase tracking-[0.15em] leading-none mb-1 text-right md:text-left">
                                {currentTime.toLocaleDateString('es-AR', { weekday: 'long', day: 'numeric', month: 'long' })}
                            </span>
                            <div className="flex items-center gap-3">
                                <span className="text-sm md:text-xl font-black text-zinc-900 tabular-nums leading-none tracking-tight">
                                    {currentTime.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false, timeZone: 'America/Argentina/Ushuaia' })}
                                </span>
                            </div>
                        </div>
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
                            {/* Premium Weather App Card */}
                            <section className="bg-[#020617] rounded-[3rem] overflow-hidden shadow-2xl shadow-blue-900/40 mb-12 border border-blue-500/10 transition-all duration-500 hover:shadow-blue-900/60 ring-1 ring-white/5">
                                {/* Navigation Superior */}
                                <div className="p-6 bg-white/5 backdrop-blur-3xl border-b border-white/5 flex items-center justify-between overflow-x-auto no-scrollbar">
                                    <div className="flex gap-2 p-1.5 bg-black/40 rounded-2xl border border-white/5">
                                        {Object.keys(cities).map(city => (
                                            <button
                                                key={city}
                                                onClick={() => setSelectedCity(city)}
                                                className={`px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all duration-300 flex items-center gap-2 whitespace-nowrap ${selectedCity === city
                                                    ? 'bg-yellow-400 text-black shadow-lg shadow-yellow-400/20'
                                                    : 'text-zinc-500 hover:text-white hover:bg-white/5'
                                                    }`}
                                            >
                                                {city}
                                            </button>
                                        ))}
                                    </div>
                                    <div className="hidden md:flex items-center gap-2 px-4 py-2 bg-yellow-400/10 rounded-xl border border-yellow-400/20 shrink-0">
                                        <div className="w-2 h-2 rounded-full bg-yellow-400 animate-pulse" />
                                        <span className="text-[10px] font-black text-yellow-400 uppercase tracking-widest leading-none">LIVE RADAR</span>
                                    </div>
                                </div>

                                <div className="p-10 lg:p-14 flex flex-col lg:flex-row gap-16">
                                    {/* Héroe de Datos */}
                                    <div className="lg:w-1/3 flex flex-col justify-center">
                                        <div className="flex items-center gap-6 mb-4">
                                            <div className="text-8xl md:text-9xl font-black text-white tracking-tighter tabular-nums leading-none">
                                                {weatherData?.[selectedCity]?.temp || '--'}
                                                <span className="text-yellow-400 text-6xl md:text-7xl align-top ml-2">°</span>
                                            </div>
                                            <div className="w-20 h-20 text-yellow-500 drop-shadow-[0_0_15px_rgba(250,204,21,0.3)]">
                                                <CloudSunIcon />
                                            </div>
                                        </div>
                                        <div className="space-y-2 mb-10">
                                            <div className="text-2xl md:text-3xl font-black text-white capitalize tracking-tight">{weatherData?.[selectedCity]?.condition || 'Cargando...'}</div>
                                            <div className="text-[10px] font-bold text-blue-400/80 uppercase tracking-[0.2em]">Pronóstico para {selectedCity}</div>
                                        </div>

                                        {/* Pronóstico Extendido */}
                                        <div className="grid grid-cols-3 gap-4 border-t border-white/10 pt-10">
                                            {weatherData?.[selectedCity]?.forecast.slice(0, 3).map((f: any, i: number) => (
                                                <div key={i} className="bg-white/5 rounded-2xl p-4 border border-white/5 flex flex-col items-center gap-3 hover:bg-white/10 transition-all hover:-translate-y-1">
                                                    <span className="text-[10px] font-black text-blue-400 uppercase tracking-widest">{f.day}</span>
                                                    <div className="text-yellow-500 w-8 h-8">
                                                        <SunSmallIcon />
                                                    </div>
                                                    <div className="flex flex-col items-center">
                                                        <span className="text-sm font-black text-white">{f.temp}°</span>
                                                        <span className="text-[9px] font-bold text-zinc-500 uppercase">Max/Min</span>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Sección de Mapa / Radar */}
                                    <div className="flex-1 flex flex-col gap-6">
                                        <div className="flex-1 relative aspect-video lg:aspect-auto min-h-[400px] bg-[#020617] rounded-[2.5rem] overflow-hidden border border-white/10 group/map shadow-inner shadow-black/50">
                                            <iframe
                                                width="100%"
                                                height="100%"
                                                src={`https://embed.windy.com/embed2.html?lat=${cities[selectedCity as keyof typeof cities]?.lat || -54.8019}&lon=${cities[selectedCity as keyof typeof cities]?.lon || -68.303}&detailLat=${cities[selectedCity as keyof typeof cities]?.lat || -54.8019}&detailLon=${cities[selectedCity as keyof typeof cities]?.lon || -68.303}&width=650&height=450&zoom=6&level=surface&overlay=wind&product=ecmwf&menu=&message=&marker=&calendar=now&pressure=&type=map&location=coordinates&detail=&metricWind=default&metricTemp=default&radarRange=-1`}
                                                frameBorder="0"
                                                className="absolute inset-0 opacity-80 contrast-[1.2] brightness-[0.8] hover:opacity-100 transition-opacity duration-700"
                                            ></iframe>

                                            {/* Controles de Reproducción Simplificados */}
                                            <div className="absolute bottom-6 left-6 right-6 bg-[#020617]/80 backdrop-blur-2xl px-6 py-4 rounded-[1.5rem] border border-white/10 flex items-center justify-between opacity-0 group-hover/map:opacity-100 transition-all duration-500 translate-y-4 group-hover/map:translate-y-0">
                                                <div className="flex items-center gap-4">
                                                    <button className="w-10 h-10 rounded-full bg-yellow-400 flex items-center justify-center text-black shadow-xl shadow-yellow-400/40 active:scale-95 transition-transform">
                                                        <svg width="24" height="24" viewBox="0 0 24 24" fill="currentcolor"><path d="M8 5v14l11-7z" /></svg>
                                                    </button>
                                                    <div className="flex flex-col">
                                                        <span className="text-[9px] font-black text-white uppercase tracking-widest leading-none">Radar en tiempo real</span>
                                                        <span className="text-[10px] text-zinc-400 mt-1">Sincronizado: ahora</span>
                                                    </div>
                                                </div>

                                                {/* Leyenda de Intensidad */}
                                                <div className="hidden sm:flex items-center gap-3">
                                                    <div className="flex items-center gap-1.5 px-3 py-1.5 bg-black/60 rounded-full border border-white/10">
                                                        <div className="flex gap-1">
                                                            <div className="w-2.5 h-1.5 rounded-full bg-blue-500/80" />
                                                            <div className="w-2.5 h-1.5 rounded-full bg-green-500/80" />
                                                            <div className="w-2.5 h-1.5 rounded-full bg-yellow-500/80" />
                                                            <div className="w-2.5 h-1.5 rounded-full bg-red-500/80" />
                                                        </div>
                                                        <span className="text-[9px] font-black text-white/60 uppercase tracking-widest ml-1">Precipitación</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </section>

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

                    {/* Detail: Reader */}
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

function NavIcon({ children, active, label, onClick }: { children: React.ReactNode, active?: boolean, label: string, onClick?: () => void }) {
    return (
        <button
            onClick={onClick}
            className={`w-12 h-12 flex flex-col items-center justify-center rounded-xl transition-all relative group ${active ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20' : 'text-zinc-400 hover:bg-white/10 hover:text-white'}`}
        >
            {children}
            <span className="hidden lg:group-hover:block absolute left-full ml-3 px-2 py-1 bg-zinc-900 text-white text-[10px] font-bold rounded whitespace-nowrap z-50">{label}</span>
        </button>
    );
}

function CategoryButton({ active, label, icon, onClick }: { active: boolean, label: string, icon: React.ReactNode, onClick: () => void }) {
    return (
        <button
            onClick={onClick}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${active ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20' : 'text-zinc-500 hover:bg-zinc-200/50 hover:text-zinc-900'}`}
        >
            {icon}
            <span className="text-sm font-bold">{label}</span>
        </button>
    );
}

function MobileTab({ active, label, icon, onClick }: { active: boolean, label: string, icon: React.ReactNode, onClick: () => void }) {
    return (
        <button onClick={onClick} className={`flex flex-col items-center justify-center gap-1 flex-1 min-h-[64px] transition-all transform active:scale-90 ${active ? 'text-blue-600' : 'text-zinc-400'}`}>
            <div className={`p-2 rounded-2xl transition-all duration-300 ${active ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30' : 'bg-transparent'}`}>{icon}</div>
            <span className="text-[9px] font-black uppercase tracking-[0.15em] mt-0.5">{label}</span>
        </button>
    );
}

function ArticleReader({ article, onClose, onNavigate, onSummarize, isSummarizing, summary }: {
    article: Article,
    onClose: () => void,
    onNavigate: (dir: 'next' | 'prev') => void,
    onSummarize: () => void,
    isSummarizing: boolean,
    summary: string | null
}) {
    const [touchStart, setTouchStart] = useState<number | null>(null);
    const [touchEnd, setTouchEnd] = useState<number | null>(null);

    const onTouchStart = (e: React.TouchEvent) => { setTouchEnd(null); setTouchStart(e.targetTouches[0].clientX); };
    const onTouchMove = (e: React.TouchEvent) => setTouchEnd(e.targetTouches[0].clientX);
    const onTouchEnd = () => {
        if (!touchStart || !touchEnd) return;
        const distance = touchStart - touchEnd;
        if (distance > 50) onNavigate('next');
        if (distance < -50) onNavigate('prev');
    };

    return (
        <div
            className="fixed inset-0 z-50 bg-white md:relative md:flex-[2.5] md:inset-auto md:bg-white flex flex-col md:border-l md:border-zinc-100 animate-in slide-in-from-right duration-500 ease-out"
            onTouchStart={onTouchStart} onTouchMove={onTouchMove} onTouchEnd={onTouchEnd}
        >
            <header className="h-16 lg:h-20 border-b border-zinc-100 flex items-center px-6 justify-between bg-white sticky top-0 z-10">
                <button onClick={onClose} className="p-2 -ml-2 text-zinc-400 hover:text-zinc-900 transition-colors">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6" /></svg>
                </button>
                <div className="flex items-center gap-4">
                    <button
                        onClick={onSummarize}
                        disabled={isSummarizing || !!summary}
                        className={`flex items-center gap-2 px-4 py-2 rounded-full text-[10px] font-black transition-all ${summary ? 'bg-orange-50 text-orange-600' : 'bg-zinc-900 text-white hover:bg-zinc-800'
                            } disabled:opacity-50`}
                    >
                        <ZapIcon className="w-3 h-3" />
                        {isSummarizing ? 'GENERANDO...' : summary ? 'RESUMEN IA' : 'SOLICITAR RESUMEN'}
                    </button>
                    <div className="flex items-center gap-2">
                        <button onClick={() => onNavigate('prev')} className="p-2 text-zinc-400 hover:text-zinc-900">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6" /></svg>
                        </button>
                        <button onClick={() => onNavigate('next')} className="p-2 text-zinc-400 hover:text-zinc-900">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6" /></svg>
                        </button>
                    </div>
                    <a href={article.link} target="_blank" rel="noopener noreferrer" className="hidden md:block bg-[#1a73e8] text-white text-[11px] font-black px-8 py-3.5 rounded-full uppercase tracking-widest shadow-lg shadow-blue-500/20 active:scale-95 transition-all">VISITAR WEB</a>
                </div>
            </header>

            <article className="flex-1 overflow-y-auto p-8 md:p-16 scroll-smooth">
                <div className="max-w-3xl mx-auto space-y-12">
                    {summary && (
                        <div className="bg-orange-50/50 border border-orange-100 rounded-[2rem] p-8 md:p-10 animate-in fade-in slide-in-from-top-4 duration-700">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="w-8 h-8 rounded-full bg-orange-500 flex items-center justify-center text-white shadow-lg shadow-orange-500/20">
                                    <ZapIcon className="w-4 h-4" />
                                </div>
                                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-orange-600">Inoreader Intelligence</span>
                            </div>
                            <p className="text-orange-900 text-lg md:text-xl font-bold leading-relaxed">
                                {summary}
                            </p>
                            <div className="mt-6 flex gap-4">
                                <button className="text-[10px] font-black text-orange-600 uppercase tracking-widest hover:underline">Copiar Resumen</button>
                                <button className="text-[10px] font-black text-orange-600 uppercase tracking-widest hover:underline">Más información</button>
                            </div>
                        </div>
                    )}
                    <div className="space-y-6">
                        <div className="flex items-center gap-3 text-xs font-bold uppercase tracking-widest">
                            <span className="text-[#1a73e8]">{article.sourceName}</span>
                            <span className="text-zinc-300">•</span>
                            <span className="text-zinc-400">{new Date(article.pubDate).toLocaleString('es-AR')}</span>
                        </div>
                        <h1 className="text-4xl md:text-6xl font-black leading-[1.1] tracking-tight text-zinc-900">{article.title}</h1>
                        <div className="w-16 h-1 bg-[#1a73e8] rounded-full mt-8" />
                    </div>

                    <div className="text-zinc-700 text-lg md:text-2xl leading-[1.6] space-y-8 whitespace-pre-wrap font-sans font-medium antialiased">
                        {article.description}
                    </div>
                </div>
            </article>
        </div>
    );
}

/* Icons */
const LayoutIcon = ({ className = "w-5 h-5" }) => <svg className={className} width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect width="7" height="7" x="3" y="3" rx="1" /><rect width="7" height="7" x="14" y="3" rx="1" /><rect width="7" height="7" x="14" y="14" rx="1" /><rect width="7" height="7" x="3" y="14" rx="1" /></svg>;
const RssIcon = ({ className = "w-5 h-5" }) => <svg className={className} width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M4 11a9 9 0 0 1 9 9" /><path d="M4 4a16 16 0 0 1 16 16" /><circle cx="5" cy="19" r="1" /></svg>;
const BookmarkIcon = ({ className = "w-5 h-5" }) => <svg className={className} width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m19 21-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16z" /></svg>;
const ZapIcon = ({ className = "w-5 h-5" }) => <svg className={className} width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M4 14a1 1 0 0 1-.78-1.63l9.9-10.2a.5.5 0 0 1 .86.46l-1.92 6.02A1 1 0 0 0 13 10h7a1 1 0 0 1 .78 1.63l-9.9 10.2a.5.5 0 0 1-.86-.46l1.92-6.02A1 1 0 0 0 11 14z" /></svg>;
const SearchIcon = ({ className = "w-5 h-5" }) => <svg className={className} width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" /></svg>;
const SettingsIcon = ({ className = "w-5 h-5" }) => <svg className={className} width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.1a2 2 0 0 1-1-1.72v-.51a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" /><circle cx="12" cy="12" r="3" /></svg>;
const FolderIcon = ({ className = "w-5 h-5" }) => <svg className={className} width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20 20a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.9a2 2 0 0 1-1.69-.9L9.6 3.9A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2Z" /></svg>;
const ChevronIcon = ({ className = "w-5 h-5" }) => <svg className={className} width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6" /></svg>;
const CheckIcon = ({ className = "w-5 h-5" }) => <svg className={className} width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5" /></svg>;
const CloudIcon = ({ className = "w-5 h-5" }) => <svg className={className} width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M17.5 19a5.5 5.5 0 0 0 2.5-10.5 8.5 8.5 0 1 0-14.7 7.7" /><path d="M12 13v.01" /><path d="M12 17v.01" /></svg>;
const FeedIcon = ({ type }: { type: Article['sourceType'] }) => {
    switch (type) {
        case 'telegram': return <ZapIcon className="w-3 h-3 text-blue-500" />;
        default: return <RssIcon className="w-3 h-3 text-zinc-400" />;
    }
};

const CloudSunIcon = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" />
        <path d="M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8z" />
        <path d="M20 17.5c0 1.9-1.6 3.5-3.5 3.5H9c-2.8 0-5-2.2-5-5a5 5 0 0 1 4.5-5A7.5 7.5 0 0 1 21 13c0 .5 0 1-.1 1.5" stroke="currentColor" fill="none" />
    </svg>
);

const SunSmallIcon = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="4" />
        <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" stroke="#fbbf24" />
    </svg>
);
