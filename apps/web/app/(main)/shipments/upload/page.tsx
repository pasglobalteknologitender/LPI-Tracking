'use client';

import { ChangeEvent, DragEvent, useMemo, useState } from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  CheckCircle2,
  FileSpreadsheet,
  RefreshCcw,
  UploadCloud,
  XCircle,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { cn } from '@/lib/utils';
import { Unauthorized } from '@/components/unauthorized';
import { useAuth } from '@/lib/auth-context';

type PreviewShipment = {
  reference: string;
  bol: string;
  container: string;
  customer: string;
  origin: string;
  destination: string;
  status: string;
  etd: string;
  eta: string;
};

type ValidationColumn = {
  name: keyof PreviewShipment;
  label: string;
  required: boolean;
};

const requiredColumns: ValidationColumn[] = [
  { name: 'reference', label: 'Reference', required: true },
  { name: 'bol', label: 'BOL', required: true },
  { name: 'container', label: 'Container', required: true },
  { name: 'customer', label: 'Customer', required: true },
  { name: 'origin', label: 'Origin', required: true },
  { name: 'destination', label: 'Destination', required: true },
  { name: 'status', label: 'Status', required: true },
  { name: 'etd', label: 'ETD', required: false },
  { name: 'eta', label: 'ETA', required: false },
];

const previewShipments: PreviewShipment[] = [
  {
    reference: 'LPI-260710-001',
    bol: 'BOL-JKT-8842',
    container: 'MSCU1234567',
    customer: 'PT Sinar Laut',
    origin: 'Jakarta',
    destination: 'Singapore',
    status: 'In Transit',
    etd: '2026-07-12',
    eta: '2026-07-16',
  },
  {
    reference: 'LPI-260710-002',
    bol: 'BOL-SUB-1128',
    container: 'TEMU7654321',
    customer: 'CV Mandiri Logistik',
    origin: 'Surabaya',
    destination: 'Port Klang',
    status: 'Booked',
    etd: '2026-07-14',
    eta: '2026-07-19',
  },
  {
    reference: 'LPI-260710-003',
    bol: 'BOL-BTH-3409',
    container: 'OOLU9988776',
    customer: 'PT Cipta Niaga',
    origin: 'Batam',
    destination: 'Ho Chi Minh',
    status: 'Customs',
    etd: '2026-07-15',
    eta: '2026-07-21',
  },
  {
    reference: 'LPI-260710-004',
    bol: 'BOL-MKS-2201',
    container: 'CMAU4433221',
    customer: 'PT Nusantara Fresh',
    origin: 'Makassar',
    destination: 'Manila',
    status: 'Ready',
    etd: '2026-07-18',
    eta: '2026-07-25',
  },
  {
    reference: 'LPI-260710-005',
    bol: 'BOL-BPN-7135',
    container: 'HLBU5566778',
    customer: 'PT Energi Raya',
    origin: 'Balikpapan',
    destination: 'Bangkok',
    status: 'Draft',
    etd: '2026-07-20',
    eta: '2026-07-27',
  },
];

const formatFileSize = (bytes: number) => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;

  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

