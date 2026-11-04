# JavaScript

Modern JavaScript features as they appear in MiniDesk. These all work the same way in plain JavaScript and in TypeScript.

---

## Arrow Functions and Callbacks

### 1. Concept Explanation

An arrow function is a shorter way to write a function. A callback is a function you pass to other code to be called later.

```js
const double = (number) => number * 2   // arrow function with an implicit return
[1, 2].map((number) => number * 2)      // the arrow function is a callback
```

Arrow functions also don't have their own `this`. They use the `this` from the surrounding code.

### 2. Project Implementation

Used throughout MiniDesk: as array method callbacks, as event handlers, and as props passed to children.

### 3. Code Reference

**File:** [frontend/src/utils/previewData.ts](../../frontend/src/utils/previewData.ts)

```ts
const countByStatus = (status: Ticket['status']) => tickets.filter((ticket) => ticket.status === status).length
```

- `countByStatus` is an arrow function with an implicit return.
- `(ticket) => ticket.status === status` is a callback that `filter` calls for each ticket.

**File:** [frontend/src/pages/TicketDetailsPage.tsx](../../frontend/src/pages/TicketDetailsPage.tsx)

```tsx
onDeleteClick={() => setIsDeleteOpen(true)}
```

- This passes a function, to run later on a click. Writing `onDeleteClick={setIsDeleteOpen(true)}` would run it immediately during render.

### 4. Why We Used It

Arrow functions keep small callbacks short and readable, and React code uses callbacks constantly. Passing a function as a prop is how a child tells its parent that something happened.

### 5. Real-Time Scenario

An admin clicks **Delete Ticket**. The button runs the `onDeleteClick` callback it received. That callback lives in `TicketDetails`, so it can update that component's state and open the confirmation modal.

### 6. Interview Questions

- **Theory:** How do arrow functions differ from regular functions?
- **Theory:** What is a callback?
- **Practical:** Why write `onClick={() => doThing()}` instead of `onClick={doThing()}`?

### 7. Project-Based Answers

**How do they differ?**
Arrow functions are shorter, can return implicitly, and have no `this` or `arguments` of their own. In MiniDesk's function components, I don't rely on `this` at all, so arrow functions are a natural choice for callbacks.

**What is a callback?**
A function passed to something else to be called later. `filter` calls mine for each ticket, and `TicketManagePanel` calls `onDeleteClick` when its button is clicked.

**Why `() => doThing()`?**
`doThing()` calls the function during render and passes its result as the handler. The arrow function creates a new function that runs only when clicked.

### 8. Follow-up Questions

- **When can't you use an arrow function?** As a constructor, or as an object method that needs its own `this`.
- **Do named function declarations have any advantage?** They're hoisted, so they can be called before their definition. I use them for most components and helpers.
- **Is a new inline function on each render a problem?** Usually not. It only matters when something depends on a stable reference, like `React.memo`.

---

## Destructuring

### 1. Concept Explanation

Destructuring pulls values out of objects and arrays into variables.

```js
const { name, role } = user        // by property name
const [first, second] = list       // by position
const { items: rows } = result     // renames items to rows
```

### 2. Project Implementation

It's used for props in every component, for values from Redux, for `useState`'s return value, and for filters.

### 3. Code Reference

**File:** [frontend/src/pages/TicketListPage.tsx](../../frontend/src/pages/TicketListPage.tsx)

```tsx
const { items, totalPages, totalItems, listStatus, listError } = useAppSelector((state) => state.tickets)
```

- Pulls five fields from the Redux tickets state.

```tsx
const [page, setPage] = useState(1)
```

- `useState` returns an array, so this uses array destructuring. That lets you pick the names.

**File:** [frontend/src/components/common/Pagination.tsx](../../frontend/src/components/common/Pagination.tsx)

```tsx
export function Pagination({ page, totalPages, onPageChange }: PaginationProps) {
```

- Destructuring directly in the parameters means the body can use `page`, rather than `props.page`.

### 4. Why We Used It

It removes repetition and makes it obvious which values a function uses.

### 5. Real-Time Scenario

