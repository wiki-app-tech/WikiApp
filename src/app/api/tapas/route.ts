import { NextResponse } from 'next/server';

export const revalidate = 3600; // Cache for 1 hour

interface TapasItem {
  id: string;
  name: string;
  category: 'internacionales' | 'nacionales' | 'provinciales';
  url: string;
  coverUrl: string;
  countryOrRegion: string;
  date: string;
}

// Helper to get today's date in YYYY/MM/DD format
function getTodayDateString() {
  const date = new Date();
  const YYYY = date.getFullYear();
  const MM = String(date.getMonth() + 1).padStart(2, '0');
  const DD = String(date.getDate()).padStart(2, '0');
  return { YYYY, MM, DD, formatted: `${DD}/${MM}/${YYYY}` };
}

function getKioskoFallbackUrl(country: string, code: string) {
  const { YYYY, MM, DD } = getTodayDateString();
  return `https://img.kiosko.net/${YYYY}/${MM}/${DD}/${country}/${code}.750.jpg`;
}

// Scraper functions
async function fetchWithTimeout(url: string, options = {}, timeout = 6000) {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeout);
  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        ...(options as any).headers
      }
    });
    clearTimeout(id);
    return response;
  } catch (error) {
    clearTimeout(id);
    throw error;
  }
}

