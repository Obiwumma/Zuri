'use client';

import React, { useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import {
  ScrollText,
  Search,
  Filter,
  SlidersHorizontal,
  Download,
  Calendar,
  Clock,
  User,
  Shield,
  CheckCircle2,
  AlertTriangle,
  X,
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
} from '@/components/ui';

export type ActivityPageState = 'default' | 'loading' | 'empty' | 'error';

interface ActivityItem {
  id: string;
  timeAgo: string;
  timestamp: string;
  category: 'Intervention' | 'Knowledge ingest' | 'Assessment' | 'Supervision' | 'Governance';
  title: string;
  division: string;
  moduleCode: string;
  description: string;
  statusBadge: string;
  contact: string;
  actorRole: string;
}

function ActivityContent() {
  const searchParams = useSearchParams();
  const showHarness = process.env.NODE_ENV !== 'production' && searchParams.get('states') === '1';

  const [harnessState, setHarnessState] = useState<ActivityPageState>('default');
  const [activeCategory, setActiveCategory] = useState('all');
  const [activeDivision, setActiveDivision] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(1);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const activities: ActivityItem[] = [
    {
      id: 'ACT-9041',
      timeAgo: '12m ago',
      timestamp: '24 Oct 2024, 15:42 UTC',
      category: 'Intervention',
      title: 'Diagnostic anomaly flagged for tutorial remediation',
      division: 'Medical Sciences Division',
      moduleCode: 'BIO-410',
      description: '18 students flagged for receptor pathway remediation prior to collections.',
      statusBadge: 'Urgent triage',
      contact: 'Prof. Alistair MacIntyre',
      actorRole: 'Senior Tutor',
    },
    {
      id: 'ACT-9040',
      timeAgo: '28m ago',
      timestamp: '24 Oct 2024, 15:26 UTC',
      category: 'Knowledge ingest',
      title: 'Lecture transcript and primary source corpus ingested',
      division: 'Humanities Division',
      moduleCode: 'HIST-302',
      description: 'Diplomatic relations primary corpus ingested and semantically mapped into concept graph.',
      statusBadge: 'Ingestion complete',
      contact: 'Dr. Helena Vance',
      actorRole: 'Faculty Lecturer',
    },
    {
      id: 'ACT-9039',
      timeAgo: '45m ago',
      timestamp: '24 Oct 2024, 15:09 UTC',
      category: 'Assessment',
      title: 'Quantum information formative assessment submitted',
      division: 'MPLS Division',
      moduleCode: 'CS-501',
      description: '142 students completed formative diagnostic milestone with 91.2% threshold mastery.',
      statusBadge: 'Verified',
      contact: 'Prof. Sarah Jenkins',
      actorRole: 'Convening Professor',
    },
    {
      id: 'ACT-9038',
      timeAgo: '1h ago',
      timestamp: '24 Oct 2024, 14:54 UTC',
      category: 'Supervision',
      title: 'Michaelmas tutorial supervision allocation review',
      division: 'Social Sciences Division',
      moduleCode: 'ECON-204',
      description: 'Tutorial Group 4 supervision hours verified and logged by Senior Tutor with zero remediation flags.',
      statusBadge: 'Triaged',
      contact: 'Dr. Marcus Holloway',
      actorRole: 'Head of Department',
    },
    {
      id: 'ACT-9037',
      timeAgo: '2h ago',
      timestamp: '24 Oct 2024, 13:54 UTC',
      category: 'Governance',
      title: 'Statute VI teaching allocation review logged',
      division: 'University Secretariat',
      moduleCode: 'GOV-001',
      description: 'Formal record of Congregation review on collegiate tutorial quotas entered into university minutes.',
      statusBadge: 'Recorded',
      contact: 'University Registrar',
      actorRole: 'Administrator',
    },
  ];

  const filteredActivities = activities.filter((item) => {
    if (activeCategory !== 'all' && item.category !== activeCategory) return false;
    if (activeDivision !== 'all' && item.division !== activeDivision) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        item.title.toLowerCase().includes(q) ||
        item.description.toLowerCase().includes(q) ||
        item.moduleCode.toLowerCase().includes(q) ||
        item.contact.toLowerCase().includes(q) ||
        item.id.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const columns: Column<ActivityItem>[] = [
    {
      header: 'Event ID and time',
      isTitle: true,
      accessor: (row) => (
        <div className="flex flex-col py-0.5">
          <span className="font-mono text-body-sm font-semibold text-on-surface">
            {row.id}
          </span>
          <span className="text-caption text-on-surface-variant">
            {row.timeAgo} • {row.timestamp}
          </span>
        </div>
      ),
    },
    {
      header: 'Category',
      isKeyField: true,
      accessor: (row) => (
        <span
          className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-caption font-medium select-none ${
            row.category === 'Intervention'
              ? 'bg-warning-container text-warning font-semibold'
              : row.category === 'Governance'
              ? 'bg-primary-fixed text-primary font-semibold'
              : 'bg-surface-container text-on-surface'
          }`}
        >
          {row.category}
        </span>
      ),
    },
    {
      header: 'Activity and description',
      accessor: (row) => (
        <div className="flex flex-col max-w-md py-0.5">
          <span className="font-medium text-body-sm text-on-surface leading-snug">
            {row.title}
          </span>
          <p className="text-caption text-on-surface-variant truncate mt-0.5">
            {row.description}
          </p>
        </div>
      ),
    },
    {
      header: 'Division and module',
      accessor: (row) => (
        <div className="flex flex-col">
          <span className="font-mono text-body-sm text-primary font-medium">
            {row.moduleCode}
          </span>
          <span className="text-caption text-on-surface-variant">
            {row.division}
          </span>
        </div>
      ),
    },
    {
      header: 'Actor and role',
      accessor: (row) => (
        <div className="flex flex-col">
          <span className="font-medium text-body-sm text-on-surface">
            {row.contact}
          </span>
          <span className="text-caption text-on-surface-variant">
            {row.actorRole}
          </span>
        </div>
      ),
    },
    {
      header: 'Status',
      isKeyField: true,
      accessor: (row) => (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-caption bg-surface-container text-on-surface-variant font-medium">
          {row.statusBadge}
        </span>
      ),
    },
  ];

  return (
    <div className="w-full flex flex-col gap-6 p-4 sm:p-6 lg:p-8 max-w-[1280px] mx-auto text-on-surface">
      {/* Dev-only Testing States Harness */}
      {showHarness && (
        <aside
          aria-label="Testing states harness"
          className="p-2.5 rounded-md bg-surface-container-high border border-outline-variant/60 text-caption flex flex-wrap items-center justify-between gap-2"
        >
          <div className="flex items-center gap-1.5 font-medium text-on-surface">
            <SlidersHorizontal className="w-3.5 h-3.5 text-primary" aria-hidden="true" />
            <span>Audit log states</span>
          </div>
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => setHarnessState('default')}
              className={`px-2 py-0.5 rounded text-caption transition-colors cursor-pointer ${
                harnessState === 'default'
                  ? 'bg-primary text-on-primary font-semibold'
                  : 'text-on-surface-variant hover:bg-surface-container-highest'
              }`}
            >
              Default
            </button>
            <button
              type="button"
              onClick={() => setHarnessState('loading')}
              className={`px-2 py-0.5 rounded text-caption transition-colors cursor-pointer ${
                harnessState === 'loading'
                  ? 'bg-primary text-on-primary font-semibold'
                  : 'text-on-surface-variant hover:bg-surface-container-highest'
              }`}
            >
              Loading
            </button>
            <button
              type="button"
              onClick={() => setHarnessState('empty')}
              className={`px-2 py-0.5 rounded text-caption transition-colors cursor-pointer ${
                harnessState === 'empty'
                  ? 'bg-primary text-on-primary font-semibold'
                  : 'text-on-surface-variant hover:bg-surface-container-highest'
              }`}
            >
              Empty
            </button>
            <button
              type="button"
              onClick={() => setHarnessState('error')}
              className={`px-2 py-0.5 rounded text-caption transition-colors cursor-pointer ${
                harnessState === 'error'
                  ? 'bg-primary text-on-primary font-semibold'
                  : 'text-on-surface-variant hover:bg-surface-container-highest'
              }`}
            >
              Error
            </button>
          </div>
        </aside>
      )}

      {/* Header section (List template: h1 Newsreader, one-line description, right primary action) */}
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-outline-variant/40">
        <div className="flex flex-col">
          <h1 className="text-2xl sm:text-3xl font-serif text-on-surface font-medium tracking-tight">
            Audit logs
          </h1>
          <p className="text-body-sm text-on-surface-variant mt-1">
            Immutable ledger of academic governance, syllabus changes, role assignments, and session events.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="secondary"
            onClick={() => {
              setToastMessage('Exporting signed audit ledger in CSV format...');
              setTimeout(() => setToastMessage(null), 3000);
            }}
            className="w-full sm:w-auto h-11 sm:h-10 text-body-sm"
          >
            <Download className="w-4 h-4 mr-1.5" />
            Export audit log
          </Button>
        </div>
      </header>

      {/* Toast banner */}
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
          title="Failed to load audit records"
          description="Unable to retrieve immutable activity log from the ledger service. Check permissions and retry."
          action={<Button variant="secondary" onClick={() => setHarnessState('default')}>Try again</Button>}
        />
      )}

      {/* State: Loading */}
      {harnessState === 'loading' && (
        <div className="flex flex-col gap-4" aria-busy="true">
          <Skeleton className="h-12 rounded-md" />
          <Skeleton className="h-80 rounded-md" />
        </div>
      )}

      {/* State: Empty */}
      {harnessState === 'empty' && (
        <EmptyState
          icon={ScrollText}
          title="No audit log events found"
          description="There are no governance or academic events matching your current filter criteria."
          action={
            <Button
              variant="secondary"
              onClick={() => {
                setSearchQuery('');
                setActiveCategory('all');
                setActiveDivision('all');
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
          <section className="bg-surface-container-lowest rounded-md border border-outline-variant p-3.5 flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2.5 flex-1 min-w-[260px]">
              {/* Search input */}
              <div className="relative flex items-center bg-surface px-3 py-1.5 rounded-sm border border-outline-variant flex-1 max-w-sm">
                <Search className="w-4 h-4 text-on-surface-variant mr-2 shrink-0" aria-hidden="true" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Filter by event, actor, module..."
                  className="bg-transparent text-body-sm text-on-surface placeholder:text-text-placeholder focus:outline-none w-full"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery('')}
                    className="text-on-surface-variant hover:text-on-surface"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* Category dropdown */}
              <select
                value={activeCategory}
                onChange={(e) => setActiveCategory(e.target.value)}
                className="bg-surface text-body-sm text-on-surface px-3 py-1.5 rounded-sm border border-outline-variant focus:outline-none cursor-pointer"
              >
                <option value="all">All categories</option>
                <option value="Intervention">Intervention</option>
                <option value="Knowledge ingest">Knowledge ingest</option>
                <option value="Assessment">Assessment</option>
                <option value="Supervision">Supervision</option>
                <option value="Governance">Governance</option>
              </select>

              {/* Division dropdown */}
              <select
                value={activeDivision}
                onChange={(e) => setActiveDivision(e.target.value)}
                className="bg-surface text-body-sm text-on-surface px-3 py-1.5 rounded-sm border border-outline-variant focus:outline-none cursor-pointer"
              >
                <option value="all">All divisions</option>
                <option value="Medical Sciences Division">Medical Sciences</option>
                <option value="Humanities Division">Humanities</option>
                <option value="MPLS Division">MPLS Division</option>
                <option value="Social Sciences Division">Social Sciences</option>
                <option value="University Secretariat">Secretariat</option>
              </select>
            </div>

            <span className="text-caption text-on-surface-variant font-medium">
              {filteredActivities.length} audit entries
            </span>
          </section>

          {/* Main DataTable */}
          <section className="bg-surface-container-lowest rounded-md border border-outline-variant overflow-hidden">
            <DataTable
              columns={columns}
              data={filteredActivities}
              keyExtractor={(row) => row.id}
              className="border-0 rounded-none"
            />

            {/* Pagination Controls (List template requirement) */}
            <div className="p-3.5 border-t border-outline-variant/40 flex items-center justify-between text-caption text-on-surface-variant">
              <span>Showing 1 to {filteredActivities.length} of {filteredActivities.length} entries</span>
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  disabled={page === 1}
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  className="px-2.5 py-1 rounded-sm border border-outline-variant bg-surface-container text-on-surface disabled:opacity-40 cursor-pointer disabled:cursor-not-allowed"
                >
                  <ChevronLeft className="w-3.5 h-3.5 inline mr-1" />
                  Previous
                </button>
                <span className="px-2 font-mono text-on-surface">Page {page}</span>
                <button
                  type="button"
                  disabled={true}
                  className="px-2.5 py-1 rounded-sm border border-outline-variant bg-surface-container text-on-surface disabled:opacity-40 cursor-not-allowed"
                >
                  Next
                  <ChevronRight className="w-3.5 h-3.5 inline ml-1" />
                </button>
              </div>
            </div>
          </section>
        </>
      )}
    </div>
  );
}

export default function AcademicActivityPage() {
  return (
    <Suspense fallback={<div className="p-8 text-caption text-on-surface-variant">Loading audit logs...</div>}>
      <ActivityContent />
    </Suspense>
  );
}
