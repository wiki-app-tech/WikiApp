export type FeedType = 'rss' | 'instagram' | 'facebook' | 'x';

export interface FeedSource {
  id: string;
  name: string;
  url: string;
  type: FeedType;
  category: string;
}

export interface Article {
  id: string;
  title: string;
  description: string;
  link: string;
  pubDate: string;
  sourceId: string;
  sourceName: string;
  sourceType: FeedType;
}

export interface FeedData {
  lastUpdated: string;
  articles: Article[];
}
