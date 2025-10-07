
import React from 'react';
import { SparklesIcon, LightBulbIcon } from './icons';

interface AIFeedbackProps {
  onGetFeedback: () => void;
  feedback: string;
  isLoading: boolean;
}

const AIFeedback: React.FC<AIFeedbackProps> = ({ onGetFeedback, feedback, isLoading }) => {
  return (
    <div className="bg-white dark:bg-[#1e1f20] p-6 rounded-2xl shadow-lg border border-transparent dark:border-[#444746]">
      <h2 className="text-2xl font-bold text-slate-800 dark:text-[#e3e3e3] mb-4">AI Financial Advisor</h2>
      
      {feedback ? (
         <div className="p-4 bg-blue-50 dark:bg-[#8ab4f8]/10 rounded-lg space-y-2 text-slate-700 dark:text-[#e3e3e3]">
            <p className="font-semibold text-blue-800 dark:text-[#8ab4f8] flex items-center gap-2"><LightBulbIcon className="h-5 w-5"/> Gemini's Insights</p>
            {feedback.split('\n').map((line, index) => <p key={index} className="text-sm">{line}</p>)}
         </div>
      ) : (
        <div className="text-center py-6 text-slate-500 dark:text-[#9aa0a6] border border-dashed dark:border-[#444746] rounded-lg">
          <p>Get personalized feedback and price comparisons on your spending habits.</p>
        </div>
      )}
      
      <button
        onClick={onGetFeedback}
        disabled={isLoading}
        className="w-full mt-4 flex justify-center items-center gap-2 bg-blue-600 text-white dark:bg-[#8ab4f8] dark:text-[#202124] font-semibold py-3 px-4 rounded-lg shadow-md hover:bg-blue-700 dark:hover:bg-[#9ac0fa] disabled:bg-slate-400 dark:disabled:bg-[#3c4043] dark:disabled:text-[#8a8a8a] disabled:cursor-not-allowed transition-all"
      >
        {isLoading ? (
          <>
            <div className="w-5 h-5 border-2 border-white dark:border-[#202124] border-t-transparent rounded-full animate-spin"></div>
            Generating...
          </>
        ) : (
          <>
            <SparklesIcon className="h-5 w-5" />
            {feedback ? 'Regenerate Feedback' : 'Get AI Feedback'}
          </>
        )}
      </button>
    </div>
  );
};

export default AIFeedback;