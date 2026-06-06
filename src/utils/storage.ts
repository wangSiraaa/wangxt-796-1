import { Device } from '../types/device';
import { RentalRecord, RepairQueueItem } from '../types/rental';

const STORAGE_KEYS = {
  DEVICES: 'museum_guide_devices',
  RENTALS: 'museum_guide_rentals',
  REPAIRS: 'museum_guide_repairs',
};

export const saveToStorage = <T>(key: string, data: T): void => {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (e) {
    console.error('Failed to save to storage:', e);
  }
};

export const loadFromStorage = <T>(key: string, defaultValue: T): T => {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch (e) {
    console.error('Failed to load from storage:', e);
    return defaultValue;
  }
};

export const saveDevices = (devices: Device[]): void => {
  saveToStorage(STORAGE_KEYS.DEVICES, devices);
};

export const loadDevices = (): Device[] => {
  return loadFromStorage<Device[]>(STORAGE_KEYS.DEVICES, []);
};

export const saveRentals = (rentals: RentalRecord[]): void => {
  saveToStorage(STORAGE_KEYS.RENTALS, rentals);
};

export const loadRentals = (): RentalRecord[] => {
  return loadFromStorage<RentalRecord[]>(STORAGE_KEYS.RENTALS, []);
};

export const saveRepairs = (repairs: RepairQueueItem[]): void => {
  saveToStorage(STORAGE_KEYS.REPAIRS, repairs);
};

export const loadRepairs = (): RepairQueueItem[] => {
  return loadFromStorage<RepairQueueItem[]>(STORAGE_KEYS.REPAIRS, []);
};

export const clearAllStorage = (): void => {
  Object.values(STORAGE_KEYS).forEach(key => localStorage.removeItem(key));
};
