'use client';

import { useState, useEffect } from 'react';

export default function Clock() {
    const [currentTime, setCurrentTime] = useState(new Date());

    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentTime(new Date());
        }, 1000);
        return () => clearInterval(timer);
    }, []);

    return (
        <div className="flex flex-col items-end md:items-start md:ml-10 border-l border-accent-primary/20 pl-4 md:pl-10">
            <span className="text-[9px] md:text-[10px] font-black text-text-tertiary uppercase tracking-[0.15em] leading-none mb-1 text-right md:text-left">
                {currentTime.toLocaleDateString('es-AR', { weekday: 'long', day: 'numeric', month: 'long' })}
            </span>
            <div className="flex items-center gap-3">
                <span className="text-sm md:text-xl font-black text-text-primary tabular-nums leading-none tracking-tight">
                    {currentTime.toLocaleTimeString('es-AR', {
                        hour: '2-digit',
                        minute: '2-digit',
                        second: '2-digit',
                        hour12: false,
                        timeZone: 'America/Argentina/Ushuaia'
                    })}
                </span>
            </div>
        </div>
    );
}