async function scrapeKiosko(url: string, country: string, code: string): Promise<string> {
  try {
    const res = await fetchWithTimeout(url);
    if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
    const html = await res.text();
    const unescaped = html.replace(/\\\/|\\/g, '/');
    const regex = /(?:https?:)?\/\/img\.kiosko\.net\/\d{4}\/\d{2}\/\d{2}\/[^"'\s)(]+\.750\.jpg/i;
    const match = unescaped.match(regex);
    if (match) {
      return match[0].startsWith('//') ? `https:${match[0]}` : match[0];
    }
    return getKioskoFallbackUrl(country, code);
  } catch (e) {
    console.warn(`Scrape failed for Kiosko (${code}), using fallback:`, (e as Error).message);
    return getKioskoFallbackUrl(country, code);
  }
}

async function scrapeBae(): Promise<string> {
  const baseUrl = 'https://www.baenegocios.com';
  const tagUrl = `${baseUrl}/tags/Edicion-Impresa/`;
  const fallback = 'https://www.baenegocios.com/__export/1603978438183/sites/cronica/img/2020/10/29/tapa.jpg'; // static fallback
  try {
    const res = await fetchWithTimeout(tagUrl);
    if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
    const html = await res.text();
    
    // Find first article containing "tapa" or just the first article
    const articleRegex = /<article[^>]*>([\s\S]*?)<\/article>/gi;
    let match;
    let articleLink = '';
    
    while ((match = articleRegex.exec(html)) !== null) {
      const content = match[1];
      if (content.toLowerCase().includes('tapa')) {
        const linkMatch = content.match(/href=["']([^"']+\.html)["']/i);
        if (linkMatch) {
          articleLink = linkMatch[1];
          break;
        }
      }
    }

    if (!articleLink) {
      const firstLinkMatch = html.match(/<article[^>]*>[\s\S]*?href=["']([^"']+\.html)["']/i);
      if (firstLinkMatch) articleLink = firstLinkMatch[1];
    }

    if (articleLink) {
      const fullLink = articleLink.startsWith('http') ? articleLink : `${baseUrl}${articleLink}`;
      const detailRes = await fetchWithTimeout(fullLink);
      if (!detailRes.ok) throw new Error(`HTTP error on detail page! status: ${detailRes.status}`);
      const detailHtml = await detailRes.text();
      const imgRegex = /https:\/\/www\.baenegocios\.com\/files\/image\/\d+\/\d+\/[^"'\s)(]+\.jpg/gi;
      const imgMatches = detailHtml.match(imgRegex);
      if (imgMatches) {
        // Strip thumbnail size parameters for high res cover
        return imgMatches[0].replace(/_\d+_\d+!\.jpg$/i, '.jpg');
      }
    }
    return fallback;
  } catch (e) {
    console.warn('Scrape failed for BAE:', (e as Error).message);
    return fallback;
  }
}

async function scrapeTiempo(): Promise<string> {
  const url = 'https://www.tiempofueguino.com/portadas/';
  const fallback = 'https://www.tiempofueguino.com/wp-content/uploads/logo2_520_90.png';
  try {
    const res = await fetchWithTimeout(url);
    if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
    const html = await res.text();
    const unescaped = html.replace(/\\\/|\\/g, '/');
    const regex = /https:\/\/www\.tiempofueguino\.com\/wp-content\/uploads\/\d{4}\/\d{2}\/[^"'\s)(]+\.jpe?g/gi;
    const matches = unescaped.match(regex);
    if (matches) {
      const filtered = matches.map(u => u.replace(/-\d+x\d+(\.jpe?g)$/i, '$1')).filter(u => {
        const lower = u.toLowerCase();
        return !lower.includes('logo') && !lower.includes('avatar') && !lower.includes('icon') && !lower.includes('publicidad');
      });
      if (filtered.length > 0) return filtered[0];
    }
    return fallback;
  } catch (e) {
    console.warn('Scrape failed for Tiempo Fueguino:', (e as Error).message);
    return fallback;
  }
}

async function scrapeDiarioPrensa(): Promise<string> {
  const url = 'https://www.diarioprensa.com.ar/category/en-papel/';
  const fallback = 'https://www.diarioprensa.com.ar/wp-content/uploads/2017/05/logo.png';
  try {
    const res = await fetchWithTimeout(url);
    if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
    const html = await res.text();
    const unescaped = html.replace(/\\\/|\\/g, '/');
    const regex = /https:\/\/www\.diarioprensa\.com\.ar\/wp-content\/uploads\/\d{4}\/\d{2}\/[^"'\s)(]+\.jpe?g/gi;
    const matches = unescaped.match(regex);
    if (matches) {
      const filtered = matches.map(u => u.replace(/-\d+x\d+(\.jpe?g)$/i, '$1')).filter(u => {
        const lower = u.toLowerCase();
        return !lower.includes('logo') && !lower.includes('avatar') && !lower.includes('icon') && !lower.includes('publicidad');
      });
      if (filtered.length > 0) return filtered[0];
    }
    return fallback;
  } catch (e) {
    console.warn('Scrape failed for Diario Prensa:', (e as Error).message);
    return fallback;
  }
}

async function scrapeFinDelMundo(): Promise<string> {
  const url = 'https://www.eldiariodelfindelmundo.com/ediciones/';
  const fallback = 'https://www.eldiariodelfindelmundo.com/img/logo.png';
  try {
    const res = await fetchWithTimeout(url);
    if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
    const html = await res.text();
    const unescaped = html.replace(/\\\/|\\/g, '/');
    const regex = /https:\/\/www\.eldiariodelfindelmundo\.com\/uploads\/imagenes\/repositorio\/\d{4}\/\d{2}\/\d{2}\/[^"'\s)(]+\.jpe?g/gi;
    const matches = unescaped.match(regex);
    if (matches) {
      const filtered = matches.map(u => u.replace(/-\d+x\d+(\.jpe?g)$/i, '$1')).filter(u => {
        const lower = u.toLowerCase();
        return !lower.includes('logo') && !lower.includes('avatar') && !lower.includes('icon') && !lower.includes('publicidad');
      });
      if (filtered.length > 0) return filtered[0];
    }
    return fallback;
  } catch (e) {
    console.warn('Scrape failed for El Diario del Fin del Mundo:', (e as Error).message);
    return fallback;
  }
}

async function scrapeProvincia23(): Promise<string> {
  const url = 'https://www.provincia23.com.ar/diario-papel/';
  const fallback = 'https://www.provincia23.com.ar/wp-content/uploads/2016/09/logo-provincia-23-footer.png';
  try {
    const res = await fetchWithTimeout(url);
    if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
    const html = await res.text();
    const unescaped = html.replace(/\\\/|\\/g, '/');
    const regex = /https:\/\/www\.provincia23\.com\.ar\/wp-content\/uploads\/\d{4}\/\d{2}\/[^"'\s)(]+\.jpe?g/gi;
    const matches = unescaped.match(regex);
    if (matches) {
      const filtered = matches.map(u => u.replace(/-\d+x\d+(\.jpe?g)$/i, '$1')).filter(u => {
        const lower = u.toLowerCase();
        return !lower.includes('logo') && 
               !lower.includes('avatar') && 
               !lower.includes('icon') && 
               !lower.includes('publicidad') &&
               !lower.includes('fondo') &&
               !lower.includes('scaled');
      });
      if (filtered.length > 0) return filtered[0];
    }
    return fallback;
  } catch (e) {
    console.warn('Scrape failed for Provincia 23:', (e as Error).message);
    return fallback;
  }
}

async function scrapeSurenio(): Promise<string> {
  const url = 'https://www.surenio.com.ar/categorias/tapa/';
  const fallback = 'https://www.surenio.com.ar/wp-content/uploads/2020/09/logo-el-sureno-footer.png';
  try {
    const res = await fetchWithTimeout(url);
    if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
    const html = await res.text();
    const unescaped = html.replace(/\\\/|\\/g, '/');
    const regex = /https?:\/\/[^"'\s)(]+\/wp-content\/uploads\/\d{4}\/\d{2}\/[^"'\s)(]+\.jpe?g/gi;
    const matches = unescaped.match(regex);
    if (matches) {
      const filtered = matches.map(u => u.replace(/-\d+x\d+(\.jpe?g)$/i, '$1')).filter(u => {
        const lower = u.toLowerCase();
        return !lower.includes('logo') && !lower.includes('avatar') && !lower.includes('icon') && !lower.includes('publicidad');
      });
      if (filtered.length > 0) return filtered[0];
    }
    return fallback;
  } catch (e) {
    console.warn('Scrape failed for El Sureño:', (e as Error).message);
    return fallback;
  }
}

export async function GET() {
  const { formatted } = getTodayDateString();

  // Define metadata for each source
  const sourcesDef = {
    internacionales: [
      { id: 'abc', name: 'ABC', countryOrRegion: 'España', url: 'https://es.kiosko.net/es/np/abc.html', scraper: () => scrapeKiosko('https://es.kiosko.net/es/np/abc.html', 'es', 'abc') },
      { id: 'wsj', name: 'The Wall Street Journal', countryOrRegion: 'Estados Unidos', url: 'https://es.kiosko.net/us/np/wsj.html', scraper: () => scrapeKiosko('https://es.kiosko.net/us/np/wsj.html', 'us', 'wsj') },
      { id: 'mercurio', name: 'El Mercurio', countryOrRegion: 'Chile', url: 'https://es.kiosko.net/cl/np/cl_mercurio.html', scraper: () => scrapeKiosko('https://es.kiosko.net/cl/np/cl_mercurio.html', 'cl', 'cl_mercurio') },
      { id: 've_2001', name: '2001', countryOrRegion: 'Venezuela', url: 'https://es.kiosko.net/ve/np/ve_2001.html', scraper: () => scrapeKiosko('https://es.kiosko.net/ve/np/ve_2001.html', 've', 've_2001') },
      { id: 'nacion_br', name: 'La Nación', countryOrRegion: 'Brasil', url: 'https://es.kiosko.net/py/np/nacion.html', scraper: () => scrapeKiosko('https://es.kiosko.net/py/np/nacion.html', 'py', 'nacion') },
      { id: 'elpais_uy', name: 'El País', countryOrRegion: 'Uruguay', url: 'https://es.kiosko.net/uy/np/uy_elpais.html', scraper: () => scrapeKiosko('https://es.kiosko.net/uy/np/uy_elpais.html', 'uy', 'uy_elpais') },
      { id: 'potosi', name: 'El Potosí', countryOrRegion: 'Bolivia', url: 'https://es.kiosko.net/bo/np/potosi.html', scraper: () => scrapeKiosko('https://es.kiosko.net/bo/np/potosi.html', 'bo', 'potosi') },
      { id: 'nacion_py', name: 'La Nación', countryOrRegion: 'Paraguay', url: 'https://es.kiosko.net/py/np/nacion.html', scraper: () => scrapeKiosko('https://es.kiosko.net/py/np/nacion.html', 'py', 'nacion') }
    ],
    nacionales: [
      { id: 'clarin', name: 'Clarín', countryOrRegion: 'Argentina', url: 'https://es.kiosko.net/ar/np/ar_clarin.html', scraper: () => scrapeKiosko('https://es.kiosko.net/ar/np/ar_clarin.html', 'ar', 'ar_clarin') },
      { id: 'lanacion_ar', name: 'La Nación', countryOrRegion: 'Argentina', url: 'https://es.kiosko.net/ar/np/nacion.html', scraper: () => scrapeKiosko('https://es.kiosko.net/ar/np/nacion.html', 'ar', 'nacion') },
      { id: 'pagina12', name: 'Página 12', countryOrRegion: 'Argentina', url: 'https://es.kiosko.net/ar/np/ar_pagina12.html', scraper: () => scrapeKiosko('https://es.kiosko.net/ar/np/ar_pagina12.html', 'ar', 'ar_pagina12') },
      { id: 'bae', name: 'BAE Negocios', countryOrRegion: 'Argentina', url: 'https://www.baenegocios.com/tags/Edicion-Impresa/', scraper: () => scrapeBae() },
      { id: 'ambito', name: 'Ámbito Financiero', countryOrRegion: 'Argentina', url: 'https://es.kiosko.net/ar/np/ar_ambito.html', scraper: () => scrapeKiosko('https://es.kiosko.net/ar/np/ar_ambito.html', 'ar', 'ar_ambito') },
      { id: 'cronista', name: 'El Cronista', countryOrRegion: 'Argentina', url: 'https://es.kiosko.net/ar/np/ar_cronista.html', scraper: () => scrapeKiosko('https://es.kiosko.net/ar/np/ar_cronista.html', 'ar', 'ar_cronista') },
      { id: 'manana_formosa', name: 'La Mañana', countryOrRegion: 'Formosa', url: 'https://es.kiosko.net/ar/np/manana_formosa.html', scraper: () => scrapeKiosko('https://es.kiosko.net/ar/np/manana_formosa.html', 'ar', 'manana_formosa') }
    ],
    provinciales: [
      { id: 'tiempofueguino', name: 'Tiempo Fueguino', countryOrRegion: 'Tierra del Fuego', url: 'https://www.tiempofueguino.com/portadas/', scraper: () => scrapeTiempo() },
      { id: 'prensa', name: 'Diario Prensa', countryOrRegion: 'Tierra del Fuego', url: 'https://www.diarioprensa.com.ar/category/en-papel/', scraper: () => scrapeDiarioPrensa() },
      { id: 'findelmundo', name: 'El Diario del Fin del Mundo', countryOrRegion: 'Tierra del Fuego', url: 'https://www.eldiariodelfindelmundo.com/ediciones/', scraper: () => scrapeFinDelMundo() },
      { id: 'provincia23', name: 'Provincia 23', countryOrRegion: 'Tierra del Fuego', url: 'https://www.provincia23.com.ar/diario-papel/', scraper: () => scrapeProvincia23() },
      { id: 'surenio', name: 'El Sureño', countryOrRegion: 'Tierra del Fuego', url: 'https://www.surenio.com.ar/categorias/tapa/', scraper: () => scrapeSurenio() }
    ]
  };

  try {
    const promises: Promise<{ category: string; data: any }>[] = [];

    // Queue all scraping requests in parallel
    for (const [category, items] of Object.entries(sourcesDef)) {
      items.forEach(item => {
        promises.push(
          item.scraper().then(coverUrl => ({
            category,
            data: {
              id: item.id,
              name: item.name,
              category: category as any,
              url: item.url,
              coverUrl,
              countryOrRegion: item.countryOrRegion,
              date: formatted
            }
          }))
        );
      });
    }

    const results = await Promise.allSettled(promises);

    const responseData = {
      internacionales: [] as TapasItem[],
      nacionales: [] as TapasItem[],
      provinciales: [] as TapasItem[]
    };

    results.forEach((res, index) => {
      if (res.status === 'fulfilled') {
        const { category, data } = res.value;
        (responseData as any)[category].push(data);
      } else {
        console.error(`Failed resolving promise at index ${index}:`, res.reason);
      }
    });

    const response = NextResponse.json(responseData);
    response.headers.set('Access-Control-Allow-Origin', '*');
    response.headers.set('Access-Control-Allow-Methods', 'GET, OPTIONS');
    response.headers.set('Access-Control-Allow-Headers', 'Content-Type');
    return response;

  } catch (error) {
    console.error('Error fetching tapas:', error);
    const errorResponse = NextResponse.json({ error: (error as Error).message }, { status: 500 });
    errorResponse.headers.set('Access-Control-Allow-Origin', '*');
    return errorResponse;
  }
}
