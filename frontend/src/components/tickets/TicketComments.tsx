import { useEffect, useState } from 'react'
import { getComments, postComment } from '../../services/ticketService'
import type { TicketComment } from '../../types'
import { Card } from '../common/Card'
import { ErrorMessage } from '../common/ErrorMessage'
import { Spinner } from '../common/Spinner'
import { CommentForm } from './CommentForm'
import { CommentList } from './CommentList'

// Comments use local state, not Redux, because only this one component needs them.
// Not everything belongs in global state.
export function TicketComments({ ticketId }: { ticketId: string }) {
  const [comments, setComments] = useState<TicketComment[] | null>(null)
  const [error, setError] = useState('')

  useEffect(() => {
    // If the user leaves before the response arrives, ignore it.
    let isCancelled = false

    getComments(ticketId)
      .then((loadedComments) => {
        if (!isCancelled) setComments(loadedComments)
      })
      .catch((caughtError: Error) => {
        if (!isCancelled) setError(caughtError.message)
      })

    return () => {
      isCancelled = true
    }
  }, [ticketId])

  async function handleAddComment(message: string) {
    const newComment = await postComment(ticketId, message)
    // State is never changed directly. We create a new array, and React sees the change.
    setComments((currentComments) => [...(currentComments ?? []), newComment])
  }

  return (
    <Card title={comments ? `Comments (${comments.length})` : 'Comments'}>
      {error && (
        <div className="p-5">
          <ErrorMessage message={error} />
        </div>
      )}
      {!error && comments === null && <Spinner label="Loading comments..." />}
      {comments && (
        <>
          <CommentList comments={comments} />
          <CommentForm onAddComment={handleAddComment} />
        </>
      )}
    </Card>
  )
}
