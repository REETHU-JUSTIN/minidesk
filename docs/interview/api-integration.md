# API Integration

---

## Axios and Interceptors

### 1. Concept Explanation

Axios is a library for making HTTP requests from JavaScript. Compared with the browser's built-in `fetch`, it converts JSON automatically, rejects on 4xx and 5xx responses, and supports **interceptors**.

An interceptor is a function that runs on every request or response. It's like middleware for your HTTP client, so shared behavior goes in one place.

### 2. Project Implementation

`services/api.ts` creates one configured Axios instance with two interceptors:

- **Request:** attaches the login token.
- **Response:** turns every failure into a readable message, and handles expired sessions.

All services use this instance.

### 3. Code Reference

**File:** [frontend/src/services/api.ts](../../frontend/src/services/api.ts)

```ts
export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? 'http://localhost:5000/api',
  timeout: 15000,
})
```

```ts
api.interceptors.request.use((config) => {
  const token = getToken()
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})
```

```ts
if (error.response?.status === 401 && sentCurrentToken) {
  clearToken()
  onSessionExpired?.()
}
```

- The address comes from an environment variable, so it can change per environment.
- No service has to remember to send the token.
- `sentCurrentToken` means a wrong password on the login page doesn't count as an expired session, because login sends no token.

```ts
if (!error.response) return 'We can\'t reach the server. Please check your connection and try again.'
```

- With no response at all, the server couldn't be reached.

### 4. Why We Used It

Without interceptors, every service function would repeat the token header and the error handling, and forgetting one would be a bug. Having it all in one place also means that when a session expires on any request, the user is signed out the same way.

### 5. Real-Time Scenario

An agent's token expires while they work. They click **All Tickets**:

1. The request interceptor attaches the expired token.
2. The API responds with a 401.
3. The response interceptor clears the token and calls the handler registered by `AuthProvider`.
4. `AuthProvider` sets the user to `null`, and Redux clears its data.
5. `ProtectedRoute` sends them to login, remembering `/tickets`.
6. After signing in, they return to `/tickets`.

A browser test does exactly this by replacing the token with an invalid one mid-session.

### 6. Interview Questions

- **Theory:** What is Axios, and how does it differ from `fetch`?
- **Theory:** What is an interceptor?
- **Practical:** How did you implement API calls in your frontend?
- **Practical:** How do you attach the JWT to requests?
- **Practical:** How do you handle an expired token?

### 7. Project-Based Answers

**Axios versus `fetch`?**
`fetch` is built in, but only rejects on network failure, so you must check `response.ok` and parse JSON yourself. Axios rejects on 4xx and 5xx, parses JSON and supports interceptors, which is why I used it.

**What is an interceptor?**
A function that runs on every request or response. It's similar to Express middleware, but on the client side.

**How did you implement API calls?**
With one Axios instance in `api.ts`, and service files on top of it, such as `getTickets`. Redux thunks and components call the services, never Axios directly.

**How do you attach the JWT?**
A request interceptor reads it from `localStorage` and sets the `Authorization` header on every request.

**How do you handle an expired token?**
The response interceptor sees a 401 on a request that sent the current token. It clears the token, and calls a handler that `AuthProvider` registered. That signs the user out, and `ProtectedRoute` sends them to login.

### 8. Follow-up Questions

- **Why does `AuthProvider` register a handler rather than `api.ts` calling it directly?** `api.ts` is plain JavaScript and can't use Hooks or React state. A registered function connects them without `api.ts` depending on React.
- **Why check for the current token?** So a late 401 from an old token can't sign out someone who has already signed back in.
- **What would you add for production?** Short-lived tokens with automatic refresh, and retry logic for temporary failures.

---

## Frontend and Backend Working Together

### 1. Concept Explanation

The frontend and backend are separate programs that communicate over HTTP using JSON. To work together, they must agree on a **contract**: URLs, data shapes, status codes and error formats. TypeScript types can describe that contract on both sides, but they only check each side's own code.

### 2. Project Implementation

- **Contract:** `docs/API_DOCUMENTATION.md`.
- **Shape:** `{ data }` for success and `{ error }` for failure.
- **Types:** matching shapes in `frontend/src/types` and `backend/src/types`.
- **Field names:** SQL aliases turn `customer_id` into `customerId`.
- **Validation:** rules on both sides, with the server's being the real ones.
- **CORS:** the API allows the frontend's origin.

### 3. Code Reference

**File:** [frontend/src/services/ticketService.ts](../../frontend/src/services/ticketService.ts)

```ts
export async function getTickets(query: TicketQuery, signal?: AbortSignal): Promise<PaginatedResponse<Ticket>> {
  const response = await api.get<ApiResponse<PaginatedResponse<Ticket>>>('/tickets', { params: query, signal })
  return response.data.data
}
```

- `params` turns the query object into `?status=open&page=2`.
- `response.data` is the body from Axios, and `.data` is the API's own wrapper.
- The generic says what we expect back. It isn't checked at runtime.

**File:** [frontend/src/features/tickets/ticketsSlice.ts](../../frontend/src/features/tickets/ticketsSlice.ts)

```ts
export const fetchTickets = createAsyncThunk('tickets/fetchList', (query: TicketQuery, { signal }) => ticketService.getTickets(query, signal))
```

- `signal` connects `request.abort()` in a component to the real HTTP request.

### 4. Why We Used It

Separating them means each can be developed and deployed independently. In fact, the frontend was built against a temporary backend first, and the swap mostly meant rewriting the service files, while the pages and Redux reducers stayed as they were.

### 5. Real-Time Scenario

A customer filters by **Open**:

1. `TicketList` dispatches `fetchTickets`.
2. The thunk calls `getTickets`, and Axios adds the token.
3. Express runs `authenticate`, then the controller and service.
4. The SQL includes `customer_id` and `status` conditions.
5. Rows go back as JSON, and the reducer stores them.
6. The table re-renders.

### 6. Interview Questions

- **Theory:** What happens from when a user clicks a button to when data appears on screen?
- **Theory:** What is CORS, and why did you need it?
- **Practical:** How does your frontend communicate with your backend?
- **Practical:** How do you keep the frontend and backend in agreement?
- **Practical:** What was difficult about connecting them?

### 7. Project-Based Answers

**From click to screen?**
A click dispatches a Redux thunk, which calls a service. Axios sends an HTTP request with the JWT. Express runs middleware, then a controller and service, which runs parameterized SQL. The JSON response is stored by a reducer, and React re-renders the components selecting that data.

**What is CORS, and why did you need it?**
Browsers stop a page from reading responses from another origin unless the server allows it. My frontend and API run on different ports, so the API allows the frontend's origin.

**How do they communicate?**
Over REST, using JSON. Services call the API through one Axios instance.

**How do you keep them in agreement?**
A documented contract and matching types on each side. They could drift, because nothing checks them against each other at runtime. Sharing a types package or generating types from an API spec would be the stricter approach.

**What was difficult?**
Handling failures properly: expired sessions, unreachable servers and out-of-order responses. I also made sure a failed comment keeps the user's text, and that 7 keystrokes send only one search request.

### 8. Follow-up Questions

- **How do you stop slow responses from overwriting newer ones?** The effect's cleanup aborts the old request. I tested this by delaying one request in the browser and confirming that it was cancelled.
- **Why is the token sent in a header rather than a cookie?** It demonstrates interceptors, and avoids CSRF, but `localStorage` is exposed to XSS. A stricter app might use `httpOnly` cookies.
- **Is there anything secret in the frontend?** It mustn't have any, because all frontend code is public. I scanned the production build, and it contains no secrets.
