import type { PublicUser } from './index'

// Teaches TypeScript that requests can carry the signed-in user,
// which the authenticate middleware adds.
declare global {
  namespace Express {
    interface Request {
      user?: PublicUser
    }
  }
}
