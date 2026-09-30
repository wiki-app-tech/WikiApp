'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  Globe2,
  Ship,
  Anchor,
  Radio,
  Camera,
  Flame,
  CloudLightning,
  AlertTriangle,
  Activity,
  Shield,
  Plane,
  Cable,
  Eye,
  RotateCw,
  Maximize2,
  Minimize2,
  ExternalLink,
  Layers,
  Sparkles,
  Info,
  Check,
  X,
  Compass,
  Zap,
  Filter
} from 'lucide-react';

export interface OsirisLayerDef {
  id: string;
  name: string;
  category: 'maritime' | 'surveillance' | 'hazards' | 'security' | 'aviation' | 'display';
  icon: any;
  color: string;
  desc: string;
  isDefault?: boolean;
}

export const OSIRIS_AVAILABLE_LAYERS: OsirisLayerDef[] = [
  // 1. MARÍTIMO Y LÍNEAS DE NAVEGACIÓN
  {
    id: 'sdk_sea',
    name: 'Líneas Marítimas',
    category: 'maritime',
    icon: Anchor,
    color: 'text-cyan-400 border-cyan-500/30 bg-cyan-500/10',
    desc: 'Corredores náuticos, rutas marítimas y shipping lanes interoceánicos.',
    isDefault: true,
  },
  {
    id: 'maritime',
    name: 'Tráfico Marítimo AIS',
    category: 'maritime',
    icon: Ship,
    color: 'text-blue-400 border-blue-500/30 bg-blue-500/10',
    desc: 'Posicionamiento satelital en tiempo real de buques, cargueros y petroleros.',
    isDefault: true,
  },
  {
    id: 'sdk_naval',
    name: 'Flota Naval & Militar',
    category: 'maritime',
    icon: Shield,
    color: 'text-indigo-400 border-indigo-500/30 bg-indigo-500/10',
    desc: 'Despliegues de fragatas, portaviones y patrulleros de defensa.',
    isDefault: true,
  },
  {
    id: 'cables',
    name: 'Cables Submarinos',
    category: 'maritime',
    icon: Cable,
    color: 'text-teal-400 border-teal-500/30 bg-teal-500/10',
    desc: 'Trazado global de infraestructura de telecomunicaciones submarinas.',
    isDefault: true,
  },

  // 2. SATÉLITES Y ESPACIO
  {
    id: 'satellites',
    name: 'Satélites en Órbita',
    category: 'aviation',
    icon: Radio,
    color: 'text-purple-400 border-purple-500/30 bg-purple-500/10',
    desc: 'Constelaciones LEO, Starlink y satélites meteorológicos en órbita activa.',
    isDefault: true,
  },
  {
    id: 'sat_military',
    name: 'Satélites Militares',
    category: 'aviation',
    icon: Shield,
    color: 'text-violet-400 border-violet-500/30 bg-violet-500/10',
    desc: 'Reconocimiento óptico, radar SAR y defensa orbital geoestacionaria.',
    isDefault: false,
  },
  {
    id: 'sat_navigation',
    name: 'Constelación GPS/GLONASS',
    category: 'aviation',
    icon: Compass,
    color: 'text-fuchsia-400 border-fuchsia-500/30 bg-fuchsia-500/10',
    desc: 'Satélites de posicionamiento y radionavegación global.',
    isDefault: false,
  },

  // 3. CÁMARAS DE VIDEO VIGILANCIA
  {
    id: 'cctv',
    name: 'Cámaras de Vigilancia CCTV',
    category: 'surveillance',
    icon: Camera,
    color: 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10',
    desc: 'Red mundial de webcams públicas, cámaras urbanas, puertos y autopistas.',
    isDefault: true,
  },
  {
    id: 'cctv_previews',
    name: 'Previsualización CCTV en Vivo',
    category: 'surveillance',
    icon: Eye,
    color: 'text-green-400 border-green-500/30 bg-green-500/10',
    desc: 'Miniaturas y feeds de video en vivo sobre las coordenadas del mapa.',
    isDefault: true,
  },

  // 4. DESASTRES NATURALES & AMENAZAS
  {
    id: 'earthquakes',
    name: 'Terremotos en Tiempo Real',
    category: 'hazards',
    icon: Activity,
    color: 'text-amber-400 border-amber-500/30 bg-amber-500/10',
    desc: 'Sismos globales detectados por USGS y EMSC con magnitud y profundidad.',
    isDefault: true,
  },
  {
    id: 'fires',
    name: 'Incendios Forestales Activos',
    category: 'hazards',
    icon: Flame,
    color: 'text-rose-400 border-rose-500/30 bg-rose-500/10',
    desc: 'Focos de calor térmico satelital NASA FIRMS y anomalías activas.',
    isDefault: true,
  },
  {
    id: 'weather',
    name: 'Clima Severo & Tormentas',
    category: 'hazards',
    icon: CloudLightning,
    color: 'text-sky-400 border-sky-500/30 bg-sky-500/10',
    desc: 'Células de tormenta, ciclones, frentes fríos y radar meteorológico.',
    isDefault: true,
  },

  // 5. ENERGÍA, DEFENSA & NUCLEAR
  {
    id: 'radiation',
    name: 'Instalaciones Nucleares',
    category: 'security',
    icon: Zap,
    color: 'text-yellow-400 border-yellow-500/30 bg-yellow-500/10',
    desc: 'Reactores comerciales, centros de investigación y monitoreo radiológico.',
    isDefault: true,
  },
  {
    id: 'infrastructure',
    name: 'Infraestructura Crítica',
    category: 'security',
    icon: AlertTriangle,
    color: 'text-orange-400 border-orange-500/30 bg-orange-500/10',
    desc: 'Refinerías, represas, oleoductos y subestaciones eléctricas clave.',
    isDefault: true,
  },

  // 6. INCIDENTES GLOBALES Y ALERTAS
  {
    id: 'global_incidents',
    name: 'Incidentes Globales',
    category: 'security',
    icon: AlertTriangle,
    color: 'text-red-400 border-red-500/30 bg-red-500/10',
    desc: 'Crisis geopolíticas, operaciones militares y eventos de seguridad en vivo.',
    isDefault: true,
  },
  {
    id: 'live_news',
    name: 'Noticias en Vivo Georreferenciadas',
    category: 'security',
    icon: Radio,
    color: 'text-cyan-400 border-cyan-500/30 bg-cyan-500/10',
    desc: 'Despachos de última hora y reportes de fuentes de inteligencia verificadas.',
    isDefault: true,
  },
  {
    id: 'war_alerts',
    name: 'Alertas de Guerra & Conflictos',
    category: 'security',
    icon: Shield,
    color: 'text-red-500 border-red-500/30 bg-red-500/10',
    desc: 'Zonas activas de combate, ataques de drones y alertas antiaéreas.',
    isDefault: false,
  },

  // 7. AVIACIÓN Y ESPACIO AÉREO
  {
    id: 'flights',
    name: 'Tráfico Aéreo Comercial',
    category: 'aviation',
    icon: Plane,
    color: 'text-amber-400 border-amber-500/30 bg-amber-500/10',
    desc: 'Rastreo de aeronaves comerciales con telemetría ADS-B y altitud.',
    isDefault: false,
  },
  {
    id: 'military',
    name: 'Aviación Militar & Drones',
    category: 'aviation',
    icon: Shield,
    color: 'text-orange-500 border-orange-500/30 bg-orange-500/10',
    desc: 'Aviones de reabastecimiento, patrulla marítima y reconocimiento.',
    isDefault: false,
  },

  // 8. CIBERSEGURIDAD
  {
    id: 'cyber_attacks',
    name: 'Ciberataques en Vivo',
    category: 'security',
    icon: Zap,
    color: 'text-pink-400 border-pink-500/30 bg-pink-500/10',
    desc: 'Ataques masivos DDoS e interrupciones globales monitoreadas por Cloudflare.',
    isDefault: false,
  },

  // 9. DISPLAY & VISUALIZACIÓN
  {
    id: 'day_night',
    name: 'Ciclo Día / Noche',
    category: 'display',
    icon: Globe2,
    color: 'text-slate-300 border-white/20 bg-white/5',
    desc: 'Terminador solar en tiempo real proyectado sobre el globo terráqueo.',
    isDefault: true,
  },
  {
    id: 'terrain_3d',
    name: 'Relieve & Terreno 3D',
    category: 'display',
    icon: Layers,
    color: 'text-emerald-300 border-emerald-500/20 bg-emerald-500/5',
    desc: 'Topografía tridimensional y mapas de elevación de alta resolución.',
    isDefault: false,
  },
];

