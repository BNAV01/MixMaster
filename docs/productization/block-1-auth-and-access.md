# Block 1: Auth, Internal Users, Roles, Permissions and Scopes

## Transition Rule

From this block onward, `saas-admin` and `tenant-console` stop relying on demo sessions and local-only role assumptions.

What is now real:

- persistent SaaS platform users
- persistent tenant staff users
- access and refresh sessions stored in database
- backend permission enforcement
- role-based frontend visibility
- tenant bootstrap by real SaaS flow

What remains for later blocks:

- tickets and attachments
- reports/export engines
- QR lifecycle management
- branch administration UI beyond the initial provisioning flow
- consumer authentication and loyalty hardening

## Initial Data Rule

The system now boots with only one required pre-existing identity:

- `SaaS Super Admin`

This bootstrap happens through `mixmaster.security.bootstrap.*` configuration and writes into `platform_users`.

No tenant, branch, staff user, menu or operational demo data is required to start the system.

## Roles Baseline

### SaaS roles

- `SAAS_SUPER_ADMIN`
- `SAAS_SUPPORT`

### Tenant roles

- `TENANT_OWNER`
- `GENERAL_MANAGER`
- `AREA_MANAGER`
- `BRANCH_MANAGER`
- `STORE_ADMIN`
- `INVENTORY_MANAGER`
- `FINANCE_OPERATIONS_MANAGER`
- `BARTENDER_LEAD`
- `STAFF`
- `WAITER`
- `HOST`
- `CASHIER`
- `MARKETING_MANAGER`

These roles are seeded per tenant during tenant provisioning, not globally as fake demo data.

## Permission Model

Permissions are catalogued centrally in `permissions` and linked to tenant roles through `role_permissions`.

### SaaS permission families

- `platform.tenants.read`
- `platform.tenants.write`
- `platform.users.read`
- `platform.users.write`
- `platform.support.read`
- `platform.support.write`
- `platform.flags.read`
- `platform.flags.write`

### Tenant permission families

- `tenant.dashboard.read`
- `tenant.analytics.read`
- `tenant.analytics.export`
- `tenant.menu.read`
- `tenant.menu.write`
- `tenant.menu.publish`
- `tenant.availability.read`
- `tenant.availability.write`
- `tenant.staff.read`
- `tenant.staff.write`
- `tenant.staff.assign`
- `tenant.branches.read`
- `tenant.branches.write`
- `tenant.settings.read`
- `tenant.settings.write`
- `tenant.reports.read`
- `tenant.reports.export`
- `tenant.qr.read`
- `tenant.qr.write`
- `tenant.tickets.read`
- `tenant.tickets.write`
- `tenant.tickets.resolve`
- `tenant.loyalty.read`
- `tenant.loyalty.write`
- `tenant.campaigns.read`
- `tenant.campaigns.write`

## Scope Model

Tenant assignments now carry a real `scope_type`.

Supported scopes:

- `TENANT`
- `BRAND`
- `BRANCH`

How it works:

- `TENANT` grants access across all current tenant branches
- `BRAND` expands to all branches under the assigned brand
- `BRANCH` grants access only to explicitly assigned branches

Multi-branch access is represented by multiple active assignments for the same user and role.

## Authentication Flow

### SaaS platform

1. Operator logs in via `POST /api/platform-admin/public/auth/login`
2. Backend validates `platform_users`
3. Session is stored in `auth_sessions`
4. Frontend stores `accessToken`, `refreshToken` and actor profile
5. `GET /api/platform-admin/me` hydrates the session on reload
6. `POST /api/platform-admin/public/auth/refresh` rotates tokens when needed

### Tenant console

1. Internal user logs in via `POST /api/tenant-admin/public/auth/login`
2. Backend validates tenant code, staff credentials and role assignments
3. Effective permissions and accessible branches are resolved server-side
4. Session is stored in `auth_sessions`
5. Frontend restores with `GET /api/tenant-admin/me`
6. `POST /api/tenant-admin/public/auth/refresh` rotates tokens when needed

## Provisioning Flow

### Create tenant

Implemented flow:

1. SaaS operator calls `POST /api/platform-admin/tenants`
2. Backend creates:
   - tenant
   - initial brand
   - initial branch
   - tenant role catalog
   - owner user
   - owner assignment with `TENANT` scope
3. SaaS console refreshes the real tenant list

### Create internal tenant user

Implemented flow:

1. Tenant operator with `tenant.staff.write` and `tenant.staff.assign` opens `/staff`
2. Frontend submits user, password, status and assignments
3. Backend persists `staff_users`
4. Backend materializes one or many `staff_role_assignments`
5. Result returns with computed permissions and accessible branches

## Backend Enforcement

Real enforcement currently active:

- bearer token validation against `auth_sessions`
- actor audience validation (`PLATFORM` vs `STAFF`)
- permission checks through `ActorPermissionService`
- branch access validation on tenant dashboard endpoints
- status and lockout validation on login

The backend does not trust frontend navigation visibility.

## Frontend Behavior

### `saas-admin`

- no demo auto-login
- real login page
- real tenant list from backend
- real tenant creation form
- sidebar filtered by real permissions

### `tenant-console`

- no demo auto-login
- real login page
- real dashboard from backend
- real staff/roles view from backend
- real staff creation and status/password operations
- active branch context sourced from accessible branches in the authenticated actor

## Current API Surface

### SaaS

- `POST /api/platform-admin/public/auth/login`
- `POST /api/platform-admin/public/auth/refresh`
- `GET /api/platform-admin/me`
- `POST /api/platform-admin/auth/logout`
- `GET /api/platform-admin/tenants`
- `GET /api/platform-admin/tenants/{tenantId}`
- `POST /api/platform-admin/tenants`

### Tenant

- `POST /api/tenant-admin/public/auth/login`
- `POST /api/tenant-admin/public/auth/refresh`
- `GET /api/tenant-admin/me`
- `POST /api/tenant-admin/auth/logout`
- `GET /api/tenant-admin/dashboard`
- `GET /api/tenant-admin/staff/roles`
- `GET /api/tenant-admin/staff/users`
- `POST /api/tenant-admin/staff/users`
- `PATCH /api/tenant-admin/staff/users/{userId}/status`
- `POST /api/tenant-admin/staff/users/{userId}/reset-password`

## Next Block

Block 2 should extend this base with:

- real branch and brand administration UI
- explicit multi-branch selectors and cross-branch dashboards
- backend branch-context enforcement across more modules
- role-conditioned lateral navigation for branch-specific modules
