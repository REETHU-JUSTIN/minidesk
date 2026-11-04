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
An inline function is a new object on every parent render, so the effect's cleanup and setup run again each time the parent re-renders while the modal is open. That also calls `.focus()` again, which could pull focus away from something the user is typing in. A parent can avoid this by wrapping the handler in `useCallback`. It causes no visible problem today because those parents don't re-render while the modal is open.

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