When Redux finishes loading tickets, `TicketList` re-renders. Destructuring gives it `items`, `totalPages` and the rest as simple variables, which it passes straight to the table and pagination.

### 6. Interview Questions

- **Theory:** What is destructuring?
- **Theory:** Why does `useState` return an array rather than an object?
- **Practical:** How do you use destructuring in your components?

### 7. Project-Based Answers

**What is destructuring?**
A short syntax for pulling values from objects or arrays into variables. For example, `const { name, email, role } = useCurrentUser()` in my Settings page.

**Why does `useState` return an array?**
So I can choose the names freely. Every component names its state differently, like `page` and `setPage`. With an object, I'd have to rename both each time.

**How do you use it in your components?**
Mostly for props, with default values such as `variant = 'primary'` in `Button`, and for reading Redux state.

### 8. Follow-up Questions

- **What happens if the property doesn't exist?** The variable is `undefined`, unless you give a default.
- **What happens when destructuring from `null`?** It throws an error. `GuestRoute` guards against this: `(location.state as { from?: string } | null) ?? {}`.
- **Does destructuring copy the values?** It copies references. Nested objects are still shared with the original.

---

## Spread and Rest

### 1. Concept Explanation

Both use `...`, but they do opposite jobs.

- **Spread** expands values: `{ ...oldObject, name: 'new' }` and `[...oldArray, item]`.
- **Rest** collects values: `function f({ a, ...others })`.

### 2. Project Implementation

- **Spread** updates state without changing the original.
- **Rest** lets `Button` and `Input` accept any normal HTML prop.

### 3. Code Reference

**File:** [frontend/src/components/tickets/TicketComments.tsx](../../frontend/src/components/tickets/TicketComments.tsx)

```tsx
setComments((currentComments) => [...(currentComments ?? []), newComment])
```

- Builds a new array, so React sees the change.

**File:** [frontend/src/components/common/Button.tsx](../../frontend/src/components/common/Button.tsx)

```tsx
{...rest}
```

- `...rest` in the parameters collected everything `Button` didn't name, like `onClick`. This line spreads it onto the real `<button>`.

**File:** [frontend/src/utils/formatDate.ts](../../frontend/src/utils/formatDate.ts)

```ts
...dateOptions,
```

- Copies the date settings into a new object, then adds the time settings.

### 4. Why We Used It

React needs new objects and arrays to detect changes, and spread is the simplest way to make them. Rest means `Button` doesn't have to list every possible HTML attribute.

### 5. Real-Time Scenario

An agent posts a comment. The new comment arrives from the service, and spread builds a new array containing the old comments plus the new one. React sees a different array, so the list updates and the heading count changes.

### 6. Interview Questions

- **Theory:** What's the difference between spread and rest?
- **Theory:** What is a shallow copy?
- **Practical:** How do you update an object in state?

### 7. Project-Based Answers

**What's the difference?**
Spread expands an array or object, and rest collects the remaining items. `Button` uses both: rest gathers unknown props, and spread applies them to the element.

**What is a shallow copy?**
Spread copies only the top level. Nested objects are still shared with the original, so changing one affects both. My ticket updates replace whole objects instead of changing nested values.

**How do you update an object in state?**
I create a new one. My filter handler does `{ ...currentFilters, ...changes }`. Later values win, so changed fields overwrite the old ones.

### 8. Follow-up Questions

- **Does property order matter with spread?** Yes. Later values overwrite earlier ones. In `Button`, `{...rest}` comes last, so a caller's props take priority over defaults applied earlier.
- **How do you deep copy an object?** Use `structuredClone`.
- **Why doesn't `push` work for React state?** It changes the same array, so React sees the same reference and doesn't update.

---

## Array Methods

### 1. Concept Explanation

| Method | Returns | Changes the original? |
|---|---|---|
| `map` | New array, same length, each item transformed | No |
| `filter` | New array with the matching items | No |
| `find` | First match, or `undefined` | No |
| `some` | `true` if any item matches | No |
| `reduce` | One combined value | No |
| `slice` | New array containing part of the original | No |
| `sort` | The same array, sorted | **Yes** |

### 2. Project Implementation

