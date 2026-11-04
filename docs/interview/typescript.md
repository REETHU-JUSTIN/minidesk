# TypeScript

TypeScript is JavaScript plus labels describing what kind of data each value holds.

---

## Types and Type Inference

### 1. Concept Explanation

Types describe values, such as `string`, `number` and `boolean`. The compiler checks them while you develop, then removes them, so the browser only ever runs plain JavaScript.

TypeScript can often work out a type by itself, which is called **inference**.

```ts
let title: string = 'Login issue'   // labeled
let sameTitle = 'Login issue'       // inferred as string
sameTitle = 42                      // error
```

### 2. Project Implementation

The whole frontend is TypeScript. Function parameters and shared data are labeled, and local variables are mostly inferred. Shared data types live in `types/index.ts`.

### 3. Code Reference

**File:** [frontend/src/utils/formatDate.ts](../../frontend/src/utils/formatDate.ts)

```ts
export function formatDate(isoDate: string): string {
```

- `isoDate: string` is the input type, and `: string` after the parentheses is the return type. `formatDate(123)` is an error.

**File:** [frontend/src/pages/TicketListPage.tsx](../../frontend/src/pages/TicketListPage.tsx)

```tsx
const [page, setPage] = useState(1)
```

- TypeScript infers `number` from the `1`, so no label is needed.

### 4. Why We Used It

Most bugs in a project like this are wrong shapes, typos or missing values. TypeScript catches these before the code runs, adds autocomplete, and makes changes safer, since changing a type shows every place affected.

### 5. Real-Time Scenario

Suppose you rename a ticket field in `types/index.ts`. Every file still using the old name is immediately flagged in your editor, and `npm run build` fails. The mistake never reaches a user.

### 6. Interview Questions

- **Theory:** What is TypeScript, and why use it?
- **Theory:** Does TypeScript protect you at runtime?
- **Theory:** What's the difference between `any` and `unknown`?
- **Practical:** How did you use TypeScript in your project?
- **Practical:** How do you check for type errors?

### 7. Project-Based Answers

**What is TypeScript?**
JavaScript with static types, checked during development and removed from the code that ships. In MiniDesk, it catches wrong props and missing fields before the app runs.

**Does it protect you at runtime?**
No, because the types are erased. If an API returned the wrong shape, TypeScript wouldn't know. That's why the backend must validate data too.

**`any` versus `unknown`?**
`any` switches off checking for that value. `unknown` means "could be anything", and forces you to check it before use. MiniDesk doesn't use `any`.

**How did you use it?**
I keep shared shapes in `types/index.ts`, type every component's props, and use union types for fixed values like ticket status.

**How do you check for errors?**
With `npx tsc -b`, and `npm run build` also runs it. I also tested my types by deliberately assigning wrong values, using `@ts-expect-error`, to prove they were rejected.

### 8. Follow-up Questions

- **What does `@ts-expect-error` do?** It makes the check fail if the next line has **no** error, so it's useful for testing types.
- **When would you let TypeScript infer instead of labeling?** For local variables where it's obvious. I label function inputs and shared data.
- **What is strict mode?** A set of stricter checks, including `null` handling. It's why TypeScript makes me handle a missing ticket.

---

## Interfaces

### 1. Concept Explanation

An interface describes the shape of an object: which fields it has, and their types.

```ts
interface User {
  id: number
  name: string
}
```

### 2. Project Implementation

- **Data:** `User`, `Ticket`, `TicketComment` and `DashboardStats`.
- **Props:** nearly every component has a props interface.
- **Redux:** `TicketsState` and `DashboardState`.

### 3. Code Reference

**File:** [frontend/src/types/index.ts](../../frontend/src/types/index.ts)

```ts
export interface User {
  id: number
  name: string
  email: string
  role: UserRole
  createdAt: string // ISO date text, such as "2026-11-01T12:00:00Z"
}
```

- There's no password field, on purpose. The frontend should never receive one.

**File:** [frontend/src/components/common/Button.tsx](../../frontend/src/components/common/Button.tsx)

```tsx
interface ButtonProps extends ComponentProps<'button'> {
  variant?: ButtonVariant
  isLoading?: boolean
}
```

- `extends` adds to an existing type, so `Button` also accepts every normal button prop.

### 4. Why We Used It

One shared definition of each kind of data means every file agrees on it. A props interface also documents how to use a component, and catches wrong usage right where it happens.

### 5. Real-Time Scenario

