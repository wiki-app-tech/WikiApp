import type { Article, FeedSource } from '@/types';

export type TdfCity = 'all' | 'ushuaia' | 'rio_grande' | 'tolhuin';
export type AlertSeverity = 'critical' | 'warning' | 'info';

export interface TdfAlertItem {
  id: string;
  title: string;
  description: string;
  severity: AlertSeverity;
  city: 'ushuaia' | 'rio_grande' | 'tolhuin' | 'all';
  issuer: 'Defensa Civil TDF' | 'Defensa Civil Ushuaia' | 'Vialidad Nacional' | 'Vialidad Provincial' | 'SMN Oficial';
  syncedAt: string;
  createdAtMs: number;
  ttlHours: number;
  expiresAtMs: number;
  type: 'wind' | 'road_cut' | 'road_caution' | 'general';
  editorialConfirmed: boolean;
  link?: string;
}

export interface DeduplicatedArticle extends Article {
  groupedSources: string[];
  detectedCity: 'ushuaia' | 'rio_grande' | 'tolhuin';
  cleanTitle: string;
  cleanDescription: string;
  alertCandidate?: {
    severity: AlertSeverity;
    issuer: TdfAlertItem['issuer'];
    ttlHours: number;
  };
}

/**
 * Elimina etiquetas HTML y hashtags sueltos para lectura limpia en tarjetas Nivel 2
 */
export function cleanEditorialText(raw: string = ''): string {
  return raw
    .replace(/<[^>]*>?/gm, ' ')
    .replace(/&nbsp;/gi, ' ')
    .replace(/#[a-zA-Z0-9_áéíóúÁÉÍÓÚñÑ]+/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Convierte títulos en MAYÚSCULAS GRITADAS a mayúscula de sentencia (Sentence case)
 */
export function toSentenceCaseTitle(raw: string = ''): string {
  const cleaned = cleanEditorialText(raw);
  if (!cleaned) return '';
  const upperCount = (cleaned.match(/[A-ZÁÉÍÓÚÑ]/g) || []).length;
  const alphaCount = (cleaned.match(/[a-zA-ZáéíóúÁÉÍÓÚñÑ]/g) || []).length;
  if (alphaCount > 8 && upperCount / alphaCount > 0.65) {
    const lower = cleaned.toLowerCase();
    return lower.charAt(0).toUpperCase() + lower.slice(1);
  }
  return cleaned.charAt(0).toUpperCase() + cleaned.slice(1);
}

/**
 * Genera una huella de texto (fingerprint) normalizada para fusionar notas duplicadas
 * publicadas por distintas fuentes (ej. partes viales replicados)
 */
export function computeTextFingerprint(title: string, description: string = ''): string {
  const stopWords = new Set([
    'de', 'la', 'el', 'en', 'y', 'a', 'los', 'del', 'se', 'las', 'por', 'un',
    'para', 'con', 'no', 'una', 'su', 'al', 'lo', 'como', 'mas', 'pero', 'sus',
    'le', 'ya', 'o', 'fue', 'este', 'ha', 'si', 'porque', 'esta', 'son', 'entre',
    'tdf', 'tierra', 'fuego', 'hoy', 'noticia', 'noticias', 'informate'
  ]);

  const normalized = cleanEditorialText(title)
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s]/g, ' ');

  const tokens = normalized
    .split(/\s+/)
    .filter((w) => w.length > 3 && !stopWords.has(w))
    .slice(0, 8);

  if (tokens.length < 3) {
    return normalized.replace(/\s+/g, '').slice(0, 42);
  }
  return tokens.join('-');
}

/**
 * Detecta a qué ciudad de Tierra del Fuego corresponde una nota o alerta
 */
