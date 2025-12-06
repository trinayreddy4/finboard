import React, { useState, useEffect } from 'react';
import { useStore } from '@/store/store';
import { X, Key } from 'lucide-react';

interface ApiKeysModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ApiKeysModal: React.FC<ApiKeysModalProps> = ({ isOpen, onClose }) => {
  const { apiKeys, setApiKey } = useStore();
  const [alphaVantageKey, setAlphaVantageKey] = useState('');
  const [finnhubKey, setFinnhubKey] = useState('');

  useEffect(() => {
    if (isOpen) {
      setAlphaVantageKey(apiKeys['alphavantage'] || '');
      setFinnhubKey(apiKeys['finnhub'] || '');
    }
  }, [isOpen, apiKeys]);

  if (!isOpen) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setApiKey('alphavantage', alphaVantageKey);
    setApiKey('finnhub', finnhubKey);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-md overflow-hidden border border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
            <Key className="w-5 h-5 text-blue-500" />
            API Configuration
          </h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <form onSubmit={handleSave} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Alpha Vantage API Key
            </label>
            <input
              type="text"
              value={alphaVantageKey}
              onChange={(e) => setAlphaVantageKey(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              placeholder="Enter key for historical data"
            />
            <p className="text-xs text-gray-500 mt-1">Required for charts and basic quotes.</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Finnhub API Key
            </label>
            <input
              type="text"
              value={finnhubKey}
              onChange={(e) => setFinnhubKey(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              placeholder="Enter key for real-time sockets"
            />
            <p className="text-xs text-gray-500 mt-1">Required for live real-time updates.</p>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
            >
              Save Keys
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
