import React from 'react';
import { Link } from 'react-router-dom';
import TelegramIcon from './icons/TelegramIcon';
import HomeIcon from './icons/HomeIcon';

const TELEGRAM_INVITE_URL = 'https://t.me/+rkKMfpVR3G0yMDBh';

const TelegramFeed: React.FC = () => {
  return (
    <div className="p-4 sm:p-6 flex flex-col items-center justify-center text-center h-full min-h-[400px]">
      <div className="max-w-2xl mx-auto">
        <TelegramIcon className="w-20 h-20 mx-auto text-yellow-600 mb-5" />
        <h2 className="text-3xl font-bold text-white mb-3">Canal de Noticias en Telegram</h2>
        <p className="text-lg text-gray-400 mb-8">
          Pulsa el botón para unirte a nuestro canal y recibir las últimas noticias directamente en tu dispositivo.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <a
              href={TELEGRAM_INVITE_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center bg-yellow-600 text-slate-900 font-bold py-4 px-10 rounded-lg hover:bg-yellow-700 transition-all duration-300 transform hover:scale-105 shadow-lg text-lg"
              aria-label="Abrir canal de noticias en Telegram"
            >
              <TelegramIcon className="w-6 h-6 mr-3" />
              Abrir en Telegram
            </a>
            <Link
              to="/"
              className="inline-flex items-center justify-center bg-slate-700 text-gray-200 font-bold py-4 px-10 rounded-lg hover:bg-slate-600 transition-all duration-300 transform hover:scale-105 shadow-lg text-lg"
              aria-label="Volver al inicio"
            >
                <HomeIcon className="w-6 h-6 mr-3" />
                Volver al Inicio
            </Link>
        </div>
      </div>
    </div>
  );
};

export default TelegramFeed;