# Zuri Design Guide (v2)

> **For AI coding agents (Antigravity, etc.):** This file is the single source of truth for UI in this repo.
> Read it fully before creating or editing ANY page or component. If a rule here conflicts with what you
> see in existing code, this file wins and the existing code should be migrated. Never invent new colors,
> font sizes, radii, or icon sources. If something is missing from this guide, ask instead of improvising.

---

## 0. Product context (one paragraph)

Zuri (formerly "Lexi" in older docs; use the name from `lib/brand.ts`, never hardcode) is software a
university buys to understand academic activity. This repo is the **web app**, which is two products in
one codebase:

| Product | Route group | Audience | Mode |
|---|---|---|---|
| Institution Admin | `app/(institution)` | Veritas admins, HODs, lecturers, researchers (non-technical) | **Editorial** (light, warm paper) |
| Ops Console | `app/(ops)` | Zuri engineers/support only | **Console** (dark by default, dense) |

They share tokens, primitives and icons. They do NOT share a shell. The ops console must never look like
a recolored institution page, and vice versa.

**Design personality: "Quiet intelligence."** Calm, scholarly, precise. Typography and spacing carry the
design, not decoration. One memorable moment per screen, everything else quiet.

---

## 1. Non-negotiable rules (read these twice)

1. **Tokens only.** No raw hex, no arbitrary px font sizes, no `shadow-[...]`, no one-off radii. Use the tokens below.
2. **Icons come from `lucide-react` only.** Never use icon fonts or ligature text (e.g. Material Symbols `<span>lock</span>`). If the font fails, the icon name prints as text, which is the bug we are removing.
3. **Sentence case everywhere.** No ALL-CAPS labels, no tracked-out uppercase eyebrows, no `WORD // WORD` strings. Exception: none.
4. **No fake data or claims in the UI.** No invented compliance badges (SOC 2, ISO), fake node names, fake latency, fake hashes. If a value is not real and wired, do not render it.
5. **No architecture leaking into UI.** Institution UI must never show: model/provider names, key algorithms, SSO URIs, cluster/region names, internal IDs. Only the Ops Console may show technical identifiers, and only real ones.
6. **Mobile first.** Every page must work at 360px wide with zero horizontal page scroll. Build the 360px layout first, then enhance upward.
7. **One level of container.** No card inside a card inside a card. A page has a surface, and at most one layer of card on it.
8. **Dev-only tooling stays dev-only.** State switchers, "harness states", debug bars render only when `process.env.NODE_ENV !== 'production'` AND `?states=1` is in the URL.
9. **Accessibility is the floor, not a feature.** See section 9.
10. **Every screen ships with its states:** default, loading, empty, error, and (if it has a form) invalid + submitting. A screen without states is not done.

---

## 2. Color tokens

Keep the existing Material-3-style token names in `globals.css`. Do not rename. Values below are final.

### 2.1 Editorial mode (Institution)

| Token | Value | Use |
|---|---|---|
| `--surface` | `#fbf9f4` | Page background |
| `--surface-container-lowest` | `#ffffff` | Cards, inputs |
| `--surface-container-low` | `#f5f3ee` | Sidebar, quiet regions |
| `--surface-container` | `#f0eee9` | Hover / selected rows |
| `--surface-container-high` | `#eae8e3` | Pressed, chips |
| `--on-surface` | `#1b1c19` | Primary text |
| `--on-surface-variant` | `#46483d` | Secondary text |
| `--text-placeholder` (new) | `#6a6c60` | Placeholders (meets 4.5:1 on white) |
| `--outline-variant` | `#c7c7b9` | Default borders, dividers |
| `--outline` | `#77786c` | Input borders (3:1 non-text contrast), emphasis dividers |
| `--primary` | `#272e0a` | Primary buttons, links, active nav |
| `--primary-container` | `#3d441e` | Primary hover |
| `--primary-fixed` | `#dfe7b3` | Soft highlight, selected chip |
| `--secondary` | `#855300` | Accent text, focus ring, active indicators |
| `--secondary-container` | `#fdba64` | Warm highlight, key metric accent |
| `--error` / `--error-container` | `#ba1a1a` / `#ffdad6` | Errors |

New semantic status tokens (add to `@theme`):

| Token | Value | Use |
|---|---|---|
| `--success` / `--success-container` | `#2f6b3a` / `#d9ecd9` | Healthy, completed |
| `--warning` / `--warning-container` | `#855300` / `#fdeccd` | Needs attention |
| `--info` / `--info-container` | `#3a5a6b` / `#dce9ef` | Neutral information |

