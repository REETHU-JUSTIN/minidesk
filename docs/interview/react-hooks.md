# React Hooks

Hooks are functions that let a component remember values and connect to things outside React.

---

## useState

### 1. Concept Explanation

A normal variable inside a component is reset every time the component runs, and changing it doesn't update the screen. `useState` solves both problems. React remembers the value between renders, and calling the setter makes React render the component again with the new value.

```jsx
const [count, setCount] = useState(0)
```

This gives you the current value and a function to change it. `0` is used only on the first render.

### 2. Project Implementation

| Component | State | Purpose |
|---|---|---|
| `AppLayout` | `isMenuOpen` | Whether the mobile sidebar is open |
| `TicketList` | `filters`, `page` | The search text, filter choices and current page |
| `TicketDetails` | `isEditOpen`, `isDeleteOpen`, `isSaving`, `actionError` | Modals, saving and errors |
| `CommentForm` | `message`, `error`, `isPosting` | The comment being typed |
| `TicketComments` | `comments`, `error` | The loaded comments |

### 3. Code Reference

**File:** [frontend/src/pages/TicketListPage.jsx](../../frontend/src/pages/TicketListPage.jsx)

```jsx
const [filters, setFilters] = useState({ ...noFilters, search: initialSearch })
const [page, setPage] = useState(1)
```

- `filters` starts with empty filters, plus any search text from the URL.

```jsx
const handleFilterChange = useCallback((changes) => {
  setFilters((currentFilters) => ({ ...currentFilters, ...changes }))
  setPage(1) // the old page might not exist in the new results
}, [])
```

- The function form, `(currentFilters) => ...`, always receives the latest state.
- `{ ...currentFilters, ...changes }` builds a **new** object, which is how React notices the change.

### 4. Why We Used It

The screen has to change when these values change. Picking a filter must update the dropdown, and `page` must move the table to new results. Each value lives in the lowest component that needs it, which keeps other components from re-rendering unnecessarily.

### 5. Real-Time Scenario

An agent selects **Open** in the status filter:

1. `onChange` calls `handleFilterChange({ status: 'open' })`.
2. `setFilters` and `setPage(1)` are batched into one re-render.
3. React runs `TicketList` again with the new values.
4. The change triggers an effect that requests matching tickets.
5. The table updates when they arrive.

### 6. Interview Questions

- **Theory:** What is `useState`, and how does it differ from a normal variable?
- **Theory:** Why can't you change state directly?
- **Theory:** Are state updates synchronous?
- **Practical:** Where have you used `useState` in your project?
- **Practical:** When do you use the function form of a setter?

### 7. Project-Based Answers

**What is `useState`, and how does it differ from a normal variable?**
It stores a value that React remembers between renders, and updating it re-renders the component. A normal variable is recreated on each render and doesn't update the screen.

**Why can't you change state directly?**
React compares references to detect changes. If I pushed onto the comments array directly, it would still be the same array, so nothing would update. In `TicketComments`, I create a new array with spread instead.

**Are state updates synchronous?**
No. React schedules them and batches them together. In `handleFilterChange`, I call `setFilters` and `setPage` but get one re-render. Reading the variable straight after setting it still gives the old value.

**Where have you used `useState`?**
In MiniDesk's ticket list, I use it for filters and the current page. In the ticket details page, it controls modals and saving state, and in the comment form it holds the text being typed. Each piece of state lives in the lowest component that needs it.

**When do you use the function form?**
When the new state depends on the old state. My filter handler merges changes into the current filters, so I use the function form to be sure I'm working from the latest value.

### 8. Follow-up Questions

- **Why isn't the current page in Redux?** Only `TicketList` uses it, and it resets when you leave. Redux is for data shared across pages.
- **Why not store `hasActiveFilters` in state too?** It can be calculated from `filters` during render. Storing it would mean keeping two values in sync.
- **What happens if you set state to the same value?** React compares with `Object.is` and usually skips the re-render.
- **Why does the setter sometimes take a function in `useState` itself?** `useState(() => ...)` is lazy initialization, used when the starting value is expensive to calculate. It runs only once.

---

