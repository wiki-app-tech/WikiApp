import React from 'react';
import SunnyIcon from './icons/weather/SunnyIcon';
import PartlyCloudyIcon from './icons/weather/PartlyCloudyIcon';
import CloudyIcon from './icons/weather/CloudyIcon';
import FogIcon from './icons/weather/FogIcon';
import RainIcon from './icons/weather/RainIcon';
import ThunderIcon from './icons/weather/ThunderIcon';
import SnowIcon from './icons/weather/SnowIcon';

interface WeatherIconProps {
  weatherCode: string;
  className?: string;
}

const WeatherIcon: React.FC<WeatherIconProps> = ({ weatherCode, className }) => {
  const code = parseInt(weatherCode, 10);

  // Mapeo de códigos de clima de la API de World Weather Online a componentes de iconos
  const ICON_MAP: { [key: number]: React.ElementType } = {
    113: SunnyIcon,       // Despejado/Soleado
    116: PartlyCloudyIcon, // Parcialmente nublado
    119: CloudyIcon,        // Nublado
    122: CloudyIcon,        // Cubierto
    143: FogIcon,           // Niebla
    176: RainIcon,          // Lluvia irregular
    179: SnowIcon,          // Nieve irregular
    182: SnowIcon,          // Aguanieve irregular
    185: RainIcon,          // Llovizna helada irregular
    200: ThunderIcon,       // Tormenta aislada
    227: SnowIcon,          // Ventisca de nieve
    230: SnowIcon,          // Ventisca
    248: FogIcon,           // Niebla
    260: FogIcon,           // Niebla helada
    263: RainIcon,          // Llovizna irregular
    266: RainIcon,          // Llovizna ligera
    281: RainIcon,          // Llovizna helada
    284: RainIcon,          // Fuerte llovizna helada
    293: RainIcon,          // Lluvia ligera irregular
    296: RainIcon,          // Lluvia ligera
    299: RainIcon,          // Lluvia moderada a veces
    302: RainIcon,          // Lluvia moderada
    305: RainIcon,          // Lluvia fuerte a veces
    308: RainIcon,          // Lluvia fuerte
    311: RainIcon,          // Lluvia helada ligera
    314: RainIcon,          // Lluvia helada moderada o fuerte
    317: SnowIcon,          // Aguanieve ligera
    320: SnowIcon,          // Aguanieve moderada o fuerte
    323: SnowIcon,          // Nieve ligera irregular
    326: SnowIcon,          // Nieve ligera
    329: SnowIcon,          // Nieve moderada a veces
    332: SnowIcon,          // Nieve moderada
    335: SnowIcon,          // Nieve fuerte a veces
    338: SnowIcon,          // Nieve fuerte
    350: SnowIcon,          // Granizo de hielo
    353: RainIcon,          // Chaparrón ligero
    356: RainIcon,          // Chaparrón moderado o fuerte
    359: RainIcon,          // Aguacero torrencial
    368: SnowIcon,          // Chaparrones de nieve ligeros
    371: SnowIcon,          // Chaparrones de nieve moderados o fuertes
    386: ThunderIcon,       // Truenos y relámpagos irregulares
    389: ThunderIcon,       // Truenos y relámpagos moderados o fuertes
    392: ThunderIcon,       // Nieve con truenos y relámpagos irregulares
    395: SnowIcon,          // Nieve moderada o fuerte con truenos y relámpagos
  };

  const IconComponent = ICON_MAP[code] || PartlyCloudyIcon; // Ícono por defecto

  return <IconComponent className={className} />;
};

export default WeatherIcon;