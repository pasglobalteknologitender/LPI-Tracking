import Link from 'next/link';
import { ShieldAlert } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function Unauthorized() {
  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center bg-background p-6">
      <div className="max-w-md rounded-2xl border border-border/70 bg-card p-8 text-center shadow-sm shadow-slate-950/[0.03]">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-red-50 text-red-600">
          <ShieldAlert className="h-6 w-6" />
        </div>
        <h1 className="text-xl font-semibold text-foreground">Access denied</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          You do not have permission to open this page.
        </p>
        <Button asChild className="mt-6 rounded-xl bg-primary hover:bg-primary/90">
          <Link href="/shipments">Back to Shipments</Link>
        </Button>
      </div>
    </div>
  );
}
