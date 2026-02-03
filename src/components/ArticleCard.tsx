'use client';

import { Article } from '@/types';
import { useMemo } from 'react';

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

    if (viewMode === 'list') {
        return (
            <div
                onClick={onClick}
                className={`flex items-start gap-4 p-3.5 cursor-pointer transition-all border-b border-zinc-100/50 hover:bg-zinc-50/80 group ${isSelected ? 'bg-orange-50/40 border-l-4 border-l-orange-500 shadow-sm' : 'bg-white'}`}
            >
                {imageUrl ? (
                    <div className="w-16 h-16 rounded-lg overflow-hidden flex-shrink-0 bg-zinc-100 shadow-sm transition-transform group-hover:scale-105">
                        <img
                            src={imageUrl}
                            alt={article.title}
                            className="w-full h-full object-cover"
                        />
                    </div>
                ) : (
                    <div className="w-16 h-16 rounded-lg bg-zinc-50 border border-zinc-100 flex items-center justify-center flex-shrink-0">
                        <span className="text-zinc-400 text-[10px] font-black uppercase tracking-tighter">{article.sourceName.substring(0, 2)}</span>
                    </div>
                )}
                <div className="flex-1 min-w-0 py-0.5">
                    <div className="flex justify-between items-baseline gap-4">
                        <h3 className={`text-sm font-bold leading-tight line-clamp-2 transition-colors ${isSelected ? 'text-orange-600' : 'text-zinc-900 group-hover:text-blue-600'}`}>
                            {article.title}
                        </h3>
                        <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest whitespace-nowrap">{formattedDate}</span>
                    </div>
                    <p className="text-[11px] text-zinc-500 line-clamp-1 mt-1 font-medium leading-relaxed">
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
                className={`flex gap-6 p-5 cursor-pointer transition-all glass-card group hover:shadow-xl hover:shadow-zinc-200/50 ${isSelected ? 'ring-2 ring-orange-500/20 bg-orange-50/30' : ''}`}
            >
                {imageUrl && (
                    <div className="w-40 h-28 flex-shrink-0 overflow-hidden rounded-xl bg-zinc-100 shadow-md">
                        <img
                            src={imageUrl}
                            alt={article.title}
                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                        />
                    </div>
                )}
                <div className="flex-1 flex flex-col pt-1">
                    <div className="flex items-center gap-2 mb-2">
                        <span className="text-[9px] font-black text-orange-600 uppercase tracking-[0.15em] bg-orange-100 px-2 py-0.5 rounded-full leading-none">
                            {article.sourceName}
                        </span>
                        <span className="text-zinc-300">•</span>
                        <span className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest">{formattedDate}</span>
                    </div>
                    <h3 className={`text-lg font-black leading-tight mb-2 transition-colors ${isSelected ? 'text-orange-600' : 'text-zinc-900 group-hover:text-blue-600'} line-clamp-2`}>
                        {article.title}
                    </h3>
                    <p className="text-xs text-zinc-500 line-clamp-2 leading-relaxed font-medium">
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
            className={`group flex flex-col cursor-pointer transition-all glass-card hover:shadow-2xl hover:shadow-zinc-200/50 ${isSelected ? 'ring-2 ring-orange-500/20 bg-orange-50/30' : ''}`}
        >
            {imageUrl && (
                <div className="aspect-video w-full overflow-hidden rounded-t-2xl bg-zinc-100 relative">
                    <img
                        src={imageUrl}
                        alt={article.title}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                </div>
            )}
            <div className="p-5 flex flex-col flex-1">
                <div className="flex items-center justify-between mb-3">
                    <span className="text-[9px] font-black text-orange-600 uppercase tracking-[0.15em] bg-orange-100 px-2 py-0.5 rounded-full leading-none">
                        {article.sourceName}
                    </span>
                    <span className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest">{formattedDate}</span>
                </div>

                <h3 className={`text-xl font-black leading-tight mb-3 transition-colors ${isSelected ? 'text-orange-600' : 'text-zinc-900 group-hover:text-blue-600'} line-clamp-2`}>
                    {article.title}
                </h3>

                <p className="text-sm text-zinc-500 line-clamp-3 leading-relaxed flex-1 font-medium mb-4">
                    {cleanDescription}
                </p>

                <div className="pt-4 border-t border-zinc-100 flex items-center gap-4 text-zinc-400">
                    <button className="flex items-center gap-1.5 hover:text-orange-500 transition-colors group/action">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                        </svg>
                        <span className="text-[9px] font-black uppercase tracking-widest">Feedback</span>
                    </button>
                    <button className="flex items-center gap-1.5 hover:text-blue-500 transition-colors group/action">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                        </svg>
                        <span className="text-[9px] font-black uppercase tracking-widest">Share</span>
                    </button>
                </div>
            </div>
        </div>
    );
}