- `map` renders every list and table, and replaces an updated ticket.
- `filter` applies filters and removes a deleted ticket.
- `find` looks up a ticket or user.
- `some` checks for a duplicate email at sign-up.
- `sort` orders tickets, on a copy.

### 3. Code Reference

**File:** [frontend/src/services/previewBackend.ts](../../frontend/src/services/previewBackend.ts)

```ts
tickets = tickets.map((item) => (item.id === ticketId ? updatedTicket : item))
```

- Replaces one ticket and keeps the others, in a new array.

```ts
tickets = tickets.filter((ticket) => ticket.id !== ticketId)
```

- Removes a ticket by keeping all the others.

```ts
if (users.some((user) => user.email === normalizedEmail)) {
```

- Stops as soon as one match is found.

```ts
const sorted = [...filterTickets(visible, { search, status, priority })].sort(
```

- Copies before sorting, because `sort` changes the array it's called on.

**File:** [frontend/src/utils/getInitials.ts](../../frontend/src/utils/getInitials.ts)

```ts
.map((part) => part.charAt(0).toUpperCase()) // ["A", "M"]
```

### 4. Why We Used It

They describe the result you want, so they're easier to read than loops. They also return new arrays, which suits React, and Redux, which freezes stored objects.

### 5. Real-Time Scenario

An admin deletes ticket #1006. The backend uses `filter` to remove it and its comments. When Redux hears about it, its reducer also uses `filter`, so the ticket leaves the list without a full reload.

### 6. Interview Questions

- **Theory:** What's the difference between `map`, `filter`, `find` and `reduce`?
- **Theory:** What's the difference between `map` and `forEach`?
- **Practical:** Where have you used these?
- **Practical:** Which of them changes the original array?

### 7. Project-Based Answers

**What's the difference?**
`map` transforms each item, `filter` keeps matching items, `find` returns the first match, and `reduce` combines items into one value. I use `map` to render ticket rows and `filter` to count tickets by status.

**`map` versus `forEach`?**
`map` returns a new array. `forEach` returns nothing and is only for side effects. JSX needs returned values, so lists use `map`.

**Where have you used these?**
`getInitials` chains `split`, `slice`, `map` and `join`. `getDashboardStats` uses `filter` to count tickets, and `find` looks up a ticket by ID.

**Which changes the original?**
`sort` does, so I spread the array into a copy first. `reverse` and `push` also change the original.

### 8. Follow-up Questions

- **How would you write the status counts with `reduce`?** Start with zeroed counts, then add one to the matching status for each ticket, returning the running total.
- **Why does `sort` subtract dates?** The compare function returns a negative or positive number to set the order. `b - a` gives newest first.
- **What does `find` return if there's no match?** `undefined`, and TypeScript makes me handle that.

---

## Optional Chaining and Nullish Coalescing

### 1. Concept Explanation

- **`?.`** safely reads through a value that may be `null` or `undefined`. The whole expression gives `undefined` instead of crashing.
- **`??`** gives a fallback only when the left side is `null` or `undefined`.
- **`||`** gives a fallback for any falsy value, including `0` and `''`.

```js
0 || 10   // 10
0 ?? 10   // 0
```

### 2. Project Implementation

- `?.` for refs that may be empty, and form errors that may not exist.
- `??` for unassigned agents and error messages.

### 3. Code Reference

**File:** [frontend/src/components/tickets/TicketForm.tsx](../../frontend/src/components/tickets/TicketForm.tsx)

```tsx
error={errors.title?.message}
```

- Usually there's no error, so `errors.title` is `undefined`. Without `?.`, this would crash.

**File:** [frontend/src/components/tickets/TicketManagePanel.tsx](../../frontend/src/components/tickets/TicketManagePanel.tsx)

```tsx
value={ticket.assignedAgentId ?? ''}
```

- An unassigned ticket has `null`, and `''` selects the "Unassigned" option. An ID of `0` would be kept.

### 4. Why We Used It

Tickets genuinely can have no agent, and refs can be empty, so these values are expected. These operators handle them with very little code, and `??` avoids the bugs `||` can cause with `0` or `''`.

### 5. Real-Time Scenario

