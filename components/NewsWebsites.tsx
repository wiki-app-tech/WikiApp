import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { NewsSource, NewsCategory } from '../types';
import { NEWS_SITES } from '../constants';
import { generateNewsSummary } from '../services/geminiService';
import SparkleIcon from './icons/SparkleIcon';

const CORS_PROXY = 'https://api.codetabs.com/v1/proxy?quest=';

interface NewsWebsitesProps {
  category: NewsCategory;
}

const NewsWebsites: React.FC<NewsWebsitesProps> = ({ category }) => {
  const sites = NEWS_SITES[category] || [];
  const [summary, setSummary] = useState<string>('');
  const [isSummaryLoading, setIsSummaryLoading] = useState<boolean>(false);
  const [summaryError, setSummaryError] = useState<string | null>(null);
  const location = useLocation();
  const navigate = useNavigate();
  const allCategories = Object.values(NewsCategory);

  const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newCategory = e.target.value as NewsCategory;
    navigate(`/news-sites/${encodeURIComponent(newCategory)}`);
  };

  const handleGenerateSummary = async () => {
    setIsSummaryLoading(true);
    setSummaryError(null);
    setSummary('');

    const sitesToFetch = sites.filter(site => site.rssUrl);
    if (sitesToFetch.length === 0) {
        setSummaryError("No hay fuentes RSS disponibles en esta categoría para generar un resumen.");
        setIsSummaryLoading(false);
        return;
    }

    try {
      const articlePromises = sitesToFetch.map(async (site) => {
        try {
            const response = await fetch(`${CORS_PROXY}${encodeURIComponent(site.rssUrl!)}`);
            if (!response.ok) return []; // Ignorar feeds que fallen
            const text = await response.text();
            const parser = new window.DOMParser();
            const xml = parser.parseFromString(text, 'text/xml');
            const items = xml.querySelectorAll('item');
            return Array.from(items).map(item => {
                const title = item.querySelector('title')?.textContent?.trim() || '';
                return { title, source: site.name };
            }).slice(0, 5); // Limitar a 5 titulares por fuente
        } catch (error) {
            console.warn(`Could not fetch feed for ${site.name}:`, error);
            return []; // Devolver array vacío si hay un error
        }
      });

      const results = await Promise.all(articlePromises);
      const allArticles = results.flat();
      
      if (allArticles.length === 0) {
        throw new Error("No se pudieron obtener noticias para generar el resumen.");
      }

      const summaryText = await generateNewsSummary(allArticles);
      setSummary(summaryText);

    } catch (err) {
      console.error("Error generating news summary:", err);
      const errorMessage = err instanceof Error ? err.message : 'Ocurrió un error desconocido.';
      setSummaryError(errorMessage);
    } finally {
      setIsSummaryLoading(false);
    }
  };

  const formattedSummary = summary.split('* ').filter(s => s.trim()).map((s, i) => <li key={i} className="mb-2">{s.trim()}</li>);

  return (
    <div className="p-4 sm:p-6">
      <div className="text-center mb-6">
        <h2 className="text-3xl font-bold text-white mb-4">{category}</h2>
        <div className="relative max-w-xs mx-auto">
            <label htmlFor="category-selector" className="sr-only">Seleccionar categoría</label>
            <select
                id="category-selector"
                value={category}
                onChange={handleCategoryChange}
                className="w-full bg-slate-700 border border-slate-600 text-white text-md rounded-lg focus:ring-yellow-500 focus:border-yellow-500 block p-2.5 appearance-none"
                aria-label="Seleccionar una categoría de noticias"
            >
                {allCategories.map((cat) => (
                    <option key={cat} value={cat}>
                        {cat}
                    </option>
                ))}
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-400">
                <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                    <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/>
                </svg>
            </div>
        </div>
      </div>
      
      {/* AI Quick Read Section */}
      <div className="bg-slate-800/80 backdrop-blur-sm border border-slate-700 rounded-lg p-4 mb-6 shadow-lg max-w-4xl mx-auto">
        <h3 className="text-lg font-bold text-white mb-3 text-center flex items-center justify-center">
            <SparkleIcon className="w-5 h-5 mr-2 text-yellow-500"/>
            Lectura Rápida de la Sección
        </h3>
        {isSummaryLoading ? (
            <div className="flex items-center justify-center h-20">
                <svg className="animate-spin h-6 w-6 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
            </div>
        ) : summary ? (
            <ul className="text-gray-300 text-sm list-disc pl-5 leading-relaxed">{formattedSummary}</ul>
        ) : (
            <div className="text-center">
                <p className="text-gray-400 text-sm mb-4">Obtén un resumen de los temas más importantes de todos los medios de esta categoría, generado por IA.</p>
                <button
                    onClick={handleGenerateSummary}
                    disabled={isSummaryLoading}
                    className="bg-yellow-600 text-slate-900 font-bold py-2 px-5 rounded-lg hover:bg-yellow-700 transition-colors text-sm inline-flex items-center disabled:bg-slate-600 disabled:cursor-not-allowed"
                >
                    <SparkleIcon className="w-4 h-4 mr-2" />
                    Generar Lectura Rápida
                </button>
            </div>
        )}
        {summaryError && <p className="mt-2 text-red-500 text-xs text-center">{summaryError}</p>}
      </div>

      {/* News Sources List */}
      <div className="max-w-4xl mx-auto space-y-4">
        {sites.filter(site => site.rssUrl).map((site) => (
          <Link
            key={site.name}
            to={`${location.pathname}/${encodeURIComponent(site.name)}`}
            className="w-full flex items-center bg-slate-800 p-4 rounded-lg shadow-md hover:shadow-xl hover:bg-slate-700 transition-all duration-300 border-l-4 border-transparent hover:border-yellow-600 text-left"
            aria-label={`Ver noticias de ${site.name}`}
          >
            <img src={site.logo} alt={`${site.name} logo`} className="w-16 h-16 rounded-md mr-4 object-contain bg-white p-1" />
            <span className="text-lg font-medium text-yellow-600">{site.name}</span>
          </Link>
        ))}
         {sites.length === 0 && (
             <p className="text-center text-gray-500 py-10">No hay sitios de noticias configurados en esta categoría.</p>
         )}
      </div>
    </div>
  );
};

export default NewsWebsites;