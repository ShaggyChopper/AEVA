import React from 'react';
import { WalletIcon, GlobeAltIcon, Cog6ToothIcon, PiggyBankIcon, PlusCircleIcon } from './icons';
import { SUPPORTED_CURRENCIES } from '../constants';

interface HeaderProps {
    primaryCurrency: string;
    onCurrencyChange: (newCurrency: string) => void;
    onManageCategoriesClick: () => void;
    onSetBudgetsClick: () => void;
    onAddTransactionClick: () => void;
}

export const Header: React.FC<HeaderProps> = ({ primaryCurrency, onCurrencyChange, onManageCategoriesClick, onSetBudgetsClick, onAddTransactionClick }) => {
    return (
        <header className="bg-white/80 dark:bg-[#1e1f20]/80 backdrop-blur-sm shadow-sm sticky top-0 z-30">
            <div className="container mx-auto px-4 md:px-8">
                <div className="flex items-center justify-between h-16">
                    <div className="flex items-center gap-3">
                        <WalletIcon className="h-8 w-8 text-blue-600 dark:text-blue-400" />
                        <h1 className="text-xl font-bold text-slate-800 dark:text-[#e3e3e3]">AI Expense Tracker</h1>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="relative">
                            <GlobeAltIcon className="pointer-events-none w-5 h-5 absolute top-1/2 transform -translate-y-1/2 left-3 text-slate-400" />
                            <select
                                value={primaryCurrency}
                                onChange={(e) => onCurrencyChange(e.target.value)}
                                className="pl-10 pr-4 py-2 appearance-none bg-slate-100 dark:bg-[#282a2c] border border-slate-200 dark:border-[#444746] rounded-md font-medium text-slate-700 dark:text-[#e3e3e3] focus:outline-none focus:ring-2 focus:ring-[#8ab4f8]"
                                aria-label="Select primary currency"
                            >
                                {Object.entries(SUPPORTED_CURRENCIES).map(([code, { name }]) => (
                                    <option key={code} value={code}>{code} - {name}</option>
                                ))}
                            </select>
                        </div>
                         <button
                            onClick={onSetBudgetsClick}
                            className="p-2 rounded-full hover:bg-slate-200 dark:hover:bg-[#3c4043] transition-colors"
                            aria-label="Set budgets"
                        >
                            <PiggyBankIcon className="h-6 w-6 text-slate-600 dark:text-[#9aa0a6]" />
                        </button>
                         <button
                            onClick={onManageCategoriesClick}
                            className="p-2 rounded-full hover:bg-slate-200 dark:hover:bg-[#3c4043] transition-colors"
                            aria-label="Manage categories"
                        >
                            <Cog6ToothIcon className="h-6 w-6 text-slate-600 dark:text-[#9aa0a6]" />
                        </button>
                        <button
                            onClick={onAddTransactionClick}
                            className="p-2 rounded-full hover:bg-slate-200 dark:hover:bg-[#3c4043] transition-colors"
                            aria-label="Add new transaction"
                        >
                            <PlusCircleIcon className="h-6 w-6 text-slate-600 dark:text-[#9aa0a6]" />
                        </button>
                    </div>
                </div>
            </div>
        </header>
    );
};
