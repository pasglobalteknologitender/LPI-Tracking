import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Pencil, Trash } from 'lucide-react';
import { formatDateTime } from '@/lib/utils';
import type { AdminUser } from '@/lib/users-data';
import { format } from 'date-fns';
import { ROLE_LABELS } from '@/lib/permissions';

interface Props {
  users: AdminUser[];
  currentPage: number;
  pageSize: number;
  onEdit: (user: AdminUser) => void;
  onDelete: (user: AdminUser) => void;
  canManageUsers?: boolean;
}

export function UserTable({
  users,
  currentPage,
  pageSize,
  onEdit,
  onDelete,
  canManageUsers = true,
}: Props) {
  const getInitials = (name: string) =>
    name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase();

  const getRoleBadgeClass = (role: string) => {
    switch (role) {
      case 'Admin':
      case 'admin':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'Manager':
      case 'viewer':
        return 'bg-purple-50 text-purple-700 border-purple-200';
      case 'Ops':
      case 'operator':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  return (
    <div className="lpi-table-wrap">
      <Table>
        <TableHeader>
          <TableRow className="lpi-table-head">
            <TableHead className="text-center w-12">No</TableHead>
            <TableHead>User</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Role</TableHead>
            <TableHead>Last Login</TableHead>
            {canManageUsers && (
              <TableHead className="text-center w-16">
                Action
              </TableHead>
            )}
          </TableRow>
        </TableHeader>

        <TableBody>
          {users.map((user, index) => (
            <TableRow
              key={user.id}
              className="group lpi-row"
            >
              <TableCell className="text-center">
                {(currentPage - 1) * pageSize + index + 1}
              </TableCell>

              <TableCell>
                <div className="flex items-center gap-3">
                  <Avatar className="h-9 w-9 ring-2 ring-blue-100">
                    <AvatarFallback className="bg-primary text-white text-xs font-semibold">
                      {getInitials(user.name)}
                    </AvatarFallback>
                  </Avatar>
                  <span className="font-medium text-foreground">{user.name}</span>
                </div>
              </TableCell>

              <TableCell>{user.email}</TableCell>

              <TableCell>
                <span
                  className={`px-2 py-0.5 rounded-lg border text-xs ${getRoleBadgeClass(user.role)}`}
                >
                  {ROLE_LABELS[user.role]}
                </span>
              </TableCell>

              <TableCell>
                {user.lastLogin
                  ? format(new Date(user.lastLogin), 'dd/MM/yyyy HH:mm')
                  : '-'}
              </TableCell>

              {canManageUsers && (
                <TableCell>
                  <div className="flex justify-end gap-2">
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => onEdit(user)}
                    >
                      <Pencil className="w-4 h-4 text-gray-400 group-hover:text-blue-600" />
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => onDelete(user)}
                    >
                      <Trash className="w-4 h-4 text-gray-400 group-hover:text-red-500" />
                    </Button>
                  </div>
                </TableCell>
              )}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
