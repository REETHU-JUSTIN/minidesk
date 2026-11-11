# Testing

---

## Testing Fundamentals

### 1. Concept Explanation

Automated tests run code and check the results, so mistakes get caught before users find them. The main types are:

| Type | What it tests | Speed |
|---|---|---|
| **Unit** | One function by itself | Fastest |
| **Integration** | Several parts working together | Medium |
| **End-to-end** | The whole app, through a browser | Slowest |

Most tests follow three steps: **Arrange** the setup, **Act** by doing the thing, and **Assert** by checking the result.

### 2. Project Implementation

| Tool | Type | Where |
|---|---|---|
| Vitest | Test runner for everything | Both apps |
| Vitest alone | Unit | `validators.test.js`, `ticketsSlice.test.js` |
| React Testing Library | Component | `frontend/src/**/*.test.jsx` |
| Supertest | API integration | `backend/tests/` |
| Postman | Manual and scripted API checks | `docs/MiniDesk.postman_collection.json` |

The repository has 176 automated tests: 62 frontend and 114 backend. There's no end-to-end suite in the repository. I checked the full stack with one-off browser scripts during development.

### 3. Code Reference

**File:** [backend/tests/validators.test.js](../../backend/tests/validators.test.js)

```js
it('trims the message', () => {
  expect(validateComment({ message: '  Hello  ' })).toEqual({ ok: true, data: { message: 'Hello' } })
})
```

- A unit test on a plain function needs no server or database.

**File:** [frontend/src/features/tickets/ticketsSlice.test.js](../../frontend/src/features/tickets/ticketsSlice.test.js)

```js
const state = reducer(initialState, fetchTickets.rejected(new Error('Server error'), 'request-1', query))

expect(state.listStatus).toBe('failed')
expect(state.listError).toBe('Server error')
```

- Reducers are pure functions, so testing one needs no store or component.

### 4. Why We Used It

Each change could break something elsewhere, and checking every role by hand after each change isn't realistic. Tests also let me change code with confidence, and they document how things should behave.

### 5. Real-Time Scenario

A developer refactors the ticket query and accidentally removes the customer filter, so customers could see everyone's tickets. The moment `npm test` runs, `shows customers only their own tickets` fails, and the bug never reaches production.

### 6. Interview Questions

- **Theory:** What's the difference between unit, integration and end-to-end tests?
- **Theory:** What is the test pyramid?
- **Theory:** What does code coverage tell you, and what doesn't it tell you?
- **Practical:** How did you test your project?
- **Practical:** How do you know your tests actually work?

### 7. Project-Based Answers

**What's the difference?**
Unit tests check one function, integration tests check parts working together, and end-to-end tests drive the real app. My validators have unit tests, and my API tests are integration tests that go through Express to a real database.

**What is the test pyramid?**
Many fast unit tests, fewer integration tests, and a few slow end-to-end tests. Mine leans toward integration on the backend, because the riskiest logic, such as permissions in queries, only proves itself against a real database.

**What does coverage tell you?**
Which lines ran, not whether the results were checked. A test can run a line and assert nothing, so coverage can look good while tests prove little.

**How did you test your project?**
With Vitest across both apps, React Testing Library for components, and Supertest for the API against a temporary MongoDB server. I also have a Postman collection.

**How do you know they work?**
I broke the code on purpose in 18 ways, such as removing permission checks and token verification, and the tests caught all 18. A test that can't fail is worthless, so this mattered to me.

### 8. Follow-up Questions

- **What is TDD?** Writing a failing test first, then the code to pass it. I wrote my tests after the code, then proved them by breaking things.
- **What would you add next?** A permanent end-to-end suite with Playwright, and running tests automatically in CI.
- **How do you avoid flaky tests?** Reset data between tests, wait for results rather than fixed delays, and avoid sharing state. I ran the suites repeatedly to check.

---

## React Testing Library

### 1. Concept Explanation

React Testing Library tests components the way people use them. You find elements by their role or label, interact with them, and check what appears on screen, rather than checking internal state. If you refactor the internals but the behavior stays the same, the tests still pass.

### 2. Project Implementation

- **`LoginPage.test.jsx`:** validation, sign-in and server errors.
- **`TicketForm.test.jsx`:** validation and trimmed values.
- **`TicketListPage.test.jsx`:** rendering, search, filters and pagination.
- **`ProtectedRoute.test.jsx`:** redirects and role checks.
- **`testUtils.jsx`:** renders components with the providers they need.

### 3. Code Reference

**File:** [frontend/src/pages/LoginPage.test.jsx](../../frontend/src/pages/LoginPage.test.jsx)

```jsx
await user.type(screen.getByLabelText('Email'), 'admin@example.com')
await user.type(screen.getByLabelText('Password'), 'secret-password')
await user.click(screen.getByRole('button', { name: 'Sign in' }))

await waitFor(() => expect(login).toHaveBeenCalledWith({ email: 'admin@example.com', password: 'secret-password' }))
```

- `getByLabelText` only works if the label is connected to the field, so this also checks basic accessibility.
- `userEvent` simulates real typing and clicking.
- `waitFor` retries until the check passes or times out, which is needed for async code.

