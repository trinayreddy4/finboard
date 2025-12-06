import React, { useState } from 'react';
import { useStockQuote } from '@/hooks/useStockData';
import { Loader2, ArrowUp, ArrowDown, Search } from 'lucide-react';
import { cn } from '@/lib/utils';

// Helper component for single row to use the hook
const StockRow = ({ symbol }: { symbol: string }) => {
  const { data, isLoading, error } = useStockQuote(symbol);

  if (isLoading) {
    return (
      <tr className="border-b border-gray-100 dark:border-gray-800">
        <td className="py-3 px-4 text-sm font-medium text-gray-900 dark:text-white">{symbol}</td>
        <td className="py-3 px-4" colSpan={3}>
          <Loader2 className="w-4 h-4 animate-spin text-gray-400" />
        </td>
      </tr>
    );
  }

  if (error || !data) {
    return (
      <tr className="border-b border-gray-100 dark:border-gray-800">
        <td className="py-3 px-4 text-sm font-medium text-gray-900 dark:text-white">{symbol}</td>
        <td className="py-3 px-4 text-sm text-red-500" colSpan={3}>Error</td>
      </tr>
    );
  }

  const isPositive = data.change >= 0;

  return (
    <tr className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-900/50 transition-colors">
      <td className="py-3 px-4 text-sm font-medium text-gray-900 dark:text-white">{data.symbol}</td>
      <td className="py-3 px-4 text-sm text-gray-700 dark:text-gray-300">${data.price.toFixed(2)}</td>
      <td className={cn(
        "py-3 px-4 text-sm font-medium flex items-center gap-1",
        isPositive ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"
      )}>
        {isPositive ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />}
        {Math.abs(data.change).toFixed(2)}
      </td>
      <td className={cn(
        "py-3 px-4 text-sm font-medium",
        isPositive ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"
      )}>
        {data.changePercent.toFixed(2)}%
      </td>
    </tr>
  );
};

interface StockTableProps {
  symbols?: string[];
  data?: any[];
  columns?: { key: string; label: string }[];
}

export const StockTable: React.FC<StockTableProps> = ({ 
  symbols = ['AAPL', 'MSFT', 'GOOGL', 'AMZN', 'TSLA', 'IBM', 'NVDA', 'META'],
  data,
  columns
}) => {
  const [search, setSearch] = useState('');

  // Generic Table Render
  if (data && columns) {
    const filteredData = data.filter(item => 
      columns.some(col => 
        String(item[col.key] || '').toLowerCase().includes(search.toLowerCase())
      )
    );

    return (
      <div className="w-full h-full flex flex-col">
        <div className="p-2 border-b border-gray-100 dark:border-gray-800">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-sm border border-gray-200 dark:border-gray-700 rounded-md bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>
        </div>
        <div className="flex-1 overflow-auto">
          <table className="w-full text-left border-collapse">
            <thead className="sticky top-0 bg-white dark:bg-gray-800 z-10">
              <tr className="border-b border-gray-200 dark:border-gray-700">
                {columns.map(col => (
                  <th key={col.key} className="py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    {col.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filteredData.length > 0 ? (
                filteredData.map((row, i) => (
                  <tr key={i} className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-900/50 transition-colors">
                    {columns.map(col => (
                      <td key={col.key} className="py-3 px-4 text-sm text-gray-700 dark:text-gray-300">
                        {typeof row[col.key] === 'object' ? JSON.stringify(row[col.key]) : String(row[col.key] || '-')}
                      </td>
                    ))}
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={columns.length} className="py-8 text-center text-sm text-gray-500 dark:text-gray-400">
                    No results found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  const filteredSymbols = symbols.filter(s => s.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="w-full h-full flex flex-col">
      <div className="p-2 border-b border-gray-100 dark:border-gray-800">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search stocks..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-sm border border-gray-200 dark:border-gray-700 rounded-md bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>
      </div>
      <div className="flex-1 overflow-auto">
        <table className="w-full text-left border-collapse">
          <thead className="sticky top-0 bg-white dark:bg-gray-800 z-10">
            <tr className="border-b border-gray-200 dark:border-gray-700">
              <th className="py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Symbol</th>
              <th className="py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Price</th>
              <th className="py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Change</th>
              <th className="py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">% Change</th>
            </tr>
          </thead>
          <tbody>
            {filteredSymbols.length > 0 ? (
              filteredSymbols.map((symbol) => (
                <StockRow key={symbol} symbol={symbol} />
              ))
            ) : (
              <tr>
                <td colSpan={4} className="py-8 text-center text-sm text-gray-500 dark:text-gray-400">
                  No stocks found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
