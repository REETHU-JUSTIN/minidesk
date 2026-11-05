# Context API

---

## Context and the Auth Provider

### 1. Concept Explanation

Context lets a parent make a value available to any component below it, without passing props through every level. It has three parts:

1. **`createContext`** makes the container.
2. **A Provider** supplies the value.
3. **`useContext`** reads it.

### 2. Project Implementation

MiniDesk has one context, for authentication. `Sidebar`, `TopNav`, `ProfileMenu`, `ProtectedRoute`, `GuestRoute`, `TicketDetails` and others read it through `useAuth` or `useCurrentUser`.

### 3. Code Reference

**File:** [frontend/src/context/AuthContext.ts](../../frontend/src/context/AuthContext.ts)

```ts
export const AuthContext = createContext<AuthContextValue | null>(null)
```

**File:** [frontend/src/context/AuthProvider.tsx](../../frontend/src/context/AuthProvider.tsx)

```tsx
const [user, setUser] = useState<User | null>(null)
const [isRestoringSession, setIsRestoringSession] = useState(true)
```

```tsx
const logout = useCallback(() => {
  authService.logout()
  setUser(null)
  dispatch(userLoggedOut())
}, [dispatch])
```

```tsx
return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
```

- The provider holds the state and exposes it through `value`.
- `logout` clears the session and the user, then tells Redux to clear its data.

**File:** [frontend/src/hooks/useAuth.ts](../../frontend/src/hooks/useAuth.ts)

```ts
const context = useContext(AuthContext)
if (!context) throw new Error('useAuth must be used inside AuthProvider.')
```

- A clear error beats a confusing crash later if the provider is missing.

### 4. Why We Used It

Many components at different depths need the current user. Passing it down as props would mean routing it through layers that don't use it, which is called prop drilling. Auth also suits Context well because it changes rarely, and it needs no extra library.

### 5. Real-Time Scenario

Priya signs in. `login` calls the service, and `setUser` stores her. The context value changes, so everything reading it re-renders: the sidebar drops the admin links, the top bar shows her name, and `GuestRoute` sends her to the dashboard. No props are passed by hand.

### 6. Interview Questions

- **Theory:** What is the Context API, and what problem does it solve?
- **Theory:** What's the downside of Context?
- **Theory:** Why wrap the value in `useMemo`?
- **Practical:** How did you implement authentication state?
- **Practical:** Why did you make a `useAuth` Hook?

### 7. Project-Based Answers

**What is Context?**
A way to share values through the component tree without props at each level. It solves prop drilling. I use it for the signed-in user.

**What's the downside?**
Every component reading a context re-renders when its value changes, even if it only uses part of it. So it suits data that changes rarely, which is why my tickets aren't in Context.

**Why `useMemo`?**
Otherwise each provider render creates a new object, which counts as a change and re-renders every reader. `useMemo` keeps the same object until its contents actually change.

**How did you implement authentication state?**
`AuthProvider` holds `user` and `isRestoringSession`, and provides `login`, `register` and `logout`. Login stores a JWT in `localStorage`. On startup, an effect calls `/auth/me` to restore the session. If any request finds the token has expired, a handler registered with the Axios interceptor signs the user out.

**Why a `useAuth` Hook?**
It hides `useContext`, gives a clear error if the provider is missing, and lets me add `useCurrentUser` for pages where a user always exists.

### 8. Follow-up Questions

- **Why is `AuthProvider` inside the Redux `Provider`?** It dispatches `userLoggedOut`, so it needs the store.
- **Why is the context in a separate file from the provider?** The linter flagged that fast refresh works best when component files only export components.
- **Could you use Redux for auth instead?** Yes, and many apps do. I chose Context to show both tools with a clear reason for each, and it's simple enough here.

---

## Choosing Between Local State, Context and Redux

### 1. Concept Explanation

These are tools for different jobs, and the simplest one that works is usually right.

| | Local state | Context | Redux Toolkit |
|---|---|---|---|
| **Scope** | One component and its children | Any component below the provider | Whole app |
| **Good for** | UI state, form text | Values that rarely change | Shared, frequently updated data |
| **Re-renders** | That component and its children | Every reader on any change | Only components whose selected data changed |
| **Async tools** | No | No | Yes |
| **Extra library** | No | No | Yes |

### 2. Project Implementation

| Data | Where | Why |
|---|---|---|
| Mobile menu open | Local state | Only the layout needs it |
| Filters and page | Local state | Only the ticket list needs them |
| Comments | Local state | Only one component uses them |
| User list | Local state | Only one page uses it |
| Signed-in user | Context | Read widely, changes rarely |
| Tickets | Redux | Async, used by several pages |
| Dashboard stats | Redux | Async, with loading and error states |

### 3. Code Reference

**File:** [frontend/src/components/tickets/TicketComments.tsx](../../frontend/src/components/tickets/TicketComments.tsx)

```tsx
const [comments, setComments] = useState<TicketComment[] | null>(null)
```

**File:** [frontend/src/hooks/useAuth.ts](../../frontend/src/hooks/useAuth.ts)

```ts
const { user } = useAuth()
```

**File:** [frontend/src/pages/TicketListPage.tsx](../../frontend/src/pages/TicketListPage.tsx)

```tsx
const { items, totalPages, totalItems, listStatus, listError } = useAppSelector((state) => state.tickets)
```

### 4. Why We Used It

Using one tool for everything has a cost. All-Redux means a lot of ceremony for a menu toggle, and all-Context means too many re-renders. Each piece of data also has exactly one owner, so nothing has to be kept in sync.

### 5. Real-Time Scenario

An agent updates a ticket's status on the details page. The change goes through Redux, so the list shows the new status when they go back. Meanwhile, typing a comment stays local, so nothing else in the app re-renders.

### 6. Interview Questions

- **Theory:** When would you use local state, Context or Redux?
- **Theory:** Why not put everything in Redux?
- **Practical:** How did you decide where each piece of state goes?
- **Practical:** How do you avoid duplicating state?

### 7. Project-Based Answers

**When would you use each?**
Local state when one component needs it. Context for rarely changing values read widely. Redux for shared data with async loading.

**Why not put everything in Redux?**
It adds actions and reducers, even for something a single component owns. My comments are local, because no other component needs them.

**How did you decide?**
I start local, and only move something up when another component needs it. So the page number stays local, while tickets are in Redux for several pages.

**How do you avoid duplicating state?**
Each value has one owner. The user lives only in `AuthProvider`, and tickets live only in Redux. They meet in one place: logout dispatches an action so Redux clears itself.

### 8. Follow-up Questions

- **What about server-state libraries?** RTK Query and TanStack Query specialize in caching server data. Many projects would use one for tickets. I wrote thunks by hand to learn the basics.
- **How would you move comments to Redux if needed?** Add them to a slice with thunks, then read them with a selector. The component's display code barely changes.
- **What does Redux DevTools offer?** A timeline of every action and state change.
