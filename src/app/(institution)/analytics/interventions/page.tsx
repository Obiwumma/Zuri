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
  Download,
  SlidersHorizontal,
  Activity,
  FileSpreadsheet,
  Database,
  ArrowRight,
} from 'lucide-react';

export type AnalyticsState = 'default' | 'loading' | 'empty' | 'error';

interface CourseInterventionRow {
  title: string;
  code: string;
  department: string;
  interventions: number;
  accepted: number;
  rate: string;
  isHighRate: boolean;
  trend: string;
}

const mockCourseInterventions: CourseInterventionRow[] = [
  {
    title: 'Late Imperial Diplomacy (1870–1914)',
    code: 'HIST-204',
    department: 'Faculty of History',
    interventions: 482,
    accepted: 418,
    rate: '86.7%',
    isHighRate: true,
    trend: '+6.2% on last week',
  },
  {
    title: 'Cellular Signalling & Genomic Medicine',
    code: 'BIO-410',
    department: 'Dept. of Biochemistry',
    interventions: 540,
    accepted: 442,
    rate: '81.8%',
    isHighRate: true,
    trend: '+3.5% on last week',
  },
  {
    title: 'Formal Logic & Dialectic',
    code: 'PHIL-101',
    department: 'Faculty of Philosophy',
    interventions: 398,
    accepted: 322,
    rate: '80.9%',
    isHighRate: true,
    trend: '+8.1% on last week',
  },
  {
    title: 'Constitutional Jurisprudence',
    code: 'LAW-105',
    department: 'Faculty of Law',
    interventions: 280,
    accepted: 246,
    rate: '87.9%',
    isHighRate: true,
    trend: '+4.2% on last week',
  },
  {
    title: 'Linear Algebra & Matrix Decompositions',
    code: 'MATH-210',
    department: 'Mathematical Institute',
    interventions: 610,
    accepted: 458,
    rate: '75.1%',
    isHighRate: false,
    trend: '+1.8% on last week',
  },
  {
    title: 'Advanced Fluid Dynamics',
    code: 'ENG-320',
    department: 'Dept. of Engineering Science',
    interventions: 315,
    accepted: 230,
    rate: '73.0%',
    isHighRate: false,
    trend: 'Steady',
  },
];

const mockWeeklyInterventions = [
  { week: 'Wk 1', label: 'Week 1', flagged: 140, resolved: 98, rate: '70.0%' },
  { week: 'Wk 2', label: 'Week 2', flagged: 210, resolved: 162, rate: '77.1%' },
  { week: 'Wk 3', label: 'Week 3', flagged: 320, resolved: 258, rate: '80.6%' },
  { week: 'Wk 4', label: 'Week 4', flagged: 410, resolved: 335, rate: '81.7%' },
  { week: 'Wk 5', label: 'Week 5', flagged: 480, resolved: 396, rate: '82.5%' },
  { week: 'Wk 6', label: 'Week 6 (Midterm)', flagged: 560, resolved: 458, rate: '81.8%' },
  { week: 'Wk 7', label: 'Week 7 (Current)', flagged: 490, resolved: 412, rate: '84.1%' },
];

