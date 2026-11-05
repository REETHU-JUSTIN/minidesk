# Redux Toolkit

---

## Store and Slices

### 1. Concept Explanation

Redux keeps shared state in one place, called the **store**. Components don't change it directly. They dispatch **actions** describing what happened, and **reducers** calculate the new state.

Redux Toolkit is the official, simpler way to write Redux. A **slice** groups a feature's state and reducers.

### 2. Project Implementation

- **`store/store.ts`:** creates the store.
- **`features/tickets/ticketsSlice.ts`:** the ticket list and selected ticket.
- **`features/dashboard/dashboardSlice.ts`:** stats and recent tickets.
- **`store/actions.ts`:** the logout action both slices listen for.
- **`main.tsx`:** provides the store to the app.

### 3. Code Reference

**File:** [frontend/src/store/store.ts](../../frontend/src/store/store.ts)

```ts
export const store = configureStore({
  reducer: {
    tickets: ticketsReducer,
    dashboard: dashboardReducer,
  },
})
```

- Each key becomes part of the state, so tickets are at `state.tickets`.

**File:** [frontend/src/features/tickets/ticketsSlice.ts](../../frontend/src/features/tickets/ticketsSlice.ts)

```ts
const ticketsSlice = createSlice({
  name: 'tickets',
  initialState,
```

```ts
.addCase(fetchTickets.pending, (state) => {
  state.listStatus = 'loading'
  state.listError = null
})
```

```ts
.addCase(userLoggedOut, () => initialState)
```

- These lines look like they change state directly. Immer, built into Redux Toolkit, turns them into a safe, immutable update.
- Returning `initialState` replaces the whole slice, clearing it on logout.

### 4. Why We Used It

Tickets are used by several pages, and have loading and error states that need careful handling. Keeping them in one store means an update on the details page also applies to the list. Redux Toolkit removes the boilerplate of older Redux.

### 5. Real-Time Scenario

An agent marks a ticket **Resolved**:

1. `TicketDetails` dispatches `updateTicket`.
2. The thunk calls the service.
3. On success, `fulfilled` is dispatched with the updated ticket.
4. The reducer updates `selectedTicket` and that ticket in `items`.
5. The page re-renders with the new status, and the list is already up to date.

### 6. Interview Questions

- **Theory:** Explain the Redux data flow.
- **Theory:** What is a reducer, and what must it never do?
- **Theory:** How can Toolkit reducers appear to change state directly?
- **Practical:** How have you implemented Redux Toolkit in your application?
- **Practical:** Why clear Redux state on logout?

### 7. Project-Based Answers

**Explain the data flow.**
A component dispatches an action, reducers calculate new state, the store saves it, and components selecting that data re-render. It goes one way, which makes changes easy to trace.

**What is a reducer?**
A pure function taking state and an action, and returning new state. It must not call APIs, use random values, or change its inputs. Side effects belong in thunks.

**How can they appear to change state?**
They use Immer. I write to a draft, and Immer produces a new immutable object from those changes. It only works inside `createSlice` and `createReducer`.

**How have you implemented Redux Toolkit?**
I created a store with two slices, tickets and dashboard. Each has async thunks that call a service layer, and reducers that track loading, success and failure. Pages dispatch thunks in effects, and read state with a typed `useAppSelector`. Comments stay local, because only one component needs them.

**Why clear it on logout?**
Redux stays in memory until a reload. Without clearing, the next person on that browser could briefly see the previous user's tickets. Both slices handle a shared `userLoggedOut` action by returning their initial state.

### 8. Follow-up Questions

- **What's the difference between `reducers` and `extraReducers`?** `reducers` defines the slice's own actions. `extraReducers` responds to actions from elsewhere, like thunk results and `userLoggedOut`.
- **Why are your `reducers` empty?** All my state changes come from thunks and the logout action.
- **Should everything serializable go in Redux?** Only shared state. Non-serializable things like class instances don't belong there at all.

---

## Async Thunks

### 1. Concept Explanation

Reducers can't do async work. A **thunk** is where it goes. `createAsyncThunk` wraps an async function, and automatically dispatches three actions:

- **`pending`:** when it starts.
- **`fulfilled`:** on success, with the result.
- **`rejected`:** on failure, with the error.

### 2. Project Implementation

