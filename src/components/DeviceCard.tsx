import React from 'react';
import { Smartphone, AlertTriangle } from 'lucide-react';
import { Device } from '../types/device';
import { StatusBadge } from './StatusBadge';
import { BatteryIndicator } from './BatteryIndicator';
import { LanguagePills } from './LanguagePills';
import { validateLowBattery } from '../utils/validators';

interface DeviceCardProps {
  device: Device;
  onRent?: (device: Device) => void;
  onReturn?: (device: Device) => void;
  onView?: (device: Device) => void;
  selectedLanguage?: string;
  showRentButton?: boolean;
}

export const DeviceCard: React.FC<DeviceCardProps> = ({
  device,
  onRent,
  onReturn,
  onView,
  selectedLanguage = 'zh',
  showRentButton = false,
}) => {
  const batteryCheck = validateLowBattery(device);
  const langPack = device.languagePacks.find(p => p.code === selectedLanguage);
  const langMissing = !langPack?.installed;
  const isRentable = device.status === 'available' && batteryCheck.valid && !langMissing;

  return (
    <div 
      className={`bg-white rounded-xl border-2 transition-all duration-300 hover:shadow-lg ${
        device.status === 'available' 
          ? 'border-emerald-200 hover:border-emerald-300' 
          : device.status === 'rented'
          ? 'border-blue-200'
          : device.status === 'maintenance'
          ? 'border-amber-200'
          : 'border-red-200'
      }`}
    >
      <div className="p-5">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className={`p-2.5 rounded-xl ${
              device.status === 'available' ? 'bg-emerald-100' :
              device.status === 'rented' ? 'bg-blue-100' :
              device.status === 'maintenance' ? 'bg-amber-100' :
              'bg-red-100'
            }`}>
              <Smartphone className={`w-6 h-6 ${
                device.status === 'available' ? 'text-emerald-600' :
                device.status === 'rented' ? 'text-blue-600' :
                device.status === 'maintenance' ? 'text-amber-600' :
                'text-red-600'
              }`} />
            </div>
            <div>
              <h4 className="font-bold text-gray-900 text-lg">{device.id}</h4>
              <StatusBadge status={device.status} />
            </div>
          </div>
        </div>

        <div className="space-y-3 mb-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-500">电量</span>
            <BatteryIndicator level={device.batteryLevel} />
          </div>
          
          <div>
            <span className="text-sm text-gray-500 block mb-1.5">语种包</span>
            <LanguagePills languagePacks={device.languagePacks} />
          </div>
        </div>

        {device.damageNote && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-xs font-medium text-red-700">损坏备注</p>
                <p className="text-sm text-red-600">{device.damageNote}</p>
              </div>
            </div>
          </div>
        )}

        {showRentButton && !batteryCheck.valid && (
          <div className="mb-3 p-2 bg-amber-50 border border-amber-200 rounded-lg">
            <p className="text-xs text-amber-700">{batteryCheck.message}</p>
          </div>
        )}

        {showRentButton && langMissing && (
          <div className="mb-3 p-2 bg-orange-50 border border-orange-200 rounded-lg">
            <p className="text-xs text-orange-700">
              {langPack?.name || selectedLanguage}语种包未安装，请联系工作人员下载
            </p>
          </div>
        )}

        <div className="flex gap-2">
          {onView && (
            <button
              onClick={() => onView(device)}
              className="flex-1 py-2 px-3 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
            >
              查看详情
            </button>
          )}
          {onRent && device.status === 'available' && (
            <button
              onClick={() => onRent(device)}
              disabled={!isRentable}
              className={`flex-1 py-2 px-3 text-sm font-medium rounded-lg transition-all ${
                isRentable
                  ? 'bg-museum-600 text-white hover:bg-museum-700 shadow-sm hover:shadow'
                  : 'bg-gray-200 text-gray-400 cursor-not-allowed'
              }`}
            >
              {!batteryCheck.valid ? '电量不足' : langMissing ? '语种缺失' : '租借'}
            </button>
          )}
          {onReturn && device.status === 'rented' && (
            <button
              onClick={() => onReturn(device)}
              className="flex-1 py-2 px-3 text-sm font-medium text-white bg-amber-600 hover:bg-amber-700 rounded-lg transition-colors"
            >
              归还
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
