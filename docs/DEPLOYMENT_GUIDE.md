# MiniDesk Deployment Guide

Deployment means putting MiniDesk on servers connected to the internet, so anyone can use it through a link. MiniDesk has three parts, and each needs a home:

| Part | What it is | Example services |
|---|---|---|
| Frontend | Static files: HTML, CSS and JavaScript | Vercel, Netlify |
| API | A Node.js server | Render, Railway, Fly.io |
| Database | MongoDB | MongoDB Atlas |

**Status:** MiniDesk isn't deployed yet. Following this guide needs accounts on these services, which you create yourself. Free plans often have limits, such as servers that sleep when idle or databases that expire, and the details change, so check each service's current pricing.

## Before you deploy: checklist

- [ ] **New secrets:** generate a new `JWT_SECRET`. Never reuse your local one.
- [ ] **No sample data:** never run `db:reset` on a real database, because its sample accounts have a public password. Use `db:setup` and `user:create` instead.
- [ ] **HTTPS:** both sites must use `https://`. The services above provide it automatically.
- [ ] **CORS:** set `CLIENT_ORIGIN` to the frontend's exact address, with no trailing slash.
- [ ] **Behind a proxy:** set `TRUST_PROXY=1`, so login rate limiting sees each visitor's real address.
- [ ] **Backups:** check that your database host keeps backups, or set them up.

## Option A: hosting services (recommended)

### 1. Create the database

Create a cluster on MongoDB Atlas, add a database user, and allow your API host to connect. Copy its **connection string**, and add the database name, so it looks like `mongodb+srv://user:password@cluster.example.mongodb.net/minidesk`.

### 2. Deploy the API

Create a web service connected to your GitHub repository:

| Setting | Value |
|---|---|
| Root directory | `backend` |
| Build command | `npm ci && npm run build` |
| Start command | `npm start` |

Then add these environment variables:

| Variable | Value |
|---|---|
| `NODE_ENV` | `production` |
| `MONGODB_URI` | The connection string from step 1 |
| `JWT_SECRET` | A new random value of at least 32 characters |
| `CLIENT_ORIGIN` | Your frontend's address, added after step 4 |
| `TRUST_PROXY` | `1` |

Most services set `PORT` themselves, and the API uses whatever port it's given.

### 3. Create the indexes and the first admin

Open your API service's **shell** or **console**, and run:

```bash
npm run db:setup
NEW_USER_PASSWORD='choose-a-strong-password' npm run user:create -- --name "Your Name" --email you@example.com --role admin
```

`db:setup` creates the indexes, adds no sample data, and is safe to run again. Public sign-up only creates customers, so agents are created the same way, with `--role agent`.

### 4. Deploy the frontend

Create a project connected to the same repository:

| Setting | Value |
|---|---|
| Root directory | `frontend` |
| Build command | `npm run build` |
| Output directory | `dist` |
| Environment variable | `VITE_API_URL` = your API's address plus `/api`, such as `https://minidesk-api.example.com/api` |

`frontend/vercel.json` sends every address to `index.html`, so refreshing a page like `/tickets/1006` works. On Netlify, add a file called `frontend/public/_redirects` containing `/* /index.html 200` instead.

### 5. Connect them

Put the frontend's address in the API's `CLIENT_ORIGIN`, and redeploy the API. Then open the frontend and sign in with the admin account from step 3.

## Option B: Docker

Docker packages each part into a container that runs the same way on any machine.

**Status:** these Docker files have **not been tested**, because Docker wasn't installed on the development machine. The steps inside them were checked separately, by repeating them in a clean folder.

### Run everything on your computer

1. Install Docker Desktop.
2. In the project folder, copy `.env.example` to `.env`, and fill in `MONGO_PASSWORD` and `JWT_SECRET`.
3. Run:

```bash
docker compose up --build
```

4. In a second terminal, add the sample data, which is fine for local use:

```bash
docker compose run --rm -e NODE_ENV=development api npm run db:reset:built
```

5. Open http://localhost:8080.

Port 5000 must be free, so stop any `npm run dev` API first.

### On a real server

Build the images and run them on a host that supports containers. Use `npm run db:setup` and `npm run user:create` rather than the sample data. The frontend image needs the API address when it's **built**:

```bash
docker build -f backend/Dockerfile -t minidesk-api .
docker build -f frontend/Dockerfile --build-arg VITE_API_URL=https://your-api.example.com/api -t minidesk-web .
```

## Troubleshooting

| Problem | Likely cause |
|---|---|
| The browser console says "blocked by CORS policy" | `CLIENT_ORIGIN` doesn't exactly match the frontend's address |
| "We can't reach the server" | `VITE_API_URL` is wrong, or was changed without rebuilding the frontend |
| Refreshing a page gives a 404 | The host isn't sending every address to `index.html` |
| The API won't start, and names a missing variable | A required environment variable isn't set |
| The API can't connect to Atlas | Check the connection string, and that Atlas allows connections from your API host |
| Everyone gets "Too many attempts" at once | `TRUST_PROXY` isn't set, so all visitors look like the proxy |
