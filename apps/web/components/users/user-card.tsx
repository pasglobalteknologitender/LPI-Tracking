'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Pencil, Trash, Mail, Clock } from 'lucide-react';
import { formatDateTime, cn } from '@/lib/utils';
import type { AdminUser } from '@/lib/users-data';
import { ROLE_LABELS } from '@/lib/permissions';

interface UserCardProps {
  user: AdminUser;
  onEdit: (user: AdminUser) => void;
  onDelete: (user: AdminUser) => void;
  canManageUsers?: boolean;
}

export function UserCard({
  user,
  onEdit,
  onDelete,
  canManageUsers = true,
}: UserCardProps) {
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
    <Card className="group rounded-2xl border-border/70 p-0 shadow-sm shadow-slate-950/[0.03] transition-all hover:border-blue-200 hover:shadow-md">
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3">
            <Avatar className="h-10 w-10 ring-2 ring-blue-100">
              <AvatarFallback className="bg-primary text-white text-xs font-semibold">
                {getInitials(user.name)}
              </AvatarFallback>
            </Avatar>

            <div>
              <h3 className="font-semibold text-foreground">{user.name}</h3>
              <p className="flex items-center gap-1 text-sm text-muted-foreground">
                <Mail className="h-3.5 w-3.5" />
                {user.email}
              </p>
            </div>
          </div>
        </div>

        <span
          className={cn(
            'rounded-lg border px-2 py-0.5 text-xs font-medium',
            getRoleBadgeClass(user.role),
          )}
        >
          {ROLE_LABELS[user.role]}
        </span>

        <div className="mt-3 flex items-center justify-between border-t pt-3">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Clock className="h-4 w-4" />
            <span>
              {user.lastLogin ? formatDateTime(user.lastLogin) : 'Never login'}
            </span>
          </div>
          {canManageUsers && (
            <div className="flex items-center gap-4">
              <button
                onClick={() => onEdit(user)}
                className="text-gray-400 hover:text-blue-600"
              >
                <Pencil className="h-4 w-4" />
              </button>

              <button
                onClick={() => onDelete(user)}
                className="text-gray-400 hover:text-red-500"
              >
                <Trash className="h-4 w-4" />
              </button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
