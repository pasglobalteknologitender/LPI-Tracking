'use client';

import { useEffect, useMemo, useState } from 'react';
import type { AdminUser } from '@/lib/users-data';
import { createUser, deleteUser, getUsers, updateUser } from '@/lib/user-service';
import { UserFilters } from '@/components/users/user-filters';
import { UserFormDialog } from '@/components/users/user-form-dialog';
import { DeleteUserDialog } from '@/components/users/delete-user-dialog';
import { UserHeader } from '@/components/users/user-header';
import { UserEmpty } from '@/components/users/user-empty';
import { UserTable } from '@/components/users/user-table';
import { UserPagination } from '@/components/users/user-pagination';
import { UserListSkeleton } from '@/components/users/user-skeleton';
import { UserCard } from '@/components/users/user-card';
import { Unauthorized } from '@/components/unauthorized';
import { useAuth } from '@/lib/auth-context';
import type { UserRole } from '@/lib/permissions';
import {
  FailedSyncState,
  FullPageErrorState,
  OfflineBanner,
  useOfflineState,
} from '@/components/app-state';
import { ShieldCheck, UserCheck, UserCog, Users } from 'lucide-react';
import { toast } from 'sonner';
import { ApiClientError } from '@/lib/api-client';

const FORCE_DUMMY_ERROR = false;
const FORCE_DUMMY_OFFLINE = false;
const FORCE_DUMMY_FAILED_SYNC = false;

