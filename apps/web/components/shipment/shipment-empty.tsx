'use client';

import { Package } from 'lucide-react';

export function ShipmentEmpty() {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed bg-muted/30 py-16">
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-muted">
        <Package className="h-7 w-7 text-muted-foreground" />
      </div>
      <h3 className="mt-4 text-lg font-semibold">No shipments found</h3>
      <p className="mt-1 text-sm text-muted-foreground">
        Try adjusting your search or filter criteria
      </p>
    </div>
  );
}
