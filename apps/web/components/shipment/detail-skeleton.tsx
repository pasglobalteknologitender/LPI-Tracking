'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

export function DetailSkeleton() {
  return (
    <div className="min-h-screen bg-background">
      <div className="border-b border-border/60 bg-white/85">
        <div className="px-6 py-4 lg:px-8">
          <div className="flex items-center gap-4">
            <Skeleton className="h-10 w-10 rounded-md" />
            <div className="space-y-2">
              <Skeleton className="h-6 w-48" />
              <Skeleton className="h-4 w-32" />
            </div>
          </div>
        </div>
      </div>

      <div className="p-4 sm:p-6 space-y-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {[1, 2].map((card) => (
            <Card key={card} className="rounded-2xl border-border/70 shadow-sm shadow-slate-950/[0.03]">
              <CardContent className="p-6 space-y-4">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="flex gap-3 items-start">
                    <Skeleton className="h-9 w-9 rounded-lg shrink-0" />
                    <div className="space-y-1.5 w-full">
                      <Skeleton className="h-3 w-16" />
                      <Skeleton className="h-4 w-32" />
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="space-y-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex gap-4">
              <Skeleton className="h-10 w-10 rounded-full shrink-0" />
              <Card className="flex-1 rounded-2xl border-border/70 shadow-sm shadow-slate-950/[0.03]">
                <CardContent className="p-4 space-y-2">
                  <Skeleton className="h-5 w-40" />
                  <Skeleton className="h-4 w-32" />
                </CardContent>
              </Card>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
