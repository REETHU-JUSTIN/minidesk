import { useForm } from 'react-hook-form'
import { ticketDescriptionRules, ticketTitleRules } from '../../utils/validationRules'
import { Button } from '../common/Button'
import { Input } from '../common/Input'
import { Textarea } from '../common/Textarea'

interface TicketEditValues {
  title: string
  description: string
}

interface TicketEditFormProps {
  initialValues: TicketEditValues
  onSave: (values: TicketEditValues) => Promise<void>
  onCancel: () => void
}

export function TicketEditForm({ initialValues, onSave, onCancel }: TicketEditFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<TicketEditValues>({ defaultValues: initialValues })

  async function submitValidForm({ title, description }: TicketEditValues) {
    await onSave({ title: title.trim(), description: description.trim() })
  }

  return (
    <form className="space-y-4" noValidate onSubmit={handleSubmit(submitValidForm)}>
      <Input id="edit-title" label="Ticket title" error={errors.title?.message} {...register('title', ticketTitleRules)} />
      <Textarea
        id="edit-description"
        label="Description"
        rows={5}
        error={errors.description?.message}
        {...register('description', ticketDescriptionRules)}
      />
      <div className="flex justify-end gap-2">
        <Button variant="secondary" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" isLoading={isSubmitting}>
          Save Changes
        </Button>
      </div>
    </form>
  )
}
