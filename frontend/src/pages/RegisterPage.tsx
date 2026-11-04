import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { Button } from '../components/common/Button'
import { InfoMessage } from '../components/common/InfoMessage'
import { Input } from '../components/common/Input'
import { AuthLayout } from '../components/layout/AuthLayout'
import { emailRules, newPasswordRules } from '../utils/validationRules'

interface RegisterFormValues {
  name: string
  email: string
  password: string
  confirmPassword: string
}

export function RegisterPage() {
  const [wasValidated, setWasValidated] = useState(false)
  const {
    register,
    handleSubmit,
    getValues,
    formState: { errors },
  } = useForm<RegisterFormValues>({
    defaultValues: { name: '', email: '', password: '', confirmPassword: '' },
  })

  return (
    <AuthLayout title="Create your account" subtitle="Sign up to create and track support tickets.">
      <form className="space-y-4" noValidate onSubmit={handleSubmit(() => setWasValidated(true))}>
        {wasValidated && <InfoMessage message="The form is valid, but no account was created. Sign-up arrives in Phase 7." />}
        <Input
          id="name"
          label="Full name"
          autoComplete="name"
          error={errors.name?.message}
          {...register('name', {
            validate: (value) => value.trim().length >= 2 || 'Enter your full name.',
          })}
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
        <Button type="submit" className="w-full">
          Create account
        </Button>
      </form>
      <p className="mt-5 text-center text-sm text-slate-500">
        Already have an account?{' '}
        <a href="#login" className="font-medium text-primary hover:underline">
          Sign in
        </a>
      </p>
    </AuthLayout>
  )
}
