'use client';

import { useState, useEffect, useMemo } from 'react';
import { ShipmentTable } from '@/components/shipment/shipment-table';
import { ShipmentCard } from '@/components/shipment/shipment-card';
import { ShipmentFilters } from '@/components/shipment/shipment-filters';
import { ShipmentListSkeleton } from '@/components/shipment/shipment-skeleton';
import { getShipments } from '@/lib/shipment-service';
import type { Shipment, MovementType, ShipmentStatus } from '@/lib/types';
import { ShipmentPagination } from '@/components/shipment/shipment-pagination';
import { ShipmentEmpty } from '@/components/shipment/shipment-empty';
import { ShipmentHeader } from '@/components/shipment/shipment-header';
import {
  FailedSyncState,
  FullPageErrorState,
  OfflineBanner,
  useOfflineState,
} from '@/components/app-state';
import { CheckCircle2, Clock3, CloudOff, PackageCheck } from 'lucide-react';

const FORCE_DUMMY_ERROR = false;
const FORCE_DUMMY_OFFLINE = false;
const FORCE_DUMMY_FAILED_SYNC = false;

export default function ShipmentsPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [hasLoadError, setHasLoadError] = useState(FORCE_DUMMY_ERROR);
  const [shipments, setShipments] = useState<Shipment[]>([]);
  const [search, setSearch] = useState('');
  const [movementType, setMovementType] = useState<MovementType | 'all'>('all');
  const [cargoType, setCargoType] = useState<'FCL' | 'LCL' | 'all'>('all');
  const [status, setStatus] = useState<ShipmentStatus | 'all'>('all');

  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 5;
  const isOffline = useOfflineState(FORCE_DUMMY_OFFLINE);

  useEffect(() => {
    setCurrentPage(1);
  }, [search, movementType, cargoType, status]);

  useEffect(() => {
    let mounted = true;

    async function loadShipments() {
      setIsLoading(true);
      setHasLoadError(FORCE_DUMMY_ERROR);

      try {
        const data = await getShipments();
        if (!mounted) return;

        setShipments(data);
      } catch {
        if (!mounted) return;
        setHasLoadError(true);
      } finally {
        if (mounted) setIsLoading(false);
      }
    }

    loadShipments();

    return () => {
      mounted = false;
    };
  }, []);

  const filteredShipments = useMemo(() => {
    return shipments.filter((shipment) => {
      const searchLower = search.toLowerCase();
      const matchesSearch =
        !search ||
        shipment.reference.toLowerCase().includes(searchLower) ||
        shipment.bol.toLowerCase().includes(searchLower) ||
        shipment.container.toLowerCase().includes(searchLower);

      const matchesMovementType =
        movementType === 'all' || shipment.movementType === movementType;

      const matchesCargoType =
        cargoType === 'all' || shipment.cargoType === cargoType;

      const matchesStatus = status === 'all' || shipment.status === status;

      return (
        matchesSearch &&
        matchesMovementType &&
        matchesCargoType &&
        matchesStatus
      );
    });
  }, [shipments, search, movementType, cargoType, status]);

  const totalPages = Math.ceil(filteredShipments.length / pageSize);
  const failedSyncCount = useMemo(
    () =>
      shipments.filter((shipment) => shipment.syncStatus === 'failed').length,
    [shipments],
  );
  const shipmentStats = useMemo(
    () => [
      {
        label: 'Total Shipments',
        value: shipments.length,
        hint: 'All tracked shipments',
        icon: PackageCheck,
        tone: 'blue',
      },
      {
        label: 'In Progress',
        value: shipments.filter(
          (shipment) =>
            !['Delivered', 'Returned'].includes(shipment.status),
        ).length,
        hint: 'Still moving',
        icon: Clock3,
        tone: 'amber',
      },
      {
        label: 'Delivered',
        value: shipments.filter((shipment) => shipment.status === 'Delivered')
          .length,
        hint: 'Completed shipments',
        icon: CheckCircle2,
        tone: 'green',
      },
      {
        label: 'Sync Issues',
        value: failedSyncCount,
        hint: 'Need retry',
        icon: CloudOff,
        tone: 'red',
      },
    ],
    [failedSyncCount, shipments],
  );
  const showFailedSync = FORCE_DUMMY_FAILED_SYNC || failedSyncCount > 0;

  const paginatedShipments = filteredShipments.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize,
  );

  const handleRetryLoad = async () => {
    setIsLoading(true);
    setHasLoadError(false);
    const data = await getShipments();
    setShipments(data);
    setIsLoading(false);
  };

  const handleRetrySync = () => {
    setShipments((prev) =>
      prev.map((shipment) =>
        shipment.syncStatus === 'failed'
          ? {
              ...shipment,
              isSynced: false,
              syncStatus: 'unsynced',
              syncError: null,
            }
          : shipment,
      ),
    );
  };

  return (
    <div className="lpi-page">
      <OfflineBanner show={isOffline} />
      <ShipmentHeader />

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {shipmentStats.map((stat) => (
          <div key={stat.label} className="lpi-stat-card">
            <div className={`lpi-stat-icon lpi-stat-icon-${stat.tone}`}>
              <stat.icon className="h-5 w-5" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between gap-3">
                <p className="truncate text-sm font-medium text-muted-foreground">
                  {stat.label}
                </p>
                <p className="text-2xl font-bold tracking-tight text-foreground">
                  {stat.value}
                </p>
              </div>
              <p className="truncate text-xs text-muted-foreground">{stat.hint}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="space-y-5">
        <ShipmentFilters
          search={search}
          onSearchChange={setSearch}
          movementType={movementType}
          onMovementTypeChange={setMovementType}
          status={status}
          onStatusChange={setStatus}
          cargoType={cargoType}
          onCargoTypeChange={setCargoType}
        />

        {isLoading ? (
          <ShipmentListSkeleton />
        ) : hasLoadError ? (
          <FullPageErrorState variant="shipments" onRetry={handleRetryLoad} />
        ) : filteredShipments.length === 0 ? (
          <ShipmentEmpty />
        ) : (
          <>
            <FailedSyncState
              variant="shipments"
              show={showFailedSync}
              failedCount={failedSyncCount}
              onRetry={handleRetrySync}
            />

            <ShipmentTable
              shipments={paginatedShipments}
              startIndex={(currentPage - 1) * pageSize}
            />

            <div className="md:hidden flex flex-col gap-4">
              {paginatedShipments.map((shipment) => (
                <ShipmentCard key={shipment.id} shipment={shipment} />
              ))}
            </div>

            <ShipmentPagination
              currentPage={currentPage}
              totalPages={totalPages}
              totalItems={filteredShipments.length}
              pageSize={pageSize}
              onPageChange={setCurrentPage}
            />
          </>
        )}
      </div>
    </div>
  );
}