**Distribution:** ~70% surface, ~20% ink, ~10% olive/ochre. Ochre is rare; if everything is ochre, nothing is.
**Status never relies on color alone:** pair color with an icon or a text label.

### 2.2 Console mode (Ops), dark by default

Applied with `data-theme="ops"` on the ops layout root. Light variant exists but dark is default.

| Token | Dark | Light | Use |
|---|---|---|---|
| `--ops-canvas` | `#0b0d10` | `#f3f3f0` | Page background |
| `--ops-panel` | `#12151a` | `#ffffff` | Panels, cards |
| `--ops-panel-raised` | `#181c23` | `#ecece8` | Inputs, table header, hover |
| `--ops-border` | `#262b34` | `#d4d4cf` | All borders |
| `--ops-border-strong` | `#3a414d` | `#9a9a94` | Input borders |
| `--ops-text` | `#eceef1` | `#16171a` | Primary text |
| `--ops-text-muted` | `#9aa1ad` | `#52555c` | Secondary text |
| `--ops-accent` | `#c3cb99` | `#3d441e` | Brand accent (sage, from `inverse-primary`) |
| `--ops-accent-strong` | `#dfe7b3` | `#272e0a` | Primary button bg (dark text on it) |
| `--ops-ok` | `#4ade80` | `#1a7f37` | Healthy |
| `--ops-warn` | `#fbbf24` | `#a16207` | Degraded |
| `--ops-crit` | `#fb7185` | `#c92626` | Failing |

The ops console keeps the olive DNA (sage accent) so it is clearly the same family, but the surface is
carbon, not cream. Do not use the cream paper background in `/ops/*`.

---

## 3. Typography

Two families per mode. Fonts MUST be loaded via `next/font` in `app/layout.tsx` and applied as CSS variables
on the `<html>` element. **Verify in the browser** (DevTools > Computed > font-family) that the rendered
font is the intended one, not a fallback. If a heading looks like Arial, the font is not loading: fix that first.

| Role | Family | Weights | Where |
|---|---|---|---|
| Display / headings | **Newsreader** (variable, with optical size axis) | 400, 500, 600 | Editorial headings, big numbers in institution; page titles in ops use Geist instead |
| UI / body | **Geist Sans** | 400, 500, 600 | All controls, tables, body |
| Data | **Geist Mono** | 400, 500 | Ops only, and only for real identifiers, timestamps, log lines, numeric columns |

Rules:
- Institution headings: Newsreader 500, tight tracking (`-0.01em`), never bold-700. Body: Geist 400.
- Ops headings: Geist 600. No serif in ops, except the wordmark.
- Mono is for data, not decoration. Never use mono for buttons, nav, headings, or labels.
- Remove `Source Serif 4` / `Inter` references everywhere (older docs). One system: Newsreader + Geist.

### Type scale (fluid, mobile first)

| Token | Size | Line height | Use |
|---|---|---|---|
| `text-display` | `clamp(2rem, 1.4rem + 2.4vw, 3rem)` | 1.1 | Hero / page title (institution) |
| `text-h1` | `clamp(1.5rem, 1.2rem + 1.2vw, 2rem)` | 1.2 | Page headers |
| `text-h2` | `1.25rem` | 1.3 | Section headers |
| `text-h3` | `1rem` / weight 600 | 1.4 | Card titles |
| `text-body` | `0.9375rem` (15px) | 1.55 | Default body |
| `text-body-sm` | `0.875rem` (14px) | 1.5 | Table rows, helper text |
| `text-caption` | `0.8125rem` (13px) | 1.4 | Captions, meta |
| `text-input` | `1rem` (16px) | | **All inputs on mobile** (prevents iOS zoom) |

**Minimum size anywhere: 13px.** The old 10-11px labels are banned.
Max line length: 70 characters for prose (`max-w-prose`).
Labels above fields: `text-body-sm`, weight 500, sentence case, color `on-surface`.

---

## 4. Spacing, radius, elevation

- Base unit 4px. Use Tailwind spacing scale only (no `p-[13px]`).
- Page gutters: `px-4` (mobile), `px-6` (md), `px-12` (xl). Section gap: `space-y-10` mobile, `space-y-16` desktop.
- Max content width: `max-w-[1280px]`, centered.
- **Radius:** inputs and buttons `8px`; cards `12px`; modals/sheets `16px`; pills only for status badges and avatars. Never 24px on a page card.
- **Elevation:** no shadows by default. Separate with background contrast and 1px `outline-variant` borders. The only shadow allowed: modal/popover `0 8px 24px rgb(0 0 0 / 0.12)`.
- Dividers: 1px `outline-variant` at 60% opacity.

---

