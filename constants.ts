
import { ExpenseCategory } from './types';

export const EXPENSE_CATEGORIES: ExpenseCategory[] = [
  ExpenseCategory.Groceries,
  ExpenseCategory.Snacks,
  ExpenseCategory.JunkFood,
  ExpenseCategory.Restaurant,
  ExpenseCategory.Tobacco,
  ExpenseCategory.PersonalCare,
  ExpenseCategory.Necessity,
  ExpenseCategory.Booze,
  ExpenseCategory.Clothing,
  ExpenseCategory.Transportation,
  ExpenseCategory.MobileBill,
  ExpenseCategory.Others,
];

export const CATEGORY_COLORS: Record<ExpenseCategory, string> = {
    [ExpenseCategory.Groceries]: '#34D399',
    [ExpenseCategory.Snacks]: '#FBBF24',
    [ExpenseCategory.JunkFood]: '#F87171',
    [ExpenseCategory.Restaurant]: '#F472B6',
    [ExpenseCategory.Tobacco]: '#A78BFA',
    [ExpenseCategory.PersonalCare]: '#60A5FA',
    [ExpenseCategory.Necessity]: '#2DD4BF',
    [ExpenseCategory.Booze]: '#C084FC',
    [ExpenseCategory.Clothing]: '#FB923C',
    [ExpenseCategory.Transportation]: '#93C5FD',
    [ExpenseCategory.MobileBill]: '#A5B4FC',
    [ExpenseCategory.Others]: '#9CA3AF',
    [ExpenseCategory.Income]: '#4ADE80',
};
