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
            <div className="flex flex-col items-center justify-center py-20 text-center">
                <div className="w-24 h-24 bg-gradient-to-br from-amber-50 to-orange-50 rounded-3xl flex items-center justify-center mb-8 shadow-lg shadow-amber-500/10">
                    <BookmarkIcon className="w-10 h-10 text-amber-500" />
                </div>
                <h3 className="text-2xl font-bold text-zinc-900 mb-3 tracking-tight">
                    No tenés artículos guardados
                </h3>
                <p className="text-zinc-500 max-w-md mx-auto">
                    Guardá artículos que quieras leer después haciendo clic en el ícono de marcador.
                </p>
            </div>
        );
    }

    return (
        <div className="p-8 md:p-12 space-y-8">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-4xl font-black text-zinc-900 tracking-tight">
                        Artículos Guardados
                    </h1>
                    <p className="text-zinc-400 font-medium mt-2">
                        {savedArticles.length} artículo{savedArticles.length !== 1 ? 's' : ''} guardado{savedArticles.length !== 1 ? 's' : ''}
                    </p>
                </div>

                {/* Search */}
                <div className="relative w-full md:w-80">
                    <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-300 w-4 h-4" />
                    <input
                        type="text"
                        placeholder="Buscar en guardados..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full bg-white border border-zinc-200 rounded-2xl pl-12 pr-5 py-3 text-sm font-medium focus:ring-4 focus:ring-blue-500/5 focus:border-blue-300 transition-all outline-none"
                    />
                </div>
            </div>

            {/* Tags Filter */}
            {allTags.length > 0 && (
                <div className="flex flex-wrap items-center gap-3">
                    <span className="text-xs font-bold text-zinc-400 uppercase tracking-tight">Filtrar por etiqueta:</span>
                    <button
                        onClick={() => setSelectedTag(null)}
                        className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${selectedTag === null
                                ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30'
                                : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200'
                            }`}
                    >
                        Todas
                    </button>
                    {allTags.map(tag => (
                        <button
                            key={tag}
                            onClick={() => setSelectedTag(selectedTag === tag ? null : tag)}
                            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${selectedTag === tag
                                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30'
                                    : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200'
                                }`}
                        >
                            {tag}
                        </button>
                    ))}
                </div>
            )}

            {/* Sort Options */}
            <div className="flex items-center gap-4">
                <span className="text-xs font-bold text-zinc-400 uppercase tracking-tight">Ordenar por:</span>
                <div className="flex bg-zinc-100 rounded-xl p-1">
                    <button
                        onClick={() => setSortBy('date')}
                        className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${sortBy === 'date' ? 'bg-white text-zinc-900 shadow' : 'text-zinc-500 hover:text-zinc-700'
                            }`}
                    >
                        Fecha guardado
                    </button>
                    <button
                        onClick={() => setSortBy('title')}
                        className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${sortBy === 'title' ? 'bg-white text-zinc-900 shadow' : 'text-zinc-500 hover:text-zinc-700'
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
                        className="bg-white rounded-[1.5rem] p-6 border border-zinc-100 hover:border-blue-200 hover:shadow-xl hover:shadow-blue-500/5 transition-all group"
                    >
                        <div className="flex items-start gap-4">
                            {article.thumbnail && (
                                <div className="w-24 h-24 rounded-xl overflow-hidden shrink-0 bg-zinc-100">
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
                                    <h3 className="font-bold text-zinc-900 group-hover:text-blue-600 transition-colors line-clamp-2 mb-2">
                                        {article.title}
                                    </h3>
                                </button>
                                <p className="text-sm text-zinc-500 line-clamp-2 mb-3">
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
                                        <span className="font-bold text-blue-600 bg-blue-50 px-3 py-1 rounded-full">
                                            {article.sourceName}
                                        </span>
                                        <span className="text-zinc-400">
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
                                            className="px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-bold hover:bg-blue-700 transition-colors shadow-lg shadow-blue-500/30"
                                        >
                                            Leer
                                        </button>
                                        <button
                                            onClick={() => onUnsaveArticle(article.id)}
                                            className="p-2 text-zinc-400 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-colors"
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
                    <div className="text-center py-16 bg-white rounded-[2rem] border border-zinc-100">
                        <div className="w-16 h-16 bg-zinc-50 rounded-2xl flex items-center justify-center mx-auto mb-6">
                            <SearchIcon className="w-6 h-6 text-zinc-300" />
                        </div>
                        <h3 className="text-lg font-bold text-zinc-900 mb-2">No se encontraron resultados</h3>
                        <p className="text-zinc-500 text-sm">
                            Probá con otra búsqueda o etiqueta
                        </p>
                        <button
                            onClick={() => { setSearchQuery(''); setSelectedTag(null); }}
                            className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-xl text-sm font-bold hover:bg-blue-700 transition-colors"
                        >
                            Limpiar filtros
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