| Thunk | Purpose |
|---|---|
| `fetchTickets` | Load the list |
| `fetchTicketById` | Load one ticket |
| `createTicket` | Create a ticket |
| `updateTicket` | Change a ticket |
| `deleteTicket` | Delete a ticket |
| `fetchDashboard` | Load stats and recent tickets |

### 3. Code Reference

**File:** [frontend/src/features/tickets/ticketsSlice.ts](../../frontend/src/features/tickets/ticketsSlice.ts)

```ts
export const fetchTickets = createAsyncThunk('tickets/fetchList', (query: TicketQuery, { signal }) => ticketService.getTickets(query, signal))
```

```ts
.addCase(fetchTickets.fulfilled, (state, action) => {
  state.listStatus = 'succeeded'
  state.items = action.payload.items
```

- `'tickets/fetchList'` is the prefix for the three action names.
- `action.payload` is whatever the async function returned.
- `signal` lets a component cancel the real HTTP request.

**File:** [frontend/src/pages/CreateTicketPage.tsx](../../frontend/src/pages/CreateTicketPage.tsx)

```tsx
const newTicket = await dispatch(createTicket(values)).unwrap()
```

- A dispatched thunk always resolves, even when it fails. `unwrap()` returns the result, or throws, so `try`/`catch` works.

### 4. Why We Used It

Every request needs the same loading, success and error handling. `createAsyncThunk` generates that structure, so the reducers just describe what each state means, and each page can show a spinner or error reliably.

### 5. Real-Time Scenario

A customer opens My Tickets. `fetchTickets` dispatches `pending`, so the page shows a spinner. The service responds, `fulfilled` is dispatched, and the table appears. If the request fails, `rejected` runs and an error message appears instead.

### 6. Interview Questions

- **Theory:** What is a thunk, and why is it needed?
- **Theory:** What actions does `createAsyncThunk` dispatch?
- **Theory:** What does `unwrap()` do?
- **Practical:** How do you manage loading and error states?
- **Practical:** Walk me through what happens when a ticket is created.

### 7. Project-Based Answers

**What is a thunk?**
A function that runs async logic and dispatches actions. It's needed because reducers must be pure, so API calls can't go in them.

**What does it dispatch?**
`pending`, then `fulfilled` or `rejected`. In `fetchTickets`, those set `listStatus` to loading, succeeded or failed.

**What does `unwrap()` do?**
A dispatched thunk's Promise never rejects by default. `unwrap()` returns the payload, or throws the error. I use it in `CreateTicketPage` to navigate after success.

**How do you manage loading and errors?**
Each slice has a status field and an error field. Pages choose what to display from them. Because `rejected` handles every failure, an error message always appears.

**Walk me through creating a ticket.**
The form validates, then `CreateTicketPage` dispatches `createTicket`. The thunk calls the service, which returns the new ticket. `unwrap` gives me that ticket, and I navigate to its page, which fetches it. On failure, the error shows and the form keeps its values.

### 8. Follow-up Questions

- **Why does the page call `unwrap` while the list doesn't?** The list only needs to display state. Creating a ticket needs to navigate right after, so it needs the result directly.
- **How would you send server validation errors to the UI?** With `rejectWithValue` in the thunk, which passes structured errors to `rejected`.
- **What's RTK Query?** Redux Toolkit's data-fetching tool. It handles caching and de-duplication, and would replace these hand-written thunks in a larger app.

---

## Reading and Dispatching: Typed Hooks

### 1. Concept Explanation

- **`useSelector`** reads a value from the store, and re-renders the component when that value changes.
- **`useDispatch`** returns the function that sends actions.

Redux recommends creating typed versions, so TypeScript knows the shape of your state.

### 2. Project Implementation

`useAppSelector` and `useAppDispatch` are defined once in `store/hooks.ts`, and used by the pages and `AuthProvider`.

### 3. Code Reference

**File:** [frontend/src/store/hooks.ts](../../frontend/src/store/hooks.ts)

```ts
export const useAppDispatch = useDispatch.withTypes<AppDispatch>()
export const useAppSelector = useSelector.withTypes<RootState>()
```

**File:** [frontend/src/pages/DashboardPage.tsx](../../frontend/src/pages/DashboardPage.tsx)

```tsx
const dispatch = useAppDispatch()
const { stats, recentTickets, status, error } = useAppSelector((state) => state.dashboard)
```

- `state.dashboard` is fully typed, so a typo in a field name is a compile error.

