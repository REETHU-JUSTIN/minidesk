import type { ErrorRequestHandler, RequestHandler } from 'express'
import { AppError } from '../utils/AppError'

// Runs when no route matched the request.
export const notFoundHandler: RequestHandler = (_req, _res, next) => {
  next(new AppError(404, 'That address doesn\'t exist.'))
}

// Every error in the app ends up here, so all error responses have the same shape.
// Express recognizes error middleware by its four parameters, so _next must stay.
export const errorHandler: ErrorRequestHandler = (error, _req, res, _next) => {
  if (error instanceof AppError) {
    res.status(error.statusCode).json({ error: { message: error.message, details: error.details } })
    return
  }

  // Errors from Express's body parser, such as broken JSON, are the client's mistake.
  if (typeof error.status === 'number' && error.status >= 400 && error.status < 500) {
    res.status(error.status).json({ error: { message: 'The request couldn\'t be read. Please check it and try again.' } })
    return
  }

  // Anything else is a bug. Log the details for us, and tell the client nothing about them.
  console.error(error)
  res.status(500).json({ error: { message: 'Something went wrong. Please try again.' } })
}
