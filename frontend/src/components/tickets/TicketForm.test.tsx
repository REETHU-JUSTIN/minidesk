import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { renderWithProviders } from '../../test/testUtils'
import { TicketForm } from './TicketForm'

function renderForm(onSubmit = vi.fn().mockResolvedValue(undefined)) {
  renderWithProviders(<TicketForm onSubmit={onSubmit} />)
  return { onSubmit, user: userEvent.setup() }
}

describe('TicketForm', () => {
  it('shows errors for empty required fields and does not submit', async () => {
    const { onSubmit, user } = renderForm()

    await user.click(screen.getByRole('button', { name: 'Create Ticket' }))

    expect(await screen.findByText('Enter a title of at least 5 characters.')).toBeInTheDocument()
    expect(screen.getByText('Enter a description of at least 10 characters.')).toBeInTheDocument()
    expect(onSubmit).not.toHaveBeenCalled()
  })

  it('does not accept a title made only of spaces', async () => {
    const { onSubmit, user } = renderForm()

    await user.type(screen.getByLabelText('Ticket title'), '          ')
    await user.type(screen.getByLabelText('Description'), 'A valid description here.')
    await user.click(screen.getByRole('button', { name: 'Create Ticket' }))

    expect(await screen.findByText('Enter a title of at least 5 characters.')).toBeInTheDocument()
    expect(onSubmit).not.toHaveBeenCalled()
  })

  it('rejects a title that is too long', async () => {
    const { onSubmit, user } = renderForm()

    await user.click(screen.getByLabelText('Ticket title'))
    await user.paste('x'.repeat(121))
    await user.type(screen.getByLabelText('Description'), 'A valid description here.')
    await user.click(screen.getByRole('button', { name: 'Create Ticket' }))

    expect(await screen.findByText('Keep the title to 120 characters or fewer.')).toBeInTheDocument()
    expect(onSubmit).not.toHaveBeenCalled()
  })

  it('submits trimmed values with the chosen category and priority', async () => {
    const { onSubmit, user } = renderForm()

    await user.type(screen.getByLabelText('Ticket title'), '  Printer is on fire  ')
    await user.type(screen.getByLabelText('Description'), '  Smoke is coming out of it.  ')
    await user.selectOptions(screen.getByLabelText('Category'), 'technical')
    await user.selectOptions(screen.getByLabelText('Priority'), 'high')
    await user.click(screen.getByRole('button', { name: 'Create Ticket' }))

    await waitFor(() =>
      expect(onSubmit).toHaveBeenCalledWith({
        title: 'Printer is on fire',
        description: 'Smoke is coming out of it.',
        category: 'technical',
        priority: 'high',
      }),
    )
  })

  it('disables the button while the ticket is being created', async () => {
    const { user } = renderForm(vi.fn(() => new Promise<void>(() => {})))

    await user.type(screen.getByLabelText('Ticket title'), 'Printer is on fire')
    await user.type(screen.getByLabelText('Description'), 'Smoke is coming out of it.')
    await user.click(screen.getByRole('button', { name: 'Create Ticket' }))

    await waitFor(() => expect(screen.getByRole('button', { name: 'Create Ticket' })).toBeDisabled())
  })
})
