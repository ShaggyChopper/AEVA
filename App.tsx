import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { processReceipt, getFinancialFeedback } from './services/geminiService';
import type { Transaction, ReceiptData, ReceiptItem, ExpenseCategory, Budgets, ToastMessage, CategoryRuleMap } from './types';
import { convertCurrency } from './utils/currency';
import { DEFAULT_EXPENSE_CATEGORIES, CATEGORY_COLORS, DEFAULT_CATEGORY_RULE_MAP } from './constants';

import { Header } from './components/Header';
import Dashboard from './components/Dashboard';
import CategorySelectorModal from './components/CategorySelectorModal';
import EditTransactionModal from './components/EditTransactionModal';
import { Toast } from './components/Toast';
import ManageCategoriesModal from './components/ManageCategoriesModal';
import SetBudgetsModal from './components/SetBudgetsModal';
import AddTransactionModal from './components/AddTransactionModal';
// Fix: Import missing components
import TransactionList from './components/TransactionList';
import UploadReceipt from './components/UploadReceipt';
import AIFeedback from './components/AIFeedback';

// A simple utility to convert a File to a a base64 string
const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve((reader.result as string).split(',')[1]);
    reader.onerror = (error) => reject(error);
  });
};

const App: React.FC = () => {
    const [transactions, setTransactions] = useState<Transaction[]>(() => {
        const saved = localStorage.getItem('transactions');
        return saved ? JSON.parse(saved) : [];
    });
    const [expenseCategories, setExpenseCategories] = useState<ExpenseCategory[]>(() => {
        const saved = localStorage.getItem('expenseCategories');
        return saved ? JSON.parse(saved) : DEFAULT_EXPENSE_CATEGORIES;
    });
    const [categoryRuleMap, setCategoryRuleMap] = useState<CategoryRuleMap>(() => {
        const saved = localStorage.getItem('categoryRuleMap');
        return saved ? JSON.parse(saved) : DEFAULT_CATEGORY_RULE_MAP;
    });
    const [primaryCurrency, setPrimaryCurrency] = useState<string>(() => {
        return localStorage.getItem('primaryCurrency') || 'USD';
    });
    const [budgets, setBudgets] = useState<Budgets>(() => {
        const saved = localStorage.getItem('budgets');
        return saved ? JSON.parse(saved) : {};
    });

    // App state
    const [isLoading, setIsLoading] = useState(false);
    const [isAILoading, setIsAILoading] = useState(false);
    const [aiFeedback, setAIFeedback] = useState('');
    const [toasts, setToasts] = useState<ToastMessage[]>([]);

    // Modal state
    const [itemsToCategorize, setItemsToCategorize] = useState<Omit<Transaction, 'category'>[]>([]);
    const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
    const [isCategoriesModalOpen, setIsCategoriesModalOpen] = useState(false);
    const [isBudgetsModalOpen, setIsBudgetsModalOpen] = useState(false);
    const [isAddTransactionModalOpen, setIsAddTransactionModalOpen] = useState(false);
    
    // Filter state
    const [searchTerm, setSearchTerm] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('');
    const [dateFilter, setDateFilter] = useState({ 
        startDate: '', 
        endDate: new Date().toISOString().split('T')[0] 
    });


    // Persist to localStorage
    useEffect(() => {
        localStorage.setItem('transactions', JSON.stringify(transactions));
    }, [transactions]);
     useEffect(() => {
        localStorage.setItem('expenseCategories', JSON.stringify(expenseCategories));
    }, [expenseCategories]);
    useEffect(() => {
        localStorage.setItem('primaryCurrency', primaryCurrency);
    }, [primaryCurrency]);
     useEffect(() => {
        localStorage.setItem('budgets', JSON.stringify(budgets));
    }, [budgets]);
    useEffect(() => {
        localStorage.setItem('categoryRuleMap', JSON.stringify(categoryRuleMap));
    }, [categoryRuleMap]);

    const addToast = (message: string, type: ToastMessage['type']) => {
        setToasts(prev => [...prev, { id: Date.now(), message, type }]);
    };
    
    const handleReceiptUpload = async (file: File) => {
        setIsLoading(true);
        try {
            const base64Image = await fileToBase64(file);
            const receiptData = await processReceipt(base64Image);
            
            const newItemsToCategorize: Omit<Transaction, 'category'>[] = receiptData.items.map((item: ReceiptItem) => ({
                id: crypto.randomUUID(),
                name: item.name,
                originalAmount: item.price,
                originalCurrency: receiptData.currency,
                amount: convertCurrency(item.price, receiptData.currency, primaryCurrency),
                date: receiptData.date,
                merchant: receiptData.merchant,
            }));

            setItemsToCategorize(newItemsToCategorize);
            addToast('Receipt processed successfully!', 'success');
        } catch (error) {
            console.error(error);
            const errorMessage = error instanceof Error ? error.message : "An unknown error occurred.";
            addToast(errorMessage, 'error');
        } finally {
            setIsLoading(false);
        }
    };
    
    const checkForBudgetAlerts = useCallback((transaction: Transaction) => {
        if (transaction.category === 'Income') return;

        const budget = budgets[transaction.category];
        if (!budget || budget <= 0) return;

        const startOfMonth = new Date(new Date(transaction.date).getFullYear(), new Date(transaction.date).getMonth(), 1).toISOString().split('T')[0];
        const endOfMonth = new Date(new Date(transaction.date).getFullYear(), new Date(transaction.date).getMonth() + 1, 0).toISOString().split('T')[0];

        const monthlySpend = transactions
            .filter(t => t.category === transaction.category && t.date >= startOfMonth && t.date <= endOfMonth)
            .reduce((sum, t) => sum + t.amount, 0);

        const newTotalSpend = monthlySpend + transaction.amount;
        
        if (newTotalSpend >= budget) {
            addToast(`You've exceeded your ${transaction.category} budget!`, 'warning');
        } else if (newTotalSpend >= budget * 0.8) {
            addToast(`You've used over 80% of your ${transaction.category} budget.`, 'warning');
        }
    }, [transactions, budgets]);

    const handleCategorySelected = (transactionId: string, category: ExpenseCategory) => {
        const item = itemsToCategorize.find(t => t.id === transactionId);
        if (item) {
            const newTransaction = { ...item, category };
            setTransactions(prev => [newTransaction, ...prev]);
            checkForBudgetAlerts(newTransaction);
        }
        setItemsToCategorize(prev => prev.filter(t => t.id !== transactionId));
    };
    
    const handleSkipCategorization = () => {
        const itemsWithDefaultCategory = itemsToCategorize.map(item => ({ ...item, category: 'Others' as ExpenseCategory }));
        setTransactions(prev => [...itemsWithDefaultCategory, ...prev]);
        itemsWithDefaultCategory.forEach(checkForBudgetAlerts);
        setItemsToCategorize([]);
    };
    
    const handleUpdateTransaction = (updatedTransaction: Transaction) => {
        const convertedAmount = convertCurrency(updatedTransaction.originalAmount, updatedTransaction.originalCurrency, primaryCurrency);
        const finalTransaction = { ...updatedTransaction, amount: convertedAmount };

        setTransactions(prev => prev.map(t => t.id === finalTransaction.id ? finalTransaction : t));
        setEditingTransaction(null);
        addToast('Transaction updated!', 'success');
        checkForBudgetAlerts(finalTransaction);
    };

    const handleAddTransaction = (newTransactionData: Omit<Transaction, 'id' | 'amount'>) => {
        const newTransaction: Transaction = {
            id: crypto.randomUUID(),
            ...newTransactionData,
            amount: convertCurrency(newTransactionData.originalAmount, newTransactionData.originalCurrency, primaryCurrency)
        };
        setTransactions(prev => [newTransaction, ...prev]);
        setIsAddTransactionModalOpen(false);
        addToast('Transaction added!', 'success');
        checkForBudgetAlerts(newTransaction);
    };

    const handleGetAIFeedback = async () => {
        if (transactions.length < 5) {
            addToast("Please add at least 5 transactions for a meaningful analysis.", 'warning');
            return;
        }
        setIsAILoading(true);
        try {
            const feedback = await getFinancialFeedback(transactions, primaryCurrency);
            setAIFeedback(feedback);
        } catch (error) {
            console.error(error);
            const errorMessage = error instanceof Error ? error.message : "An unknown error occurred.";
            addToast(errorMessage, 'error');
        } finally {
            setIsAILoading(false);
        }
    };
    
    const handleCurrencyChange = (newCurrency: string) => {
        setPrimaryCurrency(newCurrency);
        // Recalculate amounts for all transactions
        setTransactions(prev => prev.map(t => ({
            ...t,
            amount: convertCurrency(t.originalAmount, t.originalCurrency, newCurrency)
        })));
        addToast(`Primary currency set to ${newCurrency}`, 'success');
    };

    const handleSaveCategories = (newCategories: ExpenseCategory[], newRuleMap: CategoryRuleMap) => {
        // Find deleted categories
        const deletedCategories = expenseCategories.filter(c => !newCategories.includes(c));
        if (deletedCategories.length > 0) {
            // Re-categorize transactions from deleted categories to 'Others'
            setTransactions(prev => prev.map(t => 
                deletedCategories.includes(t.category) ? { ...t, category: 'Others' } : t
            ));
        }
        
        setExpenseCategories(newCategories);
        setCategoryRuleMap(newRuleMap);
        setIsCategoriesModalOpen(false);
        addToast('Categories saved!', 'success');
    };

    const handleSaveBudgets = (newBudgets: Budgets) => {
        setBudgets(newBudgets);
        setIsBudgetsModalOpen(false);
        addToast('Budgets saved!', 'success');
    };
    
    const handleResetFilters = useCallback(() => {
        setSearchTerm('');
        setCategoryFilter('');
        setDateFilter({ startDate: '', endDate: new Date().toISOString().split('T')[0] });
    }, []);
    
    const filteredTransactions = useMemo(() => {
        return transactions
            .filter(t => {
                const searchLower = searchTerm.toLowerCase();
                const matchesSearch = 
                    t.name.toLowerCase().includes(searchLower) ||
                    t.merchant.toLowerCase().includes(searchLower) ||
                    t.tags?.some(tag => tag.toLowerCase().includes(searchLower));
                return matchesSearch;
            })
            .filter(t => categoryFilter ? t.category === categoryFilter : true)
            .filter(t => {
                if (!dateFilter.startDate) return true;
                return t.date >= dateFilter.startDate;
            })
             .filter(t => {
                if (!dateFilter.endDate) return true;
                return t.date <= dateFilter.endDate;
            })
            .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    }, [transactions, searchTerm, categoryFilter, dateFilter]);
    
    return (
        <div className="bg-slate-50 dark:bg-[#131314] min-h-screen font-sans">
            <Header 
                primaryCurrency={primaryCurrency}
                onCurrencyChange={handleCurrencyChange}
                onManageCategoriesClick={() => setIsCategoriesModalOpen(true)}
// Fix: Correct typo 'fixtrue' to 'true'
                onSetBudgetsClick={() => setIsBudgetsModalOpen(true)}
                onAddTransactionClick={() => setIsAddTransactionModalOpen(true)}
            />

            <main className="container mx-auto p-4 md:px-8 md:py-8">
                <Dashboard
                    transactions={transactions}
                    primaryCurrency={primaryCurrency}
                    categoryColors={CATEGORY_COLORS}
                    budgets={budgets}
                    categoryRuleMap={categoryRuleMap}
                />
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start mt-8">
                    <div className="lg:col-span-2">
                        <TransactionList
                            transactions={filteredTransactions}
                            onEdit={(t) => setEditingTransaction(t)}
                            primaryCurrency={primaryCurrency}
                            categoryColors={CATEGORY_COLORS}
                            searchTerm={searchTerm}
                            onSearchChange={setSearchTerm}
                            categories={expenseCategories}
                            categoryFilter={categoryFilter}
                            onCategoryChange={setCategoryFilter}
                            dateFilter={dateFilter}
                            onDateChange={(e) => setDateFilter(prev => ({...prev, [e.target.name]: e.target.value}))}
                            onResetFilters={handleResetFilters}
                        />
                    </div>
                    <div className="space-y-8 lg:sticky top-24">
                        <UploadReceipt onReceiptUpload={handleReceiptUpload} isLoading={isLoading} />
                        <AIFeedback
                            onGetFeedback={handleGetAIFeedback}
                            feedback={aiFeedback}
                            isLoading={isAILoading}
                        />
                    </div>
                </div>
            </main>

            {itemsToCategorize.length > 0 && (
                <CategorySelectorModal 
                    transaction={itemsToCategorize[0]}
                    onCategorySelected={handleCategorySelected}
                    onClose={handleSkipCategorization}
                    categories={expenseCategories}
                />
            )}
            
            {editingTransaction && (
                <EditTransactionModal 
                    transaction={editingTransaction}
                    onUpdate={handleUpdateTransaction}
                    onClose={() => setEditingTransaction(null)}
                    categories={expenseCategories}
                />
            )}

            {isCategoriesModalOpen && (
                <ManageCategoriesModal
                    categories={expenseCategories}
                    categoryRuleMap={categoryRuleMap}
                    onSave={handleSaveCategories}
                    onClose={() => setIsCategoriesModalOpen(false)}
                />
            )}

            {isBudgetsModalOpen && (
                <SetBudgetsModal
                    categories={expenseCategories}
                    budgets={budgets}
                    onSave={handleSaveBudgets}
                    onClose={() => setIsBudgetsModalOpen(false)}
                    primaryCurrency={primaryCurrency}
                />
            )}

            {isAddTransactionModalOpen && (
                <AddTransactionModal
                    categories={expenseCategories}
                    onSave={handleAddTransaction}
                    onClose={() => setIsAddTransactionModalOpen(false)}
                />
            )}

            <div className="fixed top-20 right-5 z-50 space-y-2">
                 {toasts.map(toast => (
                    <Toast 
                        key={toast.id}
                        message={toast.message}
                        type={toast.type}
                        onClose={() => setToasts(t => t.filter(item => item.id !== toast.id))}
                    />
                ))}
            </div>
        </div>
    );
};

export default App;