A developer uses `<TicketTable />` and forgets the `tickets` prop. The editor flags it immediately, whereas plain JavaScript would crash on `tickets.map` only when that page loaded.

### 6. Interview Questions

- **Theory:** What's the difference between `interface` and `type`?
- **Theory:** What does `extends` do?
- **Practical:** Show me how you typed a component's props.
- **Practical:** Why doesn't your `User` have a password?

### 7. Project-Based Answers

**`interface` versus `type`?**
Both can describe objects. Interfaces can be extended and reopened, while `type` can also describe unions and other forms. I use `interface` for object shapes and `type` for unions like `TicketStatus`, which an interface can't express.

**What does `extends` do?**
It builds on another type. `ButtonProps extends ComponentProps<'button'>` adds `variant` and `isLoading` to all the normal button props.

**How did you type props?**
With an interface, then destructuring in the parameters. For example, `TopNav` receives `title`, a string, and `onOpenMenu`, a function returning nothing.

**Why no password on `User`?**
The frontend should never receive one. Leaving it out documents that rule, and TypeScript rejects adding it to a `User` object. The real protection is on the server, though, which must never send it.

### 8. Follow-up Questions

- **Why `TicketComment` rather than `Comment`?** Browsers already have a global `Comment` type, so that name is confusing and could refer to the wrong thing.
- **Why are dates strings?** JSON has no date type, so APIs send dates as text. `formatDate` converts them for display.
- **Do interfaces exist at runtime?** No. They're removed completely.

---

## Union Types

### 1. Concept Explanation

A union says a value can be one of several options. Unions of exact strings work like a list of allowed values.

```ts
type TicketStatus = 'open' | 'in_progress' | 'resolved'
```

### 2. Project Implementation

`UserRole`, `TicketStatus`, `TicketPriority`, `TicketCategory`, `TicketScope` and `ButtonVariant` are all unions. Unions also describe values that may be missing, like `number | null`.

### 3. Code Reference

**File:** [frontend/src/types/index.ts](../../frontend/src/types/index.ts)

```ts
export type TicketStatus = 'open' | 'in_progress' | 'resolved'
```

**File:** [frontend/src/components/common/Badge.tsx](../../frontend/src/components/common/Badge.tsx)

```tsx
const statusTones: Record<TicketStatus, BadgeTone> = {
```

- Adding a new status without a color here becomes a compile error.

### 4. Why We Used It

A plain `string` would accept `'opne'`, and the bug would only appear later as a missing badge. Unions catch this immediately and give autocomplete. Combined with `Record`, adding a status shows you everywhere that needs updating.

### 5. Real-Time Scenario

Suppose MiniDesk adds a `closed` status. As soon as you add it to the union, the compiler points to the badge colors and labels that need updating. You can't accidentally ship a status with no label.

### 6. Interview Questions

- **Theory:** What is a union type?
- **Theory:** Union type or `enum`?
- **Practical:** How did you model ticket status?

### 7. Project-Based Answers

**What is a union type?**
A type allowing one of several options. `TicketStatus` allows only three strings, so `'banana'` is an error.

**Union or `enum`?**
String unions need no runtime code and the values are plain strings, which match JSON from the API. `enum`s generate extra JavaScript. My TypeScript settings also disallow them, through `erasableSyntaxOnly`.

**How did you model ticket status?**
As a union of three strings, with a `Record` mapping each to a label and a color. The database will mirror it with a `CHECK` constraint in Phase 6.

### 8. Follow-up Questions

- **Why `'' `in `TicketStatus | ''`?** In `TicketFilterValues`, an empty string means "no filter".
- **What is a discriminated union?** A union of object types sharing one field that identifies each. MiniDesk doesn't need one yet, but API results could use it.
- **Can you get the union's values at runtime?** No, types are erased. That's why `ticketStatuses` is also a real array, for dropdowns.

---

## Optional and Nullable

### 1. Concept Explanation

- **Optional** (`name?: string`): the property can be left out.
- **Nullable** (`name: string | null`): the property must exist, but its value can be `null`.

### 2. Project Implementation

- **Optional:** component props with defaults, like `variant?`, and query fields in `TicketQuery`.
- **Nullable:** `assignedAgentId`, `selectedTicket` and `user`.

### 3. Code Reference

**File:** [frontend/src/types/index.ts](../../frontend/src/types/index.ts)

```ts
assignedAgentId: number | null
assignedAgentName: string | null
```

- Every ticket has these fields. `null` clearly means nobody is assigned.

