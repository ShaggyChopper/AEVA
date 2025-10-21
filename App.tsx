import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { processReceipt, getFinancialFeedback, detectMerchant, queryTransactions } from './services/geminiService';
import type { Transaction, ReceiptData, ReceiptItem, ExpenseCategory, Budgets, ToastMessage, CategoryRuleMap, Rule503020Bucket } from './types';
import { convertCurrency, formatCurrency } from './utils/currency';
import { getFinancialMonthRange } from './utils/date';
import { DEFAULT_EXPENSE_CATEGORIES, CATEGORY_COLORS, DEFAULT_CATEGORY_RULE_MAP } from './constants';

import { Header } from './components/Header';
import DashboardTop from './components/DashboardTop';
import DashboardBottom from './components/DashboardBottom';
import CategorySelectorModal from './components/CategorySelectorModal';
import EditTransactionModal from './components/EditTransactionModal';
import { Toast } from './components/Toast';
import ManageCategoriesModal from './components/ManageCategoriesModal';
import SetBudgetsModal from './components/SetBudgetsModal';
import AddTransactionModal from './components/AddTransactionModal';
import TransactionList from './components/TransactionList';
import UploadReceipt from './components/UploadReceipt';
import AIFeedback from './components/AIFeedback';
import FloatingActionButton from './components/FloatingActionButton';
import CameraModal from './components/CameraModal';
import AIQuery from './components/AIQuery';


// A simple utility to convert a File to a a base64 string
const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve((reader.result as string).split(',')[1]);
    reader.onerror = (error) => reject(error);
  });
};

