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

    const filteredArticles = useMemo(() => {
        return initialArticles.filter(a => {
            const matchesSearch = a.title.toLowerCase().includes(search.toLowerCase()) ||
                a.description.toLowerCase().includes(search.toLowerCase());
            const matchesFeed = selectedFeed ? a.sourceId === selectedFeed : true;
            return matchesSearch && matchesFeed;
        });
    }, [initialArticles, search, selectedFeed]);

    return (
        <div className="flex h-screen bg-black text-white font-sans overflow-hidden">
            {/* Sidebar */}
            <aside className="w-64 border-r border-zinc-800 flex flex-col p-4 shrink-0 bg-zinc-950">
                <h1 className="text-xl font-bold mb-8 tracking-tighter text-blue-500">RSS DASH</h1>

                <nav className="flex-1 space-y-1 overflow-y-auto">
                    <button
                        onClick={() => setSelectedFeed(null)}
                        className={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors ${!selectedFeed ? 'bg-zinc-800 text-white' : 'hover:bg-zinc-900 text-zinc-400'}`}
                    >
                        Todos los feeds
                    </button>

                    <div className="pt-4 pb-2">
                        <span className="px-3 text-xs font-semibold text-zinc-500 uppercase tracking-wider">Fuentes</span>
                    </div>

                    {feeds.map(feed => (
                        <button
                            key={feed.id}
                            onClick={() => setSelectedFeed(feed.id)}
                            className={`w-full text-left px-3 py-2 rounded-md text-sm flex items-center gap-2 transition-colors ${selectedFeed === feed.id ? 'bg-zinc-800 text-white' : 'hover:bg-zinc-900 text-zinc-400'}`}
                        >
                            <FeedIcon type={feed.type} />
                            <span className="truncate">{feed.name}</span>
                        </button>
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
                    <div className="text-xs text-zinc-500">
                        {filteredArticles.length} artículos encontrados
                    </div>
                </header>

                {/* Article Grid */}
                <div className="flex-1 overflow-y-auto p-6 scroll-smooth">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredArticles.map(article => (
                            <a
                                key={article.id}
                                href={article.link}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="group p-4 rounded-xl border border-zinc-800 hover:border-zinc-700 bg-zinc-950 transition-all duration-200"
                            >
                                <div className="flex items-center gap-2 mb-3">
                                    <FeedIcon type={article.sourceType} />
                                    <span className="text-[10px] font-medium text-zinc-500 uppercase">{article.sourceName}</span>
                                </div>
                                <h2 className="text-base font-semibold mb-2 group-hover:text-blue-400 transition-colors line-clamp-2 leading-tight">
                                    {article.title}
                                </h2>
                                <p className="text-sm text-zinc-400 line-clamp-3 leading-relaxed">
                                    {article.description}
                                </p>
                                <div className="mt-4 text-[10px] text-zinc-600">
                                    {new Date(article.pubDate).toLocaleDateString('es-AR')}
                                </div>
                            </a>
                        ))}
                    </div>

                    {filteredArticles.length === 0 && (
                        <div className="h-full flex flex-col items-center justify-center text-zinc-500">
                            <p>No se encontraron resultados</p>
                        </div>
                    )}
                </div>
            </main>
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
