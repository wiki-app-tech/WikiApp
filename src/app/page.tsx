import Dashboard from '@/components/Dashboard';
import { promises as fs } from 'fs';
import path from 'path';
import type { FeedSource } from '@/types';
import { updateAllFeeds } from '@/services/rssService';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

async function getData() {
  const feedsPath = path.join(process.cwd(), 'public/data/feeds.json');

  try {
    const feedsFile = await fs.readFile(feedsPath, 'utf8');

    const feedsData: FeedSource[] = Array.isArray(JSON.parse(feedsFile))
      ? JSON.parse(feedsFile)
      : [];

    if (feedsData.length === 0) {
      return { articles: [], feeds: [] };
    }

    // Fetch directly using the Next.js cached fetches inside rssService
    const articles = await updateAllFeeds(feedsData);

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