## useEffect

### 1. Concept Explanation

A component's main job is to calculate what the screen should show. Some things sit outside that job: API requests, timers and browser events. These are side effects, and `useEffect` runs them **after** React updates the screen.

```jsx
useEffect(() => {
  // runs after render
  return () => {
    // cleanup: runs before the next run, and when the component is removed
  }
}, [dependency]) // re-run only when this changes
```

| Dependency array | When the effect runs |
|---|---|
| Not provided | After every render |
| `[]` | Once, after the first render |
| `[value]` | After the first render, and when `value` changes |

### 2. Project Implementation

| Where | What it does |
|---|---|
| `DashboardPage` | Loads stats when the page opens |
| `TicketList` | Loads tickets when filters or the page change |
| `TicketDetailsLoader` | Loads the ticket from the URL |
| `TicketComments`, `UsersPage` | Load data with local state |
| `AuthProvider` | Checks for a saved session on startup |
| `Modal` | Moves focus into the dialog and listens for Escape |
| `useDebounce` | Starts and cancels a timer |
| `useCloseOnOutside` | Listens for outside clicks and Escape |

### 3. Code Reference

**File:** [frontend/src/pages/TicketListPage.jsx](../../frontend/src/pages/TicketListPage.jsx)

```jsx
useEffect(() => {
  const request = dispatch(fetchTickets({ scope, search: debouncedSearch, status, priority, page, limit: PAGE_SIZE }))
  return () => request.abort()
}, [dispatch, scope, debouncedSearch, status, priority, page])
```

- **The effect:** dispatches the request that loads tickets.
- **The cleanup:** cancels that request if a filter changes or the user leaves.
- **The dependency array:** lists everything the effect uses, so it re-runs when any of them change.

**File:** [frontend/src/components/common/Modal.jsx](../../frontend/src/components/common/Modal.jsx)

```jsx
document.addEventListener('keydown', handleKeyDown)
return () => document.removeEventListener('keydown', handleKeyDown)
```

- Without this cleanup, each opening of the modal would add another listener.

### 4. Why We Used It

Requesting data or adding listeners during render would run on every render and could cause infinite loops. Effects keep these jobs separate and run them only when needed. The cleanup prevents leaks and out-of-order results.

### 5. Real-Time Scenario

A customer quickly clicks **Next**, then **Previous**:

1. **Next** changes `page` to 2, and the effect requests page 2.
2. **Previous** changes `page` back to 1 before the response arrives.
3. React runs the cleanup first, cancelling the page 2 request.
4. The effect then requests page 1.
5. Only page 1's response updates the table, so the rows always match the label.

### 6. Interview Questions

- **Theory:** What is `useEffect`, and when does it run?
- **Theory:** What does the dependency array do?
- **Theory:** What is the cleanup function for?
- **Practical:** Why did you use `useEffect` in your project, and what does it handle?
- **Practical:** Have you ever removed an effect that wasn't needed?

### 7. Project-Based Answers

**What is `useEffect`, and when does it run?**
It runs side effects after React updates the screen. I use it for anything that connects to something outside React, such as requests, timers and document event listeners.

**What does the dependency array do?**
It controls when the effect runs again. My ticket list effect lists the search, status, priority and page, so any change fetches new results. An empty array, like the one in `AuthProvider`, runs once on startup.

**What is the cleanup function for?**
It undoes what the effect set up. In `useDebounce`, it cancels the waiting timer on each keystroke, which is what makes debouncing work. In the ticket list, it aborts old requests.

**Why did you use `useEffect` in your project?**
Mainly for loading data and listening to browser events. For example, the ticket list reloads whenever a filter changes, and the modal listens for Escape only while it's open.

**Have you removed an effect that wasn't needed?**
Yes. The linter flagged a state reset inside the effect in `NotificationMenu`. It really belonged in the click handler, since that's the event causing the change, so I moved it there.

### 8. Follow-up Questions

