# MiniDesk

A small support ticket management system, built to learn full-stack development with React, TypeScript, Node.js, Express and PostgreSQL.

**Current status: Phase 6 of 11.** The frontend and API both work, but they aren't connected yet. The frontend runs on a temporary in-browser backend that doesn't check passwords. The API has real login, validation and role checks, and stores its data in PostgreSQL. Phase 7 connects the two.

## Run the frontend

You need Node.js 22.12 or newer.

```bash
cd frontend
npm install
npm run dev
```

Open http://localhost:5173 and sign in with one of these preview accounts, using any password:

| Email | Role |
|---|---|
| `admin@example.com` | Admin |
| `sam@example.com` | Agent |
| `priya@example.com` | Customer |

## Run the API

```bash
cd backend
npm install
cp .env.example .env    # then fill in the values
npm run db:reset        # creates the database and sample data
npm run dev
```

The API runs at http://localhost:5000/api. See the [API documentation](docs/API_DOCUMENTATION.md) and the [database guide](docs/DATABASE_GUIDE.md).

The API's sample accounts use the password `MiniDesk-Demo-2026`, for local development only.

## Useful commands

Run these from the `frontend` folder:

| Command | What it does |
|---|---|
| `npm run dev` | Starts the development server with hot reload |
| `npx tsc -b` | Checks TypeScript types |
| `npm run lint` | Checks for common code problems |
| `npm run build` | Type-checks and creates a production build in `dist/` |
| `npm run preview` | Serves the production build locally |

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
| `oxlint` | Linter, included by the Vite template |

## Learning material

- [Learning guide](docs/LEARNING_GUIDE.md)
- [Interview guide](docs/INTERVIEW_QUESTIONS.md): every concept explained with code from this project
