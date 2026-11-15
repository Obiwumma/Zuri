'use client';

import React, { useState, useEffect, useCallback, useId, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { useClientSession } from '@/components/auth/SessionContext';
import { roleTier } from '@/lib/auth/access';
import {
  User,
  Shield,
  KeyRound,
  Bell,
  Check,
  CheckCircle2,
  AlertTriangle,
  AlertCircle,
  Clock,
  Laptop,
  Smartphone,
  Monitor,
  LogOut,
  RefreshCw,
  SlidersHorizontal,
  ExternalLink,
  Lock,
  Landmark,
  Database,
  FileText,
  X,
} from 'lucide-react';
import {
  TextField,
  PasswordField,
  Checkbox,
  Button,
  Badge,
  Alert,
  Skeleton,
  EmptyState,
  Card,
} from '@/components/ui';
import {
  getCurrentUser,
  updateProfile,
  getActiveSessions,
  revokeSession,
  signOutEverywhere,
  getNotificationPreferences,
  updateNotificationPreferences,
  SAMPLE_USER,
  SAMPLE_SESSIONS,
  SAMPLE_NOTIFICATION_PREFERENCES,
  type UserSession,
  type NotificationPreferences,
} from '@/lib/api/users';
import { RateLimitedError, ServiceUnavailableError, ApiError } from '@/lib/api/errors';
import type { User as UserType } from '@/lib/api/types';
import { parseZuriDate } from '@/lib/api/dates';

export type SettingsPageState = 'default' | 'loading' | 'empty' | 'error';
type SettingsTab = 'profile' | 'privacy' | 'security' | 'notifications';

function SettingsContent() {
  const searchParams = useSearchParams();
  const showHarness = process.env.NODE_ENV !== 'production' && searchParams.get('states') === '1';

  // State harness
  const [harnessState, setHarnessState] = useState<SettingsPageState>('default');
  const [activeTab, setActiveTab] = useState<SettingsTab>('profile');
  // Institution-wide SSO & data-privacy settings are admin-only; HODs and
  // lecturers get their personal profile, security and notification tabs.
  const canManageInstitution = roleTier(useClientSession().role) === 'admin';

  // Loading States
  const [isLoadingUser, setIsLoadingUser] = useState(true);
  const [isLoadingSessions, setIsLoadingSessions] = useState(true);
  const [isLoadingPreferences, setIsLoadingPreferences] = useState(true);

  // Global Error & Banner States
  const [rateLimitSeconds, setRateLimitSeconds] = useState(0);
  const [serviceUnavailableMessage, setServiceUnavailableMessage] = useState<string | null>(null);

  // User Profile State
  const [user, setUser] = useState<UserType | null>(null);
  const [profileForm, setProfileForm] = useState({
    firstName: '',
    lastName: '',
    school: '',
    department: '',
  });
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [profileSuccessMessage, setProfileSuccessMessage] = useState<string | null>(null);
  const [profileError, setProfileError] = useState<string | null>(null);

  // Password State
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [passwordSuccessMessage, setPasswordSuccessMessage] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);

  // Sessions State
  const [sessions, setSessions] = useState<UserSession[]>([]);
  const [revokingSessionId, setRevokingSessionId] = useState<string | null>(null);
  const [isSigningOutEverywhere, setIsSigningOutEverywhere] = useState(false);
  const [showSignOutAllModal, setShowSignOutAllModal] = useState(false);
  const [sessionsError, setSessionsError] = useState<string | null>(null);
  const [sessionsSuccessMessage, setSessionsSuccessMessage] = useState<string | null>(null);

  // Notification Preferences State
  const [preferences, setPreferences] = useState<NotificationPreferences>(SAMPLE_NOTIFICATION_PREFERENCES);
  const [isSavingPreferences, setIsSavingPreferences] = useState(false);
  const [preferencesSuccessMessage, setPreferencesSuccessMessage] = useState<string | null>(null);
  const [preferencesError, setPreferencesError] = useState<string | null>(null);

  // Data Privacy & Retention Policy State
  const [telemetryAnonymized, setTelemetryAnonymized] = useState(true);
  const [aiSupervisionConsent, setAiSupervisionConsent] = useState(true);
  const [privacyPolicySuccessMessage, setPrivacyPolicySuccessMessage] = useState<string | null>(null);

  // Rate limit countdown timer
  useEffect(() => {
    if (rateLimitSeconds <= 0) return;
    const interval = setInterval(() => {
      setRateLimitSeconds((prev) => Math.max(0, prev - 1));
    }, 1000);
    return () => clearInterval(interval);
  }, [rateLimitSeconds]);

  // Error handling
  const handleGenericError = useCallback((err: unknown, fallbackMessage: string): string => {
    if (err instanceof RateLimitedError) {
      const remaining = err.resetTime
        ? Math.max(1, Math.ceil(err.resetTime - Date.now() / 1000))
        : 30;
      setRateLimitSeconds(remaining);
      return `Rate limit exceeded. Try again in ${remaining}s.`;
    }
    if (err instanceof ServiceUnavailableError) {
      setServiceUnavailableMessage(err.message || 'Downstream service temporarily unavailable.');
      return 'Service temporarily unavailable. Please retry shortly.';
    }
    if (err instanceof ApiError || err instanceof Error) {
      return err.message;
    }
    return fallbackMessage;
  }, []);

  // Fetch initial profile
  const loadUser = useCallback(async () => {
    setIsLoadingUser(true);
    setProfileError(null);
    try {
      const data = await getCurrentUser();
      setUser(data);
      setProfileForm({
        firstName: data.first_name || '',
        lastName: data.last_name || '',
        school: data.school || '',
        department: data.department || '',
      });
    } catch (err) {
      const msg = handleGenericError(err, 'Failed to load user profile');
      setProfileError(msg);
      setUser(SAMPLE_USER);
      setProfileForm({
        firstName: SAMPLE_USER.first_name || '',
        lastName: SAMPLE_USER.last_name || '',
        school: SAMPLE_USER.school || '',
        department: SAMPLE_USER.department || '',
      });
    } finally {
      setIsLoadingUser(false);
    }
  }, [handleGenericError]);

  // Fetch active sessions
  const loadSessions = useCallback(async () => {
    setIsLoadingSessions(true);
    setSessionsError(null);
    try {
      const data = await getActiveSessions();
      setSessions(data);
    } catch (err) {
      const msg = handleGenericError(err, 'Failed to load active sessions');
      setSessionsError(msg);
      setSessions(SAMPLE_SESSIONS);
    } finally {
      setIsLoadingSessions(false);
    }
  }, [handleGenericError]);

  // Fetch notification preferences
  const loadPreferences = useCallback(async () => {
    setIsLoadingPreferences(true);
    setPreferencesError(null);
    try {
      const data = await getNotificationPreferences();
      setPreferences(data);
    } catch (err) {
      const msg = handleGenericError(err, 'Failed to load notification preferences');
      setPreferencesError(msg);
      setPreferences(SAMPLE_NOTIFICATION_PREFERENCES);
    } finally {
      setIsLoadingPreferences(false);
    }
  }, [handleGenericError]);

  useEffect(() => {
    loadUser();
    loadSessions();
    loadPreferences();
  }, [loadUser, loadSessions, loadPreferences]);

  // Handlers
  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingProfile(true);
    setProfileError(null);
    setProfileSuccessMessage(null);
    try {
      const updated = await updateProfile({
        first_name: profileForm.firstName,
        last_name: profileForm.lastName,
        school: profileForm.school,
        department: profileForm.department,
      });
      setUser(updated);
      setProfileSuccessMessage('Profile saved successfully.');
      setTimeout(() => setProfileSuccessMessage(null), 4000);
    } catch (err) {
      const msg = handleGenericError(err, 'Unable to update profile');
      setProfileError(msg);
    } finally {
      setIsSavingProfile(false);
    }
  };

  const passwordCriteria = {
    length: newPassword.length >= 8,
    uppercase: /[A-Z]/.test(newPassword),
    number: /[0-9]/.test(newPassword),
    symbol: /[^A-Za-z0-9]/.test(newPassword),
  };
  const isPasswordValid = Object.values(passwordCriteria).every(Boolean);
  const passwordsMatch = newPassword === confirmPassword;

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isPasswordValid) {
      setPasswordError('Please satisfy all password criteria before submitting.');
      return;
    }
    if (!passwordsMatch) {
      setPasswordError('New password and confirmation do not match.');
      return;
    }
    setIsChangingPassword(true);
    setPasswordError(null);
    setPasswordSuccessMessage(null);
    try {
      await new Promise((r) => setTimeout(r, 600));
      setPasswordSuccessMessage('Password updated successfully.');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setTimeout(() => setPasswordSuccessMessage(null), 4000);
    } catch (err) {
      const msg = handleGenericError(err, 'Unable to update password');
      setPasswordError(msg);
    } finally {
      setIsChangingPassword(false);
    }
  };

  const handleRevokeSession = async (sessionId: string) => {
    setRevokingSessionId(sessionId);
    setSessionsError(null);
    try {
      await revokeSession(sessionId);
      setSessions((prev) => prev.filter((s) => s.id !== sessionId));
      setSessionsSuccessMessage('Session revoked.');
      setTimeout(() => setSessionsSuccessMessage(null), 3000);
    } catch (err) {
      const msg = handleGenericError(err, 'Failed to revoke session');
      setSessionsError(msg);
    } finally {
      setRevokingSessionId(null);
    }
  };

  const handleSignOutEverywhere = async () => {
    setIsSigningOutEverywhere(true);
    setSessionsError(null);
    try {
      await signOutEverywhere();
      setSessions((prev) => prev.filter((s) => s.isCurrent));
      setShowSignOutAllModal(false);
      setSessionsSuccessMessage('All other active sessions have been signed out.');
      setTimeout(() => setSessionsSuccessMessage(null), 4000);
    } catch (err) {
      const msg = handleGenericError(err, 'Failed to sign out everywhere');
      setSessionsError(msg);
    } finally {
      setIsSigningOutEverywhere(false);
    }
  };

  const handleSavePreferences = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingPreferences(true);
    setPreferencesError(null);
    setPreferencesSuccessMessage(null);
    try {
      const updated = await updateNotificationPreferences(preferences);
      setPreferences(updated);
      setPreferencesSuccessMessage('Notification preferences saved.');
      setTimeout(() => setPreferencesSuccessMessage(null), 4000);
    } catch (err) {
      const msg = handleGenericError(err, 'Failed to save notification preferences');
      setPreferencesError(msg);
    } finally {
      setIsSavingPreferences(false);
    }
  };

  const handleSavePrivacyPolicy = (e: React.FormEvent) => {
    e.preventDefault();
    setPrivacyPolicySuccessMessage('Data privacy settings updated.');
    setTimeout(() => setPrivacyPolicySuccessMessage(null), 3000);
  };

  return (
    <div className="w-full flex flex-col gap-6 p-4 sm:p-6 lg:p-8 max-w-[1280px] mx-auto text-on-surface">
      {/* Dev-only Testing States Harness */}
      {showHarness && (
        <aside
          aria-label="Testing states harness"
          className="p-2.5 rounded-xl bg-surface-container-lowest border border-outline-variant text-caption flex flex-wrap items-center justify-between gap-2"
        >
          <div className="flex items-center gap-1.5 font-medium text-on-surface">
            <SlidersHorizontal className="w-3.5 h-3.5 text-primary" aria-hidden="true" />
            <span>Settings states</span>
          </div>
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => setHarnessState('default')}
              className={`px-2 py-0.5 rounded-sm text-caption transition-colors cursor-pointer ${
                harnessState === 'default'
                  ? 'bg-primary text-on-primary font-semibold'
                  : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container'
              }`}
            >
              Default
            </button>
            <button
              type="button"
              onClick={() => setHarnessState('loading')}
              className={`px-2 py-0.5 rounded-sm text-caption transition-colors cursor-pointer ${
                harnessState === 'loading'
                  ? 'bg-primary text-on-primary font-semibold'
                  : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container'
              }`}
            >
              Loading
            </button>
            <button
              type="button"
              onClick={() => setHarnessState('empty')}
              className={`px-2 py-0.5 rounded-sm text-caption transition-colors cursor-pointer ${
                harnessState === 'empty'
                  ? 'bg-primary text-on-primary font-semibold'
                  : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container'
              }`}
            >
              Empty
            </button>
            <button
              type="button"
              onClick={() => setHarnessState('error')}
              className={`px-2 py-0.5 rounded-sm text-caption transition-colors cursor-pointer ${
                harnessState === 'error'
                  ? 'bg-primary text-on-primary font-semibold'
                  : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container'
              }`}
            >
              Error
            </button>
          </div>
        </aside>
      )}

      {/* Header section (Detail/Settings template: h1 Newsreader 600, one-line description, right status) */}
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-outline-variant/60">
        <div className="flex flex-col">
          <h1 className="text-2xl sm:text-3xl font-serif text-on-surface tracking-tight">
            {canManageInstitution ? 'Institution settings' : 'Settings'}
          </h1>
          <p className="text-body-sm text-on-surface-variant mt-1">
            {canManageInstitution
              ? 'Manage administrator profile, single sign-on, data retention, active devices, and notifications.'
              : 'Manage your profile, password, active sessions, and notification preferences.'}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Badge variant="success" className="h-9 px-3">
            Oxford SSO active
          </Badge>
        </div>
      </header>

      {/* State: Error */}
      {harnessState === 'error' && (
        <Alert
          variant="error"
          title="Settings synchronization failed"
          description="Unable to reach the institutional management service. Check your connection or retry shortly."
          action={<Button variant="secondary" onClick={() => setHarnessState('default')}>Try again</Button>}
        />
      )}

      {/* State: Loading */}
      {harnessState === 'loading' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6" aria-busy="true">
          <div className="lg:col-span-8 flex flex-col gap-4">
            <Skeleton className="h-12 rounded-xl" />
            <Skeleton className="h-96 rounded-xl" />
          </div>
          <div className="lg:col-span-4 flex flex-col gap-4">
            <Skeleton className="h-64 rounded-xl" />
          </div>
        </div>
      )}

      {/* State: Empty */}
      {harnessState === 'empty' && (
        <EmptyState
          icon={Landmark}
          title="No institutional configuration found"
          description="Your administrator profile is currently unlinked from an active institution unit."
          action={
            <Button variant="secondary" onClick={() => setHarnessState('default')}>
              Reload settings
            </Button>
          }
        />
      )}

      {/* State: Default */}
      {harnessState === 'default' && (
        <>
          {rateLimitSeconds > 0 && (
            <Alert
              variant="warning"
              title="Rate limit in effect"
              description={`Too many requests dispatched. Retry in ${rateLimitSeconds}s.`}
            />
          )}

          {serviceUnavailableMessage && (
            <Alert
              variant="error"
              title="Service unavailable"
              description={serviceUnavailableMessage}
            />
          )}

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Left Column (8 cols on lg): Content Tabs and Forms */}
            <main className="lg:col-span-8 flex flex-col gap-6">
              {/* Navigation Tabs (Single layer of cards) */}
              <nav
                aria-label="Settings categories"
                className="flex items-center gap-1.5 p-1.5 bg-surface-container-low rounded-xl border border-outline-variant/40 overflow-x-auto"
              >
                <button
                  type="button"
                  onClick={() => setActiveTab('profile')}
                  className={`px-3.5 py-2 rounded-lg text-body-sm font-medium transition-colors cursor-pointer shrink-0 ${
                    activeTab === 'profile'
                      ? 'bg-surface-container-lowest text-on-surface shadow-xs font-semibold'
                      : 'text-on-surface-variant hover:text-on-surface'
                  }`}
                >
                  Profile and organization
                </button>
                {canManageInstitution && (
                <button
                  type="button"
                  onClick={() => setActiveTab('privacy')}
                  className={`px-3.5 py-2 rounded-lg text-body-sm font-medium transition-colors cursor-pointer shrink-0 ${
                    activeTab === 'privacy'
                      ? 'bg-surface-container-lowest text-on-surface shadow-xs font-semibold'
                      : 'text-on-surface-variant hover:text-on-surface'
                  }`}
                >
                  SSO and data privacy
                </button>
                )}
                <button
                  type="button"
                  onClick={() => setActiveTab('security')}
                  className={`px-3.5 py-2 rounded-lg text-body-sm font-medium transition-colors cursor-pointer shrink-0 ${
                    activeTab === 'security'
                      ? 'bg-surface-container-lowest text-on-surface shadow-xs font-semibold'
                      : 'text-on-surface-variant hover:text-on-surface'
                  }`}
                >
                  Active sessions and security
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('notifications')}
                  className={`px-3.5 py-2 rounded-lg text-body-sm font-medium transition-colors cursor-pointer shrink-0 ${
                    activeTab === 'notifications'
                      ? 'bg-surface-container-lowest text-on-surface shadow-xs font-semibold'
                      : 'text-on-surface-variant hover:text-on-surface'
                  }`}
                >
                  Notification preferences
                </button>
              </nav>

              {/* TAB 1: Profile and organization */}
              {activeTab === 'profile' && (
                <Card className="flex flex-col gap-6">
                  <div className="flex flex-col pb-4 border-b border-outline-variant/40">
                    <h2 className="text-lg font-semibold text-on-surface font-serif">
                      Personal and academic profile
                    </h2>
                    <p className="text-body-sm text-on-surface-variant mt-0.5">
                      Information associated with your institutional administrator account.
                    </p>
                  </div>

                  {profileSuccessMessage && (
                    <Alert variant="success" description={profileSuccessMessage} />
                  )}

                  {profileError && (
                    <Alert variant="error" description={profileError} />
                  )}

                  <form onSubmit={handleSaveProfile} className="flex flex-col gap-5">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <TextField
                        label="First name"
                        value={profileForm.firstName}
                        onChange={(e) =>
                          setProfileForm({ ...profileForm, firstName: e.target.value })
                        }
                        disabled={isSavingProfile || isLoadingUser}
                        required
                      />
                      <TextField
                        label="Last name"
                        value={profileForm.lastName}
                        onChange={(e) =>
                          setProfileForm({ ...profileForm, lastName: e.target.value })
                        }
                        disabled={isSavingProfile || isLoadingUser}
                        required
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <TextField
                        label="School or Faculty"
                        value={profileForm.school}
                        onChange={(e) =>
                          setProfileForm({ ...profileForm, school: e.target.value })
                        }
                        disabled={isSavingProfile || isLoadingUser}
                        placeholder="e.g. Mathematical, Physical and Life Sciences"
                      />
                      <TextField
                        label="Academic department"
                        value={profileForm.department}
                        onChange={(e) =>
                          setProfileForm({ ...profileForm, department: e.target.value })
                        }
                        disabled={isSavingProfile || isLoadingUser}
                        placeholder="e.g. Department of Computer Science"
                      />
                    </div>

                    <div className="flex flex-col gap-1.5 p-3.5 rounded-xl bg-surface-container-low border border-outline-variant/30">
                      <span className="text-caption font-medium text-on-surface-variant">
                        Primary Institutional Email
                      </span>
                      <div className="flex items-center gap-2 text-body-sm font-mono text-on-surface">
                        <span>{user?.email || 'admin@oxford.ac.uk'}</span>
                        <Badge variant="neutral" className="text-caption">
                          Managed via InCommon SSO
                        </Badge>
                      </div>
                    </div>

                    <div className="flex justify-end pt-2">
                      <Button
                        type="submit"
                        variant="primary"
                        isLoading={isSavingProfile}
                        disabled={isSavingProfile || isLoadingUser}
                        className="w-full sm:w-auto h-11 sm:h-10 text-body-sm"
                      >
                        Save changes
                      </Button>
                    </div>
                  </form>
                </Card>
              )}

              {/* TAB 2: SSO and data privacy */}
              {activeTab === 'privacy' && canManageInstitution && (
                <Card className="flex flex-col gap-6">
                  <div className="flex flex-col pb-4 border-b border-outline-variant/40">
                    <h2 className="text-lg font-semibold text-on-surface font-serif">
                      Single sign-on and data privacy
                    </h2>
                    <p className="text-body-sm text-on-surface-variant mt-0.5">
                      Institutional federation policies, audit retention schedules, and telemetry protection.
                    </p>
                  </div>

                  {privacyPolicySuccessMessage && (
                    <Alert variant="success" description={privacyPolicySuccessMessage} />
                  )}

                  {/* SSO Federation Status */}
                  <div className="flex flex-col gap-3 p-4 rounded-xl bg-surface-container-low border border-outline-variant/30">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-center gap-2.5">
                        <Landmark className="w-5 h-5 text-primary" aria-hidden="true" />
                        <div className="flex flex-col">
                          <h3 className="text-body-sm font-semibold text-on-surface">
                            Single Sign-On (SSO) Federation
                          </h3>
                          <span className="text-caption text-on-surface-variant">
                            InCommon / Shibboleth SAML 2.0 Identity Provider configuration for Oxford SSO.
                          </span>
                        </div>
                      </div>
                      <Badge variant="success" className="shrink-0 text-caption font-medium">
                        Active (99.8% sync)
                      </Badge>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 text-caption font-mono">
                      <div className="p-2.5 bg-surface-container-lowest rounded-lg border border-outline-variant/20 flex flex-col">
                        <span className="text-on-surface-variant font-sans">Entity ID</span>
                        <span className="text-on-surface truncate">urn:mace:incommon:oxford.ac.uk</span>
                      </div>
                      <div className="p-2.5 bg-surface-container-lowest rounded-lg border border-outline-variant/20 flex flex-col">
                        <span className="text-on-surface-variant font-sans">SAML Binding</span>
                        <span className="text-on-surface">HTTP-POST (Signed RS256)</span>
                      </div>
                    </div>
                  </div>

                  {/* Data Privacy & Retention Policy Form */}
                  <form onSubmit={handleSavePrivacyPolicy} className="flex flex-col gap-5">
                    <div className="flex flex-col gap-4">
                      <div className="flex items-start gap-3 p-3.5 rounded-xl bg-surface-container-low border border-outline-variant/30">
                        <Database className="w-5 h-5 text-primary shrink-0 mt-0.5" aria-hidden="true" />
                        <div className="flex flex-col flex-1">
                          <span className="text-body-sm font-semibold text-on-surface">
                            Audit log retention policy
                          </span>
                          <span className="text-caption text-on-surface-variant mt-0.5">
                            Governs academic event logs, staff grading access records, and attendance audit trails.
                          </span>
                          <div className="mt-2.5 flex items-center gap-2">
                            <span className="font-mono text-caption bg-surface-container px-2 py-0.5 rounded text-on-surface font-medium">
                              365-day immutable storage
                            </span>
                            <span className="text-caption text-on-surface-variant">
                              Compliant with UK Higher Education audit guidelines
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="p-3.5 rounded-xl bg-surface-container-low border border-outline-variant/30 flex flex-col gap-3">
                        <Checkbox
                          label="Anonymize student interaction telemetry"
                          description="Strips student personal identifiers from cohort analytics before processing AI usage signals."
                          checked={telemetryAnonymized}
                          onChange={(e) => setTelemetryAnonymized(e.target.checked)}
                        />

                        <Checkbox
                          label="Require student consent for AI study supervision"
                          description="Prompts students to explicitly authorize assistive intervention recommendations."
                          checked={aiSupervisionConsent}
                          onChange={(e) => setAiSupervisionConsent(e.target.checked)}
                        />
                      </div>
                    </div>

                    <div className="flex justify-end pt-2">
                      <Button
                        type="submit"
                        variant="primary"
                        className="w-full sm:w-auto h-11 sm:h-10 text-body-sm"
                      >
                        Save privacy policy
                      </Button>
                    </div>
                  </form>
                </Card>
              )}

              {/* TAB 3: Active sessions and security */}
              {activeTab === 'security' && (
                <div className="flex flex-col gap-6">
                  {/* Change Password Card */}
                  <Card className="flex flex-col gap-6">
                    <div className="flex flex-col pb-4 border-b border-outline-variant/40">
                      <h2 className="text-lg font-semibold text-on-surface font-serif">
                        Change password
                      </h2>
                      <p className="text-body-sm text-on-surface-variant mt-0.5">
                        Ensure your account is protected with a secure password following institutional guidelines.
                      </p>
                    </div>

                    {passwordSuccessMessage && (
                      <Alert variant="success" description={passwordSuccessMessage} />
                    )}

                    {passwordError && (
                      <Alert variant="error" description={passwordError} />
                    )}

                    <form onSubmit={handleChangePassword} className="flex flex-col gap-4">
                      <PasswordField
                        label="Current password"
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                        disabled={isChangingPassword}
                        required
                      />

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <PasswordField
                          label="New password"
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          disabled={isChangingPassword}
                          required
                        />
                        <PasswordField
                          label="Confirm new password"
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          disabled={isChangingPassword}
                          required
                        />
                      </div>

                      {/* Password Criteria Checklist */}
                      <div className="p-3.5 rounded-xl bg-surface-container-low border border-outline-variant/20 flex flex-col gap-2">
                        <span className="text-caption font-semibold text-on-surface">
                          Password criteria:
                        </span>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-caption">
                          <div className="flex items-center gap-1.5">
                            {passwordCriteria.length ? (
                              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                            ) : (
                              <span className="w-4 h-4 rounded-full border border-outline-variant" />
                            )}
                            <span className={passwordCriteria.length ? 'text-on-surface font-medium' : 'text-on-surface-variant'}>
                              8+ characters
                            </span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            {passwordCriteria.uppercase ? (
                              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                            ) : (
                              <span className="w-4 h-4 rounded-full border border-outline-variant" />
                            )}
                            <span className={passwordCriteria.uppercase ? 'text-on-surface font-medium' : 'text-on-surface-variant'}>
                              One uppercase letter (A-Z)
                            </span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            {passwordCriteria.number ? (
                              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                            ) : (
                              <span className="w-4 h-4 rounded-full border border-outline-variant" />
                            )}
                            <span className={passwordCriteria.number ? 'text-on-surface font-medium' : 'text-on-surface-variant'}>
                              One number (0-9)
                            </span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            {passwordCriteria.symbol ? (
                              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                            ) : (
                              <span className="w-4 h-4 rounded-full border border-outline-variant" />
                            )}
                            <span className={passwordCriteria.symbol ? 'text-on-surface font-medium' : 'text-on-surface-variant'}>
                              One symbol (!@#$%^&*)
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex justify-end pt-2">
                        <Button
                          type="submit"
                          variant="primary"
                          isLoading={isChangingPassword}
                          disabled={
                            isChangingPassword ||
                            !isPasswordValid ||
                            !passwordsMatch ||
                            !currentPassword
                          }
                          className="w-full sm:w-auto h-11 sm:h-10 text-body-sm"
                        >
                          Update password
                        </Button>
                      </div>
                    </form>
                  </Card>

                  {/* Active Sessions Card */}
                  <Card className="flex flex-col gap-6">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-outline-variant/40 gap-3">
                      <div className="flex flex-col">
                        <h2 className="text-lg font-semibold text-on-surface font-serif">
                          Active sessions and devices
                        </h2>
                        <p className="text-body-sm text-on-surface-variant mt-0.5">
                          Devices currently authorized with active refresh tokens.
                        </p>
                      </div>

                      <div className="flex items-center gap-2">
                        <Button
                          variant="secondary"
                          onClick={() => loadSessions()}
                          disabled={isLoadingSessions}
                          className="h-10 text-body-sm px-3"
                          title="Refresh session list"
                        >
                          <RefreshCw className={`w-4 h-4 ${isLoadingSessions ? 'animate-spin' : ''}`} />
                        </Button>

                        <Button
                          variant="destructive"
                          onClick={() => setShowSignOutAllModal(true)}
                          disabled={isSigningOutEverywhere || sessions.length <= 1}
                          className="h-10 text-body-sm px-3"
                        >
                          <LogOut className="w-4 h-4 mr-1.5" />
                          Sign out everywhere
                        </Button>
                      </div>
                    </div>

                    {sessionsSuccessMessage && (
                      <Alert variant="success" description={sessionsSuccessMessage} />
                    )}

                    {sessionsError && (
                      <Alert variant="error" description={sessionsError} />
                    )}

                    {isLoadingSessions ? (
                      <div className="flex flex-col gap-3 py-2">
                        <Skeleton className="h-16 rounded-xl" />
                        <Skeleton className="h-16 rounded-xl" />
                      </div>
                    ) : sessions.length === 0 ? (
                      <EmptyState
                        icon={Laptop}
                        title="No active sessions found"
                        description="There are no active devices recorded for this account."
                      />
                    ) : (
                      <div className="divide-y divide-outline-variant/30">
                        {sessions.map((sess) => {
                          const parsedLastActive = parseZuriDate(sess.lastActiveAt);
                          const displayDate = parsedLastActive
                            ? parsedLastActive.toLocaleString('en-GB', {
                                day: 'numeric',
                                month: 'short',
                                hour: '2-digit',
                                minute: '2-digit',
                              })
                            : sess.lastActiveAt;

                          return (
                            <div
                              key={sess.id}
                              className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                            >
                              <div className="flex items-start gap-3">
                                <div className="p-2.5 rounded-xl bg-surface-container text-primary shrink-0 mt-0.5">
                                  {sess.deviceType === 'mobile' ? (
                                    <Smartphone className="w-5 h-5" />
                                  ) : sess.deviceType === 'tablet' ? (
                                    <Monitor className="w-5 h-5" />
                                  ) : (
                                    <Laptop className="w-5 h-5" />
                                  )}
                                </div>
                                <div className="flex flex-col">
                                  <div className="flex items-center gap-2">
                                    <span className="text-body-sm font-semibold text-on-surface">
                                      {sess.browser || 'Browser'} on {sess.os || 'OS'}
                                    </span>
                                    {sess.isCurrent && (
                                      <Badge variant="info" className="text-caption font-medium">
                                        Current device
                                      </Badge>
                                    )}
                                  </div>
                                  <span className="text-caption text-on-surface-variant mt-0.5">
                                    {sess.ipAddress} • {sess.location || 'Oxford, UK'} • Last active {displayDate}
                                  </span>
                                </div>
                              </div>

                              {!sess.isCurrent && (
                                <Button
                                  variant="secondary"
                                  onClick={() => handleRevokeSession(sess.id)}
                                  isLoading={revokingSessionId === sess.id}
                                  disabled={revokingSessionId !== null}
                                  className="h-9 text-caption self-end sm:self-center"
                                >
                                  Revoke session
                                </Button>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </Card>
                </div>
              )}

              {/* TAB 4: Notification preferences */}
              {activeTab === 'notifications' && (
                <Card className="flex flex-col gap-6">
                  <div className="flex flex-col pb-4 border-b border-outline-variant/40">
                    <h2 className="text-lg font-semibold text-on-surface font-serif">
                      Notification preferences and quiet hours
                    </h2>
                    <p className="text-body-sm text-on-surface-variant mt-0.5">
                      Configure delivery channels, academic digest cadence, and scheduled quiet windows.
                    </p>
                  </div>

                  {preferencesSuccessMessage && (
                    <Alert variant="success" description={preferencesSuccessMessage} />
                  )}

                  {preferencesError && (
                    <Alert variant="error" description={preferencesError} />
                  )}

                  <form onSubmit={handleSavePreferences} className="flex flex-col gap-5">
                    <div className="flex flex-col gap-3">
                      <span className="text-caption font-semibold text-on-surface uppercase tracking-wider">
                        Communication channels
                      </span>

                      <div className="p-3.5 rounded-xl bg-surface-container-low border border-outline-variant/30 flex flex-col gap-3">
                        <Checkbox
                          label="Push alerts"
                          description="Receive instant browser notifications for high-priority student flags."
                          checked={preferences.pushEnabled}
                          onChange={(e) =>
                            setPreferences({ ...preferences, pushEnabled: e.target.checked })
                          }
                        />

                        <Checkbox
                          label="Email notifications"
                          description="Receive critical administrative alerts and daily attendance digests."
                          checked={preferences.emailEnabled}
                          onChange={(e) =>
                            setPreferences({ ...preferences, emailEnabled: e.target.checked })
                          }
                        />
                      </div>
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label htmlFor="email-frequency" className="text-body-sm font-medium text-on-surface">
                        Email digest cadence
                      </label>
                      <select
                        id="email-frequency"
                        value={preferences.emailFrequency}
                        onChange={(e) =>
                          setPreferences({ ...preferences, emailFrequency: e.target.value })
                        }
                        className="w-full bg-surface-container-lowest border border-outline-variant rounded-lg px-3 py-2 text-body-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-secondary focus:ring-offset-2"
                      >
                        <option value="immediate">Immediate (Real-time alert dispatch)</option>
                        <option value="daily_digest">Daily digest (Summarized at 08:00 UTC)</option>
                        <option value="weekly_digest">Weekly digest (Monday morning)</option>
                      </select>
                    </div>

                    {/* Quiet Hours Policy */}
                    <div className="p-4 rounded-xl bg-surface-container-low border border-outline-variant/30 flex flex-col gap-4">
                      <div className="flex items-center gap-2">
                        <Clock className="w-5 h-5 text-secondary" />
                        <div className="flex flex-col">
                          <span className="text-body-sm font-semibold text-on-surface">
                            Quiet hours policy
                          </span>
                          <span className="text-caption text-on-surface-variant">
                            Non-critical notifications are held and delivered after the quiet window closes.
                          </span>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="flex flex-col gap-1.5">
                          <label htmlFor="quiet-start" className="text-body-sm font-medium text-on-surface">
                            Quiet hours start
                          </label>
                          <select
                            id="quiet-start"
                            value={preferences.quietHoursStart}
                            onChange={(e) =>
                              setPreferences({
                                ...preferences,
                                quietHoursStart: parseInt(e.target.value, 10),
                              })
                            }
                            className="w-full bg-surface-container-lowest border border-outline-variant rounded-lg px-3 py-2 text-body-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-secondary"
                          >
                            {Array.from({ length: 24 }).map((_, i) => (
                              <option key={i} value={i}>
                                {String(i).padStart(2, '0')}:00 {i >= 12 ? 'PM' : 'AM'}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div className="flex flex-col gap-1.5">
                          <label htmlFor="quiet-end" className="text-body-sm font-medium text-on-surface">
                            Quiet hours end
                          </label>
                          <select
                            id="quiet-end"
                            value={preferences.quietHoursEnd}
                            onChange={(e) =>
                              setPreferences({
                                ...preferences,
                                quietHoursEnd: parseInt(e.target.value, 10),
                              })
                            }
                            className="w-full bg-surface-container-lowest border border-outline-variant rounded-lg px-3 py-2 text-body-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-secondary"
                          >
                            {Array.from({ length: 24 }).map((_, i) => (
                              <option key={i} value={i}>
                                {String(i).padStart(2, '0')}:00 {i >= 12 ? 'PM' : 'AM'}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>
                    </div>

                    <div className="flex justify-end pt-2">
                      <Button
                        type="submit"
                        variant="primary"
                        isLoading={isSavingPreferences}
                        disabled={isSavingPreferences}
                        className="w-full sm:w-auto h-11 sm:h-10 text-body-sm"
                      >
                        Save preferences
                      </Button>
                    </div>
                  </form>
                </Card>
              )}
            </main>

            {/* Right Column (4 cols on lg): Sticky Summary Side Panel */}
            <aside
              aria-label="Institution identity and security summary"
              className="lg:col-span-4 lg:sticky lg:top-6 flex flex-col gap-4"
            >
              <Card className="flex flex-col gap-4">
                <div className="flex items-center gap-3 pb-3 border-b border-outline-variant/40">
                  <div className="w-11 h-11 rounded-full bg-primary/10 text-primary flex items-center justify-center font-serif text-lg font-bold">
                    {profileForm.firstName ? profileForm.firstName[0] : 'O'}
                    {profileForm.lastName ? profileForm.lastName[0] : 'A'}
                  </div>
                  <div className="flex flex-col">
                    <span className="text-body-sm font-semibold text-on-surface">
                      {profileForm.firstName || profileForm.lastName
                        ? `${profileForm.firstName} ${profileForm.lastName}`.trim()
                        : 'Oxford Administrator'}
                    </span>
                    <span className="text-caption text-on-surface-variant truncate">
                      {user?.email || 'admin@oxford.ac.uk'}
                    </span>
                  </div>
                </div>

                <div className="flex flex-col gap-2.5 text-caption">
                  <div className="flex items-center justify-between">
                    <span className="text-on-surface-variant">Role authority</span>
                    <Badge variant="neutral" className="font-medium text-caption">
                      Institution Admin
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-on-surface-variant">Federation</span>
                    <span className="font-medium text-on-surface">InCommon SSO</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-on-surface-variant">Audit retention</span>
                    <span className="font-mono text-on-surface">365 days</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-on-surface-variant">Telemetry status</span>
                    <span className="text-emerald-700 font-medium">Anonymized</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-on-surface-variant">Token encryption</span>
                    <span className="font-mono text-on-surface">RS256 verified</span>
                  </div>
                </div>

                <div className="pt-2 border-t border-outline-variant/40 flex flex-col gap-2">
                  <a
                    href="/activity"
                    className="inline-flex items-center justify-center w-full h-10 px-3 rounded-lg border border-outline-variant text-body-sm font-medium text-on-surface hover:bg-surface-container transition-colors"
                  >
                    <FileText className="w-4 h-4 mr-2 text-on-surface-variant" />
                    View audit logs
                  </a>
                </div>
              </Card>

              {/* Security Status Card */}
              <Card className="flex flex-col gap-3">
                <div className="flex items-center gap-2 text-body-sm font-semibold text-on-surface">
                  <Shield className="w-4 h-4 text-emerald-600" />
                  <span>Security compliance</span>
                </div>
                <p className="text-caption text-on-surface-variant leading-relaxed">
                  Authentication is cryptographically bound to institutional SSO keys. Tokens rotate every 15 minutes.
                </p>
                <div className="flex items-center gap-1.5 text-caption text-emerald-700 font-medium">
                  <Check className="w-3.5 h-3.5" />
                  <span>All active security checks passing</span>
                </div>
              </Card>
            </aside>
          </div>

          {/* Sign Out Everywhere Modal */}
          {showSignOutAllModal && (
            <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
              <div
                className="w-full max-w-md bg-surface-container-lowest border border-outline-variant rounded-xl shadow-xl p-5 flex flex-col gap-4 text-on-surface"
                role="dialog"
                aria-modal="true"
                aria-labelledby="sign-out-modal-title"
              >
                <div className="flex items-center justify-between pb-2 border-b border-outline-variant/40">
                  <div className="flex items-center gap-2">
                    <LogOut className="w-5 h-5 text-error" />
                    <h3 id="sign-out-modal-title" className="text-body-sm font-semibold text-on-surface">
                      Sign out of all devices?
                    </h3>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowSignOutAllModal(false)}
                    className="p-1 rounded-sm text-on-surface-variant hover:text-on-surface"
                    aria-label="Close dialog"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <p className="text-body-sm text-on-surface-variant leading-relaxed">
                  This action will invalidate active refresh tokens on all devices except this current session. You will need to sign in again on your other devices.
                </p>

                <div className="flex items-center justify-end gap-2 pt-2">
                  <Button
                    variant="secondary"
                    onClick={() => setShowSignOutAllModal(false)}
                    disabled={isSigningOutEverywhere}
                  >
                    Cancel
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={handleSignOutEverywhere}
                    isLoading={isSigningOutEverywhere}
                  >
                    Sign out everywhere
                  </Button>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default function SettingsPage() {
  return (
    <Suspense fallback={<div className="p-8 text-body-sm text-on-surface-variant">Loading settings...</div>}>
      <SettingsContent />
    </Suspense>
  );
}
