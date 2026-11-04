import { Button } from '../components/common/Button'
import { Input } from '../components/common/Input'
import { AuthLayout } from '../components/layout/AuthLayout'

export function LoginPage() {
  return (
    <AuthLayout title="Welcome back" subtitle="Sign in to your MiniDesk account.">
      <form className="space-y-4" onSubmit={(event) => event.preventDefault()}>
        <Input id="email" label="Email" type="email" placeholder="you@example.com" autoComplete="email" />
        <Input id="password" label="Password" type="password" autoComplete="current-password" />
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
