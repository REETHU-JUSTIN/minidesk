import { useState } from 'react'
import { PriorityBadge, StatusBadge } from '../components/common/Badge'
import { Button } from '../components/common/Button'
import { Card } from '../components/common/Card'
import { Modal } from '../components/common/Modal'
import { Select } from '../components/common/Select'
import { Textarea } from '../components/common/Textarea'

const previewComments = [
  { id: 1, author: 'Priya Nair', time: 'Nov 1, 2026, 9:12 AM', message: 'It happens every time I upload a PDF larger than 5 MB.' },
  { id: 2, author: 'Maya Lee', time: 'Nov 1, 2026, 11:40 AM', message: 'Thanks, Priya. I can reproduce this and I am looking into it now.' },
]

export function TicketDetailsPage() {
  const [isDeleteOpen, setIsDeleteOpen] = useState(false)

  return (
    <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
      <div className="space-y-6 xl:col-span-2">
        <Card>
          <div className="p-5">
            <p className="text-sm text-slate-500 tabular-nums">#1006 · Technical</p>
            <h2 className="mt-1 text-xl font-semibold">App crashes when uploading a file</h2>
            <div className="mt-3 flex gap-2">
              <StatusBadge status="in_progress" />
              <PriorityBadge priority="high" />
            </div>
            <p className="mt-4 text-sm leading-6 text-slate-700">
              The app closes without an error message whenever I try to attach a file to a project. I have tried two browsers and see the same result.
            </p>
          </div>
        </Card>

        <Card title={`Comments (${previewComments.length})`}>
          <ul className="divide-y divide-slate-200">
            {previewComments.map((comment) => (
              <li key={comment.id} className="px-5 py-4">
                <div className="flex flex-wrap items-baseline justify-between gap-x-4">
                  <p className="text-sm font-medium">{comment.author}</p>
                  <p className="text-xs text-slate-500">{comment.time}</p>
                </div>
                <p className="mt-1 text-sm leading-6 text-slate-700">{comment.message}</p>
              </li>
            ))}
          </ul>
          <form className="space-y-3 border-t border-slate-200 p-5" onSubmit={(event) => event.preventDefault()}>
            <Textarea id="comment" label="Add a comment" rows={3} placeholder="Write your reply..." />
            <div className="flex justify-end">
              <Button type="submit">Post Comment</Button>
            </div>
          </form>
        </Card>
      </div>

      <div className="space-y-6">
        <Card title="Manage">
          <div className="space-y-4 p-5">
            <Select id="status" label="Status" defaultValue="in_progress">
              <option value="open">Open</option>
              <option value="in_progress">In Progress</option>
              <option value="resolved">Resolved</option>
            </Select>
            <Select id="agent" label="Assigned agent" defaultValue="maya">
              <option value="">Unassigned</option>
              <option value="sam">Sam Carter</option>
              <option value="maya">Maya Lee</option>
            </Select>
            <Button variant="danger" className="w-full" onClick={() => setIsDeleteOpen(true)}>
              Delete Ticket
            </Button>
          </div>
        </Card>

        <Card title="Customer">
          <dl className="space-y-3 p-5 text-sm">
            <div>
              <dt className="text-slate-500">Name</dt>
              <dd className="font-medium">Priya Nair</dd>
            </div>
            <div>
              <dt className="text-slate-500">Email</dt>
              <dd className="font-medium">priya@example.com</dd>
            </div>
            <div>
              <dt className="text-slate-500">Created</dt>
              <dd className="font-medium">Nov 1, 2026</dd>
            </div>
          </dl>
        </Card>
      </div>

      <Modal
        isOpen={isDeleteOpen}
        title="Delete this ticket?"
        onClose={() => setIsDeleteOpen(false)}
        footer={
          <>
            <Button variant="secondary" onClick={() => setIsDeleteOpen(false)}>
              Cancel
            </Button>
            <Button variant="danger" onClick={() => setIsDeleteOpen(false)}>
              Delete Ticket
            </Button>
          </>
        }
      >
        This permanently deletes ticket #1006 and all of its comments. This can't be undone.
      </Modal>
    </div>
  )
}
