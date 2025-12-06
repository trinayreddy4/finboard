export type WidgetType = 'TABLE' | 'CHART' | 'CARD';

export interface WidgetConfig {
  symbol?: string;
  interval?: string; // 'daily', 'weekly', 'monthly'
  chartType?: 'line' | 'candle';
  metrics?: string[]; // For cards or tables
  refreshInterval?: number; // in milliseconds
  
  // Generic API Config
  apiUrl?: string;
  responsePath?: string; // Path to data in response (e.g. "data.rates")
  selectedFields?: { key: string; label: string }[]; // Fields to display
  displayMode?: 'CARD' | 'TABLE' | 'CHART';
}

export interface Widget {
  id: string;
  type: WidgetType;
  title: string;
  config: WidgetConfig;
}

export interface LayoutItem {
  i: string;
  x: number;
  y: number;
  w: number;
  h: number;
}

export interface StockData {
  symbol: string;
  price: number;
  change: number;
  changePercent: number;
  volume: number;
  high: number;
  low: number;
  open: number;
  previousClose: number;
  timestamp: string;
}

export interface ChartDataPoint {
  time: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}
