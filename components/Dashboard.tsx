
import React, { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, Sector } from 'recharts';
import type { Transaction } from '../types';
import { ExpenseCategory } from '../types';
import { CATEGORY_COLORS } from '../constants';
import { BanknotesIcon, ChartPieIcon, ArrowTrendingDownIcon } from './icons';

interface DashboardProps {
  transactions: Transaction[];
}

const renderActiveShape = (props: any) => {
    const RADIAN = Math.PI / 180;
    const { cx, cy, midAngle, innerRadius, outerRadius, startAngle, endAngle, fill, payload, percent, value } = props;
    const sin = Math.sin(-RADIAN * midAngle);
    const cos = Math.cos(-RADIAN * midAngle);
    const sx = cx + (outerRadius + 10) * cos;
    const sy = cy + (outerRadius + 10) * sin;
    const mx = cx + (outerRadius + 30) * cos;
    const my = cy + (outerRadius + 30) * sin;
    const ex = mx + (cos >= 0 ? 1 : -1) * 22;
    const ey = my;
    const textAnchor = cos >= 0 ? 'start' : 'end';

    return (
        <g>
            <text x={cx} y={cy} dy={8} textAnchor="middle" fill={fill} className="font-bold">
                {payload.name}
            </text>
            <Sector
                cx={cx}
                cy={cy}
                innerRadius={innerRadius}
                outerRadius={outerRadius}
                startAngle={startAngle}
                endAngle={endAngle}
                fill={fill}
            />
            <Sector
                cx={cx}
                cy={cy}
                startAngle={startAngle}
                endAngle={endAngle}
                innerRadius={outerRadius + 6}
                outerRadius={outerRadius + 10}
                fill={fill}
            />
            <path d={`M${sx},${sy}L${mx},${my}L${ex},${ey}`} stroke={fill} fill="none" />
            <circle cx={ex} cy={ey} r={2} fill={fill} stroke="none" />
            <text x={ex + (cos >= 0 ? 1 : -1) * 12} y={ey} textAnchor={textAnchor} fill="#333" className="dark:fill-slate-200">{`$${value.toFixed(2)}`}</text>
            <text x={ex + (cos >= 0 ? 1 : -1) * 12} y={ey} dy={18} textAnchor={textAnchor} fill="#999">
                {`( ${(percent * 100).toFixed(2)}% )`}
            </text>
        </g>
    );
};


const Dashboard: React.FC<DashboardProps> = ({ transactions }) => {
    const [activeIndex, setActiveIndex] = React.useState(0);

    const onPieEnter = (_: any, index: number) => {
        setActiveIndex(index);
    };

    const { totalExpenses, categoryData, topCategory } = useMemo(() => {
        const expenseTransactions = transactions.filter(t => t.category !== ExpenseCategory.Income);
        const total = expenseTransactions.reduce((sum, t) => sum + t.amount, 0);

        const data = expenseTransactions.reduce((acc, t) => {
            const existing = acc.find(item => item.name === t.category);
            if (existing) {
                existing.value += t.amount;
            } else {
                acc.push({ name: t.category, value: t.amount });
            }
            return acc;
        }, [] as { name: ExpenseCategory; value: number }[]);

        const top = data.reduce((max, item) => (item.value > max.value ? item : max), { name: ExpenseCategory.Others, value: 0 });

        return {
            totalExpenses: total,
            categoryData: data,
            topCategory: top
        };
    }, [transactions]);

    return (
        <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-lg">
            <h2 className="text-2xl font-bold text-slate-800 dark:text-white mb-6">Dashboard</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-slate-100 dark:bg-slate-700 p-4 rounded-xl flex items-center">
                    <div className="p-3 bg-red-200 dark:bg-red-500/30 rounded-full mr-4">
                       <BanknotesIcon className="h-6 w-6 text-red-600 dark:text-red-300"/>
                    </div>
                    <div>
                        <p className="text-sm text-slate-500 dark:text-slate-400">Total Expenses</p>
                        <p className="text-2xl font-bold text-slate-800 dark:text-white">${totalExpenses.toFixed(2)}</p>
                    </div>
                </div>
                <div className="bg-slate-100 dark:bg-slate-700 p-4 rounded-xl flex items-center">
                    <div className="p-3 bg-blue-200 dark:bg-blue-500/30 rounded-full mr-4">
                        <ChartPieIcon className="h-6 w-6 text-blue-600 dark:text-blue-300"/>
                    </div>
                    <div>
                        <p className="text-sm text-slate-500 dark:text-slate-400">Total Transactions</p>
                        <p className="text-2xl font-bold text-slate-800 dark:text-white">{transactions.filter(t => t.category !== ExpenseCategory.Income).length}</p>
                    </div>
                </div>
                <div className="bg-slate-100 dark:bg-slate-700 p-4 rounded-xl flex items-center">
                    <div className="p-3 bg-yellow-200 dark:bg-yellow-500/30 rounded-full mr-4">
                        <ArrowTrendingDownIcon className="h-6 w-6 text-yellow-600 dark:text-yellow-300"/>
                    </div>
                    <div>
                        <p className="text-sm text-slate-500 dark:text-slate-400">Top Spending</p>
                        <p className="text-xl font-bold text-slate-800 dark:text-white">{topCategory.name}</p>
                    </div>
                </div>
            </div>

            <h3 className="text-xl font-semibold text-slate-700 dark:text-slate-300 mb-4">Expense Breakdown</h3>
            <div className="h-96">
                {categoryData.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                         <PieChart>
                            <Pie
                                activeIndex={activeIndex}
                                activeShape={renderActiveShape}
                                data={categoryData}
                                cx="50%"
                                cy="50%"
                                innerRadius={80}
                                outerRadius={120}
                                fill="#8884d8"
                                dataKey="value"
                                onMouseEnter={onPieEnter}
                            >
                                {categoryData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={CATEGORY_COLORS[entry.name]} />
                                ))}
                            </Pie>
                        </PieChart>
                    </ResponsiveContainer>
                ) : (
                    <div className="flex items-center justify-center h-full text-slate-500 dark:text-slate-400">
                        <p>No expense data to display. Upload a receipt to get started!</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Dashboard;
