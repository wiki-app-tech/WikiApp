import React, { useState } from 'react';
import { NewsCategory, PrintEditionSource } from '../types';
import { PRINT_EDITION_SOURCES } from '../constants';

interface PrintEditionProps {
  category: NewsCategory;
}

const getTodaysDatePath = () => {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');
  return `${year}/${month}/${day}`;
};

const PrintEdition: React.FC<PrintEditionProps> = ({ category }) => {
  const sources = PRINT_EDITION_SOURCES[category];
  const [erroredImages, setErroredImages] = useState<string[]>([]);
  const datePath = getTodaysDatePath();

  return (
    <div className="p-4 sm:p-6">
      <h2 className="text-3xl font-bold text-white mb-8 text-center">{category}</h2>
      <div className="flex flex-col items-center space-y-8">
        {sources.map(source => {
            const imageUrl = source.logoUrl.includes('{{DATE}}')
                ? source.logoUrl.replace('{{DATE}}', datePath)
                : source.logoUrl;
            
            const hasError = erroredImages.includes(imageUrl);

            return (
                <a
                    key={source.name}
                    href={source.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full max-w-xl group flex flex-col items-center"
                    aria-label={`Ver edición impresa de ${source.name}`}
                >
                    <div className="w-full bg-slate-800 rounded-lg shadow-lg transition-all duration-300 transform hover:-translate-y-1 hover:shadow-2xl hover:shadow-yellow-600/20 overflow-hidden">
                        {hasError ? (
                            <div className="w-full aspect-[2/3] flex items-center justify-center bg-slate-700">
                                <p className="text-gray-400">Portada no disponible</p>
                            </div>
                        ) : (
                            <img
                                src={imageUrl}
                                alt={`Portada de ${source.name}`}
                                className="w-full h-auto object-contain transition-transform duration-300 group-hover:scale-105"
                                loading="lazy"
                                referrerPolicy="no-referrer"
                                onError={() => setErroredImages(prev => [...prev, imageUrl])}
                            />
                        )}
                    </div>
                    <h3 className="font-semibold text-white text-lg mt-4 text-center">{source.name}</h3>
                </a>
            );
        })}
      </div>
    </div>
  );
};

export default PrintEdition;