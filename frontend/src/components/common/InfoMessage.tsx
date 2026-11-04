import { Info } from 'lucide-react'

export function InfoMessage({ message }: { message: string }) {
  return (
    <div role="status" className="flex items-start gap-2 rounded-lg border border-blue-200 bg-blue-50 p-3 text-sm text-blue-800">
      <Info className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
      {message}
    </div>
  )
}
