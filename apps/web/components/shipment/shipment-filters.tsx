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
import type { MovementType, ShipmentStatus } from '@/lib/types';

interface ShipmentFiltersProps {
  search: string;
  onSearchChange: (value: string) => void;
  movementType: MovementType | 'all';
  onMovementTypeChange: (value: MovementType | 'all') => void;
  status: ShipmentStatus | 'all';
  onStatusChange: (value: ShipmentStatus | 'all') => void;
  cargoType: 'FCL' | 'LCL' | 'all';
  onCargoTypeChange: (value: 'FCL' | 'LCL' | 'all') => void;
}

const statuses: ShipmentStatus[] = [
  'Pending',
  'Booked',
  'Picked Up',
  'At POL',
  'Loaded',
  'Departed',
  'At POD',
  'Unloaded',
  'Customs',
  'Out-Gate',
  'Delivered',
  'Returned',
];

export function ShipmentFilters({
  search,
  onSearchChange,
  movementType,
  onMovementTypeChange,
  status,
  onStatusChange,
  cargoType,
  onCargoTypeChange,
}: ShipmentFiltersProps) {
  const hasFilters =
    search || movementType !== 'all' || status !== 'all' || cargoType !== 'all';

  const clearFilters = () => {
    onSearchChange('');
    onMovementTypeChange('all');
    onStatusChange('all');
    onCargoTypeChange('all');
  };

  return (
    <div className="lpi-toolbar flex flex-col gap-3 sm:flex-row sm:items-center">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
        <Input
          placeholder="Search by Reference, BOL, or Container..."
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          className="lpi-input w-full pl-9 max-sm:text-sm"
        />
      </div>

      <div className="flex flex-col sm:flex-row gap-3 sm:items-center w-full sm:w-auto">
        <Select
          value={cargoType}
          onValueChange={(v) => onCargoTypeChange(v as 'FCL' | 'LCL' | 'all')}
        >
          <SelectTrigger className="lpi-input w-full sm:w-[140px]">
            <SelectValue placeholder="Cargo" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Cargo</SelectItem>
            <SelectItem value="FCL">FCL</SelectItem>
            <SelectItem value="LCL">LCL</SelectItem>
          </SelectContent>
        </Select>

        <Select
          value={movementType}
          onValueChange={(v) => onMovementTypeChange(v as MovementType | 'all')}
        >
          <SelectTrigger className="lpi-input w-full sm:w-[140px]">
            <SelectValue placeholder="Movement" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="D2D">Door to Door</SelectItem>
            <SelectItem value="D2P">Door to Port</SelectItem>
          </SelectContent>
        </Select>

        <Select
          value={status}
          onValueChange={(v) => onStatusChange(v as ShipmentStatus | 'all')}
        >
          <SelectTrigger className="lpi-input w-full sm:w-[160px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            {statuses.map((s) => (
              <SelectItem key={s} value={s}>
                {s}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {hasFilters && (
          <Button
            variant="outline"
            size="icon"
            onClick={clearFilters}
            className="h-10 shrink-0 rounded-xl w-full sm:w-10"
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  );
}