## 5. Icons and brand mark

- Library: `lucide-react`. Wrap in `components/ui/Icon.tsx` that sets size and `aria-hidden`.
- Sizes: 16 (inline in text), 20 (buttons, nav), 24 (empty states). Stroke width 1.75.
- Icon-only buttons need `aria-label` and a 44x44 hit area.
- Nav icon mapping is fixed (add new ones to the table, do not improvise):

| Area | Icon |
|---|---|
| Overview | `LayoutDashboard` |
| Academic structure | `Landmark` |
| People & access | `Users` |
| Content & knowledge | `Library` |
| Intelligence & analytics | `ChartNoAxesColumn` |
| System & governance | `ShieldCheck` |
| Ops: health | `Activity` |
| Ops: AI cost | `Coins` |
| Ops: routing | `Split` |
| Ops: logs | `ScrollText` |

- **Wordmark** is a single component `components/brand/Wordmark.tsx` (SVG, not text styled with CSS) reading the name from `lib/brand.ts`. It must never clip: it lives in a container with `px-4` minimum and `min-w-0`.

---

## 6. Layout and responsiveness

Breakpoints: `sm 640`, `md 768`, `lg 1024`, `xl 1280`.

**Shell behavior**
- `< lg`: sidebar becomes an off-canvas drawer opened from a menu button in the top bar. Top bar is 56px.
- `>= lg`: persistent sidebar, 264px (institution) / 240px (ops). Top bar 56px.
- Top bars: `flex items-center justify-between gap-3 px-4 sm:px-6`, children `min-w-0`, long text `truncate`. Secondary top-bar text hides below `sm`.
- Use `min-h-dvh`, not `100vh`.

**Auth pages (both products)**
- Mobile: single column, form top-aligned with `pt-12`, no card chrome, full-width controls.
- `>= md`: centered column `w-full max-w-[420px]`.
- Institution login at `>= lg`: two-column. Left 5/12 is an editorial panel (olive `primary` background, one Newsreader statement in `primary-fixed`, no stats, no badges). Right is the form.
- Ops login at all sizes: carbon canvas, wordmark top-left, form centered, one quiet footer line. No card needed.

**Data**
- Tables: wrap in `overflow-x-auto` container. Below `md`, tables with more than 3 columns render as stacked rows (title + 2 key fields + chevron) instead.
- KPI grids: `grid-cols-2` mobile, `lg:grid-cols-4`. Never fix tile widths. Never place more than 4 KPIs in one row.
- Touch targets: 44px minimum on touch breakpoints.

---

## 7. Components (specs the agent must follow)

Build/extend these in `components/ui/`. Do not hand-roll variants inside pages.

**Button**: height 44 (mobile) / 40 (md+). Variants: `primary` (olive bg, white text; ops: `--ops-accent-strong` bg, dark text), `secondary` (transparent, 1px `outline`, `on-surface` text), `ghost`, `destructive`. Label is a verb: "Sign in", "Save changes", never "Submit". Loading state shows spinner and keeps width, disables click.

**TextField** (`FormField`): label above (sentence case), 44px tall input, 1px `outline` border, `bg-surface-container-lowest`, placeholder uses `--text-placeholder`. Focus: 2px `secondary` ring with 2px offset, no glow. Error: border `error`, message below with an `AlertCircle` icon: says what is wrong and how to fix it. Password field has a Show/Hide icon button (`Eye`/`EyeOff`), not a text "SHOW" chip.

**Badge/Status**: pill, `text-caption`, icon or dot + text. Never color only.

**Card**: `surface-container-lowest`, 1px `outline-variant` border, 12px radius, `p-4 md:p-6`, no shadow.

**KpiTile**: label (caption, muted), value (Newsreader 500 in institution, Geist 600 tabular-nums in ops), optional delta with icon. Value must never wrap; use `text-h1` max.

**DataTable**: sticky header, 48px rows, `tabular-nums` on numeric columns, right-aligned numbers, row hover `surface-container`, empty and loading (skeleton rows) states built in.

**EmptyState**: 24px icon, one-line title, one-sentence explanation, one primary action. Never just "No data".

**Toast/Alert**: inline for form errors; toast for completed actions. Same verb as the button that caused it ("Saved").

---

## 8. Motion

- Default: none. Transitions only on user action: 150ms ease-out for color/background; 200ms for opening panels.
- Allowed non-triggered motion: skeleton shimmer while loading, and the single live-status pulse in Ops.
- No fade-up on every section, no hover lift on cards, no gradient shimmer.
- Respect `prefers-reduced-motion: reduce` (disable all non-essential motion).

---

## 9. Accessibility checklist

