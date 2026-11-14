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
  splitColumns,
  columnsToFields,
} from '@/components/ui';
import {
  Search,
  X,
  Plus,
  SlidersHorizontal,
  ChevronLeft,
  ChevronRight,
  Library,
  BookOpen,
  FileText,
  Download,
} from 'lucide-react';

export type LibraryPageState = 'default' | 'loading' | 'empty' | 'error';

export interface LibraryRecord {
  id: string;
  title: string;
  moduleCode: string;
  department: string;
  typeCategory: 'transcript' | 'reading' | 'bodleian' | 'exampaper';
  typeLabel: string;
  conceptNodes: string[];
  accessScope: 'Open Student Access' | 'Faculty Restricted' | 'Honours Finalists';
  indexingStatus: 'Fully Indexed' | 'Graph Linked' | 'OCR Processing';
  author: string;
  fileSize: string;
}

const mockLibraryRecords: LibraryRecord[] = [
  {
    id: 'LIB-4091',
    title: 'Cellular Signalling & Receptor Transduction Lecture Corpus',
    moduleCode: 'BIO-410',
    department: 'Nuffield Dept of Medicine',
    typeCategory: 'transcript',
    typeLabel: 'Lecture Transcript',
    conceptNodes: ['Receptor Pathways', 'Kinase Cascades', 'G-Protein'],
    accessScope: 'Open Student Access',
    indexingStatus: 'Graph Linked',
    author: 'Prof. Eleanor Vance',
    fileSize: '4.2 MB',
  },
  {
    id: 'LIB-4092',
    title: 'Bodleian MS. Oxford 342: Late Imperial Treaty Treatises (Digitized)',
    moduleCode: 'HIST-302',
    department: 'Faculty of History',
    typeCategory: 'bodleian',
    typeLabel: 'Bodleian Holding',
    conceptNodes: ['Imperial Diplomacy', '19th C Governance', 'Bismarck Alliances'],
    accessScope: 'Honours Finalists',
    indexingStatus: 'Fully Indexed',
    author: 'Bodleian Special Collections',
    fileSize: '12.8 MB',
  },
  {
    id: 'LIB-4093',
    title: 'Quantum Information & Qubit Verification Reading List',
    moduleCode: 'CS-501',
    department: 'Dept of Computer Science',
    typeCategory: 'reading',
    typeLabel: 'Reading List',
    conceptNodes: ['Qubit Teleportation', 'Error Correction', 'No-Cloning'],
    accessScope: 'Open Student Access',
    indexingStatus: 'Fully Indexed',
    author: 'Prof. Sarah Jenkins',
    fileSize: '1.8 MB',
  },
  {
    id: 'LIB-4094',
    title: 'Michaelmas Term 2023 Prelims Examination Paper & Model Answers',
    moduleCode: 'MATH-210',
    department: 'Mathematical Institute',
    typeCategory: 'exampaper',
    typeLabel: 'Exam Paper',
    conceptNodes: ['Spectral Decompositions', 'Eigenvalues', 'Hilbert Spaces'],
    accessScope: 'Open Student Access',
    indexingStatus: 'Fully Indexed',
    author: 'Mathematical Institute Board',
    fileSize: '2.4 MB',
  },
  {
    id: 'LIB-4095',
    title: 'Navier-Stokes Turbulence Boundary Layer Numerical Simulation Data',
    moduleCode: 'ENG-320',
    department: 'Dept of Engineering Science',
    typeCategory: 'transcript',
    typeLabel: 'Lecture Transcript',
    conceptNodes: ['Turbulence Flow', 'Reynolds Numbers', 'Vorticity Equations'],
    accessScope: 'Faculty Restricted',
    indexingStatus: 'Fully Indexed',
    author: 'Prof. Alistair Montgomery',
    fileSize: '8.6 MB',
  },
  {
    id: 'LIB-4096',
    title: 'Fregean Semantics & Gödel Completeness Monograph Reference',
    moduleCode: 'PHIL-101',
    department: 'Faculty of Philosophy',
    typeCategory: 'reading',
    typeLabel: 'Reading List',
    conceptNodes: ['Frege Sense & Reference', 'First-Order Logic', 'Completeness'],
    accessScope: 'Open Student Access',
    indexingStatus: 'Graph Linked',
    author: 'Dr. Aris Thorne',
    fileSize: '3.4 MB',
  },
];

