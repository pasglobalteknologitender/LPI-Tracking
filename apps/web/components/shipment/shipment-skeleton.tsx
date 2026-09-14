'use client';

import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

export function ShipmentTableSkeleton() {
  return (
    <div className="lpi-table-wrap">
      <Table>
        <TableHeader>
          <TableRow className="lpi-table-head">
            <TableHead className="text-center">
              <Skeleton className="h-4 w-6 mx-auto" />
            </TableHead>
            <TableHead>
              <Skeleton className="h-4 w-24" />
            </TableHead>
            <TableHead>
              <Skeleton className="h-4 w-24" />
            </TableHead>
            <TableHead>
              <Skeleton className="h-4 w-24" />
            </TableHead>
            <TableHead>
              <Skeleton className="h-4 w-20" />
            </TableHead>
            <TableHead>
              <Skeleton className="h-4 w-20" />
            </TableHead>
            <TableHead>
              <Skeleton className="h-4 w-20" />
            </TableHead>
            <TableHead>
              <Skeleton className="h-4 w-20" />
            </TableHead>
            <TableHead className="text-right w-16">
              <Skeleton className="h-4 w-6 ml-auto" />
            </TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {Array.from({ length: 5 }).map((_, i) => (
            <TableRow key={i}>
              <TableCell className="text-center">
                <Skeleton className="h-4 w-6 mx-auto" />
              </TableCell>

              <TableCell>
                <div className="space-y-2">
                  <Skeleton className="h-4 w-28" />
                  <Skeleton className="h-3 w-20" />
                </div>
              </TableCell>

              <TableCell>
                <div className="space-y-2">
                  <Skeleton className="h-4 w-28" />
                  <Skeleton className="h-3 w-24" />
                </div>
              </TableCell>

              <TableCell>
                <div className="space-y-2">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-3 w-24" />
                </div>
              </TableCell>

              <TableCell>
                <Skeleton className="h-6 w-16 rounded-md" />
              </TableCell>

              <TableCell>
                <Skeleton className="h-4 w-24" />
              </TableCell>

              <TableCell>
                <Skeleton className="h-6 w-20 rounded-full" />
              </TableCell>

              <TableCell>
                <Skeleton className="h-4 w-20" />
              </TableCell>

              <TableCell>
                <div className="flex justify-end gap-2">
                  <Skeleton className="h-8 w-8 rounded-md" />
                  <Skeleton className="h-8 w-8 rounded-md" />
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

export function ShipmentCardSkeleton() {
  return (
    <Card className="rounded-2xl border-border/70 p-0 shadow-sm shadow-slate-950/[0.03]">
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="space-y-2">
            <Skeleton className="h-5 w-32" />
            <Skeleton className="h-4 w-28" />
          </div>

          <div className="flex items-center gap-2">
            <Skeleton className="h-6 w-20 rounded-full" />
            <Skeleton className="h-4 w-4" />
            <Skeleton className="h-6 w-6 rounded-md" />
          </div>
        </div>

        <div className="flex items-center gap-2 mb-3">
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-4 w-4" />
          <Skeleton className="h-4 w-16" />
        </div>

        <div className="grid grid-cols-2 gap-3 mb-1">
          <div className="flex items-center gap-2">
            <Skeleton className="h-4 w-4" />
            <Skeleton className="h-4 w-24" />
          </div>
          <div className="flex items-center gap-2">
            <Skeleton className="h-4 w-4" />
            <Skeleton className="h-4 w-20" />
          </div>
        </div>

        <div className="flex items-center justify-between mt-4 pt-3 border-t">
          <div className="flex items-center gap-2">
            <Skeleton className="h-5 w-16 rounded-md" />
            <Skeleton className="h-4 w-28" />
          </div>
          <Skeleton className="h-4 w-4" />
        </div>
      </CardContent>
    </Card>
  );
}

export function ShipmentListSkeleton() {
  return (
    <>
      <ShipmentTableSkeleton />
      <div className="md:hidden space-y-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <ShipmentCardSkeleton key={i} />
        ))}
      </div>
    </>
  );
}
