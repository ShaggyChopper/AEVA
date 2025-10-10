import React from 'react';
import type { Rule503020Bucket } from '../types';
import { formatCurrency } from '../utils/currency';
import { RULE_50_30_20_BUCKETS, RULE_50_30_20_COLORS, RULE_50_30_20_TARGETS } from '../constants';
import { ArrowTrendingUpIcon, ScaleIcon, WalletIcon, ReceiptPercentIcon } from './icons';
import { ProgressBar } from './ProgressBar';

interface DashboardTopProps {
  primaryCurrency: string;
  totalIncome: number;
  totalExpenses: number;
  netBalance: number;
  monthlyRuleTotals: Record<Rule503020Bucket, number>;
  monthlyIncome: number;
}

const StatCard: React.FC<{ title: string; amount: number; currency: string; icon: React.ReactNode; color: string }> = ({ title, amount, currency, icon, color }) => (
    <div className={`p-4 rounded-2xl shadow-lg flex items-center gap-4 border border-transparent dark:border-[#444746] bg-white dark:bg-[#1e1f20]`}>
        <div className={`p-3 rounded-full`} style={{ backgroundColor: `${color}20` }}>
            {icon}
        </div>
        <div>
            <p className="text-sm text-slate-500 dark:text-[#9aa0a6]">{title}</p>
            <p className="text-2xl font-bold text-slate-800 dark:text-[#e3e3e3]">{formatCurrency(amount, currency)}</p>
        </div>
    </div>
);


const DashboardTop: React.FC<DashboardTopProps> = ({ 
    primaryCurrency, 
    totalIncome,
    totalExpenses,
    netBalance,
    monthlyRuleTotals,
    monthlyIncome,
}) => {
    
    // Calculate total monthly spending based on the buckets, which includes ALL categorized expenses for the period.
    const totalMonthlySpending = monthlyRuleTotals.Needs + monthlyRuleTotals.Wants + monthlyRuleTotals.Savings;
    const calculatedSavings = monthlyIncome - totalMonthlySpending;

    return (
        <div className="space-y-8">
            {/* Top Stat Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <StatCard title="Total Income" amount={totalIncome} currency={primaryCurrency} color="#22c55e" icon={<ArrowTrendingUpIcon className="h-6 w-6 text-green-500" />} />
                <StatCard title="Total Expenses" amount={totalExpenses} currency={primaryCurrency} color="#ef4444" icon={<WalletIcon className="h-6 w-6 text-red-500" />} />
                <StatCard title="Net Balance" amount={netBalance} currency={primaryCurrency} color="#3b82f6" icon={<ScaleIcon className="h-6 w-6 text-blue-500" />} />
            </div>

            {/* 50/30/20 Rule */}
            <div className="bg-white dark:bg-[#1e1f20] p-6 rounded-2xl shadow-lg border border-transparent dark:border-[#444746]">
                <h3 className="text-lg font-bold text-slate-800 dark:text-[#e3e3e3] mb-4 flex items-center gap-2">
                    <ReceiptPercentIcon className="h-6 w-6 text-slate-500" /> 50/30/20 Rule
                </h3>
                <div className="space-y-4">
                    <p className="text-sm text-slate-500 dark:text-[#9aa0a6]">
                        Current period spending based on income of <span className="font-bold">{formatCurrency(monthlyIncome, primaryCurrency)}</span>.
                    </p>
                    {RULE_50_30_20_BUCKETS.map(bucket => {
                         const target = monthlyIncome > 0 ? monthlyIncome * RULE_50_30_20_TARGETS[bucket] : 0;
                         // Use calculated savings for the 'Savings' bucket, otherwise use spend from transactions.
                         const spent = bucket === 'Savings' ? calculatedSavings : monthlyRuleTotals[bucket];
                         const percentage = target > 0 ? (spent / target) * 100 : 0;

                        return (
                            <div key={bucket}>
                                <div className="flex justify-between items-baseline mb-1">
                                    <span className="font-semibold text-slate-700 dark:text-[#e3e3e3]">{bucket}</span>
                                    <span className="text-sm text-slate-500 dark:text-[#9aa0a6]">
                                        {formatCurrency(spent, primaryCurrency)} / {formatCurrency(target, primaryCurrency)}
                                    </span>
                                </div>
                                <ProgressBar value={percentage} color={RULE_50_30_20_COLORS[bucket]} />
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

export default DashboardTop;