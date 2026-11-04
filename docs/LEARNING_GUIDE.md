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
