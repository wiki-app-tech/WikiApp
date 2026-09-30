'use client';

import React, { useState, useEffect, useMemo } from 'react';
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
  Info,
  CheckCircle2,
  Navigation,
  Eye,
  Radio,
  Globe2,
  Maximize2,
  Flame,
  Camera,
  AlertTriangle,
  Activity,
  Shield,
  Zap,
  Cable
} from 'lucide-react';

// Dynamic imports with ssr: false for maps
const OsirisMap = dynamic(
  () => import('./OsirisMap'),
  { ssr: false, loading: () => <div className="w-full h-[550px] bg-[#02050e] flex items-center justify-center text-cyan-400 font-mono text-xs">Cargando Plataforma de Inteligencia Global OSIRIS...</div> }
);

const MaritimeMap = dynamic(
  () => import('./LogisticsMap').then(m => ({ default: m.MaritimeMap })),
  { ssr: false, loading: () => <div className="w-full h-full bg-[#0a0a0c] flex items-center justify-center text-slate-500 font-mono text-xs">Cargando Radar Marítimo...</div> }
);

const AirMap = dynamic(
  () => import('./LogisticsMap').then(m => ({ default: m.AirMap })),
  { ssr: false, loading: () => <div className="w-full h-full bg-[#0c0c0c] flex items-center justify-center text-slate-500 font-mono text-xs">Cargando Radar Aéreo...</div> }
);