A customer opens a new ticket that nobody has picked up. `assignedAgentId` and `assignedAgentName` are both `null`. Thanks to `??`, the page shows "Unassigned" rather than a blank space.

### 6. Interview Questions

- **Theory:** What's the difference between `??` and `||`?
- **Theory:** What does `?.` return if the value is missing?
- **Practical:** Why did you choose `??` for the agent field?

### 7. Project-Based Answers

**`??` versus `||`?**
`||` falls back on any falsy value, and `??` only on `null` or `undefined`. If I used `||` on a value that could be `0`, a real value would be replaced.

**What does `?.` return?**
`undefined`, without throwing. `dialogRef.current?.focus()` in my `Modal` simply does nothing if the element isn't there.

**Why `??` for the agent field?**
Only `null` should mean unassigned. `??` says exactly that, so a valid value is never replaced.

### 8. Follow-up Questions

- **Can `?.` be overused?** Yes. Using it everywhere can hide bugs where a value should always exist. That's why `useCurrentUser` throws instead of returning null.
- **Does `?.` work with function calls?** Yes: `callback?.()`.
- **Which values are falsy?** `false`, `0`, `''`, `null`, `undefined` and `NaN`.

---

## Promises and async/await

### 1. Concept Explanation

JavaScript runs one thing at a time, so slow work like a network request must not block it. A **Promise** represents a result that arrives later. It's pending, then either fulfilled or rejected.

`async`/`await` is a more readable way to use Promises. An `async` function always returns a Promise, and `await` pauses that function until the Promise settles, without blocking the rest of the app.

### 2. Project Implementation

- **`previewBackend.ts`:** every function is async, like a real server call.
- **`dashboardSlice.ts`:** `Promise.all` loads two things together.
- **`CommentForm.tsx`:** `try`/`catch`/`finally` handles a failed post.
- **Local data loading:** `TicketComments` and `UsersPage` use `.then` and `.catch`.

### 3. Code Reference

**File:** [frontend/src/services/previewBackend.ts](../../frontend/src/services/previewBackend.ts)

```ts
function waitForNetwork(): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, 300))
}
```

- Creates a Promise that fulfills after 300ms, simulating network delay.

**File:** [frontend/src/features/dashboard/dashboardSlice.ts](../../frontend/src/features/dashboard/dashboardSlice.ts)

```ts
const [stats, recentTickets] = await Promise.all([getDashboardStats(), getTickets({ limit: 5 })])
```

- Starts both requests at once, and waits for both. If either fails, the whole thing fails.

**File:** [frontend/src/components/tickets/CommentForm.tsx](../../frontend/src/components/tickets/CommentForm.tsx)

```tsx
try {
  await onAddComment(trimmedMessage)
  setMessage('') // only cleared on success, so a failed post doesn't lose the text
} catch (caughtError) {
  setError(caughtError instanceof Error ? caughtError.message : 'We couldn\'t post your comment.')
} finally {
  setIsPosting(false) // finally runs whether the request worked or not
```

- The text clears only on success, so a failure doesn't lose the person's work.
- `finally` always turns off the loading state.

### 4. Why We Used It

Waiting for a server without blocking the UI is essential. `async`/`await` reads from top to bottom like normal code, and `try`/`catch` handles failures in one place.

### 5. Real-Time Scenario

A customer opens the dashboard. Stats and recent tickets are requested together, and the page shows a spinner while the rest of the app stays responsive. When both finish, the page updates at once. In this preview, that takes about 300ms in total, instead of about 600ms one after the other.

### 6. Interview Questions

- **Theory:** What is a Promise, and what states can it be in?
- **Theory:** Does `await` block the whole app?
- **Theory:** What's the difference between `Promise.all` and `Promise.allSettled`?
- **Practical:** How do you handle failed requests?
- **Practical:** Where have you used `Promise.all`?

### 7. Project-Based Answers

**What is a Promise?**
An object representing a future result. It starts pending, then becomes fulfilled or rejected. All my service functions return Promises.

**Does `await` block the whole app?**
No. It pauses only that function, and JavaScript's event loop keeps handling clicks and rendering. That's why my spinner can animate while data loads.

