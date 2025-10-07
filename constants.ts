import type { ExpenseCategory, Rule503020Bucket, CategoryRuleMap } from './types';

export const SUPPORTED_CURRENCIES: Record<string, { name: string; symbol: string }> = {
  USD: { name: 'United States Dollar', symbol: '$' },
  EUR: { name: 'Euro', symbol: '€' },
  GBP: { name: 'British Pound', symbol: '£' },
  JPY: { name: 'Japanese Yen', symbol: '¥' },
  SEK: { name: 'Swedish Krona', symbol: 'kr' },
};

export const DEFAULT_EXPENSE_CATEGORIES: ExpenseCategory[] = [
  'Groceries',
  'Dining',
  'Transport',
  'Utilities',
  'Shopping',
  'Entertainment',
  'Health',
  'Travel',
  'Others',
];

export const CATEGORY_COLORS: Record<string, string> = {
    Groceries: '#4ade80', // lime-400
    Dining: '#facc15', // yellow-400
    Transport: '#60a5fa', // blue-400
    Utilities: '#c084fc', // purple-400
    Shopping: '#f87171', // red-400
    Entertainment: '#fb923c', // orange-400
    Health: '#2dd4bf', // teal-400
    Travel: '#a78bfa', // violet-400
    Income: '#22c55e', // green-500
    Others: '#9ca3af', // gray-400
};

// 50/30/20 Rule Constants
export const RULE_50_30_20_BUCKETS: Rule503020Bucket[] = ['Needs', 'Wants', 'Savings'];

export const RULE_50_30_20_TARGETS: Record<Rule503020Bucket, number> = {
    Needs: 0.5,
    Wants: 0.3,
    Savings: 0.2,
};

export const RULE_50_30_20_COLORS: Record<Rule503020Bucket, string> = {
    Needs: '#38bdf8', // sky-400
    Wants: '#f472b6', // pink-400
    Savings: '#34d399', // emerald-400
};

export const DEFAULT_CATEGORY_RULE_MAP: CategoryRuleMap = {
    Groceries: 'Needs',
    Transport: 'Needs',
    Utilities: 'Needs',
    Health: 'Needs',
    Dining: 'Wants',
    Shopping: 'Wants',
    Entertainment: 'Wants',
    Travel: 'Wants',
    Others: 'Wants',
    // 'Savings' categories would typically be added by the user, e.g., 'Investments'
};
