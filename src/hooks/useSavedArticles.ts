'use client';

import { useState, useEffect, useCallback } from 'react';
import type { Article } from '@/types';

export interface SavedArticle extends Article {
    savedAt: string;
    tags: string[];
    notes?: string;
}

interface SavedArticlesData {
    articles: SavedArticle[];
    readArticles: string[]; // IDs of read articles
}

const STORAGE_KEY = 'mediosWikiAppSavedArticles';

export function useSavedArticles() {
    const [savedArticles, setSavedArticles] = useState<SavedArticle[]>([]);
    const [readArticles, setReadArticles] = useState<string[]>([]);
    const [isLoaded, setIsLoaded] = useState(false);

    // Load from localStorage on mount
    useEffect(() => {
        try {
            const stored = localStorage.getItem(STORAGE_KEY);
            if (stored) {
                const data: SavedArticlesData = JSON.parse(stored);
                setSavedArticles(data.articles || []);
                setReadArticles(data.readArticles || []);
            }
        } catch (error) {
            console.error('Error loading saved articles:', error);
        }
        setIsLoaded(true);
    }, []);

    // Save to localStorage whenever data changes
    useEffect(() => {
        if (!isLoaded) return;
        try {
            const data: SavedArticlesData = {
                articles: savedArticles,
                readArticles: readArticles
            };
            localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
        } catch (error) {
            console.error('Error saving articles:', error);
        }
    }, [savedArticles, readArticles, isLoaded]);

    const saveArticle = useCallback((article: Article, tags: string[] = []) => {
        setSavedArticles(prev => {
            // Check if already saved
            if (prev.some(a => a.id === article.id)) {
                return prev;
            }
            const savedArticle: SavedArticle = {
                ...article,
                savedAt: new Date().toISOString(),
                tags
            };
            return [savedArticle, ...prev];
        });
    }, []);

    const unsaveArticle = useCallback((articleId: string) => {
        setSavedArticles(prev => prev.filter(a => a.id !== articleId));
    }, []);

    const isArticleSaved = useCallback((articleId: string) => {
        return savedArticles.some(a => a.id === articleId);
    }, [savedArticles]);

    const toggleSaveArticle = useCallback((article: Article, tags: string[] = []) => {
        if (isArticleSaved(article.id)) {
            unsaveArticle(article.id);
            return false;
        } else {
            saveArticle(article, tags);
            return true;
        }
    }, [isArticleSaved, saveArticle, unsaveArticle]);

    const addTagToArticle = useCallback((articleId: string, tag: string) => {
        setSavedArticles(prev => prev.map(a => {
            if (a.id === articleId && !a.tags.includes(tag)) {
                return { ...a, tags: [...a.tags, tag] };
            }
            return a;
        }));
    }, []);

    const removeTagFromArticle = useCallback((articleId: string, tag: string) => {
        setSavedArticles(prev => prev.map(a => {
            if (a.id === articleId) {
                return { ...a, tags: a.tags.filter(t => t !== tag) };
            }
            return a;
        }));
    }, []);

    const updateArticleNotes = useCallback((articleId: string, notes: string) => {
        setSavedArticles(prev => prev.map(a => {
            if (a.id === articleId) {
                return { ...a, notes };
            }
            return a;
        }));
    }, []);

    const markAsRead = useCallback((articleId: string) => {
        setReadArticles(prev => {
            if (prev.includes(articleId)) return prev;
            return [...prev, articleId];
        });
    }, []);

    const markAsUnread = useCallback((articleId: string) => {
        setReadArticles(prev => prev.filter(id => id !== articleId));
    }, []);

    const isArticleRead = useCallback((articleId: string) => {
        return readArticles.includes(articleId);
    }, [readArticles]);

    const getAllTags = useCallback(() => {
        const tags = new Set<string>();
        savedArticles.forEach(a => a.tags.forEach(t => tags.add(t)));
        return Array.from(tags).sort();
    }, [savedArticles]);

    const getArticlesByTag = useCallback((tag: string) => {
        return savedArticles.filter(a => a.tags.includes(tag));
    }, [savedArticles]);

    return {
        savedArticles,
        readArticles,
        isLoaded,
        saveArticle,
        unsaveArticle,
        isArticleSaved,
        toggleSaveArticle,
        addTagToArticle,
        removeTagFromArticle,
        updateArticleNotes,
        markAsRead,
        markAsUnread,
        isArticleRead,
        getAllTags,
        getArticlesByTag
    };
}