export default function UsersPage() {
  const { can } = useAuth();
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [hasLoadError, setHasLoadError] = useState(FORCE_DUMMY_ERROR);
  const [hasFailedSync, setHasFailedSync] = useState(FORCE_DUMMY_FAILED_SYNC);
  const isOffline = useOfflineState(FORCE_DUMMY_OFFLINE);

  async function loadUsers(options?: { silent?: boolean }) {
    if (!options?.silent) {
      setLoading(true);
    }
    setHasLoadError(FORCE_DUMMY_ERROR);
    try {
      const data = await getUsers();
      setUsers(data);
    } catch {
      if (!options?.silent) {
        setHasLoadError(true);
      } else {
        toast.error('Failed to refresh users');
      }
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    let mounted = true;

    async function load() {
      setLoading(true);
      setHasLoadError(FORCE_DUMMY_ERROR);
      try {
        const data = await getUsers();
        if (mounted) setUsers(data);
      } catch {
        if (mounted) setHasLoadError(true);
      } finally {
        if (mounted) setLoading(false);
      }
    }

    load();
    return () => {
      mounted = false;
    };
  }, []);

  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<UserRole | 'all'>('all');

  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 5;

  const [formOpen, setFormOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);

  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteUserTarget, setDeleteUserTarget] = useState<AdminUser | null>(null);

  useEffect(() => {
    setCurrentPage(1);
  }, [search, roleFilter]);

  const filteredUsers = useMemo(() => {
    return users.filter((user) => {
      const searchLower = search.toLowerCase();

      const matchSearch =
        !search ||
        user.name.toLowerCase().includes(searchLower) ||
        user.email.toLowerCase().includes(searchLower);

      const matchRole = roleFilter === 'all' || user.role === roleFilter;

      return matchSearch && matchRole;
    });
  }, [users, search, roleFilter]);

  const totalPages = Math.ceil(filteredUsers.length / pageSize);

  const paginatedUsers = filteredUsers.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize,
  );
  const userStats = useMemo(
    () => [
      {
        label: 'Total Users',
        value: users.length,
        hint: 'Registered accounts',
        icon: Users,
        tone: 'blue',
      },
      {
        label: 'Admins',
        value: users.filter((user) => user.role === 'admin').length,
        hint: 'Full access',
        icon: ShieldCheck,
        tone: 'green',
      },
      {
        label: 'Operators',
        value: users.filter((user) => user.role === 'operator').length,
        hint: 'Operational access',
        icon: UserCog,
        tone: 'amber',
      },
      {
        label: 'Viewers',
        value: users.filter((user) => user.role === 'viewer').length,
        hint: 'Read-only access',
        icon: UserCheck,
        tone: 'purple',
      },
    ],
    [users],
  );

  const handleAdd = () => {
    setSelectedUser(null);
    setFormOpen(true);
  };

  const handleEdit = (user: AdminUser) => {
    setSelectedUser(user);
    setFormOpen(true);
  };

  const handleDelete = (user: AdminUser) => {
    setDeleteUserTarget(user);
    setDeleteOpen(true);
  };

  const handleSave = async (
    data: Omit<AdminUser, 'id'> & { id?: string; password?: string },
  ) => {
    try {
      if (data.id) {
        await updateUser(data.id, {
          name: data.name,
          email: data.email,
          role: data.role,
        });
      } else {
        if (!data.password) {
          throw new Error('Password is required');
        }
        await createUser({
          name: data.name,
          email: data.email,
          password: data.password,
          role: data.role,
        });
      }
      await loadUsers({ silent: true });
    } catch (error) {
      const message =
        error instanceof ApiClientError ? error.message : 'Failed to save user';
      toast.error(message);
      throw error;
    }
  };

  const confirmDelete = async () => {
    if (!deleteUserTarget) return;
    try {
      await deleteUser(deleteUserTarget.id);
      await loadUsers({ silent: true });
    } catch (error) {
      const message =
        error instanceof ApiClientError ? error.message : 'Failed to delete user';
      toast.error(message);
      throw error;
    }
  };

  const handleRetryLoad = () => {
    void loadUsers();
  };

  if (!can('manage_users')) {
    return <Unauthorized />;
  }

  return (
    <div className="lpi-page">
      <OfflineBanner show={isOffline} />
      <UserHeader onAdd={handleAdd} />

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {userStats.map((stat) => (
          <div key={stat.label} className="lpi-stat-card">
            <div className={`lpi-stat-icon lpi-stat-icon-${stat.tone}`}>
              <stat.icon className="h-5 w-5" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between gap-3">
                <p className="truncate text-sm font-medium text-muted-foreground">
                  {stat.label}
                </p>
                <p className="text-2xl font-bold tracking-tight text-foreground">
                  {stat.value}
                </p>
              </div>
              <p className="truncate text-xs text-muted-foreground">{stat.hint}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="space-y-5">
        <UserFilters
          search={search}
          onSearchChange={setSearch}
          role={roleFilter}
          onRoleChange={(v) => setRoleFilter(v as UserRole | 'all')}
        />

        {loading ? (
          <UserListSkeleton />
        ) : hasLoadError ? (
          <FullPageErrorState variant="users" onRetry={handleRetryLoad} />
        ) : filteredUsers.length === 0 ? (
          <UserEmpty />
        ) : (
          <>
            <FailedSyncState
              variant="users"
              show={hasFailedSync}
              failedCount={hasFailedSync ? 1 : 0}
              onRetry={() => setHasFailedSync(false)}
            />

            <UserTable
              users={paginatedUsers}
              currentPage={currentPage}
              pageSize={pageSize}
              onEdit={handleEdit}
              onDelete={handleDelete}
              canManageUsers={can('manage_users')}
            />

            <div className="grid gap-4 md:hidden">
              {paginatedUsers.map((user) => (
                <UserCard
                  key={user.id}
                  user={user}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                  canManageUsers={can('manage_users')}
                />
              ))}
            </div>

            <UserPagination
              currentPage={currentPage}
              totalPages={totalPages}
              totalData={filteredUsers.length}
              pageSize={pageSize}
              onChange={setCurrentPage}
            />
          </>
        )}
      </div>

      <UserFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        user={selectedUser}
        onSave={handleSave}
      />

      <DeleteUserDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        user={deleteUserTarget}
        onConfirm={confirmDelete}
      />
    </div>
  );
}
