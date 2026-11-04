# HTML, CSS and Tailwind

---

## Semantic HTML and Accessibility

### 1. Concept Explanation

Semantic HTML means using elements for their meaning: `button` for actions, `a` for navigation, `nav`, `main`, `table`. Browsers and screen readers understand these and give them behavior for free, such as keyboard support.

Accessibility means people can use the app with a keyboard, a screen reader or other assistive tools. `aria-*` attributes add information where HTML alone isn't enough.

### 2. Project Implementation

- **Layout:** `aside`, `nav`, `header` and `main`.
- **Forms:** every field has a linked `label`, and errors are connected with `aria-describedby`.
- **Tables:** `th scope="col"`.
- **Modal:** `role="dialog"`, moves focus, and closes on Escape.
- **Status:** `role="alert"` on errors and `role="status"` on loading.
- **Colors:** every badge also has text.

### 3. Code Reference

**File:** [frontend/src/components/common/Input.tsx](../../frontend/src/components/common/Input.tsx)

```tsx
<label htmlFor={id} className="mb-1.5 block text-sm font-medium text-slate-700">
```

```tsx
aria-invalid={Boolean(error)}
aria-describedby={errorId}
```

- `htmlFor` links the label to the field, so clicking it focuses the field and screen readers announce it.
- `aria-invalid` says the field has an error, and `aria-describedby` points to the message.

**File:** [frontend/src/components/common/Modal.tsx](../../frontend/src/components/common/Modal.tsx)

```tsx
role="dialog"
aria-modal="true"
aria-label={title}
```

**File:** [frontend/src/components/common/Button.tsx](../../frontend/src/components/common/Button.tsx)

```tsx
type = 'button',
```

- A `button` in a form submits by default, so this stops a Cancel button from submitting by accident.

### 4. Why We Used It

Real elements give keyboard and screen reader support for free, whereas a clickable `div` gives neither. It's also often a legal requirement, and it makes tests easier: testing tools find elements by role and label.

### 5. Real-Time Scenario

A screen reader user tabs to the email field and hears "Email, edit text". They submit an invalid address and hear that the field is invalid, followed by "Enter a valid email address." A sighted user sees the same message in red.

### 6. Interview Questions

- **Theory:** What is semantic HTML, and why does it matter?
- **Theory:** When should you use ARIA?
- **Theory:** When should you use a link rather than a button?
- **Practical:** How did you make your forms and modal accessible?

### 7. Project-Based Answers

**What is semantic HTML?**
Using elements for their meaning. It gives accessibility, keyboard support and clearer code. My sidebar is an `aside` containing a `nav`, and page content is in `main`.

**When should you use ARIA?**
Only when HTML can't express something, because a native element is always better. I use `role="dialog"` because my modal is built from `div`s, and `aria-label` on icon-only buttons.

**Link or button?**
Links navigate and buttons act. That's why I have both `LinkButton` and `Button`, even though they look identical.

**How did you make them accessible?**
Each form field has a linked label and connected error. My modal moves focus in when opening, and closes on Escape.

### 8. Follow-up Questions

- **What's missing from your modal?** A focus trap. Tab can still reach elements behind it, and focus doesn't return to the button on close. A production app should add both, or use the native `dialog` element.
- **How did you handle color blindness?** Status badges always include text, and each bar in the status overview has a text label and number.
- **How would you test accessibility?** Keyboard-only use, a screen reader, and automated tools like axe.

---

## Tailwind CSS and Design Tokens

### 1. Concept Explanation

Tailwind provides small classes that each do one thing, such as `p-4` for padding and `rounded-xl` for rounded corners. You combine them directly in your markup. It generates CSS only for the classes you actually use.

**Design tokens** are named values for things like colors. Components use the name rather than a raw color.

### 2. Project Implementation

MiniDesk is styled entirely with Tailwind. Tokens for the brand color and font are in `index.css`. Shared components hold repeated styling.

### 3. Code Reference

**File:** [frontend/src/index.css](../../frontend/src/index.css)

```css
--color-primary: #4f46e5;
--color-primary-hover: #4338ca;
--color-primary-soft: #eef2ff;
```

- Tailwind turns each into classes such as `bg-primary` and `text-primary`.

**File:** [frontend/src/components/common/Button.tsx](../../frontend/src/components/common/Button.tsx)

```tsx
const variantClasses: Record<ButtonVariant, string> = {
  primary: 'bg-primary text-white hover:bg-primary-hover',
```

- Repeated styles live in a component, so the long class list exists in only one place.

### 4. Why We Used It

Tailwind is quick to work with, and there's no searching for which CSS file affects what. It also keeps styling consistent through a fixed spacing and color scale. Tokens mean a rebrand changes one line.

