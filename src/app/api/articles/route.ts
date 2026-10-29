import { NextResponse } from 'next/server';
import { updateAllFeeds, enrichArticleFromOriginLink, fetchFromWebOrigin } from '@/services/rssService';
import { promises as fs } from 'fs';
import path from 'path';
import type { FeedSource, FeedType } from '@/types';

// Force dynamic rendering to ensure real-time news updates directly from origin sites
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const enrichUrl = searchParams.get('originUrl');
        const scopeParam = (searchParams.get('scope') || 'all') as 'provincial' | 'nacional' | 'internacional' | 'all';
        const typesParam = searchParams.get('types'); // e.g., "rss,web,link,instagram,telegram"

        // Si se solicita enriquecer o sincronizar un enlace puntual directamente desde el sitio de origen
        if (enrichUrl) {
            const enriched = await enrichArticleFromOriginLink(enrichUrl);
            return NextResponse.json({
                success: Boolean(enriched),
                originUrl: enrichUrl,
                enriched,
                lastUpdated: new Date().toISOString(),
            });
        }

        const feedsPath = path.join(process.cwd(), 'public/data/feeds.json');
        let feedsFile = '[]';
        try {
            feedsFile = await fs.readFile(feedsPath, 'utf8');
        } catch (e) {
            console.warn('Could not read feeds.json', e);
        }

        const feedsData: FeedSource[] = Array.isArray(JSON.parse(feedsFile))
            ? JSON.parse(feedsFile)
            : [];

        if (feedsData.length === 0) {
            return NextResponse.json({ articles: [], lastUpdated: new Date().toISOString() });
        }

        const onlyTypes = typesParam
            ? typesParam.split(',').map(s => s.trim()).filter(Boolean)
            : undefined;

        const articles = await updateAllFeeds(feedsData, {
            scope: scopeParam,
            onlyTypes,
        });

        return NextResponse.json({
            lastUpdated: new Date().toISOString(),
            scope: scopeParam,
            totalSources: feedsData.length,
            articles,
        });
    } catch (error: any) {
        console.error('Error in /api/articles:', error);
        return NextResponse.json({ error: 'Failed to fetch articles from origin' }, { status: 500 });
    }
}

/**
 * POST /api/articles
 * Permite agregar o sincronizar al instante cualquier fuente web, RSS, enlace directo o red social desde su sitio de origen.
 */
export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { url, name, type = 'web', scope = 'provincial', category = 'noticias' } = body;

        if (!url || typeof url !== 'string') {
            return NextResponse.json({ error: 'URL de origen requerida' }, { status: 400 });
        }

        const tempSource: FeedSource = {
            id: `origin-${Date.now()}`,
            name: name || new URL(url).hostname.replace(/^www\./, ''),
            url,
            originUrl: url,
            type: type as FeedType,
            scope,
            category,
        };

        const scrapedArticles = await fetchFromWebOrigin(tempSource);

        return NextResponse.json({
            success: true,
            originUrl: url,
            lastUpdated: new Date().toISOString(),
            articles: scrapedArticles,
        });
    } catch (error: any) {
        console.error('Error in POST /api/articles:', error);
        return NextResponse.json({ error: 'No se pudo sincronizar el enlace de origen' }, { status: 500 });
    }
}