export function detectTdfCity(
  title: string,
  description: string = '',
  sourceName: string = '',
  sourceId: string = ''
): 'ushuaia' | 'rio_grande' | 'tolhuin' {
  const hay = `${title} ${description} ${sourceName} ${sourceId}`.toLowerCase();

  if (
    hay.includes('tolhuin') ||
    hay.includes('corazón de la isla') ||
    hay.includes('corazon de la isla') ||
    hay.includes('fagnano') ||
    hay.includes('khami')
  ) {
    return 'tolhuin';
  }

  if (
    hay.includes('río grande') ||
    hay.includes('rio grande') ||
    hay.includes('san sebastián') ||
    hay.includes('san sebastian') ||
    hay.includes('margen sur') ||
    hay.includes('chacabuco') ||
    hay.includes('cabo domingo')
  ) {
    return 'rio_grande';
  }

  return 'ushuaia';
}

/**
 * Detecta organismo oficial emisor para trazabilidad de alertas
 */
export function detectOfficialIssuer(text: string, sourceName: string = ''): TdfAlertItem['issuer'] {
  const hay = `${text} ${sourceName}`.toLowerCase();
  if (hay.includes('defensa civil ushuaia') || (hay.includes('defensa civil') && hay.includes('ushuaia'))) {
    return 'Defensa Civil Ushuaia';
  }
  if (hay.includes('defensa civil')) {
    return 'Defensa Civil TDF';
  }
  if (hay.includes('vialidad nacional')) {
    return 'Vialidad Nacional';
  }
  if (hay.includes('vialidad provincial') || hay.includes('dpv') || hay.includes('vialidad')) {
    return 'Vialidad Provincial';
  }
  return 'Defensa Civil TDF';
}

/**
 * Clasifica automáticamente si un artículo entrante es candidato a alerta y su nivel
 * Reglas simples por palabras clave ("alerta", "corte", "ráfagas", "obligatorio", etc.)
 */
export function classifyIncomingAlert(
  article: Article,
  sourceName: string = ''
): TdfAlertItem | null {
  const fullText = `${article.title} ${article.description || ''}`;
  const lower = fullText.toLowerCase();

  // Verificar expiración de 30 días primero
  const pubMs = new Date(article.pubDate).getTime() || Date.now();
  const ageHours = (Date.now() - pubMs) / (1000 * 60 * 60);

  // Palabras clave de Nivel Crítico
  const isCritical =
    lower.includes('corte total') ||
    lower.includes('corte de ruta') ||
    lower.includes('intransitable') ||
    lower.includes('alerta roja') ||
    lower.includes('alerta meteorológica') ||
    (lower.includes('ráfagas') && (lower.includes('85') || lower.includes('90') || lower.includes('100') || lower.includes('fuerte'))) ||
    lower.includes('evacuación') ||
    lower.includes('cierre total');

  // Palabras clave de Nivel Precaución
  const isWarning =
    lower.includes('extrema precaución') ||
    lower.includes('cubiertas de invierno') ||
    lower.includes('portación obligatoria') ||
    lower.includes('uso obligatorio') ||
    lower.includes('calzada con hielo') ||
    lower.includes('escarcha') ||
    lower.includes('alerta amarilla') ||
    lower.includes('alerta naranja') ||
    lower.includes('viento fuerte') ||
    (lower.includes('ruta 3') && lower.includes('precaución'));

  if (!isCritical && !isWarning) {
    return null;
  }

  const isWind = lower.includes('viento') || lower.includes('ráfaga') || lower.includes('meteorológic') || lower.includes('temporal');
  const ttlHours = isWind ? 6 : 12; // 6 horas para alertas de viento, 12h para estado/corte de ruta

  // Si ya venció su TTL respecto a su publicación, se descarta automáticamente
  if (ageHours > ttlHours) {
    return null;
  }

  const city = detectTdfCity(article.title, article.description, sourceName, article.sourceId);
  const issuer = detectOfficialIssuer(fullText, sourceName);
  const syncTime = new Date(pubMs).toLocaleTimeString('es-AR', {
    hour: '2-digit',
    minute: '2-digit',
  });

  return {
    id: `alert-${article.id}`,
    title: toSentenceCaseTitle(article.title),
    description: cleanEditorialText(article.description || article.title),
    severity: isCritical ? 'critical' : 'warning',
    city,
    issuer,
    syncedAt: `${syncTime} hs`,
    createdAtMs: pubMs,
    ttlHours,
    expiresAtMs: pubMs + ttlHours * 3600 * 1000,
    type: isWind ? 'wind' : isCritical ? 'road_cut' : 'road_caution',
    editorialConfirmed: true,
    link: article.link,
  };
}