### 5. Real-Time Scenario

The brand color changes from indigo to teal. You edit `--color-primary` in one file. Every button, active link and badge that uses it updates at once, with no searching through components.

### 6. Interview Questions

- **Theory:** What is utility-first CSS? What are its pros and cons?
- **Theory:** How does Tailwind keep CSS files small?
- **Practical:** How did you keep your styling consistent?
- **Practical:** How do you avoid repeating long class lists?

### 7. Project-Based Answers

**What is utility-first CSS?**
Styling with small single-purpose classes in the markup. The benefits are speed and consistency. The downside is long class lists, which I handle by putting them in shared components.

**How does it keep CSS small?**
It scans my files for class names and generates only those. MiniDesk's built CSS is about 24 KB before compression.

**How did you keep styling consistent?**
Tokens for brand colors, Tailwind's spacing scale, and shared components like `Button`, `Card` and `Badge`, so pages never style those from scratch.

**How do you avoid repetition?**
With components, not by writing custom CSS classes. For example, all badges go through a single `Badge` component.

### 8. Follow-up Questions

- **Why can't you build class names like `` `bg-${color}-500` ``?** Tailwind scans for complete class names, so a dynamic one wouldn't be generated. My `toneClasses` lists full names.
- **When would you still write custom CSS?** For complex animations or things Tailwind can't express.
- **Why not CSS Modules?** They're a good option too. Tailwind fit the project's speed and consistency goals.

---

## Responsive Layout: Flexbox and Grid

### 1. Concept Explanation

- **Flexbox** arranges items in one direction, a row or a column.
- **Grid** arranges items in two dimensions, rows and columns.
- **Responsive** means adapting to screen width. Tailwind is mobile-first: unprefixed classes apply everywhere, and a prefix like `md:` applies from that width up.

### 2. Project Implementation

- **Flexbox:** the sidebar and content layout, top bar, and form buttons.
- **Grid:** stat tiles and the page columns.
- **Responsive:** a slide-in sidebar on phones, and tables that scroll inside their cards.

### 3. Code Reference

**File:** [frontend/src/pages/DashboardPage.tsx](../../frontend/src/pages/DashboardPage.tsx)

```tsx
<div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
```

- One column on phones, two from `sm`, and four from `xl`.

```tsx
<div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
```

- `grid-cols-1` fixes a real bug described below.

**File:** [frontend/src/components/layout/AppLayout.tsx](../../frontend/src/components/layout/AppLayout.tsx)

```tsx
<div className="flex min-w-0 flex-1 flex-col">
```

- `flex-1` fills the remaining width. `min-w-0` lets wide tables scroll inside their card rather than stretching the page.

### 4. Why We Used It

Support agents use desktops, and customers often use phones, so both have to work. Starting from the small layout and adding to it keeps the CSS simple.

### 5. Real-Time Scenario

A customer opens the dashboard on a phone: tiles stack in one column, and the sidebar is hidden behind a menu button. On a laptop, the same page shows four tiles in a row with a fixed sidebar. No separate code is needed.

### 6. Interview Questions

- **Theory:** What's the difference between Flexbox and Grid?
- **Theory:** What does mobile-first mean?
- **Practical:** How did you make the app responsive?
- **Practical:** Tell me about a layout bug you fixed.

### 7. Project-Based Answers

**Flexbox versus Grid?**
Flexbox for one direction, like my top bar. Grid for two dimensions, like my dashboard tiles.

**What does mobile-first mean?**
Base styles target small screens, and prefixes add changes for larger ones. So `fixed md:sticky` means fixed on phones and sticky from medium screens up.

**How did you make the app responsive?**
Grid columns change by breakpoint, the sidebar slides in on phones, and wide tables scroll inside their card. I tested at phone and desktop widths in a real browser.

**Tell me about a layout bug you fixed.**
My phone dashboard scrolled sideways by 29 pixels, even though type checks and the build passed. Long truncated titles were stretching the grid column, because a column without an explicit size grows to fit its content. `grid-cols-1` sets it to `minmax(0, 1fr)`, which lets it shrink. I found it by measuring page overflow in a browser test.

### 8. Follow-up Questions

- **Why does `min-w-0` help?** Flex items won't shrink below their content's width by default. `min-w-0` removes that minimum.
- **How do you handle wide tables on phones?** An `overflow-x-auto` wrapper, so only the table scrolls and not the page.
- **What are `px`, `rem` and `em`?** `px` is fixed, `rem` is relative to the root font size, and `em` is relative to the element's own font size. Tailwind mostly uses `rem`, which respects a user's font settings.
