import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { renderWithProviders } from '../test/testUtils'
import { LoginPage } from './LoginPage'

function renderLogin(login = vi.fn().mockResolvedValue(undefined)) {
  renderWithProviders(<LoginPage />, { auth: { login, user: null } })
  return { login, user: userEvent.setup() }
}

describe('LoginPage', () => {
  it('shows errors for empty fields and does not try to sign in', async () => {
    const { login, user } = renderLogin()

    await user.click(screen.getByRole('button', { name: 'Sign in' }))

    expect(await screen.findByText('Enter your email address.')).toBeInTheDocument()
    expect(screen.getByText('Enter your password.')).toBeInTheDocument()
    expect(login).not.toHaveBeenCalled()
  })

  it('rejects an invalid email address', async () => {
    const { login, user } = renderLogin()

    await user.type(screen.getByLabelText('Email'), 'not-an-email')
    await user.type(screen.getByLabelText('Password'), 'secret-password')
    await user.click(screen.getByRole('button', { name: 'Sign in' }))

    expect(await screen.findByText('Enter a valid email address.')).toBeInTheDocument()
    expect(login).not.toHaveBeenCalled()
  })

  it('signs in with the values that were typed', async () => {
    const { login, user } = renderLogin()

    await user.type(screen.getByLabelText('Email'), 'admin@example.com')
    await user.type(screen.getByLabelText('Password'), 'secret-password')
    await user.click(screen.getByRole('button', { name: 'Sign in' }))

    await waitFor(() => expect(login).toHaveBeenCalledWith({ email: 'admin@example.com', password: 'secret-password' }))
  })

  it('shows the error from the server when sign-in fails', async () => {
    const { user } = renderLogin(vi.fn().mockRejectedValue(new Error('The email or password is incorrect.')))

    await user.type(screen.getByLabelText('Email'), 'admin@example.com')
    await user.type(screen.getByLabelText('Password'), 'wrong-password')
    await user.click(screen.getByRole('button', { name: 'Sign in' }))

    expect(await screen.findByRole('alert')).toHaveTextContent('The email or password is incorrect.')
  })

  it('disables the button while signing in, to prevent double submissions', async () => {
    // This promise never finishes, which keeps the form in its "submitting" state.
    const { user } = renderLogin(vi.fn(() => new Promise<void>(() => {})))

    await user.type(screen.getByLabelText('Email'), 'admin@example.com')
    await user.type(screen.getByLabelText('Password'), 'secret-password')
    await user.click(screen.getByRole('button', { name: 'Sign in' }))

    await waitFor(() => expect(screen.getByRole('button', { name: 'Sign in' })).toBeDisabled())
  })
})
