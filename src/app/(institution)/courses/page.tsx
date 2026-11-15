'use client';

import React, { useState, useMemo, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import {
  DataTable,
  type Column,
  Button,
  Badge,
  EmptyState,
  Skeleton,
  Alert,
  DetailDrawer,
} from '@/components/ui';
import {
  Search,
  X,
  Plus,
  SlidersHorizontal,
  ChevronLeft,
  ChevronRight,
  BookOpen,
  Filter,
} from 'lucide-react';

export type CoursesPageState = 'default' | 'loading' | 'empty' | 'error';

export interface CourseRecord {
  code: string;
  title: string;
  subtitle: string;
  department: string;
  division: string;
  leadName: string;
  leadInitials: string;
  college: string;
  enrolledCount: number;
  enrolledDetail: string;
  status: 'Active' | 'Upcoming' | 'Archived';
  masteryPct: string;
  masteryStatus: string;
  lectureCadence: string;
  hallLocation: string;
}

const mockCourses: CourseRecord[] = [
  {
    code: 'ENG-320',
    title: 'Advanced Fluid Dynamics',
    subtitle: 'Navier-Stokes solutions & boundary layer turbulence',
    department: 'Dept. of Engineering Science',
    division: 'MPLS Division',
    leadName: 'Prof. Alistair Montgomery',
    leadInitials: 'AM',
    college: 'Christ Church',
    enrolledCount: 412,
    enrolledDetail: '14 tutorial groups',
    status: 'Active',
    masteryPct: '61.5%',
    masteryStatus: 'Needs Review',
    lectureCadence: 'Tues & Thurs • 10:00 AM',
    hallLocation: 'Exam Schools Hall 4',
  },
  {
    code: 'HIST-204',
    title: 'Late Imperial Diplomacy (1870–1914)',
    subtitle: 'Bismarckian alliances & Great Power rivalry',
    department: 'Faculty of History',
    division: 'Humanities Division',
    leadName: 'Dr. Clara Sterling',
    leadInitials: 'CS',
    college: 'Balliol College',
    enrolledCount: 285,
    enrolledDetail: '8 college seminars',
    status: 'Active',
    masteryPct: '88.2%',
    masteryStatus: 'Exemplary',
    lectureCadence: 'Mon & Wed • 11:00 AM',
    hallLocation: 'Schools Lecture Room 2',
  },
  {
    code: 'BIO-410',
    title: 'Cellular Signalling & Genomic Medicine',
    subtitle: 'Phosphorylation cascades & targeted therapeutics',
    department: 'Dept. of Biochemistry',
    division: 'Medical Sciences',
    leadName: 'Prof. Rowan Thorne',
    leadInitials: 'RT',
    college: 'Magdalen College',
    enrolledCount: 194,
    enrolledDetail: '6 wet labs',
    status: 'Upcoming',
    masteryPct: '74.1%',
    masteryStatus: 'Nominal',
    lectureCadence: 'Wed & Fri • 09:00 AM',
    hallLocation: 'Medical Sciences Teaching Centre',
  },
  {
    code: 'PHIL-101',
    title: 'Formal Logic & Dialectic',
    subtitle: 'Fregean semantics, Gödel completeness & proof theory',
    department: 'Faculty of Philosophy',
    division: 'Humanities Division',
    leadName: 'Dr. Aris Thorne',
    leadInitials: 'AT',
    college: 'New College',
    enrolledCount: 520,
    enrolledDetail: '22 college tutorials',
    status: 'Active',
    masteryPct: '82.9%',
    masteryStatus: 'Exemplary',
    lectureCadence: 'Tues & Thurs • 14:00 PM',
    hallLocation: 'Radcliffe Humanities Auditorium',
  },
  {
    code: 'MATH-210',
    title: 'Linear Algebra & Spectral Theory',
    subtitle: 'Eigenvalue decompositions and infinite dimensional spaces',
    department: 'Mathematical Institute',
    division: 'MPLS Division',
    leadName: 'Prof. Keith Sutherland',
    leadInitials: 'KS',
    college: "St John's College",
    enrolledCount: 680,
    enrolledDetail: 'Prelims cohort',
    status: 'Active',
    masteryPct: '70.4%',
    masteryStatus: 'Nominal',
    lectureCadence: 'Mon, Wed, Fri • 10:00 AM',
    hallLocation: 'Mathematical Institute L1',
  },
  {
    code: 'LAW-105',
    title: 'Constitutional Jurisprudence',
    subtitle: 'Parliamentary sovereignty & administrative judicial review',
    department: 'Faculty of Law',
    division: 'Social Sciences',
    leadName: 'Baroness Helena Cross',
    leadInitials: 'HC',
    college: 'Trinity College',
    enrolledCount: 310,
    enrolledDetail: '10 collegiate moot courts',
    status: 'Active',
    masteryPct: '91.2%',
    masteryStatus: 'Exemplary',
    lectureCadence: 'Tues & Fri • 11:00 AM',
    hallLocation: 'Gulbenkian Lecture Theatre',
  },
  {
    code: 'COMP-501',
    title: 'Automated Reasoning & Proofs',
    subtitle: 'SAT/SMT solvers and interactive theorem proving',
    department: 'Dept. of Computer Science',
    division: 'MPLS Division',
    leadName: 'Dr. Vivek Ramanujan',
    leadInitials: 'VR',
    college: 'Wadham College',
    enrolledCount: 84,
    enrolledDetail: 'MSc advanced module',
    status: 'Archived',
    masteryPct: '64.0%',
    masteryStatus: 'In Review',
    lectureCadence: 'Thurs • 14:00 PM',
    hallLocation: 'Wolfson Building Room 101',
  },
  {
    code: 'ARCH-102',
    title: 'Classical Greek Epigraphy',
    subtitle: 'Attic inscriptions and monetary policy of the Delian League',
    department: 'Faculty of Classics',
    division: 'Humanities Division',
    leadName: 'Prof. Daphne Sterling',
    leadInitials: 'DS',
    college: 'Merton College',
    enrolledCount: 118,
    enrolledDetail: 'Ashmolean collection practicum',
    status: 'Active',
    masteryPct: '79.6%',
    masteryStatus: 'Nominal',
    lectureCadence: 'Wed • 14:00 PM',
    hallLocation: 'Ashmolean Museum Seminar Room',
  },
];

function CoursesContent() {
  const searchParams = useSearchParams();
  const showHarness = process.env.NODE_ENV !== 'production' && searchParams.get('states') === '1';

  const [state, setState] = useState<CoursesPageState>('default');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDivision, setSelectedDivision] = useState('All');
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 8;

  const filteredCourses = useMemo(() => {
    return mockCourses.filter((course) => {
      const query = searchQuery.toLowerCase().trim();
      const matchesSearch =
        query === '' ||
        course.code.toLowerCase().includes(query) ||
        course.title.toLowerCase().includes(query) ||
        course.leadName.toLowerCase().includes(query) ||
        course.college.toLowerCase().includes(query) ||
        course.department.toLowerCase().includes(query);

      const matchesDivision =
        selectedDivision === 'All' || course.division.includes(selectedDivision);

      const matchesStatus =
        selectedStatus === 'All' || course.status === selectedStatus;

      return matchesSearch && matchesDivision && matchesStatus;
    });
  }, [searchQuery, selectedDivision, selectedStatus]);

  const hasActiveFilters =
    searchQuery.trim() !== '' || selectedDivision !== 'All' || selectedStatus !== 'All';

  const resetFilters = () => {
    setSearchQuery('');
    setSelectedDivision('All');
    setSelectedStatus('All');
    setCurrentPage(1);
  };

  const columns: Column<CourseRecord>[] = [
    {
      header: 'Course & curriculum',
      isTitle: true,
      accessor: (row) => (
        <div className="flex flex-col min-w-0 py-0.5">
          <div className="flex items-center gap-2">
            <span className="font-mono text-caption px-2 py-0.5 rounded-sm bg-surface-container font-semibold text-primary">
              {row.code}
            </span>
            <span className="font-semibold text-on-surface text-body-sm truncate">
              {row.title}
            </span>
          </div>
          <span className="text-caption text-on-surface-variant truncate mt-0.5">
            {row.subtitle}
          </span>
        </div>
      ),
    },
    {
      header: 'Faculty lead',
      accessor: (row) => (
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-7 h-7 rounded-full bg-primary text-on-primary font-semibold text-[11px] flex items-center justify-center shrink-0">
            {row.leadInitials}
          </div>
          <div className="flex flex-col min-w-0">
            <span className="text-body-sm font-medium text-on-surface truncate">
              {row.leadName}
            </span>
            <span className="text-caption text-on-surface-variant truncate">
              {row.college}
            </span>
          </div>
        </div>
      ),
    },
    {
      header: 'Department',
      accessor: (row) => (
        <div className="flex flex-col min-w-0">
          <span className="text-body-sm text-on-surface truncate">
            {row.department}
          </span>
          <span className="text-caption text-on-surface-variant truncate">
            {row.division}
          </span>
        </div>
      ),
    },
    {
      header: 'Enrollment',
      numeric: true,
      isKeyField: true,
      accessor: (row) => (
        <div className="flex flex-col items-end">
          <span className="tabular-nums font-semibold text-on-surface text-body-sm">
            {row.enrolledCount.toLocaleString()}
          </span>
          <span className="text-caption text-on-surface-variant">
            {row.enrolledDetail}
          </span>
        </div>
      ),
    },
    {
      header: 'Mastery rate',
      numeric: true,
      accessor: (row) => (
        <div className="flex flex-col items-end">
          <span className="tabular-nums font-semibold text-primary text-body-sm">
            {row.masteryPct}
          </span>
          <span className="text-caption text-on-surface-variant">
            {row.masteryStatus}
          </span>
        </div>
      ),
    },
    {
      header: 'Status',
      isKeyField: true,
      accessor: (row) => (
        <Badge
          variant={
            row.status === 'Active'
              ? 'success'
              : row.status === 'Upcoming'
              ? 'info'
              : 'neutral'
          }
        >
          {row.status}
        </Badge>
      ),
    },
  ];

  // Progressive disclosure: the table keeps only what's needed to find a
  // record; every other column opens in the detail drawer on row click.
  const [selected, setSelected] = useState<CourseRecord | null>(null);
  // Minimal one-line rows: code + title, lead, enrolment, status.
  // Description, college, department, cohort detail, mastery and timetable
  // details are all in the drawer.
  const tableColumns: Column<CourseRecord>[] = [
    {
      header: 'Course',
      isTitle: true,
      accessor: (row) => (
        <div className="flex items-center gap-2 min-w-0">
          <span className="font-mono text-caption px-2 py-0.5 rounded-sm bg-surface-container font-semibold text-primary shrink-0">
            {row.code}
          </span>
          <span className="font-semibold text-on-surface text-body-sm truncate">{row.title}</span>
        </div>
      ),
    },
    {
      header: 'Faculty lead',
      accessor: (row) => (
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-7 h-7 rounded-full bg-primary text-on-primary font-semibold text-[11px] flex items-center justify-center shrink-0">
            {row.leadInitials}
          </div>
          <span className="text-body-sm font-medium text-on-surface truncate">{row.leadName}</span>
        </div>
      ),
    },
    {
      header: 'Enrolled',
      numeric: true,
      isKeyField: true,
      accessor: (row) => (
        <span className="tabular-nums font-semibold text-on-surface text-body-sm">
          {row.enrolledCount.toLocaleString()}
        </span>
      ),
    },
    columns.find((c) => c.header === 'Status')!,
  ];

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6 sm:space-y-8">
      {/* Dev State Simulation Harness Bar (only when ?states=1) */}
      {showHarness && (
        <aside aria-label="Development test harness" className="w-full">
          <div className="bg-surface-container-high border border-outline-variant rounded-default p-2 flex flex-wrap items-center justify-between gap-2 text-caption">
            <span className="text-on-surface-variant font-medium flex items-center gap-1.5">
              <SlidersHorizontal className="w-3.5 h-3.5" aria-hidden="true" />
              Courses states:
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

      {/* Page Header (DESIGN.md section 11: List template) */}
      <header className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-4 border-b border-outline-variant/40">
        <div className="min-w-0 flex-1">
          <h1 className="text-2xl sm:text-3xl font-serif font-semibold text-on-surface tracking-tight">
            Course management
          </h1>
          <p className="text-body-sm text-on-surface-variant mt-1 max-w-2xl">
            Curricula, student enrollment cohorts, and tutorial supervision structures across academic divisions.
          </p>
        </div>

        {/* Primary Action on the right (full-width below sm) */}
        <div className="shrink-0 w-full sm:w-auto">
          <Button variant="primary" className="w-full sm:w-auto">
            <Plus className="w-4 h-4" aria-hidden="true" />
            <span>New course</span>
          </Button>
        </div>
      </header>

      {/* State: Error */}
      {state === 'error' && (
        <Alert
          variant="error"
          title="Unable to load courses"
          description="There was a problem retrieving course curricula records. Check your connection and try again."
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
          className="space-y-6 animate-pulse"
          aria-busy="true"
          aria-label="Loading courses directory"
        >
          {/* Skeleton Filter Row */}
          <div className="bg-surface-container-lowest p-4 rounded-md border border-outline-variant flex flex-col sm:flex-row gap-3">
            <Skeleton className="h-11 flex-1 rounded-default" />
            <Skeleton className="h-11 w-48 rounded-default" />
            <Skeleton className="h-11 w-40 rounded-default" />
          </div>

          {/* Skeleton Table */}
          <div className="bg-surface-container-lowest p-5 rounded-md border border-outline-variant space-y-4">
            <Skeleton className="h-6 w-48" />
            <div className="space-y-3 pt-2">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <Skeleton key={i} className="h-14 w-full rounded-default" />
              ))}
            </div>
          </div>
        </div>
      )}

      {/* State: Empty */}
      {state === 'empty' && (
        <div className="bg-surface-container-lowest rounded-md border border-outline-variant p-8 md:p-12">
          <EmptyState
            icon={BookOpen}
            title="No courses registered"
            description="No academic courses or syllabus modules have been created for this academic year."
            action={
              <Button variant="primary" onClick={() => setState('default')}>
                Load sample courses
              </Button>
            }
          />
        </div>
      )}

      {/* State: Default (List Template: Header + Filters Row + DataTable + Pagination) */}
      {state === 'default' && (
        <div className="space-y-5">
          {/* Filters Row */}
          <section
            aria-label="Course filters"
            className="bg-surface-container-lowest border border-outline-variant rounded-md p-3.5 sm:p-4 flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3"
          >
            {/* Search Input */}
            <div className="relative flex-1 min-w-[240px]">
              <Search
                className="w-4 h-4 text-on-surface-variant absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
                aria-hidden="true"
              />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
                placeholder="Search course code, title, or lead tutor..."
                className="w-full h-11 pl-9 pr-8 bg-surface-container-lowest border border-outline text-on-surface text-body-sm rounded-default outline-none focus-visible:focus-ring"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-on-surface-variant hover:text-on-surface cursor-pointer"
                  aria-label="Clear search query"
                >
                  <X className="w-3.5 h-3.5" aria-hidden="true" />
                </button>
              )}
            </div>

            {/* Filter Dropdowns */}
            <div className="flex flex-wrap sm:flex-nowrap items-center gap-2.5">
              <div className="relative flex-1 sm:flex-initial min-w-[160px]">
                <select
                  aria-label="Filter by academic division"
                  value={selectedDivision}
                  onChange={(e) => {
                    setSelectedDivision(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="w-full h-11 px-3 bg-surface-container-lowest border border-outline text-on-surface text-body-sm rounded-default outline-none focus-visible:focus-ring cursor-pointer hover:border-on-surface-variant"
                >
                  <option value="All">All divisions</option>
                  <option value="MPLS">MPLS Division</option>
                  <option value="Humanities">Humanities Division</option>
                  <option value="Medical Sciences">Medical Sciences</option>
                  <option value="Social Sciences">Social Sciences</option>
                </select>
              </div>

              <div className="relative flex-1 sm:flex-initial min-w-[140px]">
                <select
                  aria-label="Filter by course status"
                  value={selectedStatus}
                  onChange={(e) => {
                    setSelectedStatus(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="w-full h-11 px-3 bg-surface-container-lowest border border-outline text-on-surface text-body-sm rounded-default outline-none focus-visible:focus-ring cursor-pointer hover:border-on-surface-variant"
                >
                  <option value="All">All statuses</option>
                  <option value="Active">Active</option>
                  <option value="Upcoming">Upcoming</option>
                  <option value="Archived">Archived</option>
                </select>
              </div>

              {hasActiveFilters && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={resetFilters}
                  className="shrink-0 text-on-surface-variant hover:text-on-surface"
                >
                  <X className="w-3.5 h-3.5" aria-hidden="true" />
                  <span>Reset</span>
                </Button>
              )}
            </div>
          </section>

          {/* DataTable */}
          <section className="flex flex-col">
            <DataTable
              title="Curriculum directory"
              subtitle="Registered course modules, convening tutors, and student cohort allocations."
              columns={tableColumns}
              onRowClick={(row) => setSelected(row)}
              data={filteredCourses}
              keyExtractor={(row) => row.code}
              emptyTitle={
                hasActiveFilters
                  ? 'No courses match your filter criteria'
                  : 'No course records found'
              }
              emptyDescription={
                hasActiveFilters
                  ? 'Try clearing or modifying your search and filters to view more courses.'
                  : 'No courses registered in this academic session.'
              }
            />
          </section>

          {/* Accessible Pagination Footer */}
          <footer
            aria-label="Pagination navigation"
            className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2 text-body-sm text-on-surface-variant"
          >
            <span className="tabular-nums">
              Showing {filteredCourses.length} of {mockCourses.length} courses
            </span>

            <div className="flex items-center gap-2 self-start sm:self-auto">
              <Button
                variant="secondary"
                size="sm"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              >
                <ChevronLeft className="w-4 h-4" aria-hidden="true" />
                <span>Previous</span>
              </Button>
              <span className="px-2 text-caption tabular-nums font-medium text-on-surface">
                Page {currentPage} of 1
              </span>
              <Button
                variant="secondary"
                size="sm"
                disabled={true}
                onClick={() => setCurrentPage((p) => p + 1)}
              >
                <span>Next</span>
                <ChevronRight className="w-4 h-4" aria-hidden="true" />
              </Button>
            </div>
          </footer>
        </div>
      )}

      <DetailDrawer
        open={selected !== null}
        onClose={() => setSelected(null)}
        ariaLabel="Course details"
        eyebrow="Course"
        title={selected ? `${selected.code} · ${selected.title}` : ''}
        subtitle={selected ? selected.subtitle : undefined}
        fields={
          selected
            ? [
                { label: 'Faculty lead', value: <>{selected.leadName}<span className="block text-caption text-on-surface-variant font-normal">{selected.college}</span></> },
                { label: 'Department', value: <>{selected.department}<span className="block text-caption text-on-surface-variant font-normal">{selected.division}</span></> },
                { label: 'Enrolled', value: <>{selected.enrolledCount.toLocaleString()} students<span className="block text-caption text-on-surface-variant font-normal">{selected.enrolledDetail}</span></> },
                { label: 'Mastery rate', value: <>{selected.masteryPct}<span className="block text-caption text-on-surface-variant font-normal">{selected.masteryStatus}</span></> },
                { label: 'Lecture cadence', value: selected.lectureCadence },
                { label: 'Hall', value: selected.hallLocation },
                { label: 'Status', value: columns.find((c) => c.header === 'Status')!.accessor(selected, 0) },
              ]
            : []
        }
      />
    </div>
  );
}

export default function CoursesPage() {
  return (
    <Suspense fallback={<div className="p-8 max-w-7xl mx-auto min-h-dvh" />}>
      <CoursesContent />
    </Suspense>
  );
}
