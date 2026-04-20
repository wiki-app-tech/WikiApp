'use client';

import WeatherCard from '@/components/WeatherCard';
import CruiseShipWidget from '@/components/widgets/CruiseShipWidget';
import FlightStatusWidget from '@/components/widgets/FlightStatusWidget';
import LiveCamerasWidget from '@/components/widgets/LiveCamerasWidget';
import ElectionsWidget from '@/components/widgets/ElectionsWidget';
import PrintEditionsWidget from '@/components/widgets/PrintEditionsWidget';
import EconomicIndicatorsWidget from '@/components/widgets/EconomicIndicatorsWidget';
import TDFStatsWidget from '@/components/widgets/TDFStatsWidget';

interface ZonasViewProps {
    cities: Record<string, { lat: number; lon: number }>;
}

export default function ZonasView({ cities }: ZonasViewProps) {
    return (
        <div className="flex-1 overflow-y-auto p-8 md:p-12 bg-surface-primary">
            <div className="max-w-7xl mx-auto space-y-16">
                <div className="flex flex-col md:flex-row items-center justify-between gap-8">
                    <div className="flex flex-col gap-4">
                        <h2 className="text-[10px] font-black text-accent-primary uppercase tracking-[0.2em]">SISTEMA DE MONITOREO GEOGRÁFICO</h2>
                        <h1 className="text-5xl font-black text-text-primary tracking-tighter uppercase font-display">Mapas y <span className="text-accent-primary">Zonas</span></h1>
                        <p className="text-text-secondary text-lg font-medium max-w-xl">
                            Información en tiempo real sobre clima, rutas, tráfico marítimo y aéreo en Tierra del Fuego.
                        </p>
                    </div>
                    <div className="hidden lg:flex items-center gap-6">
                        <div className="text-right">
                            <div className="text-3xl font-black text-text-primary">100%</div>
                            <div className="text-[10px] font-bold text-accent-secondary uppercase tracking-widest">Sinc. en Vivo</div>
                        </div>
                        <div className="w-px h-12 bg-accent-primary/20" />
                        <div className="w-16 h-16 bg-accent-primary/10 rounded-3xl flex items-center justify-center text-accent-primary shadow-glow-accent">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" /></svg>
                        </div>
                    </div>
                </div>

                <WeatherCard cities={cities} />

                <div className="grid grid-cols-1 xl:grid-cols-2 gap-12">
                    <CruiseShipWidget />
                    <FlightStatusWidget />
                </div>

                <LiveCamerasWidget />
                <ElectionsWidget />
                <PrintEditionsWidget />
                <EconomicIndicatorsWidget />
                <TDFStatsWidget />
            </div>
        </div>
    );
}
