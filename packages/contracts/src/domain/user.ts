export interface User {
  id: string;
  name: string;
  email: string;
  role: import('../enums').UserRole;
  status: import('../enums').UserStatus;
  lastLogin?: string | null;
  createdAt?: string;
  updatedAt?: string;
}
