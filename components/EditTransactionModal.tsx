import React, { useState, useEffect } from 'react';
import type { Transaction, ExpenseCategory } from '../types';
import { SUPPORTED_CURRENCIES } from '../constants';

interface EditTransactionModalProps {
  transaction: Transaction;
  onUpdate: (transaction: Transaction) => void;
  onClose: () => void;
  categories: ExpenseCategory[];
}

const EditTransactionModal: React.FC<EditTransactionModalProps> = ({ transaction, onUpdate, onClose, categories }) => {
  const [formData, setFormData] = useState<Transaction>(transaction);
  const [tagsInput, setTagsInput] = useState<string>(transaction.tags?.join(', ') || '');


  useEffect(() => {
    setFormData(transaction);
    setTagsInput(transaction.tags?.join(', ') || '');
  }, [transaction]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    const isNumeric = ['originalAmount'].includes(name);

    setFormData(prev => ({
      ...prev,
      [name]: isNumeric ? parseFloat(value) || 0 : value,
    }));
  };

  const handleTagsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTagsInput(e.target.value);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const tags = tagsInput.split(',').map(tag => tag.trim()).filter(Boolean);
    onUpdate({ ...formData, tags });
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-40 p-4" onClick={onClose}>
      <div 
        className="bg-white dark:bg-[#1e1f20] rounded-2xl shadow-2xl w-full max-w-md p-6 transform transition-all animate-in fade-in-0 zoom-in-95 border dark:border-[#444746]"
        onClick={e => e.stopPropagation()}
      >
        <h2 className="text-xl font-bold text-slate-800 dark:text-[#e3e3e3] mb-4">Edit Transaction</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-slate-700 dark:text-[#9aa0a6]">Item Name</label>
            <input
              type="text"
              name="name"
              id="name"
              value={formData.name}
              onChange={handleChange}
              className="mt-1 block w-full px-3 py-2 bg-white dark:bg-[#282a2c] border border-slate-300 dark:border-[#444746] rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
                <label htmlFor="originalAmount" className="block text-sm font-medium text-slate-700 dark:text-[#9aa0a6]">Original Amount</label>
                <input
                    type="number"
                    name="originalAmount"
                    id="originalAmount"
                    value={formData.originalAmount}
                    onChange={handleChange}
                    step="0.01"
                    className="mt-1 block w-full px-3 py-2 bg-white dark:bg-[#282a2c] border border-slate-300 dark:border-[#444746] rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />
            </div>
             <div>
                <label htmlFor="originalCurrency" className="block text-sm font-medium text-slate-700 dark:text-[#9aa0a6]">Currency</label>
                 <select
                    name="originalCurrency"
                    id="originalCurrency"
                    value={formData.originalCurrency}
                    onChange={handleChange}
                    className="mt-1 block w-full px-3 py-2 bg-white dark:bg-[#282a2c] border border-slate-300 dark:border-[#444746] rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    >
                    {Object.keys(SUPPORTED_CURRENCIES).map(code => (
                        <option key={code} value={code}>{code}</option>
                    ))}
                </select>
            </div>
          </div>
           <div>
                <label htmlFor="date" className="block text-sm font-medium text-slate-700 dark:text-[#9aa0a6]">Date</label>
                <input
                type="date"
                name="date"
                id="date"
                value={formData.date}
                onChange={handleChange}
                className="mt-1 block w-full px-3 py-2 bg-white dark:bg-[#282a2c] border border-slate-300 dark:border-[#444746] rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />
            </div>
          <div>
            <label htmlFor="merchant" className="block text-sm font-medium text-slate-700 dark:text-[#9aa0a6]">Merchant</label>
            <input
              type="text"
              name="merchant"
              id="merchant"
              value={formData.merchant}
              onChange={handleChange}
              className="mt-1 block w-full px-3 py-2 bg-white dark:bg-[#282a2c] border border-slate-300 dark:border-[#444746] rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            />
          </div>
          <div>
            <label htmlFor="category" className="block text-sm font-medium text-slate-700 dark:text-[#9aa0a6]">Category</label>
            <select
              name="category"
              id="category"
              value={formData.category}
              onChange={handleChange}
              className="mt-1 block w-full px-3 py-2 bg-white dark:bg-[#282a2c] border border-slate-300 dark:border-[#444746] rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            >
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
                <option value="Income">Income</option>
                <option value="Others">Others</option>
            </select>
          </div>
          <div>
            <label htmlFor="tags" className="block text-sm font-medium text-slate-700 dark:text-[#9aa0a6]">Tags</label>
            <input
              type="text"
              name="tags"
              id="tags"
              value={tagsInput}
              onChange={handleTagsChange}
              placeholder="e.g. chicken, groceries, weekend"
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
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditTransactionModal;