// Checks everything sent by clients. The frontend validates too, but that only helps
// honest users, because anyone can call the API directly with a tool like Postman.
//
// Each validator builds a new object with only the fields it knows. So if someone sends
// { "role": "admin" } when signing up, that extra field is simply dropped.
import type {
  CreateTicketInput,
  LoginInput,
  RegisterInput,
  TicketCategory,
  TicketPriority,
  TicketQuery,
  TicketStatus,
  UpdateTicketInput,
  UserRole,
} from '../types'
import { AppError } from './AppError'

const ticketStatuses: TicketStatus[] = ['open', 'in_progress', 'resolved']
const ticketPriorities: TicketPriority[] = ['low', 'medium', 'high']
const ticketCategories: TicketCategory[] = ['general', 'billing', 'technical', 'account']
const userRoles: UserRole[] = ['admin', 'agent', 'customer']

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

// Either the clean data, or the errors. The "ok" field tells TypeScript which one it is.
export type ValidationResult<T> = { ok: true; data: T } | { ok: false; errors: Record<string, string> }

export type Validator<T> = (body: Record<string, unknown>) => ValidationResult<T>

// The largest value a PostgreSQL INTEGER column can hold.
const MAX_ID = 2_147_483_647

function isValidId(value: unknown): boolean {
  return Number.isInteger(value) && (value as number) > 0 && (value as number) <= MAX_ID
}

function getTrimmedString(value: unknown): string {
  // PostgreSQL can't store the null character, so it's removed before reaching a query.
  return typeof value === 'string' ? value.replaceAll('\0', '').trim() : ''
}

function includes<T extends string>(allowed: T[], value: unknown): value is T {
  return allowed.includes(value as T)
}

function isValidEmail(email: string): boolean {
  return email.length <= 254 && EMAIL_PATTERN.test(email)
}

function isValidTitle(title: string): boolean {
  return title.length >= 5 && title.length <= 120
}

function isValidDescription(description: string): boolean {
  return description.length >= 10 && description.length <= 5000
}

const TITLE_ERROR = 'Title must be 5 to 120 characters.'
const DESCRIPTION_ERROR = 'Description must be 10 to 5000 characters.'

export const validateRegister: Validator<RegisterInput> = (body) => {
  const name = getTrimmedString(body.name)
  const email = getTrimmedString(body.email).toLowerCase()
  const password = typeof body.password === 'string' ? body.password : ''
  const errors: Record<string, string> = {}

  if (name.length < 2 || name.length > 100) errors.name = 'Name must be 2 to 100 characters.'
  if (!isValidEmail(email)) errors.email = 'Enter a valid email address.'
  // bcrypt ignores everything after 72 bytes, so longer passwords would be silently cut short.
  if (password.length < 8 || Buffer.byteLength(password) > 72) errors.password = 'Password must be 8 to 72 characters.'

  if (Object.keys(errors).length > 0) return { ok: false, errors }
  return { ok: true, data: { name, email, password } }
}

export const validateLogin: Validator<LoginInput> = (body) => {
  const email = getTrimmedString(body.email).toLowerCase()
  const password = typeof body.password === 'string' ? body.password : ''
  const errors: Record<string, string> = {}

  if (!isValidEmail(email)) errors.email = 'Enter a valid email address.'
  if (password === '') errors.password = 'Enter your password.'

  if (Object.keys(errors).length > 0) return { ok: false, errors }
  return { ok: true, data: { email, password } }
}

export const validateCreateTicket: Validator<CreateTicketInput> = (body) => {
  const title = getTrimmedString(body.title)
  const description = getTrimmedString(body.description)
  const { category, priority } = body
  const errors: Record<string, string> = {}

  if (!isValidTitle(title)) errors.title = TITLE_ERROR
  if (!isValidDescription(description)) errors.description = DESCRIPTION_ERROR
  if (!includes(ticketCategories, category)) errors.category = 'Choose a valid category.'
  if (!includes(ticketPriorities, priority)) errors.priority = 'Choose a valid priority.'

  if (!includes(ticketCategories, category) || !includes(ticketPriorities, priority) || Object.keys(errors).length > 0) {
    return { ok: false, errors }
  }
  return { ok: true, data: { title, description, category, priority } }
}

