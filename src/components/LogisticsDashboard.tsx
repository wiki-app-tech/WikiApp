'use client';

import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Anchor, 
  Plane, 
  Building2, 
  Ship, 
  ExternalLink, 
  Compass, 
  ChevronRight, 
  Play, 
  Pause, 
  RefreshCw, 
  Layers, 
  MapPin, 
  Users, 
  ArrowDownLeft, 
  ArrowUpRight,
  Sparkles,
  Info
} from 'lucide-react';

// Dynamic imports with ssr: false for maps
const MaritimeMap = dynamic(
  () => import('./LogisticsMap').then(m => ({ default: m.MaritimeMap })),
  { ssr: false, loading: () => <div className="w-full h-full bg-[#0a0a0c] flex items-center justify-center text-slate-500 font-mono text-xs">Cargando Radar Marítimo...</div> }
);

const AirMap = dynamic(
  () => import('./LogisticsMap').then(m => ({ default: m.AirMap })),
  { ssr: false, loading: () => <div className="w-full h-full bg-[#0c0c0c] flex items-center justify-center text-slate-500 font-mono text-xs">Cargando Radar Aéreo...</div> }
);

const ArgentinaAirportsMap = dynamic(
  () => import('./ArgentinaAirportsMap'),
  { ssr: false, loading: () => <div className="w-full h-[450px] bg-[#0a0a0c] flex items-center justify-center text-slate-500 font-mono text-xs">Cargando Mapa Aerocomercial de Argentina...</div> }
);

const HotelOccupancyCard = dynamic(
  () => import('./HotelOccupancyCard'),
  { ssr: true }
);

const CruiseSeasonCard = dynamic(
  () => import('./CruiseSeasonCard'),
  { ssr: true }
);

interface LogisticsDashboardProps {
  onBackToHome?: () => void;
}

