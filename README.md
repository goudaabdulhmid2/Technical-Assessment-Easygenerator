# Easygenerator Full Stack Assessment

## Overview

A small authentication application with a React client and a NestJS API backed by MongoDB. Users can create an account, sign in, view a protected application page, and sign out.

## Tech Stack

### Frontend

- React and React DOM
- TypeScript
- React Router (declarative routes)
- Vite and the React plugin
- Vitest, Testing Library, and jsdom for tests

### Backend

- NestJS (HTTP API and configuration)
- MongoDB with Mongoose
- Passport and JWT for cookie-based authentication
- Argon2 for password hashing
- class-validator and class-transformer for request validation
- Swagger for API documentation
- Helmet and Nest throttling for baseline HTTP protections
- Jest and Supertest for unit and e2e tests

## Project Structure

```text
.
├── client/
│   ├── src/                 # React pages, auth state, API client, tests, styles
│   ├── .env.example
│   ├── package.json
│   └── vite.config.ts
├── server/
│   ├── src/                 # Nest modules, auth, users, database, security
│   ├── test/                # HTTP e2e suite
│   ├── .env.example
│   └── package.json
├── AI.md
└── README.md
```

## Prerequisites

- Node.js 22.13 or newer. This satisfies the Node requirements declared by the installed Vite, Vitest, and ESLint toolchain.
- A MongoDB server reachable through a `mongodb://` or `mongodb+srv://` URI. The repository does not pin a MongoDB server version.
- npm, included with Node.js.

## Environment Configuration

Copy each example file to `.env` in its respective folder. Do not commit `.env` or put real secrets in example files.

Backend (`server/.env`):

| Variable | Purpose | Example/default |
| --- | --- | --- |
| `NODE_ENV` | Runtime environment (`development`, `production`, or `test`) | `development` |
| `PORT` | HTTP listen port | `3000` |
| `MONGO_URI` | MongoDB connection URI; required | See `server/.env.example` |
| `JWT_ACCESS_SECRET` | JWT signing secret, at least 32 characters; required | Replace the placeholder with a strong random secret |
| `JWT_ACCESS_EXPIRES_IN` | JWT expiry string; required | `15m` |
| `FRONTEND_URL` | Exact allowed client origin for credentialed CORS; required | `http://localhost:5173` |

Frontend (`client/.env`):

| Variable | Purpose | Example/default |
| --- | --- | --- |
| `VITE_API_BASE_URL` | API base URL, including version prefix | `http://localhost:3000/api/v1` |

```powershell
Copy-Item server/.env.example server/.env
Copy-Item client/.env.example client/.env
```

The frontend defaults to `http://localhost:3000/api/v1` if `VITE_API_BASE_URL` is unset. Configure `FRONTEND_URL` to match the browser's client origin exactly.

## Installation

Install dependencies for each application:

```bash
cd server
npm install

cd ../client
npm install
```

## Running the Application

Start MongoDB first. In one terminal, configure `server/.env` and run the backend:

```bash
cd server
npm run start:dev
```

In another terminal, configure `client/.env` as needed and run the frontend:

```bash
cd client
npm run dev
```

The default client URL is `http://localhost:5173`. The API base URL is `http://localhost:3000/api/v1`.

## Application Routes

| Route | Purpose | Access |
| --- | --- | --- |
| `/signup` | Create an account | Guest route; signed-in users are redirected to the app |
| `/signin` | Sign in to an account | Guest route; signed-in users are redirected to the app |
| `/app` | Displays “Welcome to the application.” and provides logout | Protected; requires a valid session confirmed by the API |

## Authentication Flow

```text
Signup
  ↓
Signin
  ↓
Backend sets HttpOnly access_token cookie
  ↓
Client checks GET /auth/me on startup
  ↓
Protected /app
  ↓
Logout response clears the cookie in the browser
```

The client sends requests with browser credentials enabled. The access token is handled by the HttpOnly cookie and is not stored in `localStorage` or `sessionStorage`. Logout clears the client cookie; because the JWT is stateless, it does not revoke a token copied elsewhere.

## API Endpoints

All routes use the `/api/v1` prefix.

| Method | Path | Purpose | Authentication |
| --- | --- | --- | --- |
| `POST` | `/api/v1/auth/signup` | Validate and create an account; returns a public user profile | No |
| `POST` | `/api/v1/auth/signin` | Validate credentials, set the `access_token` cookie, and return a public user profile | No |
| `GET` | `/api/v1/auth/me` | Return the current user's public profile | Yes; valid `access_token` cookie |
| `POST` | `/api/v1/auth/logout` | Clear the `access_token` cookie in this client | No |

## Validation

Signup requires a valid email, a name of at least 3 characters that is not whitespace-only, and a password of at least 8 characters containing at least one letter, one number, and one special character. The frontend provides immediate feedback, but backend DTO validation is authoritative. The API also rejects unknown request fields.

## Security

- Sign-in issues a JWT in an `HttpOnly`, `SameSite=Lax` cookie. The cookie is `Secure` in production and has a 15-minute max age.
- JWT expiry is configured through `JWT_ACCESS_EXPIRES_IN`; expired tokens are rejected. The cookie max age is currently 15 minutes.
- Passwords are hashed and verified with Argon2 and are excluded from user responses.
- Credentialed CORS is restricted to the configured `FRONTEND_URL`.
- Helmet adds HTTP security headers.
- Nest throttling applies a global limit of 60 requests per minute and a limit of 5 requests per minute to signup and signin.
- Global validation transforms DTOs and rejects unknown fields instead of silently accepting them.
- MongoDB enforces a unique email index; duplicate email conflicts are returned as HTTP 409, including signup races.
- The client does not persist authentication tokens in browser storage.

## Testing

Run commands from the relevant folder.

### Backend

```bash
npm test -- --runInBand
npm run test:e2e
npm run build
npm run lint
```

The e2e suite exercises the HTTP authentication flow with an isolated in-memory repository; it does not verify a live MongoDB connection. `server/package.json` also defines `test:mongo:smoke`, but its target file `server/test/live-mongo-smoke.mjs` is absent in this checkout, so that script is currently unavailable and no live MongoDB smoke result is claimed.

### Frontend

```bash
npm test
npm run build
npm run lint
```

For the results run while preparing these docs, see [AI.md](./AI.md#final-verification).

## API Documentation

With the backend running, Swagger UI is available at `http://localhost:3000/api/docs`; the OpenAPI JSON is at `http://localhost:3000/api/docs-json`.

## Production Notes

Set production secrets and origins explicitly, use HTTPS so the Secure cookie is sent, and configure the JWT expiry intentionally. Logout clears the browser cookie but does not revoke a copied stateless JWT.

## AI Assistance

AI assistance was used during development and review. See [AI.md](./AI.md) for the detailed disclosure.
