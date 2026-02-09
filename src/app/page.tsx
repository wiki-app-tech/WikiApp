import Dashboard from '@/components/Dashboard';
import { promises as fs } from 'fs';
import path from 'path';
import type { Article, FeedSource } from '@/types';

export const revalidate = 60; // ISR cada 60 segundos

async function getData() {
  const dataPath = path.join(process.cwd(), 'public/data/articles.json');
  const feedsPath = path.join(process.cwd(), 'public/data/feeds.json');

  try {
    const articlesFile = await fs.readFile(dataPath, 'utf8');
    const feedsFile = await fs.readFile(feedsPath, 'utf8');

    const articlesData = JSON.parse(articlesFile);
    const feedsData = JSON.parse(feedsFile);

    return {
      articles: articlesData.articles.map((a: Article) => ({
        ...a,
        sourceCategory: feedsData.find((f: FeedSource) => f.id === a.sourceId)?.category || 'General'
      })) as Article[],
      feeds: feedsData as FeedSource[]
    };
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
