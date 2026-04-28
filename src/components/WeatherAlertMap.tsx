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
      
      {/* Panel de Alertas en Tiempo Real - Responsive */}
      <div className="absolute top-4 left-4 z-[400] w-[calc(100%-32px)] sm:w-72 pointer-events-none">
         <div className="bg-black/70 backdrop-blur-3xl border border-slate-300 dark:border-white/10 rounded-[2rem] p-5 shadow-[0_8px_32px_rgba(0,0,0,0.5)] pointer-events-auto overflow-hidden">
            <div className="flex items-center gap-3 mb-4 border-b border-slate-200 dark:border-white/5 pb-3 text-yellow-500">
               <div className="w-8 h-8 rounded-xl bg-yellow-500/10 flex items-center justify-center border border-yellow-500/20">
                  <AlertTriangle className="w-4 h-4 shadow-[0_0_10px_rgba(234,179,8,0.5)]" />
               </div>
               <h3 className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-900 dark:text-white/90">Alertas SMN</h3>
            </div>
            <div className="flex flex-col gap-4 max-h-[350px] overflow-y-auto pr-2 scrollbar-hide">
               {tdfAlerts.length > 0 ? tdfAlerts.map((alert, i) => (
                  <div key={i} className="flex flex-col gap-2 border-b border-slate-200 dark:border-white/5 pb-4 last:border-0 hover:bg-white dark:bg-white/[0.02] p-2 rounded-2xl transition-all group cursor-default">
                     <span className="text-[12px] font-black text-slate-900 dark:text-white group-hover:text-yellow-400 leading-tight tracking-tight uppercase">
                        {alert.title}
                     </span>
                     <div className="flex items-center justify-between text-[9px] font-black uppercase tracking-widest text-slate-500 dark:text-gray-500">
                        <span>{alert.date}</span>
                        <div className="w-1.5 h-1.5 rounded-full bg-yellow-500 animate-pulse"></div>
                     </div>
                     <p className="text-[11px] text-slate-600 dark:text-gray-400 line-clamp-3 mt-1 font-medium leading-relaxed italic opacity-70 group-hover:opacity-100 transition-opacity">
                        {alert.description}
                     </p>
                  </div>
               )) : (
                <div className="py-6 text-center flex flex-col items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
                    <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">Territorio Sin Alertas Activas</span>
                </div>
               )}
            </div>
         </div>
      </div>

      <MapContainer 
        center={[-54.3, -67.8]} // Centrado en TDF
        zoom={7} 
        zoomControl={false}
        className="w-full h-full z-0"
      >
        <ZoomControl position="bottomright" />
        
        <LayersControl position="topright">
          
          <LayersControl.BaseLayer checked name="Modo Oscuro (Gris)">
             <TileLayer
               attribution='&copy; <a href="https://carto.com/attributions">CARTO</a>'
               url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
             />
          </LayersControl.BaseLayer>

          <LayersControl.BaseLayer name="Cartografía (Street)">
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
