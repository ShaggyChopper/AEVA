import React from 'react';
import type { Transaction, ExpenseCategory } from '../types';

interface CategorySelectorModalProps {
  transaction: Omit<Transaction, 'category'>;
  onCategorySelected: (transactionId: string, category: ExpenseCategory) => void;
  onClose: () => void;
  categories: ExpenseCategory[];
}

const CategorySelectorModal: React.FC<CategorySelectorModalProps> = ({ transaction, onCategorySelected, onClose, categories }) => {
  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-40 p-4">
      <div className="bg-white dark:bg-[#1e1f20] rounded-2xl shadow-2xl w-full max-w-md p-6 transform transition-all animate-in fade-in-0 zoom-in-95 border dark:border-[#444746]">
        <div className="text-center">
            <h2 className="text-xl font-bold text-slate-800 dark:text-[#e3e3e3]">New Item Detected!</h2>
            <p className="mt-2 text-slate-600 dark:text-[#9aa0a6]">
                What category does <span className="font-bold text-blue-500 dark:text-[#8ab4f8]">"{transaction.name}"</span> belong to?
            </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-6 max-h-60 overflow-y-auto">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => onCategorySelected(transaction.id, category)}
              className="px-4 py-3 text-sm font-medium bg-slate-100 dark:bg-[#282a2c] text-slate-700 dark:text-[#e3e3e3] rounded-lg hover:bg-blue-500 hover:text-white dark:hover:bg-[#8ab4f8] dark:hover:text-[#202124] transition-colors"
            >
              {category}
            </button>
          ))}
        </div>

        <div className="mt-6 text-center">
            <button
                onClick={onClose}
                className="text-sm text-slate-500 dark:text-[#9aa0a6] hover:underline"
            >
                Skip for now (categorize as 'Others')
            </button>
        </div>
      </div>
    </div>
  );
};

export default CategorySelectorModal;