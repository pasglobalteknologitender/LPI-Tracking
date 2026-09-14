import { Users as UsersIcon } from 'lucide-react';

export function UserEmpty() {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed bg-muted/30 py-16">
      <UsersIcon className="h-7 w-7 text-muted-foreground" />
      <h3 className="mt-4 text-lg font-semibold">No users found</h3>
      <p className="mt-1 text-sm text-muted-foreground">
        Try adjusting your search or filter criteria
      </p>
    </div>
  );
}
