import React, { useState } from 'react';
import { PlusIcon, CameraIcon, CurrencyDollarIcon } from './icons';

interface FloatingActionButtonProps {
  onAddIncomeClick: () => void;
  onUploadReceiptClick: () => void;
}

const FloatingActionButton: React.FC<FloatingActionButtonProps> = ({ onAddIncomeClick, onUploadReceiptClick }) => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleMenu = () => setIsOpen(!isOpen);

  return (
    <div className="fixed bottom-6 right-6 z-40">
      <div className="relative flex flex-col items-end gap-3">
        {/* Sub-buttons */}
        <div
          className={`transition-all duration-300 ease-in-out flex flex-col items-end gap-3 ${
            isOpen ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'
          }`}
        >
          <div className="flex items-center gap-3">
            <span className="bg-white dark:bg-[#282a2c] text-sm text-slate-700 dark:text-[#e3e3e3] px-3 py-1.5 rounded-lg shadow-md">
              Camera: Upload Receipt
            </span>
            <button
              onClick={() => {
                onUploadReceiptClick();
                setIsOpen(false);
              }}
              className="bg-white dark:bg-[#282a2c] p-3 rounded-full shadow-lg hover:bg-slate-100 dark:hover:bg-[#3c4043] transition-colors"
              aria-label="Upload receipt with camera"
            >
              <CameraIcon className="h-6 w-6 text-slate-700 dark:text-[#e3e3e3]" />
            </button>
          </div>

          <div className="flex items-center gap-3">
            <span className="bg-white dark:bg-[#282a2c] text-sm text-slate-700 dark:text-[#e3e3e3] px-3 py-1.5 rounded-lg shadow-md">
              Add Income
            </span>
            <button
              onClick={() => {
                onAddIncomeClick();
                setIsOpen(false);
              }}
              className="bg-white dark:bg-[#282a2c] p-3 rounded-full shadow-lg hover:bg-slate-100 dark:hover:bg-[#3c4043] transition-colors"
              aria-label="Add income"
            >
              <CurrencyDollarIcon className="h-6 w-6 text-green-500" />
            </button>
          </div>
        </div>

        {/* Main button */}
        <button
          onClick={toggleMenu}
          className={`bg-blue-600 dark:bg-[#8ab4f8] text-white dark:text-[#202124] p-4 rounded-full shadow-xl hover:bg-blue-700 dark:hover:bg-[#9ac0fa] focus:outline-none focus:ring-4 focus:ring-blue-300 dark:focus:ring-[#8ab4f8]/50 transition-transform duration-300 ${
            isOpen ? 'rotate-45' : ''
          }`}
          aria-expanded={isOpen}
          aria-label="Add transaction menu"
        >
          <PlusIcon className="h-7 w-7" />
        </button>
      </div>
    </div>
  );
};

export default FloatingActionButton;
