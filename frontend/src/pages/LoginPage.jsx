import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { Link } from 'react-router-dom'
import { Button } from '../components/common/Button'
import { ErrorMessage } from '../components/common/ErrorMessage'
import { Input } from '../components/common/Input'
import { AuthLayout } from '../components/layout/AuthLayout'
import { useAuth } from '../hooks/useAuth'
import { emailRules } from '../utils/validationRules'

export function LoginPage() {
  const { login } = useAuth()
  const [loginError, setLoginError] = useState('')
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({ defaultValues: { email: '', password: '' } })

  // There's no navigate call here. When login succeeds the user changes,
  // and GuestRoute redirects to the right page.
  async function submitValidForm(values) {
    setLoginError('')
    try {
      await login(values)
    } catch (caughtError) {
      setLoginError(caughtError instanceof Error ? caughtError.message : 'We couldn\'t sign you in.')
    }
  }

  return (
    <AuthLayout title="Welcome back" subtitle="Sign in to your MiniDesk account.">
      <form className="space-y-4" noValidate onSubmit={handleSubmit(submitValidForm)}>
        {loginError && <ErrorMessage message={loginError} />}
        <Input
          id="email"
          label="Email"
          type="email"
          placeholder="you@example.com"
          autoComplete="email"
          error={errors.email?.message}
          {...register('email', emailRules)}
        />
        {/* No length rule here: a login form only checks that a password was entered. */}
        <Input
          id="password"
          label="Password"
          type="password"
          autoComplete="current-password"
          error={errors.password?.message}
          {...register('password', { required: 'Enter your password.' })}
        />
        <div className="text-right">
          <Link to="/forgot-password" className="text-sm font-medium text-primary hover:underline">
            Forgot password?
          </Link>
        </div>
        <Button type="submit" className="w-full" isLoading={isSubmitting}>
          Sign in
        </Button>
      </form>
      <p className="mt-5 text-center text-sm text-slate-500">
        New to MiniDesk?{' '}
        <Link to="/register" className="font-medium text-primary hover:underline">
          Create an account
        </Link>
      </p>
    </AuthLayout>
  )
}
