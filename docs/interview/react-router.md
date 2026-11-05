# React Router

---

## Routes and Layout Routes

### 1. Concept Explanation

A single-page app has one HTML page. React Router watches the URL and decides which components to show, without asking the server for a new page.

A **layout route** has an element but no path. It wraps its child routes and renders `<Outlet />` where the matching child should appear.

### 2. Project Implementation

`App.tsx` defines all routes. `BrowserRouter` wraps the app in `main.tsx`. `AppLayout`, `ProtectedRoute` and `GuestRoute` are layout routes, and `*` catches unknown URLs.

### 3. Code Reference

**File:** [frontend/src/App.tsx](../../frontend/src/App.tsx)

```tsx
<Route element={<ProtectedRoute />}>
  <Route element={<AppLayout />}>
```

```tsx
<Route path="/dashboard" element={<DashboardPage />} />
<Route path="/tickets/:ticketId" element={<TicketDetailsPage />} />
```

```tsx
<Route path="*" element={<NotFoundPage />} />
```

- `:ticketId` is a URL parameter.
- `*` matches anything no other route matched.

**File:** [frontend/src/components/layout/AppLayout.tsx](../../frontend/src/components/layout/AppLayout.tsx)

```tsx
<Outlet />
```

- The matched page appears here, inside the sidebar and top bar.

### 4. Why We Used It

Users need URLs they can bookmark and share, and a working Back button. Layout routes also mean the sidebar stays in place when moving between pages, instead of being rebuilt.

### 5. Real-Time Scenario

An agent clicks **All Tickets**. `NavLink` updates the URL with no page reload. React Router matches `/tickets`, and only the content inside `Outlet` changes. The sidebar remains and highlights the new link. Back returns to the previous page.

### 6. Interview Questions

- **Theory:** What's the difference between client-side and server-side routing?
- **Theory:** What's the difference between `Link` and `<a>`?
- **Theory:** What does `Outlet` do?
- **Practical:** How did you structure your routes?
- **Practical:** How do you handle unknown URLs?

### 7. Project-Based Answers

**Client-side versus server-side routing?**
On the server side, each URL loads a new page. On the client side, JavaScript changes the URL and swaps components, so it's faster and keeps state. The server must return `index.html` for every URL, which I'll handle at deployment.

**`Link` versus `<a>`?**
`<a>` reloads the page and resets all React state. `Link` updates the URL through the History API with no reload. I use `NavLink` in the sidebar, because it knows if it's active.

**What does `Outlet` do?**
It marks where a layout route renders its matched child. My `AppLayout` puts it in `main`.

**How did you structure your routes?**
With nested layout routes. Guest pages sit under `GuestRoute`. Everything else sits under `ProtectedRoute` and `AppLayout`, with further role checks around pages like Users.

**How do you handle unknown URLs?**
A `*` route shows my 404 page.

### 8. Follow-up Questions

- **Why doesn't `/tickets/mine` match `/tickets/:ticketId`?** React Router ranks routes, and static segments win over parameters.
- **Why `end` on `NavLink`?** Otherwise `/tickets` would also highlight on `/tickets/mine`.
- **What's `BrowserRouter` versus hash routing?** `BrowserRouter` uses clean URLs, and needs server support. MiniDesk's first version used `#` URLs, which were temporary.

---

## Protected Routes

### 1. Concept Explanation

A protected route is a wrapper that checks if someone may see a page before showing it. If not, it redirects them.

### 2. Project Implementation

- **`ProtectedRoute`:** requires sign-in, and optionally specific roles.
- **`GuestRoute`:** sends signed-in users away from login and register.

| Page | Allowed roles |
|---|---|
| `/tickets` | Admin, agent |
| `/tickets/new` | Customer |
| `/users` | Admin |

### 3. Code Reference

**File:** [frontend/src/components/layout/ProtectedRoute.tsx](../../frontend/src/components/layout/ProtectedRoute.tsx)

```tsx
if (isRestoringSession) {
  return <Spinner />
}
```

```tsx
if (!user) {
```

```tsx
return <Navigate to="/login" replace state={{ from: location.pathname + location.search }} />
```

```tsx
if (allowedRoles && !allowedRoles.includes(user.role)) {
  return <Navigate to="/dashboard" replace />
}
```

```tsx
return <Outlet />
```

- The session check comes first, or a refresh would briefly look signed out.
- `state.from` remembers where the person was going.
- `replace` keeps the redirecting page out of the Back button's history.

**File:** [frontend/src/App.tsx](../../frontend/src/App.tsx)

```tsx
<Route element={<ProtectedRoute allowedRoles={['admin']} />}>
  <Route path="/users" element={<UsersPage />} />
</Route>
```

### 4. Why We Used It

Different roles shouldn't reach pages they can't use, and signed-out people need to be sent to login. Writing it once as a layout route avoids repeating the check on every page.

### 5. Real-Time Scenario

