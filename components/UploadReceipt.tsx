
import React, { useState, useCallback } from 'react';
import { DocumentArrowUpIcon, PhotoIcon } from './icons';

interface UploadReceiptProps {
  onReceiptUpload: (file: File) => void;
  isLoading: boolean;
}

const UploadReceipt: React.FC<UploadReceiptProps> = ({ onReceiptUpload, isLoading }) => {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(selectedFile);
    }
  };

  const handleSubmit = useCallback(() => {
    if (file) {
      onReceiptUpload(file);
    }
  }, [file, onReceiptUpload]);

  return (
    <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-lg">
      <h2 className="text-2xl font-bold text-slate-800 dark:text-white mb-4">Upload Receipt</h2>
      <div className="space-y-4">
        <label
          htmlFor="receipt-upload"
          className="relative block w-full border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-lg p-8 text-center cursor-pointer hover:border-blue-500 dark:hover:border-blue-400 transition-colors"
        >
          {preview ? (
            <img src={preview} alt="Receipt preview" className="mx-auto max-h-40 rounded-md object-contain" />
          ) : (
            <div className="flex flex-col items-center text-slate-500 dark:text-slate-400">
              <PhotoIcon className="h-12 w-12 mx-auto" />
              <span className="mt-2 block text-sm font-medium">Click to upload or drag & drop</span>
              <span className="text-xs">PNG, JPG, GIF up to 10MB</span>
            </div>
          )}
          <input
            id="receipt-upload"
            name="receipt-upload"
            type="file"
            className="sr-only"
            accept="image/*"
            onChange={handleFileChange}
            disabled={isLoading}
          />
        </label>
        
        <button
          onClick={handleSubmit}
          disabled={!file || isLoading}
          className="w-full flex justify-center items-center gap-2 bg-blue-600 text-white font-semibold py-3 px-4 rounded-lg shadow-md hover:bg-blue-700 disabled:bg-slate-400 disabled:cursor-not-allowed transition-all"
        >
          {isLoading ? (
            <>
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              Processing...
            </>
          ) : (
            <>
              <DocumentArrowUpIcon className="h-5 w-5" />
              Analyze Receipt
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default UploadReceipt;
