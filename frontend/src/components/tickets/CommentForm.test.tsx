import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { CommentForm } from './CommentForm'

describe('CommentForm', () => {
  it('rejects an empty comment', async () => {
    const onAddComment = vi.fn()
    const user = userEvent.setup()
    render(<CommentForm onAddComment={onAddComment} />)

    await user.type(screen.getByLabelText('Add a comment'), '   ')
    await user.click(screen.getByRole('button', { name: 'Post Comment' }))

    expect(screen.getByText('Write a comment before posting.')).toBeInTheDocument()
    expect(onAddComment).not.toHaveBeenCalled()
  })

  it('posts the trimmed text and clears the box', async () => {
    const onAddComment = vi.fn().mockResolvedValue(undefined)
    const user = userEvent.setup()
    render(<CommentForm onAddComment={onAddComment} />)

    await user.type(screen.getByLabelText('Add a comment'), '  On it.  ')
    await user.click(screen.getByRole('button', { name: 'Post Comment' }))

    await waitFor(() => expect(screen.getByLabelText('Add a comment')).toHaveValue(''))
    expect(onAddComment).toHaveBeenCalledWith('On it.')
  })

  it('keeps the text and shows an error when posting fails', async () => {
    const onAddComment = vi.fn().mockRejectedValue(new Error('We can\'t reach the server.'))
    const user = userEvent.setup()
    render(<CommentForm onAddComment={onAddComment} />)

    await user.type(screen.getByLabelText('Add a comment'), 'Do not lose this')
    await user.click(screen.getByRole('button', { name: 'Post Comment' }))

    expect(await screen.findByText('We can\'t reach the server.')).toBeInTheDocument()
    expect(screen.getByLabelText('Add a comment')).toHaveValue('Do not lose this')
  })
})