**File:** [frontend/src/test/testUtils.jsx](../../frontend/src/test/testUtils.jsx)

```jsx
const store = configureStore({ reducer: { tickets: ticketsReducer, dashboard: dashboardReducer } })
```

```jsx
<MemoryRouter initialEntries={[route]}>
```

- Each test gets a fresh store, so no data leaks between tests.
- `MemoryRouter` keeps the URL in memory, because tests have no real address bar.

### 4. Why We Used It

Tests that check internal state break during harmless refactors, and can pass when the page is broken. Testing what the user sees avoids both problems, and it's fast, because no real browser is needed.

### 5. Real-Time Scenario

The login test types a wrong password, with `login` set to reject. It then checks that an alert with the server's message appears. It doesn't matter how `LoginPage` stores that error, only that the user sees it.

### 6. Interview Questions

- **Theory:** What is the philosophy of React Testing Library?
- **Theory:** What's the difference between `getBy`, `queryBy` and `findBy`?
- **Theory:** Why use `userEvent` rather than `fireEvent`?
- **Practical:** How did you test your login form?
- **Practical:** How do you test a component that needs Redux and a router?

### 7. Project-Based Answers

**What is its philosophy?**
Test behavior, not implementation. The more tests resemble how software is used, the more confidence they give.

**`getBy`, `queryBy` and `findBy`?**
`getBy` throws if the element is missing. `queryBy` returns `null`, so it's for checking something isn't there. `findBy` waits for it to appear, so it's for async results.

**`userEvent` versus `fireEvent`?**
`fireEvent` dispatches a single event. `userEvent` simulates a whole interaction, like focus and each keystroke, so it's closer to reality.

**How did you test your login form?**
Empty fields show errors and don't call login. An invalid email is rejected. Valid details call login with the right values. A server error appears. And the button is disabled during sign-in, which prevents double submissions.

**How do you test with Redux and a router?**
My `renderWithProviders` helper wraps a component with a fresh store, a `MemoryRouter` and a mock auth context.

### 8. Follow-up Questions

- **Why query by role?** It matches how assistive technology sees the page, and doesn't break when class names change.
- **What is jsdom?** A simulated browser in Node. It's fast, but it doesn't do real layout, so it can't catch visual bugs like overflow.
- **What's the `@testing-library/jest-dom` package for?** Readable checks like `toBeInTheDocument` and `toBeDisabled`.

---

## Mocking

### 1. Concept Explanation

A **mock** replaces a real dependency with a controllable fake, so a test can focus on one thing, and run without a server. You can decide what the fake returns, and check how it was called.

Too much mocking is risky, though. Tests can pass while the real parts don't work together.

### 2. Project Implementation

- **Frontend components:** `vi.mock` replaces `ticketService`.
- **Axios:** a fake adapter answers requests, while the real interceptors still run.
- **Backend:** mostly **no** mocks, using a real database. The exception is a forced failure, to test the error handler.

### 3. Code Reference

**File:** [frontend/src/pages/TicketListPage.test.jsx](../../frontend/src/pages/TicketListPage.test.jsx)

```jsx
vi.mock('../services/ticketService')
const mockGetTickets = vi.mocked(getTickets)
```

```jsx
await user.type(screen.getByLabelText('Search tickets by title'), 'invoice')

await waitFor(() => expect(lastQuery()).toMatchObject({ search: 'invoice' }))
expect(mockGetTickets).toHaveBeenCalledTimes(1)
```

- Typing seven characters sends one request, which proves the debounce works.

**File:** [frontend/src/services/api.test.js](../../frontend/src/services/api.test.js)

```js
api.defaults.adapter = async (config) => {
```

- The adapter is the part of Axios that sends the request. Replacing only that means the real interceptors are still tested.

**File:** [backend/tests/errors.test.js](../../backend/tests/errors.test.js)

```js
vi.spyOn(Ticket, 'countDocuments').mockImplementation(() => {
  throw new Error('secret database detail')
})
```

- It's hard to make a real database fail on demand, so this forces a failure, then checks the secret text doesn't reach the client.

### 4. Why We Used It

Component tests shouldn't need a running server. But my backend's riskiest logic is its queries and permissions, and mocking the database would test nothing useful there, so those tests use a real MongoDB server.

### 5. Real-Time Scenario

To test what users see when the server is down, the test makes `getTickets` reject with an error, and checks that the message appears. Doing that with a real server would mean shutting it down in the middle of a test.

### 6. Interview Questions

- **Theory:** What is mocking, and why use it?
- **Theory:** What's the difference between a mock and a spy?
- **Theory:** What are the risks of too much mocking?
- **Practical:** What did you mock in your project, and what didn't you?

### 7. Project-Based Answers

**What is mocking?**
Replacing a dependency with a controllable fake, to isolate what's being tested and make hard-to-create situations easy.

**Mock versus spy?**
A spy watches a real function, and can optionally replace its behavior. A mock replaces it entirely. I use `vi.mock` for services and `vi.spyOn` on a Mongoose model.

**What are the risks?**
Tests can pass while the real parts don't work together, for example if the fake returns a different shape from the real API. So I use real components where the risk is highest.

