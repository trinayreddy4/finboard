import React, { forwardRef } from 'react';
import { X, Settings, GripHorizontal } from 'lucide-react';
import { cn } from '@/lib/utils'; // I need to create this utils file first or inline it. I'll create it.

interface WidgetWrapperProps extends React.HTMLAttributes<HTMLDivElement> {
  title: string;
  onRemove: () => void;
  onEdit: () => void;
  children: React.ReactNode;
}

export const WidgetWrapper = forwardRef<HTMLDivElement, WidgetWrapperProps>(
  ({ title, onRemove, onEdit, children, className, style, ...props }, ref) => {
    return (
      <div
        ref={ref}
        style={style}
        className={cn(
          "bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 flex flex-col overflow-hidden",
          className
        )}
        {...props}
      >
        <div className="flex items-center justify-between px-4 py-2 border-b border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50 drag-handle cursor-move">
          <div className="flex items-center gap-2">
            <GripHorizontal className="w-4 h-4 text-gray-400" />
            <h3 className="font-medium text-sm text-gray-700 dark:text-gray-200 truncate">
              {title}
            </h3>
          </div>
          <div className="flex items-center gap-1">
            <button
              onMouseDown={(e) => e.stopPropagation()}
              onClick={(e) => {
                e.stopPropagation();
                onEdit();
              }}
              className="p-1.5 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-md transition-colors text-gray-500"
            >
              <Settings className="w-4 h-4" />
            </button>
            <button
              onMouseDown={(e) => e.stopPropagation()}
              onClick={(e) => {
                e.stopPropagation();
                onRemove();
              }}
              className="p-1.5 hover:bg-red-100 hover:text-red-600 dark:hover:bg-red-900/30 dark:hover:text-red-400 rounded-md transition-colors text-gray-500"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
        <div className="flex-1 p-4 overflow-auto min-h-0 relative">
          {children}
        </div>
      </div>
    );
  }
);

WidgetWrapper.displayName = 'WidgetWrapper';
