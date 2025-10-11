import React, { useState, useCallback } from 'react';
import { generateElectionsSummary } from '../services/geminiService';
import BallotIcon from './icons/BallotIcon';

const Elections: React.FC = () => {
  const [summary, setSummary] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleGenerateSummary = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    setSummary('');
    try {
      const result = await generateElectionsSummary();
      setSummary(result);
    } catch (err) {
      setError('Ocurrió un error al contactar al servicio de IA.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  return (
    <div className="p-4 sm:p-6 max-w-4xl mx-auto">
      <div className="text-center mb-8">
        <BallotIcon className="w-16 h-16 mx-auto text-yellow-600 mb-4" />
        <h2 className="text-3xl font-bold text-white">Elecciones Legislativas 2025</h2>
        <p className="text-md text-gray-400 mt-2">
          Análisis e información sobre las próximas elecciones de mitad de período en Argentina.
        </p>
      </div>

      <div className="bg-slate-800 rounded-lg shadow-lg p-6 border border-slate-700">
        <h3 className="text-xl font-semibold text-white mb-4">Resumen Inteligente por IA</h3>
        <p className="text-gray-300 mb-6">
          Haz clic en el botón para obtener un resumen generado por inteligencia artificial sobre la importancia de las elecciones legislativas de 2025.
        </p>
        <div className="text-center">
          <button
            onClick={handleGenerateSummary}
            disabled={isLoading}
            className="bg-yellow-600 text-slate-900 font-bold py-3 px-8 rounded-lg hover:bg-yellow-700 transition-colors duration-300 disabled:bg-slate-600 disabled:text-gray-400 disabled:cursor-not-allowed flex items-center justify-center mx-auto"
          >
            {isLoading ? (
              <>
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Generando...
              </>
            ) : 'Generar Resumen con IA'}
          </button>
        </div>

        {summary && (
          <div className="mt-6 border-t border-slate-700 pt-6">
            <h4 className="text-lg font-semibold text-yellow-600 mb-2">Análisis Generado:</h4>
            <p className="text-gray-300 whitespace-pre-wrap leading-relaxed">{summary}</p>
          </div>
        )}
        {error && <p className="mt-4 text-red-500 text-center">{error}</p>}
      </div>
    </div>
  );
};

export default Elections;