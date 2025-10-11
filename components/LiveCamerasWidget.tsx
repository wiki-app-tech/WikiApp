import React from 'react';
import { LIVE_CAMERAS } from '../constants';
import CameraIcon from './icons/CameraIcon';

const LiveCamerasWidget: React.FC = () => {
  return (
    <div className="bg-slate-800/80 backdrop-blur-sm border border-slate-700 rounded-lg p-4 shadow-lg">
      <div className="flex items-center mb-4">
        <CameraIcon className="w-8 h-8 text-yellow-600 mr-3" />
        <h2 className="text-xl font-bold text-white">Cámaras en Vivo</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {LIVE_CAMERAS.map((camera) => (
          <div key={camera.location} className="bg-slate-900/50 p-2 rounded-lg">
            <div className="aspect-video w-full bg-slate-900 rounded-md overflow-hidden border border-slate-700">
              <iframe
                title={camera.location}
                src={camera.embedUrl}
                width="100%"
                height="100%"
                frameBorder="0"
                allowFullScreen
                loading="lazy"
              ></iframe>
            </div>
            <p className="text-center font-semibold text-white text-sm mt-2">{camera.location}</p>
          </div>
        ))}
      </div>
      <p className="text-xs text-gray-500 text-center pt-4">
        Fuente: <a href="https://www.skylinewebcams.com/" target="_blank" rel="noopener noreferrer" className="underline hover:text-yellow-500">Skyline Webcams</a>.
      </p>
    </div>
  );
};

export default LiveCamerasWidget;
