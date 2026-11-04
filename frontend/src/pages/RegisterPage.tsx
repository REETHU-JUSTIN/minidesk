import { Button } from '../components/common/Button'
import { Input } from '../components/common/Input'
import { AuthLayout } from '../components/layout/AuthLayout'

export function RegisterPage() {
  return (
    <AuthLayout title="Create your account" subtitle="Sign up to create and track support tickets.">
      <form className="space-y-4" onSubmit={(event) => event.preventDefault()}>
        <Input id="name" label="Full name" autoComplete="name" />
        <Input id="email" label="Email" type="email" placeholder="you@example.com" autoComplete="email" />
        <Input id="password" label="Password" type="password" autoComplete="new-password" />
        <Input id="confirm-password" label="Confirm password" type="password" autoComplete="new-password" />
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
