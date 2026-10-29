import { NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';
import type { Article, FeedSource } from '@/types';
import { fetchSingleFeed } from '@/services/rssService';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

let lastOriginIgSyncMs = 0;
const IG_ORIGIN_SYNC_COOLDOWN_MS = 45 * 1000; // 45 segundos entre consultas en vivo al origen

const ACCOUNT_METADATA: Record<string, { sourceName: string; avatarUrl: string; category: string; defaultLink: string }> = {
  'la_gentetv': {
    sourceName: 'La Gente TV',
    avatarUrl: '/images/instagram/la_gentetv_avatar.jpg',
    category: 'noticias',
    defaultLink: 'https://www.instagram.com/la_gentetv'
  },
  'findelmundo.gob.ar': {
    sourceName: 'Gobierno de Tierra del Fuego',
    avatarUrl: '/images/instagram/findelmundo_avatar.jpg',
    category: 'institucional',
    defaultLink: 'https://www.instagram.com/findelmundo.gob.ar'
  },
  'justiciatdf': {
    sourceName: 'Poder Judicial TDF',
    avatarUrl: '/images/instagram/justiciatdf_avatar.jpg',
    category: 'institucional',
    defaultLink: 'https://www.instagram.com/justiciatdf'
  },
  'informatetdf': {
    sourceName: 'InforMate TDF',
    avatarUrl: '/images/instagram/informatetdf_avatar.jpg',
    category: 'noticias',
    defaultLink: 'https://www.instagram.com/informatetdf'
  },
  'sumemostolhuin': {
    sourceName: 'Sumemos Tolhuin',
    avatarUrl: '/images/instagram/sumemostolhuin_avatar.jpg',
    category: 'comunidad',
    defaultLink: 'https://www.instagram.com/sumemostolhuin'
  }
};

async function getArticlesFromFile(): Promise<{ articles: Article[]; rawData: any }> {
  const filePath = path.join(process.cwd(), 'public/data/articles.json');
  const content = await fs.readFile(filePath, 'utf8');
  const data = JSON.parse(content);
  const articlesList: Article[] = Array.isArray(data) ? data : (data.articles || []);
  return { articles: articlesList, rawData: data };
}

async function syncInstagramSourcesFromOrigin(force = false): Promise<Article[]> {
  const now = Date.now();
  const { articles, rawData } = await getArticlesFromFile();

  if (!force && now - lastOriginIgSyncMs < IG_ORIGIN_SYNC_COOLDOWN_MS) {
    return articles;
  }

  lastOriginIgSyncMs = now;

  try {
    const feedsPath = path.join(process.cwd(), 'public/data/feeds.json');
    const feedsRaw = await fs.readFile(feedsPath, 'utf8');
    const allFeeds: FeedSource[] = JSON.parse(feedsRaw);
    const igFeeds = allFeeds.filter(f => f.type === 'instagram');

    if (igFeeds.length === 0) return articles;

    const settled = await Promise.allSettled(igFeeds.map(f => fetchSingleFeed(f, 0)));
    const freshPosts: Article[] = [];

    for (const res of settled) {
      if (res.status === 'fulfilled' && Array.isArray(res.value)) {
        for (const item of res.value) {
          // Solo inyectar si no es un fallback genérico o si aún no existe en la base
          const cleanUser = (item.username || '').replace(/^@/, '');
          const meta = ACCOUNT_METADATA[cleanUser];
          if (meta && !item.avatarUrl) {
            item.avatarUrl = meta.avatarUrl;
          }
          freshPosts.push(item);
        }
      }
    }

    if (freshPosts.length > 0) {
      const seenKeys = new Set<string>();
      const merged: Article[] = [];

      // Priorizar artículos ya guardados con imágenes locales curadas y sumar cualquier post nuevo del origen
      for (const art of [...articles, ...freshPosts]) {
        const key = `${art.username || art.sourceId}:${art.title.trim().toLowerCase().slice(0, 60)}`;
        if (!seenKeys.has(key)) {
          seenKeys.add(key);
          merged.push(art);
        }
      }

      const filePath = path.join(process.cwd(), 'public/data/articles.json');
      const updatedData = Array.isArray(rawData)
        ? merged
        : { ...rawData, lastUpdated: new Date().toISOString(), articles: merged };

      await fs.writeFile(filePath, JSON.stringify(updatedData, null, 2), 'utf8');
      return merged;
    }
  } catch (e) {
    console.warn('Origin Instagram sync warning:', e);
  }

  return articles;
}

// GET /api/instagram - Sincroniza desde origen y retorna los posteos más recientes de Instagram ordenados cronológicamente
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const force = searchParams.get('force') === '1' || searchParams.get('force') === 'true';

    const articles = await syncInstagramSourcesFromOrigin(force);
    const instagramArticles = articles
      .filter(a => a.sourceType === 'instagram' || a.sourceId?.startsWith('instagram-') || a.id?.startsWith('ig-'))
      .sort((a, b) => new Date(b.pubDate).getTime() - new Date(a.pubDate).getTime());

    return NextResponse.json({
      success: true,
      articles: instagramArticles,
      total: instagramArticles.length,
      lastUpdated: new Date().toISOString()
    });
  } catch (error: any) {
    console.error('Error fetching instagram articles:', error);
    return NextResponse.json(
      { success: false, error: 'No se pudieron cargar los posteos de Instagram' },
      { status: 500 }
    );
  }
}

