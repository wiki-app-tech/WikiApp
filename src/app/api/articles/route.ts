import { NextResponse } from 'next/server';
import { updateAllFeeds } from '@/services/rssService';
import { promises as fs } from 'fs';
import path from 'path';
import type { FeedSource } from '@/types';

// Force dynamic rendering to ensure real-time news updates
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
    try {
        const feedsPath = path.join(process.cwd(), 'public/data/feeds.json');
        
        let feedsFile = '[]';
        try {
            feedsFile = await fs.readFile(feedsPath, 'utf8');
        } catch (e) {
            console.warn("Could not read feeds.json", e);
        }

        const feedsData: FeedSource[] = Array.isArray(JSON.parse(feedsFile))
            ? JSON.parse(feedsFile)
            : [];

        if (feedsData.length === 0) {
            return NextResponse.json({ articles: [], lastUpdated: new Date().toISOString() });
        }

        // Fetch using the Next.js cached fetches inside rssService
        const articles = await updateAllFeeds(feedsData);

        return NextResponse.json({
            lastUpdated: new Date().toISOString(),
            articles
        });
    } catch (error: any) {
        console.error('Error in /api/articles:', error);
        return NextResponse.json({ error: 'Failed to fetch articles' }, { status: 500 });
    }
}
