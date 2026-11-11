import { AppError } from '../utils/AppError.js'

// A function that returns middleware, so each route can choose its own validator.
export function validateBody(validator) {
  return (req, _res, next) => {
    // req.body is undefined, or an array, if the client sent no JSON object.
    const isObject = typeof req.body === 'object' && req.body !== null && !Array.isArray(req.body)
    const result = validator(isObject ? req.body : {})

    if (!result.ok) {
      next(new AppError(400, 'Please check the highlighted fields.', result.errors))
      return
    }

    // Replacing the body means controllers only ever see clean, known fields.
    req.body = result.data
    next()
  }
}
