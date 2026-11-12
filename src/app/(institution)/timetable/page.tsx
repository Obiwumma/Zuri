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
  Clock,
  Calendar,
} from 'lucide-react';

export type TimetablePageState = 'default' | 'loading' | 'empty' | 'error';

export interface ScheduleSlot {
  id: string;
  day: 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday';
  timeSlot: string;
  moduleCode: string;
  moduleTitle: string;
  division: string;
  type: 'Lecture' | 'Tutorial Group' | 'Lab Practical' | 'Seminar';
  venue: string;
  capacity: number;
  enrolled: number;
  lecturer: string;
  college: string;
  status: 'Live Streamed' | 'Confirmed' | 'Recorded';
}

const mockScheduleSlots: ScheduleSlot[] = [
  {
    id: 'S101',
    day: 'Monday',
    timeSlot: '09:00 AM - 10:30 AM',
    moduleCode: 'BIO-410',
    moduleTitle: 'Cellular Signalling Pathways',
    division: 'Medical Sciences',
    type: 'Lecture',
    venue: 'Examination Schools, Hall 3',
    capacity: 240,
    enrolled: 218,
    lecturer: 'Prof. Alistair MacIntyre',
    college: 'Christ Church',
    status: 'Live Streamed',
  },
  {
    id: 'S102',
    day: 'Monday',
    timeSlot: '11:00 AM - 12:30 PM',
    moduleCode: 'HIST-302',
    moduleTitle: 'Late Imperial Diplomacy',
    division: 'Humanities',
    type: 'Seminar',
    venue: 'Schools Quadrangle, Room 14',
    capacity: 35,
    enrolled: 31,
    lecturer: 'Dr. Clara Sterling',
    college: 'Balliol College',
    status: 'Confirmed',
  },
  {
    id: 'S103',
    day: 'Tuesday',
    timeSlot: '10:00 AM - 12:00 PM',
    moduleCode: 'CS-501',
    moduleTitle: 'Quantum Information & Computing',
    division: 'MPLS',
    type: 'Lecture',
    venue: 'Wolfson Building, Lecture Theatre A',
    capacity: 120,
    enrolled: 114,
    lecturer: 'Prof. Sarah Jenkins',
    college: 'Magdalen College',
    status: 'Live Streamed',
  },
  {
    id: 'S104',
    day: 'Wednesday',
    timeSlot: '14:00 PM - 16:00 PM',
    moduleCode: 'ENG-320',
    moduleTitle: 'Advanced Fluid Dynamics Practical',
    division: 'MPLS',
    type: 'Lab Practical',
    venue: 'Thom Building, Aerodynamics Lab',
    capacity: 45,
    enrolled: 42,
    lecturer: 'Prof. Richard Sterling',
    college: 'New College',
    status: 'Confirmed',
  },
  {
    id: 'S105',
    day: 'Thursday',
    timeSlot: '14:00 PM - 15:30 PM',
    moduleCode: 'PHIL-101',
    moduleTitle: 'Formal Logic & Dialectic',
    division: 'Humanities',
    type: 'Tutorial Group',
    venue: 'Radcliffe Humanities, Seminar Rm 2',
    capacity: 20,
    enrolled: 18,
    lecturer: 'Dr. Julian Thorne',
    college: 'Trinity College',
    status: 'Recorded',
  },
  {
    id: 'S106',
    day: 'Friday',
    timeSlot: '10:00 AM - 11:30 AM',
    moduleCode: 'MATH-210',
    moduleTitle: 'Linear Algebra & Spectral Theory',
    division: 'MPLS',
    type: 'Lecture',
    venue: 'Mathematical Institute, L1 Theatre',
    capacity: 300,
    enrolled: 284,
    lecturer: 'Prof. Keith Sutherland',
    college: "St John's College",
    status: 'Confirmed',
  },
];

