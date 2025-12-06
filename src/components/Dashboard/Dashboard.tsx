'use client';
import React, { useMemo, useState, useEffect } from 'react';
import RGL, { WidthProvider } from 'react-grid-layout';
import { useStore } from '@/store/store';
import { WidgetWrapper } from './WidgetWrapper';
import { Widget } from '@/types';
import 'react-grid-layout/css/styles.css';
import 'react-resizable/css/styles.css';

import { FinanceCard } from '@/components/Widgets/FinanceCard';
import { StockChart } from '@/components/Widgets/StockChart';
import { StockTable } from '@/components/Widgets/StockTable';
import { GenericWidget } from '@/components/Widgets/GenericWidget';
import { WidgetConfigModal } from '@/components/Modals/WidgetConfigModal';
import { AddWidgetModal } from '@/components/Modals/AddWidgetModal';
import { Moon, Sun, Download, Upload, Plus } from 'lucide-react';

import { ApiKeysModal } from '@/components/Modals/ApiKeysModal';

const ReactGridLayout = WidthProvider(RGL);

export const Dashboard = () => {
  const { widgets, layout, updateLayout, removeWidget, updateWidgetConfig, updateWidgetTitle, theme, setTheme, addWidget } = useStore();
  const [mounted, setMounted] = useState(false);
  const [editingWidgetId, setEditingWidgetId] = useState<string | null>(null);
  const [isApiKeysModalOpen, setIsApiKeysModalOpen] = useState(false);
  const [isAddWidgetModalOpen, setIsAddWidgetModalOpen] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleLayoutChange = (newLayout: any) => {
    // RGL returns the new layout directly
    const cleanLayout = newLayout.map((item: any) => ({
      i: item.i,
      x: item.x,
      y: item.y,
      w: item.w,
      h: item.h,
    }));
    updateLayout(cleanLayout);
  };

  const handleSaveConfig = (id: string, title: string, config: any) => {
    updateWidgetTitle(id, title);
    updateWidgetConfig(id, config);
    setEditingWidgetId(null);
  };

  const handleExport = () => {
    const data = JSON.stringify({ widgets, layout, theme }, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `finboard-config-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = JSON.parse(event.target?.result as string);
        if (data.widgets && data.layout) {
          useStore.setState({
            widgets: data.widgets,
            layout: data.layout,
            theme: data.theme || 'light',
          });
        } else {
          alert('Invalid configuration file');
        }
      } catch (error) {
        console.error('Import error:', error);
        alert('Failed to import configuration');
      }
    };
    reader.readAsText(file);
  };

  const renderWidgetContent = (widget: Widget) => {
    if (widget.config.apiUrl) {
      return <GenericWidget widget={widget} />;
    }

    switch (widget.type) {
      case 'CARD':
        return <FinanceCard symbol={widget.config.symbol || 'IBM'} refreshInterval={widget.config.refreshInterval} metrics={widget.config.metrics} />;
      case 'CHART':
        return <StockChart symbol={widget.config.symbol || 'IBM'} type={widget.config.chartType} />;
      case 'TABLE':
        return <StockTable />;
      default:
        return <div>Unknown Widget Type</div>;
    }
  };

  const widgetComponents = useMemo(() => {
    return widgets.map((widget) => {
      const widgetLayout = layout.find((l) => l.i === widget.id);
      // Fallback layout if not found (shouldn't happen with correct store logic, but safe)
      const gridProps = widgetLayout || { x: 0, y: 0, w: 4, h: 2 }; 
      
      return (
        <div key={widget.id} data-grid={gridProps}>
          <WidgetWrapper
            title={widget.title}
            onRemove={() => removeWidget(widget.id)}
            onEdit={() => setEditingWidgetId(widget.id)}
          >
            {renderWidgetContent(widget)}
          </WidgetWrapper>
        </div>
      );
    });
  }, [widgets, layout, removeWidget]);

  const editingWidget = widgets.find(w => w.id === editingWidgetId) || null;

  if (!mounted) {
    return (
      <div className="w-full min-h-screen p-6 bg-gray-50 dark:bg-gray-950 flex items-center justify-center">
        <div className="animate-pulse text-gray-400">Loading Dashboard...</div>
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen p-6 bg-gray-50 dark:bg-gray-950 transition-colors duration-200">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">FinBoard</h1>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 mr-4 border-r border-gray-200 dark:border-gray-700 pr-4">
             <button
              onClick={() => setIsApiKeysModalOpen(true)}
              className="px-3 py-2 text-sm font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 dark:bg-blue-900/30 dark:text-blue-400 dark:hover:bg-blue-900/50 rounded-lg transition-colors mr-2"
            >
              API Keys
            </button>
             <button
              onClick={handleExport}
              className="p-2 rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
              title="Export Configuration"
            >
              <Download className="w-5 h-5" />
            </button>
            <label className="p-2 rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition-colors cursor-pointer" title="Import Configuration">
              <Upload className="w-5 h-5" />
              <input type="file" accept=".json" onChange={handleImport} className="hidden" />
            </label>
          </div>
          <button
            onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
            className="p-2 rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
          >
            {theme === 'light' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
          </button>
          
          <button
            onClick={() => setIsAddWidgetModalOpen(true)}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Add Widget
          </button>
        </div>
      </div>

      <ReactGridLayout
        className="layout"
        layout={layout}
        cols={12}
        rowHeight={60}
        draggableHandle=".drag-handle"
        onLayoutChange={handleLayoutChange}
        isDraggable
        isResizable
        margin={[16, 16]}
        compactType="vertical"
        isBounded={true}
      >
        {widgetComponents}
      </ReactGridLayout>

      <WidgetConfigModal
        isOpen={!!editingWidgetId}
        onClose={() => setEditingWidgetId(null)}
        widget={editingWidget}
        onSave={handleSaveConfig}
      />
      
      <ApiKeysModal
        isOpen={isApiKeysModalOpen}
        onClose={() => setIsApiKeysModalOpen(false)}
      />

      <AddWidgetModal
        isOpen={isAddWidgetModalOpen}
        onClose={() => setIsAddWidgetModalOpen(false)}
        onAdd={addWidget}
      />
    </div>
  );
};
