# AGENTS.md

Instructions for AI coding agents working on the **DUET 2027 Journey Tracker**.

Agents working on this project must not add AI attribution to commits or pull
requests, including AI `Co-Authored-By` trailers or generated-by signatures.
Preserve genuine human attribution.

## What this is

A personal web application for tracking and visualizing preparation progress
for the DUET admission test. The application helps turn a comprehensive syllabus
into a visible, measurable, and motivating preparation journey.

## Proportional engineering

Build for established requirements, not hypothetical scale, threats, or future
flexibility. Reuse existing code, the standard library, native platform features,
and installed dependencies before adding machinery.

- Unknown scale or extensibility defaults to the smaller reversible design.
- Derive trust and data-integrity boundaries from actual reachability.
- Add an abstraction, dependency, service, configuration surface, compatibility
  layer, or security mechanism only for a current requirement.
- Simplicity never removes data-loss prevention, accessibility, explicit security
  requirements, or configured tests.

## Architecture & Conventions

- **Tech Stack:** React, TypeScript, Vite, React Router, Tailwind CSS, shadcn/ui,
  Lucide React, Zustand, Zod, date-fns, Recharts, Dexie (IndexedDB), Vitest,
  React Testing Library.
- **Layers:**
  1. *Presentation / UI Layer* (`src/components/`, `src/pages/`): Pure UI views and layouts.
  2. *Domain Logic Layer* (`src/domain/`): Pure business logic, calculation models, and validators. Zero UI or DB dependencies.
  3. *Services & Stores Layer* (`src/services/`, `src/stores/`): Orchestration and client state.
  4. *Data Repositories Layer* (`src/repositories/`, `src/storage/`): Abstract repository interfaces with Dexie IndexedDB implementations.
- **Backend Strategy:** Local-first IndexedDB storage via Dexie initially. No backend initially. The repository layer must remain abstracted to facilitate a future Node.js + Express + PostgreSQL + Prisma backend without a major frontend rewrite.

## Commands

- Dev server: `npm run dev` (http://localhost:5173)
- Build: `npm run build`
- Preview server: `npm run preview`
- Lint: `npm run lint`
- Test: `npm run test` (Vitest)
- Typecheck: `npm run typecheck`

## Testing Standards

Testing is powered by Vitest and React Testing Library.

- **What to test:** Pure logic where incorrect output is possible: domain calculations (streaks, progress percentages, weak area detection algorithms), data transformations, validation schemas, and repository contracts.
- **What not to test with unit tests:** Pure presentation UI rendering.
- Keep tests fast, isolated, and focused.

