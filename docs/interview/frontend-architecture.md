# Frontend Architecture

---

## The Service Layer

### 1. Concept Explanation

A service layer is a set of functions that handle getting data. The rest of the app calls those functions, and doesn't know or care where the data comes from.

```
Component -> Redux thunk -> Service -> Data source
```

### 2. Project Implementation

- **`services/ticketService.ts`:** tickets, comments and dashboard stats.
- **`services/authService.ts`:** sign-in, sign-up and sessions.
- **`services/userService.ts`:** the user list.
- **`services/previewBackend.ts`:** a temporary stand-in for the server, deleted in Phase 7.

### 3. Code Reference

**File:** [frontend/src/services/ticketService.ts](../../frontend/src/services/ticketService.ts)

```ts
export function getTickets(query: TicketQuery): Promise<PaginatedResponse<Ticket>> {
  return listTickets(query)
}
```

- The return type is a Promise, just like a real request. In Phase 7, only the body of this function changes to an Axios call.

**File:** [frontend/src/services/previewBackend.ts](../../frontend/src/services/previewBackend.ts)

```ts
if (!ticket || (user.role === 'customer' && ticket.customerId !== user.id)) {
```

- A customer gets the same result for someone else's ticket as for a missing one, so they can't find out which ticket numbers exist.

### 4. Why We Used It

Your phase plan builds the frontend before the API. This layer lets the app be built properly now, with real async behavior, loading and errors. When the API arrives, the components and slices shouldn't need to change. It also makes testing easier, because tests can replace a service.

### 5. Real-Time Scenario

An agent loads tickets. The page dispatches a thunk, and the thunk calls `getTickets`. Today, that waits 300ms and returns data from memory. After Phase 7, it will send an HTTP request with a login token, and the page won't know the difference.

### 6. Interview Questions

- **Theory:** What is a service layer, and why have one?
- **Theory:** What is separation of concerns?
- **Practical:** How is your frontend structured?
- **Practical:** How does your app connect to its data?

### 7. Project-Based Answers

**What is a service layer?**
Functions that handle data access, so components don't depend on how it's fetched. It makes the data source replaceable.

**What is separation of concerns?**
Each part has one job. My components display things, slices manage state, and services get data.

**How is your frontend structured?**
By job: `pages` for screens, `components` for UI, `features` for Redux slices, `services` for data, `hooks` for shared logic, and `context` for auth. Data flows from services, through thunks and the store, into pages.

**How does your app connect to its data?**
Currently through service files that call a temporary in-browser backend, which simulates network delay and enforces role rules. It doesn't check passwords, and it resets on reload. Phase 7 replaces it with Axios calls to the Express API.

### 8. Follow-up Questions

- **Why does the temporary backend enforce role rules?** So the frontend is built to handle errors and "not found" responses as it will with a real server.
- **Why does a customer get "not found" rather than "forbidden"?** "Forbidden" would confirm that the ticket exists.
- **Why don't components call Axios directly?** The request details would spread across many files, and changing them would mean editing every one.
