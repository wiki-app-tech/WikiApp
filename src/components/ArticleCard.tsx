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

/* Mapa de categorías → clase badge semántica */
const BADGE_CLASS: Record<string, string> = {
    internacionales: 'badge-intern',
    nacionales:      'badge-nac',
    provinciales:    'badge-prov',
    deporte:         'badge-dep',
    social:          'badge-soc',
};

const getBadgeClass = (cat?: string) =>
    BADGE_CLASS[cat?.toLowerCase() ?? ''] ?? 'badge-default';

export default function ArticleCard({ article, viewMode, isSelected, onClick }: ArticleCardProps) {

    const imageUrl = useMemo(() => {
        if (article.thumbnail) return article.thumbnail;
        const m = article.description.match(/<img[^>]+src="([^">]+)"/);
        return m ? m[1] : null;
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

    const badgeClass = getBadgeClass(article.sourceCategory);
    const selected = isSelected ? 'selected' : '';

    /* ── LIST ─────────────────────────────────────────────────────────── */
    if (viewMode === 'list') {
        return (
            <article
                onClick={onClick}
                className={`
                    article-card group flex gap-4 items-start px-4 py-3.5 border-b border-0
                    rounded-none border-b-[hsl(var(--border-subtle))]
                    ${isSelected
                        ? 'selected bg-[hsl(var(--accent-primary)/0.03)]'
                        : 'hover:bg-[hsl(var(--surface-hover))]'}
                `}
                style={{ borderRadius: 0, borderBottom: '1px solid hsl(var(--border-subtle))', borderLeft: isSelected ? '3px solid hsl(var(--accent-secondary))' : '3px solid transparent' }}
            >
                <div className="flex-1 min-w-0">
                    {/* Meta: fuente + categoría + fecha */}
                    <div className="flex flex-wrap items-center gap-2 mb-1.5">
                        <span className={`badge-pill ${badgeClass}`}>
                            {article.sourceCategory ?? article.sourceName}
                        </span>
                        <span className="text-[12px] font-semibold text-[hsl(var(--text-secondary))] truncate max-w-[160px]">
                            {article.sourceName}
                        </span>
                        <time className="text-[11px] text-[hsl(var(--text-tertiary))] ml-auto shrink-0">
                            {formattedDate}
                        </time>
                    </div>

                    {/* Título — jerarquía clara */}
                    <h3 style={{ color: isSelected ? 'hsl(var(--accent-primary))' : 'hsl(var(--text-primary))' }}
                        className="text-[14px] font-semibold leading-snug line-clamp-2 tracking-tight transition-colors group-hover:text-[hsl(var(--accent-primary))]">
                        {article.title}
                    </h3>

                    {/* Extracto — visible en sm+ */}
                    <p className="hidden sm:block text-[12px] text-[hsl(var(--text-tertiary))] line-clamp-1 mt-1 leading-relaxed">
                        {cleanDescription}
                    </p>
                </div>

                {/* Acciones */}
                <div className="shrink-0 flex items-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <ShareMenu url={article.link} title={article.title} compact />
                </div>
            </article>
        );
    }

    /* ── MAGAZINE ─────────────────────────────────────────────────────── */
    if (viewMode === 'magazine') {
        return (
            <article
                onClick={onClick}
                className={`article-card group flex flex-col sm:flex-row overflow-hidden ${selected}`}
            >
                {/* Thumbnail */}
                {imageUrl && (
                    <div className="sm:w-48 sm:shrink-0 h-44 sm:h-auto relative overflow-hidden bg-[hsl(var(--surface-sunken))]">
                        <Image src={imageUrl} alt={article.title} fill
                            className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                            sizes="(max-width:640px) 100vw, 192px"
                        />
                    </div>
                )}

                {/* Contenido */}
                <div className="flex-1 flex flex-col p-4 sm:p-5">
                    <div className="flex flex-wrap items-center gap-2 mb-2">
                        <span className={`badge-pill ${badgeClass}`}>{article.sourceCategory ?? article.sourceName}</span>
                        <time className="text-[11px] text-[hsl(var(--text-tertiary))] ml-auto">{formattedDate}</time>
                    </div>

                    <h3 className="text-[15px] font-bold leading-snug line-clamp-3 tracking-tight mb-2 transition-colors group-hover:text-[hsl(var(--accent-primary))]"
                        style={{ color: isSelected ? 'hsl(var(--accent-primary))' : 'hsl(var(--text-primary))' }}>
                        {article.title}
                    </h3>

                    <p className="text-[13px] text-[hsl(var(--text-tertiary))] line-clamp-2 leading-relaxed flex-1">
                        {cleanDescription}
                    </p>

                    <div className="flex items-center justify-between mt-3 pt-3 border-t border-[hsl(var(--border-subtle))]">
                        <span className="text-[12px] font-semibold text-[hsl(var(--text-secondary))]">
                            {article.sourceName}
                        </span>
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <span className="text-[hsl(var(--accent-primary))] flex items-center gap-1 text-[12px] font-semibold">
                                Leer
                                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 12h14M12 5l7 7-7 7" />
                                </svg>
                            </span>
                            <ShareMenu url={article.link} title={article.title} compact />
                        </div>
                    </div>
                </div>
            </article>
        );
    }

    /* ── CARD (default) ───────────────────────────────────────────────── */
    return (
        <article
            onClick={onClick}
            className={`article-card group flex flex-col h-full overflow-hidden ${selected}`}
        >
            {/* Imagen o franja de color */}
            {imageUrl ? (
                <div className="relative h-40 sm:h-44 overflow-hidden bg-[hsl(var(--surface-sunken))] shrink-0">
                    <Image src={imageUrl} alt={article.title} fill
                        className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                        sizes="(max-width:768px) 100vw, (max-width:1200px) 50vw, 33vw"
                    />
                    {/* Badge flotante */}
                    <div className="absolute top-2.5 left-3">
                        <span className={`badge-pill ${badgeClass} shadow-sm`}>
                            {article.sourceCategory ?? article.sourceName}
                        </span>
                    </div>
                </div>
            ) : (
                /* Sin imagen: franja de color arriba */
                <div className="h-1 shrink-0" style={{ background: 'linear-gradient(90deg, hsl(var(--accent-primary)), hsl(var(--accent-secondary)))' }} />
            )}

            <div className="flex flex-col flex-1 p-4">
                {/* Fuente + badge (solo si sin imagen) */}
                {!imageUrl && (
                    <div className="flex items-center gap-2 mb-2">
                        <span className={`badge-pill ${badgeClass}`}>{article.sourceCategory ?? article.sourceName}</span>
                    </div>
                )}

                {/* Fuente pequeña */}
                <div className="flex items-center gap-2 mb-2">
                    <div className="w-4 h-4 rounded bg-[hsl(var(--accent-primary)/0.10)] flex items-center justify-center shrink-0">
                        <span className="text-[8px] font-black text-[hsl(var(--accent-primary))] uppercase leading-none">
                            {article.sourceName.charAt(0)}
                        </span>
                    </div>
                    <span className="text-[11px] font-semibold text-[hsl(var(--text-tertiary))] truncate">
                        {article.sourceName}
                    </span>
                </div>

                {/* Título — el elemento más importante */}
                <h3 className="text-[14px] font-bold leading-snug line-clamp-3 tracking-tight flex-1 transition-colors group-hover:text-[hsl(var(--accent-primary))]"
                    style={{ color: isSelected ? 'hsl(var(--accent-primary))' : 'hsl(var(--text-primary))' }}>
                    {article.title}
                </h3>

                {/* Footer */}
                <div className="flex items-center justify-between mt-3 pt-3 border-t border-[hsl(var(--border-subtle))]">
                    <time className="text-[11px] font-semibold text-[hsl(var(--text-muted))] uppercase tracking-wider">
                        {formattedDate}
                    </time>
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={(e) => e.stopPropagation()} className="btn-icon w-7 h-7">
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path d="m19 21-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16z" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                        </button>
                        <ShareMenu url={article.link} title={article.title} compact />
                    </div>
                </div>
            </div>
        </article>
    );
}
