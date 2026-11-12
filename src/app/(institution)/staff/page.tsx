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
  Users,
  ShieldCheck,
} from 'lucide-react';

export type StaffPageState = 'default' | 'loading' | 'empty' | 'error';

export interface StaffRecord {
  id: string;
  name: string;
  email: string;
  jobTitle: string;
  roleCategory: 'admin' | 'registry' | 'lab' | 'coordinator';
  department: string;
  division: string;
  officeLocation: string;
  accessScope: string;
  status: 'Active Synced' | 'On Leave' | 'Review Pending';
  avatarInitials: string;
}

const mockStaff: StaffRecord[] = [
  {
    id: 'STF-201',
    name: 'Eleanor Sterling',
    email: 'eleanor.sterling@admin.ox.ac.uk',
    jobTitle: 'Senior Academic Administrator',
    roleCategory: 'admin',
    department: 'Faculty of History',
    division: 'Humanities Division',
    officeLocation: 'Old Boys High School, Rm 104',
    accessScope: 'Department Admin',
    status: 'Active Synced',
    avatarInitials: 'ES',
  },
  {
    id: 'STF-202',
    name: 'David MacCallum',
    email: 'david.maccallum@admin.ox.ac.uk',
    jobTitle: 'Faculty Operations Manager',
    roleCategory: 'admin',
    department: 'Dept. of Engineering Science',
    division: 'MPLS Division',
    officeLocation: 'Thom Building, Level 2',
    accessScope: 'Department Admin',
    status: 'Active Synced',
    avatarInitials: 'DM',
  },
  {
    id: 'STF-203',
    name: 'Rachel Pemberton',
    email: 'rachel.p@registry.ox.ac.uk',
    jobTitle: 'Undergraduate Registry Officer',
    roleCategory: 'registry',
    department: 'University Academic Registry',
    division: 'Central University',
    officeLocation: 'Clarendon Building, Rm 210',
    accessScope: 'Registry Coordinator',
    status: 'Active Synced',
    avatarInitials: 'RP',
  },
  {
    id: 'STF-204',
    name: 'Dr. James Campbell',
    email: 'james.campbell@biochem.ox.ac.uk',
    jobTitle: 'Senior Laboratory Superintendent',
    roleCategory: 'lab',
    department: 'Dept. of Biochemistry',
    division: 'Medical Sciences',
    officeLocation: 'New Biochemistry Building, Rm 302',
    accessScope: 'Lab Operations',
    status: 'Active Synced',
    avatarInitials: 'JC',
  },
  {
    id: 'STF-205',
    name: 'Fiona Montgomery',
    email: 'fiona.m@maths.ox.ac.uk',
    jobTitle: 'Tutorial Allocations Coordinator',
    roleCategory: 'coordinator',
    department: 'Mathematical Institute',
    division: 'MPLS Division',
    officeLocation: 'Andrew Wiles Building, Mezzanine',
    accessScope: 'Tutorial Coordinator',
    status: 'Active Synced',
    avatarInitials: 'FM',
  },
  {
    id: 'STF-206',
    name: 'Arthur Pendelton',
    email: 'arthur.p@law.ox.ac.uk',
    jobTitle: 'Moot Court & Seminar Administrator',
    roleCategory: 'admin',
    department: 'Faculty of Law',
    division: 'Social Sciences',
    officeLocation: 'St Cross Building, Rm 112',
    accessScope: 'Department Admin',
    status: 'Active Synced',
    avatarInitials: 'AP',
  },
];

