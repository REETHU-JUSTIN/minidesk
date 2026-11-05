# Node.js and Express

**Current state of the project:** the API works, is tested, and stores its data in PostgreSQL. The frontend isn't connected to it until Phase 7. Describe it that way if asked before then.

---

## Node.js and the Event Loop

### 1. Concept Explanation

Node.js runs JavaScript outside the browser, which lets you write servers in it. It runs your JavaScript on one main thread. Slow work, such as reading from a database, doesn't block that thread: Node starts the work, moves on to other requests, and runs your callback when the result is ready. The **event loop** is what manages this.

Very CPU-heavy work is the exception, because it does block the main thread.

### 2. Project Implementation

MiniDesk's whole backend runs on Node. `server.ts` starts it, handlers are `async`, and bcrypt's async functions do their heavy hashing away from the main thread.

### 3. Code Reference

**File:** [backend/src/server.ts](../../backend/src/server.ts)

```ts
async function start() {
  await pool.query('SELECT 1')
```

```ts
app.listen(env.port, (error) => {
```

- `await` confirms the database is reachable before the server accepts requests.
- `listen` starts the server. The callback runs when it's ready, or receives an error, for example if the port is taken.

**File:** [backend/src/services/authService.ts](../../backend/src/services/authService.ts)

```ts
const passwordHash = await bcrypt.hash(password, SALT_ROUNDS)
```

- Hashing is deliberately slow. The async version runs it off the main thread, so other requests aren't held up.

### 4. Why We Used It

The same language on both sides means less to learn, and types can match. Support APIs mostly wait on databases and networks, which is exactly what Node's non-blocking model handles well.

### 5. Real-Time Scenario

Fifty agents load their ticket lists at once. Node starts each request, and while waiting on the database it keeps accepting others. It doesn't need a thread for each person. As results arrive, the event loop finishes each response.

### 6. Interview Questions

- **Theory:** What is Node.js?
- **Theory:** Is Node.js single-threaded? How does it handle many requests?
- **Theory:** What kind of work is Node bad at?
- **Practical:** Where do you use async code in your backend?
- **Practical:** Why did you use the async version of bcrypt?

### 7. Project-Based Answers

**What is Node.js?**
A runtime that runs JavaScript outside the browser, built on Chrome's V8 engine. MiniDesk's API runs on it.

**Is it single-threaded?**
My JavaScript runs on one thread, but Node uses a thread pool and the operating system for I/O. So it handles many connections by not waiting on each one.

**What is it bad at?**
Long CPU-heavy work, which blocks the event loop and delays everyone. That's why I `await bcrypt.hash` instead of using the sync version during requests.

**Where do you use async code?**
All my controllers and services are `async`, because they wait on database queries. I also use it at startup, to check the database connection.

**Why async bcrypt?**
Hashing takes real time. `hash` runs it off the main thread, so other requests continue. The one exception is `hashSync` at startup for a dummy hash, when no requests are being served yet.

### 8. Follow-up Questions

- **What's the difference between `process.nextTick`, Promises and `setTimeout`?** `nextTick` and Promise callbacks run before the event loop moves on, and timers run in a later phase.
- **How would you handle CPU-heavy work?** Use worker threads or a separate service.
- **How would you use multiple CPU cores?** Run several Node processes, using cluster mode or containers behind a load balancer.

---

## REST APIs and Status Codes

### 1. Concept Explanation

REST is a style of API where URLs name **resources** and HTTP methods say what to do with them. Each request is independent and carries everything the server needs.

| Method | Meaning | Example |
|---|---|---|
| GET | Read | `GET /api/tickets` |
| POST | Create | `POST /api/tickets` |
| PUT | Update | `PUT /api/tickets/1006` |
| DELETE | Delete | `DELETE /api/tickets/1006` |

Status codes report the result: 2xx for success, 4xx for a client mistake, and 5xx for a server problem.

### 2. Project Implementation

MiniDesk has endpoints for auth, tickets, comments, dashboard and users. Successful responses use `{ data }`, and errors use `{ error }`. See [the API documentation](../API_DOCUMENTATION.md).

### 3. Code Reference

**File:** [backend/src/routes/ticketRoutes.ts](../../backend/src/routes/ticketRoutes.ts)

```ts
ticketRoutes.get('/', ticketController.listTickets)
ticketRoutes.get('/:id', ticketController.getTicket)
ticketRoutes.get('/:id/comments', commentController.listComments)
```

- Comments are nested under a ticket, because they belong to one.

**File:** [backend/src/controllers/ticketController.ts](../../backend/src/controllers/ticketController.ts)

