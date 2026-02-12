'use client';

import { useState, useMemo } from 'react';
import type { SavedArticle } from '@/hooks/useSavedArticles';
import { TagBadge } from './TagInput';
import { BookmarkIcon, SearchIcon } from './Icons';

interface SavedArticlesViewProps {
    savedArticles: SavedArticle[];
    allTags: string[];
    onArticleClick: (articleId: string) => void;
    onUnsaveArticle: (articleId: string) => void;
    onRemoveTag: (articleId: string, tag: string) => void;
}

export default function SavedArticlesView({
    savedArticles,
    allTags,
    onArticleClick,
    onUnsaveArticle,
    onRemoveTag
}: SavedArticlesViewProps) {
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedTag, setSelectedTag] = useState<string | null>(null);
    const [sortBy, setSortBy] = useState<'date' | 'title'>('date');

    const filteredArticles = useMemo(() => {
        let articles = [...savedArticles];

        // Filter by search
        if (searchQuery) {
            articles = articles.filter(a =>
                a.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                a.description.toLowerCase().includes(searchQuery.toLowerCase())
            );
        }

        // Filter by tag
        if (selectedTag) {
            articles = articles.filter(a => a.tags.includes(selectedTag));
        }

        // Sort
        if (sortBy === 'date') {
            articles.sort((a, b) => new Date(b.savedAt).getTime() - new Date(a.savedAt).getTime());
        } else {
            articles.sort((a, b) => a.title.localeCompare(b.title));
        }

        return articles;
    }, [savedArticles, searchQuery, selectedTag, sortBy]);

    if (savedArticles.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-20 text-center bg-surface-primary">
                <div className="w-24 h-24 bg-gradient-to-br from-accent-primary/10 to-accent-secondary/10 rounded-3xl flex items-center justify-center mb-8 shadow-lg shadow-accent-primary/10">
                    <BookmarkIcon className="w-10 h-10 text-accent-primary" />
                </div>
                <h3 className="text-2xl font-bold text-text-primary mb-3 tracking-tight">
                    No tenés artículos guardados
                </h3>
                <p className="text-text-secondary max-w-md mx-auto">
                    Guardá artículos que quieras leer después haciendo clic en el ícono de marcador.
                </p>
            </div>
        );
    }

    return (
        <div className="p-8 md:p-12 space-y-8 bg-surface-primary min-h-full">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-4xl font-black text-text-primary tracking-tight font-display uppercase">
                        Artículos <span className="text-accent-primary">Guardados</span>
                    </h1>
                    <p className="text-text-tertiary font-bold mt-2 uppercase tracking-widest text-[10px]">
                        {savedArticles.length} artículo{savedArticles.length !== 1 ? 's' : ''} registrado{savedArticles.length !== 1 ? 's' : ''}
                    </p>
                </div>

                {/* Search */}
                <div className="relative w-full md:w-80">
                    <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-text-tertiary w-4 h-4" />
                    <input
                        type="text"
                        placeholder="Buscar en guardados..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full bg-surface-elevated border border-accent-primary/10 rounded-2xl pl-12 pr-5 py-3 text-sm font-medium focus:ring-4 focus:ring-accent-primary/5 focus:border-accent-primary/40 transition-all outline-none text-text-primary glass-card"
                    />
                </div>
            </div>

            {/* Tags Filter */}
            {allTags.length > 0 && (
                <div className="flex flex-wrap items-center gap-3">
                    <span className="text-[10px] font-black text-text-tertiary uppercase tracking-widest">Filtrar por etiqueta:</span>
                    <button
                        onClick={() => setSelectedTag(null)}
                        className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${selectedTag === null
                            ? 'bg-accent-primary text-surface-primary shadow-glow-accent'
                            : 'bg-surface-elevated text-text-secondary hover:bg-accent-primary/5 border border-accent-primary/10'
                            }`}
                    >
                        Todas
                    </button>
                    {allTags.map(tag => (
                        <button
                            key={tag}
                            onClick={() => setSelectedTag(selectedTag === tag ? null : tag)}
                            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${selectedTag === tag
                                ? 'bg-accent-primary text-surface-primary shadow-glow-accent'
                                : 'bg-surface-elevated text-text-secondary hover:bg-accent-primary/5 border border-accent-primary/10'
                                }`}
                        >
                            {tag}
                        </button>
                    ))}
                </div>
            )}

            {/* Sort Options */}
            <div className="flex items-center gap-4">
                <span className="text-[10px] font-black text-text-tertiary uppercase tracking-widest">Ordenar por:</span>
                <div className="flex bg-surface-elevated rounded-xl p-1 border border-accent-primary/10 glass-card">
                    <button
                        onClick={() => setSortBy('date')}
                        className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${sortBy === 'date' ? 'bg-accent-primary text-surface-primary shadow-sm' : 'text-text-tertiary hover:text-text-primary'
                            }`}
                    >
                        Fecha guardado
                    </button>
                    <button
                        onClick={() => setSortBy('title')}
                        className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${sortBy === 'title' ? 'bg-accent-primary text-surface-primary shadow-sm' : 'text-text-tertiary hover:text-text-primary'
                            }`}
                    >
                        Título
                    </button>
                </div>
            </div>

            {/* Articles List */}
            <div className="space-y-4">
                {filteredArticles.map(article => (
                    <div
                        key={article.id}
                        className="bg-surface-elevated rounded-[1.5rem] p-6 border border-accent-primary/10 hover:border-accent-primary/30 hover:shadow-xl hover:shadow-accent-primary/5 transition-all group glass-card"
                    >
                        <div className="flex items-start gap-4">
                            {article.thumbnail && (
                                <div className="w-24 h-24 rounded-xl overflow-hidden shrink-0 bg-surface-primary">
                                    <img
                                        src={article.thumbnail}
                                        alt=""
                                        className="w-full h-full object-cover"
                                    />
                                </div>
                            )}
                            <div className="flex-1 min-w-0">
                                <button
                                    onClick={() => onArticleClick(article.id)}
                                    className="text-left"
                                >
                                    <h3 className="font-bold text-text-primary group-hover:text-accent-primary transition-colors line-clamp-2 mb-2">
                                        {article.title}
                                    </h3>
                                </button>
                                <p className="text-sm text-text-secondary line-clamp-2 mb-3">
                                    {article.description.replace(/<[^>]*>/g, '').substring(0, 150)}...
                                </p>

                                {/* Tags */}
                                {article.tags.length > 0 && (
                                    <div className="flex flex-wrap gap-2 mb-3">
                                        {article.tags.map(tag => (
                                            <TagBadge
                                                key={tag}
                                                tag={tag}
                                                onRemove={() => onRemoveTag(article.id, tag)}
                                            />
                                        ))}
                                    </div>
                                )}

                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3 text-xs">
                                        <span className="font-bold text-accent-primary bg-accent-primary/10 px-3 py-1 rounded-full">
                                            {article.sourceName}
                                        </span>
                                        <span className="text-text-tertiary">
                                            Guardado {new Date(article.savedAt).toLocaleDateString('es-AR', {
                                                day: 'numeric',
                                                month: 'short',
                                                year: 'numeric'
                                            })}
                                        </span>
                                    </div>

                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={() => onArticleClick(article.id)}
                                            className="px-4 py-2 bg-accent-primary text-surface-primary rounded-xl text-xs font-bold hover:bg-accent-secondary transition-all shadow-glow-accent"
                                        >
                                            Leer
                                        </button>
                                        <button
                                            onClick={() => onUnsaveArticle(article.id)}
                                            className="p-2 text-text-tertiary hover:text-accent-error hover:bg-accent-error/10 rounded-xl transition-colors"
                                            aria-label="Eliminar de guardados"
                                        >
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                            </svg>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}

                {/* Empty search results */}
                {filteredArticles.length === 0 && (searchQuery || selectedTag) && (
                    <div className="text-center py-16 bg-surface-elevated rounded-[2rem] border border-accent-primary/10 glass-card">
                        <div className="w-16 h-16 bg-surface-primary rounded-2xl flex items-center justify-center mx-auto mb-6">
                            <SearchIcon className="w-6 h-6 text-text-tertiary" />
                        </div>
                        <h3 className="text-lg font-bold text-text-primary mb-2">No se encontraron resultados</h3>
                        <p className="text-text-secondary text-sm">
                            Probá con otra búsqueda o etiqueta
                        </p>
                        <button
                            onClick={() => { setSearchQuery(''); setSelectedTag(null); }}
                            className="mt-4 px-6 py-2 bg-accent-primary text-surface-primary rounded-xl text-sm font-bold hover:bg-accent-secondary transition-all shadow-glow-accent"
                        >
                            Limpiar filtros
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
