import { RoleBadge } from '../components/common/Badge'
import { Card } from '../components/common/Card'
import { previewUsers } from '../utils/previewData'

export function UsersPage() {
  return (
    <Card>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[40rem] text-left text-sm">
          <thead className="border-b border-slate-200 text-xs text-slate-500">
            <tr>
              <th scope="col" className="px-5 py-3 font-medium">Name</th>
              <th scope="col" className="px-5 py-3 font-medium">Email</th>
              <th scope="col" className="px-5 py-3 font-medium">Role</th>
              <th scope="col" className="px-5 py-3 font-medium">Joined</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {previewUsers.map((user) => (
              <tr key={user.id} className="hover:bg-slate-50">
                <td className="px-5 py-3 font-medium">{user.name}</td>
                <td className="px-5 py-3 text-slate-600">{user.email}</td>
                <td className="px-5 py-3">
                  <RoleBadge role={user.role} />
                </td>
                <td className="px-5 py-3 text-slate-600">{user.joined}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  )
}
