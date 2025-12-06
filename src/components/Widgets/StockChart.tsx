import React from 'react';
import { useStockHistory } from '@/hooks/useStockData';
import { Loader2 } from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
  ComposedChart,
  Bar,
  ErrorBar,
  Cell
} from 'recharts';

interface StockChartProps {
  symbol: string;
  type?: 'line' | 'candle';
  data?: any[];
  dataKeys?: { x: string; y: string };
}

export const StockChart: React.FC<StockChartProps> = ({ symbol, type = 'line', data: genericData, dataKeys }) => {
  const stockHistory = useStockHistory(symbol);
  const containerRef = React.useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = React.useState({ width: 0, height: 0 });

  React.useEffect(() => {
    if (!containerRef.current) return;

    const resizeObserver = new ResizeObserver((entries) => {
      if (entries[0]) {
        const { width, height } = entries[0].contentRect;
        setDimensions({ width, height });
      }
    });

    resizeObserver.observe(containerRef.current);

    return () => resizeObserver.disconnect();
  }, []);

  // Generic Chart Render
  if (genericData && dataKeys) {
    return (
      <div ref={containerRef} className="w-full h-full min-h-[200px]">
        {dimensions.width > 0 && dimensions.height > 0 && (
          <AreaChart width={dimensions.width} height={dimensions.height} data={genericData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
            <XAxis 
              dataKey={dataKeys.x} 
              tick={{ fontSize: 12, fill: '#9ca3af' }} 
              tickLine={false}
              axisLine={false}
              minTickGap={30}
            />
            <YAxis 
              domain={['auto', 'auto']} 
              tick={{ fontSize: 12, fill: '#9ca3af' }} 
              tickLine={false}
              axisLine={false}
              tickFormatter={(value) => typeof value === 'number' ? value.toFixed(2) : value}
            />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: '#fff', 
                borderRadius: '8px', 
                border: '1px solid #e5e7eb',
                boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
              }}
            />
            <Area 
              type="monotone" 
              dataKey={dataKeys.y} 
              stroke="#3b82f6" 
              strokeWidth={2}
              fillOpacity={1} 
              fill="url(#colorValue)" 
            />
          </AreaChart>
        )}
      </div>
    );
  }

  const { data, isLoading, error } = stockHistory;

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
        Error loading chart
      </div>
    );
  }

  // Prepare data for candle chart
  const candleData = data.map(d => ({
    ...d,
    // Ranges for bars
    wickRange: [d.low, d.high] as [number, number],
    bodyRange: [Math.min(d.open, d.close), Math.max(d.open, d.close)] as [number, number],
    // Color based on movement
    color: d.close > d.open ? '#22c55e' : '#ef4444',
  }));

  return (
    <div ref={containerRef} className="w-full h-full min-h-[200px]">
      {dimensions.width > 0 && dimensions.height > 0 && (
        type === 'candle' ? (
          <ComposedChart width={dimensions.width} height={dimensions.height} data={candleData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
            <XAxis 
              dataKey="time" 
              tick={{ fontSize: 12, fill: '#9ca3af' }} 
              tickLine={false}
              axisLine={false}
              minTickGap={30}
            />
            <YAxis 
              domain={['auto', 'auto']} 
              tick={{ fontSize: 12, fill: '#9ca3af' }} 
              tickLine={false}
              axisLine={false}
              tickFormatter={(value) => `$${value.toFixed(0)}`}
            />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: '#fff', 
                borderRadius: '8px', 
                border: '1px solid #e5e7eb',
                boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
              }}
              formatter={(value: any, name: string, props: any) => {
                if (name === 'wickRange' || name === 'bodyRange') return [null, null]; // Hide ranges from tooltip
                return [value, name];
              }}
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const d = payload[0].payload;
                  return (
                    <div className="bg-white p-2 border border-gray-200 rounded shadow-sm text-sm">
                      <p className="font-semibold text-gray-700">{d.time}</p>
                      <p className="text-gray-600">Open: <span className="font-medium">${d.open.toFixed(2)}</span></p>
                      <p className="text-gray-600">High: <span className="font-medium">${d.high.toFixed(2)}</span></p>
                      <p className="text-gray-600">Low: <span className="font-medium">${d.low.toFixed(2)}</span></p>
                      <p className="text-gray-600">Close: <span className="font-medium">${d.close.toFixed(2)}</span></p>
                    </div>
                  );
                }
                return null;
              }}
            />
            
            {/* Wick Bar */}
            <Bar dataKey="wickRange" barSize={1} fill="#374151">
              {candleData.map((entry, index) => (
                <Cell key={`cell-wick-${index}`} fill={entry.color} />
              ))}
            </Bar>
            
            {/* Body Bar */}
            <Bar dataKey="bodyRange" barSize={8}>
              {candleData.map((entry, index) => (
                <Cell key={`cell-body-${index}`} fill={entry.color} />
              ))}
            </Bar>
          </ComposedChart>
        ) : (
          <AreaChart width={dimensions.width} height={dimensions.height} data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
            <XAxis 
              dataKey="time" 
              tick={{ fontSize: 12, fill: '#9ca3af' }} 
              tickLine={false}
              axisLine={false}
              minTickGap={30}
            />
            <YAxis 
              domain={['auto', 'auto']} 
              tick={{ fontSize: 12, fill: '#9ca3af' }} 
              tickLine={false}
              axisLine={false}
              tickFormatter={(value) => `$${value.toFixed(0)}`}
            />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: '#fff', 
                borderRadius: '8px', 
                border: '1px solid #e5e7eb',
                boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
              }}
            />
            <Area 
              type="monotone" 
              dataKey="close" 
              stroke="#3b82f6" 
              strokeWidth={2}
              fillOpacity={1} 
              fill="url(#colorPrice)" 
            />
          </AreaChart>
        )
      )}
    </div>
  );
};
