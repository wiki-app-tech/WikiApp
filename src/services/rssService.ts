import Parser from 'rss-parser';
import { FeedSource, Article } from '@/types';
import { promises as fs } from 'fs';
import path from 'path';

// Omit telegram since it was mocked and rss-parser works differently
const parser = new Parser({
    headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:91.0) Gecko/20100101 Firefox/91.0',
        'Accept': 'application/rss+xml, application/xml, text/xml, */*'
    },
    timeout: 10000,
});

// Translation regex setup
const BASIC_TRANSLATIONS: Record<string, string> = {
    'breaking': 'última hora', 'update': 'actualización', 'news': 'noticias',
    'live': 'en vivo', 'watch': 'ver', 'read': 'leer', 'more': 'más',
    'new': 'nuevo', 'top': 'principal', 'latest': 'últimas',
    'exclusive': 'exclusivo', 'report': 'informe', 'says': 'dice',
    'said': 'dijo', 'today': 'hoy', 'now': 'ahora', 'just': 'recién',
    'after': 'después de', 'before': 'antes de', 'through': 'a través de',
    'with': 'con', 'from': 'desde', 'about': 'sobre', 'against': 'contra',
    'between': 'entre', 'under': 'bajo', 'over': 'sobre',
    'president': 'presidente', 'government': 'gobierno', 'police': 'policía',
    'court': 'tribunal', 'judge': 'juez', 'law': 'ley', 'case': 'caso',
    'people': 'personas', 'world': 'mundo', 'country': 'país',
    'state': 'estado', 'city': 'ciudad', 'year': 'año', 'years': 'años',
    'time': 'tiempo', 'day': 'día', 'days': 'días', 'week': 'semana',
    'month': 'mes', 'first': 'primero', 'last': 'último', 'next': 'próximo',
    'death': 'muerte', 'life': 'vida', 'war': 'guerra', 'peace': 'paz',
    'health': 'salud', 'economy': 'economía', 'market': 'mercado',
    'business': 'negocios', 'company': 'empresa', 'technology': 'tecnología',
    'science': 'ciencia', 'climate': 'clima', 'weather': 'clima',
    'storm': 'tormenta', 'earthquake': 'terremoto', 'fire': 'incendio',
    'flood': 'inundación', 'suspect': 'sospechoso', 'arrested': 'arrestado',
    'accused': 'acusado', 'victim': 'víctima', 'investigation': 'investigación',
    'authorities': 'autoridades', 'officials': 'funcionarios',
    'announced': 'anunció', 'confirmed': 'confirmó', 'revealed': 'reveló',
    'reported': 'reportó', 'according': 'según', 'sources': 'fuentes',
};

const COMPILED_TRANSLATIONS = Object.entries(BASIC_TRANSLATIONS).map(([en, es]) => ({
    regex: new RegExp(`\\b${en}\\b`, 'gi'),
    es,
}));

function translateToSpanish(text: string) {
    if (!text) return text;
    let translated = text;
    for (const { regex, es } of COMPILED_TRANSLATIONS) {
        translated = translated.replace(regex, (match) =>
            match[0] === match[0].toUpperCase()
                ? es.charAt(0).toUpperCase() + es.slice(1)
                : es
        );
    }
    return translated;
}

const ENGLISH_WORDS = new Set(['the', 'and', 'for', 'are', 'but', 'not', 'you', 'all', 'can', 'had', 'her', 'was', 'one', 'our', 'out', 'has', 'have', 'been', 'will', 'their', 'what', 'when', 'who', 'how', 'said', 'each', 'which', 'from', 'they', 'with', 'this', 'that', 'were', 'being', 'about', 'would', 'could', 'should', 'after', 'before', 'through', 'between', 'under', 'over', 'into', 'upon', 'during']);
const SPANISH_WORDS = new Set(['que', 'del', 'los', 'las', 'una', 'con', 'por', 'para', 'esta', 'como', 'más', 'pero', 'sus', 'fue', 'han', 'ser', 'son', 'entre', 'cuando', 'muy', 'sobre', 'también', 'desde', 'hasta', 'donde', 'todos', 'este', 'ante']);

function isEnglish(text: string) {
    if (!text || text.length < 20) return false;
    const words = text.toLowerCase().split(/\s+/);
    let en = 0, es = 0;
    for (const word of words) {
        if (ENGLISH_WORDS.has(word)) en++;
        if (SPANISH_WORDS.has(word)) es++;
    }
    return en > es && en >= 3;
}

