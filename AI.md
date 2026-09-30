# AI Assistance Disclosure

## Overview

AI assistance was used during the backend review and implementation work and the frontend implementation. The resulting changes were checked against the assessment and the repository, then reviewed and adapted; this disclosure does not claim that AI authored the entire project.

## Backend Assistance

### Scope of AI Assistance

AI assistance supported the backend review, targeted changes, tests, and backend documentation. This included Swagger setup, DTO validation coverage, duplicate-key conflict handling, auth service tests, and isolated HTTP end-to-end coverage. The original history of the pre-existing application code was not available during the review.

### Effective Prompts and Approach

The review asked for an end-to-end assessment while preserving the NestJS, Mongoose, `BaseRepository`, Argon2, and cookie-based JWT architecture. The implementation and package scripts were inspected first; changes were kept focused on identified gaps and then checked with project commands.

### Suggestions Accepted

- Register the existing global exception filter and document the cookie authentication flow.
- Normalize whitespace around names and emails, reject whitespace-only names, and return HTTP 409 for duplicate-email signup races.
- Keep query strings out of request access logs.
- Exercise the HTTP authentication lifecycle in e2e tests with an isolated repository rather than a developer database.
- Replace the Nest starter documentation with setup and API guidance for this backend.

### Corrections and Rework

- An initial Swagger dependency resolution selected a release requiring Nest 12. It was changed to the Nest 11-compatible major used by this project.
- The machine's `npm` wrapper pointed to a missing global installation. Verification commands were run with the npm CLI shipped with Node.js.
- The existing JWT cookie is stateless. Logout clears the browser cookie; it does not revoke a token that was copied elsewhere.
- E2E tests use an isolated in-memory repository with the real HTTP/controller/validation/Passport/JWT/password flow, avoiding the configured developer database.
- A one-off live integration check was run against a uniquely named local MongoDB database that was dropped after verification.

### Human Review and Decisions

The existing backend architecture, authentication flow, cookie settings, and short-lived access token were retained. The test approach avoids adding MongoDB or Redis infrastructure to the e2e suite. Swagger describes cookie authentication and does not advertise bearer-token auth. Dependency compatibility and the limits of stateless logout were reviewed and kept explicit in the documentation.

## Frontend Assistance

### Scope of AI Assistance

AI assistance was used to implement the React/TypeScript client, including its authentication context, route guards, signup/signin forms, API client, validation helpers, accessible feedback states, responsive CSS, and focused tests.

### Effective Prompts and Approach

The frontend was implemented against the actual backend DTOs, routes, response envelopes, CORS configuration, and cookie behavior. The assessment PDF and frontend brief informed the user flows, while the backend remained the source of truth for API behavior and validation.

### Corrections and Decisions

- Use React Router declarative routing and a small auth context instead of adding Redux.
- Check `/auth/me` at initial load before resolving protected navigation.
- Treat an unauthorized session check as signed out, while presenting transient API failures as recoverable errors.
- Mirror backend signup validation in the UI for immediate feedback; backend validation remains authoritative.
- Clear in-memory auth state on logout even if the server cannot be reached, and tell the user that cookie removal could not be confirmed.
- Use CSS for the interface instead of adding an unnecessary UI framework.
- Send credentials with API requests and let the browser handle the HttpOnly cookie; never read or store the token in browser storage.

### Human Review and Verification

The frontend/backend route and response contracts, credentialed CORS, validation rules, cookie handling, token-storage behavior, and security-relevant decisions were checked against the code. Frontend tests exercise validation, route guards, auth flows, and credentialed API requests. Verification results below reflect commands run for this documentation update.

## Final Verification

- Backend: unit tests passed (2 suites, 5 tests), e2e tests passed (1 suite, 4 tests), build passed, and lint passed.
- Frontend: tests passed (4 files, 14 tests), production build passed, and lint passed.
- Live app/MongoDB integration: signup, signin, HttpOnly cookie issuance, protected `/auth/me`, logout, and Swagger all passed. The user record persisted with an Argon2 password hash and unique email index in an isolated local database, which was dropped after the check.
