'use client';

import React, { useState, useMemo, useEffect, useCallback, useRef } from 'react';
import {
  AlertTriangle,
  Info,
  Clock,
  ChevronDown,
  ChevronUp,
  ChevronLeft,
  ChevronRight,
  FileText,
  MessageCircle,
  Send,
  Layers,
  CheckCircle2,
  Pause,
  Play,
  Car,
  Cross,
  Thermometer,
  TrendingUp
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import type { Article, FeedSource } from '@/types';
import {
  type TdfCity,
  type TdfAlertItem,
  type DeduplicatedArticle,
  deduplicateAndEnrichArticles,
  toSentenceCaseTitle,
  cleanEditorialText
} from '@/utils/tdfIntelligence';
import { shareToTelegram, isValidUrl } from '@/utils/telegramInstantView';
import type { PharmacyItem, CityWeatherSummary, DolarQuotesData } from './TdfStickyStatusBar';

interface TdfThreeTierFeedProps {
  articles: Article[];
  feedsMap: Map<string, FeedSource>;
  selectedCity: TdfCity;
  activeCategory: string;
  activeAlerts: TdfAlertItem[];
  pharmaciesByCity?: {
    ushuaia: PharmacyItem | null;
    rio_grande: PharmacyItem | null;
    tolhuin: PharmacyItem | null;
  };
  onSelectArticle: (article: Article) => void;
  syncTime: string;
  readArticleIds?: Set<string>;
  onMarkArticleRead?: (articleId: string) => void;
  showDailySummary?: boolean;
}

/**
 * Formatea fecha y hora de emisión de la noticia en formato claro y tabular
 * (ej. "29/10/2026 · 14:20 hs")
 */
export function formatIssuedDateTime(isoString: string): string {
  try {
    const d = new Date(isoString);
    if (isNaN(d.getTime())) return 'Reciente';
    const datePart = d.toLocaleDateString('es-AR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
    const timePart = d.toLocaleTimeString('es-AR', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    });
    return `${datePart} · ${timePart} hs`;
  } catch {
    return 'Reciente';
  }
}

export function TdfSemanticAlertCard({ alert, compact = true }: { alert: TdfAlertItem; compact?: boolean }) {
  const isCritical = alert.severity === 'critical';
  const isWarning = alert.severity === 'warning';

  const cardClass = isCritical
    ? 'alert-card-critical'
    : isWarning
    ? 'alert-card-warning'
    : 'alert-card-info';

  const iconColor = isCritical
    ? 'text-[#dc2626]'
    : isWarning
    ? 'text-[#d97706]'
    : 'text-[#0284c7]';

  const cityLabel =
    alert.city === 'ushuaia'
      ? 'Ushuaia'
      : alert.city === 'rio_grande'
      ? 'Río Grande'
      : alert.city === 'tolhuin'
      ? 'Tolhuin'
      : 'TDF';

  return (
    <div className={`rounded-xl ${compact ? 'px-3 py-2 sm:px-3.5 sm:py-2.5' : 'p-4'} ${cardClass} transition-colors`}>
      <div className="flex items-start gap-2.5">
        <div className={`mt-0.5 shrink-0 ${iconColor}`}>
          {alert.severity === 'info' ? (
            <Info className="w-4 h-4 stroke-[1.5]" />
          ) : (
            <AlertTriangle className="w-4 h-4 stroke-[1.5]" />
          )}
        </div>

        <div className="flex-1 min-w-0 space-y-0.5">
          <div className="flex flex-wrap items-center justify-between gap-1.5 text-[11px] leading-tight tabular-nums">
            <div className="flex items-center gap-1.5 min-w-0 truncate">
              <span className={`font-bold ${iconColor} shrink-0`}>
                {isCritical ? 'Crítico' : isWarning ? 'Precaución' : 'Aviso'}
              </span>
              <span className="text-text-tertiary">·</span>
              <span className="font-semibold text-text-primary truncate">{alert.issuer}</span>
              <span className="px-1.5 py-0.2 rounded bg-black/5 dark:bg-white/10 text-text-secondary font-semibold shrink-0">
                {cityLabel}
              </span>
            </div>

            <div className="hidden xs:flex items-center gap-1.5 text-text-tertiary shrink-0">
              <span className="inline-flex items-center gap-0.5">
                <Clock className="w-3 h-3 stroke-[1.5]" />
                <span>{alert.syncedAt}</span>
              </span>
              <span>·</span>
              <span>TTL {alert.ttlHours}h</span>
            </div>
          </div>

          <h3 className="text-[13px] sm:text-[14px] font-bold text-text-primary leading-snug line-clamp-1 sm:line-clamp-2">
            {toSentenceCaseTitle(alert.title)}
          </h3>
        </div>
      </div>
    </div>
  );
}

interface CyclicSlideItem {
  id: string;
  kind: 'alert' | 'ruta' | 'farmacia' | 'clima' | 'dolar';
  badgeLabel: string;
  issuer: string;
  cityLabel: string;
  title: string;
  description?: string;
  syncedAt: string;
  ttlLabel?: string;
  severity: 'critical' | 'warning' | 'info' | 'emerald';
}

export function TdfAlertsCyclicSlider({
  alerts,
  pharmaciesByCity,
  syncTime,
}: {
  alerts: TdfAlertItem[];
  pharmaciesByCity?: {
    ushuaia: PharmacyItem | null;
    rio_grande: PharmacyItem | null;
    tolhuin: PharmacyItem | null;
  };
  syncTime?: string;
}) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState(1);
  const [isPaused, setIsPaused] = useState(false);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const touchStartXRef = useRef<number | null>(null);

  const [weatherByCity, setWeatherByCity] = useState<Record<'ushuaia' | 'rio_grande' | 'tolhuin', CityWeatherSummary>>({
    ushuaia: { id: 'ushuaia', name: 'Ushuaia', temp: 6, max: 9, min: 2 },
    rio_grande: { id: 'rio_grande', name: 'Río Grande', temp: 7, max: 10, min: 1 },
    tolhuin: { id: 'tolhuin', name: 'Tolhuin', temp: 5, max: 8, min: 0 },
  });

  const [dolarData, setDolarData] = useState<DolarQuotesData>({
    oficial: { compra: 985, venta: 1025 },
    blue: { compra: 1180, venta: 1200 },
  });

  useEffect(() => {
    const loadWeatherAndDolar = async () => {
      try {
        const [wRes, dRes] = await Promise.allSettled([
          fetch('/api/weather', { cache: 'no-store' }),
          fetch('/api/dolar', { cache: 'no-store' }),
        ]);

        if (wRes.status === 'fulfilled' && wRes.value.ok) {
          const wJson = await wRes.value.json();
          if (Array.isArray(wJson)) {
            setWeatherByCity((prev) => {
              const next = { ...prev };
              for (const item of wJson) {
                const maxVal = Array.isArray(item?.daily?.temperatureMax) ? Math.round(item.daily.temperatureMax[0]) : 8;
                const minVal = Array.isArray(item?.daily?.temperatureMin) ? Math.round(item.daily.temperatureMin[0]) : 1;
                const curVal = typeof item?.current?.temperature === 'number' ? Math.round(item.current.temperature) : maxVal;

                if (item.id === 'ushuaia') {
                  next.ushuaia = { id: 'ushuaia', name: 'Ushuaia', temp: curVal, max: maxVal, min: minVal };
                } else if (item.id === 'riogrande' || item.id === 'rio_grande') {
                  next.rio_grande = { id: 'rio_grande', name: 'Río Grande', temp: curVal, max: maxVal, min: minVal };
                } else if (item.id === 'tolhuin') {
                  next.tolhuin = { id: 'tolhuin', name: 'Tolhuin', temp: curVal, max: maxVal, min: minVal };
                }
              }
              return next;
            });
          }
        }

        if (dRes.status === 'fulfilled' && dRes.value.ok) {
          const dJson = await dRes.value.json();
          if (dJson?.oficial || dJson?.blue) {
            setDolarData((prev) => ({
              oficial: dJson.oficial || prev.oficial,
              blue: dJson.blue || prev.blue,
            }));
          }
        }
      } catch {
        // Mantiene valores vigentes
      }
    };

    loadWeatherAndDolar();
    const timer = setInterval(loadWeatherAndDolar, 3 * 60 * 1000);
    return () => clearInterval(timer);
  }, []);

  const syncLabel = syncTime ? syncTime.slice(0, 5) + ' hs' : 'En vivo';
  const formatArs = (v?: number) => (typeof v === 'number' && !isNaN(v) ? `$${v.toLocaleString('es-AR')}` : '--');

  const slides: CyclicSlideItem[] = useMemo(() => {
    const list: CyclicSlideItem[] = [];

    list.push({
      id: 'slide-ruta-tdf',
      kind: 'ruta',
      badgeLabel: 'Estado de Rutas',
      issuer: 'Vialidad Nacional / Provincial',
      cityLabel: 'RN 3 · TDF',
      title: 'RN 3 habilitada con precaución en Paso Garibaldi · Tramo Río Grande – Tolhuin transitable',
      description: 'Se recomienda circular con luces bajas encendidas y respetar distancias de frenado en sectores de alta montaña.',
      syncedAt: syncLabel,
      ttlLabel: 'Vigente',
      severity: 'warning',
    });

    const uPharm = pharmaciesByCity?.ushuaia?.nombre || 'En sincronización';
    const rgPharm = pharmaciesByCity?.rio_grande?.nombre || 'En sincronización';
    const tPharm = pharmaciesByCity?.tolhuin?.nombre || 'En sincronización';

    list.push({
      id: 'slide-farmacias-tdf',
      kind: 'farmacia',
      badgeLabel: 'Farmacias de Turno',
      issuer: 'Turno 24 hs por ciudad',
      cityLabel: 'TDF',
      title: `Ushuaia: ${uPharm} · Río Grande: ${rgPharm} · Tolhuin: ${tPharm}`,
      description: 'Turnos vigentes hasta las 09:00 hs de mañana en cada localidad de la provincia.',
      syncedAt: syncLabel,
      ttlLabel: '09:00 hs',
      severity: 'emerald',
    });

    list.push({
      id: 'slide-clima-tdf',
      kind: 'clima',
      badgeLabel: 'Clima Hoy',
      issuer: 'Máxima y Mínima por ciudad',
      cityLabel: 'TDF',
      title: `Ushuaia: Máx ${weatherByCity.ushuaia.max}°C / Mín ${weatherByCity.ushuaia.min}°C · Río Grande: Máx ${weatherByCity.rio_grande.max}°C / Mín ${weatherByCity.rio_grande.min}°C · Tolhuin: Máx ${weatherByCity.tolhuin.max}°C / Mín ${weatherByCity.tolhuin.min}°C`,
      description: `Temperaturas actuales — Ushuaia: ${weatherByCity.ushuaia.temp}°C · Río Grande: ${weatherByCity.rio_grande.temp}°C · Tolhuin: ${weatherByCity.tolhuin.temp}°C.`,
      syncedAt: syncLabel,
      ttlLabel: 'Hoy',
      severity: 'info',
    });

    list.push({
      id: 'slide-dolar-oficial-blue',
      kind: 'dolar',
      badgeLabel: 'Cotización Dólar',
      issuer: 'Oficial y Blue',
      cityLabel: 'Compra / Venta',
      title: `Dólar Oficial: Compra ${formatArs(dolarData.oficial?.compra)} / Venta ${formatArs(dolarData.oficial?.venta)} · Dólar Blue: Compra ${formatArs(dolarData.blue?.compra)} / Venta ${formatArs(dolarData.blue?.venta)}`,
      description: 'Valores de referencia actualizados automáticamente desde el mercado cambiario.',
      syncedAt: syncLabel,
      ttlLabel: 'En vivo',
      severity: 'emerald',
    });

    for (const alert of alerts) {
      const cityLabel =
        alert.city === 'ushuaia'
          ? 'Ushuaia'
          : alert.city === 'rio_grande'
          ? 'Río Grande'
          : alert.city === 'tolhuin'
          ? 'Tolhuin'
          : 'TDF';

      list.push({
        id: alert.id,
        kind: 'alert',
        badgeLabel: alert.severity === 'critical' ? 'Crítico' : alert.severity === 'warning' ? 'Precaución' : 'Aviso',
        issuer: alert.issuer,
        cityLabel,
        title: toSentenceCaseTitle(alert.title),
        description: alert.description ? cleanEditorialText(alert.description) : undefined,
        syncedAt: alert.syncedAt,
        ttlLabel: `TTL ${alert.ttlHours}h`,
        severity: alert.severity,
      });
    }

    return list;
  }, [alerts, pharmaciesByCity, weatherByCity, dolarData, syncLabel]);

  const total = slides.length;

  useEffect(() => {
    if (currentIndex >= total) {
      setCurrentIndex(0);
    }
  }, [total, currentIndex]);

  const goNext = useCallback(() => {
    if (total <= 1) return;
    setDirection(1);
    setCurrentIndex((prev) => (prev + 1) % total);
  }, [total]);

  const goPrev = useCallback(() => {
    if (total <= 1) return;
    setDirection(-1);
    setCurrentIndex((prev) => (prev - 1 + total) % total);
  }, [total]);

  useEffect(() => {
    if (total <= 1 || isPaused) return;
    const interval = setInterval(goNext, 4200);
    return () => clearInterval(interval);
  }, [total, isPaused, goNext]);

  if (total === 0) return null;

  const currentSlide = slides[currentIndex] || slides[0];
  const isCritical = currentSlide.severity === 'critical';
  const isWarning = currentSlide.severity === 'warning';
  const isEmerald = currentSlide.severity === 'emerald';

  const cardClass = isCritical
    ? 'alert-card-critical'
    : isWarning
    ? 'alert-card-warning'
    : isEmerald
    ? 'bg-emerald-500/8 dark:bg-emerald-500/12 border border-emerald-500/30 border-l-4 border-l-emerald-600'
    : 'alert-card-info';

  const accentBadgeBg = isCritical
    ? 'bg-[#dc2626] text-white'
    : isWarning
    ? 'bg-[#d97706] text-white'
    : isEmerald
    ? 'bg-[#16a34a] text-white'
    : 'bg-[#0284c7] text-white';

  const renderSlideIcon = (kind: CyclicSlideItem['kind'], sev: CyclicSlideItem['severity']) => {
    if (kind === 'ruta') return <Car className="w-3.5 h-3.5 stroke-[2] shrink-0" />;
    if (kind === 'farmacia') return <Cross className="w-3.5 h-3.5 stroke-[2] shrink-0" />;
    if (kind === 'clima') return <Thermometer className="w-3.5 h-3.5 stroke-[2] shrink-0" />;
    if (kind === 'dolar') return <TrendingUp className="w-3.5 h-3.5 stroke-[2] shrink-0" />;
    return sev === 'info' ? (
      <Info className="w-3.5 h-3.5 stroke-[2] shrink-0" />
    ) : (
      <AlertTriangle className="w-3.5 h-3.5 stroke-[2] shrink-0" />
    );
  };

  return (
    <section
      aria-label="Slider cíclico de estado de rutas, farmacias, clima, dólar y alertas de Tierra del Fuego"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onTouchStart={(e) => {
        touchStartXRef.current = e.touches[0]?.clientX ?? null;
        setIsPaused(true);
      }}
      onTouchEnd={(e) => {
        const startX = touchStartXRef.current;
        const endX = e.changedTouches[0]?.clientX ?? null;
        if (startX !== null && endX !== null) {
          const delta = startX - endX;
          if (Math.abs(delta) > 35) {
            if (delta > 0) goNext();
            else goPrev();
          }
        }
        touchStartXRef.current = null;
        setTimeout(() => setIsPaused(false), 2500);
      }}
      className="relative select-none"
    >
      <div className={`rounded-xl px-2.5 py-2 sm:px-3.5 sm:py-2.5 ${cardClass} shadow-xs overflow-hidden transition-colors`}>
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5 min-w-0 flex-1 overflow-hidden">
            <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider shrink-0 ${accentBadgeBg}`}>
              {renderSlideIcon(currentSlide.kind, currentSlide.severity)}
              <span>{currentSlide.badgeLabel}</span>
            </span>

            <span className="px-1.5 py-0.5 rounded bg-black/10 dark:bg-white/10 text-text-primary text-[10px] font-bold shrink-0 tabular-nums">
              {currentSlide.cityLabel}
            </span>

            <span className="hidden md:inline text-[11px] font-semibold text-text-secondary truncate shrink-0">
              {currentSlide.issuer} ·
            </span>

            <div className="min-w-0 flex-1 overflow-hidden">
              <AnimatePresence mode="wait" initial={false}>
                <motion.div
                  key={currentSlide.id}
                  initial={{ opacity: 0, x: direction > 0 ? 18 : -18 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: direction > 0 ? -18 : 18 }}
                  transition={{ duration: 0.22, ease: 'easeOut' }}
                  onClick={() => setIsDetailOpen((prev) => !prev)}
                  className="cursor-pointer"
                  title="Tocar para desplegar detalle completo"
                >
                  <p className="text-[12px] sm:text-[13px] font-bold text-text-primary truncate leading-snug">
                    {currentSlide.title}
                  </p>
                </motion.div>
              </AnimatePresence>
            </div>
          </div>

          <div className="flex items-center gap-1 shrink-0 tabular-nums">
            <span className="hidden lg:inline-flex items-center gap-1 text-[10px] text-text-tertiary mr-1">
              <Clock className="w-3 h-3 stroke-[1.5]" />
              <span>{currentSlide.syncedAt}</span>
            </span>

            {total > 1 && (
              <>
                <span className="text-[10px] font-bold text-text-secondary px-1">
                  {currentIndex + 1}/{total}
                </span>

                <button
                  type="button"
                  onClick={goPrev}
                  className="p-1 rounded-md hover:bg-black/10 dark:hover:bg-white/10 text-text-secondary transition-colors cursor-pointer"
                  aria-label="Tarjeta anterior"
                  title="Anterior"
                >
                  <ChevronLeft className="w-3.5 h-3.5 stroke-[2]" />
                </button>

                <button
                  type="button"
                  onClick={() => setIsPaused((p) => !p)}
                  className="hidden xs:inline-flex p-1 rounded-md hover:bg-black/10 dark:hover:bg-white/10 text-text-secondary transition-colors cursor-pointer"
                  aria-label={isPaused ? 'Reanudar slider' : 'Pausar slider'}
                  title={isPaused ? 'Reanudar giro automático' : 'Pausar giro automático'}
                >
                  {isPaused ? (
                    <Play className="w-3 h-3 stroke-[2]" />
                  ) : (
                    <Pause className="w-3 h-3 stroke-[2]" />
                  )}
                </button>

                <button
                  type="button"
                  onClick={goNext}
                  className="p-1 rounded-md hover:bg-black/10 dark:hover:bg-white/10 text-text-secondary transition-colors cursor-pointer"
                  aria-label="Siguiente tarjeta"
                  title="Siguiente"
                >
                  <ChevronRight className="w-3.5 h-3.5 stroke-[2]" />
                </button>
              </>
            )}
          </div>
        </div>

        <AnimatePresence>
          {isDetailOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.18 }}
              className="overflow-hidden"
            >
              <div className="pt-2 mt-1.5 border-t border-black/10 dark:border-white/10 flex flex-col gap-1 text-[11px] sm:text-[12px] text-text-secondary">
                <p className="font-semibold text-text-primary leading-snug">
                  {currentSlide.title}
                </p>
                {currentSlide.description && (
                  <p className="leading-relaxed">
                    {currentSlide.description}
                  </p>
                )}
                <div className="flex flex-wrap items-center justify-between gap-2 text-[10px] text-text-tertiary tabular-nums pt-0.5">
                  <span>Fuente: {currentSlide.issuer}</span>
                  <span>Sincronizado: {currentSlide.syncedAt} {currentSlide.ttlLabel ? `· ${currentSlide.ttlLabel}` : ''}</span>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {total > 1 && (
          <div className="flex items-center justify-center gap-1 mt-1.5">
            {slides.map((s, idx) => (
              <button
                key={s.id}
                type="button"
                onClick={() => {
                  setDirection(idx > currentIndex ? 1 : -1);
                  setCurrentIndex(idx);
                }}
                aria-label={`Ir a tarjeta ${idx + 1}: ${s.badgeLabel}`}
                className={`h-1 rounded-full transition-all cursor-pointer ${
                  idx === currentIndex
                    ? isCritical
                      ? 'w-4 bg-[#dc2626]'
                      : isWarning
                      ? 'w-4 bg-[#d97706]'
                      : isEmerald
                      ? 'w-4 bg-[#16a34a]'
                      : 'w-4 bg-[#0284c7]'
                    : 'w-1.5 bg-black/20 dark:bg-white/20'
                }`}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

export default function TdfThreeTierFeed({
  articles,
  feedsMap,
  selectedCity,
  onSelectArticle,
  syncTime,
  readArticleIds,
  onMarkArticleRead,
  showDailySummary = true,
}: TdfThreeTierFeedProps) {
  const [isDailySummaryOpen, setIsDailySummaryOpen] = useState(false);

  // Estado local de artículos leídos (al ingresar a la nota completa) y escroleados
  const [localReadIds, setLocalReadIds] = useState<Set<string>>(() => new Set());
  const [scrolledIds, setScrolledIds] = useState<Set<string>>(() => new Set());
  const [failedImages, setFailedImages] = useState<Set<string>>(() => new Set());

  const seenInViewportRef = useRef<Set<string>>(new Set());
  const feedContainerRef = useRef<HTMLDivElement | null>(null);

  // Cargar historial de notas leídas y escroleadas desde localStorage
  useEffect(() => {
    try {
      const savedRead = localStorage.getItem('wikiapp_tdf_read_ids');
      if (savedRead) {
        const parsed = JSON.parse(savedRead);
        if (Array.isArray(parsed)) {
          setLocalReadIds(new Set(parsed));
        }
      }
      const savedScrolled = sessionStorage.getItem('wikiapp_tdf_scrolled_ids');
      if (savedScrolled) {
        const parsedScrolled = JSON.parse(savedScrolled);
        if (Array.isArray(parsedScrolled)) {
          setScrolledIds(new Set(parsedScrolled));
        }
      }
    } catch {
      // ignore storage errors
    }
  }, []);

  // Deduplicación por huella de texto y ordenamiento estricto: de lo más reciente a lo más antiguo
  const sortedArticles = useMemo(() => {
    const deduplicated = deduplicateAndEnrichArticles(articles, feedsMap);

    const filteredByCity =
      selectedCity === 'all'
        ? deduplicated
        : deduplicated.filter((art) => {
            const feed = feedsMap.get(art.sourceId);
            const isProvincial =
              feed?.scope === 'provincial' ||
              art.sourceId.includes('tdf') ||
              art.sourceId.includes('ushuaia') ||
              art.sourceId.includes('findelmundo') ||
              art.sourceId.includes('tolhuin') ||
              art.sourceId.includes('radio-nacional');
            return !isProvincial || art.detectedCity === selectedCity;
          });

    const list = filteredByCity.length > 0 ? filteredByCity : deduplicated;

    return [...list].sort((a, b) => {
      const timeA = new Date(a.pubDate).getTime() || 0;
      const timeB = new Date(b.pubDate).getTime() || 0;
      return timeB - timeA;
    });
  }, [articles, feedsMap, selectedCity]);

  // Detectar scroll para aplicar el cambio de opacidad a los artículos ya escroleados
  useEffect(() => {
    const container = feedContainerRef.current;
    if (!container) return;

    const scrollParent =
      (container.closest('.overflow-y-auto') as HTMLElement | null) || window;

    const checkScrolledArticles = () => {
      if (!feedContainerRef.current) return;
      const nodes = feedContainerRef.current.querySelectorAll<HTMLElement>('[data-article-id]');
      const newlyScrolled: string[] = [];

      nodes.forEach((node) => {
        const id = node.getAttribute('data-article-id');
        if (!id) return;
        const rect = node.getBoundingClientRect();

        // Si el artículo está visible en pantalla, registrarlo como visto en viewport
        if (rect.top < window.innerHeight - 60 && rect.bottom > 80) {
          seenInViewportRef.current.add(id);
        }

        // Si ya pasó hacia arriba por el scroll (o fue visto y el usuario siguió bajando)
        if (rect.bottom < 220 || (seenInViewportRef.current.has(id) && rect.top < 95)) {
          newlyScrolled.push(id);
        }
      });

      if (newlyScrolled.length > 0) {
        setScrolledIds((prev) => {
          let changed = false;
          const next = new Set(prev);
          for (const id of newlyScrolled) {
            if (!next.has(id)) {
              next.add(id);
              changed = true;
            }
          }
          if (changed) {
            try {
              sessionStorage.setItem(
                'wikiapp_tdf_scrolled_ids',
                JSON.stringify(Array.from(next).slice(-300))
              );
            } catch {
              // ignore
            }
            return next;
          }
          return prev;
        });
      }
    };

    checkScrolledArticles();
    scrollParent.addEventListener('scroll', checkScrolledArticles, { passive: true });
    window.addEventListener('scroll', checkScrolledArticles, { passive: true });

    return () => {
      scrollParent.removeEventListener('scroll', checkScrolledArticles);
      window.removeEventListener('scroll', checkScrolledArticles);
    };
  }, [sortedArticles]);

  const handleOpenArticle = useCallback(
    (art: DeduplicatedArticle) => {
      setLocalReadIds((prev) => {
        const next = new Set(prev);
        next.add(art.id);
        if (art.link) next.add(art.link);
        try {
          localStorage.setItem(
            'wikiapp_tdf_read_ids',
            JSON.stringify(Array.from(next).slice(-500))
          );
        } catch {
          // ignore
        }
        return next;
      });
      if (onMarkArticleRead) {
        onMarkArticleRead(art.id);
      }
      onSelectArticle(art);
    },
    [onMarkArticleRead, onSelectArticle]
  );

  const isArticleRead = useCallback(
    (art: DeduplicatedArticle) => {
      return (
        localReadIds.has(art.id) ||
        (Boolean(art.link) && localReadIds.has(art.link)) ||
        Boolean(readArticleIds?.has(art.id)) ||
        (Boolean(art.link) && Boolean(readArticleIds?.has(art.link)))
      );
    },
    [localReadIds, readArticleIds]
  );

  return (
    <div ref={feedContainerRef} className="space-y-4 sm:space-y-5">
      {/* RESUMEN DEL DÍA DESPLEGABLE */}
      {showDailySummary && sortedArticles.length > 0 && (
        <div className="bg-surface-elevated border border-border-subtle rounded-xl overflow-hidden shadow-xs">
          <button
            type="button"
            onClick={() => setIsDailySummaryOpen(!isDailySummaryOpen)}
            className="w-full flex items-center justify-between px-3.5 py-2.5 sm:px-4 sm:py-3 text-left hover:bg-surface-sunken/60 transition-colors cursor-pointer"
          >
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4 stroke-[1.5] text-[#0f4c81] dark:text-sky-400 shrink-0" />
              <div>
                <span className="text-[13px] sm:text-[14px] font-bold text-text-primary">
                  Resumen del día en Tierra del Fuego
                </span>
                <span className="hidden sm:inline text-[12px] text-text-tertiary ml-2 tabular-nums">
                  · Síntesis rápida de {Math.min(4, sortedArticles.length)} titulares recientes ({syncTime ? syncTime.slice(0, 5) + ' hs' : 'al día'})
                </span>
              </div>
            </div>
            <div className="flex items-center gap-1 text-[12px] font-semibold text-[#0f4c81] dark:text-sky-400 shrink-0">
              <span>{isDailySummaryOpen ? 'Ocultar' : '30 seg'}</span>
              {isDailySummaryOpen ? (
                <ChevronUp className="w-4 h-4 stroke-[1.5]" />
              ) : (
                <ChevronDown className="w-4 h-4 stroke-[1.5]" />
              )}
            </div>
          </button>

          {isDailySummaryOpen && (
            <div className="px-4 pb-4 pt-2 border-t border-border-subtle bg-surface-sunken/30 space-y-2.5">
              <ul className="space-y-2">
                {sortedArticles.slice(0, 4).map((item, idx) => {
                  const read = isArticleRead(item);
                  return (
                    <li
                      key={`summary-${item.id}`}
                      onClick={() => handleOpenArticle(item)}
                      className={`flex items-start gap-2.5 text-[14px] cursor-pointer group transition-opacity ${
                        read ? 'opacity-60 hover:opacity-100' : ''
                      }`}
                    >
                      <span className="w-5 h-5 rounded-full bg-[#0f4c81]/10 dark:bg-sky-400/15 text-[#0f4c81] dark:text-sky-300 text-[12px] font-bold flex items-center justify-center shrink-0 mt-0.5 tabular-nums">
                        {read ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /> : idx + 1}
                      </span>
                      <div className="min-w-0 flex-1">
                        <span className="font-semibold text-text-primary group-hover:text-[#0f4c81] dark:group-hover:text-sky-400 transition-colors">
                          {toSentenceCaseTitle(item.cleanTitle)}
                        </span>
                        <span className="text-[12px] text-text-tertiary ml-2 tabular-nums">
                          ({item.groupedSources.join(' + ')} · {formatIssuedDateTime(item.pubDate)})
                        </span>
                      </div>
                    </li>
                  );
                })}
              </ul>
            </div>
          )}
        </div>
      )}

      {/* FLUJO UNIFICADO DE TODOS LOS ARTÍCULOS (DE LO MÁS RECIENTE A LO MÁS ANTIGUO):
          - CON IMAGEN: Estilo Tarjeta con título, fuente y fecha de emisión encima de la imagen (con sombreado de fondo) y debajo de la fuente los 2 íconos pequeños de WhatsApp y Telegram.
          - SIN IMAGEN: Estilo Lista compacta. */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-5">
        {sortedArticles.map((art) => {
          const hasValidImage = Boolean(art.thumbnail) && !failedImages.has(art.id);
          const isRead = isArticleRead(art);
          const isScrolled = scrolledIds.has(art.id);
          const isDimmed = isRead || isScrolled;
          const issuedLabel = formatIssuedDateTime(art.pubDate);
          const primarySource = art.groupedSources[0] || 'Medio TDF';
          const titleText = toSentenceCaseTitle(art.cleanTitle);

          // 1. ESTILO TARJETA (CUANDO TIENE IMAGEN)
          if (hasValidImage) {
            return (
              <article
                key={art.id}
                data-article-id={art.id}
                onClick={() => handleOpenArticle(art)}
                className={`relative rounded-2xl overflow-hidden aspect-[16/10] sm:aspect-[16/9] min-h-[235px] sm:min-h-[255px] bg-slate-900 border border-border-subtle hover:border-[#0f4c81]/60 shadow-md hover:shadow-xl cursor-pointer group select-none transition-all duration-300 ${
                  isDimmed ? 'opacity-55 hover:opacity-100' : 'opacity-100'
                }`}
              >
                {/* Imagen de fondo a tarjeta completa */}
                <img
                  src={art.thumbnail}
                  alt={titleText}
                  loading="lazy"
                  decoding="async"
                  onError={() => {
                    setFailedImages((prev) => {
                      const next = new Set(prev);
                      next.add(art.id);
                      return next;
                    });
                  }}
                  className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                />

                {/* Leve sombreado general sobre la imagen para garantizar contraste */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/45 to-black/35 pointer-events-none" />

                {/* Contenido superpuesto encima de la imagen */}
                <div className="relative z-10 h-full w-full p-3.5 sm:p-4 flex flex-col justify-between gap-2">
                  {/* Parte superior: Fuente + Fecha de emitida la noticia, y debajo de la fuente los 2 íconos chiquitos (WhatsApp y Telegram) + Check de leído */}
                  <div className="flex items-start justify-between gap-2">
                    <div className="bg-black/55 backdrop-blur-[2px] px-2.5 py-1.5 rounded-xl border border-white/15 shadow-sm max-w-[82%]">
                      <div className="flex flex-wrap items-center gap-1.5 text-[11px] leading-tight tabular-nums">
                        <span className="font-bold text-sky-300 truncate max-w-[180px]">
                          {primarySource}
                        </span>
                        {art.groupedSources.length > 1 && (
                          <span
                            className="inline-flex items-center gap-0.5 px-1.5 py-0.2 rounded bg-white/15 text-white text-[10px] font-semibold shrink-0"
                            title={`También en: ${art.groupedSources.slice(1).join(', ')}`}
                          >
                            <Layers className="w-2.5 h-2.5" />+{art.groupedSources.length - 1}
                          </span>
                        )}
                        <span className="text-white/60">·</span>
                        <time className="text-white/90 font-medium shrink-0">
                          {issuedLabel}
                        </time>
                      </div>

                      {/* Debajo de la fuente: los dos íconos chiquitos para compartir por WhatsApp y Telegram */}
                      <div className="flex items-center gap-1.5 mt-1.5">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            window.open(
                              `https://wa.me/?text=${encodeURIComponent(
                                titleText + ' ' + art.link
                              )}`,
                              '_blank'
                            );
                          }}
                          className="p-1 rounded-md bg-emerald-500/25 hover:bg-emerald-500 text-emerald-300 hover:text-white border border-emerald-400/30 transition-colors cursor-pointer"
                          title="Compartir en WhatsApp"
                          aria-label="Compartir en WhatsApp"
                        >
                          <MessageCircle className="w-3 h-3 stroke-[2]" />
                        </button>

                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            shareToTelegram({
                              url: art.link,
                              title: titleText,
                              excerpt: art.cleanDescription,
                              source: art.groupedSources.join(', '),
                              date: issuedLabel,
                            });
                          }}
                          className="p-1 rounded-md bg-sky-500/25 hover:bg-sky-500 text-sky-300 hover:text-white border border-sky-400/30 transition-colors cursor-pointer"
                          title={
                            isValidUrl(art.link)
                              ? 'Compartir en Telegram (Instant View)'
                              : 'Compartir en Telegram'
                          }
                          aria-label="Compartir en Telegram"
                        >
                          <Send className="w-3 h-3 stroke-[2]" />
                        </button>
                      </div>
                    </div>

                    {/* Ícono de punto estilo checklist o tilde de leído */}
                    <div className="shrink-0">
                      {isRead ? (
                        <span
                          className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-emerald-500/90 text-white text-[10px] font-bold shadow-md backdrop-blur-xs border border-emerald-300/40"
                          title="Nota completa leída"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5 stroke-[2.5]" />
                          <span className="hidden xs:inline">Leído</span>
                        </span>
                      ) : (
                        <span
                          className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-black/55 border border-white/30 backdrop-blur-xs shadow-sm"
                          title={isScrolled ? 'Artículo visto / escroleado' : 'Sin leer'}
                        >
                          <span
                            className={`w-2 h-2 rounded-full ${
                              isScrolled ? 'bg-white/45' : 'bg-sky-400'
                            }`}
                          />
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Parte inferior encima de la imagen con leve sombreado de fondo para resaltar el título */}
                  <div className="bg-black/55 backdrop-blur-[2px] px-3 py-2.5 rounded-xl border border-white/10 shadow-sm">
                    <h3 className="text-[15px] sm:text-[16px] font-bold text-white group-hover:text-sky-200 leading-snug line-clamp-3 transition-colors drop-shadow-[0_1px_2px_rgba(0,0,0,0.9)]">
                      {titleText}
                    </h3>
                  </div>
                </div>
              </article>
            );
          }

          // 2. ESTILO LISTA (EN EL CASO QUE NO TENGA IMAGEN)
          return (
            <article
              key={art.id}
              data-article-id={art.id}
              onClick={() => handleOpenArticle(art)}
              className={`col-span-full bg-surface-elevated border border-border-subtle hover:border-[#0f4c81]/50 rounded-xl px-4 py-3 sm:px-5 sm:py-3.5 shadow-xs hover:shadow-md cursor-pointer group transition-all duration-300 flex items-start justify-between gap-3 ${
                isDimmed ? 'opacity-55 hover:opacity-100' : 'opacity-100'
              }`}
            >
              <div className="min-w-0 flex-1 flex flex-col gap-1">
                {/* Fuente y fecha de emitida la noticia */}
                <div className="flex flex-wrap items-center gap-2 text-[11px] sm:text-[12px] tabular-nums">
                  <span className="font-bold text-[#0f4c81] dark:text-sky-400">
                    {primarySource}
                  </span>
                  {art.groupedSources.length > 1 && (
                    <span
                      className="inline-flex items-center gap-0.5 px-1.5 py-0.2 rounded bg-surface-sunken text-text-secondary text-[10px] font-semibold"
                      title={`También en: ${art.groupedSources.slice(1).join(', ')}`}
                    >
                      <Layers className="w-2.5 h-2.5" />+{art.groupedSources.length - 1}
                    </span>
                  )}
                  <span className="text-text-tertiary">·</span>
                  <time className="text-text-tertiary font-medium">
                    {issuedLabel}
                  </time>
                </div>

                {/* Debajo de la fuente: los dos íconos chiquitos para compartir por WhatsApp y Telegram */}
                <div className="flex items-center gap-1.5 mt-0.5">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      window.open(
                        `https://wa.me/?text=${encodeURIComponent(
                          titleText + ' ' + art.link
                        )}`,
                        '_blank'
                      );
                    }}
                    className="p-1 rounded-md bg-emerald-500/10 hover:bg-emerald-500 text-emerald-600 dark:text-emerald-400 hover:text-white border border-emerald-500/25 transition-colors cursor-pointer"
                    title="Compartir en WhatsApp"
                    aria-label="Compartir en WhatsApp"
                  >
                    <MessageCircle className="w-3 h-3 stroke-[2]" />
                  </button>

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      shareToTelegram({
                        url: art.link,
                        title: titleText,
                        excerpt: art.cleanDescription,
                        source: art.groupedSources.join(', '),
                        date: issuedLabel,
                      });
                    }}
                    className="p-1 rounded-md bg-sky-500/10 hover:bg-sky-500 text-sky-600 dark:text-sky-400 hover:text-white border border-sky-500/25 transition-colors cursor-pointer"
                    title={
                      isValidUrl(art.link)
                        ? 'Compartir en Telegram (Instant View)'
                        : 'Compartir en Telegram'
                    }
                    aria-label="Compartir en Telegram"
                  >
                    <Send className="w-3 h-3 stroke-[2]" />
                  </button>
                </div>

                {/* Título de la noticia */}
                <h3 className="text-[15px] sm:text-[16px] font-bold text-text-primary group-hover:text-[#0f4c81] dark:group-hover:text-sky-400 leading-snug mt-1 transition-colors">
                  {titleText}
                </h3>
              </div>

              {/* Ícono de punto estilo checklist o tilde de leído */}
              <div className="shrink-0 pt-0.5">
                {isRead ? (
                  <span
                    className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 text-[10px] font-bold"
                    title="Nota completa leída"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5 stroke-[2.2]" />
                    <span className="hidden xs:inline">Leído</span>
                  </span>
                ) : (
                  <span
                    className="inline-flex items-center justify-center w-5 h-5 rounded-full border border-slate-300 dark:border-white/20"
                    title={isScrolled ? 'Artículo visto / escroleado' : 'Sin leer'}
                  >
                    <span
                      className={`w-2 h-2 rounded-full ${
                        isScrolled
                          ? 'bg-slate-300 dark:bg-white/25'
                          : 'bg-[#0f4c81] dark:bg-sky-400'
                      }`}
                    />
                  </span>
                )}
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
}
