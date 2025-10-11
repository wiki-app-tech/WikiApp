import React from 'react';
import { Link } from 'react-router-dom';
import LayoutGridIcon from './icons/LayoutGridIcon';
import WorldIcon from './icons/WorldIcon';
import ChartIcon from './icons/ChartIcon';
import BallotIcon from './icons/BallotIcon';
import TelegramIcon from './icons/TelegramIcon';
import WeatherWidget from './WeatherWidget';
import RoadStatusWidget from './RoadStatusWidget';
import CruiseShipWidget from './CruiseShipWidget';
import FlightStatusWidget from './FlightStatusWidget';
import RadioPlayerWidget from './RadioPlayerWidget';
import LiveCamerasWidget from './LiveCamerasWidget';

interface MainMenuProps {
  // No props needed as navigation is handled by router
}

const MenuItem: React.FC<{
  title: string;
  icon: React.ReactNode;
  to: string;
}> = ({ title, icon, to }) => (
  <Link
    to={to}
    className="bg-slate-800 rounded-lg shadow-lg p-6 flex flex-col items-center justify-center text-center group transition-all duration-300 transform hover:scale-105 hover:shadow-yellow-600/20 border-b-4 border-transparent hover:border-yellow-600"
  >
    <div className="text-yellow-600 mb-4 transition-transform group-hover:scale-110">{icon}</div>
    <h3 className="text-lg font-semibold text-gray-200">{title}</h3>
  </Link>
);

const MainMenu: React.FC<MainMenuProps> = () => {
  return (
    <div className="p-4 sm:p-6 md:p-8">
      <div className="space-y-6">
        <WeatherWidget />
        <RoadStatusWidget />
        <CruiseShipWidget />
        <FlightStatusWidget />
        <RadioPlayerWidget />
        <LiveCamerasWidget />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6 mt-8">
        <MenuItem
          title="Edición Impresa"
          icon={<LayoutGridIcon className="w-12 h-12" />}
          to="/print-edition"
        />
        <MenuItem
          title="Sitios Web de Noticias"
          icon={<WorldIcon className="w-12 h-12" />}
          to="/news-sites"
        />
         <MenuItem
          title="Últimas Noticias (Telegram)"
          icon={<TelegramIcon className="w-12 h-12" />}
          to="/telegram"
        />
        <MenuItem
          title="Estadísticas"
          icon={<ChartIcon className="w-12 h-12" />}
          to="/stats"
        />
        <MenuItem
          title="Elecciones Legislativas 2025"
          icon={<BallotIcon className="w-12 h-12" />}
          to="/elections"
        />
      </div>
    </div>
  );
};

export default MainMenu;