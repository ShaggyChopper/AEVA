import React, { useState, useEffect } from 'react';
import type { ExpenseCategory, Budgets } from '../types';
import { SUPPORTED_CURRENCIES } from '../constants';
import { XMarkIcon } from './icons';

interface SetBudgetsModalProps {
    categories: ExpenseCategory[];
    budgets: Budgets;
    onSave: (budgets: Budgets) => void;
    onClose: () => void;
    primaryCurrency: string;
}

const SetBudgetsModal: React.FC<SetBudgetsModalProps> = ({
    categories,
    budgets,
    onSave,
    onClose,
    primaryCurrency,
}) => {
    const [localBudgets, setLocalBudgets] = useState<Budgets>({});

    useEffect(() => {
        // Initialize local state with existing budgets, ensuring all categories have an entry.
        const initialBudgets: Budgets = {};
        categories.forEach(cat => {
            initialBudgets[cat] = budgets[cat] || 0;
        });
        setLocalBudgets(initialBudgets);
    }, [budgets, categories]);

    const handleChange = (category: ExpenseCategory, value: string) => {
        const amount = parseFloat(value);
        setLocalBudgets(prev => ({
            ...prev,
            [category]: isNaN(amount) ? 0 : amount,
        }));
    };

    const handleSave = () => {
        // Filter out zero/empty budgets before saving
        const budgetsToSave: Budgets = {};
        for (const category in localBudgets) {
            if (localBudgets[category] > 0) {
                budgetsToSave[category] = localBudgets[category];
            }
        }
        onSave(budgetsToSave);
    };

    const currencySymbol = SUPPORTED_CURRENCIES[primaryCurrency]?.symbol || primaryCurrency;

    return (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-40 p-4" onClick={onClose}>
            <div
                className="bg-white dark:bg-[#1e1f20] rounded-2xl shadow-2xl w-full max-w-lg p-6 transform transition-all animate-in fade-in-0 zoom-in-95 flex flex-col border dark:border-[#444746]"
                onClick={e => e.stopPropagation()}
            >
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold text-slate-800 dark:text-[#e3e3e3]">Set Monthly Budgets</h2>
                    <button onClick={onClose} className="p-2 rounded-full hover:bg-slate-200 dark:hover:bg-[#3c4043]">
                        <XMarkIcon className="h-6 w-6 text-slate-500 dark:text-[#9aa0a6]" />
                    </button>
                </div>

                <p className="mb-4 text-sm text-slate-600 dark:text-[#9aa0a6]">
                    Set a monthly spending limit for each category. Leave as 0 to not track a budget.
                </p>

                <div className="space-y-3 flex-grow overflow-y-auto max-h-[50vh] pr-2">
                    {categories.map(category => (
                        <div key={category} className="flex items-center justify-between gap-4">
                            <label htmlFor={`budget-${category}`} className="font-medium text-slate-700 dark:text-[#e3e3e3]">{category}</label>
                            <div className="relative w-40">
                                <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-slate-500 dark:text-[#9aa0a6]">
                                    {currencySymbol}
                                 </span>
                                <input
                                    type="number"
                                    id={`budget-${category}`}
                                    value={localBudgets[category] || ''}
                                    onChange={(e) => handleChange(category, e.target.value)}
                                    placeholder="0.00"
                                    min="0"
                                    step="1"
                                    className="pl-7 block w-full px-3 py-2 bg-white dark:bg-[#282a2c] border border-slate-300 dark:border-[#444746] rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                />
                            </div>
                        </div>
                    ))}
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
                    Save Budgets
                    </button>
                </div>
            </div>
        </div>
    );
};

export default SetBudgetsModal;