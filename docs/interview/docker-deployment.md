# Docker and Deployment

**Current state of the project:** MiniDesk has Dockerfiles and a Compose file, but they haven't been run, because Docker wasn't installed. MiniDesk also isn't deployed. Be clear about both if asked. You can explain the files and the testing done instead.

---

## Docker Images and Containers

### 1. Concept Explanation

An **image** is a package containing an app and everything it needs: the operating system files, the runtime, its dependencies and its code. A **container** is a running copy of an image. Containers share the computer's kernel, so they're much lighter than virtual machines.

The problem Docker solves is "it works on my machine". If it works in the container, it works the same way everywhere the container runs.

A **Dockerfile** is the recipe for building an image.

### 2. Project Implementation

- **`backend/Dockerfile`:** compiles TypeScript, then builds a small image to run the API.
- **`frontend/Dockerfile`:** builds the static files, then serves them with nginx.
- **`.dockerignore`:** keeps `node_modules`, `dist`, `.env` and `.git` out of builds.

### 3. Code Reference

**File:** [backend/Dockerfile](../../backend/Dockerfile)

```dockerfile
FROM node:22-bookworm-slim AS build
```

```dockerfile
RUN npm ci
COPY backend/ ./
RUN npm run build
```

```dockerfile
RUN npm ci --omit=dev && npm cache clean --force
COPY --from=build /app/backend/dist ./dist
```

```dockerfile
USER node
```

- **Multi-stage build:** the first stage has the development tools needed to compile. The final stage copies only the compiled code and production packages.
- **`--omit=dev`:** leaves out TypeScript, Vitest and other tools the server doesn't need to run.
- **`USER node`:** runs as an ordinary user rather than root, which limits the damage if the app were compromised.
- **Layer caching:** `package.json` is copied and installed before the code. Docker caches each step, so editing code doesn't reinstall every package.

**File:** [.dockerignore](../../.dockerignore)

```
**/.env
```

- Keeps secrets out of the image, where anyone with the image could read them.

### 4. Why We Used It

Deployment needs the same Node version, packages and settings every time. A container image gives exactly that. A smaller image is also faster to deploy and contains less that could be attacked.

### 5. Real-Time Scenario

A new developer joins. Rather than installing Node and PostgreSQL and configuring each, they could run `docker compose up --build` and get the whole stack, provided Docker is installed. That's the intended outcome, but it hasn't been tested yet.

### 6. Interview Questions

- **Theory:** What's the difference between an image and a container?
- **Theory:** How is a container different from a virtual machine?
- **Theory:** What is a multi-stage build?
- **Practical:** Explain your Dockerfile.
- **Practical:** Have you run it?

### 7. Project-Based Answers

**Image versus container?**
An image is a read-only template, like a class. A container is a running instance of it, like an object.

**Container versus virtual machine?**
A virtual machine includes a whole operating system. A container shares the host's kernel and isolates only the process, so it starts in seconds and uses far less memory.

**What is a multi-stage build?**
Several `FROM` stages in one Dockerfile, where later stages copy only what they need from earlier ones. Mine compiles TypeScript in one stage, and runs the compiled code in a smaller one.

**Explain your Dockerfile.**
The first stage installs every package and compiles TypeScript. The second installs only production packages, copies the compiled code and the SQL files, switches to a non-root user, and starts the server. It also has a health check that calls `/api/health`.

**Have you run it?**
No. Docker wasn't installed, so I won't claim it works. I tested its steps another way: in a clean copy of the project, I ran the production install, the build, the database setup and the server. The production install contained no development tools, and the server worked against a real PostgreSQL database.

### 8. Follow-up Questions

- **Why `bookworm-slim` rather than Alpine?** Alpine uses a different C library, which can cause problems with packages like bcrypt that include compiled code. Slim Debian avoids that.
- **Why `npm ci` rather than `npm install`?** `npm ci` installs exactly what's in the lockfile, fails if it doesn't match `package.json`, and starts from a clean folder. It's predictable, which matters for builds.
- **Why not put secrets in the image with `ENV`?** Anyone with the image could read them. Secrets are passed in when the container runs.

