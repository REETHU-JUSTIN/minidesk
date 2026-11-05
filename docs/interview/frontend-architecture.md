# Frontend Architecture

---

## The Service Layer

### 1. Concept Explanation

A service layer is a set of functions that handle getting data. The rest of the app calls those functions, and doesn't know or care how the data is fetched.

```
Component -> Redux thunk -> Service -> Axios -> API
```

### 2. Project Implementation

- **`services/api.ts`:** the configured Axios instance. See [API integration](api-integration.md).
- **`services/ticketService.ts`:** tickets, comments and dashboard stats.
- **`services/authService.ts`:** sign-in, sign-up and sessions.
- **`services/userService.ts`:** the user list.

### 3. Code Reference

**File:** [frontend/src/services/ticketService.ts](../../frontend/src/services/ticketService.ts)

```ts
export async function updateTicket(ticketId: number, changes: UpdateTicketInput): Promise<Ticket> {
  const response = await api.put<ApiResponse<Ticket>>(`/tickets/${ticketId}`, changes)
  return response.data.data
}
```

- Callers get a plain `Ticket`, and never see URLs, Axios or the response wrapper.

**File:** [frontend/src/features/tickets/ticketsSlice.ts](../../frontend/src/features/tickets/ticketsSlice.ts)

```ts
export const createTicket = createAsyncThunk('tickets/create', (input: CreateTicketInput) => ticketService.createTicket(input))
```

- The slice depends on what the function does, not on how it's done.

### 4. Why We Used It

This layer proved itself on this project. The frontend was first built against a temporary in-browser backend, because the plan built the screens before the API. When the real API was ready, I rewrote the service files, and the pages and Redux reducers didn't need to change. Thunks only gained a small change to support cancelling requests.

### 5. Real-Time Scenario

An agent marks a ticket as resolved. The component dispatches a thunk, and the thunk calls `updateTicket`. Only the service knows this means `PUT /tickets/1006`. If the URL changed tomorrow, one line in one file would change.

### 6. Interview Questions

- **Theory:** What is a service layer, and why have one?
- **Theory:** What is separation of concerns?
- **Practical:** How is your frontend structured?
- **Practical:** Why don't your components call Axios directly?

### 7. Project-Based Answers

**What is a service layer?**
Functions that handle data access, so components don't depend on how it's fetched. It makes the data source replaceable and easier to test.

**What is separation of concerns?**
Each part has one job. My components display things, slices manage state, and services get data.

**How is your frontend structured?**
By job: `pages` for screens, `components` for UI, `features` for Redux slices, `services` for data, `hooks` for shared logic, and `context` for auth. Data flows from the API, through services, thunks and the store, into pages.

**Why not call Axios directly?**
The request details would spread across many files, and changing them would mean editing every one. I saw the benefit when I replaced the temporary backend with the real API, because only the service files needed rewriting.

### 8. Follow-up Questions

- **How does this help testing?** Tests can replace a service with a fake, so a component can be tested without a server.
- **Why do some components call services directly instead of through Redux?** Comments and the user list are only used in one place, so local state is simpler.
- **Would you do anything differently on a larger project?** I'd consider RTK Query or TanStack Query, which handle caching and request state for you.
