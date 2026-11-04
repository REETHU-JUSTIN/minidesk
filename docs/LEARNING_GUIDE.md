# MiniDesk Learning Guide

This guide grows with each phase. It explains what was built, why, and how the pieces connect.

## Phase 1: Project setup and UI design

### What exists after this phase

A React app that shows every page of MiniDesk using sample data. It looks like the finished product but does not behave like it yet.

| Works now | Comes later |
|---|---|
| Page navigation, using a temporary method | React Router (Phase 4) |
| Pagination over the sample tickets | Pagination from the API (Phase 7) |
| Mobile menu and delete confirmation modal | Actually deleting a ticket (Phase 7) |
| Forms you can type in | Validation and submitting (Phases 3 and 7) |
| Search box and filter dropdowns you can see | Search and filtering (Phase 3) |

### How the app starts

1. The browser loads `index.html`, which has an empty `<div id="root">` and a script tag for `main.tsx`.
2. Vite compiles the TypeScript and JSX, and sends it to the browser as JavaScript the browser can run.
3. `main.tsx` calls `createRoot(...).render(<App />)`, so React takes control of that div.
4. `App.tsx` reads the URL, picks a page and returns it.
5. React compares the result with what's on screen and updates only the DOM elements that changed.

`StrictMode` in `main.tsx` is a development-only check. It runs effects twice on first mount to expose missing cleanup, so a doubled log in development is expected.

### File guide

#### `frontend/vite.config.ts`

- **What it is:** Vite's configuration.
- **Why we need it:** It registers two plugins. `react()` handles JSX and fast refresh, and `tailwindcss()` generates the CSS.
- **Connects to:** Everything Vite compiles, including `index.css`.

#### `frontend/src/index.css`

- **What it is:** The one global stylesheet, and the home of the design tokens.
- **How it works:** Tailwind scans your files for class names and generates CSS only for those it finds. Each value in `@theme` also creates utilities, so `--color-primary` gives you `bg-primary`, `text-primary` and more.
- **Why tokens matter:** To change the brand color, you edit one line instead of every component.

#### `components/common/Button.tsx`

- **What it is:** The shared button, and the best file to read first.
- **Concepts:** Props, destructuring, default values, rest and spread, union types, conditional rendering.

```tsx
type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger'
```
A union type. Passing `variant="purple"` becomes a compile error, so typos are caught before the code runs.

```tsx
const variantClasses: Record<ButtonVariant, string> = { ... }
```
`Record` requires one entry per variant. If you add a variant to the union and forget its classes, TypeScript reports an error.

```tsx
interface ButtonProps extends ComponentProps<'button'> {
```
Inherits every normal button prop, such as `onClick` and `aria-label`, without listing them.

```tsx
export function Button({ variant = 'primary', isLoading = false, className = '', children, disabled, type = 'button', ...rest }: ButtonProps) {
```
Destructuring pulls out the props this component uses and gives them defaults. `...rest` collects everything else. `type = 'button'` matters because a `<button>` inside a form submits that form by default.

```tsx
disabled={disabled || isLoading}
```
A loading button can't be clicked, which prevents double submissions.

```tsx
{...rest}
```
Spreads the remaining props onto the real `<button>`, so `onClick` reaches it.

```tsx
{isLoading && <Loader2 ... />}
```
Conditional rendering. If `isLoading` is false, React renders nothing for this expression.

#### `components/common/Input.tsx`, `Select.tsx`, `Textarea.tsx`

- **What they are:** Form fields with a label and an error message.
- **Why they matter:** `htmlFor` links the label to the field by `id`. `aria-invalid` and `aria-describedby` tell screen readers that the field has an error and where to find it.
- **Why three similar files:** A shared abstraction would save a few lines but would be harder to read while you're learning.

#### `components/common/Badge.tsx`

- **What it is:** A generic `Badge`, plus `StatusBadge`, `PriorityBadge` and `RoleBadge`.
- **Why it's split this way:** Pages say `<StatusBadge status="open" />` and never need to know that "open" is blue. The mapping lives in one place.
- **Accessibility:** Every badge has text, so meaning never relies on color alone.

#### `components/common/Pagination.tsx`

- **Concept:** Lifting state up. It holds no state of its own. The parent owns `page` and passes it down, and the child reports clicks through `onPageChange`. A parent can then use the page number for other things, such as an API request.

#### `components/common/Modal.tsx`

- **Concepts:** `useRef`, `useEffect`, effect cleanup, event propagation.

