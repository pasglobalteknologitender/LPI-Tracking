'use client';

import { useEffect, useRef, useState } from 'react';
import { format } from 'date-fns';
import { cn, formatDateTime } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { StatusBadge } from './status-badge';
import type { Milestone, MilestoneStatus } from '@/lib/types';
import {
  Check,
  Clock,
  Circle,
  ChevronDown,
  ChevronUp,
  MapPin,
  Calendar,
  Save,
  X,
  ImagePlus,
  Trash2,
  RefreshCcw,
  RotateCw,
} from 'lucide-react';
import { toast } from 'sonner';

interface TimelineItemProps {
  milestone: Milestone;
  onUpdate: (updated: Milestone) => void;
  isLast: boolean;
  canUpdateMilestone?: boolean;
  canSync?: boolean;
}

const statusIcons = {
  done: Check,
  pending: Circle,
};

const statusColors = {
  done: 'bg-green-500 text-white',
  pending: 'bg-muted text-muted-foreground',
};

const lineColors = {
  done: 'bg-green-500',
  pending: 'bg-border',
};

const DUMMY_PHOTO =
  'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="640" height="360" viewBox="0 0 640 360"><rect width="640" height="360" fill="%23e0f2fe"/><rect x="68" y="86" width="504" height="188" rx="18" fill="%23ffffff" stroke="%230ea5e9" stroke-width="8"/><path d="M105 244h430" stroke="%2394a3b8" stroke-width="12" stroke-linecap="round"/><path d="M148 136h144M148 176h250M148 216h190" stroke="%230f172a" stroke-width="14" stroke-linecap="round"/><circle cx="496" cy="164" r="42" fill="%2322c55e"/><path d="m474 164 16 16 32-38" fill="none" stroke="%23ffffff" stroke-width="12" stroke-linecap="round" stroke-linejoin="round"/><text x="320" y="320" text-anchor="middle" font-family="Arial" font-size="28" font-weight="700" fill="%230f172a">Dummy POD Photo</text></svg>';