- Text contrast >= 4.5:1 (3:1 for 18px+ and for borders/icons that carry meaning).
- Visible keyboard focus on every interactive element (2px `secondary` ring; in ops use `--ops-accent`).
- Every input has a programmatically associated `<label>`; errors use `aria-describedby`.
- Heading order is logical, one `h1` per page.
- Forms submit on Enter. Autocomplete attributes set (`username`, `current-password`, `new-password`).
- Touch targets >= 44px. Nothing relies on hover.

---

## 10. Copy rules

- Write for the person using it, not for how the system works. "Sign in", not "Initiate session".
- Sentence case. Active voice. Buttons are verbs. The same action keeps the same name across button, toast, and history.
- Errors say what happened and what to do, never apologize, never vague: "Email or password is incorrect. Check both and try again."
- Do not reveal whether an email exists (auth errors stay generic).
- Empty states invite an action. Loading states describe what is loading ("Loading students").
- Ops copy may be technical but only about things that are real.

---

## 11. Page templates (build every page from one of these)

| Template | Use for | Structure |
|---|---|---|
| **Auth** | login, forgot, reset, forced password change | section 6 auth rules |
| **Overview** | institution dashboard, ops health | page header, 2-4 KPIs, one primary chart or table, one secondary panel |
| **List** | students, courses, logs | page header + filters row, DataTable, pagination |
| **Analytics** | intervention analytics, AI usage, quiz rates | header + date-range filter, 1 headline chart, supporting breakdown table, insight line in plain language |
| **Detail / settings** | roles, extraction review | two-column on lg (content + sticky side panel), single column below |

Page header: `h1` (Newsreader in institution, Geist 600 in ops), one-line description, primary action right-aligned (full-width below `sm`).

---

## 12. Reference spec: Ops login (`/ops/login`)

Build this first; it sets the pattern for the whole console.

```
[Wordmark]  Zuri            (top-left, px-6 py-5)                    (nothing right)

                 Sign in to the ops console          (h1, Geist 600, 28px)
                 For Zuri team members only.         (body-sm, muted)

                 Work email
                 [ you@company.com            ]
                 Password
                 [ ••••••••••          (eye) ]
                 [x] Keep me signed in for 12 hours     Forgot password?

                 [        Sign in        ]    (primary, full width, 44px)

        ─────────────────────────────────────────────────────────────
        Sign-in activity is logged.                (caption, muted, bottom-center)
```

Required states: default, submitting (button spinner, fields disabled), invalid (inline error above the button
with `AlertCircle`), locked (message + live countdown, button disabled), password-rotation-required
(redirect to forced change page). Remove: harness tab bar (dev-only), "terminal" header strip, SOC/ISO/mTLS
badges, node/latency/session-hash footer, ed25519 and sso-domain hints, the "controlled environment" box.

## 13. Reference spec: Institution login (`/institution/login`)

Left panel (lg+): `primary` background, wordmark in `primary-fixed`, one Newsreader 500 statement
(e.g. "See what is happening across your academic year."), nothing else. Right: form, same fields as ops with
institution styling, "Forgot password?" link, no sign-up link (accounts are provisioned). Below `lg`, the left
panel disappears and a small wordmark sits above the form.

---

## 14. Rollout order (do not skip ahead)

1. **Foundation fixes:** load fonts correctly, remove icon-font usage, add `lucide-react`, fix overflow/clipping on shells, add `lib/brand.ts`.
2. **Tokens:** update `globals.css` to section 2-4 (add new tokens, add `data-theme="ops"` dark values).
3. **Primitives:** Button, TextField, Badge, Card, Icon, Wordmark (section 5-7).
4. **Shells:** `NavShell` (institution) and ops shell, both responsive per section 6.
5. **Pilot pages:** Ops login, Institution login. Review in browser at 360px, 768px, 1280px before continuing.
6. **One page per template:** Overview, List, Analytics, Detail. Review each.
7. **Roll out** remaining pages from their templates.
8. **States pass:** loading, empty, error, light/dark for ops.

## 15. Definition of done (agent must verify before reporting complete)

- [ ] No raw hex / arbitrary font sizes / shadow-[...] / Material Symbols / all-caps labels in the diff
- [ ] Renders correctly at 360, 768, 1280 widths, no horizontal page scroll
- [ ] Fonts verified as the intended families in computed styles
- [ ] All icons render as SVG (no text fallbacks)
- [ ] Default, loading, empty, error states exist
- [ ] Keyboard: tab order logical, focus visible, Enter submits
- [ ] No fake claims, no architecture strings in institution UI
- [ ] Uses an existing template and existing primitives
