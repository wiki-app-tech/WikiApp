'use client';

import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, LayersControl, ZoomControl } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { Activity } from 'lucide-react';

// Corrección para los iconos por defecto de Leaflet en Next.js
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

// Estructura GeoJSON de USGS
interface EarthquakeFeature {
  type: string;
  properties: {
    mag: number;
    place: string;
    time: number;
    url: string;
    title: string;
  };
  geometry: {
    type: string;
    coordinates: [number, number, number]; // [longitud, latitud, profundidad]
  };
  id: string;
}

const EarthquakeMap = () => {
  const [earthquakes, setEarthquakes] = useState<EarthquakeFeature[]>([]);

  useEffect(() => {
    // Obtenemos los sismos globales de los últimos 7 días (>2.5 para evitar saturación de la UI)
    // Se puede cambiar a 'all_month.geojson' pero para mapas en vivo, la semana mantiene mejor rendimiento.
    fetch('https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/2.5_week.geojson')
      .then(res => res.json())
      .then(data => {
        const features = data.features || [];
        setEarthquakes(features);
      })
      .catch(console.error);
  }, []);

  // Top 3 Sismos: Tratamos de filtrar sismos en el Hemisferio Sur/Latam, si no hay, mostramos los globales más recientes.
  const southAmEqs = earthquakes.filter(eq => eq.geometry.coordinates[1] < 0 && eq.geometry.coordinates[0] < -30);
  const baseList = southAmEqs.length >= 3 ? southAmEqs : earthquakes;
  
  const displayTop3 = [...baseList]
    .sort((a, b) => b.properties.time - a.properties.time)
    .slice(0, 3);

  // Generador de iconos custom según la magnitud
  const getCustomIcon = (mag: number) => {
    const size = Math.max(12, mag * 4); // Escala visual
    const color = mag > 6 ? '#ef4444' : mag > 4.5 ? '#f97316' : '#3b82f6'; // Rojo, Naranja, Azul
    const shadowColor = mag > 6 ? 'rgba(239, 68, 68, 0.4)' : mag > 4.5 ? 'rgba(249, 115, 22, 0.4)' : 'rgba(59, 130, 246, 0.4)';
    
    return L.divIcon({
      className: 'custom-eq-icon',
      html: `<div style="
        background-color: ${color}; 
        width: ${size}px; height: ${size}px; 
        border-radius: 50%; opacity: 0.8; 
        border: 2px solid white;
        box-shadow: 0 0 10px ${shadowColor};
      "></div>`,
      iconSize: [size, size],
      iconAnchor: [size/2, size/2]
    });
  };

  return (
    <div className="relative w-full h-full rounded-b-3xl overflow-hidden bg-[#0c0c0c]">
      
      {/* Overlay Flotante de top sismos - Premium */}
      <div className="absolute top-4 left-4 z-[400] w-[calc(100%-32px)] sm:w-64 pointer-events-none">
         <div className="bg-black/70 backdrop-blur-3xl border border-white/10 rounded-[2rem] p-5 shadow-[0_8px_32px_rgba(0,0,0,0.5)] pointer-events-auto overflow-hidden">
            <div className="flex items-center gap-3 mb-4 border-b border-white/5 pb-3">
               <div className="w-8 h-8 rounded-xl bg-red-600/10 flex items-center justify-center border border-red-500/20">
                  <Activity className="w-4 h-4 text-red-500 shadow-[0_0_10px_rgba(239, 68, 68, 0.5)]" />
               </div>
               <h3 className="text-[11px] font-black text-white/90 uppercase tracking-[0.2em]">Últimos Sismos</h3>
            </div>
            <div className="flex flex-col gap-5">
               {displayTop3.length > 0 ? displayTop3.map(eq => (
                  <div key={eq.id} className="flex flex-col gap-2 cursor-pointer group hover:translate-x-1 transition-transform">
                     <div className="flex items-center justify-between">
                        <div className={`px-2.5 py-1 rounded-full text-[10px] font-black border ${eq.properties.mag > 6 ? 'bg-red-500/10 border-red-500/30 text-red-500' : eq.properties.mag > 4.5 ? 'bg-orange-500/10 border-orange-500/30 text-orange-400' : 'bg-blue-500/10 border-blue-500/30 text-blue-400'}`}>
                           {eq.properties.mag.toFixed(1)} M
                        </div>
                        <span className="text-[9px] font-black text-gray-500 uppercase tracking-widest">{new Date(eq.properties.time).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                     </div>
                     <span className="text-[12px] font-bold text-gray-300 leading-snug group-hover:text-white transition-colors tracking-tight line-clamp-2">{eq.properties.place}</span>
                  </div>
               )) : <div className="py-4 text-center text-[10px] font-black text-gray-500 uppercase italic animate-pulse">Sincronizando USGS...</div>}
            </div>
         </div>
      </div>

      <MapContainer 
        center={[-54.8019, -68.3030]} // Tierra del Fuego / Ushuaia
        zoom={6} 
        zoomControl={false}
        className="w-full h-full z-0"
        style={{ background: '#0a0a0a' }}
      >
        <ZoomControl position="bottomright" />
        
        <LayersControl position="topright">
          
          <LayersControl.BaseLayer name="Modo Oscuro (Gris)">
             <TileLayer
               attribution='&copy; <a href="https://carto.com/attributions">CARTO</a>'
               url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
             />
          </LayersControl.BaseLayer>

          <LayersControl.BaseLayer checked name="Cartografía (Street)">
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
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

        {earthquakes.map(eq => (
          <Marker 
            key={eq.id} 
            position={[eq.geometry.coordinates[1], eq.geometry.coordinates[0]]}
            icon={getCustomIcon(eq.properties.mag)}
          >
            <Popup className="custom-popup">
              <div className="flex flex-col gap-1 p-2 min-w-[150px]">
                 <strong className="text-sm border-b pb-1 font-bold">Magnitud {eq.properties.mag.toFixed(1)}</strong>
                 <span className="text-[11px] text-gray-700 mt-1">{eq.properties.place}</span>
                 <span className="text-[10px] font-bold text-gray-500">{new Date(eq.properties.time).toLocaleString()}</span>
                 <div className="flex items-center gap-2 mt-2 pt-2 border-t">
                    <span className="text-[9px] bg-gray-100 px-1.5 py-0.5 rounded text-gray-600">Prof: {Math.round(eq.geometry.coordinates[2])}km</span>
                    <a href={eq.properties.url} target="_blank" rel="noopener noreferrer" className="text-blue-600 text-[10px] font-bold hover:underline ml-auto">Ver USGS</a>
                 </div>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>

    </div>
  );
}

export default EarthquakeMap;
