'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, ZoomControl } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { 
  Plane, 
  MapPin, 
  ArrowDownLeft, 
  ArrowUpRight, 
  ExternalLink, 
  Filter, 
  Compass, 
  Sparkles,
  Search,
  CheckCircle2,
  Clock,
  Globe2
} from 'lucide-react';

// Custom icons for Leaflet
const createAirportIcon = (code: string, isTDF: boolean, isSelected: boolean) => {
  const bg = isTDF 
    ? 'bg-gradient-to-tr from-amber-500 to-rose-600 border-rose-300' 
    : isSelected 
    ? 'bg-blue-600 border-white' 
    : 'bg-slate-800 border-slate-400';
  
  const ring = isTDF ? 'ring-4 ring-rose-500/30' : isSelected ? 'ring-4 ring-blue-500/30' : '';

  return L.divIcon({
    className: '',
    html: `
      <div style="display:flex; flex-direction:column; align-items:center; transform: translate(-50%, -50%); cursor:pointer;">
        <div class="px-2 py-0.5 rounded-md text-[10px] font-black tracking-widest text-white shadow-xl ${bg} ${ring} flex items-center gap-1 border">
          <span>${code}</span>
          ${isTDF ? '<span style="width:6px; height:6px; border-radius:50%; background:#fff; display:inline-block; animation:ping 1.5s cubic-bezier(0,0,0.2,1) infinite;"></span>' : ''}
        </div>
      </div>
    `,
    iconSize: [40, 24],
    iconAnchor: [20, 12],
    popupAnchor: [0, -16]
  });
};

interface AirportItem {
  code: string;
  icao: string;
  name: string;
  city: string;
  province: string;
  lat: number;
  lng: number;
  isTDF: boolean;
}

interface FlightItem {
  id: string;
  flight: string;
  airline: string;
  airlineUrl?: string;
  direction: 'arrival' | 'departure';
  cityTDF: string;
  originCode: string;
  originCity: string;
  destCode: string;
  destCity: string;
  route: string;
  type: string;
  paxCapacity: number;
  time: string;
  status: string;
  terminal?: string;
  image?: string;
}

interface ArgentinaAirportsMapProps {
  airports: AirportItem[];
  flights: FlightItem[];
  onSelectFlight?: (flight: FlightItem) => void;
}

