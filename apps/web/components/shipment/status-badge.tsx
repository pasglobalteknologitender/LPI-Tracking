'use client';

import { cn } from '@/lib/utils';
import type { ShipmentStatus, MilestoneStatus, SyncStatus } from '@/lib/types';

type SyncBadgeStatus = SyncStatus | 'not-synced';

interface StatusBadgeProps {
  status: ShipmentStatus | MilestoneStatus | SyncBadgeStatus;
  className?: string;
}

const statusStyles: Record<string, string> = {
  // Shipment Status (11 steps)
  Pending: 'bg-gray-100 text-gray-600 border-gray-200',
  Booked: 'bg-blue-100 text-blue-700 border-blue-200',
  'Picked Up': 'bg-indigo-100 text-indigo-700 border-indigo-200',
  'At POL': 'bg-purple-100 text-purple-700 border-purple-200',
  Loaded: 'bg-cyan-100 text-cyan-700 border-cyan-200',
  Departed: 'bg-amber-100 text-amber-700 border-amber-200',
  'At POD': 'bg-violet-100 text-violet-700 border-violet-200',
  Unloaded: 'bg-pink-100 text-pink-700 border-pink-200',
  Customs: 'bg-orange-100 text-orange-700 border-orange-200',
  'Out-Gate': 'bg-yellow-100 text-yellow-700 border-yellow-200',
  Delivered: 'bg-green-100 text-green-700 border-green-200',
  Returned: 'bg-emerald-100 text-emerald-700 border-emerald-200',

  // Milestone Status
  done: 'bg-green-100 text-green-700 border-green-200',
  pending: 'bg-gray-100 text-gray-500 border-gray-200',

  // Sync Status
  synced: 'bg-green-100 text-green-700 border-green-200',
  unsynced: 'bg-orange-100 text-orange-600 border-orange-200',
  'not-synced': 'bg-orange-100 text-orange-600 border-orange-200',
  failed: 'bg-red-100 text-red-700 border-red-200',
  syncing: 'bg-blue-100 text-blue-700 border-blue-200',
};

const statusLabels: Record<string, string> = {
  Pending: 'Pending',

  // Milestone labels
  done: 'Done',
  pending: 'Pending',

  // Sync labels
  synced: 'Synced',
  unsynced: 'Not Synced',
  'not-synced': 'Not Synced',
  failed: 'Failed',
  syncing: 'Syncing',
};

export function StatusBadge({ status, className }: StatusBadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border',
        statusStyles[status] || 'bg-gray-100 text-gray-700 border-gray-200',
        className,
      )}
    >
      {statusLabels[status] || status}
    </span>
  );
}