**File:** [frontend/src/components/layout/ProtectedRoute.tsx](../../frontend/src/components/layout/ProtectedRoute.tsx)

```tsx
allowedRoles?: UserRole[]
```

- Leaving this out means any signed-in user may enter.

### 4. Why We Used It

The difference communicates intent. "Not provided" and "has no value" are different ideas. TypeScript also forces you to handle `null` before using the value, which prevents a very common crash.

### 5. Real-Time Scenario

A database row for an unassigned ticket has `NULL` in its agent column, which arrives as `null` in JSON. Because the type says `number | null`, the code must handle that case, and the page shows "Unassigned".

### 6. Interview Questions

- **Theory:** What's the difference between `?` and `| null`?
- **Theory:** What's the difference between `null` and `undefined`?
- **Practical:** How do you handle a ticket with no agent?

### 7. Project-Based Answers

**`?` versus `| null`?**
`?` means the property can be absent. `| null` means it's present but may hold no value. My `Ticket` uses `| null` for the agent because the field always exists.

**`null` versus `undefined`?**
`undefined` usually means something was never set, and `null` is a deliberate "no value". JSON can carry `null` but not `undefined`, so `null` suits API data.

**How do you handle no agent?**
The type is `string | null`, so TypeScript makes me deal with it. The table shows `ticket.assignedAgentName ??` a muted "Unassigned" label.

### 8. Follow-up Questions

- **What would happen without strict null checks?** TypeScript would let you call methods on `null`, and it would crash at runtime.
- **How would you remove `null` in a place you know it can't be?** Narrow it with a check. `useCurrentUser` does this and throws if it's missing.
- **What does `!` do, as in `getElementById('root')!`?** It tells TypeScript a value isn't null, with no runtime check. So use it sparingly.

---

## Type Narrowing

### 1. Concept Explanation

Narrowing is TypeScript working out a more specific type from your checks.

```ts
function print(value: string | null) {
  if (value === null) return
  value.toUpperCase()   // TypeScript knows it's a string here
}
```

### 2. Project Implementation

- **`TicketDetailsLoader`:** handles a missing ticket before rendering.
- **`useCurrentUser`:** turns `User | null` into `User`.
- **Catch blocks:** `instanceof Error` narrows an unknown error.

### 3. Code Reference

**File:** [frontend/src/hooks/useAuth.ts](../../frontend/src/hooks/useAuth.ts)

```ts
export function useCurrentUser(): User {
  const { user } = useAuth()
  if (!user) throw new Error('useCurrentUser must be used on a protected page.')
  return user
}
```

- After the `throw`, TypeScript knows `user` can't be null.

**File:** [frontend/src/components/tickets/CommentForm.tsx](../../frontend/src/components/tickets/CommentForm.tsx)

```tsx
setError(caughtError instanceof Error ? caughtError.message : 'We couldn\'t post your comment.')
```

- Anything can be thrown in JavaScript, so `caughtError` has type `unknown`. `instanceof` proves it's an `Error` before using `.message`.

### 4. Why We Used It

It prevents "Cannot read properties of undefined", one of the most common JavaScript crashes. Components on protected pages can use `useCurrentUser` and skip null checks that could never matter.

### 5. Real-Time Scenario

Someone requests a ticket that doesn't exist. `selectedTicket` stays `null`, the error state shows a message, and `TicketDetails` never renders with missing data. TypeScript wouldn't let it receive `null` anyway.

### 6. Interview Questions

- **Theory:** What is type narrowing?
- **Theory:** What ways are there to narrow a type?
- **Practical:** How do you handle a possibly missing value?
- **Practical:** How do you handle errors of unknown type?

### 7. Project-Based Answers

**What is narrowing?**
TypeScript following my checks to determine a more specific type. After `if (!user) throw`, it knows `user` is a `User`.

**What ways are there?**
Truthiness checks, `typeof`, `instanceof`, comparing to specific values, and `in`. I mostly use truthiness and `instanceof`.

**How do you handle a missing value?**
I check for it early. `TicketDetailsLoader` shows a spinner until the right ticket is loaded, then passes it to a child whose prop type is `Ticket`, not `Ticket | null`.

**How do you handle unknown errors?**
In `catch`, the error is `unknown`, so I check `instanceof Error` before reading its message, with a fallback message otherwise.

### 8. Follow-up Questions

