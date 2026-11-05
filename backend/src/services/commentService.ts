import { pool } from '../config/db'
import type { PublicUser, TicketComment } from '../types'
import { requireVisibleTicket } from './ticketService'

// Both functions check the ticket first, so nobody can read or add
// comments on a ticket they aren't allowed to see.
export async function listComments(user: PublicUser, ticketId: number): Promise<TicketComment[]> {
  await requireVisibleTicket(user, ticketId)

  const result = await pool.query<TicketComment>(
    `SELECT
       c.id,
       c.ticket_id AS "ticketId",
       c.user_id AS "userId",
       author.name AS "authorName",
       c.message,
       c.created_at AS "createdAt"
     FROM comments c
     JOIN users author ON author.id = c.user_id
     WHERE c.ticket_id = $1
     ORDER BY c.created_at, c.id`,
    [ticketId],
  )
  return result.rows
}

export async function addComment(user: PublicUser, ticketId: number, message: string): Promise<TicketComment> {
  await requireVisibleTicket(user, ticketId)

  const result = await pool.query<Omit<TicketComment, 'authorName'>>(
    `INSERT INTO comments (ticket_id, user_id, message)
     VALUES ($1, $2, $3)
     RETURNING id, ticket_id AS "ticketId", user_id AS "userId", message, created_at AS "createdAt"`,
    [ticketId, user.id, message],
  )
  return { ...result.rows[0], authorName: user.name }
}
