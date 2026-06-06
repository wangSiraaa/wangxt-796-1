import { Device, ValidationResult } from '../types/device';
import { RentalRecord } from '../types/rental';

export const LOW_BATTERY_THRESHOLD = 20;

export const validateLowBattery = (device: Device): ValidationResult => {
  if (device.batteryLevel < LOW_BATTERY_THRESHOLD) {
    return { 
      valid: false, 
      message: `设备电量过低(${device.batteryLevel}%)，无法租借，请选择其他设备或联系工作人员充电` 
    };
  }
  return { valid: true };
};

export const validateLanguagePack = (device: Device, languageCode: string): ValidationResult => {
  const pack = device.languagePacks.find(p => p.code === languageCode);
  if (!pack) {
    return { valid: false, message: `不支持${languageCode}语种` };
  }
  if (!pack.installed) {
    return { 
      valid: false, 
      message: `${pack.name}语种包未安装，请先下载安装该语种包` 
    };
  }
  return { valid: true };
};

export const validateDamageNote = (damageNote: string | undefined): ValidationResult => {
  if (!damageNote || damageNote.trim().length === 0) {
    return { valid: false, message: '设备损坏必须填写备注说明损坏情况' };
  }
  return { valid: true };
};

export const validateDeleteRental = (record: RentalRecord): ValidationResult => {
  if (!record.depositRefunded) {
    return { valid: false, message: '押金尚未退还，无法删除该租借记录' };
  }
  return { valid: true };
};

export const filterRentableDevices = (devices: Device[]): Device[] => {
  return devices.filter(d => 
    d.status === 'available' && 
    d.batteryLevel >= LOW_BATTERY_THRESHOLD
  );
};

export const canRentDevice = (device: Device, languageCode: string): ValidationResult => {
  if (device.status !== 'available') {
    return { valid: false, message: '该设备当前不可租借' };
  }
  
  const batteryCheck = validateLowBattery(device);
  if (!batteryCheck.valid) return batteryCheck;
  
  const langCheck = validateLanguagePack(device, languageCode);
  if (!langCheck.valid) return langCheck;
  
  return { valid: true };
};
