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
  MapPin,
  FileText,
  MessageCircle,
  Send,
  Layers,
  CheckCircle2,
  Pause,
  Play
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import type { Article, FeedSource } from '@/types';
import {
  type TdfCity,
  type TdfAlertItem,
  type DeduplicatedArticle,
  deduplicateAndEnrichArticles,
  toSentenceCaseTitle
} from '@/utils/tdfIntelligence';
import { shareToTelegram, isValidUrl } from '@/utils/telegramInstantView';

interface TdfThreeTierFeedProps {
  articles: Article[];
  feedsMap: Map<string, FeedSource>;
  selectedCity: TdfCity;
  activeCategory: string;
  activeAlerts: TdfAlertItem[];
  onSelectArticle: (article: Article) => void;
  syncTime: string;
}

/**
 * Formatea la hora en formato tabular corto (ej. "14:20 hs" o "Hace 2 h")
 */
function formatTabularTime(isoString: string): string {
  try {
    const d = new Date(isoString);
    if (isNaN(d.getTime())) return 'Reciente';
    const diffHours = Math.floor((Date.now() - d.getTime()) / (1000 * 60 * 60));
    const hhmm = d.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' });
    if (diffHours < 18) return `${hhmm} hs`;
    return `${d.toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit' })} · ${hhmm}`;
  } catch {
    return 'Reciente';
  }
}

function getCurrentTimeSlotLabel(): string {
  const hour = new Date().getHours();
  if (hour >= 6 && hour < 13) return 'Franja Mañana';
  if (hour >= 13 && hour < 20) return 'Franja Tarde';
  return 'Franja Noche';
}

/**
 * 3. TARJETA DE ALERTA COMPACTA CON SLIDER CÍCLICO Y AUTOMÁTICO PARA TIERRA DEL FUEGO
 * - Diseño de tarjeta pequeña que no roba pantalla en dispositivos móviles.
 * - Pasa todas las alertas vigentes de manera cíclica y automática (cada 4.5s) con soporte táctil (swipe).
 * - Conserva el fondo tintado semántico (--color-alert-critical/warning/info), ícono lineal 1.5px,
 *   título en mayúscula de sentencia, organismo oficial, hora de sincronización y TTL, sin botones de compartir.
 */
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

