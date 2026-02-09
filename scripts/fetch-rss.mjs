import Parser from 'rss-parser';
import { promises as fs } from 'fs';
import path from 'path';

const parser = new Parser();

/**
 * Detecta si un texto está en inglés basándose en palabras comunes
 * @param {string} text - Texto a analizar
 * @returns {boolean} - true si parece estar en inglés
 */
function isEnglish(text) {
    if (!text || text.length < 20) return false;

    const englishWords = [
        'the', 'and', 'for', 'are', 'but', 'not', 'you', 'all', 'can', 'had',
        'her', 'was', 'one', 'our', 'out', 'has', 'have', 'been', 'will', 'their',
        'what', 'when', 'who', 'how', 'said', 'each', 'which', 'from', 'they', 'with',
        'this', 'that', 'were', 'being', 'about', 'would', 'could', 'should', 'after',
        'before', 'through', 'between', 'under', 'over', 'into', 'upon', 'during'
    ];

    const spanishWords = [
        'que', 'del', 'los', 'las', 'una', 'con', 'por', 'para', 'esta', 'como',
        'más', 'pero', 'sus', 'fue', 'han', 'ser', 'son', 'entre', 'cuando', 'muy',
        'sobre', 'también', 'desde', 'hasta', 'donde', 'todos', 'este', 'ante'
    ];

    const lowerText = text.toLowerCase();
    const words = lowerText.split(/\s+/);

    let englishCount = 0;
    let spanishCount = 0;

    words.forEach(word => {
        if (englishWords.includes(word)) englishCount++;
        if (spanishWords.includes(word)) spanishCount++;
    });

    // Si hay significativamente más palabras en inglés que en español
    return englishCount > spanishCount && englishCount >= 3;
}

/**
 * Traducciones básicas de palabras comunes inglés -> español
 */
const basicTranslations = {
    // Títulos de noticias comunes
    'breaking': 'última hora',
    'update': 'actualización',
    'news': 'noticias',
    'live': 'en vivo',
    'watch': 'ver',
    'read': 'leer',
    'more': 'más',
    'new': 'nuevo',
    'top': 'principal',
    'latest': 'últimas',
    'exclusive': 'exclusivo',
    'report': 'informe',
    'says': 'dice',
    'said': 'dijo',
    'today': 'hoy',
    'now': 'ahora',
    'just': 'recién',
    'after': 'después de',
    'before': 'antes de',
    'through': 'a través de',
    'with': 'con',
    'from': 'desde',
    'about': 'sobre',
    'against': 'contra',
    'between': 'entre',
    'under': 'bajo',
    'over': 'sobre',
    'president': 'presidente',
    'government': 'gobierno',
    'police': 'policía',
    'court': 'tribunal',
    'judge': 'juez',
    'law': 'ley',
    'case': 'caso',
    'people': 'personas',
    'world': 'mundo',
    'country': 'país',
    'state': 'estado',
    'city': 'ciudad',
    'year': 'año',
    'years': 'años',
    'time': 'tiempo',
    'day': 'día',
    'days': 'días',
    'week': 'semana',
    'month': 'mes',
    'first': 'primero',
    'last': 'último',
    'next': 'próximo',
    'death': 'muerte',
    'life': 'vida',
    'war': 'guerra',
    'peace': 'paz',
    'health': 'salud',
    'economy': 'economía',
    'market': 'mercado',
    'business': 'negocios',
    'company': 'empresa',
    'technology': 'tecnología',
    'science': 'ciencia',
    'climate': 'clima',
    'weather': 'clima',
    'storm': 'tormenta',
    'earthquake': 'terremoto',
    'fire': 'incendio',
    'flood': 'inundación',
    'suspect': 'sospechoso',
    'arrested': 'arrestado',
    'accused': 'acusado',
    'victim': 'víctima',
    'investigation': 'investigación',
    'authorities': 'autoridades',
    'officials': 'funcionarios',
    'announced': 'anunció',
    'confirmed': 'confirmó',
    'revealed': 'reveló',
    'reported': 'reportó',
    'according': 'según',
    'sources': 'fuentes',
    'officials': 'funcionarios'
};

/**
 * Traduce un texto del inglés al español de forma simplificada
 * Nota: Para una traducción más precisa, se recomienda usar una API como LibreTranslate
 * @param {string} text - Texto en inglés
 * @returns {string} - Texto traducido (aproximado)
 */
function translateToSpanish(text) {
    if (!text) return text;

    let translated = text;

    // Reemplazar palabras comunes manteniendo mayúsculas/minúsculas
    Object.entries(basicTranslations).forEach(([en, es]) => {
        // Reemplazo case-insensitive preservando el caso original
        const regex = new RegExp(`\\b${en}\\b`, 'gi');
        translated = translated.replace(regex, (match) => {
            if (match[0] === match[0].toUpperCase()) {
                return es.charAt(0).toUpperCase() + es.slice(1);
            }
            return es;
        });
    });

    return translated;
}

async function fetchFeeds() {
    const feedsPath = path.join(process.cwd(), 'public/data/feeds.json');
    const articlesPath = path.join(process.cwd(), 'public/data/articles.json');

    try {
        const feedsData = JSON.parse(await fs.readFile(feedsPath, 'utf8'));
        const allArticles = [];

        for (const feed of feedsData) {
            console.log(`Obteniendo ${feed.name}...`);
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
                        let title = item.title || '';

                        // Detectar si está en inglés y traducir
                        const titleIsEnglish = isEnglish(title);
                        const contentIsEnglish = isEnglish(fullContent);

                        let originalTitle = null;
                        let originalDescription = null;

                        if (titleIsEnglish) {
                            originalTitle = title;
                            title = translateToSpanish(title);
                            console.log(`  📝 Traducido título: "${originalTitle.substring(0, 50)}..."`);
                        }

                        if (contentIsEnglish && fullContent.length < 500) {
                            // Solo traducir contenidos cortos para evitar errores
                            originalDescription = fullContent;
                            fullContent = translateToSpanish(fullContent);
                        }

                        const article = {
                            id: item.guid || item.link || Math.random().toString(36).substr(2, 9),
                            title: title,
                            description: fullContent,
                            link: item.link,
                            pubDate: item.pubDate || item.isoDate || new Date().toISOString(),
                            sourceId: feed.id,
                            sourceName: feed.name,
                            sourceType: feed.type,
                            thumbnail: item.enclosure?.url || null
                        };

                        // Guardar originales si fueron traducidos
                        if (originalTitle) article.originalTitle = originalTitle;
                        if (originalDescription) article.originalDescription = originalDescription;

                        return article;
                    }).slice(0, 15); // Increased to 15 articles per feed
                }

                allArticles.push(...articles);
            } catch (err) {
                console.error(`Error obteniendo ${feed.name}:`, err.message);
            }
        }

        // Ordenar por fecha de publicación
        allArticles.sort((a, b) => new Date(b.pubDate) - new Date(a.pubDate));

        const result = {
            lastUpdated: new Date().toISOString(),
            articles: allArticles
        };

        await fs.writeFile(articlesPath, JSON.stringify(result, null, 2));
        console.log('¡Feeds actualizados correctamente!');
    } catch (error) {
        console.error('Error principal:', error);
    }
}

fetchFeeds();

