import React from 'react';
import { cn } from '../utils/utils';
import * as Icons from 'lucide-react';

interface CategoryCardProps {
  category: {
    id: string;
    name: string;
    icon: string;
  };
  isActive?: boolean;
  onClick: () => void;
}

const CategoryCard: React.FC<CategoryCardProps> = ({ category, isActive, onClick }) => {
  // Dynamically get the icon component if it exists in lucide-react
  const IconComponent = (Icons as any)[category.icon] || Icons.Package;

  return (
    <button
      onClick={onClick}
      className={cn(
        'flex flex-col items-center justify-center gap-2 p-3 sm:p-6 rounded-lg sm:rounded-2xl border transition-all w-full aspect-square group',
        isActive 
          ? 'bg-indigo-600 border-indigo-500 text-white shadow-lg shadow-indigo-500/20' 
          : 'bg-white dark:bg-slate-900 border-gray-100 dark:border-slate-800 text-gray-600 dark:text-slate-400 hover:border-indigo-200 dark:hover:border-indigo-900 hover:bg-indigo-50/30 dark:hover:bg-indigo-950/20'
      )}
    >
      <div className={cn(
        'w-8 h-8 sm:w-12 sm:h-12 rounded-md sm:rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110',
        isActive ? 'bg-white/20' : 'bg-gray-50 dark:bg-slate-800'
      )}>
        {/* If icon is an emoji, show it directly, otherwise show the icon component */}
        {category.icon.length <= 2 ? (
          <span className="text-xl sm:text-2xl">{category.icon}</span>
        ) : (
          <IconComponent className={cn('w-4 h-4 sm:w-6 sm:h-6', isActive ? 'text-white' : 'text-indigo-600')} />
        )}
      </div>
      <span className="text-[10px] sm:text-sm font-bold text-center leading-tight">{category.name}</span>
    </button>
  );
};

export default CategoryCard;
