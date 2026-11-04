# MiniDesk Interview Questions

Questions and answers based on this project's code. This file grows with each phase.

## Phase 1: Project setup and UI

### React fundamentals

**1. What is JSX?**
JSX is syntax that looks like HTML inside JavaScript. The build step compiles it into function calls that create React elements. That's why `Button.tsx` uses `className` instead of `class`: `class` is a reserved word in JavaScript.

**2. What's the difference between props and state?**
Props are passed in by a parent and are read-only for the component receiving them. State is owned by the component, and updating it triggers a re-render. In `Pagination`, `page` is a prop. In `TicketListPage`, the same value is state.

**3. What does "lifting state up" mean?**
Moving state to the closest shared parent of the components that need it. In MiniDesk, `TopNav` opens the mobile menu and `Sidebar` displays it, so `isMenuOpen` lives in their parent, `AppLayout`.

**4. Why does React need a `key` when rendering lists?**
Keys let React match items between renders, so it can update, move or remove the right ones. MiniDesk uses `ticket.id` because it's stable. Using the array index can attach the wrong state to the wrong row when a list is reordered or filtered.

**5. What is derived state, and why avoid storing it?**
It's a value that can be calculated from existing state or props. `TicketListPage` calculates `totalPages` and `ticketsOnPage` during render. Storing them separately would mean keeping two copies in sync, which is a common source of bugs.

### Hooks

**6. When does `useEffect` run, and what is the dependency array for?**
It runs after React updates the screen. With no array, it runs after every render. With `[]`, it runs once on mount. With values listed, it runs on mount and whenever one of them changes.

**7. What is the cleanup function for?**
It undoes what the effect set up. React runs it before re-running the effect and when the component unmounts. `Modal` uses it to remove its `keydown` listener. Without it, listeners would pile up and keep running after the modal closes.

**8. What's the difference between `useRef` and `useState`?**
Both keep a value between renders, but changing `ref.current` doesn't cause a re-render. `Modal` uses a ref to hold the dialog's DOM element so it can call `.focus()`.

**9. In `Modal`, `onClose` is a dependency of the effect, and parents pass an inline arrow function. What happens?**
An inline function is a new object on every parent render, so the effect's cleanup and setup run again each time the parent re-renders while the modal is open. That also calls `.focus()` again, which could pull focus away from something the user is typing in. `TicketDetails` avoids this by wrapping its handler in `useCallback`, because that page has other state that can change.

**10. Why does `App.tsx` use `useState(getPageFromUrl)` rather than `useState(getPageFromUrl())`?**
Passing the function means React calls it only on the first render. Calling it directly would run it on every render and discard the result. This is called lazy initialization.

### TypeScript

**11. What's the difference between `interface` and `type`?**
Both can describe object shapes. An `interface` can be extended and reopened, while `type` can also describe unions and other forms. MiniDesk uses `interface ButtonProps extends ...` for props and `type ButtonVariant = 'primary' | ...` for a union, which needs `type`.

**12. What does `Record<ButtonVariant, string>` give you?**
An object type that must have one string value for every member of the union. If you add a variant and forget its classes, the code won't compile.

**13. What does `ComponentProps<'button'>` do?**
It gives you the full set of props a native `<button>` accepts. `ButtonProps` extends it, so `onClick` and `aria-label` work without being declared individually.

**14. Why `import type`?**
It tells the compiler the import exists only for type checking, so it's removed from the final JavaScript. The project's `verbatimModuleSyntax` setting requires this for type-only imports.

### CSS and Tailwind

**15. What does mobile-first mean in Tailwind?**
Unprefixed classes apply at all widths, and a prefix such as `md:` applies from that breakpoint up. So `fixed md:sticky` means fixed on phones and sticky from medium screens up.

**16. Why do `flex` and `grid` children sometimes overflow, and how did you fix it here?**
Flex and auto-sized grid items won't shrink below their content's minimum width by default. MiniDesk had a real case: long truncated titles made the phone Dashboard scroll sideways. `grid-cols-1` fixed the grid, and `min-w-0` does the same job for the flex container in `AppLayout`.

**17. Why design tokens instead of hard-coded colors?**
A single source of truth. `bg-primary` is used across the app, so changing one value in `index.css` rebrands everything consistently.

### Accessibility and HTML

