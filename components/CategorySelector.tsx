import React from 'react';
import { Link } from 'react-router-dom';
import { NewsCategory } from '../types';

interface CategorySelectorProps {
  title: string;
  basePath: string;
}

const CategorySelector: React.FC<CategorySelectorProps> = ({ title, basePath }) => {
  const categories = Object.values(NewsCategory);

  return (
    <div className="p-4 sm:p-6">
      <h2 className="text-2xl font-bold text-white mb-6 text-center border-b-2 border-yellow-600/50 pb-2 max-w-lg mx-auto">{title}</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 max-w-5xl mx-auto">
        {categories.map((category) => (
          <Link
            key={category}
            to={`${basePath}/${encodeURIComponent(category)}`}
            className="w-full text-center bg-slate-700 text-gray-200 font-semibold py-4 px-6 rounded-lg shadow-md hover:bg-yellow-600 hover:text-slate-900 transition-colors duration-300 transform hover:scale-105"
          >
            {category}
          </Link>
        ))}
      </div>
    </div>
  );
};

export default CategorySelector;