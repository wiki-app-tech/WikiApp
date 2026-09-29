'use client';

import React, { useState, useRef, useEffect } from 'react';
import { 
  Globe2, 
  ExternalLink, 
  Maximize2, 
  Minimize2, 
  RotateCw, 
  Plane, 
  Ship, 
  Flame, 
  CloudRain, 
  Radio, 
  Sparkles,
  Info,
  ShieldAlert,
  Compass
} from 'lucide-react';

export interface GodsViewMapProps {
  className?: string;
  heightClass?: string;
  showControlBar?: boolean;
  showFeaturePills?: boolean;
  compact?: boolean;
}

export default function GodsViewMap({
  className = '',
  heightClass = 'h-[500px] md:h-[650px]',
  showControlBar = true,
  showFeaturePills = true,
  compact = false,
}: GodsViewMapProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [iframeKey, setIframeKey] = useState(1);
  const [hasError, setHasError] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Escuchar cambios de pantalla completa
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

  const reloadIframe = () => {
    setIsLoading(true);
    setHasError(false);
    setIframeKey(prev => prev + 1);
  };

  return (
    <div 
      ref={containerRef}
      className={`relative w-full bg-[#030712] border border-cyan-500/20 dark:border-cyan-500/30 rounded-3xl overflow-hidden shadow-2xl flex flex-col ${
        isFullscreen ? 'fixed inset-0 z-[100] rounded-none h-screen' : className
      }`}
    >
      {/* 1. BARRA SUPERIOR DE CONTROL */}
      {showControlBar && (
        <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-3.5 bg-[#080d1a]/95 backdrop-blur-md border-b border-cyan-500/20 z-10">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-cyan-600 to-blue-500 flex items-center justify-center shadow-[0_0_15px_rgba(6,182,212,0.4)] shrink-0">
              <Globe2 className="w-4 h-4 text-white animate-spin-slow" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-xs md:text-sm font-black text-white tracking-wide uppercase font-display flex items-center gap-1.5">
                  <span>GodsViewAI</span>
                  <span className="text-cyan-400 font-normal">|</span>
                  <span className="text-slate-300 font-semibold text-[11px] md:text-xs">Radar Satelital 3D en Vivo</span>
                </h2>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                  Live Feed
                </span>
                <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-mono text-cyan-300 bg-cyan-950/60 border border-cyan-800/40">
                  <Radio className="w-2.5 h-2.5" />
                  Telemetría Global
                </span>
              </div>
              <p className="text-[10px] text-slate-400 mt-0.5 line-clamp-1">
                Vuelos comerciales y privados, buques de ultramar, focos térmicos e imágenes satelitales en 3D.
              </p>
            </div>
          </div>

          {/* ACCIONES */}
          <div className="flex items-center gap-2">
            <button
              onClick={reloadIframe}
              className="p-1.5 md:px-2.5 md:py-1.5 rounded-xl text-xs font-mono font-bold bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white border border-white/10 transition-all flex items-center gap-1.5 cursor-pointer"
              title="Recargar visualización 3D"
            >
              <RotateCw className={`w-3.5 h-3.5 text-cyan-400 ${isLoading ? 'animate-spin' : ''}`} />
              <span className="hidden md:inline text-[11px]">Recargar</span>
            </button>

            <button
              onClick={toggleFullscreen}
              className="p-1.5 md:px-2.5 md:py-1.5 rounded-xl text-xs font-mono font-bold bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white border border-white/10 transition-all flex items-center gap-1.5 cursor-pointer"
              title={isFullscreen ? 'Salir de pantalla completa' : 'Ver a pantalla completa'}
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

            <a
              href="https://godsviewai.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="px-3 py-1.5 rounded-xl text-[11px] font-mono font-black uppercase tracking-wider bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white shadow-md shadow-cyan-600/20 transition-all flex items-center gap-1.5 cursor-pointer"
              title="Abrir GodsViewAI directo en pestaña nueva"
            >
              <span>Abrir Web</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>
      )}

      {/* 2. PILLS INFORMATIVOS DE CAPAS Y TELEMETRÍA */}
      {showFeaturePills && !compact && (
        <div className="flex items-center gap-2 px-5 py-2 bg-[#050a14]/90 border-b border-white/5 overflow-x-auto scrollbar-hide text-[10px] font-mono text-slate-300">
          <span className="text-slate-500 font-bold uppercase tracking-wider text-[9px] shrink-0">
            Capas en Tiempo Real:
          </span>
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-orange-500/10 text-orange-400 border border-orange-500/20 shrink-0">
            <Plane className="w-2.5 h-2.5" />
            Vuelos & Cockpit View
          </span>
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-blue-500/10 text-blue-400 border border-blue-500/20 shrink-0">
            <Ship className="w-2.5 h-2.5" />
            Buques AIS Marítimos
          </span>
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-red-500/10 text-red-400 border border-red-500/20 shrink-0">
            <Flame className="w-2.5 h-2.5" />
            Incendios & Focos Térmicos
          </span>
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 shrink-0">
            <CloudRain className="w-2.5 h-2.5" />
            Clima & Satélites
          </span>
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-purple-500/10 text-purple-400 border border-purple-500/20 shrink-0">
            <Compass className="w-2.5 h-2.5" />
            Sensores Térmico / NVG / CRT
          </span>
        </div>
      )}

      {/* 3. VISOR IFRAME PRINCIPAL */}
      <div className={`w-full relative bg-[#02050e] overflow-hidden ${
        isFullscreen ? 'flex-1 h-full' : heightClass
      }`}>
        {/* Loading Skeleton */}
        {isLoading && (
          <div className="absolute inset-0 z-20 bg-[#02050e] flex flex-col items-center justify-center gap-4 text-center p-6">
            <div className="relative w-16 h-16">
              <div className="absolute inset-0 rounded-full border-2 border-cyan-500/20 animate-ping" />
              <div className="absolute inset-2 rounded-full border-2 border-t-cyan-400 border-r-transparent border-b-cyan-500 border-l-transparent animate-spin" />
              <div className="absolute inset-4 rounded-full bg-cyan-500/10 flex items-center justify-center">
                <Globe2 className="w-5 h-5 text-cyan-400" />
              </div>
            </div>
            <div>
              <p className="text-xs font-black uppercase tracking-widest text-white font-mono">
                Inicializando GodsViewAI 3D
              </p>
              <p className="text-[11px] text-slate-400 mt-1 max-w-sm">
                Cargando globo terráqueo en tiempo real, telemetría aérea, vuelos y capas satelitales...
              </p>
            </div>
          </div>
        )}

        {/* Fallback de error */}
        {hasError ? (
          <div className="w-full h-full flex flex-col items-center justify-center p-8 text-center bg-[#02050e] text-slate-300 gap-3">
            <ShieldAlert className="w-10 h-10 text-orange-400" />
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">
              No se pudo cargar el visor embebido
            </h3>
            <p className="text-xs text-slate-400 max-w-md">
              Es posible que tu navegador restrinja WebGL dentro de iframes o haya una interrupción temporal de red. Puedes abrir el radar satelital 3D directamente:
            </p>
            <a
              href="https://godsviewai.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="mt-2 px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs flex items-center gap-2"
            >
              <span>Abrir GodsViewAI.com en pestaña completa</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        ) : (
          <iframe
            key={iframeKey}
            src="https://godsviewai.com/globe"
            className="w-full h-full border-0 block"
            title="GodsViewAI — Radar Global Satelital 3D de Vuelos, Buques y Eventos en Tiempo Real"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share; fullscreen"
            referrerPolicy="no-referrer-when-downgrade"
            onLoad={() => setIsLoading(false)}
            onError={() => {
              setIsLoading(false);
              setHasError(true);
            }}
          />
        )}
      </div>

      {/* 4. FOOTER INFORMATIVO CON TIPS DE INTERACCIÓN */}
      {!compact && (
        <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-2.5 bg-[#080d1a] border-t border-cyan-500/10 text-[10px] text-slate-400 font-mono">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-cyan-400 shadow-[0_0_8px_rgba(6,182,212,0.8)]" />
            <span className="text-slate-300 font-semibold">Consejo Táctico:</span>
            <span className="hidden sm:inline">
              Haz clic en cualquier avión o embarcación en el globo 3D para activar la vista Cockpit, telemetría y altitud.
            </span>
          </div>
          <div className="flex items-center gap-3 ml-auto">
            <span>&copy; GodsViewAI &mdash; Satellite Intelligence</span>
            <a
              href="https://godsviewai.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-cyan-400 hover:text-cyan-300 underline flex items-center gap-1 font-bold"
            >
              Visitar sitio <ExternalLink className="w-2.5 h-2.5" />
            </a>
          </div>
        </div>
      )}
    </div>
  );
}
