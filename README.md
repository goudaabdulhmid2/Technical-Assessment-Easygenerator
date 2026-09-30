# Easygenerator Full Stack Assessment

A TypeScript authentication application with a React client and a NestJS/MongoDB API. Signup, signin, the protected application page, and logout use the backend’s HttpOnly JWT cookie.

## Project layout

- `client/` — React, TypeScript, Vite frontend
- `server/` — NestJS, Mongoose, MongoDB backend

## Requirements

- Node.js 22 or newer
- MongoDB 7 or a MongoDB connection URI

## Run locally

1. Start MongoDB.
2. Configure and start the backend:

   ```bash
   cd server
   npm install
   # Copy .env.example to .env and set a strong JWT_ACCESS_SECRET.
   npm run start:dev
   ```

3. Start the frontend in another terminal:

   ```bash
   cd client
   npm install
   # Copy .env.example to .env if the API is not at its default URL.
   npm run dev
   ```

The client is at `http://localhost:5173`, the API is at `http://localhost:3000/api/v1`, and backend API documentation is at `http://localhost:3000/api/docs`. The backend `FRONTEND_URL` must exactly match the client origin (`http://localhost:5173`) for credentialed CORS requests.

## Frontend checks

Run from `client/`:

```bash
npm test
npm run lint
npm run build
```

## Backend checks

Run from `server/`:

```bash
npm test -- --runInBand
npm run test:e2e
npm run test:mongo:smoke
npm run lint
npm run build
```

The live Mongo smoke test requires a local loopback MongoDB connection and creates and removes its own uniquely named temporary database.

## Assessment requirements

The client provides `/signup`, `/signin`, and a protected `/app` route. Signup enforces the assessment’s name, email, and password requirements. The application page displays “Welcome to the application.” and includes logout. See [AI.md](AI.md) for the AI assistance disclosure and engineering decisions.
