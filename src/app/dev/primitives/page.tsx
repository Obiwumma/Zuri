'use client';

import React, { useState, Suspense } from 'react';
import { notFound, useSearchParams } from 'next/navigation';
import {
  Button,
  TextField,
  PasswordField,
  Checkbox,
  Badge,
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
  Alert,
  EmptyState,
  Skeleton,
  KpiTile,
  DataTable,
} from '@/components/ui';
import {
  Activity,
  Users,
  Search,
  Plus,
  Trash2,
  ExternalLink,
  AtSign,
  Lock,
  ArrowRight,
  Database,
  Coins,
  ShieldAlert,
} from 'lucide-react';

function DevPrimitivesContent() {
  const searchParams = useSearchParams();
  const isDev = process.env.NODE_ENV !== 'production';
  const hasDevFlag = searchParams.get('dev') === '1' || searchParams.get('states') === '1';

  if (!isDev && !hasDevFlag) {
    notFound();
  }

  const [activeTab, setActiveTab] = useState<'both' | 'editorial' | 'ops'>('both');
  const [buttonLoading, setButtonLoading] = useState(false);
  const [checkboxState, setCheckboxState] = useState({
    opt1: false,
    opt2: true,
    opt3: false,
    opt4: true,
  });
  const [textVal, setTextVal] = useState('Jane Doe');
  const [passVal, setPassVal] = useState('CorrectHorseBattery99!');
  const [tableLoading, setTableLoading] = useState(false);
  const [tableEmpty, setTableEmpty] = useState(false);

  const sampleColumns = [
    { header: 'Student ID', accessor: (row: any) => row.id, isTitle: true },
    { header: 'Full Name', accessor: (row: any) => row.name, isKeyField: true },
    { header: 'Department', accessor: (row: any) => row.dept, isKeyField: true },
    { header: 'Year', accessor: (row: any) => row.year },
    { header: 'GPA', accessor: (row: any) => row.gpa, numeric: true },
  ];

  const sampleData = [
    { id: 'STU-10291', name: 'Amara Okafor', dept: 'Computer Science', year: 'Year 3', gpa: '3.88' },
    { id: 'STU-10292', name: 'David Kim', dept: 'Biochemistry', year: 'Year 4', gpa: '3.75' },
    { id: 'STU-10293', name: 'Elena Rostova', dept: 'Mechanical Engineering', year: 'Year 2', gpa: '3.92' },
    { id: 'STU-10294', name: 'Tariq Al-Mansoor', dept: 'Economics', year: 'Year 3', gpa: '3.61' },
  ];

  const renderComponentShowcase = (isOpsMode: boolean) => {
    return (
      <div
        data-theme={isOpsMode ? 'ops' : undefined}
        className={`${
          isOpsMode ? 'dark bg-ops-canvas text-ops-text' : 'bg-surface text-on-surface'
        } p-4 sm:p-6 md:p-8 rounded-md border border-outline-variant transition-colors space-y-12`}
      >
        <div className="border-b border-outline-variant/40 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <span className="text-caption font-medium uppercase tracking-wider text-secondary">
              {isOpsMode ? 'Console Mode' : 'Editorial Mode'}
            </span>
            <h2 className="text-h2 font-semibold">
              {isOpsMode ? 'Ops Console Tokens ([data-theme="ops"])' : 'Institution Tokens (Editorial Default)'}
            </h2>
          </div>
          <Badge variant={isOpsMode ? 'warning' : 'success'}>
            {isOpsMode ? 'Dark Carbon Surface' : 'Cream Paper Surface'}
          </Badge>
        </div>

        {/* 1. BUTTONS */}
        <section className="space-y-4">
          <div className="border-b border-outline-variant/30 pb-2">
            <h3 className="text-h3 font-semibold">1. Button</h3>
            <p className="text-caption text-on-surface-variant">
              Height 44px mobile / 40px md+. Variants: primary, secondary, ghost, destructive. Preserves width when loading.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <Button variant="primary">Sign in</Button>
            <Button variant="secondary">View details</Button>
            <Button variant="ghost">Cancel</Button>
            <Button variant="destructive">
              <Trash2 className="w-4 h-4 mr-1" aria-hidden="true" />
              Revoke key
            </Button>
            <Button
              variant="primary"
              isLoading={buttonLoading}
              onClick={() => {
                setButtonLoading(true);
                setTimeout(() => setButtonLoading(false), 2000);
              }}
            >
              Save changes
            </Button>
            <Button variant="secondary" disabled>
              Disabled action
            </Button>
            <Button variant="secondary" size="icon" aria-label="Share document">
              <ExternalLink className="w-4 h-4" aria-hidden="true" />
            </Button>
          </div>
        </section>

        {/* 2. TEXT FIELD & FORM FIELD */}
        <section className="space-y-4">
          <div className="border-b border-outline-variant/30 pb-2">
            <h3 className="text-h3 font-semibold">2. TextField &amp; FormField</h3>
            <p className="text-caption text-on-surface-variant">
              Label above (sentence case), 16px text on mobile, 1px outline border, 2px focus ring with 2px offset, error with AlertCircle.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <TextField
              label="Work email"
              placeholder="you@institution.edu"
              helperText="We will send a single-use verification link."
              leftIcon={<AtSign className="w-4 h-4" aria-hidden="true" />}
            />
            <TextField
              label="Full legal name"
              value={textVal}
              onChange={(e) => setTextVal(e.target.value)}
              helperText="Matches administrative passport or registry records."
            />
            <TextField
              label="Recovery email"
              value="invalid-format-email"
              error="Email or password is incorrect. Check both and try again."
              required
            />
            <TextField
              label="Archival cluster identifier"
              value="archive-node-04.eu-west-1"
              disabled
              helperText="Provisioned by infrastructure governance."
            />
          </div>
        </section>

        {/* 3. PASSWORD FIELD */}
        <section className="space-y-4">
          <div className="border-b border-outline-variant/30 pb-2">
            <h3 className="text-h3 font-semibold">3. PasswordField</h3>
            <p className="text-caption text-on-surface-variant">
              Show/Hide toggle via Eye/EyeOff icon button (no text chip). Proper hit area and aria-label.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <PasswordField
              label="Password"
              value={passVal}
              onChange={(e) => setPassVal(e.target.value)}
              helperText="Minimum 12 characters with at least one number."
            />
            <PasswordField
              label="Confirm new password"
              value="mismatch123"
              error="Passwords do not match. Re-enter both to proceed."
            />
          </div>
        </section>

        {/* 4. CHECKBOX */}
        <section className="space-y-4">
          <div className="border-b border-outline-variant/30 pb-2">
            <h3 className="text-h3 font-semibold">4. Checkbox</h3>
            <p className="text-caption text-on-surface-variant">
              Accessible keyboard navigation, visible focus ring, optional helper description.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Checkbox
              id={`opt1-${isOpsMode ? 'ops' : 'ed'}`}
              label="Keep me signed in for 12 hours"
              description="Do not check on shared library or laboratory terminals."
              checked={checkboxState.opt1}
              onChange={(e) => setCheckboxState({ ...checkboxState, opt1: e.target.checked })}
            />
            <Checkbox
              id={`opt2-${isOpsMode ? 'ops' : 'ed'}`}
              label="Send automated digest notifications"
              checked={checkboxState.opt2}
              onChange={(e) => setCheckboxState({ ...checkboxState, opt2: e.target.checked })}
            />
            <Checkbox
              id={`opt3-${isOpsMode ? 'ops' : 'ed'}`}
              label="Require multi-factor authorization on session startup"
              error="Security policy mandates MFA for operator and dean roles."
              checked={checkboxState.opt3}
              onChange={(e) => setCheckboxState({ ...checkboxState, opt3: e.target.checked })}
            />
            <Checkbox
              id={`opt4-${isOpsMode ? 'ops' : 'ed'}`}
              label="System policy locked configuration"
              disabled
              checked={checkboxState.opt4}
            />
          </div>
        </section>

        {/* 5. BADGE */}
        <section className="space-y-4">
          <div className="border-b border-outline-variant/30 pb-2">
            <h3 className="text-h3 font-semibold">5. Badge (Status)</h3>
            <p className="text-caption text-on-surface-variant">
              Pill, text-caption, always icon or dot + text. Never color only.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <Badge variant="success">Healthy</Badge>
            <Badge variant="warning">Attention required</Badge>
            <Badge variant="error">Critical outage</Badge>
            <Badge variant="info">Scheduled maintenance</Badge>
            <Badge variant="neutral">Archived</Badge>
            <Badge variant="success" icon={Activity}>
              Live heartbeat
            </Badge>
            <Badge variant="error" icon={ShieldAlert}>
              Policy breached
            </Badge>
          </div>
        </section>

        {/* 6. CARD */}
        <section className="space-y-4">
          <div className="border-b border-outline-variant/30 pb-2">
            <h3 className="text-h3 font-semibold">6. Card</h3>
            <p className="text-caption text-on-surface-variant">
              Surface background, 1px outline-variant border, 12px radius, no shadow.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Academic Term Parameters</CardTitle>
                <CardDescription>Configure calendar session locks and exam periods.</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-body-sm text-on-surface">
                  Term lock is currently active. Lecturers can grade submissions, but course definitions cannot be altered.
                </p>
              </CardContent>
              <CardFooter>
                <span className="text-caption text-on-surface-variant">Last modified 2 hours ago</span>
                <Button variant="secondary" size="sm">
                  Adjust schedule
                </Button>
              </CardFooter>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Cluster Telemetry</CardTitle>
                <CardDescription>Real-time gateway connectivity status.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between text-body-sm">
                    <span className="text-on-surface-variant">Gateway latency (p95):</span>
                    <span className="font-mono tabular-nums font-medium">38ms</span>
                  </div>
                  <div className="flex justify-between text-body-sm">
                    <span className="text-on-surface-variant">Active nodes:</span>
                    <span className="font-mono tabular-nums font-medium">12 / 12</span>
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Badge variant="success">All nodes nominal</Badge>
                <Button variant="ghost" size="sm">
                  View logs
                </Button>
              </CardFooter>
            </Card>
          </div>
        </section>

        {/* 7. ALERT */}
        <section className="space-y-4">
          <div className="border-b border-outline-variant/30 pb-2">
            <h3 className="text-h3 font-semibold">7. Alert (Inline)</h3>
            <p className="text-caption text-on-surface-variant">
              Clear message stating what happened and what to do. Uses tokens, no raw hex.
            </p>
          </div>
          <div className="space-y-3">
            <Alert
              variant="error"
              title="Authentication session expired"
              description="Your session reached the 12-hour timeout threshold. Sign in again to continue."
              action={<Button variant="destructive" size="sm">Sign in again</Button>}
            />
            <Alert
              variant="warning"
              title="Grading period closes in 48 hours"
              description="14 department marks sheets are pending submission before the registry lock."
            />
            <Alert
              variant="success"
              title="Course catalog published"
              description="Changes synchronized across all 6 faculties and student portals."
            />
            <Alert
              variant="info"
              title="Scheduled database optimization"
              description="Read-only maintenance scheduled for Sunday at 02:00 UTC."
            />
          </div>
        </section>

        {/* 8. EMPTY STATE */}
        <section className="space-y-4">
          <div className="border-b border-outline-variant/30 pb-2">
            <h3 className="text-h3 font-semibold">8. EmptyState</h3>
            <p className="text-caption text-on-surface-variant">
              24px icon, one-line title, one-sentence explanation, one primary action.
            </p>
          </div>
          <Card className="p-0">
            <EmptyState
              icon={Users}
              title="No students enrolled yet"
              description="Import candidate rosters from CSV or connect your student management system."
              action={
                <Button variant="primary">
                  <Plus className="w-4 h-4 mr-1" aria-hidden="true" />
                  Import roster
                </Button>
              }
            />
          </Card>
        </section>

        {/* 9. SKELETON */}
        <section className="space-y-4">
          <div className="border-b border-outline-variant/30 pb-2">
            <h3 className="text-h3 font-semibold">9. Skeleton</h3>
            <p className="text-caption text-on-surface-variant">
              Loading shimmer respecting prefers-reduced-motion. Mode-aware surfaces.
            </p>
          </div>
          <div className="space-y-3">
            <div className="flex items-center gap-4">
              <Skeleton variant="circular" className="w-12 h-12 shrink-0" />
              <div className="space-y-2 flex-1">
                <Skeleton variant="text" className="w-1/3 h-4" />
                <Skeleton variant="text" className="w-1/2 h-3" />
              </div>
            </div>
            <Skeleton variant="rectangular" className="w-full h-24" />
          </div>
        </section>

        {/* 10. KPI TILE */}
        <section className="space-y-4">
          <div className="border-b border-outline-variant/30 pb-2">
            <h3 className="text-h3 font-semibold">10. KpiTile</h3>
            <p className="text-caption text-on-surface-variant">
              Label (caption, muted), value (Newsreader 500 in editorial, Geist 600 in ops), optional delta with icon.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <KpiTile
              label="Active students"
              value="4,821"
              delta={{ value: "+12.4%", direction: "up" }}
              subtext="Enrolled across 14 faculties"
            />
            <KpiTile
              label="Examination pass rate"
              value="91.2%"
              delta={{ value: "-1.8%", direction: "down" }}
              subtext="Compared to Michaelmas 2024"
            />
            <KpiTile
              label="AI assistance tokens"
              value="1.4M/hr"
              delta={{ value: "Stable", direction: "neutral" }}
              subtext="Within budgeted quota"
              progressWidth="65%"
            />
            <KpiTile
              label="Gateway latency"
              value="42ms"
              delta={{ value: "-4ms", direction: "up" }}
              subtext="p95 across edge regions"
            />
          </div>
        </section>

        {/* 11. DATA TABLE */}
        <section className="space-y-4">
          <div className="border-b border-outline-variant/30 pb-2 flex items-center justify-between">
            <div>
              <h3 className="text-h3 font-semibold">11. DataTable</h3>
              <p className="text-caption text-on-surface-variant">
                Sticky header, 48px rows, tabular-nums on numbers, right alignment, hover rows, mobile stacked view (&gt;3 columns).
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setTableLoading(!tableLoading)}
              >
                {tableLoading ? 'Show data' : 'Simulate loading'}
              </Button>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setTableEmpty(!tableEmpty)}
              >
                {tableEmpty ? 'Show rows' : 'Simulate empty'}
              </Button>
            </div>
          </div>
          <DataTable
            title="Candidate Enrollment Records"
            subtitle="Verified academic registry dataset for Michaelmas 2025"
            categoryLabel="Registry Dataset"
            columns={sampleColumns}
            data={tableEmpty ? [] : sampleData}
            isLoading={tableLoading}
            keyExtractor={(row) => row.id}
            actions={
              <Button variant="primary" size="sm">
                <Plus className="w-4 h-4 mr-1" aria-hidden="true" />
                Add student
              </Button>
            }
          />
        </section>
      </div>
    );
  };

  return (
    <div className="min-h-dvh bg-surface p-4 sm:p-6 md:p-10 font-ui-functional space-y-6 max-w-[1440px] mx-auto">
      {/* HEADER BAR */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-outline-variant">
        <div>
          <span className="text-caption font-medium uppercase tracking-wider text-secondary">
            Design Verification Harness
          </span>
          <h1 className="text-h1 font-serif text-on-surface font-semibold">
            UI Primitives Catalog
          </h1>
          <p className="text-body-sm text-on-surface-variant mt-1">
            Mode-aware components built strictly to DESIGN.md section 7 tokens and accessibility rules.
          </p>
        </div>

        {/* MODE SWITCHER */}
        <div className="flex items-center gap-1.5 p-1 bg-surface-container rounded-default border border-outline-variant self-start md:self-auto select-none">
          <button
            type="button"
            onClick={() => setActiveTab('both')}
            className={`px-3 py-1.5 rounded-default text-body-sm font-medium transition-colors cursor-pointer ${
              activeTab === 'both'
                ? 'bg-primary text-on-primary shadow-none'
                : 'text-on-surface-variant hover:text-on-surface'
            }`}
          >
            Side-by-side
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('editorial')}
            className={`px-3 py-1.5 rounded-default text-body-sm font-medium transition-colors cursor-pointer ${
              activeTab === 'editorial'
                ? 'bg-primary text-on-primary shadow-none'
                : 'text-on-surface-variant hover:text-on-surface'
            }`}
          >
            Editorial only
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('ops')}
            className={`px-3 py-1.5 rounded-default text-body-sm font-medium transition-colors cursor-pointer ${
              activeTab === 'ops'
                ? 'bg-primary text-on-primary shadow-none'
                : 'text-on-surface-variant hover:text-on-surface'
            }`}
          >
            Ops Console only
          </button>
        </div>
      </header>

      {/* SHOWCASES */}
      <main className="space-y-10">
        {(activeTab === 'both' || activeTab === 'editorial') && (
          <section className="space-y-3">
            <h2 className="text-h2 font-serif font-medium text-primary">
              Editorial Mode (App Group: /app/(institution))
            </h2>
            {renderComponentShowcase(false)}
          </section>
        )}

        {(activeTab === 'both' || activeTab === 'ops') && (
          <section className="space-y-3">
            <h2 className="text-h2 font-sans font-semibold text-on-surface">
              Ops Console Mode (App Group: /app/(ops) via data-theme=&quot;ops&quot;)
            </h2>
            {renderComponentShowcase(true)}
          </section>
        )}
      </main>
    </div>
  );
}

export default function DevPrimitivesPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-dvh bg-surface p-8 flex items-center justify-center">
          <p className="text-body-sm text-on-surface-variant animate-pulse">
            Loading primitives catalog...
          </p>
        </div>
      }
    >
      <DevPrimitivesContent />
    </Suspense>
  );
}

