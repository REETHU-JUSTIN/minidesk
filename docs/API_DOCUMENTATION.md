# MiniDesk API

The API runs at `http://localhost:5000/api`. Data is sent and received as JSON.

Data is stored in PostgreSQL, and the frontend calls this API through `frontend/src/services/`.

## Run it

```bash
cd backend
npm install
cp .env.example .env    # then fill in the values
npm run db:reset        # creates the database and sample data
npm run dev
```

## Response format

A successful response has a `data` field:

```json
{ "data": { "id": 1, "name": "Alex Morgan" } }
```

An error has an `error` field. `details` is included when specific fields are wrong:

```json
{ "error": { "message": "Please check the highlighted fields.", "details": { "email": "Enter a valid email address." } } }
```

## Status codes

| Code | Meaning | Example |
|---|---|---|
| 200 | Success | Reading a ticket |
| 201 | Created | Creating a ticket |
| 204 | Success, with nothing to return | Deleting a ticket |
| 400 | The request is invalid | A title that's too short |
| 401 | Not signed in, or the token is invalid | A missing or expired token |
| 403 | Signed in, but not allowed | A customer listing users |
| 404 | Not found, or hidden from you | Another customer's ticket |
| 409 | Conflicts with existing data | An email that's already registered |
| 413 | The request body is too large | A body over 100 KB |
| 500 | A bug on the server | Details are logged, and never sent to the client |

## Signing in

Protected endpoints need the token from login or sign-up, sent in a header:

```
Authorization: Bearer <token>
```

Tokens last one day by default.

## Authentication

### POST /api/auth/register

Creates a customer account. Public sign-up can't create admins or agents.

```json
{ "name": "Test Person", "email": "test@example.com", "password": "at-least-8-characters" }
```

Returns `201` with `{ "data": { "token": "...", "user": { ... } } }`. Errors: `400`, `409`.

### POST /api/auth/login

```json
{ "email": "admin@example.com", "password": "..." }
```

Returns `200` with `{ "data": { "token": "...", "user": { ... } } }`. Errors: `400`, `401`.

The same message is returned for an unknown email and a wrong password, so nobody can find out who has an account.

### GET /api/auth/me

Returns the signed-in user. Requires a token.

## Tickets

All ticket endpoints require a token.

### GET /api/tickets

| Query | Values | Default |
|---|---|---|
| `scope` | `all`, `mine` | `all` |
| `search` | Text to find in the title | None |
| `status` | `open`, `in_progress`, `resolved` | None |
| `priority` | `low`, `medium`, `high` | None |
| `sort` | `newest`, `updated` | `newest` |
| `page` | 1 or higher | 1 |
| `limit` | 1 to 100 | 10 |

Returns `{ "data": { "items": [...], "page": 1, "totalPages": 2, "totalItems": 8 } }`.

Customers only ever see their own tickets. For agents and admins, `mine` means assigned to them.

### GET /api/tickets/:id

Returns one ticket, or `404` if it doesn't exist or belongs to another customer.

### POST /api/tickets

Customers only.

```json
{ "title": "5 to 120 characters", "description": "10 to 5000 characters", "category": "technical", "priority": "high" }
```

`category` can be `general`, `billing`, `technical` or `account`. Returns `201`.

### PUT /api/tickets/:id

Send only the fields being changed: `title`, `description`, `status`, `assignedAgentId`.

| Role | Can change |
|---|---|
| Admin | Everything, including assigning any agent or unassigning with `null` |
| Agent | `status`, and `assignedAgentId` only to themselves |
| Customer | `title` and `description` on their own ticket while it's open |

### DELETE /api/tickets/:id

Admins only. Also deletes the ticket's comments. Returns `204`.

## Comments

Require a token. Customers can only use these on their own tickets.

- **GET /api/tickets/:id/comments:** lists comments, oldest first.
- **POST /api/tickets/:id/comments:** adds a comment, with a body of `{ "message": "1 to 2000 characters" }`. The author comes from the token, so it can't be faked. Returns `201`.

## Dashboard

### GET /api/dashboard/stats

Requires a token. Customers get counts for their own tickets, and agents and admins get counts for all tickets.

```json
{ "data": { "total": 8, "open": 3, "inProgress": 3, "resolved": 2 } }
```

## Users

### GET /api/users

Admins only. `?role=agent` filters by role. Never includes password hashes.

## Health check

### GET /api/health

Public. Returns `{ "data": { "status": "ok" } }` when the server is running.

## Postman collection

Import [MiniDesk.postman_collection.json](MiniDesk.postman_collection.json) into Postman, then run it with the **Collection Runner**. Its 20 requests go through a whole ticket's life, with tests on each one. It signs in by itself and deletes the ticket it creates.

Run `npm run db:reset` first, so the sample accounts exist.

## Try it

The sample accounts use the password `MiniDesk-Demo-2026`, which is for local development only.

1. Open Postman and send `POST http://localhost:5000/api/auth/login` with a raw JSON body containing `admin@example.com` and that password.
2. Copy the `token` from the response.
3. Send `GET http://localhost:5000/api/tickets`. On the **Authorization** tab, choose **Bearer Token** and paste the token.

Try it without the token, then with a customer's token on `/api/users`, to see the `401` and `403` responses.