**18. When should you use a link and when a button?**
Links navigate and buttons perform actions. That's why MiniDesk has both `LinkButton` and `Button`, even though they look identical. Screen readers announce them differently, and links support behavior such as opening in a new tab.

**19. Why does `Button` default to `type="button"`?**
A `<button>` inside a form defaults to `type="submit"`. Without this default, a Cancel button inside a form would submit it by accident.

**20. What makes the modal accessible?**
It has `role="dialog"`, `aria-modal="true"` and an accessible name from `aria-label`. Focus moves into it when it opens, and Escape closes it. One known gap: focus isn't yet trapped inside the dialog, so Tab can move to elements behind it. A production app should add that.

### Tooling

**21. What does Vite do?**
In development, it serves your source files as native ES modules and updates the browser instantly through hot module replacement. For production, it bundles and minifies everything into `dist/`.

**22. Why do `npx tsc -b` and `npm run build` both matter if the browser is the real test?**
They catch different things. Types catch wrong props and typos before anything runs. Only the browser catches layout and runtime problems. MiniDesk's phone overflow bug passed type checking and the build, and only appeared in a real browser.

## Phase 2: TypeScript and modern JavaScript

### TypeScript

**23. What is TypeScript, and why use it?**
It's JavaScript with static types, which are checked during development and removed from the code that ships. It catches mistakes early, enables autocomplete and makes refactoring safer. In MiniDesk, changing a field in `types/index.ts` immediately shows every place affected.

**24. Does TypeScript protect you at runtime?**
No. Types are erased, so the browser runs plain JavaScript. An API could return the wrong shape and TypeScript wouldn't notice. That's why the server needs its own validation as well.

**25. What's the difference between an optional property and a nullable one?**
`variant?: ButtonVariant` can be left out entirely. `assignedAgentId: number | null` must be present but can hold `null`. MiniDesk uses nullable for the agent because the field always exists on a ticket, and `null` clearly means nobody is assigned.

**26. What is type narrowing?**
TypeScript working out a more specific type from your checks. `find` returns `Ticket | undefined`. After `if (!ticket) return ...` in `TicketDetailsPage`, TypeScript knows `ticket` is a `Ticket`.

**27. What are generics?**
Types with a placeholder that's filled in when they're used. `paginate<T>(items: T[], ...)` works with any list and keeps the item type, so passing tickets returns `PaginatedResponse<Ticket>`. Using `any` instead would lose that checking.

**28. What's the difference between `any` and `unknown`?**
`any` turns off checking for that value. `unknown` means "this could be anything", and TypeScript makes you check it before using it, so it's the safer choice for data from outside your app. MiniDesk's code doesn't use `any`.

**29. What does `Record<K, V>` do?**
It describes an object with keys of type `K` and values of type `V`. `Record<TicketStatus, string>` must have a label for all three statuses, so adding a status without a label is a compile error.

**30. What does `Ticket['status']` mean?**
It's an indexed access type, meaning "the type of the `status` field on `Ticket`". It stays correct automatically if the interface changes.

**31. Why isn't the interface called `Comment`?**
Browsers already define a global DOM type called `Comment`. Reusing that name is confusing, and a missing import could silently refer to the wrong type. `TicketComment` avoids both problems.

**32. Why doesn't the `User` type have a password field?**
The frontend should never receive a password or hash. Leaving it out documents that rule, and TypeScript rejects code that adds one to a `User` object. The backend is still what actually keeps it from being sent, which comes in Phase 5.

### JavaScript

**33. What's the difference between `==` and `===`?**
`==` converts types before comparing, so `'1' == 1` is true. `===` compares without converting, so `'1' === 1` is false. MiniDesk uses `===` throughout, as in `item.id === PREVIEW_TICKET_ID`.

**34. What's the difference between `let`, `const` and `var`?**
`let` and `const` are block-scoped, and `const` can't be reassigned. `var` is function-scoped and has confusing hoisting behavior, so modern code avoids it. A `const` object's fields can still change; only the variable can't be pointed at something else.

**35. What's the difference between `??` and `||`?**
`||` falls back on any falsy value, including `0` and `''`. `??` falls back only on `null` and `undefined`. `ticket.assignedAgentId ?? ''` is the safer choice, because a valid value of `0` is kept.

**36. What does optional chaining do?**
`dialogRef.current?.focus()` calls `focus` only if `current` isn't null or undefined. Otherwise, the whole expression gives `undefined` instead of crashing.

