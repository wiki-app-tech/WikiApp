import React from 'react';
import { Routes, Route, useLocation, useNavigate, useParams } from 'react-router-dom';
import { NewsCategory } from './types';
import { NEWS_SITES } from './constants';
import Header from './components/Header';
import MainMenu from './components/MainMenu';
import CategorySelector from './components/CategorySelector';
import PrintEdition from './components/NewspaperCovers';
import NewsWebsites from './components/NewsWebsites';
import Statistics from './components/Statistics';
import Elections from './components/Elections';
import RssFeedViewer from './components/RssFeedViewer';
import TelegramFeed from './components/TelegramFeed';

const PrintEditionWrapper: React.FC = () => {
    const { category: categoryStr } = useParams<{ category: string }>();
    if (!categoryStr) return null;
    const category = decodeURIComponent(categoryStr) as NewsCategory;
    return <PrintEdition category={category} />;
};

const NewsWebsitesWrapper: React.FC = () => {
    const { category: categoryStr } = useParams<{ category: string }>();
    if (!categoryStr) return null;
    const category = decodeURIComponent(categoryStr) as NewsCategory;
    return <NewsWebsites category={category} />;
};

const RssFeedViewerWrapper: React.FC = () => {
    const { category: categoryStr, source: sourceName } = useParams<{ category: string; source: string }>();
    if (!categoryStr || !sourceName) return null;
    
    const category = decodeURIComponent(categoryStr) as NewsCategory;
    const decodedSourceName = decodeURIComponent(sourceName);

    const source = NEWS_SITES[category]?.find(s => s.name === decodedSourceName);
    
    if (source) {
        return <RssFeedViewer source={source} />;
    }
    
    return <p className="p-8 text-center text-red-500">Fuente de noticias no encontrada.</p>;
};

const App: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const handleGoBack = () => {
    const pathSegments = location.pathname.split('/').filter(Boolean);

    // If there is one segment (e.g., /print-edition) or none, go to home.
    if (pathSegments.length <= 1) {
      navigate('/');
    } else {
      // Go up one level in the path hierarchy.
      const parentPath = '/' + pathSegments.slice(0, -1).join('/');
      navigate(parentPath);
    }
  };

  const showBackButton = location.pathname !== '/';

  return (
    <div className="min-h-screen text-gray-200 transition-colors duration-300">
      <Header />
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {showBackButton && (
          <div className="px-4 pb-4">
            <button
              onClick={handleGoBack}
              className="bg-slate-700 text-yellow-600 font-bold py-2 px-4 rounded-lg hover:bg-slate-600 transition-colors"
            >
              &larr; Volver
            </button>
          </div>
        )}
        <div className="bg-slate-900/80 backdrop-blur-sm rounded-lg border border-slate-700 min-h-[60vh]">
          <Routes>
            <Route path="/" element={<MainMenu />} />
            <Route path="/print-edition" element={<CategorySelector title="Edición Impresa" basePath="/print-edition" />} />
            <Route path="/print-edition/:category" element={<PrintEditionWrapper />} />
            <Route path="/news-sites" element={<CategorySelector title="Sitios Web de Noticias" basePath="/news-sites" />} />
            <Route path="/news-sites/:category" element={<NewsWebsitesWrapper />} />
            <Route path="/news-sites/:category/:source" element={<RssFeedViewerWrapper />} />
            <Route path="/stats" element={<Statistics />} />
            <Route path="/elections" element={<Elections />} />
            <Route path="/telegram" element={<TelegramFeed />} />
          </Routes>
        </div>
      </main>
      <footer className="text-center py-4 text-sm text-gray-400">
          <p>Desarrollado con React, Tailwind CSS y Gemini AI.</p>
          <p className="mt-2 max-w-3xl mx-auto px-4">
            Disclaimer: El contenido y las imágenes de las tapas son propiedad de los respectivos diarios. Esta aplicación muestra dicho contenido con fines informativos y de fácil acceso.
          </p>
      </footer>
    </div>
  );
};

export default App;