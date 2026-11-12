'use client';

import React, { useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import {
  Button,
  Badge,
  EmptyState,
  Skeleton,
  Alert,
} from '@/components/ui';
import {
  FileText,
  SlidersHorizontal,
  Plus,
  ChevronRight,
  CheckCircle2,
  Clock,
  Layers,
  Search,
  X,
  Upload,
  RefreshCw,
  AlertCircle,
} from 'lucide-react';

export type ExtractionState = 'default' | 'loading' | 'empty' | 'error';

interface ExtractedEntity {
  label: string;
  value: string;
  confidence: string;
}

interface ExtractionDocument {
  id: string;
  title: string;
  courseCode: string;
  courseTitle: string;
  department: string;
  uploadedAt: string;
  uploaderName: string;
  fileSize: string;
  pageCount: number;
  status: 'Ready for review' | 'Processing' | 'Fully confirmed';
  entities: ExtractedEntity[];
  conceptNodes: string[];
  summary: string;
}

const mockDocuments: ExtractionDocument[] = [
  {
    id: 'doc-1',
    title: 'Michaelmas Term 2024–25 Lecture Syllabus & Reading Schedule',
    courseCode: 'ENG-320',
    courseTitle: 'Advanced Fluid Dynamics',
    department: 'Dept. of Engineering Science',
    uploadedAt: '03 Nov 2024 • 14:22',
    uploaderName: 'Prof. Alistair Montgomery',
    fileSize: '4.8 MB',
    pageCount: 18,
    status: 'Ready for review',
    entities: [
      { label: 'Weekly cadence', value: 'Tues & Thurs • 10:00 AM', confidence: 'High' },
      { label: 'Primary hall venue', value: 'Examination Schools, Hall 4', confidence: 'High' },
      { label: 'Supervisor ratio', value: '1:4 Fellow-to-undergraduate', confidence: 'High' },
      { label: 'Total lecture count', value: '16 lectures across 8 weeks', confidence: 'High' },
    ],
    conceptNodes: [
      'Navier-Stokes solutions',
      'Boundary layer turbulence',
      'Reynolds numbers',
      'Vorticity dynamics',
      'Compressible gas dynamics',
    ],
    summary:
      'Eight-week syllabus covering differential governing equations for turbulent fluid flow, boundary layer approximations, and perturbation theory.',
  },
  {
    id: 'doc-2',
    title: 'Diplomatic Dispatches and Treaty Protocols (1870–1914)',
    courseCode: 'HIST-204',
    courseTitle: 'Late Imperial Diplomacy',
    department: 'Faculty of History',
    uploadedAt: '02 Nov 2024 • 09:15',
    uploaderName: 'Dr. Clara Sterling',
    fileSize: '12.4 MB',
    pageCount: 34,
    status: 'Fully confirmed',
    entities: [
      { label: 'Weekly cadence', value: 'Mon & Wed • 11:00 AM', confidence: 'High' },
      { label: 'Seminar venue', value: 'Schools Lecture Room 2', confidence: 'High' },
      { label: 'Supervision structure', value: '8 college tutorial groups', confidence: 'High' },
    ],
    conceptNodes: [
      'Bismarckian alliance system',
      'Triple Entente diplomacy',
      'Franco-Russian convention',
      'Balkan crisis management',
    ],
    summary:
      'Primary diplomatic archival sources, ambassadorial correspondence, and treaty protocols governing European foreign policy before 1914.',
  },
  {
    id: 'doc-3',
    title: 'Laboratory Manual: Signal Transduction & Receptor Protocols',
    courseCode: 'BIO-410',
    courseTitle: 'Cellular Signalling & Genomic Medicine',
    department: 'Dept. of Biochemistry',
    uploadedAt: '01 Nov 2024 • 16:40',
    uploaderName: 'Prof. Rowan Thorne',
    fileSize: '8.2 MB',
    pageCount: 26,
    status: 'Processing',
    entities: [
      { label: 'Lab session cadence', value: 'Wed & Fri • 09:00 AM', confidence: 'Medium' },
      { label: 'Laboratory location', value: 'Medical Sciences Teaching Centre', confidence: 'High' },
    ],
    conceptNodes: [
      'Phosphorylation cascades',
      'CRISPR validation',
      'Receptor tyrosine kinases',
      'Flow cytometry protocols',
    ],
    summary:
      'Wet-lab procedures for mammalian receptor assays, fluorescence microscopy, and quantitative analysis of kinase phosphorylation kinetics.',
  },
  {
    id: 'doc-4',
    title: 'Formal Logic & Proof Theory Tutorial Problem Sets',
    courseCode: 'PHIL-101',
    courseTitle: 'Formal Logic & Dialectic',
    department: 'Faculty of Philosophy',
    uploadedAt: '28 Oct 2024 • 11:05',
    uploaderName: 'Dr. Aris Thorne',
    fileSize: '3.1 MB',
    pageCount: 14,
    status: 'Fully confirmed',
    entities: [
      { label: 'Tutorial cadence', value: 'Tues & Thurs • 14:00 PM', confidence: 'High' },
      { label: 'Lecture hall', value: 'Radcliffe Humanities Auditorium', confidence: 'High' },
    ],
    conceptNodes: [
      'Fregean semantics',
      'Gödel completeness',
      'Natural deduction systems',
      'Modal logic frames',
    ],
    summary:
      'Problem sets and formal exercises in first-order predicate logic, semantic validity tableaux, and axiomatic proof systems.',
  },
];

function ExtractionContent() {
  const searchParams = useSearchParams();
  const showHarness = process.env.NODE_ENV !== 'production' && searchParams.get('states') === '1';

  const [state, setState] = useState<ExtractionState>('default');
  const [selectedDocId, setSelectedDocId] = useState<string>('doc-1');
  const [isConfirming, setIsConfirming] = useState<boolean>(false);
  const [confirmedDocs, setConfirmedDocs] = useState<Set<string>>(new Set(['doc-2', 'doc-4']));

  const selectedDoc =
    mockDocuments.find((d) => d.id === selectedDocId) || mockDocuments[0];

  const isConfirmed = confirmedDocs.has(selectedDoc.id);

  const handleConfirmExtraction = () => {
    setIsConfirming(true);
    setTimeout(() => {
      setConfirmedDocs((prev) => new Set(prev).add(selectedDoc.id));
      setIsConfirming(false);
    }, 400);
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6 sm:space-y-8">
      {/* Dev State Simulation Harness Bar (only when ?states=1) */}
      {showHarness && (
        <aside aria-label="Development test harness" className="w-full">
          <div className="bg-surface-container-high border border-outline-variant rounded-default p-2 flex flex-wrap items-center justify-between gap-2 text-caption">
            <span className="text-on-surface-variant font-medium flex items-center gap-1.5">
              <SlidersHorizontal className="w-3.5 h-3.5" aria-hidden="true" />
              Extraction states:
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

      {/* Page Header (DESIGN.md section 11: Detail template) */}
      <header className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-4 border-b border-outline-variant/40">
        <div className="min-w-0 flex-1">
          <h1 className="text-2xl sm:text-3xl font-serif font-semibold text-on-surface tracking-tight">
            Document extraction
          </h1>
          <p className="text-body-sm text-on-surface-variant mt-1 max-w-2xl">
            Review parsed course syllabi, verify timetable venues, and approve extracted curriculum concepts.
          </p>
        </div>

        {/* Primary Action on the right (full-width below sm) */}
        <div className="shrink-0 w-full sm:w-auto">
          <Button variant="primary" className="w-full sm:w-auto">
            <Upload className="w-4 h-4" aria-hidden="true" />
            <span>Upload syllabus document</span>
          </Button>
        </div>
      </header>

      {/* State: Error */}
      {state === 'error' && (
        <Alert
          variant="error"
          title="Unable to load document extraction queue"
          description="There was a problem retrieving queued syllabus documents. Check your connection and try again."
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
          aria-label="Loading document extraction workspace"
        >
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Left Column Skeletons */}
            <div className="lg:col-span-5 space-y-3">
              <Skeleton className="h-6 w-36 mb-2" />
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className="bg-surface-container-lowest p-4 rounded-md border border-outline-variant space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <Skeleton className="h-5 w-40" />
                    <Skeleton className="h-5 w-24 rounded-full" />
                  </div>
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-3/4" />
                </div>
              ))}
            </div>

            {/* Right Column Skeleton */}
            <div className="lg:col-span-7 bg-surface-container-lowest p-6 rounded-md border border-outline-variant space-y-6">
              <div className="space-y-2">
                <Skeleton className="h-7 w-64" />
                <Skeleton className="h-4 w-40" />
              </div>
              <Skeleton className="h-20 w-full" />
              <div className="space-y-3 pt-4 border-t border-outline-variant/40">
                <Skeleton className="h-5 w-48" />
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* State: Empty */}
      {state === 'empty' && (
        <div className="bg-surface-container-lowest rounded-md border border-outline-variant p-8 md:p-12">
          <EmptyState
            icon={FileText}
            title="No documents queued for extraction"
            description="All uploaded course documents and syllabus files have been fully reviewed and indexed."
            action={
              <Button variant="primary" onClick={() => setState('default')}>
                View sample documents
              </Button>
            }
          />
        </div>
      )}

      {/* State: Default (Two-column on lg, single column below) */}
      {state === 'default' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Column: Extraction Queue (lg:col-span-5) */}
          <section
            aria-labelledby="queue-title"
            className="lg:col-span-5 flex flex-col space-y-3"
          >
            <div className="flex items-center justify-between pb-1">
              <h2
                id="queue-title"
                className="text-body font-semibold text-on-surface"
              >
                Extraction queue
              </h2>
              <span className="text-caption text-on-surface-variant tabular-nums">
                {mockDocuments.length} documents
              </span>
            </div>

            <div
              role="tablist"
              aria-label="Extraction queue documents"
              className="space-y-2.5"
            >
              {mockDocuments.map((doc) => {
                const isSelected = doc.id === selectedDoc.id;
                const docConfirmed = confirmedDocs.has(doc.id);

                return (
                  <button
                    key={doc.id}
                    role="tab"
                    id={`doc-tab-${doc.id}`}
                    aria-selected={isSelected}
                    aria-controls={`doc-panel-${doc.id}`}
                    type="button"
                    onClick={() => setSelectedDocId(doc.id)}
                    className={`w-full text-left p-4 rounded-md border transition-all cursor-pointer flex flex-col gap-2.5 outline-none focus-visible:focus-ring ${
                      isSelected
                        ? 'bg-surface-container-lowest border-primary shadow-xs ring-1 ring-primary'
                        : 'bg-surface-container-lowest border-outline-variant hover:bg-surface-container/60 hover:border-outline'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="font-mono text-caption px-2 py-0.5 rounded-sm bg-surface-container font-semibold text-primary shrink-0">
                          {doc.courseCode}
                        </span>
                        <span className="font-semibold text-on-surface text-body-sm truncate">
                          {doc.courseTitle}
                        </span>
                      </div>

                      <Badge
                        variant={
                          docConfirmed
                            ? 'success'
                            : doc.status === 'Processing'
                            ? 'warning'
                            : 'info'
                        }
                        className="shrink-0"
                      >
                        {docConfirmed ? 'Fully confirmed' : doc.status}
                      </Badge>
                    </div>

                    <p className="text-caption text-on-surface-variant line-clamp-2 leading-relaxed">
                      {doc.title}
                    </p>

                    <div className="flex items-center justify-between pt-1 border-t border-outline-variant/30 text-caption text-on-surface-variant">
                      <span>{doc.uploadedAt}</span>
                      <span className="text-primary font-medium flex items-center gap-1">
                        <span>Inspect</span>
                        <ChevronRight className="w-3.5 h-3.5" aria-hidden="true" />
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </section>

          {/* Right Column: Document Extraction Detail Panel (lg:col-span-7, sticky on lg) */}
          <section
            id={`doc-panel-${selectedDoc.id}`}
            role="tabpanel"
            aria-labelledby={`doc-tab-${selectedDoc.id}`}
            className="lg:col-span-7 lg:sticky lg:top-6 bg-surface-container-lowest border border-outline-variant rounded-md p-5 sm:p-6 space-y-6"
          >
            {/* Detail Header */}
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 pb-5 border-b border-outline-variant/40">
              <div className="space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-mono text-caption px-2 py-0.5 rounded-sm bg-surface-container font-semibold text-primary">
                    {selectedDoc.courseCode}
                  </span>
                  <Badge variant={isConfirmed ? 'success' : 'info'}>
                    {isConfirmed ? 'Extraction confirmed' : selectedDoc.status}
                  </Badge>
                </div>
                <h2 className="text-xl sm:text-2xl font-serif font-semibold text-on-surface tracking-tight mt-1">
                  {selectedDoc.title}
                </h2>
                <p className="text-caption text-on-surface-variant">
                  {selectedDoc.department} &bull; Uploaded by {selectedDoc.uploaderName}
                </p>
              </div>

              <div className="shrink-0 flex items-center gap-2">
                <Button
                  variant={isConfirmed ? 'secondary' : 'primary'}
                  disabled={isConfirmed || isConfirming}
                  onClick={handleConfirmExtraction}
                >
                  <CheckCircle2 className="w-4 h-4" aria-hidden="true" />
                  <span>{isConfirmed ? 'Confirmed' : isConfirming ? 'Confirming...' : 'Approve extraction'}</span>
                </Button>
              </div>
            </div>

            {/* Document Overview Summary */}
            <div className="bg-surface-container-low rounded-default p-4 border border-outline-variant/40 space-y-1">
              <span className="text-caption font-semibold text-on-surface block">
                Syllabus summary
              </span>
              <p className="text-body-sm text-on-surface leading-relaxed">
                {selectedDoc.summary}
              </p>
            </div>

            {/* Extracted Timetable & Session Entities */}
            <div className="space-y-3">
              <h3 className="text-body font-semibold text-on-surface">
                Extracted timetable entities
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {selectedDoc.entities.map((entity, idx) => (
                  <div
                    key={idx}
                    className="p-3 bg-surface-container-low rounded-default border border-outline-variant/30 flex flex-col gap-1"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-caption font-medium text-on-surface-variant">
                        {entity.label}
                      </span>
                      <span className="text-[11px] text-primary font-medium">
                        {entity.confidence} confidence
                      </span>
                    </div>
                    <span className="text-body-sm font-semibold text-on-surface">
                      {entity.value}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Extracted Concept Graph Nodes */}
            <div className="space-y-3 pt-4 border-t border-outline-variant/40">
              <div className="flex items-center gap-1.5 text-on-surface">
                <Layers className="w-4 h-4 text-on-surface-variant shrink-0" aria-hidden="true" />
                <h3 className="text-body font-semibold text-on-surface">
                  Extracted curriculum concepts ({selectedDoc.conceptNodes.length})
                </h3>
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                {selectedDoc.conceptNodes.map((concept, cIdx) => (
                  <span
                    key={cIdx}
                    className="px-2.5 py-1 rounded-sm bg-surface-container text-body-sm font-medium text-on-surface border border-outline-variant/30"
                  >
                    {concept}
                  </span>
                ))}
              </div>
            </div>

            {/* File Audit Meta */}
            <div className="pt-4 border-t border-outline-variant/40 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-caption text-on-surface-variant">
              <span>
                Document size: {selectedDoc.fileSize} &bull; {selectedDoc.pageCount} pages parsed
              </span>
              <span>
                Indexed under university syllabus registry
              </span>
            </div>
          </section>
        </div>
      )}
    </div>
  );
}

export default function ExtractionPage() {
  return (
    <Suspense fallback={<div className="p-8 max-w-7xl mx-auto min-h-dvh" />}>
      <ExtractionContent />
    </Suspense>
  );
}
