import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { Users, ConciergeBell, Wrench, ChevronDown } from 'lucide-react';
import { AppProvider, useApp } from './store/AppContext';
import { VisitorPage } from './pages/Visitor';
import { ServiceDeskPage } from './pages/ServiceDesk';
import { MaintenancePage } from './pages/Maintenance';
import { UserRole } from './types/user';

const RoleSelector: React.FC = () => {
  const { dispatch } = useApp();
  const navigate = useNavigate();
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);

  const roles = [
    { value: 'visitor' as UserRole, label: '游客', icon: Users, path: '/visitor' },
    { value: 'service' as UserRole, label: '服务台', icon: ConciergeBell, path: '/service' },
    { value: 'maintenance' as UserRole, label: '维护员', icon: Wrench, path: '/maintenance' },
  ];

  const currentRole = roles.find(r => r.path === location.pathname) || roles[0];
  const CurrentIcon = currentRole.icon;

  const handleRoleChange = (role: UserRole, path: string) => {
    dispatch({ type: 'SET_ROLE', payload: role });
    navigate(path);
    setIsOpen(false);
  };

  return (
    <div className="fixed top-4 right-4 z-50">
      <div className="relative">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-2 px-4 py-2.5 bg-white rounded-xl shadow-lg border border-gray-200 hover:border-museum-300 transition-all"
        >
          <CurrentIcon className="w-4 h-4 text-museum-600" />
          <span className="text-sm font-medium text-gray-700">{currentRole.label}</span>
          <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </button>

        {isOpen && (
          <>
            <div 
              className="fixed inset-0 z-40" 
              onClick={() => setIsOpen(false)}
            />
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-xl border border-gray-200 py-1 z-50">
              {roles.map(role => {
                const Icon = role.icon;
                return (
                  <button
                    key={role.value}
                    onClick={() => handleRoleChange(role.value, role.path)}
                    className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm transition-colors ${
                      currentRole.value === role.value
                        ? 'bg-museum-50 text-museum-700'
                        : 'text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    {role.label}
                  </button>
                );
              })}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

const AppContent: React.FC = () => {
  return (
    <>
      <RoleSelector />
      <Routes>
        <Route path="/" element={<Navigate to="/visitor" replace />} />
        <Route path="/visitor" element={<VisitorPage />} />
        <Route path="/service" element={<ServiceDeskPage />} />
        <Route path="/maintenance" element={<MaintenancePage />} />
      </Routes>
    </>
  );
};

export const App: React.FC = () => {
  return (
    <BrowserRouter>
      <AppProvider>
        <AppContent />
      </AppProvider>
    </BrowserRouter>
  );
};
