// Validation rules for React Hook Form, shared so every form gives the same messages.
// These checks only help the user. The API repeats them in backend/src/utils/validators.ts,
// because anyone can bypass browser code and call the API directly.

export const nameRules = {
  validate: (value) => value.trim().length >= 2 || 'Enter your full name.',
  maxLength: { value: 100, message: 'Keep your name to 100 characters or fewer.' },
}

export const emailRules = {
  required: 'Enter your email address.',
  pattern: {
    value: /^\s*[^\s@]+@[^\s@]+\.[^\s@]+\s*$/,
    message: 'Enter a valid email address.',
  },
}

export const newPasswordRules = {
  required: 'Enter a password.',
  minLength: { value: 8, message: 'Use at least 8 characters.' },
  maxLength: { value: 72, message: 'Use 72 characters or fewer.' },
}

// validate returns true when the value is fine, or the error message when it isn't.
// trim() means a title made only of spaces doesn't count as filled in.
export const ticketTitleRules = {
  validate: (value) => value.trim().length >= 5 || 'Enter a title of at least 5 characters.',
  maxLength: { value: 120, message: 'Keep the title to 120 characters or fewer.' },
}

export const ticketDescriptionRules = {
  validate: (value) => value.trim().length >= 10 || 'Enter a description of at least 10 characters.',
  maxLength: { value: 5000, message: 'Keep the description to 5000 characters or fewer.' },
}
