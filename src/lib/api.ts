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

const DEFAULT_AV_KEY = '5NJSTUA4ZQ477QMS';
const FINNHUB_KEY = 'd4psf5hr01qjpnb1b9ogd4psf5hr01qjpnb1b9p0';
const FINNHUB_BASE_URL = 'https://finnhub.io/api/v1';

const fetchQuoteFinnhub = async (symbol: string): Promise<StockData> => {
  const response = await axios.get(`${FINNHUB_BASE_URL}/quote`, {
    params: { symbol, token: FINNHUB_KEY },
  });
  const data = response.data;
  // Finnhub returns 0s for invalid symbols sometimes, but usually just empty or specific codes.
  // Assuming standard response: c: Current, d: Change, dp: Percent, h: High, l: Low, o: Open, pc: Prev Close
  if (!data || data.c === 0) throw new Error('Invalid Finnhub data');

  return {
    symbol,
    price: data.c,
    change: data.d,
    changePercent: data.dp,
    volume: 0, // Finnhub quote endpoint doesn't return volume
    high: data.h,
    low: data.l,
    open: data.o,
    previousClose: data.pc,
    timestamp: new Date().toISOString(),
  };
};

const fetchHistoryFinnhub = async (symbol: string): Promise<ChartDataPoint[]> => {
  // Get last 30 days. resolution 'D'
  const to = Math.floor(Date.now() / 1000);
  const from = to - 30 * 24 * 60 * 60;
  
  const response = await axios.get(`${FINNHUB_BASE_URL}/stock/candle`, {
    params: {
      symbol,
      resolution: 'D',
      from,
      to,
      token: FINNHUB_KEY,
    },
  });

  const data = response.data;
  if (data.s !== 'ok' || !data.t) throw new Error('Invalid Finnhub history');

  return data.t.map((timestamp: number, index: number) => ({
    time: new Date(timestamp * 1000).toISOString().split('T')[0],
    open: data.o[index],
    high: data.h[index],
    low: data.l[index],
    close: data.c[index],
    volume: data.v[index],
  })).reverse();
};

export const fetchStockQuote = async (symbol: string, apiKey?: string): Promise<StockData> => {
  // 1. Try Alpha Vantage (User or Default)
  try {
    const keyToUse = apiKey || DEFAULT_AV_KEY;
    const response = await axios.get(ALPHA_VANTAGE_BASE_URL, {
      params: {
        function: 'GLOBAL_QUOTE',
        symbol,
        apikey: keyToUse,
      },
    });

    const data = response.data['Global Quote'];
    if (!data || Object.keys(data).length === 0) {
      // If default key fails, throw to try fallback
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
    console.warn('Alpha Vantage failed, trying Finnhub fallback...', error);
    
    // 2. Try Finnhub Fallback
    try {
      return await fetchQuoteFinnhub(symbol);
    } catch (finnhubError) {
      console.error('Finnhub fallback failed:', finnhubError);
      // 3. Mock Data Fallback
      return generateMockQuote(symbol);
    }
  }
};

export const fetchStockHistory = async (symbol: string, apiKey?: string): Promise<ChartDataPoint[]> => {
  // 1. Try Alpha Vantage
  try {
    const keyToUse = apiKey || DEFAULT_AV_KEY;
    const response = await axios.get(ALPHA_VANTAGE_BASE_URL, {
      params: {
        function: 'TIME_SERIES_DAILY',
        symbol,
        apikey: keyToUse,
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
    console.warn('Alpha Vantage history failed, trying Finnhub fallback...', error);
    
    // 2. Try Finnhub Fallback
    try {
      return await fetchHistoryFinnhub(symbol);
    } catch (finnhubError) {
      console.error('Finnhub history fallback failed:', finnhubError);
      // 3. Mock Data Fallback
      return generateMockHistory(symbol);
    }
  }
};