const GodsViewMap = dynamic(
  () => import('./GodsViewMap'),
  { ssr: false, loading: () => <div className="w-full h-[450px] bg-[#02050e] flex items-center justify-center text-cyan-400 font-mono text-xs">Cargando Radar Satelital GodsViewAI 3D...</div> }
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
  const [activeMainTab, setActiveMainTab] = useState<'overview' | 'airports' | 'godsview' | 'osiris' | 'hotel' | 'cruises'>('overview');
  const [carouselSlide, setCarouselSlide] = useState<'ships' | 'flights'>('ships');
  const [airRadarMode, setAirRadarMode] = useState<'osiris' | 'godsview' | 'airnav'>('osiris');
  const [airportTrackerMode, setAirportTrackerMode] = useState<'osiris' | 'godsview' | 'airnav'>('airnav');
  const [isAutoCycle, setIsAutoCycle] = useState<boolean>(false);
  const [secondsToUpdate, setSecondsToUpdate] = useState<number>(30);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);

  // Estados específicos para el cotejo AIS y reevaluación de visitantes
  const [selectedVesselId, setSelectedVesselId] = useState<string | null>('stella-australis');
  const [shipFilter, setShipFilter] = useState<'all' | 'crucero' | 'catamaran' | 'servicio'>('all');
  const [kpiMode, setKpiMode] = useState<'visitors' | 'consolidated'>('visitors');
  const [maritimeViewMode, setMaritimeViewMode] = useState<'cotejo' | 'radar'>('cotejo');
  const [maritimeZoom, setMaritimeZoom] = useState<'ushuaia' | 'beagle' | 'regional'>('ushuaia');

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

  // Auto ciclo opcional de carrusel barcos / vuelos
  useEffect(() => {
    if (!isAutoCycle) return;
    const interval = setInterval(() => {
      setCarouselSlide(prev => (prev === 'ships' ? 'flights' : 'ships'));
    }, 10000);
    return () => clearInterval(interval);
  }, [isAutoCycle]);

  // Embarcaciones y Vuelos
  const ships = useMemo(() => cruiseData?.temporada?.buquesDestacados || [], [cruiseData]);
  const flights = useMemo(() => flightDb?.flights || [], [flightDb]);
  const airports = useMemo(() => flightDb?.airports || [], [flightDb]);

  // CÁLCULOS DE REEVALUACIÓN DE PERSONAS QUE VISITAN USHUAIA
  const cruisePax = useMemo(() => 
    ships.filter((s: any) => s.category === 'crucero').reduce((acc: number, s: any) => acc + (s.paxCapacity || 0), 0)
  , [ships]);

  const catamaranPax = useMemo(() => 
    ships.filter((s: any) => s.category === 'catamaran').reduce((acc: number, s: any) => acc + (s.paxCapacity || 0), 0)
  , [ships]);

  const totalMaritimePax = cruisePax + catamaranPax;
  const totalMaritimeCrew = useMemo(() => 
    ships.reduce((acc: number, s: any) => acc + (s.crewCount || 0), 0)
  , [ships]);
  const grandMaritimeTotal = totalMaritimePax + totalMaritimeCrew;

  // Pasajeros que arriban a Ushuaia en vuelos comerciales
  const ushFlightPax = useMemo(() => 
    flights.filter((f: any) => f.destCode === 'USH' || f.cityTDF === 'Ushuaia').reduce((acc: number, f: any) => acc + (f.paxCapacity || 0), 0)
  , [flights]);

  const totalFlightPax = useMemo(() => 
    flights.reduce((acc: number, f: any) => acc + (f.paxCapacity || 0), 0)
  , [flights]);

  // Totales reevaluados:
  // 1. Turistas netos visitando Ushuaia hoy (Cruceristas + Excursión náutica + Arribos aéreos a USH)
  const totalUshuaiaVisitors = totalMaritimePax + ushFlightPax;
  // 2. Movimiento operativo global consolidado (incluyendo tripulaciones)
  const grandTotalConsolidated = grandMaritimeTotal + totalFlightPax;

  const maxPax = Math.max(
    ...ships.map((s: any) => s.paxCapacity || 0), 
    ...flights.map((f: any) => f.paxCapacity || 0), 
    300
  );

  // Filtrado de buques según categoría
  const filteredShips = useMemo(() => {
    if (shipFilter === 'all') return ships;
    return ships.filter((s: any) => s.category === shipFilter);
  }, [ships, shipFilter]);

  const selectedVessel = useMemo(() => 
    ships.find((s: any) => s.id === selectedVesselId) || ships[0] || null
  , [ships, selectedVesselId]);

  const handleSelectShip = (ship: any) => {
    setSelectedVesselId(ship.id);
    setMaritimeViewMode('cotejo');
  };

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
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                AIS Cotejado con DPP
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-gray-400 mt-1">
              Tráfico Marítimo y Aéreo en tiempo real, cotejado con Radar AIS VesselFinder, OpenCPN y Dirección Provincial de Puertos.
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
            <span className="uppercase tracking-wider">AIS Satelital Vivo</span>
            <span className="text-slate-300 dark:text-white/10 w-px h-3.5" />
            <span className="text-[10px] font-mono text-slate-500 dark:text-gray-400">
              Refresco en {secondsToUpdate}s
            </span>
          </div>

          <button
            onClick={() => loadAllData(true)}
            disabled={isRefreshing}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold border border-slate-200 dark:border-white/10 hover:border-blue-500/30 text-slate-700 dark:text-gray-200 bg-white dark:bg-white/5 hover:bg-blue-500/5 active:scale-95 transition-all shadow-sm cursor-pointer"
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
          className={`px-4 py-2.5 rounded-2xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-2 cursor-pointer ${
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
          className={`px-4 py-2.5 rounded-2xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-2 border cursor-pointer ${
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
          onClick={() => setActiveMainTab('osiris')}
          className={`px-4 py-2.5 rounded-2xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-2 border cursor-pointer ${
            activeMainTab === 'osiris'
              ? 'bg-gradient-to-r from-cyan-600 via-blue-600 to-indigo-600 text-white shadow-lg shadow-cyan-500/25 border-cyan-400'
              : 'bg-white dark:bg-[#121214] border-slate-200 dark:border-white/5 text-slate-600 dark:text-gray-400 hover:border-slate-300 dark:hover:border-white/10'
          }`}
        >
          <div className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
          <Globe2 className="w-4 h-4 text-cyan-400" />
          <span>OSIRIS Inteligencia Global</span>
          <span className="px-1.5 py-0.2 rounded-full bg-cyan-500/20 text-cyan-300 text-[10px] font-mono font-bold">
            OSINT Multidominio
          </span>
        </button>

        <button
          onClick={() => setActiveMainTab('godsview')}
          className={`px-4 py-2.5 rounded-2xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-2 border cursor-pointer ${
            activeMainTab === 'godsview'
              ? 'bg-cyan-500/15 border-cyan-500/50 text-cyan-600 dark:text-cyan-400 shadow-md shadow-cyan-500/10'
              : 'bg-white dark:bg-[#121214] border-slate-200 dark:border-white/5 text-slate-600 dark:text-gray-400 hover:border-slate-300 dark:hover:border-white/10'
          }`}
        >
          <Globe2 className="w-4 h-4 text-cyan-500 animate-spin-slow" />
          <span>GodsViewAI 3D Live</span>
          <span className="px-1.5 py-0.2 rounded-full bg-cyan-500/10 text-cyan-500 dark:text-cyan-400 text-[10px] font-mono font-bold">
            Satelital
          </span>
        </button>

        <button
          onClick={() => setActiveMainTab('hotel')}
          className={`px-4 py-2.5 rounded-2xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-2 border cursor-pointer ${
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
          className={`px-4 py-2.5 rounded-2xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-2 border cursor-pointer ${
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

      {/* 3. CONTENIDO PRINCIPAL: OVERVIEW */}
      {activeMainTab === 'overview' && (
        <div className="flex flex-col gap-8">
          <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 items-start">
            
            {/* COLUMNA IZQUIERDA: ESTADO DE TRÁNSITO & REEVALUACIÓN DE VISITANTES */}
            <div className="xl:col-span-4 flex flex-col gap-6">
              <div className="bg-white dark:bg-[#0e0e0e] border border-slate-200 dark:border-[#1f1f1f] rounded-3xl p-4 md:p-6 shadow-2xl flex flex-col gap-5 relative overflow-hidden h-auto">
                
                {/* Cabecera del panel izquierdo */}
                <div className="flex items-center justify-between border-b border-slate-100 dark:border-white/5 pb-4">
                  <div>
                    <h3 className="text-xs font-black uppercase tracking-widest text-slate-900 dark:text-white">
                      Estado de Tránsito Regional
                    </h3>
                    <span className="text-[10px] font-bold text-blue-600 dark:text-blue-400">
                      Cotejado con AIS Puerto Ushuaia
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => setIsAutoCycle(!isAutoCycle)}
                      className={`p-1.5 rounded-lg border transition-all cursor-pointer ${
                        isAutoCycle
                          ? 'bg-blue-600/10 border-blue-500/20 text-blue-500'
                          : 'bg-slate-100 dark:bg-white/5 border-slate-200 dark:border-white/10 text-slate-400'
                      }`}
                      title={isAutoCycle ? 'Pausar Rotación' : 'Activar Rotación Automática'}
                    >
                      {isAutoCycle ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>

                {/* KPIS REEVALUADOS DE PERSONAS QUE VISITAN USHUAIA */}
                <div className="flex flex-col gap-3 bg-gradient-to-br from-slate-50 to-blue-50/40 dark:from-[#111]/80 dark:to-blue-950/20 border border-slate-200 dark:border-blue-900/20 rounded-2xl p-4">
                  
                  {/* Selector de Modo de Reevaluación */}
                  <div className="flex items-center gap-1 bg-white/80 dark:bg-black/40 p-1 rounded-xl border border-slate-200 dark:border-white/10 text-[9px] font-black uppercase">
                    <button
                      onClick={() => setKpiMode('visitors')}
                      className={`flex-1 py-1.5 px-2 rounded-lg transition-all text-center cursor-pointer ${
                        kpiMode === 'visitors'
                          ? 'bg-blue-600 text-white shadow-sm'
                          : 'text-slate-500 hover:text-slate-900 dark:text-gray-400 dark:hover:text-white'
                      }`}
                    >
                      Turistas que Visitan Ushuaia
                    </button>
                    <button
                      onClick={() => setKpiMode('consolidated')}
                      className={`flex-1 py-1.5 px-2 rounded-lg transition-all text-center cursor-pointer ${
                        kpiMode === 'consolidated'
                          ? 'bg-blue-600 text-white shadow-sm'
                          : 'text-slate-500 hover:text-slate-900 dark:text-gray-400 dark:hover:text-white'
                      }`}
                    >
                      Flujo Operativo Total (Inc. Trip.)
                    </button>
                  </div>

                  {/* 3 Stat Boxes principales */}
                  <div className="grid grid-cols-3 gap-2">
                    <div className="bg-blue-500/10 rounded-xl p-2.5 flex flex-col items-center gap-0.5">
                      <span className="text-base leading-none">⚓</span>
                      <span className="text-[17px] font-black leading-tight text-blue-600 dark:text-blue-400">
                        {ships.length}
                      </span>
                      <span className="text-[7.5px] font-bold uppercase tracking-widest text-slate-500 dark:text-gray-500 text-center leading-tight">
                        Embarcaciones
                      </span>
                    </div>

                    <div className="bg-orange-500/10 rounded-xl p-2.5 flex flex-col items-center gap-0.5">
                      <span className="text-base leading-none">✈️</span>
                      <span className="text-[17px] font-black leading-tight text-orange-600 dark:text-orange-400">
                        {flights.length}
                      </span>
                      <span className="text-[7.5px] font-bold uppercase tracking-widest text-slate-500 dark:text-gray-500 text-center leading-tight">
                        Vuelos Activos
                      </span>
                    </div>

                    <div className="bg-emerald-500/10 rounded-xl p-2.5 flex flex-col items-center gap-0.5">
                      <span className="text-base leading-none">👥</span>
                      <span className="text-[17px] font-black leading-tight text-emerald-600 dark:text-emerald-400">
                        {kpiMode === 'visitors'
                          ? totalUshuaiaVisitors.toLocaleString('es-AR')
                          : grandTotalConsolidated.toLocaleString('es-AR')}
                      </span>
                      <span className="text-[7.5px] font-bold uppercase tracking-widest text-slate-500 dark:text-gray-500 text-center leading-tight">
                        {kpiMode === 'visitors' ? 'Turistas Ushuaia' : 'Total Personas'}
                      </span>
                    </div>
                  </div>

                  {/* Desglose Marítimo Reevaluado */}
                  <div className="flex flex-col gap-1.5 pt-1 border-t border-slate-200 dark:border-white/5">
                    <div className="flex items-center gap-1.5 pb-1">
                      <span className="text-[9px] font-black uppercase tracking-widest text-blue-600 dark:text-blue-400 flex items-center gap-1">
                        ⚓ Marítimo ({totalMaritimePax.toLocaleString('es-AR')} turistas)
                      </span>
                      <span className="ml-auto text-[8.5px] font-bold text-slate-400">
                        +{totalMaritimeCrew} tripulantes
                      </span>
                    </div>

                    {/* Muestra las 5 principales naves con capacidad */}
                    {filteredShips.slice(0, 5).map((ship: any) => {
                      const isSelected = selectedVesselId === ship.id;
                      return (
                        <div 
                          key={ship.id} 
                          onClick={() => handleSelectShip(ship)}
                          className={`flex flex-col gap-0.5 p-1 rounded-lg cursor-pointer transition-all ${
                            isSelected ? 'bg-blue-500/10 ring-1 ring-blue-500/30' : 'hover:bg-slate-200/50 dark:hover:bg-white/5'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-[8.5px] font-bold text-slate-700 dark:text-gray-300 truncate max-w-[130px] flex items-center gap-1">
                              <span>{ship.category === 'crucero' ? '🚢' : ship.category === 'catamaran' ? '🛥️' : '⚓'}</span>
                              <span>{ship.name}</span>
                            </span>
                            <span className="text-[8.5px] font-black text-blue-600 dark:text-blue-400 tabular-nums">
                              {ship.paxCapacity} pax
                            </span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <div className="flex-1 h-1 bg-slate-200 dark:bg-white/5 rounded-full overflow-hidden">
                              <div 
                                className={`h-full rounded-full transition-all duration-700 ${
                                  ship.category === 'crucero' ? 'bg-blue-500' : ship.category === 'catamaran' ? 'bg-cyan-500' : 'bg-slate-400'
                                }`} 
                                style={{ width: `${Math.min(100, (ship.paxCapacity / maxPax) * 100)}%` }} 
                              />
                            </div>
                            <span className="text-[7px] text-slate-400 dark:text-gray-500 truncate max-w-[95px]">
                              {ship.type}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Desglose Aéreo */}
                  <div className="flex flex-col gap-1.5 pt-1 border-t border-slate-200 dark:border-white/5">
                    <div className="flex items-center gap-1.5 pb-1">
                      <span className="text-[9px] font-black uppercase tracking-widest text-orange-600 dark:text-orange-400 flex items-center gap-1">
                        ✈️ Aéreo Ushuaia ({ushFlightPax.toLocaleString('es-AR')} pax)
                      </span>
                      <span className="ml-auto text-[8.5px] font-bold text-slate-400">
                        Total TDF: {totalFlightPax}
                      </span>
                    </div>
                    {flights.slice(0, 4).map((flight: any) => (
                      <div key={flight.id} className="flex flex-col gap-0.5">
                        <div className="flex items-center justify-between">
                          <span className="text-[8.5px] font-bold text-slate-700 dark:text-gray-300">
                            {flight.flight} <span className="text-[7px] text-slate-400 font-normal">({flight.type})</span>
                          </span>
                          <span className="text-[8.5px] font-black text-orange-600 dark:text-orange-400 tabular-nums">
                            {flight.paxCapacity} pax
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <div className="flex-1 h-1 bg-slate-200 dark:bg-white/5 rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-orange-500 rounded-full transition-all duration-700" 
                              style={{ width: `${(flight.paxCapacity / maxPax) * 100}%` }} 
                            />
                          </div>
                          <span className="text-[7px] text-slate-400 dark:text-gray-500">{flight.route}</span>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Total Destacado Reevaluado */}
                  <div className="flex flex-col gap-1 bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-3 mt-1">
                    <div className="flex items-center justify-between">
                      <span className="text-[9px] font-black uppercase tracking-widest text-emerald-700 dark:text-emerald-400">
                        {kpiMode === 'visitors' ? 'Visitantes Turísticos en Ushuaia' : 'Intercambio Total Estimado'}
                      </span>
                      <span className="text-[19px] font-black text-emerald-600 dark:text-emerald-400 tabular-nums leading-none">
                        {kpiMode === 'visitors'
                          ? totalUshuaiaVisitors.toLocaleString('es-AR')
                          : grandTotalConsolidated.toLocaleString('es-AR')}
                      </span>
                    </div>
                    <span className="text-[8px] text-slate-500 dark:text-gray-400 leading-tight">
                      * Cómputo oficial unificado: Cruceristas + Excursión marítima + Arribos Aeropuerto USH (INFUETUR / DPP / AIS).
                    </span>
                  </div>
                </div>

                {/* TABS SELECTOR: BARCOS COTEJADOS / VUELOS */}
                <div className="grid grid-cols-2 gap-2 bg-slate-100 dark:bg-white/5 p-1 rounded-2xl border border-slate-200 dark:border-white/5">
                  <button
                    onClick={() => { setCarouselSlide('ships'); setIsAutoCycle(false); }}
                    className={`flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer ${
                      carouselSlide === 'ships'
                        ? 'bg-blue-600 text-white shadow-md'
                        : 'text-slate-500 hover:text-slate-800 dark:text-gray-400 dark:hover:text-white'
                    }`}
                  >
                    <Anchor className="w-3.5 h-3.5" /> Barcos AIS ({ships.length})
                  </button>
                  <button
                    onClick={() => { setCarouselSlide('flights'); setIsAutoCycle(false); }}
                    className={`flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer ${
                      carouselSlide === 'flights'
                        ? 'bg-blue-600 text-white shadow-md'
                        : 'text-slate-500 hover:text-slate-800 dark:text-gray-400 dark:hover:text-white'
                    }`}
                  >
                    <Plane className="w-3.5 h-3.5" /> Tránsito Aéreo ({flights.length})
                  </button>
                </div>

                {/* DETALLE DEL SLIDE ACTIVO CON LISTADO COMPLETO Y COTEJABLE */}
                <div className="flex-1 flex flex-col relative overflow-hidden">
                  <AnimatePresence mode="wait">
                    {carouselSlide === 'ships' ? (
                      <motion.div
                        key="ships-slide"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        className="flex-1 flex flex-col gap-3"
                      >
                        {/* Filtros de Categorías de Embarcaciones */}
                        <div className="flex items-center gap-1 overflow-x-auto pb-1 scrollbar-hide text-[8px] font-black uppercase">
                          {[
                            { id: 'all', label: `Todos (${ships.length})` },
                            { id: 'crucero', label: `Cruceros (${ships.filter((s: any) => s.category === 'crucero').length})` },
                            { id: 'catamaran', label: `Catamarán (${ships.filter((s: any) => s.category === 'catamaran').length})` },
                            { id: 'servicio', label: `Servicio (${ships.filter((s: any) => s.category === 'servicio').length})` },
                          ].map(f => (
                            <button
                              key={f.id}
                              onClick={() => setShipFilter(f.id as any)}
                              className={`px-2 py-1 rounded-lg transition-all whitespace-nowrap cursor-pointer ${
                                shipFilter === f.id
                                  ? 'bg-blue-600 text-white shadow-xs'
                                  : 'bg-slate-100 dark:bg-white/5 text-slate-500 hover:text-slate-900 dark:text-gray-400 dark:hover:text-white'
                              }`}
                            >
                              {f.label}
                            </button>
                          ))}
                        </div>

                        {/* LISTADO SCROLLABLE DE EMBARCACIONES COTEJADAS */}
                        <div className="flex flex-col gap-2.5 overflow-y-auto scrollbar-hide max-h-[420px] pr-1">
                          {filteredShips.map((ship: any) => {
                            const isSelected = selectedVesselId === ship.id;
                            return (
                              <div
                                key={ship.id}
                                onClick={() => handleSelectShip(ship)}
                                className={`rounded-2xl p-3.5 flex flex-col gap-2 transition-all cursor-pointer border ${
                                  isSelected
                                    ? 'bg-blue-500/10 dark:bg-blue-950/30 border-blue-500 shadow-md ring-1 ring-blue-500/30'
                                    : 'bg-slate-50 dark:bg-[#161616]/40 border-slate-200 dark:border-[#222] hover:border-slate-300 dark:hover:border-white/10'
                                }`}
                              >
                                <div className="flex items-center justify-between gap-1">
                                  <span className={`text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full ${
                                    ship.status.includes('Puerto') || ship.status.includes('Muelle')
                                      ? 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
                                      : ship.status.includes('Rada') || ship.status.includes('Fondeo')
                                      ? 'bg-amber-500/20 text-amber-600 dark:text-amber-400 border border-amber-500/20'
                                      : 'bg-blue-500/20 text-blue-600 dark:text-blue-400 border border-blue-500/20'
                                  }`}>
                                    {ship.status}
                                  </span>

                                  <span className="text-[9px] font-mono text-slate-400">
                                    MMSI: {ship.mmsi}
                                  </span>
                                </div>

                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-1.5 min-w-0">
                                    <span className="text-sm">
                                      {ship.category === 'crucero' ? '🚢' : ship.category === 'catamaran' ? '🛥️' : '⚓'}
                                    </span>
                                    <span className="text-xs font-black text-slate-900 dark:text-white uppercase truncate">
                                      {ship.name}
                                    </span>
                                  </div>
                                  <span className="text-[10px] text-slate-500 shrink-0">{ship.flag}</span>
                                </div>

                                <div className="text-[10px] text-slate-500 dark:text-gray-400 line-clamp-1">
                                  {ship.locationName || ship.destination}
                                </div>

                                <div className="flex items-center justify-between text-[10px] border-t border-slate-100 dark:border-white/5 pt-2 font-mono">
                                  <span className="text-slate-400">
                                    {ship.speed}
                                  </span>
                                  <div className="flex items-center gap-2">
                                    <span className="font-bold text-blue-600 dark:text-blue-400">
                                      {ship.paxCapacity} pax
                                    </span>
                                    {ship.crewCount > 0 && (
                                      <span className="text-slate-400">
                                        ({ship.crewCount} trip.)
                                      </span>
                                    )}
                                  </div>
                                </div>

                                {isSelected && (
                                  <div className="flex items-center justify-between text-[9px] font-black text-blue-600 dark:text-blue-400 bg-blue-500/10 px-2 py-1 rounded-lg">
                                    <span className="flex items-center gap-1">
                                      <CheckCircle2 className="w-3 h-3" /> COTEJADO EN RADAR
                                    </span>
                                    <span className="uppercase text-[8px] underline">Ver en Mapa</span>
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </motion.div>
                    ) : (
                      <motion.div
                        key="flights-slide"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        className="flex-1 flex flex-col gap-3"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-black text-slate-400 dark:text-gray-500 uppercase tracking-widest">
                            Tránsito Aéreo ({flights.length})
                          </span>
                          <div className="flex items-center gap-1.5">
                            <button
                              onClick={() => setActiveMainTab('godsview')}
                              className="text-[9px] font-mono font-bold text-cyan-600 dark:text-cyan-400 bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/20 px-2 py-0.5 rounded-full flex items-center gap-1 cursor-pointer transition-all"
                              title="Ver en radar satelital GodsViewAI 3D"
                            >
                              <Globe2 className="w-2.5 h-2.5" />
                              <span>GODSVIEW 3D</span>
                            </button>
                            <button
                              onClick={() => setActiveMainTab('airports')}
                              className="text-[9px] font-bold text-orange-500 hover:underline flex items-center gap-0.5 cursor-pointer"
                            >
                              MAPA ARGENTINA <ExternalLink className="w-2.5 h-2.5" />
                            </button>
                          </div>
                        </div>

                        <div className="flex flex-col gap-2.5 overflow-y-auto scrollbar-hide max-h-[420px] pr-1">
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
                                <div className="flex items-center gap-2">
                                  <span className="font-bold text-orange-500">{flight.paxCapacity} pax</span>
                                  <a
                                    href="https://godsviewai.com/"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-cyan-500 hover:text-cyan-400 font-bold flex items-center gap-0.5 text-[9px]"
                                    title="Seguir en GodsViewAI 3D"
                                  >
                                    <Globe2 className="w-2.5 h-2.5" /> 3D
                                  </a>
                                </div>
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

            {/* COLUMNA DERECHA: RADAR AIS DE VESSELFINDER CON COTEJO GEORREFERENCIADO & AIRNAV RADAR */}
            <div className="xl:col-span-8 flex flex-col gap-8">
              
              {/* RADAR MARÍTIMO COTEJADO (VESSELFINDER & OPENCPN) */}
              <div className="bg-white dark:bg-[#0e0e0e] border border-slate-200 dark:border-[#1f1f1f] rounded-3xl overflow-hidden shadow-2xl flex flex-col">
                <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-[#1f1f1f] bg-white dark:bg-[#0e0e0e]/90 backdrop-blur-sm flex-wrap gap-2">
                  <div className="flex items-center gap-3">
                    <div className="w-7 h-7 rounded-lg bg-blue-600/20 flex items-center justify-center">
                      <Anchor className="w-4 h-4 text-blue-500" />
                    </div>
                    <div>
                      <h2 className="text-[13px] font-black text-slate-800 dark:text-gray-200 tracking-wide uppercase leading-none">
                        Radar AIS de Tráfico Marítimo — VesselFinder & OpenCPN
                      </h2>
                      <span className="text-[10px] text-blue-600 dark:text-blue-400 font-bold block mt-1">
                        {maritimeViewMode === 'cotejo' 
                          ? `Cotejo Activo: ${selectedVessel?.name || 'Todas las naves'} (${selectedVessel?.locationName || 'Bahía Ushuaia'})`
                          : 'Señal Satelital AIS en Vivo (Widget Oficial VesselFinder · OpenCPN)'}
                      </span>
                    </div>
                  </div>

                  {/* Acciones del Radar */}
                  <div className="flex items-center gap-2 flex-wrap">
                    <button
                      onClick={() => setMaritimeViewMode(maritimeViewMode === 'cotejo' ? 'radar' : 'cotejo')}
                      className={`flex items-center gap-1.5 text-[10px] font-black uppercase px-3 py-1.5 rounded-full border transition-all cursor-pointer ${
                        maritimeViewMode === 'cotejo'
                          ? 'bg-cyan-500/15 border-cyan-500/40 text-cyan-600 dark:text-cyan-400'
                          : 'bg-blue-500/15 border-blue-500/40 text-blue-600 dark:text-blue-400'
                      }`}
                    >
                      <Layers className="w-3 h-3" />
                      <span>{maritimeViewMode === 'cotejo' ? 'Ver Radar VesselFinder' : 'Ver Cotejo DPP'}</span>
                    </button>

                    <a
                      href="https://opencpn.org/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 text-[9px] font-mono text-cyan-600 dark:text-cyan-400 hover:text-cyan-300 uppercase font-black border border-cyan-500/20 bg-cyan-500/10 px-2.5 py-1.5 rounded-full transition-all"
                      title="OpenCPN — Chart Plotter & Navigational Software Oficial"
                    >
                      <Compass className="w-3 h-3" />
                      <span>OpenCPN</span>
                      <ExternalLink className="w-2.5 h-2.5" />
                    </a>

                    <a
                      href="https://www.vesselfinder.com/?bbox=-69.5,-55.5,-67.0,-54.2"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 text-[9px] font-mono text-slate-400 hover:text-white uppercase font-black border border-slate-200 dark:border-white/10 px-2.5 py-1.5 rounded-full transition-all"
                      title="Abrir en VesselFinder Oficial"
                    >
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                </div>

                {/* Mapa o Iframe AIS */}
                <div className="w-full h-[320px] md:h-[420px] relative bg-white dark:bg-[#0c0c0c] overflow-hidden">
                  <MaritimeMap 
                    vessels={ships}
                    selectedVesselId={selectedVesselId}
                    onSelectVessel={handleSelectShip}
                    activeViewMode={maritimeViewMode}
                    onToggleViewMode={setMaritimeViewMode}
                    zoomLevel={maritimeZoom}
                    onToggleZoom={setMaritimeZoom}
                  />
                </div>

                {/* Leyenda y Puntos de Atraque de Ushuaia */}
                <div className="flex flex-wrap items-center gap-3 px-5 py-3 border-t border-slate-200 dark:border-[#1f1f1f] bg-slate-50/60 dark:bg-black/20 text-[9px] font-bold uppercase text-slate-500 dark:text-gray-400">
                  <span className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-blue-600" /> Muelle Comercial Ushuaia
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-cyan-600" /> Muelle Turístico Brisighelli
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-500" /> Muelle Orión (YPF)
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-red-500" /> Faro Les Eclaireurs
                  </span>
                  <span className="ml-auto font-mono text-slate-400">
                    &copy; VesselFinder AIS · Cartografía OpenCPN ({ships.length} embarcaciones)
                  </span>
                </div>
              </div>

              {/* RADAR GLOBAL & TELEMETRÍA MULTIDOMINIO (OSIRIS, GODSVIEWAI & AIRNAV) */}
              <div className="bg-white dark:bg-[#0e0e0e] border border-slate-200 dark:border-[#1f1f1f] rounded-3xl overflow-hidden shadow-2xl flex flex-col">
                <div className="flex flex-wrap items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-[#1f1f1f] bg-white dark:bg-[#0e0e0e]/90 backdrop-blur-sm gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-7 h-7 rounded-lg bg-cyan-600/20 flex items-center justify-center">
                      {airRadarMode === 'osiris' ? (
                        <Globe2 className="w-4 h-4 text-cyan-400 animate-spin-slow" />
                      ) : airRadarMode === 'godsview' ? (
                        <Globe2 className="w-4 h-4 text-cyan-400 animate-spin-slow" />
                      ) : (
                        <Plane className="w-4 h-4 text-orange-500" />
                      )}
                    </div>
                    <div>
                      <h2 className="text-[13px] font-black text-slate-800 dark:text-gray-200 tracking-wide uppercase leading-none">
                        {airRadarMode === 'osiris'
                          ? 'Mapa Táctico Global OSINT — OSIRIS'
                          : airRadarMode === 'godsview' 
                          ? 'Radar Satelital 3D Global — GodsViewAI' 
                          : 'Radar de Tráfico Aéreo — AirNav RadarBox'}
                      </h2>
                      <span className="text-[10px] text-cyan-600 dark:text-cyan-400 font-bold block mt-1">
                        {airRadarMode === 'osiris'
                          ? 'Líneas Marítimas · Buques AIS · Satélites · CCTV · Sismos · Incendios · Clima · Nuclear · Incidentes'
                          : airRadarMode === 'godsview'
                          ? 'Vuelos en Vivo · Telemetría 3D · Buques AIS · Focos Térmicos & Clima Satelital'
                          : 'Widget Oficial Centrado en Tierra del Fuego · Espacio Aéreo Ushuaia (SAWH) & Río Grande (SAWE)'}
                      </span>
                    </div>
                  </div>

                  {/* SELECTOR DE RADAR: OSIRIS vs GODSVIEWAI 3D vs AIRNAV RADARBOX */}
                  <div className="flex items-center gap-2 flex-wrap">
                    <div className="flex items-center bg-slate-100 dark:bg-white/5 p-0.5 rounded-full border border-slate-200 dark:border-white/10 text-[10px] font-mono font-bold">
                      <button
                        onClick={() => setAirRadarMode('osiris')}
                        className={`px-3 py-1 rounded-full transition-all cursor-pointer flex items-center gap-1.5 ${
                          airRadarMode === 'osiris'
                            ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-sm'
                            : 'text-slate-500 hover:text-slate-800 dark:text-gray-400 dark:hover:text-white'
                        }`}
                      >
                        <Globe2 className="w-3 h-3 text-cyan-200" />
                        <span>OSIRIS Global</span>
                      </button>
                      <button
                        onClick={() => setAirRadarMode('godsview')}
                        className={`px-3 py-1 rounded-full transition-all cursor-pointer flex items-center gap-1.5 ${
                          airRadarMode === 'godsview'
                            ? 'bg-cyan-600 text-white shadow-sm'
                            : 'text-slate-500 hover:text-slate-800 dark:text-gray-400 dark:hover:text-white'
                        }`}
                      >
                        <Globe2 className="w-3 h-3" />
                        <span>GodsViewAI 3D</span>
                      </button>
                      <button
                        onClick={() => setAirRadarMode('airnav')}
                        className={`px-3 py-1 rounded-full transition-all cursor-pointer flex items-center gap-1.5 ${
                          airRadarMode === 'airnav'
                            ? 'bg-orange-600 text-white shadow-sm'
                            : 'text-slate-500 hover:text-slate-800 dark:text-gray-400 dark:hover:text-white'
                        }`}
                      >
                        <Plane className="w-3 h-3" />
                        <span>AirNav TDF</span>
                      </button>
                    </div>

                    <button
                      onClick={() => setActiveMainTab('osiris')}
                      className="flex items-center gap-1 text-[9px] font-mono text-cyan-600 dark:text-cyan-400 hover:text-cyan-300 uppercase font-black border border-cyan-500/25 bg-cyan-500/10 px-3 py-1.5 rounded-full transition-all cursor-pointer"
                      title="Abrir consola táctica completa de OSIRIS"
                    >
                      <Maximize2 className="w-3 h-3" />
                      <span>Consola OSIRIS Completa</span>
                    </button>

                    <button
                      onClick={() => setActiveMainTab('airports')}
                      className="flex items-center gap-1 text-[9px] font-mono text-orange-500 hover:text-orange-400 uppercase font-black border border-orange-500/20 bg-orange-500/5 px-3 py-1.5 rounded-full transition-all cursor-pointer"
                    >
                      <Compass className="w-3 h-3" />
                      <span>Mapa Argentina</span>
                    </button>

                    <a
                      href={
                        airRadarMode === 'osiris'
                          ? 'https://osirisai.live/?layers=maritime,satellites,cctv,cctv_previews,live_news,earthquakes,fires,weather,radiation,infrastructure,global_incidents,cables,sdk_sea,sdk_naval'
                          : airRadarMode === 'godsview'
                          ? 'https://godsviewai.com/'
                          : 'https://www.airnavradar.com/?lat=-54.4000&lng=-68.1000&z=7'
                      }
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 text-[9px] font-mono text-slate-400 hover:text-white uppercase font-black border border-slate-200 dark:border-white/10 px-3 py-1.5 rounded-full transition-all"
                      title={
                        airRadarMode === 'osiris'
                          ? 'Abrir OSIRIS Web Oficial'
                          : airRadarMode === 'godsview'
                          ? 'Abrir GodsViewAI Oficial'
                          : 'Abrir AirNav RadarBox Oficial'
                      }
                    >
                      <ExternalLink className="w-3 h-3" />
                      <span>
                        {airRadarMode === 'osiris'
                          ? 'OSIRIS'
                          : airRadarMode === 'godsview'
                          ? 'GodsViewAI'
                          : 'AirNav RadarBox'}
                      </span>
                    </a>
                  </div>
                </div>

                {/* VISTA DEL RADAR SELECCIONADO */}
                <div className="w-full relative bg-white dark:bg-[#0c0c0c] overflow-hidden">
                  {airRadarMode === 'osiris' ? (
                    <OsirisMap heightClass="h-[420px] md:h-[540px]" compact={true} showToolbar={true} />
                  ) : airRadarMode === 'godsview' ? (
                    <GodsViewMap heightClass="h-[380px] md:h-[500px]" showControlBar={false} showFeaturePills={true} />
                  ) : (
                    <div className="w-full h-[320px] md:h-[450px] relative bg-white dark:bg-[#0c0c0c] overflow-hidden">
                      <AirMap showToolbar={true} />
                    </div>
                  )}
                </div>

                {/* FOOTER DEL RADAR */}
                {airRadarMode === 'osiris' ? (
                  <div className="flex flex-wrap items-center gap-3 px-5 py-3 border-t border-slate-200 dark:border-[#1f1f1f] bg-slate-50/60 dark:bg-black/20 text-[9px] font-bold uppercase text-slate-500 dark:text-gray-400">
                    <span className="flex items-center gap-1.5 text-cyan-600 dark:text-cyan-400"><Anchor className="w-3 h-3" /> Líneas Marítimas & Rutas</span>
                    <span className="flex items-center gap-1.5"><Ship className="w-3 h-3 text-blue-500" /> Buques AIS</span>
                    <span className="flex items-center gap-1.5"><Radio className="w-3 h-3 text-purple-500" /> Satélites</span>
                    <span className="flex items-center gap-1.5"><Camera className="w-3 h-3 text-emerald-500" /> CCTV Mundial</span>
                    <span className="flex items-center gap-1.5"><Activity className="w-3 h-3 text-amber-500" /> Sismos</span>
                    <span className="flex items-center gap-1.5"><Flame className="w-3 h-3 text-rose-500" /> Incendios</span>
                    <span className="flex items-center gap-1.5"><Zap className="w-3 h-3 text-yellow-500" /> Nuclear</span>
                    <span className="ml-auto font-mono text-cyan-500">&copy; OSIRIS &mdash; Open Source Intelligence</span>
                  </div>
                ) : airRadarMode === 'godsview' ? (
                  <div className="flex flex-wrap items-center gap-3 px-5 py-3 border-t border-slate-200 dark:border-[#1f1f1f] bg-slate-50/60 dark:bg-black/20 text-[9px] font-bold uppercase text-slate-500 dark:text-gray-400">
                    <span className="flex items-center gap-1.5 text-cyan-600 dark:text-cyan-400"><Globe2 className="w-3 h-3" /> Globo Interactivo 3D</span>
                    <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-orange-500" /> Vuelos con Cockpit View</span>
                    <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-blue-500" /> Buques AIS</span>
                    <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-red-500" /> Focos Térmicos</span>
                    <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-purple-500" /> Sensores NVG/Térmico</span>
                    <span className="ml-auto font-mono text-cyan-500">&copy; GodsViewAI &mdash; Satellite Intelligence</span>
                  </div>
                ) : (
                  <div className="flex flex-wrap items-center gap-3 px-5 py-3 border-t border-slate-200 dark:border-[#1f1f1f] bg-slate-50/60 dark:bg-black/20 text-[9px] font-bold uppercase text-slate-500 dark:text-gray-400">
                    <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-orange-600" /> Ushuaia (USH / SAWH)</span>
                    <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-purple-600" /> Río Grande (RGA / SAWE)</span>
                    <span className="ml-auto font-mono text-slate-400">&copy; AirNav RadarBox &mdash; Widget oficial en vivo (Tierra del Fuego)</span>
                  </div>
                )}
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

          {/* Tracker complementario para cotejo directo: AirNav RadarBox o GodsViewAI 3D */}
          <div className="bg-white dark:bg-[#0e0e0e] border border-slate-200 dark:border-[#1f1f1f] rounded-3xl overflow-hidden shadow-2xl flex flex-col">
            <div className="flex flex-wrap items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-[#1f1f1f] gap-3">
              <div className="flex items-center gap-3">
                {airportTrackerMode === 'godsview' ? (
                  <Globe2 className="w-5 h-5 text-cyan-400 animate-spin-slow" />
                ) : (
                  <Plane className="w-5 h-5 text-orange-500" />
                )}
                <div>
                  <h3 className="text-sm font-black uppercase text-slate-900 dark:text-white leading-none">
                    {airportTrackerMode === 'godsview'
                      ? 'Tracker Satelital 3D Global — GodsViewAI'
                      : 'Tracker en Tiempo Real para Cotejar — AirNav RadarBox'}
                  </h3>
                  <span className="text-[10px] text-slate-500 dark:text-gray-400 mt-1 block">
                    {airportTrackerMode === 'godsview'
                      ? 'Telemetría satelital 3D en vivo: aeronaves globales, vista de cabina, buques y clima'
                      : 'Widget oficial de AirNav RadarBox posicionado y centrado en Tierra del Fuego'}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                <div className="flex items-center bg-slate-100 dark:bg-white/5 p-0.5 rounded-full border border-slate-200 dark:border-white/10 text-[10px] font-mono font-bold">
                  <button
                    onClick={() => setAirportTrackerMode('airnav')}
                    className={`px-3 py-1 rounded-full transition-all cursor-pointer flex items-center gap-1.5 ${
                      airportTrackerMode === 'airnav'
                        ? 'bg-orange-600 text-white shadow-sm'
                        : 'text-slate-500 hover:text-slate-800 dark:text-gray-400 dark:hover:text-white'
                    }`}
                  >
                    <Plane className="w-3 h-3" />
                    <span>AirNav RadarBox</span>
                  </button>
                  <button
                    onClick={() => setAirportTrackerMode('godsview')}
                    className={`px-3 py-1 rounded-full transition-all cursor-pointer flex items-center gap-1.5 ${
                      airportTrackerMode === 'godsview'
                        ? 'bg-cyan-600 text-white shadow-sm'
                        : 'text-slate-500 hover:text-slate-800 dark:text-gray-400 dark:hover:text-white'
                    }`}
                  >
                    <Globe2 className="w-3 h-3" />
                    <span>GodsViewAI 3D</span>
                  </button>
                </div>

                <a
                  href={airportTrackerMode === 'godsview' ? 'https://godsviewai.com/' : 'https://www.airnavradar.com/?lat=-54.4000&lng=-68.1000&z=7'}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 text-[10px] font-mono text-cyan-600 dark:text-cyan-400 hover:text-cyan-500 uppercase font-black border border-cyan-500/20 bg-cyan-500/5 px-3 py-1.5 rounded-full transition-all"
                >
                  <span>{airportTrackerMode === 'godsview' ? 'GodsViewAI' : 'AirNav RadarBox'}</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>

            <div className="w-full relative bg-white dark:bg-[#0c0c0c] overflow-hidden">
              {airportTrackerMode === 'godsview' ? (
                <GodsViewMap heightClass="h-[400px] md:h-[550px]" showControlBar={false} showFeaturePills={true} />
              ) : (
                <div className="w-full h-[320px] md:h-[420px] relative bg-white dark:bg-[#0c0c0c]">
                  <AirMap />
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* VISTA 3: RADAR GLOBAL 3D GODSVIEWAI (SATELLITE INTELLIGENCE) */}
      {activeMainTab === 'godsview' && (
        <div className="flex flex-col gap-6">
          <GodsViewMap heightClass="h-[550px] md:h-[720px]" />

          {/* Tarjetas informativas de datos provistos por GodsViewAI */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <div className="bg-white dark:bg-[#11141c] border border-slate-200 dark:border-cyan-500/20 rounded-2xl p-5 shadow-lg flex flex-col gap-3">
              <div className="flex items-center gap-2.5 text-cyan-500 dark:text-cyan-400">
                <div className="w-8 h-8 rounded-xl bg-cyan-500/10 flex items-center justify-center">
                  <Plane className="w-4 h-4 text-cyan-500" />
                </div>
                <h3 className="text-xs font-black uppercase tracking-wider font-display text-slate-900 dark:text-white">
                  Vuelos & Cockpit View 3D
                </h3>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                Rastreo global de aeronaves comerciales y ejecutivas en tiempo real. Permite seleccionar cualquier avión para seguirlo en modo cabina (Cockpit view), visualizar altitud, vector de velocidad y telemetría de aproximación.
              </p>
              <div className="mt-auto pt-2 border-t border-slate-100 dark:border-white/5 flex items-center justify-between text-[11px] font-mono text-cyan-600 dark:text-cyan-400">
                <span>Telemetría en Vivo</span>
                <span>Altitude & Groundspeed</span>
              </div>
            </div>

            <div className="bg-white dark:bg-[#11141c] border border-slate-200 dark:border-blue-500/20 rounded-2xl p-5 shadow-lg flex flex-col gap-3">
              <div className="flex items-center gap-2.5 text-blue-500 dark:text-blue-400">
                <div className="w-8 h-8 rounded-xl bg-blue-500/10 flex items-center justify-center">
                  <Ship className="w-4 h-4 text-blue-500" />
                </div>
                <h3 className="text-xs font-black uppercase tracking-wider font-display text-slate-900 dark:text-white">
                  Buques & Tráfico Marítimo AIS
                </h3>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                Integración de señales satelitales AIS de buques en todos los océanos, incluyendo el Paso de Drake, Canal Beagle y Atlántico Sur. Cruza de forma fluida con las rutas aéreas comerciales.
              </p>
              <div className="mt-auto pt-2 border-t border-slate-100 dark:border-white/5 flex items-center justify-between text-[11px] font-mono text-blue-600 dark:text-blue-400">
                <span>Rastreo Oceánico</span>
                <span>Canal Beagle & Atlántico</span>
              </div>
            </div>

            <div className="bg-white dark:bg-[#11141c] border border-slate-200 dark:border-red-500/20 rounded-2xl p-5 shadow-lg flex flex-col gap-3">
              <div className="flex items-center gap-2.5 text-red-500 dark:text-red-400">
                <div className="w-8 h-8 rounded-xl bg-red-500/10 flex items-center justify-center">
                  <Flame className="w-4 h-4 text-red-500" />
                </div>
                <h3 className="text-xs font-black uppercase tracking-wider font-display text-slate-900 dark:text-white">
                  Focos Térmicos, Sismos & Clima
                </h3>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                Capas de inteligencia satelital con detección de puntos de calor y fuego forestal, sismos mundiales, masas nubosas y modos de visión especializados: Infrarrojo Térmico, Visor Nocturno (NVG) y CRT.
              </p>
              <div className="mt-auto pt-2 border-t border-slate-100 dark:border-white/5 flex items-center justify-between text-[11px] font-mono text-red-600 dark:text-red-400">
                <span>Anomalías Térmicas</span>
                <span>Modos Térmico / NVG</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* VISTA 4: OSIRIS GLOBAL TACTICAL INTEL (OSINT MULTIDOMINIO) */}
      {activeMainTab === 'osiris' && (
        <div className="flex flex-col gap-6">
          <OsirisMap heightClass="h-[600px] md:h-[780px]" showToolbar={true} />

          {/* Tarjetas tácticas de los 4 grandes dominios de OSIRIS */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white dark:bg-[#11141c] border border-slate-200 dark:border-cyan-500/20 rounded-2xl p-5 shadow-lg flex flex-col gap-3">
              <div className="flex items-center gap-2.5 text-cyan-500 dark:text-cyan-400">
                <div className="w-8 h-8 rounded-xl bg-cyan-500/10 flex items-center justify-center">
                  <Ship className="w-4 h-4 text-cyan-400" />
                </div>
                <h3 className="text-xs font-black uppercase tracking-wider font-display text-slate-900 dark:text-white">
                  Líneas Marítimas & Flota
                </h3>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                Rutas y corredores de navegación oceánica, cables submarinos de fibra óptica, posicionamiento AIS de cargueros y despliegues de la flota naval global.
              </p>
              <div className="mt-auto pt-2 border-t border-slate-100 dark:border-white/5 flex items-center justify-between text-[11px] font-mono text-cyan-600 dark:text-cyan-400">
                <span>Shipping Lanes</span>
                <span>Cables Submarinos</span>
              </div>
            </div>

            <div className="bg-white dark:bg-[#11141c] border border-slate-200 dark:border-purple-500/20 rounded-2xl p-5 shadow-lg flex flex-col gap-3">
              <div className="flex items-center gap-2.5 text-purple-500 dark:text-purple-400">
                <div className="w-8 h-8 rounded-xl bg-purple-500/10 flex items-center justify-center">
                  <Radio className="w-4 h-4 text-purple-400" />
                </div>
                <h3 className="text-xs font-black uppercase tracking-wider font-display text-slate-900 dark:text-white">
                  Satélites & Espacio
                </h3>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                Seguimiento orbital de constelaciones LEO (Starlink, OneWeb), satélites de reconocimiento militar, GPS/GLONASS y ciclo solar día/noche en tiempo real.
              </p>
              <div className="mt-auto pt-2 border-t border-slate-100 dark:border-white/5 flex items-center justify-between text-[11px] font-mono text-purple-600 dark:text-purple-400">
                <span>+18.700 Satélites</span>
                <span>Órbitas Activas</span>
              </div>
            </div>

            <div className="bg-white dark:bg-[#11141c] border border-slate-200 dark:border-emerald-500/20 rounded-2xl p-5 shadow-lg flex flex-col gap-3">
              <div className="flex items-center gap-2.5 text-emerald-500 dark:text-emerald-400">
                <div className="w-8 h-8 rounded-xl bg-emerald-500/10 flex items-center justify-center">
                  <Camera className="w-4 h-4 text-emerald-400" />
                </div>
                <h3 className="text-xs font-black uppercase tracking-wider font-display text-slate-900 dark:text-white">
                  CCTV & Vigilancia Urbana
                </h3>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                Red mundial de más de 39.000 cámaras públicas de video vigilancia, cámaras de tráfico vial, puertos comerciales y previsualizaciones en vivo.
              </p>
              <div className="mt-auto pt-2 border-t border-slate-100 dark:border-white/5 flex items-center justify-between text-[11px] font-mono text-emerald-600 dark:text-emerald-400">
                <span>+39.500 Cámaras</span>
                <span>Live Previews</span>
              </div>
            </div>

            <div className="bg-white dark:bg-[#11141c] border border-slate-200 dark:border-amber-500/20 rounded-2xl p-5 shadow-lg flex flex-col gap-3">
              <div className="flex items-center gap-2.5 text-amber-500 dark:text-amber-400">
                <div className="w-8 h-8 rounded-xl bg-amber-500/10 flex items-center justify-center">
                  <AlertTriangle className="w-4 h-4 text-amber-400" />
                </div>
                <h3 className="text-xs font-black uppercase tracking-wider font-display text-slate-900 dark:text-white">
                  Sismos, Incendios & Nuclear
                </h3>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                Terremotos USGS/EMSC en vivo, focos de fuego satelital NASA FIRMS, clima severo y reactores nucleares mundiales con sensores radiológicos.
              </p>
              <div className="mt-auto pt-2 border-t border-slate-100 dark:border-white/5 flex items-center justify-between text-[11px] font-mono text-amber-600 dark:text-amber-400">
                <span>NASA FIRMS / USGS</span>
                <span>Reactores Activos</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* VISTA 5: OCUPACIÓN HOTELERA COMPLETA */}
      {activeMainTab === 'hotel' && (
        <div className="flex flex-col gap-6">
          <HotelOccupancyCard initialData={tourismData} onRefresh={() => loadAllData(true)} />
        </div>
      )}

      {/* VISTA 6: TEMPORADA DE CRUCEROS COMPLETA */}
      {activeMainTab === 'cruises' && (
        <div className="flex flex-col gap-6">
          <CruiseSeasonCard initialData={cruiseData} />
        </div>
      )}
    </div>
  );
}
