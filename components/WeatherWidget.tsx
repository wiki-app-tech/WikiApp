import React, { useState, useEffect } from 'react';
import WeatherIcon from './WeatherIcon';
import { WeatherData } from '../types';

interface Location {
  name: string;
  lat: number;
  lon: number;
}

const LOCATIONS: Location[] = [
  { name: 'Ushuaia', lat: -54.7999966, lon: -68.3010538 },
  { name: 'Río Grande', lat: -53.789969, lon: -67.6999734 },
  { name: 'Tolhuin', lat: -54.5098777, lon: -67.190854 },
  { name: 'Antártida', lat: -64.2417478, lon: -56.6212866 }, // Base Marambio as a proxy
  { name: 'Malvinas', lat: -51.699963, lon: -57.849686 }, // Stanley as a proxy
];

const fetchWeatherForLocation = async (location: Location): Promise<WeatherData> => {
  const response = await fetch(`https://wttr.in/${location.lat},${location.lon}?format=j1`);
  if (!response.ok) {
    throw new Error(`No se pudo obtener el clima para ${location.name}.`);
  }
  const text = await response.text();
  
  try {
    const data = JSON.parse(text);
    
    const currentCondition = data?.current_condition?.[0];
    const weatherForecast = data?.weather;

    if (!currentCondition || !weatherForecast) {
      throw new Error(`Datos del clima inválidos para ${location.name}.`);
    }

    let description = 'No disponible';
    if (currentCondition.lang_es?.[0]?.value) {
      description = currentCondition.lang_es[0].value.split(',')[0];
    } else if (currentCondition.weatherDesc?.[0]?.value) {
      description = currentCondition.weatherDesc[0].value.split(',')[0];
    }

    const forecast = weatherForecast.slice(0, 3).map((day: any) => {
      const date = new Date(day.date + 'T12:00:00Z');
      return {
          date: day.date,
          dayOfWeek: date.toLocaleDateString('es-ES', { weekday: 'short' }),
          maxTemp: day.maxtempC,
          minTemp: day.mintempC,
          weatherCode: day.hourly[4]?.weatherCode || '116',
      };
    });

    return {
      city: location.name,
      temp: currentCondition.temp_C,
      description: description,
      weatherCode: currentCondition.weatherCode,
      forecast,
    };
  } catch (error) {
    console.error(`Error al procesar la respuesta del clima para ${location.name}. Contenido:`, text);
    throw new Error(`Respuesta inválida del servidor del clima para ${location.name}.`);
  }
};

const WeatherWidget: React.FC = () => {
  const [weatherData, setWeatherData] = useState<Record<string, WeatherData | { error: string }>>({});
  const [activeLocation, setActiveLocation] = useState<string>(LOCATIONS[0].name);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchAllWeatherData = async () => {
      setIsLoading(true);
      const results = await Promise.allSettled(
        LOCATIONS.map(loc => fetchWeatherForLocation(loc))
      );

      const data: Record<string, WeatherData | { error: string }> = {};
      results.forEach((result, index) => {
        const locationName = LOCATIONS[index].name;
        if (result.status === 'fulfilled') {
          data[locationName] = result.value;
        } else {
          console.error(`Error para ${locationName}:`, result.reason);
          data[locationName] = { error: 'No se pudo cargar' };
        }
      });
      
      setWeatherData(data);
      setIsLoading(false);
    };

    fetchAllWeatherData();
  }, []);

  const currentWeatherData = weatherData[activeLocation];
  const activeLocationData = LOCATIONS.find(loc => loc.name === activeLocation);

  const renderWeatherContent = () => {
    if (!currentWeatherData) return null;

    if ('error' in currentWeatherData) {
        return <div className="text-center text-red-400 p-4">{currentWeatherData.error}</div>;
    }

    return (
      <div className="space-y-6">
        {/* Current Weather */}
        <div className="flex w-full flex-col sm:flex-row items-center justify-center sm:justify-start gap-4 text-white px-2">
            <WeatherIcon weatherCode={currentWeatherData.weatherCode} className="w-16 h-16 text-yellow-500" />
            <div className="text-center sm:text-left">
                <p className="text-5xl font-bold">{currentWeatherData.temp}°C</p>
                <p className="text-lg text-gray-300 capitalize">{currentWeatherData.description}</p>
            </div>
        </div>

        {/* Forecast */}
        <div>
            <h3 className="text-lg font-bold text-white mb-3 text-center sm:text-left">Pronóstico Próximos Días</h3>
            <div className="grid grid-cols-3 gap-2 sm:gap-4 text-center">
                {currentWeatherData.forecast.map(day => (
                    <div key={day.date} className="bg-slate-900/50 p-3 rounded-lg flex flex-col items-center">
                        <p className="font-bold text-sm capitalize">{day.dayOfWeek}</p>
                        <WeatherIcon weatherCode={day.weatherCode} className="w-10 h-10 my-1 text-yellow-500"/>
                        <p className="text-sm font-semibold">
                            <span className="text-white">{day.maxTemp}°</span>
                            <span className="text-gray-400"> / {day.minTemp}°</span>
                        </p>
                    </div>
                ))}
            </div>
        </div>

        {/* Radar */}
        {activeLocationData && (
             <div>
                <h3 className="text-lg font-bold text-white mb-3 text-center sm:text-left">Radar Meteorológico</h3>
                 <div className="aspect-video w-full bg-slate-900 rounded-lg overflow-hidden border border-slate-700">
                    <iframe
                        title="Radar Meteorológico"
                        width="100%"
                        height="100%"
                        src={`https://embed.windy.com/embed2.html?lat=${activeLocationData.lat}&lon=${activeLocationData.lon}&zoom=7&level=surface&overlay=radar&product=radar&menu=&message=false&marker=&calendar=now&pressure=&type=map&location=coordinates&detail=false&metricWind=km%2Fh&metricTemp=%C2%B0C&radarRange=-1`}
                        frameBorder="0"
                    ></iframe>
                </div>
            </div>
        )}
        <p className="text-xs text-gray-500 text-center pt-2">Fuente del clima: wttr.in</p>
      </div>
    );
  };
  
  return (
    <div className="bg-slate-800/80 backdrop-blur-sm border border-slate-700 rounded-lg p-4 mb-6 shadow-lg">
      <div className="flex flex-wrap items-center justify-center gap-2 mb-4 border-b border-slate-700 pb-3">
        {LOCATIONS.map(location => (
          <button
            key={location.name}
            onClick={() => setActiveLocation(location.name)}
            className={`px-4 py-2 text-sm font-bold rounded-md transition-colors duration-200 ${
              activeLocation === location.name
                ? 'bg-yellow-600 text-slate-900'
                : 'bg-slate-700/50 text-gray-300 hover:bg-slate-700'
            }`}
          >
            {location.name}
          </button>
        ))}
      </div>
      <div className="min-h-[200px] flex items-center justify-center">
        {isLoading ? (
             <div className="text-gray-400">Cargando datos del clima...</div>
        ) : (
            renderWeatherContent()
        )}
      </div>
    </div>
  );
};

export default WeatherWidget;