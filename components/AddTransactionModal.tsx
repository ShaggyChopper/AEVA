import React, { useState } from 'react';
import type { Transaction, ExpenseCategory } from '../types';
import { SUPPORTED_CURRENCIES } from '../constants';

interface AddTransactionModalProps {
  onSave: (data: Omit<Transaction, 'id' | 'amount'>) => void;
  onClose: () => void;
  categories: ExpenseCategory[];
}

const AddTransactionModal: React.FC<AddTransactionModalProps> = ({ onSave, onClose, categories }) => {
    const [type, setType] = useState<'expense' | 'income'>('expense');
    const [name, setName] = useState('');
    const [originalAmount, setOriginalAmount] = useState<number | ''>('');
    const [originalCurrency, setOriginalCurrency] = useState('USD');
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const [merchant, setMerchant] = useState('');
    const [category, setCategory] = useState(categories[0] || 'Others');
    const [tagsInput, setTagsInput] = useState('');
    
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (originalAmount === '' || originalAmount <= 0) return;

        const tags = tagsInput.split(',').map(tag => tag.trim()).filter(Boolean);
        
        onSave({
            name: name.trim(),
            originalAmount: originalAmount,
            originalCurrency,
            date,
            category: type === 'income' ? 'Income' : category,
            merchant: type === 'expense' ? merchant.trim() : 'Income',
            tags,
        });
    };

    return (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-40 p-4" onClick={onClose}>
            <div 
                className="bg-white dark:bg-[#1e1f20] rounded-2xl shadow-2xl w-full max-w-md p-6 transform transition-all animate-in fade-in-0 zoom-in-95 border dark:border-[#444746]"
                onClick={e => e.stopPropagation()}
            >
                <h2 className="text-xl font-bold text-slate-800 dark:text-[#e3e3e3] mb-4">Add Transaction</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    
                    {/* Type Selector */}
                    <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100 dark:bg-[#282a2c] rounded-lg">
                        <button type="button" onClick={() => setType('expense')} className={`px-4 py-2 text-sm font-semibold rounded-md transition-colors ${type === 'expense' ? 'bg-white dark:bg-[#3c4043] text-blue-600 dark:text-[#8ab4f8] shadow-sm' : 'text-slate-600 dark:text-[#9aa0a6]'}`}>
                            Expense
                        </button>
                        <button type="button" onClick={() => setType('income')} className={`px-4 py-2 text-sm font-semibold rounded-md transition-colors ${type === 'income' ? 'bg-white dark:bg-[#3c4043] text-green-600 dark:text-green-400 shadow-sm' : 'text-slate-600 dark:text-[#9aa0a6]'}`}>
                            Income
                        </button>
                    </div>

                    <div>
                        <label htmlFor="name" className="block text-sm font-medium text-slate-700 dark:text-[#9aa0a6]">{type === 'expense' ? 'Item Name' : 'Income Source'}</label>
                        <input
                            type="text"
                            name="name"
                            id="name"
                            value={name}
                            onChange={e => setName(e.target.value)}
                            className="mt-1 block w-full px-3 py-2 bg-white dark:bg-[#282a2c] border border-slate-300 dark:border-[#444746] rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                            required
                        />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label htmlFor="originalAmount" className="block text-sm font-medium text-slate-700 dark:text-[#9aa0a6]">Amount</label>
                            <input
                                type="number"
                                name="originalAmount"
                                id="originalAmount"
                                value={originalAmount}
                                onChange={e => setOriginalAmount(parseFloat(e.target.value) || '')}
                                step="0.01"
                                min="0.01"
                                className="mt-1 block w-full px-3 py-2 bg-white dark:bg-[#282a2c] border border-slate-300 dark:border-[#444746] rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                required
                            />
                        </div>
                        <div>
                            <label htmlFor="originalCurrency" className="block text-sm font-medium text-slate-700 dark:text-[#9aa0a6]">Currency</label>
                            <select
                                name="originalCurrency"
                                id="originalCurrency"
                                value={originalCurrency}
                                onChange={e => setOriginalCurrency(e.target.value)}
                                className="mt-1 block w-full px-3 py-2 bg-white dark:bg-[#282a2c] border border-slate-300 dark:border-[#444746] rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                            >
                                {Object.keys(SUPPORTED_CURRENCIES).map(code => (
                                    <option key={code} value={code}>{code}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {type === 'expense' && (
                        <>
                             <div>
                                <label htmlFor="merchant" className="block text-sm font-medium text-slate-700 dark:text-[#9aa0a6]">Merchant</label>
                                <input
                                    type="text"
                                    name="merchant"
                                    id="merchant"
                                    value={merchant}
                                    onChange={e => setMerchant(e.target.value)}
                                    className="mt-1 block w-full px-3 py-2 bg-white dark:bg-[#282a2c] border border-slate-300 dark:border-[#444746] rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                />
                            </div>
                            <div>
                                <label htmlFor="category" className="block text-sm font-medium text-slate-700 dark:text-[#9aa0a6]">Category</label>
                                <select
                                    name="category"
                                    id="category"
                                    value={category}
                                    onChange={e => setCategory(e.target.value)}
                                    className="mt-1 block w-full px-3 py-2 bg-white dark:bg-[#282a2c] border border-slate-300 dark:border-[#444746] rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                >
                                {categories.map(cat => (
                                    <option key={cat} value={cat}>{cat}</option>
                                ))}
                                </select>
                            </div>
                        </>
                    )}

                    <div>
                        <label htmlFor="date" className="block text-sm font-medium text-slate-700 dark:text-[#9aa0a6]">Date</label>
                        <input
                            type="date"
                            name="date"
                            id="date"
                            value={date}
                            onChange={e => setDate(e.target.value)}
                            className="mt-1 block w-full px-3 py-2 bg-white dark:bg-[#282a2c] border border-slate-300 dark:border-[#444746] rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                        />
                    </div>
                
                    <div>
                        <label htmlFor="tags" className="block text-sm font-medium text-slate-700 dark:text-[#9aa0a6]">Tags (optional)</label>
                        <input
                            type="text"
                            name="tags"
                            id="tags"
                            value={tagsInput}
                            onChange={e => setTagsInput(e.target.value)}
                            placeholder="e.g. work, project-x, reimbursable"
                            className="mt-1 block w-full px-3 py-2 bg-white dark:bg-[#282a2c] border border-slate-300 dark:border-[#444746] rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                        />
                        <p className="text-xs text-slate-500 dark:text-[#9aa0a6] mt-1">Comma-separated values.</p>
                    </div>

                    <div className="flex justify-end gap-3 pt-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 text-sm font-medium text-slate-700 dark:text-[#e3e3e3] bg-slate-100 dark:bg-[#3c4043] rounded-md hover:bg-slate-200 dark:hover:bg-[#444746]"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 dark:bg-[#8ab4f8] dark:text-[#202124] rounded-md hover:bg-blue-700 dark:hover:bg-[#9ac0fa]"
                        >
                            Save Transaction
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AddTransactionModal;
