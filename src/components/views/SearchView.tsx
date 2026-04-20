'use client';

import { useMemo } from 'react';
import type { Article } from '@/types';
import {
    SearchIcon,
} from '@/components/Icons';

interface SearchViewProps {
    articles: Article[];
    globalSearch: string;
    setGlobalSearch: (v: string) => void;
    onArticleClick: (articleId: string) => void;
}

export default function SearchView({ articles, globalSearch, setGlobalSearch, onArticleClick }: SearchViewProps) {
    // Compute filtered results ONCE
    const searchResults = useMemo(() => {
        if (globalSearch.length === 0) return [];
        const query = globalSearch.toLowerCase();
        return articles.filter(a =>
            a.title.toLowerCase().includes(query) ||
            a.description.toLowerCase().includes(query)
        );
    }, [articles, globalSearch]);

    return (
        <div className="flex-1 overflow-y-auto p-8 md:p-12 bg-surface-primary">
            <div className="max-w-4xl mx-auto">
                {/* Cabecera de Búsqueda */}
                <div className="text-center mb-12">
                    <h1 className="text-4xl md:text-5xl font-black text-text-primary tracking-tight mb-4 font-display">
                        Buscar Noticias
                    </h1>
                    <p className="text-text-secondary text-lg font-medium">
                        Encontrá cualquier artículo en tiempo real
                    </p>
                </div>

                {/* Campo de Búsqueda Grande */}
                <div className="relative mb-12">
                    <div className="absolute left-6 top-1/2 -translate-y-1/2 text-accent-primary">
                        <SearchIcon className="w-6 h-6" />
                    </div>
                    <input
                        type="text"
                        placeholder="Escribí para buscar..."
                        value={globalSearch}
                        onChange={(e) => setGlobalSearch(e.target.value)}
                        autoFocus
                        className="w-full bg-surface-elevated border-2 border-accent-primary/10 rounded-[2rem] pl-16 pr-6 py-5 text-xl font-medium focus:ring-4 focus:ring-accent-primary/10 focus:border-accent-primary transition-all outline-none shadow-lg shadow-accent-primary/5 placeholder:text-text-tertiary text-text-primary"
                    />
                    {globalSearch && (
                        <button
                            onClick={() => setGlobalSearch('')}
                            className="absolute right-6 top-1/2 -translate-y-1/2 p-2 text-text-tertiary hover:text-text-primary hover:bg-surface-primary rounded-full transition-all"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    )}
                </div>

                {/* Resultados de Búsqueda */}
                {globalSearch.length > 0 && (
                    <div className="space-y-6">
                        {/* Contador de resultados */}
                        <div className="flex items-center gap-3 mb-8">
                            <div className="h-8 w-1.5 bg-accent-primary rounded-full" />
                            <span className="text-sm font-bold text-text-tertiary uppercase tracking-tight">
                                {searchResults.length} resultados encontrados
                            </span>
                        </div>

                        {/* Lista de resultados */}
                        <div className="space-y-4">
                            {searchResults.slice(0, 20).map(article => (
                                <button
                                    key={article.id}
                                    onClick={() => onArticleClick(article.id)}
                                    className="w-full text-left bg-surface-elevated rounded-[1.5rem] p-6 border border-accent-primary/10 hover:border-accent-primary/30 hover:shadow-xl hover:shadow-accent-primary/5 transition-all group"
                                >
                                    <div className="flex items-start gap-4">
                                        {article.thumbnail && (
                                            <div className="w-20 h-20 rounded-xl overflow-hidden shrink-0 bg-surface-primary">
                                                <img
                                                    src={article.thumbnail}
                                                    alt=""
                                                    className="w-full h-full object-cover"
                                                />
                                            </div>
                                        )}
                                        <div className="flex-1 min-w-0">
                                            <h3 className="font-bold text-text-primary group-hover:text-accent-primary transition-colors line-clamp-2 mb-2">
                                                {article.title}
                                            </h3>
                                            <p className="text-sm text-text-secondary line-clamp-2 mb-3">
                                                {article.description.replace(/<[^>]*>/g, '').substring(0, 150)}...
                                            </p>
                                            <div className="flex items-center gap-3 text-xs">
                                                <span className="font-bold text-accent-primary bg-accent-primary/10 px-3 py-1 rounded-full">
                                                    {article.sourceName}
                                                </span>
                                                <span className="text-text-tertiary">
                                                    {new Date(article.pubDate).toLocaleDateString('es-AR', {
                                                        day: 'numeric',
                                                        month: 'short',
                                                        hour: '2-digit',
                                                        minute: '2-digit'
                                                    })}
                                                </span>
                                            </div>
                                        </div>
                                        <div className="text-text-muted group-hover:text-accent-primary transition-colors">
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                                            </svg>
                                        </div>
                                    </div>
                                </button>
                            ))}
                        </div>

                        {/* Sin resultados */}
                        {searchResults.length === 0 && (
                            <div className="text-center py-16">
                                <div className="w-20 h-20 bg-surface-elevated rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-sm">
                                    <SearchIcon className="w-8 h-8 text-text-muted" />
                                </div>
                                <h3 className="text-xl font-bold text-text-primary mb-2">Sin resultados</h3>
                                <p className="text-text-tertiary">No encontramos noticias con &quot;{globalSearch}&quot;</p>
                            </div>
                        )}
                    </div>
                )}

                {/* Estado inicial - Sin búsqueda */}
                {globalSearch.length === 0 && (
                    <div className="text-center py-16">
                        <div className="w-24 h-24 bg-gradient-to-br from-accent-primary/10 to-accent-secondary/10 rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-lg shadow-accent-primary/10">
                            <SearchIcon className="w-10 h-10 text-accent-primary" />
                        </div>
                        <h3 className="text-2xl font-bold text-text-primary mb-3">Buscá en todas las noticias</h3>
                        <p className="text-text-secondary max-w-md mx-auto">
                            Escribí cualquier palabra clave para buscar en títulos y descripciones de {articles.length} noticias disponibles.
                        </p>

                        {/* Sugerencias rápidas */}
                        <div className="mt-10">
                            <p className="text-xs font-bold text-text-tertiary uppercase tracking-tight mb-4">Búsquedas sugeridas</p>
                            <div className="flex flex-wrap justify-center gap-3">
                                {['Ushuaia', 'clima', 'gobierno', 'deportes', 'economía'].map(suggestion => (
                                    <button
                                        key={suggestion}
                                        onClick={() => setGlobalSearch(suggestion)}
                                        className="px-5 py-2.5 bg-surface-elevated border border-accent-primary/10 rounded-full text-sm font-medium text-text-secondary hover:border-accent-primary/30 hover:text-accent-primary hover:bg-accent-primary/5 transition-all"
                                    >
                                        {suggestion}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
