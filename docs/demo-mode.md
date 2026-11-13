# Demo mode and going live with the backend

The frontend supports two ways to sign in, and they can run side by side:

| | Real login | Demo login |
|---|---|---|
| Where | Email + password form | "Demo access" panel under the form |
| Needs backend | Yes (`ZURI_API_BASE_URL`) | No |
| Token | RS256, issued by the backend gateway | HS256, signed by the frontend with `ZURI_DEMO_SECRET` |
| Verified by | Gateway public key (`/api/v1/auth/public-key`) | `ZURI_DEMO_SECRET` |
| Session length | 15 min access + 30 day refresh (rotated) | 8 hours, no refresh |
| Data | Real backend data | Built-in sample data; backend calls fail gracefully |
| Switched on by | Setting `ZURI_API_BASE_URL` | `ZURI_DEMO_MODE=true` + `ZURI_DEMO_SECRET` |

The middleware checks the token type. A demo token is checked against the demo
secret. Every other token goes through the backend path, which hasn't changed.
**Nothing needs to be deleted when the backend goes live.**

## Environment variables

| Variable | Purpose |
|---|---|
| `ZURI_API_BASE_URL` | Backend gateway base URL, e.g. `https://api.zuri.example` (no trailing slash, no `/api/v1`) |
| `ZURI_DEMO_MODE` | `true` to show the demo panel and accept demo tokens. Anything else = off |
| `ZURI_DEMO_SECRET` | Random string, **at least 32 characters**. Demo mode stays off without it |

Generate a secret with `openssl rand -base64 48`.

## Personas

Defined in `src/lib/auth/demoPersonas.ts`. Each maps to a real backend role, so
navigation filtering and route guards behave as they will in production.

| Persona | Role | Lands on |
|---|---|---|
| Institution Admin | `institution_admin` | `/dashboard` |
| Head of Department | `department_admin` | `/dashboard` |
| Lecturer | `lecturer` | `/dashboard` |
| Ops (Super Admin) | `super_admin` | `/ops/health` |

## Go-live checklist (when the backend is ready)

1. **Deploy the backend** with a public `https://` URL, reached through the API gateway.
2. **Set `ZURI_API_BASE_URL`** on Vercel (Project → Settings → Environment Variables)
   for Production and, if wanted, Preview. Redeploy.
3. **Check the connection:** open `https://<your-site>/api/auth/status`. Expected:
   ```json
   { "backend": { "configured": true, "reachable": true, "error": null },
     "realLogin": "available", "demoMode": "on" }
   ```
   If `reachable` is false, the `error` field says why: wrong URL, HTTP status,
   or a missing public key.
4. **Sign in with a real backend account** using the email/password form.
5. **Turn demo mode off in Production:** delete `ZURI_DEMO_MODE` from the
   Production environment and redeploy. Existing demo sessions are rejected
   right away and the panel disappears. Keep it on Preview if you want demo
   links for stakeholders.
6. Optional: rotate `ZURI_DEMO_SECRET` to invalidate every demo session on every
   environment.

### Backend-side notes

- The browser never talks to the backend directly. Next.js route handlers and
  middleware call it server-to-server, so CORS (`ALLOWED_ORIGINS`) does not
  block login. Add the Vercel domain anyway if other backend endpoints are
  later called from the browser.
- The frontend expects the contract in `docs/backend-auth-contract.md`:
  - `POST /api/v1/auth/login` → `{ data: { access_token, refresh_token, user } }`
  - `POST /api/v1/auth/refresh` rotates both tokens
  - `GET /api/v1/auth/public-key` → `{ data: { public_key: "-----BEGIN PUBLIC KEY-----..." } }`
  - Access-token claims: `user_id`, `email`, `role`, `institution_id`,
    `token_type: "access"`, `exp`
- Role names must match `src/lib/auth/roles.ts` (`institution_admin`,
  `department_admin`, `faculty_admin`, `lecturer`, `instructor`, `super_admin`).
  Any other role name is denied access to both shells.

## Removing demo mode entirely (optional, later)

When demo mode is no longer wanted anywhere, delete:
`src/lib/auth/demo.ts`, `src/lib/auth/demoPersonas.ts`,
`src/app/api/auth/demo-login/`, `src/components/auth/DemoAccessPanel.tsx`,
`src/components/auth/DemoSessionBadge.tsx`. Then remove the references
(search for `Demo` / `isDemoToken`) in `verify.ts`, `session.ts`, the logout
route, both login pages and both layouts.
