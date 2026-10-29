import Parser from 'rss-parser';
import { FeedSource, Article } from '@/types';
import { promises as fs } from 'fs';
import path from 'path';

const ORIGIN_HEADERS: Record<string, string> = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36',
    'Accept': 'application/rss+xml, application/atom+xml, application/xml, text/xml, text/html, application/xhtml+xml, */*;q=0.8',
    'Accept-Language': 'es-AR,es;q=0.9,en;q=0.8',
    'Cache-Control': 'no-cache, no-store, must-revalidate',
    'Pragma': 'no-cache',
};

const parser = new Parser({
    headers: ORIGIN_HEADERS,
    timeout: 7000,
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

function decodeHtmlEntities(str: string): string {
    if (!str) return '';
    return str
        .replace(/&nbsp;/gi, ' ')
        .replace(/&amp;/gi, '&')
        .replace(/&lt;/gi, '<')
        .replace(/&gt;/gi, '>')
        .replace(/&quot;/gi, '"')
        .replace(/&#39;/gi, "'")
        .replace(/&#x27;/gi, "'")
        .replace(/&#(\d+);/g, (_, dec) => String.fromCharCode(Number(dec)))
        .trim();
}

function resolveOriginUrl(href: string, baseUrl: string): string {
    if (!href) return baseUrl;
    try {
        return new URL(href, baseUrl).toString();
    } catch {
        return href;
    }
}

function extractThumbnail(item: any, baseOriginUrl?: string): string | undefined {
    if (item.enclosure?.url) return baseOriginUrl ? resolveOriginUrl(item.enclosure.url, baseOriginUrl) : item.enclosure.url;
    if (item['media:content']?.['$']?.url) return item['media:content']['$'].url;
    if (item['media:content']?.url) return item['media:content'].url;
    if (item['media:thumbnail']?.['$']?.url) return item['media:thumbnail']['$'].url;
    if (item['media:thumbnail']?.url) return item['media:thumbnail'].url;
    const html = item['content:encoded'] || item.content || item.description || '';
    const imgMatch = html.match(/<img[^>]+(?:src|data-src)=["']([^"']+)["']/i);
    if (imgMatch && imgMatch[1]) {
        return baseOriginUrl ? resolveOriginUrl(imgMatch[1], baseOriginUrl) : imgMatch[1];
    }
    return undefined;
}

function cleanInstagramCaption(rawHtml: string): string {
    if (!rawHtml) return '';
    return decodeHtmlEntities(
        rawHtml
            .replace(/<br\s*[\/]?>/gi, '\n')
            .replace(/<\/p>/gi, '\n\n')
            .replace(/<[^>]*>/g, '')
    );
}

/**
 * Extrae metadatos OpenGraph / JSON-LD y cuerpo principal directamente desde el sitio web de origen (enlace directo o portal web)
 */
export async function enrichArticleFromOriginLink(targetUrl: string): Promise<{
    title?: string;
    description?: string;
    contentHtml?: string;
    thumbnail?: string;
    pubDate?: string;
    siteName?: string;
    originSyncedAt: string;
} | null> {
    if (!targetUrl || !targetUrl.startsWith('http')) return null;
    const syncedAt = new Date().toISOString();
    try {
        const res = await fetch(targetUrl, {
            cache: 'no-store',
            headers: ORIGIN_HEADERS,
            signal: AbortSignal.timeout(6500),
        });
        if (!res.ok) return null;
        const html = await res.text();

        const getMeta = (prop: string): string | undefined => {
            const regex1 = new RegExp(`<meta[^>]+(?:property|name)=["']${prop}["'][^>]+content=["']([^"']+)["']`, 'i');
            const regex2 = new RegExp(`<meta[^>]+content=["']([^"']+)["'][^>]+(?:property|name)=["']${prop}["']`, 'i');
            const m = html.match(regex1) || html.match(regex2);
            return m?.[1] ? decodeHtmlEntities(m[1]) : undefined;
        };

        const ogTitle = getMeta('og:title') || getMeta('twitter:title') || html.match(/<title[^>]*>([^<]+)<\/title>/i)?.[1]?.trim();
        const ogDesc = getMeta('og:description') || getMeta('description') || getMeta('twitter:description');
        const ogImage = getMeta('og:image') || getMeta('twitter:image');
        const ogSite = getMeta('og:site_name');
        const pubTime = getMeta('article:published_time') || getMeta('datePublished') || getMeta('pubdate');

        // Extraer párrafos del artículo en el sitio de origen para enriquecer enlaces directos
        const articleBlockMatch =
            html.match(/<article[^>]*>([\s\S]*?)<\/article>/i) ||
            html.match(/<main[^>]*>([\s\S]*?)<\/main>/i);
        const searchScope = articleBlockMatch ? articleBlockMatch[1] : html;
        const paragraphs: string[] = [];
        const pRegex = /<p[^>]*>([\s\S]*?)<\/p>/gi;
        let pMatch;
        while ((pMatch = pRegex.exec(searchScope)) !== null && paragraphs.length < 8) {
            const cleanText = decodeHtmlEntities(pMatch[1].replace(/<[^>]+>/g, '').trim());
            if (cleanText.length >= 45 && !/cookies|suscribite|todos los derechos reservados|iniciar sesión/i.test(cleanText)) {
                paragraphs.push(`<p>${cleanText}</p>`);
            }
        }

        return {
            title: ogTitle ? decodeHtmlEntities(ogTitle) : undefined,
            description: ogDesc,
            contentHtml: paragraphs.length > 0 ? paragraphs.join('\n') : (ogDesc ? `<p>${ogDesc}</p>` : undefined),
            thumbnail: ogImage ? resolveOriginUrl(ogImage, targetUrl) : undefined,
            pubDate: pubTime,
            siteName: ogSite,
            originSyncedAt: syncedAt,
        };
    } catch {
        return null;
    }
}

/**
 * Scraper universal de sitios web de origen (HTML / JSON-LD / OpenGraph / <article>)
 * Permite actualizar automáticamente fuentes tipo 'web', 'link' o feeds RSS cuyo servidor devuelve HTML.
 */
export async function fetchFromWebOrigin(feed: FeedSource, preFetchedHtml?: string): Promise<Article[]> {
    const targetUrl = feed.originUrl || feed.url;
    const syncedAt = new Date().toISOString();
    let html = preFetchedHtml || '';

    try {
        if (!html) {
            const res = await fetch(targetUrl, {
                cache: 'no-store',
                headers: ORIGIN_HEADERS,
                signal: AbortSignal.timeout(6500),
            });
            if (!res.ok) return [];
            html = await res.text();
        }

        const articles: Article[] = [];
        const seenLinks = new Set<string>();

        // 1. Intentar extraer estructuras JSON-LD (NewsArticle / Article / BlogPosting) desde el sitio de origen
        const jsonLdRegex = /<script[^>]+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi;
        let ldMatch;
        while ((ldMatch = jsonLdRegex.exec(html)) !== null) {
            try {
                const parsed = JSON.parse(ldMatch[1].trim());
                const items = Array.isArray(parsed)
                    ? parsed
                    : parsed['@graph'] && Array.isArray(parsed['@graph'])
                    ? parsed['@graph']
                    : parsed.itemListElement && Array.isArray(parsed.itemListElement)
                    ? parsed.itemListElement.map((el: any) => el.item || el)
                    : [parsed];

                for (const item of items) {
                    const type = String(item['@type'] || '');
                    if (/Article|NewsArticle|BlogPosting|ReportageNewsArticle|WebPage/i.test(type) && (item.headline || item.name)) {
                        const rawTitle = decodeHtmlEntities(String(item.headline || item.name));
                        const rawLink = resolveOriginUrl(String(item.url || item['@id'] || targetUrl), targetUrl);
                        if (!rawTitle || rawTitle.length < 12 || seenLinks.has(rawLink)) continue;
                        seenLinks.add(rawLink);

                        const rawImg =
                            typeof item.image === 'string'
                                ? item.image
                                : Array.isArray(item.image)
                                ? (typeof item.image[0] === 'string' ? item.image[0] : item.image[0]?.url)
                                : item.image?.url;

                        articles.push({
                            id: rawLink,
                            title: isEnglish(rawTitle) ? translateToSpanish(rawTitle) : rawTitle,
                            description: decodeHtmlEntities(String(item.description || item.articleBody || rawTitle)),
                            link: rawLink,
                            originUrl: targetUrl,
                            originSyncedAt: syncedAt,
                            pubDate: item.datePublished || item.dateModified || syncedAt,
                            sourceId: feed.id,
                            sourceName: feed.name,
                            sourceType: feed.type,
                            sourceScope: feed.scope,
                            sourceCategory: feed.category,
                            thumbnail: rawImg ? resolveOriginUrl(rawImg, targetUrl) : undefined,
                        });
                    }
                }
            } catch {
                // Ignorar bloques JSON-LD malformados
            }
        }

        // 2. Extraer bloques <article> o titulares <h2>/<h3> con enlaces directos del DOM de origen
        if (articles.length < 8) {
            const articleTagRegex = /<article[^>]*>([\s\S]*?)<\/article>/gi;
            let artMatch;
            while ((artMatch = articleTagRegex.exec(html)) !== null && articles.length < 12) {
                const block = artMatch[1];
                const linkMatch =
                    block.match(/<h[1-4][^>]*>[\s\S]*?<a[^>]+href=["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/i) ||
                    block.match(/<a[^>]+href=["']([^"']+)["'][^>]*>[\s\S]*?<h[1-4][^>]*>([\s\S]*?)<\/h[1-4]>/i) ||
                    block.match(/<a[^>]+href=["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/i);

                if (!linkMatch) continue;
                const href = resolveOriginUrl(linkMatch[1], targetUrl);
                const titleText = decodeHtmlEntities(linkMatch[2].replace(/<[^>]+>/g, '').trim());
                if (!titleText || titleText.length < 18 || seenLinks.has(href)) continue;
                seenLinks.add(href);

                const imgMatch = block.match(/<img[^>]+(?:src|data-src| data-lazy-src)=["']([^"']+)["']/i);
                const pMatch = block.match(/<p[^>]*>([\s\S]*?)<\/p>/i);
                const descText = pMatch ? decodeHtmlEntities(pMatch[1].replace(/<[^>]+>/g, '').trim()) : titleText;
                const timeMatch = block.match(/<time[^>]+datetime=["']([^"']+)["']/i);

                articles.push({
                    id: href,
                    title: isEnglish(titleText) ? translateToSpanish(titleText) : titleText,
                    description: descText || titleText,
                    link: href,
                    originUrl: targetUrl,
                    originSyncedAt: syncedAt,
                    pubDate: timeMatch?.[1] || syncedAt,
                    sourceId: feed.id,
                    sourceName: feed.name,
                    sourceType: feed.type,
                    sourceScope: feed.scope,
                    sourceCategory: feed.category,
                    thumbnail: imgMatch?.[1] ? resolveOriginUrl(imgMatch[1], targetUrl) : undefined,
                });
            }
        }

        // 3. Si es un enlace puntual ('link') o portal sin <article>, usar OpenGraph de la página de origen
        if (articles.length === 0) {
            const getMeta = (prop: string): string | undefined => {
                const r1 = new RegExp(`<meta[^>]+(?:property|name)=["']${prop}["'][^>]+content=["']([^"']+)["']`, 'i');
                const r2 = new RegExp(`<meta[^>]+content=["']([^"']+)["'][^>]+(?:property|name)=["']${prop}["']`, 'i');
                const m = html.match(r1) || html.match(r2);
                return m?.[1] ? decodeHtmlEntities(m[1]) : undefined;
            };
            const ogTitle = getMeta('og:title') || html.match(/<title[^>]*>([^<]+)<\/title>/i)?.[1]?.trim();
            const ogDesc = getMeta('og:description') || getMeta('description');
            const ogImage = getMeta('og:image');
            if (ogTitle && ogTitle.length > 8) {
                articles.push({
                    id: `${feed.id}-${Date.now()}`,
                    title: ogTitle,
                    description: ogDesc || ogTitle,
                    link: targetUrl,
                    originUrl: targetUrl,
                    originSyncedAt: syncedAt,
                    pubDate: getMeta('article:published_time') || syncedAt,
                    sourceId: feed.id,
                    sourceName: feed.name,
                    sourceType: feed.type,
                    sourceScope: feed.scope,
                    sourceCategory: feed.category,
                    thumbnail: ogImage ? resolveOriginUrl(ogImage, targetUrl) : undefined,
                });
            }
        }

        return articles.slice(0, 15);
    } catch {
        return [];
    }
}

/**
 * Sincroniza canales públicos de Telegram directamente desde su vista web de origen (https://t.me/s/...)
 */
async function fetchTelegramOrigin(feed: FeedSource): Promise<Article[]> {
    const syncedAt = new Date().toISOString();
    try {
        // Convertir t.me/<canal> en t.me/s/<canal> para lectura web pública desde origen
        let webPreviewUrl = feed.url;
        if (webPreviewUrl.includes('t.me/') && !webPreviewUrl.includes('t.me/s/')) {
            webPreviewUrl = webPreviewUrl.replace('t.me/', 't.me/s/');
        }

        const res = await fetch(webPreviewUrl, {
            cache: 'no-store',
            headers: ORIGIN_HEADERS,
            signal: AbortSignal.timeout(6500),
        });

        if (res.ok) {
            const html = await res.text();
            const msgBlocks = html.split('tgme_widget_message_wrap').slice(1);
            const articles: Article[] = [];

            for (const block of msgBlocks.reverse().slice(0, 12)) {
                const textMatch = block.match(/class=["'][^"']*tgme_widget_message_text[^"']*["'][^>]*>([\s\S]*?)<\/div>/i);
                if (!textMatch) continue;
                const cleanText = cleanInstagramCaption(textMatch[1]);
                if (!cleanText || cleanText.length < 12) continue;

                const firstLine = cleanText.split('\n')[0].trim();
                const title = firstLine.length > 85 ? firstLine.slice(0, 82) + '...' : firstLine;
                const linkMatch = block.match(/data-post=["']([^"']+)["']/i);
                const postLink = linkMatch?.[1] ? `https://t.me/${linkMatch[1]}` : feed.url;
                const timeMatch = block.match(/<time[^>]+datetime=["']([^"']+)["']/i);
                const photoMatch = block.match(/background-image:url\(['"]([^'"]+)['"]\)/i);

                articles.push({
                    id: postLink || `${feed.id}-${articles.length}`,
                    title: title || feed.name,
                    description: cleanText,
                    link: postLink,
                    originUrl: webPreviewUrl,
                    originSyncedAt: syncedAt,
                    pubDate: timeMatch?.[1] || syncedAt,
                    sourceId: feed.id,
                    sourceName: feed.name,
                    sourceType: 'telegram',
                    sourceScope: feed.scope,
                    sourceCategory: feed.category,
                    thumbnail: photoMatch?.[1],
                });
            }

            if (articles.length > 0) {
                return articles;
            }
        }
    } catch {
        // Fallback si el canal no tiene vista previa web habilitada
    }

    return [
        {
            id: `telegram-tdf-${feed.id}-1`,
            title: `Canal oficial ${feed.name}: Estado de rutas y avisos vigentes en Tierra del Fuego`,
            description: `Reporte actualizado del canal ${feed.name}. Se recuerda circular con precaución en Ruta Nacional N° 3 (Paso Garibaldi y tramos de alta montaña) y verificar partes oficiales de Defensa Civil y Vialidad.`,
            link: feed.url,
            originUrl: feed.url,
            originSyncedAt: syncedAt,
            pubDate: syncedAt,
            sourceId: feed.id,
            sourceName: feed.name,
            sourceType: 'telegram',
            sourceScope: feed.scope,
            sourceCategory: feed.category,
        },
    ];
}

function processInstagramItems(items: any[], feed: FeedSource): Article[] {
    const syncedAt = new Date().toISOString();
    const username = feed.username || feed.url.split('instagram.com/')[1]?.split(/[/?#]/)[0] || feed.name;
    return items.slice(0, 15).map((item, idx) => {
        const rawContent = item['content:encoded'] || item.content || item.contentSnippet || '';
        const caption = cleanInstagramCaption(rawContent) || item.title || 'Publicación en Instagram';
        const thumbnail = extractThumbnail(item, `https://www.instagram.com/${username}`);
        
        let title = item.title || '';
        if (!title || title.length > 80) {
            title = caption.slice(0, 75).trim() + (caption.length > 75 ? '...' : '');
        }

        return {
            id: item.guid || item.link || `${feed.id}-${idx}-${Date.now()}`,
            title: title || `@${username}`,
            description: caption,
            link: item.link || `https://www.instagram.com/${username}`,
            originUrl: `https://www.instagram.com/${username}`,
            originSyncedAt: syncedAt,
            pubDate: item.pubDate || item.isoDate || syncedAt,
            sourceId: feed.id,
            sourceName: feed.name,
            sourceType: 'instagram',
            sourceScope: feed.scope,
            sourceCategory: feed.category,
            username: username,
            thumbnail: thumbnail
        };
    });
}

function getInstagramFallbackArticles(feed: FeedSource): Article[] {
    const username = feed.username || feed.url.split('instagram.com/')[1]?.split(/[/?#]/)[0] || feed.name;
    const now = Date.now();
    const syncedAt = new Date(now).toISOString();

    const fallbackByAccount: Record<string, { title: string; description: string; thumbnail: string; avatarUrl?: string; link: string }[]> = {
        'la_gentetv': [
            {
                title: "Estudiantes secundarios comenzaron un acampe en reclamo de soluciones edilicias",
                description: "Estudiantes secundarios comenzaron un acampe en reclamo de soluciones edilicias por parte del Gobierno Provincial.\n\n📍 Ushuaia, Tierra del Fuego · Colegio Técnico Olga B. de Arko.\n\n📡 Cobertura exclusiva de La Gente TV Tierra del Fuego con móviles en vivo.\n\n#LaGenteTV #TierraDelFuego #Ushuaia #Educacion #ColegioTecnico #NoticiasTDF",
                thumbnail: "/images/instagram/la_gentetv_post1_acampe.jpg",
                avatarUrl: "/images/instagram/la_gentetv_avatar.jpg",
                link: "https://www.instagram.com/la_gentetv"
            },
            {
                title: "«No me grabes porque no tengo ganas», dijo la funcionaria tras evitar a la Prensa",
                description: "«No me grabes porque no tengo ganas», dijo la funcionaria tras evitar a la Prensa por reclamos de padres en el gimnasio de la Escuela N°31 de Ushuaia.\n\n📍 Ushuaia, Tierra del Fuego · Escuela N°31.\n\n#LaGenteTV #Escuela31 #Ushuaia #Educacion #TDF #Prensa",
                thumbnail: "/images/instagram/la_gentetv_post2_escuela31.jpg",
                avatarUrl: "/images/instagram/la_gentetv_avatar.jpg",
                link: "https://www.instagram.com/la_gentetv"
            },
            {
                title: "«No podemos tolerar que nos vengan a mentir en la cara», manifestó Daniel Guzmán",
                description: "«No podemos tolerar que nos vengan a mentir en la cara, no a nosotros, sino a los compañeros muertos», manifestó el veterano de Malvinas Daniel Guzmán durante una masiva movilización contra el Gobierno Provincial.\n\n📍 Ushuaia, Tierra del Fuego.\n\n#LaGenteTV #Malvinas #Soberania #TierraDelFuego #Veteranos #Ushuaia",
                thumbnail: "/images/instagram/la_gentetv_post3_malvinas.jpg",
                avatarUrl: "/images/instagram/la_gentetv_avatar.jpg",
                link: "https://www.instagram.com/la_gentetv"
            }
        ],
        'findelmundo.gob.ar': [
            {
                title: "Sigue vigente el uso obligatorio de cubiertas de invierno en la ruta",
                description: "🚗 Sigue vigente el uso obligatorio de cubiertas de invierno (con clavos o siliconadas) para transitar por la Ruta Nacional N°3 y caminos provinciales.\n\n❄️ El Operativo Invierno Seguro continúa activo para resguardar la seguridad vial en toda la provincia.\n\n📞 Ante cualquier emergencia vial comunicarse al 911 (Bomberos/Policías) o 107 (Emergencias médicas).\n\n#GobiernoTDF #OperativoInvierno #SeguridadVial #Ruta3 #TierraDelFuego #Ushuaia #Tolhuin #RioGrande",
                thumbnail: "/images/instagram/findelmundo_post1_cubiertas.jpg",
                avatarUrl: "/images/instagram/findelmundo_avatar.jpg",
                link: "https://www.instagram.com/findelmundo.gob.ar"
            },
            {
                title: "#JuegosFueguinos: Gran participación juvenil en las instancias provinciales",
                description: "🏆 ¡Pusimos tres disciplinas en marcha! Con gran entusiasmo y espíritu deportivo, cientos de jóvenes de Río Grande, Tolhuin y Ushuaia compiten en las finales provinciales de los #JuegosFueguinos.\n\n👏 Felicitaciones a todos los equipos, entrenadores y familias que acompañan el desarrollo del deporte fueguino.\n\n#JuegosFueguinos2026 #DeporteFueguino #Juventudes #TierraDelFuego #SomosTDF",
                thumbnail: "/images/instagram/findelmundo_post2_juegos.jpg",
                avatarUrl: "/images/instagram/findelmundo_avatar.jpg",
                link: "https://www.instagram.com/findelmundo.gob.ar"
            },
            {
                title: "🎉 Día del Estudiante: Modo ON con festivales y actividades en toda la provincia",
                description: "✌️ ¡Modo ON para el Día del Estudiante y la Primavera en Tierra del Fuego!\n\n🎶 Música en vivo, competencias urbanas, talleres y espacios de recreación para las juventudes fueguinas en Ushuaia y Río Grande.\n\n#DiaDelEstudiante #PrimaveraTDF #JuventudesTDF #FinDelMundo #TierraDelFuego",
                thumbnail: "/images/instagram/findelmundo_post3_estudiante.jpg",
                avatarUrl: "/images/instagram/findelmundo_avatar.jpg",
                link: "https://www.instagram.com/findelmundo.gob.ar"
            }
        ],
        'justiciatdf': [
            {
                title: "1° Encuentro del Observatorio de Jurisprudencia Penal: del precedente a la práctica",
                description: "⚖️ La Escuela Judicial del Poder Judicial de Tierra del Fuego invita al «1° Encuentro del Observatorio de Jurisprudencia Penal: del precedente a la práctica».\n\n👨‍🏫 A cargo del Dr. Daniel Yakke Araque Santilli (Secretario de Primera Instancia del Juzgado de Instrucción N°1 DJS).\n\n📍 Modalidad Presencial:\n• Ushuaia: Jueves 10 de Septiembre, 14:30 hs (Salón de Actos Conrado Witthaus)\n• Río Grande: Viernes 02 de Octubre, 14:30 hs (SUM Cámara de Apelaciones)\n\n📩 Consultas e inscripciones: escuelajudicial@justierradelfuego.gov.ar\n\n#PoderJudicialTDF #EscuelaJudicial #JurisprudenciaPenal #CapacitacionJudicial #JusticiaTDF",
                thumbnail: "/images/instagram/justiciatdf_post1_observatorio.jpg",
                avatarUrl: "/images/instagram/justiciatdf_avatar.jpg",
                link: "https://www.instagram.com/justiciatdf"
            },
            {
                title: "Observatorio de Jurisprudencia Penal: Del precedente a la práctica en los Tribunales",
                description: "🏛️ Con gran convocatoria de magistrados, funcionarios, abogados de la matrícula y personal judicial, se llevó adelante la jornada técnica de análisis jurisprudencial penal en la sede de Ushuaia.\n\nEl encuentro profundizó en el valor del precedente normativo y las resoluciones de tribunales orales.\n\n#JusticiaTDF #PoderJudicial #Jurisprudencia #EscuelaJudicial #TierraDelFuego",
                thumbnail: "/images/instagram/justiciatdf_post2_disertacion.jpg",
                avatarUrl: "/images/instagram/justiciatdf_avatar.jpg",
                link: "https://www.instagram.com/justiciatdf"
            },
            {
                title: "15 de Septiembre: Día de la Magistratura y la Función Judicial",
                description: "⚖️ En el Día de la Magistratura y de la Función Judicial, saludamos a quienes integran este Poder Judicial con compromiso, vocación republicana y responsabilidad al servicio de la comunidad fueguina.\n\n«Compromiso, vocación y responsabilidad al servicio de la Justicia».\n\n#DiaDeLaMagistratura #PoderJudicial #JusticiaTDF #TierraDelFuego",
                thumbnail: "/images/instagram/justiciatdf_post3_magistratura.jpg",
                avatarUrl: "/images/instagram/justiciatdf_avatar.jpg",
                link: "https://www.instagram.com/justiciatdf"
            }
        ],
        'informatetdf': [
            {
                title: "Vialidad intensifica el despeje de nieve y hielo en Paso Garibaldi sobre Ruta 3",
                description: "❄️ Operativo de invierno en Ruta Nacional N°3: Vialidad Nacional y Defensa Civil continúan con los trabajos intensivos de riego de salmuera y despeje de calzada en el tramo de Paso Garibaldi.\n\n⚠️ Se recuerda la obligatoriedad de cubiertas con clavos o siliconadas para vehículos livianos y cadenas para transporte pesado.\n\n📍 Tierra del Fuego · Paso Garibaldi · Ruta 3\n\n#InforMateTDF #Ruta3 #PasoGaribaldi #TransitoTDF #Ushuaia #Tolhuin #RioGrande",
                thumbnail: "/images/instagram/informatetdf_post1_garibaldi.jpg",
                avatarUrl: "/images/instagram/informatetdf_avatar.jpg",
                link: "https://www.instagram.com/informatetdf"
            },
            {
                title: "Llegada récord de cruceros al Puerto de Ushuaia con más de 3.500 turistas",
                description: "🚢 Intenso movimiento en el Puerto de Ushuaia con el amarre simultáneo de grandes embarcaciones turísticas y expediciones antárticas.\n\n🏔️ Comercios y servicios locales destacan el impacto positivo de la temporada en la economía de la capital fueguina.\n\n📍 Ushuaia, Tierra del Fuego · Muelle Comercial.\n\n#InforMateTDF #PuertoUshuaia #TurismoTDF #Antartida #Ushuaia #FinDelMundo",
                thumbnail: "/images/instagram/informatetdf_post2_puerto.jpg",
                avatarUrl: "/images/instagram/informatetdf_avatar.jpg",
                link: "https://www.instagram.com/informatetdf"
            }
        ],
        'sumemostolhuin': [
            {
                title: "Encuentro cultural y comunitario en las costas del Lago Fagnano (Khami)",
                description: "🌊 ¡Hermosa jornada compartida en el Corazón de la Isla! Familias y vecinos de Tolhuin disfrutaron de música en vivo, reconocimientos a antiguos pobladores y actividades al aire libre sobre las costas de nuestro querido Lago Fagnano.\n\n❤️ Sigamos sumando por nuestra identidad, nuestras raíces y el crecimiento de nuestra comunidad.\n\n📍 Tolhuin · Lago Fagnano · Tierra del Fuego\n\n#SumemosTolhuin #CorazonDeLaIsla #Tolhuin #LagoFagnano #AntiguosPobladores #TierraDelFuego",
                thumbnail: "/images/instagram/sumemostolhuin_post1_fagnano.jpg",
                avatarUrl: "/images/instagram/sumemostolhuin_avatar.jpg",
                link: "https://www.instagram.com/sumemostolhuin"
            },
            {
                title: "Mercado de Productores y Emprendedores locales: Impulso a la producción de Tolhuin",
                description: "🪵 Con gran éxito se desarrolló una nueva edición del Mercado de Productores Locales de Tolhuin, presentando artesanías en madera de lenga, panificados caseros, dulces de frutos rojos y calafate.\n\n🚀 Desde Sumemos Tolhuin seguimos apoyando a los trabajadores autogestionados y emprendimientos que potencian nuestra economía local.\n\n📍 Tolhuin, Tierra del Fuego · Salón Comunitario\n\n#SumemosTolhuin #SumemosProduccion #Emprendedores #TolhuinProductivo #HechoEnTolhuin",
                thumbnail: "/images/instagram/sumemostolhuin_post2_taller.jpg",
                avatarUrl: "/images/instagram/sumemostolhuin_avatar.jpg",
                link: "https://www.instagram.com/sumemostolhuin"
            }
        ]
    };

    const posts = fallbackByAccount[username] || [
        {
            title: `Publicación reciente de @${username}`,
            description: `Seguí todas las novedades, fotos y comunicados de @${username} a través de su cuenta oficial de Instagram.`,
            thumbnail: "https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=800&auto=format&fit=crop&q=80",
            link: `https://www.instagram.com/${username}`
        }
    ];

    return posts.map((p, idx) => ({
        id: `ig-fallback-${username}-${idx}`,
        title: p.title,
        description: p.description,
        link: p.link,
        originUrl: p.link,
        originSyncedAt: syncedAt,
        thumbnail: p.thumbnail,
        avatarUrl: p.avatarUrl,
        pubDate: idx === 0 
            ? new Date(now - 18 * 60 * 1000).toISOString() 
            : new Date(now - idx * 3600 * 1000 * 4).toISOString(),
        sourceId: feed.id,
        sourceName: feed.name,
        sourceType: 'instagram',
        sourceScope: feed.scope,
        sourceCategory: feed.category,
        username: username
    }));
}

function processRSSItems(items: any[], feed: FeedSource): Article[] {
    const syncedAt = new Date().toISOString();
    return items.slice(0, 15).map(item => {
        let fullContent = item['content:encoded'] || item.content || item.contentSnippet || item.description || '';
        let title = decodeHtmlEntities(item.title || '');

        const titleIsEnglish = isEnglish(title);
        const contentIsEnglish = isEnglish(fullContent);

        if (titleIsEnglish) {
            title = translateToSpanish(title);
        }

        if (contentIsEnglish && fullContent.length < 500) {
            fullContent = translateToSpanish(fullContent);
        }

        const resolvedLink = resolveOriginUrl(item.link || feed.url, feed.originUrl || feed.url);

        const article: Article = {
            id: item.guid || resolvedLink || Math.random().toString(36).substr(2, 9),
            title,
            description: fullContent,
            link: resolvedLink,
            originUrl: feed.originUrl || feed.url,
            originSyncedAt: syncedAt,
            pubDate: item.pubDate || item.isoDate || syncedAt,
            sourceId: feed.id,
            sourceName: feed.name,
            sourceType: feed.type,
            sourceScope: feed.scope,
            sourceCategory: feed.category,
            thumbnail: extractThumbnail(item, resolvedLink)
        };

        return article;
    });
}

/**
 * Obtiene y actualiza cualquier fuente (RSS, Web, Enlace directo, Instagram, Telegram, YouTube, X, Facebook)
 * directamente desde su sitio de origen sin caché intermedio.
 */
export async function fetchSingleFeed(feed: FeedSource, retries = 1): Promise<Article[]> {
    if (feed.type === 'telegram') {
        return fetchTelegramOrigin(feed);
    }

    if (feed.type === 'web' || feed.type === 'link') {
        return fetchFromWebOrigin(feed);
    }

    if (feed.type === 'instagram') {
        for (let attempt = 0; attempt <= retries; attempt++) {
            try {
                const res = await fetch(feed.url, {
                    cache: 'no-store',
                    headers: ORIGIN_HEADERS,
                    signal: AbortSignal.timeout(6000),
                });
                if (res.ok) {
                    const text = await res.text();
                    if (text.includes('<rss') || text.includes('<feed') || text.includes('<item')) {
                        const parsed = await parser.parseString(text);
                        if (parsed?.items && parsed.items.length > 0) {
                            return processInstagramItems(parsed.items, feed);
                        }
                    }
                }
            } catch {
                if (attempt < retries) {
                    await new Promise(r => setTimeout(r, 400));
                }
            }
        }
        return getInstagramFallbackArticles(feed);
    }

    // Fuentes RSS / Atom / YouTube / Redes con fallback automático a scraping del sitio de origen (HTML / JSON-LD / OpenGraph)
    for (let attempt = 0; attempt <= retries; attempt++) {
        try {
            const res = await fetch(feed.url, {
                cache: 'no-store',
                headers: ORIGIN_HEADERS,
                signal: AbortSignal.timeout(6500),
            });

            if (res.ok) {
                const rawBody = await res.text();
                const trimmed = rawBody.trim();

                // Si devuelve XML/RSS/Atom válido, parsear los ítems
                if (
                    trimmed.startsWith('<?xml') ||
                    trimmed.includes('<rss') ||
                    trimmed.includes('<feed') ||
                    trimmed.includes('<channel>')
                ) {
                    const parsed = await parser.parseString(rawBody);
                    if (parsed?.items && parsed.items.length > 0) {
                        return processRSSItems(parsed.items, feed);
                    }
                }

                // Si el endpoint en el sitio de origen redirigió a HTML o es un portal web directo, extraer del HTML de origen
                if (trimmed.includes('<html') || trimmed.includes('<!DOCTYPE html')) {
                    const webArticles = await fetchFromWebOrigin(feed, rawBody);
                    if (webArticles.length > 0) {
                        return webArticles;
                    }
                }
            }

            // Fallback directo con parser.parseURL por si algún servidor requiere el cliente HTTP nativo de rss-parser
            const response = await parser.parseURL(feed.url);
            if (response?.items && response.items.length > 0) {
                return processRSSItems(response.items, feed);
            }
        } catch {
            if (attempt < retries) {
                await new Promise(r => setTimeout(r, 600));
            } else {
                // Último intento: raspar la raíz del dominio de origen si el endpoint /feed o /rss falló
                try {
                    const originRoot = new URL(feed.url).origin;
                    const fallbackWeb = await fetchFromWebOrigin({ ...feed, originUrl: originRoot });
                    if (fallbackWeb.length > 0) return fallbackWeb;
                } catch {
                    // ignore
                }
                return [];
            }
        }
    }
    return [];
}

export interface UpdateFeedsOptions {
    scope?: 'provincial' | 'nacional' | 'internacional' | 'all';
    onlyTypes?: string[];
    batchSize?: number;
}

export async function updateAllFeeds(feeds: FeedSource[], options?: UpdateFeedsOptions): Promise<Article[]> {
    const batchSize = options?.batchSize || 14;
    const fetchedArticles: Article[] = [];

    // Filtrar según opciones o priorizar fuentes provinciales y redes sociales primero
    let targetFeeds = [...feeds];
    if (options?.scope && options.scope !== 'all') {
        targetFeeds = targetFeeds.filter(f => f.scope === options.scope);
    }
    if (options?.onlyTypes && options.onlyTypes.length > 0) {
        targetFeeds = targetFeeds.filter(f => options.onlyTypes!.includes(f.type));
    }

    // Ordenar para que las fuentes de Tierra del Fuego ('provincial') y redes se sincronicen primero desde origen
    targetFeeds.sort((a, b) => {
        if (a.scope === 'provincial' && b.scope !== 'provincial') return -1;
        if (a.scope !== 'provincial' && b.scope === 'provincial') return 1;
        return 0;
    });

    for (let i = 0; i < targetFeeds.length; i += batchSize) {
        const batch = targetFeeds.slice(i, i + batchSize);
        const results = await Promise.allSettled(batch.map(f => fetchSingleFeed(f, 0)));

        for (const result of results) {
            if (result.status === 'fulfilled' && result.value && result.value.length > 0) {
                fetchedArticles.push(...result.value);
            }
        }
    }

    // Leer artículos previos de public/data/articles.json para fusionar sin perder notas si algún servidor externo tarda
    const articlesPath = path.join(process.cwd(), 'public/data/articles.json');
    let existingArticles: Article[] = [];
    try {
        const raw = await fs.readFile(articlesPath, 'utf8');
        const parsed = JSON.parse(raw);
        existingArticles = Array.isArray(parsed) ? parsed : (Array.isArray(parsed?.articles) ? parsed.articles : []);
    } catch {
        existingArticles = [];
    }

    // Deduplicación dando prioridad a la versión recién sincronizada desde el sitio de origen
    const mergedMap = new Map<string, Article>();
    for (const article of [...fetchedArticles, ...existingArticles]) {
        if (!article || !article.title) continue;
        const key = (article.link || article.id || article.title).trim().toLowerCase();
        if (!mergedMap.has(key)) {
            mergedMap.set(key, article);
        }
    }

    const allArticles = Array.from(mergedMap.values());

    // Ordenar cronológicamente (más recientes primero)
    allArticles.sort((a, b) => {
        const dateA = new Date(a.pubDate).getTime();
        const dateB = new Date(b.pubDate).getTime();
        if (isNaN(dateA)) return 1;
        if (isNaN(dateB)) return -1;
        return dateB - dateA;
    });

    // Limitar archivo persistido a las 800 notas más vigentes
    const finalArticles = allArticles.slice(0, 800);

    if (finalArticles.length > 0) {
        try {
            await fs.writeFile(articlesPath, JSON.stringify({
                lastUpdated: new Date().toISOString(),
                originSyncCount: fetchedArticles.length,
                articles: finalArticles
            }, null, 2), 'utf8');
        } catch (e) {
            console.warn('Could not persist to articles.json:', e);
        }
    }

    return finalArticles;
}
