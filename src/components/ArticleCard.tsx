'use client';

import { Article } from '@/types';
import { useMemo } from 'react';
import Image from 'next/image';

interface ArticleCardProps {
    article: Article;
    viewMode: 'list' | 'card' | 'magazine';
    isSelected: boolean;
    onClick: () => void;
}

export default function ArticleCard({ article, viewMode, isSelected, onClick }: ArticleCardProps) {
    const imageUrl = useMemo(() => {
        if (article.thumbnail) return article.thumbnail;

        // Try to extract image from description
        const imgMatch = article.description.match(/<img[^>]+src="([^">]+)"/);
        return imgMatch ? imgMatch[1] : null;
    }, [article]);

    const formattedDate = useMemo(() => {
        try {
            return new Date(article.pubDate).toLocaleDateString('es-AR', {
                day: '2-digit',
                month: 'short',
            });
        } catch {
            return article.pubDate;
        }
    }, [article.pubDate]);

    // Strip HTML for the snippets
    const cleanDescription = useMemo(() => {
        return article.description.replace(/<[^>]*>?/gm, '').trim();
    }, [article.description]);

    const commonClasses = "cursor-pointer transition-all duration-300 ease-out active:scale-[0.98]";

    if (viewMode === 'list') {
        return (
            <div
                onClick={onClick}
                className={`${commonClasses} flex items-start gap-4 p-5 border-b border-zinc-50 hover:bg-white hover:shadow-xl hover:shadow-blue-500/5 group ${isSelected ? 'bg-white shadow-xl shadow-blue-500/10 border-l-4 border-l-blue-600' : 'bg-transparent'}`}
            >
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-2.5">
                        <span className="text-[11px] font-bold text-blue-600 uppercase tracking-tight">{article.sourceName}</span>
                        <span className="w-1 h-1 rounded-full bg-zinc-200" />
                        <span className="text-[11px] font-bold text-zinc-400">{formattedDate}</span>
                    </div>
                    <h3 className={`text-base font-bold leading-tight transition-colors ${isSelected ? 'text-blue-600' : 'text-zinc-900 group-hover:text-blue-600'} line-clamp-1 tracking-tight`}>
                        {article.title}
                    </h3>
                    <p className="text-xs text-zinc-400 line-clamp-1 mt-1.5 font-medium leading-relaxed">
                        {cleanDescription}
                    </p>
                </div>
            </div>
        );
    }

    if (viewMode === 'magazine') {
        return (
            <div
                onClick={onClick}
                className={`${commonClasses} flex flex-col md:flex-row gap-6 p-6 glass-card group ${isSelected ? 'ring-2 ring-blue-600/20' : ''}`}
            >
                {imageUrl && (
                    <div className="w-full md:w-60 h-44 flex-shrink-0 overflow-hidden rounded-[calc(var(--radius-card)-0.5rem)] bg-zinc-50 relative">
                        <Image
                            src={imageUrl}
                            alt={article.title}
                            fill
                            className="object-cover transition-transform duration-700 group-hover:scale-105"
                            sizes="(max-width: 768px) 100vw, 240px"
                        />
                    </div>
                )}
                <div className="flex-1 flex flex-col justify-center">
                    <div className="flex items-center gap-3 mb-4">
                        <span className="text-[11px] font-bold text-blue-600 uppercase tracking-tight">
                            {article.sourceName}
                        </span>
                        <span className="w-1 h-1 rounded-full bg-zinc-200" />
                        <span className="text-[11px] text-zinc-400 font-bold">{formattedDate}</span>
                    </div>
                    <h3 className={`text-xl font-bold leading-tight mb-4 transition-colors ${isSelected ? 'text-blue-600' : 'text-zinc-900 group-hover:text-blue-600'} line-clamp-2 tracking-tight`}>
                        {article.title}
                    </h3>
                    <p className="text-sm text-zinc-400 line-clamp-2 leading-relaxed font-medium">
                        {cleanDescription}
                    </p>
                </div>
            </div>
        );
    }

    // Default: Card View
    return (
        <div
            onClick={onClick}
            className={`${commonClasses} group flex flex-col glass-card overflow-hidden ${isSelected ? 'ring-2 ring-blue-600/20' : ''}`}
        >
            {imageUrl && (
                <div className="aspect-[16/11] w-full overflow-hidden relative">
                    <Image
                        src={imageUrl}
                        alt={article.title}
                        fill
                        className="object-cover transition-transform duration-1000 group-hover:scale-105"
                        sizes="(max-width: 1200px) 100vw, (max-width: 1536px) 50vw, 33vw"
                        priority={isSelected}
                    />
                    <div className="absolute top-6 left-6 bg-white/95 px-5 py-2.5 rounded-[var(--radius-button)] text-[10px] font-bold text-blue-600 uppercase tracking-tight shadow-2xl backdrop-blur-md">
                        {article.sourceName}
                    </div>
                </div>
            )}
            <div className="p-8 flex flex-col flex-1">
                <div className="flex items-center gap-3 mb-5">
                    <div className="w-2 h-2 rounded-full bg-blue-600 shadow-lg shadow-blue-500/50" />
                    <span className="text-[11px] text-zinc-400 font-bold">{formattedDate}</span>
                </div>

                <h3 className={`text-2xl font-bold leading-tight mb-5 transition-colors ${isSelected ? 'text-blue-600' : 'text-zinc-900 group-hover:text-blue-600'} line-clamp-2 tracking-tight`}>
                    {article.title}
                </h3>

                <p className="text-[15px] text-zinc-400 line-clamp-3 leading-relaxed flex-1 font-medium mb-10">
                    {cleanDescription}
                </p>

                <div className="pt-8 border-t border-zinc-50 flex items-center justify-between">
                    <button className="flex items-center gap-3 text-zinc-400 hover:text-blue-600 font-bold transition-all group/action">
                        <div className="w-10 h-10 rounded-2xl bg-zinc-50 flex items-center justify-center group-hover/action:bg-blue-50 transition-colors">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                            </svg>
                        </div>
                        <span className="text-[11px] uppercase tracking-tight">Chat</span>
                    </button>
                    <button className="flex items-center gap-3 text-zinc-400 hover:text-blue-600 font-bold transition-all group/action">
                        <div className="w-10 h-10 rounded-2xl bg-zinc-50 flex items-center justify-center group-hover/action:bg-blue-50 transition-colors">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                            </svg>
                        </div>
                        <span className="text-[11px] uppercase tracking-tight">Share</span>
                    </button>
                </div>
            </div>
        </div>
    );
}
