import { LifeBuoy } from 'lucide-react'

export function Logo() {
  return (
    <span className="flex items-center gap-2.5">
      <span className="rounded-lg bg-primary p-1.5 text-white">
        <LifeBuoy className="size-5" aria-hidden="true" />
      </span>
      <span className="text-lg font-semibold tracking-tight">MiniDesk</span>
    </span>
  )
}
