'use client';

import Link from 'next/link';
import { format } from 'date-fns';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { StatusBadge } from './status-badge';
import type { Shipment } from '@/lib/types';
import { ArrowRight, Eye, RefreshCw } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Tooltip, TooltipContent, TooltipTrigger } from '../ui/tooltip';
import { Button } from '../ui/button';

interface ShipmentTableProps {
  shipments: Shipment[];
  startIndex?: number;
}

export function ShipmentTable({ shipments, startIndex }: ShipmentTableProps) {
  return (
    <div className="lpi-table-wrap">
      <Table>
        <TableHeader>
          <TableRow className="lpi-table-head">
            <TableHead className="text-center">No</TableHead>
            <TableHead>Reference</TableHead>
            <TableHead>Container</TableHead>
            <TableHead>Route</TableHead>
            <TableHead>Movement</TableHead>
            <TableHead>ETA</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Sync</TableHead>
            <TableHead className="text-center w-16">
              Action
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {shipments.map((shipment, index) => (
            <TableRow
              key={shipment.id}
              className="group cursor-pointer lpi-row"
            >
              <TableCell>
                <Link href={`/shipments/${shipment.id}`} className="block">
                  <div className="text-center">
                    {startIndex ? startIndex + index + 1 : index + 1}
                  </div>
                </Link>
              </TableCell>
              <TableCell>
                <Link href={`/shipments/${shipment.id}`} className="block">
                  <div className="font-semibold text-foreground">
                    {shipment.reference}
                  </div>
                  <div className="text-sm text-muted-foreground">{shipment.bol}</div>
                </Link>
              </TableCell>
              <TableCell>
                <Link href={`/shipments/${shipment.id}`} className="block">
                  <div className="font-semibold text-foreground">
                    {shipment.container}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {shipment.containerType || shipment.cargoType} / {shipment.containerSize}
                  </div>
                </Link>
              </TableCell>
              <TableCell>
                <Link href={`/shipments/${shipment.id}`} className="block">
                  <div className="flex items-center gap-2 text-sm">
                    <span className="font-medium">{shipment.pol}</span>
                    <ArrowRight className="h-4 w-4 text-primary" />
                    <span className="font-medium">{shipment.pod}</span>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {shipment.carrier}
                  </div>
                </Link>
              </TableCell>
              <TableCell>
                <Link href={`/shipments/${shipment.id}`} className="block">
                  <span className="inline-flex items-center rounded-lg border border-border bg-muted/70 px-2 py-0.5 text-xs font-medium text-muted-foreground">
                    {shipment.movementType}
                  </span>
                </Link>
              </TableCell>
              <TableCell>
                <Link href={`/shipments/${shipment.id}`} className="block">
                  <div className="font-medium text-foreground">
                    {format(new Date(shipment.eta), 'dd MMMM yyyy')}
                  </div>
                </Link>
              </TableCell>
              <TableCell>
                <Link href={`/shipments/${shipment.id}`} className="block">
                  <StatusBadge status={shipment.status} />
                </Link>
              </TableCell>
              <TableCell>
                <Link href={`/shipments/${shipment.id}`} className="block">
                  {shipment.isSynced ? (
                    <span className="font-semibold text-xs text-green-600">
                      Synced
                    </span>
                  ) : (
                    <span className="font-semibold text-xs text-red-600">
                      Not Synced
                    </span>
                  )}
                </Link>
              </TableCell>
              <TableCell>
                <div className="flex justify-end gap-2">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Link href={`/shipments/${shipment.id}`}>
                        <Button size="icon" variant="ghost">
                          <Eye className="h-4 w-4 text-gray-400 group-hover:text-blue-600" />
                        </Button>
                      </Link>
                    </TooltipTrigger>
                    <TooltipContent side="top">View Detail</TooltipContent>
                  </Tooltip>

                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        size="icon"
                        variant="ghost"
                        disabled={shipment.isSynced}
                        onClick={(e) => {
                          e.stopPropagation();
                          e.preventDefault();
                        }}
                        className="disabled:pointer-events-auto disabled:cursor-not-allowed"
                      >
                        <RefreshCw
                          className={cn(
                            'h-4 w-4',
                            shipment.isSynced
                              ? 'text-gray-300'
                              : 'text-gray-400 group-hover:text-green-600',
                          )}
                        />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent side="top">
                      {shipment.isSynced
                        ? 'Already synced to Transvoyant'
                        : 'Upload to Transvoyant'}
                    </TooltipContent>
                  </Tooltip>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