```tsx
const dialogRef = useRef<HTMLDivElement>(null)
```
A box that holds the dialog's DOM element. Changing a ref doesn't cause a re-render.

```tsx
useEffect(() => {
  if (!isOpen) return
```
Effects run after React updates the screen. If the modal is closed, there's nothing to do.

```tsx
  dialogRef.current?.focus()
```
Moves keyboard focus into the dialog. `?.` guards against the ref being empty.

```tsx
  document.addEventListener('keydown', handleKeyDown)
  return () => document.removeEventListener('keydown', handleKeyDown)
}, [isOpen, onClose])
```
The returned function is the cleanup. React runs it before the effect runs again and when the component unmounts. The array lists the values the effect depends on.

```tsx
onClick={(event) => event.stopPropagation()}
```
Clicks bubble up through parent elements. Without this line, a click inside the dialog would reach the backdrop and close the modal.

#### `components/layout/AppLayout.tsx`, `Sidebar.tsx`, `TopNav.tsx`

- **What they are:** The shell around every signed-in page. `children` is whichever page is showing.
- **State:** `isMenuOpen` lives in `AppLayout` because both `TopNav` (opens the menu) and `Sidebar` (shows and closes it) need it. Their closest shared parent is the right owner.
- **Responsive sidebar:** Below the `md` breakpoint, it's fixed and moved off-screen with `-translate-x-full`. At `md` and above, `md:sticky md:translate-x-0` keeps it in place. Tailwind is mobile-first: unprefixed classes apply everywhere, and prefixed ones apply from that width up.

#### `App.tsx`

- **What it is:** Temporary page switching, replaced in Phase 4.
- **How it works:**
  1. `useState(getPageFromUrl)` reads the URL once on first render. Passing the function itself is called lazy initialization.
  2. `useEffect` subscribes to the browser's `hashchange` event.
  3. Clicking `<a href="#users">` changes the hash, the event fires, state updates and React re-renders.
  4. The cleanup unsubscribes when the component unmounts.
- **Why not React Router yet:** Your phase plan introduces it in Phase 4, and this version lets you see the problem a router solves.

#### `utils/previewData.ts`

Sample tickets and users. Phase 7 deletes this file. The sample names and emails use `example.com` and aren't real people.

#### `pages/*`

One component per screen. Each composes the shared components and contains little styling logic of its own. `TicketListPage` shows derived state: `totalPages` and `ticketsOnPage` are calculated from `page` during render and aren't stored in their own state, because storing them could let them fall out of sync.

### Hooks used in this phase

| Hook | Where | Why it's the right tool |
|---|---|---|
| `useState` | `AppLayout`, `TicketListPage`, `TicketDetailsPage`, `App` | The screen needs to change when the value changes |
| `useEffect` | `Modal`, `App` | Syncing with something outside React: browser events and DOM focus |
| `useRef` | `Modal` | Reaching a DOM element without triggering a re-render |

`useMemo` and `useCallback` aren't used yet because nothing needs them. They arrive in Phase 3.

### Design decisions

- **Stat tiles for the counts:** A single number is easiest to read as a number.
- **Status overview as labeled bars:** Three values don't need a charting library. The color palette was run through a validator: amber has low contrast on white and is close to green for colorblind users, so every bar also has a visible label and number.
- **Rounded percentages:** The sample shows 38%, 38% and 25%, which adds up to 101%. Rounding does this, and the counts beside them are exact.

### Bug found during testing

On a phone, the Dashboard scrolled sideways by 29 pixels. A grid column without an explicit size grows to fit its content, and truncated text still reports its full width. Adding `grid-cols-1` sets the column to `minmax(0, 1fr)`, which allows it to shrink. Type checking and building both passed with this bug present, which is why it's worth testing in a real browser too.

### Practice exercises

1. Add a `success` variant to `Button`. Add it to the union first and read the TypeScript error before fixing it.
2. Change `--color-primary` to `#0f766e` in `index.css` and watch the whole app update. Then change it back.
3. Add a `size` prop to `Button` with `sm` and `md` options, defaulting to `md`.
4. Add a fifth tile to the Dashboard for high-priority tickets by counting them from `previewTickets`.
5. Remove `event.stopPropagation()` from `Modal`, click inside the dialog and explain what happens. Then restore it.
6. Remove the cleanup from the `Modal` effect, add a `console.log` in `handleKeyDown`, open and close the modal several times, and press a key. Explain the output. Then restore it.

## Phase 2: TypeScript and modern JavaScript

