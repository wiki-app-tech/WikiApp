'use client';

import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, LayersControl, ZoomControl, Circle } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { AlertTriangle, Info, Map as MapIcon } from 'lucide-react';

// Corrección para los iconos por defecto de Leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

// Íconos de ciudades
const createCityIcon = (emoji: string, bg: string) =>
  L.divIcon({
    className: '',
    html: `<div style="background:${bg};border-radius:50%;width:32px;height:32px;display:flex;align-items:center;justify-content:center;font-size:15px;border:2.5px solid white;box-shadow:0 2px 8px rgba(0,0,0,0.35);">${emoji}</div>`,
    iconSize: [32, 32],
    iconAnchor: [16, 16],
    popupAnchor: [0, -20],
  });

// Localidades precisas de Tierra del Fuego
const TDF_CITIES = [
  {
    id: 'ushuaia',
    name: 'Ushuaia',
    desc: 'Capital de Tierra del Fuego. Lat: -54.8019 | Lon: -68.3029',
    lat: -54.8019,
    lng: -68.3029,
    emoji: '🏔️',
    bg: '#2563eb',
    osmLink: 'https://www.openstreetmap.org/?mlat=-54.8019&mlon=-68.3029#map=13/-54.8019/-68.3029',
  },
  {
    id: 'rio-grande',
    name: 'Río Grande',
    desc: 'Ciudad industrial al norte de la isla. Lat: -53.7850 | Lon: -67.7000',
    lat: -53.7850,
    lng: -67.7000,
    emoji: '🏭',
    bg: '#0e7490',
    osmLink: 'https://www.openstreetmap.org/?mlat=-53.7850&mlon=-67.7000#map=13/-53.7850/-67.7000',
  },
  {
    id: 'tolhuin',
    name: 'Tolhuin',
    desc: 'Localidad central de la provincia. Lat: -54.5100 | Lon: -67.1900',
    lat: -54.5100,
    lng: -67.1900,
    emoji: '🌲',
    bg: '#15803d',
    osmLink: 'https://www.openstreetmap.org/?mlat=-54.5100&mlon=-67.1900#map=14/-54.5100/-67.1900',
  },
];

interface Alert {
  title: string;
  status: string;
  date: string;
  description: string;
  zones: Record<string, string>;
}