export default function LogisticsDashboard({ onBackToHome }: LogisticsDashboardProps) {
  const [activeMainTab, setActiveMainTab] = useState<'overview' | 'airports' | 'hotel' | 'cruises'>('overview');
  const [carouselSlide, setCarouselSlide] = useState<'ships' | 'flights'>('ships');
  const [isAutoCycle, setIsAutoCycle] = useState<boolean>(true);
  const [secondsToUpdate, setSecondsToUpdate] = useState<number>(30);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);

  // Datos consolidados
  const [tourismData, setTourismData] = useState<any>(null);
  const [cruiseData, setCruiseData] = useState<any>(null);
  const [flightDb, setFlightDb] = useState<any>(null);

  // Carga inicial de datos
  const loadAllData = async (showLoading = false) => {
    if (showLoading) setIsRefreshing(true);
    try {
      const res = await fetch('/api/tourism-stats', { cache: 'no-store' });
      const json = await res.json();
      if (json.success) {
        if (json.hotelStats) setTourismData(json.hotelStats);
        if (json.cruiseStats) setCruiseData(json.cruiseStats);
        if (json.flightsData) setFlightDb(json.flightsData);
      }
    } catch (err) {
      console.warn('Error loading logistics data:', err);
    } finally {
      if (showLoading) setIsRefreshing(false);
    }
  };

  useEffect(() => {
    loadAllData(false);
  }, []);

  // Timer de refresco satelital
  useEffect(() => {
    const timer = setInterval(() => {
      setSecondsToUpdate(prev => {
        if (prev <= 1) {
          loadAllData(false);
          return 30;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Auto ciclo de carrusel barcos / vuelos
  useEffect(() => {
    if (!isAutoCycle) return;
    const interval = setInterval(() => {
      setCarouselSlide(prev => (prev === 'ships' ? 'flights' : 'ships'));
    }, 8000);
    return () => clearInterval(interval);
  }, [isAutoCycle]);

  // Embarcaciones y Vuelos para la columna izquierda
  const ships = cruiseData?.temporada?.buquesDestacados || [];
  const flights = flightDb?.flights || [];
  const airports = flightDb?.airports || [];

  const totalShipPax = ships.reduce((acc: number, s: any) => acc + (s.paxCapacity || 0), 0);
  const totalFlightPax = flights.reduce((acc: number, f: any) => acc + (f.paxCapacity || 0), 0);
  const grandTotal = totalShipPax + totalFlightPax;
  const maxPax = Math.max(...ships.map((s: any) => s.paxCapacity || 0), ...flights.map((f: any) => f.paxCapacity || 0), 200);

  return (
    <div className="w-full flex flex-col gap-6 pb-12 animate-fadeIn">
      {/* 1. HEADER PRINCIPAL */}
      <header className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 bg-white/70 dark:bg-[#121214]/80 backdrop-blur-xl border border-slate-200/80 dark:border-white/10 rounded-3xl p-6 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-blue-600/20 flex items-center justify-center shadow-[0_0_20px_rgba(37,99,235,0.2)] shrink-0">
            <Anchor className="w-6 h-6 text-blue-500" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight font-display uppercase">
                Control de Arribos Regional
              </h1>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
                Tierra del Fuego
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-gray-400 mt-1">
              Tráfico Marítimo, Aéreo, Aeropuertos de Argentina y Ocupación Hotelera Oficial (INFUETUR / IPIEC).
            </p>
          </div>
        </div>

        {/* CONTROLES DE HEADER: INDICADOR SATELITAL + REFRESH */}
        <div className="flex items-center gap-2.5 w-full md:w-auto justify-end flex-wrap">
          <div className="flex items-center gap-2.5 bg-emerald-500/10 border border-emerald-500/25 px-3.5 py-2 rounded-xl shadow-sm text-xs font-bold text-emerald-600 dark:text-emerald-400">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
            </span>
            <span className="uppercase tracking-wider">Satelital Vivo</span>
            <span className="text-slate-300 dark:text-white/10 w-px h-3.5" />
            <span className="text-[10px] font-mono text-slate-500 dark:text-gray-400">
              Refresco en {secondsToUpdate}s
            </span>
          </div>

          <button
            onClick={() => loadAllData(true)}
            disabled={isRefreshing}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold border border-slate-200 dark:border-white/10 hover:border-blue-500/30 text-slate-700 dark:text-gray-200 bg-white dark:bg-white/5 hover:bg-blue-500/5 active:scale-95 transition-all shadow-sm"
            title="Sincronizar todas las fuentes de transporte y turismo"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-blue-500 ${isRefreshing ? 'animate-spin' : ''}`} />
            <span>{isRefreshing ? 'Sincronizando...' : 'Actualizar'}</span>
          </button>
        </div>
      </header>

      {/* 2. BARRA DE NAVEGACIÓN MODULAR DE PESTAÑAS */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-hide">
        <button
          onClick={() => setActiveMainTab('overview')}
          className={`px-4 py-2.5 rounded-2xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-2 ${
            activeMainTab === 'overview'
              ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-500/20'
              : 'bg-white dark:bg-[#121214] text-slate-600 dark:text-gray-400 border border-slate-200 dark:border-white/5 hover:border-slate-300 dark:hover:border-white/10'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>Panel General & Radars</span>
        </button>

        <button
          onClick={() => setActiveMainTab('airports')}
          className={`px-4 py-2.5 rounded-2xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-2 border ${
            activeMainTab === 'airports'
              ? 'bg-orange-500/15 border-orange-500/50 text-orange-600 dark:text-orange-400 shadow-sm'
              : 'bg-white dark:bg-[#121214] border-slate-200 dark:border-white/5 text-slate-600 dark:text-gray-400 hover:border-slate-300 dark:hover:border-white/10'
          }`}
        >
          <Plane className="w-4 h-4 text-orange-500" />
          <span>Mapa Aeropuertos Argentina</span>
          <span className="px-1.5 py-0.2 rounded-full bg-orange-500/10 text-[10px] font-mono">
            {flights.length} vuelos
          </span>
        </button>

        <button
          onClick={() => setActiveMainTab('hotel')}
          className={`px-4 py-2.5 rounded-2xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-2 border ${
            activeMainTab === 'hotel'
              ? 'bg-blue-500/15 border-blue-500/50 text-blue-600 dark:text-blue-400 shadow-sm'
              : 'bg-white dark:bg-[#121214] border-slate-200 dark:border-white/5 text-slate-600 dark:text-gray-400 hover:border-slate-300 dark:hover:border-white/10'
          }`}
        >
          <Building2 className="w-4 h-4 text-blue-500" />
          <span>Ocupación Hotelera EOH</span>
          <span className="px-1.5 py-0.2 rounded-full bg-blue-500/10 text-[10px] font-mono">
            {tourismData?.ultimoAno?.tasaOcupacionProvincial || 74.6}%
          </span>
        </button>

        <button
          onClick={() => setActiveMainTab('cruises')}
          className={`px-4 py-2.5 rounded-2xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-2 border ${
            activeMainTab === 'cruises'
              ? 'bg-cyan-500/15 border-cyan-500/50 text-cyan-600 dark:text-cyan-400 shadow-sm'
              : 'bg-white dark:bg-[#121214] border-slate-200 dark:border-white/5 text-slate-600 dark:text-gray-400 hover:border-slate-300 dark:hover:border-white/10'
          }`}
        >
          <Ship className="w-4 h-4 text-cyan-500" />
          <span>Temporada de Cruceros</span>
          <span className="px-1.5 py-0.2 rounded-full bg-cyan-500/10 text-[10px] font-mono">
            {cruiseData?.temporada?.totalRecaladasEstimadas || 592} recaladas
          </span>
        </button>
      </div>

      {/* 3. CONTENIDO PRINCIPAL SEGÚN TAB ACTIVA */}
      {/* VISTA 1: OVERVIEW (PANEL PRINCIPAL) */}
      {activeMainTab === 'overview' && (
        <div className="flex flex-col gap-8">
          <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 items-start">
            {/* COLUMNA IZQUIERDA: ESTADO DE TRÁNSITO */}
            <div className="xl:col-span-4 flex flex-col gap-6">
              <div className="bg-white dark:bg-[#0e0e0e] border border-slate-200 dark:border-[#1f1f1f] rounded-3xl p-4 md:p-6 shadow-2xl flex flex-col gap-5 relative overflow-hidden h-auto">
                <div className="flex items-center justify-between border-b border-slate-100 dark:border-white/5 pb-4">
                  <h3 className="text-xs font-black uppercase tracking-widest text-slate-900 dark:text-white">
                    Estado de Tránsito Regional
                  </h3>
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => setIsAutoCycle(!isAutoCycle)}
                      className={`p-1.5 rounded-lg border transition-all ${
                        isAutoCycle
                          ? 'bg-blue-600/10 border-blue-500/20 text-blue-500'
                          : 'bg-slate-100 dark:bg-white/5 border-slate-200 dark:border-white/10 text-slate-400'
                      }`}
                      title={isAutoCycle ? 'Pausar Rotación' : 'Activar Rotación'}
                    >
                      {isAutoCycle ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>

                {/* KPIS DE INTERCAMBIO DE PERSONAS */}
                <div className="flex flex-col gap-3 bg-gradient-to-br from-slate-50 to-blue-50/40 dark:from-[#111]/80 dark:to-blue-950/20 border border-slate-200 dark:border-blue-900/20 rounded-2xl p-4">
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { label: 'Embarcaciones', value: ships.length, icon: '⚓', color: 'text-blue-600 dark:text-blue-400', bg: 'bg-blue-500/10' },
                      { label: 'Vuelos', value: flights.length, icon: '✈️', color: 'text-orange-600 dark:text-orange-400', bg: 'bg-orange-500/10' },
                      { label: 'Total Personas', value: grandTotal.toLocaleString('es-AR'), icon: '👥', color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-500/10' },
                    ].map(kpi => (
                      <div key={kpi.label} className={`${kpi.bg} rounded-xl p-2.5 flex flex-col items-center gap-0.5`}>
                        <span className="text-base leading-none">{kpi.icon}</span>
                        <span className={`text-[17px] font-black leading-tight ${kpi.color}`}>{kpi.value}</span>
                        <span className="text-[7.5px] font-bold uppercase tracking-widest text-slate-500 dark:text-gray-500 text-center leading-tight">
                          {kpi.label}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* Desglose marítimo */}
                  <div className="flex flex-col gap-1.5">
                    <div className="flex items-center gap-1.5 pb-1 border-b border-slate-200 dark:border-white/5">
                      <span className="text-[9px] font-black uppercase tracking-widest text-blue-600 dark:text-blue-400">⚓ Marítimo</span>
                      <span className="ml-auto text-[9px] font-black text-slate-500 dark:text-gray-500">{totalShipPax} personas</span>
                    </div>
                    {ships.slice(0, 5).map((ship: any) => (
                      <div key={ship.id} className="flex flex-col gap-0.5">
                        <div className="flex items-center justify-between">
                          <span className="text-[8.5px] font-bold text-slate-700 dark:text-gray-300 truncate max-w-[120px]">{ship.name}</span>
                          <span className="text-[8.5px] font-black text-blue-600 dark:text-blue-400 tabular-nums">{ship.paxCapacity}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <div className="flex-1 h-1 bg-slate-200 dark:bg-white/5 rounded-full overflow-hidden">
                            <div className="h-full bg-blue-500 rounded-full transition-all duration-700" style={{ width: `${(ship.paxCapacity / maxPax) * 100}%` }} />
                          </div>
                          <span className="text-[7px] text-slate-400 dark:text-gray-600 truncate max-w-[90px]">{ship.type}</span>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Desglose aéreo */}
                  <div className="flex flex-col gap-1.5">
                    <div className="flex items-center gap-1.5 pb-1 border-b border-slate-200 dark:border-white/5">
                      <span className="text-[9px] font-black uppercase tracking-widest text-orange-600 dark:text-orange-400">✈️ Aéreo</span>
                      <span className="ml-auto text-[9px] font-black text-slate-500 dark:text-gray-500">{totalFlightPax} personas</span>
                    </div>
                    {flights.slice(0, 5).map((flight: any) => (
                      <div key={flight.id} className="flex flex-col gap-0.5">
                        <div className="flex items-center justify-between">
                          <span className="text-[8.5px] font-bold text-slate-700 dark:text-gray-300">{flight.flight} <span className="text-[7px] text-slate-400 font-normal">{flight.type}</span></span>
                          <span className="text-[8.5px] font-black text-orange-600 dark:text-orange-400 tabular-nums">{flight.paxCapacity}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <div className="flex-1 h-1 bg-slate-200 dark:bg-white/5 rounded-full overflow-hidden">
                            <div className="h-full bg-orange-500 rounded-full transition-all duration-700" style={{ width: `${(flight.paxCapacity / maxPax) * 100}%` }} />
                          </div>
                          <span className="text-[7px] text-slate-400 dark:text-gray-600">{flight.route}</span>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Total destacado */}
                  <div className="flex items-center justify-between bg-emerald-500/10 border border-emerald-500/20 rounded-xl px-3 py-2 mt-1">
                    <span className="text-[9px] font-black uppercase tracking-widest text-emerald-700 dark:text-emerald-400">Intercambio total estimado</span>
                    <span className="text-[18px] font-black text-emerald-600 dark:text-emerald-400 tabular-nums">{grandTotal.toLocaleString('es-AR')}</span>
                  </div>
                </div>

                {/* Tabs Selector Barcos / Vuelos */}
                <div className="grid grid-cols-2 gap-2 bg-slate-100 dark:bg-white/5 p-1 rounded-2xl border border-slate-200 dark:border-white/5">
                  <button
                    onClick={() => { setCarouselSlide('ships'); setIsAutoCycle(false); }}
                    className={`flex items-center justify-center gap-2 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer ${
                      carouselSlide === 'ships' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-500 hover:text-slate-800 dark:text-gray-400 dark:hover:text-white'
                    }`}
                  >
                    <Anchor className="w-3.5 h-3.5" /> Barcos & Cruceros
                  </button>
                  <button
                    onClick={() => { setCarouselSlide('flights'); setIsAutoCycle(false); }}
                    className={`flex items-center justify-center gap-2 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer ${
                      carouselSlide === 'flights' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-500 hover:text-slate-800 dark:text-gray-400 dark:hover:text-white'
                    }`}
                  >
                    <Plane className="w-3.5 h-3.5" /> Tránsito Aéreo
                  </button>
                </div>

                {/* Detalle del slide activo */}
                <div className="flex-1 flex flex-col relative overflow-hidden">
                  <AnimatePresence mode="wait">
                    {carouselSlide === 'ships' ? (
                      <motion.div
                        key="ships-slide"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        className="flex-1 flex flex-col gap-4"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-black text-slate-400 dark:text-gray-500 uppercase tracking-widest">
                            Arribos Marítimos ({ships.length})
                          </span>
                          <a href="https://infuetur.gob.ar/estadistica/temporada_de_cruceros" target="_blank" rel="noopener noreferrer" className="text-[9px] font-bold text-blue-500 hover:underline flex items-center gap-1">
                            INFO OFICIAL <ExternalLink className="w-3 h-3" />
                          </a>
                        </div>

                        <div className="flex flex-col gap-3 overflow-y-auto scrollbar-hide max-h-[380px] pr-1">
                          {ships.map((ship: any) => (
                            <div key={ship.id} className="bg-slate-50 dark:bg-[#161616]/40 border border-slate-200 dark:border-[#222] rounded-2xl p-3.5 flex flex-col gap-2">
                              <div className="flex items-center justify-between">
                                <span className={`text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full ${
                                  ship.status === 'En Puerto'
                                    ? 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
                                    : 'bg-amber-500/20 text-amber-600 dark:text-amber-400 border border-amber-500/20'
                                }`}>
                                  {ship.status}
                                </span>
                                <span className="text-[9px] font-bold text-slate-500">{ship.time}</span>
                              </div>
                              <div className="flex items-center justify-between">
                                <span className="text-xs font-black text-slate-900 dark:text-white uppercase truncate">{ship.name}</span>
                                <span className="text-[10px] text-slate-500">{ship.flag}</span>
                              </div>
                              <div className="flex items-center justify-between text-[10px] border-t border-slate-100 dark:border-white/5 pt-1.5 text-slate-500 font-mono">
                                <span>{ship.destination}</span>
                                <span className="font-bold text-blue-500">{ship.paxCapacity} pax</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </motion.div>
                    ) : (
                      <motion.div
                        key="flights-slide"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        className="flex-1 flex flex-col gap-4"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-black text-slate-400 dark:text-gray-500 uppercase tracking-widest">
                            Tránsito Aéreo ({flights.length})
                          </span>
                          <div className="flex gap-2">
                            <button onClick={() => setActiveMainTab('airports')} className="text-[9px] font-bold text-orange-500 hover:underline flex items-center gap-0.5">
                              VER MAPA <ExternalLink className="w-2.5 h-2.5" />
                            </button>
                          </div>
                        </div>

                        <div className="flex flex-col gap-3 overflow-y-auto scrollbar-hide max-h-[380px] pr-1">
                          {flights.map((flight: any) => (
                            <div key={flight.id} className="bg-slate-50 dark:bg-[#161616]/40 border border-slate-200 dark:border-[#222] rounded-2xl p-3.5 flex flex-col gap-2">
                              <div className="flex items-center justify-between">
                                <span className={`text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full ${
                                  flight.status === 'En Vuelo'
                                    ? 'bg-blue-500/20 text-blue-600 dark:text-blue-400 border border-blue-500/20 animate-pulse'
                                    : 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
                                }`}>
                                  {flight.status}
                                </span>
                                <span className="text-[9px] font-bold text-slate-500">{flight.time}</span>
                              </div>
                              <div className="flex items-center justify-between">
                                <span className="text-xs font-black text-slate-900 dark:text-white uppercase italic">{flight.flight}</span>
                                <span className="text-[10px] font-bold text-slate-700 dark:text-gray-300">{flight.route}</span>
                              </div>
                              <div className="flex items-center justify-between text-[10px] border-t border-slate-100 dark:border-white/5 pt-1.5 text-slate-500 font-mono">
                                <span>{flight.type}</span>
                                <span className="font-bold text-orange-500">{flight.airline}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </div>

            {/* COLUMNA DERECHA: STACK DE RADARS AIS & AIRNAV */}
            <div className="xl:col-span-8 flex flex-col gap-8">
              {/* Radar Marítimo */}
              <div className="bg-white dark:bg-[#0e0e0e] border border-slate-200 dark:border-[#1f1f1f] rounded-3xl overflow-hidden shadow-2xl flex flex-col">
                <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-[#1f1f1f] bg-white dark:bg-[#0e0e0e]/90 backdrop-blur-sm">
                  <div className="flex items-center gap-3">
                    <div className="w-6 h-6 rounded bg-blue-600/20 flex items-center justify-center">
                      <Anchor className="w-3.5 h-3.5 text-blue-500" />
                    </div>
                    <h2 className="text-[13px] font-bold text-slate-800 dark:text-gray-200 tracking-wide uppercase">
                      Radar AIS de Tráfico Marítimo — MarineTraffic
                    </h2>
                  </div>
                  <a
                    href="https://www.marinetraffic.com/en/ais/home/centerx:-69.4/centery:-53.9/zoom:6"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 text-[9px] font-mono text-blue-500 hover:text-blue-400 uppercase font-black border border-blue-500/20 bg-blue-500/5 px-3 py-1.5 rounded-full transition-all"
                  >
                    <ExternalLink className="w-3 h-3" />
                    Ver Completo
                  </a>
                </div>
                <div className="w-full h-[260px] md:h-[370px] relative bg-white dark:bg-[#0c0c0c] overflow-hidden">
                  <MaritimeMap />
                </div>
                <div className="flex flex-wrap items-center gap-3 px-5 py-3 border-t border-slate-200 dark:border-[#1f1f1f] bg-slate-50/60 dark:bg-black/20 text-[9px] font-bold uppercase text-slate-500 dark:text-gray-400">
                  <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-blue-600" /> Puerto Ushuaia</span>
                  <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-cyan-600" /> Puerto Río Grande</span>
                  <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-indigo-600" /> Canal Beagle</span>
                  <span className="ml-auto font-mono text-slate-400">AIS en tiempo real</span>
                </div>
              </div>

              {/* Radar Aéreo */}
              <div className="bg-white dark:bg-[#0e0e0e] border border-slate-200 dark:border-[#1f1f1f] rounded-3xl overflow-hidden shadow-2xl flex flex-col">
                <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-[#1f1f1f] bg-white dark:bg-[#0e0e0e]/90 backdrop-blur-sm">
                  <div className="flex items-center gap-3">
                    <div className="w-6 h-6 rounded bg-orange-600/20 flex items-center justify-center">
                      <Plane className="w-3.5 h-3.5 text-orange-500" />
                    </div>
                    <h2 className="text-[13px] font-bold text-slate-800 dark:text-gray-200 tracking-wide uppercase">
                      Radar de Tráfico Aéreo — AirNav Radar
                    </h2>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setActiveMainTab('airports')}
                      className="flex items-center gap-1 text-[9px] font-mono text-orange-500 hover:text-orange-400 uppercase font-black border border-orange-500/20 bg-orange-500/5 px-3 py-1.5 rounded-full transition-all"
                    >
                      <Compass className="w-3 h-3" />
                      Cotejar Mapa Argentina
                    </button>
                    <a
                      href="https://es.airnavradar.com/#@-53.73,-68.22,7z"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 text-[9px] font-mono text-slate-400 hover:text-white uppercase font-black border border-slate-200 dark:border-white/10 px-3 py-1.5 rounded-full transition-all"
                    >
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                </div>
                <div className="w-full h-[260px] md:h-[370px] relative bg-white dark:bg-[#0c0c0c] overflow-hidden">
                  <AirMap />
                </div>
                <div className="flex flex-wrap items-center gap-3 px-5 py-3 border-t border-slate-200 dark:border-[#1f1f1f] bg-slate-50/60 dark:bg-black/20 text-[9px] font-bold uppercase text-slate-500 dark:text-gray-400">
                  <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-orange-600" /> Ushuaia (USH)</span>
                  <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-purple-600" /> Río Grande (RGA)</span>
                  <span className="ml-auto font-mono text-slate-400">ADS-B / AirNav Radar</span>
                </div>
              </div>
            </div>
          </div>

          {/* TARJETAS DE OCUPACIÓN HOTELERA Y CRUCEROS EN EL PANEL PRINCIPAL */}
          <div className="grid grid-cols-1 gap-8">
            <HotelOccupancyCard initialData={tourismData} onRefresh={() => loadAllData(true)} />
            <CruiseSeasonCard initialData={cruiseData} />
          </div>
        </div>
      )}

      {/* VISTA 2: MAPA DE AEROPUERTOS DE ARGENTINA (CON COTEJO DE RADAR) */}
      {activeMainTab === 'airports' && (
        <div className="flex flex-col gap-6">
          <ArgentinaAirportsMap airports={airports} flights={flights} />

          {/* Tracker complementario de AirNav para cotejo directo */}
          <div className="bg-white dark:bg-[#0e0e0e] border border-slate-200 dark:border-[#1f1f1f] rounded-3xl overflow-hidden shadow-2xl flex flex-col">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-[#1f1f1f]">
              <div className="flex items-center gap-3">
                <Plane className="w-5 h-5 text-orange-500" />
                <h3 className="text-sm font-black uppercase text-slate-900 dark:text-white">
                  Tracker en Tiempo Real para Cotejar — AirNav Radar
                </h3>
              </div>
              <span className="text-[10px] font-mono text-slate-400">Vuelos de cabotaje en ruta a TDF</span>
            </div>
            <div className="w-full h-[320px] md:h-[420px] relative bg-white dark:bg-[#0c0c0c]">
              <AirMap />
            </div>
          </div>
        </div>
      )}

      {/* VISTA 3: OCUPACIÓN HOTELERA COMPLETA */}
      {activeMainTab === 'hotel' && (
        <div className="flex flex-col gap-6">
          <HotelOccupancyCard initialData={tourismData} onRefresh={() => loadAllData(true)} />
        </div>
      )}

      {/* VISTA 4: TEMPORADA DE CRUCEROS COMPLETA */}
      {activeMainTab === 'cruises' && (
        <div className="flex flex-col gap-6">
          <CruiseSeasonCard initialData={cruiseData} />
        </div>
      )}
    </div>
  );
}
