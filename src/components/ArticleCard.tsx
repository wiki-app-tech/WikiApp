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
                className={`flex items-start gap-3 p-3 cursor-pointer transition-all border-b border-zinc-100/50 hover:bg-zinc-50/80 group ${isSelected ? 'bg-blue-50/40 border-l-4 border-l-blue-600 shadow-sm' : 'bg-white'}`}
            >
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                        <span className="text-[10px] font-black text-blue-600 uppercase tracking-widest">{article.sourceName}</span>
                        <span className="text-zinc-300">•</span>
                        <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">{formattedDate}</span>
                    </div>
                    <div className="flex justify-between items-baseline gap-4">
                        <h3 className={`text-sm font-bold leading-snug transition-colors ${isSelected ? 'text-blue-700' : 'text-zinc-900 group-hover:text-blue-600'} line-clamp-1`}>
                            {article.title}
                        </h3>
                    </div>
                    <p className="text-[11px] text-zinc-500 line-clamp-1 mt-1 font-medium leading-relaxed italic opacity-80">
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
                className={`flex gap-5 p-4 cursor-pointer transition-all rounded-2xl border border-zinc-100 hover:border-blue-200/50 hover:bg-zinc-50/50 group hover:shadow-xl hover:shadow-zinc-200/30 ${isSelected ? 'ring-2 ring-blue-600/20 bg-blue-50/30 border-blue-200' : 'bg-white'}`}
            >
                {imageUrl && (
                    <div className="w-48 h-32 flex-shrink-0 overflow-hidden rounded-xl bg-zinc-100 shadow-md">
                        <img
                            src={imageUrl}
                            alt={article.title}
                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                        />
                    </div>
                )}
                <div className="flex-1 flex flex-col pt-0.5">
                    <div className="flex items-center gap-2 mb-2">
                        <span className="text-[10px] font-black text-blue-600 uppercase tracking-widest">
                            {article.sourceName}
                        </span>
                        <span className="text-zinc-300">•</span>
                        <span className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest">{formattedDate}</span>
                    </div>
                    <h3 className={`text-lg font-black leading-tight mb-2 transition-colors ${isSelected ? 'text-blue-700' : 'text-zinc-900 group-hover:text-blue-600'} line-clamp-2`}>
                        {article.title}
                    </h3>
                    <p className="text-xs text-zinc-500 line-clamp-3 leading-relaxed font-medium">
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
            className={`group flex flex-col cursor-pointer transition-all rounded-[2rem] border border-zinc-100 hover:border-blue-200/50 bg-white hover:shadow-2xl hover:shadow-zinc-200/50 overflow-hidden ${isSelected ? 'ring-2 ring-blue-600/20 bg-blue-50/30 border-blue-200' : ''}`}
        >
            {imageUrl && (
                <div className="aspect-[16/10] w-full overflow-hidden bg-zinc-100 relative">
                    <img
                        src={imageUrl}
                        alt={article.title}
                        className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-md px-3 py-1 rounded-full text-[9px] font-black text-blue-600 uppercase tracking-widest shadow-lg opacity-0 group-hover:opacity-100 transition-all translate-y-2 group-hover:translate-y-0">
                        {article.sourceName}
                    </div>
                </div>
            )}
            <div className="p-6 flex flex-col flex-1">
                <div className="flex items-center gap-3 mb-4">
                    <div className="w-1.5 h-1.5 rounded-full bg-blue-600" />
                    <span className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest">{formattedDate}</span>
                </div>

                <h3 className={`text-xl font-black leading-tight mb-4 transition-colors ${isSelected ? 'text-blue-700' : 'text-zinc-900 group-hover:text-blue-600'} line-clamp-2`}>
                    {article.title}
                </h3>

                <p className="text-sm text-zinc-500 line-clamp-3 leading-relaxed flex-1 font-medium mb-6">
                    {cleanDescription}
                </p>

                <div className="pt-5 border-t border-zinc-100 flex items-center justify-between text-zinc-400">
                    <button className="flex items-center gap-2 hover:text-blue-600 transition-colors group/action">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                        </svg>
                        <span className="text-[9px] font-black uppercase tracking-widest">Feedback</span>
                    </button>
                    <button className="flex items-center gap-2 hover:text-blue-600 transition-colors group/action">
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
