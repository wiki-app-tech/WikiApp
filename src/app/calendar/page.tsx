'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';

const MONTH_NAMES = [
    "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
    "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
];

const WEEKDAYS = ["D", "L", "M", "M", "J", "V", "S"];

export default function CalendarPage() {
    const [holidays, setHolidays] = useState<any>(null);
    const [ephemeris, setEphemeris] = useState<string[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeEphemerisIndex, setActiveEphemerisIndex] = useState(0);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const resHolidays = await fetch('/data/holidays.json');
                const dataHolidays = await resHolidays.json();
                setHolidays(dataHolidays);

                setEphemeris([
                    "Combate de San Lorenzo (1813): San Martín y sus Granaderos derrotan a los realistas.",
                    "Batalla de Caseros (1852): Urquiza derrota a Rosas, marcando el fin de una era.",
                    "Día de la Antártida Argentina (22 de Feb): Conmemoración de la presencia permanente en el continente.",
                    "Fundación de Mar del Plata (10 de Feb): Patricio Peralta Ramos funda la ciudad en 1874.",
                    "Día del Grial Gaucho (6 de Feb): Homenaje al nacimiento de Martín Miguel de Güemes.",
                    "Nacimiento de Guillermo Brown (22 de Jun): El almirante irlandés que fundó la Armada Argentina."
                ]);
                setLoading(false);
            } catch (error) {
                console.error("Error fetching data:", error);
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    // Ephemeris Auto-carousel
    useEffect(() => {
        if (ephemeris.length === 0) return;
        const interval = setInterval(() => {
            setActiveEphemerisIndex(prev => (prev + 1) % ephemeris.length);
        }, 5000);
        return () => clearInterval(interval);
    }, [ephemeris]);

    const holidayMap = useMemo(() => {
        if (!holidays) return {};
        const map: Record<string, { name: string, type: 'inamovible' | 'trasladable' | 'turistico' }> = {};

        holidays.inamovibles.forEach((h: any) => map[h.date] = { name: h.name, type: 'inamovible' });
        holidays.trasladables.forEach((h: any) => map[h.date] = { name: h.name, type: 'trasladable' });
        holidays.turisticos.forEach((h: any) => map[h.date] = { name: h.name, type: 'turistico' });

        return map;
    }, [holidays]);

    if (loading) return (
        <div className="flex h-screen items-center justify-center bg-white">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
        </div>
    );

    return (
        <div className="min-h-screen bg-zinc-50 text-zinc-900 font-sans pb-20">
            {/* Header */}
            <header className="h-20 glass-header sticky top-0 z-50 flex items-center px-6 justify-between">
                <div className="flex items-center gap-4">
                    <Link href="/" className="p-2 bg-white rounded-xl shadow-sm border border-zinc-100 hover:bg-zinc-50 transition-colors">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6" /></svg>
                    </Link>
                    <h1 className="text-xl md:text-2xl font-black tracking-tighter">Calendario 2026</h1>
                </div>
                <div className="text-right">
                    <span className="text-[10px] font-black text-blue-600 uppercase tracking-widest leading-none mb-1 block">Tierra del Fuego</span>
                    <span className="text-sm font-black text-zinc-900 tabular-nums leading-none">{new Date().toLocaleDateString('es-AR', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                </div>
            </header>

            {/* Ephemeris Carousel */}
            <div className="bg-[#002b4e] text-white py-4 overflow-hidden relative shadow-lg">
                <div className="max-w-6xl mx-auto px-6 flex items-center gap-4">
                    <span className="bg-blue-500 text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest shrink-0 animate-pulse">Efemérides</span>
                    <div className="flex-1 relative h-6 overflow-hidden">
                        {ephemeris.map((text, i) => (
                            <div
                                key={i}
                                className={`absolute inset-0 flex items-center transition-all duration-1000 transform ${i === activeEphemerisIndex ? 'translate-y-0 opacity-100' :
                                    i < activeEphemerisIndex ? '-translate-y-full opacity-0' : 'translate-y-full opacity-0'
                                    }`}
                            >
                                <p className="text-sm font-medium tracking-tight whitespace-nowrap overflow-hidden text-ellipsis w-full">
                                    {text}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <main className="max-w-[1400px] mx-auto p-6 md:p-10">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                    {MONTH_NAMES.map((month, index) => (
                        <MonthGrid
                            key={month}
                            monthIndex={index}
                            year={2026}
                            monthName={month}
                            holidayMap={holidayMap}
                        />
                    ))}
                </div>

                {/* Legend */}
                <div className="mt-16 flex flex-wrap justify-center gap-8 bg-white p-8 rounded-[2rem] shadow-xl shadow-blue-900/5 border border-zinc-100">
                    <LegendItem color="bg-blue-600" label="Inamovible" />
                    <LegendItem color="bg-amber-500" label="Trasladable" />
                    <LegendItem color="bg-emerald-500" label="Fines Turísticos" />
                    <LegendItem color="bg-zinc-100" label="Día Laboral" />
                </div>
            </main>
        </div>
    );
}

function MonthGrid({ monthIndex, year, monthName, holidayMap }: { monthIndex: number, year: number, monthName: string, holidayMap: any }) {
    const firstDay = new Date(year, monthIndex, 1).getDay();
    const daysInMonth = new Date(year, monthIndex + 1, 0).getDate();

    const days = [];
    for (let i = 0; i < firstDay; i++) days.push(null);
    for (let i = 1; i <= daysInMonth; i++) days.push(i);

    const monthHolidays = Object.entries(holidayMap)
        .filter(([date]) => {
            const d = new Date(date + "T00:00:00");
            return d.getMonth() === monthIndex && d.getFullYear() === year;
        })
        .sort(([a], [b]) => a.localeCompare(b));

    return (
        <div className="bg-white rounded-[2.5rem] p-6 shadow-xl shadow-blue-900/5 border border-zinc-100 flex flex-col h-full hover:shadow-2xl hover:shadow-blue-900/10 transition-all duration-300 transform hover:-translate-y-1">
            <h3 className="text-xl font-black mb-6 text-zinc-900 tracking-tighter border-b border-zinc-50 pb-4 uppercase">{monthName}</h3>

            {/* Calendar Grid */}
            <div className="grid grid-cols-7 gap-1 mb-8">
                {WEEKDAYS.map(w => <div key={w} className="text-center text-[10px] font-black text-zinc-400 py-2">{w}</div>)}
                {days.map((day, i) => {
                    const dateStr = day ? `${year}-${String(monthIndex + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}` : null;
                    const holiday = dateStr ? holidayMap[dateStr] : null;

                    let bgColor = "hover:bg-zinc-50";
                    let textColor = "text-zinc-600";
                    let fontWeight = "font-medium";

                    // Day of week (0=Sunday, 1=Monday, ..., 6=Saturday)
                    const dayOfWeek = day ? new Date(year, monthIndex, day).getDay() : null;
                    const isWorkday = dayOfWeek !== null && dayOfWeek >= 1 && dayOfWeek <= 5;

                    if (holiday) {
                        fontWeight = "font-black";
                        textColor = "text-white";
                        if (holiday.type === 'inamovible') bgColor = "bg-blue-600 shadow-lg shadow-blue-600/30";
                        else if (holiday.type === 'trasladable') bgColor = "bg-amber-500 shadow-lg shadow-amber-500/30";
                        else if (holiday.type === 'turistico') bgColor = "bg-emerald-500 shadow-lg shadow-emerald-500/30";
                    } else if (isWorkday) {
                        bgColor = "bg-zinc-50/80 hover:bg-zinc-100";
                    }

                    return (
                        <div
                            key={i}
                            className={`aspect-square flex items-center justify-center text-xs rounded-xl transition-all ${bgColor} ${textColor} ${fontWeight} ${!day ? 'invisible' : ''}`}
                        >
                            {day}
                        </div>
                    );
                })}
            </div>

            {/* List of Holidays for the Month */}
            <div className="mt-auto space-y-3">
                {monthHolidays.length > 0 ? (
                    monthHolidays.map(([date, h]: any) => (
                        <div key={date} className="flex gap-3 items-start group">
                            <div className={`w-1.5 h-1.5 rounded-full mt-1.5 shrink-0 ${h.type === 'inamovible' ? 'bg-blue-600' :
                                h.type === 'trasladable' ? 'bg-amber-500' : 'bg-emerald-500'
                                }`} />
                            <p className="text-[11px] font-bold text-zinc-500 leading-tight group-hover:text-zinc-900 transition-colors">
                                <span className="font-black tabular-nums mr-1">{new Date(date + "T00:00:00").getDate()}</span>
                                {h.name}
                            </p>
                        </div>
                    ))
                ) : (
                    <p className="text-[10px] font-medium text-zinc-300 italic">Sin feriados este mes</p>
                )}
            </div>
        </div>
    );
}

function LegendItem({ color, label }: { color: string, label: string }) {
    return (
        <div className="flex items-center gap-3">
            <div className={`w-3 h-3 rounded-full ${color}`}></div>
            <span className="text-xs font-black uppercase tracking-widest text-zinc-500">{label}</span>
        </div>
    );
}
