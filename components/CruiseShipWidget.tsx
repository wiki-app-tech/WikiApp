import React, { useState } from 'react';
import ShipIcon from './icons/ShipIcon';
import Modal from './Modal';

interface CruiseShipArrival {
  name: string;
  arrivalDate: string; // YYYY-MM-DD
  arrivalTime: string; // HH:MM
  departureDate: string; // YYYY-MM-DD
  departureTime: string; // HH:MM
  passengers: number;
  infoUrl: string;
}

// Data actualizada basada en el cronograma oficial de la temporada 2025-2026.
const ALL_ARRIVALS: CruiseShipArrival[] = [
  // Octubre 2025
  { 
    name: 'Viking Polaris', 
    arrivalDate: '2025-10-01',
    arrivalTime: '08:00',
    departureDate: '2025-10-02',
    departureTime: '18:00',
    passengers: 378,
    infoUrl: 'https://www.cruisemapper.com/ships/Viking-Polaris-2113'
  },
  { 
    name: 'National Geographic Endurance', 
    arrivalDate: '2025-10-06',
    arrivalTime: '08:00',
    departureDate: '2025-10-07',
    departureTime: '18:00',
    passengers: 126,
    infoUrl: 'https://www.cruisemapper.com/ships/National-Geographic-Endurance-1834'
  },
  { 
    name: 'Hanseatic Nature', 
    arrivalDate: '2025-10-10',
    arrivalTime: '08:00',
    departureDate: '2025-10-11',
    departureTime: '18:00',
    passengers: 230,
    infoUrl: 'https://www.cruisemapper.com/ships/Hanseatic-Nature-1798'
  },
  { 
    name: 'Sapphire Princess', 
    arrivalDate: '2025-10-16',
    arrivalTime: '08:00',
    departureDate: '2025-10-17',
    departureTime: '18:00',
    passengers: 2670,
    infoUrl: 'https://www.cruisemapper.com/ships/Sapphire-Princess-536'
  },
  { 
    name: 'Le Commandant Charcot', 
    arrivalDate: '2025-10-26',
    arrivalTime: '08:00',
    departureDate: '2025-10-27',
    departureTime: '18:00',
    passengers: 270,
    infoUrl: 'https://www.cruisemapper.com/ships/Le-Commandant-Charcot-1881'
  },
  
  // Noviembre 2025
  { 
    name: 'Oosterdam', 
    arrivalDate: '2025-11-01',
    arrivalTime: '08:00',
    departureDate: '2025-11-02',
    departureTime: '18:00',
    passengers: 1916,
    infoUrl: 'https://www.cruisemapper.com/ships/Oosterdam-494'
  },
  { 
    name: 'Viking Octantis', 
    arrivalDate: '2025-11-05',
    arrivalTime: '08:00',
    departureDate: '2025-11-06',
    departureTime: '18:00',
    passengers: 378,
    infoUrl: 'https://www.cruisemapper.com/ships/Viking-Octantis-2034'
  },
  { 
    name: 'Fridtjof Nansen', 
    arrivalDate: '2025-11-07',
    arrivalTime: '08:00',
    departureDate: '2025-11-08',
    departureTime: '18:00',
    passengers: 530,
    infoUrl: 'https://www.cruisemapper.com/ships/Fridtjof-Nansen-1833'
  },
  {
    name: 'Celebrity Eclipse',
    arrivalDate: '2025-11-20',
    arrivalTime: '07:00',
    departureDate: '2025-11-21',
    departureTime: '17:00',
    passengers: 2850,
    infoUrl: 'https://www.cruisemapper.com/ships/Celebrity-Eclipse-597'
  },

  // Diciembre 2025
  {
    name: 'Norwegian Star',
    arrivalDate: '2025-12-05',
    arrivalTime: '09:00',
    departureDate: '2025-12-05',
    departureTime: '19:00',
    passengers: 2348,
    infoUrl: 'https://www.cruisemapper.com/ships/Norwegian-Star-514'
  },
  {
    name: 'MSC Magnifica',
    arrivalDate: '2025-12-25',
    arrivalTime: '08:00',
    departureDate: '2025-12-25',
    departureTime: '18:00',
    passengers: 2550,
    infoUrl: 'https://www.cruisemapper.com/ships/MSC-Magnifica-653'
  },

  // Enero 2026
  {
    name: 'Azamara Quest',
    arrivalDate: '2026-01-10',
    arrivalTime: '08:00',
    departureDate: '2026-01-11',
    departureTime: '20:00',
    passengers: 694,
    infoUrl: 'https://www.cruisemapper.com/ships/Azamara-Quest-398'
  },
  {
    name: 'Marina',
    arrivalDate: '2026-01-22',
    arrivalTime: '08:00',
    departureDate: '2026-01-22',
    departureTime: '19:00',
    passengers: 1250,
    infoUrl: 'https://www.cruisemapper.com/ships/Marina-696'
  },

  // Febrero 2026
  {
    name: 'Serenade of the Seas',
    arrivalDate: '2026-02-05',
    arrivalTime: '08:00',
    departureDate: '2026-02-05',
    departureTime: '17:00',
    passengers: 2490,
    infoUrl: 'https://www.cruisemapper.com/ships/Serenade-of-the-Seas-467'
  },
  {
    name: 'Viking Jupiter',
    arrivalDate: '2026-02-18',
    arrivalTime: '08:00',
    departureDate: '2026-02-19',
    departureTime: '18:00',
    passengers: 930,
    infoUrl: 'https://www.cruisemapper.com/ships/Viking-Jupiter-1730'
  },

  // Marzo 2026
  {
    name: 'SH Diana',
    arrivalDate: '2026-03-03',
    arrivalTime: '08:00',
    departureDate: '2026-03-04',
    departureTime: '18:00',
    passengers: 192,
    infoUrl: 'https://www.cruisemapper.com/ships/SH-Diana-2169'
  },
  {
    name: 'Ocean Victory',
    arrivalDate: '2026-03-15',
    arrivalTime: '09:00',
    departureDate: '2026-03-16',
    departureTime: '19:00',
    passengers: 200,
    infoUrl: 'https://www.cruisemapper.com/ships/Ocean-Victory-2035'
  },

  // Abril 2026
  {
    name: 'Greg Mortimer',
    arrivalDate: '2026-04-01',
    arrivalTime: '08:00',
    departureDate: '2026-04-02',
    departureTime: '18:00',
    passengers: 120,
    infoUrl: 'https://www.cruisemapper.com/ships/Greg-Mortimer-1831'
  }
];

