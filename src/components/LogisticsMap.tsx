'use client';

import React from 'react';
import { MapContainer, TileLayer, Marker, Popup, ZoomControl, Circle } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix default icon para Next.js
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

// Ícono personalizado para cada tipo de punto
const createIcon = (emoji: string, color: string) =>
  L.divIcon({
    className: '',
    html: `<div style="
      background:${color};
      border-radius:50%;
      width:34px;height:34px;
      display:flex;align-items:center;justify-content:center;
      font-size:16px;
      border:2.5px solid white;
      box-shadow:0 2px 8px rgba(0,0,0,0.35);
    ">${emoji}</div>`,
    iconSize: [34, 34],
    iconAnchor: [17, 17],
    popupAnchor: [0, -20],
  });

/* ─── DATOS ──────────────────────────────────────────── */

// Puertos y fondeaderos principales de TDF
const MARITIME_POINTS = [
  {
    id: 'ushuaia-port',
    name: 'Puerto de Ushuaia',
    desc: 'Principal puerto de la provincia. Cruceros, logística y pesca.',
    lat: -54.8094,
    lng: -68.3027,
    emoji: '⚓',
    color: '#2563eb',
    radius: 3500,
  },
  {
    id: 'rio-grande-port',
    name: 'Puerto Río Grande',
    desc: 'Puerto industrial y pesquero al norte de la isla.',
    lat: -53.7904,
    lng: -67.6931,
    emoji: '⚓',
    color: '#0e7490',
    radius: 2500,
  },
  {
    id: 'canal-beagle',
    name: 'Canal Beagle',
    desc: 'Paso internacional. Navegación histórica y expedicionaria.',
    lat: -54.8700,
    lng: -68.7000,
    emoji: '🌊',
    color: '#1e40af',
    radius: 8000,
  },
  {
    id: 'bahia-lapataia',
    name: 'Bahía Lapataia',
    desc: 'Parque Nacional Tierra del Fuego. Fin de la Ruta Nacional N° 3.',
    lat: -54.8680,
    lng: -68.5500,
    emoji: '🌿',
    color: '#15803d',
    radius: 2000,
  },
];

// Aeropuertos de TDF
const AIR_POINTS = [
  {
    id: 'malvinas-arg',
    name: 'Aeropuerto Malvinas Argentinas',
    desc: 'Aeropuerto Internacional de Ushuaia (USH). Aerolíneas Argentinas, JetSmart, Flybondi.',
    lat: -54.8433,
    lng: -68.2958,
    emoji: '✈️',
    color: '#ea580c',
    radius: 2000,
  },
  {
    id: 'rio-grande-aero',
    name: 'Aeropuerto Gobernador Ramón Trejo Noel',
    desc: 'Aeropuerto de Río Grande (RGA). Vuelos de cabotaje al norte de la isla.',
    lat: -53.7777,
    lng: -67.7494,
    emoji: '✈️',
    color: '#7c3aed',
    radius: 1800,
  },
  {
    id: 'tolhuin-helipad',
    name: 'Tolhuin',
    desc: 'Localidad central de TDF. Cabecera de ruta en la Ruta N° 3.',
    lat: -54.5066,
    lng: -67.1967,
    emoji: '🏔️',
    color: '#ca8a04',
    radius: 1200,
  },
];

/* ─── COMPONENTE MARÍTIMO ─────────────────────────────── */

export const MaritimeMap = () => (
  <div className="w-full h-full relative bg-[#0a0a0a]">
    <iframe
      id="marinetraffic-map"
      name="marinetraffic-map"
      src="https://www.marinetraffic.com/en/ais/embed/zoom:6/centery:-53.9/centerx:-69.4/maptype:4/shownames:true/mmsi:0/shipid:0/fleet:/fleet_id:/vtypes:/showmenu:false/remember:false"
      width="100%"
      height="100%"
      frameBorder="0"
      style={{ border: 0 }}
      title="MarineTraffic AIS — Canal Beagle / Tierra del Fuego"
      allowFullScreen
    />
  </div>
);

/* ─── COMPONENTE AÉREO ────────────────────────────────── */

export const AirMap = () => (
  <div className="w-full h-full relative bg-[#0a0a0a]">
    <iframe 
      name="radarbox" 
      id="radarbox" 
      src="https://www.radarbox.com/widget?lat=-52.86061&lng=-62.04827&z=5&theme=dark&clicktoactive=false" 
      width="100%" 
      height="100%" 
      frameBorder="0" 
      style={{ border: 0 }}
      title="RadarBox Live Flight Tracker"
    />
  </div>
);
