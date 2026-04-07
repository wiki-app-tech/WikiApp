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

/* Mapeo de categorías a colores */
const CATEGORY_COLORS: Record<string, string> = {
    internacionales: 'bg-sky-100 text-sky-700 border-sky-200',
    nacionales:      'bg-emerald-100 text-emerald-700 border-emerald-200',
    provinciales:    'bg-violet-100 text-violet-700 border-violet-200',
    deporte:         'bg-amber-100 text-amber-700 border-amber-200',
    social:          'bg-rose-100 text-rose-700 border-rose-200',
};

const getCategoryStyle = (cat?: string) =>
    CATEGORY_COLORS[cat?.toLowerCase() ?? ''] ?? 'bg-slate-100 text-slate-600 border-slate-200';

export default function ArticleCard({ article, viewMode, isSelected, onClick }: ArticleCardProps) {
    const imageUrl = useMemo(() => {
        if (article.thumbnail) return article.thumbnail;
        const imgMatch = article.description.match(/<img[^>]+src="([^">]+)"/);
        return imgMatch ? imgMatch[1] : null;
    }, [article]);

    const formattedDate = useMemo(() => {
        try {
            return new Date(article.pubDate).toLocaleDateString('es-AR', {
                day: '2-digit', month: 'short',
            });
        } catch { return article.pubDate; }
    }, [article.pubDate]);

    const cleanDescription = useMemo(() =>
        article.description.replace(/<[^>]*>?/gm, '').trim()
    , [article.description]);

    const categoryStyle = getCategoryStyle(article.sourceCategory);

    /* ── LIST VIEW ─────────────────────────────────────────────────────── */
    if (viewMode === 'list') {
        return (
            <div
                onClick={onClick}
                className={`
                    group flex items-start gap-4 px-5 py-4 cursor-pointer
                    transition-all duration-200
                    border-l-[3px] border-b border-b-slate-100/80
                    ${isSelected
                        ? 'bg-accent-primary/5 border-l-accent-secondary'
                        : 'bg-surface-elevated border-l-transparent hover:bg-accent-primary/4 hover:border-l-accent-primary'
                    }
                `}
            >
                <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-1.5">
                        <span className={`badge-pill border ${categoryStyle} text-[10px] py-0.5`}>
                            {article.sourceCategory ?? article.sourceName}
                        </span>
                        <span className="text-[11px] font-semibold text-text-primary truncate max-w-[180px]">
                            {article.sourceName}
                        </span>
                        <span className="text-[10px] text-text-tertiary ml-auto shrink-0">{formattedDate}</span>
                    </div>
                    <h3 className={`
                        text-sm font-bold leading-snug line-clamp-2 tracking-tight transition-colors
                        ${isSelected ? 'text-accent-primary' : 'text-text-primary group-hover:text-accent-primary'}
                    `}>
                        {article.title}
                    </h3>
                    <p className="text-xs text-text-tertiary line-clamp-1 mt-1 leading-relaxed hidden sm:block">
                        {cleanDescription}
                    </p>
                </div>
                <div className="shrink-0 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <ShareMenu url={article.link} title={article.title} compact />
                </div>
            </div>
        );
    }

    /* ── MAGAZINE VIEW ─────────────────────────────────────────────────── */
    if (viewMode === 'magazine') {
        return (
            <div
                onClick={onClick}
                className={`
                    group flex flex-col sm:flex-row gap-0 cursor-pointer overflow-hidden
                    card-wotech ${isSelected ? 'selected' : ''}
                `}
            >
                {imageUrl && (
                    <div className="sm:w-52 h-44 sm:h-auto flex-shrink-0 overflow-hidden relative">
                        <Image
                            src={imageUrl} alt={article.title} fill
                            className="object-cover transition-transform duration-500 group-hover:scale-105"
                            sizes="(max-width: 640px) 100vw, 208px"
                        />
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent to-surface-elevated/20" />
                    </div>
                )}
                <div className="flex-1 flex flex-col justify-center p-5">
                    <div className="flex flex-wrap items-center gap-2 mb-3">
                        <span className={`badge-pill border ${categoryStyle}`}>
                            {article.sourceCategory ?? article.sourceName}
                        </span>
                        <span className="text-[10px] text-text-tertiary ml-auto">{formattedDate}</span>
                    </div>
                    <h3 className={`
                        text-base font-bold leading-snug line-clamp-3 tracking-tight mb-3
                        transition-colors ${isSelected ? 'text-accent-primary' : 'text-text-primary group-hover:text-accent-primary'}
                    `}>
                        {article.title}
                    </h3>
                    <p className="text-xs text-text-tertiary line-clamp-2 leading-relaxed mb-4">
                        {cleanDescription}
                    </p>
                    <div className="flex items-center justify-between mt-auto">
                        <span className="text-xs font-semibold text-text-secondary">{article.sourceName}</span>
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            {/* Arrow — Wotech style */}
                            <span className="arrow-icon text-accent-primary">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 12h14M12 5l7 7-7 7" />
                                </svg>
                            </span>
                            <ShareMenu url={article.link} title={article.title} compact />
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    /* ── CARD VIEW (default) ────────────────────────────────────────────── */
    return (
        <div
            onClick={onClick}
            className={`
                group flex flex-col overflow-hidden cursor-pointer h-full
                card-wotech ${isSelected ? 'selected' : ''}
            `}
        >
            {/* Thumbnail */}
            {imageUrl ? (
                <div className="aspect-[16/10] w-full overflow-hidden relative bg-surface-sunken flex-shrink-0">
                    <Image
                        src={imageUrl} alt={article.title} fill
                        className="object-cover transition-transform duration-500 group-hover:scale-105"
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    />
                    {/* Category overlay */}
                    <div className="absolute top-3 left-3">
                        <span className={`badge-pill border ${categoryStyle} shadow-sm backdrop-blur-sm`}>
                            {article.sourceCategory ?? article.sourceName}
                        </span>
                    </div>
                </div>
            ) : (
                /* No image — decorative placeholder */
                <div className="h-2 w-full bg-gradient-to-r from-accent-primary/60 to-accent-secondary/60" />
            )}

            <div className="p-5 flex flex-col flex-1">
                {/* Source + Date */}
                <div className="flex items-center gap-2 mb-3">
                    <div className="w-5 h-5 rounded-md bg-accent-primary/10 flex items-center justify-center shrink-0">
                        <span className="text-[8px] font-black text-accent-primary uppercase">
                            {article.sourceName.charAt(0)}
                        </span>
                    </div>
                    <span className="text-xs font-semibold text-text-secondary truncate flex-1">
                        {article.sourceName}
                    </span>
                    {!imageUrl && (
                        <span className={`badge-pill border ${categoryStyle}`}>
                            {article.sourceCategory ?? article.sourceName}
                        </span>
                    )}
                </div>

                {/* Title */}
                <h3 className={`
                    text-sm font-bold leading-snug line-clamp-3 tracking-tight mb-3 flex-1
                    transition-colors
                    ${isSelected ? 'text-accent-primary' : 'text-text-primary group-hover:text-accent-primary'}
                `}>
                    {article.title}
                </h3>

                {/* Footer */}
                <div className="pt-3 border-t border-slate-100 flex items-center justify-between mt-auto">
                    <span className="text-[11px] font-semibold text-text-tertiary uppercase tracking-wide">
                        {formattedDate}
                    </span>
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <span className="arrow-icon text-accent-primary mr-1">
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 12h14M12 5l7 7-7 7" />
                            </svg>
                        </span>
                        <button onClick={(e) => e.stopPropagation()} className="p-1.5 text-text-tertiary/50 hover:text-accent-secondary transition-colors">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path d="m19 21-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16z" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                        </button>
                        <ShareMenu url={article.link} title={article.title} compact />
                    </div>
                </div>
            </div>
        </div>
    );
}