- **What is a type guard function?** A function returning `value is SomeType`, so you can reuse a narrowing check.
- **Why not use `as Error` everywhere?** `as` skips checking. In `CreateTicketPage` I do use it, because Redux's `unwrap` throws a known error object, but `instanceof` is safer otherwise.
- **Does narrowing affect runtime code?** The check itself runs, but no extra code is added for types.

---

## Generics

### 1. Concept Explanation

Generics are types with a blank to fill in. `T` is a placeholder for whichever type gets used, so one function can work with many types and still keep them checked.

```ts
function first<T>(items: T[]): T | undefined {
  return items[0]
}
first([1, 2])       // T is number
first(['a', 'b'])   // T is string
```

### 2. Project Implementation

- **`paginate<T>`:** works with any list.
- **`useDebounce<T>`:** works with any value.
- **`PaginatedResponse<T>`:** any kind of paged data.
- **Library generics:** `useState<...>`, `useRef<...>`, `useForm<...>` and `Record<...>`.

### 3. Code Reference

**File:** [frontend/src/utils/previewData.ts](../../frontend/src/utils/previewData.ts)

```ts
export function paginate<T>(items: T[], page: number, pageSize: number): PaginatedResponse<T> {
```

- Passing `Ticket[]` makes `T` become `Ticket`, so the result holds `Ticket[]`.

**File:** [frontend/src/types/index.ts](../../frontend/src/types/index.ts)

```ts
export interface PaginatedResponse<T> {
  items: T[]
  page: number
  totalPages: number
  totalItems: number
}
```

**File:** [frontend/src/components/tickets/TicketForm.tsx](../../frontend/src/components/tickets/TicketForm.tsx)

```tsx
} = useForm<CreateTicketInput>({
```

- This makes `register('title')` checked, so `register('titel')` is an error.

### 4. Why We Used It

Without generics, I'd need a separate `paginate` per type, or use `any` and lose all checking. Generics give one reusable function that keeps the exact types.

### 5. Real-Time Scenario

The ticket list calls `paginate(tickets, page, limit)`. Back in the page, `ticket.title` autocompletes and `ticket.banana` is an error, because TypeScript carried the `Ticket` type all the way through.

### 6. Interview Questions

- **Theory:** What are generics, and what problem do they solve?
- **Theory:** Why not just use `any`?
- **Practical:** Have you written a generic function?
- **Practical:** Where else do you use generics?

### 7. Project-Based Answers

**What are generics?**
Types with a placeholder filled in at use. They allow reusable code that keeps its type information.

**Why not `any`?**
`any` turns checking off, so the result loses its type. With `paginate<T>`, passing tickets gives back tickets. I confirmed that accessing a non-existent field on the result is a type error.

**Have you written a generic function?**
Yes, `useDebounce<T>` and `paginate<T>`. `useDebounce` returns the same type it's given, so a debounced string stays a string.

**Where else do you use them?**
`useState<TicketFilterValues>`, `useRef<HTMLDivElement>`, `useForm<CreateTicketInput>` and Redux's `useSelector.withTypes<RootState>`.

### 8. Follow-up Questions

- **When must you write the type explicitly?** When it can't be inferred, such as `useState<string | null>(null)`, where `null` alone wouldn't tell it the rest.
- **Can generics be restricted?** Yes, with `extends`: `<T extends { id: number }>` accepts only objects with an ID.
- **Do generics exist at runtime?** No, they're erased like other types.

---

## Utility Types

### 1. Concept Explanation

TypeScript includes tools that build new types from existing ones.

| Utility | Result |
|---|---|
| `Partial<T>` | All fields optional |
| `Pick<T, 'a' \| 'b'>` | Only those fields |
| `Omit<T, 'a'>` | All fields except those |
| `Record<K, V>` | An object with keys `K` and values `V` |
| `ReturnType<typeof fn>` | What a function returns |

### 2. Project Implementation

- **`Pick`, `Partial`:** input types derived from `Ticket`.
- **`Record`:** label and color maps.
- **`ReturnType`:** the Redux `RootState`.
- **Indexed access, `Ticket['status']`:** the type of one field.

### 3. Code Reference

**File:** [frontend/src/types/index.ts](../../frontend/src/types/index.ts)

```ts
export type CreateTicketInput = Pick<Ticket, 'title' | 'description' | 'category' | 'priority'>
```

- Only the fields a customer fills in. If `Ticket['title']` changes type, this follows automatically.

```ts
export type UpdateTicketInput = Partial<Pick<Ticket, 'title' | 'description' | 'status' | 'assignedAgentId'>>
```

