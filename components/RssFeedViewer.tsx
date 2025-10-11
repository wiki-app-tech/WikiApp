import React, { useState, useEffect } from 'react';
import { RssArticle, NewsSource } from '../types';

const CORS_PROXY = 'https://api.codetabs.com/v1/proxy?quest=';
const ARTICLES_PER_PAGE = 5; // Número de artículos por página

const ExternalLinkIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className} width="24" height="24" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" fill="none" strokeLinecap="round" strokeLinejoin="round">
    <path stroke="none" d="M0 0h24v24H0z" fill="none"></path>
    <path d="M12 6h-6a2 2 0 0 0 -2 2v10a2 2 0 0 0 2 2h10a2 2 0 0 0 2 -2v-6"></path>
    <path d="M11 13l9 -9"></path>
    <path d="M15 4h5v5"></path>
  </svg>
);

const SkeletonArticle: React.FC = () => (
    <div className="bg-slate-900/50 p-4 rounded-lg animate-pulse">
        <div className="h-4 bg-slate-700 rounded w-3/4 mb-2"></div>
        <div className="h-3 bg-slate-700 rounded w-1/2 mb-4"></div>
        <div className="h-3 bg-slate-700 rounded w-full mb-1"></div>
        <div className="h-3 bg-slate-700 rounded w-full mb-1"></div>
        <div className="h-3 bg-slate-700 rounded w-5/6"></div>
    </div>
);

interface RssFeedViewerProps {
  source: NewsSource;
}

const RssFeedViewer: React.FC<RssFeedViewerProps> = ({ source }) => {
  const [articles, setArticles] = useState<RssArticle[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState<number>(1);

  useEffect(() => {
    if (!source.rssUrl) {
      setError('No hay URL de RSS configurada para esta fuente.');
      setIsLoading(false);
      return;
    }

    const fetchFeed = async () => {
      setIsLoading(true);
      setError(null);
      setCurrentPage(1); // Reset page on new source
      try {
        const response = await fetch(`${CORS_PROXY}${encodeURIComponent(source.rssUrl!)}`);
        if (!response.ok) {
          throw new Error(`Error al obtener el feed: ${response.statusText}`);
        }
        const text = await response.text();
        const parser = new window.DOMParser();
        const xml = parser.parseFromString(text, 'text/xml');
        
        const errorNode = xml.querySelector('parsererror');
        if (errorNode) {
            console.error("Error parsing XML:", errorNode.textContent);
            throw new Error('No se pudo procesar el feed de noticias. Puede que no esté disponible temporalmente.');
        }

        const items = Array.from(xml.querySelectorAll('item'));
        const parsedArticles: RssArticle[] = items.map(item => {
          const description = item.querySelector('description')?.textContent || '';
          // Remove CDATA tags if present
          const cleanDescription = description.replace('<![CDATA[', '').replace(']]>', '');
          
          return {
            title: item.querySelector('title')?.textContent?.trim() || 'Sin título',
            link: item.querySelector('link')?.textContent || '#',
            pubDate: item.querySelector('pubDate')?.textContent,
            description: cleanDescription,
          };
        });

        setArticles(parsedArticles);
      } catch (err) {
        console.error(err);
        setError(err instanceof Error ? err.message : 'Ocurrió un error desconocido.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchFeed();
  }, [source.rssUrl, source.name]);

  // Pagination logic
  const totalPages = Math.ceil(articles.length / ARTICLES_PER_PAGE);
  const paginatedArticles = articles.slice(
    (currentPage - 1) * ARTICLES_PER_PAGE,
    currentPage * ARTICLES_PER_PAGE
  );

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  // Helper to strip HTML from description for a cleaner preview
  const stripHtml = (html: string) => {
    const doc = new DOMParser().parseFromString(html, 'text/html');
    return doc.body.textContent || "";
  };
  
  return (
    <div className="p-4 sm:p-6 max-w-4xl mx-auto">
      <div className="flex items-center mb-6">
        <img src={source.logo} alt={`${source.name} logo`} className="w-16 h-16 rounded-md mr-4 object-contain bg-white p-1" />
        <div>
            <h2 className="text-3xl font-bold text-white">{source.name}</h2>
            <p className="text-gray-400">Últimas noticias del feed RSS</p>
        </div>
      </div>

      {isLoading && (
        <div className="space-y-4">
          {Array.from({ length: ARTICLES_PER_PAGE }).map((_, i) => <SkeletonArticle key={i} />)}
        </div>
      )}

      {error && <p className="text-center text-red-500 py-10">{error}</p>}
      
      {!isLoading && !error && articles.length === 0 && (
          <p className="text-center text-gray-500 py-10">No se encontraron artículos en el feed.</p>
      )}

      {!isLoading && !error && paginatedArticles.length > 0 && (
        <>
            <div className="space-y-4">
            {paginatedArticles.map((article, index) => (
                <div key={index} className="bg-slate-800/80 backdrop-blur-sm border border-slate-700 rounded-lg p-4 shadow-lg group">
                <a href={article.link} target="_blank" rel="noopener noreferrer" className="hover:text-yellow-500 transition-colors">
                    <h3 className="text-lg font-bold text-white group-hover:text-yellow-500">{article.title}</h3>
                </a>
                {article.pubDate && <p className="text-xs text-gray-500 mb-2">{new Date(article.pubDate).toLocaleString('es-AR')}</p>}
                {article.description && <p className="text-sm text-gray-400 line-clamp-3">{stripHtml(article.description)}</p>}
                <a 
                    href={article.link} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="text-yellow-600 hover:text-yellow-500 text-sm font-semibold mt-3 inline-flex items-center"
                >
                    Leer más <ExternalLinkIcon className="w-4 h-4 ml-1" />
                </a>
                </div>
            ))}
            </div>

            {totalPages > 1 && (
            <div className="flex justify-center items-center mt-6 space-x-2">
                <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="px-4 py-2 bg-slate-700 text-gray-200 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-600 transition-colors"
                >
                Anterior
                </button>
                <span className="text-gray-300 font-semibold">
                Página {currentPage} de {totalPages}
                </span>
                <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="px-4 py-2 bg-slate-700 text-gray-200 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-600 transition-colors"
                >
                Siguiente
                </button>
            </div>
            )}
        </>
      )}
    </div>
  );
};

export default RssFeedViewer;