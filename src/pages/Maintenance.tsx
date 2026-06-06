import React, { useState, useMemo } from 'react';
import { Wrench, Download, BatteryCharging, AlertTriangle, CheckCircle, Clock, Filter } from 'lucide-react';
import { DeviceCard } from '../components/DeviceCard';
import { StatusBadge } from '../components/StatusBadge';
import { BatteryIndicator } from '../components/BatteryIndicator';
import { LanguagePills } from '../components/LanguagePills';
import { useApp } from '../store/AppContext';
import { Device } from '../types/device';

export const MaintenancePage: React.FC = () => {
  const { state, dispatch } = useApp();
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [selectedDevice, setSelectedDevice] = useState<Device | null>(null);

  const stats = useMemo(() => ({
    total: state.devices.length,
    lowBattery: state.devices.filter(d => d.batteryLevel < 20).length,
    maintenance: state.devices.filter(d => d.status === 'maintenance').length,
    damaged: state.devices.filter(d => d.status === 'damaged').length,
    missingLang: state.devices.filter(d => d.languagePacks.some(p => !p.installed)).length,
  }), [state.devices]);

  const filteredDevices = useMemo(() => {
    if (filterStatus === 'all') return state.devices;
    if (filterStatus === 'lowBattery') return state.devices.filter(d => d.batteryLevel < 20);
    if (filterStatus === 'missingLang') return state.devices.filter(d => d.languagePacks.some(p => !p.installed));
    return state.devices.filter(d => d.status === filterStatus);
  }, [state.devices, filterStatus]);

  const handleDownloadLangPack = (deviceId: string, langCode: string) => {
    const device = state.devices.find(d => d.id === deviceId);
    if (!device) return;

    const updatedPacks = device.languagePacks.map(p =>
      p.code === langCode ? { ...p, installed: true } : p
    );

    dispatch({
      type: 'UPDATE_DEVICE',
      payload: { ...device, languagePacks: updatedPacks }
    });

    alert(`${deviceId} 的 ${langCode} 语种包下载完成`);
  };

  const handleStartRepair = (repairId: string) => {
    const repair = state.repairs.find(r => r.id === repairId);
    if (!repair) return;

    dispatch({
      type: 'UPDATE_REPAIR',
      payload: { ...repair, status: 'repairing', assignee: '当前用户' }
    });

    const device = state.devices.find(d => d.id === repair.deviceId);
    if (device) {
      dispatch({
        type: 'UPDATE_DEVICE',
        payload: { ...device, status: 'maintenance' }
      });
    }
  };

  const handleCompleteRepair = (repairId: string) => {
    const repair = state.repairs.find(r => r.id === repairId);
    if (!repair) return;

    dispatch({
      type: 'UPDATE_REPAIR',
      payload: { ...repair, status: 'completed' }
    });

    const device = state.devices.find(d => d.id === repair.deviceId);
    if (device) {
      dispatch({
        type: 'UPDATE_DEVICE',
        payload: { ...device, status: 'available', damageNote: undefined }
      });
    }
  };

  const handleChargeDevice = (deviceId: string) => {
    const device = state.devices.find(d => d.id === deviceId);
    if (!device) return;

    dispatch({
      type: 'UPDATE_DEVICE',
      payload: { ...device, batteryLevel: 100 }
    });
  };

  const filterOptions = [
    { value: 'all', label: '全部设备' },
    { value: 'available', label: '可租借' },
    { value: 'rented', label: '租借中' },
    { value: 'maintenance', label: '维修中' },
    { value: 'damaged', label: '已损坏' },
    { value: 'lowBattery', label: '低电量' },
    { value: 'missingLang', label: '缺语种包' },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-amber-500 to-orange-600 rounded-xl flex items-center justify-center">
                <Wrench className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900 font-serif">设备维护</h1>
                <p className="text-sm text-gray-500">维修队列 · 语种包管理 · 电量监控</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-6">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
          <div className="bg-white rounded-xl p-4 border border-gray-200">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                <Wrench className="w-5 h-5 text-gray-600" />
              </div>
              <div>
                <p className="text-xs text-gray-500">设备总数</p>
                <p className="text-xl font-bold text-gray-900">{stats.total}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl p-4 border border-red-200">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <p className="text-xs text-gray-500">低电量</p>
                <p className="text-xl font-bold text-red-600">{stats.lowBattery}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl p-4 border border-amber-200">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center">
                <Clock className="w-5 h-5 text-amber-600" />
              </div>
              <div>
                <p className="text-xs text-gray-500">维修中</p>
                <p className="text-xl font-bold text-amber-600">{stats.maintenance}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl p-4 border border-red-200">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <p className="text-xs text-gray-500">已损坏</p>
                <p className="text-xl font-bold text-red-600">{stats.damaged}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl p-4 border border-orange-200">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                <Download className="w-5 h-5 text-orange-600" />
              </div>
              <div>
                <p className="text-xs text-gray-500">缺语种包</p>
                <p className="text-xl font-bold text-orange-600">{stats.missingLang}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="mb-8">
          <h2 className="text-lg font-bold text-gray-900 mb-4 font-serif">维修队列</h2>
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">维修编号</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">设备</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">问题描述</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">状态</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">负责人</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">操作</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {state.repairs.map(repair => (
                    <tr key={repair.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm font-medium text-gray-900">{repair.id}</td>
                      <td className="px-4 py-3 text-sm text-gray-600">{repair.deviceId}</td>
                      <td className="px-4 py-3 text-sm text-gray-600">{repair.issue}</td>
                      <td className="px-4 py-3"><StatusBadge status={repair.status} /></td>
                      <td className="px-4 py-3 text-sm text-gray-600">{repair.assignee || '-'}</td>
                      <td className="px-4 py-3">
                        <div className="flex gap-2">
                          {repair.status === 'pending' && (
                            <button
                              onClick={() => handleStartRepair(repair.id)}
                              className="px-3 py-1.5 text-xs font-medium text-white bg-amber-600 hover:bg-amber-700 rounded-lg transition-colors flex items-center gap-1"
                            >
                              <Wrench className="w-3 h-3" />
                              开始维修
                            </button>
                          )}
                          {repair.status === 'repairing' && (
                            <button
                              onClick={() => handleCompleteRepair(repair.id)}
                              className="px-3 py-1.5 text-xs font-medium text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-colors flex items-center gap-1"
                            >
                              <CheckCircle className="w-3 h-3" />
                              完成维修
                            </button>
                          )}
                          {repair.status === 'completed' && (
                            <span className="text-xs text-emerald-600 font-medium">已完成</span>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-gray-900 font-serif">设备列表</h2>
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-gray-400" />
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="text-sm bg-white border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-museum-500/20 focus:border-museum-500"
            >
              {filterOptions.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredDevices.map(device => (
            <div key={device.id} className="relative">
              <DeviceCard device={device} onView={setSelectedDevice} />
              {(device.batteryLevel < 50 && device.status === 'available') && (
                <button
                  onClick={() => handleChargeDevice(device.id)}
                  className="absolute top-3 right-3 p-1.5 bg-emerald-100 hover:bg-emerald-200 text-emerald-700 rounded-lg transition-colors"
                  title="充电"
                >
                  <BatteryCharging className="w-4 h-4" />
                </button>
              )}
            </div>
          ))}
        </div>
      </main>

      {selectedDevice && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex min-h-screen items-center justify-center p-4">
            <div 
              className="fixed inset-0 bg-black/50 backdrop-blur-sm"
              onClick={() => setSelectedDevice(null)}
            />
            <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-gray-900 font-serif">{selectedDevice.id} 详情</h3>
                <button
                  onClick={() => setSelectedDevice(null)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="space-y-5">
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                  <span className="text-sm text-gray-500">状态</span>
                  <StatusBadge status={selectedDevice.status} />
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">电量</span>
                  <BatteryIndicator level={selectedDevice.batteryLevel} size="lg" />
                </div>

                <div>
                  <span className="text-sm text-gray-500 block mb-2">语种包管理</span>
                  <LanguagePills 
                    languagePacks={selectedDevice.languagePacks} 
                    showActions={true}
                    onDownload={(code) => handleDownloadLangPack(selectedDevice.id, code)}
                  />
                </div>

                {selectedDevice.damageNote && (
                  <div className="p-4 bg-red-50 border border-red-200 rounded-xl">
                    <p className="text-xs font-medium text-red-700 mb-1">损坏备注</p>
                    <p className="text-sm text-red-600">{selectedDevice.damageNote}</p>
                  </div>
                )}

                <div className="flex gap-3 pt-4 border-t border-gray-100">
                  {selectedDevice.batteryLevel < 100 && (
                    <button
                      onClick={() => {
                        handleChargeDevice(selectedDevice.id);
                        setSelectedDevice(null);
                      }}
                      className="flex-1 py-2.5 px-4 text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-colors flex items-center justify-center gap-2"
                    >
                      <BatteryCharging className="w-4 h-4" />
                      充满电
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
