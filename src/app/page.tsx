import Dashboard from '@/components/Dashboard';
import { promises as fs } from 'fs';
import path from 'path';
import type { FeedSource, Article } from '@/types';
import { updateAllFeeds } from '@/services/rssService';

// Incremental Static Regeneration (ISR): regenera en segundo plano cada 5 minutos
export const revalidate = 300;

async function getData() {
  const feedsPath = path.join(process.cwd(), 'public/data/feeds.json');
  const articlesPath = path.join(process.cwd(), 'public/data/articles.json');

  let feedsData: FeedSource[] = [];
  try {
    const feedsFile = await fs.readFile(feedsPath, 'utf8');
    feedsData = Array.isArray(JSON.parse(feedsFile)) ? JSON.parse(feedsFile) : [];
  } catch (err) {
    console.error('Error reading feeds.json:', err);
  }

  // 1. Intentar servir inmediatamente desde el cache local (articles.json)
  try {
    const articlesFile = await fs.readFile(articlesPath, 'utf8');
    const parsed = JSON.parse(articlesFile);
    const cachedArticles: Article[] = Array.isArray(parsed) 
      ? parsed 
      : (Array.isArray(parsed?.articles) ? parsed.articles : []);

    if (cachedArticles.length > 0) {
      return { articles: cachedArticles, feeds: feedsData };
    }
  } catch (err) {
    console.warn('articles.json not found or invalid, fetching live feeds as fallback...');
  }

  // 2. Fallback de emergencia si no hay cache local
  try {
    if (feedsData.length > 0) {
      const articles = await updateAllFeeds(feedsData);
      return { articles, feeds: feedsData };
    }
  } catch (error) {
    console.error('Error fetching live feeds:', error);
  }

  return { articles: [], feeds: feedsData };
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
