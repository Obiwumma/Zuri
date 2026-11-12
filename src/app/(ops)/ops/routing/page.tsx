'use client';

import React, { useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import {
  Split,
  Search,
  Filter,
  SlidersHorizontal,
  RefreshCw,
  Copy,
  Check,
  CheckCircle2,
  Clock,
  Layers,
  ArrowRight,
  X,
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import {
  DataTable,
  Column,
  Button,
  Badge,
  Alert,
  Skeleton,
  EmptyState,
  Card,
} from '@/components/ui';

export type RoutingPageState = 'default' | 'loading' | 'empty' | 'error';

interface AlternativeEval {
  label: string;
  val: string;
  isSelected?: boolean;
}

interface WaterfallStep {
  label: string;
  val: string;
  pct: string;
  color: string;
}

interface DecisionRecord {
  id: string;
  reqId: string;
  time: string;
  classification: string;
  tier: string;
  tierLevel: 'T0' | 'T1' | 'T2' | 'T3' | 'T4';
  model: string;
  reason: string;
  status: 'Cache hit' | 'Dispatched' | 'Fallback';
  statusCode: string;
  latency: string;
  origin: string;
  studentHash: string;
  prompt: string;
  tokens: string;
  naiveCost: string;
  billedCost: string;
  confScore: string;
  dispatchedNode: string;
  matchMetric: string;
  policyDirective: string;
  traceId: string;
  ingressNode: string;
  cacheKey: string;
  alternatives: AlternativeEval[];
  waterfall: WaterfallStep[];
}

function OpsRoutingContent() {
  const searchParams = useSearchParams();
  const showHarness = process.env.NODE_ENV !== 'production' && searchParams.get('states') === '1';

  const [harnessState, setHarnessState] = useState<RoutingPageState>('default');
  const [searchQuery, setSearchQuery] = useState('');
  const [tierFilter, setTierFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [selectedTrace, setSelectedTrace] = useState<DecisionRecord | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [page, setPage] = useState(1);

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard?.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const decisionDataset: DecisionRecord[] = [
    {
      id: 'req_9c14a82e',
      reqId: 'req_9c14a82e',
      time: '15:29:12 UTC',
      classification: 'Syllabus policy lookup',
      tier: 'Tier 1 Semantic cache',
      tierLevel: 'T1',
      model: 'Vector cache (cos 0.984)',
      reason: 'Ingress embedding matched syllabus node with 0.984 semantic similarity. Bypassed frontier inference.',
      status: 'Cache hit',
      statusCode: '200 Intercepted',
      latency: '15.4ms',
      origin: 'CS-204 Algorithmic Complexity',
      studentHash: 'usr_anon_49c2a',
      prompt: 'What is the late submission penalty policy for Problem Set 3 according to the syllabus?',
      tokens: '28 tokens',
      naiveCost: '$0.00084',
      billedCost: '$0.00000 (Free)',
      confScore: '0.992',
      dispatchedNode: 'Vector cache cluster (eu-west-1b)',
      matchMetric: 'Cosine similarity: 0.984 (Threshold >= 0.960)',
      policyDirective: 'POLICY_LEAST_COST_QUALITY_SUFFICIENT',
      traceId: 'trace_8fa90b41e3d09a2',
      ingressNode: 'edge-09.ingress.zuri.internal',
      cacheKey: 'sha256:7c91e4a8b012...',
      alternatives: [
        { label: 'Tier 0 Rule cache', val: 'Miss (query phrasing varied)' },
        { label: 'Tier 1 Semantic cache', val: 'Hit (0.984 >= 0.960) — Selected', isSelected: true },
        { label: 'Tier 2 Local accelerator', val: 'Bypassed (T1 cache satisfied)' },
        { label: 'Tier 3 Frontier cloud', val: 'Bypassed (saved $0.00084)' },
      ],
      waterfall: [
        { label: 'Ingress Envoy gateway', val: '1.1ms', pct: '7%', color: 'var(--ops-border-strong)' },
        { label: 'Embedding & classification', val: '4.2ms', pct: '27%', color: 'var(--ops-accent)' },
        { label: 'Vector cache lookup', val: '8.7ms', pct: '56%', color: 'var(--ops-ok)' },
        { label: 'Egress serialization', val: '1.4ms', pct: '9%', color: 'var(--ops-border-strong)' },
      ],
    },
    {
      id: 'req_4b77f102',
      reqId: 'req_4b77f102',
      time: '15:28:58 UTC',
      classification: 'Office hours directory',
      tier: 'Tier 0 Deterministic rule',
      tierLevel: 'T0',
      model: 'Rule index (zero compute)',
      reason: 'Exact query hash matched syllabus index in memory. Zero GPU or frontier tokens invoked.',
      status: 'Cache hit',
      statusCode: '200 Exact Rule Match',
      latency: '1.8ms',
      origin: 'PHY-101 Classical Mechanics',
      studentHash: 'usr_anon_88d31',
      prompt: 'Where are Dr. Meyer’s office hours located on Thursdays?',
      tokens: '14 tokens',
      naiveCost: '$0.00042',
      billedCost: '$0.00000 (Free)',
      confScore: '1.000',
      dispatchedNode: 'Memory fabric (node-01)',
      matchMetric: 'Exact hash match (1.000)',
      policyDirective: 'POLICY_DETERMINISTIC_CACHE_FIRST',
      traceId: 'trace_11ab7284f09d3',
      ingressNode: 'edge-02.ingress.zuri.internal',
      cacheKey: 'sha256:39bf2049d91a...',
      alternatives: [
        { label: 'Tier 0 Rule cache', val: 'Exact match (1.000) — Selected', isSelected: true },
        { label: 'Tier 1 Semantic cache', val: 'Bypassed' },
        { label: 'Tier 2 Local accelerator', val: 'Bypassed' },
        { label: 'Tier 3 Frontier cloud', val: 'Bypassed (saved $0.00042)' },
      ],
      waterfall: [
        { label: 'Ingress Envoy gateway', val: '0.8ms', pct: '44%', color: 'var(--ops-border-strong)' },
        { label: 'Memory hash query', val: '0.6ms', pct: '33%', color: 'var(--ops-ok)' },
        { label: 'Payload serialization', val: '0.4ms', pct: '23%', color: 'var(--ops-border-strong)' },
      ],
    },
    {
      id: 'req_2e88a319',
      reqId: 'req_2e88a319',
      time: '15:28:41 UTC',
      classification: 'Rubric evaluation',
      tier: 'Tier 2 Local accelerator',
      tierLevel: 'T2',
      model: 'Triton Mistral 7B',
      reason: 'Distilled 7B confidence score 0.942 met rubric floor. Evaluated on local compute without cloud egress.',
      status: 'Dispatched',
      statusCode: '200 Dispatched',
      latency: '112ms',
      origin: 'CS-106A Code in Place',
      studentHash: 'usr_anon_22ef0',
      prompt: 'Evaluate my Python binary search implementation against the time complexity rubric.',
      tokens: '340 tokens',
      naiveCost: '$0.00410',
      billedCost: '$0.00012 (Local GPU)',
      confScore: '0.942',
      dispatchedNode: 'Worker pool 14 (H100)',
      matchMetric: 'Confidence: 0.942 >= Floor (0.90)',
      policyDirective: 'POLICY_EDGE_DISTILLED_PREFERENTIAL',
      traceId: 'trace_9934fc0284e6a',
      ingressNode: 'edge-04.ingress.zuri.internal',
      cacheKey: 'sha256:e3119ac0340b...',
      alternatives: [
        { label: 'Tier 0 Rule cache', val: 'Miss (dynamic code input)' },
        { label: 'Tier 1 Semantic cache', val: 'Miss (unique student code)' },
        { label: 'Tier 2 Local accelerator', val: 'Satisfied (score 0.942) — Selected', isSelected: true },
        { label: 'Tier 3 Frontier cloud', val: 'Bypassed (saved $0.00398)' },
      ],
      waterfall: [
        { label: 'Ingress Envoy gateway', val: '1.2ms', pct: '2%', color: 'var(--ops-border-strong)' },
        { label: 'Intent classifier', val: '4.1ms', pct: '4%', color: 'var(--ops-accent)' },
        { label: 'Local model inference', val: '102.5ms', pct: '91%', color: '#60a5fa' },
        { label: 'Stream egress assembly', val: '4.2ms', pct: '3%', color: 'var(--ops-border-strong)' },
      ],
    },
    {
      id: 'req_8d11c055',
      reqId: 'req_8d11c055',
      time: '15:27:19 UTC',
      classification: 'Multi-document synthesis',
      tier: 'Tier 4 Frontier fallback',
      tierLevel: 'T4',
      model: 'GPT-4o (Fallback)',
      reason: 'Primary frontier tier rate limit 429 threshold reached. Dispatched transparently to standby secondary pool.',
      status: 'Fallback',
      statusCode: 'Fallback rerouted (429)',
      latency: '1,380ms',
      origin: 'EECS-189 Machine Learning',
      studentHash: 'usr_anon_67bb1',
      prompt: 'Synthesize the cross-lecture derivation between SVM dual formulation and the Kernel Trick.',
      tokens: '1,240 tokens',
      naiveCost: '$0.02480',
      billedCost: '$0.02610 (Fallback API)',
      confScore: '0.988',
      dispatchedNode: 'Failover cluster (us-east-1)',
      matchMetric: 'Target: Primary cloud -> Failed (HTTP 429)',
      policyDirective: 'POLICY_HIGH_AVAILABILITY_FALLBACK',
      traceId: 'trace_33bb90214a601',
      ingressNode: 'edge-01.ingress.zuri.internal',
      cacheKey: 'sha256:88fa2b1009...',
      alternatives: [
        { label: 'Tier 0 Rule cache', val: 'Miss (complex multi-doc synthesis)' },
        { label: 'Tier 1 Semantic cache', val: 'Miss' },
        { label: 'Tier 2 Local accelerator', val: 'Capacity exceeded' },
        { label: 'Tier 3 Primary cloud', val: 'Failed (HTTP 429 rate limit)' },
        { label: 'Tier 4 Standby cloud', val: 'Dispatched — Selected', isSelected: true },
      ],
      waterfall: [
        { label: 'Ingress Envoy gateway', val: '2.1ms', pct: '1%', color: 'var(--ops-border-strong)' },
        { label: 'Embedding & multi-doc retrieval', val: '124.0ms', pct: '9%', color: 'var(--ops-accent)' },
        { label: 'Primary cloud attempt (429)', val: '180.0ms', pct: '13%', color: 'var(--ops-warn)' },
        { label: 'Failover cloud inference', val: '1,060.0ms', pct: '76%', color: 'var(--ops-crit)' },
        { label: 'Egress verification', val: '13.9ms', pct: '1%', color: 'var(--ops-border-strong)' },
      ],
    },
  ];

  const filteredDecisions = decisionDataset.filter((item) => {
    if (tierFilter !== 'ALL' && !item.tierLevel.includes(tierFilter)) return false;
    if (statusFilter !== 'ALL' && item.status !== statusFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        item.reqId.toLowerCase().includes(q) ||
        item.prompt.toLowerCase().includes(q) ||
        item.classification.toLowerCase().includes(q) ||
        item.origin.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const columns: Column<DecisionRecord>[] = [
    {
      header: 'Request ID and time',
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
            {row.time}
          </span>
        </div>
      ),
    },
    {
      header: 'Intent classification',
      accessor: (row) => (
        <div className="flex flex-col max-w-xs">
          <span className="font-medium text-body-sm text-ops-text">
            {row.classification}
          </span>
          <p className="text-caption text-ops-text-muted truncate">
            {row.prompt}
          </p>
        </div>
      ),
    },
    {
      header: 'Assigned tier',
      isKeyField: true,
      accessor: (row) => (
        <span
          className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-caption font-medium select-none ${
            row.tierLevel === 'T0' || row.tierLevel === 'T1'
              ? 'bg-ops-ok/15 text-ops-ok'
              : row.tierLevel === 'T2'
              ? 'bg-[#60a5fa]/15 text-[#60a5fa]'
              : 'bg-ops-warn/15 text-ops-warn'
          }`}
        >
          <span
            className={`w-1.5 h-1.5 rounded-full ${
              row.tierLevel === 'T0' || row.tierLevel === 'T1'
                ? 'bg-ops-ok'
                : row.tierLevel === 'T2'
                ? 'bg-[#60a5fa]'
                : 'bg-ops-warn'
            }`}
          />
          {row.tier}
        </span>
      ),
    },
    {
      header: 'Dispatched engine',
      accessor: (row) => (
        <span className="font-mono text-caption text-ops-text-muted">
          {row.model}
        </span>
      ),
    },
    {
      header: 'Latency',
      numeric: true,
      isKeyField: true,
      accessor: (row) => (
        <div className="flex flex-col items-end">
          <span className="font-mono text-body-sm text-ops-text tabular-nums font-medium">
            {row.latency}
          </span>
          <span className="text-caption text-ops-ok font-mono tabular-nums">
            {row.billedCost}
          </span>
        </div>
      ),
    },
    {
      header: 'Status',
      accessor: (row) => (
        <span
          className={`px-2 py-0.5 rounded-full text-caption font-medium select-none ${
            row.status === 'Cache hit'
              ? 'bg-ops-ok/15 text-ops-ok'
              : row.status === 'Fallback'
              ? 'bg-ops-warn/15 text-ops-warn'
              : 'bg-ops-panel-raised text-ops-text'
          }`}
        >
          {row.status}
        </span>
      ),
    },
    {
      header: 'Action',
      accessor: (row) => (
        <button
          type="button"
          onClick={() => setSelectedTrace(row)}
          className="px-2.5 py-1 rounded-sm text-caption font-medium text-ops-accent hover:bg-ops-panel-raised transition-colors cursor-pointer"
        >
          Inspect trace
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
            <span>Routing states</span>
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

      {/* Header section (List template: h1 Geist 600, one-line description, right action) */}
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-ops-border/60">
        <div className="flex flex-col">
          <h1 className="text-2xl font-semibold text-ops-text tracking-tight font-sans">
            Routing decision log
          </h1>
          <p className="text-body-sm text-ops-text-muted mt-1">
            Real-time inference dispatch trace and tier arbitration records.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="secondary"
            onClick={() => {
              setIsRefreshing(true);
              setTimeout(() => setIsRefreshing(false), 500);
            }}
            isLoading={isRefreshing}
            className="w-full sm:w-auto h-11 sm:h-10 text-body-sm"
          >
            <RefreshCw className={`w-4 h-4 mr-1.5 ${isRefreshing ? 'animate-spin' : ''}`} />
            Live sweep
          </Button>
        </div>
      </header>

      {/* State: Error */}
      {harnessState === 'error' && (
        <Alert
          variant="error"
          title="Trace stream disconnected"
          description="The routing decision stream is unavailable. Check the connection and try again."
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
          icon={Split}
          title="No routing records found"
          description="No recent decisions matched your current filters."
          action={
            <Button
              variant="secondary"
              onClick={() => {
                setSearchQuery('');
                setTierFilter('ALL');
                setStatusFilter('ALL');
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
                  placeholder="Filter by Req ID, prompt, intent..."
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

              {/* Tier Filter */}
              <select
                value={tierFilter}
                onChange={(e) => setTierFilter(e.target.value)}
                className="bg-ops-panel-raised text-body-sm text-ops-text px-3 py-1.5 rounded-sm border border-ops-border focus:outline-none cursor-pointer"
              >
                <option value="ALL">All tiers</option>
                <option value="T0">Tier 0 Deterministic</option>
                <option value="T1">Tier 1 Semantic cache</option>
                <option value="T2">Tier 2 Local accelerator</option>
                <option value="T4">Tier 4 Frontier cloud</option>
              </select>

              {/* Status Filter */}
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="bg-ops-panel-raised text-body-sm text-ops-text px-3 py-1.5 rounded-sm border border-ops-border focus:outline-none cursor-pointer"
              >
                <option value="ALL">All statuses</option>
                <option value="Cache hit">Cache hit</option>
                <option value="Dispatched">Dispatched</option>
                <option value="Fallback">Fallback</option>
              </select>
            </div>

            <span className="font-mono text-caption text-ops-text-muted">
              {filteredDecisions.length} records
            </span>
          </section>

          {/* Main List Table */}
          <section className="bg-ops-panel rounded-md border border-ops-border overflow-hidden">
            <DataTable
              columns={columns}
              data={filteredDecisions}
              keyExtractor={(row) => row.id}
              onRowClick={(row) => setSelectedTrace(row)}
              className="border-0 rounded-none cursor-pointer"
            />

            {/* Pagination Controls (List template requirement) */}
            <div className="p-3.5 border-t border-ops-border/60 flex items-center justify-between text-caption text-ops-text-muted">
              <span>Showing 1 to {filteredDecisions.length} of {filteredDecisions.length} entries</span>
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

          {/* Trace Detail Inspection Slide-over / Modal */}
          {selectedTrace && (
            <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
              <div
                className="w-full max-w-2xl bg-ops-panel border border-ops-border rounded-md shadow-2xl p-5 max-h-[90vh] overflow-y-auto flex flex-col gap-4 text-ops-text"
                role="dialog"
                aria-modal="true"
                aria-labelledby="trace-dialog-title"
              >
                {/* Modal Header */}
                <div className="flex items-start justify-between pb-3 border-b border-ops-border/60">
                  <div className="flex flex-col">
                    <div className="flex items-center gap-2">
                      <h2 id="trace-dialog-title" className="text-body-sm font-semibold text-ops-text">
                        Trace inspection: {selectedTrace.reqId}
                      </h2>
                      <span className="font-mono text-caption text-ops-text-muted">
                        {selectedTrace.time}
                      </span>
                    </div>
                    <span className="font-mono text-caption text-ops-accent">
                      {selectedTrace.traceId} • {selectedTrace.ingressNode}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setSelectedTrace(null)}
                    className="p-1 rounded-xs hover:bg-ops-panel-raised text-ops-text-muted hover:text-ops-text"
                    aria-label="Close trace inspection"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Prompt context */}
                <div className="p-3 rounded-sm bg-ops-panel-raised border border-ops-border/60 flex flex-col gap-1">
                  <span className="text-caption text-ops-text-muted">Original request prompt</span>
                  <p className="text-body-sm text-ops-text font-serif italic">
                    “{selectedTrace.prompt}”
                  </p>
                  <div className="flex items-center gap-4 text-caption text-ops-text-muted pt-1">
                    <span>Course: {selectedTrace.origin}</span>
                    <span>Tokens: {selectedTrace.tokens}</span>
                    <span>Billed: {selectedTrace.billedCost}</span>
                  </div>
                </div>

                {/* Waterfall latencies */}
                <div className="flex flex-col gap-2">
                  <span className="text-caption font-semibold text-ops-text">
                    Latency breakdown ({selectedTrace.latency} total)
                  </span>
                  <div className="w-full h-3 rounded-full bg-ops-panel-raised overflow-hidden flex border border-ops-border">
                    {selectedTrace.waterfall.map((step, idx) => (
                      <div
                        key={idx}
                        style={{ width: step.pct, backgroundColor: step.color }}
                        className="h-full"
                        title={`${step.label}: ${step.val}`}
                      />
                    ))}
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 font-mono text-caption">
                    {selectedTrace.waterfall.map((step, idx) => (
                      <div key={idx} className="flex flex-col">
                        <span className="text-ops-text-muted truncate">{step.label}</span>
                        <span className="text-ops-text font-semibold">{step.val}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Evaluated alternatives */}
                <div className="flex flex-col gap-2">
                  <span className="text-caption font-semibold text-ops-text">
                    Tier arbitration and alternatives evaluated
                  </span>
                  <div className="rounded-sm border border-ops-border overflow-hidden divide-y divide-ops-border/60">
                    {selectedTrace.alternatives.map((alt, idx) => (
                      <div
                        key={idx}
                        className={`p-2.5 flex items-center justify-between text-caption ${
                          alt.isSelected ? 'bg-ops-accent/10 font-medium' : 'bg-ops-panel-raised'
                        }`}
                      >
                        <span className={alt.isSelected ? 'text-ops-accent' : 'text-ops-text-muted'}>
                          {alt.label}
                        </span>
                        <span className={`font-mono ${alt.isSelected ? 'text-ops-ok font-semibold' : 'text-ops-text-muted'}`}>
                          {alt.val}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Policy & reasoning */}
                <div className="p-3 rounded-sm bg-ops-panel-raised border border-ops-border flex flex-col gap-1">
                  <div className="flex items-center justify-between text-caption">
                    <span className="text-ops-text-muted">Policy directive:</span>
                    <span className="font-mono text-ops-accent font-semibold">{selectedTrace.policyDirective}</span>
                  </div>
                  <p className="text-caption text-ops-text-muted mt-1 leading-relaxed">
                    {selectedTrace.reason}
                  </p>
                  <div className="text-caption text-ops-ok pt-1 font-mono">
                    {selectedTrace.matchMetric}
                  </div>
                </div>

                {/* Footer action */}
                <div className="flex justify-end pt-2">
                  <Button
                    variant="secondary"
                    onClick={() => setSelectedTrace(null)}
                  >
                    Close inspection
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

export default function OpsRoutingPage() {
  return (
    <Suspense fallback={<div className="p-8 text-caption text-ops-text-muted">Loading routing log...</div>}>
      <OpsRoutingContent />
    </Suspense>
  );
}
