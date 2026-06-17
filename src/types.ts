export type FeedType = 'rss' | 'instagram' | 'facebook' | 'x' | 'telegram';

export enum NewsCategory {
  INTERNATIONAL = 'Internacionales',
  NATIONAL = 'Nacionales Argentinas',
  SPORTS = 'Deportivos',
  PROVINCIAL = 'Provinciales de Tierra del Fuego',
}

export interface NewsSource {
  name: string;
  url: string;
  logo: string;
  rssUrl?: string;
}

export interface PrintEditionSource {
  name: string;
  logoUrl: string;
  url: string;
}

export interface FeedSource {
  id: string;
  name: string;
  url: string;
  type: FeedType;
  scope: 'internacional' | 'nacional' | 'provincial';
  category: string;
}

export interface Article {
  id: string;
  title: string;
  description: string;
  link: string;
  thumbnail?: string;
  pubDate: string;
  sourceId: string;
  sourceName: string;
  sourceType: FeedType;
  sourceScope: 'internacional' | 'nacional' | 'provincial';
  sourceCategory?: string;
}

export interface FeedData {
  lastUpdated: string;
  articles: Article[];
}

export interface DailyForecast {
  date: string;
  dayOfWeek: string;
  maxTemp: string;
  minTemp: string;
  weatherCode: string;
}

export interface WeatherData {
  city: string;
  temp: string;
  description: string;
  weatherCode: string;
  forecast: DailyForecast[];
}

export type RouteStatus = 'Transitable' | 'Transitable con precaución' | 'Intransitable';

export interface RouteInfo {
  section: string;
  status: RouteStatus;
  details: string;
}

export type FlightStatus = 'En Horario' | 'Aterrizado' | 'Demorado' | 'Partió';

export interface FlightInfo {
  airline: string;
  flightNumber: string;
  origin: string;
  destination: string;
  time: string;
  status: FlightStatus;
}

export type Trend = 'up' | 'down' | 'stable';

export interface EconomicIndicator {
  title: string;
  value: string;
  period: string;
  trend: Trend;
  description: string;
  isPositiveTrend: boolean;
}

export interface RadioStation {
  name: string;
  city: string;
  frequency: string;
  logoUrl: string;
  streamUrl: string;
}

export interface LiveCamera {
  location: string;
  embedUrl: string;
}
