# React Fundamentals

---

## Components and JSX

### 1. Concept Explanation

A component is a function that returns what should appear on screen. JSX is the HTML-like syntax it returns, and the build step compiles it into normal JavaScript function calls.

```tsx
function Greeting() {
  return <h1>Hello</h1>
}
```

React compares the new result with the previous one, and updates only the parts of the real page that changed.

### 2. Project Implementation

| Folder | Kind of component | Examples |
|---|---|---|
| `components/common` | Reusable UI | `Button`, `Card`, `Modal` |
| `components/layout` | App shell | `AppLayout`, `Sidebar`, `TopNav` |
| `components/tickets` | Ticket features | `TicketTable`, `TicketForm` |
| `pages` | One per screen | `DashboardPage`, `UsersPage` |

### 3. Code Reference

**File:** [frontend/src/components/common/Card.tsx](../../frontend/src/components/common/Card.tsx)

```tsx
export function Card({ title, action, className = '', children }: CardProps) {
```

```tsx
{title && (
```

- `className` rather than `class`, because `class` is a reserved word in JavaScript.
- `{ }` puts a JavaScript expression inside JSX.

**File:** [frontend/src/pages/CreateTicketPage.tsx](../../frontend/src/pages/CreateTicketPage.tsx)

```tsx
<Card title="Ticket details">
  <TicketForm onSubmit={handleSubmit} />
</Card>
```

- Pages are built by composing smaller components. Whatever goes between the tags arrives as `children`.

### 4. Why We Used It

Components keep each file to one job. `Card` is written once and reused everywhere, so a style change applies to the whole app. Small components are easier to understand and test.

### 5. Real-Time Scenario

An agent changes a ticket's status. React re-runs the components involved and compares the results. Only the badge and dropdown change in the real page, so the rest of the screen, including whatever's being typed elsewhere, is left alone.

### 6. Interview Questions

- **Theory:** What is JSX?
- **Theory:** What is the virtual DOM, and what does reconciliation mean?
- **Theory:** What triggers a re-render?
- **Practical:** How did you decide how to split your components?

### 7. Project-Based Answers

**What is JSX?**
A syntax extension that looks like HTML and compiles to JavaScript. Mine must return one root element, or a fragment like `<>...</>`.

**What is the virtual DOM?**
React's description of the UI in memory. On each update, it compares the new description with the old one, which is called reconciliation, and applies only the differences to the real page.

**What triggers a re-render?**
A state change, a parent re-rendering, or a change in a context the component reads. In MiniDesk, changing `page` re-renders `TicketList` and its children, unless they're skipped with `memo`.

**How did you split components?**
By job. `TicketListPage` originally held everything, so I separated `TicketFilters`, `TicketTable` and `Pagination`. The page coordinates data, and the children display it.

### 8. Follow-up Questions

- **Does a re-render always update the real page?** No. React only touches the real DOM where the result actually differs.
- **What's the difference between a component and an element?** A component is the function, and an element is the description it returns.
- **Why are there fragments?** JSX needs one root, and a fragment provides that without adding an extra `div`.

---

## Props

### 1. Concept Explanation

Props are how a parent passes data to a child, like arguments to a function. They're read-only for the child. A child can also receive functions as props, which is how it reports events back up.

### 2. Project Implementation

Every shared component is configured through props. `children` is a special prop holding whatever is placed between its tags. `Pagination` receives data and a callback.

### 3. Code Reference

**File:** [frontend/src/components/common/Pagination.tsx](../../frontend/src/components/common/Pagination.tsx)

```tsx
interface PaginationProps {
  page: number
  totalPages: number
  onPageChange: (newPage: number) => void
}
```

```tsx
<Button variant="secondary" disabled={page <= 1} onClick={() => onPageChange(page - 1)}>
```

- `page` and `totalPages` flow down, and the click flows up through `onPageChange`.

**File:** [frontend/src/pages/TicketListPage.tsx](../../frontend/src/pages/TicketListPage.tsx)

```tsx
<Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
```

### 4. Why We Used It

Props make components reusable, because `Pagination` works for any list. Data flowing one way makes it easy to find what caused a change, since there's only one place that owns it.

### 5. Real-Time Scenario

A user clicks **Next**. `Pagination` doesn't change anything itself. It calls `onPageChange(2)`, the parent's state updates, and the parent passes `page={2}` back down.

### 6. Interview Questions

