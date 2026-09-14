'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import { ShipmentInfo } from '@/components/shipment/shipment-info';
import { ShipmentTimeline } from '@/components/shipment/shipment-timeline';
import {
  getShipmentById,
  markShipmentMilestonesSynced,
  markShipmentMilestonesUnsynced,
  updateMilestone,
  updateShipmentSyncState,
} from '@/lib/shipment-service';
import type { Shipment, Milestone } from '@/lib/types';
import { DetailHeader } from '@/components/shipment/detail-header';
import { DetailSkeleton } from '@/components/shipment/detail-skeleton';
import { toast } from 'sonner';
import { useAuth } from '@/lib/auth-context';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function ShipmentDetailPage({ params }: PageProps) {
  const { id } = use(params);
  const router = useRouter();
  const { can, user } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [shipment, setShipment] = useState<Shipment | null>(null);

  useEffect(() => {
    let mounted = true;

    async function loadShipment() {
      setIsLoading(true);
      const found = await getShipmentById(id);
      if (!mounted) return;

      setShipment(found);
      setIsLoading(false);
    }

    loadShipment();

    return () => {
      mounted = false;
    };
  }, [id]);

  const handleMilestoneUpdate = async (updated: Milestone) => {
    if (!can('update_milestone')) {
      toast.error('You do not have access to update milestones');
      return;
    }

    const updatedShipment = await updateMilestone({
      shipmentId: id,
      milestone: {
        ...updated,
        updatedBy: user?.name || updated.updatedBy,
      },
    });
    if (updatedShipment) {
      setShipment(updatedShipment);
    }
  };

  const handleShipmentRetrySync = async () => {
    if (!shipment) return;
    if (!can('sync_shipments')) {
      toast.error('You do not have access to sync shipments');
      return;
    }

    setShipment({
      ...shipment,
      syncStatus: 'syncing',
      syncError: null,
    });

    await new Promise((resolve) => setTimeout(resolve, 900));

    if (Math.random() > 0.3) {
      const updatedShipment = await markShipmentMilestonesSynced(id);
      if (updatedShipment) {
        setShipment(updatedShipment);
        toast.success(`${updatedShipment.reference} synced successfully`);
      }
      return;
    }

    const updatedShipment = await updateShipmentSyncState(id, {
      isSynced: false,
      syncedAt: null,
      syncStatus: 'failed',
      syncError: 'Dummy shipment sync failed',
    });
    if (updatedShipment) {
      setShipment(updatedShipment);
      toast.error(`${updatedShipment.reference} failed to sync. Retry again.`);
    }
  };

  const handleShipmentMarkSynced = async () => {
    if (!can('sync_shipments')) {
      toast.error('You do not have access to sync shipments');
      return;
    }

    const updatedShipment = await markShipmentMilestonesSynced(id);
    if (updatedShipment) {
      setShipment(updatedShipment);
      toast.success(`${updatedShipment.reference} marked as synced`);
    }
  };

  const handleShipmentMarkUnsynced = async () => {
    if (!can('sync_shipments')) {
      toast.error('You do not have access to sync shipments');
      return;
    }

    const updatedShipment = await markShipmentMilestonesUnsynced(id);
    if (updatedShipment) {
      setShipment(updatedShipment);
      toast.success(`${updatedShipment.reference} marked as unsynced`);
    }
  };

  if (isLoading) {
    return <DetailSkeleton />;
  }

  if (!shipment) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="text-center">
          <h2 className="mb-2 text-xl font-semibold text-foreground">
            Shipment not found
          </h2>
          <p className="mb-4 text-muted-foreground">
            The shipment you&apos;re looking for doesn&apos;t exist.
          </p>
          <button
            onClick={() => router.push('/shipments')}
            className="text-primary hover:underline"
          >
            Go back to shipments
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <DetailHeader
        shipment={shipment}
        onRetrySync={handleShipmentRetrySync}
        onMarkSynced={handleShipmentMarkSynced}
        onMarkUnsynced={handleShipmentMarkUnsynced}
        canSync={can('sync_shipments')}
      />

      <div className="space-y-6 p-4 sm:p-6">
        <ShipmentInfo shipment={shipment} />

        <div>
          <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold text-foreground">
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-100 text-xs font-bold text-primary">
              {shipment.milestones.filter((m) => m.status === 'done').length}
            </span>
            Shipment Timeline
          </h2>
          <ShipmentTimeline
            milestones={shipment.milestones}
            onMilestoneUpdate={handleMilestoneUpdate}
            canUpdateMilestone={can('update_milestone')}
            canSync={can('sync_shipments')}
          />
        </div>
      </div>
    </div>
  );
}
