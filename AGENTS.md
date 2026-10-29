# AGENTS.md

## Repository Overview
Monorepo using `pnpm` workspaces:
- `apps/web`: Next.js 14 App Router (admin dashboard & API routes) with Cloudflare Workers/D1 target.
- `apps/mobile`: Flutter client for employee check-in and leave requests.

## Essential Commands

### Web (`apps/web`)
- **Install deps**: `pnpm install` (from workspace root)
- **Run domain unit tests**: `pnpm test`
- **Run single test**: `node --test --test-name-pattern="Haversine" apps/web/tests/domain.test.mjs`
- **Typecheck**: `pnpm --filter web exec tsc --noEmit`
- **Build**: `pnpm build:web`
- **Dev server**: `pnpm dev:web` (runs on `http://localhost:3000`)
- **D1 Migrations (local)**: `pnpm --filter web db:migrate:local`
- **D1 Migrations (remote)**: `pnpm --filter web db:migrate:remote`
- **Drizzle codegen**: `pnpm --filter web db:generate`

### Mobile (`apps/mobile`)
- **Get packages**: `cd apps/mobile && flutter pub get`
- **Run tests**: `cd apps/mobile && flutter test`
- **Run single test**: `cd apps/mobile && flutter test test/widget_test.dart`
- **Analyze/Lint**: `cd apps/mobile && flutter analyze`

## Key Architecture & Quirks

### 1. Web Data Layer & Cloudflare D1
- **Current Runtime Store**: `apps/web/app/api/**` route handlers use the in-memory singleton `dataStore` from `apps/web/lib/store.ts` for edge/local dev.
- **Persistent D1 Schema**: `apps/web/db/schema.ts` defines the SQLite/D1 schema for Drizzle ORM. If modifying database structure, update `apps/web/db/schema.ts` and run `pnpm --filter web db:generate`.
- **R2 Storage**: `apps/web/lib/r2.ts` provides storage bindings. In dev without active Wrangler R2 binding, it falls back to a stub path `/api/media/<key>`.

### 2. Auth & RBAC
- Passwords hashed via PBKDF2 SHA-256 (`apps/web/lib/auth-jwt.ts`). Tokens signed with HS256 using `jose`.
- `authenticateRequest` checks both `Authorization: Bearer <token>` header (used by Flutter) and `nutrilife_session` cookie (used by web UI).
- Default seed accounts:
  - Super User: `SU001` / `admin123`
  - GM: `GM001` / `admin123`
  - HR: `HR001` / `admin123`
  - Finance: `FN001` / `admin123`
  - Employee: `EMP001` / `karyawan123`

### 3. Business Domain Constraints
- **Leave State Machine** (`apps/web/lib/leave-machine.ts`):
  - Strictly 2-tier: `MENUNGGU_GM` -> (GM approve) -> `MENUNGGU_HR` -> (HR approve) -> `FINAL_DISETUJUI`.
  - GM cannot process `MENUNGGU_HR`; HR cannot process `MENUNGGU_GM`.
  - Quota deduction occurs **only** when HR approves a request with type `CUTI_TAHUNAN`. Non-annual leaves (`IZIN_SAKIT`, etc.) do not deduct quota.
- **Geofencing** (`apps/web/lib/geofence.ts`):
  - Haversine distance in meters. Check-in/out fails if user distance exceeds `radiusMeters` of the active office.
- **Payroll Formula** (`apps/web/lib/payroll.ts`):
  - Late penalty: Rp 1.000 / minute.
  - Absent penalty: `baseSalary / workingDaysInMonth` (default 22 days).
  - Overtime pay: `1.5 * (baseSalary / 173) * overtimeHours` (PP 35/2021).
  - BPJS & Tax deduction: flat 4% of `baseSalary`.

### 4. Mobile API Connection
- `apps/mobile/lib/services/api_constants.dart` points to `http://localhost:3000/api`.
- When running mobile app on Android Emulator, change `baseUrl` to `http://10.0.2.2:3000/api`.
