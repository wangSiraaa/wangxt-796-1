export interface RentalRecord {
  id: string;
  deviceId: string;
  renterName: string;
  renterPhone: string;
  renterIdCard: string;
  deposit: number;
  depositRefunded: boolean;
  rentalTime: string;
  expectedReturnTime: string;
  actualReturnTime?: string;
  language: string;
  damageOnReturn?: boolean;
  damageNote?: string;
  status: 'active' | 'returned' | 'overdue';
}

export interface RepairQueueItem {
  id: string;
  deviceId: string;
  reportedTime: string;
  issue: string;
  status: 'pending' | 'repairing' | 'completed';
  assignee?: string;
}
