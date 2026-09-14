'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Spinner } from '@/components/ui/spinner';
import type { AdminUser } from '@/lib/users-data';
import { ROLE_LABELS, ROLES } from '@/lib/permissions';
import { Eye, EyeOff } from 'lucide-react';

type UserFormDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user?: AdminUser | null;
  onSave: (
    user: Omit<AdminUser, 'id'> & { id?: string; password?: string },
  ) => void | Promise<void>;
};

export function UserFormDialog({
  open,
  onOpenChange,
  user,
  onSave,
}: UserFormDialogProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'admin' as AdminUser['role'],
  });
  const [showPassword, setShowPassword] = useState(false);

  const isEditing = !!user;

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name,
        email: user.email,
        password: '',
        role: user.role,
      });
    } else {
      setFormData({
        name: '',
        email: '',
        password: '',
        role: 'admin',
      });
    }
  }, [user, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await onSave({
        ...(user ? { id: user.id } : {}),
        name: formData.name,
        email: formData.email,
        ...(formData.password ? { password: formData.password } : {}),
        role: formData.role,
      });
      onOpenChange(false);
    } catch {
      // Parent shows the error toast; keep the dialog open.
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="rounded-2xl border-border/70 sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Edit User' : 'Add New User'}</DialogTitle>
          <DialogDescription>
            {isEditing
              ? 'Update user information'
              : 'Create a new admin user account'}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-sm font-medium">
                Name
              </Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                placeholder="Enter full name"
                required
                className="lpi-input h-11"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium">
                Email
              </Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                placeholder="Enter email address"
                required
                className="lpi-input h-11"
              />
            </div>
            {!isEditing && (
              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm font-medium">
                  Password
                </Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    value={formData.password}
                    onChange={(e) =>
                      setFormData({ ...formData, password: e.target.value })
                    }
                    placeholder="Enter password"
                    required={!isEditing}
                    className="lpi-input h-11 pr-10"
                  />

                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground transition hover:text-foreground"
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>
            )}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="role" className="text-sm font-medium">
                  Role
                </Label>
                <Select
                  value={formData.role}
                  onValueChange={(v) =>
                    setFormData({ ...formData, role: v as AdminUser['role'] })
                  }
                >
                  <SelectTrigger className="lpi-input h-11">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl">
                    {ROLES.map((role) => (
                      <SelectItem key={role} value={role}>
                        {ROLE_LABELS[role]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="rounded-xl"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isLoading}
              className="rounded-xl bg-primary shadow-lg shadow-blue-700/20 hover:bg-primary/90"
            >
              {isLoading && <Spinner className="mr-2" />}
              {isEditing ? 'Save Changes' : 'Add User'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
