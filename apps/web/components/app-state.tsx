'use client';

import { useEffect, useState } from 'react';
import { AlertCircle, CloudOff, RefreshCw, WifiOff } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';

type AppStateVariant = 'shipments' | 'users' | 'logs';

const appStateCopy: Record<
  AppStateVariant,
  {
    errorTitle: string;
    errorDescription: string;
    syncTitle: string;
    syncDescription: string;
  }
> = {
  shipments: {
    errorTitle: 'Failed to load shipments',
    errorDescription:
      'Shipment data cannot be displayed yet. Reload before continuing tracking checks.',
    syncTitle: 'Shipment sync failed',
    syncDescription:
      'Some local data is available, but it has not been sent to TransVoyant successfully.',
  },
  users: {
    errorTitle: 'Failed to load users',
    errorDescription:
      'The user list cannot be displayed yet. Reload before changing access.',
    syncTitle: 'User sync failed',
    syncDescription:
      'User changes were saved locally, but they have not been synced successfully.',
  },
  logs: {
    errorTitle: 'Failed to load logs',
    errorDescription:
      'Integration logs cannot be displayed yet. Reload to view the latest audit trail.',
    syncTitle: 'Log sync failed',
    syncDescription:
      'The latest logs have not been resent to the integration endpoint successfully.',
  },
};

export function useOfflineState(forceOffline = false) {
  const [isOffline, setIsOffline] = useState(forceOffline);

  useEffect(() => {
    const updateStatus = () => setIsOffline(forceOffline || !navigator.onLine);

    updateStatus();
    window.addEventListener('online', updateStatus);
    window.addEventListener('offline', updateStatus);

    return () => {
      window.removeEventListener('online', updateStatus);
      window.removeEventListener('offline', updateStatus);
    };
  }, [forceOffline]);

  return isOffline;
}

export function OfflineBanner({ show }: { show: boolean }) {
  if (!show) return null;

  return (
    <Alert className="border-amber-200 bg-amber-50 text-amber-950">
      <WifiOff className="h-4 w-4" />
      <AlertTitle>You are offline</AlertTitle>
      <AlertDescription>
        Changes will be stored temporarily and synced when the connection is restored.
      </AlertDescription>
    </Alert>
  );
}

export function FullPageErrorState({
  variant,
  onRetry,
}: {
  variant: AppStateVariant;
  onRetry: () => void;
}) {
  const copy = appStateCopy[variant];

  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-red-200 bg-red-50/60 px-4 py-16 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-red-100 text-red-700">
        <AlertCircle className="h-7 w-7" />
      </div>
      <h3 className="mt-4 text-lg font-semibold text-red-950">
        {copy.errorTitle}
      </h3>
      <p className="mt-1 max-w-md text-sm text-red-800/80">
        {copy.errorDescription}
      </p>
      <Button className="mt-5" variant="outline" onClick={onRetry}>
        <RefreshCw className="h-4 w-4" />
        Try again
      </Button>
    </div>
  );
}

export function FailedSyncState({
  variant,
  show,
  failedCount,
  onRetry,
}: {
  variant: AppStateVariant;
  show: boolean;
  failedCount?: number;
  onRetry?: () => void;
}) {
  if (!show) return null;

  const copy = appStateCopy[variant];

  return (
    <Alert className="border-red-200 bg-red-50 text-red-950">
      <CloudOff className="h-4 w-4" />
      <AlertTitle>{copy.syncTitle}</AlertTitle>
      <AlertDescription className="sm:flex sm:items-center sm:justify-between sm:gap-3">
        <span>
          {copy.syncDescription}
          {failedCount ? ` ${failedCount} item requires another sync.` : ''}
        </span>
        {onRetry && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="mt-3 border-red-200 bg-white text-red-700 hover:bg-red-100 sm:mt-0"
            onClick={onRetry}
          >
            <RefreshCw className="h-4 w-4" />
            Retry sync
          </Button>
        )}
      </AlertDescription>
    </Alert>
  );
}
