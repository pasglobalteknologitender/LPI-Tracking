export const ROLES = ['admin', 'operator', 'viewer'] as const;

export type UserRole = (typeof ROLES)[number];

export const ROLE_LABELS: Record<UserRole, string> = {
  admin: 'Admin',
  operator: 'Operator',
  viewer: 'Viewer',
};

export const PERMISSIONS = [
  'view_shipments',
  'upload_shipments',
  'update_milestone',
  'sync_shipments',
  'view_logs',
  'manage_users',
] as const;

export type Permission = (typeof PERMISSIONS)[number];

export const rolePermissions: Record<UserRole, Permission[]> = {
  viewer: ['view_shipments', 'view_logs'],
  operator: [
    'view_shipments',
    'upload_shipments',
    'update_milestone',
    'sync_shipments',
    'view_logs',
  ],
  admin: [
    'view_shipments',
    'upload_shipments',
    'update_milestone',
    'sync_shipments',
    'view_logs',
    'manage_users',
  ],
};

export function canRole(role: UserRole | undefined, permission: Permission) {
  if (!role) return false;

  return rolePermissions[role].includes(permission);
}

export function isUserRole(value: unknown): value is UserRole {
  return typeof value === 'string' && ROLES.includes(value as UserRole);
}
