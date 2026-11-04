import { LinkButton } from '../components/common/Button'

export function NotFoundPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4 text-center">
      <p className="text-sm font-semibold text-primary">404</p>
      <h1 className="mt-2 text-2xl font-semibold">Page not found</h1>
      <p className="mt-2 text-sm text-slate-500">The page you're looking for doesn't exist or has moved.</p>
      <LinkButton href="#dashboard" className="mt-6">
        Go to Dashboard
      </LinkButton>
    </main>
  )
}