```ts
res.status(201).json({ data: ticket })
```

```ts
res.status(204).send() // 204 means "done, and there's nothing to send back"
```

### 4. Why We Used It

REST is the standard most developers and tools expect, so the API is predictable. Clear status codes let the frontend handle each case correctly, such as sending someone to login on a 401.

### 5. Real-Time Scenario

A customer creates a ticket. The frontend sends `POST /api/tickets` with a JSON body and a token. The server responds `201` with the new ticket. If the title is too short, it responds `400` with an error for that field. If the customer's session has expired, it responds `401`.

### 6. Interview Questions

- **Theory:** What is REST?
- **Theory:** What's the difference between PUT and PATCH?
- **Theory:** What's the difference between 401 and 403?
- **Practical:** How did you design your API's responses?
- **Practical:** How did you implement pagination?

### 7. Project-Based Answers

**What is REST?**
A style where URLs identify resources, and HTTP methods act on them. It's stateless, so each request carries its own credentials. My API has no server sessions: each request sends its JWT.

**PUT versus PATCH?**
Strictly, PUT replaces a whole resource, and PATCH changes part of it. My `PUT /api/tickets/:id` actually accepts partial changes, so it behaves like PATCH. I kept PUT because the project's API specification asked for it, and PATCH would be more correct.

**401 versus 403?**
401 means "I don't know who you are". 403 means "I know who you are, and you can't do this". A missing token gets 401. A customer listing users gets 403.

**How did you design the responses?**
One consistent shape: `{ data }` on success and `{ error: { message, details } }` on failure. The frontend always knows where to look.

**How did you implement pagination?**
The client sends `page` and `limit`. The response includes `items`, `page`, `totalPages` and `totalItems`. The limit is capped at 100, so nobody can request everything at once.

### 8. Follow-up Questions

- **Is your API idempotent?** GET, PUT and DELETE have the same end state if repeated, though a repeat DELETE returns 404. POST isn't, because it creates a new ticket each time.
- **Why return 404 rather than 403 for another customer's ticket?** 403 would confirm that the ticket exists.
- **How would you version the API?** A prefix like `/api/v1`, so old clients keep working when things change.

---

## Express: Routes, Controllers and Services

### 1. Concept Explanation

Express is a small framework for building Node web servers. A **route** connects a method and URL to code. A common structure splits the work into layers:

| Layer | Job | Knows about HTTP? |
|---|---|---|
| **Routes** | Which code handles which URL | Yes |
| **Controllers** | Read the request, send the response | Yes |
| **Services** | Business rules and data | No |

### 2. Project Implementation

`app.ts` builds the app and mounts routers, and `server.ts` starts it. Each resource has its own route, controller and service file.

### 3. Code Reference

**File:** [backend/src/app.ts](../../backend/src/app.ts)

```ts
app.use('/api/tickets', ticketRoutes)
```

- Every route in `ticketRoutes` is mounted under this path.

**File:** [backend/src/controllers/ticketController.ts](../../backend/src/controllers/ticketController.ts)

```ts
export const getTicket: RequestHandler = async (req, res) => {
  const ticket = await ticketService.getTicket(getCurrentUser(req), parseId(req.params.id))
  res.json({ data: ticket })
}
```

- The controller reads the request, calls the service, and sends the response. It contains no rules.

**File:** [backend/src/services/ticketService.ts](../../backend/src/services/ticketService.ts)

```ts
export async function getTicket(user: PublicUser, ticketId: number): Promise<Ticket> {
  return requireVisibleTicket(user, ticketId)
}
```

- The service takes plain values and knows nothing about HTTP, so it's easy to test and reuse.

### 4. Why We Used It

Putting everything in route handlers quickly becomes unmanageable. Layers paid off in practice: the move from temporary in-memory data to PostgreSQL only changed services, and the routes and controllers stayed as they were. Separating `app.ts` from `server.ts` also lets tests import the app without starting a real server.

### 5. Real-Time Scenario

An agent opens ticket 1006:

1. `GET /api/tickets/1006` matches the route.
2. `authenticate` identifies the agent.
3. The controller converts `"1006"` to a number and calls the service.
4. The service checks access and finds the ticket.
5. The controller sends it back as JSON.

### 6. Interview Questions

- **Theory:** What is Express?
- **Theory:** What's the difference between a controller and a service?
- **Theory:** What changed in Express 5?
- **Practical:** How did you structure your backend?
- **Practical:** Why are `app.ts` and `server.ts` separate?

### 7. Project-Based Answers

