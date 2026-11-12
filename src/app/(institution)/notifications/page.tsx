'use client';

import React, { useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import {
  Bell,
  Search,
  SlidersHorizontal,
  Clock,
  User,
  Shield,
  ArrowRight,
  CheckCircle2,
  AlertTriangle,
  Calendar,
  X,
} from 'lucide-react';
import {
  Button,
  Badge,
  Alert,
  Skeleton,
  EmptyState,
} from '@/components/ui';

export type NotificationsPageState = 'default' | 'loading' | 'empty' | 'error';

interface NotificationItem {
  id: string;
  title: string;
  category: 'Academic alert' | 'Remediation notice' | 'Gazette bulletin' | 'Governance' | 'System maintenance';
  priority: 'Urgent' | 'High' | 'Standard' | 'Low';
  recipients: string;
  channel: string;
  timestamp: string;
  status: 'Action required' | 'Delivered and unread' | 'Delivered and triaged' | 'Scheduled';
  sender: string;
  summary: string;
  actionText?: string;
  unread: boolean;
}

function NotificationsContent() {
  const searchParams = useSearchParams();
  const showHarness = process.env.NODE_ENV !== 'production' && searchParams.get('states') === '1';

  const [harnessState, setHarnessState] = useState<NotificationsPageState>('default');
  const [activeCategoryFilter, setActiveCategoryFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedId, setSelectedId] = useState('NOT-5012');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const [notifications, setNotifications] = useState<NotificationItem[]>([
    {
      id: 'NOT-5012',
      title: 'Cellular signalling diagnostic anomaly — 18 students flagged',
      category: 'Remediation notice',
      priority: 'Urgent',
      recipients: 'Senior Tutors (Medical Sciences Division)',
      channel: 'Console alert and email',
      timestamp: 'Today, 08:30 AM',
      status: 'Action required',
      sender: 'Socratic diagnostic engine',
      summary:
        'Diagnostic analysis identified a high error rate (>42%) on signal transduction kinetics in Tutorial Group B. 18 undergraduate students require remedial supervisor review prior to Week 5 collections.',
      actionText: 'Review remediation roster',
      unread: true,
    },
    {
      id: 'NOT-5013',
      title: 'Formative assessment deadline reminder — Michaelmas Week 7',
      category: 'Academic alert',
      priority: 'High',
      recipients: 'Finalist Undergraduates & PGT Students',
      channel: 'Console broadcast',
      timestamp: 'Today, 07:15 AM',
      status: 'Delivered and triaged',
      sender: 'Academic registry',
      summary:
        'Submission deadline for Michaelmas Term Extended Essays and Lab Portfolios is set for Friday of Week 7 at 12:00 noon. Submissions must be uploaded through the e-submission portal.',
      actionText: 'View submission requirements',
      unread: true,
    },
    {
      id: 'NOT-5014',
      title: 'Gazette publication: Proposed amendments to Statute VI',
      category: 'Gazette bulletin',
      priority: 'Standard',
      recipients: 'Members of Congregation & Faculty Senate',
      channel: 'Email and portal',
      timestamp: 'Yesterday, 04:30 PM',
      status: 'Delivered and triaged',
      sender: 'University secretariat',
      summary:
        'Notice of a Congregation meeting to consider proposed changes to Statute VI concerning tutorial supervision allowances and inter-collegiate teaching allocations for 2025–26.',
      actionText: 'Read gazette notice',
      unread: false,
    },
    {
      id: 'NOT-5015',
      title: 'Quantum information practical relocation notice',
      category: 'Academic alert',
      priority: 'Standard',
      recipients: 'CS-501 Enrolled Cohort',
      channel: 'Console alert',
      timestamp: 'Yesterday, 02:10 PM',
      status: 'Delivered and triaged',
      sender: 'Department of Computer Science',
      summary:
        'Practical sessions scheduled for Thursday morning have been relocated to Wolfson Building Lecture Theatre B due to audiovisual system upgrades.',
      actionText: 'View venue details',
      unread: false,
    },
    {
      id: 'NOT-5016',
      title: 'Scheduled maintenance: Identity provider key rotation',
      category: 'System maintenance',
      priority: 'Low',
      recipients: 'All Institutional IT Administrators',
      channel: 'Console notice',
      timestamp: '22 Oct 2024, 09:00 AM',
      status: 'Delivered and unread',
      sender: 'Oxford IT Services',
      summary:
        'Brief 15-minute maintenance window scheduled for Sunday at 02:00 UTC. SSO logins may experience brief latency spikes during key rotation procedures.',
      actionText: 'View maintenance window',
      unread: true,
    },
    {
      id: 'NOT-5017',
      title: 'Degree ceremony registration deadline reminder',
      category: 'Governance',
      priority: 'High',
      recipients: 'Graduands & College Deans',
      channel: 'Console broadcast and email',
      timestamp: '21 Oct 2024, 11:45 AM',
      status: 'Scheduled',
      sender: 'University Marshal',
      summary:
        'Formal registration for degree presentation at the Sheldonian Theatre closes on 15 November. Deans of Degrees must verify candidate eligibility lists prior to final roll call.',
      actionText: 'Open sheldonian roster',
      unread: false,
    },
  ]);

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, unread: false })));
    setToastMessage('All notifications marked as read.');
    setTimeout(() => setToastMessage(null), 3000);
  };

  const markAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, unread: false } : n))
    );
  };

  const filteredNotifications = notifications.filter((item) => {
    const matchesCategory =
      activeCategoryFilter === 'all' ||
      (activeCategoryFilter === 'academic' && item.category === 'Academic alert') ||
      (activeCategoryFilter === 'remediation' && item.category === 'Remediation notice') ||
      (activeCategoryFilter === 'gazette' && item.category === 'Gazette bulletin') ||
      (activeCategoryFilter === 'governance' && item.category === 'Governance') ||
      (activeCategoryFilter === 'system' && item.category === 'System maintenance');

    const matchesPriority =
      priorityFilter === 'all' || item.priority.toLowerCase() === priorityFilter.toLowerCase();

    const matchesSearch =
      searchQuery === '' ||
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.recipients.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.sender.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesCategory && matchesPriority && matchesSearch;
  });

  const selectedNotification =
    notifications.find((n) => n.id === selectedId) || filteredNotifications[0] || notifications[0];

  const unreadCount = notifications.filter((n) => n.unread).length;

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'Urgent':
        return (
          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-caption font-semibold bg-error-container text-error">
            <span className="w-1.5 h-1.5 rounded-full bg-error" />
            Urgent
          </span>
        );
      case 'High':
        return (
          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-caption font-semibold bg-warning-container text-warning">
            <span className="w-1.5 h-1.5 rounded-full bg-warning" />
            High
          </span>
        );
      case 'Standard':
        return (
          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-caption font-medium bg-surface-container text-on-surface-variant">
            Standard
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-caption font-medium bg-surface-container-high text-on-surface-variant">
            Low
          </span>
        );
    }
  };

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
            <span>Notification states</span>
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

      {/* Page Header (Detail template: h1 Newsreader 500/600, one-line description, right primary action) */}
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-outline-variant/40">
        <div className="flex flex-col">
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-serif text-on-surface font-medium tracking-tight">
              Notification management
            </h1>
            {unreadCount > 0 && (
              <span className="px-2 py-0.5 rounded-full text-caption font-semibold bg-primary-fixed text-primary">
                {unreadCount} unread
              </span>
            )}
          </div>
          <p className="text-body-sm text-on-surface-variant mt-1">
            Real-time feed of academic remediation flags, faculty alerts, and scheduled dispatches.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="secondary"
            onClick={markAllAsRead}
            disabled={unreadCount === 0}
            className="w-full sm:w-auto h-11 sm:h-10 text-body-sm"
          >
            <CheckCircle2 className="w-4 h-4 mr-1.5" />
            Mark all as read
          </Button>
        </div>
      </header>

      {/* Toast confirmation */}
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
          title="Failed to load notifications feed"
          description="Unable to sync notifications with institutional message broker. Check connectivity and retry."
          action={<Button variant="secondary" onClick={() => setHarnessState('default')}>Try again</Button>}
        />
      )}

      {/* State: Loading */}
      {harnessState === 'loading' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6" aria-busy="true">
          <div className="lg:col-span-5 flex flex-col gap-3">
            <Skeleton className="h-10 rounded-md" />
            <Skeleton className="h-28 rounded-md" />
            <Skeleton className="h-28 rounded-md" />
            <Skeleton className="h-28 rounded-md" />
          </div>
          <div className="lg:col-span-7">
            <Skeleton className="h-96 rounded-md" />
          </div>
        </div>
      )}

      {/* State: Empty */}
      {harnessState === 'empty' && (
        <EmptyState
          icon={Bell}
          title="No notifications to display"
          description="Your inbox is clear. New academic alerts and dispatches will appear here."
          action={
            <Button variant="secondary" onClick={() => setHarnessState('default')}>
              Reset to active feed
            </Button>
          }
        />
      )}

      {/* State: Default (Two-Column Detail Template on lg:grid-cols-12, single column below) */}
      {harnessState === 'default' && (
        <div className="flex flex-col gap-5">
          {/* Filters Row */}
          <section className="bg-surface-container-lowest rounded-md border border-outline-variant p-3.5 flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2.5 flex-1 min-w-[260px]">
              {/* Search input */}
              <div className="relative flex items-center bg-surface px-3 py-1.5 rounded-sm border border-outline-variant flex-1 max-w-sm">
                <Search className="w-4 h-4 text-on-surface-variant mr-2 shrink-0" aria-hidden="true" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Filter notifications..."
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

              {/* Category filter */}
              <select
                value={activeCategoryFilter}
                onChange={(e) => setActiveCategoryFilter(e.target.value)}
                className="bg-surface text-body-sm text-on-surface px-3 py-1.5 rounded-sm border border-outline-variant focus:outline-none cursor-pointer"
              >
                <option value="all">All categories</option>
                <option value="remediation">Remediation notice</option>
                <option value="academic">Academic alert</option>
                <option value="gazette">Gazette bulletin</option>
                <option value="governance">Governance</option>
                <option value="system">System maintenance</option>
              </select>

              {/* Priority filter */}
              <select
                value={priorityFilter}
                onChange={(e) => setPriorityFilter(e.target.value)}
                className="bg-surface text-body-sm text-on-surface px-3 py-1.5 rounded-sm border border-outline-variant focus:outline-none cursor-pointer"
              >
                <option value="all">All priorities</option>
                <option value="urgent">Urgent</option>
                <option value="high">High</option>
                <option value="standard">Standard</option>
                <option value="low">Low</option>
              </select>
            </div>

            <span className="text-caption text-on-surface-variant font-medium">
              {filteredNotifications.length} notifications
            </span>
          </section>

          {/* Two-Column Detail Grid: Left Queue (5 cols), Right Inspection (7 cols) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Left Column (5 cols): Notifications List */}
            <div className="lg:col-span-5 flex flex-col gap-2.5">
              {filteredNotifications.length === 0 ? (
                <div className="p-8 text-center rounded-md border border-outline-variant bg-surface-container-lowest text-on-surface-variant text-body-sm">
                  No matching notifications found for this filter.
                </div>
              ) : (
                filteredNotifications.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => {
                      setSelectedId(item.id);
                      markAsRead(item.id);
                    }}
                    className={`w-full text-left p-4 rounded-md border transition-all cursor-pointer flex flex-col gap-2 ${
                      selectedId === item.id
                        ? 'bg-surface-container-lowest border-primary shadow-xs'
                        : 'bg-surface-container-lowest border-outline-variant hover:bg-surface-container'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        {item.unread && (
                          <span
                            className="w-2 h-2 rounded-full bg-secondary shrink-0"
                            title="Unread notification"
                          />
                        )}
                        <span className="text-caption font-mono text-on-surface-variant font-medium">
                          {item.id}
                        </span>
                      </div>
                      {getPriorityBadge(item.priority)}
                    </div>

                    <h2 className="text-body-sm font-semibold text-on-surface line-clamp-2 leading-snug">
                      {item.title}
                    </h2>

                    <div className="flex items-center justify-between text-caption text-on-surface-variant pt-1 border-t border-outline-variant/30">
                      <span>{item.category}</span>
                      <span>{item.timestamp}</span>
                    </div>
                  </button>
                ))
              )}
            </div>

            {/* Right Column (7 cols): Sticky Notification Detail Panel */}
            {selectedNotification && (
              <div className="lg:col-span-7 lg:sticky lg:top-6 bg-surface-container-lowest rounded-md border border-outline-variant p-6 flex flex-col gap-5">
                {/* Detail Header */}
                <div className="flex items-start justify-between gap-4 pb-4 border-b border-outline-variant/40">
                  <div className="flex flex-col gap-1.5">
                    <div className="flex items-center gap-2">
                      {getPriorityBadge(selectedNotification.priority)}
                      <span className="text-caption text-on-surface-variant font-mono">
                        {selectedNotification.id}
                      </span>
                    </div>
                    <h2 className="text-xl sm:text-2xl font-serif text-on-surface font-semibold leading-tight">
                      {selectedNotification.title}
                    </h2>
                  </div>
                </div>

                {/* Metadata summary */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 p-3.5 rounded-sm bg-surface-container-low border border-outline-variant/40 text-caption">
                  <div className="flex flex-col">
                    <span className="text-on-surface-variant">Sender</span>
                    <span className="font-medium text-on-surface">{selectedNotification.sender}</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-on-surface-variant">Timestamp</span>
                    <span className="font-medium text-on-surface">{selectedNotification.timestamp}</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-on-surface-variant">Channel</span>
                    <span className="font-medium text-on-surface">{selectedNotification.channel}</span>
                  </div>
                  <div className="col-span-2 sm:col-span-3 flex flex-col pt-1 border-t border-outline-variant/30">
                    <span className="text-on-surface-variant">Recipient cohort</span>
                    <span className="font-medium text-on-surface">{selectedNotification.recipients}</span>
                  </div>
                </div>

                {/* Full Message Body */}
                <div className="flex flex-col gap-2">
                  <span className="text-caption font-semibold text-on-surface">
                    Notification summary
                  </span>
                  <p className="text-body-sm text-on-surface leading-relaxed">
                    {selectedNotification.summary}
                  </p>
                </div>

                {/* Action CTA */}
                {selectedNotification.actionText && (
                  <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                    <Button
                      variant="primary"
                      onClick={() => {
                        setToastMessage(`Action triggered: ${selectedNotification.actionText}`);
                        setTimeout(() => setToastMessage(null), 3000);
                      }}
                      className="h-11 sm:h-10 text-body-sm"
                    >
                      {selectedNotification.actionText}
                    </Button>
                    {selectedNotification.unread && (
                      <Button
                        variant="secondary"
                        onClick={() => markAsRead(selectedNotification.id)}
                        className="h-11 sm:h-10 text-body-sm"
                      >
                        Mark as read
                      </Button>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default function NotificationsPage() {
  return (
    <Suspense fallback={<div className="p-8 text-caption text-on-surface-variant">Loading notification center...</div>}>
      <NotificationsContent />
    </Suspense>
  );
}
