import React, { useState, useMemo } from 'react';
import { ConciergeBell, Users, AlertTriangle, Download, CheckCircle, XCircle, Filter, Search } from 'lucide-react';
import { DeviceCard } from '../components/DeviceCard';
import { StatusBadge } from '../components/StatusBadge';
import { LanguagePills } from '../components/LanguagePills';
import { useApp } from '../store/AppContext';
import { Device } from '../types/device';

export const ServiceDeskPage: React.FC = () => {
  const { state, dispatch } = useApp();
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDevice, setSelectedDevice] = useState<Device | null>(null);

  const stats = useMemo(() => ({
    total: state.devices.length,
    available: state.devices.filter(d => d.status === 'available').length,
    rented: state.devices.filter(d => d.status === 'rented').length,
    missingLang: state.devices.filter(d => d.languagePacks.some(p => !p.installed)).length,
  }), [state.devices]);

  const filteredDevices = useMemo(() => {
    let devices = state.devices;
    if (filterStatus !== 'all') {
      if (filterStatus === 'missingLang') {
        devices = devices.filter(d => d.languagePacks.some(p => !p.installed));
      } else {
        devices = devices.filter(d => d.status === filterStatus);
      }
    }
    if (searchTerm) {
      devices = devices.filter(d => 
        d.id.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    return devices;
  }, [state.devices, filterStatus, searchTerm]);

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

    if (selectedDevice?.id === deviceId) {
      setSelectedDevice({ ...selectedDevice, languagePacks: updatedPacks });
    }
  };

  const filterOptions = [
    { value: 'all', label: '全部设备' },
    { value: 'available', label: '可租借' },
    { value: 'rented', label: '租借中' },
    { value: 'missingLang', label: '缺语种包' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-museum-50">
      <header className="bg-white/80 backdrop-blur-sm border-b border-museum-100 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-museum-500 to-cyan-600 rounded-xl flex items-center justify-center">
                <ConciergeBell className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
              </div>
              <div>
                <h1 className="text-lg sm:text-xl font-bold text-gray-900 font-serif">服务台</h1>
                <p className="text-xs sm:text-sm text-gray-500">语种包管理 · 设备状态监控</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mb-6 sm:mb-8">
          <div className="bg-white rounded-2xl p-4 sm:p-5 border border-gray-100 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gray-100 rounded-xl flex items-center justify-center">
                <ConciergeBell className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600" />
              </div>
              <div>
                <p className="text-xs text-gray-500">设备总数</p>
                <p className="text-xl sm:text-2xl font-bold text-gray-900">{stats.total}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-2xl p-4 sm:p-5 border border-emerald-200 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-emerald-100 rounded-xl flex items-center justify-center">
                <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-600" />
              </div>
              <div>
                <p className="text-xs text-gray-500">可租借</p>
                <p className="text-xl sm:text-2xl font-bold text-emerald-600">{stats.available}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-2xl p-4 sm:p-5 border border-blue-200 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                <Users className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-xs text-gray-500">租借中</p>
                <p className="text-xl sm:text-2xl font-bold text-blue-600">{stats.rented}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-2xl p-4 sm:p-5 border border-orange-200 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-orange-100 rounded-xl flex items-center justify-center">
                <Download className="w-4 h-4 sm:w-5 sm:h-5 text-orange-600" />
              </div>
              <div>
                <p className="text-xs text-gray-500">缺语种包</p>
                <p className="text-xl sm:text-2xl font-bold text-orange-600">{stats.missingLang}</p>
              </div>
            </div>
          </div>
        </div>

        {stats.missingLang > 0 && (
          <div className="bg-orange-50 border border-orange-200 rounded-2xl p-4 sm:p-5 mb-6 sm:mb-8">
            <h3 className="font-semibold text-orange-900 mb-2 flex items-center gap-2 text-sm sm:text-base">
              <AlertTriangle className="w-4 h-4 sm:w-5 sm:h-5" />
              语种包下载提醒
            </h3>
            <p className="text-sm text-orange-800">
              当前有 <span className="font-bold">{stats.missingLang}</span> 台设备存在未安装的语种包，
              请及时下载安装以确保游客正常使用。
            </p>
          </div>
        )}

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 mb-4 sm:mb-6">
          <h2 className="text-lg sm:text-xl font-bold text-gray-900 font-serif">设备列表</h2>
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="搜索设备编号..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 pr-4 py-2 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-museum-500/20 focus:border-museum-500 w-full"
              />
            </div>
            <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-xl px-3 py-2">
              <Filter className="w-4 h-4 text-gray-400" />
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="text-sm bg-transparent focus:outline-none flex-1"
              >
                {filterOptions.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {filteredDevices.length === 0 ? (
          <div className="text-center py-12 sm:py-16 bg-white rounded-2xl border border-gray-100">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Search className="w-8 h-8 text-gray-400" />
            </div>
            <p className="text-gray-500 text-sm sm:text-base">暂无符合条件的设备</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4">
            {filteredDevices.map(device => (
              <DeviceCard
                key={device.id}
                device={device}
                onView={setSelectedDevice}
              />
            ))}
          </div>
        )}
      </main>

      {selectedDevice && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex min-h-screen items-center justify-center p-4">
            <div 
              className="fixed inset-0 bg-black/50 backdrop-blur-sm"
              onClick={() => setSelectedDevice(null)}
            />
            <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg p-4 sm:p-6 m-2 sm:m-0">
              <div className="flex items-center justify-between mb-4 sm:mb-6">
                <h3 className="text-lg sm:text-xl font-bold text-gray-900 font-serif">{selectedDevice.id} 详情</h3>
                <button
                  onClick={() => setSelectedDevice(null)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <XCircle className="w-5 h-5 text-gray-500" />
                </button>
              </div>

              <div className="space-y-4 sm:space-y-5">
                <div className="flex items-center justify-between p-3 sm:p-4 bg-gray-50 rounded-xl">
                  <span className="text-sm text-gray-500">状态</span>
                  <StatusBadge status={selectedDevice.status} />
                </div>

                <div>
                  <span className="text-sm text-gray-500 block mb-2">语种包管理</span>
                  <div className="bg-gray-50 rounded-xl p-3 sm:p-4">
                    <LanguagePills 
                      languagePacks={selectedDevice.languagePacks} 
                      showActions={true}
                      onDownload={(code) => handleDownloadLangPack(selectedDevice.id, code)}
                    />
                  </div>
                  {selectedDevice.languagePacks.some(p => !p.installed) && (
                    <div className="mt-3 p-3 bg-orange-50 border border-orange-200 rounded-xl">
                      <p className="text-xs text-orange-700 flex items-start gap-2">
                        <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                        <span>存在未安装的语种包，请点击下载按钮进行安装</span>
                      </p>
                    </div>
                  )}
                </div>

                {selectedDevice.damageNote && (
                  <div className="p-3 sm:p-4 bg-red-50 border border-red-200 rounded-xl">
                    <p className="text-xs font-medium text-red-700 mb-1">损坏备注</p>
                    <p className="text-sm text-red-600">{selectedDevice.damageNote}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
