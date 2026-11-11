export function StatCard({ label, value, icon: Icon }) {
  return (
    <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <div>
        <p className="text-sm text-slate-500">{label}</p>
        <p className="mt-1 text-3xl font-semibold tabular-nums">{value}</p>
      </div>
      <span className="rounded-lg bg-primary-soft p-2.5 text-primary">
        <Icon className="size-5" aria-hidden="true" />
      </span>
    </div>
  )
}