### What changed

The screens look the same, but the code behind them changed. Every page now uses one shared definition of what a ticket, user and comment look like, so a mistake in that data shows up as an error in your editor.

### TypeScript, from the beginning

TypeScript is JavaScript plus labels that say what kind of data each value holds. The labels are checked while you develop, then removed. The browser only ever runs plain JavaScript.

**Important limit:** TypeScript can't check data that arrives while the app is running, such as an API response. If the server sends the wrong shape, TypeScript won't notice. That's why the backend also validates data in Phase 5.

#### The basics

```ts
let title: string = 'Login issue'   // text
let ticketId: number = 1008         // numbers, including decimals
let isOpen: boolean = true          // true or false
let sameTitle = 'Login issue'       // inferred: TypeScript works out that it's a string
```

You don't need to label everything. Label function inputs and shared data, and let TypeScript infer the rest.

#### Union types: one of these values

```ts
export type TicketStatus = 'open' | 'in_progress' | 'resolved'
```

Assigning `'banana'` is now an error. Without this, the type would just be `string`, and a typo would only show up as a bug later.

#### Interfaces: the shape of an object

```ts
export interface User {
  id: number
  name: string
  email: string
  role: UserRole
  createdAt: string
}
```

Each object must have all of these fields, with these types and no extras. `User` has no password field on purpose, so `{ ..., password: 'x' }` is an error.

#### Optional versus nullable

These look similar but mean different things:

```ts
variant?: ButtonVariant           // optional: the prop can be left out entirely
assignedAgentId: number | null    // nullable: the field must exist, but its value can be null
```

A ticket always has an `assignedAgentId` field. It's `null` until someone is assigned.

#### Arrays

```ts
export const previewTickets: Ticket[] = [ ... ]
```

`Ticket[]` means "an array of tickets". TypeScript then knows that `ticket` inside `previewTickets.map((ticket) => ...)` is a `Ticket`, so you get autocomplete without writing that type again.

#### Narrowing: proving a value is safe

`find` might not find anything, so it returns `Ticket | undefined`:

```ts
const ticket = previewTickets.find((item) => item.id === PREVIEW_TICKET_ID)

ticket.title            // Error: ticket might be undefined

if (!ticket) {
  return <ErrorMessage message="We couldn't find that ticket." />
}

ticket.title            // OK: if we reached this line, ticket exists
```

TypeScript follows your `if` checks. This is called narrowing, and it's what prevents the common runtime crash "Cannot read properties of undefined".

#### Generics: a type with a blank to fill in

Without generics, you'd need one `paginate` function for tickets and another for users. `T` is a placeholder:

```ts
export function paginate<T>(items: T[], page: number, pageSize: number): PaginatedResponse<T> {
```

Reading it step by step:

1. `<T>` declares the placeholder.
2. `items: T[]` says the input is an array of `T`.
3. `PaginatedResponse<T>` says the output holds that same type.
4. Passing `previewTickets` makes `T` become `Ticket`, so the result's `items` is `Ticket[]`.

You've already been using generics. `Record<TicketStatus, string>` and `useRef<HTMLDivElement>(null)` both fill in blanks in someone else's type.

#### Indexed access: reuse a field's type

```ts
const countByStatus = (status: Ticket['status']) => ...
```

`Ticket['status']` means "whatever type the `status` field has", so this can't fall out of sync with the interface.

### Modern JavaScript used in this project

These are JavaScript features, not TypeScript. They work the same in both.

| Feature | Example from the code | What it does |
|---|---|---|
| `const` and `let` | `const PAGE_SIZE = 5` | `const` can't be reassigned, and `let` can. Prefer `const` |
| Arrow functions | `(ticket) => ticket.title` | A shorter way to write a function |
| Template literals | `` `Comments (${comments.length})` `` | Puts values inside text |
| Object destructuring | `const { name, email, role } = previewCurrentUser` | Pulls out named fields |
| Renaming while destructuring | `const { items: ticketsOnPage } = paginate(...)` | Pulls out `items` and calls it `ticketsOnPage` |
| Spread | `{ ...dateOptions, hour: 'numeric' }` | Copies an object's fields into a new object |
| Rest | `{ label, ...rest }` | Collects the remaining fields |
| Property shorthand | `{ page, totalItems }` | Short for `{ page: page, totalItems: totalItems }` |
| `map` | `tickets.map((t) => <li>...</li>)` | Creates a new array by transforming each item |
| `filter` | `users.filter((u) => u.role === 'agent')` | Creates a new array of matching items |
| `find` | `tickets.find((t) => t.id === 1006)` | Returns the first match, or `undefined` |
| `slice` | `tickets.slice(0, 5)` | Copies part of an array without changing the original |
| Optional chaining `?.` | `dialogRef.current?.focus()` | Stops safely if the left side is null or undefined |
| Nullish coalescing `??` | `ticket.assignedAgentId ?? ''` | Uses the right side only if the left is null or undefined |
| Ternary | `total === 0 ? 0 : count / total` | A short if/else that produces a value |
| Modules | `import { formatDate } from '../utils/formatDate'` | Shares code between files |

