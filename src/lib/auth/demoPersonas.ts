/**
 * Demo personas (client-safe: no secrets, no env access).
 *
 * Each persona maps to a real backend role so the role-based navigation and
 * route guards behave exactly as they will with real backend accounts.
 */

export type DemoShell = 'institution' | 'ops';

export interface DemoPersona {
  id: string;
  label: string;
  description: string;
  role: string;
  email: string;
  shell: DemoShell;
}

export const DEMO_PERSONAS: readonly DemoPersona[] = [
  {
    id: 'institution-admin',
    label: 'Institution Admin',
    description: 'Full access to every institution page',
    role: 'institution_admin',
    email: 'demo.admin@zuri.demo',
    shell: 'institution',
  },
  {
    id: 'hod',
    label: 'Head of Department',
    description: 'No System & Governance or Roles pages',
    role: 'department_admin',
    email: 'demo.hod@zuri.demo',
    shell: 'institution',
  },
  {
    id: 'lecturer',
    label: 'Lecturer',
    description: 'Courses, timetable, students and content',
    role: 'lecturer',
    email: 'demo.lecturer@zuri.demo',
    shell: 'institution',
  },
  {
    id: 'ops',
    label: 'Ops (Super Admin)',
    description: 'Platform health, routing, logs and AI cost',
    role: 'super_admin',
    email: 'demo.ops@zuri.demo',
    shell: 'ops',
  },
] as const;

export function findDemoPersona(id: unknown): DemoPersona | undefined {
  return DEMO_PERSONAS.find((p) => p.id === id);
}
