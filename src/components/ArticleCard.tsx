'use client';

import { Article } from '@/types';
import { useMemo } from 'react';
import Image from 'next/image';
import ShareMenu from './ShareMenu';

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
                className={`${commonClasses} flex items-start gap-4 p-5 border-b border-accent-primary/5 hover:bg-accent-primary/5 hover:shadow-xl hover:shadow-accent-primary/5 group ${isSelected ? 'bg-accent-primary/5 shadow-lg shadow-accent-primary/10 border-l-4 border-l-accent-primary' : 'bg-transparent'}`}
            >
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-2.5">
                        <span className="text-[11px] font-bold text-accent-primary uppercase tracking-tight">{article.sourceName}</span>
                        <span className="w-1 h-1 rounded-full bg-accent-primary/20" />
                        <span className="text-[11px] font-bold text-text-tertiary">{formattedDate}</span>
                    </div>
                    <h3 className={`text-base font-bold leading-tight transition-colors ${isSelected ? 'text-accent-primary' : 'text-text-primary group-hover:text-accent-primary'} line-clamp-1 tracking-tight`}>
                        {article.title}
                    </h3>
                    <p className="text-xs text-text-tertiary line-clamp-1 mt-1.5 font-medium leading-relaxed">
                        {cleanDescription}
                    </p>
                </div>
                {/* Share button for list view */}
                <div className="flex items-center gap-1 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                    <ShareMenu url={article.link} title={article.title} compact />
                </div>
            </div>
        );
    }

    if (viewMode === 'magazine') {
        return (
            <div
                onClick={onClick}
                className={`${commonClasses} flex flex-col md:flex-row gap-6 p-6 glass-card group ${isSelected ? 'shadow-glow-accent border-accent-primary/30 ring-1 ring-accent-primary/20' : ''}`}
            >
                {imageUrl && (
                    <div className="w-full md:w-60 h-44 flex-shrink-0 overflow-hidden rounded-2xl bg-surface-primary/50 relative">
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
                        <span className="text-[11px] font-bold text-accent-primary uppercase tracking-tight">
                            {article.sourceName}
                        </span>
                        <span className="w-1 h-1 rounded-full bg-accent-primary/20" />
                        <span className="text-[11px] text-text-tertiary font-bold">{formattedDate}</span>
                    </div>
                    <h3 className={`text-xl font-bold leading-tight mb-4 transition-colors ${isSelected ? 'text-accent-primary' : 'text-text-primary group-hover:text-accent-primary'} line-clamp-2 tracking-tight`}>
                        {article.title}
                    </h3>
                    <div className="flex items-center justify-between">
                        <p className="text-sm text-text-tertiary line-clamp-2 leading-relaxed font-medium flex-1">
                            {cleanDescription}
                        </p>
                        {/* Share button for magazine view */}
                        <div className="shrink-0 ml-4 opacity-0 group-hover:opacity-100 transition-opacity">
                            <ShareMenu url={article.link} title={article.title} compact />
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // Default: Card View (Inoreader Style)
    return (
        <div
            onClick={onClick}
            className={`${commonClasses} group flex flex-col bg-surface-elevated/50 rounded-2xl border border-accent-primary/10 hover:shadow-2xl hover:shadow-accent-primary/5 hover:border-accent-primary/30 overflow-hidden h-full glass-card ${isSelected ? 'shadow-glow-accent border-accent-primary/40 brightness-110' : ''}`}
        >
            {imageUrl && (
                <div className="aspect-[16/10] w-full overflow-hidden relative bg-surface-primary/30">
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
                <h3 className={`text-lg font-bold leading-snug mb-3 transition-colors ${isSelected ? 'text-accent-primary' : 'text-text-primary group-hover:text-accent-primary'} line-clamp-3 tracking-tight`}>
                    {article.title}
                </h3>

                <div className="flex items-center gap-2 mb-4">
                    <div className="w-5 h-5 rounded-md bg-accent-primary/10 flex items-center justify-center overflow-hidden flex-shrink-0">
                        <span className="text-[8px] font-black text-accent-primary capitalize">{article.sourceName.charAt(0)}</span>
                    </div>
                    <span className="text-xs font-bold text-text-secondary truncate">{article.sourceName}</span>
                </div>

                <div className="mt-auto pt-4 border-t border-accent-primary/10 flex items-center justify-between">
                    <span className="text-[11px] font-bold text-text-tertiary uppercase tracking-tighter opacity-70">
                        {formattedDate}
                    </span>

                    <div className="flex items-center gap-1">
                        <button
                            onClick={(e) => { e.stopPropagation(); }}
                            className="p-2 text-text-tertiary/50 hover:text-accent-secondary transition-colors"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="m19 21-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16z" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
                        </button>
                        {/* Share button for card view */}
                        <ShareMenu url={article.link} title={article.title} compact />
                    </div>
                </div>
            </div>
        </div>
    );
}