**What is Express?**
A minimal Node framework for routing and middleware. I use it to build MiniDesk's REST API.

**Controller versus service?**
Controllers handle HTTP: reading the request and setting status codes. Services hold the rules, such as who may edit a ticket, and don't know about HTTP.

**What changed in Express 5?**
The change that matters most here is that rejected Promises from async handlers go to the error handler automatically. So my controllers don't need `try`/`catch` around each one. I tested that a thrown error in an async handler really does reach it.

**How did you structure your backend?**
In layers: `routes`, `middleware`, `controllers`, `services`, plus `config` and `utils`. A request flows through them in that order.

**Why separate `app.ts` and `server.ts`?**
`app.ts` builds the app and `server.ts` starts it. Tests can import the app without opening a port.

### 8. Follow-up Questions

- **Why does `parseId` exist?** URL parameters are always text, and clients can send anything, so IDs are converted and checked.
- **Where do you use `try`/`catch` then?** Where I want to handle a specific failure, such as `jwt.verify` in `authenticate`.
- **Why not a bigger framework like NestJS?** Express keeps every step visible, which suits learning and a project this size.

---

## Middleware

### 1. Concept Explanation

Middleware is a function that runs during a request, before the final handler. It receives `req`, `res` and `next`, and can do one of three things: send a response, change the request, or call `next()` to continue.

```
Request -> json parser -> authenticate -> authorize -> validate -> controller -> Response
```

Order matters, because they run in the order they're added.

### 2. Project Implementation

| Middleware | File | Job |
|---|---|---|
| `cors` | `app.ts` | Allows the frontend's origin |
| `express.json` | `app.ts` | Parses JSON bodies |
| `authenticate` | `authenticate.ts` | Identifies the user from the token |
| `authorize` | `authorize.ts` | Checks the user's role |
| `validateBody` | `validate.ts` | Checks and cleans the body |
| `notFoundHandler`, `errorHandler` | `errorHandler.ts` | Handle unmatched routes and errors |

### 3. Code Reference

**File:** [backend/src/routes/ticketRoutes.ts](../../backend/src/routes/ticketRoutes.ts)

```ts
ticketRoutes.use(authenticate)
```

```ts
ticketRoutes.post('/', authorize('customer'), validateBody(validateCreateTicket), ticketController.createTicket)
ticketRoutes.delete('/:id', authorize('admin'), ticketController.deleteTicket)
```

- `use(authenticate)` protects every route below it, so none can forget to require a login.
- Each route then adds what it needs, and these run from left to right.

**File:** [backend/src/middleware/authorize.ts](../../backend/src/middleware/authorize.ts)

```ts
export function authorize(...allowedRoles: UserRole[]): RequestHandler {
  return (req, _res, next) => {
    if (!req.user || !allowedRoles.includes(req.user.role)) {
      next(new AppError(403, 'You don\'t have permission to do that.'))
      return
    }
    next()
  }
}
```

- This is a function that **returns** middleware, so each route can pass its own roles.
- `next(error)` skips to the error handler, and `next()` continues.

**File:** [backend/src/app.ts](../../backend/src/app.ts)

```ts
app.use(notFoundHandler)
app.use(errorHandler)
```

- These come last, so they only run for what nothing else handled.

### 4. Why We Used It

Without middleware, every controller would repeat the same login and permission checks, and forgetting one would create a security hole. Middleware applies them once, and each controller can assume a verified user and clean data.

### 5. Real-Time Scenario

A customer tries to delete a ticket:

1. `express.json` runs.
2. `authenticate` verifies the token and sets `req.user`.
3. `authorize('admin')` sees the role is `customer`, and calls `next` with a 403 error.
4. The controller never runs, and `errorHandler` sends the response.

### 6. Interview Questions

- **Theory:** What is middleware in Express?
- **Theory:** What does `next()` do? What about `next(error)`?
- **Theory:** Why does middleware order matter?
- **Practical:** Where have you used middleware in your backend?
- **Practical:** Have you written your own middleware?

### 7. Project-Based Answers

**What is middleware?**
A function that runs between receiving a request and sending a response, with access to `req`, `res` and `next`. It's used for shared concerns like authentication.

**What does `next()` do?**
`next()` passes control to the next function. `next(error)` skips to the error handler. If a function does neither and sends no response, the request hangs.

**Why does order matter?**
They run in order. `authenticate` must run before `authorize`, because `authorize` reads `req.user`. And `errorHandler` must be last.

**Where have you used it?**
For JSON parsing and CORS across the app, for authentication and role checks on protected routes, for validating request bodies, and for centralized error handling.