const WeatherAlertMap = () => {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);

  // Nodos de información de TDF (Fuentes solicitadas por el usuario)
  const infoNodes = [
    { id: 'dc-tdf', name: 'Defensa Civil TDF', lat: -54.806, lon: -68.311, url: 'https://www.facebook.com/SuDefensaCivil/', type: 'emergency' },
    { id: 'vn-tdf', name: 'Vialidad Nacional (Ruta 3)', lat: -53.786, lon: -67.696, url: 'https://www.argentina.gob.ar/transporte/vialidad-nacional/estado-de-rutas', type: 'road' },
    { id: 'vp-tdf', name: 'Vialidad Provincial TDF', lat: -54.515, lon: -67.198, url: 'https://www.facebook.com/direccionprovincialdevialidadTDF/', type: 'road' },
  ];

  useEffect(() => {
    fetch('/api/alerts')
      .then(res => res.json())
      .then(data => {
        setAlerts(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(err => {
        console.error('Error fetching alerts:', err);
        setLoading(false);
      });
  }, []);

  // Verificar si hay alertas activas en Tierra del Fuego
  const tdfAlerts = alerts.filter(alert => 
    Object.values(alert.zones).some(zone => zone.toLowerCase().includes('tierra del fuego'))
  );

  const getAlertColor = (title: string) => {
    const t = title.toLowerCase();
    if (t.includes('rojo') || t.includes('extremo')) return '#ef4444';
    if (t.includes('naranja') || t.includes('muy fuerte')) return '#f97316';
    if (t.includes('amarillo') || t.includes('fuertes') || t.includes('alerta')) return '#eab308';
    return '#3b82f6';
  };

  return (
    <div className="relative w-full h-full rounded-xl overflow-hidden bg-white dark:bg-[#0c0c0c] border border-slate-300 dark:border-[#222]">
      

      <MapContainer 
        center={[-54.3, -67.8]} // Centrado en TDF
        zoom={7} 
        zoomControl={false}
        className="w-full h-full z-0"
      >
        <ZoomControl position="bottomright" />
        
        <LayersControl position="topright">
          
          <LayersControl.BaseLayer name="Modo Oscuro (Gris)">
             <TileLayer
               attribution='&copy; <a href="https://carto.com/attributions">CARTO</a>'
               url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
             />
          </LayersControl.BaseLayer>

          <LayersControl.BaseLayer checked name="OpenStreetMap (Street)">
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
          </LayersControl.BaseLayer>

          <LayersControl.BaseLayer name="Satélite">
            <TileLayer
              attribution='Tiles &copy; Esri'
              url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
            />
          </LayersControl.BaseLayer>

          <LayersControl.BaseLayer name="Terreno">
            <TileLayer
              attribution='Tiles &copy; Esri'
              url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Terrain_Base/MapServer/tile/{z}/{y}/{x}"
            />
          </LayersControl.BaseLayer>

          <LayersControl.BaseLayer name="Océano">
            <TileLayer
              attribution='Tiles &copy; Esri'
              url="https://server.arcgisonline.com/ArcGIS/rest/services/Ocean/World_Ocean_Base/MapServer/tile/{z}/{y}/{x}"
            />
          </LayersControl.BaseLayer>

        </LayersControl>

        {/* Círculo de Alerta General si existe alerta en TDF */}
        {tdfAlerts.length > 0 && (
            <Circle 
                center={[-54.48, -68.3]} 
                radius={200000} // Un radio que cubra la isla
                pathOptions={{ 
                    color: getAlertColor(tdfAlerts[0].title), 
                    fillColor: getAlertColor(tdfAlerts[0].title), 
                    fillOpacity: 0.1,
                    weight: 2,
                    dashArray: '5, 10'
                }} 
            />
        )}

        {/* Marcadores de ciudades de TDF */}
        {TDF_CITIES.map(city => (
          <Marker key={city.id} position={[city.lat, city.lng]} icon={createCityIcon(city.emoji, city.bg)}>
            <Popup>
              <div className="flex flex-col gap-1.5 min-w-[180px] p-1 font-sans">
                <strong className="text-sm font-bold border-b pb-1">{city.name}</strong>
                <span className="text-[10px] text-gray-600 mt-1 leading-snug font-mono">{city.desc}</span>
                <a
                  href={city.osmLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 text-[10px] font-bold hover:underline mt-1"
                >
                  Ver en OpenStreetMap →
                </a>
              </div>
            </Popup>
          </Marker>
        ))}

        {/* Nodos de Información (Fuentes TDF) */}
        {infoNodes.map(node => (
            <Marker key={node.id} position={[node.lat, node.lon]}>
                <Popup>
                    <div className="p-2 flex flex-col gap-2 min-w-[150px]">
                        <div className="flex items-center gap-2 border-b pb-1">
                            <Info className="w-4 h-4 text-blue-500" />
                            <strong className="text-sm font-bold">{node.name}</strong>
                        </div>
                        <span className="text-[10px] text-gray-600 font-medium">Fuente oficial de información regional.</span>
                        <a href={node.url} target="_blank" rel="noopener noreferrer" className="bg-blue-600 text-slate-900 dark:text-white text-[10px] font-bold px-3 py-1.5 rounded text-center hover:bg-blue-700 transition-colors mt-1">
                            ACCEDER A LA FUENTE
                        </a>
                    </div>
                </Popup>
            </Marker>
        ))}

      </MapContainer>

    </div>
  );
};

export default WeatherAlertMap;