export function TdfAlertsCyclicSlider({ alerts }: { alerts: TdfAlertItem[] }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState(1);
  const [isPaused, setIsPaused] = useState(false);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const touchStartXRef = useRef<number | null>(null);

  const total = alerts.length;
  const safeIndex = total > 0 ? currentIndex % total : 0;
  const currentAlert = alerts[safeIndex];

  const handleNext = useCallback(() => {
    if (total <= 1) return;
    setDirection(1);
    setCurrentIndex((prev) => (prev + 1) % total);
  }, [total]);

  const handlePrev = useCallback(() => {
    if (total <= 1) return;
    setDirection(-1);
    setCurrentIndex((prev) => (prev - 1 + total) % total);
  }, [total]);

  // Rotación cíclica y automática cada 4.5 segundos
  useEffect(() => {
    if (total <= 1 || isPaused) return;
    const timer = setInterval(() => {
      handleNext();
    }, 4500);
    return () => clearInterval(timer);
  }, [total, isPaused, handleNext]);

  if (!currentAlert) return null;

  const isCritical = currentAlert.severity === 'critical';
  const isWarning = currentAlert.severity === 'warning';

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

  const badgeBg = isCritical
    ? 'bg-[#dc2626] text-white'
    : isWarning
    ? 'bg-[#d97706] text-white'
    : 'bg-[#0284c7] text-white';

  const cityLabel =
    currentAlert.city === 'ushuaia'
      ? 'Ushuaia'
      : currentAlert.city === 'rio_grande'
      ? 'Río Grande'
      : currentAlert.city === 'tolhuin'
      ? 'Tolhuin'
      : 'TDF';

  return (
    <section
      aria-label="Slider cíclico de alertas vigentes en Tierra del Fuego"
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
          const delta = endX - startX;
          if (Math.abs(delta) > 36) {
            if (delta < 0) handleNext();
            else handlePrev();
          }
        }
        touchStartXRef.current = null;
        setTimeout(() => setIsPaused(false), 2500);
      }}
      className={`relative overflow-hidden rounded-xl px-3 py-2 sm:px-3.5 sm:py-2.5 ${cardClass} shadow-xs transition-colors select-none`}
    >
      {/* Fila superior compacta: Nivel + Emisor + Ciudad + Sincronización/TTL + Controles del Slider */}
      <div className="flex items-center justify-between gap-1.5 mb-1 text-[11px] leading-none tabular-nums">
        <div className="flex items-center gap-1.5 min-w-0 overflow-hidden">
          <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide shrink-0 ${badgeBg}`}>
            {currentAlert.severity === 'info' ? (
              <Info className="w-3 h-3 stroke-[1.75]" />
            ) : (
              <AlertTriangle className="w-3 h-3 stroke-[1.75]" />
            )}
            <span>{isCritical ? 'Crítico' : isWarning ? 'Precaución' : 'Aviso'}</span>
          </span>

          <span className="font-bold text-text-primary truncate">
            {currentAlert.issuer}
          </span>

          <span className="px-1.5 py-0.5 rounded bg-black/5 dark:bg-white/10 text-text-secondary font-semibold shrink-0">
            {cityLabel}
          </span>

          <span className="hidden md:inline-flex items-center gap-1 text-text-tertiary shrink-0">
            <span>·</span>
            <Clock className="w-3 h-3 stroke-[1.5]" />
            <span>Sinc: <strong className="text-text-secondary">{currentAlert.syncedAt}</strong></span>
            <span>·</span>
            <span>TTL {currentAlert.ttlHours}h</span>
          </span>
        </div>

        {/* Controles compactos del slider cíclico */}
        <div className="flex items-center gap-1 shrink-0">
          <span className="text-[10px] font-semibold text-text-tertiary px-1 tabular-nums">
            {safeIndex + 1}/{total}
          </span>

          {total > 1 && (
            <>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handlePrev();
                }}
                className="p-1 rounded-md hover:bg-black/10 dark:hover:bg-white/10 text-text-secondary transition-colors cursor-pointer"
                aria-label="Alerta anterior"
                title="Alerta anterior"
              >
                <ChevronLeft className="w-3.5 h-3.5 stroke-[1.5]" />
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setIsPaused((p) => !p);
                }}
                className="p-1 rounded-md hover:bg-black/10 dark:hover:bg-white/10 text-text-secondary transition-colors cursor-pointer"
                aria-label={isPaused ? 'Reanudar rotación automática' : 'Pausar rotación automática'}
                title={isPaused ? 'Reanudar slider automático' : 'Pausar slider automático'}
              >
                {isPaused ? (
                  <Play className="w-3 h-3 stroke-[1.5]" />
                ) : (
                  <Pause className="w-3 h-3 stroke-[1.5]" />
                )}
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleNext();
                }}
                className="p-1 rounded-md hover:bg-black/10 dark:hover:bg-white/10 text-text-secondary transition-colors cursor-pointer"
                aria-label="Siguiente alerta"
                title="Siguiente alerta"
              >
                <ChevronRight className="w-3.5 h-3.5 stroke-[1.5]" />
              </button>
            </>
          )}
        </div>
      </div>

      {/* Cuerpo deslizable ultra-compacto para móviles */}
      <div
        onClick={() => setIsDetailOpen((prev) => !prev)}
        className="relative min-h-[22px] flex items-center justify-between gap-2 cursor-pointer"
        title="Tocar para ver u ocultar detalle completo de la alerta"
      >
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={currentAlert.id}
            initial={{ opacity: 0, x: direction * 24 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: direction * -24 }}
            transition={{ duration: 0.24, ease: 'easeOut' }}
            className="flex-1 min-w-0"
          >
            <h3
              className={`text-[13px] sm:text-[14px] font-bold text-text-primary leading-snug ${
                isDetailOpen ? '' : 'line-clamp-1 sm:line-clamp-1'
              }`}
            >
              {toSentenceCaseTitle(currentAlert.title)}
            </h3>

            {isDetailOpen && (
              <div className="mt-1 space-y-1">
                {currentAlert.description && currentAlert.description !== currentAlert.title && (
                  <p className="text-[12px] text-text-secondary leading-relaxed">
                    {currentAlert.description}
                  </p>
                )}
                <div className="flex flex-wrap items-center gap-2 text-[11px] text-text-tertiary tabular-nums md:hidden">
                  <span className="inline-flex items-center gap-1">
                    <Clock className="w-3 h-3 stroke-[1.5]" />
                    Sincronizado: <strong className="text-text-secondary">{currentAlert.syncedAt}</strong>
                  </span>
                  <span>·</span>
                  <span>Vigencia TTL: {currentAlert.ttlHours}h</span>
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>

        {/* Indicadores de puntos + chevron de detalle */}
        <div className="flex items-center gap-1.5 shrink-0">
          {total > 1 && (
            <div className="hidden sm:flex items-center gap-1">
              {alerts.map((a, idx) => (
                <button
                  key={a.id}
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setDirection(idx > safeIndex ? 1 : -1);
                    setCurrentIndex(idx);
                  }}
                  aria-label={`Ir a alerta ${idx + 1}`}
                  className={`h-1.5 rounded-full transition-all cursor-pointer ${
                    idx === safeIndex
                      ? `w-4 ${isCritical ? 'bg-[#dc2626]' : isWarning ? 'bg-[#d97706]' : 'bg-[#0284c7]'}`
                      : 'w-1.5 bg-black/15 dark:bg-white/20'
                  }`}
                />
              ))}
            </div>
          )}
          <span className={`text-text-tertiary ${iconColor}`}>
            {isDetailOpen ? (
              <ChevronUp className="w-3.5 h-3.5 stroke-[1.5]" />
            ) : (
              <ChevronDown className="w-3.5 h-3.5 stroke-[1.5]" />
            )}
          </span>
        </div>
      </div>
    </section>
  );
}

export default function TdfThreeTierFeed({
  articles,
  feedsMap,
  selectedCity,
  activeCategory,
  activeAlerts,
  onSelectArticle,
  syncTime,
}: TdfThreeTierFeedProps) {
  // Nivel 3 ("Otras noticias" nacionales e internacionales) colapsado por defecto
  const [isOtherNewsExpanded, setIsOtherNewsExpanded] = useState(false);
  // Resumen automático del día desplegable
  const [isDailySummaryOpen, setIsDailySummaryOpen] = useState(false);

  // Deduplicación por huella de texto (fingerprint) y enriquecimiento territorial
  const deduplicated = useMemo(
    () => deduplicateAndEnrichArticles(articles, feedsMap),
    [articles, feedsMap]
  );

  // Separar noticias locales de Tierra del Fuego vs Cables Nacionales/Internacionales
  const { localTdfArticles, nationalAndIntlCables } = useMemo(() => {
    const local: DeduplicatedArticle[] = [];
    const cables: DeduplicatedArticle[] = [];

    for (const art of deduplicated) {
      const feed = feedsMap.get(art.sourceId);
      const scope = feed?.scope || 'provincial';
      const isProvincial =
        scope === 'provincial' ||
        art.sourceId.includes('tdf') ||
        art.sourceId.includes('ushuaia') ||
        art.sourceId.includes('findelmundo') ||
        art.sourceId.includes('tolhuin') ||
        art.sourceId.includes('radio-nacional');

      if (isProvincial) {
        if (selectedCity === 'all' || art.detectedCity === selectedCity) {
          local.push(art);
        }
      } else {
        cables.push(art);
      }
    }

    // Si los feeds provinciales están vacíos por algún filtro, usar los más recientes como respaldo
    if (local.length === 0 && deduplicated.length > 0) {
      return {
        localTdfArticles: deduplicated.slice(0, 12),
        nationalAndIntlCables: deduplicated.slice(12),
      };
    }

    return {
      localTdfArticles: local,
      nationalAndIntlCables: cables,
    };
  }, [deduplicated, feedsMap, selectedCity]);

  // Nivel 1: 1 Nota Destacada por franja horaria (con imagen grande y título a 20-24px)
  const featuredArticle = useMemo(() => {
    return localTdfArticles.find((a) => Boolean(a.thumbnail)) || localTdfArticles[0] || null;
  }, [localTdfArticles]);

  // Nivel 2: Resto de notas locales TDF agrupadas por ciudad (Ushuaia / Río Grande / Tolhuin)
  const level2ByCity = useMemo(() => {
    const remaining = localTdfArticles.filter((a) => a.id !== featuredArticle?.id);
    return {
      ushuaia: remaining.filter((a) => a.detectedCity === 'ushuaia').slice(0, 8),
      rio_grande: remaining.filter((a) => a.detectedCity === 'rio_grande').slice(0, 8),
      tolhuin: remaining.filter((a) => a.detectedCity === 'tolhuin').slice(0, 8),
    };
  }, [localTdfArticles, featuredArticle]);

  const timeSlotLabel = getCurrentTimeSlotLabel();

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* SLIDER CÍCLICO Y AUTOMÁTICO DE TARJETA COMPACTA PARA TODAS LAS ALERTAS DE TIERRA DEL FUEGO */}
      {activeAlerts.length > 0 && (
        <TdfAlertsCyclicSlider alerts={activeAlerts} />
      )}

      {/* AUTOMATIZACIÓN: RESUMEN DEL DÍA (3-5 NOTAS CLAVE + ESTADO DE RUTA) */}
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
                · Síntesis rápida de {Math.min(4, localTdfArticles.length)} titulares locales y estado vial ({syncTime ? syncTime.slice(0, 5) + ' hs' : 'al día'})
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
              {localTdfArticles.slice(0, 4).map((item, idx) => (
                <li
                  key={`summary-${item.id}`}
                  onClick={() => onSelectArticle(item)}
                  className="flex items-start gap-2.5 text-[14px] cursor-pointer group"
                >
                  <span className="w-5 h-5 rounded-full bg-[#0f4c81]/10 dark:bg-sky-400/15 text-[#0f4c81] dark:text-sky-300 text-[12px] font-bold flex items-center justify-center shrink-0 mt-0.5 tabular-nums">
                    {idx + 1}
                  </span>
                  <div className="min-w-0 flex-1">
                    <span className="font-semibold text-text-primary group-hover:text-[#0f4c81] dark:group-hover:text-sky-400 transition-colors">
                      {toSentenceCaseTitle(item.cleanTitle)}
                    </span>
                    <span className="text-[12px] text-text-tertiary ml-2 tabular-nums">
                      ({item.groupedSources.join(' + ')} · {formatTabularTime(item.pubDate)})
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* ══════════════════════════════════════════════════════════════════
          NIVEL 1 — DESTACADA: Una nota por franja horaria, imagen grande y título 20-24 px
         ══════════════════════════════════════════════════════════════════ */}
      {featuredArticle && (
        <section aria-label="Noticia destacada de la franja horaria">
          <article
            onClick={() => onSelectArticle(featuredArticle)}
            className="bg-surface-elevated border border-border-subtle rounded-2xl overflow-hidden shadow-sm hover:border-[#0f4c81]/40 transition-all cursor-pointer group"
          >
            <div className="grid grid-cols-1 lg:grid-cols-12">
              {featuredArticle.thumbnail && (
                <div className="lg:col-span-7 aspect-[16/9] lg:aspect-auto lg:min-h-[300px] overflow-hidden bg-slate-900 relative">
                  <img
                    src={featuredArticle.thumbnail}
                    alt={featuredArticle.cleanTitle}
                    loading="lazy"
                    decoding="async"
                    className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-500"
                  />
                </div>
              )}

              <div
                className={`${
                  featuredArticle.thumbnail ? 'lg:col-span-5' : 'lg:col-span-12'
                } p-5 md:p-6 flex flex-col justify-between gap-4`}
              >
                <div className="space-y-3">
                  <div className="flex flex-wrap items-center gap-2 text-[12px] tabular-nums">
                    <span className="px-2.5 py-0.5 rounded-md bg-[#0f4c81] text-white font-semibold">
                      Destacada · {timeSlotLabel}
                    </span>
                    <span className="font-semibold text-[#0f4c81] dark:text-sky-400">
                      {featuredArticle.groupedSources[0]}
                    </span>
                    {featuredArticle.groupedSources.length > 1 && (
                      <span
                        className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-surface-sunken text-text-secondary font-semibold"
                        title={`Publicado también en: ${featuredArticle.groupedSources.slice(1).join(', ')}`}
                      >
                        <Layers className="w-3 h-3 stroke-[1.5]" />
                        +{featuredArticle.groupedSources.length - 1} medios
                      </span>
                    )}
                    <span className="text-text-tertiary ml-auto">
                      {formatTabularTime(featuredArticle.pubDate)}
                    </span>
                  </div>

                  {/* Título Nivel 1 a 20–24 px (escala tipográfica estandarizada) */}
                  <h2 className="text-[20px] md:text-[24px] font-bold text-text-primary leading-[1.3] group-hover:text-[#0f4c81] dark:group-hover:text-sky-400 transition-colors">
                    {toSentenceCaseTitle(featuredArticle.cleanTitle)}
                  </h2>

                  {featuredArticle.cleanDescription && (
                    <p className="text-[16px] text-text-secondary leading-[1.5] line-clamp-3 font-normal">
                      {featuredArticle.cleanDescription}
                    </p>
                  )}
                </div>

                <div className="pt-3 border-t border-border-subtle flex items-center justify-between">
                  <span className="inline-flex items-center gap-1 text-[14px] font-semibold text-[#0f4c81] dark:text-sky-400 group-hover:underline">
                    <span>Leer nota completa</span>
                    <ChevronRight className="w-4 h-4 stroke-[1.5]" />
                  </span>

                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        window.open(
                          `https://wa.me/?text=${encodeURIComponent(
                            featuredArticle.cleanTitle + ' ' + featuredArticle.link
                          )}`,
                          '_blank'
                        );
                      }}
                      className="p-2 rounded-lg bg-surface-sunken hover:bg-emerald-500/15 text-text-secondary hover:text-emerald-600 transition-colors cursor-pointer"
                      title="Compartir nota por WhatsApp"
                    >
                      <MessageCircle className="w-4 h-4 stroke-[1.5]" />
                    </button>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        shareToTelegram({
                          url: featuredArticle.link,
                          title: featuredArticle.cleanTitle,
                          excerpt: featuredArticle.cleanDescription,
                          source: featuredArticle.groupedSources.join(', '),
                          date: featuredArticle.pubDate
                            ? new Date(featuredArticle.pubDate).toLocaleDateString('es-AR')
                            : '',
                        });
                      }}
                      className="p-2 rounded-lg bg-surface-sunken hover:bg-sky-500/15 text-text-secondary hover:text-sky-600 transition-colors cursor-pointer"
                      title={
                        isValidUrl(featuredArticle.link)
                          ? 'Compartir en Telegram con Instant View'
                          : 'Compartir en Telegram'
                      }
                    >
                      <Send className="w-4 h-4 stroke-[1.5]" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </article>
        </section>
      )}

      {/* ══════════════════════════════════════════════════════════════════
          NIVEL 2 — LOCAL TDF: Tarjetas compactas (título + fuente + hora, sin hashtags)
          agrupadas por ciudad (Ushuaia / Río Grande / Tolhuin)
         ══════════════════════════════════════════════════════════════════ */}
      <section aria-label="Noticias locales de Tierra del Fuego por ciudad" className="space-y-4">
        <div className="flex items-center justify-between border-b border-border-subtle pb-2">
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 stroke-[1.5] text-[#0f4c81] dark:text-sky-400" />
            <h2 className="text-[20px] font-bold text-text-primary">
              Panorama Local Tierra del Fuego
            </h2>
          </div>
          <span className="text-[12px] text-text-tertiary tabular-nums flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5 stroke-[1.5] text-[#16a34a]" />
            Deduplicación activa
          </span>
        </div>

        <div
          className={`grid grid-cols-1 ${
            selectedCity === 'all' ? 'lg:grid-cols-3' : 'lg:grid-cols-1'
          } gap-4`}
        >
          {(
            [
              { key: 'ushuaia', title: 'Ushuaia', subtitle: 'Capital provincial y Canal Beagle', items: level2ByCity.ushuaia },
              { key: 'rio_grande', title: 'Río Grande', subtitle: 'Zona norte y polo industrial', items: level2ByCity.rio_grande },
              { key: 'tolhuin', title: 'Tolhuin', subtitle: 'Corazón de la Isla y Lago Fagnano', items: level2ByCity.tolhuin },
            ] as const
          )
            .filter((group) => selectedCity === 'all' || selectedCity === group.key)
            .map((cityGroup) => (
              <div
                key={cityGroup.key}
                className="bg-surface-elevated border border-border-subtle rounded-xl p-4 flex flex-col gap-3 shadow-xs"
              >
                <div className="flex items-center justify-between pb-2 border-b border-border-subtle">
                  <div>
                    <h3 className="text-[16px] font-bold text-text-primary flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-[#0f4c81] dark:bg-sky-400" />
                      {cityGroup.title}
                    </h3>
                    <span className="text-[12px] text-text-tertiary">
                      {cityGroup.subtitle}
                    </span>
                  </div>
                  <span className="text-[12px] font-semibold px-2 py-0.5 rounded-md bg-surface-sunken text-text-secondary tabular-nums">
                    {cityGroup.items.length} notas
                  </span>
                </div>

                {cityGroup.items.length === 0 ? (
                  <p className="text-[14px] text-text-tertiary py-4 text-center">
                    Sin novedades recientes en esta categoría para {cityGroup.title}.
                  </p>
                ) : (
                  <div className="divide-y divide-border-subtle">
                    {cityGroup.items.map((art) => (
                      <article
                        key={art.id}
                        onClick={() => onSelectArticle(art)}
                        className="py-3 first:pt-0 last:pb-0 cursor-pointer group flex flex-col gap-1.5"
                      >
                        {/* Título limpio en 16px, sin hashtags visibles */}
                        <h4 className="text-[16px] font-semibold text-text-primary leading-[1.4] group-hover:text-[#0f4c81] dark:group-hover:text-sky-400 transition-colors">
                          {toSentenceCaseTitle(art.cleanTitle)}
                        </h4>

                        {/* Fuente(s) agrupadas + Hora tabular en 12px */}
                        <div className="flex items-center justify-between gap-2 text-[12px] text-text-tertiary tabular-nums">
                          <div className="flex items-center gap-1.5 min-w-0 truncate">
                            <span className="font-semibold text-text-secondary truncate">
                              {art.groupedSources[0]}
                            </span>
                            {art.groupedSources.length > 1 && (
                              <span
                                className="px-1.5 py-0.2 rounded bg-surface-sunken text-[#0f4c81] dark:text-sky-300 font-semibold shrink-0"
                                title={`Fuentes agrupadas: ${art.groupedSources.join(', ')}`}
                              >
                                +{art.groupedSources.length - 1}
                              </span>
                            )}
                          </div>
                          <time className="shrink-0 tabular-nums">
                            {formatTabularTime(art.pubDate)}
                          </time>
                        </div>
                      </article>
                    ))}
                  </div>
                )}
              </div>
            ))}
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════
          NIVEL 3 — CABLES NACIONALES / INTERNACIONALES:
          Lista de solo texto, colapsada bajo encabezado "Otras noticias"
         ══════════════════════════════════════════════════════════════════ */}
      {nationalAndIntlCables.length > 0 && (
        <section
          aria-label="Otras noticias nacionales e internacionales"
          className="bg-surface-elevated border border-border-subtle rounded-xl overflow-hidden shadow-xs"
        >
          <button
            type="button"
            onClick={() => setIsOtherNewsExpanded(!isOtherNewsExpanded)}
            className="w-full flex items-center justify-between px-4 py-3.5 hover:bg-surface-sunken/60 transition-colors cursor-pointer text-left"
          >
            <div className="flex items-center gap-2.5">
              <span className="text-[16px] font-bold text-text-primary">
                Otras noticias
              </span>
              <span className="text-[12px] text-text-tertiary tabular-nums">
                (Cables nacionales e internacionales · {nationalAndIntlCables.length} notas de solo texto)
              </span>
            </div>
            <div className="flex items-center gap-1.5 text-[12px] font-semibold text-text-secondary">
              <span>{isOtherNewsExpanded ? 'Colapsar lista' : 'Desplegar cables'}</span>
              {isOtherNewsExpanded ? (
                <ChevronUp className="w-4 h-4 stroke-[1.5]" />
              ) : (
                <ChevronDown className="w-4 h-4 stroke-[1.5]" />
              )}
            </div>
          </button>

          {isOtherNewsExpanded && (
            <div className="px-4 pb-4 pt-1 border-t border-border-subtle divide-y divide-border-subtle">
              {nationalAndIntlCables.slice(0, 25).map((cable) => (
                <div
                  key={cable.id}
                  onClick={() => onSelectArticle(cable)}
                  className="py-2.5 flex flex-col sm:flex-row sm:items-center justify-between gap-1 sm:gap-4 cursor-pointer group"
                >
                  <span className="text-[14px] font-normal text-text-primary group-hover:text-[#0f4c81] dark:group-hover:text-sky-400 transition-colors line-clamp-1">
                    {toSentenceCaseTitle(cable.cleanTitle)}
                  </span>
                  <div className="flex items-center gap-2 shrink-0 text-[12px] text-text-tertiary tabular-nums">
                    <span className="font-semibold text-text-secondary">
                      {cable.groupedSources.join(' + ')}
                    </span>
                    <span>·</span>
                    <time>{formatTabularTime(cable.pubDate)}</time>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      )}
    </div>
  );
}