**37. What's the difference between `map`, `filter`, `find` and `reduce`?**
`map` transforms every item into a new array. `filter` keeps matching items in a new array. `find` returns the first match or `undefined`. `reduce` combines the items into one value. In `getDashboardStats`, `filter(...).length` counts tickets by status.

**38. What do spread and rest do?**
Both use `...`. Spread expands values, as in `{ ...dateOptions, hour: 'numeric' }`, which builds a new object. Rest collects them, as in `{ label, ...rest }`, which gathers the remaining props.

**39. Why is copying with spread called a shallow copy?**
Only the top level is copied. Nested objects are still shared between the copy and the original, so changing a nested value affects both. This matters in React and Redux, where state should be updated without changing the original.

**40. Why are dates stored as text in the `Ticket` type?**
JSON has no date type, so APIs send dates as ISO text such as `2026-11-03T12:00:00Z`. Storing them in UTC and formatting them for display lets each viewer see their local time. `formatDate` handles this conversion.

## Phase 3: Components, props and Hooks

### Components and state

**41. How do you decide where state should live?**
In the lowest component that needs it. If two components need it, move it to their closest shared parent. In `TicketComments`, the finished comments live in the parent because both the heading and `CommentList` use them, while `CommentForm` keeps its own draft text because nothing else needs that.

**42. What does "data down, events up" mean?**
Parents pass data to children through props, and children report what happened by calling functions passed as props. `TicketFilters` receives `filters` and calls `onFilterChange`. It never changes the parent's state directly.

**43. Why must you never change state directly?**
React compares the old and new values to decide whether to update. `comments.push(x)` keeps the same array, so React sees no change. MiniDesk creates a new array: `[...currentComments, newComment]`.

**44. When should you use the function form of a state setter?**
When the new state depends on the old state. `setFilters((currentFilters) => ({ ...currentFilters, ...changes }))` always reads the latest value, whereas a plain `filters` variable can be out of date if updates are batched together.

**45. Are state updates synchronous?**
No. React batches them and re-renders afterwards. In `handleFilterChange`, `setFilters` and `setPage` together cause one re-render. Reading the state variable right after setting it still gives the old value.

**46. What is derived state, and how does this project use it?**
A value that's calculated rather than stored. `TicketList` calculates `hasActiveFilters` from its filters during render. If that were stored as separate state, it could fall out of sync with the filters.

**47. How can a `key` reset a component's state?**
React keeps state when the same component type stays in the same position. `TicketListPage` builds its key from the list type and the search text in the URL, so switching lists or searching from the top bar creates a fresh component with reset filters.

### Hooks

**48. What are the Rules of Hooks, and why do they exist?**
Call Hooks only at the top level of a component or custom hook, never inside conditions, loops or after an early return. React tracks Hooks by call order, so the order must be the same on every render. In MiniDesk, `TicketDetailsPage` returns early if the ticket is missing, so its Hooks live in a child component.

**49. What's a custom hook, and when should you write one?**
A function starting with `use` that calls other Hooks, used to share logic. MiniDesk's `useCloseOnOutside` exists because two menus need identical behavior. Each component that calls a custom hook gets its own separate state.

**50. Explain how `useDebounce` works.**
Each change to the value runs the effect's cleanup, which cancels the waiting timer, then starts a new one. The delayed value updates only when the input has been quiet for the full delay. In Phase 7, this means one API request after typing stops rather than one per keystroke.

**51. What's the difference between debouncing and throttling?**
Debouncing waits until activity stops, which suits search boxes. Throttling allows at most one call per time period during continuous activity, which suits scroll or resize handlers.

**52. What's the difference between `useMemo` and `useCallback`?**
`useMemo` caches a calculated value, and `useCallback` caches a function. `useCallback(fn, deps)` is equivalent to `useMemo(() => fn, deps)`. MiniDesk uses `useMemo` for the auth context value and `useCallback` for handlers passed to a memoized child.

**53. What does `React.memo` do, and why does it need `useCallback`?**
`memo` skips re-rendering when props are unchanged, using a shallow comparison. A function created during render is a new object each time, so it counts as changed. `TicketFilters` uses `memo`, and its parent uses `useCallback` to keep the handlers stable. A temporary render counter confirmed it renders 0 times across page changes.