export interface OsirisMapProps {
  className?: string;
  heightClass?: string;
  compact?: boolean;
  showToolbar?: boolean;
  initialLayers?: string[];
}

export default function OsirisMap({
  className = '',
  heightClass = 'h-[550px] md:h-[720px]',
  compact = false,
  showToolbar = true,
  initialLayers,
}: OsirisMapProps) {
  // Inicialización de capas activas
  const defaultActive = useMemo(() => {
    if (initialLayers && initialLayers.length > 0) return initialLayers;
    return OSIRIS_AVAILABLE_LAYERS.filter((l) => l.isDefault).map((l) => l.id);
  }, [initialLayers]);

  const [activeLayers, setActiveLayers] = useState<string[]>(defaultActive);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [iframeKey, setIframeKey] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [showLayerDrawer, setShowLayerDrawer] = useState(false);
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [liveStats, setLiveStats] = useState<any>({
    sats: 18788,
    cctv: 39512,
    weather: 68,
    nuclear: 64,
    incidents: 232,
    flights: 9680,
  });

  const containerRef = useRef<HTMLDivElement>(null);

  // Cargar estadísticas en vivo de OSIRIS
  useEffect(() => {
    fetch('/api/osiris-stats')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.stats) {
          setLiveStats(data.stats);
        }
      })
      .catch((err) => console.warn('Could not load OSIRIS stats:', err));
  }, []);

  // Escuchar cambios de fullscreen
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(Boolean(document.fullscreenElement));
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  const toggleFullscreen = async () => {
    if (!containerRef.current) return;
    try {
      if (!document.fullscreenElement) {
        await containerRef.current.requestFullscreen();
      } else {
        await document.exitFullscreen();
      }
    } catch (err) {
      console.warn('Error toggling fullscreen:', err);
    }
  };

  const toggleLayer = (layerId: string) => {
    setActiveLayers((prev) => {
      if (prev.includes(layerId)) {
        return prev.filter((id) => id !== layerId);
      } else {
        return [...prev, layerId];
      }
    });
    setIframeKey((k) => k + 1);
  };

  // Presets temáticos
  const applyPreset = (preset: 'maritime' | 'hazards' | 'security' | 'satellites' | 'all') => {
    let selected: string[] = [];
    if (preset === 'maritime') {
      selected = ['sdk_sea', 'maritime', 'sdk_naval', 'cables', 'cctv', 'cctv_previews', 'day_night'];
    } else if (preset === 'hazards') {
      selected = ['earthquakes', 'fires', 'weather', 'radiation', 'infrastructure', 'day_night'];
    } else if (preset === 'security') {
      selected = ['global_incidents', 'war_alerts', 'live_news', 'cctv', 'cctv_previews', 'radiation', 'cyber_attacks'];
    } else if (preset === 'satellites') {
      selected = ['satellites', 'sat_military', 'sat_navigation', 'flights', 'military', 'day_night'];
    } else if (preset === 'all') {
      selected = OSIRIS_AVAILABLE_LAYERS.map((l) => l.id);
    }
    setActiveLayers(selected);
    setIframeKey((k) => k + 1);
  };

  // Generar URL del mapa a través del proxy backend local
  const layersParam = activeLayers.join(',');
  const iframeSrc = `/api/osiris-embed?layers=${encodeURIComponent(layersParam)}`;

  const filteredLayers = useMemo(() => {
    if (activeCategory === 'all') return OSIRIS_AVAILABLE_LAYERS;
    return OSIRIS_AVAILABLE_LAYERS.filter((l) => l.category === activeCategory);
  }, [activeCategory]);

  return (
    <div
      ref={containerRef}
      className={`relative w-full bg-[#030712] border border-cyan-500/25 dark:border-cyan-500/35 rounded-3xl overflow-hidden shadow-2xl flex flex-col ${
        isFullscreen ? 'fixed inset-0 z-[100] rounded-none h-screen' : className
      }`}
    >
      {/* 1. BARRA SUPERIOR DE COMANDO TÁCTICO */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-3.5 bg-[#080d1a]/95 backdrop-blur-md border-b border-cyan-500/20 z-20">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-cyan-600 via-blue-600 to-indigo-600 flex items-center justify-center shadow-[0_0_20px_rgba(6,182,212,0.4)] shrink-0">
            <Globe2 className="w-4 h-4 text-white animate-spin-slow" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-xs md:text-sm font-black text-white tracking-wide uppercase font-display flex items-center gap-1.5">
                <span>OSIRIS</span>
                <span className="text-cyan-400 font-normal">|</span>
                <span className="text-slate-300 font-semibold text-[11px] md:text-xs">
                  Plataforma de Inteligencia Global de Código Abierto (OSINT)
                </span>
              </h2>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                Live Feed
              </span>
              <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-mono text-cyan-300 bg-cyan-950/60 border border-cyan-800/40">
                <Layers className="w-2.5 h-2.5" />
                {activeLayers.length} Capas Activas
              </span>
            </div>
            <p className="text-[10px] text-slate-400 mt-0.5 line-clamp-1">
              Líneas marítimas, buques AIS, satélites, CCTV en vivo, terremotos, incendios NASA, clima severo y reactores nucleares.
            </p>
          </div>
        </div>

        {/* CONTROLES Y ACCIONES */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Botón para abrir / cerrar panel de capas */}
          <button
            onClick={() => setShowLayerDrawer(!showLayerDrawer)}
            className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold border transition-all flex items-center gap-1.5 cursor-pointer ${
              showLayerDrawer
                ? 'bg-cyan-600 text-white border-cyan-400 shadow-md shadow-cyan-600/30'
                : 'bg-white/5 hover:bg-white/10 text-slate-300 border-white/10'
            }`}
            title="Personalizar capas activas del mapa"
          >
            <Filter className="w-3.5 h-3.5 text-cyan-400" />
            <span className="text-[11px]">Capas Tácticas ({activeLayers.length})</span>
          </button>

          {/* Recargar */}
          <button
            onClick={() => {
              setIsLoading(true);
              setIframeKey((k) => k + 1);
            }}
            className="p-1.5 md:px-2.5 md:py-1.5 rounded-xl text-xs font-mono font-bold bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white border border-white/10 transition-all flex items-center gap-1.5 cursor-pointer"
            title="Recargar mapa OSINT"
          >
            <RotateCw className={`w-3.5 h-3.5 text-cyan-400 ${isLoading ? 'animate-spin' : ''}`} />
            <span className="hidden md:inline text-[11px]">Recargar</span>
          </button>

          {/* Fullscreen */}
          <button
            onClick={toggleFullscreen}
            className="p-1.5 md:px-2.5 md:py-1.5 rounded-xl text-xs font-mono font-bold bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white border border-white/10 transition-all flex items-center gap-1.5 cursor-pointer"
            title={isFullscreen ? 'Salir de pantalla completa' : 'Ver en pantalla completa'}
          >
            {isFullscreen ? (
              <>
                <Minimize2 className="w-3.5 h-3.5 text-orange-400" />
                <span className="hidden md:inline text-[11px]">Reducir</span>
              </>
            ) : (
              <>
                <Maximize2 className="w-3.5 h-3.5 text-cyan-400" />
                <span className="hidden md:inline text-[11px]">Pantalla Completa</span>
              </>
            )}
          </button>

          {/* Indicador de Vista Directa Backend */}
          <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[11px] font-mono font-bold bg-cyan-950/60 text-cyan-300 border border-cyan-800/40">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
            <span>Vista Directa Backend</span>
          </div>
        </div>
      </div>

      {/* 2. STATS TICKER EN TIEMPO REAL */}
      <div className="flex items-center gap-3 px-5 py-2 bg-[#050a14]/90 border-b border-white/5 overflow-x-auto scrollbar-hide text-[10px] font-mono text-slate-300">
        <span className="text-slate-500 font-bold uppercase tracking-wider text-[9px] shrink-0">
          Telemetría en Vivo:
        </span>

        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-cyan-500/10 text-cyan-300 border border-cyan-500/20 shrink-0">
          <Anchor className="w-3 h-3 text-cyan-400" />
          <span>Líneas Marítimas: <strong>Corredores Activos</strong></span>
        </span>

        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-blue-500/10 text-blue-300 border border-blue-500/20 shrink-0">
          <Ship className="w-3 h-3 text-blue-400" />
          <span>Tráfico Marítimo: <strong>AIS Global</strong></span>
        </span>

        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-purple-500/10 text-purple-300 border border-purple-500/20 shrink-0">
          <Radio className="w-3 h-3 text-purple-400" />
          <span>Satélites: <strong>{liveStats.sats?.toLocaleString() || '18,788'}</strong></span>
        </span>

        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 shrink-0">
          <Camera className="w-3 h-3 text-emerald-400" />
          <span>CCTV Mundial: <strong>{liveStats.cctv?.toLocaleString() || '39,512'}</strong></span>
        </span>

        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-amber-500/10 text-amber-300 border border-amber-500/20 shrink-0">
          <Activity className="w-3 h-3 text-amber-400" />
          <span>Terremotos: <strong>USGS/EMSC</strong></span>
        </span>

        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-rose-500/10 text-rose-300 border border-rose-500/20 shrink-0">
          <Flame className="w-3 h-3 text-rose-400" />
          <span>Incendios: <strong>NASA FIRMS</strong></span>
        </span>

        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-sky-500/10 text-sky-300 border border-sky-500/20 shrink-0">
          <CloudLightning className="w-3 h-3 text-sky-400" />
          <span>Clima Severo: <strong>{liveStats.weather || '68'}</strong></span>
        </span>

        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-yellow-500/10 text-yellow-300 border border-yellow-500/20 shrink-0">
          <Zap className="w-3 h-3 text-yellow-400" />
          <span>Nuclear: <strong>{liveStats.nuclear || '64'} plantas</strong></span>
        </span>

        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-red-500/10 text-red-300 border border-red-500/20 shrink-0">
          <AlertTriangle className="w-3 h-3 text-red-400" />
          <span>Incidentes: <strong>{liveStats.incidents || '232'}</strong></span>
        </span>
      </div>

      {/* 3. BARRA DE PRESETS RÁPIDOS */}
      {showToolbar && !compact && (
        <div className="flex items-center gap-2 px-5 py-2 bg-[#040813] border-b border-white/5 overflow-x-auto scrollbar-hide text-xs">
          <span className="text-slate-400 font-bold uppercase text-[9px] shrink-0 flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-cyan-400" /> Presets Tácticos:
          </span>
          <button
            onClick={() => applyPreset('maritime')}
            className="px-2.5 py-1 rounded-lg bg-blue-600/20 hover:bg-blue-600/30 text-blue-300 border border-blue-500/30 text-[10px] font-bold uppercase tracking-wider transition-all shrink-0 flex items-center gap-1 cursor-pointer"
          >
            <Ship className="w-3 h-3" />
            <span>Marítimo & Rutas</span>
          </button>
          <button
            onClick={() => applyPreset('hazards')}
            className="px-2.5 py-1 rounded-lg bg-rose-600/20 hover:bg-rose-600/30 text-rose-300 border border-rose-500/30 text-[10px] font-bold uppercase tracking-wider transition-all shrink-0 flex items-center gap-1 cursor-pointer"
          >
            <Flame className="w-3 h-3" />
            <span>Catástrofes & Clima</span>
          </button>
          <button
            onClick={() => applyPreset('security')}
            className="px-2.5 py-1 rounded-lg bg-red-600/20 hover:bg-red-600/30 text-red-300 border border-red-500/30 text-[10px] font-bold uppercase tracking-wider transition-all shrink-0 flex items-center gap-1 cursor-pointer"
          >
            <AlertTriangle className="w-3 h-3" />
            <span>Crisis & Incidentes</span>
          </button>
          <button
            onClick={() => applyPreset('satellites')}
            className="px-2.5 py-1 rounded-lg bg-purple-600/20 hover:bg-purple-600/30 text-purple-300 border border-purple-500/30 text-[10px] font-bold uppercase tracking-wider transition-all shrink-0 flex items-center gap-1 cursor-pointer"
          >
            <Radio className="w-3 h-3" />
            <span>Satélites & Espacio</span>
          </button>
          <button
            onClick={() => applyPreset('all')}
            className="px-2.5 py-1 rounded-lg bg-cyan-600/20 hover:bg-cyan-600/30 text-cyan-300 border border-cyan-500/30 text-[10px] font-bold uppercase tracking-wider transition-all shrink-0 flex items-center gap-1 cursor-pointer"
          >
            <Globe2 className="w-3 h-3" />
            <span>Inteligencia Total (Todas)</span>
          </button>
        </div>
      )}

      {/* 4. VISOR PRINCIPAL & DRAWER DE CAPAS */}
      <div className={`w-full relative bg-[#02050e] overflow-hidden ${isFullscreen ? 'flex-1 h-full' : heightClass}`}>
        {/* Loading Indicator */}
        {isLoading && (
          <div className="absolute inset-0 z-10 bg-[#02050e] flex flex-col items-center justify-center gap-4 text-center p-6 pointer-events-none">
            <div className="relative w-16 h-16">
              <div className="absolute inset-0 rounded-full border-2 border-cyan-500/20 animate-ping" />
              <div className="absolute inset-2 rounded-full border-2 border-t-cyan-400 border-r-transparent border-b-cyan-500 border-l-transparent animate-spin" />
              <div className="absolute inset-4 rounded-full bg-cyan-500/10 flex items-center justify-center">
                <Globe2 className="w-5 h-5 text-cyan-400" />
              </div>
            </div>
            <div>
              <p className="text-xs font-black uppercase tracking-widest text-white font-mono">
                Cargando Plataforma OSIRIS
              </p>
              <p className="text-[11px] text-slate-400 mt-1 max-w-sm">
                Conectando capas de telemetría marítima, satélites, CCTV, actividad sísmica y sensores globales...
              </p>
            </div>
          </div>
        )}

        {/* IFRAME PRINCIPAL (Vista directa del back del sitio, sandbox sin permitir top-navigation) */}
        <iframe
          key={`${iframeKey}-${activeLayers.join('_')}`}
          src={`/api/osiris-embed?layers=${encodeURIComponent(activeLayers.join(','))}`}
          className="w-full h-full border-0 block"
          title="OSIRIS — Plataforma de Inteligencia Global de Código Abierto (OSINT)"
          sandbox="allow-scripts allow-same-origin allow-forms"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share; fullscreen"
          referrerPolicy="no-referrer-when-downgrade"
          onLoad={() => setIsLoading(false)}
          onError={() => setIsLoading(false)}
        />

        {/* DRAWER INTERACTIVO FLOTANTE DE CAPAS TÁCTICAS */}
        {showLayerDrawer && (
          <div className="absolute top-3 left-3 bottom-3 w-80 md:w-96 z-30 bg-slate-950/95 backdrop-blur-xl border border-cyan-500/30 rounded-2xl shadow-2xl p-4 flex flex-col gap-3 text-white overflow-hidden animate-in fade-in slide-in-from-left-4 duration-200">
            <div className="flex items-center justify-between pb-2 border-b border-white/10">
              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4 text-cyan-400" />
                <h3 className="text-xs font-black uppercase tracking-wider font-display">
                  Capas Tácticas de OSIRIS
                </h3>
              </div>
              <button
                onClick={() => setShowLayerDrawer(false)}
                className="p-1 rounded-lg bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-all cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Categorías */}
            <div className="flex items-center gap-1 overflow-x-auto scrollbar-hide py-1 text-[10px] font-mono">
              {[
                { id: 'all', label: 'Todas' },
                { id: 'maritime', label: 'Marítimo' },
                { id: 'aviation', label: 'Satélites' },
                { id: 'surveillance', label: 'CCTV' },
                { id: 'hazards', label: 'Amenazas' },
                { id: 'security', label: 'Seguridad' },
              ].map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setActiveCategory(cat.id)}
                  className={`px-2.5 py-1 rounded-md font-bold transition-all shrink-0 cursor-pointer ${
                    activeCategory === cat.id
                      ? 'bg-cyan-600 text-white shadow-sm'
                      : 'bg-white/5 text-slate-400 hover:text-white'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>

            {/* Lista de capas con switch interactivo */}
            <div className="flex-1 overflow-y-auto pr-1 space-y-2 scrollbar-thin">
              {filteredLayers.map((layer) => {
                const IconComponent = layer.icon;
                const isActive = activeLayers.includes(layer.id);

                return (
                  <div
                    key={layer.id}
                    onClick={() => toggleLayer(layer.id)}
                    className={`p-2.5 rounded-xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                      isActive
                        ? 'bg-cyan-950/40 border-cyan-500/40 shadow-sm'
                        : 'bg-white/[0.02] border-white/5 hover:border-white/15 opacity-60 hover:opacity-100'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div
                        className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 border ${layer.color}`}
                      >
                        <IconComponent className="w-3.5 h-3.5" />
                      </div>
                      <div className="min-w-0">
                        <span className="text-xs font-bold block text-white truncate">
                          {layer.name}
                        </span>
                        <span className="text-[10px] text-slate-400 line-clamp-1">
                          {layer.desc}
                        </span>
                      </div>
                    </div>

                    <div
                      className={`w-5 h-5 rounded-md flex items-center justify-center shrink-0 border transition-all ${
                        isActive
                          ? 'bg-cyan-500 border-cyan-400 text-black'
                          : 'border-white/20 bg-white/5'
                      }`}
                    >
                      {isActive && <Check className="w-3 h-3 stroke-[3]" />}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Botones de acción inferior en Drawer */}
            <div className="pt-2 border-t border-white/10 flex items-center justify-between text-[11px] font-mono">
              <button
                onClick={() => {
                  setActiveLayers([]);
                  setIframeKey((k) => k + 1);
                }}
                className="text-slate-400 hover:text-rose-400 cursor-pointer transition-colors"
              >
                Desmarcar Todas
              </button>
              <button
                onClick={() => {
                  setActiveLayers(OSIRIS_AVAILABLE_LAYERS.map((l) => l.id));
                  setIframeKey((k) => k + 1);
                }}
                className="text-cyan-400 hover:text-cyan-300 font-bold cursor-pointer transition-colors"
              >
                Activar Todas
              </button>
            </div>
          </div>
        )}
      </div>

      {/* 5. FOOTER INFORMATIVO */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-2.5 bg-[#080d1a] border-t border-cyan-500/10 text-[10px] text-slate-400 font-mono">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-cyan-400 shadow-[0_0_8px_rgba(6,182,212,0.8)]" />
          <span className="text-slate-300 font-semibold">Consola OSIRIS OSINT:</span>
          <span className="hidden sm:inline">
            Monitoreo multidominio en tiempo real: marítimo, satelital, CCTV urbano, sismos, incendios y plantas nucleares.
          </span>
        </div>
        <div className="flex items-center gap-3 ml-auto">
          <span>&copy; OSIRIS &mdash; Open Source Intelligence</span>
          <span className="text-cyan-400 font-bold flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            Integración Nativa sin Redirección
          </span>
        </div>
      </div>
    </div>
  );
}
