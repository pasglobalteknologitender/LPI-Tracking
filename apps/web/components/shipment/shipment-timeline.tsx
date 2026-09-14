"use client"

import { TimelineItem } from "./timeline-item"
import type { Milestone } from "@/lib/types"

interface ShipmentTimelineProps {
  milestones: Milestone[]
  onMilestoneUpdate: (updated: Milestone) => void
  canUpdateMilestone?: boolean
  canSync?: boolean
}

export function ShipmentTimeline({
  milestones,
  onMilestoneUpdate,
  canUpdateMilestone = true,
  canSync = true,
}: ShipmentTimelineProps) {
  return (
    <div className="space-y-0">
      {milestones.map((milestone, index) => (
        <TimelineItem
          key={milestone.id}
          milestone={milestone}
          onUpdate={onMilestoneUpdate}
          isLast={index === milestones.length - 1}
          canUpdateMilestone={canUpdateMilestone}
          canSync={canSync}
        />
      ))}
    </div>
  )
}
