import Parser from 'rss-parser';
import { promises as fs } from 'fs';
import path from 'path';

const parser = new Parser({
    headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Accept': 'application/rss+xml, application/xml, text/xml, */*'
    },
    timeout: 10000,
});

// ─── Language Detection (optimized with Set lookups - O(1) per word) ───

const ENGLISH_WORDS = new Set([
    'the', 'and', 'for', 'are', 'but', 'not', 'you', 'all', 'can', 'had',
    'her', 'was', 'one', 'our', 'out', 'has', 'have', 'been', 'will', 'their',
    'what', 'when', 'who', 'how', 'said', 'each', 'which', 'from', 'they', 'with',
    'this', 'that', 'were', 'being', 'about', 'would', 'could', 'should', 'after',
    'before', 'through', 'between', 'under', 'over', 'into', 'upon', 'during'
]);

const SPANISH_WORDS = new Set([
    'que', 'del', 'los', 'las', 'una', 'con', 'por', 'para', 'esta', 'como',
    'más', 'pero', 'sus', 'fue', 'han', 'ser', 'son', 'entre', 'cuando', 'muy',
    'sobre', 'también', 'desde', 'hasta', 'donde', 'todos', 'este', 'ante'
]);

function isEnglish(text) {
    if (!text || text.length < 20) return false;
    const words = text.toLowerCase().split(/\s+/);
    let en = 0, es = 0;
    for (const word of words) {
        if (ENGLISH_WORDS.has(word)) en++;
        if (SPANISH_WORDS.has(word)) es++;
    }
    return en > es && en >= 3;
}

// ─── Translation (optimized: pre-compiled regex map) ───

const BASIC_TRANSLATIONS = {
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

// Pre-compile all regex patterns ONCE at startup (not per-article)
const COMPILED_TRANSLATIONS = Object.entries(BASIC_TRANSLATIONS).map(([en, es]) => ({
    regex: new RegExp(`\\b${en}\\b`, 'gi'),
    es,
}));

function translateToSpanish(text) {
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

// ─── Feed Fetching (concurrency-limited parallel fetch) ───

const MAX_CONCURRENT = 5;

async function fetchFeedWithRetry(feed, retries = 1) {
    for (let attempt = 0; attempt <= retries; attempt++) {
        try {
            if (feed.type === 'telegram') {
                return getTelegramDemoArticles(feed);
            }
            const response = await parser.parseURL(feed.url);
            return processRSSItems(response.items, feed);
        } catch (err) {
            if (attempt < retries) {
                console.warn(`  ⚠ Reintento ${attempt + 1} para ${feed.name}...`);
                await new Promise(r => setTimeout(r, 1000));
            } else {
                console.error(`  ❌ Error en ${feed.name}: ${err.message}`);
                return [];
            }
        }
    }
    return [];
}

function getTelegramDemoArticles(feed) {
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
        sourceType: feed.type
    }));
}

function processRSSItems(items, feed) {
    return items.slice(0, 15).map(item => {
        let fullContent = item['content:encoded'] || item.content || item.contentSnippet || '';
        let title = item.title || '';

        const titleIsEnglish = isEnglish(title);
        const contentIsEnglish = isEnglish(fullContent);

        let originalTitle = null;
        let originalDescription = null;

        if (titleIsEnglish) {
            originalTitle = title;
            title = translateToSpanish(title);
        }

        if (contentIsEnglish && fullContent.length < 500) {
            originalDescription = fullContent;
            fullContent = translateToSpanish(fullContent);
        }

        const article = {
            id: item.guid || item.link || Math.random().toString(36).substr(2, 9),
            title,
            description: fullContent,
            link: item.link,
            pubDate: item.pubDate || item.isoDate || new Date().toISOString(),
            sourceId: feed.id,
            sourceName: feed.name,
            sourceType: feed.type,
            thumbnail: item.enclosure?.url || null
        };

        if (originalTitle) article.originalTitle = originalTitle;
        if (originalDescription) article.originalDescription = originalDescription;

        return article;
    });
}

async function fetchFeeds() {
    const feedsPath = path.join(process.cwd(), 'public/data/feeds.json');
    const articlesPath = path.join(process.cwd(), 'public/data/articles.json');

    try {
        const feedsData = JSON.parse(await fs.readFile(feedsPath, 'utf8'));

        // Process feeds in batches of MAX_CONCURRENT for controlled parallelism
        const allArticles = [];
        for (let i = 0; i < feedsData.length; i += MAX_CONCURRENT) {
            const batch = feedsData.slice(i, i + MAX_CONCURRENT);
            console.log(`Procesando lote ${Math.floor(i / MAX_CONCURRENT) + 1}/${Math.ceil(feedsData.length / MAX_CONCURRENT)} (${batch.length} feeds)...`);

            const batchResults = await Promise.allSettled(
                batch.map(feed => {
                    console.log(`  📡 ${feed.name}`);
                    return fetchFeedWithRetry(feed);
                })
            );

            for (const result of batchResults) {
                if (result.status === 'fulfilled' && result.value) {
                    allArticles.push(...result.value);
                }
            }
        }

        // Sort by publication date
        allArticles.sort((a, b) => new Date(b.pubDate) - new Date(a.pubDate));

        const result = {
            lastUpdated: new Date().toISOString(),
            articles: allArticles
        };

        await fs.writeFile(articlesPath, JSON.stringify(result, null, 2));
        console.log(`\n✅ ${allArticles.length} artículos actualizados correctamente!`);
        return true;
    } catch (error) {
        console.error('Error principal en fetch-rss:', error);
        return false;
    }
}

await fetchFeeds();
