import React, { useState } from 'react';
import { X, RefreshCw, Check, AlertCircle, Plus, Search, Trash2 } from 'lucide-react';
import axios from 'axios';
import { WidgetType } from '@/types';

interface AddWidgetModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (
    title: string, 
    type: WidgetType, 
    config: { 
      apiUrl: string; 
      refreshInterval: number; 
      responsePath?: string;
      selectedFields?: { key: string; label: string }[];
      displayMode?: WidgetType;
    }
  ) => void;
}

const flattenObject = (obj: any, prefix = ''): string[] => {
  return Object.keys(obj).reduce((acc: string[], k: string) => {
    const pre = prefix.length ? prefix + '.' : '';
    if (typeof obj[k] === 'object' && obj[k] !== null && !Array.isArray(obj[k])) {
      acc.push(...flattenObject(obj[k], pre + k));
    } else {
      acc.push(pre + k);
    }
    return acc;
  }, []);
};

export const AddWidgetModal: React.FC<AddWidgetModalProps> = ({ isOpen, onClose, onAdd }) => {
  const [step, setStep] = useState<1 | 2>(1);
  const [title, setTitle] = useState('');
  const [apiUrl, setApiUrl] = useState('');
  const [refreshInterval, setRefreshInterval] = useState(30);
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<'success' | 'error' | null>(null);
  const [testError, setTestError] = useState('');
  const [apiData, setApiData] = useState<any>(null);
  
  const [displayMode, setDisplayMode] = useState<WidgetType>('CARD');
  const [searchField, setSearchField] = useState('');
  const [availableFields, setAvailableFields] = useState<string[]>([]);
  const [selectedFields, setSelectedFields] = useState<{ key: string; label: string }[]>([]);
  const [responsePath, setResponsePath] = useState('');

  if (!isOpen) return null;

  const handleTest = async () => {
    setIsTesting(true);
    setTestResult(null);
    setTestError('');
    try {
      const response = await axios.get(apiUrl);
      setApiData(response.data);
      setTestResult('success');
      
      // Analyze data to find fields
      let dataToAnalyze = response.data;
      // Simple heuristic: if it's an object with a "data" property that is an array, use that
      if (dataToAnalyze.data && Array.isArray(dataToAnalyze.data)) {
        setResponsePath('data');
        dataToAnalyze = dataToAnalyze.data[0];
      } else if (Array.isArray(dataToAnalyze)) {
        dataToAnalyze = dataToAnalyze[0];
      }
      
      if (dataToAnalyze) {
        const fields = flattenObject(dataToAnalyze);
        setAvailableFields(fields);
      }
      
    } catch (err) {
      setTestResult('error');
      setTestError((err as Error).message);
    } finally {
      setIsTesting(false);
    }
  };

  const handleAddField = (field: string) => {
    if (!selectedFields.find(f => f.key === field)) {
      // Extract the last part of the key as the default label
      const label = field.split('.').pop() || field;
      setSelectedFields([...selectedFields, { key: field, label }]);
    }
  };

  const handleRemoveField = (key: string) => {
    setSelectedFields(selectedFields.filter(f => f.key !== key));
  };

  const handleAddWidget = () => {
    console.log('handleAddWidget called', { title, displayMode, apiUrl, selectedFields });
    try {
      onAdd(title, displayMode, {
        apiUrl,
        refreshInterval: refreshInterval * 1000,
        responsePath,
        selectedFields,
        displayMode
      });
      console.log('onAdd success');
      onClose();
    } catch (error) {
      console.error('Error adding widget:', error);
    }
  };

  const filteredFields = availableFields.filter(f => f.toLowerCase().includes(searchField.toLowerCase()));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Add New Widget</h3>
          <button type="button" onClick={onClose} className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300">
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          {/* Step 1: Configuration */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Widget Name
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                placeholder="e.g., Bitcoin Price Tracker"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                API URL
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={apiUrl}
                  onChange={(e) => setApiUrl(e.target.value)}
                  className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  placeholder="https://api.example.com/data"
                />
                <button
                  type="button"
                  onClick={handleTest}
                  disabled={!apiUrl || isTesting}
                  className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 flex items-center gap-2 disabled:opacity-50"
                >
                  {isTesting ? <RefreshCw className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
                  Test
                </button>
              </div>
            </div>

            {testResult === 'success' && (
              <div className="p-3 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 rounded-lg flex items-center gap-2 text-sm">
                <Check className="w-4 h-4" />
                API connection successful! {availableFields.length} fields found.
              </div>
            )}

            {testResult === 'error' && (
              <div className="p-3 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 rounded-lg flex items-center gap-2 text-sm">
                <AlertCircle className="w-4 h-4" />
                Connection failed: {testError}
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Refresh Interval (seconds)
              </label>
              <input
                type="number"
                value={refreshInterval}
                onChange={(e) => setRefreshInterval(Number(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              />
            </div>
          </div>

          {/* Step 2: Field Selection (Only if test passed) */}
          {testResult === 'success' && (
            <div className="space-y-6 pt-6 border-t border-gray-100 dark:border-gray-700">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Display Mode
                </label>
                <div className="flex gap-2">
                  {(['CARD', 'TABLE', 'CHART'] as const).map((mode) => (
                    <button
                      type="button"
                      key={mode}
                      onClick={() => setDisplayMode(mode)}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                        displayMode === mode
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                      }`}
                    >
                      {mode.charAt(0) + mode.slice(1).toLowerCase()}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Search Fields
                </label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    value={searchField}
                    onChange={(e) => setSearchField(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                    placeholder="Search for fields..."
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-2 uppercase">
                    Available Fields
                  </label>
                  <div className="border border-gray-200 dark:border-gray-700 rounded-lg h-48 overflow-y-auto">
                    {filteredFields.map((field) => (
                      <button
                        type="button"
                        key={field}
                        onClick={() => handleAddField(field)}
                        className="w-full text-left px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 flex justify-between items-center group"
                      >
                        <span className="truncate" title={field}>{field}</span>
                        <Plus className="w-4 h-4 opacity-0 group-hover:opacity-100 text-blue-500" />
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-2 uppercase">
                    Selected Fields
                  </label>
                  <div className="border border-gray-200 dark:border-gray-700 rounded-lg h-48 overflow-y-auto bg-gray-50 dark:bg-gray-900/50">
                    {selectedFields.length === 0 ? (
                      <div className="h-full flex items-center justify-center text-sm text-gray-400">
                        No fields selected
                      </div>
                    ) : (
                      selectedFields.map((field) => (
                        <div
                          key={field.key}
                          className="px-3 py-2 text-sm text-gray-700 dark:text-gray-300 border-b border-gray-100 dark:border-gray-800 last:border-0 flex justify-between items-center"
                        >
                          <div className="flex-1 mr-2">
                            <div className="font-medium truncate" title={field.key}>{field.key}</div>
                            <input 
                              type="text" 
                              value={field.label}
                              onChange={(e) => {
                                const newFields = [...selectedFields];
                                const f = newFields.find(x => x.key === field.key);
                                if (f) f.label = e.target.value;
                                setSelectedFields(newFields);
                              }}
                              className="w-full bg-transparent text-xs text-gray-500 border-none p-0 focus:ring-0"
                            />
                          </div>
                          <button
                            type="button"
                            onClick={() => handleRemoveField(field.key)}
                            className="text-gray-400 hover:text-red-500"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="p-6 border-t border-gray-100 dark:border-gray-700 flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleAddWidget}
            disabled={!title || !apiUrl || (testResult !== 'success') || selectedFields.length === 0}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Add Widget
          </button>
        </div>
      </div>
    </div>
  );
};
