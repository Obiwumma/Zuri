'use client';

import React, { useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import {
  Coins,
  SlidersHorizontal,
  CheckCircle2,
  RefreshCw,
  Download,
} from 'lucide-react';
import {
  CollapsibleKpiTile,
  DataTable,
  Column,
  Button,
  Badge,
  Alert,
  Skeleton,
  EmptyState,
} from '@/components/ui';

export type AiCostPageState = 'default' | 'loading' | 'empty' | 'error';

interface ProviderEconomicsRecord {
  id: string;
  provider: string;
  models: string;
  reqVol: string;
  inputTokens: string;
  outputTokens: string;
  grossSpend: string;
  errorRate: string;
  avgTTFT: string;
  status: 'Healthy' | 'Optimal' | 'Elevated';
  isOptimal?: boolean;
  isElevated?: boolean;
}

interface ResilienceEvent {
  id: string;
  badge: string;
  level: 'Notice' | 'Warning' | 'Optimal';
  timestamp: string;
  message: string;
  detail: string;
}

function OpsAiCostContent() {
  const searchParams = useSearchParams();
  const showHarness = process.env.NODE_ENV !== 'production' && searchParams.get('states') === '1';

  const [harnessState, setHarnessState] = useState<AiCostPageState>('default');
  const [timeRange, setTimeRange] = useState<'1h' | '6h' | '24h' | '7d' | '30d'>('24h');
  const [resolution, setResolution] = useState<'1m' | '5m' | '1h'>('5m');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setIsRefreshing(false);
      setToastMessage('Cost metrics and ledger updated from telemetry cluster.');
      setTimeout(() => setToastMessage(null), 4000);
    }, 600);
  };

  const providerData: ProviderEconomicsRecord[] = [
    {
      id: 'prov-1',
      provider: 'Anthropic cluster pool',
      models: 'Claude 3.5 Sonnet & Haiku',
      reqVol: '182,410',
      inputTokens: '412M',
      outputTokens: '58M',
      grossSpend: '$238.50',
      errorRate: '0.02%',
      avgTTFT: '320ms',
      status: 'Healthy',
    },
    {
      id: 'prov-2',
      provider: 'OpenAI cluster pool',
      models: 'GPT-4o, 4o-mini & Embeddings',
      reqVol: '148,200',
      inputTokens: '284M',
      outputTokens: '41M',
      grossSpend: '$118.20',
      errorRate: '0.01%',
      avgTTFT: '290ms',
      status: 'Healthy',
    },
    {
      id: 'prov-3',
      provider: 'Internal Triton cluster',
      models: 'Mistral 7B / DeepSeek v3 (H100)',
      reqVol: '368,000',
      inputTokens: '192 GPU-hrs',
      outputTokens: '—',
      grossSpend: '$42.10',
      errorRate: '0.00%',
      avgTTFT: '85ms',
      status: 'Optimal',
      isOptimal: true,
    },
    {
      id: 'prov-4',
      provider: 'Document OCR engine',
      models: 'PaddleOCR / Tesseract worker node',
      reqVol: '24,100',
      inputTokens: '89.4k pages',
      outputTokens: '—',
      grossSpend: '$19.40',
      errorRate: '0.18%',
      avgTTFT: '840ms',
      status: 'Elevated',
      isElevated: true,
    },
  ];

  const providerColumns: Column<ProviderEconomicsRecord>[] = [
    {
      header: 'Provider and models',
      isTitle: true,
      accessor: (row) => (
        <div className="flex flex-col py-0.5">
          <span className="font-medium text-body-sm text-ops-text leading-snug">
            {row.provider}
          </span>
          <span className="text-caption text-ops-text-muted">
            {row.models}
          </span>
        </div>
      ),
    },
    {
      header: 'Request volume',
      numeric: true,
      isKeyField: true,
      accessor: (row) => (
        <span className="font-mono text-body-sm text-ops-text tabular-nums">
          {row.reqVol}
        </span>
      ),
    },
    {
      header: 'Input volume',
      numeric: true,
      accessor: (row) => (
        <span className="font-mono text-caption text-ops-text-muted tabular-nums">
          {row.inputTokens}
        </span>
      ),
    },
    {
      header: 'Output tokens',
      numeric: true,
      accessor: (row) => (
        <span className="font-mono text-caption text-ops-text-muted tabular-nums">
          {row.outputTokens}
        </span>
      ),
    },
    {
      header: 'Gross spend',
      numeric: true,
      isKeyField: true,
      accessor: (row) => (
        <span
          className={`font-mono text-body-sm tabular-nums font-semibold ${
            row.isOptimal ? 'text-ops-accent' : 'text-ops-text'
          }`}
        >
          {row.grossSpend}
        </span>
      ),
    },
    {
      header: 'Fallback / error',
      numeric: true,
      accessor: (row) => (
        <span
          className={`font-mono text-caption tabular-nums ${
            row.isElevated ? 'text-ops-warn font-medium' : 'text-ops-text-muted'
          }`}
        >
          {row.errorRate}
        </span>
      ),
    },
    {
      header: 'Median TTFT',
      numeric: true,
      accessor: (row) => (
        <span
          className={`font-mono text-caption tabular-nums ${
            row.isOptimal ? 'text-ops-accent font-medium' : 'text-ops-text-muted'
          }`}
        >
          {row.avgTTFT}
        </span>
      ),
    },
    {
      header: 'Status',
      accessor: (row) => (
        <span
          className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-caption font-medium select-none ${
            row.status === 'Optimal'
              ? 'bg-ops-ok/15 text-ops-ok'
              : row.status === 'Elevated'
              ? 'bg-ops-warn/15 text-ops-warn'
              : 'bg-ops-panel-raised text-ops-text'
          }`}
        >
          <span
            className={`w-1.5 h-1.5 rounded-full ${
              row.status === 'Optimal'
                ? 'bg-ops-ok'
                : row.status === 'Elevated'
                ? 'bg-ops-warn'
                : 'bg-ops-accent'
            }`}
          />
          {row.status}
        </span>
      ),
    },
  ];

  const resilienceEvents: ResilienceEvent[] = [
    {
      id: 'res-1',
      badge: 'Reroute resolved',
      level: 'Notice',
      timestamp: '14m ago',
      message: 'Frontier tier rate limit 429 threshold reached. Dispatched 342 requests to standby secondary pool.',
      detail: 'Reaction time: 1.4s, zero end-user error responses.',
    },
    {
      id: 'res-2',
      badge: 'Spillover',
      level: 'Optimal',
      timestamp: '1h 22m ago',
      message: 'Worker accelerator VRAM exceeded 85%. Dynamic spillover to Tier 2 local pool.',
      detail: '128 queries redirected, cluster load equalized.',
    },
    {
      id: 'res-3',
      badge: 'Cache sweep',
      level: 'Optimal',
      timestamp: '3h 45m ago',
      message: 'Semantic embedding cache sweep completed. 4.2GB warm entries indexed into memory fabric.',
      detail: 'Hit recovery latency: 120ms.',
    },
    {
      id: 'res-4',
      badge: 'Circuit breaker',
      level: 'Warning',
      timestamp: '6h 12m ago',
      message: 'Circuit breaker probe returned 503 on auxiliary audio API. Disabled voice transcription route.',
      detail: 'Automatically recovered after 4 consecutive healthy probes.',
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
            <span>AI cost states</span>
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

      {/* Header section (Analytics template: header + date-range filter) */}
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-ops-border/60">
        <div className="flex flex-col">
          <h1 className="text-2xl font-semibold text-ops-text tracking-tight font-sans">
            AI cost and requests
          </h1>
          <p className="text-body-sm text-ops-text-muted mt-1">
            Cluster routing efficiency, semantic cache savings, and inference spend.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
          {/* Date-range segmented switch */}
          <div className="flex items-center bg-ops-panel rounded-sm border border-ops-border p-0.5">
            {(['1h', '6h', '24h', '7d', '30d'] as const).map((tr) => (
              <button
                key={tr}
                type="button"
                onClick={() => setTimeRange(tr)}
                className={`px-2.5 py-1 rounded-xs text-caption cursor-pointer transition-colors ${
                  timeRange === tr
                    ? 'bg-ops-panel-raised text-ops-text font-semibold'
                    : 'text-ops-text-muted hover:text-ops-text'
                }`}
              >
                {tr}
              </button>
            ))}
          </div>

          {/* Refresh action */}
          <Button
            variant="secondary"
            onClick={handleRefresh}
            isLoading={isRefreshing}
            className="w-full sm:w-auto h-11 sm:h-10 text-body-sm"
          >
            <RefreshCw className={`w-4 h-4 mr-1.5 ${isRefreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </header>

      {/* Toast Notification */}
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
          title="Failed to retrieve AI telemetry"
          description="Unable to fetch provider token billing and routing logs. Please check cluster mesh status and retry."
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
          <Skeleton className="h-64 rounded-md bg-ops-panel" />
        </div>
      )}

      {/* State: Empty */}
      {harnessState === 'empty' && (
        <EmptyState
          icon={Coins}
          title="No request telemetry recorded"
          description="There are no AI invocation or token billing records matching this time window."
          action={
            <Button variant="secondary" onClick={() => setHarnessState('default')}>
              Reset to active window
            </Button>
          }
        />
      )}

      {/* State: Default */}
      {harnessState === 'default' && (
        <>
          {/* Section: 4 KPI Tiles */}
          <section
            aria-label="Cost and request KPIs"
            className="grid grid-cols-2 lg:grid-cols-4 gap-4 items-start"
          >
            <CollapsibleKpiTile
              label="Today's request ingress"
              value="1,642,890"
              delta={{ value: '2,380 req/s live', direction: 'up' }}
              subtext="Throughput peak: 3,140 req/s"
              className="bg-ops-panel border-ops-border text-ops-text"
              persistKey="ops.cost.1"
            />
            <CollapsibleKpiTile
              label="Cache interception rate"
              value="68.4%"
              delta={{ value: '+4.2% vs target', direction: 'up' }}
              subtext="1,031,735 frontier LLM calls bypassed"
              className="bg-ops-panel border-ops-border text-ops-text"
              persistKey="ops.cost.2"
            />
            <CollapsibleKpiTile
              label="Gross spend (24h)"
              value="$418.20"
              delta={{ value: '-$1,842 saved', direction: 'up' }}
              subtext="Estimated month: $12,850"
              className="bg-ops-panel border-ops-border text-ops-text"
              persistKey="ops.cost.3"
            />
            <CollapsibleKpiTile
              label="Provider fallback rate"
              value="0.04%"
              delta={{ value: '674 reroutes', direction: 'neutral' }}
              subtext="Zero user-facing 5xx disruptions"
              className="bg-ops-panel border-ops-border text-ops-text"
              persistKey="ops.cost.4"
            />
          </section>

          {/* Section: 1 Headline Chart (Analytics template: 1 headline chart) */}
          <section className="bg-ops-panel rounded-md border border-ops-border p-5 flex flex-col gap-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h2 className="text-body-sm font-semibold text-ops-text">
                  Tiered routing volume and interception distribution
                </h2>
                <p className="text-caption text-ops-text-muted mt-0.5">
                  Hourly request distribution across deterministic rules, semantic cache, and frontier inference.
                </p>
              </div>

              {/* Chart Legend */}
              <div className="flex flex-wrap items-center gap-3 text-caption">
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-xs bg-ops-accent" />
                  <span className="text-ops-text-muted">Tier 0 Deterministic (38%)</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-xs bg-ops-ok" />
                  <span className="text-ops-text-muted">Tier 1 Semantic cache (30%)</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-xs bg-[#60a5fa]" />
                  <span className="text-ops-text-muted">Tier 2 Local accelerator (22%)</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-xs bg-ops-warn" />
                  <span className="text-ops-text-muted">Tier 3 Frontier cloud (10%)</span>
                </div>
              </div>
            </div>

            {/* SVG Stacked Bar Chart */}
            <div className="w-full h-48 sm:h-56 relative flex items-end pt-6">
              <svg
                className="w-full h-full overflow-visible"
                viewBox="0 0 800 160"
                preserveAspectRatio="none"
                aria-label="Hourly stacked routing volume graph"
              >
                {/* Horizontal reference grid lines */}
                <line x1="0" y1="0" x2="800" y2="0" stroke="var(--ops-border)" strokeWidth="1" strokeDasharray="3 3" />
                <line x1="0" y1="40" x2="800" y2="40" stroke="var(--ops-border)" strokeWidth="1" strokeDasharray="3 3" />
                <line x1="0" y1="80" x2="800" y2="80" stroke="var(--ops-border)" strokeWidth="1" strokeDasharray="3 3" />
                <line x1="0" y1="120" x2="800" y2="120" stroke="var(--ops-border)" strokeWidth="1" strokeDasharray="3 3" />
                <line x1="0" y1="160" x2="800" y2="160" stroke="var(--ops-border)" strokeWidth="1" />

                {/* 16 hourly stacked bars */}
                {[
                  { x: 20, t0: 35, t1: 28, t2: 20, t3: 9 },
                  { x: 70, t0: 38, t1: 30, t2: 22, t3: 11 },
                  { x: 120, t0: 42, t1: 32, t2: 24, t3: 12 },
                  { x: 170, t0: 48, t1: 36, t2: 28, t3: 14 },
                  { x: 220, t0: 55, t1: 42, t2: 30, t3: 15 },
                  { x: 270, t0: 62, t1: 48, t2: 34, t3: 16 },
                  { x: 320, t0: 68, t1: 52, t2: 36, t3: 18 },
                  { x: 370, t0: 72, t1: 54, t2: 38, t3: 19 },
                  { x: 420, t0: 70, t1: 52, t2: 36, t3: 17 },
                  { x: 470, t0: 66, t1: 50, t2: 34, t3: 16 },
                  { x: 520, t0: 58, t1: 44, t2: 30, t3: 15 },
                  { x: 570, t0: 52, t1: 40, t2: 26, t3: 13 },
                  { x: 620, t0: 46, t1: 34, t2: 24, t3: 11 },
                  { x: 670, t0: 40, t1: 30, t2: 22, t3: 10 },
                  { x: 720, t0: 36, t1: 28, t2: 20, t3: 9 },
                  { x: 770, t0: 34, t1: 26, t2: 18, t3: 8 },
                ].map((bar, i) => {
                  const bWidth = 24;
                  const scale = 0.82;
                  const h0 = bar.t0 * scale;
                  const h1 = bar.t1 * scale;
                  const h2 = bar.t2 * scale;
                  const h3 = bar.t3 * scale;

                  const y0 = 160 - h0;
                  const y1 = y0 - h1;
                  const y2 = y1 - h2;
                  const y3 = y2 - h3;

                  return (
                    <g key={i}>
                      <rect x={bar.x - bWidth / 2} y={y0} width={bWidth} height={h0} fill="var(--ops-accent)" rx="1" />
                      <rect x={bar.x - bWidth / 2} y={y1} width={bWidth} height={h1} fill="var(--ops-ok)" />
                      <rect x={bar.x - bWidth / 2} y={y2} width={bWidth} height={h2} fill="#60a5fa" />
                      <rect x={bar.x - bWidth / 2} y={y3} width={bWidth} height={h3} fill="var(--ops-warn)" rx="1" />
                    </g>
                  );
                })}
              </svg>
            </div>

            {/* X-axis hourly labels */}
            <div className="flex items-center justify-between font-mono text-caption text-ops-text-muted px-2">
              <span>00:00 UTC</span>
              <span>04:00</span>
              <span>08:00</span>
              <span>12:00</span>
              <span>16:00</span>
              <span>20:00</span>
              <span>23:59</span>
            </div>

            {/* Insight line in plain language (Analytics template requirement) */}
            <div className="p-3 rounded-sm bg-ops-panel-raised border border-ops-border flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-ops-accent shrink-0 mt-0.5" />
              <p className="text-body-sm text-ops-text">
                <strong className="text-ops-accent font-medium">Interception insight:</strong> Cache
                interception and local routing avoided <strong>$1,842.20</strong> in upstream API costs
                over the last 24 hours, maintaining a median P95 response time under 142ms.
              </p>
            </div>
          </section>

          {/* Section: Supporting Breakdown Table (Analytics template: supporting breakdown table) */}
          <section className="bg-ops-panel rounded-md border border-ops-border overflow-hidden">
            <div className="p-4 border-b border-ops-border/60 flex items-center justify-between">
              <div>
                <h2 className="text-body-sm font-semibold text-ops-text">
                  Provider economics and cluster pool breakdown
                </h2>
                <p className="text-caption text-ops-text-muted">
                  Billed volumes, gross API spend, and token dispatch telemetry.
                </p>
              </div>
            </div>

            <DataTable
              columns={providerColumns}
              data={providerData}
              keyExtractor={(row) => row.id}
              className="border-0 rounded-none"
            />
          </section>

          {/* Section: Resilience and Circuit Breakers Ledger */}
          <section className="bg-ops-panel rounded-md border border-ops-border p-4 flex flex-col gap-3">
            <div className="flex items-center justify-between pb-2 border-b border-ops-border/60">
              <h2 className="text-body-sm font-semibold text-ops-text">
                Routing resilience and circuit breaker activity
              </h2>
              <span className="font-mono text-caption text-ops-text-muted">
                Mesh router v0.9.4
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {resilienceEvents.map((evt) => (
                <div
                  key={evt.id}
                  className="p-3 rounded-sm bg-ops-panel-raised border border-ops-border/70 flex flex-col justify-between gap-1.5"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span
                      className={`px-2 py-0.5 rounded-full text-caption font-medium select-none ${
                        evt.level === 'Warning'
                          ? 'bg-ops-warn/15 text-ops-warn'
                          : evt.level === 'Optimal'
                          ? 'bg-ops-ok/15 text-ops-ok'
                          : 'bg-ops-accent/15 text-ops-accent'
                      }`}
                    >
                      {evt.badge}
                    </span>
                    <span className="font-mono text-caption text-ops-text-muted tabular-nums">
                      {evt.timestamp}
                    </span>
                  </div>
                  <p className="text-body-sm text-ops-text font-medium leading-snug">
                    {evt.message}
                  </p>
                  <span className="text-caption text-ops-text-muted">
                    {evt.detail}
                  </span>
                </div>
              ))}
            </div>
          </section>
        </>
      )}
    </div>
  );
}

export default function OpsAiCostPage() {
  return (
    <Suspense fallback={<div className="p-8 text-caption text-ops-text-muted">Loading AI economics...</div>}>
      <OpsAiCostContent />
    </Suspense>
  );
}