**`??` versus `||`:** `||` falls back on any falsy value, including `0` and `''`. `??` falls back only on `null` and `undefined`. If an ID could be `0`, `id || ''` would wrongly replace it, while `id ?? ''` wouldn't.

`async`/`await` and Promises aren't here yet because nothing is loading over a network. They arrive with the API in Phases 5 and 7.

### File guide

#### `types/index.ts`

- **What it is:** The single definition of the app's data.
- **Why we need it:** Every page and helper imports from here, so changing a field shows you every place affected.
- **How it connects:** Phase 7 uses these types for API responses, and they mirror the tables built in Phase 6.
- **Naming:** `TicketComment` isn't called `Comment` because browsers already have a built-in `Comment` type.

#### `utils/ticketLabels.ts`

- **What it is:** Display text for each status, priority and category, plus the dropdown order.
- **Why we need it:** "In Progress" used to be written in several places. Now the badge and dropdowns share one definition.
- **How `Record` helps:** If you add a status to the union and forget its label, the code won't compile.

#### `utils/formatDate.ts`

- **What it does:** Turns `'2026-11-03T12:00:00Z'` into `Nov 3, 2026`.
- **Why dates are text:** JSON has no date type, so APIs send dates as text. The `Z` means UTC.
- **Time zones:** `formatDateTime` shows the viewer's local time. A comment stored as 12:12 UTC displayed as 5:42 PM during testing, because the test machine runs at UTC+5:30.

#### `utils/getInitials.ts`

A chain of array and string methods where each step feeds the next. It uses `charAt(0)` rather than `part[0]` because `charAt` returns an empty string for an empty name, whereas `part[0]` gives `undefined` and calling `.toUpperCase()` on that would crash.

#### `utils/previewData.ts`

Still temporary, and now fully typed. `getDashboardStats` and `paginate` do jobs that SQL takes over in Phase 6, so all of this file gets deleted in Phase 7.

### Flow: from data to screen

Here's what happens when the ticket list renders:

1. `TicketListPage` calls `paginate(previewTickets, page, PAGE_SIZE)`.
2. Destructuring pulls out `items` and `totalPages`.
3. `ticketsOnPage.map(...)` turns each `Ticket` into a table row.
4. `formatDate` turns the stored date into readable text.
5. `<StatusBadge status={ticket.status} />` looks up its color and label.

TypeScript has checked every one of these connections before the code runs.

### How this phase was tested

A temporary file assigned 9 deliberately wrong values, such as a status of `'banana'` and a `User` with a password. Each line was marked `@ts-expect-error`, which makes the type check fail if that line does *not* produce an error. It passed, proving the types reject bad data. The file was then deleted.

You can use the same trick when you want to test a type.

### Practice exercises

1. In `types/index.ts`, add `'closed'` to `TicketStatus`. Run `npx tsc -b` and read every error. Fix them all, then undo your changes. This shows why `Record` is useful.
2. In `TicketDetailsLoader`, delete the `if (selectedTicket?.id !== ticketId)` check and read the error. Then restore it.
3. Write `getOverdueTickets(tickets: Ticket[]): Ticket[]`, which returns unresolved tickets created before a given date.
4. Write `countTicketsByPriority(tickets: Ticket[]): Record<TicketPriority, number>` using `reduce`.
5. Write a generic `getFirstItem<T>(items: T[]): T | undefined`. Hover over the result in your editor when you pass it tickets, then users.
6. In `TicketManagePanel`, change `value={ticket.assignedAgentId ?? ''}` to use `||` and explain why it would misbehave if an agent's ID were `0`.

## Phase 3: React components, props and Hooks

### What works now

