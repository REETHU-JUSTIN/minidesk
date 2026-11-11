# MiniDesk

A MERN stack support ticket management system, built with MongoDB, Express, React and Node.js, in JavaScript.

Customers raise tickets, agents take ownership and update them, and admins manage everything. Each role sees only what it's allowed to.

**Status: all 11 phases are complete.** The application works from end to end, with 176 automated tests. It isn't deployed, and its Docker files haven't been run yet. See the [project overview](docs/PROJECT_OVERVIEW.md).

## Run the project

You need Node.js 22.12 or newer, and MongoDB.

### 1. Start the API

```bash
cd backend
npm install
cp .env.example .env    # then fill in the values
npm run db:reset        # loads the sample data
npm run dev
```

`db:reset` deletes all users and tickets in the database named in `MONGODB_URI`.

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

## Run with Docker (untested)

Copy `.env.example` to `.env` in the project folder, fill it in, then run `docker compose up --build` and open http://localhost:8080. See the [deployment guide](docs/DEPLOYMENT_GUIDE.md) for details, including how to add sample data.

## Run the tests

```bash
cd frontend && npm test    # no server needed
cd backend && npm test     # starts its own temporary MongoDB, so no server is needed
```

## Useful commands

| Folder | Command | What it does |
|---|---|---|
| Both | `npm run dev` | Starts in development mode with automatic reloads |
| Both | `npm test` | Runs the automated tests |
| Both | `npm run lint` | Checks for common code problems |
| `frontend` | `npm run build` | Creates a production build |
| `frontend` | `npm run preview` | Serves the production build locally |
| `backend` | `npm start` | Runs the server without automatic reloads |
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
| `mongoose` | Schemas, validation and queries for MongoDB |
| `express-rate-limit` | Limits repeated failed logins |
| `vitest`, `supertest`, `mongodb-memory-server` | Running tests, testing the API over HTTP, and a temporary database |

**Frontend**

| Package | Purpose |
|---|---|
| `react`, `react-dom` | The UI library |
| `vite`, `@vitejs/plugin-react` | Development server and build tool |
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

- [Project overview](docs/PROJECT_OVERVIEW.md)
- [Folder structure](docs/FOLDER_STRUCTURE.md)
- [API documentation](docs/API_DOCUMENTATION.md)
- [Database guide](docs/DATABASE_GUIDE.md)
- [Deployment guide](docs/DEPLOYMENT_GUIDE.md)
- [Learning guide](docs/LEARNING_GUIDE.md)
- [Interview guide](docs/INTERVIEW_QUESTIONS.md): every concept explained with code from this project
- [Practice examples](examples/README.md): MongoDB, PostgreSQL, Git, CI/CD, Docker, AWS and Agile
