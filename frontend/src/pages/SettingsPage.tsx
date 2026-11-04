import { RoleBadge } from '../components/common/Badge'
import { Card } from '../components/common/Card'

export function SettingsPage() {
  return (
    <Card title="Your profile" className="max-w-2xl">
      <dl className="divide-y divide-slate-200 text-sm">
        <div className="flex justify-between gap-4 px-5 py-3">
          <dt className="text-slate-500">Name</dt>
          <dd className="font-medium">Alex Morgan</dd>
        </div>
        <div className="flex justify-between gap-4 px-5 py-3">
          <dt className="text-slate-500">Email</dt>
          <dd className="font-medium">admin@example.com</dd>
        </div>
        <div className="flex justify-between gap-4 px-5 py-3">
          <dt className="text-slate-500">Role</dt>
          <dd>
            <RoleBadge role="admin" />
          </dd>
        </div>
      </dl>
    </Card>
  )
}
