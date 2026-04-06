import { useEffect, useState, useRef } from 'react';

interface UseAutoRefreshOptions {
    interval?: number; // en milisegundos
    enabled?: boolean;
}

/**
 * Hook personalizado para auto-refrescar datos periódicamente.
 * Usa useRef para el callback evitando re-renders y loops infinitos.
 * @param callback - Función a ejecutar en cada intervalo
 * @param options - Configuración del auto-refresh
 */
export function useAutoRefresh(
    callback: () => void | Promise<void>,
    options: UseAutoRefreshOptions = {}
) {
    const { interval = 5 * 60 * 1000, enabled = true } = options;
    const [lastUpdate, setLastUpdate] = useState<Date>(new Date());

    // Store callback in ref to avoid re-triggering the effect
    // when the callback identity changes (common with inline functions)
    const callbackRef = useRef(callback);
    callbackRef.current = callback;

    useEffect(() => {
        if (!enabled) return;

        let isMounted = true;

        const executeCallback = async () => {
            try {
                await callbackRef.current();
                if (isMounted) {
                    setLastUpdate(new Date());
                }
            } catch (error) {
                console.error('Error en auto-refresh:', error);
            }
        };

        // Configurar intervalo (NO ejecutar inmediatamente al montar,
        // ya que los datos iniciales vienen del SSR)
        const intervalId = setInterval(executeCallback, interval);

        return () => {
            isMounted = false;
            clearInterval(intervalId);
        };
    }, [interval, enabled]); // Only re-create interval when these change

    return { lastUpdate };
}
