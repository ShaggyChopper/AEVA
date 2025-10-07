
import React, { useState, useCallback, useMemo } from 'react';
import type { Transaction, ItemCategoryMap, ExpenseCategory } from './types';
import { processReceipt, getFinancialFeedback } from './services/geminiService';
import Dashboard from './components/Dashboard';
import UploadReceipt from './components/UploadReceipt';
import TransactionList from './components/TransactionList';
import CategorySelectorModal from './components/CategorySelectorModal';
import AIFeedback from './components/AIFeedback';
import { Header } from './components/Header';
import { Toast } from './components/Toast';

const App: React.FC = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [itemCategoryMap, setItemCategoryMap] = useState<ItemCategoryMap>({});
  const [itemsToCategorize, setItemsToCategorize] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [loadingMessage, setLoadingMessage] = useState<string>('');
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [feedback, setFeedback] = useState<string>('');

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  const handleReceiptUpload = useCallback(async (file: File) => {
    setIsLoading(true);
    setLoadingMessage('Analyzing your receipt with Gemini AI...');
    try {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = async () => {
        const base64Image = (reader.result as string).split(',')[1];
        try {
          const receiptData = await processReceipt(base64Image);
          
          if (!receiptData || !receiptData.items || receiptData.items.length === 0) {
            throw new Error("AI could not read any items from the receipt.");
          }

          const newTransactions: Transaction[] = [];
          const newItemsToCategorize: Transaction[] = [];
          
          receiptData.items.forEach(item => {
            const normalizedItemName = item.name.trim().toLowerCase();
            const existingCategory = itemCategoryMap[normalizedItemName];
            const newTransaction: Transaction = {
              id: `${Date.now()}-${item.name}-${Math.random()}`,
              name: item.name,
              amount: item.price,
              date: receiptData.date || new Date().toISOString().split('T')[0],
              category: existingCategory || 'Others' as ExpenseCategory.Others,
            };

            if (existingCategory) {
              newTransactions.push(newTransaction);
            } else {
              newItemsToCategorize.push(newTransaction);
            }
          });

          setTransactions(prev => [...prev, ...newTransactions]);
          setItemsToCategorize(prev => [...prev, ...newItemsToCategorize]);
          showToast('Receipt processed successfully!', 'success');

        } catch (error) {
          console.error("Error processing receipt: ", error);
          showToast(error instanceof Error ? error.message : "Failed to process receipt.", 'error');
        } finally {
          setIsLoading(false);
          setLoadingMessage('');
        }
      };
      reader.onerror = (error) => {
          console.error("File reading error: ", error);
          showToast("Failed to read the image file.", 'error');
          setIsLoading(false);
          setLoadingMessage('');
      };
    } catch (error) {
      console.error("Error setting up file reader: ", error);
      showToast("An unexpected error occurred.", 'error');
      setIsLoading(false);
      setLoadingMessage('');
    }
  }, [itemCategoryMap]);

  const handleCategorySelected = useCallback((transactionId: string, category: ExpenseCategory) => {
    const itemToCategorize = itemsToCategorize.find(t => t.id === transactionId);
    if (!itemToCategorize) return;

    const normalizedItemName = itemToCategorize.name.trim().toLowerCase();
    
    setItemCategoryMap(prev => ({ ...prev, [normalizedItemName]: category }));
    
    const updatedTransaction = { ...itemToCategorize, category };
    setTransactions(prev => [...prev, updatedTransaction]);

    setItemsToCategorize(prev => prev.filter(t => t.id !== transactionId));
  }, [itemsToCategorize]);

  const handleGetFeedback = useCallback(async () => {
    if (transactions.length === 0) {
      showToast('Not enough data for feedback. Please add more transactions.', 'error');
      return;
    }
    setIsLoading(true);
    setLoadingMessage('Generating financial insights...');
    setFeedback('');
    try {
      const aiFeedback = await getFinancialFeedback(transactions);
      setFeedback(aiFeedback);
    } catch (error) {
      console.error("Error getting feedback: ", error);
      showToast('Failed to get AI feedback.', 'error');
    } finally {
      setIsLoading(false);
      setLoadingMessage('');
    }
  }, [transactions]);
  
  const sortedTransactions = useMemo(() => {
    return [...transactions].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [transactions]);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-200 font-sans">
      <Header />
      <main className="container mx-auto p-4 md:p-8">
        {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <Dashboard transactions={transactions} />
            <TransactionList transactions={sortedTransactions} />
          </div>
          <div className="space-y-8">
            <UploadReceipt onReceiptUpload={handleReceiptUpload} isLoading={isLoading && loadingMessage.includes('receipt')} />
            <AIFeedback onGetFeedback={handleGetFeedback} feedback={feedback} isLoading={isLoading && loadingMessage.includes('insights')} />
          </div>
        </div>

        {itemsToCategorize.length > 0 && (
          <CategorySelectorModal
            transaction={itemsToCategorize[0]}
            onCategorySelected={handleCategorySelected}
            onClose={() => setItemsToCategorize(prev => prev.slice(1))}
          />
        )}
        
        {isLoading && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex flex-col items-center justify-center z-50">
                <div className="w-16 h-16 border-4 border-blue-400 border-t-transparent rounded-full animate-spin"></div>
                <p className="mt-4 text-white text-lg">{loadingMessage}</p>
            </div>
        )}
      </main>
    </div>
  );
};

export default App;