| Works now | What's still missing |
|---|---|
| Search with a short delay, status and priority filters, Clear filters | They run on sample data in the browser, until Phase 7 |
| Validation on the login, register, create ticket and comment forms | A valid form still doesn't sign in or save anything (Phase 7) |
| Adding comments and changing status or agent on a ticket | Changes are lost on reload (Phase 7) |
| Notification and profile menus | Top bar search (Phase 4). My Tickets shows the same list as All Tickets (Phase 4) |
| Delete confirmation modal | Its Delete button only closes the modal (Phase 7) |

### Splitting pages into components

`TicketListPage` used to hold all of its own markup. It's now mostly coordination:

```
TicketListPage          owns: filters, page
├── TicketFilters       shows the filters and reports changes
├── TicketTable         shows whichever rows it's given
└── Pagination          shows the page and reports clicks

TicketDetails           owns: status, agent, comments, modal open or closed
├── CommentList         shows comments
├── CommentForm         owns only its own draft text and error
├── TicketManagePanel   shows the dropdowns and reports changes
└── Modal
```

**The pattern:** data flows down through props and events flow up through callback functions. Most children hold no data of their own, so `TicketTable` can display any list of tickets without knowing how it was found. That makes it easy to reuse and test.

**Where state lives:** in the lowest component that needs it. `CommentForm` owns its draft text because nothing else needs it. The finished comments live in `TicketDetails`, because `CommentList` needs them too and the heading shows the count.

### Hooks: where each one is used and why

| Hook | Where | Why it's the right tool here |
|---|---|---|
| `useState` | Filters, page, comments, menus | The screen must change when the value changes |
| `useEffect` | `useDebounce`, `useCloseOnOutside`, `Modal` | Syncing with things outside React: timers, document events and focus |
| `useRef` | `CommentForm`, both menus, `Modal` | Reaching a DOM element without causing a re-render |
| `useMemo` | `TicketListPage` | Skips re-filtering on keystrokes that don't change the debounced search |
| `useCallback` | `TicketListPage`, `TicketDetails` | Keeps a function the same between renders, because something depends on that |
| `useForm` | `TicketForm`, login, register | React Hook Form's hook, which handles field values, validation and errors |

**Being honest about `useMemo`:** with 8 tickets, filtering is so fast you could never measure the difference. It's here because the pattern is real and interviewers ask about it. In a real project, reach for it only when a calculation is actually slow or when a stable value is needed. It also isn't in the Dashboard as I first planned, because that page has no state and so never re-renders to save anything.

### Important code, line by line

#### `hooks/useDebounce.ts`

```ts
export function useDebounce<T>(value: T, delay: number): T {
```
A custom hook is just a function whose name starts with `use` and which calls other Hooks. The generic means it works with any type of value.

```ts
  const [debouncedValue, setDebouncedValue] = useState(value)
```
A second, delayed copy of the value.

```ts
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delay)
    return () => clearTimeout(timer)
  }, [value, delay])
```
Here's what happens when you type "bug" quickly:

1. Typing `b` starts a 300ms timer.
2. Typing `u` changes `value`, so React runs the cleanup first, cancelling the first timer. Then it starts a new one.
3. Typing `g` does the same.
4. You stop. The last timer finishes, and `debouncedValue` becomes `"bug"`.

Without the cleanup, all three timers would fire. The cleanup is what makes this a debounce.

#### `pages/TicketListPage.tsx`

```ts
const handleFilterChange = useCallback((changes: Partial<TicketFilterValues>) => {
  setFilters((currentFilters) => ({ ...currentFilters, ...changes }))
  setPage(1)
}, [])
```

- **`Partial<TicketFilterValues>`:** an object with some or all of the filter fields, so a caller can send only `{ status: 'open' }`.
- **`setFilters((currentFilters) => ...)`:** the function form reads the latest state. It's the safe choice when the new state depends on the old state.
- **`{ ...currentFilters, ...changes }`:** copies the old fields, then overwrites the changed ones. Later values win.
- **`setPage(1)`:** page 2 may not exist in the new results. It's set here rather than in an effect, because it's caused by this event.
- **`[]`:** state setters never change, so this function never needs recreating.

**Why `memo` and `useCallback` must work together:** in JavaScript, two separately created functions are never equal, even with identical code. `memo` skips a re-render only if every prop is unchanged. Without `useCallback`, each parent render would create a new function, `memo` would see a changed prop, and the optimization would do nothing. During testing, a temporary counter showed `TicketFilters` rendering 0 times across page changes, and rendering again when typing changed its props.

#### `pages/TicketDetailsPage.tsx`: the Rules of Hooks

