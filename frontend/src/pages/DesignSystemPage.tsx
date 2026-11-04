import { useState } from 'react'
import { PriorityBadge, RoleBadge, StatusBadge } from '../components/common/Badge'
import { Button } from '../components/common/Button'
import { Card } from '../components/common/Card'
import { ErrorMessage } from '../components/common/ErrorMessage'
import { Input } from '../components/common/Input'
import { Modal } from '../components/common/Modal'
import { Select } from '../components/common/Select'
import { Spinner } from '../components/common/Spinner'

// TEMPORARY reference page showing every shared component and its states.
export function DesignSystemPage() {
  const [isModalOpen, setIsModalOpen] = useState(false)

  return (
    <>
      <Card title="Buttons">
        <div className="flex flex-wrap gap-3 p-5">
          <Button>Primary</Button>
          <Button variant="secondary">Secondary</Button>
          <Button variant="ghost">Ghost</Button>
          <Button variant="danger">Danger</Button>
          <Button isLoading>Saving</Button>
          <Button disabled>Disabled</Button>
        </div>
      </Card>

      <Card title="Badges">
        <div className="flex flex-wrap gap-2 p-5">
          <StatusBadge status="open" />
          <StatusBadge status="in_progress" />
          <StatusBadge status="resolved" />
          <PriorityBadge priority="low" />
          <PriorityBadge priority="medium" />
          <PriorityBadge priority="high" />
          <RoleBadge role="admin" />
          <RoleBadge role="agent" />
          <RoleBadge role="customer" />
        </div>
      </Card>

      <Card title="Form fields">
        <div className="grid gap-5 p-5 sm:grid-cols-3">
          <Input id="ds-normal" label="Normal" placeholder="Type here" />
          <Input id="ds-error" label="With an error" defaultValue="not-an-email" error="Enter a valid email address." />
          <Select id="ds-select" label="Select">
            <option>Option one</option>
            <option>Option two</option>
          </Select>
        </div>
      </Card>

      <Card title="Feedback">
        <div className="space-y-3 p-5">
          <ErrorMessage message="We couldn't load your tickets. Please try again." />
          <Spinner />
          <Button variant="secondary" onClick={() => setIsModalOpen(true)}>
            Open modal
          </Button>
        </div>
      </Card>

      <Modal
        isOpen={isModalOpen}
        title="Example modal"
        onClose={() => setIsModalOpen(false)}
        footer={<Button onClick={() => setIsModalOpen(false)}>Done</Button>}
      >
        Press Escape, click outside, or use a button to close this.
      </Modal>
    </>
  )
}
