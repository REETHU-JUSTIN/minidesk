import { RoleBadge } from '../components/common/Badge'
import { Card } from '../components/common/Card'
import { previewCurrentUser } from '../utils/previewData'

export function SettingsPage() {
  const { name, email, role } = previewCurrentUser

  return (
    <Card title="Your profile" className="max-w-2xl">
      <dl className="divide-y divide-slate-200 text-sm">
        <div className="flex justify-between gap-4 px-5 py-3">
          <dt className="text-slate-500">Name</dt>
          <dd className="font-medium">{name}</dd>
        </div>
        <div className="flex justify-between gap-4 px-5 py-3">
          <dt className="text-slate-500">Email</dt>
          <dd className="font-medium">{email}</dd>
        </div>
        <div className="flex justify-between gap-4 px-5 py-3">
          <dt className="text-slate-500">Role</dt>
          <dd>
            <RoleBadge role={role} />
          </dd>
        </div>
      </dl>
    </Card>
  )
}
