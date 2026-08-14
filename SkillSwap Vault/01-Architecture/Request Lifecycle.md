---
type: architecture-request-lifecycle
status: draft
project: SkillSwap
updated: 2026-06-17
tags:
  - skillswap
  - architecture
  - request-lifecycle
---

# Request Lifecycle

## Summary
How a typical REST request flows through SkillSwap backend.

## Lifecycle (placeholders)
```mermaid
sequenceDiagram
participant C as Client
participant FE as Frontend
participant B as Express API
participant MW as Middleware
participant R as Route Handler
participant P as Prisma
participant D as MySQL

C->>FE: User action
FE->>B: REST request (Authorization: Bearer token)
B->>MW: helmet + rateLimit + (auth middleware)
MW->>B: req.user populated (Firebase verify)
B->>R: controller executes domain logic
R->>P: Prisma queries/mutations
P->>D: MySQL I/O
P-->>R: data
R-->>B: JSON response
B-->>FE: response
FE-->>C: UI update
```

## Security checks (placeholders)
- Token verification: `verifyFirebaseToken`
- Soft-delete blocking: `requireActiveUser` (exists, wiring needs verification)
- Request validation: `express-validator` where defined

## Wiki Links
- [[Authentication Flow]]
- [[Authorization Flow]]
- [[API Security]]

## TODO
- Document per-route middleware composition based on `routes/*.ts`.
