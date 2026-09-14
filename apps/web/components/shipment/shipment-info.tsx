"use client"

import { format } from "date-fns"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { Shipment } from "@/lib/types"
import {
  Ship,
  Anchor,
  Package,
  Calendar,
  MapPin,
  Building2,
  FileText,
  Scale,
} from "lucide-react"

interface ShipmentInfoProps {
  shipment: Shipment
}

interface InfoItemProps {
  icon: React.ReactNode
  label: string
  value: string
}

function InfoItem({ icon, label, value }: InfoItemProps) {
  return (
    <div className="flex items-start gap-3 rounded-xl border border-border/60 bg-slate-50/60 p-3">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-primary">
        {icon}
      </div>
      <div className="min-w-0">
        <p className="text-xs uppercase tracking-wide text-muted-foreground">{label}</p>
        <p className="truncate font-medium text-foreground">{value}</p>
      </div>
    </div>
  )
}

export function ShipmentInfo({ shipment }: ShipmentInfoProps) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <Card className="rounded-2xl border-border/70 shadow-sm shadow-slate-950/[0.03]">
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <Ship className="h-4 w-4 text-primary" />
            Voyage Details
          </CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <InfoItem
            icon={<Anchor className="h-4 w-4" />}
            label="Carrier"
            value={shipment.carrier}
          />
          <InfoItem
            icon={<Ship className="h-4 w-4" />}
            label="Vessel"
            value={`${shipment.vessel} / ${shipment.voyage}`}
          />
          <InfoItem
            icon={<MapPin className="h-4 w-4" />}
            label="Port of Loading"
            value={shipment.pol}
          />
          <InfoItem
            icon={<MapPin className="h-4 w-4" />}
            label="Port of Discharge"
            value={shipment.pod}
          />
          <InfoItem
            icon={<Calendar className="h-4 w-4" />}
            label="ETD"
            value={format(new Date(shipment.etd), "MMM dd, yyyy")}
          />
          <InfoItem
            icon={<Calendar className="h-4 w-4" />}
            label="ETA"
            value={format(new Date(shipment.eta), "MMM dd, yyyy")}
          />
        </CardContent>
      </Card>

      <Card className="rounded-2xl border-border/70 shadow-sm shadow-slate-950/[0.03]">
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <Package className="h-4 w-4 text-primary" />
            Cargo Details
          </CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <InfoItem
            icon={<FileText className="h-4 w-4" />}
            label="BOL Number"
            value={shipment.bol}
          />
          <InfoItem
            icon={<FileText className="h-4 w-4" />}
            label="HBOL Number"
            value={shipment.hbol}
          />
          <InfoItem
            icon={<Package className="h-4 w-4" />}
            label="Container"
            value={shipment.container}
          />
          <InfoItem
            icon={<Package className="h-4 w-4" />}
            label="Type / Size"
            value={`${shipment.containerType} - ${shipment.cargoType} - ${shipment.containerSize}`}
          />
          <InfoItem
            icon={<Scale className="h-4 w-4" />}
            label="Weight"
            value={shipment.weight}
          />
          <InfoItem
            icon={<Building2 className="h-4 w-4" />}
            label="Shipper"
            value={shipment.shipper}
          />
          <InfoItem
            icon={<Building2 className="h-4 w-4" />}
            label="Consignee"
            value={shipment.consignee}
          />
        </CardContent>
      </Card>
    </div>
  )
}
