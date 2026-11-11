import cors from 'cors'
import express from 'express'
import { env } from './config/env.js'
import { errorHandler, notFoundHandler } from './middleware/errorHandler.js'
import { authRoutes } from './routes/authRoutes.js'
import { dashboardRoutes } from './routes/dashboardRoutes.js'
import { ticketRoutes } from './routes/ticketRoutes.js'
import { userRoutes } from './routes/userRoutes.js'

// The app is built here and started in server.ts, so tests can use it without a real server.
export const app = express()

// Stops the response from advertising which framework the server runs on.
app.disable('x-powered-by')

// Behind a hosting service's proxy, this lets Express read each visitor's real address.
// Leaving it off locally stops anyone from faking their address with a header.
if (env.trustProxy > 0) app.set('trust proxy', env.trustProxy)

// Middleware runs in the order it's added, for every request.
app.use(cors({ origin: env.clientOrigin })) // only our frontend may call this API from a browser
app.use(express.json()) // turns a JSON request body into req.body

// A simple check that the server is running, used later by Docker and hosting services.
app.get('/api/health', (_req, res) => {
  res.json({ data: { status: 'ok' } })
})

app.use('/api/auth', authRoutes)
app.use('/api/tickets', ticketRoutes)
app.use('/api/dashboard', dashboardRoutes)
app.use('/api/users', userRoutes)

// These must come last: they handle whatever nothing above dealt with.
app.use(notFoundHandler)
app.use(errorHandler)
