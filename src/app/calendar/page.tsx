'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function CalendarPage() {
    const [holidays, setHolidays] = useState<any>(null);
    const [ephemeris, setEphemeris] = useState<string[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Fetch holidays from local data
                const resHolidays = await fetch('/data/holidays.json');
                const dataHolidays = await resHolidays.json();
                setHolidays(dataHolidays);

                // Fetch daily ephemeris (Mocking for now as we don't have a direct API, 
                // but we could use a scraper function server-side if needed)
                setEphemeris([
                    "3 de febrero: Día de San Blas, patrono de los que padecen enfermedades de la garganta.",
                    "1813: Combate de San Lorenzo. José de San Martín y sus Granaderos a Caballo derrotan a las tropas realistas.",
                    "1852: Batalla de Caseros. Las fuerzas de Justo José de Urquiza derrotan a Juan Manuel de Rosas.",
                    "1934: Nace Juan Carlos Calabró, destacado humorista y actor argentino."
                ]);

                setLoading(false);
            } catch (error) {
                console.error("Error fetching calendar data:", error);
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const today = new Date();
    const formattedDate = today.toLocaleDateString('es-AR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });

    if (loading) return <div className="flex h-screen items-center justify-center bg-white font-sans">
        <div className="flex flex-col items-center gap-4">
            <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
            <p className="text-zinc-500 font-black uppercase tracking-widest text-xs">Cargando Calendario...</p>
        </div>
    </div>;

    return (
        <div className="min-h-screen bg-zinc-50 text-zinc-900 font-sans pb-20">
            {/* Header */}
            <header className="h-24 glass-header sticky top-0 z-50 flex items-center px-6 justify-between">
                <div className="flex items-center gap-6">
                    <Link href="/" className="p-3 bg-white rounded-2xl shadow-lg border border-zinc-100 hover:scale-105 active:scale-95 transition-all min-h-0 min-w-0">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-zinc-600"><path d="m15 18-6-6 6-6" /></svg>
                    </Link>
                    <div>
                        <h1 className="text-2xl md:text-3xl font-black tracking-tighter leading-none">Calendario 2026</h1>
                        <p className="text-[10px] font-black text-blue-600 uppercase tracking-[0.2em] mt-1">Feriados y Efemérides</p>
                    </div>
                </div>
                <div className="hidden md:block text-right">
                    <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest leading-none mb-1 block">Tierra del Fuego</span>
                    <span className="text-lg font-black text-zinc-900 tabular-nums leading-none tracking-tight">{formattedDate}</span>
                </div>
            </header>

            <main className="max-w-6xl mx-auto p-6 md:p-12 space-y-12">
                {/* Efemerides del Dia */}
                <section className="glass-card p-10 rounded-[3rem] shadow-2xl shadow-blue-900/10">
                    <div className="flex items-center gap-4 mb-8">
                        <div className="w-14 h-14 flex items-center justify-center bg-blue-600 text-white rounded-3xl shadow-xl shadow-blue-600/30 ring-8 ring-blue-50">
                            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M4 19.5V4a2 2 0 0 1 2-2h10.9a2 2 0 0 1 1.6 1.25L20 7v12.5a2.5 2.5 0 0 1-2.5 2.5H6.5a2.5 2.5 0 0 1-2.5-2.5z" /><path d="M8 7h6" /><path d="M8 11h8" /><path d="M8 15h6" /></svg>
                        </div>
                        <div>
                            <h2 className="text-3xl font-black tracking-tighter">Efemérides del Día</h2>
                            <p className="text-xs font-bold text-zinc-400 uppercase tracking-widest">Acontecimientos históricos</p>
                        </div>
                    </div>
                    <div className="grid gap-6">
                        {ephemeris.map((item, i) => (
                            <div key={i} className="flex gap-6 items-start p-6 bg-white rounded-[2rem] border border-zinc-100 shadow-sm hover:shadow-md transition-shadow">
                                <div className="text-blue-600 font-black text-xl pt-1">#0{i + 1}</div>
                                <p className="text-lg font-medium text-zinc-700 leading-relaxed">{item}</p>
                            </div>
                        ))}
                    </div>
                </section>

                {/* Feriados 2026 */}
                <div className="grid md:grid-cols-3 gap-8">
                    {/* Inamovibles */}
                    <HolidaySection title="Inamovibles" category="inamovibles" data={holidays?.inamovibles} color="blue" />
                    {/* Trasladables */}
                    <HolidaySection title="Trasladables" category="trasladables" data={holidays?.trasladables} color="amber" />
                    {/* Turisticos/No Laborables */}
                    <HolidaySection title="Turísticos" category="turisticos" data={holidays?.turisticos} color="emerald" />
                </div>
            </main>
        </div>
    );
}

function HolidaySection({ title, category, data, color }: { title: string, category: string, data: any[], color: 'blue' | 'amber' | 'emerald' }) {
    const colorClasses = {
        blue: 'bg-blue-600 text-blue-600 ring-blue-50',
        amber: 'bg-amber-500 text-amber-500 ring-amber-50',
        emerald: 'bg-emerald-500 text-emerald-500 ring-emerald-50'
    };

    return (
        <section className="flex flex-col h-full">
            <div className="flex items-center gap-3 mb-6">
                <div className={`w-10 h-10 flex items-center justify-center rounded-2xl text-white shadow-lg ${colorClasses[color].split(' ')[0]}`}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M8 2v4" /><path d="M16 2v4" /><rect width="18" height="18" x="3" y="4" rx="2" /><path d="M3 10h18" /><path d="m9 16 2 2 4-4" /></svg>
                </div>
                <h3 className="text-xl font-black tracking-tighter uppercase">{title}</h3>
            </div>
            <div className="bg-white rounded-[2.5rem] p-6 border border-zinc-100 shadow-sm flex-1 space-y-4">
                {data?.map((h, i) => (
                    <div key={i} className="flex items-start gap-4 p-4 rounded-2xl hover:bg-zinc-50 transition-colors group">
                        <div className="pt-1">
                            <div className={`w-2 h-2 rounded-full ${colorClasses[color].split(' ')[1]}`} />
                        </div>
                        <div>
                            <p className="text-[10px] font-black text-zinc-400 tabular-nums mb-1">
                                {new Date(h.date + "T00:00:00").toLocaleDateString('es-AR', { day: 'numeric', month: 'short' }).toUpperCase()}
                            </p>
                            <p className="text-sm font-bold text-zinc-800 leading-tight group-hover:text-zinc-900 transition-colors">{h.name}</p>
                        </div>
                    </div>
                ))}
            </div>
        </section>
    );
}
