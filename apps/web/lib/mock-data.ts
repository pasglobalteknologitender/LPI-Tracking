import type { Shipment, Milestone } from './types';
import { MILESTONE_NAMES } from './types';

function daysFromNow(days: number): string {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date.toISOString().slice(0, 10);
}

type MilestoneScenario = {
  failedIndexes?: number[];
  unsyncedIndexes?: number[];
  emptyIndexes?: number[];
};

function createMilestones(
  completedCount: number,
  scenario: MilestoneScenario = {},
): Milestone[] {
  return MILESTONE_NAMES.map((name, index) => {
    const isCompleted = index < completedCount;
    const hasFailedSync = scenario.failedIndexes?.includes(index) ?? false;
    const isForcedUnsynced = scenario.unsyncedIndexes?.includes(index) ?? false;
    const isEmpty = scenario.emptyIndexes?.includes(index) ?? false;
    const isSynced = isCompleted && !hasFailedSync && !isForcedUnsynced;

    const locations = [
      'Shanghai, CN',
      'Los Angeles, US',
      'Long Beach, US',
      'Warehouse A',
    ] as const;
    const actors = ['Alice', 'Bob', 'Charlie', 'Diana'] as const;

    return {
      id: `milestone-${index + 1}`,
      name,
      status: isCompleted ? 'done' : 'pending',
      dateTime: isCompleted
        ? new Date(
            Date.now() - (completedCount - index) * 86400000,
          ).toISOString()
        : index === completedCount && !isEmpty
          ? new Date().toISOString()
          : null,
      location:
        !isEmpty && (isCompleted || index === completedCount)
          ? (locations[index % locations.length] ?? null)
          : null,
      notes: hasFailedSync
        ? 'Sync rejected by Transvoyant sandbox'
        : isCompleted
          ? 'Completed successfully'
          : null,
      photo: null,
      lastUpdated: isCompleted ? new Date().toISOString() : null,
      updatedBy: isCompleted ? (actors[index % actors.length] ?? null) : null,
      isSynced,
      syncedAt: isSynced
        ? new Date(
            Date.now() - Math.floor(Math.random() * 30) * 86400000,
          ).toISOString()
        : null,
      syncStatus: hasFailedSync ? 'failed' : isSynced ? 'synced' : 'unsynced',
      syncError: hasFailedSync ? 'Sandbox sync timeout' : null,
    };
  });
}

