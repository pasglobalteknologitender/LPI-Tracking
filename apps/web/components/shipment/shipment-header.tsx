'use client';

import Link from 'next/link';
import { Package2, UploadCloud } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/lib/auth-context';

export function ShipmentHeader() {
  const { can } = useAuth();

  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-center gap-3 sm:gap-4">
        <div className="lpi-icon-tile">
          <Package2 className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
        </div>
        <div>
          <h1 className="lpi-page-title">Shipments</h1>
          <p className="lpi-page-description">
            Track and manage your ocean shipments
          </p>
        </div>
      </div>

      {can('upload_shipments') && (
        <Link href="/shipments/upload">
          <Button className="h-10 w-full rounded-xl bg-primary text-white shadow-lg shadow-blue-700/20 hover:bg-primary/90 sm:w-auto">
            <UploadCloud className="w-4 h-4 mr-2" />
            Upload Shipment
          </Button>
        </Link>
      )}
    </div>
  );
}