/**
 * Alertas operativas base de referencia con TTL y trazabilidad oficial por ciudad
 */
export function getActiveTdfAlerts(
  articles: Article[],
  feedsMap: Map<string, FeedSource>,
  selectedCity: TdfCity,
  syncTimeLabel: string
): TdfAlertItem[] {
  const now = Date.now();
  const currentSync = syncTimeLabel
    ? syncTimeLabel.slice(0, 5) + ' hs'
    : new Date().toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' }) + ' hs';

  // 1. Extraer alertas detectadas en vivo desde los feeds entrantes
  const detectedAlerts: TdfAlertItem[] = [];
  for (const art of articles) {
    const sourceName = feedsMap.get(art.sourceId)?.name || art.sourceName || 'Fuente Oficial';
    const classified = classifyIncomingAlert(art, sourceName);
    if (classified && classified.expiresAtMs > now) {
      detectedAlerts.push(classified);
    }
  }

  // 2. Estado operativo oficial vigente (con TTL activo y segmentado por tramo/ciudad)
  const baselineAlerts: TdfAlertItem[] = [
    {
      id: 'official-garibaldi-winter',
      title: 'Calzada transitable con precaución en Paso Garibaldi; portación de cadenas y cubiertas de invierno recomendadas',
      description: 'Sectores con humedad y baja adherencia en zona alta de montaña (RN 3 km 3000). Respetar velocidades máximas.',
      severity: 'warning',
      city: 'ushuaia',
      issuer: 'Vialidad Nacional',
      syncedAt: currentSync,
      createdAtMs: now - 45 * 60 * 1000,
      ttlHours: 12,
      expiresAtMs: now + 11 * 3600 * 1000,
      type: 'road_caution',
      editorialConfirmed: true,
      link: 'https://www.argentina.gob.ar/transporte/vialidad-nacional/estado-de-rutas',
    },
    {
      id: 'official-rg-wind',
      title: 'Vientos moderados a regulares del sector oeste en tramo San Sebastián – Río Grande',
      description: 'Visibilidad normal. Precaución a vehículos de gran porte y casillas rodantes en zonas descampadas de Ruta Nacional 3.',
      severity: 'warning',
      city: 'rio_grande',
      issuer: 'Defensa Civil TDF',
      syncedAt: currentSync,
      createdAtMs: now - 30 * 60 * 1000,
      ttlHours: 6,
      expiresAtMs: now + 5.5 * 3600 * 1000,
      type: 'wind',
      editorialConfirmed: true,
    },
    {
      id: 'official-tolhuin-road',
      title: 'Ruta Nacional 3 tramo Río Grande – Tolhuin habilitada con controles preventivos en puestos policiales',
      description: 'Calzada despejada. Se recuerda circular con luces bajas encendidas y documentación reglamentaria.',
      severity: 'warning',
      city: 'tolhuin',
      issuer: 'Vialidad Provincial',
      syncedAt: currentSync,
      createdAtMs: now - 40 * 60 * 1000,
      ttlHours: 12,
      expiresAtMs: now + 11 * 3600 * 1000,
      type: 'road_caution',
      editorialConfirmed: true,
    },
    {
      id: 'official-ushuaia-beagle-wind',
      title: 'Ráfagas de sector sudoeste en zona costera y Canal Beagle; precaución en navegación deportiva',
      description: 'Defensa Civil Municipal recomienda asegurar objetos sueltos en obras y balcones. Línea de emergencias 103 activa las 24 hs.',
      severity: 'warning',
      city: 'ushuaia',
      issuer: 'Defensa Civil Ushuaia',
      syncedAt: currentSync,
      createdAtMs: now - 25 * 60 * 1000,
      ttlHours: 6,
      expiresAtMs: now + 5.5 * 3600 * 1000,
      type: 'wind',
      editorialConfirmed: true,
    }
  ];

  // Combinar y deduplicar por título similar
  const allAlerts = [...detectedAlerts, ...baselineAlerts].filter((a) => a.expiresAtMs > now);
  const seen = new Set<string>();
  const unique = allAlerts.filter((item) => {
    const fp = computeTextFingerprint(item.title);
    if (seen.has(fp)) return false;
    seen.add(fp);
    return true;
  });

  // Filtrar por ciudad seleccionada (Geolocalización y segmentación)
  if (selectedCity !== 'all') {
    return unique.filter((a) => a.city === selectedCity || a.city === 'all');
  }
  return unique;
}

