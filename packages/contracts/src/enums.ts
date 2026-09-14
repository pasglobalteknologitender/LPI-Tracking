export const USER_ROLES = ['admin', 'operator', 'viewer'] as const;
export type UserRole = (typeof USER_ROLES)[number];

export const USER_STATUSES = ['active', 'inactive'] as const;
export type UserStatus = (typeof USER_STATUSES)[number];

export const PERMISSIONS = [
  'view_shipments',
  'upload_shipments',
  'update_milestone',
  'sync_shipments',
  'view_logs',
  'manage_users',
] as const;
export type Permission = (typeof PERMISSIONS)[number];

export const ROLE_PERMISSIONS: Record<UserRole, readonly Permission[]> = {
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

export const MOVEMENT_TYPES = ['D2D', 'D2P'] as const;
export type MovementType = (typeof MOVEMENT_TYPES)[number];

export const SHIPMENT_STATUSES = [
  'Pending',
  'Booked',
  'Picked Up',
  'At POL',
  'Loaded',
  'Departed',
  'At POD',
  'Unloaded',
  'Customs',
  'Out-Gate',
  'Delivered',
  'Returned',
] as const;
export type ShipmentStatus = (typeof SHIPMENT_STATUSES)[number];

export const CARGO_TYPES = ['FCL', 'LCL'] as const;
export type CargoType = (typeof CARGO_TYPES)[number];

export const MILESTONE_STATUSES = ['pending', 'done'] as const;
export type MilestoneStatus = (typeof MILESTONE_STATUSES)[number];

export const SYNC_STATUSES = ['synced', 'unsynced', 'failed', 'syncing'] as const;
export type SyncStatus = (typeof SYNC_STATUSES)[number];

export const IMPORT_BATCH_STATUSES = [
  'uploaded',
  'parsing',
  'ready',
  'committing',
  'completed',
  'failed',
] as const;
export type ImportBatchStatus = (typeof IMPORT_BATCH_STATUSES)[number];

export const IMPORT_ROW_STATUSES = ['valid', 'invalid', 'imported', 'skipped'] as const;
export type ImportRowStatus = (typeof IMPORT_ROW_STATUSES)[number];

export const INTEGRATION_DELIVERY_STATUSES = [
  'pending',
  'processing',
  'succeeded',
  'retry_scheduled',
  'failed',
  'dead',
] as const;
export type IntegrationDeliveryStatus = (typeof INTEGRATION_DELIVERY_STATUSES)[number];

export const INTEGRATION_OPERATIONS = ['shipment_attributes', 'shipment_event'] as const;
export type IntegrationOperation = (typeof INTEGRATION_OPERATIONS)[number];

export const MILESTONE_NAMES = [
  'Booking Confirmation',
  'Carrier Pick-up from Origin',
  'Arrival at Port of Load (POL)',
  'Loaded on Vessel',
  'Vessel Departed',
  'Arrival at Port of Destination (POD)',
  'Unloaded from Vessel',
  'Customs Cleared',
  'Out-Gate',
  'Carrier Delivery to Destination',
  'Empty Container Returned',
] as const;
export type MilestoneName = (typeof MILESTONE_NAMES)[number];

export function hasPermission(role: UserRole, permission: Permission): boolean {
  return ROLE_PERMISSIONS[role].includes(permission);
}