export function TimelineItem({
  milestone,
  onUpdate,
  isLast,
  canUpdateMilestone = true,
  canSync = true,
}: TimelineItemProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState<Milestone>(milestone);
  const [isSyncing, setIsSyncing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const Icon = statusIcons[milestone.status];
  const syncStatus =
    isSyncing ? 'syncing' : milestone.syncStatus || (milestone.isSynced ? 'synced' : 'unsynced');

  useEffect(() => {
    setEditData(milestone);
  }, [milestone]);

  const handleSave = () => {
    if (!canUpdateMilestone) {
      toast.error('You do not have access to update milestones');
      return;
    }

    const updated: Milestone = {
      ...editData,
      lastUpdated: new Date().toISOString(),
      updatedBy: 'Admin',
      isSynced: false,
      syncedAt: null,
      syncStatus: 'unsynced',
      syncError: null,
    };

    onUpdate(updated);
    setIsEditing(false);
    toast.success(`${milestone.name} updated successfully`);
  };

  const handleCancel = () => {
    setEditData(milestone);
    setIsEditing(false);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setEditData({ ...editData, photo: event.target?.result as string });
        toast.success('Dummy photo attached from local file');
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setEditData({ ...editData, photo: null });
    toast.success('Photo removed');
  };

  const useDummyPhoto = () => {
    setEditData({ ...editData, photo: DUMMY_PHOTO });
    toast.success('Dummy photo added');
  };

  const markSynced = () => {
    if (!canSync) {
      toast.error('You do not have access to sync milestones');
      return;
    }

    const updated: Milestone = {
      ...milestone,
      isSynced: true,
      syncedAt: new Date().toISOString(),
      syncStatus: 'synced',
      syncError: null,
    };

    onUpdate(updated);
    toast.success(`${milestone.name} marked as synced`);
  };

  const markUnsynced = () => {
    if (!canSync) {
      toast.error('You do not have access to sync milestones');
      return;
    }

    const updated: Milestone = {
      ...milestone,
      isSynced: false,
      syncedAt: null,
      syncStatus: 'unsynced',
      syncError: null,
    };

    onUpdate(updated);
    toast.success(`${milestone.name} marked as unsynced`);
  };

  const retrySync = async () => {
    if (!canSync) {
      toast.error('You do not have access to sync milestones');
      return;
    }

    if (milestone.status !== 'done') {
      toast.error('Only completed milestones can be synced');
      return;
    }

    setIsSyncing(true);

    await new Promise((resolve) => setTimeout(resolve, 800));

    const shouldSucceed = Math.random() > 0.35;
    const updated: Milestone = shouldSucceed
      ? {
          ...milestone,
          isSynced: true,
          syncedAt: new Date().toISOString(),
          syncStatus: 'synced',
          syncError: null,
        }
      : {
          ...milestone,
          isSynced: false,
          syncedAt: null,
          syncStatus: 'failed',
          syncError: 'Dummy Transvoyant endpoint returned 500',
        };

    onUpdate(updated);
    setIsSyncing(false);

    if (shouldSucceed) {
      toast.success(`${milestone.name} synced successfully`);
    } else {
      toast.error(`${milestone.name} failed to sync. Retry again.`);
    }
  };

  return (
    <div className="relative flex gap-4">
      {!isLast && (
        <div
          className={cn(
            'absolute left-[19px] top-10 w-0.5 h-[calc(100%-24px)]',
            lineColors[milestone.status],
          )}
        />
      )}

      <div
        className={cn(
          'relative flex items-center justify-center w-10 h-10 rounded-full shrink-0 transition-all',
          statusColors[milestone.status],
        )}
      >
        <Icon className="h-5 w-5" />
      </div>

      <div className={cn('flex-1 pb-8 transition-all', isLast && 'pb-0')}>
        <div
          className={cn(
            'cursor-pointer rounded-2xl border border-border/70 bg-card p-4 shadow-sm shadow-slate-950/[0.03] transition-all hover:border-blue-200 hover:shadow-md',
            isExpanded && 'border-blue-200 shadow-md',
          )}
          onClick={() => !isEditing && setIsExpanded(!isExpanded)}
        >
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <h4 className="font-semibold text-foreground">
                    {milestone.name}
                  </h4>

                  <StatusBadge status={milestone.status} />
                </div>

                <StatusBadge
                  status={syncStatus}
                />
              </div>
              {milestone.dateTime && (
                <div className="mt-1 flex items-center gap-1.5 text-sm text-muted-foreground">
                  <Calendar className="h-3.5 w-3.5" />
                  {format(new Date(milestone.dateTime), 'MMM dd, yyyy HH:mm')}
                </div>
              )}
              {milestone.location && (
                <div className="mt-1 flex items-center gap-1.5 text-sm text-muted-foreground">
                  <MapPin className="h-3.5 w-3.5" />
                  {milestone.location}
                </div>
              )}
              {milestone.lastUpdated && (
                <div className="mt-1 flex items-center gap-1.5 text-xs text-muted-foreground">
                  <Clock className="h-3 w-3" />
                  Updated {formatDateTime(milestone.lastUpdated)}
                  {milestone.updatedBy && ` by ${milestone.updatedBy}`}
                </div>
              )}
              {milestone.syncedAt && (
                <div className="mt-1 flex items-center gap-1.5 text-xs text-muted-foreground">
                  <RefreshCcw className="h-3 w-3" />
                  Last synced {formatDateTime(milestone.syncedAt)}
                </div>
              )}
              {milestone.syncError && (
                <p className="mt-1 text-xs text-red-600">
                  {milestone.syncError}
                </p>
              )}
            </div>
            <Button variant="ghost" size="icon" className="shrink-0 -mr-2">
              {isExpanded ? (
                <ChevronUp className="h-4 w-4" />
              ) : (
                <ChevronDown className="h-4 w-4" />
              )}
            </Button>
          </div>

          {isExpanded && (
            <div
              className="mt-4 space-y-4 border-t pt-4"
              onClick={(e) => e.stopPropagation()}
            >
              {!isEditing ? (
                <>
                  {milestone.notes && (
                    <p className="text-sm text-muted-foreground">{milestone.notes}</p>
                  )}
                  {milestone.photo && (
                    <img
                      src={milestone.photo}
                      alt="Milestone photo"
                      className="rounded-lg max-h-24 object-cover"
                    />
                  )}
                  {(canUpdateMilestone || canSync) && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                      {canUpdateMilestone && (
                        <Button
                          size="sm"
                          onClick={() => setIsEditing(true)}
                          className="w-full rounded-xl bg-primary text-white hover:bg-primary/90"
                        >
                          Edit Milestone
                        </Button>
                      )}

                      {canSync && (
                        <>
                          <Button
                            variant="secondary"
                            size="sm"
                            onClick={retrySync}
                            disabled={isSyncing || milestone.status !== 'done'}
                            className="w-full rounded-xl"
                          >
                            {isSyncing ? (
                              <>
                                <RotateCw className="h-4 w-4 mr-2 animate-spin" />
                                Syncing
                              </>
                            ) : milestone.isSynced ? (
                              'Retry Sync'
                            ) : (
                              'Sync Now'
                            )}
                          </Button>

                          <Button
                            variant="outline"
                            size="sm"
                            onClick={markSynced}
                            disabled={isSyncing || milestone.isSynced}
                            className="w-full rounded-xl"
                          >
                            Mark Synced
                          </Button>

                          <Button
                            variant="outline"
                            size="sm"
                            onClick={markUnsynced}
                            disabled={isSyncing || !milestone.isSynced}
                            className="w-full rounded-xl"
                          >
                            Mark Unsynced
                          </Button>
                        </>
                      )}
                    </div>
                  )}
                </>
              ) : (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Status</Label>
                    <Select
                      value={editData.status}
                      disabled={milestone.isSynced}
                      onValueChange={(value) =>
                        setEditData({
                          ...editData,
                          status: value as MilestoneStatus,
                        })
                      }
                    >
                      <SelectTrigger className="lpi-input">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="done">Done</SelectItem>
                        <SelectItem value="pending">Pending</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Date & Time</Label>
                      <Input
                        className="lpi-input"
                        type="datetime-local"
                        value={
                          editData.dateTime
                            ? format(
                                new Date(editData.dateTime),
                                "yyyy-MM-dd'T'HH:mm",
                              )
                            : ''
                        }
                        onChange={(e) =>
                          setEditData({
                            ...editData,
                            dateTime: e.target.value
                              ? new Date(e.target.value).toISOString()
                              : null,
                          })
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Location</Label>
                      <Input
                        className="lpi-input"
                        value={editData.location || ''}
                        onChange={(e) =>
                          setEditData({
                            ...editData,
                            location: e.target.value || null,
                          })
                        }
                        placeholder="Enter milestone location"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Notes</Label>
                    <Textarea
                      className="rounded-xl border-border/80 bg-white"
                      value={editData.notes || ''}
                      onChange={(e) =>
                        setEditData({
                          ...editData,
                          notes: e.target.value || null,
                        })
                      }
                      placeholder="Add notes..."
                      rows={3}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Photo</Label>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                    />
                    {editData.photo ? (
                      <div className="relative inline-block">
                        <img
                          src={editData.photo}
                          alt="Preview"
                          className="rounded-lg max-h-24 object-cover"
                        />
                        <Button
                          variant="destructive"
                          size="icon"
                          className="absolute -top-2 -right-2 h-6 w-6"
                          onClick={removeImage}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    ) : (
                      <Button
                        variant="outline"
                        onClick={() => fileInputRef.current?.click()}
                        className="w-full rounded-xl"
                      >
                        <ImagePlus className="h-4 w-4 mr-2" />
                        Upload Image
                      </Button>
                    )}
                    <Button
                      type="button"
                      variant="secondary"
                      onClick={useDummyPhoto}
                      className="w-full rounded-xl"
                    >
                      <ImagePlus className="h-4 w-4 mr-2" />
                      Use Dummy Photo
                    </Button>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      onClick={handleSave}
                      className="flex-1 rounded-xl bg-primary hover:bg-primary/90"
                    >
                      <Save className="h-4 w-4 mr-2" />
                      Save
                    </Button>
                    <Button
                      variant="outline"
                      onClick={handleCancel}
                      className="flex-1 rounded-xl"
                    >
                      <X className="h-4 w-4 mr-2" />
                      Cancel
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