export const mockShipments: Shipment[] = [
  {
    id: '1',
    reference: 'QA-D2D-FCL-SYNCED',
    bol: 'MAEU123456789',
    hbol: 'MAEU-HBL-123456',
    container: 'MSKU1234567',
    containerType: '42GP',
    carrier: 'Maersk Line',
    vessel: 'MSC ISABELLA',
    voyage: '024E',
    movementType: 'D2D',
    status: 'Pending',
    shipper: 'Shanghai Electronics Co.',
    consignee: 'US Imports LLC',
    pol: 'Shanghai, CN',
    pod: 'Los Angeles, US',
    etd: daysFromNow(3),
    eta: daysFromNow(28),
    cargoType: 'FCL',
    containerSize: "40'",
    weight: '18,500 kg',
    milestones: createMilestones(1),
    isSynced: true,
    syncedAt: new Date().toISOString(),
    syncStatus: 'synced',
    syncError: null,
  },
  {
    id: '2',
    reference: 'QA-D2P-LCL-UNSYNCED',
    bol: 'COSU987654321',
    hbol: 'COSU-HBL-987654',
    container: 'CSQU7654321',
    containerType: '22GP',
    carrier: 'COSCO Shipping',
    vessel: 'COSCO STAR',
    voyage: '018W',
    movementType: 'D2P',
    status: 'At POL',
    shipper: 'Ningbo Textiles Ltd.',
    consignee: 'European Fabrics GmbH',
    pol: 'Ningbo, CN',
    pod: 'Rotterdam, NL',
    etd: daysFromNow(1),
    eta: daysFromNow(24),
    cargoType: 'LCL',
    containerSize: "20'",
    weight: '8,200 kg',
    milestones: createMilestones(3, { unsyncedIndexes: [0, 1, 2] }),
    isSynced: false,
    syncedAt: null,
    syncStatus: 'unsynced',
    syncError: null,
  },
  {
    id: '3',
    reference: 'QA-D2D-FCL-DELIVERED',
    bol: 'HLCU456789123',
    hbol: 'HLCU-HBL-456789',
    container: 'HLXU9876543',
    containerType: '42GP',
    carrier: 'Hapag-Lloyd',
    vessel: 'BERLIN EXPRESS',
    voyage: '035N',
    movementType: 'D2D',
    status: 'Delivered',
    shipper: 'Munich Auto Parts AG',
    consignee: 'Tokyo Motors Inc.',
    pol: 'Hamburg, DE',
    pod: 'Tokyo, JP',
    etd: daysFromNow(-42),
    eta: daysFromNow(-7),
    cargoType: 'FCL',
    containerSize: "40'",
    weight: '22,000 kg',
    milestones: createMilestones(11),
    isSynced: true,
    syncedAt: new Date().toISOString(),
    syncStatus: 'synced',
    syncError: null,
  },
  {
    id: '4',
    reference: 'QA-D2P-LCL-RETURNED',
    bol: 'EGLV112233445',
    hbol: 'EGLV-HBL-112233',
    container: 'EGHU1122334',
    containerType: '42GP',
    carrier: 'Evergreen Marine',
    vessel: 'EVER GIVEN',
    voyage: '042S',
    movementType: 'D2P',
    status: 'Returned',
    shipper: 'Taiwan Tech Corp.',
    consignee: 'Sydney Electronics Pty',
    pol: 'Kaohsiung, TW',
    pod: 'Sydney, AU',
    etd: daysFromNow(-55),
    eta: daysFromNow(-18),
    cargoType: 'LCL',
    containerSize: "40'",
    weight: '15,800 kg',
    milestones: createMilestones(11),
    isSynced: true,
    syncedAt: new Date().toISOString(),
    syncStatus: 'synced',
    syncError: null,
  },
  {
    id: '5',
    reference: 'QA-D2D-LCL-FAILED-SYNC',
    bol: 'ONEU998877665',
    hbol: 'ONEU-HBL-998877',
    container: 'OOLU8877665',
    containerType: '22GP',
    carrier: 'ONE (Ocean Network Express)',
    vessel: 'ONE INNOVATION',
    voyage: '051E',
    movementType: 'D2D',
    status: 'Customs',
    shipper: 'Seoul Fashion Co.',
    consignee: 'NYC Fashion House',
    pol: 'Busan, KR',
    pod: 'New York, US',
    etd: daysFromNow(-34),
    eta: daysFromNow(-2),
    cargoType: 'LCL',
    containerSize: "20'",
    weight: '6,500 kg',
    milestones: createMilestones(8, { failedIndexes: [3, 7] }),
    isSynced: false,
    syncedAt: null,
    syncStatus: 'failed',
    syncError: 'One or more milestones failed to sync',
  },
  {
    id: '6',
    reference: 'QA-D2P-FCL-ETA-OVERDUE',
    bol: 'YMLU556677889',
    hbol: 'YMLU-HBL-556677',
    container: 'YMLU5566778',
    containerType: '42GP',
    carrier: 'Yang Ming Marine',
    vessel: 'YM WELLNESS',
    voyage: '028W',
    movementType: 'D2D',
    status: 'Loaded',
    shipper: 'Shenzhen Gadgets Ltd.',
    consignee: 'London Tech Retail',
    pol: 'Shenzhen, CN',
    pod: 'Felixstowe, UK',
    etd: daysFromNow(-21),
    eta: daysFromNow(-1),
    cargoType: 'FCL',
    containerSize: "40'",
    weight: '19,200 kg',
    milestones: createMilestones(4, { unsyncedIndexes: [0, 1, 2, 3] }),
    isSynced: false,
    syncedAt: null,
    syncStatus: 'unsynced',
    syncError: null,
  },
  {
    id: '7',
    reference: 'QA-D2D-FCL-DELIVERED-FAILED',
    bol: 'MEDU224466880',
    hbol: 'MEDU-HBL-224466',
    container: 'MSCU2244668',
    containerType: '42GP',
    carrier: 'MSC',
    vessel: 'MSC ARIES',
    voyage: '067E',
    movementType: 'D2D',
    status: 'Delivered',
    shipper: 'Jakarta Furniture Works',
    consignee: 'Dubai Home Trading',
    pol: 'Jakarta, ID',
    pod: 'Jebel Ali, AE',
    etd: daysFromNow(-45),
    eta: daysFromNow(-9),
    cargoType: 'FCL',
    containerSize: "40'",
    weight: '20,100 kg',
    milestones: createMilestones(10, { failedIndexes: [9] }),
    isSynced: false,
    syncedAt: null,
    syncStatus: 'failed',
    syncError: 'Final delivery milestone failed to sync',
  },
  {
    id: '8',
    reference: 'QA-D2P-LCL-EMPTY-FIELDS',
    bol: '',
    hbol: '',
    container: '',
    containerType: '',
    carrier: '',
    vessel: '',
    voyage: '',
    movementType: 'D2P',
    status: 'Pending',
    shipper: '',
    consignee: '',
    pol: '',
    pod: '',
    etd: daysFromNow(7),
    eta: daysFromNow(35),
    cargoType: 'LCL',
    containerSize: '',
    weight: '',
    milestones: createMilestones(0, { emptyIndexes: [0, 1, 2] }),
    isSynced: false,
    syncedAt: null,
    syncStatus: 'unsynced',
    syncError: null,
  },
];
