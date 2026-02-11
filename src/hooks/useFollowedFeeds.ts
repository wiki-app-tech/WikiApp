'use client';

import { useState, useEffect, useCallback } from 'react';
import type { FeedSource } from '@/types';

const STORAGE_KEY = 'mediosWikiAppFollowedFeeds';

export function useFollowedFeeds(allFeeds: FeedSource[]) {
    const [followedFeedIds, setFollowedFeedIds] = useState<string[]>([]);
    const [isLoaded, setIsLoaded] = useState(false);

    // Cargar desde localStorage al montar
    useEffect(() => {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
            try {
                setFollowedFeedIds(JSON.parse(stored));
            } catch (e) {
                console.error('Error loading followed feeds:', e);
            }
        } else {
            // Por defecto, seguimos todos los feeds para que no aparezca vacío la primera vez
            const initialIds = allFeeds.slice(0, 5).map(f => f.id);
            setFollowedFeedIds(initialIds);
            localStorage.setItem(STORAGE_KEY, JSON.stringify(initialIds));
        }
        setIsLoaded(true);
    }, [allFeeds]);

    // Guardar en localStorage cuando cambie
    useEffect(() => {
        if (isLoaded) {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(followedFeedIds));
        }
    }, [followedFeedIds, isLoaded]);

    const followFeed = useCallback((id: string) => {
        setFollowedFeedIds(prev => prev.includes(id) ? prev : [...prev, id]);
    }, []);

    const unfollowFeed = useCallback((id: string) => {
        setFollowedFeedIds(prev => prev.filter(fid => fid !== id));
    }, []);

    const isFollowing = useCallback((id: string) => {
        return followedFeedIds.includes(id);
    }, [followedFeedIds]);

    const followedFeeds = allFeeds.filter(f => followedFeedIds.includes(f.id));

    return {
        followedFeeds,
        followedFeedIds,
        followFeed,
        unfollowFeed,
        isFollowing,
        isLoaded
    };
}
