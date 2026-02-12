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
import CruiseShipWidget from '@/components/widgets/CruiseShipWidget';
import FlightStatusWidget from '@/components/widgets/FlightStatusWidget';
import LiveCamerasWidget from '@/components/widgets/LiveCamerasWidget';
import ElectionsWidget from '@/components/widgets/ElectionsWidget';
import PrintEditionsWidget from '@/components/widgets/PrintEditionsWidget';
import EconomicIndicatorsWidget from '@/components/widgets/EconomicIndicatorsWidget';
import TDFStatsWidget from '@/components/widgets/TDFStatsWidget';
import RefreshIndicator from '@/components/RefreshIndicator';
import MediosWikiAppLogo from '@/components/MediosWikiAppLogo';
import SavedArticlesView from '@/components/SavedArticlesView';
import SaveArticleModal from '@/components/SaveArticleModal';
import { generateNewsSummary } from '@/services/geminiService';
import { useAutoRefresh } from '@/hooks/useAutoRefresh';
import { useSavedArticles } from '@/hooks/useSavedArticles';
import { useFollowedFeeds } from '@/hooks/useFollowedFeeds';
import { useTheme } from '@/components/ThemeProvider';
import { NavIcon, CategoryButton, MobileTab } from '@/components/DashboardUI';
import { StreamingPlayer, STREAMING_SOURCES } from '@/components/StreamingPlayer';
import type { StreamingSource } from '@/components/StreamingPlayer';
import {
    LayoutIcon,
    RssIcon,
    BookmarkIcon,
    ZapIcon,
    SearchIcon,
    SettingsIcon,
    FolderIcon,
    ChevronIcon,
    HeadphonesIcon,
    PlusIcon,
    CircleIcon,
    FilterIcon,
    SortIcon,
    ListIcon,
    GridSmallIcon,
    DotsIcon,
    CheckIcon,
    FacebookIcon,
    YoutubeIcon,
    RedditIcon,
    TelegramIcon,
    PodcastIcon,
    Share2Icon,
    UserIcon,
    SunIcon,
    MoonIcon
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
    const [activeTab, setActiveTab] = useState<'home' | 'videos' | 'audio' | 'zonas' | 'search' | 'folders' | 'saved' | 'automate' | 'settings'>('home');
    const [viewMode, setViewMode] = useState<'list' | 'card' | 'magazine'>('card');
    const [isSummarizing, setIsSummarizing] = useState(false);
    const [articleSummary, setArticleSummary] = useState<string | null>(null);
    const [articles, setArticles] = useState<Article[]>(initialArticles);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [globalSearch, setGlobalSearch] = useState('');
    const [saveModalArticle, setSaveModalArticle] = useState<Article | null>(null);
    const [activeStream, setActiveStream] = useState<any | null>(null);
    const [feedSearch, setFeedSearch] = useState('');
    const [showFeedResults, setShowFeedResults] = useState(false);
    const [startDate, setStartDate] = useState<string | null>(null);
    const [endDate, setEndDate] = useState<string | null>(null);
    const [showDatePicker, setShowDatePicker] = useState(false);
    const { theme, toggleTheme } = useTheme();

    const {
        followedFeeds,
        followFeed,
        unfollowFeed,
        isFollowing
    } = useFollowedFeeds(feeds);

    const feedResults = useMemo(() => {
        if (feedSearch.length < 2) return [];
        return feeds.filter(f =>
            f.name.toLowerCase().includes(feedSearch.toLowerCase()) ||
            f.category.toLowerCase().includes(feedSearch.toLowerCase())
        ).slice(0, 5);
    }, [feeds, feedSearch]);

    // Calcular conteos de artículos por feed
    const feedCounts = useMemo(() => {
        const counts: Record<string, number> = {};
        articles.forEach(a => {
            counts[a.sourceId] = (counts[a.sourceId] || 0) + 1;
        });
        return counts;
    }, [articles]);

    // Calcular conteos por categoría
    const categoryCounts = useMemo(() => {
        const counts: Record<string, number> = {};
        followedFeeds.forEach(f => {
            const feedCount = feedCounts[f.id] || 0;
            counts[f.category] = (counts[f.category] || 0) + feedCount;
        });
        return counts;
    }, [followedFeeds, feedCounts]);

    // Hook para artículos guardados
    const {
        savedArticles,
        isArticleSaved,
        toggleSaveArticle,
        saveArticle,
        unsaveArticle,
        markAsRead,
        isArticleRead,
        getAllTags,
        removeTagFromArticle
    } = useSavedArticles();

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

                const articleDate = new Date(a.pubDate);
                const matchesStartDate = startDate ? articleDate >= new Date(startDate) : true;
                const matchesEndDate = endDate ? articleDate <= new Date(`${endDate}T23:59:59`) : true;

                return matchesSearch && matchesFeed && matchesStartDate && matchesEndDate;
            })
            .sort((a, b) => new Date(b.pubDate).getTime() - new Date(a.pubDate).getTime());
    }, [articles, search, selectedFeed, startDate, endDate]);

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
        setArticleSummary(null);
    };

    const handleSummarize = async () => {
        if (!selectedArticle) return;
        setIsSummarizing(true);
        try {
            const summaryResult = await generateNewsSummary([{
                title: selectedArticle.title,
                source: selectedArticle.sourceName
            }]);
            setArticleSummary(summaryResult);
        } catch (error) {
            console.error("Error generating summary:", error);
            setArticleSummary("No se pudo generar el resumen inteligente. Por favor, intente más tarde.");
        } finally {
            setIsSummarizing(false);
        }
    };

    const categories = useMemo(() => Array.from(new Set(followedFeeds.map(f => f.category))), [followedFeeds]);

    return (
        <div className="flex h-screen bg-surface-primary text-text-primary font-sans overflow-hidden">
            {/* Sidebar 1: Icon Bar (Narrow Aqua) */}
            <aside className="hidden lg:flex w-16 bg-surface-elevated flex-col items-center py-6 gap-2 shrink-0 z-50 border-r border-accent-primary/10 shadow-lg">
                <div className="mb-8">
                    <MediosWikiAppLogo className="w-10 h-10" />
                </div>
                <NavIcon active={activeTab === 'home' && !selectedFeed} onClick={() => { setActiveTab('home'); setSelectedFeed(null); }} label="DASHBOARD"><LayoutIcon className="w-5 h-5" /></NavIcon>
                <NavIcon active={activeTab === 'videos'} onClick={() => setActiveTab('videos')} label="VIDEOS"><YoutubeIcon className="w-5 h-5" /></NavIcon>
                <NavIcon active={activeTab === 'audio'} onClick={() => setActiveTab('audio')} label="AUDIOS"><HeadphonesIcon className="w-5 h-5" /></NavIcon>
                <NavIcon active={activeTab === 'zonas'} onClick={() => setActiveTab('zonas')} label="ZONAS"><Share2Icon className="w-5 h-5" /></NavIcon>

                <div className="mt-auto flex flex-col gap-2 pb-6 w-full items-center">
                    <NavIcon active={activeTab === 'search'} onClick={() => { setActiveTab('search'); setGlobalSearch(''); }} label="BUSCAR"><SearchIcon className="w-5 h-5" /></NavIcon>
                    <NavIcon active={activeTab === 'settings'} onClick={() => setActiveTab('settings')} label="OPCIONES"><SettingsIcon className="w-5 h-5" /></NavIcon>
                    <div className="mt-4 pt-4 border-t border-slate-100 w-full flex justify-center">
                        <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center text-[10px] font-bold text-blue-600 border border-blue-100 shadow-sm">JS</div>
                    </div>
                </div>
            </aside>

            {/* Sidebar 2: Content Sidebar (Wider Aqua) */}
            <aside className={`
                fixed inset-0 z-40 lg:relative lg:inset-auto lg:z-auto
                h-full border-r border-accent-primary/10 flex flex-col bg-surface-elevated transition-all duration-300 ease-in-out overflow-hidden
                ${isMobileMenuOpen || (activeTab === 'home' || activeTab === 'audio' || activeTab === 'automate')
                    ? 'w-full lg:w-72 opacity-100 translate-x-0'
                    : 'w-0 opacity-0 -translate-x-full pointer-events-none'}
                ${selectedArticleId && !isMobileMenuOpen ? 'hidden lg:flex' : 'flex'}
            `}>
                <div className="p-5 flex flex-col h-full">
                    {activeTab === 'home' ? (
                        <>
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-lg font-bold tracking-tight text-text-primary">Feeds</h2>
                                <div className="flex items-center gap-1">
                                    <button className="p-1.5 text-text-tertiary hover:text-accent-primary rounded-lg hover:bg-white/5">
                                        <SettingsIcon className="w-4 h-4" />
                                    </button>
                                    <button className="p-1.5 text-text-tertiary hover:text-accent-primary rounded-lg hover:bg-white/5">
                                        <CircleIcon className="w-4 h-4" />
                                    </button>
                                    <button className="p-1.5 text-accent-primary hover:text-accent-secondary rounded-lg hover:bg-accent-primary/10">
                                        <SearchIcon className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>

                            <div className="relative mb-8">
                                <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-300 w-4 h-4" />
                                <input
                                    type="text"
                                    placeholder="Buscar o añadir feed..."
                                    value={feedSearch}
                                    onChange={(e) => {
                                        setFeedSearch(e.target.value);
                                        setShowFeedResults(true);
                                    }}
                                    onFocus={() => setShowFeedResults(true)}
                                    className="w-full bg-zinc-50 border-zinc-100 border rounded-2xl pl-12 pr-10 py-3.5 text-sm font-medium focus:ring-4 focus:ring-blue-500/5 focus:bg-white focus:border-blue-200 transition-all outline-none"
                                />
                                {feedSearch && (
                                    <button
                                        onClick={() => { setFeedSearch(''); setShowFeedResults(false); }}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 text-zinc-300 hover:text-zinc-500 hover:bg-zinc-100 rounded-xl transition-all"
                                    >
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" /></svg>
                                    </button>
                                )}

                                {/* Dropdown de resultados de feeds */}
                                {showFeedResults && feedSearch.length >= 2 && (
                                    <div className="absolute top-full left-0 right-0 mt-2 bg-surface-elevated border border-accent-primary/20 rounded-[1.5rem] shadow-2xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200 glass-card">
                                        <div className="p-3 bg-surface-primary/30 border-b border-accent-primary/10 flex items-center justify-between">
                                            <span className="text-[10px] font-bold text-text-tertiary uppercase tracking-widest pl-2">Recomendados</span>
                                            <button onClick={() => setShowFeedResults(false)} className="p-1 hover:bg-white/10 rounded-lg transition-colors">
                                                <svg className="w-3.5 h-3.5 text-text-tertiary" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" /></svg>
                                            </button>
                                        </div>
                                        <div className="max-h-80 overflow-y-auto">
                                            {feedResults.length > 0 ? (
                                                feedResults.map(feed => (
                                                    <div key={feed.id} className="group p-2">
                                                        <div className="flex items-center justify-between p-3 rounded-xl hover:bg-zinc-50 transition-all">
                                                            <button
                                                                onClick={() => {
                                                                    setSelectedFeed(feed.id);
                                                                    setActiveTab('home');
                                                                    setShowFeedResults(false);
                                                                    setFeedSearch('');
                                                                    setIsMobileMenuOpen(false);
                                                                }}
                                                                className="flex-1 text-left"
                                                            >
                                                                <div className="font-bold text-sm text-text-primary group-hover:text-accent-primary transition-colors">{feed.name}</div>
                                                                <div className="text-[10px] text-text-tertiary font-bold uppercase tracking-tighter mt-0.5">{feed.category}</div>
                                                            </button>

                                                            {isFollowing(feed.id) ? (
                                                                <span className="text-[10px] font-bold text-text-tertiary uppercase tracking-widest px-3 py-1.5">Siguiendo</span>
                                                            ) : (
                                                                <button
                                                                    onClick={() => followFeed(feed.id)}
                                                                    className="flex items-center gap-1.5 px-4 py-1.5 bg-accent-primary hover:bg-accent-secondary text-surface-primary rounded-xl text-[10px] font-bold transition-all shadow-lg shadow-accent-primary/20 active:scale-95"
                                                                >
                                                                    <PlusIcon className="w-3 h-3" />
                                                                    SEGUIR
                                                                </button>
                                                            )}
                                                        </div>
                                                    </div>
                                                ))
                                            ) : (
                                                <div className="p-8 text-center">
                                                    <p className="text-zinc-400 text-sm font-medium">No se encontraron feeds</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}
                                {/* Overlay para cerrar el dropdown */}
                                {showFeedResults && (
                                    <div className="fixed inset-0 z-40" onClick={() => setShowFeedResults(false)} />
                                )}
                            </div>

                            <nav className="space-y-0.5 overflow-y-auto pr-2 -mr-2 scrollbar-hide">
                                <button
                                    onClick={() => { setSelectedFeed(null); setIsMobileMenuOpen(false); }}
                                    className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-all ${!selectedFeed ? 'bg-accent-primary/10 text-accent-primary font-bold' : 'text-text-secondary hover:bg-white/5'}`}
                                >
                                    <LayoutIcon className={`w-4 h-4 ${!selectedFeed ? 'text-accent-primary' : 'text-text-tertiary'}`} />
                                    <span className="text-sm flex-1 text-left">Newsfeed</span>
                                    <span className="text-[10px] font-bold opacity-60 text-text-tertiary">{articles.length}</span>
                                </button>

                                {categories.map(category => (
                                    <div key={category} className="mt-1">
                                        <button
                                            onClick={() => setCollapsedCategories(prev => ({ ...prev, [category]: !prev[category] }))}
                                            className="w-full flex items-center gap-3 px-3 py-2 text-slate-600 hover:text-slate-900 rounded-lg group transition-all hover:bg-slate-50"
                                        >
                                            <ChevronIcon className={`w-3 h-3 transition-transform text-slate-400 ${collapsedCategories[category] ? '-rotate-90' : ''}`} />
                                            <span className="text-sm font-bold capitalize flex-1 text-left">{category}</span>
                                            <span className="text-[10px] font-bold text-slate-400">{categoryCounts[category] || 0}</span>
                                        </button>

                                        {!collapsedCategories[category] && (
                                            <div className="mt-0.5 space-y-0.5 pl-4">
                                                {followedFeeds.filter(f => f.category === category).map(feed => (
                                                    <div key={feed.id} className="relative group/feed">
                                                        <button
                                                            onClick={() => { setSelectedFeed(feed.id); setActiveTab('home'); setIsMobileMenuOpen(false); }}
                                                            className={`w-full flex items-center gap-3 px-3 py-1.5 rounded-lg text-[13px] transition-all ${selectedFeed === feed.id ? 'bg-accent-primary/10 text-accent-primary font-bold shadow-glow-accent' : 'text-text-tertiary hover:text-text-primary hover:bg-accent-primary/5'}`}
                                                        >
                                                            <span className="flex-1 text-left truncate">{feed.name}</span>
                                                            <span className="text-[10px] font-medium opacity-50 group-hover/feed:opacity-0 transition-opacity">{feedCounts[feed.id] || 0}</span>
                                                        </button>
                                                        <button
                                                            onClick={(e) => { e.stopPropagation(); unfollowFeed(feed.id); }}
                                                            className="absolute right-1 top-1/2 -translate-y-1/2 p-1 text-slate-300 hover:text-red-500 opacity-0 group-hover/feed:opacity-100 transition-all"
                                                        >
                                                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                                                        </button>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </nav>

                            <div className="mt-auto pt-4 space-y-4 border-t border-slate-50">
                                {activeStream && (
                                    <button
                                        onClick={() => setActiveTab('audio')}
                                        className="w-full bg-accent-primary/10 rounded-2xl p-4 shadow-glow-accent flex items-center gap-3 group/mini hover:scale-[1.02] transition-all border border-accent-primary/20 glass-card"
                                    >
                                        <div className="w-8 h-8 bg-accent-primary rounded-lg flex items-center justify-center text-surface-primary shrink-0">
                                            <div className="flex gap-0.5 items-end h-3">
                                                <div className="w-0.5 h-2 bg-surface-primary rounded-full animate-pulse" />
                                                <div className="w-0.5 h-3 bg-surface-primary rounded-full animate-bounce" />
                                                <div className="w-0.5 h-1.5 bg-surface-primary rounded-full animate-pulse" />
                                            </div>
                                        </div>
                                        <div className="flex-1 min-w-0 text-left">
                                            <div className="text-[8px] font-black text-accent-primary uppercase tracking-widest leading-none">LIVE</div>
                                            <div className="text-[11px] font-bold text-text-primary truncate leading-tight font-display">{activeStream.name}</div>
                                        </div>
                                    </button>
                                )}

                            </div>
                        </>
                    ) : activeTab === 'audio' ? (
                        <>
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-lg font-bold tracking-tight text-slate-900">Media Library</h2>
                                <button className="p-1.5 text-slate-400 hover:text-blue-600 rounded-lg transition-colors">
                                    <PlusIcon className="w-4 h-4" />
                                </button>
                            </div>

                            <div className="space-y-6 overflow-y-auto pr-2 -mr-2 scrollbar-hide">
                                {/* Radios Section */}
                                <div>
                                    <div className="flex items-center gap-2 px-3 py-1 mb-2">
                                        <div className="w-1.5 h-1.5 bg-orange-500 rounded-full" />
                                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Radios</span>
                                    </div>
                                    <div className="space-y-1">
                                        {STREAMING_SOURCES.filter(s => s.type === 'radio').map(source => (
                                            <button
                                                key={source.id}
                                                onClick={() => setActiveStream(source)}
                                                className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm transition-all ${activeStream?.id === source.id ? 'bg-orange-50 text-orange-600 font-bold' : 'text-slate-600 hover:bg-slate-50'}`}
                                            >
                                                <ZapIcon className={`w-3.5 h-3.5 ${activeStream?.id === source.id ? 'text-orange-600' : 'text-slate-400'}`} />
                                                <span className="flex-1 text-left truncate">{source.name}</span>
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* TV Section */}
                                <div>
                                    <div className="flex items-center gap-2 px-3 py-1 mb-2">
                                        <div className="w-1.5 h-1.5 bg-blue-600 rounded-full" />
                                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Canales TV</span>
                                    </div>
                                    <div className="space-y-1">
                                        {STREAMING_SOURCES.filter(s => s.type === 'tv').map(source => (
                                            <button
                                                key={source.id}
                                                onClick={() => setActiveStream(source)}
                                                className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm transition-all ${activeStream?.id === source.id ? 'bg-accent-primary/10 text-accent-primary font-bold shadow-glow-accent border border-accent-primary/20' : 'text-text-secondary hover:bg-accent-primary/5'}`}
                                            >
                                                <LayoutIcon className={`w-3.5 h-3.5 ${activeStream?.id === source.id ? 'text-accent-primary' : 'text-text-tertiary'}`} />
                                                <span className="flex-1 text-left truncate">{source.name}</span>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* Playing Status if active */}
                            {activeStream && (
                                <div className="mt-auto pt-6 border-t border-accent-primary/5">
                                    <div className="bg-surface-elevated rounded-2xl p-4 shadow-glow-accent animate-scale-in glass-card border border-accent-primary/20">
                                        <div className="flex items-center gap-3 mb-3">
                                            <div className="w-8 h-8 bg-accent-primary rounded-lg flex items-center justify-center text-surface-primary">
                                                <div className="flex gap-0.5 items-end h-3">
                                                    <div className="w-0.5 h-2 bg-surface-primary rounded-full animate-pulse" />
                                                    <div className="w-0.5 h-3 bg-surface-primary rounded-full animate-bounce" />
                                                    <div className="w-0.5 h-1.5 bg-surface-primary rounded-full animate-pulse" />
                                                </div>
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="text-[9px] font-black text-accent-primary uppercase tracking-widest">Reproduciendo</div>
                                                <div className="text-xs font-bold text-text-primary truncate">{activeStream.name}</div>
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => setActiveStream(null)}
                                            className="w-full py-2 bg-accent-primary/10 hover:bg-accent-primary/20 text-accent-primary text-[10px] font-bold rounded-lg transition-all"
                                        >
                                            DETENER
                                        </button>
                                    </div>
                                </div>
                            )}
                        </>
                    ) : activeTab === 'automate' ? (
                        <>
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-lg font-bold tracking-tight text-slate-900">Automation Hub</h2>
                                <button className="p-1.5 text-slate-400 hover:text-blue-600 rounded-lg transition-colors">
                                    <ZapIcon className="w-4 h-4" />
                                </button>
                            </div>

                            <div className="space-y-6 overflow-y-auto pr-2 -mr-2 scrollbar-hide">
                                <div>
                                    <div className="flex items-center gap-2 px-3 py-1 mb-2">
                                        <div className="w-1.5 h-1.5 bg-blue-600 rounded-full" />
                                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Sincronización</span>
                                    </div>
                                    <div className="space-y-1">
                                        <button className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm text-slate-600 hover:bg-slate-50 transition-all">
                                            <YoutubeIcon className="w-3.5 h-3.5 text-red-500" />
                                            <span className="flex-1 text-left truncate">YouTube Subs</span>
                                        </button>
                                        <button className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm text-slate-600 hover:bg-slate-50 transition-all">
                                            <PodcastIcon className="w-3.5 h-3.5 text-purple-500" />
                                            <span className="flex-1 text-left truncate">Podcast Feeds</span>
                                        </button>
                                    </div>
                                </div>

                                <div>
                                    <div className="flex items-center gap-2 px-3 py-1 mb-2">
                                        <div className="w-1.5 h-1.5 bg-green-500 rounded-full" />
                                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Social Monitor</span>
                                    </div>
                                    <div className="space-y-1">
                                        <button className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm text-slate-600 hover:bg-slate-50 transition-all">
                                            <FacebookIcon className="w-3.5 h-3.5 text-blue-600" />
                                            <span className="flex-1 text-left truncate">Facebook Pages</span>
                                        </button>
                                        <button className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm text-slate-600 hover:bg-slate-50 transition-all">
                                            <TelegramIcon className="w-3.5 h-3.5 text-sky-500" />
                                            <span className="flex-1 text-left truncate">Telegram Channels</span>
                                        </button>
                                        <button className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm text-slate-600 hover:bg-slate-50 transition-all">
                                            <RedditIcon className="w-3.5 h-3.5 text-orange-500" />
                                            <span className="flex-1 text-left truncate">Reddit Feeds</span>
                                        </button>
                                        <button className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm text-slate-600 hover:bg-slate-50 transition-all">
                                            <Share2Icon className="w-3.5 h-3.5 text-indigo-500" />
                                            <span className="flex-1 text-left truncate">Mastodon Ins.</span>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </>
                    ) : null}
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 flex flex-col min-w-0 bg-surface-primary relative">
                <header className="h-16 bg-surface-elevated/80 border-b border-accent-primary/10 flex items-center px-8 justify-between sticky top-0 z-30 glass-header">
                    <div className="flex items-center gap-6">
                        <div className="flex items-center gap-2 group cursor-pointer">
                            <h1 className="text-xl font-bold text-text-primary tracking-tight font-display">
                                {selectedFeed ? feeds.find(f => f.id === selectedFeed)?.name : 'Newsfeed'}
                            </h1>
                            <ChevronIcon className="w-4 h-4 text-text-tertiary group-hover:text-accent-primary transition-colors" />
                        </div>

                        <div className="hidden md:flex items-center border-l border-accent-primary/10 pl-6 gap-2 relative">
                            <button className="flex items-center gap-2 px-3 py-1.5 bg-accent-primary/5 border border-accent-primary/10 rounded-lg text-xs font-bold text-text-secondary hover:bg-accent-primary/10 transition-colors">
                                Unread ({filteredArticles.length})
                                <ChevronIcon className="w-3 h-3 opacity-50" />
                            </button>
                            <div className="relative group">
                                <button
                                    onClick={() => setShowDatePicker(!showDatePicker)}
                                    className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${startDate || endDate ? 'bg-accent-primary/10 text-accent-primary border border-accent-primary/20 shadow-glow-accent' : 'text-text-tertiary hover:text-text-primary hover:bg-accent-primary/5 border border-transparent'}`}
                                >
                                    <FilterIcon className="w-4 h-4" />
                                    <span>{startDate || endDate ? 'Filtrado por fecha' : 'Filtrar por fecha'}</span>
                                </button>

                                {showDatePicker && (
                                    <>
                                        <div className="fixed inset-0 z-40" onClick={() => setShowDatePicker(false)} />
                                        <div className="absolute top-full left-0 mt-2 bg-surface-elevated border border-accent-primary/20 rounded-2xl shadow-2xl p-6 z-50 w-72 animate-fade-in glass-card">
                                            <div className="space-y-4">
                                                <div className="flex items-center justify-between mb-2">
                                                    <h3 className="text-sm font-black text-text-primary uppercase tracking-widest font-display">Rango de Fechas</h3>
                                                    {(startDate || endDate) && (
                                                        <button
                                                            onClick={() => { setStartDate(null); setEndDate(null); }}
                                                            className="text-[10px] font-bold text-accent-primary hover:text-accent-secondary"
                                                        >
                                                            LIMPIAR
                                                        </button>
                                                    )}
                                                </div>

                                                <div className="space-y-3">
                                                    <div>
                                                        <label className="text-[10px] font-bold text-text-tertiary uppercase tracking-tighter mb-1.5 block">Desde</label>
                                                        <input
                                                            type="date"
                                                            value={startDate || ''}
                                                            onChange={(e) => setStartDate(e.target.value)}
                                                            className="w-full bg-surface-primary/50 border border-accent-primary/10 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-accent-primary/20 focus:border-accent-primary outline-none transition-all text-text-primary"
                                                        />
                                                    </div>
                                                    <div>
                                                        <label className="text-[10px] font-bold text-text-tertiary uppercase tracking-tighter mb-1.5 block">Hasta</label>
                                                        <input
                                                            type="date"
                                                            value={endDate || ''}
                                                            onChange={(e) => setEndDate(e.target.value)}
                                                            className="w-full bg-surface-primary/50 border border-accent-primary/10 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-accent-primary/20 focus:border-accent-primary outline-none transition-all text-text-primary"
                                                        />
                                                    </div>
                                                </div>

                                                <button
                                                    onClick={() => setShowDatePicker(false)}
                                                    className="w-full mt-4 bg-accent-primary text-surface-primary rounded-xl py-2.5 text-xs font-bold hover:bg-accent-secondary transition-all shadow-lg shadow-accent-primary/20"
                                                >
                                                    APLICAR FILTRO
                                                </button>
                                            </div>
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="relative group hidden lg:block">
                            <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-text-tertiary w-4 h-4" />
                            <input
                                type="text"
                                placeholder="Search in articles"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="bg-surface-primary/50 border-accent-primary/10 border focus:bg-surface-primary focus:border-accent-primary/40 rounded-full pl-9 pr-4 py-1.5 text-xs w-64 outline-none transition-all text-text-primary glass-card"
                            />
                            {search && (
                                <button onClick={() => setSearch('')} className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-text-tertiary hover:text-accent-primary">
                                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M6 18L18 6M6 6l12 12" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" /></svg>
                                </button>
                            )}
                        </div>

                        <div className="flex items-center gap-1 border-l border-accent-primary/10 pl-4">
                            <button onClick={refreshArticles} className={`p-2 text-text-tertiary hover:text-accent-primary rounded-lg transition-colors ${isRefreshing ? 'animate-spin' : ''}`}>
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
                            </button>
                            <button onClick={() => handleViewModeChange('list')} className={`p-2 rounded-lg transition-colors ${viewMode === 'list' ? 'bg-accent-primary/10 text-accent-primary shadow-glow-accent' : 'text-text-tertiary hover:text-text-primary'}`}>
                                <ListIcon className="w-4 h-4" />
                            </button>
                            <button onClick={() => handleViewModeChange('card')} className={`p-2 rounded-lg transition-colors ${viewMode === 'card' ? 'bg-accent-primary/10 text-accent-primary shadow-glow-accent' : 'text-text-tertiary hover:text-text-primary'}`}>
                                <GridSmallIcon className="w-4 h-4" />
                            </button>
                            <button className="p-2 text-text-tertiary hover:text-accent-primary rounded-lg transition-colors">
                                <SortIcon className="w-4 h-4" />
                            </button>
                            <button
                                onClick={toggleTheme}
                                className="p-2.5 ml-2 bg-surface-primary border border-accent-primary/10 rounded-xl text-text-tertiary hover:text-accent-primary hover:border-accent-primary/30 transition-all shadow-sm"
                                title={theme === 'dark' ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
                            >
                                {theme === 'dark' ? <SunIcon className="w-4 h-4" /> : <MoonIcon className="w-4 h-4" />}
                            </button>
                        </div>
                    </div>
                </header>

                {/* Vista de Búsqueda Global */}
                {activeTab === 'search' && (
                    <div className="flex-1 overflow-y-auto p-8 md:p-12 bg-surface-primary">
                        <div className="max-w-4xl mx-auto">
                            {/* Cabecera de Búsqueda */}
                            <div className="text-center mb-12">
                                <h1 className="text-4xl md:text-5xl font-black text-text-primary tracking-tight mb-4 font-display">
                                    Search News
                                </h1>
                                <p className="text-text-secondary text-lg font-medium">
                                    Find any article in real-time
                                </p>
                            </div>

                            {/* Campo de Búsqueda Grande */}
                            <div className="relative mb-12">
                                <div className="absolute left-6 top-1/2 -translate-y-1/2 text-accent-primary">
                                    <SearchIcon className="w-6 h-6" />
                                </div>
                                <input
                                    type="text"
                                    placeholder="Escribí para buscar..."
                                    value={globalSearch}
                                    onChange={(e) => setGlobalSearch(e.target.value)}
                                    autoFocus
                                    className="w-full bg-surface-elevated border-2 border-accent-primary/10 rounded-[2rem] pl-16 pr-6 py-5 text-xl font-medium focus:ring-4 focus:ring-accent-primary/10 focus:border-accent-primary transition-all outline-none shadow-lg shadow-accent-primary/5 placeholder:text-text-tertiary text-text-primary"
                                />
                                {globalSearch && (
                                    <button
                                        onClick={() => setGlobalSearch('')}
                                        className="absolute right-6 top-1/2 -translate-y-1/2 p-2 text-text-tertiary hover:text-text-primary hover:bg-surface-primary rounded-full transition-all"
                                    >
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                        </svg>
                                    </button>
                                )}
                            </div>

                            {/* Resultados de Búsqueda */}
                            {globalSearch.length > 0 && (
                                <div className="space-y-6">
                                    {/* Contador de resultados */}
                                    <div className="flex items-center gap-3 mb-8">
                                        <div className="h-8 w-1.5 bg-accent-primary rounded-full" />
                                        <span className="text-sm font-bold text-text-tertiary uppercase tracking-tight">
                                            {articles.filter(a =>
                                                a.title.toLowerCase().includes(globalSearch.toLowerCase()) ||
                                                a.description.toLowerCase().includes(globalSearch.toLowerCase())
                                            ).length} resultados encontrados
                                        </span>
                                    </div>

                                    {/* Lista de resultados */}
                                    <div className="space-y-4">
                                        {articles
                                            .filter(a =>
                                                a.title.toLowerCase().includes(globalSearch.toLowerCase()) ||
                                                a.description.toLowerCase().includes(globalSearch.toLowerCase())
                                            )
                                            .slice(0, 20)
                                            .map(article => (
                                                <button
                                                    key={article.id}
                                                    onClick={() => {
                                                        setSelectedArticleId(article.id);
                                                        setActiveTab('home');
                                                    }}
                                                    className="w-full text-left bg-surface-elevated rounded-[1.5rem] p-6 border border-accent-primary/10 hover:border-accent-primary/30 hover:shadow-xl hover:shadow-accent-primary/5 transition-all group"
                                                >
                                                    <div className="flex items-start gap-4">
                                                        {article.thumbnail && (
                                                            <div className="w-20 h-20 rounded-xl overflow-hidden shrink-0 bg-surface-primary">
                                                                <img
                                                                    src={article.thumbnail}
                                                                    alt=""
                                                                    className="w-full h-full object-cover"
                                                                />
                                                            </div>
                                                        )}
                                                        <div className="flex-1 min-w-0">
                                                            <h3 className="font-bold text-text-primary group-hover:text-accent-primary transition-colors line-clamp-2 mb-2">
                                                                {article.title}
                                                            </h3>
                                                            <p className="text-sm text-text-secondary line-clamp-2 mb-3">
                                                                {article.description.replace(/<[^>]*>/g, '').substring(0, 150)}...
                                                            </p>
                                                            <div className="flex items-center gap-3 text-xs">
                                                                <span className="font-bold text-accent-primary bg-accent-primary/10 px-3 py-1 rounded-full">
                                                                    {article.sourceName}
                                                                </span>
                                                                <span className="text-text-tertiary">
                                                                    {new Date(article.pubDate).toLocaleDateString('es-AR', {
                                                                        day: 'numeric',
                                                                        month: 'short',
                                                                        hour: '2-digit',
                                                                        minute: '2-digit'
                                                                    })}
                                                                </span>
                                                            </div>
                                                        </div>
                                                        <div className="text-text-muted group-hover:text-accent-primary transition-colors">
                                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                                                            </svg>
                                                        </div>
                                                    </div>
                                                </button>
                                            ))}
                                    </div>

                                    {/* Sin resultados */}
                                    {articles.filter(a =>
                                        a.title.toLowerCase().includes(globalSearch.toLowerCase()) ||
                                        a.description.toLowerCase().includes(globalSearch.toLowerCase())
                                    ).length === 0 && (
                                            <div className="text-center py-16">
                                                <div className="w-20 h-20 bg-surface-elevated rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-sm">
                                                    <SearchIcon className="w-8 h-8 text-text-muted" />
                                                </div>
                                                <h3 className="text-xl font-bold text-text-primary mb-2">Sin resultados</h3>
                                                <p className="text-text-tertiary">No encontramos noticias con "{globalSearch}"</p>
                                            </div>
                                        )}
                                </div>
                            )}

                            {/* Estado inicial - Sin búsqueda */}
                            {globalSearch.length === 0 && (
                                <div className="text-center py-16">
                                    <div className="w-24 h-24 bg-gradient-to-br from-accent-primary/10 to-accent-secondary/10 rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-lg shadow-accent-primary/10">
                                        <SearchIcon className="w-10 h-10 text-accent-primary" />
                                    </div>
                                    <h3 className="text-2xl font-bold text-text-primary mb-3">Buscá en todas las noticias</h3>
                                    <p className="text-text-secondary max-w-md mx-auto">
                                        Escribí cualquier palabra clave para buscar en títulos y descripciones de {articles.length} noticias disponibles.
                                    </p>

                                    {/* Sugerencias rápidas */}
                                    <div className="mt-10">
                                        <p className="text-xs font-bold text-text-tertiary uppercase tracking-tight mb-4">Búsquedas sugeridas</p>
                                        <div className="flex flex-wrap justify-center gap-3">
                                            {['Ushuaia', 'clima', 'gobierno', 'deportes', 'economía'].map(suggestion => (
                                                <button
                                                    key={suggestion}
                                                    onClick={() => setGlobalSearch(suggestion)}
                                                    className="px-5 py-2.5 bg-surface-elevated border border-accent-primary/10 rounded-full text-sm font-medium text-text-secondary hover:border-accent-primary/30 hover:text-accent-primary hover:bg-accent-primary/5 transition-all"
                                                >
                                                    {suggestion}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* Vista de Artículos Guardados */}
                {activeTab === 'saved' && (
                    <div className="flex-1 overflow-y-auto bg-surface-primary">
                        <SavedArticlesView
                            savedArticles={savedArticles}
                            allTags={getAllTags()}
                            onArticleClick={(articleId) => {
                                setSelectedArticleId(articleId);
                                setActiveTab('home');
                            }}
                            onUnsaveArticle={unsaveArticle}
                            onRemoveTag={removeTagFromArticle}
                        />
                    </div>
                )}

                {/* Vista de Audio y Streaming */}
                {activeTab === 'audio' && (
                    <div className="flex-1 overflow-y-auto p-8 md:p-12 bg-surface-primary text-text-primary">
                        <div className="max-w-6xl mx-auto">
                            {/* Cabecera Premium */}
                            <div className="flex flex-col md:flex-row items-center justify-between mb-16 gap-8">
                                <div className="text-center md:text-left">
                                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-accent-primary/10 text-accent-primary rounded-full text-xs font-bold tracking-widest uppercase mb-4 shadow-sm">
                                        <div className="w-2 h-2 bg-accent-primary rounded-full animate-pulse" />
                                        Multimedia Center
                                    </div>
                                    <h1 className="text-5xl font-black text-text-primary tracking-tight mb-4 font-display">
                                        Audio & <span className="text-accent-primary">Video</span>
                                    </h1>
                                    <p className="text-text-secondary text-lg font-medium max-w-lg">
                                        Transmisiones en vivo de las mejores radios y canales de televisión locales y nacionales.
                                    </p>
                                </div>
                                <div className="flex items-center gap-4">
                                    <button className="flex flex-col items-center justify-center w-20 h-20 bg-surface-elevated rounded-3xl shadow-lg border border-accent-primary/10 hover:border-accent-primary/40 transition-all group glass-card">
                                        <SettingsIcon className="w-6 h-6 text-text-tertiary group-hover:text-accent-primary transition-colors" />
                                        <span className="text-[10px] font-bold text-text-tertiary mt-2">CONFIG</span>
                                    </button>
                                    <div className="w-24 h-24 bg-gradient-to-br from-accent-primary to-accent-secondary rounded-[2rem] shadow-glow-accent flex items-center justify-center transform hover:scale-105 transition-transform">
                                        <HeadphonesIcon className="w-10 h-10 text-white" />
                                    </div>
                                </div>
                            </div>

                            {/* Sección de Radios */}
                            <div className="mb-20">
                                <div className="flex items-center gap-4 mb-8">
                                    <div className="h-10 w-1.5 bg-accent-secondary rounded-full" />
                                    <h2 className="text-3xl font-bold text-text-primary tracking-tight">Radios en Vivo</h2>
                                    <span className="ml-auto text-xs font-black text-text-tertiary uppercase tracking-widest">{STREAMING_SOURCES.filter(s => s.type === 'radio').length} EMISORAS</span>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {STREAMING_SOURCES.filter(s => s.type === 'radio').map(source => (
                                        <button
                                            key={source.id}
                                            onClick={() => setActiveStream(source)}
                                            className="group relative bg-surface-elevated rounded-[2rem] p-6 border border-accent-primary/10 shadow-sm hover:shadow-glow-accent/20 hover:-translate-y-1 transition-all text-left overflow-hidden glass-card"
                                        >
                                            <div className="absolute top-0 right-0 p-6 opacity-0 group-hover:opacity-10 transition-opacity">
                                                <ZapIcon className="w-24 h-24 text-accent-secondary transform rotate-12" />
                                            </div>

                                            <div className="flex items-center gap-5 mb-6">
                                                <div className="w-14 h-14 bg-accent-secondary/10 rounded-2xl flex items-center justify-center text-accent-secondary group-hover:bg-accent-secondary group-hover:text-white transition-all shadow-inner">
                                                    <ZapIcon className="w-6 h-6" />
                                                </div>
                                                <div>
                                                    <div className="text-[10px] font-black text-accent-secondary uppercase tracking-widest mb-1">{source.location}</div>
                                                    <h3 className="font-bold text-text-primary group-hover:text-accent-secondary transition-colors line-clamp-1">{source.name}</h3>
                                                </div>
                                            </div>

                                            <div className="flex items-center justify-between mt-auto">
                                                <span className="text-xs font-semibold text-text-tertiary">Stream HD • 128kbps</span>
                                                <div className="flex items-center gap-2 px-4 py-2 bg-accent-primary text-surface-primary rounded-xl text-[10px] font-bold shadow-glow-accent opacity-0 group-hover:opacity-100 transform translate-y-2 group-hover:translate-y-0 transition-all">
                                                    <div className="w-1.5 h-1.5 bg-surface-primary rounded-full animate-pulse" />
                                                    ESCUCHAR
                                                </div>
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Sección de TV */}
                            <div className="mb-20">
                                <div className="flex items-center gap-4 mb-8">
                                    <div className="h-10 w-1.5 bg-accent-primary rounded-full" />
                                    <h2 className="text-3xl font-bold text-text-primary tracking-tight">Canales de TV</h2>
                                    <span className="ml-auto text-xs font-black text-text-tertiary uppercase tracking-widest">{STREAMING_SOURCES.filter(s => s.type === 'tv').length} CANALES</span>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    {STREAMING_SOURCES.filter(s => s.type === 'tv').map(source => (
                                        <button
                                            key={source.id}
                                            onClick={() => setActiveStream(source)}
                                            className="group relative bg-surface-elevated rounded-[2.5rem] p-1 border border-accent-primary/10 shadow-glow-accent/20 overflow-hidden hover:scale-[1.02] transition-all glass-card"
                                        >
                                            <div className="aspect-video w-full rounded-[2.2rem] overflow-hidden relative border border-accent-primary/5">
                                                <div className="absolute inset-0 bg-gradient-to-t from-surface-elevated via-transparent to-transparent z-10" />

                                                {/* Placeholder Image or Gradient */}
                                                <div className="absolute inset-0 bg-gradient-to-br from-accent-primary/10 to-accent-secondary/10" />

                                                <div className="absolute inset-0 flex items-center justify-center z-20 group-hover:scale-110 transition-transform duration-500">
                                                    <div className="w-16 h-16 bg-surface-elevated/40 backdrop-blur-md rounded-full flex items-center justify-center border border-accent-primary/20 shadow-xl">
                                                        <div className="w-12 h-12 bg-accent-primary text-surface-primary rounded-full flex items-center justify-center shadow-lg transform group-hover:scale-110 transition-all">
                                                            <svg className="w-6 h-6 ml-1" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="absolute bottom-8 left-8 right-8 z-20">
                                                    <div className="flex items-center gap-3 mb-2">
                                                        <span className="px-3 py-1 bg-accent-primary/10 text-accent-primary text-[10px] font-black rounded-lg shadow-glow-accent animate-pulse">EN VIVO</span>
                                                        <span className="text-[10px] font-bold text-text-tertiary uppercase tracking-[0.2em]">{source.location}</span>
                                                    </div>
                                                    <h3 className="text-2xl font-bold text-text-primary tracking-tight">{source.name}</h3>
                                                </div>
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Panel de Configuración Rápida */}
                            <div className="bg-surface-elevated rounded-[3rem] p-10 border border-accent-primary/10 shadow-glow-accent/20 glass-card">
                                <div className="flex items-center gap-4 mb-10">
                                    <div className="p-3 bg-surface-primary rounded-2xl">
                                        <SettingsIcon className="w-6 h-6 text-text-primary" />
                                    </div>
                                    <h3 className="text-2xl font-bold text-text-primary tracking-tight">Opciones de Reproducción</h3>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                                    <div>
                                        <label className="text-[10px] font-black text-text-tertiary uppercase tracking-[0.2em] mb-4 block">Calidad de Audio</label>
                                        <div className="space-y-2">
                                            {['Baja (64kbps)', 'Media (128kbps)', 'Alta (320kbps)'].map((quality, idx) => (
                                                <button key={quality} className={`w-full text-left px-4 py-3 rounded-xl text-sm font-bold transition-all ${idx === 1 ? 'bg-accent-primary text-surface-primary shadow-glow-accent' : 'bg-surface-primary text-text-secondary hover:bg-accent-primary/5'}`}>
                                                    {quality}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                    <div>
                                        <label className="text-[10px] font-black text-text-tertiary uppercase tracking-[0.2em] mb-4 block">Reproducción Automática</label>
                                        <div className="flex items-center justify-between p-4 bg-surface-primary rounded-2xl">
                                            <span className="text-sm font-bold text-text-secondary">Autoplay</span>
                                            <div className="w-12 h-6 bg-accent-primary rounded-full relative flex items-center px-1 shadow-inner">
                                                <div className="w-4 h-4 bg-white rounded-full shadow-md ml-auto" />
                                            </div>
                                        </div>
                                    </div>
                                    <div>
                                        <label className="text-[10px] font-black text-text-tertiary uppercase tracking-[0.2em] mb-4 block">Modo de Video</label>
                                        <div className="flex items-center justify-between p-4 bg-surface-primary rounded-2xl mb-2">
                                            <span className="text-sm font-bold text-text-secondary">Pop-out por defecto</span>
                                            <div className="w-12 h-6 bg-surface-elevated/50 rounded-full relative flex items-center px-1">
                                                <div className="w-4 h-4 bg-white rounded-full shadow-md" />
                                            </div>
                                        </div>
                                    </div>
                                    <div>
                                        <label className="text-[10px] font-black text-text-tertiary uppercase tracking-[0.2em] mb-4 block">Datos del Sistema</label>
                                        <div className="p-4 bg-surface-primary rounded-2xl border border-accent-primary/10">
                                            <div className="flex items-center justify-between mb-2">
                                                <span className="text-[10px] font-bold text-text-tertiary">VERSION</span>
                                                <span className="text-[10px] font-bold text-accent-primary">2026.1.4</span>
                                            </div>
                                            <div className="flex items-center justify-between">
                                                <span className="text-[10px] font-bold text-text-tertiary">CODEC</span>
                                                <span className="text-[10px] font-bold text-accent-secondary">OPUS/H.264</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Footer del Media Center */}
                            <div className="mt-20 py-12 border-t border-accent-primary/10 text-center">
                                <div className="flex items-center justify-center gap-2 mb-4">
                                    <div className="w-8 h-[2px] bg-accent-primary/20" />
                                    <MediosWikiAppLogo className="w-8 h-8 opacity-20" />
                                    <div className="w-8 h-[2px] bg-accent-primary/20" />
                                </div>
                                <span className="text-[10px] font-black text-text-tertiary uppercase tracking-[0.4em]">
                                    Premium Media Experience V2
                                </span>
                            </div>
                        </div>
                    </div>
                )}

                {/* Vista de Automatización y Fuentes Externas */}
                {activeTab === 'automate' && (
                    <div className="flex-1 overflow-y-auto p-8 md:p-12 bg-surface-primary">
                        <div className="max-w-6xl mx-auto">
                            {/* Cabecera Premium */}
                            <div className="flex flex-col md:flex-row items-center justify-between mb-16 gap-8">
                                <div className="text-center md:text-left">
                                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-accent-primary/10 text-accent-primary rounded-full text-[10px] font-black tracking-widest uppercase mb-4 shadow-sm border border-accent-primary/10">
                                        <ZapIcon className="w-3 h-3 animate-pulse" />
                                        Automation Suite
                                    </div>
                                    <h1 className="text-5xl font-black text-text-primary tracking-tighter mb-4 font-display">
                                        Monitor <span className="text-accent-primary">& Sync</span>
                                    </h1>
                                    <p className="text-text-secondary text-lg font-medium max-w-lg">
                                        Conecta tus redes sociales, sincroniza YouTube y gestiona tus podcasts favoritos en un hub centralizado.
                                    </p>
                                </div>
                                <div className="w-24 h-24 bg-gradient-to-br from-accent-primary to-accent-secondary rounded-[2rem] shadow-glow-accent flex items-center justify-center transform hover:scale-105 transition-all">
                                    <ZapIcon className="w-10 h-10 text-white" />
                                </div>
                            </div>

                            {/* Grid de Servicios */}
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                                {/* Monitor Social Media */}
                                <div className="bg-surface-elevated rounded-[2.5rem] p-8 border border-accent-primary/10 shadow-glow-accent/20 flex flex-col glass-card">
                                    <div className="flex items-center gap-4 mb-8">
                                        <div className="p-4 bg-accent-primary/10 text-accent-primary rounded-2xl">
                                            <FacebookIcon className="w-6 h-6" />
                                        </div>
                                        <h3 className="text-xl font-bold text-text-primary">Social Monitor</h3>
                                    </div>
                                    <p className="text-text-secondary text-sm mb-8 leading-relaxed">
                                        Monitorea páginas de Facebook, canales de Telegram, Mastodon y feeds de Reddit sin salir de la app.
                                    </p>
                                    <div className="space-y-3 mt-auto">
                                        <div className="flex items-center justify-between p-3 bg-surface-primary rounded-xl border border-accent-primary/10">
                                            <div className="flex items-center gap-2">
                                                <TelegramIcon className="w-4 h-4 text-accent-primary" />
                                                <span className="text-xs font-bold text-text-secondary uppercase tracking-tighter">Canales Activos</span>
                                            </div>
                                            <span className="text-xs font-black text-accent-primary">12</span>
                                        </div>
                                        <button className="w-full py-4 bg-accent-primary text-surface-primary rounded-2xl text-xs font-black uppercase tracking-widest hover:opacity-90 transition-all shadow-glow-accent">
                                            Añadir Monitor
                                        </button>
                                    </div>
                                </div>

                                {/* Sync Video Services */}
                                <div className="bg-surface-elevated rounded-[2.5rem] p-8 border border-accent-primary/10 shadow-glow-accent/20 flex flex-col glass-card">
                                    <div className="flex items-center gap-4 mb-8">
                                        <div className="p-4 bg-accent-secondary/10 text-accent-secondary rounded-2xl">
                                            <YoutubeIcon className="w-6 h-6" />
                                        </div>
                                        <h3 className="text-xl font-bold text-text-primary">Video Sync</h3>
                                    </div>
                                    <p className="text-text-secondary text-sm mb-8 leading-relaxed">
                                        Sincroniza tus suscripciones de YouTube y convierte canales en feeds automatizados de noticias.
                                    </p>
                                    <div className="p-6 bg-surface-primary rounded-3xl border border-accent-primary/10 mb-6 flex items-center gap-4">
                                        <div className="w-10 h-10 bg-surface-elevated rounded-full flex items-center justify-center shadow-inner border border-accent-primary/5">
                                            <YoutubeIcon className="w-5 h-5 text-accent-secondary" />
                                        </div>
                                        <div className="flex-1">
                                            <div className="text-[10px] font-black text-text-tertiary uppercase tracking-widest mb-0.5">Estado Canal</div>
                                            <div className="text-xs font-bold text-text-primary">Sincronizado</div>
                                        </div>
                                    </div>
                                    <button className="w-full mt-auto py-4 bg-accent-secondary text-surface-primary rounded-2xl text-xs font-black uppercase tracking-widest hover:opacity-90 transition-all shadow-glow-accent/20">
                                        Sincronizar YouTube
                                    </button>
                                </div>

                                {/* Podcasts & Audio */}
                                <div className="bg-surface-elevated rounded-[2.5rem] p-8 border border-accent-primary/10 shadow-glow-accent/20 flex flex-col glass-card">
                                    <div className="flex items-center gap-4 mb-8">
                                        <div className="p-4 bg-accent-primary/10 text-accent-primary rounded-2xl">
                                            <PodcastIcon className="w-6 h-6" />
                                        </div>
                                        <h3 className="text-xl font-bold text-text-primary">Podcast Hub</h3>
                                    </div>
                                    <p className="text-text-secondary text-sm mb-8 leading-relaxed">
                                        Escucha tus podcasts favoritos. Suscríbete a feeds RSS de audio y gestiona tu biblioteca globalmente.
                                    </p>
                                    <div className="space-y-4">
                                        <div className="flex items-center gap-4 group cursor-pointer p-2 rounded-2xl hover:bg-surface-primary transition-all">
                                            <div className="w-10 h-10 bg-accent-primary/10 rounded-xl flex items-center justify-center">
                                                <PodcastIcon className="w-4 h-4 text-accent-primary" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="text-xs font-bold text-text-primary truncate">Hablemos de Código</div>
                                                <div className="text-[10px] text-text-tertiary">Nuevo episodio hoy</div>
                                            </div>
                                        </div>
                                        <button className="w-full py-4 border-2 border-dashed border-accent-primary/20 text-text-tertiary rounded-2xl text-xs font-black uppercase tracking-widest hover:border-accent-primary/40 hover:text-accent-primary transition-all">
                                            + Agregar Podcast
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* Banner Mastodon / Reddit */}
                            <div className="mt-12 p-12 bg-surface-elevated rounded-[3.5rem] text-text-primary shadow-glow-accent/20 relative overflow-hidden border border-accent-primary/10 glass-card">
                                <div className="absolute top-0 right-0 p-12 opacity-5 scale-150">
                                    <Share2Icon className="w-64 h-64 text-accent-primary" />
                                </div>
                                <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-12">
                                    <div className="max-w-2xl">
                                        <div className="flex items-center gap-3 mb-6">
                                            <span className="px-3 py-1 bg-accent-primary/10 text-accent-primary text-[10px] font-black rounded-lg border border-accent-primary/20 tracking-[0.2em] uppercase">Connectors</span>
                                        </div>
                                        <h2 className="text-4xl font-black mb-6 tracking-tight">Ecosistema <span className="text-accent-primary">Social Sync</span></h2>
                                        <p className="text-text-secondary text-lg leading-relaxed mb-8">
                                            Conecta con Mastodon, Reddit y nuestro canal exclusivo de Telegram. Filtra contenido específico y recíbelo directamente en tu feed personalizado.
                                        </p>
                                        <div className="flex flex-wrap gap-4">
                                            <div className="px-4 py-2 bg-surface-primary rounded-xl text-xs font-bold border border-accent-primary/10 flex items-center gap-2">
                                                <div className="w-1.5 h-1.5 bg-accent-secondary rounded-full" />
                                                Mastodon
                                            </div>
                                            <div className="px-4 py-2 bg-surface-primary rounded-xl text-xs font-bold border border-accent-primary/10 flex items-center gap-2">
                                                <div className="w-1.5 h-1.5 bg-accent-primary rounded-full" />
                                                r/TierraDelFuego
                                            </div>
                                            <a href="https://t.me/+rkKMfpVR3G0yMDBh" target="_blank" rel="noopener noreferrer" className="px-4 py-2 bg-surface-primary rounded-xl text-xs font-bold border border-[#0088cc]/30 text-[#0088cc] flex items-center gap-2 hover:bg-[#0088cc]/10 transition-colors">
                                                <div className="w-1.5 h-1.5 bg-[#0088cc] rounded-full shadow-[0_0_8px_#0088cc]" />
                                                Canal Telegram
                                            </a>
                                        </div>
                                    </div>
                                    <button className="px-12 py-6 bg-accent-primary text-surface-primary rounded-2xl font-black text-sm uppercase tracking-widest shadow-glow-accent hover:opacity-90 hover:scale-105 transition-all">
                                        Configurar Conexiones
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Vista de Zonas / Mapas */}
                {activeTab === 'zonas' && (
                    <div className="flex-1 overflow-y-auto p-8 md:p-12 bg-surface-primary">
                        <div className="max-w-7xl mx-auto space-y-16">
                            <div className="flex flex-col md:flex-row items-center justify-between gap-8">
                                <div className="flex flex-col gap-4">
                                    <h2 className="text-[10px] font-black text-accent-primary uppercase tracking-[0.2em]">SISTEMA DE MONITOREO GEOGRÁFICO</h2>
                                    <h1 className="text-5xl font-black text-text-primary tracking-tighter uppercase font-display">Mapas y <span className="text-accent-primary">Zonas</span></h1>
                                    <p className="text-text-secondary text-lg font-medium max-w-xl">
                                        Información en tiempo real sobre clima, rutas, tráfico marítimo y aéreo en Tierra del Fuego.
                                    </p>
                                </div>
                                <div className="hidden lg:flex items-center gap-6">
                                    <div className="text-right">
                                        <div className="text-3xl font-black text-text-primary">100%</div>
                                        <div className="text-[10px] font-bold text-accent-secondary uppercase tracking-widest">Live Sync</div>
                                    </div>
                                    <div className="w-px h-12 bg-accent-primary/20" />
                                    <div className="w-16 h-16 bg-accent-primary/10 rounded-3xl flex items-center justify-center text-accent-primary shadow-glow-accent">
                                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" /></svg>
                                    </div>
                                </div>
                            </div>

                            <WeatherCard cities={cities} />

                            <div className="grid grid-cols-1 xl:grid-cols-2 gap-12">
                                <CruiseShipWidget />
                                <FlightStatusWidget />
                            </div>

                            <LiveCamerasWidget />

                            <ElectionsWidget />

                            <PrintEditionsWidget />

                            <EconomicIndicatorsWidget />

                            <TDFStatsWidget />
                        </div>
                    </div>
                )}

                {/* Vista de Videos */}
                {activeTab === 'videos' && (
                    <div className="flex-1 overflow-y-auto p-8 md:p-12 bg-surface-primary">
                        <div className="max-w-7xl mx-auto space-y-12">
                            <div className="flex flex-col gap-4">
                                <h2 className="text-[10px] font-black text-accent-secondary uppercase tracking-[0.2em]">MULTIMEDIA & VIDEO SYNC</h2>
                                <h1 className="text-5xl font-black text-text-primary tracking-tighter uppercase">Hub de <span className="text-accent-secondary">Video</span></h1>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="bg-surface-elevated rounded-[2.5rem] p-8 border border-accent-primary/10 shadow-glow-accent/20 flex flex-col glass-card">
                                    <div className="flex items-center gap-4 mb-8">
                                        <div className="p-4 bg-accent-secondary/10 text-accent-secondary rounded-2xl">
                                            <YoutubeIcon className="w-6 h-6" />
                                        </div>
                                        <h3 className="text-xl font-bold text-text-primary">Video Subscription Sync</h3>
                                    </div>
                                    <p className="text-text-secondary text-sm mb-8 leading-relaxed">
                                        Convierte tus canales de YouTube favoritos en fuentes de noticias automáticas.
                                    </p>
                                    <button className="w-full py-4 bg-accent-secondary text-surface-primary rounded-2xl text-xs font-black uppercase tracking-widest hover:opacity-90 transition-all shadow-glow-accent/20">
                                        Conectar YouTube
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab !== 'search' && activeTab !== 'saved' && activeTab !== 'audio' && activeTab !== 'automate' && activeTab !== 'zonas' && activeTab !== 'videos' && (<div className="flex-1 flex overflow-hidden">
                    {/* Master: Article List */}
                    <div className={`flex-1 overflow-y-auto p-8 md:p-12 scroll-smooth transition-all duration-300 ${selectedArticleId ? 'hidden md:block md:w-2/5' : 'w-full'}`}>
                        <div className="max-w-7xl mx-auto space-y-12 pb-40">
                            {/* Weather & Road Hero Section - Design 2026 */}
                            <div className="grid grid-cols-1 xl:grid-cols-2 gap-10">
                                <WeatherCard cities={cities} />
                                <RoadStatus />
                            </div>

                            {/* Estadísticas Clave de TDF */}
                            <TDFStatsWidget />



                            {/* Section Header */}
                            <div className="flex items-center justify-between">
                                <div>
                                    <h1 className="text-5xl font-black text-text-primary tracking-tighter uppercase font-display">
                                        {selectedFeed ? feeds.find(f => f.id === selectedFeed)?.name : 'Centro de Noticias'}
                                    </h1>
                                    <p className="text-text-secondary font-bold uppercase tracking-widest text-xs mt-3 flex items-center gap-2">
                                        <div className="w-1.5 h-1.5 bg-accent-primary rounded-full animate-pulse shadow-glow-accent" />
                                        Tu feed personalizado
                                    </p>
                                </div>
                                {selectedFeed && (
                                    <button onClick={() => setSelectedFeed(null)} className="px-5 py-2.5 bg-accent-primary text-surface-primary rounded-2xl text-[11px] font-bold tracking-tight shadow-glow-accent hover:opacity-90 transition-all">VOLVER AL INICIO</button>
                                )}
                            </div>

                            {/* Single Feed Grid - Always show grid for unified look */}
                            <div className={
                                viewMode === 'list'
                                    ? "flex flex-col bg-surface-elevated border border-accent-primary/10 rounded-xl overflow-hidden divide-y divide-accent-primary/5 glass-card"
                                    : viewMode === 'magazine'
                                        ? "grid grid-cols-1 lg:grid-cols-2 gap-8"
                                        : "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8"
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
                                <div className="flex flex-col items-center justify-center py-32 text-center bg-surface-elevated rounded-[3rem] shadow-glow-accent/10 border border-accent-primary/5 glass-card">
                                    <div className="w-20 h-20 bg-surface-primary rounded-3xl flex items-center justify-center mb-6 shadow-inner">
                                        <SearchIcon className="w-8 h-8 text-text-tertiary" />
                                    </div>
                                    <h3 className="text-xl font-bold text-text-primary tracking-tight">No se encontraron artículos</h3>
                                    <p className="text-sm text-text-tertiary max-w-xs mx-auto mt-3 font-medium">Probá con otra búsqueda o ajustá los filtros de la biblioteca.</p>
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
                            summary={articleSummary}
                            isSaved={isArticleSaved(selectedArticle.id)}
                            isRead={isArticleRead(selectedArticle.id)}
                            onToggleSave={() => {
                                if (isArticleSaved(selectedArticle.id)) {
                                    unsaveArticle(selectedArticle.id);
                                } else {
                                    setSaveModalArticle(selectedArticle);
                                }
                            }}
                            onMarkAsRead={() => markAsRead(selectedArticle.id)}
                        />
                    )}
                </div>)}

                {/* Mobile Bottom Nav */}
                <nav className="lg:hidden fixed bottom-0 left-0 right-0 h-16 bg-surface-elevated/80 border-t border-accent-primary/10 flex items-center justify-around px-4 z-40 pb-safe shadow-glow-accent/10 backdrop-blur-xl glass-card">
                    <MobileTab active={activeTab === 'home' && !selectedArticleId} onClick={() => { setActiveTab('home'); setSelectedFeed(null); setSelectedArticleId(null); setIsMobileMenuOpen(false); }} label="Home" icon={<LayoutIcon className="w-6 h-6" />} />
                    <MobileTab active={activeTab === 'audio'} onClick={() => { setActiveTab('audio'); setSelectedArticleId(null); setIsMobileMenuOpen(false); }} label="Audio" icon={<HeadphonesIcon className="w-6 h-6" />} />
                    <MobileTab active={activeTab === 'folders'} onClick={() => { setActiveTab('folders'); setIsMobileMenuOpen(true); }} label="Feeds" icon={<RssIcon className="w-6 h-6" />} />
                    <MobileTab active={activeTab === 'search'} onClick={() => { setActiveTab('search'); setSelectedArticleId(null); setIsMobileMenuOpen(false); }} label="Search" icon={<SearchIcon className="w-6 h-6" />} />
                    <MobileTab
                        active={activeTab === 'saved'}
                        onClick={() => { setActiveTab('saved'); setSelectedArticleId(null); setIsMobileMenuOpen(false); }}
                        label="Saved"
                        icon={
                            <div className="relative">
                                <BookmarkIcon className="w-6 h-6" />
                                {savedArticles.length > 0 && (
                                    <span className="absolute -top-1 -right-1 w-4 h-4 bg-accent-primary text-surface-primary text-[9px] font-bold rounded-full flex items-center justify-center shadow-glow-accent">
                                        {savedArticles.length > 9 ? '9+' : savedArticles.length}
                                    </span>
                                )}
                            </div>
                        }
                    />
                </nav>
            </main>

            {/* Modal para guardar artículo con etiquetas */}
            {saveModalArticle && (
                <SaveArticleModal
                    article={saveModalArticle}
                    isOpen={!!saveModalArticle}
                    onClose={() => setSaveModalArticle(null)}
                    onSave={(tags) => {
                        saveArticle(saveModalArticle, tags);
                        setSaveModalArticle(null);
                    }}
                    existingTags={getAllTags()}
                />
            )}
            {/* Reproductor de Streaming */}
            {activeStream && (
                <StreamingPlayer
                    source={activeStream}
                    onClose={() => setActiveStream(null)}
                />
            )}
        </div>
    );
}