```tsx
export function TicketDetailsPage() {
  const ticket = previewTickets.find(...)
  if (!ticket) {
    return <ErrorMessage ... />
  }
  return <TicketDetails ticket={ticket} />
}
```

React identifies Hooks by the order they're called in, so they must run in the same order on every render. They can't go after an early return, or inside `if` statements or loops. Moving them into a child component that renders only when the ticket exists solves this cleanly, and `ticket` is guaranteed to exist in there.

```ts
setComments((currentComments) => [...currentComments, newComment])
```
State is never changed directly. `comments.push(...)` would keep the same array, so React would see no change and wouldn't update the screen. This builds a new array instead.

```ts
const [comments, setComments] = useState(() => previewComments.filter(...))
```
Lazy initialization: the filter runs only on the first render.

#### `hooks/useCloseOnOutside.ts`

```ts
const clickedInside = containerRef.current?.contains(event.target as Node)
if (!clickedInside) onClose()
```
`contains` checks whether the clicked element is inside the menu. `as Node` is a type assertion: `event.target` could be something that isn't a page element, and we're telling TypeScript that here it is. Use `as` sparingly, because TypeScript trusts it without checking.

**Why this one is a custom hook:** both menus need exactly the same logic, so there's a real reason to share it.

### Two ways to build a form

MiniDesk has both, so you can compare them.

**By hand: `CommentForm.tsx` (controlled input).** React state holds the value:

```tsx
const [message, setMessage] = useState('')
<Textarea value={message} onChange={(event) => setMessage(event.target.value)} />
```

You write everything yourself: the state, the error, `preventDefault` and the validation. That's fine for one field, but it adds up quickly with four.

**With React Hook Form: `TicketForm.tsx`.**

```tsx
const { register, handleSubmit, reset, formState: { errors } } = useForm<CreateTicketInput>({ defaultValues })
<Input error={errors.title?.message} {...register('title', ticketTitleRules)} />
<form noValidate onSubmit={handleSubmit(submitValidForm)}>
```

- **`register('title', rules)`:** returns `name`, `onChange`, `onBlur` and `ref`, and the spread passes them to the input.
- **`handleSubmit(fn)`:** calls `event.preventDefault()`, validates, and calls `fn` only if every field is valid.
- **`errors.title?.message`:** the message for that field, if there is one. `?.` is needed because there's usually no error.

By default, the library keeps values in the inputs themselves (uncontrolled) rather than in React state, so typing doesn't re-render the whole form. For long forms, that's a real advantage.

**Why `Input` works with `register`:** in React 19, `ref` is a normal prop. It arrives in `...rest` and gets spread onto the real `<input>`. Older React versions needed a wrapper called `forwardRef`, which you'll see in existing code.

**Client validation isn't security.** It gives people fast feedback, but anyone can skip it by calling the API directly. Phase 5 repeats these checks on the server.

### Using `key` to reset state

```tsx
'my-tickets': { content: <TicketListPage key="my-tickets" /> },
'all-tickets': { content: <TicketListPage key="all-tickets" /> },
```

React keeps a component's state if the same component type stays in the same position. Without different keys, filters would carry over from My Tickets to All Tickets. A different `key` tells React it's a different component, so it creates a fresh one with fresh state. Testing confirmed the filters now reset.

### Practice exercises

1. Change the debounce delay from 300 to 2000 in `TicketListPage`, then type in the search box. Say out loud what's happening at each moment. Then change it back.
2. Remove `clearTimeout` from `useDebounce`, add a `console.log` inside the timer and type quickly. Explain the output. Then restore it.
3. Add a `console.log` to `TicketFilters`, then remove `useCallback` from `handleClearFilters` and click Next. What changes, and why? Restore it afterwards.
4. Replace `setComments` with `comments.push(newComment); setComments(comments)`. What breaks, and why? Restore it afterwards.
5. Add a required "Phone number" field to the register form using `register`, with a rule of your own. Then remove it.
6. Convert `CommentForm` to React Hook Form, then compare the two versions. Which do you prefer for one field?
7. Show "Showing X of Y tickets" above the table. Which component should calculate it, and why?

## Phase 4: React Router, Context API and Redux Toolkit

Earlier sections describe the code as it was in those phases. This phase replaced the hash navigation in `App.tsx`, removed the preview dropdown and the temporary design system page, and moved filtering out of `TicketListPage`, so its `useMemo` is gone too.

### What works now

Sign in on the login page with one of these accounts, using any password until Phase 7:

| Email | Role |
|---|---|
| `admin@example.com` | Admin |
| `sam@example.com` | Agent |
| `priya@example.com` | Customer |

