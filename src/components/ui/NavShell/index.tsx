'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Icon } from '@/components/ui/Icon';
import { Wordmark } from '@/components/brand/Wordmark';
import {
  Menu,
  X,
  ChevronDown,
  ChevronUp,
  Calendar,
  Bell,
  User,
  LogOut,
  RefreshCw,
} from 'lucide-react';

export interface NavItem {
  label: string;
  href: string;
  path: string;
  icon?: string;
  subItems?: NavItem[];
}

export interface NavGroup {
  groupName: string;
  items: NavItem[];
}

export interface NavShellUser {
  name: string;
  role: string;
  email?: string;
  avatarIcon?: string;
}

export interface NavShellProps {
  activeRoute: string;
  navGroups: NavGroup[];
  user: NavShellUser;
  brandName?: string;
  brandSubtitle?: string;
  brandLogoUrl?: string;
  institutionName?: string;
  institutionSubtitle?: string;
  termInfo?: string;
  roles?: { value: string; label: string }[];
  activeRole?: string;
  onRoleChange?: (role: string) => void;
  onLogout?: () => void;
  federationTag?: string;
  versionTag?: string;
  children: React.ReactNode;
}

export function NavShell({
  activeRoute,
  navGroups,
  user,
  brandName,
  brandSubtitle,
  brandLogoUrl,
  institutionName,
  institutionSubtitle,
  termInfo,
  roles = [],
  activeRole,
  onRoleChange,
  onLogout,
  federationTag,
  versionTag,
  children,
}: NavShellProps) {
  const router = useRouter();
  const currentPath = usePathname();
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const isAuthPage =
    currentPath === '/login' ||
    currentPath === '/institution/login' ||
    currentPath === '/forgot-password' ||
    currentPath === '/reset-password' ||
    currentPath === '/change-password';

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
    } finally {
      if (onLogout) {
        onLogout();
      } else {
        window.location.href = '/login';
      }
    }
  };

  if (isAuthPage) {
    return <div className="bg-surface font-ui-functional text-on-surface antialiased min-h-dvh">{children}</div>;
  }

  return (
    <div className="bg-surface font-ui-functional text-on-surface antialiased selection:bg-secondary-fixed selection:text-on-secondary-fixed min-h-dvh">
      {/* Off-canvas mobile backdrop */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-xs z-50 lg:hidden transition-opacity"
          onClick={() => setIsMobileMenuOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Sidebar Navigation (Off-canvas drawer on < lg, fixed on >= lg) */}
      <aside
        className={`fixed left-0 top-0 h-dvh w-72 bg-surface-container-low z-50 flex flex-col justify-between shadow-[0_1px_8px_rgba(0,0,0,0.04)] overflow-y-auto transition-transform duration-200 ease-out border-r border-outline-variant/30 lg:translate-x-0 ${
          isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex flex-col">
          <div className="h-14 px-4 sm:px-6 flex items-center justify-between bg-surface-container-low border-b border-outline-variant/20">
            <div className="flex items-center gap-3 min-w-0">
              <Wordmark size="sm" tone="light" />
              {brandSubtitle && (
                <span className="font-label-caps text-[11px] uppercase tracking-wider text-secondary truncate">
                  {brandSubtitle}
                </span>
              )}
            </div>
            <button
              type="button"
              onClick={() => setIsMobileMenuOpen(false)}
              className="lg:hidden p-1.5 rounded-md hover:bg-surface-container text-on-surface-variant hover:text-on-surface cursor-pointer"
              aria-label="Close menu"
            >
              <Icon icon={X} size={18} />
            </button>
          </div>

          {roles.length > 0 && (
            <div className="px-4 py-2">
              <div className="bg-surface-container p-2.5 rounded-lg flex flex-col gap-1.5">
                <label className="font-label-caps text-[11px] uppercase text-on-surface-variant flex items-center justify-between" htmlFor="role-switch">
                  <span>Active Role View</span>
                  <Icon icon={RefreshCw} size={14} className="text-secondary" />
                </label>
                <select
                  className="w-full bg-surface-container-lowest text-on-surface font-ui-functional text-[13px] py-1 px-2 rounded outline-none cursor-pointer hover:bg-surface border border-outline-variant/30"
                  value={activeRole}
                  onChange={(e) => onRoleChange?.(e.target.value)}
                  id="role-switch"
                >
                  {roles.map((r) => (
                    <option key={r.value} value={r.value}>
                      {r.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}

          <nav className="flex-1 px-4 py-2 flex flex-col gap-4">
            {navGroups.map((group, idx) => (
              <div key={group.groupName} data-nav-group={group.groupName.toLowerCase().replace(/\s+/g, '-')}>
                <div className="px-2 mb-1 font-label-caps text-[11px] uppercase tracking-wider text-secondary font-medium">
                  {idx + 1}. {group.groupName}
                </div>
                <div className="flex flex-col gap-0.5">
                  {group.items.map((item) => {
                    const isActive =
                      activeRoute === item.path ||
                      activeRoute === item.href ||
                      (currentPath && currentPath === item.href && item.href !== '#');
                    return (
                      <React.Fragment key={item.path || item.label}>
                        <Link
                          aria-current={isActive ? 'page' : undefined}
                          className={`flex items-center justify-between px-2.5 py-1.5 rounded-lg transition-colors font-ui-functional text-[13px] ${
                            isActive
                              ? 'bg-primary-container text-on-primary-container font-semibold'
                              : 'text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface'
                          }`}
                          data-path={item.path}
                          href={item.href}
                          onClick={() => setIsMobileMenuOpen(false)}
                        >
                          <span className="truncate">{item.label}</span>
                          {item.subItems && (
                            <Icon icon={ChevronDown} size={16} className="text-secondary shrink-0" />
                          )}
                        </Link>
                        {item.subItems && (
                          <div className="pl-3 ml-3 border-l border-outline-variant/30 flex flex-col gap-0.5 my-0.5">
                            {item.subItems.map((subItem) => {
                              const isSubActive =
                                activeRoute === subItem.path ||
                                activeRoute === subItem.href ||
                                (currentPath && currentPath === subItem.href && subItem.href !== '#');
                              return (
                                <Link
                                  key={subItem.path || subItem.label}
                                  aria-current={isSubActive ? 'page' : undefined}
                                  className={`flex items-center px-2 py-1 rounded-md transition-colors font-ui-functional text-[12px] ${
                                    isSubActive
                                      ? 'bg-primary-container/80 text-on-primary-container font-semibold'
                                      : 'text-on-surface-variant/80 hover:bg-surface-container-high hover:text-on-surface'
                                  }`}
                                  data-path={subItem.path}
                                  href={subItem.href}
                                  onClick={() => setIsMobileMenuOpen(false)}
                                >
                                  <span className="truncate">{subItem.label}</span>
                                </Link>
                              );
                            })}
                          </div>
                        )}
                      </React.Fragment>
                    );
                  })}
                </div>
              </div>
            ))}
          </nav>
        </div>

        <div className="p-4 bg-surface-container-low flex items-center justify-between border-t border-outline-variant/20 text-xs">
          <div className="flex items-center gap-1.5 min-w-0">
            <span className="w-2 h-2 rounded-full bg-secondary shrink-0"></span>
            <span className="font-label-caps text-[11px] uppercase text-on-surface-variant truncate">{federationTag}</span>
          </div>
          <span className="font-label-caps text-[11px] text-outline shrink-0">{versionTag}</span>
        </div>
      </aside>

      {/* Main Layout Area */}
      <div className="pl-0 lg:pl-72 flex flex-col min-h-dvh">
        <header className="fixed top-0 left-0 lg:left-72 right-0 h-14 bg-surface/85 backdrop-blur-xl border-b border-outline-variant/30 z-40 flex items-center justify-between px-4 sm:px-6 gap-3">
          <div className="flex items-center gap-3 min-w-0">
            {/* Mobile menu button */}
            <button
              type="button"
              onClick={() => setIsMobileMenuOpen(true)}
              className="lg:hidden p-1.5 rounded-md hover:bg-surface-container text-on-surface-variant hover:text-on-surface cursor-pointer shrink-0"
              aria-label="Open navigation menu"
            >
              <Icon icon={Menu} size={20} />
            </button>

            <div className="flex flex-col min-w-0">
              <span className="font-serif text-base sm:text-lg text-primary leading-tight font-medium truncate">
                {institutionName}
              </span>
              {institutionSubtitle && (
                <span className="font-label-caps text-[10px] sm:text-[11px] uppercase text-on-surface-variant truncate hidden sm:block">
                  {institutionSubtitle}
                </span>
              )}
            </div>

            {termInfo && (
              <>
                <div className="h-4 w-px bg-outline-variant hidden xl:block shrink-0"></div>
                <div className="hidden xl:flex items-center gap-1.5 bg-surface-container px-2.5 py-1 rounded-full shrink-0">
                  <Icon icon={Calendar} size={14} className="text-secondary" />
                  <span className="font-ui-functional text-xs text-on-surface">{termInfo}</span>
                </div>
              </>
            )}
          </div>

          <div className="flex items-center gap-2 sm:gap-4 shrink-0">
            <button
              aria-label="Notifications"
              className="relative p-2 rounded-full hover:bg-surface-container text-on-surface-variant hover:text-on-surface transition-colors cursor-pointer"
              type="button"
            >
              <Icon icon={Bell} size={18} />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-secondary ring-2 ring-surface"></span>
            </button>
            <div className="h-5 w-px bg-outline-variant"></div>
            <div className="relative">
              <button
                type="button"
                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                className="flex items-center gap-2 hover:opacity-85 transition-opacity cursor-pointer text-left p-1 rounded-lg"
                id="navshell-user-menu-button"
                aria-expanded={isUserMenuOpen}
                aria-haspopup="true"
              >
                <div className="flex flex-col text-right hidden sm:flex min-w-0">
                  <span className="font-ui-functional text-xs font-semibold text-on-surface leading-snug truncate max-w-[120px]">
                    {user.name}
                  </span>
                  <div className="flex items-center justify-end gap-1">
                    <span className="font-label-caps text-[10px] uppercase text-secondary font-medium truncate max-w-[100px]">
                      {user.role}
                    </span>
                    <Icon icon={isUserMenuOpen ? ChevronUp : ChevronDown} size={12} className="text-on-surface-variant" />
                  </div>
                </div>
                <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-on-primary shrink-0">
                  <Icon icon={User} size={16} />
                </div>
              </button>

              {isUserMenuOpen && (
                <div
                  className="absolute right-0 top-12 w-64 bg-surface-container rounded-lg shadow-lg border border-outline-variant p-2 z-50 flex flex-col gap-1 select-none animate-in fade-in duration-100"
                  role="menu"
                  aria-labelledby="navshell-user-menu-button"
                >
                  <div className="px-2.5 py-2 border-b border-outline-variant/30 flex flex-col">
                    <span className="font-ui-functional text-sm font-semibold text-on-surface truncate">{user.name}</span>
                    {user.email && (
                      <span className="text-xs text-on-surface-variant truncate">{user.email}</span>
                    )}
                    <span className="font-label-caps text-[10px] uppercase text-secondary mt-1">{user.role}</span>
                  </div>

                  <button
                    type="button"
                    onClick={handleLogout}
                    className="flex items-center gap-2 px-2.5 py-2 rounded text-sm text-error hover:bg-error-container/20 transition-colors w-full text-left cursor-pointer mt-1"
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

        <main className="relative pt-14 bg-surface min-h-[calc(100dvh-3.5rem)] px-4 sm:px-6 flex-1">
          {children}
        </main>
      </div>
    </div>
  );
}

export default NavShell;