---

## Docker Compose

### 1. Concept Explanation

Docker Compose runs several containers together from one file, describing each service, how they connect and in what order they start. Containers on the same Compose network find each other by service name.

### 2. Project Implementation

`docker-compose.yml` defines three services: `db` (PostgreSQL), `api` and `web` (nginx with the frontend). The root `.env` provides the secrets.

### 3. Code Reference

**File:** [docker-compose.yml](../../docker-compose.yml)

```yaml
POSTGRES_PASSWORD: ${POSTGRES_PASSWORD:?Set POSTGRES_PASSWORD in .env}
```

```yaml
DB_HOST: db
```

```yaml
depends_on:
  db:
    # Waits until PostgreSQL accepts connections, not just until its container starts.
    condition: service_healthy
```

```yaml
- db-data:/var/lib/postgresql/data
```

- **`:?`:** Compose refuses to start if the value is missing, rather than running with an empty password.
- **`DB_HOST: db`:** the API reaches the database by its service name.
- **`service_healthy`:** a container can be running before PostgreSQL is ready, so this waits for its health check.
- **The volume:** keeps the data when containers are removed.

### 4. Why We Used It

Running three containers by hand means long commands in the right order. Compose captures all of that in one file that can be version-controlled.

### 5. Real-Time Scenario

`docker compose up` is designed to do this:

1. Start PostgreSQL, and wait until its health check passes.
2. Start the API, which connects to `db`.
3. Start nginx with the frontend.

The browser then loads `localhost:8080`, and the frontend calls `localhost:5000`. That's the browser calling your computer's port, not `api`, because the browser runs outside Docker's network.

### 6. Interview Questions

- **Theory:** What is Docker Compose for?
- **Theory:** How do containers in Compose communicate?
- **Theory:** What is a volume, and why is it needed?
- **Practical:** Why does the frontend use `localhost:5000` while the API uses `db`?

### 7. Project-Based Answers

**What is Compose for?**
Defining and running multi-container apps from one file. I use it for the database, API and frontend together.

**How do containers communicate?**
Over a network Compose creates, using service names as hostnames. My API connects to `db:5432`.

**What is a volume?**
Storage that lives outside a container. Containers are disposable, so without a volume the database would be wiped on every rebuild.

**Why the different addresses?**
The API connects from inside Docker's network, where `db` is a known name. The frontend's JavaScript runs in the user's browser, outside that network, so it needs an address the browser can reach.

### 8. Follow-up Questions

- **Does `depends_on` alone wait for the database?** No, only for the container to start. That's why I added a health check condition.
- **Would you use Compose in production?** For a single server it can work. Larger setups use orchestration tools like Kubernetes, or managed services.
- **Why is PostgreSQL's port not published?** Only the API needs it, inside the Docker network. Not publishing it avoids exposing the database, and avoids clashing with PostgreSQL already installed on the computer.

---

## Production Configuration and Deployment

### 1. Concept Explanation

Code that works locally needs adjusting for production:

- **Configuration from the environment,** not files in the repository.
- **Real secrets,** different from development.
- **Hosting specifics:** HTTPS, proxies, and a single database address.
- **Protection against abuse,** such as rate limiting.
- **Clean shutdowns,** so deployments don't cut off requests.

### 2. Project Implementation

- **`DATABASE_URL` and `DB_SSL`:** for hosted databases.
- **`TRUST_PROXY`:** for hosting services' proxies.
- **Rate limiting:** on login and sign-up.
- **Graceful shutdown:** on `SIGTERM`.
- **Safe setup scripts:** `db:setup` and `user:create`.
- **SPA routing:** `nginx.conf` and `vercel.json`.

### 3. Code Reference

**File:** [backend/src/middleware/rateLimits.ts](../../backend/src/middleware/rateLimits.ts)

