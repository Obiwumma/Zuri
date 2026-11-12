'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import {
  Activity,
  Server,
  Database,
  Shield,
  Layers,
  Cpu,
  HardDrive,
  Bell,
  FileText,
  Search,
  RefreshCw,
  AlertTriangle,
  CheckCircle2,
  SlidersHorizontal,
  Clock,
  ArrowRight,
  TrendingUp,
} from 'lucide-react';
import {
  KpiTile,
  DataTable,
  Column,
  Button,
  Badge,
  Alert,
  Skeleton,
  EmptyState,
} from '@/components/ui';

export type HealthPageState = 'default' | 'loading' | 'empty' | 'error';

interface CoreServiceRecord {
  id: string;
  name: string;
  endpoint: string;
  icon: React.ComponentType<{ className?: string }>;
  status: 'Operational' | 'Degraded' | 'Critical';
  latency: string;
  p99Latency: string;
  checkInterval: string;
  notes: string;
  nodeDetails: string;
  isDegraded?: boolean;
}

interface IncidentEvent {
  id: string;
  level: 'Warning' | 'Notice' | 'Resolved' | 'Completed';
  title: string;
  timestamp: string;
  description: string;
  status: 'Mitigating' | 'Resolved' | 'Closed' | 'Completed';
}

function OpsHealthContent() {
  const searchParams = useSearchParams();
  const showHarness = process.env.NODE_ENV !== 'production' && searchParams.get('states') === '1';

  const [harnessState, setHarnessState] = useState<HealthPageState>('default');
  const [pollInterval, setPollInterval] = useState<string>('10s');
  const [timeframe, setTimeframe] = useState<'15m' | '1h' | '24h' | '7d'>('15m');
  const [filterMode, setFilterMode] = useState<'All' | 'Healthy' | 'Degraded' | 'Critical'>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sweepSeconds, setSweepSeconds] = useState<number>(42);
  const [isProbing, setIsProbing] = useState<boolean>(false);
  const [actionNotice, setActionNotice] = useState<string | null>(null);

  useEffect(() => {
    const timer = setInterval(() => {
      setSweepSeconds((prev) => (prev + 1) % 60);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const handleRunProbe = () => {
    setIsProbing(true);
    setActionNotice(null);
    setTimeout(() => {
      setSweepSeconds(0);
      setIsProbing(false);
      setActionNotice('Health check completed. All probes responded within nominal boundaries.');
      setTimeout(() => setActionNotice(null), 4000);
    }, 850);
  };

  const servicesData: CoreServiceRecord[] = [
    {
      id: 'srv-1',
      name: 'API gateway and ingress',
      endpoint: 'edge.ingress.zuri.internal',
      icon: Server,
      status: 'Operational',
      latency: '18ms',
      p99Latency: 'p99 34ms',
      checkInterval: '3s ago',
      notes: 'Envoy mesh healthy, 3,420 req/s nominal',
      nodeDetails: '24 replicas, TLS 1.3',
    },
    {
      id: 'srv-2',
      name: 'Primary database cluster',
      endpoint: 'db.cluster.eu-west-1.internal',
      icon: Database,
      status: 'Operational',
      latency: '4.2ms',
      p99Latency: 'lag 0.02s',
      checkInterval: '5s ago',
      notes: 'Connection pool 34% utilization, cache hit ratio 99.8%',
      nodeDetails: 'Primary + 3 read replicas',
    },
    {
      id: 'srv-3',
      name: 'Authentication and security vault',
      endpoint: 'vault.security.mesh',
      icon: Shield,
      status: 'Operational',
      latency: '22ms',
      p99Latency: 'p95 28ms',
      checkInterval: '2s ago',
      notes: 'Token signature and verification active, zero lease errors',
      nodeDetails: 'KMS enclave, 6 pods',
    },
    {
      id: 'srv-4',
      name: 'Background workers and queue',
      endpoint: 'queue.workers.internal',
      icon: Layers,
      status: 'Operational',
      latency: '45ms',
      p99Latency: 'dispatch delay',
      checkInterval: '8s ago',
      notes: '48 worker pods active, backlog nominal at 142 tasks',
      nodeDetails: 'Task queue cluster',
    },
    {
      id: 'srv-5',
      name: 'Inference and routing engine',
      endpoint: 'inference.mesh.internal',
      icon: Cpu,
      status: 'Operational',
      latency: '310ms',
      p99Latency: 'TTFT avg',
      checkInterval: '4s ago',
      notes: 'Accelerator pods nominal, routing cache hit rate 89.2%',
      nodeDetails: '8 compute nodes, eu-west-1',
    },
    {
      id: 'srv-6',
      name: 'Storage and object engine',
      endpoint: 'storage.tier0.zuri.internal',
      icon: HardDrive,
      status: 'Operational',
      latency: '32ms',
      p99Latency: '48ms write',
      checkInterval: '10s ago',
      notes: 'Multi-region replica synced, hot NVMe cache clean',
      nodeDetails: 'Object storage',
    },
    {
      id: 'srv-7',
      name: 'Event notification dispatcher',
      endpoint: 'dispatch.events.zuri.internal',
      icon: Bell,
      status: 'Operational',
      latency: '58ms',
      p99Latency: 'dispatch',
      checkInterval: '6s ago',
      notes: 'Event delivery 100%, 0 failed retry dead-letters',
      nodeDetails: 'Event stream, 1.2k msg/s',
    },
    {
      id: 'srv-8',
      name: 'Document processing and OCR pipeline',
      endpoint: 'ocr.pipeline.internal',
      icon: FileText,
      status: 'Degraded',
      latency: '1,420ms',
      p99Latency: 'elevated',
      checkInterval: '1s ago',
      notes: 'Backpressure: multi-page syllabus OCR queue. Scaling +4 pods.',
      nodeDetails: 'OCR worker pool, CPU 79%',
      isDegraded: true,
    },
  ];

  const incidentsList: IncidentEvent[] = [
    {
      id: 'inc-1',
      level: 'Warning',
      title: 'Document processing queue exceeded 500 items',
      timestamp: '14:32 UTC',
      description: 'Auto-scaler policy triggered. +4 worker pods scheduled in eu-west-1.',
      status: 'Mitigating',
    },
    {
      id: 'inc-2',
      level: 'Notice',
      title: 'Database replica maintenance completed',
      timestamp: '12:15 UTC',
      description: 'Completed in 42 seconds. Zero query disruptions or replication delay surges.',
      status: 'Resolved',
    },
    {
      id: 'inc-3',
      level: 'Resolved',
      title: 'Transient latency spike on inference router',
      timestamp: '09:40 UTC',
      description: 'Impacted 0.01% of requests for 90s due to rollout recycling. Health probes rerouted immediately.',
      status: 'Closed',
    },
    {
      id: 'inc-4',
      level: 'Completed',
      title: 'Automated TLS wildcard certificate renewal',
      timestamp: 'Yesterday 18:22',
      description: 'Certificate renewal completed for internal API root ingress endpoints.',
      status: 'Completed',
    },
  ];

  const filteredServices = servicesData.filter((srv) => {
    if (filterMode === 'Healthy' && srv.status !== 'Operational') return false;
    if (filterMode === 'Degraded' && srv.status !== 'Degraded') return false;
    if (filterMode === 'Critical' && srv.status !== 'Critical') return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        srv.name.toLowerCase().includes(q) ||
        srv.endpoint.toLowerCase().includes(q) ||
        srv.nodeDetails.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const serviceColumns: Column<CoreServiceRecord>[] = [
    {
      header: 'Service and endpoint',
      isTitle: true,
      accessor: (row) => {
        const IconComponent = row.icon;
        return (
          <div className="flex items-start gap-2.5 py-1 min-w-[200px]">
            <div
              className={`p-1.5 rounded-sm mt-0.5 shrink-0 ${
                row.isDegraded
                  ? 'bg-ops-warn/15 text-ops-warn'
                  : 'bg-ops-panel-raised text-ops-text-muted'
              }`}
            >
              <IconComponent className="w-4 h-4" />
            </div>
            <div className="flex flex-col min-w-0">
              <span className="font-medium text-body-sm text-ops-text leading-snug">
                {row.name}
              </span>
              <span className="font-mono text-caption text-ops-text-muted truncate">
                {row.endpoint}
              </span>
            </div>
          </div>
        );
      },
    },
    {
      header: 'Status',
      isKeyField: true,
      accessor: (row) => (
        <span
          className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-caption font-medium select-none ${
            row.status === 'Degraded'
              ? 'bg-ops-warn/15 text-ops-warn'
              : row.status === 'Critical'
              ? 'bg-ops-crit/15 text-ops-crit'
              : 'bg-ops-ok/15 text-ops-ok'
          }`}
        >
          <span
            className={`w-1.5 h-1.5 rounded-full ${
              row.status === 'Degraded'
                ? 'bg-ops-warn animate-pulse'
                : row.status === 'Critical'
                ? 'bg-ops-crit'
                : 'bg-ops-ok'
            }`}
          />
          {row.status}
        </span>
      ),
    },
    {
      header: 'Latency',
      numeric: true,
      isKeyField: true,
      accessor: (row) => (
        <div className="flex flex-col items-end">
          <span
            className={`font-mono text-body-sm tabular-nums font-medium ${
              row.isDegraded ? 'text-ops-warn' : 'text-ops-text'
            }`}
          >
            {row.latency}
          </span>
          <span className="text-caption text-ops-text-muted font-mono tabular-nums">
            {row.p99Latency}
          </span>
        </div>
      ),
    },
    {
      header: 'Last sweep',
      accessor: (row) => (
        <span className="font-mono text-caption text-ops-text-muted tabular-nums">
          {row.checkInterval}
        </span>
      ),
    },
    {
      header: 'Diagnostic details',
      accessor: (row) => (
        <div className="text-caption text-ops-text-muted max-w-sm truncate">
          {row.notes}
        </div>
      ),
    },
    {
      header: 'Action',
      accessor: (row) => (
        <div className="flex items-center justify-end">
          {row.isDegraded ? (
            <button
              type="button"
              onClick={() => {
                setActionNotice(`Scaling command issued for ${row.name}. +4 worker pods dispatched.`);
                setTimeout(() => setActionNotice(null), 4000);
              }}
              className="px-2.5 py-1 rounded-sm text-caption font-semibold bg-ops-accent-strong text-ops-canvas hover:opacity-90 transition-opacity cursor-pointer"
            >
              Scale +4
            </button>
          ) : (
            <span className="text-caption text-ops-text-muted">Nominal</span>
          )}
        </div>
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
            <span>Health states</span>
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

      {/* Header section (Overview template: h1 Geist 600, one-line description, right-aligned action) */}
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-ops-border/60">
        <div className="flex flex-col">
          <h1 className="text-2xl font-semibold text-ops-text tracking-tight font-sans">
            System health
          </h1>
          <p className="text-body-sm text-ops-text-muted mt-1">
            Real-time telemetry, service latency, and cluster availability.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
          {/* Segmented timeframe filter */}
          <div className="flex items-center bg-ops-panel rounded-sm border border-ops-border p-0.5">
            {(['15m', '1h', '24h', '7d'] as const).map((tw) => (
              <button
                key={tw}
                type="button"
                onClick={() => setTimeframe(tw)}
                className={`px-2.5 py-1 rounded-xs text-caption cursor-pointer transition-colors ${
                  timeframe === tw
                    ? 'bg-ops-panel-raised text-ops-text font-semibold'
                    : 'text-ops-text-muted hover:text-ops-text'
                }`}
              >
                {tw}
              </button>
            ))}
          </div>

          {/* Primary Action Button (full-width below sm) */}
          <Button
            variant="primary"
            onClick={handleRunProbe}
            isLoading={isProbing}
            className="w-full sm:w-auto h-11 sm:h-10 text-body-sm"
          >
            <RefreshCw className={`w-4 h-4 mr-1.5 ${isProbing ? 'animate-spin' : ''}`} />
            Run health check
          </Button>
        </div>
      </header>

      {/* Action banner feedback */}
      {actionNotice && (
        <Alert
          variant="success"
          description={actionNotice}
        />
      )}

      {/* State: Error */}
      {harnessState === 'error' && (
        <Alert
          variant="error"
          title="Telemetry service connection failure"
          description="Unable to retrieve real-time cluster probe status. Verify gateway credentials and try again."
          action={<Button variant="secondary" onClick={() => setHarnessState('default')}>Try again</Button>}
        />
      )}

      {/* State: Loading */}
      {harnessState === 'loading' && (
        <div className="flex flex-col gap-6" aria-busy="true">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <Skeleton className="h-28 rounded-md bg-ops-panel" />
            <Skeleton className="h-28 rounded-md bg-ops-panel" />
            <Skeleton className="h-28 rounded-md bg-ops-panel" />
            <Skeleton className="h-28 rounded-md bg-ops-panel" />
          </div>
          <Skeleton className="h-72 rounded-md bg-ops-panel" />
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <Skeleton className="lg:col-span-7 h-64 rounded-md bg-ops-panel" />
            <Skeleton className="lg:col-span-5 h-64 rounded-md bg-ops-panel" />
          </div>
        </div>
      )}

      {/* State: Empty */}
      {harnessState === 'empty' && (
        <EmptyState
          icon={Activity}
          title="No monitored services found"
          description="There are currently no infrastructure probes configured for this cluster."
          action={
            <Button variant="secondary" onClick={() => setHarnessState('default')}>
              Reset to active probes
            </Button>
          }
        />
      )}

      {/* State: Default */}
      {harnessState === 'default' && (
        <>
          {/* Section: 4 Core KPIs (Overview template: 2-4 KPIs) */}
          <section
            aria-label="Key health metrics"
            className="grid grid-cols-2 lg:grid-cols-4 gap-4"
          >
            <KpiTile
              label="Overall status"
              value="Operational"
              delta={{ value: '99.98% 30d uptime', direction: 'up' }}
              icon={Activity}
              subtext="Zero active high-severity incidents"
              className="bg-ops-panel border-ops-border text-ops-text"
            />
            <KpiTile
              label="Monitored services"
              value="7 / 8"
              delta={{ value: '1 degraded', direction: 'neutral' }}
              icon={Server}
              subtext="Target availability: 99.99%"
              className="bg-ops-panel border-ops-border text-ops-text"
            />
            <KpiTile
              label="Median latency"
              value="22ms"
              delta={{ value: '+2ms nominal', direction: 'up' }}
              icon={Clock}
              subtext="P95 across internal endpoints"
              className="bg-ops-panel border-ops-border text-ops-text"
            />
            <KpiTile
              label="Active alerts"
              value="1 warning"
              delta={{ value: '0 critical', direction: 'neutral' }}
              icon={AlertTriangle}
              subtext="Document OCR worker queue"
              className="bg-ops-panel border-ops-border text-ops-text"
            />
          </section>

          {/* Section: Primary Monitored Services Table */}
          <section className="flex flex-col bg-ops-panel rounded-md border border-ops-border overflow-hidden">
            {/* Table controls toolbar */}
            <div className="p-4 border-b border-ops-border/60 flex flex-col md:flex-row md:items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-body-sm text-ops-text">
                  Monitored core services
                </span>
                <span className="px-2 py-0.5 rounded-full text-caption font-mono bg-ops-panel-raised text-ops-text-muted">
                  8 active probes
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                {/* Status filter pills */}
                <div className="flex items-center bg-ops-panel-raised rounded-sm p-0.5 text-caption border border-ops-border">
                  {(['All', 'Healthy', 'Degraded', 'Critical'] as const).map((mode) => (
                    <button
                      key={mode}
                      type="button"
                      onClick={() => setFilterMode(mode)}
                      className={`px-2.5 py-1 rounded-xs transition-colors cursor-pointer ${
                        filterMode === mode
                          ? 'bg-ops-accent-strong text-ops-canvas font-semibold'
                          : 'text-ops-text-muted hover:text-ops-text'
                      }`}
                    >
                      {mode}
                    </button>
                  ))}
                </div>

                {/* Search field */}
                <div className="relative flex items-center bg-ops-panel-raised px-2.5 py-1 rounded-sm border border-ops-border min-w-[200px]">
                  <Search className="w-3.5 h-3.5 text-ops-text-muted mr-1.5 shrink-0" aria-hidden="true" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Filter services..."
                    className="bg-transparent text-body-sm text-ops-text placeholder:text-ops-text-muted focus:outline-none w-full"
                  />
                </div>
              </div>
            </div>

            {/* Services DataTable */}
            <DataTable
              columns={serviceColumns}
              data={filteredServices}
              keyExtractor={(row) => row.id}
              emptyTitle="No matching services"
              emptyDescription="Try adjusting your filter query."
              className="border-0 rounded-none"
            />
          </section>

          {/* Section: Secondary Panel (Incidents Ledger & Subsystem Matrix) */}
          <section className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left 7 cols: Operational Ledger */}
            <div className="lg:col-span-7 flex flex-col bg-ops-panel rounded-md border border-ops-border p-4">
              <div className="flex items-center justify-between pb-3 border-b border-ops-border/60 mb-3">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-ops-accent" />
                  <span className="font-semibold text-body-sm text-ops-text">
                    Operational events and alerts
                  </span>
                </div>
                <Link
                  href="/ops/logs"
                  className="text-caption text-ops-accent hover:underline inline-flex items-center gap-1"
                >
                  <span>View audit logs</span>
                  <ArrowRight className="w-3 h-3" />
                </Link>
              </div>

              <div className="flex flex-col gap-2.5">
                {incidentsList.map((inc) => (
                  <div
                    key={inc.id}
                    className="p-3 rounded-sm bg-ops-panel-raised border border-ops-border/70 flex flex-col sm:flex-row sm:items-start justify-between gap-2"
                  >
                    <div className="flex items-start gap-2.5">
                      <span
                        className={`px-2 py-0.5 rounded-full text-caption font-medium shrink-0 mt-0.5 ${
                          inc.level === 'Warning'
                            ? 'bg-ops-warn/15 text-ops-warn'
                            : inc.level === 'Notice'
                            ? 'bg-ops-accent/15 text-ops-accent'
                            : 'bg-ops-ok/15 text-ops-ok'
                        }`}
                      >
                        {inc.level}
                      </span>
                      <div className="flex flex-col min-w-0">
                        <span className="text-body-sm font-medium text-ops-text leading-snug">
                          {inc.title}
                        </span>
                        <p className="text-caption text-ops-text-muted mt-0.5 leading-relaxed">
                          {inc.description}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between sm:flex-col sm:items-end gap-1 shrink-0 pt-1 sm:pt-0">
                      <span className="font-mono text-caption text-ops-text-muted tabular-nums">
                        {inc.timestamp}
                      </span>
                      <span className="text-caption text-ops-text-muted">
                        {inc.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right 5 cols: Subsystem Dependencies & Topology */}
            <div className="lg:col-span-5 flex flex-col gap-4">
              {/* Subsystem status */}
              <div className="bg-ops-panel rounded-md border border-ops-border p-4 flex flex-col">
                <div className="flex items-center justify-between pb-3 border-b border-ops-border/60 mb-3">
                  <span className="font-semibold text-body-sm text-ops-text">
                    Subsystem dependencies
                  </span>
                  <span className="text-caption text-ops-ok font-medium">5 / 5 nominal</span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-caption">
                  <div className="bg-ops-panel-raised p-2.5 rounded-sm border border-ops-border flex items-center justify-between">
                    <span className="text-ops-text">VPC mesh peering</span>
                    <span className="font-mono text-ops-text-muted">&lt;1ms</span>
                  </div>
                  <div className="bg-ops-panel-raised p-2.5 rounded-sm border border-ops-border flex items-center justify-between">
                    <span className="text-ops-text">Core DNS</span>
                    <span className="font-mono text-ops-text-muted">0.4ms</span>
                  </div>
                  <div className="bg-ops-panel-raised p-2.5 rounded-sm border border-ops-border flex items-center justify-between">
                    <span className="text-ops-text">Edge CDN routing</span>
                    <span className="font-mono text-ops-text-muted">12ms</span>
                  </div>
                  <div className="bg-ops-panel-raised p-2.5 rounded-sm border border-ops-border flex items-center justify-between">
                    <span className="text-ops-text">Token and session cache</span>
                    <span className="font-mono text-ops-text-muted">1.1ms</span>
                  </div>
                  <div className="col-span-2 bg-ops-panel-raised p-2.5 rounded-sm border border-ops-border flex items-center justify-between">
                    <span className="text-ops-text">TLS certificate enclave</span>
                    <span className="text-ops-ok font-medium">Valid (84d remaining)</span>
                  </div>
                </div>
              </div>

              {/* Topology & SLA budget */}
              <div className="bg-ops-panel rounded-md border border-ops-border p-4 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-semibold text-body-sm text-ops-text">
                      Node topology and SLA
                    </span>
                    <span className="font-mono text-caption text-ops-text-muted">
                      24 nodes active
                    </span>
                  </div>
                  <p className="text-caption text-ops-text-muted">
                    Active cluster replicas across primary and standby availability zones.
                  </p>

                  <div className="mt-3">
                    <div className="flex items-center justify-between text-caption mb-1">
                      <span className="text-ops-text-muted">30-day SLA budget remaining</span>
                      <span className="font-mono text-ops-ok font-semibold">99.988%</span>
                    </div>
                    <div className="w-full bg-ops-panel-raised h-2 rounded-full overflow-hidden flex border border-ops-border">
                      <div className="bg-ops-ok h-full rounded-full w-[99.2%]" />
                      <div className="bg-ops-warn h-full rounded-full w-[0.8%]" />
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-3 mt-3 border-t border-ops-border/60 text-caption text-ops-text-muted">
                  <span>Burn rate: 0.04x (Safe)</span>
                  <span>SLO threshold: 99.95%</span>
                </div>
              </div>
            </div>
          </section>
        </>
      )}
    </div>
  );
}

export default function OpsHealthPage() {
  return (
    <Suspense fallback={<div className="p-8 text-caption text-ops-text-muted">Loading health telemetry...</div>}>
      <OpsHealthContent />
    </Suspense>
  );
}
