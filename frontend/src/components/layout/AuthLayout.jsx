import { Logo } from '../common/Logo'

export function AuthLayout({ title, subtitle, children }) {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="mb-6 flex justify-center">
          <Logo />
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <h1 className="text-xl font-semibold">{title}</h1>
          <p className="mt-1 mb-5 text-sm text-slate-500">{subtitle}</p>
          {children}
        </div>
      </div>
    </main>
  )
}
