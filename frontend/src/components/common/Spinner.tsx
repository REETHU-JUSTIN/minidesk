import { Loader2 } from 'lucide-react'

export function Spinner({ label = 'Loading...' }: { label?: string }) {
  return (
    <div role="status" className="flex items-center justify-center gap-2 p-8 text-sm text-slate-500">
      <Loader2 className="size-5 animate-spin text-primary" aria-hidden="true" />
      {label}
    </div>
  )
}