```ts
export const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: env.loginAttemptLimit,
  skipSuccessfulRequests: true,
```

- Only failed logins count, so password guessing is slowed while real users aren't affected.

**File:** [backend/src/app.ts](../../backend/src/app.ts)

```ts
if (env.trustProxy > 0) app.set('trust proxy', env.trustProxy)
```

- Behind a proxy, every request seems to come from the proxy. This makes Express read the real visitor's address, so one person's failed logins don't block everyone.

**File:** [backend/src/server.ts](../../backend/src/server.ts)

```ts
server.close(async () => {
  await pool.end()
  process.exit(0)
})
```

- On `SIGTERM`, the server stops accepting new connections, finishes current requests, then closes the database pool.

**File:** [backend/src/scripts/setupDatabase.ts](../../backend/src/scripts/setupDatabase.ts)

```ts
if (existing.rows[0].found) {
  console.log('The tables already exist, so nothing was changed.')
```

- `schema.sql` deletes existing tables, so this guard stops it from wiping a real database.

**File:** [frontend/nginx.conf](../../frontend/nginx.conf)

```
try_files $uri $uri/ /index.html;
```

- Sends unknown addresses to `index.html`, so React Router can show the page. Without this, refreshing `/tickets/1006` would give a 404.

### 4. Why We Used It

Each of these addresses something that can go wrong in real deployments:

- Without rate limiting, passwords can be guessed.
- Without proxy trust, the rate limiter blocks everyone at once.
- Without graceful shutdown, each deployment cuts off requests.
- Without safe setup, a typo could wipe real data.
- Without the routing fallback, refreshing a page breaks.

### 5. Real-Time Scenario

Someone tries passwords against an admin account. After a few failures from their address, they get a 429 "Too many attempts" for 15 minutes, while other users can still sign in. I tested this with simulated proxy headers: one address was blocked on its fourth failure, and a different address still worked.

### 6. Interview Questions

- **Theory:** What changes between development and production?
- **Theory:** Why does a single-page app need special server configuration?
- **Theory:** What is graceful shutdown?
- **Practical:** How would you deploy your project?
- **Practical:** How did you protect your login from brute-force attacks?
- **Practical:** How do you create the first admin on a new deployment?

### 7. Project-Based Answers

**What changes?**
Configuration comes from the host's environment variables, secrets are new, and sample data is never loaded. There's also HTTPS, a proxy in front, and protection against abuse.

**Why special configuration for a single-page app?**
There's only one HTML file. A request for `/tickets/1006` has no matching file, so the server must return `index.html` and let React Router handle it.

**What is graceful shutdown?**
On a stop signal, finishing in-flight requests before exiting. Hosts send `SIGTERM` during deployments, and my server closes connections and the database pool cleanly. I couldn't test it, because Windows doesn't deliver that signal the same way Linux does.

**How would you deploy it?**
The frontend on a static host like Vercel, with `VITE_API_URL` set when it's built. The API on a Node host like Render, with environment variables for the database, secret, allowed origin and proxy. The database on a managed PostgreSQL service. Then I'd run `db:setup` and `user:create` from the host's shell. I've written this up as a guide, but I haven't deployed it.

**How did you protect login?**
`express-rate-limit` allows a set number of failed attempts per address in 15 minutes, counting only failures. A test confirms the fourth failure is blocked, and also fails if I remove the limiter.

**How do you create the first admin?**
Public sign-up only creates customers, so a script, `user:create`, creates admins and agents from the server's shell. The password comes from an environment variable, so it isn't saved in shell history.

### 8. Follow-up Questions

- **Why is `VITE_API_URL` set when building, not running?** Vite builds it into the JavaScript files. Changing it means rebuilding the frontend.
- **Is rate limiting in memory enough?** For one server, yes. With several servers, each would have its own count, so a shared store like Redis would be needed.
- **What would you add next?** Automatic deployments from GitHub, database migrations instead of a single schema file, error monitoring, and helmet for security headers on the API.
