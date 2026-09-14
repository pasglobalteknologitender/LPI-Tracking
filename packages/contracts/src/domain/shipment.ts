import type {
  CargoType,
  MilestoneStatus,
  MovementType,
  ShipmentStatus,
  SyncStatus,
} from '../enums';

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

export interface ShipmentFile {
  id: string;
  type: string;
  filename: string;
  url: string;
  mimeType: string;
  size: number;
  uploadedBy: string;
  uploadedAt: string;
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
  cargoType: CargoType;
  containerSize: string;
  weight: string;
  milestones?: Milestone[];
  files?: ShipmentFile[];
  isSynced?: boolean;
  syncedAt?: string | null;
  syncStatus?: SyncStatus;
  syncError?: string | null;
}
