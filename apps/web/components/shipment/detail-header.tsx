'use client';

import Link from 'next/link';
import { ArrowLeft, CheckCircle2, RefreshCw, RotateCw, Ship } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { StatusBadge } from './status-badge';
import type { Shipment } from '@/lib/types';

interface DetailHeaderProps {
  shipment: Shipment;
  onRetrySync: () => void;
  onMarkSynced: () => void;
  onMarkUnsynced: () => void;
  canSync?: boolean;
}

export function DetailHeader({
  shipment,
  onRetrySync,
  onMarkSynced,
  onMarkUnsynced,
  canSync = true,
}: DetailHeaderProps) {
  const syncStatus =
    shipment.syncStatus || (shipment.isSynced ? 'synced' : 'unsynced');
  const isSyncing = syncStatus === 'syncing';

  return (
    <div className="border-b border-border/60 bg-white/85 backdrop-blur-xl">
      <div className="p-4 lg:px-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-4">
            <Link href="/shipments">
              <Button variant="ghost" size="icon" className="shrink-0">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>

            <div>
              <div className="flex flex-wrap items-center gap-3">
                <h1 className="text-xl font-bold text-foreground">
                  {shipment.reference}
                </h1>

                <StatusBadge status={shipment.status} />

                {syncStatus === 'synced' ? (
                  <span className="flex items-center gap-2 text-xs text-green-600 bg-green-50 px-2 py-0.5 rounded-lg border border-green-200">
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    Synced
                  </span>
                ) : syncStatus === 'failed' ? (
                  <span className="flex items-center gap-2 text-xs text-red-600 bg-red-50 px-2 py-0.5 rounded-lg border border-red-200">
                    <RefreshCw className="h-3.5 w-3.5" />
                    Sync Failed
                  </span>
                ) : syncStatus === 'syncing' ? (
                  <span className="flex items-center gap-2 text-xs text-blue-600 bg-blue-50 px-2 py-0.5 rounded-lg border border-blue-200">
                    <RotateCw className="h-3.5 w-3.5 animate-spin" />
                    Syncing
                  </span>
                ) : (
                  <span className="flex items-center gap-2 text-xs text-yellow-600 bg-yellow-50 px-2 py-0.5 rounded-lg border border-yellow-200">
                    <RefreshCw className="h-3.5 w-3.5" />
                    Not Synced
                  </span>
                )}
              </div>

              <div className="mt-0.5 flex items-center gap-2 text-sm text-muted-foreground">
                <Ship className="h-4 w-4 text-primary" />
                <span>
                  {shipment.pol} - {shipment.pod}
                </span>
              </div>

              {shipment.syncError && (
                <p className="mt-1 text-xs text-red-600">
                  {shipment.syncError}
                </p>
              )}
            </div>
          </div>

          {canSync && (
            <div className="flex flex-wrap items-center gap-2 pl-14 lg:pl-0">
              <Button
                variant="secondary"
                size="sm"
                onClick={onRetrySync}
                disabled={isSyncing}
                className="rounded-xl"
              >
                <RotateCw
                  className={`h-4 w-4 mr-2 ${
                    isSyncing ? 'animate-spin' : ''
                  }`}
                />
                Retry Sync
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={onMarkSynced}
                disabled={isSyncing || shipment.isSynced}
                className="rounded-xl"
              >
                Mark Synced
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={onMarkUnsynced}
                disabled={isSyncing || !shipment.isSynced}
                className="rounded-xl"
              >
                Mark Unsynced
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
