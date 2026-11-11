import { Ticket } from '../models/Ticket.js'
import { requireVisibleTicket } from './ticketService.js'

// Both functions check the ticket first, so nobody can read or add
// comments on a ticket they aren't allowed to see.
export async function listComments(user, ticketId) {
  await requireVisibleTicket(user, ticketId)

  const ticket = await Ticket.findById(ticketId)
    .select('comments')
    .populate('comments.author', 'name')
    .lean()

  return (ticket?.comments ?? []).map((comment) => ({
    id: comment._id.toString(),
    ticketId,
    userId: comment.author._id.toString(),
    authorName: comment.author.name,
    message: comment.message,
    createdAt: comment.createdAt.toISOString(),
  }))
}

export async function addComment(user, ticketId, message) {
  await requireVisibleTicket(user, ticketId)

  // $push adds to the array in one atomic step, so simultaneous comments can't overwrite
  // each other. runValidators applies the schema's length rules to this update too.
  const updated = await Ticket.findByIdAndUpdate(
    ticketId,
    { $push: { comments: { author: user.id, message } } },
    { returnDocument: 'after', runValidators: true, timestamps: false },
  ).select('comments')

  const comment = updated.comments[updated.comments.length - 1]
  return {
    id: comment._id.toString(),
    ticketId,
    userId: user.id,
    authorName: user.name,
    message: comment.message,
    createdAt: comment.createdAt.toISOString(),
  }
}
