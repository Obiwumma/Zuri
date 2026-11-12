'use client';

import React, { useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import {
  DataTable,
  type Column,
  Button,
  Badge,
  EmptyState,
  Skeleton,
  Alert,
} from '@/components/ui';
import {
  TrendingUp,
  TrendingDown,
  Download,
  SlidersHorizontal,
  Activity,
  FileSpreadsheet,
  Database,
  ArrowRight,
} from 'lucide-react';

export type AnalyticsState = 'default' | 'loading' | 'empty' | 'error';

interface CourseQuizRow {
  code: string;
  name: string;
  department: string;
  division: string;
  attempts: number;
  successRate: number;
  subThresholdPct: number;
  trend: string;
  isPositive: boolean;
  statusLabel: 'Exemplary' | 'Nominal' | 'Review Needed';
}

const mockQuizBreakdown: CourseQuizRow[] = [
  {
    code: 'HIST-204',
    name: 'Late Imperial Diplomacy (1870–1914)',
    department: 'Faculty of History',
    division: 'Humanities',
    attempts: 890,
    successRate: 86.4,
    subThresholdPct: 13.6,
    trend: '+4.8% on last week',
    isPositive: true,
    statusLabel: 'Exemplary',
  },
  {
    code: 'LAW-105',
    name: 'Constitutional Jurisprudence',
    department: 'Faculty of Law',
    division: 'Social Sciences',
    attempts: 960,
    successRate: 91.2,
    subThresholdPct: 8.8,
    trend: '+1.5% on last week',
    isPositive: true,
    statusLabel: 'Exemplary',
  },
  {
    code: 'PHIL-101',
    name: 'Formal Logic & Dialectic',
    department: 'Faculty of Philosophy',
    division: 'Humanities',
    attempts: 1420,
    successRate: 82.9,
    subThresholdPct: 17.1,
    trend: '+3.1% on last week',
    isPositive: true,
    statusLabel: 'Exemplary',
  },
  {
    code: 'MATH-210',
    name: 'Linear Algebra & Spectral Theory',
    department: 'Mathematical Institute',
    division: 'MPLS',
    attempts: 1780,
    successRate: 81.0,
    subThresholdPct: 19.0,
    trend: '+2.1% on last week',
    isPositive: true,
    statusLabel: 'Nominal',
  },
  {
    code: 'BIO-410',
    name: 'Cellular Signalling & Genomic Medicine',
    department: 'Dept. of Biochemistry',
    division: 'Medical Sciences',
    attempts: 2110,
    successRate: 72.8,
    subThresholdPct: 27.2,
    trend: 'Steady',
    isPositive: true,
    statusLabel: 'Nominal',
  },
  {
    code: 'ENG-320',
    name: 'Advanced Fluid Dynamics',
    department: 'Dept. of Engineering Science',
    division: 'MPLS',
    attempts: 1240,
    successRate: 61.5,
    subThresholdPct: 38.5,
    trend: '-3.2% on last week',
    isPositive: false,
    statusLabel: 'Review Needed',
  },
];

const mockWeeklyMastery = [
  { week: 'Wk 1', label: 'Week 1', masteryRate: 71.2, attempts: 1240 },
  { week: 'Wk 2', label: 'Week 2', masteryRate: 73.5, attempts: 1820 },
  { week: 'Wk 3', label: 'Week 3', masteryRate: 75.1, attempts: 2410 },
  { week: 'Wk 4', label: 'Week 4', masteryRate: 76.8, attempts: 3120 },
  { week: 'Wk 5', label: 'Week 5', masteryRate: 79.2, attempts: 3840 },
  { week: 'Wk 6', label: 'Week 6 (Midterm)', masteryRate: 81.4, attempts: 4620 },
  { week: 'Wk 7', label: 'Week 7 (Current)', masteryRate: 78.4, attempts: 4180 },
];

function QuizPerformanceContent() {
  const searchParams = useSearchParams();
  const showHarness = process.env.NODE_ENV !== 'production' && searchParams.get('states') === '1';

  const [state, setState] = useState<AnalyticsState>('default');
  const [dateRange, setDateRange] = useState('Michaelmas Term 2024–25 (Wks 1–7)');
  const [chartViewMode, setChartViewMode] = useState<'chart' | 'table'>('chart');

  const columns: Column<CourseQuizRow>[] = [
    {
      header: 'Course & curriculum',
      isTitle: true,
      accessor: (row) => (
        <div className="flex flex-col min-w-0">
          <div className="flex items-center gap-2">
            <span className="font-mono text-caption px-2 py-0.5 rounded-sm bg-surface-container font-semibold text-primary">
              {row.code}
            </span>
            <span className="font-semibold text-on-surface text-body-sm truncate">
              {row.name}
            </span>
          </div>
          <span className="text-caption text-on-surface-variant truncate mt-0.5">
            {row.department} &bull; {row.division}
          </span>
        </div>
      ),
    },
    {
      header: 'Formative attempts',
      numeric: true,
      accessor: (row) => (
        <span className="tabular-nums text-on-surface text-body-sm">
          {row.attempts.toLocaleString()}
        </span>
      ),
    },
    {
      header: 'Mastery rate',
      numeric: true,
      isKeyField: true,
      accessor: (row) => (
        <span className="tabular-nums font-semibold text-primary text-body-sm">
          {row.successRate.toFixed(1)}%
        </span>
      ),
    },
    {
      header: 'Sub-threshold rate',
      numeric: true,
      accessor: (row) => (
        <span className="tabular-nums text-on-surface-variant text-body-sm">
          {row.subThresholdPct.toFixed(1)}%
        </span>
      ),
    },
    {
      header: 'Mastery rating',
      isKeyField: true,
      accessor: (row) => (
        <Badge
          variant={
            row.statusLabel === 'Exemplary'
              ? 'success'
              : row.statusLabel === 'Nominal'
              ? 'info'
              : 'warning'
          }
        >
          {row.statusLabel}
        </Badge>
      ),
    },
    {
      header: 'Weekly trajectory',
      numeric: true,
      accessor: (row) => (
        <span
          className={`inline-flex items-center gap-1 text-caption font-medium px-2 py-0.5 rounded-full tabular-nums ${
            row.isPositive
              ? 'text-primary bg-primary-container/20'
              : 'text-error bg-error-container/40'
          }`}
        >
          {row.isPositive ? (
            <TrendingUp className="w-3 h-3 stroke-[2]" aria-hidden="true" />
          ) : (
            <TrendingDown className="w-3 h-3 stroke-[2]" aria-hidden="true" />
          )}
          <span>{row.trend}</span>
        </span>
      ),
    },
  ];

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6 sm:space-y-8">
      {/* Dev State Simulation Harness Bar (only when ?states=1) */}
      {showHarness && (
        <aside aria-label="Development test harness" className="w-full">
          <div className="bg-surface-container-high border border-outline-variant rounded-default p-2 flex flex-wrap items-center justify-between gap-2 text-caption">
            <span className="text-on-surface-variant font-medium flex items-center gap-1.5">
              <SlidersHorizontal className="w-3.5 h-3.5" aria-hidden="true" />
              Quiz states:
            </span>
            <div className="flex items-center gap-1 flex-wrap">
              <button
                type="button"
                onClick={() => setState('default')}
                className={`px-2.5 py-1 rounded-sm text-caption transition-colors cursor-pointer ${
                  state === 'default'
                    ? 'bg-primary text-on-primary font-semibold'
                    : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container'
                }`}
              >
                Default
              </button>
              <button
                type="button"
                onClick={() => setState('loading')}
                className={`px-2.5 py-1 rounded-sm text-caption transition-colors cursor-pointer ${
                  state === 'loading'
                    ? 'bg-primary text-on-primary font-semibold'
                    : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container'
                }`}
              >
                Loading
              </button>
              <button
                type="button"
                onClick={() => setState('empty')}
                className={`px-2.5 py-1 rounded-sm text-caption transition-colors cursor-pointer ${
                  state === 'empty'
                    ? 'bg-primary text-on-primary font-semibold'
                    : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container'
                }`}
              >
                Empty
              </button>
              <button
                type="button"
                onClick={() => setState('error')}
                className={`px-2.5 py-1 rounded-sm text-caption transition-colors cursor-pointer ${
                  state === 'error'
                    ? 'bg-primary text-on-primary font-semibold'
                    : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container'
                }`}
              >
                Error
              </button>
            </div>
          </div>
        </aside>
      )}

      {/* Page Header (DESIGN.md section 11: Analytics template) */}
      <header className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-4 border-b border-outline-variant/40">
        <div className="min-w-0 flex-1">
          <h1 className="text-2xl sm:text-3xl font-serif font-semibold text-on-surface tracking-tight">
            Quiz performance
          </h1>
          <p className="text-body-sm text-on-surface-variant mt-1 max-w-2xl">
            Formative assessment completion, concept mastery signals, and sub-threshold diagnostic review rates.
          </p>
        </div>

        {/* Date-range filter & action on the right */}
        <div className="flex flex-wrap sm:flex-nowrap items-center gap-2.5 shrink-0 w-full sm:w-auto">
          <div className="relative flex-1 sm:flex-initial min-w-[220px]">
            <select
              aria-label="Academic date-range filter"
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className="w-full h-10 px-3 pr-8 bg-surface-container-lowest border border-outline text-on-surface text-body-sm rounded-default outline-none focus-visible:focus-ring cursor-pointer hover:border-on-surface-variant transition-colors"
            >
              <option value="Michaelmas Term 2024–25 (Wks 1–7)">Michaelmas Term 2024–25</option>
              <option value="Trinity Term 2023–24">Trinity Term 2023–24</option>
              <option value="Hilary Term 2023–24">Hilary Term 2023–24</option>
              <option value="Full Academic Year 2023–24">Full Academic Year 2023–24</option>
            </select>
          </div>
          <Button variant="secondary" className="flex-1 sm:flex-initial">
            <Download className="w-4 h-4" aria-hidden="true" />
            <span>Export report</span>
          </Button>
        </div>
      </header>

      {/* State: Error */}
      {state === 'error' && (
        <Alert
          variant="error"
          title="Unable to load quiz performance data"
          description="We encountered a problem loading formative assessment trends. Check your connection and try again."
          action={
            <Button variant="secondary" size="sm" onClick={() => setState('default')}>
              Try again
            </Button>
          }
        />
      )}

      {/* State: Loading (Skeleton) */}
      {state === 'loading' && (
        <div
          className="space-y-6 sm:space-y-8 animate-pulse"
          aria-busy="true"
          aria-label="Loading quiz performance analytics"
        >
          {/* Skeleton Insight Line */}
          <Skeleton className="h-12 w-full rounded-default" />

          {/* Skeleton Headline Chart */}
          <div className="bg-surface-container-lowest p-5 sm:p-6 rounded-md border border-outline-variant space-y-4">
            <Skeleton className="h-6 w-56" />
            <Skeleton className="h-4 w-80" />
            <Skeleton className="h-64 w-full rounded-default" />
          </div>

          {/* Skeleton Breakdown Table */}
          <div className="bg-surface-container-lowest p-5 sm:p-6 rounded-md border border-outline-variant space-y-4">
            <Skeleton className="h-6 w-64" />
            <div className="space-y-3 pt-2">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <Skeleton key={i} className="h-12 w-full rounded-default" />
              ))}
            </div>
          </div>
        </div>
      )}

      {/* State: Empty */}
      {state === 'empty' && (
        <div className="bg-surface-container-lowest rounded-md border border-outline-variant p-8 md:p-12">
          <EmptyState
            icon={Database}
            title="No quiz data recorded for this period"
            description="No formative quiz attempts or diagnostic review logs exist for the selected date range."
            action={
              <Button variant="primary" onClick={() => setState('default')}>
                Reset to current term
              </Button>
            }
          />
        </div>
      )}

      {/* State: Default (Populated) */}
      {state === 'default' && (
        <>
          {/* Component: Plain-Language Insight Line (DESIGN.md section 11) */}
          <div className="bg-surface-container-low border border-outline-variant/40 rounded-default px-4 py-3 flex items-center gap-3">
            <TrendingUp className="w-4.5 h-4.5 text-primary shrink-0" aria-hidden="true" />
            <p className="text-body-sm text-on-surface">
              <span className="font-semibold text-primary">Formative quiz mastery reached 78.4% across the university this week.</span>{' '}
              Sub-threshold attempts dropped 4.2% following Week 6 tutorial reviews in History and Mathematics.
            </p>
          </div>

          {/* Component: One Headline Chart (DESIGN.md section 11: text alternatives, non-color reliance) */}
          <section
            aria-labelledby="headline-chart-title"
            className="bg-surface-container-lowest border border-outline-variant rounded-md p-5 sm:p-6 flex flex-col"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-outline-variant/30">
              <div>
                <h2 id="headline-chart-title" className="text-h3 font-serif font-semibold text-on-surface">
                  Weekly quiz mastery trajectory
                </h2>
                <p className="text-caption text-on-surface-variant mt-0.5">
                  Aggregated percentage of students achieving formative mastery on first attempt.
                </p>
              </div>

              {/* View Toggle: Chart vs Accessible Data Table */}
              <div className="inline-flex rounded-default bg-surface-container p-0.5 self-start sm:self-center">
                <button
                  type="button"
                  onClick={() => setChartViewMode('chart')}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-sm text-caption transition-colors cursor-pointer ${
                    chartViewMode === 'chart'
                      ? 'bg-surface-container-lowest text-on-surface font-semibold shadow-xs'
                      : 'text-on-surface-variant hover:text-on-surface'
                  }`}
                  aria-pressed={chartViewMode === 'chart'}
                >
                  <Activity className="w-3.5 h-3.5" aria-hidden="true" />
                  <span>Mastery chart</span>
                </button>
                <button
                  type="button"
                  onClick={() => setChartViewMode('table')}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-sm text-caption transition-colors cursor-pointer ${
                    chartViewMode === 'table'
                      ? 'bg-surface-container-lowest text-on-surface font-semibold shadow-xs'
                      : 'text-on-surface-variant hover:text-on-surface'
                  }`}
                  aria-pressed={chartViewMode === 'table'}
                >
                  <FileSpreadsheet className="w-3.5 h-3.5" aria-hidden="true" />
                  <span>Data table</span>
                </button>
              </div>
            </div>

            {/* Screen Reader Text Alternative */}
            <p className="sr-only">
              Formative quiz mastery trend: Week 1 started at 71.2% across 1,240 attempts, increased steadily to 79.2% in Week 5, peaked at 81.4% during Week 6 midterm reviews, and currently registers 78.4% across 4,180 attempts in Week 7.
            </p>

            {/* Visual View: Accessible Chart */}
            {chartViewMode === 'chart' ? (
              <div className="pt-6">
                <div className="grid grid-cols-7 gap-2 sm:gap-4 items-end h-56 pt-4 pb-2 border-b border-outline-variant">
                  {mockWeeklyMastery.map((point) => {
                    // Normalize bar height between 50% base and 100% max
                    const heightPct = Math.round(((point.masteryRate - 50) / 50) * 100);
                    const isCurrent = point.week.includes('Current') || point.week === 'Wk 7';

                    return (
                      <div
                        key={point.week}
                        className="flex flex-col items-center justify-end h-full gap-2 group relative"
                      >
                        {/* Numeric Value Label above bar */}
                        <span className="text-[11px] sm:text-caption tabular-nums text-on-surface font-semibold">
                          {point.masteryRate.toFixed(1)}%
                        </span>

                        {/* Bar with distinct pattern / border for non-color reliance */}
                        <div
                          className="w-full max-w-[48px] bg-surface-container rounded-t-default relative flex flex-col justify-end overflow-hidden"
                          style={{ height: `${heightPct}%` }}
                        >
                          <div
                            className={`w-full h-full rounded-t-default transition-all ${
                              isCurrent
                                ? 'bg-primary border-t-2 border-primary-container'
                                : 'bg-primary/80 group-hover:bg-primary'
                            }`}
                          />
                        </div>

                        {/* Week Label */}
                        <span
                          className={`text-[11px] sm:text-caption font-medium truncate ${
                            isCurrent ? 'text-primary font-semibold' : 'text-on-surface-variant'
                          }`}
                        >
                          {point.week}
                        </span>

                        {/* Hover Details Callout */}
                        <div className="absolute bottom-full mb-2 hidden group-hover:flex group-focus-within:flex flex-col z-20 bg-surface-container-high text-on-surface p-2.5 rounded-default border border-outline-variant shadow-sm text-caption whitespace-nowrap pointer-events-none">
                          <span className="font-semibold text-on-surface">{point.label}</span>
                          <span className="text-on-surface-variant">Attempts: {point.attempts.toLocaleString()}</span>
                          <span className="font-medium text-primary">Mastery rate: {point.masteryRate}%</span>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Visible Chart Summary sentence below chart (Text alternative requirement) */}
                <div className="pt-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-caption text-on-surface-variant">
                  <span>
                    Term mastery climbed from 71.2% in Week 1 to a peak of 81.4% in Week 6, with current Week 7 sustaining 78.4%.
                  </span>
                  <div className="flex items-center gap-3 shrink-0">
                    <span className="inline-flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-xs bg-primary" aria-hidden="true" />
                      <span>Formative mastery rate</span>
                    </span>
                  </div>
                </div>
              </div>
            ) : (
              /* Accessible Alternative Data Table View */
              <div className="pt-4 overflow-x-auto">
                <table className="w-full text-left text-body-sm border-collapse" aria-label="Weekly quiz mastery data">
                  <thead>
                    <tr className="border-b border-outline-variant text-caption text-on-surface-variant">
                      <th scope="col" className="py-2.5 pr-4 font-medium">Academic week</th>
                      <th scope="col" className="py-2.5 px-4 font-medium text-right">Formative attempts</th>
                      <th scope="col" className="py-2.5 pl-4 font-medium text-right">Mastery percentage</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-outline-variant/30">
                    {mockWeeklyMastery.map((point) => (
                      <tr key={point.week} className="hover:bg-surface-container/50">
                        <td className="py-2.5 pr-4 font-medium text-on-surface">{point.label}</td>
                        <td className="py-2.5 px-4 text-right tabular-nums text-on-surface">{point.attempts.toLocaleString()}</td>
                        <td className="py-2.5 pl-4 text-right font-semibold tabular-nums text-primary">{point.masteryRate.toFixed(1)}%</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>

          {/* Component: Supporting Breakdown Table (DESIGN.md section 11) */}
          <section className="flex flex-col">
            <DataTable
              title="Course mastery breakdown"
              subtitle="Formative attempts, concept mastery thresholds, and weekly performance trends."
              columns={columns}
              data={mockQuizBreakdown}
              keyExtractor={(row) => row.code}
            />
          </section>
        </>
      )}
    </div>
  );
}

export default function QuizPerformancePage() {
  return (
    <Suspense fallback={<div className="p-8 max-w-7xl mx-auto min-h-dvh" />}>
      <QuizPerformanceContent />
    </Suspense>
  );
}
