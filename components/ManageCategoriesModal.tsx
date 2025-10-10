import React, { useState, useEffect } from 'react';
import type { ExpenseCategory, CategoryRuleMap, Rule503020Bucket } from '../types';
import { XMarkIcon, PlusIcon, TrashIcon } from './icons';
import { RULE_50_30_20_BUCKETS } from '../constants';

interface ManageCategoriesModalProps {
  categories: ExpenseCategory[];
  categoryRuleMap: CategoryRuleMap;
  onSave: (newCategories: ExpenseCategory[], newRuleMap: CategoryRuleMap) => void;
  onClose: () => void;
}

const MAX_CATEGORIES = 15;

const ManageCategoriesModal: React.FC<ManageCategoriesModalProps> = ({ categories, categoryRuleMap, onSave, onClose }) => {
  const [localCategories, setLocalCategories] = useState<ExpenseCategory[]>(categories.filter(c => c !== 'Others'));
  const [localRuleMap, setLocalRuleMap] = useState<CategoryRuleMap>(categoryRuleMap);
  const [newCategory, setNewCategory] = useState('');

  const isCategoryLimitReached = localCategories.length >= MAX_CATEGORIES;

  useEffect(() => {
    setLocalCategories(categories.filter(c => c !== 'Others'));
    setLocalRuleMap(categoryRuleMap);
  }, [categories, categoryRuleMap]);


  const handleAddCategory = () => {
    if (isCategoryLimitReached) return;

    if (newCategory && !localCategories.includes(newCategory) && newCategory !== 'Others' && newCategory !== 'Income') {
      const newCategoryName = newCategory.trim();
      setLocalCategories([...localCategories, newCategoryName]);
      setLocalRuleMap(prev => ({...prev, [newCategoryName]: 'Wants'})); // Default new categories to 'Wants'
      setNewCategory('');
    }
  };

  const handleRemoveCategory = (categoryToRemove: ExpenseCategory) => {
    setLocalCategories(localCategories.filter(c => c !== categoryToRemove));
    const newRuleMap = {...localRuleMap};
    delete newRuleMap[categoryToRemove];
    setLocalRuleMap(newRuleMap);
  };

  const handleRuleChange = (category: ExpenseCategory, bucket: Rule503020Bucket) => {
      setLocalRuleMap(prev => ({...prev, [category]: bucket}));
  };
    
  const handleSave = () => {
    onSave([...localCategories, 'Others'], localRuleMap); // Ensure 'Others' is always present
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-40 p-4" onClick={onClose}>
      <div 
        className="bg-white dark:bg-[#1e1f20] rounded-2xl shadow-2xl w-full max-w-lg p-6 transform transition-all animate-in fade-in-0 zoom-in-95 flex flex-col border dark:border-[#444746]"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-4">
             <h2 className="text-xl font-bold text-slate-800 dark:text-[#e3e3e3]">Manage Categories</h2>
            <button onClick={onClose} className="p-2 rounded-full hover:bg-slate-200 dark:hover:bg-[#3c4043]">
                <XMarkIcon className="h-6 w-6 text-slate-500 dark:text-[#9aa0a6]"/>
            </button>
        </div>
        
        <div className="space-y-3 flex-grow overflow-y-auto max-h-[50vh] pr-2">
            {localCategories.map(cat => (
                <div key={cat} className="flex items-center justify-between bg-slate-100 dark:bg-[#282a2c] p-2 rounded-md gap-2">
                    <span className="text-slate-700 dark:text-[#e3e3e3] flex-grow">{cat}</span>
                    <select
                        value={localRuleMap[cat] || 'Wants'}
                        onChange={(e) => handleRuleChange(cat, e.target.value as Rule503020Bucket)}
                        className="block w-32 px-2 py-1 bg-white dark:bg-[#131314] border border-slate-300 dark:border-[#444746] rounded-md shadow-sm focus:outline-none focus:ring-[#8ab4f8] focus:border-[#8ab4f8] sm:text-sm"
                    >
                        {RULE_50_30_20_BUCKETS.map(bucket => (
                            <option key={bucket} value={bucket}>{bucket}</option>
                        ))}
                    </select>
                    <button onClick={() => handleRemoveCategory(cat)} className="p-1 rounded-full hover:bg-red-100 dark:hover:bg-red-900/50">
                        <TrashIcon className="h-5 w-5 text-red-500 dark:text-red-400" />
                    </button>
                </div>
            ))}
        </div>

        <div className="flex flex-col">
            <div className="flex gap-2 mt-4 pt-4 border-t border-slate-200 dark:border-[#444746]">
                <input
                    type="text"
                    value={newCategory}
                    onChange={e => setNewCategory(e.target.value)}
                    placeholder={isCategoryLimitReached ? "Category limit reached" : "New category name..."}
                    className="flex-grow block w-full px-3 py-2 bg-white dark:bg-[#282a2c] border border-slate-300 dark:border-[#444746] rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm disabled:opacity-50"
                    disabled={isCategoryLimitReached}
                />
                <button 
                    onClick={handleAddCategory} 
                    className="p-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 dark:bg-[#8ab4f8] dark:text-[#202124] dark:hover:bg-[#9ac0fa] disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={isCategoryLimitReached || !newCategory.trim()}
                    aria-label="Add new category"
                >
                    <PlusIcon className="h-6 w-6" />
                </button>
            </div>
            {isCategoryLimitReached && (
                <p className="text-xs text-amber-600 dark:text-amber-400 text-center mt-2">
                    You have reached the maximum of {MAX_CATEGORIES} custom categories.
                </p>
            )}
        </div>


        <div className="flex justify-end gap-3 pt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-slate-700 dark:text-[#e3e3e3] bg-slate-100 dark:bg-[#3c4043] rounded-md hover:bg-slate-200 dark:hover:bg-[#444746]"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 dark:bg-[#8ab4f8] dark:text-[#202124] rounded-md hover:bg-blue-700 dark:hover:bg-[#9ac0fa]"
            >
              Save Categories
            </button>
        </div>
      </div>
    </div>
  );
};

export default ManageCategoriesModal;