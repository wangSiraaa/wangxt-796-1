import React, { useState } from 'react';
import { ConciergeBell, Plus, RotateCcw, Trash2, DollarSign, X } from 'lucide-react';
import { DeviceCard } from '../components/DeviceCard';
import { Modal } from '../components/Modal';
import { StatusBadge } from '../components/StatusBadge';
import { BatteryIndicator } from '../components/BatteryIndicator';
import { useApp } from '../store/AppContext';
import { Device } from '../types/device';
import { RentalRecord } from '../types/rental';
import { canRentDevice, validateDeleteRental, validateDamageNote } from '../utils/validators';

export const ServiceDeskPage: React.FC = () => {
  const { state, dispatch } = useApp();
  const [activeTab, setActiveTab] = useState<'devices' | 'rentals'>('devices');
  const [rentModalOpen, setRentModalOpen] = useState(false);
  const [returnModalOpen, setReturnModalOpen] = useState(false);
  const [selectedDevice, setSelectedDevice] = useState<Device | null>(null);
  const [selectedRental, setSelectedRental] = useState<RentalRecord | null>(null);
  
  const [rentForm, setRentForm] = useState({
    renterName: '',
    renterPhone: '',
    renterIdCard: '',
    language: 'zh',
    deposit: 200,
  });
  
  const [returnForm, setReturnForm] = useState({
    damageOnReturn: false,
    damageNote: '',
    refundDeposit: true,
  });

  const handleRentClick = (device: Device) => {
    setSelectedDevice(device);
    setRentModalOpen(true);
    setRentForm({ renterName: '', renterPhone: '', renterIdCard: '', language: 'zh', deposit: 200 });
  };

  const handleReturnClick = (device: Device) => {
    const rental = state.rentals.find(r => r.id === device.currentRentalId);
    setSelectedDevice(device);
    setSelectedRental(rental || null);
    setReturnModalOpen(true);
    setReturnForm({ damageOnReturn: false, damageNote: '', refundDeposit: true });
  };

  const handleConfirmRent = () => {
    if (!selectedDevice) return;
    
    const validation = canRentDevice(selectedDevice, rentForm.language);
    if (!validation.valid) {
      alert(validation.message);
      return;
    }

    const rentalId = `RENT-${String(state.rentals.length + 1).padStart(3, '0')}`;
    const now = new Date();
    const expectedReturn = new Date(now);
    expectedReturn.setHours(17, 0, 0, 0);

    const newRental: RentalRecord = {
      id: rentalId,
      deviceId: selectedDevice.id,
      renterName: rentForm.renterName,
      renterPhone: rentForm.renterPhone,
      renterIdCard: rentForm.renterIdCard,
      deposit: rentForm.deposit,
      depositRefunded: false,
      rentalTime: now.toISOString(),
      expectedReturnTime: expectedReturn.toISOString(),
      language: rentForm.language,
      status: 'active',
    };

    dispatch({ type: 'ADD_RENTAL', payload: newRental });
    dispatch({
      type: 'UPDATE_DEVICE',
      payload: { ...selectedDevice, status: 'rented', currentRentalId: rentalId }
    });

    setRentModalOpen(false);
    setSelectedDevice(null);
  };

  const handleConfirmReturn = () => {
    if (!selectedDevice || !selectedRental) return;

    if (returnForm.damageOnReturn) {
      const noteValidation = validateDamageNote(returnForm.damageNote);
      if (!noteValidation.valid) {
        alert(noteValidation.message);
        return;
      }
    }

    const updatedRental: RentalRecord = {
      ...selectedRental,
      actualReturnTime: new Date().toISOString(),
      damageOnReturn: returnForm.damageOnReturn,
      damageNote: returnForm.damageNote || undefined,
      depositRefunded: returnForm.refundDeposit,
      status: 'returned',
    };

    const updatedDevice: Device = {
      ...selectedDevice,
      status: returnForm.damageOnReturn ? 'damaged' : 'available',
      damageNote: returnForm.damageNote || selectedDevice.damageNote,
      currentRentalId: undefined,
    };

    dispatch({ type: 'UPDATE_RENTAL', payload: updatedRental });
    dispatch({ type: 'UPDATE_DEVICE', payload: updatedDevice });

    if (returnForm.damageOnReturn) {
      const repairId = `REPAIR-${String(state.repairs.length + 1).padStart(3, '0')}`;
      dispatch({
        type: 'ADD_REPAIR',
        payload: {
          id: repairId,
          deviceId: selectedDevice.id,
          reportedTime: new Date().toISOString(),
          issue: returnForm.damageNote,
          status: 'pending',
        }
      });
    }

    setReturnModalOpen(false);
    setSelectedDevice(null);
    setSelectedRental(null);
  };

  const handleDeleteRental = (rental: RentalRecord) => {
    const validation = validateDeleteRental(rental);
    if (!validation.valid) {
      alert(validation.message);
      return;
    }
    if (confirm('确定要删除这条租借记录吗？')) {
      dispatch({ type: 'DELETE_RENTAL', payload: rental.id });
    }
  };

  const languages = [
    { code: 'zh', name: '中文' },
    { code: 'en', name: 'English' },
    { code: 'ja', name: '日本語' },
    { code: 'ko', name: '한국어' },
    { code: 'fr', name: 'Français' },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-museum-500 to-museum-700 rounded-xl flex items-center justify-center">
              <ConciergeBell className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900 font-serif">服务台管理</h1>
              <p className="text-sm text-gray-500">租借登记 · 归还检查 · 押金管理</p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-6">
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setActiveTab('devices')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeTab === 'devices'
                ? 'bg-museum-600 text-white'
                : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
            }`}
          >
            设备管理
          </button>
          <button
            onClick={() => setActiveTab('rentals')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeTab === 'rentals'
                ? 'bg-museum-600 text-white'
                : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
            }`}
          >
            租借记录
          </button>
        </div>

        {activeTab === 'devices' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {state.devices.map(device => (
              <DeviceCard
                key={device.id}
                device={device}
                onRent={handleRentClick}
                onReturn={handleReturnClick}
              />
            ))}
          </div>
        )}

        {activeTab === 'rentals' && (
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">编号</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">设备</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">租借人</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">语种</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">押金</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">状态</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">操作</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {state.rentals.map(rental => (
                    <tr key={rental.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm font-medium text-gray-900">{rental.id}</td>
                      <td className="px-4 py-3 text-sm text-gray-600">{rental.deviceId}</td>
                      <td className="px-4 py-3 text-sm text-gray-600">{rental.renterName}</td>
                      <td className="px-4 py-3 text-sm text-gray-600">
                        {languages.find(l => l.code === rental.language)?.name || rental.language}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center gap-1 text-sm ${
                          rental.depositRefunded ? 'text-emerald-600' : 'text-amber-600'
                        }`}>
                          <DollarSign className="w-4 h-4" />
                          ¥{rental.deposit}
                          {rental.depositRefunded ? '已退' : '未退'}
                        </span>
                      </td>
                      <td className="px-4 py-3"><StatusBadge status={rental.status} /></td>
                      <td className="px-4 py-3">
                        <button
                          onClick={() => handleDeleteRental(rental)}
                          disabled={!rental.depositRefunded}
                          className={`p-1.5 rounded-lg transition-colors ${
                            rental.depositRefunded
                              ? 'text-red-500 hover:bg-red-50'
                              : 'text-gray-300 cursor-not-allowed'
                          }`}
                          title={!rental.depositRefunded ? '押金未退，无法删除' : '删除记录'}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>

      <Modal isOpen={rentModalOpen} onClose={() => setRentModalOpen(false)} title="租借登记" size="lg">
        {selectedDevice && (
          <div className="space-y-5">
            <div className="p-4 bg-museum-50 rounded-xl border border-museum-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold text-gray-900">{selectedDevice.id}</p>
                  <p className="text-sm text-gray-500">即将租借的设备</p>
                </div>
                <BatteryIndicator level={selectedDevice.batteryLevel} />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">租借人姓名 *</label>
                <input
                  type="text"
                  value={rentForm.renterName}
                  onChange={(e) => setRentForm({ ...rentForm, renterName: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-museum-500/20 focus:border-museum-500"
                  placeholder="请输入姓名"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">联系电话 *</label>
                <input
                  type="tel"
                  value={rentForm.renterPhone}
                  onChange={(e) => setRentForm({ ...rentForm, renterPhone: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-museum-500/20 focus:border-museum-500"
                  placeholder="请输入电话"
                />
              </div>
              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1.5">证件号码 *</label>
                <input
                  type="text"
                  value={rentForm.renterIdCard}
                  onChange={(e) => setRentForm({ ...rentForm, renterIdCard: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-museum-500/20 focus:border-museum-500"
                  placeholder="请输入身份证号"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">讲解语种 *</label>
                <select
                  value={rentForm.language}
                  onChange={(e) => setRentForm({ ...rentForm, language: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-museum-500/20 focus:border-museum-500"
                >
                  {languages.map(lang => (
                    <option key={lang.code} value={lang.code}>{lang.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">押金金额 (元)</label>
                <input
                  type="number"
                  value={rentForm.deposit}
                  onChange={(e) => setRentForm({ ...rentForm, deposit: Number(e.target.value) })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-museum-500/20 focus:border-museum-500"
                />
              </div>
            </div>

            <div className="flex gap-3 pt-4 border-t border-gray-100">
              <button
                onClick={() => setRentModalOpen(false)}
                className="flex-1 py-2.5 px-4 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
              >
                取消
              </button>
              <button
                onClick={handleConfirmRent}
                disabled={!rentForm.renterName || !rentForm.renterPhone || !rentForm.renterIdCard}
                className="flex-1 py-2.5 px-4 text-sm font-medium text-white bg-museum-600 hover:bg-museum-700 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                <Plus className="w-4 h-4" />
                确认租借
              </button>
            </div>
          </div>
        )}
      </Modal>

      <Modal isOpen={returnModalOpen} onClose={() => setReturnModalOpen(false)} title="归还检查" size="lg">
        {selectedDevice && selectedRental && (
          <div className="space-y-5">
            <div className="p-4 bg-blue-50 rounded-xl border border-blue-100">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-blue-600 mb-1">设备编号</p>
                  <p className="font-semibold text-gray-900">{selectedDevice.id}</p>
                </div>
                <div>
                  <p className="text-xs text-blue-600 mb-1">租借人</p>
                  <p className="font-semibold text-gray-900">{selectedRental.renterName}</p>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <input
                  type="checkbox"
                  id="damageOnReturn"
                  checked={returnForm.damageOnReturn}
                  onChange={(e) => setReturnForm({ ...returnForm, damageOnReturn: e.target.checked })}
                  className="w-4 h-4 text-museum-600 rounded"
                />
                <label htmlFor="damageOnReturn" className="text-sm font-medium text-gray-700">
                  设备有损坏
                </label>
              </div>

              {returnForm.damageOnReturn && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    损坏备注 <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    value={returnForm.damageNote}
                    onChange={(e) => setReturnForm({ ...returnForm, damageNote: e.target.value })}
                    rows={3}
                    className="w-full px-3 py-2 border border-red-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500"
                    placeholder="请详细描述损坏情况..."
                  />
                </div>
              )}

              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <input
                  type="checkbox"
                  id="refundDeposit"
                  checked={returnForm.refundDeposit}
                  onChange={(e) => setReturnForm({ ...returnForm, refundDeposit: e.target.checked })}
                  className="w-4 h-4 text-museum-600 rounded"
                />
                <label htmlFor="refundDeposit" className="text-sm font-medium text-gray-700">
                  退还押金 ¥{selectedRental.deposit}
                </label>
              </div>
            </div>

            <div className="flex gap-3 pt-4 border-t border-gray-100">
              <button
                onClick={() => setReturnModalOpen(false)}
                className="flex-1 py-2.5 px-4 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors flex items-center justify-center gap-2"
              >
                <X className="w-4 h-4" />
                取消
              </button>
              <button
                onClick={handleConfirmReturn}
                className="flex-1 py-2.5 px-4 text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-colors flex items-center justify-center gap-2"
              >
                <RotateCcw className="w-4 h-4" />
                确认归还
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};
