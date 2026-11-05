import type { PublicUser, TicketComment } from '../types'
import { store } from './devStore'
import type { CommentRecord } from './devStore'
import { requireVisibleTicket } from './ticketService'

function toComment(record: CommentRecord): TicketComment {
  const author = store.users.find((user) => user.id === record.userId)
  return { ...record, authorName: author?.name ?? 'Unknown' }
}

// Both functions check the ticket first, so nobody can read or add
// comments on a ticket they aren't allowed to see.
export async function listComments(user: PublicUser, ticketId: number): Promise<TicketComment[]> {
  requireVisibleTicket(user, ticketId)
  return store.comments.filter((comment) => comment.ticketId === ticketId).map(toComment)
}

export async function addComment(user: PublicUser, ticketId: number, message: string): Promise<TicketComment> {
  requireVisibleTicket(user, ticketId)

  const newComment: CommentRecord = {
    id: Math.max(0, ...store.comments.map((comment) => comment.id)) + 1,
    ticketId,
    userId: user.id,
    message,
    createdAt: new Date().toISOString(),
  }
  store.comments.push(newComment)
  return toComment(newComment)
}
