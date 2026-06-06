import React from 'react';
import { Battery, BatteryLow, BatteryMedium, BatteryFull, AlertTriangle } from 'lucide-react';

interface BatteryIndicatorProps {
  level: number;
  showLabel?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export const BatteryIndicator: React.FC<BatteryIndicatorProps> = ({ 
  level, 
  showLabel = true,
  size = 'md'
}) => {
  const getBatteryIcon = () => {
    if (level < 20) return <BatteryLow className={`text-red-500 ${size === 'sm' ? 'w-4 h-4' : size === 'lg' ? 'w-6 h-6' : 'w-5 h-5'}`} />;
    if (level < 50) return <BatteryMedium className={`text-amber-500 ${size === 'sm' ? 'w-4 h-4' : size === 'lg' ? 'w-6 h-6' : 'w-5 h-5'}`} />;
    if (level < 80) return <Battery className={`text-emerald-500 ${size === 'sm' ? 'w-4 h-4' : size === 'lg' ? 'w-6 h-6' : 'w-5 h-5'}`} />;
    return <BatteryFull className={`text-emerald-600 ${size === 'sm' ? 'w-4 h-4' : size === 'lg' ? 'w-6 h-6' : 'w-5 h-5'}`} />;
  };

  const getBarColor = () => {
    if (level < 20) return 'bg-red-500';
    if (level < 50) return 'bg-amber-500';
    return 'bg-emerald-500';
  };

  return (
    <div className="flex items-center gap-2">
      {getBatteryIcon()}
      {showLabel && (
        <div className="flex flex-col">
          <div className="flex items-center gap-2">
            <span className={`text-sm font-medium ${level < 20 ? 'text-red-600' : 'text-gray-700'}`}>
              {level}%
            </span>
            {level < 20 && <AlertTriangle className="w-3.5 h-3.5 text-red-500" />}
          </div>
          <div className="w-16 h-1.5 bg-gray-200 rounded-full overflow-hidden">
            <div 
              className={`h-full ${getBarColor()} transition-all duration-500`}
              style={{ width: `${level}%` }}
            />
          </div>
        </div>
      )}
    </div>
  );
};
