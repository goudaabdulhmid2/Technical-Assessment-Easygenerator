# Easygenerator Assessment Backend

A small NestJS authentication API backed by MongoDB and Mongoose. It supports account creation, cookie-based JWT sign-in, a protected current-user endpoint, and logout.

## Requirements

- Node.js 22 or another version supported by the installed dependencies
- MongoDB 7+ running locally or a MongoDB connection string

## Setup

Run these commands from the `server` directory:

```bash
npm install
cp .env.example .env
```

On Windows PowerShell, use `Copy-Item .env.example .env`. Set `MONGO_URI`, `JWT_ACCESS_SECRET` (at least 32 characters), and `FRONTEND_URL` in `.env`. Never commit `.env` or use a development secret in production.

Start MongoDB before starting the API. The configured frontend origin must match the browser app origin; credentialed CORS does not allow `*`.

## Run

```bash
npm run start:dev
```

Build and run the production bundle with:

```bash
npm run build
npm run start:prod
```

The default API base path is `/api/v1`. Swagger UI is at `http://localhost:3000/api/docs` and its OpenAPI JSON is at `/api/docs-json`.

Swagger documents the `access_token` cookie on the protected profile route. The browser stores and sends the HttpOnly cookie; Swagger UI cannot display or manually edit its value. Sign in from the same-origin Swagger UI or another cookie-enabled client before calling the protected route.

## Endpoints

| Method | Path | Description |
| --- | --- | --- |
| POST | `/api/v1/auth/signup` | Create a user with a valid email, a name of at least 3 characters, and a password of at least 8 characters containing a letter, number, and special character. |
| POST | `/api/v1/auth/signin` | Verify credentials and set the `access_token` cookie. |
| GET | `/api/v1/auth/me` | Return the authenticated user's public profile. Requires the access-token cookie. |
| POST | `/api/v1/auth/logout` | Clear the access-token cookie in the client. |

Passwords are hashed with Argon2 and are never included in API responses. JWT access tokens have the lifetime configured by `JWT_ACCESS_EXPIRES_IN` and are sent in an HttpOnly, SameSite=Lax cookie; the cookie is Secure in production. Because the token is stateless, logout clears the browser cookie but does not revoke a previously copied token.

## Tests

```bash
npm test -- --runInBand
npm run test:e2e
npm run build
npm run lint
```

The e2e suite exercises the HTTP validation and cookie-authentication flow against an isolated in-memory repository and does not connect to a developer or production database.

To verify the compiled application against a real local MongoDB, run `npm run test:mongo:smoke`. It requires a loopback MongoDB URI in `.env`, creates a uniquely named temporary database, checks the unique index and persisted Argon2 hash alongside the HTTP auth flow, then drops only that temporary database.
