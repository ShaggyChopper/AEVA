import React from 'react';
import type { ExpenseCategory, Budgets } from '../types';
import { formatCurrency } from '../utils/currency';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { ProgressBar } from './ProgressBar';

interface DashboardBottomProps {
  primaryCurrency: string;
  categoryColors: Record<string, string>;
  budgets: Budgets;
  categoryTotals: Map<string, number>;
  monthlyCategoryTotals: Map<string, number>;
}


const DashboardBottom: React.FC<DashboardBottomProps> = ({ 
    primaryCurrency, 
    categoryColors, 
    budgets,
    categoryTotals,
    monthlyCategoryTotals
}) => {
    
    const chartData = Array.from(categoryTotals.entries())
        .map(([name, value]) => ({ name, value }))
        .sort((a, b) => b.value - a.value);


    return (
        <div className="space-y-8">
            {/* Expense Breakdown */}
            <div className="bg-white dark:bg-[#1e1f20] p-6 rounded-2xl shadow-lg border border-transparent dark:border-[#444746]">
                 <h3 className="text-lg font-bold text-slate-800 dark:text-[#e3e3e3] mb-4">Overall Expense Breakdown</h3>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4 h-64">
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie data={chartData} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={2} labelLine={false}>
                            {chartData.map((entry) => (
                                <Cell key={`cell-${entry.name}`} fill={categoryColors[entry.name] || '#9CA3AF'} />
                            ))}
                            </Pie>
                            <Tooltip
                                formatter={(value) => formatCurrency(Number(value), primaryCurrency)}
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

            {/* Monthly Budgets */}
            {Object.keys(budgets).length > 0 && (
                 <div className="bg-white dark:bg-[#1e1f20] p-6 rounded-2xl shadow-lg border border-transparent dark:border-[#444746]">
                     <h3 className="text-lg font-bold text-slate-800 dark:text-[#e3e3e3] mb-4">Current Period Budget Progress</h3>
                     <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-4">
                        {Object.entries(budgets).map(([category, budgetValue]) => {
                             const spent = monthlyCategoryTotals.get(category) || 0;
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

export default DashboardBottom;