export default function ArgentinaAirportsMap({
  airports = [],
  flights = [],
  onSelectFlight
}: ArgentinaAirportsMapProps) {
  const [isMounted, setIsMounted] = useState(false);
  const [selectedCity, setSelectedCity] = useState<string>('all');
  const [selectedDirection, setSelectedDirection] = useState<'all' | 'arrival' | 'departure'>('all');
  const [activeFlightId, setActiveFlightId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Aeropuerto Map dictionary
  const airportDict = useMemo(() => {
    const map = new Map<string, AirportItem>();
    airports.forEach(a => map.set(a.code, a));
    return map;
  }, [airports]);

  // Lista única de ciudades para el filtro
  const citiesList = useMemo(() => {
    const set = new Set<string>();
    flights.forEach(f => {
      set.add(f.cityTDF);
      set.add(f.originCity.split('(')[0].trim());
      set.add(f.destCity.split('(')[0].trim());
    });
    return Array.from(set).filter(Boolean);
  }, [flights]);

  // Vuelos filtrados
  const filteredFlights = useMemo(() => {
    return flights.filter(f => {
      // Filtro dirección
      if (selectedDirection !== 'all' && f.direction !== selectedDirection) {
        return false;
      }

      // Filtro ciudad
      if (selectedCity !== 'all') {
        const matchesCity = 
          f.cityTDF.toLowerCase() === selectedCity.toLowerCase() ||
          f.originCity.toLowerCase().includes(selectedCity.toLowerCase()) ||
          f.destCity.toLowerCase().includes(selectedCity.toLowerCase());
        if (!matchesCity) return false;
      }

      // Filtro búsqueda
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchesQuery = 
          f.flight.toLowerCase().includes(q) ||
          f.airline.toLowerCase().includes(q) ||
          f.route.toLowerCase().includes(q) ||
          f.originCity.toLowerCase().includes(q) ||
          f.destCity.toLowerCase().includes(q);
        if (!matchesQuery) return false;
      }

      return true;
    });
  }, [flights, selectedCity, selectedDirection, searchQuery]);

  // Líneas de vuelo a dibujar en el mapa
  const flightPolylines = useMemo(() => {
    return filteredFlights.map(f => {
      const orig = airportDict.get(f.originCode);
      const dest = airportDict.get(f.destCode);
      if (!orig || !dest) return null;

      const isSelected = activeFlightId === f.id;
      const isArrival = f.direction === 'arrival';

      return {
        flight: f,
        positions: [
          [orig.lat, orig.lng] as [number, number],
          [dest.lat, dest.lng] as [number, number]
        ],
        color: isSelected ? '#f59e0b' : isArrival ? '#3b82f6' : '#ec4899',
        dashArray: isSelected ? undefined : '6, 6',
        weight: isSelected ? 4 : 2,
        opacity: isSelected ? 1 : 0.65
      };
    }).filter(Boolean);
  }, [filteredFlights, airportDict, activeFlightId]);

  if (!isMounted) {
    return (
      <div className="w-full h-[520px] rounded-3xl bg-slate-900 flex flex-col items-center justify-center text-slate-400 gap-3 border border-white/10">
        <Plane className="w-8 h-8 text-rose-500 animate-pulse" />
        <span className="text-xs font-mono font-bold tracking-wider">Cargando Red Aerocomercial de Argentina...</span>
      </div>
    );
  }

  // Centro de Argentina para encuadre
  const mapCenter: [number, number] = [-42.5, -66.0];

  return (
    <div className="w-full flex flex-col gap-4 bg-white dark:bg-[#0c0d10] border border-slate-200 dark:border-white/10 rounded-3xl p-4 md:p-6 shadow-xl">
      {/* HEADER DE LA SECCIÓN DE MAPA */}
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-white/5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-orange-500 via-rose-500 to-purple-600 p-[2px] shadow-lg shadow-orange-500/20 shrink-0">
            <div className="w-full h-full bg-white dark:bg-[#121417] rounded-[14px] flex items-center justify-center">
              <Compass className="w-5 h-5 text-orange-500" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-base md:text-lg font-black text-slate-900 dark:text-white tracking-tight uppercase">
                Red de Aeropuertos de Argentina & Conexión Fueguina
              </h3>
              <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-orange-500/10 text-orange-600 dark:text-orange-400 border border-orange-500/20">
                Cotejo en Vivo
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-gray-400 mt-0.5">
              Rutas y frecuencias aerocomerciales que conectan Ushuaia y Río Grande con los principales hubs del país.
            </p>
          </div>
        </div>

        {/* CONTROLES DE DIRECCIÓN Y RADAR SATELITAL 3D */}
        <div className="flex items-center gap-2 flex-wrap self-stretch sm:self-auto">
          <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-white/5 p-1 rounded-2xl border border-slate-200 dark:border-white/10 flex-1 sm:flex-none">
            <button
              onClick={() => setSelectedDirection('all')}
              className={`flex-1 sm:flex-none px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                selectedDirection === 'all'
                  ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-sm'
                  : 'text-slate-600 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Todos ({flights.length})
            </button>
            <button
              onClick={() => setSelectedDirection('arrival')}
              className={`flex-1 sm:flex-none px-3 py-1.5 rounded-xl text-xs font-bold flex items-center justify-center gap-1 transition-all ${
                selectedDirection === 'arrival'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-600 dark:text-gray-400 hover:text-blue-500'
              }`}
            >
              <ArrowDownLeft className="w-3 h-3" />
              <span>Arribos</span>
            </button>
            <button
              onClick={() => setSelectedDirection('departure')}
              className={`flex-1 sm:flex-none px-3 py-1.5 rounded-xl text-xs font-bold flex items-center justify-center gap-1 transition-all ${
                selectedDirection === 'departure'
                  ? 'bg-rose-600 text-white shadow-sm'
                  : 'text-slate-600 dark:text-gray-400 hover:text-rose-500'
              }`}
            >
              <ArrowUpRight className="w-3 h-3" />
              <span>Partidas</span>
            </button>
          </div>

          <a
            href="https://godsviewai.com/"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-2xl text-xs font-mono font-bold bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-600 dark:text-cyan-400 border border-cyan-500/30 transition-all shadow-sm"
            title="Abrir radar satelital 3D global en GodsViewAI"
          >
            <Globe2 className="w-3.5 h-3.5 text-cyan-500 animate-spin-slow" />
            <span className="hidden sm:inline">Radar</span>
            <span>GodsViewAI 3D</span>
            <ExternalLink className="w-2.5 h-2.5" />
          </a>
        </div>
      </div>

      {/* BARRA DE FILTROS POR CIUDAD Y BÚSQUEDA */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        {/* Chips de ciudad */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-hide">
          <button
            onClick={() => setSelectedCity('all')}
            className={`px-3 py-1 rounded-xl text-[11px] font-bold whitespace-nowrap transition-all border ${
              selectedCity === 'all'
                ? 'bg-orange-500/10 border-orange-500/40 text-orange-600 dark:text-orange-400 shadow-sm'
                : 'bg-white dark:bg-white/5 border-slate-200 dark:border-white/5 text-slate-600 dark:text-gray-400'
            }`}
          >
            Todas las Ciudades
          </button>
          {citiesList.map(city => {
            const isActive = selectedCity.toLowerCase() === city.toLowerCase();
            return (
              <button
                key={city}
                onClick={() => setSelectedCity(city)}
                className={`px-3 py-1 rounded-xl text-[11px] font-bold whitespace-nowrap transition-all border ${
                  isActive
                    ? 'bg-orange-500/10 border-orange-500/40 text-orange-600 dark:text-orange-400 shadow-sm'
                    : 'bg-white dark:bg-white/5 border-slate-200 dark:border-white/5 text-slate-600 dark:text-gray-400 hover:border-slate-300 dark:hover:border-white/20'
                }`}
              >
                {city}
              </button>
            );
          })}
        </div>

        {/* Input buscador */}
        <div className="relative w-full md:w-64 shrink-0">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Filtrar n° de vuelo, ruta, línea..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 rounded-xl text-xs bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-800 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-500/40"
          />
        </div>
      </div>

      {/* CONTENEDOR SPLIT: MAPA LEAFLET A LA IZQUIERDA + LISTADO DE VUELOS A LA DERECHA */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch min-h-[480px]">
        {/* MAPA LEAFLET */}
        <div className="lg:col-span-8 h-[380px] lg:h-[500px] rounded-2xl overflow-hidden relative border border-slate-200 dark:border-white/10 shadow-inner">
          <MapContainer
            center={mapCenter}
            zoom={4}
            zoomControl={false}
            scrollWheelZoom={false}
            className="w-full h-full"
            style={{ background: '#090a0d' }}
          >
            <ZoomControl position="bottomright" />
            <TileLayer
              attribution='&copy; <a href="https://carto.com/">CARTO</a>'
              url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
            />

            {/* Dibujar líneas de rutas */}
            {flightPolylines.map((poly, idx) => {
              if (!poly) return null;
              return (
                <Polyline
                  key={`${poly.flight.id}-${idx}`}
                  positions={poly.positions}
                  pathOptions={{
                    color: poly.color,
                    weight: poly.weight,
                    opacity: poly.opacity,
                    dashArray: poly.dashArray
                  }}
                  eventHandlers={{
                    click: () => setActiveFlightId(poly.flight.id)
                  }}
                />
              );
            })}

            {/* Marcadores de aeropuertos */}
            {airports.map(apt => {
              const isSelected = activeFlightId 
                ? flights.find(f => f.id === activeFlightId)?.originCode === apt.code || flights.find(f => f.id === activeFlightId)?.destCode === apt.code
                : false;

              return (
                <Marker
                  key={apt.code}
                  position={[apt.lat, apt.lng]}
                  icon={createAirportIcon(apt.code, apt.isTDF, isSelected)}
                >
                  <Popup className="custom-airport-popup">
                    <div className="p-1 font-sans text-slate-900">
                      <div className="flex items-center gap-1.5 font-black text-xs uppercase">
                        <span>{apt.name}</span>
                        <span className="px-1.5 py-0.5 rounded bg-slate-900 text-white text-[9px] font-mono">
                          {apt.code}
                        </span>
                      </div>
                      <p className="text-[10px] text-slate-600 mt-1">
                        📍 {apt.city}, {apt.province} (ICAO: {apt.icao})
                      </p>
                      {apt.isTDF && (
                        <span className="inline-block mt-1 text-[9px] font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded">
                          ★ Hub Tierra del Fuego
                        </span>
                      )}
                    </div>
                  </Popup>
                </Marker>
              );
            })}
          </MapContainer>

          {/* LEYENDA FLOTANTE EN EL MAPA */}
          <div className="absolute top-3 left-3 z-[1000] bg-slate-900/90 backdrop-blur-md border border-white/10 rounded-xl p-2.5 shadow-lg flex flex-col gap-1.5 text-[10px] text-slate-200">
            <span className="font-black uppercase tracking-wider text-[9px] text-slate-400">Referencias de Ruta</span>
            <div className="flex items-center gap-2">
              <span className="w-3 h-0.5 bg-blue-500 rounded-full inline-block" />
              <span>Arribos a Tierra del Fuego</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-0.5 bg-rose-500 rounded-full inline-block" />
              <span>Partidas desde Tierra del Fuego</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-gradient-to-r from-amber-500 to-rose-500 inline-block" />
              <span>Aeropuertos TDF (USH / RGA)</span>
            </div>
          </div>
        </div>

        {/* LISTADO DE VUELOS INTERACTIVO CON DETALLES Y TRACKER */}
        <div className="lg:col-span-4 flex flex-col gap-3 max-h-[500px] overflow-y-auto scrollbar-hide pr-1">
          <div className="flex items-center justify-between pb-1 border-b border-slate-100 dark:border-white/5">
            <span className="text-[11px] font-black uppercase tracking-widest text-slate-400 dark:text-gray-500">
              Vuelos en Tránsito ({filteredFlights.length})
            </span>
            <span className="text-[10px] font-mono text-slate-500">
              Base: Aeropuertos del Mundo
            </span>
          </div>

          {filteredFlights.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center p-6 text-center text-slate-400 border border-dashed border-slate-200 dark:border-white/5 rounded-2xl">
              <Plane className="w-8 h-8 text-slate-300 dark:text-gray-600 mb-2" />
              <p className="text-xs">No hay vuelos que coincidan con los filtros seleccionados.</p>
            </div>
          ) : (
            filteredFlights.map(f => {
              const isSelected = activeFlightId === f.id;
              const isArrival = f.direction === 'arrival';

              return (
                <div
                  key={f.id}
                  onClick={() => {
                    setActiveFlightId(isSelected ? null : f.id);
                    if (onSelectFlight) onSelectFlight(f);
                  }}
                  className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex flex-col gap-2 relative ${
                    isSelected
                      ? 'bg-amber-500/10 border-amber-500/50 shadow-md ring-1 ring-amber-500/20'
                      : 'bg-slate-50/70 dark:bg-white/[0.02] border-slate-200 dark:border-white/5 hover:border-slate-300 dark:hover:border-white/20'
                  }`}
                >
                  {/* Fila superior: Vuelo y Estado */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-black font-display text-slate-900 dark:text-white">
                        {f.flight}
                      </span>
                      <span className={`text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                        f.status === 'En Vuelo'
                          ? 'bg-blue-500/15 text-blue-600 dark:text-blue-400 border border-blue-500/20 animate-pulse'
                          : f.status === 'En Pista' || f.status === 'Aterrizado'
                          ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
                          : 'bg-slate-200 dark:bg-white/10 text-slate-600 dark:text-gray-300'
                      }`}>
                        {f.status}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5 text-xs font-mono font-bold text-slate-700 dark:text-gray-300">
                      <Clock className="w-3 h-3 text-slate-400" />
                      <span>{f.time}</span>
                    </div>
                  </div>

                  {/* Ruta y Aerolínea */}
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-1.5">
                      <span className="font-bold text-slate-800 dark:text-gray-200">{f.route}</span>
                      <span className="text-[10px] text-slate-400">· {f.type}</span>
                    </div>
                    <span className="text-[10px] text-slate-500 dark:text-gray-400 truncate max-w-[120px]">
                      {f.airline}
                    </span>
                  </div>

                  {/* Acciones y Cotejo en Radar */}
                  <div className="pt-2 border-t border-slate-100 dark:border-white/5 flex items-center justify-between text-[10px]">
                    <span className="text-slate-400 font-mono">
                      Cap: {f.paxCapacity} pax
                    </span>

                    <div className="flex items-center gap-2">
                      <a
                        href="https://godsviewai.com/"
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="flex items-center gap-1 text-cyan-500 hover:text-cyan-600 dark:text-cyan-400 dark:hover:text-cyan-300 font-bold hover:underline"
                        title="Ver en GodsViewAI 3D en Vivo"
                      >
                        <Globe2 className="w-2.5 h-2.5" />
                        <span>GodsViewAI 3D</span>
                        <ExternalLink className="w-2.5 h-2.5" />
                      </a>
                      <span className="text-slate-300 dark:text-gray-600">·</span>
                      <a
                        href={`https://es.airnavradar.com/?search=${f.flight.replace(/\s+/g, '')}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="flex items-center gap-1 text-orange-500 hover:text-orange-600 font-bold hover:underline"
                        title="Cotejar en AirNav Radar en Vivo"
                      >
                        <span>AirNav</span>
                        <ExternalLink className="w-2.5 h-2.5" />
                      </a>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
