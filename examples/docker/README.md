# Docker Fundamentals

**Not tested:** Docker wasn't installed, so none of these commands have been run. They're standard commands, but check the output carefully when you try them. MiniDesk's own Docker files are explained in [Docker and deployment](../../docs/interview/docker-deployment.md).

## Commands to know

These use MiniDesk's files. Run them from the project folder after installing Docker Desktop.

| Task | Command |
|---|---|
| Build an image | `docker build -f backend/Dockerfile -t minidesk-api .` |
| List images | `docker images` |
| Run a container | `docker run --rm -p 5000:5000 --env-file backend/.env minidesk-api` |
| List running containers | `docker ps` |
| See a container's output | `docker logs <container>` |
| Open a shell inside one | `docker exec -it <container> sh` |
| Stop a container | `docker stop <container>` |
| Start everything in Compose | `docker compose up --build` |
| Stop Compose, keeping data | `docker compose down` |
| Stop Compose, deleting data | `docker compose down -v` |

With `--env-file backend/.env`, the database host `localhost` would mean the container itself, not your computer. On Docker Desktop, use `host.docker.internal` as `DB_HOST` to reach PostgreSQL installed on your computer.

---

## Images, Containers, Volumes and Networks

### 1. Concept Explanation

| Term | Meaning |
|---|---|
| **Image** | A read-only package of an app and everything it needs, built from a Dockerfile |
| **Container** | A running instance of an image, isolated from other processes |
| **Layer** | Each Dockerfile step creates a cached layer, so unchanged steps aren't repeated |
| **Volume** | Storage that outlives containers, used for database data |
| **Network** | Lets containers reach each other by name |
| **Registry** | A store for images, such as Docker Hub |

### 2. Project Implementation

- **Images:** `backend/Dockerfile` and `frontend/Dockerfile` each build one.
- **Containers:** `docker-compose.yml` runs three of them, for the database, API and frontend.
- **Volume:** `db-data` keeps the database between restarts.
- **Network:** Compose creates one, so the API can reach the database at the address `db`.

### 3. Code Reference

**File:** [backend/Dockerfile](../../backend/Dockerfile)

```dockerfile
COPY backend/package.json backend/package-lock.json ./
RUN npm ci
COPY backend/ ./
```

- Copying the package files before the code means that after a code change, Docker reuses the cached `npm ci` layer, and only the later steps run again.

**File:** [docker-compose.yml](../../docker-compose.yml)

```yaml
- db-data:/var/lib/postgresql/data
```

### 4. Why Use It

The image includes the exact runtime and dependencies, so the app behaves the same on every machine. Containers also start in seconds and use far less memory than virtual machines.

### 5. Real-Time Scenario

A teammate has Node 18 installed, but MiniDesk needs Node 22. With Docker, they wouldn't need either version: the image includes Node 22, and `docker compose up` runs the whole stack. That's the design, though it hasn't been tried with MiniDesk yet.

### 6. Interview Questions

- **Theory:** What's the difference between an image and a container?
- **Theory:** What is a volume, and why are containers called stateless?
- **Theory:** How does layer caching work?
- **Practical:** How would you reduce an image's size?

### 7. Project-Based Answers

**Image versus container?**
An image is the template, and a container is a running instance. One image can run as many containers.

**Volumes and statelessness?**
A container's own files disappear when it's removed, so containers are treated as disposable. Anything worth keeping, like database files, goes in a volume.

**Layer caching?**
Each instruction creates a layer, which is reused if nothing it depends on has changed. Ordering instructions from least to most frequently changed, as MiniDesk's Dockerfiles do, keeps rebuilds fast.

**Reducing image size?**
Multi-stage builds, so build tools aren't shipped, plus `npm ci --omit=dev`, a slim base image and a `.dockerignore`. MiniDesk's backend Dockerfile does all four.

### 8. Follow-up Questions

- **What's the difference between `CMD` and `RUN`?** `RUN` executes while the image is built. `CMD` is the command the container runs when it starts.
- **What's the difference between `EXPOSE` and `-p`?** `EXPOSE` only documents a port. `-p` actually publishes it on your computer.
- **Why not run as root in a container?** If the app were compromised, root inside the container makes escaping or causing damage easier.
