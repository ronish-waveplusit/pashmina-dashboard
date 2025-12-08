
import React from 'react';
import { cn } from '../../lib/utils';

interface StatisticsProps extends React.HTMLAttributes<HTMLDivElement> {
  data: {
    label: string;
    value: string | number;
    change?: string;
    trend?: 'up' | 'down' | 'neutral';
    icon?: React.ReactNode;
  }[];
  columns?: 1 | 2 | 3 | 4;
}

export function Statistics({ 
  data, 
  columns = 4, 
  className, 
  ...props 
}: StatisticsProps) {
  const getGridCols = () => {
    switch (columns) {
      case 1: return 'grid-cols-1';
      case 2: return 'grid-cols-1 sm:grid-cols-2';
      case 3: return 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3';
      case 4: return 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4';
    }
  };

  return (
    <div 
      className={cn(
        "grid gap-4", 
        getGridCols(),
        className
      )} 
      {...props}
    >
      {data.map((item, index) => (
        <div key={index} className="bg-white rounded-lg shadow-sm border p-4">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-muted-foreground">{item.label}</p>
              <p className="text-2xl font-bold mt-1">{item.value}</p>
              
              {item.change && (
                <p className={cn(
                  "text-xs font-medium mt-1",
                  item.trend === 'up' && "text-green-600",
                  item.trend === 'down' && "text-red-600",
                  item.trend === 'neutral' && "text-gray-600",
                )}>
                  {item.change}
                </p>
              )}
            </div>
            
            {item.icon && (
              <div className="text-muted-foreground">
                {item.icon}
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
