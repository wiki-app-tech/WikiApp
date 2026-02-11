'use client';

import React, { useState } from 'react';
import { PlaneIcon } from '../Icons';

type AirportCode = 'USH' | 'RGA';
type FlightType = 'Arribos' | 'Partidas';

const FLIGHT_DATA: Record<AirportCode, Record<FlightType, any[]>> = {
    'USH': {
        'Arribos': [
            { airline: 'Aerolíneas Argentinas', flightNumber: 'AR1852', origin: 'Buenos Aires (AEP)', time: '10:30', status: 'Aterrizado' },
            { airline: 'Flybondi', flightNumber: 'FO5440', origin: 'Buenos Aires (EZE)', time: '12:15', status: 'En Horario' },
            { airline: 'JetSMART', flightNumber: 'WJ3480', origin: 'Buenos Aires (EZE)', time: '14:00', status: 'En Horario' },
        ],
        'Partidas': [
            { airline: 'Aerolíneas Argentinas', flightNumber: 'AR1853', destination: 'Buenos Aires (AEP)', time: '11:15', status: 'Partió' },
            { airline: 'Flybondi', flightNumber: 'FO5441', destination: 'Buenos Aires (EZE)', time: '13:00', status: 'En Horario' },
        ]
    },
    'RGA': {
        'Arribos': [
            { airline: 'Aerolíneas Argentinas', flightNumber: 'AR1842', origin: 'Buenos Aires (AEP)', time: '13:20', status: 'Aterrizado' },
        ],
        'Partidas': [
            { airline: 'Aerolíneas Argentinas', flightNumber: 'AR1843', destination: 'Buenos Aires (AEP)', time: '14:05', status: 'Partió' },
        ]
    }
};

export default function FlightStatusWidget() {
    const [activeAirport, setActiveAirport] = useState<AirportCode>('USH');
    const [activeTab, setActiveTab] = useState<FlightType>('Arribos');
    const [isModalOpen, setIsModalOpen] = useState(false);

    const flights = FLIGHT_DATA[activeAirport][activeTab];

    return (
        <div className="glass-card overflow-hidden p-8 shadow-2xl shadow-accent-primary/5 transition-all duration-300">
            <div className="flex flex-col md:flex-row items-center justify-between mb-10 gap-6">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 flex items-center justify-center bg-accent-primary/10 rounded-2xl text-accent-primary shadow-glow-accent">
                        <PlaneIcon className="w-6 h-6" />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold tracking-tight text-text-primary underline decoration-accent-primary/20 underline-offset-4 font-display">Estado de Vuelos</h2>
                        <p className="text-[11px] font-bold text-text-tertiary uppercase tracking-tight mt-1">Monitoreo Aéreo Regional</p>
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    <div className="flex p-1.5 bg-surface-primary/50 rounded-2xl border border-accent-primary/10">
                        <button
                            onClick={() => setActiveAirport('USH')}
                            className={`px-5 py-2 rounded-xl text-[10px] font-bold uppercase transition-all ${activeAirport === 'USH' ? 'bg-accent-primary text-surface-primary shadow-glow-accent' : 'text-text-tertiary hover:text-text-primary'}`}
                        >
                            Ushuaia
                        </button>
                        <button
                            onClick={() => setActiveAirport('RGA')}
                            className={`px-5 py-2 rounded-xl text-[10px] font-bold uppercase transition-all ${activeAirport === 'RGA' ? 'bg-accent-primary text-surface-primary shadow-glow-accent' : 'text-text-tertiary hover:text-text-primary'}`}
                        >
                            R. Grande
                        </button>
                    </div>
                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="p-3 bg-surface-elevated text-accent-primary rounded-2xl border border-accent-primary/20 hover:bg-surface-primary transition-all shadow-xl"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
                    </button>
                </div>
            </div>

            <div className="flex gap-4 mb-8 border-b border-accent-primary/10 pb-4">
                {(['Arribos', 'Partidas'] as FlightType[]).map(tab => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`text-sm font-bold tracking-tight transition-all pb-2 relative ${activeTab === tab ? 'text-accent-primary' : 'text-text-tertiary hover:text-text-primary'}`}
                    >
                        {tab}
                        {activeTab === tab && <div className="absolute bottom-[-17px] left-0 right-0 h-1 bg-accent-primary rounded-full shadow-glow-accent" />}
                    </button>
                ))}
            </div>

            <div className="space-y-4">
                {flights.map((flight, idx) => (
                    <div key={idx} className="bg-surface-primary/30 border border-accent-primary/5 rounded-[1.5rem] p-5 flex items-center justify-between group hover:bg-surface-elevated hover:border-accent-primary/20 transition-all border-transparent">
                        <div className="flex items-center gap-5">
                            <div className="w-10 h-10 rounded-full bg-accent-primary/10 flex items-center justify-center text-accent-primary group-hover:scale-110 transition-transform">
                                <PlaneIcon className="w-5 h-5" />
                            </div>
                            <div>
                                <h3 className="font-bold text-text-primary text-base font-display">{flight.airline}</h3>
                                <p className="text-[10px] font-bold text-text-tertiary uppercase">{flight.flightNumber} • {activeTab === 'Arribos' ? flight.origin : flight.destination}</p>
                            </div>
                        </div>
                        <div className="flex flex-col items-end gap-2">
                            <span className="text-xl font-black text-text-primary font-display">{flight.time}</span>
                            <span className={`px-3 py-1 rounded-lg text-[9px] font-bold uppercase tracking-tight ${flight.status === 'En Horario' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                                    flight.status === 'Aterrizado' || flight.status === 'Partió' ? 'bg-accent-primary/10 text-accent-primary border border-accent-primary/20' :
                                        'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                                }`}>
                                {flight.status}
                            </span>
                        </div>
                    </div>
                ))}
            </div>

            {isModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-12 animate-in fade-in duration-300">
                    <div className="absolute inset-0 bg-surface-primary/90 backdrop-blur-xl" onClick={() => setIsModalOpen(false)} />
                    <div className="relative w-full max-w-5xl aspect-video bg-surface-elevated rounded-[2.5rem] overflow-hidden border border-accent-primary/20 shadow-2xl glass-card flex flex-col">
                        <div className="p-6 border-b border-white/5 flex items-center justify-between">
                            <h3 className="text-xl font-bold text-text-primary font-display">Tráfico Aéreo Continental en Vivo</h3>
                            <button onClick={() => setIsModalOpen(false)} className="p-2 text-text-tertiary hover:text-text-primary transition-colors">&times;</button>
                        </div>
                        <iframe
                            title="Tráfico Aéreo"
                            src="https://globe.adsbexchange.com/?lat=-54.3&lon=-67.5&zoom=7"
                            className="flex-1 w-full border-0 opacity-80 brightness-110 grayscale-[0.2] hover:grayscale-0 transition-all duration-700"
                        />
                    </div>
                </div>
            )}
        </div>
    );
}
