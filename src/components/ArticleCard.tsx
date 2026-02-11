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

    // Default: Card View (Inoreader Style)
    return (
        <div
            onClick={onClick}
            className={`${commonClasses} group flex flex-col bg-white rounded-xl border border-slate-100 hover:shadow-2xl hover:shadow-slate-200/50 hover:border-blue-100 overflow-hidden h-full`}
        >
            {imageUrl && (
                <div className="aspect-[16/10] w-full overflow-hidden relative bg-slate-50">
                    <Image
                        src={imageUrl}
                        alt={article.title}
                        fill
                        className="object-cover transition-transform duration-700 group-hover:scale-105"
                        sizes="(max-width: 1200px) 100vw, (max-width: 1536px) 50vw, 33vw"
                    />
                </div>
            )}

            <div className="p-5 flex flex-col flex-1">
                <h3 className={`text-lg font-bold leading-snug mb-3 transition-colors ${isSelected ? 'text-blue-600' : 'text-slate-900 group-hover:text-blue-600'} line-clamp-3 tracking-tight`}>
                    {article.title}
                </h3>

                <div className="flex items-center gap-2 mb-4">
                    <div className="w-5 h-5 rounded-md bg-slate-100 flex items-center justify-center overflow-hidden flex-shrink-0">
                        <span className="text-[8px] font-black text-slate-400 capitalize">{article.sourceName.charAt(0)}</span>
                    </div>
                    <span className="text-xs font-bold text-slate-500 truncate">{article.sourceName}</span>
                </div>

                <div className="mt-auto pt-4 border-t border-slate-50 flex items-center justify-between">
                    <span className="text-[11px] font-medium text-slate-400 uppercase tracking-tighter">
                        {formattedDate}
                    </span>

                    <div className="flex items-center gap-1">
                        <button className="p-2 text-slate-300 hover:text-amber-500 transition-colors">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m19 21-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16z" /></svg>
                        </button>
                        <button className="p-2 text-slate-300 hover:text-blue-500 transition-colors">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><circle cx="12" cy="12" r="7" strokeWidth="2.5" /></svg>
                        </button>
                        <button className="p-2 text-slate-300 hover:text-slate-600 transition-colors">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><circle cx="12" cy="12" r="1" /><circle cx="19" cy="12" r="1" /><circle cx="5" cy="12" r="1" /></svg>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
