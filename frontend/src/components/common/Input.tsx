import type { ComponentProps } from 'react'

interface InputProps extends ComponentProps<'input'> {
  label?: string
  error?: string
}

// Connecting the label to the field by id lets screen readers announce it,
// and clicking the label focuses the field.
export function Input({ label, error, id, className = '', ...rest }: InputProps) {
  const errorId = error && id ? `${id}-error` : undefined

  return (
    <div className={className}>
      {label && (
        <label htmlFor={id} className="mb-1.5 block text-sm font-medium text-slate-700">
          {label}
        </label>
      )}
      <input
        id={id}
        aria-invalid={Boolean(error)}
        aria-describedby={errorId}
        className={`block w-full rounded-lg border bg-white px-3 py-2 text-sm placeholder:text-slate-400 focus:border-primary focus:outline-2 focus:outline-primary/20 ${error ? 'border-red-500' : 'border-slate-300'}`}
        {...rest}
      />
      {error && (
        <p id={errorId} className="mt-1.5 text-sm text-red-600">
          {error}
        </p>
      )}
    </div>
  )
}
