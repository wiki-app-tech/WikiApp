import Dashboard from '@/components/Dashboard';
import { promises as fs } from 'fs';
import path from 'path';
import type { FeedSource, Article } from '@/types';
import { updateAllFeeds } from '@/services/rssService';

// Incremental Static Regeneration (ISR): regenera desde los sitios de origen cada 3 minutos
export const revalidate = 180;

const CACHE_MAX_AGE_MS = 3 * 60 * 1000; // 3 minutos

async function getData() {
  const feedsPath = path.join(process.cwd(), 'public/data/feeds.json');
  const articlesPath = path.join(process.cwd(), 'public/data/articles.json');

  let feedsData: FeedSource[] = [];
  try {
    const feedsFile = await fs.readFile(feedsPath, 'utf8');
    const parsedFeeds = JSON.parse(feedsFile);
    feedsData = Array.isArray(parsedFeeds) ? parsedFeeds : [];
  } catch (err) {
    console.error('Error reading feeds.json:', err);
  }

  let cachedArticles: Article[] = [];
  let isCacheStale = true;

  try {
    const articlesFile = await fs.readFile(articlesPath, 'utf8');
    const parsed = JSON.parse(articlesFile);
    cachedArticles = Array.isArray(parsed)
      ? parsed
      : (Array.isArray(parsed?.articles) ? parsed.articles : []);

    if (parsed?.lastUpdated) {
      const ageMs = Date.now() - new Date(parsed.lastUpdated).getTime();
      if (!isNaN(ageMs) && ageMs < CACHE_MAX_AGE_MS) {
        isCacheStale = false;
      }
    }
  } catch {
    console.warn('articles.json not found or invalid, fetching live feeds from origin...');
  }

  // Si el caché tiene más de 3 minutos o está vacío, disparamos actualización automática desde los sitios de origen
  if (feedsData.length > 0 && (cachedArticles.length === 0 || isCacheStale)) {
    if (cachedArticles.length === 0) {
      try {
        const freshArticles = await updateAllFeeds(feedsData, { scope: 'provincial' });
        return { articles: freshArticles, feeds: feedsData };
      } catch (error) {
        console.error('Error fetching initial origin feeds:', error);
      }
    } else {
      // Refresco asíncrono en segundo plano desde los sitios de origen para no bloquear el render inicial
      updateAllFeeds(feedsData, { scope: 'provincial' }).catch(err =>
        console.warn('Background origin sync warning:', err)
      );
    }
  }

  return { articles: cachedArticles, feeds: feedsData };
}

export default async function Page() {
  const data = await getData();

  return (
    <Dashboard
      initialArticles={data.articles}
      feeds={data.feeds}
    />
  );
}