**`all` versus `allSettled`?**
`all` rejects as soon as one fails. `allSettled` waits for everything and reports each result. I use `all` on the dashboard because the page has one error state. `allSettled` would suit showing partial results.

**How do you handle failed requests?**
With `try`/`catch` around `await`, showing the message in the UI. In `CommentForm`, the typed text stays on failure so nothing is lost, and `finally` turns off the loading state either way.

**Where have you used `Promise.all`?**
In the `fetchDashboard` thunk, to load stats and recent tickets together.

### 8. Follow-up Questions

- **What is the event loop?** It runs queued work when the call stack is empty, handling Promise callbacks before timers. That's how one thread can stay responsive.
- **What happens if you forget `await`?** You get a pending Promise rather than the value, and `try`/`catch` won't catch its rejection.
- **Why not `await` inside a `useEffect` callback directly?** An effect must return a cleanup function or nothing, while an `async` function returns a Promise. So you call an async function inside it, or use `.then`.

---

## Closures

### 1. Concept Explanation

A closure is a function that remembers the variables from where it was created, even after that outer code has finished running.

```js
function makeCounter() {
  let count = 0
  return () => ++count   // still has access to count
}
```

### 2. Project Implementation

- **`TicketComments`:** an `isCancelled` flag, shared by the callback and the cleanup.
- **`useDebounce`:** the cleanup remembers which timer to cancel.
- **Event handlers:** they read the props and state from their render.

### 3. Code Reference

**File:** [frontend/src/components/tickets/TicketComments.tsx](../../frontend/src/components/tickets/TicketComments.tsx)

```tsx
let isCancelled = false

getComments(ticketId)
  .then((loadedComments) => {
    if (!isCancelled) setComments(loadedComments)
  })
```

```tsx
return () => {
  isCancelled = true
}
```

- The `.then` callback and the cleanup both close over the same `isCancelled` variable.
- If the cleanup runs first, the callback sees `true` and ignores the late response.

### 4. Why We Used It

A response can arrive after someone has already left the page, and each effect run needs its own flag. A closure gives each run its own private variable, with no global state.

### 5. Real-Time Scenario

An agent opens a ticket, then leaves before the comments load. The cleanup sets `isCancelled` to true. When the response arrives, its callback checks that same variable and does nothing, so old data doesn't get shown.

### 6. Interview Questions

- **Theory:** What is a closure?
- **Theory:** What is a stale closure?
- **Practical:** Where have you used closures in your project?

### 7. Project-Based Answers

**What is a closure?**
A function that keeps access to variables from the scope where it was created. In `useDebounce`, the cleanup function remembers its own `timer`, so it cancels the right one.

**What is a stale closure?**
A function holding old values from an earlier render. A `useCallback` with a missing dependency can cause this. My filter handler avoids it by using the function form of `setFilters`, which always receives the latest state.

**Where have you used closures?**
My data-loading effects use a closed-over `isCancelled` flag to ignore late responses. Every event handler is a closure too, reading props and state from its render.

### 8. Follow-up Questions

- **Do closures cause memory leaks?** They can if something long-lived, like a forgotten listener, keeps them alive. Removing listeners in cleanups prevents that.
- **Why `let` rather than `const` for `isCancelled`?** Because the cleanup changes its value.
- **How would you handle this with Redux?** There, I use `request.abort()` instead of a flag.

---

## Events: Bubbling and Default Behavior

### 1. Concept Explanation

When you click an element, the event travels **up** through its parents. This is called bubbling. `stopPropagation()` stops that journey.

Separately, browsers have default behaviors, such as a form reloading the page on submit. `preventDefault()` cancels that.

### 2. Project Implementation

- **`Modal`:** stops clicks inside the dialog from reaching the backdrop.
- **`CommentForm`, `TopNav`:** stop the form submission from reloading the page.

### 3. Code Reference

**File:** [frontend/src/components/common/Modal.tsx](../../frontend/src/components/common/Modal.tsx)

```tsx
<div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4" onClick={onClose}>
```

```tsx
onClick={(event) => event.stopPropagation()}
```

