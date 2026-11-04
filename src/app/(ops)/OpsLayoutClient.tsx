'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Icon } from '@/components/ui/Icon';
import { Wordmark } from '@/components/brand/Wordmark';
import {
  Activity,
  Coins,
  Split,
  Radio,
  ScrollText,
  FolderOpen,
  BookOpen,
  SlidersHorizontal,
  Search,
  Bell,
  User,
  LogOut,
  PanelLeftClose,
  ChevronDown,
  ChevronUp,
  Menu,
  X,
} from 'lucide-react';

export interface OpsUser {
  name: string;
  role: string;
  email?: string;
}

export function OpsLayoutClient({
  user,
  children,
}: {
  user: OpsUser;
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Standalone auth and recovery pages render without ops shell
  if (
    pathname === '/ops/login' ||
    pathname === '/ops/forgot-password' ||
    pathname === '/ops/reset-password' ||
    pathname === '/ops/change-password'
  ) {
    return <>{children}</>;
  }

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
    } finally {
      window.location.href = '/ops/login';
    }
  };

  const navItemsOps = [
    { label: 'System Health', href: '/ops/health', icon: Activity, badge: 'Pulse', path: 'system-health' },
    { label: 'AI Cost & Requests', href: '/ops/ai-cost', icon: Coins, badge: '2.4k/s', path: 'ai-cost-and-requests' },
    { label: 'AI Routing', href: '/ops/routing', icon: Split, badge: 'Mesh', path: 'ai-routing' },
    { label: 'Student Signal', href: '/ops/routing', icon: Radio, badge: 'Dot', path: 'student-signal' },
    { label: 'Logging', href: '/ops/logs', icon: ScrollText, badge: 'stdout', path: 'logging' },
  ];

  const navItemsGovernance = [
    {
      label: 'Documentation & Settings',
      href: '/ops/health#docs',
      icon: FolderOpen,
      path: 'documentation-and-settings',
      subItems: [
        { label: 'Operations Docs', href: '/ops/health#docs', icon: BookOpen, path: 'operations-docs' },
        { label: 'Cluster Settings', href: '/ops/health#settings', icon: SlidersHorizontal, path: 'cluster-settings' },
      ],
    },
  ];

  return (
    <div data-theme="ops" className="dark bg-ops-canvas text-ops-text antialiased selection:bg-ops-accent selection:text-ops-canvas font-ui-functional text-sm min-h-dvh flex flex-col">
      {/* Off-canvas mobile backdrop */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 top-14 bg-black/60 z-30 lg:hidden transition-opacity"
          onClick={() => setIsMobileMenuOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* FIXED TOP HEADER */}
      <header className="fixed top-0 left-0 right-0 h-14 z-50 bg-surface-container-low/95 backdrop-blur-md border-b border-outline-variant flex items-center justify-between px-4 sm:px-6 select-none gap-3">
        <div className="flex items-center gap-3 sm:gap-6 min-w-0">
          {/* Mobile menu hamburger button */}
          <button
            type="button"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="lg:hidden p-1.5 rounded hover:bg-surface-container-high text-on-surface-variant hover:text-on-surface cursor-pointer shrink-0"
            aria-label="Toggle operations navigation"
          >
            <Icon icon={isMobileMenuOpen ? X : Menu} size={20} />
          </button>

          <div className="flex items-center gap-2.5 min-w-0">
            <div className="flex items-center gap-2 min-w-0">
              <Wordmark size="sm" tone="dark" />
              <span className="px-1.5 py-0.5 rounded bg-surface-container-high border border-outline-variant text-primary font-label-caps text-[10px] sm:text-[11px] font-semibold uppercase tracking-wider shrink-0">
                Ops
              </span>
            </div>
          </div>
          <div className="h-4 w-px bg-outline-variant hidden sm:block shrink-0"></div>
          <div className="hidden md:flex items-center gap-2 px-2.5 py-1 rounded bg-surface-container border border-outline-variant shrink-0">
            <span className="w-2 h-2 rounded-full bg-primary animate-pulse"></span>
            <span className="font-mono text-xs text-on-surface-variant font-medium">PROD-CLUSTER-A</span>
            <span className="text-outline font-mono text-xs">{'//'}</span>
            <span className="font-mono text-xs text-on-surface-variant">eu-west-1</span>
          </div>
          <div className="hidden xl:flex items-center gap-2 text-on-surface-variant font-mono text-xs shrink-0">
            <span className="w-1.5 h-1.5 rounded-full bg-primary"></span>
            <span>All Systems Nominal</span>
            <span className="text-outline">·</span>
            <span>99.98% Uptime</span>
            <span className="text-outline">·</span>
            <span className="font-mono text-on-surface">p95 42ms</span>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          <div className="relative hidden lg:flex items-center">
            <div className="flex items-center gap-2 px-2.5 py-1 rounded bg-surface-container-lowest border border-outline-variant text-on-surface-variant hover:border-outline transition-colors cursor-pointer w-60">
              <Icon icon={Search} size={16} className="text-outline" />
              <span className="text-xs flex-1 text-on-surface-variant truncate">Search telemetry, nodes...</span>
              <kbd className="px-1.5 py-0.5 rounded bg-surface-container border border-outline-variant text-outline font-mono text-[10px]">
                ⌘K
              </kbd>
            </div>
          </div>
          <button
            type="button"
            className="relative p-1.5 rounded hover:bg-surface-container-high text-on-surface-variant hover:text-on-surface transition-colors cursor-pointer"
            aria-label="System notifications"
          >
            <Icon icon={Bell} size={18} />
            <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-primary border-2 border-surface-container-low"></span>
          </button>
          <div className="h-4 w-px bg-outline-variant"></div>

          {/* User Chip with User Menu */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
              className="flex items-center gap-2 sm:gap-3 pl-1 hover:opacity-85 transition-opacity cursor-pointer text-left"
              aria-expanded={isUserMenuOpen}
              aria-haspopup="true"
              id="ops-user-menu-button"
            >
              <div className="flex flex-col items-end hidden sm:flex min-w-0">
                <span className="text-xs font-semibold text-on-surface leading-tight truncate max-w-[120px]">{user.name}</span>
                <span className="font-mono text-[10px] text-on-surface-variant truncate max-w-[100px]">{user.role}</span>
              </div>
              <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-on-primary shrink-0">
                <Icon icon={User} size={16} />
              </div>
              <Icon icon={isUserMenuOpen ? ChevronUp : ChevronDown} size={14} className="text-outline hover:text-on-surface hidden sm:block" />
            </button>

            {isUserMenuOpen && (
              <div
                className="absolute right-0 top-12 w-64 bg-surface-container rounded-lg shadow-xl border border-outline-variant p-2 z-50 flex flex-col gap-1 select-none animate-in fade-in duration-100"
                role="menu"
                aria-labelledby="ops-user-menu-button"
              >
                <div className="px-2.5 py-2 border-b border-outline-variant/30 flex flex-col gap-0.5">
                  <span className="text-sm font-semibold text-on-surface truncate">{user.name}</span>
                  {user.email && (
                    <span className="text-xs text-on-surface-variant font-mono truncate">{user.email}</span>
                  )}
                  <span className="font-mono text-[10px] text-primary uppercase mt-1">{user.role}</span>
                </div>

                <button
                  type="button"
                  onClick={handleLogout}
                  className="flex items-center gap-2 px-2.5 py-2 rounded text-xs text-error hover:bg-error-container/20 transition-colors w-full text-left cursor-pointer mt-1"
                  role="menuitem"
                >
                  <Icon icon={LogOut} size={16} />
                  <span>Sign Out</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* LEFT SIDEBAR (Off-canvas drawer on < lg, fixed on >= lg) */}
      <aside
        className={`fixed left-0 top-14 bottom-0 w-64 bg-surface-container-lowest border-r border-outline-variant z-40 flex flex-col justify-between select-none transition-transform duration-200 ease-out lg:translate-x-0 ${
          isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex flex-col flex-1 py-3 overflow-y-auto">
          <div className="px-4 pb-2 text-outline font-label-caps text-[11px] uppercase tracking-wider font-semibold">
            Operations Engine
          </div>
          <nav className="flex flex-col gap-0.5 px-2">
            {navItemsOps.map((item) => {
              const isActive = pathname === item.href || (item.href === '/ops/health' && pathname === '/ops');
              const ItemIcon = item.icon;
              return (
                <Link
                  key={item.path}
                  href={item.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`flex items-center justify-between px-3 py-2 rounded transition-colors ${
                    isActive
                      ? 'bg-surface-container text-primary font-semibold border-l-2 border-primary'
                      : 'text-on-surface-variant hover:bg-surface-container-low hover:text-on-surface text-xs'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <Icon icon={ItemIcon} size={16} />
                    <span className="truncate">{item.label}</span>
                  </div>
                  {item.badge === 'Pulse' ? (
                    <span className="w-2 h-2 rounded-full bg-primary animate-pulse shrink-0"></span>
                  ) : item.badge === 'Dot' ? (
                    <span className="w-1.5 h-1.5 rounded-full bg-outline shrink-0"></span>
                  ) : item.badge === 'Mesh' ? (
                    <span className="px-1 py-0.5 text-primary font-mono text-[10px] font-medium shrink-0">Mesh</span>
                  ) : item.badge ? (
                    <span className="px-1.5 py-0.5 rounded bg-surface-container-high text-on-surface-variant font-mono text-[10px] shrink-0">
                      {item.badge}
                    </span>
                  ) : null}
                </Link>
              );
            })}
          </nav>

          <div className="my-4 border-t border-outline-variant mx-4"></div>

          <div className="px-4 pb-2 text-outline font-label-caps text-[11px] uppercase tracking-wider font-semibold">
            Governance &amp; Documentation
          </div>
          <nav className="flex flex-col gap-0.5 px-2">
            {navItemsGovernance.map((item) => {
              const GroupIcon = item.icon;
              return (
                <div key={item.path} className="flex flex-col gap-0.5">
                  <div className="flex items-center gap-3 px-3 py-2 text-on-surface text-xs font-semibold">
                    <Icon icon={GroupIcon} size={16} className="text-primary" />
                    <span className="truncate">{item.label}</span>
                  </div>
                  {item.subItems && (
                    <div className="pl-4 ml-3 border-l border-outline-variant/30 flex flex-col gap-0.5 my-0.5">
                      {item.subItems.map((sub) => {
                        const isSubActive = pathname === sub.href;
                        const SubIcon = sub.icon;
                        return (
                          <Link
                            key={sub.path}
                            href={sub.href}
                            onClick={() => setIsMobileMenuOpen(false)}
                            className={`flex items-center gap-2.5 px-3 py-1.5 rounded transition-colors text-xs ${
                              isSubActive
                                ? 'bg-surface-container text-primary font-semibold border-l-2 border-primary'
                                : 'text-on-surface-variant hover:bg-surface-container-low hover:text-on-surface'
                            }`}
                          >
                            <Icon icon={SubIcon} size={14} className="text-outline" />
                            <span className="truncate">{sub.label}</span>
                          </Link>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </nav>
        </div>

        <div className="p-3 border-t border-outline-variant bg-surface-container-lowest flex items-center justify-between">
          <div className="flex items-center gap-2 text-outline font-mono text-xs">
            <span className="w-1.5 h-1.5 rounded-full bg-primary"></span>
            <span>v2.41.8-core</span>
          </div>
          <button
            type="button"
            className="p-1.5 rounded hover:bg-surface-container-high text-on-surface-variant hover:text-on-surface transition-colors cursor-pointer"
            aria-label="Collapse panel"
          >
            <Icon icon={PanelLeftClose} size={16} />
          </button>
        </div>
      </aside>

      {/* MAIN VIEWPORT CONTAINER */}
      <div className="pl-0 lg:pl-64 flex-1 flex flex-col min-h-dvh">
        <main className="relative w-full pt-14 bg-surface-container-lowest min-h-[calc(100dvh-3.5rem)] px-4 sm:px-6 flex-1">
          {children}
        </main>
      </div>
    </div>
  );
}

export default OpsLayoutClient;
