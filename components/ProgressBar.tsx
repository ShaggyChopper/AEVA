import React from 'react';

export const ProgressBar: React.FC<{ value: number; color: string }> = ({ value, color }) => {
    const isOverBudget = value > 100;
    // Clamp the bar's width between 0% and 100% for a consistent visual.
    const displayValue = Math.max(0, Math.min(value, 100));
    // Use a distinct color (red) to indicate over-budget status.
    const displayColor = isOverBudget ? '#f87171' : color; // red-400 for overbudget

    return (
        <div className="w-full bg-slate-200 dark:bg-[#282a2c] rounded-full h-2.5">
            <div className="h-2.5 rounded-full" style={{ width: `${displayValue}%`, backgroundColor: displayColor }}></div>
        </div>
    );
};