# MiniDesk

A small support ticket management system, built to learn full-stack development with React, TypeScript, Node.js, Express and PostgreSQL.

**Current status: Phase 1 of 11.** The interface is a static preview using sample data. Forms don't submit, search and filters don't filter, and there is no login or backend yet.

## Run the frontend

You need Node.js 22.12 or newer.

```bash
cd frontend
npm install
npm run dev
```

Open http://localhost:5173. Use the **Preview** dropdown in the bottom-right corner to reach any page.

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

| Package | Purpose |
|---|---|
| `react`, `react-dom` | The UI library |
| `vite`, `@vitejs/plugin-react` | Development server and build tool |
| `typescript` | Static types |
| `tailwindcss`, `@tailwindcss/vite` | Utility-first CSS |
| `lucide-react` | Icons |
| `oxlint` | Linter, included by the Vite template |

## Learning material

- [Learning guide](docs/LEARNING_GUIDE.md)
- [Interview questions](docs/INTERVIEW_QUESTIONS.md)
