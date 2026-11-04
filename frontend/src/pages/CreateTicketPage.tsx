import { Button, LinkButton } from '../components/common/Button'
import { Card } from '../components/common/Card'
import { Input } from '../components/common/Input'
import { Select } from '../components/common/Select'
import { Textarea } from '../components/common/Textarea'
import { categoryLabels, priorityLabels, ticketCategories, ticketPriorities } from '../utils/ticketLabels'

export function CreateTicketPage() {
  return (
    <Card title="Ticket details" className="mx-auto max-w-2xl">
      <form className="space-y-5 p-5" onSubmit={(event) => event.preventDefault()}>
        <Input id="title" label="Ticket title" placeholder="Summarize the problem in a few words" />
        <Textarea id="description" label="Description" rows={6} placeholder="What happened, and what did you expect to happen?" />
        <div className="grid gap-5 sm:grid-cols-2">
          <Select id="category" label="Category" defaultValue="general">
            {ticketCategories.map((category) => (
              <option key={category} value={category}>
                {categoryLabels[category]}
              </option>
            ))}
          </Select>
          <Select id="priority" label="Priority" defaultValue="medium">
            {ticketPriorities.map((priority) => (
              <option key={priority} value={priority}>
                {priorityLabels[priority]}
              </option>
            ))}
          </Select>
        </div>
        <div className="flex justify-end gap-2">
          <LinkButton href="#my-tickets" variant="secondary">
            Cancel
          </LinkButton>
          <Button type="submit">Create Ticket</Button>
        </div>
      </form>
    </Card>
  )
}
