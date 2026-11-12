'use client';

import React, { useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import {
  ScrollText,
  Search,
  Filter,
  SlidersHorizontal,
  Pause,
  Play,
  Copy,
  Check,
  CheckCircle2,
  Clock,
  Download,
  AlertTriangle,
  X,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  Terminal,
} from 'lucide-react';
import {
  DataTable,
  Column,
  Button,
  Badge,
  Alert,
  Skeleton,
  EmptyState,
} from '@/components/ui';

export type LogsPageState = 'default' | 'loading' | 'empty' | 'error';

interface LogEntry {
  id: string;
  timestamp: string;
  level: 'Info' | 'Warning' | 'Error' | 'Critical';
  service: string;
  message: string;
  reqId: string;
  statusCode: string;
  traceId: string;
  pod: string;
  host: string;
  region: string;
  routePath: string;
  method: string;
  clientOrigin: string;
  latency: string;
  rawJson: string;
  attributes: Record<string, string>;
}

function OpsLogsContent() {
  const searchParams = useSearchParams();
  const showHarness = process.env.NODE_ENV !== 'production' && searchParams.get('states') === '1';

  const [harnessState, setHarnessState] = useState<LogsPageState>('default');
  const [isLiveTailing, setIsLiveTailing] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSeverity, setSelectedSeverity] = useState('All');
  const [selectedService, setSelectedService] = useState('All');
  const [selectedLog, setSelectedLog] = useState<LogEntry | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [page, setPage] = useState(1);

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard?.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const mockLogs: LogEntry[] = [
    {
      id: 'log-1',
      reqId: 'req_8d11c055',
      timestamp: '15:29:44.812 UTC',
      level: 'Error',
      service: 'ai-routing.router',
      message: 'Frontier model rate limit 429 threshold reached. Circuit breaker engaged -> rerouted to GPT-4o fallback pool.',
      statusCode: '429',
      traceId: 'trace_8fa90b41',
      pod: 'pod-routing-7f89d-21',
      host: 'edge-09.ingress.zuri.internal',
      region: 'eu-central-1',
      routePath: '/v1/chat/completions/academic-routing',
      method: 'POST (HTTP/2)',
      clientOrigin: 'CS-204 Algorithmic Complexity',
      latency: '1,380ms',
      rawJson: JSON.stringify(
        {
          timestamp: '2025-05-18T15:29:44.812Z',
          level: 'ERROR',
          service: 'ai-routing.router',
          request_id: 'req_8d11c055',
          trace_id: 'trace_8fa90b41',
          status: 429,
          message: 'Frontier model rate limit 429 threshold reached. Circuit breaker engaged -> rerouted to GPT-4o fallback pool.',
          attributes: {
            fallback_target: 'openai.gpt-4o.academic',
            retry_after_sec: 4,
            tokens_requested: 1840,
          },
        },
        null,
        2
      ),
      attributes: {
        cache_layer: 'bypass_unmet_threshold',
        fallback_target: 'openai.gpt-4o.academic',
        memory_rss: '412MB',
      },
    },
    {
      id: 'log-2',
      reqId: 'req_db_rep02',
      timestamp: '15:29:43.904 UTC',
      level: 'Critical',
      service: 'db-postgres.replica-2',
      message: 'WAL replay lag exceeded threshold: 1,480ms (>1000ms max). Read traffic reallocated to replica-1.',
      statusCode: '503',
      traceId: 'trace_db9924a1',
      pod: 'pod-pg-replica-02',
      host: 'db-node-02.internal',
      region: 'eu-central-1',
      routePath: '/internal/db/wal-stream',
      method: 'STREAM (gRPC)',
      clientOrigin: 'Internal Postgres Mesh',
      latency: '1,480ms',
      rawJson: JSON.stringify(
        {
          timestamp: '2025-05-18T15:29:43.904Z',
          level: 'CRIT',
          service: 'db-postgres.replica-2',
          request_id: 'req_db_rep02',
          trace_id: 'trace_db9924a1',
          status: 503,
          message: 'WAL replay lag exceeded threshold: 1,480ms (>1000ms max). Read traffic reallocated to replica-1.',
        },
        null,
        2
      ),
      attributes: {
        wal_lag_bytes: '42.8MB',
        replica_state: 'degraded',
        failover_node: 'db-postgres.replica-1',
      },
    },
    {
      id: 'log-3',
      reqId: 'req_9b4e112a',
      timestamp: '15:29:42.118 UTC',
      level: 'Warning',
      service: 'ocr-extractor.pipeline',
      message: 'PDF rasterizer memory soft-ceiling reached (820MB/1024MB); garbage compaction completed on worker-04.',
      statusCode: '200',
      traceId: 'trace_ocr7741f',
      pod: 'pod-ocr-worker-04',
      host: 'gpu-worker-04.internal',
      region: 'eu-central-1',
      routePath: '/api/v1/extract/ocr-pdf',
      method: 'POST',
      clientOrigin: 'Document Pipeline Client',
      latency: '410ms',
      rawJson: JSON.stringify(
        {
          timestamp: '2025-05-18T15:29:42.118Z',
          level: 'WARN',
          service: 'ocr-extractor.pipeline',
          request_id: 'req_9b4e112a',
          status: 200,
          message: 'PDF rasterizer memory soft-ceiling reached (820MB/1024MB); garbage compaction completed on worker-04.',
        },
        null,
        2
      ),
      attributes: {
        memory_rss: '820MB',
        gc_reclaimed: '340MB',
        worker_id: 'ocr-worker-04',
      },
    },
    {
      id: 'log-4',
      reqId: 'req_41c099e2',
      timestamp: '15:29:41.002 UTC',
      level: 'Info',
      service: 'auth-vault.enclave',
      message: 'RS256 session token verified for admin@oxford.ac.uk; public key cached in memory.',
      statusCode: '200',
      traceId: 'trace_vault12a9',
      pod: 'pod-vault-enclave-01',
      host: 'vault-01.security.internal',
      region: 'eu-central-1',
      routePath: '/api/auth/verify',
      method: 'GET',
      clientOrigin: 'Web App Session Middleware',
      latency: '3.4ms',
      rawJson: JSON.stringify(
        {
          timestamp: '2025-05-18T15:29:41.002Z',
          level: 'INFO',
          service: 'auth-vault.enclave',
          status: 200,
          message: 'RS256 session token verified for admin@oxford.ac.uk; public key cached in memory.',
        },
        null,
        2
      ),
      attributes: {
        token_type: 'access',
        claims_role: 'institution_admin',
      },
    },
    {
      id: 'log-5',
      reqId: 'req_77d201ab',
      timestamp: '15:29:39.702 UTC',
      level: 'Error',
      service: 'worker-temporal.jobs',
      message: 'Worker execution timeout on syllabus vector extraction task job_398a12; scheduled for retry attempt 2.',
      statusCode: '504',
      traceId: 'trace_job88a10',
      pod: 'pod-temporal-worker-12',
      host: 'temporal-node-03.internal',
      region: 'eu-central-1',
      routePath: '/tasks/queue/academic-extraction',
      method: 'POST',
      clientOrigin: 'Temporal Orchestrator',
      latency: '30,000ms',
      rawJson: JSON.stringify(
        {
          timestamp: '2025-05-18T15:29:39.702Z',
          level: 'ERROR',
          service: 'worker-temporal.jobs',
          status: 504,
          message: 'Worker execution timeout on syllabus vector extraction task job_398a12; scheduled for retry attempt 2.',
        },
        null,
        2
      ),
      attributes: {
        task_queue: 'academic-extraction',
        retry_count: '2',
      },
    },
  ];

  const filteredLogs = mockLogs.filter((log) => {
    if (selectedSeverity !== 'All' && log.level !== selectedSeverity) return false;
    if (selectedService !== 'All' && log.service !== selectedService) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        log.reqId.toLowerCase().includes(q) ||
        log.service.toLowerCase().includes(q) ||
        log.message.toLowerCase().includes(q) ||
        log.statusCode.includes(q)
      );
    }
    return true;
  });

  const columns: Column<LogEntry>[] = [
    {
      header: 'Timestamp and request',
      isTitle: true,
      accessor: (row) => (
        <div className="flex flex-col py-0.5">
          <div className="flex items-center gap-1.5">
            <span className="font-mono text-body-sm font-semibold text-ops-text">
              {row.reqId}
            </span>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                handleCopy(row.id, row.reqId);
              }}
              className="p-1 rounded text-ops-text-muted hover:text-ops-text transition-colors cursor-pointer"
              title="Copy request ID"
            >
              {copiedId === row.id ? (
                <Check className="w-3.5 h-3.5 text-ops-ok" />
              ) : (
                <Copy className="w-3.5 h-3.5" />
              )}
            </button>
          </div>
          <span className="font-mono text-caption text-ops-text-muted">
            {row.timestamp}
          </span>
        </div>
      ),
    },
    {
      header: 'Severity',
      isKeyField: true,
      accessor: (row) => (
        <span
          className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-caption font-medium select-none ${
            row.level === 'Critical'
              ? 'bg-ops-crit/15 text-ops-crit'
              : row.level === 'Error'
              ? 'bg-ops-crit/10 text-ops-crit'
              : row.level === 'Warning'
              ? 'bg-ops-warn/15 text-ops-warn'
              : 'bg-ops-ok/15 text-ops-ok'
          }`}
        >
          <span
            className={`w-1.5 h-1.5 rounded-full ${
              row.level === 'Critical'
                ? 'bg-ops-crit'
                : row.level === 'Error'
                ? 'bg-ops-crit'
                : row.level === 'Warning'
                ? 'bg-ops-warn'
                : 'bg-ops-ok'
            }`}
          />
          {row.level}
        </span>
      ),
    },
    {
      header: 'Service and pod',
      accessor: (row) => (
        <div className="flex flex-col min-w-[140px]">
          <span className="font-mono text-body-sm text-ops-accent">
            {row.service}
          </span>
          <span className="font-mono text-caption text-ops-text-muted truncate">
            {row.pod}
          </span>
        </div>
      ),
    },
    {
      header: 'Message',
      accessor: (row) => (
        <div className="text-body-sm text-ops-text max-w-md line-clamp-2 leading-relaxed">
          {row.message}
        </div>
      ),
    },
    {
      header: 'Status',
      numeric: true,
      isKeyField: true,
      accessor: (row) => (
        <span
          className={`font-mono text-body-sm tabular-nums font-semibold ${
            row.statusCode.startsWith('5')
              ? 'text-ops-crit'
              : row.statusCode.startsWith('4')
              ? 'text-ops-warn'
              : 'text-ops-ok'
          }`}
        >
          {row.statusCode}
        </span>
      ),
    },
    {
      header: 'Latency',
      numeric: true,
      accessor: (row) => (
        <span className="font-mono text-caption text-ops-text-muted tabular-nums">
          {row.latency}
        </span>
      ),
    },
    {
      header: 'Action',
      accessor: (row) => (
        <button
          type="button"
          onClick={() => setSelectedLog(row)}
          className="px-2.5 py-1 rounded-sm text-caption font-medium text-ops-accent hover:bg-ops-panel-raised transition-colors cursor-pointer"
        >
          Inspect
        </button>
      ),
    },
  ];

  return (
    <div className="w-full flex flex-col gap-6 p-4 sm:p-6 lg:p-8 max-w-[1280px] mx-auto text-ops-text">
      {/* Dev-only Testing States Harness */}
      {showHarness && (
        <aside
          aria-label="Testing states harness"
          className="p-2.5 rounded-sm bg-ops-panel border border-ops-border text-caption flex flex-wrap items-center justify-between gap-2"
        >
          <div className="flex items-center gap-1.5 font-medium text-ops-text">
            <SlidersHorizontal className="w-3.5 h-3.5 text-ops-accent" aria-hidden="true" />
            <span>Logs states</span>
          </div>
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => setHarnessState('default')}
              className={`px-2 py-0.5 rounded-xs text-caption transition-colors cursor-pointer ${
                harnessState === 'default'
                  ? 'bg-ops-accent-strong text-ops-canvas font-semibold'
                  : 'text-ops-text-muted hover:text-ops-text hover:bg-ops-panel-raised'
              }`}
            >
              Default
            </button>
            <button
              type="button"
              onClick={() => setHarnessState('loading')}
              className={`px-2 py-0.5 rounded-xs text-caption transition-colors cursor-pointer ${
                harnessState === 'loading'
                  ? 'bg-ops-accent-strong text-ops-canvas font-semibold'
                  : 'text-ops-text-muted hover:text-ops-text hover:bg-ops-panel-raised'
              }`}
            >
              Loading
            </button>
            <button
              type="button"
              onClick={() => setHarnessState('empty')}
              className={`px-2 py-0.5 rounded-xs text-caption transition-colors cursor-pointer ${
                harnessState === 'empty'
                  ? 'bg-ops-accent-strong text-ops-canvas font-semibold'
                  : 'text-ops-text-muted hover:text-ops-text hover:bg-ops-panel-raised'
              }`}
            >
              Empty
            </button>
            <button
              type="button"
              onClick={() => setHarnessState('error')}
              className={`px-2 py-0.5 rounded-xs text-caption transition-colors cursor-pointer ${
                harnessState === 'error'
                  ? 'bg-ops-accent-strong text-ops-canvas font-semibold'
                  : 'text-ops-text-muted hover:text-ops-text hover:bg-ops-panel-raised'
              }`}
            >
              Error
            </button>
          </div>
        </aside>
      )}

      {/* Header section (List template: h1 Geist 600, one-line description, right actions) */}
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-ops-border/60">
        <div className="flex flex-col">
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-semibold text-ops-text tracking-tight font-sans">
              System logs
            </h1>
            <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full text-caption bg-ops-panel border border-ops-border">
              <span
                className={`w-2 h-2 rounded-full ${
                  isLiveTailing ? 'bg-ops-ok animate-pulse' : 'bg-ops-text-muted'
                }`}
              />
              <span className="text-ops-text-muted">
                {isLiveTailing ? 'Live tail active' : 'Tail paused'}
              </span>
            </div>
          </div>
          <p className="text-body-sm text-ops-text-muted mt-1">
            Distributed service logs, cluster errors, and trace audit stream.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Pause / Resume Tail Action */}
          <Button
            variant="secondary"
            onClick={() => {
              setIsLiveTailing(!isLiveTailing);
              triggerToast(isLiveTailing ? 'Live tail paused' : 'Live tail resumed');
            }}
            className="h-11 sm:h-10 text-body-sm"
          >
            {isLiveTailing ? (
              <>
                <Pause className="w-4 h-4 mr-1.5" />
                Pause tail
              </>
            ) : (
              <>
                <Play className="w-4 h-4 mr-1.5" />
                Resume tail
              </>
            )}
          </Button>

          {/* Export Action */}
          <Button
            variant="secondary"
            onClick={() => triggerToast('Exporting filtered log records...')}
            className="h-11 sm:h-10 text-body-sm"
          >
            <Download className="w-4 h-4 mr-1.5" />
            Export NDJSON
          </Button>
        </div>
      </header>

      {/* Feedback Toast Banner */}
      {toastMessage && (
        <Alert
          variant="success"
          description={toastMessage}
        />
      )}

      {/* State: Error */}
      {harnessState === 'error' && (
        <Alert
          variant="error"
          title="Log ingestion buffer disconnected"
          description="The logging gateway connection failed. Check the connection and try again."
          action={<Button variant="secondary" onClick={() => setHarnessState('default')}>Try again</Button>}
        />
      )}

      {/* State: Loading */}
      {harnessState === 'loading' && (
        <div className="flex flex-col gap-4" aria-busy="true">
          <Skeleton className="h-12 rounded-md bg-ops-panel" />
          <Skeleton className="h-96 rounded-md bg-ops-panel" />
        </div>
      )}

      {/* State: Empty */}
      {harnessState === 'empty' && (
        <EmptyState
          icon={ScrollText}
          title="No log entries found"
          description="There are no log events matching your current filter criteria."
          action={
            <Button
              variant="secondary"
              onClick={() => {
                setSearchQuery('');
                setSelectedSeverity('All');
                setSelectedService('All');
                setHarnessState('default');
              }}
            >
              Reset filters
            </Button>
          }
        />
      )}

      {/* State: Default */}
      {harnessState === 'default' && (
        <>
          {/* Filters Row (List template requirement) */}
          <section className="bg-ops-panel rounded-md border border-ops-border p-3.5 flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2.5 flex-1 min-w-[260px]">
              {/* Search input */}
              <div className="relative flex items-center bg-ops-panel-raised px-3 py-1.5 rounded-sm border border-ops-border flex-1 max-w-md">
                <Search className="w-4 h-4 text-ops-text-muted mr-2 shrink-0" aria-hidden="true" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Filter logs by request ID, message, status..."
                  className="bg-transparent text-body-sm text-ops-text placeholder:text-ops-text-muted focus:outline-none w-full"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery('')}
                    className="text-ops-text-muted hover:text-ops-text"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* Severity Filter Dropdown */}
              <select
                value={selectedSeverity}
                onChange={(e) => setSelectedSeverity(e.target.value)}
                className="bg-ops-panel-raised text-body-sm text-ops-text px-3 py-1.5 rounded-sm border border-ops-border focus:outline-none cursor-pointer"
              >
                <option value="All">All severities</option>
                <option value="Critical">Critical</option>
                <option value="Error">Error</option>
                <option value="Warning">Warning</option>
                <option value="Info">Info</option>
              </select>

              {/* Service Filter Dropdown */}
              <select
                value={selectedService}
                onChange={(e) => setSelectedService(e.target.value)}
                className="bg-ops-panel-raised text-body-sm text-ops-text px-3 py-1.5 rounded-sm border border-ops-border focus:outline-none cursor-pointer"
              >
                <option value="All">All services</option>
                <option value="ai-routing.router">ai-routing.router</option>
                <option value="db-postgres.replica-2">db-postgres.replica-2</option>
                <option value="ocr-extractor.pipeline">ocr-extractor.pipeline</option>
                <option value="auth-vault.enclave">auth-vault.enclave</option>
                <option value="worker-temporal.jobs">worker-temporal.jobs</option>
              </select>
            </div>

            <span className="font-mono text-caption text-ops-text-muted">
              {filteredLogs.length} matching events
            </span>
          </section>

          {/* Main Log DataTable */}
          <section className="bg-ops-panel rounded-md border border-ops-border overflow-hidden">
            <DataTable
              columns={columns}
              data={filteredLogs}
              keyExtractor={(row) => row.id}
              onRowClick={(row) => setSelectedLog(row)}
              className="border-0 rounded-none cursor-pointer"
            />

            {/* Pagination (List template requirement) */}
            <div className="p-3.5 border-t border-ops-border/60 flex items-center justify-between text-caption text-ops-text-muted">
              <span>Showing 1 to {filteredLogs.length} of {filteredLogs.length} entries</span>
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  disabled={page === 1}
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  className="px-2.5 py-1 rounded-sm border border-ops-border bg-ops-panel-raised text-ops-text disabled:opacity-40 cursor-pointer disabled:cursor-not-allowed"
                >
                  <ChevronLeft className="w-3.5 h-3.5 inline mr-1" />
                  Previous
                </button>
                <span className="px-2 font-mono text-ops-text">Page {page}</span>
                <button
                  type="button"
                  disabled={true}
                  className="px-2.5 py-1 rounded-sm border border-ops-border bg-ops-panel-raised text-ops-text disabled:opacity-40 cursor-not-allowed"
                >
                  Next
                  <ChevronRight className="w-3.5 h-3.5 inline ml-1" />
                </button>
              </div>
            </div>
          </section>

          {/* Log Detail Inspection Drawer / Modal */}
          {selectedLog && (
            <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
              <div
                className="w-full max-w-2xl bg-ops-panel border border-ops-border rounded-md shadow-2xl p-5 max-h-[90vh] overflow-y-auto flex flex-col gap-4 text-ops-text"
                role="dialog"
                aria-modal="true"
                aria-labelledby="log-dialog-title"
              >
                {/* Header */}
                <div className="flex items-start justify-between pb-3 border-b border-ops-border/60">
                  <div className="flex flex-col">
                    <div className="flex items-center gap-2">
                      <h2 id="log-dialog-title" className="text-body-sm font-semibold text-ops-text">
                        Log event: {selectedLog.reqId}
                      </h2>
                      <span className="font-mono text-caption text-ops-text-muted">
                        {selectedLog.timestamp}
                      </span>
                    </div>
                    <span className="font-mono text-caption text-ops-accent">
                      {selectedLog.service} • {selectedLog.pod}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setSelectedLog(null)}
                    className="p-1 rounded-xs hover:bg-ops-panel-raised text-ops-text-muted hover:text-ops-text"
                    aria-label="Close log inspector"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Message banner */}
                <div className="p-3 rounded-sm bg-ops-panel-raised border border-ops-border/60 flex flex-col gap-1">
                  <span className="text-caption text-ops-text-muted">Event message</span>
                  <p className="text-body-sm text-ops-text font-medium leading-relaxed">
                    {selectedLog.message}
                  </p>
                </div>

                {/* Key metadata grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-caption">
                  <div className="bg-ops-panel-raised p-2 rounded-sm border border-ops-border/60 flex flex-col">
                    <span className="text-ops-text-muted">HTTP status</span>
                    <span className="font-mono font-semibold text-ops-text">{selectedLog.statusCode}</span>
                  </div>
                  <div className="bg-ops-panel-raised p-2 rounded-sm border border-ops-border/60 flex flex-col">
                    <span className="text-ops-text-muted">Latency</span>
                    <span className="font-mono font-semibold text-ops-text">{selectedLog.latency}</span>
                  </div>
                  <div className="bg-ops-panel-raised p-2 rounded-sm border border-ops-border/60 flex flex-col">
                    <span className="text-ops-text-muted">Trace ID</span>
                    <span className="font-mono font-semibold text-ops-text">{selectedLog.traceId}</span>
                  </div>
                  <div className="bg-ops-panel-raised p-2 rounded-sm border border-ops-border/60 flex flex-col">
                    <span className="text-ops-text-muted">Region</span>
                    <span className="font-mono font-semibold text-ops-text">{selectedLog.region}</span>
                  </div>
                </div>

                {/* Raw JSON viewer */}
                <div className="flex flex-col gap-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-caption font-semibold text-ops-text flex items-center gap-1.5">
                      <Terminal className="w-3.5 h-3.5 text-ops-accent" />
                      Structured payload (JSON)
                    </span>
                    <button
                      type="button"
                      onClick={() => handleCopy('json', selectedLog.rawJson)}
                      className="inline-flex items-center gap-1 text-caption text-ops-accent hover:underline cursor-pointer"
                    >
                      {copiedId === 'json' ? (
                        <>
                          <Check className="w-3 h-3 text-ops-ok" />
                          <span>Copied</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3 h-3" />
                          <span>Copy JSON</span>
                        </>
                      )}
                    </button>
                  </div>
                  <pre className="p-3 rounded-sm bg-ops-canvas border border-ops-border text-caption font-mono text-ops-text-muted overflow-x-auto leading-relaxed">
                    {selectedLog.rawJson}
                  </pre>
                </div>

                {/* Footer action */}
                <div className="flex justify-end pt-2">
                  <Button
                    variant="secondary"
                    onClick={() => setSelectedLog(null)}
                  >
                    Close inspector
                  </Button>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default function OpsLogsPage() {
  return (
    <Suspense fallback={<div className="p-8 text-caption text-ops-text-muted">Loading system logs...</div>}>
      <OpsLogsContent />
    </Suspense>
  );
}
