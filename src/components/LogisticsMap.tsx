'use client';

import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, ZoomControl, Circle, Tooltip, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { Anchor, Compass, ExternalLink, Ship, Users, Eye, Layers, Plane, MapPin, RotateCw, Maximize2 } from 'lucide-react';

// Fix default icon para Next.js
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

// Componente para centrar el mapa dinámicamente cuando se selecciona una embarcación
function MapPanController({ selectedVessel }: { selectedVessel: any }) {
  const map = useMap();
  useEffect(() => {
    if (selectedVessel && selectedVessel.lat && selectedVessel.lng) {
      map.flyTo([selectedVessel.lat, selectedVessel.lng], 13, {
        duration: 1.2,
      });
    }
  }, [selectedVessel, map]);
  return null;
}

// Ícono personalizado para buques en el cotejador AIS
const createVesselIcon = (category: string, isSelected: boolean) => {
  let bg = 'bg-blue-600';
  let emoji = '🚢';
  let ring = isSelected ? 'ring-4 ring-yellow-400 scale-125' : '';

  if (category === 'catamaran') {
    bg = 'bg-cyan-600';
    emoji = '🛥️';
  } else if (category === 'servicio') {
    bg = 'bg-slate-700';
    emoji = '⚓';
  }

  return L.divIcon({
    className: '',
    html: `
      <div style="display:flex; flex-direction:column; align-items:center; transform: translate(-50%, -50%); cursor:pointer;">
        <div class="w-8 h-8 rounded-full ${bg} ${ring} text-white flex items-center justify-center text-sm shadow-xl border-2 border-white transition-all duration-300">
          <span>${emoji}</span>
        </div>
      </div>
    `,
    iconSize: [32, 32],
    iconAnchor: [16, 16],
    popupAnchor: [0, -18],
  });
};

// Ícono para puntos de interés náutico
const createLandmarkIcon = (emoji: string, color: string) =>
  L.divIcon({
    className: '',
    html: `
      <div style="display:flex; flex-direction:column; align-items:center; transform: translate(-50%, -50%);">
        <div style="background:${color}; border-radius:50%; width:24px; height:24px; display:flex; align-items:center; justify-content:center; font-size:12px; border:2px solid white; box-shadow:0 2px 6px rgba(0,0,0,0.35);">
          ${emoji}
        </div>
      </div>
    `,
    iconSize: [24, 24],
    iconAnchor: [12, 12],
    popupAnchor: [0, -14],
  });

/* ─── PUNTOS DE INTERÉS NÁUTICO EN CANAL BEAGLE Y USHUAIA ───────── */
const NAUTICAL_LANDMARKS = [
  {
    id: 'muelle-comercial',
    name: 'Muelle Comercial Ushuaia (DPP)',
    desc: 'Atraque principal de cruceros antárticos e internacionales.',
    lat: -54.8094,
    lng: -68.3027,
    emoji: '🚢',
    color: '#2563eb',
  },
  {
    id: 'muelle-brisighelli',
    name: 'Muelle Turístico Eduardo Brisighelli',
    desc: 'Terminal de catamaranes y excursiones náuticas por el Canal Beagle.',
    lat: -54.8080,
    lng: -68.3005,
    emoji: '🛥️',
    color: '#06b6d4',
  },
  {
    id: 'muelle-orion',
    name: 'Muelle Orión (YPF)',
    desc: 'Descarga y abastecimiento de hidrocarburos.',
    lat: -54.8140,
    lng: -68.2910,
    emoji: '⛽',
    color: '#d97706',
  },
  {
    id: 'base-naval',
    name: 'Base Naval Ushuaia',
    desc: 'Estación Naval Ushuaia y patrullas de rescate antártico.',
    lat: -54.8115,
    lng: -68.3120,
    emoji: '🛡️',
    color: '#475569',
  },
  {
    id: 'faro-les-eclaireurs',
    name: 'Faro Les Eclaireurs',
    desc: 'Emblemático faro del Canal Beagle (1920). Destino turístico náutico.',
    lat: -54.8715,
    lng: -68.1550,
    emoji: '🗼',
    color: '#ef4444',
  },
  {
    id: 'islas-bridges',
    name: 'Islas Bridges',
    desc: 'Reserva natural y colonias de aves marinas en el Canal Beagle.',
    lat: -54.8550,
    lng: -68.2200,
    emoji: '🦭',
    color: '#10b981',
  },
];