- **Why does your effect run twice in development?** React's StrictMode mounts components twice in development to expose missing cleanup. With the abort in place, this causes no problem.
- **What causes an infinite loop in `useEffect`?** An effect that sets state which is also in its dependency array, such as an object recreated on every render.
- **Why isn't "reset the page to 1" in an effect?** It's caused by a user event, so it belongs in the event handler. An effect would add an extra render.
- **Would you still fetch data in effects on a large project?** Many teams use tools like RTK Query or TanStack Query, which handle caching and race conditions. Doing it by hand here helps me understand what those tools solve.

---

## useRef

### 1. Concept Explanation

`useRef` gives you a box whose `.current` value survives between renders. Changing it doesn't cause a re-render. There are two main uses: holding a reference to a DOM element, and storing a value that the screen doesn't depend on.

| | `useState` | `useRef` |
|---|---|---|
| Survives re-renders | Yes | Yes |
| Changing it re-renders | Yes | No |
| Typical use | Values shown on screen | DOM elements, timer IDs |

### 2. Project Implementation

- **`Modal`:** moves keyboard focus into the dialog when it opens.
- **`CommentForm`:** returns focus to the textarea after posting or after an error.
- **`NotificationMenu`, `ProfileMenu`:** detect whether a click landed inside the menu.

### 3. Code Reference

**File:** [frontend/src/components/tickets/CommentForm.jsx](../../frontend/src/components/tickets/CommentForm.jsx)

```jsx
const textareaRef = useRef(null)
```

```jsx
textareaRef.current?.focus()
```

```jsx
ref={textareaRef}
```

- `useRef(null)` starts empty.
- `ref={textareaRef}` makes React put the real DOM element in `.current`.
- `?.` guards against the element not being there.

**File:** [frontend/src/hooks/useCloseOnOutside.js](../../frontend/src/hooks/useCloseOnOutside.js)

```js
const clickedInside = containerRef.current?.contains(event.target)
if (!clickedInside) onClose()
```

- `contains` is a browser DOM method, so this needs the real element.

### 4. Why We Used It

React has no built-in prop for "focus this now" or "was this click inside?" These need the real DOM element. State would be the wrong tool, because nothing on screen depends on these references.

### 5. Real-Time Scenario

An agent presses **Post Comment** with an empty box. The form shows an error and moves the cursor straight back to the textarea, so they can start typing right away without reaching for the mouse. This also helps keyboard users.

### 6. Interview Questions

- **Theory:** What's the difference between `useRef` and `useState`?
- **Theory:** Why doesn't changing a ref cause a re-render?
- **Practical:** Where have you used `useRef`?
- **Practical:** How does your dropdown close when someone clicks outside it?

### 7. Project-Based Answers

**What's the difference between `useRef` and `useState`?**
Both keep values between renders, but only state re-renders when it changes. I use state for values shown on screen, and refs for direct access to DOM elements.

**Why doesn't changing a ref cause a re-render?**
A ref is a plain object that React doesn't track. Changing `.current` just changes that object, so React has no reason to render again.

**Where have you used `useRef`?**
In `CommentForm`, to return focus to the textarea after posting. In `Modal`, to move focus into the dialog. In my two header menus, to detect outside clicks.

**How does your dropdown close on an outside click?**
My `useCloseOnOutside` Hook adds a `mousedown` listener to the document while the menu is open. It uses `ref.current.contains(event.target)` to check where the click landed, and closes the menu if it was outside.

### 8. Follow-up Questions

- **How does `ref` reach the real textarea through your `Textarea` component?** In React 19, `ref` is a normal prop. It arrives in `...rest` and is spread onto the textarea. Older versions needed `forwardRef`.
- **Can you read a ref during render?** You shouldn't. The DOM element isn't attached until after the first render, so I read refs in effects and event handlers.
- **Why `mousedown` rather than `click`?** It fires first, so the menu closes as soon as the press happens. It also behaves reliably if the element clicked gets removed afterward.

---

## useMemo

### 1. Concept Explanation

`useMemo` saves the result of a calculation and reuses it until its dependencies change. Besides avoiding slow recalculation, it keeps the **same object** between renders, which matters because `{} === {}` is false in JavaScript.

```jsx
const value = useMemo(() => calculate(a, b), [a, b])
```

### 2. Project Implementation

