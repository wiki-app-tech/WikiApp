import { NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';
import type { Article } from '@/types';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

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
  }
};

async function getArticlesFromFile(): Promise<{ articles: Article[]; rawData: any }> {
  const filePath = path.join(process.cwd(), 'public/data/articles.json');
  const content = await fs.readFile(filePath, 'utf8');
  const data = JSON.parse(content);
  const articlesList: Article[] = Array.isArray(data) ? data : (data.articles || []);
  return { articles: articlesList, rawData: data };
}

// GET /api/instagram - Retorna los posteos más recientes de Instagram ordenados cronológicamente
export async function GET(request: Request) {
  try {
    const { articles } = await getArticlesFromFile();
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
