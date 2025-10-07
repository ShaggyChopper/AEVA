import React from 'react';
import type { ExpenseCategory } from '../types';
import { MagnifyingGlassIcon, XMarkIcon } from './icons';

interface TransactionFiltersProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  categories: ExpenseCategory[];
  categoryFilter: string;
  onCategoryChange: (value: string) => void;
  dateFilter: { startDate: string; endDate: string };
  onDateChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onReset: () => void;
}

const TransactionFilters: React.FC<TransactionFiltersProps> = ({
  searchTerm,
  onSearchChange,
  categories,
  categoryFilter,
  onCategoryChange,
  dateFilter,
  onDateChange,
  onReset
}) => {
  return (
    <div className="mb-4 p-4 bg-slate-50 dark:bg-[#282a2c]/50 rounded-lg">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
        <div className="relative col-span-1 md:col-span-2 lg:col-span-1">
          <label htmlFor="search" className="block text-sm font-medium text-slate-700 dark:text-[#9aa0a6]">Search</label>
          <MagnifyingGlassIcon className="pointer-events-none w-5 h-5 absolute top-9 transform -translate-y-1/2 left-3 text-slate-400" />
          <input
            type="search"
            id="search"
            placeholder="Name, merchant, or tag..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="mt-1 block w-full pl-10 pr-3 py-2 bg-white dark:bg-[#131314] border border-slate-300 dark:border-[#444746] rounded-md shadow-sm focus:outline-none focus:ring-[#8ab4f8] focus:border-[#8ab4f8] sm:text-sm"
          />
        </div>

        <div>
          <label htmlFor="category" className="block text-sm font-medium text-slate-700 dark:text-[#9aa0a6]">Category</label>
          <select
            id="category"
            value={categoryFilter}
            onChange={(e) => onCategoryChange(e.target.value)}
            className="mt-1 block w-full px-3 py-2 bg-white dark:bg-[#131314] border border-slate-300 dark:border-[#444746] rounded-md shadow-sm focus:outline-none focus:ring-[#8ab4f8] focus:border-[#8ab4f8] sm:text-sm"
          >
            <option value="">All Categories</option>
            {categories.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div>
            <label htmlFor="startDate" className="block text-sm font-medium text-slate-700 dark:text-[#9aa0a6]">From</label>
            <input
              type="date"
              id="startDate"
              name="startDate"
              value={dateFilter.startDate}
              onChange={onDateChange}
              className="mt-1 block w-full px-3 py-2 bg-white dark:bg-[#131314] border border-slate-300 dark:border-[#444746] rounded-md shadow-sm focus:outline-none focus:ring-[#8ab4f8] focus:border-[#8ab4f8] sm:text-sm"
            />
          </div>
          <div>
            <label htmlFor="endDate" className="block text-sm font-medium text-slate-700 dark:text-[#9aa0a6]">To</label>
            <input
              type="date"
              id="endDate"
              name="endDate"
              value={dateFilter.endDate}
              onChange={onDateChange}
              className="mt-1 block w-full px-3 py-2 bg-white dark:bg-[#131314] border border-slate-300 dark:border-[#444746] rounded-md shadow-sm focus:outline-none focus:ring-[#8ab4f8] focus:border-[#8ab4f8] sm:text-sm"
            />
          </div>
        </div>

        <div>
          <button
            onClick={onReset}
            className="w-full flex justify-center items-center gap-2 bg-slate-200 dark:bg-[#3c4043] text-slate-700 dark:text-[#e3e3e3] font-semibold py-2 px-4 rounded-lg shadow-sm hover:bg-slate-300 dark:hover:bg-[#444746] transition-all"
          >
            <XMarkIcon className="h-5 w-5" />
            Reset Filters
          </button>
        </div>
      </div>
    </div>
  );
};

export default TransactionFilters;