- **Theory:** What's the difference between props and state?
- **Theory:** What is prop drilling, and how do you avoid it?
- **Theory:** What is the `children` prop?
- **Practical:** How does a child communicate with its parent in your app?

### 7. Project-Based Answers

**Props versus state?**
Props come from a parent and are read-only. State is owned by the component and can change. `page` is state in `TicketList` and a prop in `Pagination`.

**What is prop drilling?**
Passing props through many layers that don't use them. MiniDesk avoids it for the current user by using Context, so deep components call `useCurrentUser` directly.

**What is `children`?**
Whatever is placed between a component's tags. `Card` and `AuthLayout` use it to wrap any content.

**How does a child talk to its parent?**
Through callback props. `TicketFilters` calls `onFilterChange`, and the parent decides what to do with it.

### 8. Follow-up Questions

- **Why can't a child change its props?** That would break one-way data flow, and the parent would no longer know its data had changed.
- **How do default props work?** With destructuring defaults, such as `variant = 'primary'`.
- **What's the "on" prefix convention?** Props named `onSomething` are event callbacks, and handlers are often named `handleSomething`.

---

## Lists and Keys

### 1. Concept Explanation

To render a list, `map` an array into elements. Each needs a `key`: a stable, unique value that lets React match items between renders.

A key can also deliberately reset a component. If the key changes, React treats it as a different component and creates a fresh one, with fresh state.

### 2. Project Implementation

- **Lists:** tickets, comments, users, dropdown options and sidebar links.
- **Resetting state:** `TicketListPage` and `TicketDetailsPage` use keys to start fresh.

### 3. Code Reference

**File:** [frontend/src/components/tickets/TicketTable.tsx](../../frontend/src/components/tickets/TicketTable.tsx)

```tsx
{tickets.map((ticket) => (
  <tr key={ticket.id} className="hover:bg-slate-50">
```

- `ticket.id` is stable and unique.

**File:** [frontend/src/pages/TicketListPage.tsx](../../frontend/src/pages/TicketListPage.tsx)

```tsx
return <TicketList key={`${scope}:${initialSearch}`} scope={scope} initialSearch={initialSearch} />
```

- Switching lists or searching from the top bar changes the key, so `TicketList` starts over with fresh filters.

### 4. Why We Used It

Keys let React update only what changed, and keep state attached to the right row. Using a key to reset state means no effect is needed to copy values around, which would be more code and an extra render.

### 5. Real-Time Scenario

An agent has **Resolved** selected in All Tickets, then clicks My Tickets. The key changes from `all:` to `mine:`, so React discards the old component and its filters. Testing confirmed the filter resets.

### 6. Interview Questions

- **Theory:** Why does React need keys?
- **Theory:** Why is using the array index as a key risky?
- **Practical:** Have you used `key` for anything other than lists?

### 7. Project-Based Answers

**Why does React need keys?**
To match items between renders, so it can update, move or remove the right ones.

**Why is the index risky?**
If items are reordered or filtered, the index points to different data, so state and DOM can attach to the wrong item. My tickets use `ticket.id`. For a fixed list like table headings, the text itself works fine.

**Have you used `key` for anything else?**
Yes, to reset state. `TicketListPage` builds a key from the list type and the URL's search text, so a new search gets a fresh component.

### 8. Follow-up Questions

- **Do keys need to be globally unique?** No, only unique among siblings.
- **What happens when a key changes?** React unmounts the old component, losing its state, and mounts a new one.
- **Why not generate keys with `Math.random()`?** They'd change each render, so React would rebuild every row and lose state.

---

## Conditional Rendering

### 1. Concept Explanation

JSX is JavaScript, so you show different things with normal JavaScript logic.

- **`&&`:** show this, or nothing.
- **Ternary:** show this, or that.
- **Early `return`:** show something else entirely.

### 2. Project Implementation

Used for loading states, errors, empty states, and role-based buttons.

### 3. Code Reference

**File:** [frontend/src/pages/DashboardPage.tsx](../../frontend/src/pages/DashboardPage.tsx)

```tsx
if (status === 'failed') {
```

```tsx
if (!stats) {
  return <Spinner label="Loading dashboard..." />
}
```

- Early returns handle the error and loading states first, so the remaining code can rely on `stats` existing.

**File:** [frontend/src/components/tickets/TicketManagePanel.tsx](../../frontend/src/components/tickets/TicketManagePanel.tsx)

