'use client';

import { useEffect, useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationPrevious,
  PaginationNext,
} from '@/components/ui/pagination';
import { getLogs } from '@/lib/log-service';
import type { IntegrationLog } from '@lpi/contracts';
import {
  Activity,
  CheckCircle2,
  Eye,
  FileX,
  Logs,
  RefreshCw,
  Search,
  X,
  XCircle,
} from 'lucide-react';
import { formatDateTimeID } from '@/lib/utils';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  FailedSyncState,
  FullPageErrorState,
  OfflineBanner,
  useOfflineState,
} from '@/components/app-state';
import { ShipmentListSkeleton } from '@/components/shipment/shipment-skeleton';

const FORCE_DUMMY_ERROR = false;
const FORCE_DUMMY_OFFLINE = false;
const FORCE_DUMMY_FAILED_SYNC = false;

export default function LogPage() {
  const [logs, setLogs] = useState<IntegrationLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [hasLoadError, setHasLoadError] = useState(FORCE_DUMMY_ERROR);
  const [hasFailedSync, setHasFailedSync] = useState(FORCE_DUMMY_FAILED_SYNC);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('all');
  const [type, setType] = useState('all');
  const [selectedLog, setSelectedLog] = useState<IntegrationLog | null>(null);

  const hasFilters = search || status !== 'all' || type !== 'all';

  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;
  const isOffline = useOfflineState(FORCE_DUMMY_OFFLINE);

  useEffect(() => {
    let mounted = true;

    async function loadLogs() {
      setIsLoading(true);
      setHasLoadError(FORCE_DUMMY_ERROR);

      try {
        const data = await getLogs();
        if (mounted) {
          setLogs(data);
        }
      } catch {
        if (mounted) {
          setHasLoadError(true);
        }
      } finally {
        if (mounted) {
          setIsLoading(false);
        }
      }
    }

    loadLogs();

    return () => {
      mounted = false;
    };
  }, []);

  const filteredLogs = useMemo(() => {
    return logs.filter((log) => {
      const matchSearch =
        !search || log.shipment.toLowerCase().includes(search.toLowerCase());
      const matchStatus = status === 'all' || log.status === status;
      const matchType = type === 'all' || log.type === type;
      return matchSearch && matchStatus && matchType;
    });
  }, [logs, search, status, type]);

  const totalPages = Math.ceil(filteredLogs.length / pageSize);
  const failedSyncCount = useMemo(
    () => logs.filter((log) => log.status === 'Failed').length,
    [logs],
  );
  const logStats = useMemo(
    () => [
      {
        label: 'Total Logs',
        value: logs.length,
        hint: 'API transactions',
        icon: Activity,
        tone: 'blue',
      },
      {
        label: 'Success',
        value: logs.filter((log) => log.status === 'Success').length,
        hint: 'Accepted payloads',
        icon: CheckCircle2,
        tone: 'green',
      },
      {
        label: 'Failed',
        value: failedSyncCount,
        hint: 'Need attention',
        icon: XCircle,
        tone: 'red',
      },
      {
        label: 'Retries',
        value: logs.reduce((total, log) => total + log.retry, 0),
        hint: 'Retry attempts',
        icon: RefreshCw,
        tone: 'amber',
      },
    ],
    [failedSyncCount, logs],
  );
  const showFailedSync =
    hasFailedSync || FORCE_DUMMY_FAILED_SYNC || failedSyncCount > 0;

  const paginatedLogs = filteredLogs.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize,
  );

  const getStatusClass = (status: string) => {
    switch (status) {
      case 'Success':
        return 'text-xs font-medium bg-green-100 text-green-700 border-green-200';
      case 'Failed':
        return 'text-xs font-medium bg-red-100 text-red-700 border-red-200';
      default:
        return 'text-xs font-medium bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const handleRetry = (id: string) => {
    setLogs((prev) =>
      prev.map((log) => {
        if (log.id !== id) return log;
        const success = Math.random() > 0.5;
        return {
          ...log,
          status: success ? 'Success' : 'Failed',
          code: success ? 200 : 500,
          retry: log.retry + 1,
          timestamp: new Date().toISOString(),
          response: success
            ? { message: 'Retry success' }
            : { error: 'Retry failed again' },
        };
      }),
    );
  };

  const handleRetryLoad = async () => {
    setIsLoading(true);
    setHasLoadError(false);
    const data = await getLogs();
    setLogs(data);
    setIsLoading(false);
  };

  const handleRetryAllFailed = () => {
    setHasFailedSync(false);
    setLogs((prev) =>
      prev.map((log) =>
        log.status === 'Failed'
          ? {
              ...log,
              status: 'Success',
              code: 200,
              retry: log.retry + 1,
              timestamp: new Date().toISOString(),
              response: { message: 'Retry success' },
            }
          : log,
      ),
    );
  };

  return (
    <div className="lpi-page">
      <OfflineBanner show={isOffline} />
      <div className="flex items-center gap-3 sm:gap-4">
        <div className="lpi-icon-tile">
          <Logs className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
        </div>
        <div>
          <h1 className="lpi-page-title">TransVoyant Logs</h1>
          <p className="lpi-page-description">
            Monitor API delivery status & audit trail
          </p>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {logStats.map((stat) => (
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
        <div className="lpi-toolbar flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search shipment..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="lpi-input w-full pl-9 max-sm:text-sm"
            />
          </div>

          <div className="flex gap-3 w-full sm:w-auto">
            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger className="lpi-input w-full sm:w-[140px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="Success">Success</SelectItem>
                <SelectItem value="Failed">Failed</SelectItem>
              </SelectContent>
            </Select>

            <Select value={type} onValueChange={setType}>
              <SelectTrigger className="lpi-input w-full sm:w-[200px]">
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Type</SelectItem>
                <SelectItem value="Pre-Transportation">
                  Pre-transportation
                </SelectItem>
                <SelectItem value="During Transportation">
                  During transportation
                </SelectItem>
              </SelectContent>
            </Select>

            {hasFilters && (
              <Button
                variant="outline"
                size="icon"
                onClick={() => {
                  setSearch('');
                  setStatus('all');
                  setType('all');
                }}
                className="h-10 w-10 rounded-xl"
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>

        {isLoading ? (
          <ShipmentListSkeleton />
        ) : hasLoadError ? (
          <FullPageErrorState variant="logs" onRetry={handleRetryLoad} />
        ) : filteredLogs.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed bg-card py-16 shadow-sm">
            <FileX className="h-7 w-7 text-muted-foreground" />
            <h3 className="mt-4 text-lg font-semibold">No logs found</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Try adjusting your filters or search
            </p>
          </div>
        ) : (
          <>
            <FailedSyncState
              variant="logs"
              show={showFailedSync}
              failedCount={failedSyncCount}
              onRetry={handleRetryAllFailed}
            />

            <div className="overflow-x-auto rounded-2xl border border-border/70 bg-card shadow-sm shadow-slate-950/[0.03]">
              <Table>
                <TableHeader>
                  <TableRow className="lpi-table-head">
                    <TableHead className="text-center w-12">
                      No
                    </TableHead>
                    <TableHead>Shipment</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Endpoint</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Code</TableHead>
                    <TableHead>Retry</TableHead>
                    <TableHead>Time</TableHead>
                    <TableHead className="text-center w-16">
                      Action
                    </TableHead>
                  </TableRow>
                </TableHeader>

                <TableBody>
                  {paginatedLogs.map((log, index) => (
                    <TableRow
                      key={log.id}
                      className="group lpi-row"
                    >
                      <TableCell>
                        <div className="text-center">
                          {(currentPage - 1) * pageSize + index + 1}
                        </div>
                      </TableCell>
                      <TableCell>{log.shipment}</TableCell>
                      <TableCell>{log.type}</TableCell>
                      <TableCell className="text-xs text-gray-500">
                        {log.endpoint}
                      </TableCell>
                      <TableCell>
                        <span
                          className={`px-2 py-0.5 text-xs rounded-lg border ${getStatusClass(
                            log.status,
                          )}`}
                        >
                          {log.status}
                        </span>
                      </TableCell>
                      <TableCell>{log.code}</TableCell>
                      <TableCell>{log.retry}</TableCell>
                      <TableCell>{formatDateTimeID(log.timestamp)}</TableCell>
                      <TableCell className="text-right space-x-2">
                        {log.status === 'Failed' && (
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => handleRetry(log.id)}
                              >
                                <RefreshCw className="h-4 w-4 text-gray-400 group-hover:text-green-600" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent side="top">
                              Retry API Call
                            </TooltipContent>
                          </Tooltip>
                        )}
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              size="icon"
                              variant="ghost"
                              onClick={() => setSelectedLog(log)}
                            >
                              <Eye className="h-4 w-4 text-gray-400 group-hover:text-blue-600" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent side="top">View Detail</TooltipContent>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </>
        )}

        {!isLoading && !hasLoadError && filteredLogs.length > 0 && (
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-muted-foreground flex-1">
            Page {currentPage} of {totalPages} / Showing{' '}
            {(currentPage - 1) * pageSize + 1} -{' '}
            {Math.min(currentPage * pageSize, filteredLogs.length)} of{' '}
            {filteredLogs.length} logs
          </p>

          <Pagination className="flex-1 sm:!justify-end">
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    if (currentPage > 1) setCurrentPage(currentPage - 1);
                  }}
                />
              </PaginationItem>

              {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                (page) => (
                  <PaginationItem key={page}>
                    <PaginationLink
                      href="#"
                      isActive={page === currentPage}
                      onClick={(e) => {
                        e.preventDefault();
                        setCurrentPage(page);
                      }}
                    >
                      {page}
                    </PaginationLink>
                  </PaginationItem>
                ),
              )}

              <PaginationItem>
                <PaginationNext
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    if (currentPage < totalPages)
                      setCurrentPage(currentPage + 1);
                  }}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
        )}
      </div>

      <Dialog open={!!selectedLog} onOpenChange={() => setSelectedLog(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Log Detail</DialogTitle>
          </DialogHeader>

          {selectedLog && (
            <div className="space-y-4 text-sm mt-2">
              <div className="space-y-1">
                <p className="font-semibold">Request Payload</p>
                <pre className="bg-gray-50 border border-gray-200 p-2 rounded-lg overflow-auto text-xs font-[monospace]">
                  {JSON.stringify(selectedLog.request, null, 2)}
                </pre>
              </div>

              <div className="space-y-1">
                <p className="font-semibold">Response</p>
                <pre className="bg-gray-50 border border-gray-200 p-2 rounded-lg overflow-auto text-xs font-[monospace]">
                  {JSON.stringify(selectedLog.response, null, 2)}
                </pre>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