interface ConfirmTaxModalProps {
  receiptData: ReceiptData;
  onConfirm: () => void;
  onCancel: () => void;
}
const ConfirmTaxModal: React.FC<ConfirmTaxModalProps> = ({ receiptData, onConfirm, onCancel }) => {
  if (!receiptData.tax || receiptData.tax <= 0) {
    return null;
  }
  const formattedTax = formatCurrency(receiptData.tax, receiptData.currency);
  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={onCancel}>
      <div 
        className="bg-white dark:bg-[#1e1f20] rounded-2xl shadow-2xl w-full max-w-sm p-6 text-center transform transition-all animate-in fade-in-0 zoom-in-95 border dark:border-[#444746]"
        onClick={e => e.stopPropagation()}
      >
        <h2 className="text-xl font-bold text-slate-800 dark:text-[#e3e3e3]">Include Tax?</h2>
        <p className="mt-2 text-slate-600 dark:text-[#9aa0a6]">
          This receipt includes a tax of <span className="font-bold text-slate-800 dark:text-white">{formattedTax}</span>.
        </p>
        <p className="mt-1 text-slate-600 dark:text-[#9aa0a6]">
          Would you like to add this as a separate expense in the 'Others' category?
        </p>
        <div className="flex justify-center gap-4 mt-6">
          <button
            onClick={onCancel}
            className="px-6 py-2 text-sm font-medium text-slate-700 dark:text-[#e3e3e3] bg-slate-100 dark:bg-[#3c4043] rounded-md hover:bg-slate-200 dark:hover:bg-[#444746] transition-colors"
          >
            No, Ignore
          </button>
          <button
            onClick={onConfirm}
            className="px-6 py-2 text-sm font-medium text-white bg-blue-600 dark:bg-[#8ab4f8] dark:text-[#202124] rounded-md hover:bg-blue-700 dark:hover:bg-[#9ac0fa] transition-colors"
          >
            Yes, Add
          </button>
        </div>
      </div>
    </div>
  );
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
    const [isOnline, setIsOnline] = useState(navigator.onLine);
    const [aiQueryAnswer, setAIQueryAnswer] = useState('');
    const [isAIQueryLoading, setIsAIQueryLoading] = useState(false);
    
    // Receipt upload state
    const [receiptFile, setReceiptFile] = useState<File | null>(null);
    const [receiptPreview, setReceiptPreview] = useState<string | null>(null);
    const [receiptMerchant, setReceiptMerchant] = useState('');
    const [isDetectingMerchant, setIsDetectingMerchant] = useState(false);
    const [pendingTaxConfirmation, setPendingTaxConfirmation] = useState<ReceiptData | null>(null);

    // Modal state
    const [itemsToCategorize, setItemsToCategorize] = useState<Omit<Transaction, 'category'>[]>([]);
    const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
    const [isCategoriesModalOpen, setIsCategoriesModalOpen] = useState(false);
    const [isBudgetsModalOpen, setIsBudgetsModalOpen] = useState(false);
    const [isAddTransactionModalOpen, setIsAddTransactionModalOpen] = useState(false);
    const [isCameraModalOpen, setIsCameraModalOpen] = useState(false);
    const [initialTransactionType, setInitialTransactionType] = useState<'expense' | 'income'>('expense');
    
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
    
    // Listen for online/offline status changes
    useEffect(() => {
        const handleOnline = () => setIsOnline(true);
        const handleOffline = () => setIsOnline(false);

        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);

        return () => {
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
        };
    }, []);

    const uniqueMerchants = useMemo(() => {
        const merchants = new Set(transactions.map(t => t.merchant));
        if (merchants.has('Income')) {
            merchants.delete('Income');
        }
        return Array.from(merchants).sort();
    }, [transactions]);

    const addToast = (message: string, type: ToastMessage['type']) => {
        setToasts(prev => [...prev, { id: Date.now(), message, type }]);
    };
    
    const processReceiptItems = useCallback((receiptData: ReceiptData) => {
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
    }, [primaryCurrency]);

    const handleReceiptUpload = async () => {
        if (!receiptFile) return;

        setIsLoading(true);
        try {
            const base64Image = await fileToBase64(receiptFile);
            const receiptData = await processReceipt(base64Image);

            if (receiptMerchant && receiptMerchant.trim() !== '') {
                receiptData.merchant = receiptMerchant.trim();
            }
            
            addToast('Receipt processed successfully!', 'success');
            
            // Reset after upload
            setReceiptFile(null);
            setReceiptPreview(null);
            setReceiptMerchant('');

            if (receiptData.tax && receiptData.tax > 0) {
                setPendingTaxConfirmation(receiptData);
            } else {
                processReceiptItems(receiptData);
            }

        } catch (error) {
            console.error(error);
            const errorMessage = error instanceof Error ? error.message : "An unknown error occurred.";
            addToast(errorMessage, 'error');
        } finally {
            setIsLoading(false);
        }
    };
    
    const handleDetectMerchant = async (file: File) => {
        if (!isOnline) return;
        setIsDetectingMerchant(true);
        try {
            const base64 = await fileToBase64(file);
            const merchantName = await detectMerchant(base64);
            if (merchantName) {
                setReceiptMerchant(merchantName);
            }
        } catch (error) {
            console.error("Failed to pre-fill merchant:", error);
            // Fail silently on UI, but log error
        } finally {
            setIsDetectingMerchant(false);
        }
    };

    const handleReceiptFileChange = (file: File) => {
        setReceiptFile(file);
        setReceiptMerchant(''); // Reset merchant on new file
        const reader = new FileReader();
        reader.onloadend = () => {
            setReceiptPreview(reader.result as string);
        };
        reader.readAsDataURL(file);
        handleDetectMerchant(file);
    };

    const handlePhotoCapture = (blob: Blob) => {
        const file = new File([blob], `capture-${Date.now()}.jpg`, { type: blob.type });
        handleReceiptFileChange(file);
    };

    const handleCancelReceipt = useCallback(() => {
        setReceiptFile(null);
        setReceiptPreview(null);
        setReceiptMerchant('');
    }, []);

    const checkForBudgetAlerts = useCallback((transaction: Transaction) => {
        if (transaction.category === 'Income') return;

        const budget = budgets[transaction.category];
        if (!budget || budget <= 0) return;

        const transactionDate = new Date(transaction.date);
        const { startDate, endDate } = getFinancialMonthRange(transactionDate);

        const monthlySpend = transactions
            .filter(t => t.category === transaction.category && t.date >= startDate && t.date <= endDate)
            .reduce((sum, t) => sum + t.amount, 0);

        const newTotalSpend = monthlySpend + transaction.amount;
        
        if (newTotalSpend >= budget) {
            addToast(`You've exceeded your ${transaction.category} budget!`, 'warning');
        } else if (newTotalSpend >= budget * 0.8) {
            addToast(`You've used over 80% of your ${transaction.category} budget.`, 'warning');
        }
    }, [transactions, budgets]);

    const handleConfirmTax = () => {
        if (!pendingTaxConfirmation) return;

        const taxTransaction: Transaction = {
            id: crypto.randomUUID(),
            name: 'Sales Tax / VAT',
            originalAmount: pendingTaxConfirmation.tax!,
            originalCurrency: pendingTaxConfirmation.currency,
            amount: convertCurrency(pendingTaxConfirmation.tax!, pendingTaxConfirmation.currency, primaryCurrency),
            date: pendingTaxConfirmation.date,
            merchant: pendingTaxConfirmation.merchant,
            category: 'Others',
        };
        setTransactions(prev => [taxTransaction, ...prev]);
        checkForBudgetAlerts(taxTransaction);
        addToast('Tax added as an expense.', 'success');

        processReceiptItems(pendingTaxConfirmation);
        setPendingTaxConfirmation(null);
    };

    const handleIgnoreTax = () => {
        if (!pendingTaxConfirmation) return;
        processReceiptItems(pendingTaxConfirmation);
        setPendingTaxConfirmation(null);
    };

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

    const handleDeleteTransaction = (transactionId: string) => {
        setTransactions(prev => prev.filter(t => t.id !== transactionId));
        setEditingTransaction(null);
        addToast('Transaction deleted.', 'success');
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
            const feedback = await getFinancialFeedback(transactions, primaryCurrency, categoryRuleMap);
            setAIFeedback(feedback);
        } catch (error) {
            console.error(error);
            const errorMessage = error instanceof Error ? error.message : "An unknown error occurred.";
            addToast(errorMessage, 'error');
        } finally {
            setIsAILoading(false);
        }
    };

    const handleAskAIQuery = async (question: string) => {
        if (transactions.length === 0) {
            addToast("You don't have any transactions to ask questions about.", 'warning');
            return;
        }
        setIsAIQueryLoading(true);
        setAIQueryAnswer(''); // Clear previous answer
        try {
            const answer = await queryTransactions(question, transactions, primaryCurrency);
            setAIQueryAnswer(answer);
        } catch (error) {
            console.error(error);
            const errorMessage = error instanceof Error ? error.message : "An unknown error occurred.";
            addToast(errorMessage, 'error');
            setAIQueryAnswer('Sorry, I was unable to get an answer. Please try again.');
        } finally {
            setIsAIQueryLoading(false);
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
    
    const financialSummary = useMemo(() => {
        const { startDate: financialMonthStart, endDate: financialMonthEnd } = getFinancialMonthRange();

        let totalIncome = 0;
        let totalExpenses = 0;
        const categoryTotals = new Map<string, number>();
        
        const monthlyRuleTotals: Record<Rule503020Bucket, number> = { Needs: 0, Wants: 0, Savings: 0 };
        const monthlyCategoryTotals = new Map<string, number>();
        let monthlyIncome = 0;

        for (const t of transactions) {
            const transactionAmount = Number(t.amount) || 0;
            const isThisFinancialMonth = t.date >= financialMonthStart && t.date <= financialMonthEnd;

            if (t.category === 'Income') {
                totalIncome += transactionAmount;
                if (isThisFinancialMonth) {
                    monthlyIncome += transactionAmount;
                }
            } else {
                totalExpenses += transactionAmount;
                categoryTotals.set(t.category, (categoryTotals.get(t.category) || 0) + transactionAmount);

                if (isThisFinancialMonth) {
                    const bucket = categoryRuleMap[t.category];
                    if (bucket) {
                        monthlyRuleTotals[bucket] += transactionAmount;
                    }
                    monthlyCategoryTotals.set(t.category, (monthlyCategoryTotals.get(t.category) || 0) + transactionAmount);
                }
            }
        }
        
        return { 
            totalIncome, 
            totalExpenses, 
            netBalance: totalIncome - totalExpenses, 
            categoryTotals, // all-time for pie chart
            monthlyRuleTotals,
            monthlyIncome,
            monthlyCategoryTotals // current financial month for budgets
        };
    }, [transactions, categoryRuleMap]);

    const filteredTransactions = useMemo(() => {
        return transactions
            .filter(t => {
                const searchLower = searchTerm.toLowerCase();
                const matchesSearch = 
                    t.name.toLowerCase().includes(searchLower) ||
                    t.merchant.toLowerCase().includes(searchLower) ||
                    t.category.toLowerCase().includes(searchLower) ||
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
    
    const handleOpenAddTransactionModal = () => {
        setInitialTransactionType('expense');
        setIsAddTransactionModalOpen(true);
    };

    const handleAddIncomeClick = () => {
        setInitialTransactionType('income');
        setIsAddTransactionModalOpen(true);
    };

    return (
        <div className="bg-slate-50 dark:bg-[#131314] min-h-screen font-sans">
            <Header 
                primaryCurrency={primaryCurrency}
                onCurrencyChange={handleCurrencyChange}
                onManageCategoriesClick={() => setIsCategoriesModalOpen(true)}
                onSetBudgetsClick={() => setIsBudgetsModalOpen(true)}
                onAddTransactionClick={handleOpenAddTransactionModal}
            />

            <main className="container mx-auto p-4 md:px-8 md:py-8">
                 <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
                    
                    {/* Main Content Column */}
                    <div className="lg:col-span-2 flex flex-col gap-8">
                        <div className="order-1">
                            <DashboardTop
                                primaryCurrency={primaryCurrency}
                                totalIncome={financialSummary.totalIncome}
                                totalExpenses={financialSummary.totalExpenses}
                                netBalance={financialSummary.netBalance}
                                monthlyRuleTotals={financialSummary.monthlyRuleTotals}
                                monthlyIncome={financialSummary.monthlyIncome}
                            />
                        </div>
                        <div className="order-3 lg:order-2">
                             <DashboardBottom
                                primaryCurrency={primaryCurrency}
                                categoryColors={CATEGORY_COLORS}
                                budgets={budgets}
                                categoryTotals={financialSummary.categoryTotals}
                                monthlyCategoryTotals={financialSummary.monthlyCategoryTotals}
                            />
                        </div>
                        <div className="order-4 lg:order-3">
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
                                budgets={budgets}
                                monthlyCategoryTotals={financialSummary.monthlyCategoryTotals}
                            />
                        </div>
                    </div>

                    {/* Sidebar Column */}
                    <div className="lg:col-span-1 flex flex-col gap-8 lg:sticky top-24">
                        <div className="order-2 lg:order-1">
                            <UploadReceipt 
                                onReceiptUpload={handleReceiptUpload} 
                                isLoading={isLoading} 
                                isOnline={isOnline}
                                merchants={uniqueMerchants}
                                onTakePictureClick={() => setIsCameraModalOpen(true)}
                                file={receiptFile}
                                preview={receiptPreview}
                                onFileChange={handleReceiptFileChange}
                                onCancel={handleCancelReceipt}
                                merchant={receiptMerchant}
                                onMerchantChange={setReceiptMerchant}
                                isDetectingMerchant={isDetectingMerchant}
                            />
                        </div>
                        <div className="order-5 lg:order-2">
                            <AIFeedback
                                onGetFeedback={handleGetAIFeedback}
                                feedback={aiFeedback}
                                isLoading={isAILoading}
                                isOnline={isOnline}
                            />
                        </div>
                        <div className="order-6 lg:order-3">
                            <AIQuery
                                onAskQuery={handleAskAIQuery}
                                answer={aiQueryAnswer}
                                isLoading={isAIQueryLoading}
                                isOnline={isOnline}
                            />
                        </div>
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
                    onDelete={handleDeleteTransaction}
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
                    initialType={initialTransactionType}
                />
            )}

            {isCameraModalOpen && (
                <CameraModal 
                onClose={() => setIsCameraModalOpen(false)}
                onCapture={handlePhotoCapture}
                />
            )}

            {pendingTaxConfirmation && (
                <ConfirmTaxModal
                    receiptData={pendingTaxConfirmation}
                    onConfirm={handleConfirmTax}
                    onCancel={handleIgnoreTax}
                />
            )}

            <FloatingActionButton
                onAddIncomeClick={handleAddIncomeClick}
                onUploadReceiptClick={() => setIsCameraModalOpen(true)}
            />

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
