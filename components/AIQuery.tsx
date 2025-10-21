import React, { useState } from 'react';
import { ChatBubbleLeftRightIcon, PaperAirplaneIcon } from './icons';

interface AIQueryProps {
  onAskQuery: (question: string) => void;
  answer: string;
  isLoading: boolean;
  isOnline: boolean;
}

const exampleQuestions = [
    "How much did I spend on Groceries last month?",
    "What was my most expensive purchase?",
    "Where did I buy coffee most often?",
    "List all my transactions at Amazon.",
];

const AIQuery: React.FC<AIQueryProps> = ({ onAskQuery, answer, isLoading, isOnline }) => {
    const [question, setQuestion] = useState('');

    const handleAsk = () => {
        if (question.trim()) {
            onAskQuery(question.trim());
        }
    };

    const handleExampleClick = (example: string) => {
        setQuestion(example);
        onAskQuery(example);
    }
    
    const buttonDisabled = isLoading || !isOnline || !question.trim();

    return (
        <div className="bg-white dark:bg-[#1e1f20] p-6 rounded-2xl shadow-lg border border-transparent dark:border-[#444746]">
            <h2 className="text-2xl font-bold text-slate-800 dark:text-[#e3e3e3] mb-4 flex items-center gap-2">
                <ChatBubbleLeftRightIcon className="h-6 w-6 text-slate-500" />
                Ask AEVA
            </h2>
            
            <div className="space-y-4">
                <div className="relative">
                    <textarea
                        value={question}
                        onChange={(e) => setQuestion(e.target.value)}
                        placeholder="e.g., Where was the kebab more affordable?"
                        rows={3}
                        className="block w-full px-3 py-2 pr-12 bg-white dark:bg-[#282a2c] border border-slate-300 dark:border-[#444746] rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm resize-none"
                        disabled={isLoading}
                    />
                    <button
                        onClick={handleAsk}
                        disabled={buttonDisabled}
                        className="absolute bottom-2 right-2 p-2 rounded-full bg-blue-600 text-white dark:bg-[#8ab4f8] dark:text-[#202124] hover:bg-blue-700 dark:hover:bg-[#9ac0fa] disabled:bg-slate-400 dark:disabled:bg-[#3c4043] dark:disabled:text-[#8a8a8a] disabled:cursor-not-allowed transition-colors"
                        aria-label="Ask question"
                    >
                        <PaperAirplaneIcon className="h-5 w-5"/>
                    </button>
                </div>

                <div className="flex flex-wrap gap-2">
                    {exampleQuestions.map((q, i) => (
                        <button 
                            key={i} 
                            onClick={() => handleExampleClick(q)}
                            disabled={isLoading}
                            className="text-xs font-medium px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 dark:bg-[#3c4043] dark:text-[#e3e3e3] hover:bg-slate-200 dark:hover:bg-[#444746] transition-colors disabled:opacity-50"
                        >
                            {q}
                        </button>
                    ))}
                </div>
                
                {(isLoading || answer) && (
                    <div className="mt-4 p-4 bg-slate-50 dark:bg-[#8ab4f8]/10 rounded-lg space-y-2 text-slate-700 dark:text-[#e3e3e3]">
                        {isLoading ? (
                             <div className="flex items-center gap-3">
                                <div className="w-5 h-5 border-2 border-slate-400 dark:border-slate-500 border-t-transparent rounded-full animate-spin"></div>
                                <span className="text-sm text-slate-500 dark:text-[#9aa0a6]">AEVA is thinking...</span>
                            </div>
                        ) : (
                            <>
                                <p className="font-semibold text-blue-800 dark:text-[#8ab4f8]">AEVA's Answer:</p>
                                <p className="text-sm whitespace-pre-wrap">{answer}</p>
                            </>
                        )}
                    </div>
                )}
                {!isOnline && (
                    <p className="text-center text-xs text-amber-500 dark:text-amber-400 mt-2">
                        Connect to the internet to ask questions.
                    </p>
                )}
            </div>
        </div>
    );
};

export default AIQuery;
