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
  <MapContainer
    center={[-54.4, -68.0]}
    zoom={8}
    zoomControl={false}
    className="w-full h-full z-0"
    style={{ background: '#0a0a0a' }}
  >
    <ZoomControl position="bottomright" />

    {/* Capa base OSM estándar */}
    <TileLayer
      attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
    />

    {MARITIME_POINTS.map((pt) => (
      <React.Fragment key={pt.id}>
        {/* Radio de zona de influencia */}
        <Circle
          center={[pt.lat, pt.lng]}
          radius={pt.radius}
          pathOptions={{
            color: pt.color,
            fillColor: pt.color,
            fillOpacity: 0.10,
            weight: 1.5,
            dashArray: '4, 6',
          }}
        />
        <Marker position={[pt.lat, pt.lng]} icon={createIcon(pt.emoji, pt.color)}>
          <Popup>
            <div className="flex flex-col gap-1 min-w-[170px] p-1 font-sans">
              <strong className="text-sm font-bold border-b pb-1">{pt.name}</strong>
              <span className="text-[11px] text-gray-600 mt-1 leading-snug">{pt.desc}</span>
              <a
                href={`https://www.openstreetmap.org/?mlat=${pt.lat}&mlon=${pt.lng}#map=14/${pt.lat}/${pt.lng}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 text-[10px] font-bold hover:underline mt-1"
              >
                Ver en OpenStreetMap →
              </a>
            </div>
          </Popup>
        </Marker>
      </React.Fragment>
    ))}
  </MapContainer>
);

/* ─── COMPONENTE AÉREO ────────────────────────────────── */

export const AirMap = () => (
  <MapContainer
    center={[-54.2, -67.8]}
    zoom={8}
    zoomControl={false}
    className="w-full h-full z-0"
    style={{ background: '#0a0a0a' }}
  >
    <ZoomControl position="bottomright" />

    <TileLayer
      attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
    />

    {AIR_POINTS.map((pt) => (
      <React.Fragment key={pt.id}>
        <Circle
          center={[pt.lat, pt.lng]}
          radius={pt.radius}
          pathOptions={{
            color: pt.color,
            fillColor: pt.color,
            fillOpacity: 0.12,
            weight: 1.5,
            dashArray: '4, 6',
          }}
        />
        <Marker position={[pt.lat, pt.lng]} icon={createIcon(pt.emoji, pt.color)}>
          <Popup>
            <div className="flex flex-col gap-1 min-w-[170px] p-1 font-sans">
              <strong className="text-sm font-bold border-b pb-1">{pt.name}</strong>
              <span className="text-[11px] text-gray-600 mt-1 leading-snug">{pt.desc}</span>
              <a
                href={`https://www.openstreetmap.org/?mlat=${pt.lat}&mlon=${pt.lng}#map=14/${pt.lat}/${pt.lng}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 text-[10px] font-bold hover:underline mt-1"
              >
                Ver en OpenStreetMap →
              </a>
            </div>
          </Popup>
        </Marker>
      </React.Fragment>
    ))}
  </MapContainer>
);