function InterventionsContent() {
  const searchParams = useSearchParams();
  const showHarness = process.env.NODE_ENV !== 'production' && searchParams.get('states') === '1';

  const [state, setState] = useState<AnalyticsState>('default');
  const [dateRange, setDateRange] = useState('Michaelmas Term 2024–25 (Wks 1–7)');
  const [chartViewMode, setChartViewMode] = useState<'chart' | 'table'>('chart');

  const maxWeeklyFlagged = Math.max(...mockWeeklyInterventions.map((d) => d.flagged));

  const columns: Column<CourseInterventionRow>[] = [
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
              {row.title}
            </span>
          </div>
          <span className="text-caption text-on-surface-variant truncate mt-0.5">
            {row.department}
          </span>
        </div>
      ),
    },
    {
      header: 'Flags logged',
      numeric: true,
      accessor: (row) => (
        <span className="tabular-nums text-on-surface text-body-sm">
          {row.interventions.toLocaleString()}
        </span>
      ),
    },
    {
      header: 'Resolved by tutor',
      numeric: true,
      accessor: (row) => (
        <span className="tabular-nums text-on-surface text-body-sm">
          {row.accepted.toLocaleString()}
        </span>
      ),
    },
    {
      header: 'Resolution rate',
      numeric: true,
      isKeyField: true,
      accessor: (row) => (
        <Badge variant={row.isHighRate ? 'success' : 'neutral'}>
          {row.rate}
        </Badge>
      ),
    },
    {
      header: 'Trajectory',
      numeric: true,
      isKeyField: true,
      accessor: (row) => (
        <span className="inline-flex items-center gap-1 text-caption font-medium text-primary bg-primary-container/20 px-2 py-0.5 rounded-full tabular-nums">
          <TrendingUp className="w-3 h-3 stroke-[2]" aria-hidden="true" />
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
              Intervention states:
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
            Intervention analytics
          </h1>
          <p className="text-body-sm text-on-surface-variant mt-1 max-w-2xl">
            Diagnostic support flags, tutor recommendations, and student concept recovery across academic departments.
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
          title="Unable to load intervention analytics"
          description="We encountered a problem loading your academic intervention trends. Check your connection and try again."
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
          aria-label="Loading intervention analytics"
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
            title="No interventions recorded for this period"
            description="No student diagnostic flags or tutorial recovery sessions exist for the selected date range."
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
              <span className="font-semibold text-primary">Tutorial interventions resolved 84.1% of academic flags this week.</span>{' '}
              Formative recovery peaked during Week 6 midterm tutorials with 458 student sessions completed.
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
                  Weekly intervention volume and resolution
                </h2>
                <p className="text-caption text-on-surface-variant mt-0.5">
                  Comparison of flagged concept diagnostics and successfully completed tutorial interventions.
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
                  <span>Cadence chart</span>
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
              Intervention summary: Week 1 recorded 140 flags with 98 resolved (70%). Flags increased through term to 560 in Week 6 with 458 resolved (81.8%), and current Week 7 has 490 flags with 412 resolved (84.1%).
            </p>

            {/* Visual View: Accessible Chart */}
            {chartViewMode === 'chart' ? (
              <div className="pt-6">
                <div className="grid grid-cols-7 gap-2 sm:gap-4 items-end h-56 pt-4 pb-2 border-b border-outline-variant">
                  {mockWeeklyInterventions.map((point) => {
                    const heightPct = Math.round((point.flagged / maxWeeklyFlagged) * 100);
                    const isCurrent = point.week.includes('Current') || point.week === 'Wk 7';

                    return (
                      <div
                        key={point.week}
                        className="flex flex-col items-center justify-end h-full gap-2 group relative"
                      >
                        {/* Numeric Value Label above bar */}
                        <span className="text-[11px] sm:text-caption tabular-nums text-on-surface-variant font-medium">
                          {point.resolved} / {point.flagged}
                        </span>

                        {/* Bar with distinct visual layers for non-color reliance */}
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
                          <span className="text-on-surface-variant">Flagged diagnostics: {point.flagged}</span>
                          <span className="text-on-surface-variant">Tutor resolved: {point.resolved}</span>
                          <span className="font-medium text-primary">Resolution rate: {point.rate}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Visible Chart Summary sentence below chart (Text alternative requirement) */}
                <div className="pt-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-caption text-on-surface-variant">
                  <span>
                    Term resolution rate climbed from 70.0% in Week 1 to 84.1% in current Week 7 across collegiate faculties.
                  </span>
                  <div className="flex items-center gap-3 shrink-0">
                    <span className="inline-flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-xs bg-primary" aria-hidden="true" />
                      <span>Interventions resolved</span>
                    </span>
                  </div>
                </div>
              </div>
            ) : (
              /* Accessible Alternative Data Table View */
              <div className="pt-4 overflow-x-auto">
                <table className="w-full text-left text-body-sm border-collapse" aria-label="Weekly intervention data">
                  <thead>
                    <tr className="border-b border-outline-variant text-caption text-on-surface-variant">
                      <th scope="col" className="py-2.5 pr-4 font-medium">Academic week</th>
                      <th scope="col" className="py-2.5 px-4 font-medium text-right">Flags recorded</th>
                      <th scope="col" className="py-2.5 px-4 font-medium text-right">Tutor resolved</th>
                      <th scope="col" className="py-2.5 pl-4 font-medium text-right">Resolution rate</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-outline-variant/30">
                    {mockWeeklyInterventions.map((point) => (
                      <tr key={point.week} className="hover:bg-surface-container/50">
                        <td className="py-2.5 pr-4 font-medium text-on-surface">{point.label}</td>
                        <td className="py-2.5 px-4 text-right tabular-nums text-on-surface">{point.flagged.toLocaleString()}</td>
                        <td className="py-2.5 px-4 text-right tabular-nums text-on-surface">{point.resolved.toLocaleString()}</td>
                        <td className="py-2.5 pl-4 text-right font-semibold tabular-nums text-primary">{point.rate}</td>
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
              title="Departmental intervention breakdown"
              subtitle="Course intervention frequency, tutor action rate, and weekly trajectory."
              columns={columns}
              data={mockCourseInterventions}
              keyExtractor={(row) => row.code}
            />
          </section>
        </>
      )}
    </div>
  );
}

export default function InterventionAnalyticsPage() {
  return (
    <Suspense fallback={<div className="p-8 max-w-7xl mx-auto min-h-dvh" />}>
      <InterventionsContent />
    </Suspense>
  );
}