function TimetableContent() {
  const searchParams = useSearchParams();
  const showHarness = process.env.NODE_ENV !== 'production' && searchParams.get('states') === '1';

  const [state, setState] = useState<TimetablePageState>('default');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDay, setSelectedDay] = useState('All');
  const [selectedType, setSelectedType] = useState('All');
  const [currentPage, setCurrentPage] = useState(1);

  const filteredSlots = useMemo(() => {
    return mockScheduleSlots.filter((slot) => {
      const query = searchQuery.toLowerCase().trim();
      const matchesSearch =
        query === '' ||
        slot.moduleCode.toLowerCase().includes(query) ||
        slot.moduleTitle.toLowerCase().includes(query) ||
        slot.venue.toLowerCase().includes(query) ||
        slot.lecturer.toLowerCase().includes(query) ||
        slot.college.toLowerCase().includes(query);

      const matchesDay = selectedDay === 'All' || slot.day === selectedDay;
      const matchesType = selectedType === 'All' || slot.type === selectedType;

      return matchesSearch && matchesDay && matchesType;
    });
  }, [searchQuery, selectedDay, selectedType]);

  const hasActiveFilters =
    searchQuery.trim() !== '' || selectedDay !== 'All' || selectedType !== 'All';

  const resetFilters = () => {
    setSearchQuery('');
    setSelectedDay('All');
    setSelectedType('All');
    setCurrentPage(1);
  };

  const columns: Column<ScheduleSlot>[] = [
    {
      header: 'Day & time slot',
      isTitle: true,
      accessor: (row) => (
        <div className="flex flex-col min-w-0 py-0.5">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-caption px-2 py-0.5 rounded-sm bg-surface-container text-primary">
              {row.day}
            </span>
            <span className="text-body-sm font-semibold text-on-surface">
              {row.timeSlot}
            </span>
          </div>
          <span className="text-caption text-on-surface-variant mt-0.5">
            {row.venue}
          </span>
        </div>
      ),
    },
    {
      header: 'Course & curriculum',
      accessor: (row) => (
        <div className="flex flex-col min-w-0">
          <div className="flex items-center gap-1.5">
            <span className="font-mono text-caption px-1.5 py-0.5 rounded-sm bg-surface-container font-medium text-primary">
              {row.moduleCode}
            </span>
            <span className="text-body-sm font-medium text-on-surface truncate">
              {row.moduleTitle}
            </span>
          </div>
          <span className="text-caption text-on-surface-variant truncate">
            {row.division}
          </span>
        </div>
      ),
    },
    {
      header: 'Session type',
      accessor: (row) => (
        <Badge variant="neutral">
          {row.type}
        </Badge>
      ),
    },
    {
      header: 'Convening lecturer',
      accessor: (row) => (
        <div className="flex flex-col min-w-0">
          <span className="text-body-sm text-on-surface truncate">
            {row.lecturer}
          </span>
          <span className="text-caption text-on-surface-variant truncate">
            {row.college}
          </span>
        </div>
      ),
    },
    {
      header: 'Hall attendance',
      numeric: true,
      accessor: (row) => (
        <div className="flex flex-col items-end">
          <span className="tabular-nums font-semibold text-on-surface text-body-sm">
            {row.enrolled} / {row.capacity}
          </span>
          <span className="text-caption text-on-surface-variant">
            {Math.round((row.enrolled / row.capacity) * 100)}% capacity
          </span>
        </div>
      ),
    },
    {
      header: 'Delivery status',
      isKeyField: true,
      accessor: (row) => (
        <Badge
          variant={
            row.status === 'Confirmed'
              ? 'success'
              : row.status === 'Live Streamed'
              ? 'info'
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
              Timetable states:
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
            Institutional timetable
          </h1>
          <p className="text-body-sm text-on-surface-variant mt-1 max-w-2xl">
            Lecture allocations, college tutorial supervision groups, and laboratory venue schedules.
          </p>
        </div>

        {/* Primary Action on the right (full-width below sm) */}
        <div className="shrink-0 w-full sm:w-auto">
          <Button variant="primary" className="w-full sm:w-auto">
            <Plus className="w-4 h-4" aria-hidden="true" />
            <span>Schedule session</span>
          </Button>
        </div>
      </header>

      {/* State: Error */}
      {state === 'error' && (
        <Alert
          variant="error"
          title="Unable to load timetable schedule"
          description="There was a problem communicating with the university scheduling registry. Check your connection and try again."
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
          aria-label="Loading timetable schedule"
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
            icon={Calendar}
            title="No scheduled sessions found"
            description="No lectures, tutorials, or laboratory practicals match your active schedule filter."
            action={
              <Button variant="primary" onClick={() => setState('default')}>
                Restore full schedule
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
            aria-label="Timetable filters"
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
                placeholder="Search course code, module title, venue, or lecturer..."
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
              <div className="relative flex-1 sm:flex-initial min-w-[140px]">
                <select
                  aria-label="Filter by weekday"
                  value={selectedDay}
                  onChange={(e) => {
                    setSelectedDay(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="w-full h-11 px-3 bg-surface-container-lowest border border-outline text-on-surface text-body-sm rounded-default outline-none focus-visible:focus-ring cursor-pointer hover:border-on-surface-variant"
                >
                  <option value="All">All weekdays</option>
                  <option value="Monday">Monday</option>
                  <option value="Tuesday">Tuesday</option>
                  <option value="Wednesday">Wednesday</option>
                  <option value="Thursday">Thursday</option>
                  <option value="Friday">Friday</option>
                </select>
              </div>

              <div className="relative flex-1 sm:flex-initial min-w-[160px]">
                <select
                  aria-label="Filter by session type"
                  value={selectedType}
                  onChange={(e) => {
                    setSelectedType(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="w-full h-11 px-3 bg-surface-container-lowest border border-outline text-on-surface text-body-sm rounded-default outline-none focus-visible:focus-ring cursor-pointer hover:border-on-surface-variant"
                >
                  <option value="All">All session types</option>
                  <option value="Lecture">Lectures</option>
                  <option value="Tutorial Group">Tutorial Groups</option>
                  <option value="Lab Practical">Lab Practicals</option>
                  <option value="Seminar">Seminars</option>
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
              title="Schedule directory"
              subtitle="Timetabled lectures, tutorial supervisions, and laboratory teaching hours."
              columns={columns}
              data={filteredSlots}
              keyExtractor={(row) => row.id}
              emptyTitle={
                hasActiveFilters
                  ? 'No sessions match your filter criteria'
                  : 'No timetable records found'
              }
              emptyDescription={
                hasActiveFilters
                  ? 'Try clearing or modifying your search, weekday, or session type filter.'
                  : 'No active timetable allocations in this term.'
              }
            />
          </section>

          {/* Accessible Pagination Footer */}
          <footer
            aria-label="Pagination navigation"
            className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2 text-body-sm text-on-surface-variant"
          >
            <span className="tabular-nums">
              Showing {filteredSlots.length} of {mockScheduleSlots.length} timetabled sessions
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

export default function TimetablePage() {
  return (
    <Suspense fallback={<div className="p-8 max-w-7xl mx-auto min-h-dvh" />}>
      <TimetableContent />
    </Suspense>
  );
}
