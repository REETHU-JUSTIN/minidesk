import { Loader2 } from 'lucide-react'
import { Link } from 'react-router-dom'

const baseClasses =
  'inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors ' +
  'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary ' +
  'disabled:cursor-not-allowed disabled:opacity-50'

// A lookup object is easier to read than a chain of if statements.
const variantClasses = {
  primary: 'bg-primary text-white hover:bg-primary-hover',
  secondary: 'border border-slate-300 bg-white text-slate-700 hover:bg-slate-50',
  ghost: 'text-slate-600 hover:bg-slate-100',
  danger: 'bg-red-600 text-white hover:bg-red-700',
}

export function Button({
  variant = 'primary',
  isLoading = false,
  className = '',
  children,
  disabled,
  type = 'button',
  ...rest
}) {
  return (
    <button
      type={type}
      disabled={disabled || isLoading}
      className={`${baseClasses} ${variantClasses[variant]} ${className}`}
      {...rest}
    >
      {isLoading && <Loader2 className="size-4 animate-spin" aria-hidden="true" />}
      {children}
    </button>
  )
}

// A link that looks like a button. Use it for navigation; use Button for actions.
export function LinkButton({ variant = 'primary', className = '', children, ...rest }) {
  return (
    <Link className={`${baseClasses} ${variantClasses[variant]} ${className}`} {...rest}>
      {children}
    </Link>
  )
}