```tsx
{!isAdmin && !isAssignedToMe && (
```

- Only agents who aren't assigned to the ticket see **Assign to Me**.

**File:** [frontend/src/pages/TicketListPage.tsx](../../frontend/src/pages/TicketListPage.tsx)

```tsx
{hasActiveFilters ? 'No tickets match your search and filters.' : 'No tickets here yet.'}
```

### 4. Why We Used It

Real apps have more states than "working": loading, failed, empty and different roles. Handling each one means users always know what's happening.

### 5. Real-Time Scenario

A customer opens My Tickets. They first see a spinner. Then they see either their tickets or "No tickets here yet." If the request fails, they see an error message. They never see an empty screen with no explanation.

### 6. Interview Questions

- **Theory:** What are the ways to render conditionally?
- **Theory:** What's the risk of using `&&` with numbers?
- **Practical:** How do you handle loading and error states?
- **Practical:** How do you show different UI for different roles?

### 7. Project-Based Answers

**What are the ways?**
`&&` for show-or-nothing, a ternary for one-or-the-other, and early returns for whole-page states. I use all three.

**What's the risk with `&&`?**
`{count && <List />}` renders `0` when `count` is 0, because `0` is what `&&` returns. I write the comparison, like `items.length > 0 &&`.

**How do you handle loading and errors?**
My Redux slices track a status of idle, loading, succeeded or failed. The page uses that to choose a spinner, error message, empty state or data.

**How do you show UI by role?**
I read the role from `useCurrentUser`. For example, only customers see **Create Ticket**. That only controls the screen, and the role rules must be enforced on the server too.

### 8. Follow-up Questions

- **Why does fading old rows beat showing a spinner on reload?** The layout stays stable, so filtering doesn't make the table jump.
- **Is hiding a button enough for security?** No. Someone can still send the request, so the server must check permissions.
- **Can early returns break anything?** Yes, if Hooks come after them. See [Rules of Hooks](react-hooks.md#rules-of-hooks).

---

## Lifting State Up

### 1. Concept Explanation

When two components need the same state, move it to their closest shared parent. The parent passes it down as props, along with functions to change it.

### 2. Project Implementation

- **`AppLayout`** owns `isMenuOpen`, because `TopNav` opens the menu and `Sidebar` shows it.
- **`TicketList`** owns `filters` and `page` for its children.
- **`TicketComments`** owns the comment list, because `CommentList` and the heading need it.

### 3. Code Reference

**File:** [frontend/src/components/layout/AppLayout.tsx](../../frontend/src/components/layout/AppLayout.tsx)

```tsx
const [isMenuOpen, setIsMenuOpen] = useState(false)
```

```tsx
<Sidebar isOpen={isMenuOpen} onClose={() => setIsMenuOpen(false)} />
```

```tsx
<TopNav title={getPageTitle(pathname)} onOpenMenu={() => setIsMenuOpen(true)} />
```

- `TopNav` and `Sidebar` are siblings, so neither can reach the other's state. Their parent connects them.

### 4. Why We Used It

Siblings can't talk directly, and keeping two copies of a value invites bugs. A single owner keeps them in sync. It's also the simplest answer before reaching for Context or Redux.

### 5. Real-Time Scenario

On a phone, a user taps the menu button in `TopNav`. `onOpenMenu` updates `AppLayout`'s state, and `AppLayout` re-renders, passing `isOpen={true}` to `Sidebar`, which slides in.

### 6. Interview Questions

- **Theory:** What does lifting state up mean?
- **Theory:** When should you use Context or Redux instead?
- **Practical:** Give an example from your project.

### 7. Project-Based Answers

**What does it mean?**
Moving state to the closest shared parent of the components that need it, so they stay in sync through props.

**When should you use something else?**
When many distant components need it, or it would mean passing props through many layers. Tickets are in Redux, and the user is in Context, for that reason.

**Give an example.**
The mobile menu. `TopNav` has the button and `Sidebar` is the menu, so `isMenuOpen` lives in `AppLayout` and each child receives what it needs.

### 8. Follow-up Questions

- **Should all state be lifted to the top?** No, only as high as needed. `CommentForm` keeps its draft text, because nothing else needs it.
- **What's the downside of lifting too high?** More components re-render, and more props pass through code that doesn't use them.
- **What is a controlled component?** One whose value is held by its parent and passed in through props, like `TicketFilters`.
