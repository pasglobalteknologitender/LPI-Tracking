import { Users as UsersIcon, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Props {
  onAdd: () => void;
  canManageUsers?: boolean;
}

export function UserHeader({ onAdd, canManageUsers = true }: Props) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-center gap-3 sm:gap-4">
        <div className="lpi-icon-tile">
          <UsersIcon className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
        </div>
        <div>
          <h1 className="lpi-page-title">Users</h1>
          <p className="lpi-page-description">
            Manage admin users and permissions
          </p>
        </div>
      </div>

      {canManageUsers && (
        <Button
          onClick={onAdd}
          className="h-10 w-full rounded-xl bg-primary text-white shadow-lg shadow-blue-700/20 hover:bg-primary/90 sm:w-auto"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add User
        </Button>
      )}
    </div>
  );
}
