export type DeviceStatus = 'available' | 'rented' | 'maintenance' | 'damaged';

export interface LanguagePack {
  code: string;
  name: string;
  installed: boolean;
}

export interface Device {
  id: string;
  batteryLevel: number;
  languagePacks: LanguagePack[];
  status: DeviceStatus;
  damageNote?: string;
  currentRentalId?: string;
}

export interface ValidationResult {
  valid: boolean;
  message?: string;
}
