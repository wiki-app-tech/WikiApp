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
                    // Placeholder since it's a private link and needs a bridge
                    articles = [{
                        id: `telegram-${Date.now()}`,
                        title: "Conéctate al canal para ver las últimas noticias",
                        description: "Las noticias de este canal privado se sincronizarán aquí.",
                        link: feed.url,
                        pubDate: new Date().toISOString(),
                        sourceId: feed.id,
                        sourceName: feed.name,
                        sourceType: feed.type
                    }];
                } else {
                    const response = await parser.parseURL(feed.url);
                    articles = response.items.map(item => ({
                        id: item.guid || item.link || Math.random().toString(36).substr(2, 9),
                        title: item.title,
                        description: item.contentSnippet || item.content || '',
                        link: item.link,
                        pubDate: item.pubDate || item.isoDate || new Date().toISOString(),
                        sourceId: feed.id,
                        sourceName: feed.name,
                        sourceType: feed.type
                    })).slice(0, 10);
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
