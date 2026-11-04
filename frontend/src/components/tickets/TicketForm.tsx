import { useForm } from 'react-hook-form'
import type { CreateTicketInput } from '../../types'
import { categoryLabels, priorityLabels, ticketCategories, ticketPriorities } from '../../utils/ticketLabels'
import { ticketDescriptionRules, ticketTitleRules } from '../../utils/validationRules'
import { Button, LinkButton } from '../common/Button'
import { Input } from '../common/Input'
import { Select } from '../common/Select'
import { Textarea } from '../common/Textarea'

interface TicketFormProps {
  onSubmit: (values: CreateTicketInput) => void
}

export function TicketForm({ onSubmit }: TicketFormProps) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CreateTicketInput>({
    defaultValues: { title: '', description: '', category: 'general', priority: 'medium' },
  })

  // handleSubmit validates first, and only calls this function if every field is valid.
  function submitValidForm(values: CreateTicketInput) {
    onSubmit({ ...values, title: values.title.trim(), description: values.description.trim() })
    reset()
  }

  return (
    // noValidate turns off the browser's pop-ups so our own error messages show instead.
    <form className="space-y-5 p-5" noValidate onSubmit={handleSubmit(submitValidForm)}>
      {/* register connects each field to the form, and the spread passes its name and handlers. */}
      <Input
        id="title"
        label="Ticket title"
        placeholder="Summarize the problem in a few words"
        error={errors.title?.message}
        {...register('title', ticketTitleRules)}
      />
      <Textarea
        id="description"
        label="Description"
        rows={6}
        placeholder="What happened, and what did you expect to happen?"
        error={errors.description?.message}
        {...register('description', ticketDescriptionRules)}
      />
      <div className="grid gap-5 sm:grid-cols-2">
        <Select id="category" label="Category" {...register('category')}>
          {ticketCategories.map((category) => (
            <option key={category} value={category}>
              {categoryLabels[category]}
            </option>
          ))}
        </Select>
        <Select id="priority" label="Priority" {...register('priority')}>
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
  )
}
