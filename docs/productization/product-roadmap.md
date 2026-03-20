# MixMaster Productization Roadmap

## Principle

MixMaster stops being treated as a demo stack. Each block must leave:

- persisted data
- backend use cases
- real endpoints
- frontend consuming real responses
- backend authorization enforcement
- role and scope-aware UX

## Current State

### Already real

- SaaS platform user bootstrap
- tenant owner provisioning flow
- persistent staff users
- persistent role and permission assignments
- backend bearer-session authentication
- frontend login and session restore for `saas-admin` and `tenant-console`
- backend permission checks
- branch-aware actor profiles

### Still incomplete

- branch and brand administration breadth
- multi-branch governance depth across all modules
- ticketing
- report generation and exports
- QR lifecycle
- richer user profiles and operational metadata
- JWT access token hardening

## Execution Order

### Block 1

- internal users
- roles
- permissions
- scopes
- persistent auth
- tenant provisioning

Status: implemented as initial operational base.

### Block 2

- brands and branches
- cross-branch visibility
- scope-aware staff visibility
- branch-governed tenant console

Status: in progress and partially implemented in this iteration.

### Block 3

- internal tickets
- states, priority, severity
- comments
- attachment base
- tenant and SaaS views

### Block 4

- operational reports
- Excel and PDF exports
- export permissions
- audit trail for sensitive exports

### Block 5

- QR lifecycle
- generation
- regeneration
- export and print layouts
- branch and table governance

## Security Direction

### Current

- access and refresh sessions persisted in `auth_sessions`
- backend resolves permissions from server-side state
- frontend never grants access by itself
- scope enforcement is backend-controlled

### Immediate hardening next

- signed JWT access tokens with persisted session linkage
- refresh token rotation
- explicit revocation tracking
- stronger audit events on auth-sensitive operations

The system should move toward `JWT access token + persisted refresh session` rather than returning to in-memory auth or decorative guards.
