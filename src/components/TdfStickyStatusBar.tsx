'use client';

import React, { useState } from 'react';
import {
  Car,
  AlertTriangle,
  ShieldCheck,
  Cross,
  MapPin,
  Phone,
  Bell,
  Clock,
  ChevronDown,
  ChevronUp,
  Navigation,
  ExternalLink
} from 'lucide-react';
import type { TdfAlertItem, TdfCity } from '@/utils/tdfIntelligence';
import { triggerSegmentedCriticalPush } from '@/utils/tdfIntelligence';

interface PharmacyItem {
  fecha?: string;
  dia?: string;
  nombre: string;
  direccion: string;
  telefono: string;
  horario?: string;
}

interface TdfStickyStatusBarProps {
  selectedCity: TdfCity;
  onSelectCity: (city: TdfCity) => void;
  activeAlerts: TdfAlertItem[];
  activePharmacy: PharmacyItem | null;
  pharmacyCityName: string;
  syncTime: string;
  onDetectLocation: () => void;
  isLocating?: boolean;
}

export default function TdfStickyStatusBar({
  selectedCity,
  onSelectCity,
  activeAlerts,
  activePharmacy,
  pharmacyCityName,
  syncTime,
  onDetectLocation,
  isLocating = false,
}: TdfStickyStatusBarProps) {
  const [expandedDetail, setExpandedDetail] = useState<'ruta' | 'alerta' | 'farmacia' | null>(null);
  const [pushEnabled, setPushEnabled] = useState<boolean>(false);

  // Separar alertas críticas (Banner fijo rojo no descartable) y de precaución (Chip ámbar en franja)
  const criticalAlerts = activeAlerts.filter((a) => a.severity === 'critical');
  const warningAlerts = activeAlerts.filter((a) => a.severity === 'warning');
  const primaryAlert = criticalAlerts[0] || warningAlerts[0] || null;

  // Estado de Ruta 3 según ciudad seleccionada y alertas viales vigentes
  const getRuta3Status = () => {
    const roadCut = criticalAlerts.find((a) => a.type === 'road_cut');
    if (roadCut) {
      return {
        label: 'Corte total RN 3',
        segment: selectedCity === 'rio_grande' ? 'San Sebastián – R. Grande' : selectedCity === 'tolhuin' ? 'R. Grande – Tolhuin' : 'Paso Garibaldi',
        level: 'critical' as const,
        issuer: roadCut.issuer,
        detail: roadCut.title,
      };
    }

    if (selectedCity === 'rio_grande') {
      return {
        label: 'RN 3 Habilitada',
        segment: 'San Sebastián – Río Grande',
        level: 'ok' as const,
        issuer: 'Vialidad Nacional',
        detail: 'Calzada despejada y transitable. Precaución por ráfagas laterales en sectores descampados.',
      };
    }

    if (selectedCity === 'tolhuin') {
      return {
        label: 'RN 3 Precaución',
        segment: 'Río Grande – Tolhuin – Garibaldi',
        level: 'warning' as const,
        issuer: 'Vialidad Provincial',
        detail: 'Calzada húmeda en zona alta. Circular con luces bajas encendidas y velocidad precautoria.',
      };
    }

    // Ushuaia o Todas TDF: destaca Paso Garibaldi
    return {
      label: 'RN 3 Precaución',
      segment: 'Paso Garibaldi · Ushuaia',
      level: 'warning' as const,
      issuer: 'Vialidad Nacional',
      detail: 'Calzada transitable con precaución en zona de montaña (Paso Garibaldi). Portación de cubiertas de invierno.',
    };
  };

  const rutaStatus = getRuta3Status();
  const formattedSync = syncTime ? syncTime.slice(0, 5) + ' hs' : 'En vivo';

  const handleEnablePush = async () => {
    if (typeof window === 'undefined' || !('Notification' in window)) return;
    const perm = await Notification.requestPermission();
    if (perm === 'granted') {
      setPushEnabled(true);
      if (criticalAlerts[0]) {
        triggerSegmentedCriticalPush(criticalAlerts[0], selectedCity);
      }
    }
  };

  const cleanPhone = activePharmacy?.telefono
    ? activePharmacy.telefono.replace(/(Tel\.|Cel\.|CEL\.)/gi, '').split(/[\/–]/)[0].trim()
    : '';
  const telHref = cleanPhone.replace(/[^\d+]/g, '');

  return (
    <div className="sticky top-[56px] z-30 w-full bg-surface-elevated/95 backdrop-blur-md border-b border-border-subtle shadow-xs transition-colors">
      {/* BANNER FIJO ROJO PARA ALERTAS CRÍTICAS (NO DESCARTABLE MIENTRAS ESTÉ VIGENTE EN LA FUENTE EMISORA) */}
      {criticalAlerts.map((crit) => (
        <div
          key={crit.id}
          role="alert"
          aria-live="assertive"
          className="w-full bg-[#dc2626] text-white px-3 py-2.5 md:px-6 border-b border-red-800"
        >
          <div className="max-w-[1440px] mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="flex items-start sm:items-center gap-2.5">
              <AlertTriangle className="w-5 h-5 stroke-[1.5] shrink-0 mt-0.5 sm:mt-0" />
              <div className="text-[14px] leading-snug">
                <span className="font-bold mr-2">Alerta crítica:</span>
                <span className="font-semibold">{crit.title}</span>
              </div>
            </div>
            <div className="flex items-center gap-3 shrink-0 text-[12px] tabular-nums text-red-100">
              <span>Fuente: <strong>{crit.issuer}</strong></span>
              <span>·</span>
              <span>Sincronizado: {crit.syncedAt}</span>
              <span>·</span>
              <span>Vigencia TTL: {crit.ttlHours}h</span>
            </div>
          </div>
        </div>
      ))}

      {/* FRANJA HORIZONTAL ÚNICA CON LOS 3 INDICADORES DE UN VISTAZO */}
      <div className="max-w-[1440px] mx-auto px-3 py-2 md:px-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-2 items-center">
          {/* Selector rápido de Ciudad / Geolocalización (Col 3) */}
          <div className="lg:col-span-3 flex items-center justify-between lg:justify-start gap-1.5 border-b lg:border-b-0 lg:border-r border-border-subtle pb-1.5 lg:pb-0 lg:pr-3">
            <button
              type="button"
              onClick={onDetectLocation}
              className="inline-flex items-center gap-1 px-2 py-1 rounded-lg text-[12px] font-semibold bg-surface-sunken hover:bg-slate-200 dark:hover:bg-slate-800 text-text-secondary transition-colors cursor-pointer shrink-0"
              title="Detectar mi ciudad por geolocalización para filtrar alertas y farmacia de turno"
            >
              <Navigation className={`w-3.5 h-3.5 stroke-[1.5] text-[#0f4c81] dark:text-sky-400 ${isLocating ? 'animate-spin' : ''}`} />
              <span className="hidden xl:inline">Mi zona</span>
            </button>

            <div className="flex items-center gap-1 overflow-x-auto scrollbar-hide">
              {(
                [
                  { id: 'all', label: 'TDF' },
                  { id: 'ushuaia', label: 'Ushuaia' },
                  { id: 'rio_grande', label: 'Río Grande' },
                  { id: 'tolhuin', label: 'Tolhuin' },
                ] as const
              ).map((c) => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => onSelectCity(c.id)}
                  className={`px-2.5 py-1 rounded-lg text-[12px] font-semibold transition-colors cursor-pointer whitespace-nowrap ${
                    selectedCity === c.id
                      ? 'bg-[#0f4c81] text-white'
                      : 'text-text-secondary hover:bg-surface-sunken'
                  }`}
                >
                  {c.label}
                </button>
              ))}
            </div>
          </div>

          {/* 1. INDICADOR: ESTADO DE RUTA 3 */}
          <div className="lg:col-span-3">
            <button
              type="button"
              onClick={() => setExpandedDetail(expandedDetail === 'ruta' ? null : 'ruta')}
              className="w-full flex items-center justify-between gap-2 px-3 py-1.5 rounded-xl bg-surface-sunken/70 hover:bg-surface-sunken border border-border-subtle transition-colors text-left cursor-pointer"
            >
              <div className="flex items-center gap-2 min-w-0">
                <span
                  className={`w-6 h-6 rounded-lg flex items-center justify-center shrink-0 ${
                    rutaStatus.level === 'critical'
                      ? 'bg-red-500/15 text-[#dc2626]'
                      : rutaStatus.level === 'warning'
                      ? 'bg-amber-500/15 text-[#d97706]'
                      : 'bg-emerald-500/15 text-[#16a34a]'
                  }`}
                >
                  <Car className="w-4 h-4 stroke-[1.5]" />
                </span>
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[12px] font-bold text-text-primary truncate">
                      {rutaStatus.label}
                    </span>
                    <span
                      className={`w-2 h-2 rounded-full shrink-0 ${
                        rutaStatus.level === 'critical'
                          ? 'bg-[#dc2626]'
                          : rutaStatus.level === 'warning'
                          ? 'bg-[#d97706]'
                          : 'bg-[#16a34a]'
                      }`}
                    />
                  </div>
                  <span className="text-[12px] text-text-tertiary block truncate">
                    {rutaStatus.segment}
                  </span>
                </div>
              </div>
              {expandedDetail === 'ruta' ? (
                <ChevronUp className="w-3.5 h-3.5 stroke-[1.5] text-text-tertiary shrink-0" />
              ) : (
                <ChevronDown className="w-3.5 h-3.5 stroke-[1.5] text-text-tertiary shrink-0" />
              )}
            </button>
          </div>

          {/* 2. INDICADOR: ALERTA ACTIVA DE DEFENSA CIVIL / VIALIDAD (O "SIN ALERTAS") */}
          <div className="lg:col-span-3">
            <button
              type="button"
              onClick={() => setExpandedDetail(expandedDetail === 'alerta' ? null : 'alerta')}
              className={`w-full flex items-center justify-between gap-2 px-3 py-1.5 rounded-xl border transition-colors text-left cursor-pointer ${
                primaryAlert?.severity === 'critical'
                  ? 'alert-card-critical'
                  : primaryAlert?.severity === 'warning'
                  ? 'alert-card-warning'
                  : 'bg-surface-sunken/70 border-border-subtle'
              }`}
            >
              <div className="flex items-center gap-2 min-w-0">
                {primaryAlert ? (
                  <AlertTriangle
                    className={`w-4 h-4 stroke-[1.5] shrink-0 ${
                      primaryAlert.severity === 'critical'
                        ? 'text-[#dc2626]'
                        : 'text-[#d97706]'
                    }`}
                  />
                ) : (
                  <ShieldCheck className="w-4 h-4 stroke-[1.5] text-[#16a34a] shrink-0" />
                )}
                <div className="min-w-0">
                  <span className="text-[12px] font-bold text-text-primary block truncate">
                    {primaryAlert
                      ? primaryAlert.severity === 'critical'
                        ? 'Alerta Crítica Activa'
                        : 'Precaución · ' + primaryAlert.issuer
                      : 'Defensa Civil: Sin alertas'}
                  </span>
                  <span className="text-[12px] text-text-secondary block truncate">
                    {primaryAlert ? primaryAlert.title : 'Condiciones normales en la zona'}
                  </span>
                </div>
              </div>
              {expandedDetail === 'alerta' ? (
                <ChevronUp className="w-3.5 h-3.5 stroke-[1.5] text-text-tertiary shrink-0" />
              ) : (
                <ChevronDown className="w-3.5 h-3.5 stroke-[1.5] text-text-tertiary shrink-0" />
              )}
            </button>
          </div>

          {/* 3. INDICADOR: FARMACIA DE TURNO DE LA CIUDAD DETECTADA / ELEGIDA */}
          <div className="lg:col-span-3">
            <button
              type="button"
              onClick={() => setExpandedDetail(expandedDetail === 'farmacia' ? null : 'farmacia')}
              className="w-full flex items-center justify-between gap-2 px-3 py-1.5 rounded-xl bg-surface-sunken/70 hover:bg-surface-sunken border border-border-subtle transition-colors text-left cursor-pointer"
            >
              <div className="flex items-center gap-2 min-w-0">
                <span className="w-6 h-6 rounded-lg bg-emerald-500/15 text-[#16a34a] flex items-center justify-center shrink-0">
                  <Cross className="w-3.5 h-3.5 stroke-[1.5]" />
                </span>
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[12px] font-bold text-text-primary truncate">
                      {activePharmacy ? activePharmacy.nombre : 'Farmacia de Turno'}
                    </span>
                    <span className="text-[11px] font-semibold px-1.5 py-0.2 rounded bg-emerald-500/15 text-[#16a34a] shrink-0">
                      {pharmacyCityName}
                    </span>
                  </div>
                  <span className="text-[12px] text-text-tertiary block truncate tabular-nums">
                    {activePharmacy ? activePharmacy.direccion : 'Sincronizando turno...'}
                  </span>
                </div>
              </div>
              {expandedDetail === 'farmacia' ? (
                <ChevronUp className="w-3.5 h-3.5 stroke-[1.5] text-text-tertiary shrink-0" />
              ) : (
                <ChevronDown className="w-3.5 h-3.5 stroke-[1.5] text-text-tertiary shrink-0" />
              )}
            </button>
          </div>
        </div>

        {/* PANEL DESPLEGABLE DE DETALLE RÁPIDO Y TRAZABILIDAD OFICIAL */}
        {expandedDetail && (
          <div className="mt-2 pt-2.5 border-t border-border-subtle text-[14px] flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-surface-primary/60 rounded-xl p-3">
            {expandedDetail === 'ruta' && (
              <>
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-[12px] font-semibold text-text-tertiary tabular-nums">
                    <span>Organismo emisor: <strong className="text-text-primary">{rutaStatus.issuer}</strong></span>
                    <span>·</span>
                    <span className="inline-flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 stroke-[1.5]" />
                      Sincronizado: {formattedSync}
                    </span>
                  </div>
                  <p className="text-[14px] text-text-primary font-semibold">
                    {rutaStatus.detail}
                  </p>
                </div>
                <a
                  href="https://www.argentina.gob.ar/transporte/vialidad-nacional/estado-de-rutas"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-[12px] font-semibold text-[#0f4c81] dark:text-sky-400 hover:underline shrink-0"
                >
                  <span>Parte oficial Vialidad</span>
                  <ExternalLink className="w-3.5 h-3.5 stroke-[1.5]" />
                </a>
              </>
            )}

            {expandedDetail === 'alerta' && (
              <>
                <div className="space-y-1">
                  {primaryAlert ? (
                    <>
                      <div className="flex flex-wrap items-center gap-2 text-[12px] text-text-tertiary tabular-nums">
                        <span>Organismo: <strong className="text-text-primary">{primaryAlert.issuer}</strong></span>
                        <span>·</span>
                        <span>Sincronizado: <strong>{primaryAlert.syncedAt}</strong></span>
                        <span>·</span>
                        <span>Caducidad automática (TTL): {primaryAlert.ttlHours} horas</span>
                      </div>
                      <p className="text-[14px] font-semibold text-text-primary">
                        {primaryAlert.title}
                      </p>
                      <p className="text-[12px] text-text-secondary">
                        {primaryAlert.description}
                      </p>
                    </>
                  ) : (
                    <p className="text-[14px] text-text-secondary">
                      No se registran alertas meteorológicas ni viales críticas vigentes para {pharmacyCityName}. (Sincronizado: {formattedSync})
                    </p>
                  )}
                </div>
                <button
                  type="button"
                  onClick={handleEnablePush}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-semibold bg-[#0f4c81] text-white hover:bg-[#0c3b66] shrink-0 cursor-pointer"
                >
                  <Bell className="w-3.5 h-3.5 stroke-[1.5]" />
                  <span>{pushEnabled ? 'Alertas Push activas' : 'Recibir alertas críticas'}</span>
                </button>
              </>
            )}

            {expandedDetail === 'farmacia' && activePharmacy && (
              <>
                <div className="space-y-1">
                  <div className="flex flex-wrap items-center gap-2 text-[12px] text-text-tertiary tabular-nums">
                    <span>Ciudad: <strong className="text-text-primary">{pharmacyCityName}</strong></span>
                    <span>·</span>
                    <span>Turno hasta las 09:00 hs</span>
                    <span>·</span>
                    <span>Sincronizado: {formattedSync}</span>
                  </div>
                  <p className="text-[14px] font-bold text-text-primary">
                    {activePharmacy.nombre} — <span className="font-normal text-text-secondary">{activePharmacy.direccion}</span>
                  </p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <a
                    href={`https://www.openstreetmap.org/search?query=${encodeURIComponent(`Farmacia ${activePharmacy.nombre}, ${activePharmacy.direccion}, ${pharmacyCityName}, Tierra del Fuego`)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[12px] font-semibold bg-surface-sunken text-text-primary hover:bg-slate-200 dark:hover:bg-slate-700"
                  >
                    <MapPin className="w-3.5 h-3.5 stroke-[1.5] text-[#0f4c81] dark:text-sky-400" />
                    <span>Ubicación</span>
                  </a>
                  {telHref && (
                    <a
                      href={`tel:${telHref}`}
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-[12px] font-semibold bg-[#16a34a] text-white hover:bg-emerald-700 tabular-nums"
                    >
                      <Phone className="w-3.5 h-3.5 stroke-[1.5]" />
                      <span>{cleanPhone}</span>
                    </a>
                  )}
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

