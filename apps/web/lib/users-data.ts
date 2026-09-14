import type { UserRole } from './permissions';

export type AdminUser = {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  lastLogin?: string | null;
};
