import { Device } from '../types/device';
import { RentalRecord, RepairQueueItem } from '../types/rental';

const LANGUAGES = [
  { code: 'zh', name: '中文' },
  { code: 'en', name: 'English' },
  { code: 'ja', name: '日本語' },
  { code: 'ko', name: '한국어' },
  { code: 'fr', name: 'Français' },
];

const generateLanguagePacks = (missingLang?: string) => {
  return LANGUAGES.map(lang => ({
    ...lang,
    installed: lang.code !== missingLang
  }));
};

export const generateSeedDevices = (): Device[] => [
  {
    id: 'GUIDE-001',
    batteryLevel: 85,
    languagePacks: generateLanguagePacks(),
    status: 'available',
  },
  {
    id: 'GUIDE-002',
    batteryLevel: 15,
    languagePacks: generateLanguagePacks(),
    status: 'available',
  },
  {
    id: 'GUIDE-003',
    batteryLevel: 92,
    languagePacks: generateLanguagePacks('ja'),
    status: 'available',
  },
  {
    id: 'GUIDE-004',
    batteryLevel: 78,
    languagePacks: generateLanguagePacks(),
    status: 'rented',
    currentRentalId: 'RENT-001',
  },
  {
    id: 'GUIDE-005',
    batteryLevel: 45,
    languagePacks: generateLanguagePacks(),
    status: 'maintenance',
  },
  {
    id: 'GUIDE-006',
    batteryLevel: 67,
    languagePacks: generateLanguagePacks('ko'),
    status: 'available',
  },
  {
    id: 'GUIDE-007',
    batteryLevel: 30,
    languagePacks: generateLanguagePacks(),
    status: 'damaged',
    damageNote: '屏幕碎裂，需要更换',
  },
  {
    id: 'GUIDE-008',
    batteryLevel: 88,
    languagePacks: generateLanguagePacks(),
    status: 'available',
  },
  {
    id: 'GUIDE-009',
    batteryLevel: 12,
    languagePacks: generateLanguagePacks('fr'),
    status: 'available',
  },
  {
    id: 'GUIDE-010',
    batteryLevel: 95,
    languagePacks: generateLanguagePacks(),
    status: 'available',
  },
];

export const generateSeedRentals = (): RentalRecord[] => [
  {
    id: 'RENT-001',
    deviceId: 'GUIDE-004',
    renterName: '张三',
    renterPhone: '13800138001',
    renterIdCard: '110101199001011234',
    deposit: 200,
    depositRefunded: false,
    rentalTime: '2026-06-06T09:30:00',
    expectedReturnTime: '2026-06-06T17:00:00',
    language: 'zh',
    status: 'active',
  },
  {
    id: 'RENT-002',
    deviceId: 'GUIDE-001',
    renterName: '李四',
    renterPhone: '13900139002',
    renterIdCard: '110101199203045678',
    deposit: 200,
    depositRefunded: true,
    rentalTime: '2026-06-05T10:00:00',
    expectedReturnTime: '2026-06-05T16:00:00',
    actualReturnTime: '2026-06-05T15:45:00',
    language: 'en',
    status: 'returned',
  },
  {
    id: 'RENT-003',
    deviceId: 'GUIDE-007',
    renterName: '王五',
    renterPhone: '13700137003',
    renterIdCard: '110101198805069012',
    deposit: 200,
    depositRefunded: false,
    rentalTime: '2026-06-04T14:00:00',
    expectedReturnTime: '2026-06-04T18:00:00',
    actualReturnTime: '2026-06-04T17:30:00',
    language: 'zh',
    damageOnReturn: true,
    damageNote: '归还时发现屏幕有裂纹',
    status: 'returned',
  },
];

export const generateSeedRepairs = (): RepairQueueItem[] => [
  {
    id: 'REPAIR-001',
    deviceId: 'GUIDE-005',
    reportedTime: '2026-06-05T11:00:00',
    issue: '按键失灵，音量键无响应',
    status: 'repairing',
    assignee: '张工',
  },
  {
    id: 'REPAIR-002',
    deviceId: 'GUIDE-007',
    reportedTime: '2026-06-04T17:45:00',
    issue: '屏幕碎裂，需要更换显示屏',
    status: 'pending',
  },
];
