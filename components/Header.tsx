import React from 'react';

const Header: React.FC = () => {
  return (
    <header className="bg-slate-800 shadow-lg border-t-4 border-yellow-600">
      <div className="max-w-7xl mx-auto py-3 px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-center relative">
            <h1 className="text-2xl sm:text-3xl font-bold leading-tight text-white text-center">
              Portal de Noticias TDF
            </h1>
        </div>
      </div>
    </header>
  );
};

export default Header;