function StaffContent() {
  const searchParams = useSearchParams();
  const showHarness = process.env.NODE_ENV !== 'production' && searchParams.get('states') === '1';

  const [state, setState] = useState<StaffPageState>('default');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedDivision, setSelectedDivision] = useState('All');
  const [currentPage, setCurrentPage] = useState(1);

  const filteredStaff = useMemo(() => {
    return mockStaff.filter((staff) => {
      const query = searchQuery.toLowerCase().trim();
      const matchesSearch =
        query === '' ||
        staff.name.toLowerCase().includes(query) ||
        staff.email.toLowerCase().includes(query) ||
        staff.jobTitle.toLowerCase().includes(query) ||
        staff.department.toLowerCase().includes(query) ||
        staff.officeLocation.toLowerCase().includes(query);

      const matchesCat =
        selectedCategory === 'all' || staff.roleCategory === selectedCategory;

      const matchesDiv =
        selectedDivision === 'All' || staff.division.includes(selectedDivision);

      return matchesSearch && matchesCat && matchesDiv;
    });
  }, [searchQuery, selectedCategory, selectedDivision]);

  const hasActiveFilters =
    searchQuery.trim() !== '' ||
    selectedCategory !== 'all' ||
    selectedDivision !== 'All';

  const resetFilters = () => {
    setSearchQuery('');
    setSelectedCategory('all');
    setSelectedDivision('All');
    setCurrentPage(1);
  };

  const columns: Column<StaffRecord>[] = [
    {
      header: 'Staff member & email',
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
              {row.email}
            </span>
          </div>
        </div>
      ),
    },
    {
      header: 'Job title & category',
      accessor: (row) => (
        <div className="flex flex-col min-w-0">
          <span className="text-body-sm font-medium text-on-surface truncate">
            {row.jobTitle}
          </span>
          <span className="text-caption text-on-surface-variant capitalize">
            {row.roleCategory}
          </span>
        </div>
      ),
    },
    {
      header: 'Department & office',
      accessor: (row) => (
        <div className="flex flex-col min-w-0">
          <span className="text-body-sm text-on-surface truncate">
            {row.department}
          </span>
          <span className="text-caption text-on-surface-variant truncate">
            {row.officeLocation}
          </span>
        </div>
      ),
    },
    {
      header: 'Access scope',
      accessor: (row) => (
        <Badge variant="neutral">
          {row.accessScope}
        </Badge>
      ),
    },
    {
      header: 'Directory status',
      isKeyField: true,
      accessor: (row) => (
        <Badge
          variant={
            row.status === 'Active Synced'
              ? 'success'
              : row.status === 'On Leave'
              ? 'warning'
              : 'neutral'
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
              Staff states:
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
            Staff management
          </h1>
          <p className="text-body-sm text-on-surface-variant mt-1 max-w-2xl">
            Departmental administrators, laboratory technicians, tutorial coordinators, and academic registry officers.
          </p>
        </div>

        {/* Primary Action on the right (full-width below sm) */}
        <div className="shrink-0 w-full sm:w-auto">
          <Button variant="primary" className="w-full sm:w-auto">
            <Plus className="w-4 h-4" aria-hidden="true" />
            <span>Add staff member</span>
          </Button>
        </div>
      </header>

      {/* State: Error */}
      {state === 'error' && (
        <Alert
          variant="error"
          title="Unable to load staff directory"
          description="There was a problem communicating with the university administrative directory. Check your connection and try again."
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
          aria-label="Loading staff directory"
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
            title="No staff members registered"
            description="No administrative or operational staff members are currently assigned to this directory."
            action={
              <Button variant="primary" onClick={() => setState('default')}>
                Restore staff directory
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
            aria-label="Staff filters"
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
                placeholder="Search staff name, email, job title, or office..."
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
                  aria-label="Filter by role category"
                  value={selectedCategory}
                  onChange={(e) => {
                    setSelectedCategory(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="w-full h-11 px-3 bg-surface-container-lowest border border-outline text-on-surface text-body-sm rounded-default outline-none focus-visible:focus-ring cursor-pointer hover:border-on-surface-variant"
                >
                  <option value="all">All staff categories</option>
                  <option value="admin">Department Administrators</option>
                  <option value="registry">Academic Registry</option>
                  <option value="lab">Lab Managers</option>
                  <option value="coordinator">Tutorial Coordinators</option>
                </select>
              </div>

              <div className="relative flex-1 sm:flex-initial min-w-[160px]">
                <select
                  aria-label="Filter by division"
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
                  <option value="Central">Central University</option>
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
              title="Staff directory"
              subtitle="Administrative and technical personnel supporting collegiate teaching and department operations."
              columns={columns}
              data={filteredStaff}
              keyExtractor={(row) => row.id}
              emptyTitle={
                hasActiveFilters
                  ? 'No staff members match your filter criteria'
                  : 'No staff records found'
              }
              emptyDescription={
                hasActiveFilters
                  ? 'Try clearing or modifying your search, staff category, or division filter.'
                  : 'No administrative personnel registered in this directory.'
              }
            />
          </section>

          {/* Accessible Pagination Footer */}
          <footer
            aria-label="Pagination navigation"
            className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2 text-body-sm text-on-surface-variant"
          >
            <span className="tabular-nums">
              Showing {filteredStaff.length} of {mockStaff.length} staff members
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

export default function StaffPage() {
  return (
    <Suspense fallback={<div className="p-8 max-w-7xl mx-auto min-h-dvh" />}>
      <StaffContent />
    </Suspense>
  );
}
