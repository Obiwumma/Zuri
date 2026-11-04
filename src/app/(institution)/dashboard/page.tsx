'use client';

import React, { useState, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import {
  KpiTile,
  DataTable,
  type Column,
  Button,
  EmptyState,
  Skeleton,
  Alert,
  Badge,
} from '@/components/ui';
import {
  School,
  Users,
  AlertCircle,
  CheckCircle2,
  RefreshCw,
  SlidersHorizontal,
  BookOpen,
  Clock,
  ArrowRight,
  Database,
} from 'lucide-react';

export type DashboardState = 'default' | 'loading' | 'empty' | 'error';

interface DivisionData {
  division: string;
  subfields: string;
  enrolment: string;
  curriculumIngestedPct: number;
  weeklyInterventions: string;
  interventionsStatus: string;
  quizMastery: string;
  contact: string;
}

interface ActivityItem {
  id: string;
  title: string;
  category: string;
  description: string;
  timestamp: string;
  status: 'neutral' | 'success' | 'warning';
}

const mockDivisions: DivisionData[] = [
  {
    division: 'Humanities Division',
    subfields: 'Philosophy, History, Classics & Literature',
    enrolment: '4,810',
    curriculumIngestedPct: 96.8,
    weeklyInterventions: '31 alerts',
    interventionsStatus: '100% triaged',
    quizMastery: '89.2%',
    contact: 'Prof. Alistair MacIntyre',
  },
  {
    division: 'Mathematical, Physical & Life Sciences',
    subfields: 'Engineering, Physics, Computer Science, Maths',
    enrolment: '5,420',
    curriculumIngestedPct: 92.4,
    weeklyInterventions: '54 alerts',
    interventionsStatus: '8 pending tutor review',
    quizMastery: '84.8%',
    contact: 'Dr. Fiona Campbell',
  },
  {
    division: 'Medical Sciences Division',
    subfields: 'Clinical Medicine, Pharmacology, Neuroscience',
    enrolment: '3,650',
    curriculumIngestedPct: 98.1,
    weeklyInterventions: '38 alerts',
    interventionsStatus: '4 under review',
    quizMastery: '91.4%',
    contact: 'Prof. Kenneth Thorne',
  },
  {
    division: 'Social Sciences Division',
    subfields: 'Law, Economics, Politics & International Relations',
    enrolment: '4,540',
    curriculumIngestedPct: 95.0,
    weeklyInterventions: '19 alerts',
    interventionsStatus: '100% resolved',
    quizMastery: '88.1%',
    contact: 'Dr. Harriet Vane-Smythe',
  },
];

const mockActivities: ActivityItem[] = [
  {
    id: 'act-1',
    title: 'Cellular signalling anomaly in BIO-410',
    category: 'Intervention surfaced',
    description: '18 tutorial students flagged for receptor pathway remediation before seminar.',
    timestamp: '18 min ago',
    status: 'warning',
  },
  {
    id: 'act-2',
    title: 'Late Imperial Diplomacy (HIST-204)',
    category: 'Lecture indexed',
    description: 'Audio and transcript parsed into course syllabus graph with 48 concepts extracted.',
    timestamp: '42 min ago',
    status: 'success',
  },
  {
    id: 'act-3',
    title: 'Logic & dialectic adaptive problem set',
    category: 'Formative assessment',
    description: '12-question quiz calibrated against Michaelmas term milestones across 14 colleges.',
    timestamp: '1 hour ago',
    status: 'neutral',
  },
  {
    id: 'act-4',
    title: 'Examination timetable matrix reconciled',
    category: 'Schedule verified',
    description: '42 tutorial conflict checks completed across examination halls with zero collisions.',
    timestamp: '3 hours ago',
    status: 'success',
  },
];

function InstitutionDashboardContent() {
  const searchParams = useSearchParams();
  const showHarness = searchParams.get('states') === '1';

  const [state, setState] = useState<DashboardState>('default');
  const [selectedTerm, setSelectedTerm] = useState('Michaelmas Term 2024–25');
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setIsRefreshing(false);
    }, 800);
  };

  const divisionColumns: Column<DivisionData>[] = [
    {
      header: 'Academic division',
      isTitle: true,
      accessor: (row) => (
        <div className="flex flex-col min-w-0">
          <span className="font-medium text-on-surface">{row.division}</span>
          <span className="text-caption text-on-surface-variant truncate">{row.subfields}</span>
        </div>
      ),
    },
    {
      header: 'Enrolment',
      numeric: true,
      isKeyField: true,
      accessor: (row) => (
        <span className="text-on-surface font-medium tabular-nums">{row.enrolment}</span>
      ),
    },
    {
      header: 'Curriculum ingested',
      numeric: true,
      accessor: (row) => (
        <div className="inline-flex items-center gap-2">
          <span className="text-on-surface font-medium tabular-nums">{row.curriculumIngestedPct}%</span>
          <div className="w-16 bg-surface-container rounded-full h-1.5 hidden sm:block overflow-hidden">
            <div
              className="bg-primary h-full rounded-full transition-all"
              style={{ width: `${row.curriculumIngestedPct}%` }}
            />
          </div>
        </div>
      ),
    },
    {
      header: 'Interventions',
      isKeyField: true,
      accessor: (row) => (
        <div className="flex flex-col">
          <span className="text-on-surface font-medium">{row.weeklyInterventions}</span>
          <span className="text-caption text-on-surface-variant">{row.interventionsStatus}</span>
        </div>
      ),
    },
    {
      header: 'Lead contact',
      accessor: (row) => (
        <span className="text-on-surface-variant text-body-sm">{row.contact}</span>
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
              Overview states:
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

      {/* Page Header (DESIGN.md section 11: Overview template) */}
      <header className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-4 border-b border-outline-variant/40">
        <div className="min-w-0 flex-1">
          <h1 className="text-2xl sm:text-3xl font-serif font-semibold text-on-surface tracking-tight">
            Academic overview
          </h1>
          <p className="text-body-sm text-on-surface-variant mt-1 max-w-2xl">
            Snapshot of student activity, academic divisions, and tutorial interventions.
          </p>
        </div>

        {/* Header Right Actions */}
        <div className="flex flex-wrap sm:flex-nowrap items-center gap-2.5 shrink-0 w-full sm:w-auto">
          <div className="relative flex-1 sm:flex-initial min-w-[200px]">
            <select
              aria-label="Academic term selector"
              value={selectedTerm}
              onChange={(e) => setSelectedTerm(e.target.value)}
              className="w-full h-10 px-3 pr-8 bg-surface-container-lowest border border-outline text-on-surface text-body-sm rounded-default outline-none focus-visible:focus-ring cursor-pointer hover:border-on-surface-variant transition-colors"
            >
              <option value="Michaelmas Term 2024–25">Michaelmas Term 2024–25</option>
              <option value="Hilary Term 2024–25">Hilary Term 2024–25</option>
              <option value="Trinity Term 2023–24">Trinity Term 2023–24</option>
            </select>
          </div>
          <Button
            variant="secondary"
            onClick={handleRefresh}
            isLoading={isRefreshing}
            className="flex-1 sm:flex-initial"
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} aria-hidden="true" />
            <span>Refresh</span>
          </Button>
        </div>
      </header>

      {/* State: Error */}
      {state === 'error' && (
        <Alert
          variant="error"
          title="Unable to load academic signals"
          description="We encountered a problem loading your collegiate overview. Check your connection and try again."
          action={
            <Button variant="secondary" size="sm" onClick={() => setState('default')}>
              Try again
            </Button>
          }
        />
      )}

      {/* State: Loading (Skeleton Overview) */}
      {state === 'loading' && (
        <div className="space-y-6 sm:space-y-8 animate-pulse" aria-busy="true" aria-label="Loading overview">
          {/* 4 Skeleton KPI Tiles */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="bg-surface-container-lowest p-4 md:p-5 rounded-md border border-outline-variant flex flex-col justify-between h-32"
              >
                <div className="flex justify-between items-center">
                  <Skeleton className="h-3 w-20" />
                  <Skeleton variant="circular" className="w-5 h-5" />
                </div>
                <Skeleton className="h-8 w-24 my-2" />
                <Skeleton className="h-3 w-32" />
              </div>
            ))}
          </div>

          {/* Primary Table & Secondary Panel Skeletons */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            <div className="lg:col-span-8 bg-surface-container-lowest p-5 md:p-6 rounded-md border border-outline-variant space-y-4">
              <Skeleton className="h-6 w-48" />
              <Skeleton className="h-4 w-72" />
              <div className="space-y-3 pt-2">
                {[1, 2, 3, 4].map((i) => (
                  <Skeleton key={i} className="h-12 w-full rounded-default" />
                ))}
              </div>
            </div>
            <div className="lg:col-span-4 bg-surface-container-lowest p-5 md:p-6 rounded-md border border-outline-variant space-y-4">
              <Skeleton className="h-6 w-36" />
              <div className="space-y-3 pt-2">
                {[1, 2, 3, 4].map((i) => (
                  <Skeleton key={i} className="h-16 w-full rounded-default" />
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* State: Empty */}
      {state === 'empty' && (
        <div className="space-y-6 sm:space-y-8">
          {/* KPI grid showing empty values */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
            <KpiTile label="Enrolled students" value="0" icon={School} subtext="No students enrolled yet" />
            <KpiTile label="Active lecturers" value="0" icon={Users} subtext="No faculty members invited" />
            <KpiTile label="Weekly interventions" value="0" icon={AlertCircle} subtext="Zero active alerts" />
            <KpiTile label="Quiz mastery" value="—" icon={CheckCircle2} subtext="Assessments not started" />
          </div>

          <div className="bg-surface-container-lowest rounded-md border border-outline-variant p-8 md:p-12">
            <EmptyState
              icon={Database}
              title="No academic activity recorded yet"
              description="Connect your department syllabi or import student rosters to start observing division signals and tutorial interventions."
              action={
                <Button variant="primary" onClick={() => setState('default')}>
                  Import division data
                </Button>
              }
            />
          </div>
        </div>
      )}

      {/* State: Default (Populated Overview) */}
      {state === 'default' && (
        <>
          {/* Component: 4 KPI Tiles Max (grid-cols-2 mobile, lg:grid-cols-4, no fixed widths, no wrap) */}
          <section aria-label="Key institutional indicators">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
              <KpiTile
                label="Enrolled students"
                value="18,420"
                delta={{ value: '+2.4%', direction: 'up' }}
                icon={School}
                subtext="Enrolled across 38 colleges & faculties"
              />
              <KpiTile
                label="Active lecturers"
                value="1,248"
                delta={{ value: '94.2%', direction: 'neutral' }}
                icon={Users}
                subtext="412 tutorial fellows active today"
              />
              <KpiTile
                label="Weekly interventions"
                value="142"
                delta={{ value: '-18% wk 5', direction: 'down' }}
                icon={AlertCircle}
                subtext="76% resolved within 48h protocol"
              />
              <KpiTile
                label="Quiz mastery"
                value="87.6%"
                delta={{ value: '+3.1%', direction: 'up' }}
                icon={CheckCircle2}
                subtext="Across formative module assessments"
              />
            </div>
          </section>

          {/* Component: One Primary Table and One Secondary Panel (No more than that!) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Primary Table (8 columns on lg) */}
            <section className="lg:col-span-8 flex flex-col">
              <DataTable
                title="Academic division health"
                subtitle="Curriculum ingestion, active enrollment, and intervention triage across collegiate divisions."
                columns={divisionColumns}
                data={mockDivisions}
                keyExtractor={(row) => row.division}
              />
            </section>

            {/* Secondary Panel: Activity Feed (4 columns on lg) */}
            <section
              aria-label="Recent academic activity"
              className="lg:col-span-4 bg-surface-container-lowest rounded-md border border-outline-variant p-4 md:p-6 flex flex-col"
            >
              <div className="flex items-center justify-between pb-4 border-b border-outline-variant/30">
                <div>
                  <h2 className="text-h3 font-serif font-semibold text-on-surface">
                    Recent activity
                  </h2>
                  <p className="text-caption text-on-surface-variant mt-0.5">
                    Priority academic events and alerts
                  </p>
                </div>
                <Clock className="w-4 h-4 text-on-surface-variant shrink-0" aria-hidden="true" />
              </div>

              {/* Activity List */}
              <div className="divide-y divide-outline-variant/20">
                {mockActivities.map((item) => (
                  <article key={item.id} className="py-3.5 first:pt-4 last:pb-2">
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <span className="text-caption font-medium text-on-surface-variant">
                        {item.category}
                      </span>
                      <time className="text-caption text-on-surface-variant/80">
                        {item.timestamp}
                      </time>
                    </div>
                    <h3 className="text-body-sm font-semibold text-on-surface leading-snug">
                      {item.title}
                    </h3>
                    <p className="text-caption text-on-surface-variant mt-1 leading-normal">
                      {item.description}
                    </p>
                  </article>
                ))}
              </div>

              {/* Panel Footer */}
              <div className="pt-4 mt-2 border-t border-outline-variant/30">
                <Link
                  href="/activity"
                  className="inline-flex items-center gap-1.5 text-body-sm font-medium text-primary hover:underline outline-none focus-visible:focus-ring rounded-xs"
                >
                  <span>View all institutional activity</span>
                  <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
                </Link>
              </div>
            </section>
          </div>
        </>
      )}
    </div>
  );
}

export default function InstitutionDashboardPage() {
  return (
    <Suspense fallback={<div className="p-8 max-w-7xl mx-auto min-h-dvh" />}>
      <InstitutionDashboardContent />
    </Suspense>
  );
}
