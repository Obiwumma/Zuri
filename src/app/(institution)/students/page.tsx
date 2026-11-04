'use client';

import React, { useState, useMemo, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import {
  DataTable,
  type Column,
  Button,
  EmptyState,
  Alert,
  Badge,
} from '@/components/ui';
import {
  Search,
  X,
  Plus,
  SlidersHorizontal,
  ChevronLeft,
  ChevronRight,
  Users,
  AlertCircle,
  CheckCircle2,
  ExternalLink,
} from 'lucide-react';

export type StudentsPageState = 'default' | 'loading' | 'empty' | 'error';

export interface StudentRecord {
  id: string;
  name: string;
  email: string;
  college: string;
  matriculationId: string;
  division: string;
  department: string;
  moduleCode: string;
  moduleTitle: string;
  level: string;
  status: 'Active Matriculated' | 'Suspended (Leave)';
  engagementLabel: string;
  engagementPct: number;
  engagementDetail: string;
  tutor?: string;
  matriculationYear?: string;
}

const mockStudents: StudentRecord[] = [
  {
    id: 'OX-948201',
    name: 'Clara Holloway',
    email: 'clara.holloway@balliol.ox.ac.uk',
    college: 'Balliol College',
    matriculationId: 'OX-948201',
    division: 'MPLS',
    department: 'Engineering Science',
    moduleCode: 'ENG-320',
    moduleTitle: 'Fluid Dynamics',
    level: 'UG Finals (Year 3)',
    status: 'Active Matriculated',
    engagementLabel: 'Optimal (98%)',
    engagementPct: 98,
    engagementDetail: '14 Quizzes',
    tutor: 'Prof. C. Ravenscroft',
    matriculationYear: 'Michaelmas 2022',
  },
  {
    id: 'OX-882104',
    name: 'Alistair Montgomery',
    email: 'alistair.montgomery@chch.ox.ac.uk',
    college: 'Christ Church',
    matriculationId: 'OX-882104',
    division: 'Humanities',
    department: 'Faculty of History',
    moduleCode: 'HIST-204',
    moduleTitle: 'Imperial Diplomacy',
    level: 'UG Prelims (Year 1)',
    status: 'Active Matriculated',
    engagementLabel: 'Review (48%)',
    engagementPct: 48,
    engagementDetail: 'Sub-threshold',
    tutor: 'Dr. H. Trevor-Roper',
    matriculationYear: 'Michaelmas 2024',
  },
  {
    id: 'OX-729015',
    name: 'Dr. Priya Ramachandran',
    email: 'priya.ramachandran@sjc.ox.ac.uk',
    college: "St John's College",
    matriculationId: 'OX-729015',
    division: 'Medical Sciences',
    department: 'Clinical Medicine',
    moduleCode: 'BIO-410',
    moduleTitle: 'Genomic Medicine',
    level: 'DPhil Candidate',
    status: 'Active Matriculated',
    engagementLabel: 'Optimal (100%)',
    engagementPct: 100,
    engagementDetail: '42 Queries',
    tutor: 'Prof. S. Bhattacharya',
    matriculationYear: 'Michaelmas 2021',
  },
  {
    id: 'OX-640192',
    name: 'Julian Sterling-Cross',
    email: 'julian.sterling-cross@magd.ox.ac.uk',
    college: 'Magdalen College',
    matriculationId: 'OX-640192',
    division: 'Humanities',
    department: 'Faculty of Philosophy',
    moduleCode: 'PHIL-101',
    moduleTitle: 'Formal Logic & Dialectic',
    level: 'UG Finals (Year 2)',
    status: 'Active Matriculated',
    engagementLabel: 'Stable (84%)',
    engagementPct: 84,
    engagementDetail: '2 Actioned',
    tutor: 'Dr. A. Kenny',
    matriculationYear: 'Michaelmas 2023',
  },
  {
    id: 'OX-518290',
    name: 'Feng Wei',
    email: 'feng.wei@trinity.ox.ac.uk',
    college: 'Trinity College',
    matriculationId: 'OX-518290',
    division: 'MPLS',
    department: 'Mathematical Institute',
    moduleCode: 'MATH-210',
    moduleTitle: 'Linear Algebra',
    level: 'MSt Candidate',
    status: 'Active Matriculated',
    engagementLabel: 'Optimal (92%)',
    engagementPct: 92,
    engagementDetail: '0 Flags',
    tutor: 'Prof. R. Penrose',
    matriculationYear: 'Michaelmas 2024',
  },
  {
    id: 'OX-439201',
    name: 'Beatrice de Montfort',
    email: 'beatrice.demontfort@new.ox.ac.uk',
    college: 'New College',
    matriculationId: 'OX-439201',
    division: 'Social Sciences',
    department: 'Faculty of Law',
    moduleCode: 'LAW-105',
    moduleTitle: 'Jurisprudence',
    level: 'UG Finals (Year 3)',
    status: 'Active Matriculated',
    engagementLabel: 'Inactive (55%)',
    engagementPct: 55,
    engagementDetail: 'Missed 2',
    tutor: 'Prof. H.L.A. Hart',
    matriculationYear: 'Michaelmas 2022',
  },
  {
    id: 'OX-382910',
    name: 'Tarik Al-Mansoor',
    email: 'tarik.almansoor@wadham.ox.ac.uk',
    college: 'Wadham College',
    matriculationId: 'OX-382910',
    division: 'MPLS',
    department: 'Computer Science',
    moduleCode: 'CS-301',
    moduleTitle: 'Distributed Systems',
    level: 'UG Prelims (Year 1)',
    status: 'Active Matriculated',
    engagementLabel: 'Optimal (95%)',
    engagementPct: 95,
    engagementDetail: 'Problem Set',
    tutor: 'Dr. C.A.R. Hoare',
    matriculationYear: 'Michaelmas 2024',
  },
  {
    id: 'OX-291048',
    name: 'Eleanor Finchley-Smith',
    email: 'eleanor.finchleysmith@lmh.ox.ac.uk',
    college: 'Lady Margaret Hall',
    matriculationId: 'OX-291048',
    division: 'Humanities',
    department: 'English Faculty',
    moduleCode: 'ENG-102',
    moduleTitle: 'Old English Literature',
    level: 'UG Finals (Year 2)',
    status: 'Suspended (Leave)',
    engagementLabel: 'Leave (15%)',
    engagementPct: 15,
    engagementDetail: 'Michaelmas',
    tutor: 'Dr. J.R.R. Tolkien',
    matriculationYear: 'Michaelmas 2023',
  },
];

function StudentsContent() {
  const searchParams = useSearchParams();
  const showHarness = searchParams.get('states') === '1';

  const [state, setState] = useState<StudentsPageState>('default');
  const [searchQuery, setSearchQuery] = useState('');
  const [divisionFilter, setDivisionFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedStudent, setSelectedStudent] = useState<StudentRecord | null>(null);
  const [currentPage, setCurrentPage] = useState(1);

  // Client-side filtering
  const filteredStudents = useMemo(() => {
    if (state === 'empty') return [];

    return mockStudents.filter((student) => {
      // Search text filter
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchesName = student.name.toLowerCase().includes(query);
        const matchesEmail = student.email.toLowerCase().includes(query);
        const matchesId = student.matriculationId.toLowerCase().includes(query);
        const matchesCollege = student.college.toLowerCase().includes(query);
        if (!matchesName && !matchesEmail && !matchesId && !matchesCollege) {
          return false;
        }
      }

      // Division filter
      if (divisionFilter !== 'all' && student.division !== divisionFilter) {
        return false;
      }

      // Status filter
      if (statusFilter !== 'all' && student.status !== statusFilter) {
        return false;
      }

      return true;
    });
  }, [searchQuery, divisionFilter, statusFilter, state]);

  const clearFilters = () => {
    setSearchQuery('');
    setDivisionFilter('all');
    setStatusFilter('all');
    setState('default');
  };

  const columns: Column<StudentRecord>[] = [
    {
      header: 'Student & college',
      isTitle: true,
      accessor: (row) => (
        <div className="flex flex-col min-w-0">
          <span className="font-medium text-on-surface truncate group-hover:text-primary transition-colors">
            {row.name}
          </span>
          <span className="text-caption text-on-surface-variant truncate">
            {row.college} &bull; {row.email}
          </span>
        </div>
      ),
    },
    {
      header: 'Matriculation ID',
      isKeyField: true,
      accessor: (row) => (
        <span className="font-mono text-caption text-on-surface tabular-nums">
          {row.matriculationId}
        </span>
      ),
    },
    {
      header: 'Division & department',
      accessor: (row) => (
        <div className="flex flex-col min-w-0">
          <span className="text-body-sm text-on-surface font-medium">{row.division}</span>
          <span className="text-caption text-on-surface-variant truncate">{row.department}</span>
        </div>
      ),
    },
    {
      header: 'Course module',
      accessor: (row) => (
        <div className="flex flex-col min-w-0">
          <span className="font-mono text-caption text-on-surface font-medium">{row.moduleCode}</span>
          <span className="text-caption text-on-surface-variant truncate">{row.moduleTitle}</span>
        </div>
      ),
    },
    {
      header: 'Level',
      accessor: (row) => (
        <span className="text-body-sm text-on-surface-variant">{row.level}</span>
      ),
    },
    {
      header: 'Status',
      isKeyField: true,
      accessor: (row) => (
        <Badge
          variant={row.status === 'Active Matriculated' ? 'success' : 'warning'}
        >
          {row.status}
        </Badge>
      ),
    },
    {
      header: 'Engagement',
      numeric: true,
      accessor: (row) => (
        <div className="inline-flex items-center justify-end gap-2">
          <span className="text-caption font-medium tabular-nums text-on-surface">
            {row.engagementPct}%
          </span>
          <div className="w-14 bg-surface-container rounded-full h-1.5 hidden sm:block overflow-hidden">
            <div
              className={`h-full rounded-full transition-all ${
                row.engagementPct >= 80
                  ? 'bg-success'
                  : row.engagementPct >= 50
                  ? 'bg-warning'
                  : 'bg-error'
              }`}
              style={{ width: `${row.engagementPct}%` }}
            />
          </div>
        </div>
      ),
    },
  ];

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
      {/* Dev State Simulation Harness Bar (only when ?states=1) */}
      {showHarness && (
        <aside aria-label="Development test harness" className="w-full">
          <div className="bg-surface-container-high border border-outline-variant rounded-default p-2 flex flex-wrap items-center justify-between gap-2 text-caption">
            <span className="text-on-surface-variant font-medium flex items-center gap-1.5">
              <SlidersHorizontal className="w-3.5 h-3.5" aria-hidden="true" />
              List states:
            </span>
            <div className="flex items-center gap-1 flex-wrap">
              <button
                type="button"
                onClick={() => {
                  setState('default');
                  setSearchQuery('');
                }}
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
            Students
          </h1>
          <p className="text-body-sm text-on-surface-variant mt-1 max-w-2xl">
            Enrolled students, academic divisions, matriculation cohorts, and tutorial progress.
          </p>
        </div>

        {/* Header Right Action */}
        <div className="w-full sm:w-auto shrink-0">
          <Button variant="primary" className="w-full sm:w-auto">
            <Plus className="w-4 h-4" aria-hidden="true" />
            <span>Add student</span>
          </Button>
        </div>
      </header>

      {/* State: Error */}
      {state === 'error' && (
        <Alert
          variant="error"
          title="Unable to load students"
          description="We could not load the student registry. Check your connection and try again."
          action={
            <Button variant="secondary" size="sm" onClick={() => setState('default')}>
              Try again
            </Button>
          }
        />
      )}

      {/* Filter Row (DESIGN.md section 11: search + 1-2 filters) */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
        {/* Search Input */}
        <div className="relative flex-1 sm:max-w-xs md:max-w-sm">
          <Search
            className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-on-surface-variant pointer-events-none"
            aria-hidden="true"
          />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              if (state !== 'default') setState('default');
            }}
            placeholder="Search by name, college, or ID..."
            className="w-full h-11 md:h-10 pl-10 pr-9 bg-surface-container-lowest text-on-surface text-body-sm rounded-default border border-outline hover:border-on-surface-variant transition-colors outline-none focus-visible:focus-ring"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-on-surface p-0.5 rounded cursor-pointer"
              aria-label="Clear search"
            >
              <X className="w-3.5 h-3.5" aria-hidden="true" />
            </button>
          )}
        </div>

        {/* Filter 1: Division */}
        <div className="relative flex-1 sm:flex-initial sm:min-w-[160px]">
          <select
            aria-label="Filter by division"
            value={divisionFilter}
            onChange={(e) => {
              setDivisionFilter(e.target.value);
              if (state !== 'default') setState('default');
            }}
            className="w-full h-11 md:h-10 px-3 pr-8 bg-surface-container-lowest text-on-surface text-body-sm rounded-default border border-outline hover:border-on-surface-variant transition-colors outline-none focus-visible:focus-ring cursor-pointer"
          >
            <option value="all">All divisions</option>
            <option value="Humanities">Humanities</option>
            <option value="MPLS">MPLS</option>
            <option value="Medical Sciences">Medical Sciences</option>
            <option value="Social Sciences">Social Sciences</option>
          </select>
        </div>

        {/* Filter 2: Status */}
        <div className="relative flex-1 sm:flex-initial sm:min-w-[160px]">
          <select
            aria-label="Filter by status"
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              if (state !== 'default') setState('default');
            }}
            className="w-full h-11 md:h-10 px-3 pr-8 bg-surface-container-lowest text-on-surface text-body-sm rounded-default border border-outline hover:border-on-surface-variant transition-colors outline-none focus-visible:focus-ring cursor-pointer"
          >
            <option value="all">All statuses</option>
            <option value="Active Matriculated">Active Matriculated</option>
            <option value="Suspended (Leave)">Suspended (Leave)</option>
          </select>
        </div>

        {/* Clear Filters (if active) */}
        {(searchQuery || divisionFilter !== 'all' || statusFilter !== 'all') && (
          <Button
            variant="ghost"
            size="sm"
            onClick={clearFilters}
            className="self-center"
          >
            Clear filters
          </Button>
        )}
      </div>

      {/* Main Content / DataTable with automatic mobile stacked rows */}
      {state === 'empty' ? (
        <div className="bg-surface-container-lowest rounded-md border border-outline-variant p-8 md:p-12">
          <EmptyState
            icon={Users}
            title="No enrolled students"
            description="There are currently no students registered in your institution's ledger. Add your first student or import a student roster."
            action={
              <Button variant="primary" onClick={() => setState('default')}>
                Add first student
              </Button>
            }
          />
        </div>
      ) : (
        <div className="flex flex-col">
          <DataTable
            columns={columns}
            data={filteredStudents}
            keyExtractor={(row) => row.id}
            isLoading={state === 'loading'}
            emptyTitle="No students found"
            emptyDescription="No student records match your current search and filter criteria."
            emptyIcon={Users}
            emptyAction={
              <Button variant="secondary" size="sm" onClick={clearFilters}>
                Clear filters
              </Button>
            }
            onRowClick={(row) => setSelectedStudent(row)}
          />

          {/* Pagination Strip (DESIGN.md section 11: List template) */}
          {state !== 'loading' && filteredStudents.length > 0 && (
            <div className="px-4 py-3.5 bg-surface-container-lowest border-t border-outline-variant flex flex-col sm:flex-row items-center justify-between gap-3 text-caption text-on-surface-variant">
              <div>
                Showing <span className="font-medium text-on-surface">1–{filteredStudents.length}</span> of{' '}
                <span className="font-medium text-on-surface">18,420</span> students
              </div>

              <div className="flex items-center gap-1.5">
                <Button
                  variant="secondary"
                  size="sm"
                  disabled={currentPage <= 1}
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  className="px-2.5 h-8 text-caption"
                >
                  <ChevronLeft className="w-3.5 h-3.5" aria-hidden="true" />
                  <span>Previous</span>
                </Button>

                <div className="flex items-center gap-1 px-1">
                  <span className="w-7 h-7 rounded-sm bg-primary text-on-primary flex items-center justify-center font-medium text-caption select-none">
                    1
                  </span>
                  <button
                    type="button"
                    className="w-7 h-7 rounded-sm hover:bg-surface-container text-on-surface-variant flex items-center justify-center text-caption transition-colors cursor-pointer"
                  >
                    2
                  </button>
                  <button
                    type="button"
                    className="w-7 h-7 rounded-sm hover:bg-surface-container text-on-surface-variant flex items-center justify-center text-caption transition-colors cursor-pointer"
                  >
                    3
                  </button>
                  <span className="text-on-surface-variant/50 px-1">&hellip;</span>
                  <button
                    type="button"
                    className="w-7 h-7 rounded-sm hover:bg-surface-container text-on-surface-variant flex items-center justify-center text-caption transition-colors cursor-pointer"
                  >
                    2,303
                  </button>
                </div>

                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => setCurrentPage((p) => p + 1)}
                  className="px-2.5 h-8 text-caption"
                >
                  <span>Next</span>
                  <ChevronRight className="w-3.5 h-3.5" aria-hidden="true" />
                </Button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Student Dossier Drawer (when row selected) */}
      {selectedStudent && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Student dossier"
          className="fixed inset-0 z-50 bg-on-surface/40 backdrop-blur-xs flex justify-end transition-opacity duration-200"
          onClick={() => setSelectedStudent(null)}
        >
          <div
            className="w-full max-w-lg h-full bg-surface-container-lowest p-6 sm:p-8 flex flex-col justify-between overflow-y-auto border-l border-outline-variant shadow-lg"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="space-y-6">
              {/* Header */}
              <div className="flex items-start justify-between pb-4 border-b border-outline-variant/40">
                <div>
                  <span className="text-caption text-on-surface-variant font-medium">
                    Student profile
                  </span>
                  <h2 className="text-2xl font-serif font-semibold text-on-surface mt-1">
                    {selectedStudent.name}
                  </h2>
                  <div className="text-body-sm text-on-surface-variant mt-0.5">
                    {selectedStudent.college} &bull; <span className="font-mono">{selectedStudent.matriculationId}</span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedStudent(null)}
                  className="p-1 rounded-default text-on-surface-variant hover:text-on-surface hover:bg-surface-container transition-colors cursor-pointer outline-none focus-visible:focus-ring"
                  aria-label="Close dossier"
                >
                  <X className="w-5 h-5" aria-hidden="true" />
                </button>
              </div>

              {/* Metadata Cards */}
              <div className="grid grid-cols-2 gap-3 bg-surface-container-low p-4 rounded-default border border-outline-variant/30 text-body-sm">
                <div>
                  <div className="text-caption text-on-surface-variant">Division & faculty</div>
                  <div className="font-medium text-on-surface mt-0.5">
                    {selectedStudent.division} &bull; {selectedStudent.department}
                  </div>
                </div>
                <div>
                  <div className="text-caption text-on-surface-variant">Tutorial fellow</div>
                  <div className="font-medium text-on-surface mt-0.5">
                    {selectedStudent.tutor}
                  </div>
                </div>
                <div>
                  <div className="text-caption text-on-surface-variant">Matriculation</div>
                  <div className="font-medium text-on-surface mt-0.5">
                    {selectedStudent.matriculationYear}
                  </div>
                </div>
                <div>
                  <div className="text-caption text-on-surface-variant">Enrollment status</div>
                  <div className="mt-1">
                    <Badge variant={selectedStudent.status === 'Active Matriculated' ? 'success' : 'warning'}>
                      {selectedStudent.status}
                    </Badge>
                  </div>
                </div>
              </div>

              {/* Academic Signals */}
              <div className="space-y-3">
                <h3 className="text-body-sm font-semibold text-on-surface">
                  Academic engagement
                </h3>
                <div className="p-3.5 bg-surface-container-low rounded-default border border-outline-variant/30 flex items-center justify-between">
                  <div>
                    <div className="text-body-sm font-medium text-on-surface">Syllabus synthesis rate</div>
                    <div className="text-caption text-on-surface-variant">Core reading integration and citation proofs</div>
                  </div>
                  <span className="font-semibold text-on-surface tabular-nums">
                    {selectedStudent.engagementPct}%
                  </span>
                </div>

                <div className="p-3.5 bg-surface-container-low rounded-default border border-outline-variant/30 flex items-center justify-between">
                  <div>
                    <div className="text-body-sm font-medium text-on-surface">{selectedStudent.moduleCode} {selectedStudent.moduleTitle}</div>
                    <div className="text-caption text-on-surface-variant">{selectedStudent.level}</div>
                  </div>
                  <span className="font-semibold text-primary">First class</span>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="pt-6 border-t border-outline-variant/40 flex items-center justify-between">
              <Button variant="secondary" onClick={() => setSelectedStudent(null)}>
                Close
              </Button>
              <Button variant="primary">
                <span>View academic dossier</span>
                <ExternalLink className="w-3.5 h-3.5" aria-hidden="true" />
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function StudentsPage() {
  return (
    <Suspense fallback={<div className="p-8 max-w-7xl mx-auto min-h-dvh" />}>
      <StudentsContent />
    </Suspense>
  );
}