function LibraryContent() {
  const searchParams = useSearchParams();
  const showHarness = process.env.NODE_ENV !== 'production' && searchParams.get('states') === '1';

  const [state, setState] = useState<LibraryPageState>('default');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedDepartment, setSelectedDepartment] = useState('All');
  const [currentPage, setCurrentPage] = useState(1);

  const filteredRecords = useMemo(() => {
    return mockLibraryRecords.filter((doc) => {
      const query = searchQuery.toLowerCase().trim();
      const matchesSearch =
        query === '' ||
        doc.title.toLowerCase().includes(query) ||
        doc.moduleCode.toLowerCase().includes(query) ||
        doc.author.toLowerCase().includes(query) ||
        doc.department.toLowerCase().includes(query);

      const matchesCat =
        selectedCategory === 'all' || doc.typeCategory === selectedCategory;

      const matchesDept =
        selectedDepartment === 'All' || doc.department.includes(selectedDepartment);

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

  const columns: Column<LibraryRecord>[] = [
    {
      header: 'Resource title & course',
      isTitle: true,
      accessor: (row) => (
        <div className="flex flex-col min-w-0 py-0.5">
          <div className="flex items-center gap-2">
            <span className="font-mono text-caption px-2 py-0.5 rounded-sm bg-surface-container font-semibold text-primary shrink-0">
              {row.moduleCode}
            </span>
            <span className="font-semibold text-on-surface text-body-sm truncate">
              {row.title}
            </span>
          </div>
          <span className="text-caption text-on-surface-variant truncate mt-0.5">
            {row.author} &bull; {row.department}
          </span>
        </div>
      ),
    },
    {
      header: 'Category',
      accessor: (row) => (
        <Badge variant="neutral">
          {row.typeLabel}
        </Badge>
      ),
    },
    {
      header: 'Concept nodes',
      accessor: (row) => (
        <div className="flex items-center gap-1.5 flex-wrap">
          {row.conceptNodes.slice(0, 2).map((concept, idx) => (
            <span
              key={idx}
              className="text-caption px-2 py-0.5 rounded-sm bg-surface-container-low text-on-surface-variant font-medium"
            >
              {concept}
            </span>
          ))}
          {row.conceptNodes.length > 2 && (
            <span className="text-caption text-on-surface-variant">
              +{row.conceptNodes.length - 2}
            </span>
          )}
        </div>
      ),
    },
    {
      header: 'Access scope',
      accessor: (row) => (
        <span className="text-caption text-on-surface-variant whitespace-nowrap">
          {row.accessScope}
        </span>
      ),
    },
    {
      header: 'File size',
      numeric: true,
      accessor: (row) => (
        <span className="tabular-nums text-caption text-on-surface-variant">
          {row.fileSize}
        </span>
      ),
    },
    {
      header: 'Indexing status',
      isKeyField: true,
      accessor: (row) => (
        <Badge
          variant={
            row.indexingStatus === 'Fully Indexed'
              ? 'success'
              : row.indexingStatus === 'Graph Linked'
              ? 'info'
              : 'warning'
          }
        >
          {row.indexingStatus}
        </Badge>
      ),
    },
  ];

  // Progressive disclosure: the table keeps only what's needed to find a
  // record; every other column opens in the detail drawer on row click.
  const [selected, setSelected] = useState<LibraryRecord | null>(null);
  const { visible: tableColumns, hidden: drawerColumns } = splitColumns(columns, ['Resource title & course', 'Category', 'Indexing status']);

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6 sm:space-y-8">
      {/* Dev State Simulation Harness Bar (only when ?states=1) */}
      {showHarness && (
        <aside aria-label="Development test harness" className="w-full">
          <div className="bg-surface-container-high border border-outline-variant rounded-default p-2 flex flex-wrap items-center justify-between gap-2 text-caption">
            <span className="text-on-surface-variant font-medium flex items-center gap-1.5">
              <SlidersHorizontal className="w-3.5 h-3.5" aria-hidden="true" />
              Library states:
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
            Content library
          </h1>
          <p className="text-body-sm text-on-surface-variant mt-1 max-w-2xl">
            Searchable repository of lecture transcripts, digitized Bodleian holdings, reading lists, and syllabus corpora.
          </p>
        </div>

        {/* Primary Action on the right (full-width below sm) */}
        <div className="shrink-0 w-full sm:w-auto">
          <Button variant="primary" className="w-full sm:w-auto">
            <Plus className="w-4 h-4" aria-hidden="true" />
            <span>Upload resource</span>
          </Button>
        </div>
      </header>

      {/* State: Error */}
      {state === 'error' && (
        <Alert
          variant="error"
          title="Unable to load content library"
          description="There was a problem communicating with the university digital archive. Check your connection and try again."
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
          aria-label="Loading content library"
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
            icon={Library}
            title="No resources found"
            description="No academic transcripts, reading lists, or archival holdings match your search."
            action={
              <Button variant="primary" onClick={() => setState('default')}>
                Restore content library
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
            aria-label="Library filters"
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
                placeholder="Search resource title, course code, author, or department..."
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
                  aria-label="Filter by resource type"
                  value={selectedCategory}
                  onChange={(e) => {
                    setSelectedCategory(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="w-full h-11 px-3 bg-surface-container-lowest border border-outline text-on-surface text-body-sm rounded-default outline-none focus-visible:focus-ring cursor-pointer hover:border-on-surface-variant"
                >
                  <option value="all">All resource types</option>
                  <option value="transcript">Lecture Transcripts</option>
                  <option value="bodleian">Bodleian Holdings</option>
                  <option value="reading">Reading Lists</option>
                  <option value="exampaper">Exam Papers</option>
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
                  <option value="Medicine">Medicine & Health</option>
                  <option value="History">Faculty of History</option>
                  <option value="Computer Science">Computer Science</option>
                  <option value="Mathematics">Mathematical Institute</option>
                  <option value="Engineering">Engineering Science</option>
                  <option value="Philosophy">Philosophy</option>
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
              title="Curriculum resources"
              subtitle="Indexed academic syllabi, lecture transcripts, and collegiate research materials."
              columns={tableColumns}
              onRowClick={(row) => setSelected(row)}
              data={filteredRecords}
              keyExtractor={(row) => row.id}
              emptyTitle={
                hasActiveFilters
                  ? 'No resources match your filter criteria'
                  : 'No library records found'
              }
              emptyDescription={
                hasActiveFilters
                  ? 'Try clearing or modifying your search, resource category, or department filter.'
                  : 'No digital materials indexed in this directory.'
              }
            />
          </section>

          {/* Accessible Pagination Footer */}
          <footer
            aria-label="Pagination navigation"
            className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2 text-body-sm text-on-surface-variant"
          >
            <span className="tabular-nums">
              Showing {filteredRecords.length} of {mockLibraryRecords.length} digital resources
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
        ariaLabel="Library resource details"
        eyebrow="Library resource"
        title={selected ? selected.title : ''}
        subtitle={selected ? `${selected.moduleCode} · ${selected.author}` : undefined}
        fields={selected ? [...columnsToFields(drawerColumns, selected), { label: 'Department', value: selected.department }] : []}
      />
    </div>
  );
}

export default function LibraryPage() {
  return (
    <Suspense fallback={<div className="p-8 max-w-7xl mx-auto min-h-dvh" />}>
      <LibraryContent />
    </Suspense>
  );
}
