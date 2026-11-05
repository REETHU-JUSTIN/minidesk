import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { Link } from 'react-router-dom'
import { Button } from '../components/common/Button'
import { ErrorMessage } from '../components/common/ErrorMessage'
import { Input } from '../components/common/Input'
import { AuthLayout } from '../components/layout/AuthLayout'
import { useAuth } from '../hooks/useAuth'
import type { RegisterInput } from '../types'
import { emailRules, nameRules, newPasswordRules } from '../utils/validationRules'

// Adds a field that only the form needs. The password check happens here,
// so the confirmation is never sent to the server.
interface RegisterFormValues extends RegisterInput {
  confirmPassword: string
}

export function RegisterPage() {
  const { register: registerAccount } = useAuth()
  const [registerError, setRegisterError] = useState('')
  const {
    register,
    handleSubmit,
    getValues,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormValues>({
    defaultValues: { name: '', email: '', password: '', confirmPassword: '' },
  })

  async function submitValidForm({ name, email, password }: RegisterFormValues) {
    setRegisterError('')
    try {
      await registerAccount({ name, email, password })
    } catch (caughtError) {
      setRegisterError(caughtError instanceof Error ? caughtError.message : 'We couldn\'t create your account.')
    }
  }

  return (
    <AuthLayout title="Create your account" subtitle="Sign up to create and track support tickets.">
      <form className="space-y-4" noValidate onSubmit={handleSubmit(submitValidForm)}>
        {registerError && <ErrorMessage message={registerError} />}
        <Input
          id="name"
          label="Full name"
          autoComplete="name"
          error={errors.name?.message}
          {...register('name', nameRules)}
        />
        <Input
          id="email"
          label="Email"
          type="email"
          placeholder="you@example.com"
          autoComplete="email"
          error={errors.email?.message}
          {...register('email', emailRules)}
        />
        <Input
          id="password"
          label="Password"
          type="password"
          autoComplete="new-password"
          error={errors.password?.message}
          {...register('password', newPasswordRules)}
        />
        <Input
          id="confirm-password"
          label="Confirm password"
          type="password"
          autoComplete="new-password"
          error={errors.confirmPassword?.message}
          {...register('confirmPassword', {
            // getValues reads another field, because this rule compares the two.
            validate: (value) => value === getValues('password') || 'The passwords must match.',
          })}
        />
        <Button type="submit" className="w-full" isLoading={isSubmitting}>
          Create account
        </Button>
      </form>
      <p className="mt-5 text-center text-sm text-slate-500">
        Already have an account?{' '}
        <Link to="/login" className="font-medium text-primary hover:underline">
          Sign in
        </Link>
      </p>
    </AuthLayout>
  )
}
