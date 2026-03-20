# Block 2: Branches, Brands and Scope Governance

## Goal

Strengthen the tenant structure so the platform behaves like a real multi-branch SaaS product.

## Implemented in this iteration

### Backend

- `GET /api/tenant-admin/organization`
  returns real tenant structure filtered by the authenticated actor scope
- `POST /api/tenant-admin/organization/brands`
  creates a real tenant brand
- `POST /api/tenant-admin/organization/branches`
  creates a real branch inside a brand
- `PATCH /api/tenant-admin/organization/branches/{branchId}`
  updates branch operational data and active status

### Scope enforcement

- staff listing now respects the current actor branch visibility
- password resets and status changes now require the target user to be within the actor manageable scope
- new assignments are blocked if the actor tries to grant scopes outside their visible branch set
- tenant-wide assignment grant now requires tenant-wide visibility

### Frontend

- `tenant-console` now exposes a real `Sucursales` route
- the route consumes backend organization responses
- operators with `tenant.branches.write` can create brands and branches
- operators with read-only branch access can inspect visible structure without write controls

## Product impact

- multi-branch users can work across branches with explicit visibility
- low-scope users stop seeing all staff indiscriminately
- tenant structure stops being implicit and becomes administrable
- branch governance now exists as a real product use case, not as placeholder navigation

## Still pending inside Block 2

- edit and deactivate brands
- branch address, contact and commercial metadata
- branch reassignment workflows for staff users
- broader scope enforcement across analytics, reports, tickets and QR modules
- JWT access token hardening on top of the current persistent session model