**What did you mock, and what didn't you?**
On the frontend, I mocked services and Axios's adapter. On the backend, I used a real temporary MongoDB server, because mocking the database wouldn't prove the queries or permissions work.

### 8. Follow-up Questions

- **What's Mock Service Worker?** A tool that intercepts network requests, so components can be tested with their real services. It would be a good upgrade here.
- **Why call `vi.clearAllMocks`?** So the call counts and history from one test don't affect the next.
- **What stops your mocks drifting from the real API?** My browser checks and Postman collection ran against the real API, but a permanent end-to-end suite would be stronger.

---

## API Testing with Supertest and a Test Database

### 1. Concept Explanation

Supertest sends real HTTP requests to an Express app without starting a server on a port. Using it with a real test database checks the whole backend: routes, middleware, services and SQL.

Tests need known starting data, and must never touch real data, so a separate test database is reset between tests.

### 2. Project Implementation

- **`tests/globalSetup.js`:** starts a temporary MongoDB server, with a database called `minidesk_test`.
- **`vitest.config.js`:** sets the test environment, and runs files one at a time.
- **`tests/helpers.js`:** resets the data and logs users in.
- **`tests/*.test.js`:** cover auth, the middleware, CRUD, roles and errors.

### 3. Code Reference

**File:** [backend/tests/globalSetup.js](../../backend/tests/globalSetup.js)

```js
server = await MongoMemoryServer.create()
process.env.MONGODB_URI = server.getUri('minidesk_test')
```

- Each run gets its own throwaway server, which takes priority over `backend/.env`.

**File:** [backend/vitest.config.js](../../backend/vitest.config.js)

```js
fileParallelism: false,
```

- Files run one at a time, because they share one database.

**File:** [backend/tests/helpers.js](../../backend/tests/helpers.js)

```js
if (!mongoose.connection.name.endsWith('_test')) {
  throw new Error(`Refusing to reset "${mongoose.connection.name}". Tests may only use a database ending in _test.`)
}
```

- A second safety check, because this function deletes everything.

**File:** [backend/tests/tickets.test.js](../../backend/tests/tickets.test.js)

```js
const other = await api.get(`/api/tickets/${ticket(1006)}`).set(asUser(liam))
const missing = await api.get(`/api/tickets/${ticket(99999)}`).set(asUser(liam))

expect(other.status).toBe(404)
expect(other.body).toEqual(missing.body)
```

- This proves a customer can't tell whether another customer's ticket exists.

**File:** [backend/tests/authenticate.test.js](../../backend/tests/authenticate.test.js)

```js
it('accepts a correctly signed token, which proves the tests below fail for the right reason', async () => {
```

- Without this control, a "rejects a bad token" test would also pass if every token were rejected.

### 4. Why We Used It

Security rules are the most important thing to test, and they run through middleware and database queries together. A real database also catches things a mock can't, such as a duplicate-email error or a query that matches nothing.

### 5. Real-Time Scenario

Before each test, the data resets to the same sample tickets. A test signs in as Sam, tries to assign a ticket to Maya, and expects a 403. It then assigns to himself and expects success. Nothing from this test affects the next.

### 6. Interview Questions

- **Theory:** Should API tests use a real database or a mock?
- **Theory:** How do you keep tests independent of each other?
- **Practical:** How did you test your endpoints?
- **Practical:** How did you test your authentication middleware?
- **Practical:** How do you stop tests from touching real data?
- **Practical:** How do you use Postman in your project?

### 7. Project-Based Answers

**Real database or mock?**
A real one for me, because my rules live partly in queries. A temporary in-memory MongoDB gives that without needing an installed server. The suite still runs in about 10 seconds.

**How do you keep tests independent?**
`beforeEach` resets the tables and sample data, so each test starts the same way.

**How did you test your endpoints?**
With Supertest. Each endpoint is tested for success, validation errors and each role's permissions. I also test edge cases, such as five sign-ups at once with the same email, and query injection attempts.

**How did you test the middleware?**
With no token, a garbage token, an expired token, the wrong secret, the `none` algorithm, an edited payload, and a user who doesn't exist. A correctly signed token is the control, which proves the failures are for the right reasons. Another test confirms that every protected route requires a login.

**How do you protect real data?**
Tests start their own temporary MongoDB server, so real data is never reachable. The reset function also refuses to run on any database not ending in `_test`.

**How do you use Postman?**
A collection with 20 requests that goes through a full ticket lifecycle, with test scripts that check each response and pass tokens along. It's useful for exploring the API by hand, and can run automatically with Newman.

### 8. Follow-up Questions

- **Why do your tests go one file at a time?** They share a database. Separate databases per worker would allow parallel runs, but aren't needed at this speed.
- **Why a temporary server, rather than your local MongoDB?** Tests need no installed database, CI works without extra setup, and real data can't be touched.
- **Why is the JWT secret in the test config?** It's only for tests, and it protects nothing real.
- **What did Postman catch?** A bug in my own collection: scripts declaring a variable named `data`, which is reserved in Postman's sandbox. It was a reminder that test tools need testing too.
