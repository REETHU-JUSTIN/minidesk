// An error we expect and can explain to the client, such as "ticket not found".
// The error handler sends these to the client, and hides all other errors.
export class AppError extends Error {
  statusCode: number
  details?: Record<string, string>

  constructor(statusCode: number, message: string, details?: Record<string, string>) {
    super(message)
    this.statusCode = statusCode
    this.details = details
  }
}
