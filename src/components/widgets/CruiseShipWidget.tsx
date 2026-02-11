'use client';

import React, { useState } from 'react';
import { ShipIcon } from '../Icons';

interface CruiseShipArrival {
    name: string;
    arrivalDate: string; // YYYY-MM-DD
    arrivalTime: string; // HH:MM
    departureDate: string; // YYYY-MM-DD
    departureTime: string; // HH:MM
    passengers: number;
    infoUrl: string;
}

const ALL_ARRIVALS: CruiseShipArrival[] = [
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
        name: 'Sapphire Princess',
        arrivalDate: '2025-10-16',
        arrivalTime: '08:00',
        departureDate: '2025-10-17',
        departureTime: '18:00',
        passengers: 2670,
        infoUrl: 'https://www.cruisemapper.com/ships/Sapphire-Princess-536'
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
    {
        name: 'Norwegian Star',
        arrivalDate: '2025-12-05',
        arrivalTime: '09:00',
        departureDate: '2025-12-05',
        departureTime: '19:00',
        passengers: 2348,
        infoUrl: 'https://www.cruisemapper.com/ships/Norwegian-Star-514'
    }
];

export default function CruiseShipWidget() {
    const [isModalOpen, setIsModalOpen] = useState(false);

    const now = new Date();
    now.setHours(0, 0, 0, 0);

    const upcomingArrivals = ALL_ARRIVALS
        .filter(ship => {
            const arrivalDate = new Date(ship.arrivalDate + 'T00:00:00');
            return arrivalDate >= now;
        })
        .sort((a, b) => new Date(a.arrivalDate).getTime() - new Date(b.arrivalDate).getTime())
        .slice(0, 4);

    return (
        <div className="glass-card overflow-hidden p-8 shadow-2xl shadow-accent-primary/5 transition-all duration-300">
            <div className="flex items-center justify-between mb-10 text-center md:text-left">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 flex items-center justify-center bg-accent-primary/10 rounded-2xl text-accent-primary shadow-glow-accent">
                        <ShipIcon className="w-6 h-6" />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold tracking-tight text-text-primary underline decoration-accent-primary/20 underline-offset-4 font-display">Arribos de Cruceros</h2>
                        <p className="text-[11px] font-bold text-text-tertiary uppercase tracking-tight mt-1">Temporada 2025-2026</p>
                    </div>
                </div>
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="bg-accent-primary text-surface-primary px-6 py-2.5 rounded-[var(--radius-button)] font-bold text-[10px] uppercase tracking-tight shadow-glow-accent border border-accent-primary/20 active:scale-95 transition-all"
                >
                    Live Traffic
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {upcomingArrivals.map((ship) => (
                    <a
                        key={ship.name + ship.arrivalDate}
                        href={ship.infoUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="group bg-surface-primary/30 border border-accent-primary/5 rounded-[2rem] p-6 transition-all hover:bg-surface-elevated hover:shadow-xl hover:shadow-accent-primary/5 border-transparent hover:border-accent-primary/20 flex items-center gap-5"
                    >
                        <div className="flex-shrink-0 w-14 h-14 bg-surface-elevated rounded-2xl flex items-center justify-center text-text-tertiary group-hover:text-accent-primary transition-colors">
                            <ShipIcon className="w-8 h-8" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <h3 className="font-bold text-text-primary group-hover:text-accent-primary transition-colors text-lg truncate font-display">{ship.name}</h3>
                            <div className="grid grid-cols-2 gap-x-4 gap-y-1 mt-2">
                                <span className="text-[10px] font-bold text-text-tertiary uppercase">Llegada</span>
                                <span className="text-xs font-bold text-text-secondary text-right">{new Date(ship.arrivalDate + 'T12:00:00Z').toLocaleDateString('es-AR', { day: '2-digit', month: 'short' })} • {ship.arrivalTime}</span>

                                <span className="text-[10px] font-bold text-text-tertiary uppercase">Pasajeros</span>
                                <span className="text-xs font-bold text-accent-secondary text-right">{ship.passengers.toLocaleString('es-AR')}</span>
                            </div>
                        </div>
                    </a>
                ))}
            </div>

            <p className="text-[10px] text-text-tertiary text-center mt-8 italic opacity-60">
                Fuente oficial: INFUETUR - Cronograma del Puerto de Ushuaia
            </p>

            {isModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-12 animate-in fade-in duration-300">
                    <div className="absolute inset-0 bg-surface-primary/90 backdrop-blur-xl" onClick={() => setIsModalOpen(false)} />
                    <div className="relative w-full max-w-5xl aspect-video bg-surface-elevated rounded-[2.5rem] overflow-hidden border border-accent-primary/20 shadow-2xl glass-card flex flex-col">
                        <div className="p-6 border-b border-white/5 flex items-center justify-between">
                            <h3 className="text-xl font-bold text-text-primary font-display">Tráfico Marítimo en Tiempo Real</h3>
                            <button onClick={() => setIsModalOpen(false)} className="p-2 text-text-tertiary hover:text-text-primary transition-colors">&times;</button>
                        </div>
                        <iframe
                            title="Tráfico Marítimo"
                            src="https://www.vesselfinder.com/aismap?lat=-54.8&lon=-68.3&zoom=10"
                            className="flex-1 w-full border-0 opacity-80 brightness-110 grayscale-[0.3] hover:grayscale-0 transition-all duration-700"
                        />
                    </div>
                </div>
            )}
        </div>
    );
}