### 4. Why We Used It

Typing these once means no component needs to repeat the types. It also makes thunks work properly with `dispatch`, including `.abort()` and `.unwrap()`.

### 5. Real-Time Scenario

The dashboard opens and dispatches `fetchDashboard`. When the data arrives, the store changes, and `useAppSelector` sees that `state.dashboard` is different and re-renders the page. A component that only reads `state.tickets` isn't affected by this.

### 6. Interview Questions

- **Theory:** What do `useSelector` and `useDispatch` do?
- **Theory:** How does `useSelector` decide to re-render?
- **Practical:** How did you make Redux type-safe?

### 7. Project-Based Answers

**What do they do?**
`useSelector` reads store data and subscribes to changes. `useDispatch` returns the function to send actions.

**How does it decide to re-render?**
It compares the selected value by reference with its previous value. So I select the part I need. If a selector built a new object each time, it would re-render every time.

**How did you make it type-safe?**
I took `RootState` and `AppDispatch` from the store, then created `useAppSelector` and `useAppDispatch` with `withTypes` in one file.

### 8. Follow-up Questions

- **What is `createSelector`?** It memoizes derived data, so calculated values aren't recomputed unnecessarily. MiniDesk doesn't need it yet.
- **Is selecting a whole slice a problem?** The component re-renders on any change to that slice. It's fine for pages that use most of it, like mine.
- **How would you read Redux state outside a component?** With `store.getState()`, though Hooks are preferred in components.

---

## Race Conditions and Cancelling Requests

### 1. Concept Explanation

A race condition is a bug that depends on timing. Responses can arrive in a different order from their requests, so an older response can overwrite newer data. The fix is to cancel or ignore the old request.

### 2. Project Implementation

- **Redux pages:** `request.abort()` in the effect's cleanup, and reducers ignore aborted requests.
- **Local state components:** an `isCancelled` flag.

### 3. Code Reference

**File:** [frontend/src/pages/TicketListPage.tsx](../../frontend/src/pages/TicketListPage.tsx)

```tsx
const request = dispatch(fetchTickets({ scope, search: debouncedSearch, status, priority, page, limit: PAGE_SIZE }))
return () => request.abort()
```

**File:** [frontend/src/features/tickets/ticketsSlice.ts](../../frontend/src/features/tickets/ticketsSlice.ts)

```ts
.addCase(fetchTickets.rejected, (state, action) => {
  if (action.meta.aborted) return
```

- Aborted thunks still dispatch `rejected`. Cancelling on purpose isn't an error, so this skips it. Without the check, a replaced request would show an error.

### 4. Why We Used It

Search and pagination fire requests quickly. Without this, a user could see page 2's rows labeled as page 1, a confusing bug that's hard to reproduce because it depends on network speed.

### 5. Real-Time Scenario

An agent clicks **Next**, then picks a filter straight away. The page 2 request is aborted, and the new one is sent. Even if the page 2 response would have been slower, only the newest result is applied. A browser test delays that older request on purpose, and confirms it's cancelled and can't overwrite the newer rows.

### 6. Interview Questions

- **Theory:** What is a race condition in data fetching?
- **Theory:** What ways are there to prevent it?
- **Practical:** How did you handle it in your project?
- **Practical:** How did you test it?

### 7. Project-Based Answers

**What is a race condition?**
When the result depends on timing. Here, an older response arriving after a newer one and overwriting it.

**What ways are there to prevent it?**
Cancelling old requests, ignoring them with a flag or request ID, or using a data-fetching library that handles it.

**How did you handle it?**
My effect's cleanup calls `request.abort()`, so changing a filter cancels the previous request. The reducer ignores aborted rejections, so they don't show as errors. In local-state components, I use an `isCancelled` flag.

**How did you test it?**
A browser test delays an older request by over a second, then changes the filter. It checks that the request was cancelled, and that the rows match the newest request.

### 8. Follow-up Questions

- **Does `abort` really stop the network request?** Yes, because the thunk passes its `signal` to Axios. Without that, the abort would only stop the result being used. A browser test confirmed the request is really cancelled.
- **How do debouncing and this work together?** Debouncing reduces how many requests start, while cancellation handles those that overlap anyway.
- **Why use a flag in some components?** They don't use Redux thunks, so there's no `abort` available. A flag is the simple equivalent.