A signed-out agent opens a bookmarked link to `/tickets/1006`. `ProtectedRoute` sends them to login and remembers the URL. They sign in, `GuestRoute` sees a user, and sends them straight to ticket 1006. Tests confirmed this flow.

### 6. Interview Questions

- **Theory:** How do protected routes work?
- **Theory:** Do protected routes make an app secure?
- **Practical:** How did you implement role-based access?
- **Practical:** How do you return users to the page they wanted?
- **Practical:** Why does a refresh not log the user out?

### 7. Project-Based Answers

**How do they work?**
A wrapper component checks auth. It returns `<Navigate>` to redirect, or `<Outlet />` to continue.

**Do they make an app secure?**
No. The code runs in the browser and can be changed, and anyone can call the API directly. They only control what the screen shows. The server has to enforce the rules, which MiniDesk does.

**How did you implement role-based access?**
`ProtectedRoute` takes an optional `allowedRoles` array. The sidebar also filters its links by role, and buttons check the role too.

**How do you return users to the page they wanted?**
`ProtectedRoute` puts the URL in navigation state. After login, `GuestRoute` redirects to `from`, or to the dashboard if there isn't one.

**Why doesn't a refresh log them out?**
`AuthProvider` checks for a saved session on startup. While that's running, `isRestoringSession` is true, so the route shows a spinner instead of redirecting.

### 8. Follow-up Questions

- **Why does login not call `navigate`?** Login changes the user, and `GuestRoute` then redirects. That keeps the logic in one place.
- **Why redirect to the dashboard, not a "forbidden" page?** It's simple and suits this app, and a dedicated 403 page would also be fine.
- **What happens if someone edits the role in their browser?** The screen might show more, but a real server would still reject their requests.

---

## URL Parameters and Navigation

### 1. Concept Explanation

- **Path parameters** identify a resource: `/tickets/1006`, read with `useParams`.
- **Query strings** carry options: `/tickets?search=invoice`, read with `useSearchParams`.
- **`useNavigate`** changes page from code, such as after saving.

### 2. Project Implementation

- **`TicketDetailsPage`:** reads the ID with `useParams`.
- **`TicketListPage`:** reads `?search=` with `useSearchParams`.
- **`TopNav`, `CreateTicketPage`, logout:** navigate from code.

### 3. Code Reference

**File:** [frontend/src/pages/TicketDetailsPage.tsx](../../frontend/src/pages/TicketDetailsPage.tsx)

```tsx
const { ticketId } = useParams()
const numericId = Number(ticketId)

if (!Number.isInteger(numericId) || numericId <= 0) {
```

- `useParams` always returns text, and anyone can type anything into a URL, so the ID is converted and checked.

**File:** [frontend/src/components/layout/TopNav.tsx](../../frontend/src/components/layout/TopNav.tsx)

```tsx
navigate(`${listPath}?search=${encodeURIComponent(term)}`)
```

- `encodeURIComponent` makes the text safe for a URL, so spaces and symbols can't break it.

**File:** [frontend/src/pages/CreateTicketPage.tsx](../../frontend/src/pages/CreateTicketPage.tsx)

```tsx
const newTicket = await dispatch(createTicket(values)).unwrap()
navigate(`/tickets/${newTicket.id}`)
```

- Goes to the new ticket, only after creating it succeeds.

### 4. Why We Used It

Keeping the ticket ID and search in the URL means pages can be bookmarked and shared, and survive a refresh. Validating the ID prevents pointless requests for things like `/tickets/abc`.

### 5. Real-Time Scenario

An agent searches "charged twice" from the top bar. The URL becomes `/tickets?search=charged%20twice`. `TicketListPage` reads it and shows the matches. They can refresh, or send the link to a colleague, who sees the same search. Tests confirmed that it survives a refresh.

### 6. Interview Questions

- **Theory:** What's the difference between path and query parameters?
- **Theory:** What does `replace` do on navigation?
- **Practical:** How do you read an ID from the URL?
- **Practical:** How does your top bar search work?

### 7. Project-Based Answers

**Path versus query?**
Path parameters identify a thing, like a ticket. Query parameters modify a view, like a search.

**What does `replace` do?**
It swaps the current history entry instead of adding one. After deleting a ticket, I navigate with `replace`, so Back doesn't return to a page for a ticket that no longer exists.

**How do you read an ID?**
With `useParams`. It's always a string, so I convert it with `Number` and check it's a positive whole number.

**How does your top bar search work?**
It navigates to the ticket list with `?search=` in the URL. `TicketListPage` reads it and uses it in the `key` for `TicketList`, so a new search gets a fresh component with that search text.

### 8. Follow-up Questions

- **Why are only searches in the URL, and not all filters?** To keep the code simple. Putting all filters there would make them shareable, and is a sensible next step.
- **What if a customer changes the ID in the URL to someone else's ticket?** The API returns 404, and the page shows "We couldn't find that ticket." That's enforced on the server, so changing frontend code doesn't help.
- **What does `Number('abc')` give?** `NaN`, and `Number.isInteger(NaN)` is false, so the check catches it.
