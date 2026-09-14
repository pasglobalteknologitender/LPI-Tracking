export type MovementType = 'D2D' | 'D2P';

export type MilestoneStatus = 'pending' | 'done';

export type SyncStatus = 'synced' | 'unsynced' | 'failed' | 'syncing';

export type ShipmentStatus =
  | 'Pending'
  | 'Booked'
  | 'Picked Up'
  | 'At POL'
  | 'Loaded'
  | 'Departed'
  | 'At POD'
  | 'Unloaded'
  | 'Customs'
  | 'Out-Gate'
  | 'Delivered'
  | 'Returned';

export interface Milestone {
  id: string;
  name: string;
  status: MilestoneStatus;
  dateTime: string | null;
  location: string | null;
  notes: string | null;
  photo: string | null;
  lastUpdated: string | null;
  updatedBy: string | null;
  isSynced?: boolean;
  syncedAt?: string | null;
  syncStatus?: SyncStatus;
  syncError?: string | null;
}

export interface Shipment {
  id: string;
  reference: string;
  bol: string;
  hbol: string;
  container: string;
  containerType: string;
  carrier: string;
  vessel: string;
  voyage: string;
  movementType: MovementType;
  status: ShipmentStatus;
  shipper: string;
  consignee: string;
  pol: string;
  pod: string;
  etd: string;
  eta: string;
  cargoType: 'FCL' | 'LCL';
  containerSize: string;
  weight: string;
  milestones: Milestone[];
  isSynced?: boolean;
  syncedAt?: string | null;
  syncStatus?: SyncStatus;
  syncError?: string | null;
}

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
