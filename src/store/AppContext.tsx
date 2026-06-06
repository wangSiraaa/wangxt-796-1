import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import { Device } from '../types/device';
import { RentalRecord, RepairQueueItem } from '../types/rental';
import { UserRole } from '../types/user';
import { loadDevices, loadRentals, loadRepairs, saveDevices, saveRentals, saveRepairs } from '../utils/storage';
import { generateSeedDevices, generateSeedRentals, generateSeedRepairs } from '../utils/seedData';

interface AppState {
  devices: Device[];
  rentals: RentalRecord[];
  repairs: RepairQueueItem[];
  currentRole: UserRole;
  initialized: boolean;
}

type AppAction =
  | { type: 'INIT'; payload: { devices: Device[]; rentals: RentalRecord[]; repairs: RepairQueueItem[] } }
  | { type: 'SET_ROLE'; payload: UserRole }
  | { type: 'UPDATE_DEVICE'; payload: Device }
  | { type: 'ADD_RENTAL'; payload: RentalRecord }
  | { type: 'UPDATE_RENTAL'; payload: RentalRecord }
  | { type: 'DELETE_RENTAL'; payload: string }
  | { type: 'ADD_REPAIR'; payload: RepairQueueItem }
  | { type: 'UPDATE_REPAIR'; payload: RepairQueueItem };

const initialState: AppState = {
  devices: [],
  rentals: [],
  repairs: [],
  currentRole: 'visitor',
  initialized: false,
};

const appReducer = (state: AppState, action: AppAction): AppState => {
  switch (action.type) {
    case 'INIT':
      return {
        ...state,
        devices: action.payload.devices,
        rentals: action.payload.rentals,
        repairs: action.payload.repairs,
        initialized: true,
      };
    case 'SET_ROLE':
      return { ...state, currentRole: action.payload };
    case 'UPDATE_DEVICE': {
      const devices = state.devices.map(d =>
        d.id === action.payload.id ? action.payload : d
      );
      saveDevices(devices);
      return { ...state, devices };
    }
    case 'ADD_RENTAL': {
      const rentals = [...state.rentals, action.payload];
      saveRentals(rentals);
      return { ...state, rentals };
    }
    case 'UPDATE_RENTAL': {
      const rentals = state.rentals.map(r =>
        r.id === action.payload.id ? action.payload : r
      );
      saveRentals(rentals);
      return { ...state, rentals };
    }
    case 'DELETE_RENTAL': {
      const rentals = state.rentals.filter(r => r.id !== action.payload);
      saveRentals(rentals);
      return { ...state, rentals };
    }
    case 'ADD_REPAIR': {
      const repairs = [...state.repairs, action.payload];
      saveRepairs(repairs);
      return { ...state, repairs };
    }
    case 'UPDATE_REPAIR': {
      const repairs = state.repairs.map(r =>
        r.id === action.payload.id ? action.payload : r
      );
      saveRepairs(repairs);
      return { ...state, repairs };
    }
    default:
      return state;
  }
};

interface AppContextType {
  state: AppState;
  dispatch: React.Dispatch<AppAction>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(appReducer, initialState);

  useEffect(() => {
    let devices = loadDevices();
    let rentals = loadRentals();
    let repairs = loadRepairs();

    if (devices.length === 0) {
      devices = generateSeedDevices();
      saveDevices(devices);
    }
    if (rentals.length === 0) {
      rentals = generateSeedRentals();
      saveRentals(rentals);
    }
    if (repairs.length === 0) {
      repairs = generateSeedRepairs();
      saveRepairs(repairs);
    }

    dispatch({ type: 'INIT', payload: { devices, rentals, repairs } });
  }, []);

  return (
    <AppContext.Provider value={{ state, dispatch }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = (): AppContextType => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