**Have you written your own?**
Yes: `authenticate`, `authorize`, `validateBody` and the error handlers. `authorize` and `validateBody` are functions that return middleware, so each route can configure them.

### 8. Follow-up Questions

- **How does Express recognize error middleware?** By its four parameters. That's why `errorHandler` keeps an unused `_next`.
- **How does `req.user` reach the controller?** `authenticate` sets it on the same request object, and I teach TypeScript about it in `express.d.ts`.
- **What happens if you call `next()` after sending a response?** Later code may try to respond again, causing an error. That's why I `return` right after.

---

## Centralized Error Handling

### 1. Concept Explanation

Instead of handling errors in every route, code throws an error and one function turns all errors into responses. It's important to separate:

- **Expected errors**, such as "not found", which the client should hear about.
- **Unexpected errors**, meaning bugs, which should be logged but kept from the client, because details help attackers.

### 2. Project Implementation

`AppError` marks expected errors with a status code. `errorHandler` handles everything. `notFoundHandler` handles unknown URLs.

### 3. Code Reference

**File:** [backend/src/utils/AppError.ts](../../backend/src/utils/AppError.ts)

```ts
export class AppError extends Error {
  statusCode: number
```

**File:** [backend/src/middleware/errorHandler.ts](../../backend/src/middleware/errorHandler.ts)

```ts
if (error instanceof AppError) {
  res.status(error.statusCode).json({ error: { message: error.message, details: error.details } })
  return
}
```

```ts
console.error(error)
res.status(500).json({ error: { message: 'Something went wrong. Please try again.' } })
```

- `AppError` messages are written for clients, so they're safe to send.
- Anything else is a bug: full details go to the server's log, and the client gets a generic message.

**File:** [backend/src/services/ticketService.ts](../../backend/src/services/ticketService.ts)

```ts
throw new AppError(404, 'We couldn\'t find that ticket.')
```

### 4. Why We Used It

All errors get the same shape, so the frontend handles them one way. Services can simply throw, no matter how deep they are. And a database error can't leak table names or passwords to a client.

### 5. Real-Time Scenario

A bug throws an error containing internal details while loading tickets. Express 5 passes it to `errorHandler`. The details are written to the server log for developers, and the user sees "Something went wrong." A test confirmed that a thrown error containing fake secret text never appears in the response.

### 6. Interview Questions

- **Theory:** Why centralize error handling?
- **Theory:** What's the difference between operational errors and programmer errors?
- **Practical:** How do you handle errors in your API?
- **Practical:** How do you stop internal details from leaking?

### 7. Project-Based Answers

**Why centralize it?**
Consistency and safety. There's one place that decides what clients see, and services only need to throw.

**Operational versus programmer errors?**
Operational errors are expected, like invalid input or a missing ticket. Programmer errors are bugs. I use `AppError` for the first kind, and everything else gets a generic 500.

**How do you handle errors?**
Services throw `AppError` with a status code. Express 5 forwards rejected async handlers to my error handler, which formats them as `{ error: { message, details } }`.

**How do you stop leaks?**
Only `AppError` messages reach clients. Everything else is logged on the server and replaced with a generic message. I tested that with both sync and async errors containing fake secrets.

### 8. Follow-up Questions

- **What happens with broken JSON?** The body parser raises a 400 error, which my handler returns with a generic message, without any parser details.
- **What would you use instead of `console.error` in production?** A logging library and an error monitoring service.
- **Should the server crash on an unexpected error?** A failed request shouldn't crash it. Truly unrecoverable errors at process level are usually logged, and the process restarted.

---

## Input Validation

### 1. Concept Explanation

Never trust data from clients. Even with frontend validation, anyone can send any request directly. Server-side validation checks types, lengths and allowed values. **Allow-listing** builds a new object with only known fields, which prevents **mass assignment**, where extra fields like `role` slip through.

### 2. Project Implementation

`utils/validators.ts` has a function per request type. `validateBody` applies them as middleware. `parseId` and `parseTicketQuery` handle URL values.

### 3. Code Reference

**File:** [backend/src/utils/validators.ts](../../backend/src/utils/validators.ts)

```ts
export type ValidationResult<T> = { ok: true; data: T } | { ok: false; errors: Record<string, string> }
```

```ts
if (password.length < 8 || Buffer.byteLength(password) > 72) errors.password = 'Password must be 8 to 72 characters.'
```

```ts
return { ok: true, data: { name, email, password } }
```

- `ok` lets TypeScript know which shape it's dealing with. This is a discriminated union.
- The returned object contains only the named fields, so a sent `role` is simply dropped.
- bcrypt ignores everything past 72 bytes, so longer passwords are refused rather than silently cut short.

