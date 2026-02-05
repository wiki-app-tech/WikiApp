import Parser from 'rss-parser';
import { promises as fs } from 'fs';
import path from 'path';

const parser = new Parser();

async function fetchFeeds() {
    const feedsPath = path.join(process.cwd(), 'public/data/feeds.json');
    const articlesPath = path.join(process.cwd(), 'public/data/articles.json');

    try {
        const feedsData = JSON.parse(await fs.readFile(feedsPath, 'utf8'));
        const allArticles = [];

        for (const feed of feedsData) {
            console.log(`Fetching ${feed.name}...`);
            try {
                let articles = [];
                if (feed.type === 'telegram') {
                    // Demo data for private Telegram channels
                    const demoNews = [
                        {
                            title: "🚀 Nueva actualización de software disponible",
                            description: "Hemos lanzado una nueva versión con mejoras significativas en rendimiento y seguridad. La actualización incluye parches para vulnerabilidades críticas detectadas recientemente.",
                            pubDate: new Date().toISOString()
                        },
                        {
                            title: "🔍 Descubrimiento arqueológico en Egipto",
                            description: "Un equipo de arqueólogos ha hallado una tumba intacta de la dinastía XVIII. El hallazgo promete revelar nuevos secretos sobre la vida cotidiana en el antiguo Egipto.",
                            pubDate: new Date(Date.now() - 3600000).toISOString()
                        },
                        {
                            title: "📈 El mercado de valores alcanza máximos históricos",
                            description: "Las acciones tecnológicas lideran un rally sin precedentes en Wall Street. Expertos atribuyen este crecimiento a los sólidos reportes de ganancias del último trimestre.",
                            pubDate: new Date(Date.now() - 7200000).toISOString()
                        }
                    ];

                    articles = demoNews.map((item, idx) => ({
                        id: `telegram-demo-${idx}-${Date.now()}`,
                        title: item.title,
                        description: item.description,
                        link: feed.url,
                        pubDate: item.pubDate,
                        sourceId: feed.id,
                        sourceName: feed.name,
                        sourceType: feed.type
                    }));
                } else {
                    const response = await parser.parseURL(feed.url);
                    articles = response.items.map(item => {
                        // Extract most complete content
                        let fullContent = item['content:encoded'] || item.content || item.contentSnippet || '';

                        // Sanitize content minimally for the JSON but keep structure
                        // We will handle the heavy cleaning in the UI for safety

                        return {
                            id: item.guid || item.link || Math.random().toString(36).substr(2, 9),
                            title: item.title,
                            description: fullContent,
                            link: item.link,
                            pubDate: item.pubDate || item.isoDate || new Date().toISOString(),
                            sourceId: feed.id,
                            sourceName: feed.name,
                            sourceType: feed.type,
                            thumbnail: item.enclosure?.url || null
                        };
                    }).slice(0, 15); // Increased to 15 articles per feed
                }

                allArticles.push(...articles);
            } catch (err) {
                console.error(`Error fetching ${feed.name}:`, err.message);
            }
        }

        // Ordenar por fecha de publicación
        allArticles.sort((a, b) => new Date(b.pubDate) - new Date(a.pubDate));

        const result = {
            lastUpdated: new Date().toISOString(),
            articles: allArticles
        };

        await fs.writeFile(articlesPath, JSON.stringify(result, null, 2));
        console.log('Feeds updated successfully!');
    } catch (error) {
        console.error('Core error:', error);
    }
}

fetchFeeds();