MiniDesk uses it once, for the value shared through `AuthContext`. An earlier version also used it around ticket filtering, but that was removed when filtering moved out of the component. Nothing else needs it.

### 3. Code Reference

**File:** [frontend/src/context/AuthProvider.jsx](../../frontend/src/context/AuthProvider.jsx)

```jsx
const value = useMemo(
  () => ({ user, isRestoringSession, login, register, logout }),
  [user, isRestoringSession, login, register, logout],
)
```

- The object is rebuilt only if one of those five values changes.
- `login`, `register` and `logout` are wrapped in `useCallback`, otherwise they'd change on every render and defeat this.

### 4. Why We Used It

Every component that reads a context re-renders when its value changes, and React compares that value by reference. Without `useMemo`, each render of `AuthProvider` would make a new object, so the sidebar, top bar and every page using `useAuth` would re-render for no reason.

### 5. Real-Time Scenario

A customer types in a form on the ticket page. If `AuthProvider` re-renders for any reason, `useMemo` returns the same value object, so components that only read `useAuth` aren't re-rendered because of it. When the customer logs out, `user` changes, the object is rebuilt, and those components update.

### 6. Interview Questions

- **Theory:** What does `useMemo` do?
- **Theory:** What's the difference between `useMemo` and `useCallback`?
- **Theory:** Should you use `useMemo` everywhere?
- **Practical:** Where have you used `useMemo`, and why?

### 7. Project-Based Answers

**What does `useMemo` do?**
It caches a calculated value between renders and recalculates only when a dependency changes.

**What's the difference between `useMemo` and `useCallback`?**
`useMemo` caches the value returned by a function. `useCallback` caches the function itself. I use `useMemo` for the auth context value and `useCallback` for the login and logout functions inside it.

**Should you use `useMemo` everywhere?**
No. It adds code and memory use, and the check itself has a small cost. I use it for slow calculations or when a stable reference matters. I actually removed one from MiniDesk once it stopped doing a useful job.

**Where have you used `useMemo`, and why?**
In `AuthProvider`, around the context value. Without it, every provider render would create a new object and re-render everything that uses the context.

### 8. Follow-up Questions

- **How would you know if something needs `useMemo`?** Measure with the React DevTools Profiler rather than guessing.
- **Does `useMemo` guarantee the value is kept?** Not strictly. React may discard the cache, so code must still work correctly without it. It's an optimization, not something to rely on for correctness.
- **Why did you remove the other `useMemo`?** Filtering moved to the data layer, so there was nothing left in the component to cache.

---

## useCallback and React.memo

### 1. Concept Explanation

Two functions are never equal in JavaScript, even with identical code, and a component creates new functions on every render. `useCallback` keeps the same function between renders until its dependencies change.

`React.memo` wraps a component and skips re-rendering it when its props are unchanged. These two work as a pair: a new function prop on each render would make `memo` think the props changed.

### 2. Project Implementation

- **`TicketFilters`** is wrapped in `memo`, and its parent `TicketList` wraps both handlers in `useCallback`.
- **`TicketDetails`** wraps `closeEditModal` and `closeDeleteModal`, because `Modal`'s effect depends on `onClose`.
- **`AuthProvider`** wraps `login`, `register` and `logout` so the context value stays stable.

### 3. Code Reference

**File:** [frontend/src/components/tickets/TicketFilters.jsx](../../frontend/src/components/tickets/TicketFilters.jsx)

```jsx
export const TicketFilters = memo(function TicketFilters({ filters, onFilterChange, onClear }) {
```

**File:** [frontend/src/pages/TicketListPage.jsx](../../frontend/src/pages/TicketListPage.jsx)

```jsx
const handleFilterChange = useCallback((changes) => {
  setFilters((currentFilters) => ({ ...currentFilters, ...changes }))
  setPage(1) // the old page might not exist in the new results
}, [])
```

- `[]` works because state setters never change, and the function form means it doesn't need to read `filters`.

**File:** [frontend/src/pages/TicketDetailsPage.jsx](../../frontend/src/pages/TicketDetailsPage.jsx)

