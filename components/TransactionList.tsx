
import React from 'react';
import type { Transaction } from '../types';
import { CATEGORY_COLORS } from '../constants';
import { TagIcon } from './icons';

interface TransactionListProps {
  transactions: Transaction[];
}

const TransactionList: React.FC<TransactionListProps> = ({ transactions }) => {
  return (
    <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-lg">
      <h2 className="text-2xl font-bold text-slate-800 dark:text-white mb-4">Recent Transactions</h2>
      <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2">
        {transactions.length > 0 ? (
          transactions.map((t) => (
            <div key={t.id} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
              <div className="flex items-center gap-4">
                <div style={{ backgroundColor: `${CATEGORY_COLORS[t.category]}30` }} className="p-2 rounded-full">
                  <TagIcon className="h-5 w-5" style={{ color: CATEGORY_COLORS[t.category] }}/>
                </div>
                <div>
                  <p className="font-semibold text-slate-700 dark:text-slate-200">{t.name}</p>
                  <p className="text-sm text-slate-500 dark:text-slate-400">{t.date}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-bold text-lg text-red-500">-${t.amount.toFixed(2)}</p>
                <span 
                  className="text-xs font-medium px-2 py-0.5 rounded-full"
                  style={{ backgroundColor: `${CATEGORY_COLORS[t.category]}30`, color: CATEGORY_COLORS[t.category] }}
                >
                  {t.category}
                </span>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-10 text-slate-500 dark:text-slate-400">
            <p>No transactions yet.</p>
            <p className="text-sm">Upload a receipt to see your spending here.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default TransactionList;