export interface MaritimeMapProps {
  vessels?: any[];
  selectedVesselId?: string | null;
  onSelectVessel?: (vessel: any) => void;
  activeViewMode?: 'radar' | 'cotejo';
  onToggleViewMode?: (mode: 'radar' | 'cotejo') => void;
  zoomLevel?: 'ushuaia' | 'regional';
  onToggleZoom?: (zoom: 'ushuaia' | 'regional') => void;
}

/* ─── COMPONENTE MARÍTIMO CON COTEJO AIS ───────────────── */
export const MaritimeMap = ({
  vessels = [],
  selectedVesselId = null,
  onSelectVessel,
  activeViewMode = 'radar',
  onToggleViewMode,
  zoomLevel = 'ushuaia',
  onToggleZoom,
}: MaritimeMapProps) => {
  const [isMounted, setIsMounted] = useState(false);
  const [internalMode, setInternalMode] = useState<'radar' | 'cotejo'>('radar');
  const [internalZoom, setInternalZoom] = useState<'ushuaia' | 'regional'>('ushuaia');

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const currentMode = onToggleViewMode ? activeViewMode : internalMode;
  const setMode = onToggleViewMode || setInternalMode;

  const currentZoom = onToggleZoom ? zoomLevel : internalZoom;
  const setZoom = onToggleZoom || setInternalZoom;

  const selectedVessel = vessels.find((v) => v.id === selectedVesselId) || null;

  // URLs de MarineTraffic para Bahía Ushuaia vs Regional
  const marineTrafficUrl =
    currentZoom === 'ushuaia'
      ? 'https://www.marinetraffic.com/en/ais/embed/zoom:11/centery:-54.815/centerx:-68.295/maptype:4/shownames:true/mmsi:0/shipid:0/fleet:/fleet_id:/vtypes:/showmenu:false/remember:false'
      : 'https://www.marinetraffic.com/en/ais/embed/zoom:7/centery:-54.5/centerx:-68.5/maptype:4/shownames:true/mmsi:0/shipid:0/fleet:/fleet_id:/vtypes:/showmenu:false/remember:false';

  return (
    <div className="w-full h-full relative bg-[#0a0a0a] flex flex-col">
      {/* BARRA SUPERIOR DE CONTROL DEL RADAR / COTEJO */}
      <div className="absolute top-3 left-3 right-3 z-[1000] flex items-center justify-between pointer-events-none">
        {/* Toggle Modo: Radar en Vivo vs Cotejador de Flota */}
        <div className="flex items-center gap-1.5 bg-black/80 backdrop-blur-md p-1 rounded-xl border border-white/10 shadow-xl pointer-events-auto">
          <button
            onClick={() => setMode('radar')}
            className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all flex items-center gap-1.5 ${
              currentMode === 'radar'
                ? 'bg-blue-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Compass className="w-3 h-3" />
            <span>Radar Satelital AIS</span>
          </button>
          <button
            onClick={() => setMode('cotejo')}
            className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all flex items-center gap-1.5 ${
              currentMode === 'cotejo'
                ? 'bg-cyan-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Ship className="w-3 h-3" />
            <span>Cotejo de Flota ({vessels.length})</span>
          </button>
        </div>

        {/* Toggle Zoom en modo Radar */}
        {currentMode === 'radar' && (
          <div className="flex items-center gap-1 bg-black/80 backdrop-blur-md p-1 rounded-xl border border-white/10 shadow-xl pointer-events-auto">
            <button
              onClick={() => setZoom('ushuaia')}
              className={`px-2 py-0.5 rounded-lg text-[9px] font-black uppercase tracking-wider transition-all ${
                currentZoom === 'ushuaia'
                  ? 'bg-blue-600/30 text-blue-400 border border-blue-500/30'
                  : 'text-slate-400 hover:text-white'
              }`}
              title="Enfocar Bahía Ushuaia y Muelle de Cruceros"
            >
              Ushuaia (Zoom 11)
            </button>
            <button
              onClick={() => setZoom('regional')}
              className={`px-2 py-0.5 rounded-lg text-[9px] font-black uppercase tracking-wider transition-all ${
                currentZoom === 'regional'
                  ? 'bg-blue-600/30 text-blue-400 border border-blue-500/30'
                  : 'text-slate-400 hover:text-white'
              }`}
              title="Vista Regional Canal Beagle / TDF"
            >
              Canal Beagle (Zoom 7)
            </button>
          </div>
        )}
      </div>

      {/* VISTA 1: IFRAME DE MARINETRAFFIC */}
      {currentMode === 'radar' && (
        <div className="w-full h-full relative">
          <iframe
            id="marinetraffic-map"
            name="marinetraffic-map"
            src={marineTrafficUrl}
            width="100%"
            height="100%"
            frameBorder="0"
            style={{ border: 0 }}
            title="MarineTraffic AIS — Canal Beagle / Tierra del Fuego"
            allowFullScreen
          />
        </div>
      )}

      {/* VISTA 2: COTEJADOR AIS GEORREFERENCIADO (LEAFLET INTERACTIVO) */}
      {currentMode === 'cotejo' && isMounted && (
        <div className="w-full h-full relative">
          <MapContainer
            center={[-54.815, -68.28]}
            zoom={12}
            zoomControl={false}
            scrollWheelZoom={true}
            style={{ width: '100%', height: '100%', background: '#0a0d14' }}
          >
            <ZoomControl position="bottomright" />
            <TileLayer
              attribution='&copy; <a href="https://carto.com/">CARTO</a>'
              url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
              maxZoom={18}
            />

            <MapPanController selectedVessel={selectedVessel} />

            {/* PUNTOS NÁUTICOS CLAVE */}
            {NAUTICAL_LANDMARKS.map((lm) => (
              <Marker
                key={lm.id}
                position={[lm.lat, lm.lng]}
                icon={createLandmarkIcon(lm.emoji, lm.color)}
              >
                <Popup className="custom-nautical-popup">
                  <div className="p-2 space-y-1">
                    <span className="text-[10px] font-black uppercase text-blue-600">Punto Estratégico</span>
                    <h4 className="text-xs font-black text-slate-900">{lm.name}</h4>
                    <p className="text-[11px] text-slate-600 leading-snug">{lm.desc}</p>
                  </div>
                </Popup>
              </Marker>
            ))}

            {/* EMBARCACIONES COTEJADAS CON POSICIÓN AIS */}
            {vessels.map((v) => {
              const isSelected = selectedVesselId === v.id;
              if (!v.lat || !v.lng) return null;

              return (
                <Marker
                  key={v.id}
                  position={[v.lat, v.lng]}
                  icon={createVesselIcon(v.category, isSelected)}
                  eventHandlers={{
                    click: () => onSelectVessel && onSelectVessel(v),
                  }}
                >
                  <Tooltip direction="top" offset={[0, -20]} opacity={0.95}>
                    <div className="text-center font-sans">
                      <span className="font-black text-xs block text-slate-900">{v.name}</span>
                      <span className="text-[10px] text-slate-600">{v.type} · {v.paxCapacity} pax</span>
                    </div>
                  </Tooltip>

                  <Popup className="custom-vessel-popup">
                    <div className="p-3 max-w-[280px] space-y-2 font-sans">
                      <div className="flex items-center justify-between border-b pb-1.5">
                        <span className="text-[9px] font-black uppercase tracking-wider text-blue-600">
                          Ficha AIS Cotejada
                        </span>
                        <span className="text-xs">{v.flag}</span>
                      </div>

                      <div>
                        <h4 className="text-sm font-black text-slate-900 leading-tight">{v.name}</h4>
                        <span className="text-[10px] text-slate-500 font-medium block mt-0.5">{v.type}</span>
                      </div>

                      <div className="grid grid-cols-2 gap-1.5 bg-slate-50 p-2 rounded-xl text-[10px]">
                        <div>
                          <span className="text-slate-400 block">Pasajeros:</span>
                          <span className="font-bold text-blue-600 text-xs">{v.paxCapacity} pax</span>
                        </div>
                        <div>
                          <span className="text-slate-400 block">Tripulación:</span>
                          <span className="font-bold text-slate-700 text-xs">{v.crewCount || 0} pers.</span>
                        </div>
                        <div>
                          <span className="text-slate-400 block">MMSI:</span>
                          <span className="font-mono text-slate-700">{v.mmsi}</span>
                        </div>
                        <div>
                          <span className="text-slate-400 block">Velocidad:</span>
                          <span className="font-mono text-emerald-600 font-bold">{v.speed}</span>
                        </div>
                      </div>

                      <div className="text-[10px] text-slate-600 space-y-0.5">
                        <div><strong className="text-slate-700">Ubicación:</strong> {v.locationName}</div>
                        <div><strong className="text-slate-700">Estado:</strong> {v.status}</div>
                        <div><strong className="text-slate-700">Operador:</strong> {v.agencyName}</div>
                      </div>

                      <div className="pt-2 border-t flex items-center justify-between gap-2">
                        <a
                          href={`https://www.marinetraffic.com/en/ais/details/ships/mmsi:${v.mmsi}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1 text-[10px] font-bold text-blue-600 hover:text-blue-800 underline"
                        >
                          Ver en MarineTraffic <ExternalLink className="w-3 h-3" />
                        </a>
                      </div>
                    </div>
                  </Popup>
                </Marker>
              );
            })}
          </MapContainer>
        </div>
      )}
    </div>
  );
};

/* ─── COMPONENTE AÉREO: WIDGET OFICIAL AIRNAV RADARBOX (TIERRA DEL FUEGO) ─── */
export interface AirMapProps {
  airportCode?: 'TDF' | 'SAWH' | 'SAWE';
  className?: string;
  zoom?: number;
  lat?: number;
  lng?: number;
  mapstyle?: number;
  showToolbar?: boolean;
}

export const AirMap = ({ 
  airportCode = 'TDF', 
  className = '',
  zoom,
  lat,
  lng,
  mapstyle = 1,
  showToolbar = true
}: AirMapProps) => {
  const [selectedFocus, setSelectedFocus] = useState<'TDF' | 'SAWH' | 'SAWE'>(airportCode);
  const [currentStyle, setCurrentStyle] = useState<number>(mapstyle);
  const [iframeKey, setIframeKey] = useState<number>(1);

  // Coordenadas fijas y centradas en Tierra del Fuego
  let currentLat = -54.4000;
  let currentLng = -68.1000;
  let currentZoom = 7;

  if (selectedFocus === 'SAWH') {
    currentLat = -54.8433;
    currentLng = -68.2956;
    currentZoom = 9;
  } else if (selectedFocus === 'SAWE') {
    currentLat = -53.7778;
    currentLng = -67.7494;
    currentZoom = 9;
  }

  if (lat !== undefined) currentLat = lat;
  if (lng !== undefined) currentLng = lng;
  if (zoom !== undefined) currentZoom = zoom;

  // URL del widget oficial de AirNav RadarBox con variables personalizadas (lat, lng, z, mapstyle)
  const widgetSrc = `https://www.airnavradar.com/?widget=1&lat=${currentLat}&lng=${currentLng}&z=${currentZoom}&zoom=${currentZoom}&mapstyle=${currentStyle}&showLabels=true`;

  return (
    <div className={`w-full h-full relative bg-[#0a0d14] flex flex-col overflow-hidden ${className}`}>
      {/* Sub-barra de controles rápidos si está activada */}
      {showToolbar && (
        <div className="flex items-center justify-between gap-2 px-3 py-1.5 bg-[#0e121b] border-b border-white/5 text-[10px] font-mono z-10 shrink-0">
          <div className="flex items-center gap-1 overflow-x-auto scrollbar-hide">
            <span className="text-slate-400 font-bold uppercase text-[9px] mr-1">Foco:</span>
            <button
              type="button"
              onClick={() => setSelectedFocus('TDF')}
              className={`px-2 py-0.5 rounded-md font-bold transition-all cursor-pointer ${
                selectedFocus === 'TDF'
                  ? 'bg-orange-500 text-white shadow-sm'
                  : 'bg-white/5 text-slate-400 hover:text-white'
              }`}
            >
              📍 TDF Centrado
            </button>
            <button
              type="button"
              onClick={() => setSelectedFocus('SAWH')}
              className={`px-2 py-0.5 rounded-md font-bold transition-all cursor-pointer ${
                selectedFocus === 'SAWH'
                  ? 'bg-orange-500 text-white shadow-sm'
                  : 'bg-white/5 text-slate-400 hover:text-white'
              }`}
            >
              🛫 Ushuaia (SAWH)
            </button>
            <button
              type="button"
              onClick={() => setSelectedFocus('SAWE')}
              className={`px-2 py-0.5 rounded-md font-bold transition-all cursor-pointer ${
                selectedFocus === 'SAWE'
                  ? 'bg-orange-500 text-white shadow-sm'
                  : 'bg-white/5 text-slate-400 hover:text-white'
              }`}
            >
              🛬 Río Grande (SAWE)
            </button>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            <button
              type="button"
              onClick={() => setCurrentStyle(prev => (prev === 1 ? 0 : 1))}
              className="px-2 py-0.5 rounded-md bg-white/5 hover:bg-white/10 text-slate-300 border border-white/10 transition-all cursor-pointer text-[9px]"
              title="Cambiar diseño visual del fondo (mapstyle)"
            >
              {currentStyle === 1 ? 'Modo Oscuro' : 'Modo Claro'}
            </button>
            <button
              type="button"
              onClick={() => setIframeKey(k => k + 1)}
              className="p-1 rounded-md bg-white/5 hover:bg-white/10 text-slate-300 border border-white/10 transition-all cursor-pointer"
              title="Recargar radar"
            >
              <RotateCw className="w-2.5 h-2.5 text-orange-400" />
            </button>
            <a
              href={`https://www.airnavradar.com/?lat=${currentLat}&lng=${currentLng}&z=${currentZoom}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-orange-400 hover:text-orange-300 font-bold flex items-center gap-0.5 text-[9px] underline"
              title="Abrir en AirNav RadarBox web completa"
            >
              Web <ExternalLink className="w-2.5 h-2.5" />
            </a>
          </div>
        </div>
      )}

      {/* Widget Iframe oficial de AirNav RadarBox */}
      <div className="flex-1 w-full h-full relative overflow-hidden bg-[#07090e]">
        <iframe
          key={`${selectedFocus}-${currentStyle}-${iframeKey}`}
          id="airnav-radarbox-map"
          name="airnav-radarbox-map"
          src={widgetSrc}
          width="100%"
          height="100%"
          frameBorder="0"
          style={{ border: 0, display: 'block', width: '100%', height: '100%' }}
          title="AirNav RadarBox — Radar de Tráfico Aéreo en Tiempo Real (Tierra del Fuego)"
          allowFullScreen
          allow="geolocation; autoplay; fullscreen"
        />
      </div>
    </div>
  );
};
