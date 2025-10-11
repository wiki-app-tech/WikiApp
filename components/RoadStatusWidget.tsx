import React, { useState, useEffect } from 'react';
import RoadIcon from './icons/RoadIcon';
import SparkleIcon from './icons/SparkleIcon';
import { generateRoadStatusSummary } from '../services/geminiService';
import { RouteStatus, RouteInfo } from '../types';

const ROAD_STATUS_DATA: Record<string, RouteInfo[]> = {
  'Ruta Nacional N°3': [
    { section: 'Ushuaia - Tolhuin', status: 'Transitable con precaución', details: 'Calzada húmeda. Posible presencia de hielo en sectores. Equipos de Vialidad distribuyendo sal.' },
    { section: 'Tolhuin - Río Grande', status: 'Transitable', details: 'Calzada seca. Vientos leves.' },
    { section: 'Río Grande - San Sebastián', status: 'Transitable con precaución', details: 'Bancos de niebla matinales. Visibilidad reducida.' },
  ],
  'Rutas Complementarias': [
    { section: 'Ruta J (Ushuaia - Almanza)', status: 'Transitable con precaución', details: 'Uso de cubiertas de invierno o cadenas. Tramos con barro.' },
    { section: 'Ruta H (Lago Fagnano)', status: 'Intransitable', details: 'Acumulación de nieve. Equipos trabajando en despeje.' },
    { section: 'Ruta A (Río Grande - Estancias)', status: 'Transitable con precaución', details: 'Calzada de ripio. Sectores con serrucho. Conducir a baja velocidad.' },
  ],
};

const MOCK_ROAD_REPORTS_DEFENSE_CIVIL: Record<string, string> = {
    'Ruta Nacional N°3': "Atención: Pronóstico de heladas para la noche y madrugada, especialmente en el tramo de montaña (Paso Garibaldi). Se solicita a los conductores de vehículos pesados circular con extrema cautela. No detenerse en la banquina.",
    'Rutas Complementarias': "Alerta por crecida de ríos de deshielo que pueden afectar vados en rutas complementarias no pavimentadas. La Ruta H permanece cerrada por seguridad. Consultar antes de transitar hacia estancias de la zona norte."
};

const STATUS_COLORS: Record<RouteStatus, string> = {
    'Transitable': 'text-green-400',
    'Transitable con precaución': 'text-yellow-400',
    'Intransitable': 'text-red-500',
};

interface AISummaryState {
    summary: string;
    isLoading: boolean;
    error: string | null;
}

const RoadStatusWidget: React.FC = () => {
  const [activeRoute, setActiveRoute] = useState<string>('Ruta Nacional N°3');
  const [aiSummary, setAiSummary] = useState<AISummaryState>({ summary: '', isLoading: false, error: null });
  
  const routes = Object.keys(ROAD_STATUS_DATA);

  // Reset AI summary when changing routes
  useEffect(() => {
    setAiSummary({ summary: '', isLoading: false, error: null });
  }, [activeRoute]);

  const handleGenerateSummary = async () => {
    const currentRoadData = ROAD_STATUS_DATA[activeRoute];
    const mockReport = MOCK_ROAD_REPORTS_DEFENSE_CIVIL[activeRoute] || "Sin alertas adicionales.";

    setAiSummary({ summary: '', isLoading: true, error: null });

    try {
        const result = await generateRoadStatusSummary(currentRoadData, mockReport, activeRoute);
        setAiSummary({ summary: result, isLoading: false, error: null });
    } catch (err) {
        console.error(err);
        setAiSummary({ summary: '', isLoading: false, error: 'Error al generar el resumen.' });
    }
  };


  return (
    <div className="bg-slate-800/80 backdrop-blur-sm border border-slate-700 rounded-lg p-4 shadow-lg">
        <div className="flex items-center mb-4">
            <RoadIcon className="w-8 h-8 text-yellow-600 mr-3" />
            <h2 className="text-xl font-bold text-white">Estado de Rutas</h2>
        </div>
      <div className="flex flex-wrap items-center justify-center gap-2 mb-4 border-b border-slate-700 pb-3">
        {routes.map(route => (
          <button
            key={route}
            onClick={() => setActiveRoute(route)}
            className={`px-4 py-2 text-sm font-bold rounded-md transition-colors duration-200 ${
              activeRoute === route
                ? 'bg-yellow-600 text-slate-900'
                : 'bg-slate-700/50 text-gray-300 hover:bg-slate-700'
            }`}
          >
            {route}
          </button>
        ))}
      </div>
      <div className="space-y-3">
         {ROAD_STATUS_DATA[activeRoute].map((info) => (
             <div key={info.section} className="bg-slate-900/50 p-3 rounded-md border-l-4 border-slate-600">
                <div className="flex justify-between items-start">
                    <h3 className="font-semibold text-gray-200">{info.section}</h3>
                    <span className={`text-sm font-bold ${STATUS_COLORS[info.status]}`}>{info.status}</span>
                </div>
                <p className="text-sm text-gray-400 mt-1">{info.details}</p>
             </div>
         ))}
      </div>

       {/* AI Summary Section */}
       <div className="bg-slate-900/50 p-4 rounded-lg mt-4 border-t-2 border-slate-700">
            <h3 className="text-lg font-bold text-white mb-3 text-center flex items-center justify-center">
                <SparkleIcon className="w-5 h-5 mr-2 text-yellow-500"/>
                Resumen Inteligente de Seguridad Vial
            </h3>
            {aiSummary.isLoading ? (
                <div className="flex items-center justify-center h-16">
                    <svg className="animate-spin h-6 w-6 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                </div>
            ) : aiSummary.summary ? (
                 <p className="text-gray-300 text-sm leading-relaxed text-center">{aiSummary.summary}</p>
            ) : (
                <div className="text-center">
                     <p className="text-gray-400 text-sm mb-4">Combina el parte de Vialidad con alertas de Defensa Civil para obtener un reporte completo de seguridad.</p>
                     <button
                        onClick={handleGenerateSummary}
                        className="bg-yellow-600 text-slate-900 font-bold py-2 px-5 rounded-lg hover:bg-yellow-700 transition-colors text-sm inline-flex items-center"
                    >
                       <SparkleIcon className="w-4 h-4 mr-2" />
                       Generar Resumen con IA
                    </button>
                </div>
            )}
            {aiSummary.error && <p className="mt-2 text-red-500 text-xs text-center">{aiSummary.error}</p>}
        </div>

      <p className="text-xs text-gray-500 text-center pt-4">
        Fuentes: Vialidad Nacional y <a href="https://www.facebook.com/SuDefensaCivil/?locale=es_LA" target="_blank" rel="noopener noreferrer" className="underline hover:text-yellow-500">Defensa Civil</a> (simulado).
      </p>
    </div>
  );
};

export default RoadStatusWidget;