```jsx
const closeDeleteModal = useCallback(() => setIsDeleteOpen(false), [])
```

- `Modal` re-runs its effect when `onClose` changes, and that effect calls `.focus()`. A stable function stops focus jumping back to the dialog when the page re-renders.

### 4. Why We Used It

When the page changes, `TicketList` re-renders, but the filters' props haven't changed, so they don't need to. And on the details page, an unstable `onClose` could take focus away from someone using the modal. So there are two real reasons for it: skipping unneeded work, and keeping an effect from re-running.

### 5. Real-Time Scenario

An agent clicks **Next**. `page` changes and `TicketList` re-renders. `filters`, `handleFilterChange` and `handleClearFilters` are all unchanged, so `memo` skips `TicketFilters`. During testing, a temporary render counter showed 0 renders of `TicketFilters` across page changes, and more when typing changed its props.

### 6. Interview Questions

- **Theory:** What does `useCallback` do?
- **Theory:** Why does `React.memo` need `useCallback`?
- **Theory:** What kind of comparison does `memo` do?
- **Practical:** Where have you used `useCallback`, and did it actually help?

### 7. Project-Based Answers

**What does `useCallback` do?**
It keeps the same function between renders until a dependency changes. Without it, each render creates a new function.

**Why does `React.memo` need `useCallback`?**
`memo` compares props, and a new function counts as a changed prop, so `memo` would never skip a render. My `TicketFilters` only skips rendering because its parent keeps those handlers stable.

**What kind of comparison does `memo` do?**
A shallow one: each prop is compared by reference using `Object.is`. An object recreated with the same contents counts as changed.

**Where have you used `useCallback`, and did it actually help?**
On the ticket list handlers, with `memo` on the filters. I verified it with a temporary render counter, which showed the filters skipping re-renders on page changes. I also used it for modal close handlers, so a page re-render doesn't re-run the modal's effect.

### 8. Follow-up Questions

- **Should every function use `useCallback`?** No. If it isn't passed to a memoized child, an effect or a context value, it adds complexity for no benefit. `handleDelete` in `TicketDetails` doesn't use it.
- **What goes wrong with a missing dependency?** The function keeps reading old values from its closure, which is called a stale closure.
- **Why doesn't `handleFilterChange` need `filters` as a dependency?** The function form of the setter receives the latest state, so the callback never reads `filters` directly.

---

## Custom Hooks

### 1. Concept Explanation

A custom Hook is a function whose name starts with `use` and which calls other Hooks. It lets several components share **logic**. Each component that calls it gets its own separate state, so the state itself isn't shared.

### 2. Project Implementation

| Hook | Purpose | Used by |
|---|---|---|
| `useDebounce` | Delays a changing value | `TicketList` |
| `useCloseOnOutside` | Closes a menu on an outside click or Escape | `NotificationMenu`, `ProfileMenu` |
| `useAuth` | Reads `AuthContext` safely | Pages, layout, routes |
| `useCurrentUser` | Returns a user that's never null | Protected pages |
| `useAppDispatch`, `useAppSelector` | Redux Hooks | Pages using Redux |

### 3. Code Reference

**File:** [frontend/src/hooks/useDebounce.js](../../frontend/src/hooks/useDebounce.js)

```js
export function useDebounce(value, delay) {
  const [debouncedValue, setDebouncedValue] = useState(value)

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delay)
    return () => clearTimeout(timer)
  }, [value, delay])

  return debouncedValue
}
```

- Each change to `value` runs the cleanup first, cancelling the old timer, then starts a new one.
- `debouncedValue` updates only after the value stops changing for the full delay.

**File:** [frontend/src/pages/TicketListPage.jsx](../../frontend/src/pages/TicketListPage.jsx)

```jsx
const debouncedSearch = useDebounce(search, 300)
```

### 4. Why We Used It

Without a debounce, typing "invoice" would send seven requests. `useCloseOnOutside` exists because both menus need the same logic, so a Hook avoids writing it twice. `useAuth` adds a clear error message if it's used in the wrong place.

### 5. Real-Time Scenario