**54. Should you wrap everything in `useMemo` and `useCallback`?**
No. They add code and memory use, and can hide bugs when dependencies are wrong. Use them when a calculation is actually slow, or when a stable reference is needed by `memo`, an effect or a context value. MiniDesk removed a `useMemo` around ticket filtering once filtering moved out of the component, because it no longer had a job.

**55. Why was `useRef` used in `CommentForm`?**
To move keyboard focus to the textarea after posting or after an error. That needs direct access to a DOM element, and changing a ref doesn't cause a re-render.

### Forms

**56. What's the difference between controlled and uncontrolled inputs?**
A controlled input's value lives in React state, as in `CommentForm`. An uncontrolled input keeps its own value in the DOM and is read when needed. React Hook Form uses uncontrolled inputs by default, which avoids re-rendering the form on each keystroke.

**57. Why use React Hook Form?**
It handles field values, validation, errors and submission with little code and few re-renders. `CommentForm` shows the manual alternative, which is fine for one field but gets repetitive as a form grows.

**58. What does `event.preventDefault()` do in a form?**
It stops the browser's default behavior of submitting the form and reloading the page, so the app can handle submission itself. React Hook Form's `handleSubmit` calls it for you.

**59. Is client-side validation enough?**
No. It improves the experience, but anyone can bypass it by calling the API directly with a tool like Postman. The server must validate again, which MiniDesk does from Phase 5.

**60. Why does the title rule use `value.trim()`?**
A title of only spaces would otherwise pass a `required` check. Trimming first means it counts as empty. Testing confirmed that a spaces-only title is rejected.

**61. How does the password confirmation rule work?**
It's a custom `validate` function that compares the field with the other one, read through `getValues('password')`. It returns `true` when they match and the error message when they don't.

### UI behavior

**62. How do you close a dropdown when someone clicks outside it?**
Listen for `mousedown` on the document and check whether the click landed inside the menu using `ref.current.contains(event.target)`. `useCloseOnOutside` does this and also handles Escape. It adds the listeners only while the menu is open, and removes them in the effect's cleanup.

**63. Why does `listTickets` copy the array before sorting it?**
`sort` changes the array it's called on. The spread in `[...filterTickets(...)].sort(...)` makes a copy, so shared data never gets reordered by accident. Newer JavaScript also offers `toSorted`, which returns a sorted copy.

**64. Why does the filter handler reset the page to 1?**
You could be on page 2 when a filter leaves only 3 results, so page 2 would be empty. Resetting in the event handler is simpler than using an effect, and avoids an extra render.

## Phase 4: React Router, Context API and Redux Toolkit

### State management

**65. When would you use local state, Context or Redux?**
Local state when one component needs it, like MiniDesk's comments. Context for simple values that change rarely and are read widely, like the signed-in user. Redux for shared data with async loading and frequent updates, like tickets. Start with local state and move it only when there's a reason.

**66. Why not use Context for everything?**
Every component using a context re-renders when its value changes, even if it uses only part of it. Redux selectors re-render a component only when its selected data changes. Context also doesn't come with tools for async flows or debugging.

**67. How do you avoid duplicating state between Redux and Context?**
Give each piece of data one owner. In MiniDesk, the user lives only in `AuthProvider`, and tickets live only in Redux. They connect in one place: logout dispatches `userLoggedOut` so the slices clear themselves.

**68. Explain the Redux data flow.**
A component dispatches an action, reducers calculate the new state from it, the store saves that state, and components using `useSelector` re-render if their selected data changed. Data flows in one direction, so changes are easy to trace.

**69. What's a slice, and what does `createSlice` give you?**
A slice is the state, reducers and actions for one feature. `createSlice` generates the actions and uses Immer. MiniDesk has `ticketsSlice` and `dashboardSlice`.

**70. What must a reducer never do?**
It must be pure: no API calls, no random values and no changing its inputs. Given the same state and action, it must return the same result. Side effects belong in thunks.

**71. How can Redux Toolkit reducers appear to change state directly?**
They use Immer. You write `state.listStatus = 'loading'` on a draft, and Immer produces a new immutable object from those changes. This only works inside `createSlice` and `createReducer`.

**72. What is `createAsyncThunk`?**
A helper that wraps an async function and dispatches `pending`, `fulfilled` and `rejected` actions automatically. Reducers handle those in `extraReducers`, which is how MiniDesk sets loading and error states.

