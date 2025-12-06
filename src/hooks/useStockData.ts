import { useQuery } from '@tanstack/react-query';
import { fetchStockQuote, fetchStockHistory } from '@/lib/api';
import { useStore } from '@/store/store';

export const useStockQuote = (symbol: string, refreshInterval: number = 60000) => {
  const { apiKeys } = useStore();
  const apiKey = apiKeys['alphavantage'];

  return useQuery({
    queryKey: ['stock', 'quote', symbol],
    queryFn: () => fetchStockQuote(symbol, apiKey),
    refetchInterval: refreshInterval,
  });
};

export const useStockHistory = (symbol: string) => {
  const { apiKeys } = useStore();
  const apiKey = apiKeys['alphavantage'];

  return useQuery({
    queryKey: ['stock', 'history', symbol],
    queryFn: () => fetchStockHistory(symbol, apiKey),
  });
};
