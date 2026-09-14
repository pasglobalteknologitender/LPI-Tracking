import type { MilestoneDto, ShipmentDetailDto, ShipmentListItemDto } from '../api/shipment';
import type { Milestone, Shipment, ShipmentFile } from '../domain/shipment';

function mapMilestoneFromDto(dto: MilestoneDto): Milestone {
  return {
    id: dto.id,
    name: dto.name,
    status: dto.status,
    dateTime: dto.date_time,
    location: dto.location,
    notes: dto.notes,
    photo: dto.photo,
    lastUpdated: dto.last_updated,
    updatedBy: dto.updated_by,
    isSynced: dto.is_synced,
    syncedAt: dto.synced_at,
    syncStatus: dto.sync_status,
    syncError: dto.sync_error,
  };
}

function mapMilestoneToDto(milestone: Milestone): MilestoneDto {
  return {
    id: milestone.id,
    name: milestone.name,
    status: milestone.status,
    date_time: milestone.dateTime,
    location: milestone.location,
    notes: milestone.notes,
    photo: milestone.photo,
    last_updated: milestone.lastUpdated,
    updated_by: milestone.updatedBy,
    is_synced: milestone.isSynced,
    synced_at: milestone.syncedAt,
    sync_status: milestone.syncStatus,
    sync_error: milestone.syncError,
  };
}

export function mapShipmentListItemFromDto(dto: ShipmentListItemDto): Shipment {
  return {
    id: dto.id,
    reference: dto.reference,
    bol: dto.bol,
    hbol: dto.hbol,
    container: dto.container,
    containerType: dto.container_type,
    carrier: dto.carrier,
    vessel: dto.vessel,
    voyage: dto.voyage,
    movementType: dto.movement_type,
    status: dto.status,
    shipper: dto.shipper,
    consignee: dto.consignee,
    pol: dto.pol,
    pod: dto.pod,
    etd: dto.etd,
    eta: dto.eta,
    cargoType: dto.cargo_type,
    containerSize: dto.container_size,
    weight: dto.weight,
    isSynced: dto.is_synced,
    syncedAt: dto.synced_at,
    syncStatus: dto.sync_status,
    syncError: dto.sync_error,
  };
}

export function mapShipmentDetailFromDto(dto: ShipmentDetailDto): Shipment {
  return {
    ...mapShipmentListItemFromDto(dto),
    milestones: dto.milestones.map(mapMilestoneFromDto),
    files: dto.files?.map(
      (file): ShipmentFile => ({
        id: file.id,
        type: file.type,
        filename: file.filename,
        url: file.url,
        mimeType: file.mime_type,
        size: file.size,
        uploadedBy: file.uploaded_by,
        uploadedAt: file.uploaded_at,
      }),
    ),
  };
}

export function mapShipmentListItemToDto(shipment: Shipment): ShipmentListItemDto {
  return {
    id: shipment.id,
    reference: shipment.reference,
    bol: shipment.bol,
    hbol: shipment.hbol,
    container: shipment.container,
    container_type: shipment.containerType,
    carrier: shipment.carrier,
    vessel: shipment.vessel,
    voyage: shipment.voyage,
    movement_type: shipment.movementType,
    status: shipment.status,
    shipper: shipment.shipper,
    consignee: shipment.consignee,
    pol: shipment.pol,
    pod: shipment.pod,
    etd: shipment.etd,
    eta: shipment.eta,
    cargo_type: shipment.cargoType,
    container_size: shipment.containerSize,
    weight: shipment.weight,
    is_synced: shipment.isSynced,
    synced_at: shipment.syncedAt,
    sync_status: shipment.syncStatus,
    sync_error: shipment.syncError,
  };
}

export function mapMilestoneToDtoExport(milestone: Milestone): MilestoneDto {
  return mapMilestoneToDto(milestone);
}

export { mapMilestoneFromDto, mapMilestoneToDto };
