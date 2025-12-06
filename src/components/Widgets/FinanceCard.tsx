import React from 'react';
import { useStockQuote } from '@/hooks/useStockData';
import { useRealTimePrice } from '@/hooks/useRealTimePrice';
import { ArrowUp, ArrowDown, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface FinanceCardProps {
  symbol: string;
  refreshInterval?: number;
  metrics?: string[];
}

export const FinanceCard: React.FC<FinanceCardProps & { data?: any }> = ({ 
  symbol, 
  refreshInterval, 
  metrics = ['price', 'change', 'changePercent'],
  data: genericData 
}) => {
  const stockData = useStockQuote(symbol, refreshInterval);
  
  // If generic data is provided, use it
  if (genericData) {
    return (
      <div className="h-full flex flex-col justify-center p-4">
        <div className="grid gap-4">
          {metrics.map((metric) => (
            <div key={metric} className="flex justify-between items-center border-b border-gray-100 dark:border-gray-800 last:border-0 pb-2 last:pb-0">
              <span className="text-sm text-gray-500 dark:text-gray-400 capitalize">
                {metric.replace(/_/g, ' ')}
              </span>
              <span className="text-lg font-semibold text-gray-900 dark:text-white">
                {typeof genericData[metric] === 'number' 
                  ? genericData[metric].toLocaleString(undefined, { maximumFractionDigits: 2 })
                  : String(genericData[metric] || '-')}
              </span>
            </div>
          ))}
        </div>
      </div>
    );
  }

  const { data, isLoading, error } = stockData;
  const realTimePrice = useRealTimePrice(symbol);
  
  // Use real-time price if available, otherwise fallback to API data
  const displayPrice = realTimePrice ?? data?.price;

  if (isLoading) {
    return (
      <div className="h-full flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="h-full flex items-center justify-center text-red-500 text-sm">
        Error loading data
      </div>
    );
  }

  const isPositive = data.change >= 0;

  return (
    <div className="h-full flex flex-col justify-center p-2">
      <div className="text-sm text-gray-500 dark:text-gray-400 font-medium">
        {data.symbol}
      </div>
      
      {metrics.includes('price') && (
        <div className="text-3xl font-bold text-gray-900 dark:text-white mt-1">
          ${displayPrice?.toFixed(2)}
        </div>
      )}

      <div className={cn(
        "flex flex-wrap items-center gap-2 mt-2 text-sm font-medium",
        isPositive ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"
      )}>
        {(metrics.includes('change') || metrics.includes('changePercent')) && (
          <div className="flex items-center gap-1">
            {isPositive ? <ArrowUp className="w-4 h-4" /> : <ArrowDown className="w-4 h-4" />}
            {metrics.includes('change') && <span>{Math.abs(data.change).toFixed(2)}</span>}
            {metrics.includes('changePercent') && <span>({Math.abs(data.changePercent).toFixed(2)}%)</span>}
          </div>
        )}
      </div>

      <div className="grid grid-cols-2 gap-2 mt-auto pt-2 text-xs text-gray-500 dark:text-gray-400">
        {metrics.includes('volume') && (
          <div>Vol: {data.volume.toLocaleString()}</div>
        )}
        {metrics.includes('high') && (
          <div>High: ${data.high.toFixed(2)}</div>
        )}
        {metrics.includes('low') && (
          <div>Low: ${data.low.toFixed(2)}</div>
        )}
      </div>
    </div>
  );
};