- An update may change just one of these fields.

**File:** [frontend/src/utils/ticketLabels.ts](../../frontend/src/utils/ticketLabels.ts)

```ts
export const statusLabels: Record<TicketStatus, string> = {
```

**File:** [frontend/src/store/store.ts](../../frontend/src/store/store.ts)

```ts
export type RootState = ReturnType<typeof store.getState>
```

- TypeScript works out the whole Redux state's type, so it stays correct as slices are added.

### 4. Why We Used It

They avoid repeating types. Writing `CreateTicketInput` by hand would let it drift from `Ticket`. Deriving it means there's one source of truth.

### 5. Real-Time Scenario

An agent changes only a ticket's status. The code sends `{ status: 'resolved' }`, and `Partial` makes that valid without the other fields. Sending `{ status: 'banana' }` or a field outside the list is an error.

### 6. Interview Questions

- **Theory:** What do `Partial`, `Pick`, `Omit` and `Record` do?
- **Practical:** How do you avoid repeating types?
- **Practical:** How did you type your Redux state?

### 7. Project-Based Answers

**What do they do?**
`Partial` makes fields optional, `Pick` selects fields, `Omit` excludes them and `Record` describes an object from its key and value types.

**How do you avoid repeating types?**
I derive them. `CreateTicketInput` picks from `Ticket`, and `UpdateTicketInput` combines `Partial` and `Pick`. `RegisterFormValues` also extends `RegisterInput` to add a form-only field.

**How did you type your Redux state?**
With `ReturnType<typeof store.getState>`, so it's worked out from the store and can't drift.

### 8. Follow-up Questions

- **Why use `Record` rather than a plain object type?** It requires a value for every key, so a missing status label is a compile error.
- **`Pick` or `Omit`?** `Pick` when listing what you want is shorter or safer. With `Omit`, a new field on `Ticket` would automatically be included, which could be unwanted.
- **What does `typeof` mean in a type?** It takes a runtime value's type, such as `typeof store.getState`.

---

## Type Assertions

### 1. Concept Explanation

`as` tells TypeScript to treat a value as a certain type. It's only an instruction to the compiler, with no runtime check. If you're wrong, nothing warns you.

### 2. Project Implementation

MiniDesk uses `as` only where TypeScript can't know the type:

- HTML `select` values, which are always plain strings.
- `event.target`, a very general type.
- `location.state`, which can hold anything.

### 3. Code Reference

**File:** [frontend/src/components/tickets/TicketManagePanel.tsx](../../frontend/src/components/tickets/TicketManagePanel.tsx)

```tsx
onChange={(event) => onStatusChange(event.target.value as TicketStatus)}
```

- The browser reports a `string`, but this dropdown's options all come from `ticketStatuses`, so it's safe here.

**File:** [frontend/src/components/layout/GuestRoute.tsx](../../frontend/src/components/layout/GuestRoute.tsx)

```tsx
const { from } = (location.state as { from?: string } | null) ?? {}
```

### 4. Why We Used It

These are places where I know more than the compiler. The alternative would be extra runtime checks for values my own code just set.

### 5. Real-Time Scenario

An agent picks **Resolved** in the dropdown. The browser reports the text `'resolved'`. The assertion lets that pass as a `TicketStatus`, and because a user could tamper with the page, the server must still validate it.

### 6. Interview Questions

- **Theory:** What does `as` do? Is it safe?
- **Theory:** What's the difference between a type assertion and a type conversion?
- **Practical:** Where did you use assertions, and why?

### 7. Project-Based Answers

**What does `as` do?**
It overrides what TypeScript believes about a type, with no runtime check. So I use it sparingly, because a wrong assertion hides a real bug.

**Assertion versus conversion?**
Assertions only affect type checking. A conversion actually changes the value. In `TicketManagePanel`, `Number(event.target.value)` is a conversion, because that value really is text, while `as TicketStatus` changes nothing.

**Where did you use them, and why?**
On dropdown values, where the options come from a list of valid values. On `event.target` in `useCloseOnOutside`, because `contains` needs a `Node`.

### 8. Follow-up Questions

- **What's a safer alternative?** A runtime check or type guard, which verifies the value. That's a must for data from outside the app.
- **What is `as const`?** It makes a value's type as narrow as possible and readonly. MiniDesk doesn't need it yet.
- **What does `as unknown as X` signal?** Forcing an unrelated type, which is usually a warning sign.
