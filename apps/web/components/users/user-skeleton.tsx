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

export function UserTableSkeleton() {
  return (
    <div className="lpi-table-wrap">
      <Table>
        <TableHeader>
          <TableRow className="lpi-table-head">
            <TableHead className="text-center w-12">
              <Skeleton className="h-4 w-6 mx-auto" />
            </TableHead>
            <TableHead>
              <Skeleton className="h-4 w-24" />
            </TableHead>
            <TableHead>
              <Skeleton className="h-4 w-32" />
            </TableHead>
            <TableHead>
              <Skeleton className="h-4 w-16" />
            </TableHead>
            <TableHead>
              <Skeleton className="h-4 w-28" />
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
                <div className="flex items-center gap-3">
                  <Skeleton className="h-9 w-9 rounded-full" />
                  <Skeleton className="h-4 w-28" />
                </div>
              </TableCell>

              <TableCell>
                <Skeleton className="h-4 w-40" />
              </TableCell>

              <TableCell>
                <Skeleton className="h-6 w-16 rounded-lg" />
              </TableCell>

              <TableCell>
                <Skeleton className="h-4 w-28" />
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

export function UserCardSkeleton() {
  return (
    <Card className="rounded-2xl border-border/70 p-0 shadow-sm shadow-slate-950/[0.03]">
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3">
            <Skeleton className="h-10 w-10 rounded-full" />

            <div className="space-y-2">
              <Skeleton className="h-4 w-32" />
              <div className="flex items-center gap-2">
                <Skeleton className="h-3.5 w-3.5" />
                <Skeleton className="h-3 w-40" />
              </div>
            </div>
          </div>
        </div>

        <Skeleton className="h-5 w-16 rounded-md mb-3" />

        <div className="flex items-center justify-between border-t mt-3 pt-3">
          <div className="flex items-center gap-2">
            <Skeleton className="h-4 w-4" />
            <Skeleton className="h-4 w-32" />
          </div>

          <div className="flex items-center gap-4">
            <Skeleton className="h-4 w-4" />
            <Skeleton className="h-4 w-4" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export function UserListSkeleton() {
  return (
    <>
      <UserTableSkeleton />

      <div className="md:hidden space-y-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <UserCardSkeleton key={i} />
        ))}
      </div>
    </>
  );
}
