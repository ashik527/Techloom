import React from 'react';
import { Search } from 'lucide-react';

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

const SearchBar: React.FC<SearchBarProps> = ({ value, onChange, placeholder = "Enter product name..." }) => {
  return (
    <div className="relative w-full max-w-2xl mx-auto">
      <div className="absolute inset-y-0 left-0 pl-6 flex items-center pointer-events-none">
        <Search className="h-5 w-5 text-gray-400" />
      </div>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="block w-full pl-14 pr-6 py-5 bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 rounded-[2rem] text-gray-900 dark:text-white placeholder-gray-300 dark:placeholder-gray-600 focus:outline-none focus:ring-4 focus:ring-indigo-50/50 dark:focus:ring-indigo-900/20 focus:border-indigo-200 dark:focus:border-indigo-800 transition-all shadow-xl shadow-indigo-50/50 dark:shadow-black/50"
        placeholder={placeholder}
      />
    </div>
  );
};

export default SearchBar;
