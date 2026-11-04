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
  Shield,
  Landmark,
  BookOpen,
  Library,
  CheckCircle2,
  Lock,
  SlidersHorizontal,
  Plus,
  ChevronRight,
  X,
} from 'lucide-react';

export type RolesState = 'default' | 'loading' | 'empty' | 'error';

interface SampleMember {
  name: string;
  roleDetail: string;
  initials: string;
}

interface RoleItem {
  id: string;
  name: string;
  scopeBadge: string;
  memberCount: number;
  memberLabel: string;
  summary: string;
  icon: React.ComponentType<{ className?: string; 'aria-hidden'?: boolean | 'true' | 'false' }>;
  accessCategories: {
    category: string;
    items: string[];
  }[];
  boundaries: string[];
  sampleMembers: SampleMember[];
}

const ROLES_DATA: RoleItem[] = [
  {
    id: 'admin',
    name: 'Institution Admin',
    scopeBadge: 'University-wide',
    memberCount: 14,
    memberLabel: 'Council & registry officers',
    summary:
      'Full academic administration, faculty structural configuration, institutional privacy governance, and university-wide analytics.',
    icon: Shield,
    accessCategories: [
      {
        category: 'Academic oversight',
        items: [
          'View university-wide student retention indicators, curriculum progress, and term dossiers',
          'Oversee academic divisions, collegiate faculties, and department calendars',
          'Review institutional intervention summaries and formative learning mastery trends',
        ],
      },
      {
        category: 'Administration & access',
        items: [
          'Manage staff and lecturer account provisioning across all colleges',
          'Assign administrative responsibilities and configure departmental permissions',
          'Set institutional telemetry guidelines, data retention policies, and privacy controls',
        ],
      },
    ],
    boundaries: [
      'Changes to governance rules apply university-wide across all collegiate faculties and departments.',
      'Member management actions are permanently recorded in the institutional audit log.',
    ],
    sampleMembers: [
      { name: 'Prof. Eleanor Vance', roleDetail: 'Provost & Academic Council Chair', initials: 'EV' },
      { name: 'Prof. Alistair Montgomery', roleDetail: 'Dean of Academic Registry', initials: 'AM' },
      { name: 'Dr. Helen Davies', roleDetail: 'Director of University Administration', initials: 'HD' },
    ],
  },
  {
    id: 'hod',
    name: 'Head of Department (HOD)',
    scopeBadge: 'Departmental',
    memberCount: 58,
    memberLabel: 'Department chairs',
    summary:
      'Departmental leadership, course syllabus approvals, faculty teaching assignments, and aggregated cohort learning analytics.',
    icon: Landmark,
    accessCategories: [
      {
        category: 'Curriculum & teaching',
        items: [
          'Approve course syllabi, lecture ingestion schedules, and reading lists for own department',
          'Oversee faculty supervisor allocations and tutorial group distributions across colleges',
          'Convene department curriculum review meetings and review formative exam alignments',
        ],
      },
      {
        category: 'Department analytics',
        items: [
          'Monitor aggregated student concept mastery and formative assessment engagement',
          'Track weekly lecture processing cadence and student inquiry patterns across departmental courses',
          'Receive early alerts for courses requiring additional tutorial supervision',
        ],
      },
    ],
    boundaries: [
      'Access is restricted to courses, lecturers, and students within their assigned academic department.',
      'Cannot view or modify university-wide policy configurations or system credentials.',
    ],
    sampleMembers: [
      { name: 'Dr. Clara Sterling', roleDetail: 'Faculty of History Chair', initials: 'CS' },
      { name: 'Prof. Marcus Brody', roleDetail: 'Engineering Science Convenor', initials: 'MB' },
      { name: 'Dr. Sarah Jennings', roleDetail: 'Clinical Medicine Board Member', initials: 'SJ' },
    ],
  },
  {
    id: 'lecturer',
    name: 'Lecturer / Staff',
    scopeBadge: 'Course & cohort',
    memberCount: 842,
    memberLabel: 'Fellows & tutors',
    summary:
      'Course convenors and tutors creating formative problem sets, managing tutorial supervision groups, and guiding student mastery.',
    icon: BookOpen,
    accessCategories: [
      {
        category: 'Course materials & problem sets',
        items: [
          'Upload lecture recordings, slide decks, and syllabus notes for assigned courses',
          'Generate and calibrate weekly formative problem sets and concept review quizzes',
          'Annotate course reading lists with diagnostic hints for seminar cohorts',
        ],
      },
      {
        category: 'Student supervision',
        items: [
          'View enrolled students within assigned tutorial cohorts and seminar groups',
          'Review individual student formative quiz completion and diagnostic feedback signals',
          'Provide formative intervention notes and track student tutorial attendance',
        ],
      },
    ],
    boundaries: [
      'Cannot access student records, grades, or materials outside their assigned courses and tutorial groups.',
      'Cannot view departmental administrative costs or modify faculty curriculum allocations.',
    ],
    sampleMembers: [
      { name: 'Dr. Rowan Lennox', roleDetail: 'Fellow in Modern History', initials: 'RL' },
      { name: 'Dr. James Harrison', roleDetail: 'Senior Tutor in Mathematical Methods', initials: 'JH' },
      { name: 'Dr. Tara Lin', roleDetail: 'Departmental Lecturer in Engineering', initials: 'TL' },
    ],
  },
  {
    id: 'researcher',
    name: 'Researcher',
    scopeBadge: 'Research tools',
    memberCount: 334,
    memberLabel: 'Fellows & scholars',
    summary:
      'Postdoctoral scholars, research fellows, and investigators utilizing academic literature extraction and citation synthesis tools.',
    icon: Library,
    accessCategories: [
      {
        category: 'Research tools & synthesis',
        items: [
          'Extract tabular data and key findings from academic papers and PDF monographs',
          'Search university research repositories, reference catalogues, and open literature indexes',
          'Verify citation lineages and cross-reference findings across published scholarship',
          'Generate structured research notes and synthesis summaries from authorized corpora',
        ],
      },
    ],
    boundaries: [
      'No access to undergraduate student matriculation registries, grades, or supervision rosters.',
      'Cannot create courses or assign tutorial problem sets to students.',
    ],
    sampleMembers: [
      { name: 'Dr. Siobhan Kapoor', roleDetail: 'Postdoctoral Fellow in Historical Linguistics', initials: 'SK' },
      { name: 'Dr. Oliver Grant', roleDetail: 'Senior Research Associate in Oncology', initials: 'OG' },
      { name: 'Dr. Amina Patel', roleDetail: 'Research Scholar in Applied Mathematics', initials: 'AP' },
    ],
  },
];