- The backdrop closes the modal on click, and the dialog sits inside it. Stopping the click there means only clicks on the backdrop itself close it.

**File:** [frontend/src/components/tickets/CommentForm.tsx](../../frontend/src/components/tickets/CommentForm.tsx)

```tsx
event.preventDefault() // stops the browser from reloading the page
```

### 4. Why We Used It

Without `stopPropagation`, clicking inside the modal would close it. Without `preventDefault`, submitting a form would reload the page and lose all React state.

### 5. Real-Time Scenario

An admin opens the delete modal and clicks its text. The click bubbles to the dialog, where it stops, so the modal stays open. If they click the dark area outside it, the backdrop's handler runs and it closes.

### 6. Interview Questions

- **Theory:** What is event bubbling?
- **Theory:** What's the difference between `preventDefault` and `stopPropagation`?
- **Practical:** Where have you used them?

### 7. Project-Based Answers

**What is event bubbling?**
An event fires on its target, then on each parent in turn. My modal backdrop would receive clicks from inside the dialog if I didn't stop them.

**What's the difference?**
`preventDefault` cancels the browser's default action, like a form's page reload. `stopPropagation` stops the event from reaching parents. They're independent of each other.

**Where have you used them?**
`stopPropagation` in my `Modal`, so clicks inside don't close it. `preventDefault` in `CommentForm` and the top bar search. React Hook Form's `handleSubmit` calls it for my other forms.

### 8. Follow-up Questions

- **What is event delegation?** One listener on a parent handles events from its children. React does this internally, attaching listeners at the root.
- **What's the difference between `event.target` and `event.currentTarget`?** `target` is what was actually clicked, and `currentTarget` is the element with the handler.
- **Could the modal avoid `stopPropagation`?** Yes, the backdrop could check `event.target === event.currentTarget`.

---

## ES Modules

### 1. Concept Explanation

Modules split code across files. A file makes something available with `export`, and other files use it with `import`.

```js
export function add() {}           // named export
export default store               // default export, one per file
import { add } from './math'       // named: must match the name
import store from './store'        // default: you choose the name
```

### 2. Project Implementation

MiniDesk uses named exports for components, Hooks and helpers, and default exports for `App` and each slice's reducer. Slices import their service with `import * as ticketService`.

### 3. Code Reference

**File:** [frontend/src/features/tickets/ticketsSlice.ts](../../frontend/src/features/tickets/ticketsSlice.ts)

```ts
import * as ticketService from '../../services/ticketService'
```

```ts
export default ticketsSlice.reducer
```

**File:** [frontend/src/store/store.ts](../../frontend/src/store/store.ts)

```ts
import ticketsReducer from '../features/tickets/ticketsSlice'
```

- The default export can have any name when imported, so it's clearly the reducer here.

### 4. Why We Used It

Modules give each file one job, and the build tool can remove unused exports. Named exports also mean a typo in an import becomes an error.

### 5. Real-Time Scenario

When the app builds, Vite follows these imports starting from `main.tsx`, working out everything the app uses and bundling it. Exports that nothing imports can be left out, which keeps downloads smaller.

### 6. Interview Questions

- **Theory:** What's the difference between named and default exports?
- **Theory:** What is tree shaking?
- **Practical:** How did you organize imports and exports?

### 7. Project-Based Answers

**Named versus default?**
A file can have many named exports, imported by their exact names, but only one default, which can be imported under any name. I use named exports for most things, because a wrong name becomes an error.

**What is tree shaking?**
The build tool removing exports that nothing uses. It's why I can import single icons from `lucide-react` without shipping the whole library.

**How did you organize them?**
By job: `components`, `pages`, `hooks`, `services`, `features` and `store`. Pages import from these folders, and components never call `previewBackend` directly.

### 8. Follow-up Questions

- **What does `import type` do?** It imports only for type checking, and it's removed from the final JavaScript.
- **ES Modules versus CommonJS?** ES Modules use `import` and are statically analyzed. CommonJS uses `require` and was Node's original system.
- **What is code splitting?** Loading parts of an app only when needed, using a dynamic `import()`. MiniDesk doesn't use it yet.
