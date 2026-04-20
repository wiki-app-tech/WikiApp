'use client';

import { useState, useMemo, useEffect, useCallback } from 'react';
import type { Article, FeedSource } from '@/types';
import ArticleCard from '@/components/ArticleCard';
import WeatherCard from '@/components/WeatherCard';
import ArticleReader from '@/components/ArticleReader';
import RoadStatus from '@/components/RoadStatus';
import TDFStatsWidget from '@/components/widgets/TDFStatsWidget';
import RefreshIndicator from '@/components/RefreshIndicator';
import MediosWikiAppLogo from '@/components/MediosWikiAppLogo';
import SavedArticlesView from '@/components/SavedArticlesView';
import SaveArticleModal from '@/components/SaveArticleModal';
import { useAutoRefresh } from '@/hooks/useAutoRefresh';
import { useSavedArticles } from '@/hooks/useSavedArticles';
import { useFollowedFeeds } from '@/hooks/useFollowedFeeds';
import { useTheme } from '@/components/ThemeProvider';
import { NavIcon, CategoryButton, MobileTab } from '@/components/DashboardUI';
import { StreamingPlayer, STREAMING_SOURCES } from '@/components/StreamingPlayer';
import type { StreamingSource } from '@/components/StreamingPlayer';

// Extracted view components — each renders independently, reducing re-render scope
import SearchView from '@/components/views/SearchView';
import AudioView from '@/components/views/AudioView';
import ZonasView from '@/components/views/ZonasView';
import AutomateView from '@/components/views/AutomateView';
import VideosView from '@/components/views/VideosView';

import {
    LayoutIcon,
    RssIcon,
    BookmarkIcon,
    ZapIcon,
    SearchIcon,
    SettingsIcon,
    ChevronIcon,
    HeadphonesIcon,
    PlusIcon,
    CircleIcon,
    FilterIcon,
    SortIcon,
    ListIcon,
    GridSmallIcon,
    FacebookIcon,
    YoutubeIcon,
    RedditIcon,
    TelegramIcon,
    PodcastIcon,
    Share2Icon,
    SunIcon,
    MoonIcon
} from '@/components/Icons';

