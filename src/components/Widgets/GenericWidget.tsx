import React from 'react';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { Widget } from '@/types';
import { FinanceCard } from './FinanceCard';
import { StockTable } from './StockTable';
import { StockChart } from './StockChart';
import { Loader2 } from 'lucide-react';

interface GenericWidgetProps {
  widget: Widget;
}

const getNestedData = (obj: any, path: string) => {
  if (!path) return obj;
  return path.split('.').reduce((acc, part) => acc && acc[part], obj);
};

export const GenericWidget: React.FC<GenericWidgetProps> = ({ widget }) => {
  const { config } = widget;
  const { apiUrl, responsePath, refreshInterval = 60000, selectedFields, displayMode } = config;

  const { data, isLoading, error } = useQuery({
    queryKey: ['generic-widget', widget.id, apiUrl],
    queryFn: async () => {
      if (!apiUrl) return null;
      const response = await axios.get(apiUrl);
      return response.data;
    },
    refetchInterval: refreshInterval,
    enabled: !!apiUrl,
  });

  if (isLoading) {
    return (
      <div className="h-full flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-full flex items-center justify-center text-red-500 text-sm p-4 text-center">
        Error fetching data: {(error as Error).message}
      </div>
    );
  }

  if (!data) {
    return (
      <div className="h-full flex items-center justify-center text-gray-500 text-sm">
        No data available
      </div>
    );
  }

  const widgetData = getNestedData(data, responsePath || '');
  const mode = displayMode || widget.type;

  if (mode === 'CARD') {
    // For card, we expect a single object or we take the first item if array
    const cardData = Array.isArray(widgetData) ? widgetData[0] : widgetData;
    const metrics = selectedFields?.map(f => f.key) || Object.keys(cardData || {}).slice(0, 3);
    
    return (
      <FinanceCard 
        symbol={config.symbol || 'API'} 
        metrics={metrics}
        data={cardData}
      />
    );
  }

  if (mode === 'TABLE') {
    // For table, we expect an array
    const tableData = Array.isArray(widgetData) ? widgetData : [widgetData];
    const columns = selectedFields || Object.keys(tableData[0] || {}).map(k => ({ key: k, label: k }));
    
    return (
      <StockTable 
        data={tableData}
        columns={columns}
      />
    );
  }

  if (mode === 'CHART') {
    // For chart, we expect an array
    const chartData = Array.isArray(widgetData) ? widgetData : [widgetData];
    // We need to know which keys are X and Y
    // If selectedFields has 2 items, assume 1st is X, 2nd is Y
    // Or we can add specific config for chart keys later. 
    // For now, let's try to guess or use the first two selected fields.
    
    let xKey = 'time';
    let yKey = 'value';
    
    if (selectedFields && selectedFields.length >= 2) {
      xKey = selectedFields[0].key;
      yKey = selectedFields[1].key;
    } else if (selectedFields && selectedFields.length === 1) {
      yKey = selectedFields[0].key;
    }

    return (
      <StockChart 
        symbol={config.symbol || 'API'} 
        data={chartData}
        dataKeys={{ x: xKey, y: yKey }}
      />
    );
  }

  return <div>Unknown Display Mode</div>;
};
