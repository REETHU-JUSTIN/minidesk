# CI/CD Basics

**Tested:** every command in the workflow ran successfully on a clean copy of MiniDesk, against a temporary PostgreSQL server. The workflow itself has **not** run on GitHub, because it isn't turned on.

## Turn it on

Copy [ci.yml](ci.yml) to `.github/workflows/ci.yml` in the repository, then commit and push it. GitHub runs it from then on, and shows the results under the repository's **Actions** tab.

It's kept here rather than turned on, because every push would then start a run on your GitHub account. If a run fails, GitHub will email you.

---

## Continuous Integration

### 1. Concept Explanation

**Continuous integration (CI)** automatically checks every change, by installing, linting, type-checking, testing and building it, so problems are caught before they reach `main`.

**Continuous delivery or deployment (CD)** goes further, automatically releasing changes that pass. Delivery means ready to release with one click. Deployment means released automatically.

### 2. Project Implementation

`ci.yml` defines two jobs that run in parallel on a fresh Linux machine:
- **Frontend:** lint, type check, 58 tests and the build.
- **Backend:** the same checks, plus the 113 API tests against a PostgreSQL **service container**.

### 3. Code Reference

**File:** [examples/ci-cd/ci.yml](ci.yml)

```yaml
on:
  push:
    branches: [main]
  pull_request:
```

```yaml
services:
  postgres:
    image: postgres:17
```

```yaml
- run: npm ci
- run: npm run lint
- run: npm run typecheck
- run: npm test
```

- **`on`:** run on pushes to `main` and on every pull request.
- **`services`:** start a real PostgreSQL server next to the job, which the tests reach at `localhost`.
- **The steps:** run in order, and the job stops at the first failure.
- **`cache: npm`:** reuses downloaded packages between runs, which makes them faster.

### 4. Why Use It

Each person's machine is different, and people forget to run tests. CI runs the same checks on a clean machine every time, so "works on my machine" problems show up straight away, and a failing change can't quietly reach `main`.

### 5. Real-Time Scenario

A teammate opens a pull request that accidentally removes the admin check on deleting tickets. CI runs, and `does not let customers or agents delete` fails. GitHub marks the PR with a red cross, and with branch protection on, it can't be merged until it's fixed.

### 6. Interview Questions

- **Theory:** What's the difference between continuous integration, delivery and deployment?
- **Theory:** What belongs in a CI pipeline?
- **Practical:** How would you set up CI for your project?
- **Practical:** How do your backend tests get a database in CI?

### 7. Project-Based Answers

**Integration, delivery and deployment?**
Integration automatically checks every change. Delivery means each passing change is ready to release at the press of a button. Deployment releases it automatically.

**What belongs in the pipeline?**
Installing from the lockfile, linting, type checking, tests and a build, ordered from fastest to slowest so failures show up quickly.

**How would you set it up?**
With a GitHub Actions workflow, with one job each for the frontend and backend, running in parallel. I've written it for MiniDesk and run its steps locally, but haven't turned it on yet.

**How do the backend tests get a database?**
A PostgreSQL service container starts alongside the job. My test setup creates the `minidesk_test` database in it, so no real data is involved.

### 8. Follow-up Questions

- **Why is a password written in the workflow file?** It only belongs to a temporary server that exists for one run. Real secrets would go in GitHub's encrypted **Secrets** settings.
- **How would you add deployment?** Add a job that runs only on `main` after the checks pass, which builds and releases using secrets stored in GitHub.
- **Why `npm ci` in CI?** It installs exactly what's in the lockfile, so every run uses the same versions.