**File:** [backend/src/middleware/validate.ts](../../backend/src/middleware/validate.ts)

```ts
req.body = result.data
```

- Controllers only ever see clean, known fields.

### 4. Why We Used It

Bad input causes bugs, and malicious input causes breaches. I wrote it by hand to see how validation works, though a library like Zod is a reasonable choice on larger projects.

### 5. Real-Time Scenario

An attacker signs up with `{ "name": "Eve", "email": "eve@example.com", "password": "...", "role": "admin" }`. The validator builds a new object with only name, email and password, and the service always sets the role to `customer`. A test confirmed that the new account is a customer.

### 6. Interview Questions

- **Theory:** Why validate on the server if the frontend already does?
- **Theory:** What is mass assignment?
- **Theory:** What is injection, and how do you defend against it?
- **Practical:** How did you implement validation?
- **Practical:** How do you stop someone from signing up as an admin?

### 7. Project-Based Answers

**Why validate on the server?**
Frontend checks only help honest users, because anyone can call the API with Postman. The server is the only place a rule can really be enforced.

**What is mass assignment?**
When a server copies all client fields into a record, letting someone set fields like `role`. My validators build new objects with only allowed fields.

**What is injection?**
When input is treated as code or query syntax. I check types strictly, so objects sent in place of strings are rejected, and parameterized SQL queries stop SQL injection.

**How did you implement validation?**
Validator functions return clean data or field errors, and `validateBody` middleware applies them, returning 400 with errors per field.

**How do you stop an admin sign-up?**
The validator drops any `role` field, and `register` always sets `customer`. Admins and agents come from seed data.

### 8. Follow-up Questions

- **Why trim strings?** So a title of only spaces counts as empty.
- **Why cap `limit` at 100?** To stop one request from asking for everything and straining the server.
- **What's the body size limit?** Express's JSON parser defaults to 100 KB, and my test confirmed larger bodies get 413.

---

## Environment Variables and CORS

### 1. Concept Explanation

**Environment variables** are settings outside the code, such as secrets and ports, which differ by environment. A `.env` file holds them locally and stays out of Git.

**CORS** is a browser rule. A page may only read responses from another origin if that server allows it. A different port counts as a different origin.

### 2. Project Implementation

`config/env.ts` loads and checks settings, and stops startup if any are missing. `.env.example` documents them, and `.env` is ignored by Git. `cors` allows only the frontend's origin.

### 3. Code Reference

**File:** [backend/src/config/env.ts](../../backend/src/config/env.ts)

```ts
if (!value) throw new Error(`Missing environment variable: ${name}. See .env.example.`)
```

```ts
if (jwtSecret.length < 32) {
```

- Failing at startup is much better than failing later on someone's request.

**File:** [backend/src/app.ts](../../backend/src/app.ts)

```ts
app.use(cors({ origin: env.clientOrigin })) // only our frontend may call this API from a browser
```

### 4. Why We Used It

A secret in code ends up in Git history forever. Environment variables keep secrets out, and let each environment use different values without changing code. The frontend and API run on different ports, so CORS has to be configured for them to communicate.

### 5. Real-Time Scenario

The frontend at `localhost:5173` calls the API at `localhost:5000`. The browser checks the response's `Access-Control-Allow-Origin` header, sees that it allows this origin, and lets the page read it. A page on another site making the same call would be blocked by the browser.

### 6. Interview Questions

- **Theory:** Why use environment variables?
- **Theory:** What is CORS, and does it protect your API?
- **Practical:** How do you manage secrets?
- **Practical:** What happens if a secret is missing?

### 7. Project-Based Answers

**Why use them?**
They keep secrets out of code and let settings vary by environment.

**What is CORS?**
A browser rule controlling which origins can read responses. It doesn't protect the API from non-browser tools like Postman, which ignore it, so authentication is still what actually protects it.

**How do you manage secrets?**
In a `.env` file that Git ignores, with `.env.example` documenting what's needed and containing no real values.

**What happens if one is missing?**
The server refuses to start, and names the missing variable. I tested this. It also requires `JWT_SECRET` to be at least 32 characters.

### 8. Follow-up Questions

- **What if a secret gets committed?** Treat it as leaked: change the secret, because deleting it doesn't remove it from Git history.
- **How are secrets handled in production?** The hosting platform or a secrets manager injects them, and no `.env` file is deployed.
- **What is a preflight request?** An `OPTIONS` request browsers send first, for requests like those with an `Authorization` header, to check they're allowed.
