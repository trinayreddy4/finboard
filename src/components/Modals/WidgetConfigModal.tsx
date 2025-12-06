import React, { useState, useEffect } from 'react';
import { Widget } from '@/types';
import { X } from 'lucide-react';

interface WidgetConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  widget: Widget | null;
  onSave: (id: string, title: string, config: any) => void;
}

export const WidgetConfigModal: React.FC<WidgetConfigModalProps> = ({ isOpen, onClose, widget, onSave }) => {
  const [title, setTitle] = useState('');
  const [symbol, setSymbol] = useState('');
  const [refreshInterval, setRefreshInterval] = useState(60000);
  const [chartType, setChartType] = useState<'line' | 'candle'>('line');
  const [metrics, setMetrics] = useState<string[]>(['price', 'change', 'changePercent']);

  useEffect(() => {
    if (widget) {
      setTitle(widget.title);
      setSymbol(widget.config.symbol || '');
      setRefreshInterval(widget.config.refreshInterval || 60000);
      setChartType(widget.config.chartType || 'line');
      setMetrics(widget.config.metrics || ['price', 'change', 'changePercent']);
    }
  }, [widget]);

  if (!isOpen || !widget) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(widget.id, title, { symbol, refreshInterval, chartType, metrics });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-md overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Configure Widget</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300">
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Title
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
            />
          </div>

          {widget.type !== 'TABLE' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Stock Symbol
              </label>
              <input
                type="text"
                value={symbol}
                onChange={(e) => setSymbol(e.target.value.toUpperCase())}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                placeholder="e.g., AAPL"
              />
            </div>
          )}

          {widget.type === 'CHART' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Chart Type
              </label>
              <select
                value={chartType}
                onChange={(e) => setChartType(e.target.value as 'line' | 'candle')}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              >
                <option value="line">Line Chart</option>
                <option value="candle">Candle Chart</option>
              </select>
            </div>
          )}

          {widget.type === 'CARD' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Visible Metrics
              </label>
              <div className="space-y-2">
                {['price', 'change', 'changePercent', 'volume', 'high', 'low'].map((metric) => (
                  <label key={metric} className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={metrics.includes(metric)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setMetrics([...metrics, metric]);
                        } else {
                          setMetrics(metrics.filter(m => m !== metric));
                        }
                      }}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="capitalize">{metric.replace(/([A-Z])/g, ' $1').trim()}</span>
                  </label>
                ))}
              </div>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Refresh Interval (seconds)
            </label>
            <select
              value={refreshInterval / 1000}
              onChange={(e) => setRefreshInterval(Number(e.target.value) * 1000)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
            >
              <option value={10}>10s</option>
              <option value={30}>30s</option>
              <option value={60}>1m</option>
              <option value={300}>5m</option>
            </select>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg"
            >
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