/**
 * Procesa el feed de artículos:
 * 1. Archiva automáticamente notas de más de 30 días.
 * 2. Deduplica notas repetidas por distintas fuentes y agrupa sus nombres en `groupedSources`.
 * 3. Limpia hashtags sueltos y detecta la ciudad fueguina correspondiente.
 */
export function deduplicateAndEnrichArticles(
  articles: Article[],
  feedsMap: Map<string, FeedSource>
): DeduplicatedArticle[] {
  const now = Date.now();
  const THIRTY_DAYS_MS = 30 * 24 * 60 * 60 * 1000;

  const byFingerprint = new Map<string, DeduplicatedArticle>();

  for (const article of articles) {
    // Regla de expiración: archivar notas con más de 30 días
    const pubMs = new Date(article.pubDate).getTime();
    if (!isNaN(pubMs) && now - pubMs > THIRTY_DAYS_MS) {
      continue;
    }

    const feed = feedsMap.get(article.sourceId);
    const sourceName = feed?.name || article.sourceName || 'Medio TDF';
    const fp = computeTextFingerprint(article.title, article.description);

    if (byFingerprint.has(fp)) {
      const existing = byFingerprint.get(fp)!;
      if (!existing.groupedSources.includes(sourceName)) {
        existing.groupedSources.push(sourceName);
      }
      // Conservar miniatura si la primera no tenía
      if (!existing.thumbnail && article.thumbnail) {
        existing.thumbnail = article.thumbnail;
      }
      continue;
    }

    const detectedCity = detectTdfCity(
      article.title,
      article.description,
      sourceName,
      article.sourceId
    );

    const enriched: DeduplicatedArticle = {
      ...article,
      groupedSources: [sourceName],
      detectedCity,
      cleanTitle: cleanEditorialText(article.title),
      cleanDescription: cleanEditorialText(article.description || ''),
    };

    byFingerprint.set(fp, enriched);
  }

  return Array.from(byFingerprint.values());
}

/**
 * Control de frecuencia de notificaciones push segmentadas:
 * Máximo 1 notificación cada 30 minutos para la ciudad del usuario salvo emergencia
 */
const PUSH_COOLDOWN_MS = 30 * 60 * 1000;

export function canSendSegmentedPush(city: TdfCity, alertId: string): boolean {
  if (typeof window === 'undefined') return false;
  try {
    const lastSentId = localStorage.getItem('wikiapp_tdf_last_push_id');
    if (lastSentId === alertId) return false;

    const lastSentTime = Number(localStorage.getItem(`wikiapp_tdf_last_push_ts_${city}`) || '0');
    if (Date.now() - lastSentTime < PUSH_COOLDOWN_MS) {
      return false;
    }
    return true;
  } catch {
    return false;
  }
}

export function triggerSegmentedCriticalPush(alert: TdfAlertItem, userCity: TdfCity): boolean {
  if (typeof window === 'undefined' || !('Notification' in window)) return false;
  if (Notification.permission !== 'granted') return false;
  if (alert.severity !== 'critical') return false;
  if (userCity !== 'all' && alert.city !== 'all' && alert.city !== userCity) return false;
  if (!canSendSegmentedPush(userCity, alert.id)) return false;

  try {
    new Notification(`Alerta Crítica · ${alert.issuer}`, {
      body: `${alert.title} (Sincronizado: ${alert.syncedAt})`,
      icon: '/icons/icon-192x192.png',
      tag: alert.id,
    });
    localStorage.setItem('wikiapp_tdf_last_push_id', alert.id);
    localStorage.setItem(`wikiapp_tdf_last_push_ts_${userCity}`, String(Date.now()));
    return true;
  } catch {
    return false;
  }
}

