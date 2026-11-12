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
} from '@/components/ui';
import {
  Search,
  X,
  Plus,
  SlidersHorizontal,
  ChevronLeft,
  ChevronRight,
  BookOpen,
  Users,
} from 'lucide-react';

export type LecturersPageState = 'default' | 'loading' | 'empty' | 'error';

export interface FacultyRecord {
  id: string;
  name: string;
  academicTitle: string;
  category: 'chair' | 'assoc' | 'fellow' | 'research';
  department: string;
  division: string;
  college: string;
  modules: string[];
  studentLoad: number;
  weeklyHours: number;
  officeHours: string;
  status: 'Active Supervisor' | 'Co-Pilot Enabled' | 'Review Pending';
  avatarInitials: string;
}

const mockFaculty: FacultyRecord[] = [
  {
    id: 'FAC-101',
    name: 'Prof. Alistair MacIntyre',
    academicTitle: 'Regius Professor of Modern History',
    category: 'chair',
    department: 'Faculty of History',
    division: 'Humanities Division',
    college: 'Christ Church',
    modules: ['HIST-302', 'HIST-410'],
    studentLoad: 28,
    weeklyHours: 14,
    officeHours: 'Tues 14:00 - 16:00',
    status: 'Active Supervisor',
    avatarInitials: 'AM',
  },
  {
    id: 'FAC-102',
    name: 'Prof. Sarah Jenkins',
    academicTitle: 'Professor of Quantum Computing',
    category: 'chair',
    department: 'Department of Computer Science',
    division: 'MPLS Division',
    college: 'Magdalen College',
    modules: ['CS-501', 'CS-620'],
    studentLoad: 42,
    weeklyHours: 18,
    officeHours: 'Weds 10:00 - 12:00',
    status: 'Active Supervisor',
    avatarInitials: 'SJ',
  },
  {
    id: 'FAC-103',
    name: 'Prof. Eleanor Vance',
    academicTitle: 'Vice-Chancellor & Chair of Neurology',
    category: 'chair',
    department: 'Nuffield Dept of Medicine',
    division: 'Medical Sciences',
    college: 'Balliol College',
    modules: ['MED-601', 'BIO-410'],
    studentLoad: 35,
    weeklyHours: 16,
    officeHours: 'Mon 11:00 - 13:00',
    status: 'Active Supervisor',
    avatarInitials: 'EV',
  },
  {
    id: 'FAC-104',
    name: 'Dr. Julian Thorne',
    academicTitle: 'Associate Professor of Epistemology',
    category: 'assoc',
    department: 'Faculty of Philosophy',
    division: 'Humanities Division',
    college: 'Trinity College',
    modules: ['PHIL-101', 'PHIL-204'],
    studentLoad: 24,
    weeklyHours: 12,
    officeHours: 'Thurs 15:00 - 17:00',
    status: 'Co-Pilot Enabled',
    avatarInitials: 'JT',
  },
  {
    id: 'FAC-105',
    name: 'Dr. Marcus Holloway',
    academicTitle: 'Tutorial Fellow in Economics',
    category: 'fellow',
    department: 'Department of Economics',
    division: 'Social Sciences',
    college: "St John's College",
    modules: ['ECON-204', 'ECON-310'],
    studentLoad: 30,
    weeklyHours: 15,
    officeHours: 'Fri 09:30 - 11:30',
    status: 'Active Supervisor',
    avatarInitials: 'MH',
  },
  {
    id: 'FAC-106',
    name: 'Prof. Richard Sterling',
    academicTitle: 'Professor of Mechanical Engineering',
    category: 'chair',
    department: 'Dept of Engineering Science',
    division: 'MPLS Division',
    college: 'New College',
    modules: ['ENG-320', 'ENG-405'],
    studentLoad: 38,
    weeklyHours: 16,
    officeHours: 'Mon 14:00 - 16:00',
    status: 'Co-Pilot Enabled',
    avatarInitials: 'RS',
  },
];

