import React from 'react';
import type { Transaction, ExpenseCategory } from '../types';
import { formatCurrency } from '../utils/currency';
import { TagIcon, PencilIcon } from './icons';
import TransactionFilters from './TransactionFilters';

interface TransactionListProps {
  transactions: Transaction[];
  onEdit: (transaction: Transaction) => void;
  primaryCurrency: string;
  categoryColors: Record<ExpenseCategory, string>;
  // Filter props
  searchTerm: string;
  onSearchChange: (value: string) => void;
  categories: ExpenseCategory[];
  categoryFilter: string;
  onCategoryChange: (value: string) => void;
  dateFilter: { startDate: string; endDate: string };
  onDateChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onResetFilters: () => void;
}

const TransactionList: React.FC<TransactionListProps> = ({ 
  transactions, 
  onEdit, 
  primaryCurrency,
  categoryColors,
  searchTerm,
  onSearchChange,
  categories,
  categoryFilter,
  onCategoryChange,
  dateFilter,
  onDateChange,
  onResetFilters,
}) => {
  return (
    <div className="bg-white dark:bg-[#1e1f20] p-6 rounded-2xl shadow-lg border border-transparent dark:border-[#444746]">
      <h2 className="text-2xl font-bold text-slate-800 dark:text-[#e3e3e3] mb-4">Recent Transactions</h2>

      <TransactionFilters
        searchTerm={searchTerm}
        onSearchChange={onSearchChange}
        categories={categories}
        categoryFilter={categoryFilter}
        onCategoryChange={onCategoryChange}
        dateFilter={dateFilter}
        onDateChange={onDateChange}
        onReset={onResetFilters}
      />
      
      <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2">
        {transactions.length > 0 ? (
          transactions.map((t) => (
            <div key={t.id} className="flex items-start justify-between p-3 bg-slate-50 dark:bg-[#282a2c] rounded-lg group animate-in fade-in-0">
              <div className="flex items-start gap-4">
                <div style={{ backgroundColor: `${categoryColors[t.category] || '#9CA3AF'}30` }} className="p-2 rounded-full mt-1">
                  <TagIcon className="h-5 w-5" style={{ color: categoryColors[t.category] || '#9CA3AF' }}/>
                </div>
                <div>
                  <p className="font-semibold text-slate-700 dark:text-[#e3e3e3]">{t.name}</p>
                  <p className="text-sm text-slate-500 dark:text-[#9aa0a6]">{t.merchant} &middot; {t.date}</p>
                  {t.tags && t.tags.length > 0 && (
                    <div className="mt-1.5 flex flex-wrap gap-1.5">
                        {t.tags.map(tag => (
                            <span key={tag} className="text-xs font-medium px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 dark:bg-[#8ab4f8]/20 dark:text-[#8ab4f8]">
                                {tag}
                            </span>
                        ))}
                    </div>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-4 flex-shrink-0">
                <div className="text-right">
                  <p className={`font-bold text-lg ${t.category === 'Income' ? 'text-green-500' : 'text-red-500'}`}>
                    {t.category === 'Income' ? '+' : '-'}{formatCurrency(t.amount, primaryCurrency)}
                  </p>
                   {t.originalCurrency !== primaryCurrency && (
                     <p className="text-xs text-slate-500 dark:text-[#9aa0a6]">
                       (was {formatCurrency(t.originalAmount, t.originalCurrency)})
                     </p>
                   )}
                  <span 
                    className="text-xs font-medium px-2 py-0.5 rounded-full mt-1 inline-block"
                    style={{ backgroundColor: `${categoryColors[t.category] || '#9CA3AF'}30`, color: categoryColors[t.category] || '#9CA3AF' }}
                  >
                    {t.category}
                  </span>
                </div>
                <button 
                    onClick={() => onEdit(t)}
                    className="opacity-0 group-hover:opacity-100 transition-opacity p-2 rounded-full hover:bg-slate-200 dark:hover:bg-[#3c4043]"
                    aria-label={`Edit transaction for ${t.name}`}
                >
                    <PencilIcon className="h-5 w-5 text-slate-500 dark:text-[#9aa0a6]" />
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-10 text-slate-500 dark:text-[#9aa0a6]">
            <p>No transactions match your filters.</p>
            <p className="text-sm">Try adjusting your search or resetting the filters.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default TransactionList;
