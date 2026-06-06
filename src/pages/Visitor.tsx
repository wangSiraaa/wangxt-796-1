import React, { useState, useMemo } from 'react';
import { Users, Info, Clock, ShieldCheck, Filter, Search } from 'lucide-react';
import { DeviceCard } from '../components/DeviceCard';
import { useApp } from '../store/AppContext';
import { filterRentableDevices } from '../utils/validators';

export const VisitorPage: React.FC = () => {
  const { state } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLanguage, setSelectedLanguage] = useState('zh');

  const rentableDevices = useMemo(() => {
    let devices = filterRentableDevices(state.devices);
    if (searchTerm) {
      devices = devices.filter(d => 
        d.id.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    return devices;
  }, [state.devices, searchTerm]);

  const languages = [
    { code: 'zh', name: '中文' },
    { code: 'en', name: 'English' },
    { code: 'ja', name: '日本語' },
    { code: 'ko', name: '한국어' },
    { code: 'fr', name: 'Français' },
  ];

  const stats = useMemo(() => ({
    total: rentableDevices.length,
    lowBattery: state.devices.filter(d => d.batteryLevel < 20 && d.status === 'available').length,
    rented: state.devices.filter(d => d.status === 'rented').length,
  }), [state.devices, rentableDevices]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-museum-50 via-white to-cyan-50">
      <header className="bg-white/80 backdrop-blur-sm border-b border-museum-100 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-museum-500 to-museum-700 rounded-xl flex items-center justify-center">
                <Users className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
              </div>
              <div>
                <h1 className="text-lg sm:text-xl font-bold text-gray-900 font-serif">游客自助服务</h1>
                <p className="text-xs sm:text-sm text-gray-500">博物馆讲解器租借查询</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 mb-6 sm:mb-8">
          <div className="bg-white rounded-2xl p-4 sm:p-5 border border-gray-100 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-emerald-100 rounded-xl flex items-center justify-center">
                <ShieldCheck className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-600" />
              </div>
              <div>
                <p className="text-xs text-gray-500">可租借设备</p>
                <p className="text-xl sm:text-2xl font-bold text-emerald-600">{stats.total}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-2xl p-4 sm:p-5 border border-gray-100 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                <Clock className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-xs text-gray-500">租借中</p>
                <p className="text-xl sm:text-2xl font-bold text-blue-600">{stats.rented}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-2xl p-4 sm:p-5 border border-gray-100 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-amber-100 rounded-xl flex items-center justify-center">
                <Info className="w-4 h-4 sm:w-5 sm:h-5 text-amber-600" />
              </div>
              <div>
                <p className="text-xs text-gray-500">充电中</p>
                <p className="text-xl sm:text-2xl font-bold text-amber-600">{stats.lowBattery}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 sm:p-5 mb-6 sm:mb-8">
          <h3 className="font-semibold text-amber-900 mb-2 flex items-center gap-2 text-sm sm:text-base">
            <Info className="w-4 h-4 sm:w-5 sm:h-5" />
            租借须知
          </h3>
          <ul className="text-xs sm:text-sm text-amber-800 space-y-1.5 list-disc list-inside">
            <li>每台讲解器押金 200 元，归还时退还</li>
            <li>请妥善保管设备，损坏需照价赔偿</li>
            <li>开放时间：9:00 - 17:00，请在闭馆前归还</li>
            <li>支持中、英、日、韩、法五种语言</li>
          </ul>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 mb-4 sm:mb-6">
          <h2 className="text-lg sm:text-xl font-bold text-gray-900 font-serif">可租借设备</h2>
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
                value={selectedLanguage}
                onChange={(e) => setSelectedLanguage(e.target.value)}
                className="text-sm bg-transparent focus:outline-none flex-1"
              >
                {languages.map(lang => (
                  <option key={lang.code} value={lang.code}>{lang.name}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {rentableDevices.length === 0 ? (
          <div className="text-center py-12 sm:py-16 bg-white rounded-2xl border border-gray-100">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Search className="w-8 h-8 text-gray-400" />
            </div>
            <p className="text-gray-500 text-sm sm:text-base">暂无符合条件的可租借设备</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4">
            {rentableDevices.map(device => (
              <DeviceCard
                key={device.id}
                device={device}
                selectedLanguage={selectedLanguage}
                showRentButton={true}
              />
            ))}
          </div>
        )}

        <div className="mt-6 sm:mt-8 text-center text-xs sm:text-sm text-gray-400">
          <p>请前往服务台办理租借手续 · 出示有效证件</p>
        </div>
      </main>
    </div>
  );
};
