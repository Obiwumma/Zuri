'use client';

import React, { useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import {
  DataTable,
  type Column,
  Button,
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
  Clock,
} from 'lucide-react';

export type AnalyticsState = 'default' | 'loading' | 'empty' | 'error';

interface DepartmentUsageRow {
  department: string;
  division: string;
  coursesActive: number;
  lecturesProcessed: number;
  quizzesGenerated: number;
  studentInquiries: number;
  totalActivity: number;
  growth: string;
}

const mockDepartmentUsage: DepartmentUsageRow[] = [
  {
    department: 'Faculty of History',
    division: 'Humanities',
    coursesActive: 42,
    lecturesProcessed: 312,
    quizzesGenerated: 1140,
    studentInquiries: 6820,
    totalActivity: 12482,
    growth: '+11.8%',
  },
  {
    department: 'Department of Engineering Science',
    division: 'MPLS',
    coursesActive: 38,
    lecturesProcessed: 284,
    quizzesGenerated: 1420,
    studentInquiries: 7940,
    totalActivity: 12294,
    growth: '+8.4%',
  },
  {
    department: 'Clinical Medicine',
    division: 'Medical Sciences',
    coursesActive: 29,
    lecturesProcessed: 360,
    quizzesGenerated: 1680,
    studentInquiries: 5120,
    totalActivity: 11050,
    growth: '+14.2%',
  },
  {
    department: 'Faculty of Philosophy',
    division: 'Humanities',
    coursesActive: 18,
    lecturesProcessed: 198,
    quizzesGenerated: 780,
    studentInquiries: 4310,
    totalActivity: 7428,
    growth: '+5.1%',
  },
  {
    department: 'Mathematical Institute',
    division: 'MPLS',
    coursesActive: 34,
    lecturesProcessed: 328,
    quizzesGenerated: 820,
    studentInquiries: 4460,
    totalActivity: 7028,
    growth: '+9.3%',
  },
];

const mockWeeklyCadence = [
  { week: 'Wk 1', label: 'Week 1', total: 1840, lectures: 320, quizzes: 620, inquiries: 900 },
  { week: 'Wk 2', label: 'Week 2', total: 2420, lectures: 410, quizzes: 830, inquiries: 1180 },
  { week: 'Wk 3', label: 'Week 3', total: 3150, lectures: 490, quizzes: 1120, inquiries: 1540 },
  { week: 'Wk 4', label: 'Week 4', total: 3980, lectures: 540, quizzes: 1480, inquiries: 1960 },
  { week: 'Wk 5', label: 'Week 5', total: 4720, lectures: 580, quizzes: 1820, inquiries: 2320 },
  { week: 'Wk 6', label: 'Week 6 (Midterm)', total: 5820, lectures: 620, quizzes: 2420, inquiries: 2780 },
  { week: 'Wk 7', label: 'Week 7 (Current)', total: 5140, lectures: 510, quizzes: 2180, inquiries: 2450 },
];

function AiUsageContent() {
  const searchParams = useSearchParams();
  const showHarness = searchParams.get('states') === '1';

  const [state, setState] = useState<AnalyticsState>('default');
  const [dateRange, setDateRange] = useState('Michaelmas Term 2024–25 (Wks 1–7)');
  const [chartViewMode, setChartViewMode] = useState<'chart' | 'table'>('chart');

  const maxWeeklyTotal = Math.max(...mockWeeklyCadence.map((d) => d.total));

  const columns: Column<DepartmentUsageRow>[] = [
    {
      header: 'Department & division',
      isTitle: true,
      accessor: (row) => (
        <div className="flex flex-col min-w-0">
          <span className="font-medium text-on-surface truncate">{row.department}</span>
          <span className="text-caption text-on-surface-variant truncate">
            {row.division} &bull; {row.coursesActive} courses active
          </span>
        </div>
      ),
    },
    {
      header: 'Lectures processed',
      numeric: true,
      accessor: (row) => (
        <span className="tabular-nums text-on-surface text-body-sm">
          {row.lecturesProcessed.toLocaleString()}
        </span>
      ),
    },
    {
      header: 'Quizzes generated',
      numeric: true,
      accessor: (row) => (
        <span className="tabular-nums text-on-surface text-body-sm">
          {row.quizzesGenerated.toLocaleString()}
        </span>
      ),
    },
    {
      header: 'Student inquiries',
      numeric: true,
      accessor: (row) => (
        <span className="tabular-nums text-on-surface text-body-sm">
          {row.studentInquiries.toLocaleString()}
        </span>
      ),
    },
    {
      header: 'Total activity',
      numeric: true,
      isKeyField: true,
      accessor: (row) => (
        <span className="font-semibold text-on-surface tabular-nums text-body-sm">
          {row.totalActivity.toLocaleString()}
        </span>
      ),
    },
    {
      header: 'Growth vs last term',
      numeric: true,
      isKeyField: true,
      accessor: (row) => (
        <span className="inline-flex items-center gap-1 text-caption font-medium text-primary bg-primary-container/20 px-2 py-0.5 rounded-full tabular-nums">
          <TrendingUp className="w-3 h-3 stroke-[2]" aria-hidden="true" />
          <span>{row.growth}</span>
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
              Analytics states:
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
            AI usage
          </h1>
          <p className="text-body-sm text-on-surface-variant mt-1 max-w-2xl">
            Curriculum indexing, formative problem sets, and student academic inquiry volume.
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
          title="Unable to load usage analytics"
          description="We encountered a problem loading your academic usage trends. Check your connection and try again."
          action={
            <Button variant="secondary" size="sm" onClick={() => setState('default')}>
              Try again
            </Button>
          }
        />
      )}

      {/* State: Loading (Skeleton) */}
      {state === 'loading' && (
        <div className="space-y-6 sm:space-y-8 animate-pulse" aria-busy="true" aria-label="Loading analytics">
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
              {[1, 2, 3, 4, 5].map((i) => (
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
            title="No usage recorded for this period"
            description="No academic activity, lecture ingestion, or formative assessment records exist for the selected date range."
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
              <span className="font-semibold text-primary">Usage is up 14% on last week.</span>{' '}
              Activity surged to 5,820 learning tasks during Week 6 midterm formative tutorials, led by History and Engineering.
            </p>
          </div>

          {/* Component: One Headline Chart (DESIGN.md section 11 & Rule 5: No model/provider names, text alternative) */}
          <section
            aria-labelledby="headline-chart-title"
            className="bg-surface-container-lowest border border-outline-variant rounded-md p-5 sm:p-6 flex flex-col"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-outline-variant/30">
              <div>
                <h2 id="headline-chart-title" className="text-h3 font-serif font-semibold text-on-surface">
                  Weekly academic activity cadence
                </h2>
                <p className="text-caption text-on-surface-variant mt-0.5">
                  Combined volume of lecture ingestion, formative quizzes, and student inquiries.
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
              Academic activity summary: Week 1 started at 1,840 tasks, grew steadily to 3,980 in Week 4, peaked at 5,820 tasks during Week 6 midterm assessments, and currently registers 5,140 in Week 7.
            </p>

            {/* Visual View: Accessible Chart (Does not rely on color alone) */}
            {chartViewMode === 'chart' ? (
              <div className="pt-6">
                <div className="grid grid-cols-7 gap-2 sm:gap-4 items-end h-56 pt-4 pb-2 border-b border-outline-variant">
                  {mockWeeklyCadence.map((point) => {
                    const heightPct = Math.round((point.total / maxWeeklyTotal) * 100);
                    const isCurrent = point.week.includes('Current') || point.week === 'Wk 7';

                    return (
                      <div
                        key={point.week}
                        className="flex flex-col items-center justify-end h-full gap-2 group relative"
                      >
                        {/* Numeric Value Label above bar */}
                        <span className="text-[11px] sm:text-caption tabular-nums text-on-surface-variant font-medium">
                          {point.total.toLocaleString()}
                        </span>

                        {/* Bar with distinct border and pattern for non-color reliance */}
                        <div className="w-full max-w-[48px] bg-surface-container rounded-t-default relative flex flex-col justify-end overflow-hidden" style={{ height: `${heightPct}%` }}>
                          <div
                            className={`w-full h-full rounded-t-default transition-all ${
                              isCurrent
                                ? 'bg-primary border-t-2 border-primary-container'
                                : 'bg-primary/80 group-hover:bg-primary'
                            }`}
                          />
                        </div>

                        {/* Week Label */}
                        <span className={`text-[11px] sm:text-caption font-medium truncate ${isCurrent ? 'text-primary font-semibold' : 'text-on-surface-variant'}`}>
                          {point.week}
                        </span>

                        {/* Hover / Focus Details Callout */}
                        <div className="absolute bottom-full mb-2 hidden group-hover:flex group-focus-within:flex flex-col z-20 bg-surface-container-high text-on-surface p-2.5 rounded-default border border-outline-variant shadow-sm text-caption whitespace-nowrap pointer-events-none">
                          <span className="font-semibold text-on-surface">{point.label}</span>
                          <span className="text-on-surface-variant">Lectures: {point.lectures}</span>
                          <span className="text-on-surface-variant">Quizzes: {point.quizzes}</span>
                          <span className="text-on-surface-variant">Inquiries: {point.inquiries}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Visible Chart Summary sentence below chart (Text alternative requirement) */}
                <div className="pt-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-caption text-on-surface-variant">
                  <span>
                    Weekly volume grew from 1,840 tasks in Week 1 to a peak of 5,820 in Week 6, with current Week 7 at 5,140 tasks.
                  </span>
                  <div className="flex items-center gap-3 shrink-0">
                    <span className="inline-flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-xs bg-primary" aria-hidden="true" />
                      <span>Term activity volume</span>
                    </span>
                  </div>
                </div>
              </div>
            ) : (
              /* Accessible Alternative Data Table View */
              <div className="pt-4 overflow-x-auto">
                <table className="w-full text-left text-body-sm border-collapse" aria-label="Weekly activity data">
                  <thead>
                    <tr className="border-b border-outline-variant text-caption text-on-surface-variant">
                      <th scope="col" className="py-2.5 pr-4 font-medium">Academic week</th>
                      <th scope="col" className="py-2.5 px-4 font-medium text-right">Lectures processed</th>
                      <th scope="col" className="py-2.5 px-4 font-medium text-right">Quizzes calibrated</th>
                      <th scope="col" className="py-2.5 px-4 font-medium text-right">Student inquiries</th>
                      <th scope="col" className="py-2.5 pl-4 font-medium text-right">Total activity</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-outline-variant/30">
                    {mockWeeklyCadence.map((point) => (
                      <tr key={point.week} className="hover:bg-surface-container/50">
                        <td className="py-2.5 pr-4 font-medium text-on-surface">{point.label}</td>
                        <td className="py-2.5 px-4 text-right tabular-nums text-on-surface">{point.lectures.toLocaleString()}</td>
                        <td className="py-2.5 px-4 text-right tabular-nums text-on-surface">{point.quizzes.toLocaleString()}</td>
                        <td className="py-2.5 px-4 text-right tabular-nums text-on-surface">{point.inquiries.toLocaleString()}</td>
                        <td className="py-2.5 pl-4 text-right font-semibold tabular-nums text-on-surface">{point.total.toLocaleString()}</td>
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
              title="Departmental activity breakdown"
              subtitle="Volume, curriculum coverage, and engagement growth across collegiate faculties."
              columns={columns}
              data={mockDepartmentUsage}
              keyExtractor={(row) => row.department}
            />
          </section>
        </>
      )}
    </div>
  );
}

export default function AiUsagePage() {
  return (
    <Suspense fallback={<div className="p-8 max-w-7xl mx-auto min-h-dvh" />}>
      <AiUsageContent />
    </Suspense>
  );
}
