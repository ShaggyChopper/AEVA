
import React from 'react';
import { SparklesIcon, LightBulbIcon } from './icons';

interface AIFeedbackProps {
  onGetFeedback: () => void;
  feedback: string;
  isLoading: boolean;
}

const AIFeedback: React.FC<AIFeedbackProps> = ({ onGetFeedback, feedback, isLoading }) => {
  return (
    <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-lg">
      <h2 className="text-2xl font-bold text-slate-800 dark:text-white mb-4">AI Financial Advisor</h2>
      
      {feedback ? (
         <div className="p-4 bg-blue-50 dark:bg-slate-700/50 rounded-lg space-y-2 prose prose-sm dark:prose-invert max-w-none">
            <p className="font-semibold text-blue-800 dark:text-blue-300 flex items-center gap-2"><LightBulbIcon className="h-5 w-5"/> Gemini's Insights</p>
            {feedback.split('\n').map((line, index) => <p key={index}>{line}</p>)}
         </div>
      ) : (
        <div className="text-center py-6 text-slate-500 dark:text-slate-400 border border-dashed dark:border-slate-700 rounded-lg">
          <p>Click the button to get personalized feedback on your spending habits.</p>
        </div>
      )}
      
      <button
        onClick={onGetFeedback}
        disabled={isLoading}
        className="w-full mt-4 flex justify-center items-center gap-2 bg-gradient-to-r from-purple-500 to-indigo-600 text-white font-semibold py-3 px-4 rounded-lg shadow-md hover:opacity-90 disabled:from-slate-400 disabled:to-slate-400 disabled:cursor-not-allowed transition-all"
      >
        {isLoading ? (
          <>
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
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
