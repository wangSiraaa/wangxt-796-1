import React from 'react';
import { DeviceStatus } from '../types/device';

interface StatusBadgeProps {
  status: DeviceStatus | 'active' | 'returned' | 'overdue' | 'pending' | 'repairing' | 'completed';
}

const statusConfig: Record<string, { label: string; className: string }> = {
  available: { label: '可租借', className: 'bg-emerald-100 text-emerald-700 border-emerald-200' },
  rented: { label: '租借中', className: 'bg-blue-100 text-blue-700 border-blue-200' },
  maintenance: { label: '维修中', className: 'bg-amber-100 text-amber-700 border-amber-200' },
  damaged: { label: '已损坏', className: 'bg-red-100 text-red-700 border-red-200' },
  active: { label: '进行中', className: 'bg-blue-100 text-blue-700 border-blue-200' },
  returned: { label: '已归还', className: 'bg-gray-100 text-gray-700 border-gray-200' },
  overdue: { label: '已逾期', className: 'bg-red-100 text-red-700 border-red-200' },
  pending: { label: '待维修', className: 'bg-orange-100 text-orange-700 border-orange-200' },
  repairing: { label: '维修中', className: 'bg-amber-100 text-amber-700 border-amber-200' },
  completed: { label: '已完成', className: 'bg-emerald-100 text-emerald-700 border-emerald-200' },
};

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
  const config = statusConfig[status] || { label: status, className: 'bg-gray-100 text-gray-700' };
  
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${config.className}`}>
      <span className="w-1.5 h-1.5 rounded-full mr-1.5 bg-current opacity-60"></span>
      {config.label}
    </span>
  );
};
