'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import type { FeedSource } from '@/types';

const STORAGE_KEY = 'mediosWikiAppFollowedFeeds';

export function useFollowedFeeds(allFeeds: FeedSource[]) {
    const [followedFeedIds, setFollowedFeedIds] = useState<string[]>([]);
    const [isLoaded, setIsLoaded] = useState(false);

    // Use ref to avoid re-triggering effect when allFeeds reference changes
    const allFeedsRef = useRef(allFeeds);
    allFeedsRef.current = allFeeds;

    // Load from localStorage ONCE on mount
    useEffect(() => {
        const stored = localStorage.getItem(STORAGE_KEY);
        const validIds = new Set(allFeedsRef.current.map(f => f.id));
        if (stored) {
            try {
                const parsed: string[] = JSON.parse(stored);
                // Keep only IDs that still exist in the current feeds list
                const filtered = parsed.filter(id => validIds.has(id));
                if (filtered.length > 0) {
                    setFollowedFeedIds(filtered);
                } else {
                    // All stored feeds were removed — fall back to first 5
                    const initialIds = allFeedsRef.current.slice(0, 5).map(f => f.id);
                    setFollowedFeedIds(initialIds);
                    localStorage.setItem(STORAGE_KEY, JSON.stringify(initialIds));
                }
            } catch (e) {
                console.error('Error loading followed feeds:', e);
            }
        } else {
            // By default follow first 5 feeds so the UI isn't empty
            const initialIds = allFeedsRef.current.slice(0, 5).map(f => f.id);
            setFollowedFeedIds(initialIds);
            localStorage.setItem(STORAGE_KEY, JSON.stringify(initialIds));
        }
        setIsLoaded(true);
    }, []); // Only run once on mount


    // Persist to localStorage on change
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
