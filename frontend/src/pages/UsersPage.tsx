import { useEffect, useState } from 'react'
import { RoleBadge } from '../components/common/Badge'
import { Card } from '../components/common/Card'
import { ErrorMessage } from '../components/common/ErrorMessage'
import { Spinner } from '../components/common/Spinner'
import { getUsers } from '../services/userService'
import type { User } from '../types'
import { formatDate } from '../utils/formatDate'

// Local state, because only this page uses the user list.
export function UsersPage() {
  const [users, setUsers] = useState<User[] | null>(null)
  const [error, setError] = useState('')

  useEffect(() => {
    let isCancelled = false

    getUsers()
      .then((loadedUsers) => {
        if (!isCancelled) setUsers(loadedUsers)
      })
      .catch((caughtError: Error) => {
        if (!isCancelled) setError(caughtError.message)
      })

    return () => {
      isCancelled = true
    }
  }, [])

  if (error) return <ErrorMessage message={error} />
  if (!users) return <Spinner label="Loading users..." />

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
            {users.map((user) => (
              <tr key={user.id} className="hover:bg-slate-50">
                <td className="px-5 py-3 font-medium">{user.name}</td>
                <td className="px-5 py-3 text-slate-600">{user.email}</td>
                <td className="px-5 py-3">
                  <RoleBadge role={user.role} />
                </td>
                <td className="px-5 py-3 text-slate-600">{formatDate(user.createdAt)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  )
}