const CruiseShipWidget: React.FC = () => {
    const [isModalOpen, setIsModalOpen] = useState(false);

    // Obtener los próximos arribos desde hoy
    const now = new Date();
    // Poner las horas a 0 para comparar solo las fechas
    now.setHours(0, 0, 0, 0); 
    
    const upcomingArrivals = ALL_ARRIVALS
        .filter(ship => {
            // T00:00:00 sin Z se interpreta como hora local, lo cual es correcto aquí.
            const arrivalDate = new Date(ship.arrivalDate + 'T00:00:00');
            return arrivalDate >= now;
        })
        .sort((a, b) => new Date(a.arrivalDate).getTime() - new Date(b.arrivalDate).getTime())
        .slice(0, 4); // Mostrar los próximos 4 arribos

    return (
        <div className="bg-slate-800/80 backdrop-blur-sm border border-slate-700 rounded-lg p-4 shadow-lg">
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center">
                    <ShipIcon className="w-8 h-8 text-yellow-600 mr-3" />
                    <h2 className="text-xl font-bold text-white capitalize">Próximos Arribos de Cruceros</h2>
                </div>
                <button 
                    onClick={() => setIsModalOpen(true)}
                    className="bg-sky-600/50 text-white font-bold py-2 px-4 rounded-lg hover:bg-sky-600 transition-colors text-xs sm:text-sm"
                >
                    Ver Tráfico Marítimo
                </button>
            </div>

            {upcomingArrivals.length > 0 ? (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    {upcomingArrivals.map((ship) => (
                        <a 
                            key={ship.name + ship.arrivalDate} 
                            href={ship.infoUrl} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="group bg-slate-900/50 rounded-lg p-4 shadow-md hover:shadow-xl hover:shadow-yellow-600/20 transition-all duration-300 transform hover:-translate-y-1 flex items-center"
                        >
                            <div className="flex-shrink-0 bg-slate-800 rounded-full p-3 sm:p-4 mr-4">
                                <ShipIcon className="w-10 h-10 sm:w-12 sm:h-12 text-sky-400 group-hover:text-yellow-400 transition-colors duration-300" />
                            </div>
                            <div className="flex-grow">
                                <h3 className="font-bold text-white text-md sm:text-lg group-hover:text-yellow-400 transition-colors">{ship.name}</h3>
                                <div className="text-xs sm:text-sm space-y-1 mt-1">
                                    <div className="grid grid-cols-2 items-center gap-2">
                                        <span className="text-gray-400">Arribo:</span>
                                        <div className="font-semibold text-gray-200 text-right">
                                            <div>{new Date(ship.arrivalDate + 'T12:00:00Z').toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit', year: '2-digit', timeZone: 'UTC' })}</div>
                                            <div>{ship.arrivalTime} hs</div>
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 items-center gap-2">
                                        <span className="text-gray-400">Partida:</span>
                                        <div className="font-semibold text-gray-200 text-right">
                                            <div>{new Date(ship.departureDate + 'T12:00:00Z').toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit', year: '2-digit', timeZone: 'UTC' })}</div>
                                            <div>{ship.departureTime} hs</div>
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 items-center border-t border-slate-700 pt-1 mt-1 gap-2">
                                        <span className="text-gray-400">Pasajeros:</span>
                                        <span className="font-bold text-white text-right">{ship.passengers.toLocaleString('es-AR')}</span>
                                    </div>
                                </div>
                            </div>
                        </a>
                    ))}
                </div>
            ) : (
                <div className="text-center text-gray-400 py-8">
                    <p>No hay próximos arribos de cruceros programados en nuestra base de datos.</p>
                </div>
            )}
             <p className="text-xs text-gray-500 text-center pt-4">
                Fuente: <a href="https://findelmundo.tur.ar/es/cruceros/cronograma" target="_blank" rel="noopener noreferrer" className="underline hover:text-yellow-500">INFUETUR</a> (datos de temporada 2025-2026).
            </p>

            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Tráfico Marítimo en Vivo - Tierra del Fuego">
                <iframe
                    title="Tráfico Marítimo"
                    src="https://www.vesselfinder.com/aismap?lat=-54.8&lon=-68.3&zoom=10"
                    className="w-full h-full border-0 rounded-b-lg"
                ></iframe>
            </Modal>
        </div>
    );
};

export default CruiseShipWidget;
