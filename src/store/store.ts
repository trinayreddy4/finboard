import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Widget, LayoutItem, WidgetType } from '@/types';

interface DashboardState {
  widgets: Widget[];
  layout: LayoutItem[];
  theme: 'light' | 'dark';
  apiKeys: Record<string, string>;
  
  addWidget: (title: string, type: WidgetType, config?: Partial<Widget['config']>) => void;
  removeWidget: (id: string) => void;
  updateLayout: (layout: LayoutItem[]) => void;
  updateWidgetConfig: (id: string, config: Partial<Widget['config']>) => void;
  updateWidgetTitle: (id: string, title: string) => void;
  setTheme: (theme: 'light' | 'dark') => void;
  setApiKey: (provider: string, key: string) => void;
}

const DEFAULT_LAYOUT: LayoutItem[] = [
  { i: '1', x: 0, y: 0, w: 12, h: 4 }, // Finance Cards
  { i: '2', x: 0, y: 4, w: 8, h: 10 }, // Chart
  { i: '3', x: 8, y: 4, w: 4, h: 10 }, // Watchlist
];

const DEFAULT_WIDGETS: Widget[] = [
  { 
    id: '1', 
    type: 'CARD', 
    title: 'Market Overview', 
    config: { symbol: 'IBM', metrics: ['price', 'change', 'changePercent'] } 
  },
  { 
    id: '2', 
    type: 'CHART', 
    title: 'IBM Stock Price', 
    config: { symbol: 'IBM', interval: 'daily', chartType: 'line' } 
  },
  { 
    id: '3', 
    type: 'TABLE', 
    title: 'Watchlist', 
    config: { metrics: ['symbol', 'price', 'change'] } 
  },
];

export const useStore = create<DashboardState>()(
  persist(
    (set) => ({
      widgets: DEFAULT_WIDGETS,
      layout: DEFAULT_LAYOUT,
      theme: 'light',
      apiKeys: {},

  addWidget: (title: string, type: WidgetType, config: Partial<Widget['config']> = {}) => set((state) => {
    try {
      console.log('store.addWidget called', { title, type, config, layoutLength: state.layout?.length });
      const id = typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `widget-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      const newWidget: Widget = {
        id,
        type,
        title,
        config: {
          symbol: 'IBM', // Default fallback
          ...config
        },
      };
      
      // Find first available spot or append to bottom
      const currentLayout = Array.isArray(state.layout) ? state.layout : [];
      const y = currentLayout.reduce((max, item) => Math.max(max, item.y + item.h), 0);
      const newLayoutItem: LayoutItem = {
        i: id,
        x: 0,
        y,
        w: type === 'CARD' ? 4 : 6,
        h: type === 'CARD' ? 2 : 8,
      };

      console.log('store.addWidget success', { newWidget, newLayoutItem });
      return {
        widgets: [...(state.widgets || []), newWidget],
        layout: [...currentLayout, newLayoutItem],
      };
    } catch (error) {
      console.error('CRITICAL STORE ERROR in addWidget:', error);
      return state;
    }
  }),

      removeWidget: (id) => set((state) => ({
        widgets: state.widgets.filter((w) => w.id !== id),
        layout: state.layout.filter((l) => l.i !== id),
      })),

      updateLayout: (layout) => set({ layout }),

      updateWidgetConfig: (id, config) => set((state) => ({
        widgets: state.widgets.map((w) => 
          w.id === id ? { ...w, config: { ...w.config, ...config } } : w
        ),
      })),

      updateWidgetTitle: (id, title) => set((state) => ({
        widgets: state.widgets.map((w) => 
          w.id === id ? { ...w, title } : w
        ),
      })),

      setTheme: (theme) => set({ theme }),

      setApiKey: (provider, key) => set((state) => ({
        apiKeys: { ...state.apiKeys, [provider]: key },
      })),
    }),
    {
      name: 'finboard-storage',
    }
  )
);
