
export enum ExpenseCategory {
  Groceries = "Groceries",
  Snacks = "Snacks",
  JunkFood = "Junk food/Recreation",
  Restaurant = "Restaurant meal",
  Tobacco = "Snus/Tobacco",
  PersonalCare = "Personal Care",
  Necessity = "Necessity",
  Booze = "Booze",
  Clothing = "Clothing",
  Transportation = "Transportation",
  MobileBill = "Mobile Bill",
  Others = "Others",
  Income = "Income"
}

export interface Transaction {
  id: string;
  name: string;
  amount: number;
  date: string;
  category: ExpenseCategory;
}

export type ItemCategoryMap = Record<string, ExpenseCategory>;

export interface ReceiptData {
    date: string;
    items: { name: string; price: number }[];
    total: number;
}
