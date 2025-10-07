import React, { useMemo } from 'react';
import type { Transaction, ExpenseCategory, Budgets, CategoryRuleMap, Rule503020Bucket } from '../types';
import { formatCurrency } from '../utils/currency';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { CATEGORY_COLORS, RULE_50_30_20_BUCKETS, RULE_50_30_20_COLORS, RULE_50_30_20_TARGETS } from '../constants';
import { ArrowTrendingUpIcon, ScaleIcon, WalletIcon, ReceiptPercentIcon } from './icons';

interface DashboardProps {
  transactions: Transaction[];
  primaryCurrency: string;
  categoryColors: Record<ExpenseCategory, string>;
  budgets: Budgets;
  categoryRuleMap: CategoryRuleMap;
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

const ProgressBar: React.FC<{ value: number; color: string }> = ({ value, color }) => (
    <div className="w-full bg-slate-200 dark:bg-[#282a2c] rounded-full h-2.5">
        <div className="h-2.5 rounded-full" style={{ width: `${Math.min(value, 100)}%`, backgroundColor: color }}></div>
    </div>
);


const Dashboard: React.FC<DashboardProps> = ({ transactions, primaryCurrency, categoryColors, budgets, categoryRuleMap }) => {
    
    const { totalIncome, totalExpenses, netBalance, categoryTotals, monthlyRuleTotals, monthlyIncome } = useMemo(() => {
        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

        let totalIncome = 0;
        let totalExpenses = 0;
        const categoryTotals: Record<string, number> = {};
        
        const monthlyRuleTotals: Record<Rule503020Bucket, number> = { Needs: 0, Wants: 0, Savings: 0 };
        let monthlyIncome = 0;

        for (const t of transactions) {
            if (t.category === 'Income') {
                // Fix: Ensure transaction amount is treated as a number to prevent arithmetic errors.
                totalIncome += Number(t.amount);
                if (new Date(t.date) >= startOfMonth) {
                    monthlyIncome += Number(t.amount);
                }
            } else {
                // Fix: Ensure transaction amount is treated as a number to prevent arithmetic errors.
                totalExpenses += Number(t.amount);
                categoryTotals[t.category] = (categoryTotals[t.category] || 0) + Number(t.amount);

                if (new Date(t.date) >= startOfMonth) {
                    const bucket = categoryRuleMap[t.category];
                    if (bucket) {
                        monthlyRuleTotals[bucket] += Number(t.amount);
                    }
                }
            }
        }
        
        return { 
            totalIncome, 
            totalExpenses, 
            netBalance: totalIncome - totalExpenses, 
            categoryTotals,
            monthlyRuleTotals,
            monthlyIncome
        };
    }, [transactions, categoryRuleMap]);

    const chartData = Object.entries(categoryTotals)
        .map(([name, value]) => ({ name, value }))
        .sort((a, b) => b.value - a.value);

    return (
        <div className="space-y-8">
            {/* Top Stat Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <StatCard title="Total Income" amount={totalIncome} currency={primaryCurrency} color="#22c55e" icon={<ArrowTrendingUpIcon className="h-6 w-6 text-green-500" />} />
                <StatCard title="Total Expenses" amount={totalExpenses} currency={primaryCurrency} color="#ef4444" icon={<WalletIcon className="h-6 w-6 text-red-500" />} />
                <StatCard title="Net Balance" amount={netBalance} currency={primaryCurrency} color="#3b82f6" icon={<ScaleIcon className="h-6 w-6 text-blue-500" />} />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* 50/30/20 Rule */}
                <div className="lg:col-span-1 bg-white dark:bg-[#1e1f20] p-6 rounded-2xl shadow-lg border border-transparent dark:border-[#444746]">
                    <h3 className="text-lg font-bold text-slate-800 dark:text-[#e3e3e3] mb-4 flex items-center gap-2">
                        <ReceiptPercentIcon className="h-6 w-6 text-slate-500" /> 50/30/20 Rule
                    </h3>
                    <div className="space-y-4">
                        <p className="text-sm text-slate-500 dark:text-[#9aa0a6]">
                            Monthly spending based on income of <span className="font-bold">{formatCurrency(monthlyIncome, primaryCurrency)}</span>.
                        </p>
                        {RULE_50_30_20_BUCKETS.map(bucket => {
                             const spent = monthlyRuleTotals[bucket];
                             const targetAmount = monthlyIncome > 0 ? monthlyIncome * RULE_50_30_20_TARGETS[bucket] : 0;
                             const percentage = targetAmount > 0 ? (spent / targetAmount) * 100 : 0;

                            return (
                                <div key={bucket}>
                                    <div className="flex justify-between items-baseline mb-1">
                                        <span className="font-semibold text-slate-700 dark:text-[#e3e3e3]">{bucket}</span>
                                        <span className="text-sm text-slate-500 dark:text-[#9aa0a6]">
                                            {formatCurrency(spent, primaryCurrency)} / {formatCurrency(targetAmount, primaryCurrency)}
                                        </span>
                                    </div>
                                    <ProgressBar value={percentage} color={RULE_50_30_20_COLORS[bucket]} />
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Expense Breakdown */}
                <div className="lg:col-span-2 bg-white dark:bg-[#1e1f20] p-6 rounded-2xl shadow-lg border border-transparent dark:border-[#444746]">
                     <h3 className="text-lg font-bold text-slate-800 dark:text-[#e3e3e3] mb-4">Expense Breakdown</h3>
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4 h-64">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie data={chartData} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={2} labelLine={false}>
                                {chartData.map((entry) => (
                                    <Cell key={`cell-${entry.name}`} fill={categoryColors[entry.name] || '#9CA3AF'} />
                                ))}
                                </Pie>
                                <Tooltip
                                    // Fix: Handle unknown type from recharts formatter by explicitly converting to number.
                                    formatter={(value: unknown) => formatCurrency(Number(value), primaryCurrency)}
                                    contentStyle={{
                                        backgroundColor: '#1e1f20',
                                        borderColor: '#444746',
                                        borderRadius: '0.75rem',
                                    }}
                                />
                            </PieChart>
                        </ResponsiveContainer>
                        <div className="overflow-y-auto text-sm pr-2">
                             {chartData.map(entry => (
                                <div key={entry.name} className="flex justify-between items-center py-1.5">
                                    <div className="flex items-center gap-2">
                                        <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: categoryColors[entry.name] || '#9CA3AF' }}></div>
                                        <span className="text-slate-600 dark:text-[#9aa0a6]">{entry.name}</span>
                                    </div>
                                    <span className="font-semibold text-slate-700 dark:text-[#e3e3e3]">{formatCurrency(entry.value, primaryCurrency)}</span>
                                </div>
                             ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Monthly Budgets */}
            {Object.keys(budgets).length > 0 && (
                 <div className="bg-white dark:bg-[#1e1f20] p-6 rounded-2xl shadow-lg border border-transparent dark:border-[#444746]">
                     <h3 className="text-lg font-bold text-slate-800 dark:text-[#e3e3e3] mb-4">Monthly Budget Progress</h3>
                     <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-4">
                        {Object.entries(budgets).map(([category, budgetValue]) => {
                             const spent = categoryTotals[category] || 0;
                             if (typeof budgetValue !== 'number' || budgetValue <= 0) return null;
                             const percentage = (spent / budgetValue) * 100;
                             
                             return (
                                <div key={category}>
                                    <div className="flex justify-between items-baseline mb-1">
                                        <span className="font-semibold text-slate-700 dark:text-[#e3e3e3]">{category}</span>
                                        <span className="text-sm text-slate-500 dark:text-[#9aa0a6]">
                                            {formatCurrency(spent, primaryCurrency)} / {formatCurrency(budgetValue, primaryCurrency)}
                                        </span>
                                    </div>
                                    <ProgressBar value={percentage} color={categoryColors[category] || '#9CA3AF'} />
                                </div>
                             )
                        })}
                     </div>
                 </div>
            )}
        </div>
    );
};

export default Dashboard;