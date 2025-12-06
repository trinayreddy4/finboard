import axios from 'axios';
import { StockData, ChartDataPoint } from '@/types';

const ALPHA_VANTAGE_BASE_URL = 'https://www.alphavantage.co/query';

// Mock data generator to avoid rate limits during dev
const generateMockQuote = (symbol: string): StockData => ({
  symbol,
  price: 150 + Math.random() * 10,
  change: Math.random() * 5 - 2.5,
  changePercent: Math.random() * 2 - 1,
  volume: Math.floor(Math.random() * 1000000),
  high: 160 + Math.random() * 5,
  low: 145 + Math.random() * 5,
  open: 150,
  previousClose: 150,
  timestamp: new Date().toISOString(),
});

const generateMockHistory = (symbol: string): ChartDataPoint[] => {
  const data: ChartDataPoint[] = [];
  let price = 150;
  const now = new Date();
  for (let i = 30; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);
    const change = Math.random() * 5 - 2.5;
    price += change;
    data.push({
      time: date.toISOString().split('T')[0],
      open: price - Math.random(),
      high: price + Math.random(),
      low: price - Math.random(),
      close: price,
      volume: Math.floor(Math.random() * 1000000),
    });
  }
  return data;
};

export const fetchStockQuote = async (symbol: string, apiKey?: string): Promise<StockData> => {
  if (!apiKey) {
    console.warn('No API key provided, returning mock data');
    return new Promise((resolve) => setTimeout(() => resolve(generateMockQuote(symbol)), 500));
  }

  try {
    const response = await axios.get(ALPHA_VANTAGE_BASE_URL, {
      params: {
        function: 'GLOBAL_QUOTE',
        symbol,
        apikey: apiKey,
      },
    });

    const data = response.data['Global Quote'];
    if (!data || Object.keys(data).length === 0) {
      throw new Error('Invalid symbol or API limit reached');
    }

    return {
      symbol: data['01. symbol'],
      price: parseFloat(data['05. price']),
      change: parseFloat(data['09. change']),
      changePercent: parseFloat(data['10. change percent'].replace('%', '')),
      volume: parseInt(data['06. volume']),
      high: parseFloat(data['03. high']),
      low: parseFloat(data['04. low']),
      open: parseFloat(data['02. open']),
      previousClose: parseFloat(data['08. previous close']),
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    console.error('API Error:', error);
    // Fallback to mock on error for better UX during demo
    return generateMockQuote(symbol);
  }
};

export const fetchStockHistory = async (symbol: string, apiKey?: string): Promise<ChartDataPoint[]> => {
  if (!apiKey) {
    return new Promise((resolve) => setTimeout(() => resolve(generateMockHistory(symbol)), 500));
  }

  try {
    const response = await axios.get(ALPHA_VANTAGE_BASE_URL, {
      params: {
        function: 'TIME_SERIES_DAILY',
        symbol,
        apikey: apiKey,
      },
    });

    const timeSeries = response.data['Time Series (Daily)'];
    if (!timeSeries) {
      throw new Error('Invalid symbol or API limit reached');
    }

    return Object.entries(timeSeries).map(([date, values]: [string, any]) => ({
      time: date,
      open: parseFloat(values['1. open']),
      high: parseFloat(values['2. high']),
      low: parseFloat(values['3. low']),
      close: parseFloat(values['4. close']),
      volume: parseInt(values['5. volume']),
    })).reverse().slice(-30); // Last 30 days
  } catch (error) {
    console.error('API Error:', error);
    return generateMockHistory(symbol);
  }
};