| Works now | What's still temporary |
|---|---|
| Real URLs, the Back button and links you can bookmark | |
| Sign-in, sign-up, sign-out, and staying signed in after a refresh | Passwords aren't checked |
| Pages and buttons that depend on role | The rules run in the browser, until Phase 5 puts them on the server |
| Creating, editing, assigning and deleting tickets, and adding comments | Everything resets when the page reloads |
| Real loading and error states | The data comes from `previewBackend.ts`, not a server |

### Why two kinds of global state

This is one of the most common React interview topics.

| | Context | Redux Toolkit |
|---|---|---|
| **Used for here** | Who is signed in | Tickets and dashboard data |
| **Why** | Simple, changes rarely, and many components only read it | Async loading, errors, and several pages reading and updating it |
| **Extra library** | No, it's built into React | Yes |
| **Re-renders** | Every component using the context, whenever its value changes | Only components whose selected data changed |

Comments and the user list use a third option, **local state**, because only one component needs them. Start with local state, and move something up only when you have a reason.

No data is held in two of these places. Keeping copies in sync is a classic source of bugs.

### React Router

#### How routes fit together

```tsx
<Route element={<ProtectedRoute />}>
  <Route element={<AppLayout />}>
    <Route path="/dashboard" element={<DashboardPage />} />
    <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
      <Route path="/users" element={<UsersPage />} />
    </Route>
  </Route>
</Route>
```

A route with `element` but no `path` is a **layout route**. It wraps the routes inside it, and each one renders `<Outlet />` where the next level should appear. Visiting `/users` runs this chain:

1. `ProtectedRoute` checks that someone is signed in, then renders its Outlet.
2. `AppLayout` draws the sidebar and top bar, then renders its Outlet.
3. The inner `ProtectedRoute` checks for the admin role, then renders its Outlet.
4. `UsersPage` appears.

#### The router tools used

| Tool | Where | What it does |
|---|---|---|
| `Link`, `NavLink` | Throughout | Changes the URL without reloading the page. `NavLink` also knows when it's active |
| `useNavigate` | `TopNav`, logout, after creating a ticket | Changes page from code |
| `useParams` | `TicketDetailsPage` | Reads `:ticketId` from the URL |
| `useSearchParams` | `TicketListPage` | Reads `?search=` from the URL |
| `useLocation` | `ProtectedRoute` | Tells it the current URL |
| `Navigate` | `ProtectedRoute`, `GuestRoute` | Redirects while rendering |

#### `components/layout/ProtectedRoute.tsx`

```tsx
if (isRestoringSession) {
  return <Spinner />
}
```
Without this wait, a refresh would briefly see "no user yet" and send a signed-in person to the login page.

```tsx
if (!user) {
  return <Navigate to="/login" replace state={{ from: location.pathname + location.search }} />
}
```
- **`replace`:** swaps the current history entry, so the Back button doesn't return to the page that redirected you.
- **`state`:** remembers where you were going. `GuestRoute` reads it after login and sends you there.

**This isn't security.** Anyone can edit code running in their own browser, so this only controls what the screen shows. The real protection comes from the server in Phase 5, and an interviewer will often check that you know this.

### AuthContext

Three pieces work together:

1. **`context/AuthContext.ts`:** `createContext` makes the container.
2. **`context/AuthProvider.tsx`:** holds the state and shares it through `<AuthContext.Provider value={value}>`.
3. **`hooks/useAuth.ts`:** `useContext(AuthContext)` reads it from any component inside the provider.

```tsx
const value = useMemo(
  () => ({ user, isRestoringSession, login, register, logout }),
  [user, isRestoringSession, login, register, logout],
)
```

This is `useMemo` doing important work. Without it, each render of `AuthProvider` creates a new object, so every component using the context re-renders even when nothing changed.

**Why `useCurrentUser` exists:** `user` can be `null`, but on a protected page it never is. This hook throws if it's missing and returns a plain `User`, so components skip a null check that could never matter.

### Redux Toolkit

#### The flow

```
Component        dispatch(fetchTickets(query))
    |
Thunk            dispatches "pending", then calls the service
    |
Reducer          sets listStatus = 'loading'
    |
Service          returns tickets after waiting for the data
    |
Thunk            dispatches "fulfilled" with the tickets
    |
Reducer          saves them to the store
    |
useAppSelector   sees the change, and the component re-renders
```

Data only moves in this one direction, which is what makes state changes easy to follow and debug.

