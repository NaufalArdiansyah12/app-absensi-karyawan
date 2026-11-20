# AGENTS.md

## Repository Overview
Monorepo using `pnpm` workspaces:
- `apps/web`: Laravel + Inertia React web application and API backend, using Supabase PostgreSQL and Cloudflare R2.
- `apps/mobile`: Flutter client for employee check-in and leave requests, connected to Laravel API.

## Essential Commands

### Web (`apps/web`)
- **Install deps**: `composer install` and `npm install` from `apps/web`
- **Run tests**: `cd apps/web && php artisan test`
- **Build**: `pnpm build:web`
- **Dev server**: `pnpm dev:web`; Laravel API/web server: `cd apps/web && php artisan serve --port=8000`
- **Database migrations**: `cd apps/web && php artisan migrate`

### Mobile (`apps/mobile`)
- **Get packages**: `cd apps/mobile && flutter pub get`
- **Run tests**: `cd apps/mobile && flutter test`
- **Run single test**: `cd apps/mobile && flutter test test/widget_test.dart`
- **Analyze/Lint**: `cd apps/mobile && flutter analyze`

## Key Architecture & Quirks

### 1. Laravel Data Layer & Cloudflare Storage
- **Database**: Laravel uses Supabase PostgreSQL through `apps/web/.env`.
- **Object storage**: Laravel S3 disk connects to Cloudflare R2. Keep credentials in local `.env`, never commit secrets.

### 2. Auth & RBAC
- Laravel authentication and Sanctum token authentication support web session cookies and Flutter Bearer tokens.
- Default seed accounts:
  - Super User: `SU001` / `admin123`
  - GM: `GM001` / `admin123`
  - HR: `HR001` / `admin123`
  - Finance: `FN001` / `admin123`
  - Employee: `EMP001` / `karyawan123`

### 3. Business Domain Constraints
- **Leave State Machine** (`apps/web/app/Services/LeaveMachineService.php`):
  - Strictly 2-tier: `MENUNGGU_GM` -> (GM approve) -> `MENUNGGU_HR` -> (HR approve) -> `FINAL_DISETUJUI`.
  - GM cannot process `MENUNGGU_HR`; HR cannot process `MENUNGGU_GM`.
  - Quota deduction occurs **only** when HR approves a request with type `CUTI_TAHUNAN`. Non-annual leaves (`IZIN_SAKIT`, etc.) do not deduct quota.
- **Geofencing** (`apps/web/app/Services/GeofenceService.php`):
  - Haversine distance in meters. Check-in/out fails if user distance exceeds `radiusMeters` of the active office.
- **Payroll Formula** (`apps/web/app/Services/PayrollService.php`):
  - Late penalty: Rp 1.000 / minute.
  - Absent penalty: `baseSalary / workingDaysInMonth` (default 22 days).
  - Overtime pay: `1.5 * (baseSalary / 173) * overtimeHours` (PP 35/2021).
  - BPJS & Tax deduction: flat 4% of `baseSalary`.

### 4. Mobile API Connection
- `apps/mobile/lib/services/api_constants.dart` selects Laravel's local `http://localhost:8000/api` or ngrok URL.
- For Android Emulator, use `http://10.0.2.2:8000/api` for local backend.
