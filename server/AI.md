# AI Assistance Disclosure

## Scope of AI assistance

During the backend review recorded in this repository, an AI coding assistant was used to inspect the existing NestJS implementation against the assessment brief, identify missing documentation and test coverage, and help draft targeted changes. The assisted work in this review includes Swagger metadata/setup, DTO normalization and validation coverage, duplicate-key conflict handling, auth service tests, isolated HTTP e2e coverage, and the backend README.

This disclosure describes the current review work. The prior history of how the pre-existing application code was authored was not available during this review, so no claims are made about that earlier work.

## Effective prompts and approach

The review prompt asked for an end-to-end backend assessment while preserving the existing NestJS, Mongoose, `BaseRepository`, Argon2, and cookie-based JWT architecture. It explicitly called for checking authentication, validation, security, error handling, Swagger, unit/e2e tests, build, lint, README, and this disclosure. The work proceeded by inspecting the implementation and package scripts first, recording a baseline, then making small changes and verifying them.

## Suggestions accepted

- Register the already present global exception filter and document the actual cookie authentication flow.
- Normalize surrounding whitespace on names and emails, reject whitespace-only names, and map duplicate-key signup races to HTTP 409.
- Avoid logging query strings in request access logs.
- Exercise the HTTP auth lifecycle in e2e tests using an isolated repository instead of connecting to a developer database.
- Replace the Nest starter README with setup and API guidance matching the implemented backend.

## Corrections and rework

- The first Swagger package resolution attempt selected a release requiring Nest 12, while the project uses Nest 11. The dependency was corrected to the Nest 11 compatible major rather than forcing an incompatible peer dependency.
- The machine's `npm` wrapper points to a missing global npm installation. Commands were rerun with the npm CLI shipped alongside Node.js, so verification results are based on the actual project scripts.
- The existing authentication design issues a stateless JWT cookie. Documentation describes logout accurately as clearing that cookie in the client; it does not claim that logout revokes a copied token.
- E2E coverage uses an isolated test repository and the real HTTP/controller/validation/Passport/JWT/password services, so tests do not depend on the developer's `.env` database.
- A separate, guarded live MongoDB smoke script was run against a uniquely named temporary loopback database; it verified the real unique index and persisted password hash, then dropped only that test database.

## Human review and decisions

The existing architecture, auth flow, cookie settings, and short-lived access token were retained. The test strategy avoids introducing MongoDB or Redis infrastructure. Swagger uses cookie authentication metadata and does not advertise bearer tokens. Build, lint, unit test, and e2e results are recorded from commands actually run for this review; any unavailable result is identified explicitly in the delivery report.
