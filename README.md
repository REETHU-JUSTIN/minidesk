# MiniDesk

A full-stack support ticket management system, built with React, TypeScript, Node.js, Express and PostgreSQL.

Customers raise tickets, agents take ownership and update them, and admins manage everything. Each role sees only what it's allowed to.

**Current status: Phase 8 of 11.** The frontend, API and database work together, with 168 automated tests. Docker arrives in Phase 9.

## Run the project

You need Node.js 22.12 or newer, and PostgreSQL.

### 1. Start the API

```bash
cd backend
npm install
cp .env.example .env    # then fill in the values, including DB_PASSWORD
npm run db:reset        # creates the database and sample data
npm run dev
```

`db:reset` deletes any existing data in the `minidesk` database.

### 2. Start the frontend

In a second terminal:

```bash
cd frontend
npm install
npm run dev
```

Open http://localhost:5173 and sign in with a sample account. All of them use the password `MiniDesk-Demo-2026`, which is for local development only.

| Email | Role |
|---|---|
| `admin@example.com` | Admin |
| `sam@example.com`, `maya@example.com` | Agent |
| `priya@example.com`, `liam@example.com`, `noah@example.com` | Customer |

The API only accepts browser requests from `CLIENT_ORIGIN` in `backend/.env`. If Vite starts on a different port because 5173 is taken, update that setting or free the port.

## Run the tests

```bash
cd frontend && npm test    # no server needed
cd backend && npm test     # needs PostgreSQL, and uses a separate minidesk_test database
```

## Useful commands

| Folder | Command | What it does |
|---|---|---|
| Both | `npm run dev` | Starts in development mode with automatic reloads |
| Both | `npm test` | Runs the automated tests |
| Both | `npm run lint` | Checks for common code problems |
| Both | `npm run build` | Creates a production build |
| `frontend` | `npx tsc -b` | Checks TypeScript types |
| `frontend` | `npm run preview` | Serves the production build locally |
| `backend` | `npm run typecheck` | Checks TypeScript types |
| `backend` | `npm start` | Runs the production build |
| `backend` | `npm run db:reset` | Rebuilds the database and sample data |

## Installed packages

**Backend**

| Package | Purpose |
|---|---|
| `express` | Web server framework |
| `cors` | Lets the frontend call the API from a browser |
| `dotenv` | Loads settings from `.env` |
| `jsonwebtoken` | Creates and verifies login tokens |
| `bcrypt` | Hashes passwords |
| `pg` | Connects to PostgreSQL |
| `typescript`, `tsx` | Static types, and running TypeScript directly in development |
| `vitest`, `supertest` | Running tests, and testing the API over HTTP |

**Frontend**

| Package | Purpose |
|---|---|
| `react`, `react-dom` | The UI library |
| `vite`, `@vitejs/plugin-react` | Development server and build tool |
| `typescript` | Static types |
| `tailwindcss`, `@tailwindcss/vite` | Utility-first CSS |
| `lucide-react` | Icons |
| `react-hook-form` | Form state and validation |
| `react-router-dom` | Page routing |
| `@reduxjs/toolkit`, `react-redux` | Global state for tickets and dashboard data |
| `axios` | HTTP requests to the API |
| `vitest`, `jsdom` | Running tests in a simulated browser |
| `@testing-library/*` | Testing components the way people use them |
| `oxlint` | Linter, included by the Vite template |

## Documentation

- [API documentation](docs/API_DOCUMENTATION.md)
- [Database guide](docs/DATABASE_GUIDE.md)
- [Learning guide](docs/LEARNING_GUIDE.md)
- [Interview guide](docs/INTERVIEW_QUESTIONS.md): every concept explained with code from this project