function RolesContent() {
  const searchParams = useSearchParams();
  const showHarness = searchParams.get('states') === '1';

  const [state, setState] = useState<RolesState>('default');
  const [selectedRoleId, setSelectedRoleId] = useState<string>('admin');
  const [isAssignModalOpen, setIsAssignModalOpen] = useState<boolean>(false);
  const [assignUserEmail, setAssignUserEmail] = useState<string>('');
  const [assignRoleChoice, setAssignRoleChoice] = useState<string>('hod');

  const selectedRole = ROLES_DATA.find((r) => r.id === selectedRoleId) || ROLES_DATA[0];

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6 sm:space-y-8">
      {/* Dev State Simulation Harness Bar (only when ?states=1) */}
      {showHarness && (
        <aside aria-label="Development test harness" className="w-full">
          <div className="bg-surface-container-high border border-outline-variant rounded-default p-2 flex flex-wrap items-center justify-between gap-2 text-caption">
            <span className="text-on-surface-variant font-medium flex items-center gap-1.5">
              <SlidersHorizontal className="w-3.5 h-3.5" aria-hidden="true" />
              Roles states:
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
            Roles and permissions
          </h1>
          <p className="text-body-sm text-on-surface-variant mt-1 max-w-2xl">
            Review standard academic responsibilities and see what members of your institution can access.
          </p>
        </div>

        {/* Primary Action on the right (full-width below sm) */}
        <div className="shrink-0 w-full sm:w-auto">
          <Button
            variant="primary"
            onClick={() => setIsAssignModalOpen(true)}
            className="w-full sm:w-auto"
          >
            <Plus className="w-4 h-4" aria-hidden="true" />
            <span>Assign role</span>
          </Button>
        </div>
      </header>

      {/* State: Error */}
      {state === 'error' && (
        <Alert
          variant="error"
          title="Unable to load roles and permissions"
          description="There was a problem loading your institution's role directory. Check your connection and try again."
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
          aria-label="Loading roles and permissions"
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
                    <Skeleton className="h-5 w-20 rounded-full" />
                  </div>
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-3/4" />
                </div>
              ))}
            </div>

            {/* Right Column Skeleton */}
            <div className="lg:col-span-7 bg-surface-container-lowest p-6 rounded-md border border-outline-variant space-y-6">
              <div className="space-y-2">
                <Skeleton className="h-7 w-52" />
                <Skeleton className="h-4 w-32" />
              </div>
              <Skeleton className="h-16 w-full" />
              <div className="space-y-3 pt-4 border-t border-outline-variant/40">
                <Skeleton className="h-5 w-44" />
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
            icon={Shield}
            title="No roles found"
            description="No standard or custom roles are currently registered for this academic directory."
            action={
              <Button variant="primary" onClick={() => setState('default')}>
                Restore standard roles
              </Button>
            }
          />
        </div>
      )}

      {/* State: Default (Two-column on lg, single column below) */}
      {state === 'default' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Column: Role List (lg:col-span-5) */}
          <section
            aria-labelledby="roles-list-title"
            className="lg:col-span-5 flex flex-col space-y-3"
          >
            <div className="flex items-center justify-between pb-1">
              <h2
                id="roles-list-title"
                className="text-body font-semibold text-on-surface"
              >
                Standard roles
              </h2>
              <span className="text-caption text-on-surface-variant tabular-nums">
                {ROLES_DATA.length} archetypes
              </span>
            </div>

            <div
              role="tablist"
              aria-label="Academic roles"
              className="space-y-2.5"
            >
              {ROLES_DATA.map((role) => {
                const isSelected = role.id === selectedRole.id;
                const RoleIcon = role.icon;

                return (
                  <button
                    key={role.id}
                    role="tab"
                    id={`role-tab-${role.id}`}
                    aria-selected={isSelected}
                    aria-controls={`role-panel-${role.id}`}
                    type="button"
                    onClick={() => setSelectedRoleId(role.id)}
                    className={`w-full text-left p-4 rounded-md border transition-all cursor-pointer flex flex-col gap-2.5 outline-none focus-visible:focus-ring ${
                      isSelected
                        ? 'bg-surface-container-lowest border-primary shadow-xs ring-1 ring-primary'
                        : 'bg-surface-container-lowest border-outline-variant hover:bg-surface-container/60 hover:border-outline'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div
                          className={`w-8 h-8 rounded-sm flex items-center justify-center shrink-0 ${
                            isSelected
                              ? 'bg-primary text-on-primary'
                              : 'bg-surface-container text-on-surface'
                          }`}
                        >
                          <RoleIcon className="w-4 h-4" aria-hidden="true" />
                        </div>
                        <div className="min-w-0">
                          <span className="font-semibold text-on-surface text-body truncate block">
                            {role.name}
                          </span>
                          <span className="text-caption text-on-surface-variant tabular-nums">
                            {role.memberCount.toLocaleString()} {role.memberLabel}
                          </span>
                        </div>
                      </div>

                      <Badge
                        variant={isSelected ? 'info' : 'neutral'}
                        className="shrink-0"
                      >
                        {role.scopeBadge}
                      </Badge>
                    </div>

                    <p className="text-caption text-on-surface-variant line-clamp-2 leading-relaxed">
                      {role.summary}
                    </p>

                    <div className="flex items-center justify-between pt-1 border-t border-outline-variant/30 text-caption">
                      <span className="text-primary font-medium flex items-center gap-1">
                        <span>View permissions</span>
                        <ChevronRight className="w-3.5 h-3.5" aria-hidden="true" />
                      </span>
                      {isSelected && (
                        <span className="text-caption text-primary font-semibold">
                          Selected
                        </span>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </section>

          {/* Right Column: Role Detail Side Panel (lg:col-span-7, sticky on lg) */}
          <section
            id={`role-panel-${selectedRole.id}`}
            role="tabpanel"
            aria-labelledby={`role-tab-${selectedRole.id}`}
            className="lg:col-span-7 lg:sticky lg:top-6 bg-surface-container-lowest border border-outline-variant rounded-md p-5 sm:p-6 space-y-6"
          >
            {/* Detail Header */}
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 pb-5 border-b border-outline-variant/40">
              <div className="space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <h2 className="text-xl sm:text-2xl font-serif font-semibold text-on-surface tracking-tight">
                    {selectedRole.name}
                  </h2>
                  <Badge variant="info">{selectedRole.scopeBadge}</Badge>
                </div>
                <p className="text-caption text-on-surface-variant tabular-nums">
                  {selectedRole.memberCount.toLocaleString()} active members across Oxford colleges
                </p>
              </div>

              <Button
                variant="secondary"
                size="sm"
                onClick={() => {
                  setAssignRoleChoice(selectedRole.id);
                  setIsAssignModalOpen(true);
                }}
                className="shrink-0"
              >
                <Plus className="w-3.5 h-3.5" aria-hidden="true" />
                <span>Assign this role</span>
              </Button>
            </div>

            {/* Role Purpose Statement */}
            <div className="bg-surface-container-low rounded-default p-4 border border-outline-variant/40">
              <span className="text-caption font-semibold text-on-surface block mb-1">
                Academic responsibility
              </span>
              <p className="text-body-sm text-on-surface leading-relaxed">
                {selectedRole.summary}
              </p>
            </div>

            {/* Plain-Language Capabilities List */}
            <div className="space-y-4">
              <h3 className="text-body font-semibold text-on-surface">
                What this role can access
              </h3>

              <div className="space-y-4">
                {selectedRole.accessCategories.map((group, idx) => (
                  <div key={idx} className="space-y-2">
                    <span className="text-caption font-medium text-on-surface-variant uppercase tracking-wide">
                      {group.category}
                    </span>
                    <ul className="space-y-2.5">
                      {group.items.map((item, itemIdx) => (
                        <li
                          key={itemIdx}
                          className="flex items-start gap-2.5 text-body-sm text-on-surface"
                        >
                          <CheckCircle2
                            className="w-4 h-4 text-primary shrink-0 mt-0.5"
                            aria-hidden="true"
                          />
                          <span className="leading-normal">{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>

            {/* Role Scope & Boundaries */}
            <div className="space-y-2.5 pt-4 border-t border-outline-variant/40">
              <div className="flex items-center gap-1.5 text-on-surface">
                <Lock className="w-4 h-4 text-on-surface-variant shrink-0" aria-hidden="true" />
                <h3 className="text-body font-semibold text-on-surface">
                  Governance scope & boundaries
                </h3>
              </div>
              <ul className="space-y-2 pl-5 list-disc text-body-sm text-on-surface-variant">
                {selectedRole.boundaries.map((boundary, bIdx) => (
                  <li key={bIdx} className="leading-relaxed">
                    {boundary}
                  </li>
                ))}
              </ul>
            </div>

            {/* Sample Assigned Members */}
            <div className="space-y-3 pt-4 border-t border-outline-variant/40">
              <div className="flex items-center justify-between">
                <h3 className="text-body font-semibold text-on-surface">
                  Sample assigned members
                </h3>
                <span className="text-caption text-on-surface-variant tabular-nums">
                  {selectedRole.memberCount.toLocaleString()} total
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                {selectedRole.sampleMembers.map((member, mIdx) => (
                  <div
                    key={mIdx}
                    className="p-3 bg-surface-container-low rounded-default border border-outline-variant/30 flex items-center gap-2.5"
                  >
                    <div className="w-8 h-8 rounded-full bg-primary text-on-primary font-semibold text-caption flex items-center justify-center shrink-0">
                      {member.initials}
                    </div>
                    <div className="min-w-0">
                      <span className="font-medium text-body-sm text-on-surface truncate block">
                        {member.name}
                      </span>
                      <span className="text-caption text-on-surface-variant truncate block">
                        {member.roleDetail}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        </div>
      )}

      {/* Role Assignment Modal Dialog */}
      {isAssignModalOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="assign-modal-title"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-on-surface/40 backdrop-blur-xs"
        >
          <div className="bg-surface-container-lowest border border-outline-variant rounded-md shadow-lg w-full max-w-lg p-6 space-y-5">
            <div className="flex items-start justify-between gap-3 pb-3 border-b border-outline-variant/40">
              <div>
                <h3 id="assign-modal-title" className="text-h2 font-serif font-semibold text-on-surface">
                  Assign academic role
                </h3>
                <p className="text-body-sm text-on-surface-variant mt-0.5">
                  Grant academic responsibilities to an enrolled faculty member or researcher.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsAssignModalOpen(false)}
                className="p-1 rounded-sm text-on-surface-variant hover:text-on-surface hover:bg-surface-container cursor-pointer"
                aria-label="Close dialog"
              >
                <X className="w-5 h-5" aria-hidden="true" />
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                setIsAssignModalOpen(false);
              }}
              className="space-y-4"
            >
              <div>
                <label htmlFor="user-email-input" className="block text-body-sm font-medium text-on-surface mb-1">
                  Academic email address
                </label>
                <input
                  id="user-email-input"
                  type="email"
                  required
                  value={assignUserEmail}
                  onChange={(e) => setAssignUserEmail(e.target.value)}
                  placeholder="scholar@oxford.ac.uk"
                  className="w-full h-11 px-3 bg-surface-container-lowest border border-outline text-on-surface text-body-sm rounded-default outline-none focus-visible:focus-ring"
                />
              </div>

              <div>
                <label htmlFor="role-select-input" className="block text-body-sm font-medium text-on-surface mb-1">
                  Select role archetype
                </label>
                <select
                  id="role-select-input"
                  value={assignRoleChoice}
                  onChange={(e) => setAssignRoleChoice(e.target.value)}
                  className="w-full h-11 px-3 bg-surface-container-lowest border border-outline text-on-surface text-body-sm rounded-default outline-none focus-visible:focus-ring cursor-pointer"
                >
                  <option value="admin">Institution Admin (University-wide)</option>
                  <option value="hod">Head of Department (HOD)</option>
                  <option value="lecturer">Lecturer / Staff (Course & cohort)</option>
                  <option value="researcher">Researcher (Research tools)</option>
                </select>
              </div>

              <div className="bg-surface-container-low p-3.5 rounded-default border border-outline-variant/30 text-caption text-on-surface-variant leading-relaxed">
                Role assignments take effect immediately upon confirmation. Member activity is logged under the university governance directory.
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-2">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => setIsAssignModalOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" variant="primary">
                  Confirm assignment
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default function RolesPage() {
  return (
    <Suspense fallback={<div className="p-8 max-w-7xl mx-auto min-h-dvh" />}>
      <RolesContent />
    </Suspense>
  );
}
