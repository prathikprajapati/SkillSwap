---
type: security-vulnerabilities
status: draft
project: SkillSwap
updated: 2026-06-17
tags:
  - skillswap
  - security
  - vulnerabilities
---

# Vulnerabilities

## Summary
Tracking list of known/possible vulnerabilities and security weaknesses discovered in the SkillSwap codebase.

## Current Findings (placeholders)
- TODO: enumerate from code review
- TODO: check:
  - authentication token handling in REST + Socket.IO
  - JWT secret presence and rotation strategy
  - rate limiting configuration correctness
  - input validation completeness (express-validator usage)
  - file upload validation in `backend/src/middleware/upload.ts`
  - CSP / Helmet policies correctness for production

## Suggested Evidence Links
- [[Security Checklist]]
- [[Input Validation]]
- [[API Security]]
- [[Threat Model]]

## TODO
- Add for each item:
  - vulnerability title
  - affected area (file/route/component)
  - impact
  - likelihood
  - recommended fix
  - verification/PR link
