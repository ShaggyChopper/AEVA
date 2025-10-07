
import React from 'react';
import type { Transaction, ExpenseCategory } from '../types';
import { EXPENSE_CATEGORIES } from '../constants';

interface CategorySelectorModalProps {
  transaction: Transaction;
  onCategorySelected: (transactionId: string, category: ExpenseCategory) => void;
  onClose: () => void;
}

const CategorySelectorModal: React.FC<CategorySelectorModalProps> = ({ transaction, onCategorySelected, onClose }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-40 p-4">
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-md p-6 transform transition-all animate-in fade-in-0 zoom-in-95">
        <div className="text-center">
            <h2 className="text-xl font-bold text-slate-800 dark:text-white">New Item Detected!</h2>
            <p className="mt-2 text-slate-600 dark:text-slate-300">
                What category does <span className="font-bold text-blue-500">"{transaction.name}"</span> belong to?
            </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-6">
          {EXPENSE_CATEGORIES.map((category) => (
            <button
              key={category}
              onClick={() => onCategorySelected(transaction.id, category)}
              className="px-4 py-3 text-sm font-medium bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-lg hover:bg-blue-500 hover:text-white dark:hover:bg-blue-500 transition-colors"
            >
              {category}
            </button>
          ))}
        </div>

        <div className="mt-6 text-center">
            <button
                onClick={onClose}
                className="text-sm text-slate-500 dark:text-slate-400 hover:underline"
            >
                Skip for now (categorize as 'Others')
            </button>
        </div>
      </div>
    </div>
  );
};

export default CategorySelectorModal;
