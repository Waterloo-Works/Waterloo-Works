# Repository Guidelines

## Project Structure & Module Organization
- Next.js 15 (App Router) using TypeScript and Tailwind.
- Key directories:
  - `app/` — routes, layouts, pages (e.g., `app/page.tsx`). API routes will live under `app/api/*`.
  - `components/` — reusable UI (e.g., `components/ui/*`, `components/Navbar.tsx`).
  - `hooks/` — React hooks (e.g., `hooks/use-toast.ts`).
  - `lib/` and `utils/` — helpers and pure utilities (keep side‑effects out).
  - `prisma/` — Prisma schema and client config (e.g., `prisma/schema.prisma`).
  - `public/` — static assets.
  - `providers/` — app providers (e.g., session).

## Build, Test, and Development Commands
- `pnpm dev` — run local dev server (Turbopack).
- `pnpm build` — generate Prisma client then build Next.js.
- `pnpm start` — start production server from `.next` build.
- `pnpm lint` — run ESLint (Next core web vitals + TS).

Example: `pnpm dev` then open http://localhost:3000.

## Coding Style & Naming Conventions
- Always use TypeScript (no `.js` files); 2‑space indentation; prefer named exports.
- Filenames: React components `PascalCase.tsx`; utilities `camelCase.ts`.
- Keep components presentational; place data‑fetching in route handlers or server components.
- TailwindCSS inline classes for styling; avoid CSS Modules/SCSS. Use `app/globals.css` only for resets/tokens.
- Linting: ESLint config in `eslint.config.mjs` (rules for unused vars, etc.). Fix warnings before PR.
- File length: aim for ≤300 LOC per file. Split long files and group by responsibility.
- Keep changes minimal and readable. Prefer simple, explicit code over clever abstractions.

## Supabase Usage
- Use the server‑side client for all Supabase access.
- Recommended: `@supabase/ssr` `createServerClient` in route handlers, server actions, or RSCs; manage cookies per Next.js docs.
- Do not initialize Supabase in the browser.

## Testing Guidelines
- No test runner configured yet. Recommended: Vitest or Jest + React Testing Library.
- Suggested naming: `*.test.ts(x)` colocated with source or under `__tests__/`.
- Aim for unit tests on pure functions in `lib/` and `utils/`; smoke tests for pages/components.

## Commit & Pull Request Guidelines
- Commits: concise, imperative subject (≤72 chars). Example: `feat: add upload form with SHA-256 hashing`.
- Group related changes; avoid noisy refactors in feature PRs.
- PRs must include: what/why, screenshots for UI, and any env/config notes. Link issues with `Closes #123`.
- Keep PRs small and focused; add checklists for follow‑ups when needed.

## Security & Configuration Tips
- Secrets in `/.env.local` (not committed). Prisma expects `DATABASE_URL` and `DIRECT_URL` when used.
- Use test credentials and Bitcoin Testnet keys in development only.
- Validate and sanitize all API inputs in `app/api/*`.

## Explore UX (Curius‑Inspired) — Implementation Plan
- Entry route: `/` redirects to `/explore`. The Explore page lives under `app/(shell)/explore/page.tsx` and uses a sidebar layout from `app/(shell)/layout.tsx` with `components/AppSidebar.tsx`.
- Job listings: Reuse the existing job structure and data from `app/actions/jobs.ts` and UI pieces (`components/FaviconImage`, `components/ShareButton`, `lib/formatEmploymentType`). Do not hardcode copy; listings are rendered from DB via `getJobs()`.
- Visual language: large whitespace, soft cards, quiet dividers, and unobtrusive chips.
  - Cards: `rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm hover:border-zinc-300`.
  - Dividers: `border-t border-zinc-200` sparingly.
  - Chips: `rounded-full border border-zinc-200 bg-white px-3 py-1 text-sm`.
- Typography: calm, readable mix similar to Curius.
  - Titles use `.font-title` (prefers "Noe Display" if self‑hosted; fallback `Merriweather`), weight `600`, size around `16px` on cards.
  - Body uses `.font-body` (prefers "Source Sans Pro"; fallback `Source Sans 3`) at `14px` on details.
  - Classes defined in `app/globals.css`; font variables wired in `app/layout.tsx`.
- Sidebar: Minimal vertical nav with active pill and soft hover; neutral palette and subtle accent. File: `components/AppSidebar.tsx`.
- Auth flow: Middleware and auth callback redirect authenticated users to `/explore` and protect `/explore` alongside other private routes.
- Responsiveness: Sidebar is fixed on desktop (`w-64`); future work can slide it in on mobile using the existing shadcn sidebar primitives if needed.

Rationale: This preserves the proven jobs rendering while aligning the surface to a sleek, minimal aesthetic. The shell layout isolates navigation from content so Explore can evolve without touching the jobs codepath.
