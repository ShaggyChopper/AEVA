export type ExpenseCategory = string;

export interface ReceiptItem {
  name: string;
  price: number;
}

export interface ReceiptData {
  merchant: string;
  date: string;
  currency: string;
  items: ReceiptItem[];
  total: number;
}

export interface Transaction {
  id: string;
  name: string;
  originalAmount: number;
  originalCurrency: string;
  amount: number; // This is the converted amount in primary currency
  date: string; // YYYY-MM-DD
  merchant: string;
  category: ExpenseCategory | 'Income';
  tags?: string[];
}

export type Budgets = Partial<Record<ExpenseCategory, number>>;

export interface ToastMessage {
  id: number;
  message: string;
  type: 'success' | 'error' | 'warning';
}

// 50/30/20 Rule Types
export type Rule503020Bucket = 'Needs' | 'Wants' | 'Savings';

export type CategoryRuleMap = Partial<Record<ExpenseCategory, Rule503020Bucket>>;