An agent types "bug" quickly. Each key updates `search` immediately, so the input stays responsive, and restarts the 300ms timer. 300ms after the last key, `debouncedSearch` becomes "bug". The effect sees that change and sends one request instead of three.

### 6. Interview Questions

- **Theory:** What is a custom Hook, and what are the rules for naming one?
- **Theory:** Do two components using the same Hook share state?
- **Theory:** What's the difference between debouncing and throttling?
- **Practical:** Which custom Hooks have you written, and why?
- **Practical:** Explain how your debounce works.

### 7. Project-Based Answers

**What is a custom Hook?**
A function starting with `use` that calls other Hooks, to share logic between components. React's linter relies on that prefix to check the Rules of Hooks.

**Do two components share state?**
No. Both my menus call `useCloseOnOutside`, and each gets its own effect. Only the logic is shared.

**What's the difference between debouncing and throttling?**
Debouncing waits until activity stops, which suits my search box. Throttling allows at most one call per time period, which suits things like scroll handlers.

**Which custom Hooks have you written, and why?**
`useDebounce` to avoid a request on every keystroke, `useCloseOnOutside` because two menus share that behavior, and `useAuth` to read the auth context with a clear error if it's misused.

**Explain how your debounce works.**
It keeps a delayed copy of the value. An effect starts a timer to update that copy, and its cleanup cancels the timer whenever the value changes. So the copy only updates once typing has paused for 300ms.

### 8. Follow-up Questions

- **When shouldn't you write a custom Hook?** When the logic is used once and is simple. I didn't make one for loading data in `UsersPage`, because the code is clear where it is.
- **Could `useDebounce` be a regular function?** No. It calls `useState` and `useEffect`, which only work inside a component or Hook.

---

## Rules of Hooks

### 1. Concept Explanation

There are two rules:

1. Call Hooks only at the top level, never inside conditions, loops, or after an early return.
2. Call Hooks only from components or custom Hooks.

React doesn't identify Hooks by name. It tracks them by **call order**, so that order must be the same on every render.

### 2. Project Implementation

`TicketDetailsLoader` returns early while the ticket loads. `TicketDetails` needs several Hooks, so it's a separate child component that only renders once the ticket exists.

### 3. Code Reference

**File:** [frontend/src/pages/TicketDetailsPage.jsx](../../frontend/src/pages/TicketDetailsPage.jsx)

```jsx
if (selectedTicket?.id !== ticketId) {
  return <Spinner label="Loading ticket..." />
}

return <TicketDetails ticket={selectedTicket} />
```

- Hooks in `TicketDetails` always run in the same order, because that component only exists when there's a ticket.
- `ticket` is guaranteed there, so the child never has to check for null.

### 4. Why We Used It

Placing `useState` after that early return would break the rules. On the first render, those Hooks wouldn't be called. Then they would appear when the ticket loaded, and React would attach values to the wrong Hooks.

### 5. Real-Time Scenario

A customer opens a ticket. First, `TicketDetailsLoader` shows a spinner, and `TicketDetails` doesn't exist. When the ticket arrives, `TicketDetails` mounts for the first time with all its Hooks in a consistent order.

### 6. Interview Questions

- **Theory:** What are the Rules of Hooks?
- **Theory:** Why does React care about the order?
- **Practical:** Have you run into this rule in your project?

### 7. Project-Based Answers

**What are the Rules of Hooks?**
Only call Hooks at the top level of components or custom Hooks. So no Hooks in conditions, loops or after an early return.

**Why does React care about the order?**
It stores each component's Hook values in a list and matches them by position. If the order changes between renders, values get attached to the wrong Hooks.

**Have you run into this rule?**
Yes. My ticket details page needs an early return while loading, plus several state Hooks. I moved the Hooks into a child component that renders only when the ticket exists, which also means the child never handles a missing ticket.

### 8. Follow-up Questions

- **How are violations caught?** Linters include rules that check this, and React also warns in development if the order changes.
- **Can you use a Hook inside `useEffect`'s callback?** No, because that's a nested function, not the top level.
- **What's another way to fix it?** Put all the Hooks above the early return. I chose a child component because it also removes the null checks.