type ActiveTab = 'home' | 'videos' | 'audio' | 'zonas' | 'search' | 'folders' | 'saved' | 'automate' | 'settings';

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
    const [activeTab, setActiveTab] = useState<ActiveTab>('home');
    const [viewMode, setViewMode] = useState<'list' | 'card' | 'magazine'>('magazine');
    const [articles, setArticles] = useState<Article[]>(initialArticles);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [globalSearch, setGlobalSearch] = useState('');
    const [saveModalArticle, setSaveModalArticle] = useState<Article | null>(null);
    const [activeStream, setActiveStream] = useState<StreamingSource | null>(null);
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
        const q = feedSearch.toLowerCase();
        return feeds.filter(f =>
            f.name.toLowerCase().includes(q) ||
            f.category.toLowerCase().includes(q)
        ).slice(0, 5);
    }, [feeds, feedSearch]);

    // Build feed count map once, with O(n) instead of repeated lookups
    const feedCounts = useMemo(() => {
        const counts: Record<string, number> = {};
        for (const a of articles) {
            counts[a.sourceId] = (counts[a.sourceId] || 0) + 1;
        }
        return counts;
    }, [articles]);

    const categoryCounts = useMemo(() => {
        const counts: Record<string, number> = {};
        for (const f of followedFeeds) {
            counts[f.category] = (counts[f.category] || 0) + (feedCounts[f.id] || 0);
        }
        return counts;
    }, [followedFeeds, feedCounts]);

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

    const handleViewModeChange = useCallback((mode: 'list' | 'card' | 'magazine') => {
        setViewMode(mode);
        localStorage.setItem('mediosWikiAppViewMode', mode);
    }, []);

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
            const response = await fetch('/api/articles', { cache: 'no-store', headers: { 'Pragma': 'no-cache' } });
            if (!response.ok) throw new Error(`HTTP ${response.status}`);
            const data = await response.json();
            setArticles(data.articles || []);
        } catch (error) {
            console.error('Error al actualizar artículos:', error);
        } finally {
            setIsRefreshing(false);
        }
    }, []);

    useAutoRefresh(refreshArticles, {
        interval: 5 * 60 * 1000,
        enabled: true
    });

    const filteredArticles = useMemo(() => {
        const searchLower = search.toLowerCase();
        return articles
            .filter(a => {
                if (selectedFeed && a.sourceId !== selectedFeed) return false;
                if (searchLower && !a.title.toLowerCase().includes(searchLower) && !a.description.toLowerCase().includes(searchLower)) return false;
                if (startDate && new Date(a.pubDate) < new Date(startDate)) return false;
                if (endDate && new Date(a.pubDate) > new Date(`${endDate}T23:59:59`)) return false;
                return true;
            })
            .sort((a, b) => {
                const dateA = new Date(a.pubDate).getTime();
                const dateB = new Date(b.pubDate).getTime();
                if (isNaN(dateA)) return 1;
                if (isNaN(dateB)) return -1;
                return dateB - dateA;
            });
    }, [articles, search, selectedFeed, startDate, endDate]);

    const selectedArticle = useMemo(() =>
        articles.find(a => a.id === selectedArticleId) || null
        , [articles, selectedArticleId]);

    const handleNavigate = useCallback((direction: 'next' | 'prev') => {
        const currentIndex = filteredArticles.findIndex(a => a.id === selectedArticleId);
        if (currentIndex === -1) return;
        let nextIndex = direction === 'next' ? currentIndex + 1 : currentIndex - 1;
        if (nextIndex < 0) nextIndex = filteredArticles.length - 1;
        if (nextIndex >= filteredArticles.length) nextIndex = 0;
        setSelectedArticleId(filteredArticles[nextIndex].id);
    }, [filteredArticles, selectedArticleId]);



    const categories = useMemo(() => Array.from(new Set(followedFeeds.map(f => f.category))), [followedFeeds]);

    // Determine which sidebar tabs show the content sidebar
    const showContentSidebar = activeTab === 'home' || activeTab === 'audio' || activeTab === 'automate';

    return (
        <div className="flex h-screen bg-surface-primary text-text-primary font-sans overflow-hidden">
            {/* Sidebar 1: Icon Bar — Wotech style */}
            <aside className="hidden lg:flex w-[72px] bg-surface-elevated flex-col items-center py-6 gap-1 shrink-0 z-50 border-r border-slate-100 shadow-sm">
                <div className="mb-6 p-1">
                    <MediosWikiAppLogo className="w-9 h-9" />
                </div>
                <NavIcon active={activeTab === 'home' && !selectedFeed} onClick={() => { setActiveTab('home'); setSelectedFeed(null); }} label="Dashboard"><LayoutIcon className="w-5 h-5" /></NavIcon>
                <NavIcon active={activeTab === 'videos'} onClick={() => setActiveTab('videos')} label="Videos"><YoutubeIcon className="w-5 h-5" /></NavIcon>
                <NavIcon active={activeTab === 'audio'} onClick={() => setActiveTab('audio')} label="Medios"><HeadphonesIcon className="w-5 h-5" /></NavIcon>
                <NavIcon active={activeTab === 'zonas'} onClick={() => setActiveTab('zonas')} label="Zonas"><Share2Icon className="w-5 h-5" /></NavIcon>

                <div className="mt-auto flex flex-col gap-1 pb-4 w-full items-center">
                    <NavIcon active={activeTab === 'search'} onClick={() => { setActiveTab('search'); setGlobalSearch(''); }} label="Buscar"><SearchIcon className="w-5 h-5" /></NavIcon>
                    <NavIcon active={activeTab === 'settings'} onClick={() => setActiveTab('settings')} label="Ajustes"><SettingsIcon className="w-5 h-5" /></NavIcon>
                    <div className="mt-3 pt-3 border-t border-slate-100 w-full flex justify-center">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-accent-primary to-accent-secondary flex items-center justify-center text-[10px] font-black text-white shadow">TF</div>
                    </div>
                </div>
            </aside>

            {/* Sidebar 2: Content Sidebar — Wotech style */}
            <aside className={`
                fixed inset-0 z-40 lg:relative lg:inset-auto lg:z-auto
                h-full border-r border-slate-100 flex flex-col bg-white transition-all duration-300 ease-in-out overflow-hidden shadow-sm
                ${isMobileMenuOpen
                    ? 'w-full opacity-100 translate-x-0'
                    : showContentSidebar
                        ? 'w-0 lg:w-72 opacity-0 lg:opacity-100 -translate-x-full lg:translate-x-0 pointer-events-none lg:pointer-events-auto'
                        : 'w-0 opacity-0 -translate-x-full pointer-events-none'}
                ${selectedArticleId && !isMobileMenuOpen ? 'hidden lg:flex' : 'flex'}
            `}>
                <div className="p-5 flex flex-col h-full">
                    {activeTab === 'home' ? (
                        <>
                            {/* Wotech sidebar header */}
                            <div className="px-5 pt-5 pb-4 border-b border-slate-100">
                                <div className="section-label mb-2">Fuentes</div>
                                <div className="flex items-center justify-between">
                                    <h2 className="text-lg font-black tracking-tight text-text-primary"></h2>
                                    <div className="flex items-center gap-1">
                                        <button className="p-1.5 text-text-tertiary hover:text-accent-primary rounded-lg hover:bg-accent-primary/6 transition-colors">
                                            <SettingsIcon className="w-4 h-4" />
                                        </button>
                                        <button className="p-1.5 text-accent-primary hover:text-accent-secondary rounded-lg hover:bg-accent-primary/6 transition-colors">
                                            <SearchIcon className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            </div>

                            <div className="relative mb-4 px-4 pt-4">
                                <SearchIcon className="absolute left-7 top-1/2 mt-2 -translate-y-1/2 text-slate-300 w-4 h-4" />
                                <input
                                    type="text"
                                    placeholder="Buscar feed..."
                                    value={feedSearch}
                                    onChange={(e) => { setFeedSearch(e.target.value); setShowFeedResults(true); }}
                                    onFocus={() => setShowFeedResults(true)}
                                    className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-8 py-2.5 text-sm font-medium focus:ring-2 focus:ring-accent-primary/20 focus:border-accent-primary/40 transition-all outline-none text-text-primary"
                                />
                                {feedSearch && (
                                    <button
                                        onClick={() => { setFeedSearch(''); setShowFeedResults(false); }}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 text-zinc-300 hover:text-zinc-500 hover:bg-zinc-100 rounded-xl transition-all"
                                    >
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" /></svg>
                                    </button>
                                )}

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
                                {showFeedResults && (
                                    <div className="fixed inset-0 z-40" onClick={() => setShowFeedResults(false)} />
                                )}
                            </div>

                            <nav className="flex-1 overflow-y-auto px-3 pb-4 space-y-0.5 scrollbar-hide">
                                {/* All feeds button */}
                                <button
                                    onClick={() => { setSelectedFeed(null); setIsMobileMenuOpen(false); }}
                                    className={`sidebar-feed-item w-full ${!selectedFeed ? 'active' : ''}`}
                                >
                                    <LayoutIcon className="w-4 h-4 shrink-0" />
                                    <span className="flex-1 text-left font-medium">Todas las noticias</span>
                                    <span className="text-[10px] font-bold text-text-tertiary/60 tabular-nums">{articles.length}</span>
                                </button>

                                {/* Categories + feeds */}
                                {categories.map(category => (
                                    <div key={category} className="mt-3">
                                        <div
                                            className="sidebar-section-header px-1 mb-1 cursor-pointer"
                                            onClick={() => setCollapsedCategories(prev => ({ ...prev, [category]: !prev[category] }))}
                                        >
                                            <ChevronIcon
                                                className={`w-3 h-3 text-text-tertiary/50 transition-transform ${collapsedCategories[category] ? '-rotate-90' : ''}`}
                                            />
                                            <span>{category}</span>
                                            <span className="ml-auto text-[10px] font-bold text-text-tertiary/40 tabular-nums">25</span>
                                        </div>

                                        {!collapsedCategories[category] && (
                                            <div className="space-y-0.5">
                                                {followedFeeds.filter(f => f.category === category).map(feed => (
                                                    <div key={feed.id} className="relative group/feed">
                                                        <button
                                                            onClick={() => { setSelectedFeed(feed.id); setActiveTab('home'); setIsMobileMenuOpen(false); }}
                                                            className={`sidebar-feed-item w-full ${selectedFeed === feed.id ? 'active' : ''}`}
                                                        >
                                                            <span className="flex-1 text-left truncate">{feed.name}</span>
                                                            <span className="text-[10px] tabular-nums opacity-40 group-hover/feed:opacity-0 transition-opacity">{feedCounts[feed.id] || 0}</span>
                                                        </button>
                                                        <button
                                                            onClick={(e) => { e.stopPropagation(); unfollowFeed(feed.id); }}
                                                            className="absolute right-1 top-1/2 -translate-y-1/2 p-1 text-slate-300 hover:text-red-400 opacity-0 group-hover/feed:opacity-100 transition-all rounded-md"
                                                        >
                                                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" /></svg>
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
                                <h2 className="text-lg font-bold tracking-tight text-slate-900">Biblioteca de Medios</h2>
                                <button className="p-1.5 text-slate-400 hover:text-blue-600 rounded-lg transition-colors">
                                    <PlusIcon className="w-4 h-4" />
                                </button>
                            </div>
                            <div className="space-y-6 overflow-y-auto pr-2 -mr-2 scrollbar-hide">
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
                                <h2 className="text-lg font-bold tracking-tight text-slate-900">Centro de Automatización</h2>
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
                                            <span className="flex-1 text-left truncate">Suscripciones de YouTube</span>
                                        </button>
                                        <button className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm text-slate-600 hover:bg-slate-50 transition-all">
                                            <PodcastIcon className="w-3.5 h-3.5 text-purple-500" />
                                            <span className="flex-1 text-left truncate">Feeds de Podcasts</span>
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
                                            <span className="flex-1 text-left truncate">Páginas de Facebook</span>
                                        </button>
                                        <button className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm text-slate-600 hover:bg-slate-50 transition-all">
                                            <TelegramIcon className="w-3.5 h-3.5 text-sky-500" />
                                            <span className="flex-1 text-left truncate">Canales de Telegram</span>
                                        </button>
                                        <button className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm text-slate-600 hover:bg-slate-50 transition-all">
                                            <RedditIcon className="w-3.5 h-3.5 text-orange-500" />
                                            <span className="flex-1 text-left truncate">Feeds de Reddit</span>
                                        </button>
                                        <button className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm text-slate-600 hover:bg-slate-50 transition-all">
                                            <Share2Icon className="w-3.5 h-3.5 text-indigo-500" />
                                            <span className="flex-1 text-left truncate">Instancias de Mastodon</span>
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
                <header className="h-14 bg-white border-b flex items-center px-4 sm:px-6 justify-between sticky top-0 z-30" style={{ borderColor: 'hsl(var(--border-subtle))', boxShadow: 'var(--shadow-xs)' }}>
                    <div className="flex items-center gap-4">
                        {/* Botón para abrir sidebar feeds en mobile */}
                        <button
                            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                            className="btn-icon lg:hidden"
                            title="Mostrar fuentes"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h8M4 18h16" /></svg>
                        </button>

                        <div className="flex items-center gap-2">
                            <h2 className="text-[15px] font-bold" style={{ color: 'hsl(var(--text-primary))' }}>
                                {selectedFeed ? feeds.find(f => f.id === selectedFeed)?.name : 'Todas las Noticias'}
                            </h2>
                            <span className="chip text-[11px]" style={{ padding: '0.1rem 0.5rem' }}>
                                {filteredArticles.length}
                            </span>
                        </div>

                        {/* Filtro de fecha */}
                        <div className="hidden md:flex items-center relative">
                            <button
                                onClick={() => setShowDatePicker(!showDatePicker)}
                                className={`chip gap-1.5 ${startDate || endDate ? 'active' : ''}`}
                            >
                                <FilterIcon className="w-3.5 h-3.5" />
                                <span>{startDate || endDate ? 'Filtrado' : 'Filtrar por fecha'}</span>
                            </button>

                            {showDatePicker && (
                                <>
                                    <div className="fixed inset-0 z-40" onClick={() => setShowDatePicker(false)} />
                                    <div className="absolute top-full left-0 mt-2 bg-white border rounded-xl shadow-lg p-5 z-50 w-64 animate-fade-in" style={{ borderColor: 'hsl(var(--border-default))' }}>
                                        <div className="flex items-center justify-between mb-4">
                                            <h3 className="text-[13px] font-bold" style={{ color: 'hsl(var(--text-primary))' }}>Rango de fechas</h3>
                                            {(startDate || endDate) && (
                                                <button onClick={() => { setStartDate(null); setEndDate(null); }} className="text-[11px] font-semibold" style={{ color: 'hsl(var(--accent-primary))' }}>Limpiar</button>
                                            )}
                                        </div>
                                        <div className="space-y-3">
                                            <div>
                                                <label className="block text-[11px] font-semibold mb-1" style={{ color: 'hsl(var(--text-tertiary))' }}>Desde</label>
                                                <input type="date" value={startDate || ''} onChange={(e) => setStartDate(e.target.value)} className="input text-sm" />
                                            </div>
                                            <div>
                                                <label className="block text-[11px] font-semibold mb-1" style={{ color: 'hsl(var(--text-tertiary))' }}>Hasta</label>
                                                <input type="date" value={endDate || ''} onChange={(e) => setEndDate(e.target.value)} className="input text-sm" />
                                            </div>
                                        </div>
                                        <button onClick={() => setShowDatePicker(false)} className="btn-primary w-full mt-4 text-[12px]">Aplicar</button>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        {/* Búsqueda */}
                        <div className="relative hidden lg:block">
                            <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-text-tertiary" />
                            <input
                                type="text"
                                placeholder="Buscar artículos..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="input pl-8 pr-8 py-2 text-sm w-56"
                                style={{ borderRadius: '9999px' }}
                            />
                            {search && (
                                <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 btn-icon w-5 h-5">
                                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M6 18L18 6M6 6l12 12" strokeWidth="2.5" strokeLinecap="round" /></svg>
                                </button>
                            )}
                        </div>

                        {/* Vista: lista / grilla */}
                        <div className="flex items-center gap-0.5 border rounded-lg p-0.5" style={{ borderColor: 'hsl(var(--border-subtle))' }}>
                            <button onClick={() => handleViewModeChange('list')} className={`btn-icon w-8 h-8 ${viewMode === 'list' ? 'active' : ''}`} title="Lista">
                                <ListIcon className="w-3.5 h-3.5" />
                            </button>
                            <button onClick={() => handleViewModeChange('card')} className={`btn-icon w-8 h-8 ${viewMode === 'card' ? 'active' : ''}`} title="Grilla">
                                <GridSmallIcon className="w-3.5 h-3.5" />
                            </button>
                        </div>

                        {/* Actualizar */}
                        <button onClick={refreshArticles} className={`btn-icon ${isRefreshing ? 'animate-spin' : ''}`} title="Actualizar">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
                        </button>

                        {/* Tema */}
                        <button
                            onClick={toggleTheme}
                            className="btn-icon"
                            title={theme === 'dark' ? 'Modo claro' : 'Modo oscuro'}
                        >
                            {theme === 'dark' ? <SunIcon className="w-4 h-4" /> : <MoonIcon className="w-4 h-4" />}
                        </button>
                    </div>
                </header>

                {/* Vistas — cada una renderiza solo cuando su tab está activo */}
                {activeTab === 'search' && (
                    <SearchView
                        articles={articles}
                        globalSearch={globalSearch}
                        setGlobalSearch={setGlobalSearch}
                        onArticleClick={(articleId) => {
                            setSelectedArticleId(articleId);
                            setActiveTab('home');
                        }}
                    />
                )}

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

                {activeTab === 'audio' && (
                    <AudioView activeStream={activeStream} setActiveStream={setActiveStream} />
                )}

                {activeTab === 'automate' && <AutomateView />}

                {activeTab === 'zonas' && <ZonasView cities={cities} />}

                {activeTab === 'videos' && <VideosView />}

                {activeTab !== 'search' && activeTab !== 'saved' && activeTab !== 'audio' && activeTab !== 'automate' && activeTab !== 'zonas' && activeTab !== 'videos' && (
                    <div className="flex-1 flex overflow-hidden">
                        {/* Master: Article List */}
                        <div className={`flex-1 overflow-y-auto scroll-smooth transition-all duration-300 ${selectedArticleId ? 'hidden md:block md:w-2/5' : 'w-full'}`}>
                            <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 py-6 md:py-8 space-y-6 md:space-y-10 pb-24 lg:pb-12">
                                {/* Weather & Road Hero Section */}
                                <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
                                    <WeatherCard cities={cities} />
                                    <RoadStatus />
                                </div>

                                <TDFStatsWidget />

                                {/* Section Header — Wotech style */}
                                <div className="flex flex-wrap items-end justify-between gap-3 pb-3 border-b border-slate-100">
                                    <div>
                                        <div className="section-label mb-1.5">Tierra del Fuego</div>
                                        <h1 className="text-2xl sm:text-3xl md:text-4xl font-black text-text-primary tracking-tight font-display">
                                            {selectedFeed ? feeds.find(f => f.id === selectedFeed)?.name : 'Todas las Noticias'}
                                        </h1>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <span className="flex items-center gap-1.5 text-[11px] font-bold text-text-tertiary uppercase tracking-wider">
                                            <span className="w-1.5 h-1.5 bg-accent-secondary rounded-full animate-pulse" />
                                            {filteredArticles.length} art.
                                        </span>
                                        {selectedFeed && (
                                            <button onClick={() => setSelectedFeed(null)} className="btn-secondary text-xs py-1.5 px-3">← Volver</button>
                                        )}
                                    </div>
                                </div>

                                {/* Article Grid */}
                                <div className={
                                    viewMode === 'list'
                                        ? "flex flex-col bg-white rounded-xl overflow-hidden border border-slate-100 shadow-sm divide-y divide-slate-50"
                                        : viewMode === 'magazine'
                                            ? "grid grid-cols-1 md:grid-cols-2 gap-4"
                                            : "grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4"
                                }>
                                    {filteredArticles.map(article => (
                                        <ArticleCard
                                            key={article.id}
                                            article={article}
                                            viewMode={viewMode}
                                            isSelected={selectedArticleId === article.id}
                                            onClick={() => window.open(article.link, '_blank', 'noopener,noreferrer')}
                                        />
                                    ))}
                                </div>

                                {/* Empty State */}
                                {filteredArticles.length === 0 && (
                                    <div className="empty-state">
                                        <div className="empty-state__icon">
                                            <SearchIcon className="w-6 h-6" style={{ color: 'hsl(var(--text-muted))' }} />
                                        </div>
                                        <h3 className="text-[16px] font-bold mb-1" style={{ color: 'hsl(var(--text-primary))' }}>No hay artículos</h3>
                                        <p className="text-[13px] max-w-xs" style={{ color: 'hsl(var(--text-tertiary))' }}>
                                            Probá ajustando el filtro o seleccionando otra fuente.
                                        </p>
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
                    </div>
                )}

                {/* Mobile Bottom Nav — Wotech style */}
                <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-100 flex items-center justify-around z-40 pb-safe shadow-lg">
                    <MobileTab active={activeTab === 'home' && !selectedArticleId} onClick={() => { setActiveTab('home'); setSelectedFeed(null); setSelectedArticleId(null); setIsMobileMenuOpen(false); }} label="Inicio" icon={<LayoutIcon className="w-5 h-5" />} />
                    <MobileTab active={activeTab === 'audio'} onClick={() => { setActiveTab('audio'); setSelectedArticleId(null); setIsMobileMenuOpen(false); }} label="Medios" icon={<HeadphonesIcon className="w-5 h-5" />} />
                    <MobileTab active={activeTab === 'folders'} onClick={() => { setActiveTab('folders'); setIsMobileMenuOpen(true); }} label="Feeds" icon={<RssIcon className="w-5 h-5" />} />
                    <MobileTab active={activeTab === 'search'} onClick={() => { setActiveTab('search'); setSelectedArticleId(null); setIsMobileMenuOpen(false); }} label="Buscar" icon={<SearchIcon className="w-5 h-5" />} />
                    <MobileTab
                        active={activeTab === 'saved'}
                        onClick={() => { setActiveTab('saved'); setSelectedArticleId(null); setIsMobileMenuOpen(false); }}
                        label="Guardado"
                        icon={
                            <div className="relative">
                                <BookmarkIcon className="w-5 h-5" />
                                {savedArticles.length > 0 && (
                                    <span className="absolute -top-1 -right-1 w-4 h-4 bg-accent-primary text-white text-[9px] font-bold rounded-full flex items-center justify-center shadow">
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
