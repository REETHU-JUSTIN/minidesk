# AWS Deployment Fundamentals

**Not tested:** no AWS account was used, so this is a written plan rather than a deployment. AWS charges for most of these services, and its free tier has limits that change, so check the current pricing before creating anything.

## How MiniDesk would map onto AWS

| MiniDesk part | AWS service | Why this one |
|---|---|---|
| Frontend static files | **S3**, served through **CloudFront** | S3 stores the files, and CloudFront is a CDN that adds HTTPS and caching |
| API container | **App Runner** or **ECS on Fargate** | Runs the backend Docker image without managing servers |
| Database | **RDS for PostgreSQL** | Managed PostgreSQL, with backups and updates handled for you |
| Secrets | **Secrets Manager** or **SSM Parameter Store** | Stores `JWT_SECRET` and the database password, encrypted |
| Container images | **ECR** | AWS's private image registry |
| Permissions | **IAM** | Controls which people and services may do what |
| Logs | **CloudWatch** | Collects the API's logs and metrics |

```
Users --> CloudFront --> S3 (frontend)
   |
   +----> App Runner / ECS (API) --> RDS PostgreSQL
                  |
                  +--> Secrets Manager, CloudWatch
```

## Deployment steps, in outline

1. **Database:** create an RDS PostgreSQL instance in a private network, not publicly reachable.
2. **Secrets:** store the database address and a new `JWT_SECRET` in Secrets Manager.
3. **API image:** build `backend/Dockerfile`, and push the image to ECR.
4. **API service:** create an App Runner service from that image, and set environment variables from the secrets. Set `NODE_ENV=production`, `DB_SSL=true` and `TRUST_PROXY=1`.
5. **Tables and first admin:** run `npm run db:setup` and `npm run user:create` once, for example as a one-off ECS task.
6. **Frontend:** build it with `VITE_API_URL` pointing at the API, upload `dist/` to S3, and put CloudFront in front of it.
7. **Page routing:** set CloudFront to return `index.html` for unknown paths, so page refreshes work.
8. **Connect them:** set the API's `CLIENT_ORIGIN` to the CloudFront address.

---

## AWS for a Full-Stack App

### 1. Concept Explanation

AWS provides building blocks rather than one "host my app" button. The main ideas:
- **Compute** runs code. EC2 gives you whole virtual servers, while ECS, Fargate and App Runner run containers.
- **Managed services** like RDS handle maintenance for you.
- **Regions** are separate geographic locations.
- **IAM** controls access with the principle of least privilege: each person and service gets only the permissions it needs.

### 2. Project Implementation

MiniDesk isn't on AWS. The table above shows where each part would go. Its Docker image, its environment-variable configuration and its `db:setup` script are what make it portable to a service like App Runner.

### 3. Code Reference

**File:** [backend/src/config/env.ts](../../backend/src/config/env.ts)

```ts
const databaseUrl = process.env.DATABASE_URL
```

```ts
dbSsl: process.env.DB_SSL === 'true',
```

- Everything the API needs comes from environment variables, so on AWS, Secrets Manager and the service's settings supply them, and no code changes are needed.
- RDS supports encrypted connections, which `DB_SSL` turns on.

### 4. Why Use It

Managed services take over backups, patching, scaling and HTTPS certificates, which are risky to get wrong by hand. AWS is also widely used, so these ideas carry over to many jobs.

### 5. Real-Time Scenario

Traffic doubles during a product launch. App Runner starts more copies of the API automatically. RDS keeps daily backups, so a bad change can be recovered. CloudFront serves the frontend from locations near users, which keeps it fast. One thing would need changing: MiniDesk's rate limits are counted in memory, so each API copy would count separately until they shared a store like Redis.

### 6. Interview Questions

- **Theory:** What's the difference between EC2, ECS and Lambda?
- **Theory:** What is IAM, and what is least privilege?
- **Theory:** Why put the database in a private network?
- **Practical:** How would you deploy your project on AWS?

### 7. Project-Based Answers

**EC2, ECS or Lambda?**
EC2 is a virtual server you manage yourself. ECS runs containers, and with Fargate there are no servers to manage. Lambda runs individual functions on demand. MiniDesk's API suits containers, because it's a long-running Express server with a database pool.

**IAM and least privilege?**
IAM controls access to AWS resources. Least privilege means each person or service has only the permissions it needs. For example, the API's role could read its own secrets and nothing else.

**Why a private network?**
Only the API needs to reach the database, so hiding it from the internet removes a whole category of attack.

**How would you deploy it?**
Frontend on S3 with CloudFront, the API's Docker image on App Runner, PostgreSQL on RDS in a private network, and secrets in Secrets Manager. I've planned this but haven't done it. My deployment guide also covers simpler hosting services.

### 8. Follow-up Questions

- **How would you avoid surprise bills?** Set up billing alerts and budgets, and delete resources after experimenting.
- **What is a CDN?** A network of servers that cache files close to users, making them faster to load.
- **How would you deploy automatically?** A CI/CD job that builds the image, pushes it to ECR, and updates the service, with AWS credentials stored as CI secrets.
