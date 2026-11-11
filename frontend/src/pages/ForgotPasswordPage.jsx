import { LinkButton } from '../components/common/Button'
import { AuthLayout } from '../components/layout/AuthLayout'

// No mail service is configured, so this page says so honestly
// instead of pretending to send a reset email.
export function ForgotPasswordPage() {
  return (
    <AuthLayout title="Forgot your password?" subtitle="Password reset emails aren't available yet.">
      <p className="text-sm text-slate-600">Please contact your MiniDesk administrator, who can help you regain access.</p>
      <LinkButton to="/login" variant="secondary" className="mt-5 w-full">
        Back to sign in
      </LinkButton>
    </AuthLayout>
  )
}