#### `features/tickets/ticketsSlice.ts`

```ts
export const fetchTickets = createAsyncThunk('tickets/fetchList', (query: TicketQuery) => ticketService.getTickets(query))
```
`createAsyncThunk` writes the boring part for you. It creates three action types and dispatches them at the right times, and it passes along the data or the error.

```ts
.addCase(fetchTickets.pending, (state) => {
  state.listStatus = 'loading'
  state.listError = null
})
```
This looks like it changes state directly, which React forbids. Redux Toolkit uses a library called Immer, which records these changes and builds a new object from them. This only works inside `createSlice` reducers.

```ts
.addCase(fetchTickets.rejected, (state, action) => {
  if (action.meta.aborted) return
```
An aborted request was cancelled on purpose because a newer one replaced it, so it isn't an error to show.

```ts
.addCase(userLoggedOut, () => initialState)
```
Each slice clears itself on logout. Returning a value replaces the state entirely. Without this, the next person to sign in on the same browser could briefly see the previous person's tickets.

#### Stopping out-of-order responses

```ts
useEffect(() => {
  const request = dispatch(fetchTickets({ scope, search: debouncedSearch, status, priority, page, limit: PAGE_SIZE }))
  return () => request.abort()
}, [dispatch, scope, debouncedSearch, status, priority, page])
```

Suppose you click Next, then Previous. Network responses can arrive in any order, so without protection the older one could overwrite the newer one, and you'd see page 2's rows labeled as page 1. This is called a **race condition**. Here, the cleanup cancels the older request before the new one starts.

Components that use local state, such as `TicketComments`, do the same job with an `isCancelled` flag.

#### Handling errors from a thunk

```ts
const newTicket = await dispatch(createTicket(values)).unwrap()
```
A dispatched thunk always resolves, even on failure. `unwrap()` gives you the result, or throws if it failed, so normal `try/catch` works. Use it when the component needs to react, such as navigating after success.

#### `store/hooks.ts`

```ts
export const useAppDispatch = useDispatch.withTypes<AppDispatch>()
export const useAppSelector = useSelector.withTypes<RootState>()
```
Typed versions of the Redux hooks, so `state.tickets.items` is checked and autocompleted everywhere.

### The service layer

```
Component -> Redux thunk -> ticketService.ts -> previewBackend.ts
                                                (Phase 7: Axios -> Express API)
```

Components never call the backend directly. In Phase 7, the code inside the service files changes to Axios requests, and the components and slices shouldn't need to change. That's the benefit of this layer.

`previewBackend.ts` is the temporary part. It waits 300ms, can throw errors and enforces the role rules, so the app has already been built to handle real server behavior. It doesn't check passwords, and its data resets on reload. Phase 7 deletes it.

### Using `key` again

```tsx
return <TicketList key={`${scope}:${initialSearch}`} scope={scope} initialSearch={initialSearch} />
```

The same trick as Phase 3, with one more job. Searching from the top bar changes the URL, which changes the key, so a fresh `TicketList` starts with the new search text. There's no need for an effect to copy the URL into state.

### Bugs found during this phase

- **State update in an effect:** the linter flagged `setTickets(null)` inside an effect in `NotificationMenu`. It belongs in the click handler, because that's the event that causes the change.
- **Context and component in one file:** exporting both from `AuthContext.tsx` breaks fast refresh, so they're now separate files.
- **Blank page after moving a file:** the running dev server still looked for the deleted `AuthContext.tsx`. If you rename a file and get a blank page, check the browser console for a 404. Saving the file that imports it, or restarting Vite, clears it.

### Practice exercises

1. Sign in as each of the three accounts and write down what's different. Then find the code responsible for each difference.
2. Open `/users` as Priya and work out exactly which line sends you away.
3. Remove the `isRestoringSession` check from `ProtectedRoute`, sign in and refresh the page. Explain what happens, then restore it.
4. Remove `request.abort()` from `TicketList`, and change `waitForNetwork` to wait `Math.random() * 2000` milliseconds. Click Next and Previous quickly. Explain what you see, then restore both.
5. Install the Redux DevTools browser extension, then watch the pending and fulfilled actions as you filter tickets.
6. Remove `.addCase(userLoggedOut, () => initialState)` from `ticketsSlice`. Sign in as Sam, open All Tickets, log out, sign in as Priya and watch closely when you open My Tickets. Restore it afterwards.
7. Add a `/profile` route that only agents can open, showing their name. Then add it to the sidebar for agents only.