export const validateUpdateTicket: Validator<UpdateTicketInput> = (body) => {
  const data: UpdateTicketInput = {}
  const errors: Record<string, string> = {}

  // Each field is optional, because an update may change only one thing.
  if (body.title !== undefined) {
    data.title = getTrimmedString(body.title)
    if (!isValidTitle(data.title)) errors.title = TITLE_ERROR
  }

  if (body.description !== undefined) {
    data.description = getTrimmedString(body.description)
    if (!isValidDescription(data.description)) errors.description = DESCRIPTION_ERROR
  }

  if (body.status !== undefined) {
    if (includes(ticketStatuses, body.status)) data.status = body.status
    else errors.status = 'Choose a valid status.'
  }

  if (body.assignedAgentId !== undefined) {
    const agentId = body.assignedAgentId
    // null is allowed here, because it means "unassign this ticket".
    if (agentId === null || isValidId(agentId)) {
      data.assignedAgentId = agentId as number | null
    } else {
      errors.assignedAgentId = 'Assigned agent must be a user ID or null.'
    }
  }

  if (Object.keys(errors).length > 0) return { ok: false, errors }
  if (Object.keys(data).length === 0) return { ok: false, errors: { body: 'Provide at least one field to update.' } }
  return { ok: true, data }
}

export const validateComment: Validator<{ message: string }> = (body) => {
  const message = getTrimmedString(body.message)

  if (message.length < 1 || message.length > 2000) {
    return { ok: false, errors: { message: 'Comment must be 1 to 2000 characters.' } }
  }
  return { ok: true, data: { message } }
}

// URL values are always text, so these helpers convert and check them.
export function parseId(value: unknown): number {
  const id = Number(value)
  if (!isValidId(id)) throw new AppError(400, 'The ID must be a positive whole number.')
  return id
}

function parsePositiveInteger(value: unknown, fallback: number, maximum: number): number | null {
  if (value === undefined) return fallback
  const number = Number(value)
  return Number.isInteger(number) && number >= 1 && number <= maximum ? number : null
}

export function parseTicketQuery(query: Record<string, unknown>): TicketQuery {
  const { scope = 'all', status, priority, sort = 'newest' } = query
  const page = parsePositiveInteger(query.page, 1, 1_000_000)
  const limit = parsePositiveInteger(query.limit, 10, 100)
  const search = getTrimmedString(query.search).slice(0, 100)
  const errors: Record<string, string> = {}

  if (scope !== 'all' && scope !== 'mine') errors.scope = 'Scope must be "all" or "mine".'
  if (sort !== 'newest' && sort !== 'updated') errors.sort = 'Sort must be "newest" or "updated".'
  if (page === null) errors.page = 'Page must be a positive whole number.'
  if (limit === null) errors.limit = 'Limit must be between 1 and 100.'

  // An empty value means "no filter", which is what the frontend sends.
  const hasStatus = status !== undefined && status !== ''
  const hasPriority = priority !== undefined && priority !== ''
  if (hasStatus && !includes(ticketStatuses, status)) errors.status = 'Choose a valid status.'
  if (hasPriority && !includes(ticketPriorities, priority)) errors.priority = 'Choose a valid priority.'

  if (Object.keys(errors).length > 0) throw new AppError(400, 'Some search options are invalid.', errors)

  return {
    scope: scope as TicketQuery['scope'],
    sort: sort as TicketQuery['sort'],
    search,
    status: hasStatus ? (status as TicketStatus) : undefined,
    priority: hasPriority ? (priority as TicketPriority) : undefined,
    page: page as number,
    limit: limit as number,
  }
}

export function parseRoleFilter(value: unknown): UserRole | undefined {
  if (value === undefined || value === '') return undefined
  if (!includes(userRoles, value)) throw new AppError(400, 'Choose a valid role.')
  return value
}
