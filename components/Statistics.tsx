import React from 'react';
import { EconomicIndicator, Trend } from '../types';
import ChartIcon from './icons/ChartIcon';
import ArrowUpIcon from './icons/ArrowUpIcon';
import ArrowDownIcon from './icons/ArrowDownIcon';
import ArrowRightIcon from './icons/ArrowRightIcon';
import UsersIcon from './icons/UsersIcon';
import BookIcon from './icons/BookIcon';

// Mock data, as a real implementation would fetch this from an API.
const MOCK_ECONOMIC_DATA: EconomicIndicator[] = [
  {
    title: 'Empleo Registrado (Industria)',
    value: '10,250',
    period: 'vs. trim. anterior',
    trend: 'up',
    description: 'Puestos de trabajo en el sector industrial fueguino, principal motor económico.',
    isPositiveTrend: true,
  },
  {
    title: 'Ocupación Hotelera (Ushuaia)',
    value: '82%',
    period: 'Temporada alta',
    trend: 'up',
    description: 'Porcentaje de plazas hoteleras ocupadas, reflejando la actividad turística.',
    isPositiveTrend: true,
  },
  {
    title: 'Canasta Básica Alimentaria TDF',
    value: '$285,400',
    period: 'vs. mes anterior',
    trend: 'up',
    description: 'Costo de la canasta básica para una familia tipo en la provincia.',
    isPositiveTrend: false, // A rise in cost is negative for the population
  },
  {
    title: 'Pasajeros Aeropuerto (USH+RGA)',
    value: '1.5M',
    period: 'Acumulado anual',
    trend: 'stable',
    description: 'Total de pasajeros en los aeropuertos de Ushuaia y Río Grande.',
    isPositiveTrend: true,
  },
];


const TrendIndicator: React.FC<{ trend: Trend, isPositive: boolean }> = ({ trend, isPositive }) => {
    const isUp = trend === 'up';
    const isDown = trend === 'down';
    
    const trendColor = trend === 'stable' ? 'text-gray-400' :
        (isUp && isPositive) || (isDown && !isPositive) ? 'text-green-500' : 'text-red-500';

    const TrendIcon = isUp ? ArrowUpIcon : isDown ? ArrowDownIcon : ArrowRightIcon;
    
    return (
        <div className={`flex items-center text-sm font-bold ${trendColor}`}>
            <TrendIcon className="w-4 h-4 mr-1" />
            <span>{trend === 'up' ? 'Sube' : trend === 'down' ? 'Baja' : 'Estable'}</span>
        </div>
    );
};

// A mapping for icons per indicator title for visual variety
const ICON_MAP: { [key: string]: React.FC<{className?: string}> } = {
    'Empleo Registrado (Industria)': UsersIcon,
    'Ocupación Hotelera (Ushuaia)': BookIcon,
    'Canasta Básica Alimentaria TDF': ChartIcon,
    'Pasajeros Aeropuerto (USH+RGA)': UsersIcon,
};


const IndicatorCard: React.FC<{ indicator: EconomicIndicator }> = ({ indicator }) => {
    const IconComponent = ICON_MAP[indicator.title] || ChartIcon;

    return (
        <div className="bg-slate-800/80 backdrop-blur-sm border border-slate-700 rounded-lg p-6 shadow-lg flex flex-col justify-between">
            <div>
                <div className="flex items-center text-gray-400 mb-4">
                    <IconComponent className="w-6 h-6 mr-3" />
                    <h3 className="font-semibold text-lg text-white">{indicator.title}</h3>
                </div>
                <p className="text-5xl font-bold text-white mb-2">{indicator.value}</p>
                <div className="flex items-center justify-between mb-4">
                    <TrendIndicator trend={indicator.trend} isPositive={indicator.isPositiveTrend} />
                    <span className="text-sm text-gray-500">{indicator.period}</span>
                </div>
            </div>
            <p className="text-sm text-gray-300">{indicator.description}</p>
        </div>
    );
};

const Statistics: React.FC = () => {
  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto">
        <div className="text-center mb-8">
            <ChartIcon className="w-16 h-16 mx-auto text-yellow-600 mb-4" />
            <h2 className="text-3xl font-bold text-white">Estadísticas Clave de TDF</h2>
            <p className="text-md text-gray-400 mt-2">
                Indicadores económicos y sociales de Tierra del Fuego.
            </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {MOCK_ECONOMIC_DATA.map(indicator => (
                <IndicatorCard key={indicator.title} indicator={indicator} />
            ))}
        </div>
        <p className="text-xs text-gray-500 text-center pt-8">
            Fuente: Datos simulados basados en informes del INDEC y la Dirección Provincial de Estadísticas y Censos.
        </p>
    </div>
  );
};

export default Statistics;
