# MÉRITO — Identidad Profesional Dinámica

MÉRITO replaces the static CV with a dynamic professional identity platform where Peruvian university students prove their talent through real projects, SAR experiences, and measurable competence scores.

## Run & Operate

- `pnpm --filter @workspace/api-server run dev` — run the API server (port 8080)
- `pnpm --filter @workspace/merito run dev` — run the frontend (port 22235)
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from the OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- Required env: `DATABASE_URL` — Postgres connection string

## Demo Accounts

All demo accounts use password: `demo1234`

- `carlos@demo.com` — Student (Backend/ML, score ~750)
- `valeria@demo.com` — Student (UX/UI Design, score ~620)
- `diego@demo.com` — Student (Data Science, score ~470)
- `ana@demo.com` — Recruiter

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- Frontend: React + Vite + Tailwind CSS + Framer Motion + wouter
- API: Express 5
- DB: PostgreSQL + Drizzle ORM
- Validation: Zod (`zod/v4`), `drizzle-zod`
- API codegen: Orval (from OpenAPI spec)
- Build: esbuild (CJS bundle)

## Where things live

- OpenAPI spec: `lib/api-spec/openapi.yaml`
- DB schema: `lib/db/src/schema/` (users, profiles, projects, sar_experiences, skills, validations, microprojects, applications, activity)
- API routes: `artifacts/api-server/src/routes/` (auth, profiles, projects, sar, skills, validations, microprojects, recruiter, dashboard)
- Frontend pages: `artifacts/merito/src/pages/`
- Auth utilities: `artifacts/api-server/src/lib/auth.ts`

## Architecture decisions

- Auth uses a lightweight base64url token (userId + role) — suitable for MVP/hackathon, upgrade to JWT signing for production
- Competence score is computed server-side on every request (projects × 100 + skills × 30 + validations × 50 + SAR × 40), capped at 1000
- Blind filter for recruiters hides name, university, and photo — shows only anonymousId, score, skills, counts
- SAR system (Situación-Acción-Resultado) captures soft skill evidence with a guided 3-step form
- Activity feed is written as side-effects when mutations occur (project added, skill added, etc.)

## Product

- **Landing page** — hero, problem statement, how it works, platform stats, student/recruiter benefits, CTAs
- **Student dashboard** — competence score ring gauge, project/skill/SAR/validation counts, recent projects, activity feed
- **Project profiles** — Behance+Notion style detail pages with problem/solution/impact/technologies/links
- **SAR system** — guided 3-step wizard to document Situación, Acción, Resultado + soft skills
- **Skills manager** — add/remove technical, soft, tool, and language skills with proficiency levels
- **Blind talent search** — recruiters search by skill/score, see fully anonymous profiles (no names, photos, or universities)
- **Micro-projects marketplace** — companies post challenges, students apply with proposals
- **Public profile** — shareable link showing a student's full professional identity

## User preferences

- Product is in Spanish (content) but UI built in English (components)
- Score range: 0–1000. Levels: Emerging (0-199), Developing (200-399), Proficient (400-699), Expert (700+)

## Gotchas

- Always run codegen after editing `lib/api-spec/openapi.yaml`
- Body schema names in openapi.yaml must be entity-shaped (e.g. `ProjectInput`), never `CreateProjectBody` — avoids TS2308 Orval collision
- Operations with BOTH path params AND query params can cause Orval name collisions — prefer path-only or query-only when possible
- The auth token is base64url-encoded JSON (not signed JWT) — fine for demo, not for production
