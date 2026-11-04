import { useRef, useState } from 'react'
import type { FormEvent } from 'react'
import { Button } from '../common/Button'
import { Textarea } from '../common/Textarea'

interface CommentFormProps {
  onAddComment: (message: string) => void
}

// This one-field form is written by hand, without React Hook Form,
// so you can see what a form library does for you in TicketForm.
export function CommentForm({ onAddComment }: CommentFormProps) {
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault() // stops the browser from reloading the page

    const trimmedMessage = message.trim()
    if (trimmedMessage === '') {
      setError('Write a comment before posting.')
      textareaRef.current?.focus()
      return
    }

    onAddComment(trimmedMessage)
    setMessage('')
    setError('')
    textareaRef.current?.focus() // ready for another comment
  }

  return (
    <form className="space-y-3 border-t border-slate-200 p-5" noValidate onSubmit={handleSubmit}>
      <Textarea
        ref={textareaRef}
        id="comment"
        label="Add a comment"
        rows={3}
        placeholder="Write your reply..."
        value={message}
        error={error}
        onChange={(event) => setMessage(event.target.value)}
      />
      <div className="flex justify-end">
        <Button type="submit">Post Comment</Button>
      </div>
    </form>
  )
}
