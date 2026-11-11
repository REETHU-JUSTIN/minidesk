import { AppError } from '../utils/AppError.js'

// Answers "is this user allowed to do this?". It must run after authenticate.
// A 401 means "we don't know who you are". A 403 means "we know, and you can't do this".
export function authorize(...allowedRoles) {
  return (req, _res, next) => {
    if (!req.user || !allowedRoles.includes(req.user.role)) {
      next(new AppError(403, 'You don\'t have permission to do that.'))
      return
    }
    next()
  }
}