export default function UploadShipmentPage() {
  const { can } = useAuth();
  const [file, setFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [importedShipments, setImportedShipments] = useState<PreviewShipment[]>(
    [],
  );

  const columnValidation = useMemo(() => {
    return requiredColumns.map((column) => ({
      ...column,
      valid:
        !column.required ||
        previewShipments.every((shipment) => Boolean(shipment[column.name])),
    }));
  }, []);

  const missingRequiredColumns = columnValidation.filter(
    (column) => column.required && !column.valid,
  );
  const isReadyToImport = Boolean(file) && missingRequiredColumns.length === 0;

  const handleFileSelected = (selectedFile?: File) => {
    if (!selectedFile) return;

    setFile(selectedFile);
    setImportedShipments([]);
  };

  const handleInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    handleFileSelected(event.target.files?.[0]);
  };

  const handleDrop = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragging(false);
    handleFileSelected(event.dataTransfer.files[0]);
  };

  const handleImport = () => {
    if (!isReadyToImport) return;

    setImportedShipments(previewShipments);
  };

  const handleReset = () => {
    setFile(null);
    setImportedShipments([]);
  };

  if (!can('upload_shipments')) {
    return <Unauthorized />;
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="border-b border-border/60 bg-white/85 backdrop-blur-xl">
        <div className="p-4 lg:px-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/shipments">
                <Button variant="ghost" size="icon" className="shrink-0 rounded-xl">
                  <ArrowLeft className="h-5 w-5" />
                </Button>
              </Link>

              <div>
                <h1 className="text-xl font-bold text-foreground">
                  Upload Shipments
                </h1>
                <div className="mt-0.5 flex items-center gap-2 text-sm text-muted-foreground">
                  <UploadCloud className="h-4 w-4 text-primary" />
                  <span>Preview and validate shipment data before import</span>
                </div>
              </div>
            </div>

            {file && (
              <Button variant="outline" onClick={handleReset} className="rounded-xl">
                <RefreshCcw className="mr-2 h-4 w-4" />
                Reset
              </Button>
            )}
          </div>
        </div>
      </div>

      <div className="space-y-5 p-4 sm:p-6">
        <div
          onDragOver={(event) => {
            event.preventDefault();
            setIsDragging(true);
          }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
          className={cn(
            'rounded-2xl border-2 border-dashed bg-card p-8 text-center shadow-sm shadow-slate-950/[0.03] transition-colors',
            isDragging
              ? 'border-primary bg-blue-50'
              : 'border-border hover:bg-slate-50/70',
          )}
        >
          <div className="mx-auto flex max-w-xl flex-col items-center">
            <div className="mb-4 rounded-2xl bg-blue-50 p-3">
              <FileSpreadsheet className="h-8 w-8 text-primary" />
            </div>

            <p className="text-sm font-semibold text-foreground">
              Drop shipment file here
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              Choose a CSV or Excel file to generate a mock preview table.
            </p>

            <input
              id="shipment-file-upload"
              type="file"
              accept=".csv,.xlsx,.xls"
              className="hidden"
              onChange={handleInputChange}
            />

            <label htmlFor="shipment-file-upload">
              <Button variant="outline" className="mt-4 rounded-xl" asChild>
                <span>Select File</span>
              </Button>
            </label>

            {file && (
              <div className="mt-5 flex flex-wrap items-center justify-center gap-2 text-sm">
                <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100">
                  {file.name}
                </Badge>
                <span className="text-muted-foreground">
                  {formatFileSize(file.size)}
                </span>
              </div>
            )}
          </div>
        </div>

        {file ? (
          <>
            <div className="grid gap-4 md:grid-cols-3">
              <div className="lpi-soft-card">
                <p className="text-sm text-muted-foreground">Preview Rows</p>
                <p className="mt-2 text-2xl font-bold text-foreground">
                  {previewShipments.length}
                </p>
              </div>

              <div className="lpi-soft-card">
                <p className="text-sm text-muted-foreground">Required Columns</p>
                <p className="mt-2 text-2xl font-bold text-foreground">
                  {columnValidation.filter((column) => column.required).length}
                </p>
              </div>

              <div className="lpi-soft-card">
                <p className="text-sm text-muted-foreground">Import Status</p>
                <p className="mt-2 text-2xl font-bold text-foreground">
                  {importedShipments.length > 0 ? 'Imported' : 'Ready'}
                </p>
              </div>
            </div>

            <div className="lpi-panel p-5 sm:p-6">
              <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h2 className="text-lg font-semibold text-foreground">
                    Column Validation
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    Dummy validation checks required fields in the preview data.
                  </p>
                </div>

                <Badge
                  className={cn(
                    missingRequiredColumns.length === 0
                      ? 'bg-green-100 text-green-700 hover:bg-green-100'
                      : 'bg-red-100 text-red-700 hover:bg-red-100',
                  )}
                >
                  {missingRequiredColumns.length === 0
                    ? 'All required columns valid'
                    : `${missingRequiredColumns.length} missing columns`}
                </Badge>
              </div>

              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {columnValidation.map((column) => (
                  <div
                    key={column.name}
                    className="flex items-center justify-between rounded-xl border border-border/70 bg-slate-50/60 p-3"
                  >
                    <div>
                      <p className="text-sm font-medium text-foreground">
                        {column.label}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {column.required ? 'Required' : 'Optional'}
                      </p>
                    </div>

                    {column.valid ? (
                      <CheckCircle2 className="h-5 w-5 text-green-600" />
                    ) : (
                      <XCircle className="h-5 w-5 text-red-600" />
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className="lpi-panel overflow-hidden p-5 sm:p-6">
              <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h2 className="text-lg font-semibold text-foreground">
                    Preview Table
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    This table uses mock rows and will be replaced by parsed file
                    data later.
                  </p>
                </div>

                <Button
                  onClick={handleImport}
                  disabled={!isReadyToImport || importedShipments.length > 0}
                  className="rounded-xl bg-primary shadow-lg shadow-blue-700/20 hover:bg-primary/90"
                >
                  <UploadCloud className="mr-2 h-4 w-4" />
                  {importedShipments.length > 0 ? 'Imported' : 'Import'}
                </Button>
              </div>

              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Reference</TableHead>
                    <TableHead>BOL</TableHead>
                    <TableHead>Container</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Origin</TableHead>
                    <TableHead>Destination</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>ETD</TableHead>
                    <TableHead>ETA</TableHead>
                  </TableRow>
                </TableHeader>

                <TableBody>
                  {previewShipments.map((shipment) => (
                    <TableRow key={shipment.reference}>
                      <TableCell className="font-medium">
                        {shipment.reference}
                      </TableCell>
                      <TableCell>{shipment.bol}</TableCell>
                      <TableCell>{shipment.container}</TableCell>
                      <TableCell>{shipment.customer}</TableCell>
                      <TableCell>{shipment.origin}</TableCell>
                      <TableCell>{shipment.destination}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{shipment.status}</Badge>
                      </TableCell>
                      <TableCell>{shipment.etd}</TableCell>
                      <TableCell>{shipment.eta}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {importedShipments.length > 0 && (
              <div className="rounded-xl border border-green-200 bg-green-50 p-5">
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="mt-0.5 h-5 w-5 text-green-600" />
                  <div>
                    <p className="font-semibold text-green-900">
                      {importedShipments.length} mock shipments imported
                    </p>
                    <p className="mt-1 text-sm text-green-700">
                      Data has been added to temporary local state for this
                      preview session.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="lpi-panel p-8 text-center">
            <p className="text-sm font-medium text-foreground">
              No file selected
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              Select a file to show the dummy preview table and validation
              results.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
