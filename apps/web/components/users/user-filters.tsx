'use client';

import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Search, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ROLE_LABELS, ROLES } from '@/lib/permissions';

interface UserFiltersProps {
  search: string;
  onSearchChange: (value: string) => void;
  role: string;
  onRoleChange: (value: string) => void;
}

export function UserFilters({
  search,
  onSearchChange,
  role,
  onRoleChange,
}: UserFiltersProps) {
  const hasFilters = search || role !== 'all';

  const clearFilters = () => {
    onSearchChange('');
    onRoleChange('all');
  };

  return (
    <div className="lpi-toolbar flex flex-col gap-3 sm:flex-row sm:items-center">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
        <Input
          placeholder="Search name or email..."
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          className="lpi-input w-full pl-9 max-sm:text-sm"
        />
      </div>

      <div className="flex gap-3 w-full sm:w-auto">
        <Select value={role} onValueChange={onRoleChange}>
          <SelectTrigger className="lpi-input w-full sm:w-[140px]">
            <SelectValue placeholder="Role" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Roles</SelectItem>
            {ROLES.map((role) => (
              <SelectItem key={role} value={role}>
                {ROLE_LABELS[role]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {hasFilters && (
          <Button
            variant="outline"
            size="icon"
            onClick={clearFilters}
            className="h-10 w-10 rounded-xl"
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  );
}
