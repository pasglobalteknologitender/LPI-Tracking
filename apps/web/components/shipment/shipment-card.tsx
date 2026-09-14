'use client';

import Link from 'next/link';
import { format } from 'date-fns';
import { Card, CardContent } from '@/components/ui/card';
import { StatusBadge } from './status-badge';
import type { Shipment } from '@/lib/types';
import {
  Ship,
  ArrowRight,
  Calendar,
  Package,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface ShipmentCardProps {
  shipment: Shipment;
}

export function ShipmentCard({ shipment }: ShipmentCardProps) {
  return (
    <Link href={`/shipments/${shipment.id}`}>
      <Card className="group cursor-pointer rounded-2xl border-border/70 p-0 shadow-sm shadow-slate-950/[0.03] transition-all hover:border-blue-200 hover:shadow-md">
        <CardContent className="p-4">
          <div className="flex items-start justify-between mb-3">
            <div>
              <h3 className="font-semibold text-foreground">
                {shipment.reference}
              </h3>
              <p className="text-sm text-muted-foreground">{shipment.bol}</p>
            </div>

            <div className="flex items-center gap-2">
              <StatusBadge status={shipment.status} />

              {shipment.isSynced ? (
                <CheckCircle2 className="h-4 w-4 text-green-600" />
              ) : (
                <AlertCircle className="h-4 w-4 text-yellow-500" />
              )}

              <button
                disabled={shipment.isSynced}
                onClick={(e) => {
                  e.stopPropagation();
                  e.preventDefault();
                  if (!shipment.isSynced) {
                    console.log('Upload to Transvoyant:', shipment.id);
                  }
                }}
                className={cn(
                  'p-1 rounded-md transition-colors',
                  shipment.isSynced
                    ? 'text-gray-300 cursor-not-allowed'
                    : 'text-gray-400 hover:text-green-600 hover:bg-green-50',
                )}
              >
                <RefreshCw className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div className="mb-3 flex items-center gap-2 text-sm text-foreground">
            <span className="font-medium">{shipment.pol}</span>
            <Ship className="h-4 w-4 text-primary" />
            <span className="font-medium">{shipment.pod}</span>
          </div>

          <div className="grid grid-cols-2 gap-3 text-sm">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Package className="h-4 w-4" />
              <span>{shipment.container}</span>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <Calendar className="h-4 w-4" />
              <span>{format(new Date(shipment.eta), 'MMM dd')}</span>
            </div>
          </div>

          <div className="mt-4 flex items-center justify-between border-t pt-3">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center rounded-lg border border-border bg-muted/70 px-2 py-0.5 text-xs font-medium text-muted-foreground">
                {shipment.movementType}
              </span>
              <span className="text-xs text-gray-500">
                {shipment.cargoType} / {shipment.containerSize}
              </span>
            </div>
            <ArrowRight className="h-4 w-4 text-gray-400 group-hover:text-blue-600 transition-colors" />
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
