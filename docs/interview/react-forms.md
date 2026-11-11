# React Forms

MiniDesk has both kinds of form on purpose, so you can compare them: `CommentForm` by hand, and the others with React Hook Form.

---

## Controlled Inputs

### 1. Concept Explanation

In a controlled input, React state holds the value. The input displays that state, and every keystroke updates it.

```jsx
<input value={text} onChange={(event) => setText(event.target.value)} />
```

In an **uncontrolled** input, the DOM holds the value, and you read it when needed.

### 2. Project Implementation

- **`CommentForm`:** a controlled textarea, written by hand.
- **`TicketFilters`:** a controlled search box and dropdowns, because other logic reacts to each change.
- **`TopNav`:** a controlled search box.

### 3. Code Reference

**File:** [frontend/src/components/tickets/CommentForm.jsx](../../frontend/src/components/tickets/CommentForm.jsx)

```jsx
const [message, setMessage] = useState('')
```

```jsx
value={message}
```

```jsx
onChange={(event) => setMessage(event.target.value)}
```

```jsx
const trimmedMessage = message.trim()
if (trimmedMessage === '') {
  setError('Write a comment before posting.')
```

- `value` means React decides what's displayed.
- Validation uses the trimmed text, so a comment of only spaces is rejected.

### 4. Why We Used It

The value is always available to validate or clear. That's why the filter box is controlled: each keystroke feeds the search. For a single field, writing it by hand is simple, and it shows what a form library does for you.

### 5. Real-Time Scenario

An agent types a reply. Each key updates `message`, and React re-renders the field. They post, the request succeeds, and `setMessage('')` clears the box. If the request fails, `message` is untouched, so their text is still there.

### 6. Interview Questions

- **Theory:** What's the difference between controlled and uncontrolled inputs?
- **Theory:** Why does a controlled input with no `onChange` appear frozen?
- **Practical:** Show me a controlled input in your project.

### 7. Project-Based Answers

**Controlled versus uncontrolled?**
In a controlled input, React state holds the value. In an uncontrolled one, the DOM holds it. Controlled gives instant access to the value but re-renders on each key, which is why my larger forms use a library that avoids this.

**Why does it appear frozen?**
`value` forces the field to show the state, so without `onChange` updating that state, what you type is immediately reverted.

**Show me one.**
`CommentForm` holds `message` in state, displays it with `value`, and updates it with `onChange`. On submit, it trims and validates, then clears on success.

### 8. Follow-up Questions

- **Why trim the message?** So only spaces can't count as content, and the stored text has no stray spaces.
- **Why does a `select` use `value` in React?** React uses `value` on the `select` itself, rather than `selected` on an option.
- **How do you reset a controlled input?** Set its state back to the starting value.

---

## React Hook Form and Validation

### 1. Concept Explanation

React Hook Form manages field values, validation and errors. It uses uncontrolled inputs, so typing doesn't re-render the whole form. Its main tools are:

- **`register`:** connects a field to the form.
- **`handleSubmit`:** validates, then calls your function only if everything passes.
- **`formState.errors`:** holds each field's error.
- **`formState.isSubmitting`:** true while an async submit runs.

### 2. Project Implementation

`TicketForm`, `TicketEditForm`, `LoginPage` and `RegisterPage` use it. Shared rules are in `validationRules.js`.

### 3. Code Reference

**File:** [frontend/src/components/tickets/TicketForm.jsx](../../frontend/src/components/tickets/TicketForm.jsx)

```jsx
} = useForm({
  defaultValues: { title: '', description: '', category: 'general', priority: 'medium' },
})
```

```jsx
<form className="space-y-5 p-5" noValidate onSubmit={handleSubmit(submitValidForm)}>
```

```jsx
error={errors.title?.message}
{...register('title', ticketTitleRules)}
```

- `register` returns `name`, `onChange`, `onBlur` and `ref`, and the spread passes them to the input.
- `noValidate` turns off browser pop-ups, so our own messages show.

**File:** [frontend/src/utils/validationRules.js](../../frontend/src/utils/validationRules.js)

```js
validate: (value) => value.trim().length >= 5 || 'Enter a title of at least 5 characters.',
```

- A rule returns `true` when valid, or the error message when not. Trimming stops titles made only of spaces.

**File:** [frontend/src/pages/RegisterPage.jsx](../../frontend/src/pages/RegisterPage.jsx)

```jsx
validate: (value) => value === getValues('password') || 'The passwords must match.',
```

- `getValues` reads another field, because this rule compares two.

### 4. Why We Used It

Four fields with validation by hand would mean a lot of repeated state and checks. This library removes that, and it gives `isSubmitting`, which disables the button so a form can't be submitted twice. Sharing the rules keeps the messages consistent.

### 5. Real-Time Scenario

A customer clicks **Create Ticket** with an empty form. `handleSubmit` runs the rules, and errors appear with no request sent. They fix the fields and resubmit. The button shows a loading spinner until the ticket is created, and they're then taken to the new ticket.

### 6. Interview Questions

- **Theory:** Why use a form library?
- **Theory:** Is client-side validation enough?
- **Practical:** How did you validate your forms?
- **Practical:** How do you stop double submissions?
- **Practical:** How do you validate password confirmation?

### 7. Project-Based Answers

**Why use a form library?**
It handles values, validation and submission with little code, and few re-renders. `CommentForm` shows the manual approach, which is fine for one field, but gets repetitive as a form grows.

**Is client-side validation enough?**
No. It gives quick feedback, but anyone can skip it by calling the API directly with a tool like Postman. The server must validate too, which MiniDesk does.

**How did you validate your forms?**
With React Hook Form and shared rules in `validationRules.js`. Errors pass to my `Input` component, which displays them and connects them for screen readers.

**How do you stop double submissions?**
`isSubmitting` is true while the async submit runs, and passing it as `isLoading` disables the button.

**How do you validate password confirmation?**
A custom `validate` rule compares the field with `getValues('password')`. The confirmation is never sent to the server, because `submitValidForm` passes only name, email and password.

### 8. Follow-up Questions

- **How does `register` work with your own `Input`?** `Input` spreads `...rest` onto the real input, which includes `ref` in React 19.
- **Why use `noValidate`?** Browser pop-ups look different everywhere and can't be styled. This keeps messages consistent.
- **What about validation libraries like Zod?** They define rules as a schema you can share with the backend. For this project's size, simple rules were enough.
- **What does a failed login look like?** The server error is stored in `loginError` and shown above the form. The form's validation rules don't handle that.
