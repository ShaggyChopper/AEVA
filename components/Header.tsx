
import React from 'react';
import { WalletIcon } from './icons';

export const Header: React.FC = () => {
    return (
        <header className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm shadow-sm sticky top-0 z-30">
            <div className="container mx-auto px-4 md:px-8">
                <div className="flex items-center justify-between h-16">
                    <div className="flex items-center gap-3">
                        <WalletIcon className="h-8 w-8 text-blue-600 dark:text-blue-400" />
                        <h1 className="text-xl font-bold text-slate-800 dark:text-white">AI Expense Tracker</h1>
                    </div>
                </div>
            </div>
        </header>
    );
};