function processRSSItems(items: any[], feed: FeedSource): Article[] {
    return items.slice(0, 15).map(item => {
        let fullContent = item['content:encoded'] || item.content || item.contentSnippet || '';
        let title = item.title || '';

        const titleIsEnglish = isEnglish(title);
        const contentIsEnglish = isEnglish(fullContent);

        if (titleIsEnglish) {
            title = translateToSpanish(title);
        }

        if (contentIsEnglish && fullContent.length < 500) {
            fullContent = translateToSpanish(fullContent);
        }

        const article: Article = {
            id: item.guid || item.link || Math.random().toString(36).substr(2, 9),
            title,
            description: fullContent,
            link: item.link,
            pubDate: item.pubDate || item.isoDate || new Date().toISOString(),
            sourceId: feed.id,
            sourceName: feed.name,
            sourceType: feed.type,
            sourceScope: feed.scope,
            sourceCategory: feed.category,
            thumbnail: item.enclosure?.url || undefined
        };

        return article;
    });
}

function getTelegramDemoArticles(feed: FeedSource): Article[] {
    const demoNews = [
        { title: "🚀 Nueva actualización de software disponible", description: "Hemos lanzado una nueva versión con mejoras significativas en rendimiento y seguridad.", pubDate: new Date().toISOString() },
        { title: "🔍 Descubrimiento arqueológico en Egipto", description: "Un equipo de arqueólogos ha hallado una tumba intacta de la dinastía XVIII.", pubDate: new Date(Date.now() - 3600000).toISOString() },
        { title: "📈 El mercado de valores alcanza máximos históricos", description: "Las acciones tecnológicas lideran un rally sin precedentes en Wall Street.", pubDate: new Date(Date.now() - 7200000).toISOString() },
    ];
    return demoNews.map((item, idx) => ({
        id: `telegram-demo-${idx}-${Date.now()}`,
        title: item.title,
        description: item.description,
        link: feed.url,
        pubDate: item.pubDate,
        sourceId: feed.id,
        sourceName: feed.name,
        sourceType: feed.type,
        sourceScope: feed.scope,
        sourceCategory: feed.category
    }));
}

export async function fetchSingleFeed(feed: FeedSource, retries = 1): Promise<Article[]> {
    if (feed.type === 'telegram') {
        return getTelegramDemoArticles(feed);
    }
    for (let attempt = 0; attempt <= retries; attempt++) {
        try {
            // Using parser.parseURL directly because Next.js native fetch sometimes has issues
            // with User-Agent and redirects on specific RSS servers.
            // The Next.js ISR (revalidate) at the route level will cache the computed result.
            const response = await parser.parseURL(feed.url);
            return processRSSItems(response.items, feed);
        } catch (err: any) {
            if (attempt < retries) {
                await new Promise(r => setTimeout(r, 1000));
            } else {
                return [];
            }
        }
    }
    return [];
}

export async function updateAllFeeds(feeds: FeedSource[]): Promise<Article[]> {
    const batchSize = 10;
    const allArticles: Article[] = [];

    // Fetch dynamically but limited to batchSize to avoid too many simultaneous connections
    for (let i = 0; i < feeds.length; i += batchSize) {
        const batch = feeds.slice(i, i + batchSize);
        const results = await Promise.allSettled(batch.map(f => fetchSingleFeed(f)));
        
        for (const result of results) {
            if (result.status === 'fulfilled' && result.value) {
                allArticles.push(...result.value);
            }
        }
    }

    // Sort globally by pubDate descending
    allArticles.sort((a, b) => {
        const dateA = new Date(a.pubDate).getTime();
        const dateB = new Date(b.pubDate).getTime();
        if (isNaN(dateA)) return 1;
        if (isNaN(dateB)) return -1;
        return dateB - dateA;
    });

    // Persist to public/data/articles.json for instant subsequent reads
    if (allArticles.length > 0) {
        try {
            const articlesPath = path.join(process.cwd(), 'public/data/articles.json');
            await fs.writeFile(articlesPath, JSON.stringify({
                lastUpdated: new Date().toISOString(),
                articles: allArticles
            }, null, 2), 'utf8');
        } catch (e) {
            console.warn('Could not persist to articles.json:', e);
        }
    }

    return allArticles;
}
