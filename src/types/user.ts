export type UserRole = 'visitor' | 'service' | 'maintenance';

export interface User {
  role: UserRole;
  name: string;
}
