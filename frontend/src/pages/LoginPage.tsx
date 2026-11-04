import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { Button } from '../components/common/Button'
import { InfoMessage } from '../components/common/InfoMessage'
import { Input } from '../components/common/Input'
import { AuthLayout } from '../components/layout/AuthLayout'
import { emailRules } from '../utils/validationRules'

interface LoginFormValues {
  email: string
  password: string
}

export function LoginPage() {
  const [wasValidated, setWasValidated] = useState(false)
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({ defaultValues: { email: '', password: '' } })

  return (
    <AuthLayout title="Welcome back" subtitle="Sign in to your MiniDesk account.">
      {/* Real sign-in arrives in Phase 7, so the form doesn't pretend to log you in. */}
      <form className="space-y-4" noValidate onSubmit={handleSubmit(() => setWasValidated(true))}>
        {wasValidated && <InfoMessage message="The form is valid, but you weren't signed in. Sign-in arrives in Phase 7." />}
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
          <a href="#forgot-password" className="text-sm font-medium text-primary hover:underline">
            Forgot password?
          </a>
        </div>
        <Button type="submit" className="w-full">
          Sign in
        </Button>
      </form>
      <p className="mt-5 text-center text-sm text-slate-500">
        New to MiniDesk?{' '}
        <a href="#register" className="font-medium text-primary hover:underline">
          Create an account
        </a>
      </p>
    </AuthLayout>
  )
}
