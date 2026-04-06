import Dashboard from '@/components/Dashboard';
import { promises as fs } from 'fs';
import path from 'path';
import type { Article, FeedSource } from '@/types';

export const revalidate = 60; // ISR cada 60 segundos

async function getData() {
  const dataPath = path.join(process.cwd(), 'public/data/articles.json');
  const feedsPath = path.join(process.cwd(), 'public/data/feeds.json');

  try {
    const [articlesFile, feedsFile] = await Promise.all([
      fs.readFile(dataPath, 'utf8'),
      fs.readFile(feedsPath, 'utf8'),
    ]);

    const articlesData = JSON.parse(articlesFile);
    const feedsData: FeedSource[] = Array.isArray(JSON.parse(feedsFile))
      ? JSON.parse(feedsFile)
      : [];

    // Build a lookup map O(n) instead of .find() per article O(n*m)
    const feedCategoryMap = new Map<string, string>();
    feedsData.forEach((f: FeedSource) => {
      feedCategoryMap.set(f.id, f.category);
    });

    const articles: Article[] = (articlesData.articles || []).map((a: Article) => ({
      ...a,
      sourceCategory: feedCategoryMap.get(a.sourceId) || 'General',
    }));

    return { articles, feeds: feedsData };
  } catch (error) {
    console.error('Error reading data:', error);
    return { articles: [], feeds: [] };
  }
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