function LecturersContent() {
  const searchParams = useSearchParams();
  const showHarness = process.env.NODE_ENV !== 'production' && searchParams.get('states') === '1';

  const [state, setState] = useState<LecturersPageState>('default');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedDepartment, setSelectedDepartment] = useState('All');
  const [currentPage, setCurrentPage] = useState(1);

  const filteredFaculty = useMemo(() => {
    return mockFaculty.filter((f) => {
      const query = searchQuery.toLowerCase().trim();
      const matchesSearch =
        query === '' ||
        f.name.toLowerCase().includes(query) ||
        f.academicTitle.toLowerCase().includes(query) ||
        f.college.toLowerCase().includes(query) ||
        f.department.toLowerCase().includes(query);

      const matchesCat =
        selectedCategory === 'all' || f.category === selectedCategory;

      const matchesDept =
        selectedDepartment === 'All' || f.department.includes(selectedDepartment);

      return matchesSearch && matchesCat && matchesDept;
    });
  }, [searchQuery, selectedCategory, selectedDepartment]);

  const hasActiveFilters =
    searchQuery.trim() !== '' ||
    selectedCategory !== 'all' ||
    selectedDepartment !== 'All';

  const resetFilters = () => {
    setSearchQuery('');
    setSelectedCategory('all');
    setSelectedDepartment('All');
    setCurrentPage(1);
  };

  const columns: Column<FacultyRecord>[] = [
    {
      header: 'Lecturer & academic title',
      isTitle: true,
      accessor: (row) => (
        <div className="flex items-center gap-3 py-0.5 min-w-0">
          <div className="w-8 h-8 rounded-full bg-primary text-on-primary font-semibold text-caption flex items-center justify-center shrink-0">
            {row.avatarInitials}
          </div>
          <div className="flex flex-col min-w-0">
            <span className="font-semibold text-on-surface text-body-sm truncate">
              {row.name}
            </span>
            <span className="text-caption text-on-surface-variant truncate">
              {row.academicTitle}
            </span>
          </div>
        </div>
      ),
    },
    {
      header: 'Department & college',
      accessor: (row) => (
        <div className="flex flex-col min-w-0">
          <span className="text-body-sm text-on-surface truncate">
            {row.department}
          </span>
          <span className="text-caption text-on-surface-variant truncate">
            {row.college} &bull; {row.division}
          </span>
        </div>
      ),
    },
    {
      header: 'Supervised modules',
      accessor: (row) => (
        <div className="flex items-center gap-1.5 flex-wrap">
          {row.modules.map((m) => (
            <span
              key={m}
              className="font-mono text-caption px-2 py-0.5 rounded-sm bg-surface-container font-medium text-primary"
            >
              {m}
            </span>
          ))}
        </div>
      ),
    },
    {
      header: 'Tutorial load',
      numeric: true,
      isKeyField: true,
      accessor: (row) => (
        <div className="flex flex-col items-end">
          <span className="tabular-nums font-semibold text-on-surface text-body-sm">
            {row.studentLoad} students
          </span>
          <span className="text-caption text-on-surface-variant tabular-nums">
            {row.weeklyHours} hrs/wk
          </span>
        </div>
      ),
    },
    {
      header: 'Office hours',
      accessor: (row) => (
        <span className="text-caption text-on-surface whitespace-nowrap">
          {row.officeHours}
        </span>
      ),
    },
    {
      header: 'Supervision status',
      isKeyField: true,
      accessor: (row) => (
        <Badge
          variant={
            row.status === 'Active Supervisor'
              ? 'success'
              : row.status === 'Co-Pilot Enabled'
              ? 'info'
              : 'warning'
          }
        >
          {row.status}
        </Badge>
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
              Lecturers states:
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
            Lecturers and faculty
          </h1>
          <p className="text-body-sm text-on-surface-variant mt-1 max-w-2xl">
            Academic census of statutory chairs, associate professors, tutorial fellows, and course convenors.
          </p>
        </div>

        {/* Primary Action on the right (full-width below sm) */}
        <div className="shrink-0 w-full sm:w-auto">
          <Button variant="primary" className="w-full sm:w-auto">
            <Plus className="w-4 h-4" aria-hidden="true" />
            <span>Add faculty</span>
          </Button>
        </div>
      </header>

      {/* State: Error */}
      {state === 'error' && (
        <Alert
          variant="error"
          title="Unable to load faculty census"
          description="There was a problem communicating with the collegiate faculty directory. Check your connection and try again."
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
          aria-label="Loading faculty directory"
        >
          {/* Skeleton Filter Row */}
          <div className="bg-surface-container-lowest p-4 rounded-md border border-outline-variant flex flex-col sm:flex-row gap-3">
            <Skeleton className="h-11 flex-1 rounded-default" />
            <Skeleton className="h-11 w-48 rounded-default" />
            <Skeleton className="h-11 w-44 rounded-default" />
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
            icon={Users}
            title="No faculty registered"
            description="No academic lecturers or professorial fellows are currently assigned to this directory."
            action={
              <Button variant="primary" onClick={() => setState('default')}>
                Restore faculty directory
              </Button>
            }
          />
        </div>
      )}

      {/* State: Default (List Template) */}
      {state === 'default' && (
        <div className="space-y-5">
          {/* Filters Row */}
          <section
            aria-label="Faculty filters"
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
                placeholder="Search faculty name, title, department, or college..."
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
              <div className="relative flex-1 sm:flex-initial min-w-[170px]">
                <select
                  aria-label="Filter by academic rank"
                  value={selectedCategory}
                  onChange={(e) => {
                    setSelectedCategory(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="w-full h-11 px-3 bg-surface-container-lowest border border-outline text-on-surface text-body-sm rounded-default outline-none focus-visible:focus-ring cursor-pointer hover:border-on-surface-variant"
                >
                  <option value="all">All academic ranks</option>
                  <option value="chair">Statutory Chairs</option>
                  <option value="assoc">Associate Professors</option>
                  <option value="fellow">Tutorial Fellows</option>
                </select>
              </div>

              <div className="relative flex-1 sm:flex-initial min-w-[160px]">
                <select
                  aria-label="Filter by department"
                  value={selectedDepartment}
                  onChange={(e) => {
                    setSelectedDepartment(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="w-full h-11 px-3 bg-surface-container-lowest border border-outline text-on-surface text-body-sm rounded-default outline-none focus-visible:focus-ring cursor-pointer hover:border-on-surface-variant"
                >
                  <option value="All">All departments</option>
                  <option value="History">Faculty of History</option>
                  <option value="Computer Science">Computer Science</option>
                  <option value="Medicine">Medicine & Health</option>
                  <option value="Philosophy">Philosophy</option>
                  <option value="Economics">Economics</option>
                  <option value="Engineering">Engineering Science</option>
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
              title="Faculty registry"
              subtitle="Collegiate teaching Fellows, statutory professors, and tutorial supervisors."
              columns={columns}
              data={filteredFaculty}
              keyExtractor={(row) => row.id}
              emptyTitle={
                hasActiveFilters
                  ? 'No faculty members match your filter criteria'
                  : 'No lecturer records found'
              }
              emptyDescription={
                hasActiveFilters
                  ? 'Try clearing or modifying your search, academic rank, or department filter.'
                  : 'No academic faculty registered in this directory.'
              }
            />
          </section>

          {/* Accessible Pagination Footer */}
          <footer
            aria-label="Pagination navigation"
            className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2 text-body-sm text-on-surface-variant"
          >
            <span className="tabular-nums">
              Showing {filteredFaculty.length} of {mockFaculty.length} faculty members
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
    </div>
  );
}

export default function LecturersPage() {
  return (
    <Suspense fallback={<div className="p-8 max-w-7xl mx-auto min-h-dvh" />}>
      <LecturersContent />
    </Suspense>
  );
}
