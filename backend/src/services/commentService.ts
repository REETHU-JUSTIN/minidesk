import type { Types } from 'mongoose'
import { Ticket } from '../models/Ticket'
import type { PublicUser, TicketComment } from '../types'
import { requireVisibleTicket } from './ticketService'

interface PopulatedComment {
  _id: Types.ObjectId
  author: { _id: Types.ObjectId; name: string }
  message: string
  createdAt: Date
}

// Both functions check the ticket first, so nobody can read or add
// comments on a ticket they aren't allowed to see.
export async function listComments(user: PublicUser, ticketId: string): Promise<TicketComment[]> {
  await requireVisibleTicket(user, ticketId)

  const ticket = await Ticket.findById(ticketId)
    .select('comments')
    .populate('comments.author', 'name')
    .lean<{ comments: PopulatedComment[] }>()

  return (ticket?.comments ?? []).map((comment) => ({
    id: comment._id.toString(),
    ticketId,
    userId: comment.author._id.toString(),
    authorName: comment.author.name,
    message: comment.message,
    createdAt: comment.createdAt.toISOString(),
  }))
}

export async function addComment(user: PublicUser, ticketId: string, message: string): Promise<TicketComment> {
  await requireVisibleTicket(user, ticketId)

  // $push adds to the array in one atomic step, so simultaneous comments can't overwrite
  // each other. runValidators applies the schema's length rules to this update too.
  const updated = await Ticket.findByIdAndUpdate(
    ticketId,
    { $push: { comments: { author: user.id, message } } },
    { returnDocument: 'after', runValidators: true, timestamps: false },
  ).select('comments')

  const comment = updated!.comments[updated!.comments.length - 1]
  return {
    id: comment._id.toString(),
    ticketId,
    userId: user.id,
    authorName: user.name,
    message: comment.message,
    createdAt: comment.createdAt.toISOString(),
  }
}