// POST /api/instagram - Permite sincronizar y publicar un nuevo post automáticamente al publicarse en Instagram
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { username, title, description, thumbnail, link, pubDate } = body;

    if (!username || !title) {
      return NextResponse.json(
        { success: false, error: 'El nombre de usuario (username) y título son obligatorios' },
        { status: 400 }
      );
    }

    const cleanUsername = username.replace(/^@/, '').trim();
    const meta = ACCOUNT_METADATA[cleanUsername] || {
      sourceName: cleanUsername,
      avatarUrl: `https://unavatar.io/instagram/${cleanUsername}`,
      category: 'noticias',
      defaultLink: `https://www.instagram.com/${cleanUsername}`
    };

    const newArticle: Article = {
      id: `ig-${cleanUsername}-${Date.now()}`,
      title: title.trim(),
      description: (description || title).trim(),
      link: link || meta.defaultLink,
      originUrl: link || meta.defaultLink,
      originSyncedAt: new Date().toISOString(),
      thumbnail: thumbnail || meta.avatarUrl,
      avatarUrl: meta.avatarUrl,
      pubDate: pubDate || new Date().toISOString(),
      sourceId: `instagram-${cleanUsername.replace(/[^a-zA-Z0-9]/g, '-')}`,
      sourceName: meta.sourceName,
      sourceType: 'instagram',
      sourceScope: 'provincial',
      sourceCategory: meta.category,
      username: cleanUsername
    };

    const filePath = path.join(process.cwd(), 'public/data/articles.json');
    const { articles, rawData } = await getArticlesFromFile();

    // Prepend new article at index 0 (top priority)
    const updatedArticles = [newArticle, ...articles];

    const updatedData = Array.isArray(rawData)
      ? updatedArticles
      : { ...rawData, lastUpdated: new Date().toISOString(), articles: updatedArticles };

    await fs.writeFile(filePath, JSON.stringify(updatedData, null, 2), 'utf8');

    return NextResponse.json({
      success: true,
      message: `Nuevo post de @${cleanUsername} publicado y sincronizado automáticamente`,
      article: newArticle,
      total: updatedArticles.length
    });
  } catch (error: any) {
    console.error('Error adding instagram post:', error);
    return NextResponse.json(
      { success: false, error: 'Error al sincronizar el post de Instagram' },
      { status: 500 }
    );
  }
}
