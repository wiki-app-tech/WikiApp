import React, { useState } from 'react';
import { FlightInfo, FlightStatus } from '../types';
import PlaneIcon from './icons/PlaneIcon';
import Modal from './Modal';

type AirportCode = 'USH' | 'RGA';
type FlightType = 'Arribos' | 'Partidas';

const FLIGHT_DATA: Record<AirportCode, Record<FlightType, FlightInfo[]>> = {
  'USH': {
    'Arribos': [
      { airline: 'Aerolíneas Argentinas', flightNumber: 'AR1852', origin: 'Buenos Aires (AEP)', destination: 'Ushuaia', time: '10:30', status: 'Aterrizado' },
      { airline: 'Flybondi', flightNumber: 'FO5440', origin: 'Buenos Aires (EZE)', destination: 'Ushuaia', time: '12:15', status: 'En Horario' },
      { airline: 'JetSMART', flightNumber: 'WJ3480', origin: 'Buenos Aires (EZE)', destination: 'Ushuaia', time: '14:00', status: 'En Horario' },
      { airline: 'Aerolíneas Argentinas', flightNumber: 'AR1890', origin: 'El Calafate', destination: 'Ushuaia', time: '16:45', status: 'Demorado' },
    ],
    'Partidas': [
      { airline: 'Aerolíneas Argentinas', flightNumber: 'AR1853', origin: 'Ushuaia', destination: 'Buenos Aires (AEP)', time: '11:15', status: 'Partió' },
      { airline: 'Flybondi', flightNumber: 'FO5441', origin: 'Ushuaia', destination: 'Buenos Aires (EZE)', time: '13:00', status: 'En Horario' },
      { airline: 'JetSMART', flightNumber: 'WJ3481', origin: 'Ushuaia', destination: 'Buenos Aires (EZE)', time: '14:45', status: 'En Horario' },
      { airline: 'Aerolíneas Argentinas', flightNumber: 'AR1891', origin: 'Ushuaia', destination: 'El Calafate', time: '17:30', status: 'En Horario' },
    ]
  },
  'RGA': {
    'Arribos': [
      { airline: 'Aerolíneas Argentinas', flightNumber: 'AR1842', origin: 'Buenos Aires (AEP)', destination: 'Río Grande', time: '13:20', status: 'Aterrizado' },
      { airline: 'LADE', flightNumber: 'LD430', origin: 'Comodoro Rivadavia', destination: 'Río Grande', time: '15:10', status: 'En Horario' },
    ],
    'Partidas': [
      { airline: 'Aerolíneas Argentinas', flightNumber: 'AR1843', origin: 'Río Grande', destination: 'Buenos Aires (AEP)', time: '14:05', status: 'Partió' },
      { airline: 'LADE', flightNumber: 'LD431', origin: 'Río Grande', destination: 'Comodoro Rivadavia', time: '15:55', status: 'En Horario' },
    ]
  }
};

const STATUS_STYLES: Record<FlightStatus, string> = {
    'En Horario': 'bg-green-600/80 text-white',
    'Aterrizado': 'bg-blue-600/80 text-white',
    'Partió': 'bg-blue-600/80 text-white',
    'Demorado': 'bg-red-600/80 text-white',
};

const FlightStatusWidget: React.FC = () => {
    const [activeAirport, setActiveAirport] = useState<AirportCode>('USH');
    const [activeTab, setActiveTab] = useState<FlightType>('Arribos');
    const [isModalOpen, setIsModalOpen] = useState(false);

    const flights = FLIGHT_DATA[activeAirport][activeTab];

    return (
        <div className="bg-slate-800/80 backdrop-blur-sm border border-slate-700 rounded-lg p-4 shadow-lg">
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center">
                    <PlaneIcon className="w-8 h-8 text-yellow-600 mr-3" />
                    <h2 className="text-xl font-bold text-white">Estado de Vuelos</h2>
                </div>
                <button 
                    onClick={() => setIsModalOpen(true)}
                    className="bg-sky-600/50 text-white font-bold py-2 px-4 rounded-lg hover:bg-sky-600 transition-colors text-xs sm:text-sm"
                >
                    Ver Tráfico Aéreo
                </button>
            </div>
            
            {/* Airport & Type Toggles */}
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-4">
                <div className="flex flex-wrap items-center justify-center gap-2">
                    {(['USH', 'RGA'] as AirportCode[]).map(airport => (
                        <button
                            key={airport}
                            onClick={() => setActiveAirport(airport)}
                            className={`px-4 py-2 text-sm font-bold rounded-md transition-colors duration-200 ${
                            activeAirport === airport
                                ? 'bg-yellow-600 text-slate-900'
                                : 'bg-slate-700/50 text-gray-300 hover:bg-slate-700'
                            }`}
                        >
                           {airport === 'USH' ? 'Ushuaia' : 'Río Grande'}
                        </button>
                    ))}
                </div>
                <div className="flex-shrink-0 bg-slate-700/50 p-1 rounded-lg flex gap-1">
                     {(['Arribos', 'Partidas'] as FlightType[]).map(tab => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`w-24 py-1.5 text-sm font-semibold rounded-md transition-colors duration-200 ${
                                activeTab === tab
                                ? 'bg-slate-900 text-yellow-500'
                                : 'text-gray-300 hover:bg-slate-800/50'
                            }`}
                        >
                            {tab}
                        </button>
                     ))}
                </div>
            </div>

            {/* Flights List */}
            <div className="space-y-2 max-h-60 overflow-y-auto pr-2">
                {flights.map((flight, index) => (
                    <div key={index} className="grid grid-cols-3 sm:grid-cols-4 gap-2 items-center bg-slate-900/50 p-3 rounded-md text-xs sm:text-sm">
                        <div className="col-span-1">
                            <p className="font-bold text-white">{flight.airline}</p>
                            <p className="text-gray-400">{flight.flightNumber}</p>
                        </div>
                        <div className="col-span-1 text-center sm:text-left">
                            <p className="text-gray-400">{activeTab === 'Arribos' ? 'Desde' : 'Hacia'}</p>
                            <p className="font-semibold text-white">{activeTab === 'Arribos' ? flight.origin : flight.destination}</p>
                        </div>
                        <div className="col-span-1 sm:col-span-1 text-center">
                             <p className="font-bold text-lg text-white">{flight.time}</p>
                        </div>
                        <div className="col-span-3 sm:col-span-1 text-center mt-2 sm:mt-0">
                             <span className={`px-3 py-1.5 font-bold rounded-full text-xs ${STATUS_STYLES[flight.status]}`}>
                                {flight.status}
                            </span>
                        </div>
                    </div>
                ))}
            </div>
            
            <p className="text-xs text-gray-500 text-center pt-4">
                Fuente: Aeropuertos Argentina 2000 / FlightStats (simulado).
            </p>

            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Tráfico Aéreo en Vivo - Tierra del Fuego">
                <iframe
                    title="Tráfico Aéreo"
                    src="https://globe.adsbexchange.com/?lat=-54.3&lon=-67.5&zoom=7"
                    className="w-full h-full border-0 rounded-b-lg"
                    allowFullScreen
                ></iframe>
            </Modal>
        </div>
    );
};

export default FlightStatusWidget;