**73. What's the difference between `reducers` and `extraReducers`?**
`reducers` defines actions that belong to the slice and generates their action creators. `extraReducers` responds to actions defined elsewhere, like thunk results and `userLoggedOut`.

**74. What does `unwrap()` do?**
A dispatched thunk's promise always resolves, even on failure. `unwrap()` returns the result, or throws the error, so `try/catch` works. `CreateTicketPage` uses it to go to the new ticket after success, or show an error.

**75. What is a race condition in data fetching, and how did you handle it?**
Responses can arrive in a different order from their requests, so an older one can overwrite newer data. MiniDesk calls `request.abort()` in the effect's cleanup, and reducers ignore aborted requests. Tests that clicked Next and Previous quickly confirmed the list settles on the last request.

**76. Why does `Promise.all` suit the dashboard?**
It runs the stats and recent tickets requests together rather than one after the other, so it's faster, and the thunk gets both results at once. If either fails, the whole thing rejects, which is why there's a single error state. `Promise.allSettled` is the alternative if partial results are useful.

### Routing

**77. What's the difference between client-side and server-side routing?**
With server-side routing, each URL loads a new page from the server. With client-side routing, JavaScript changes the URL and swaps components without reloading, so state is kept and navigation is fast. The server must return `index.html` for all these URLs, which matters at deployment in Phase 9.

**78. What's a layout route, and what does `Outlet` do?**
A route without a path that wraps its child routes. It renders `<Outlet />` where the matched child should appear. MiniDesk uses them for `AppLayout` and `ProtectedRoute`.

**79. How do protected routes work?**
A wrapper checks the user. If there isn't one, it returns `<Navigate to="/login" />`. If the role isn't allowed, it redirects to the dashboard. Otherwise, it renders `<Outlet />`.

**80. Do protected routes make an app secure?**
No. The code runs in the user's browser and can be changed, and anyone can call the API directly. They're only a user experience feature. Real protection is on the server, which MiniDesk adds in Phase 5.

**81. Why does `ProtectedRoute` wait for `isRestoringSession`?**
Checking for a saved session takes time. Without waiting, a refresh would see no user yet and send a signed-in person to login.

**82. How does MiniDesk send you back to the page you wanted after login?**
`ProtectedRoute` passes the current URL in the navigation state. After login, `GuestRoute` sees a user and redirects to `from`, or to the dashboard if there isn't one.

**83. What does `replace` do on navigation?**
It swaps the current history entry rather than adding one. Without it, pressing Back after a redirect would hit the protected page and redirect again, trapping the user.

**84. What's the difference between `Link` and `<a>`?**
`<a>` makes the browser load a new page, which resets all React state. `Link` updates the URL through the History API with no reload. `NavLink` also knows if it's active.

**85. Why is the ticket ID checked in `TicketDetailsPage`?**
`useParams` always returns text, and users can type anything into a URL. `Number('abc')` gives `NaN`, so the code checks for a positive whole number before requesting anything.

### Context

**86. Why is the context value wrapped in `useMemo`?**
A new object on each render would count as a changed value, so every component using the context would re-render. `useMemo` keeps the same object until its contents change.

**87. Why does `useAuth` throw an error if the context is missing?**
The default value is `null`, so using it outside the provider would otherwise fail later with a confusing message. Throwing straight away explains the actual mistake.

### Architecture and security

**88. Why have a service layer?**
Components and slices depend on functions like `getTickets`, not on how data is fetched. MiniDesk relies on this: Phase 7 swaps the temporary backend for Axios in the service files, and the components shouldn't need to change. It also makes tests easier to write.

**89. Why does a customer get the same message for someone else's ticket as for a missing one?**
A different message would reveal which ticket numbers exist. Returning the same "not found" response avoids leaking that. Tests confirmed the two messages match.

**90. Why clear Redux state on logout?**
Redux lives in memory until the page reloads. Without clearing it, the next person on that browser could briefly see the previous user's tickets. Each slice handles `userLoggedOut` by returning its initial state.

**91. Where do you store a login token, and what are the trade-offs?**
`localStorage` is simple and survives a refresh, but any script running on the page can read it, so a cross-site scripting bug could expose it. `httpOnly` cookies can't be read by JavaScript, but they need protection against cross-site request forgery. MiniDesk uses `localStorage` from Phase 7 to demonstrate Axios interceptors, and a stricter production app might choose cookies.
