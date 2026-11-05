import cors from 'cors'
import express from 'express'
import { env } from './config/env'
import { errorHandler, notFoundHandler } from './middleware/errorHandler'
import { authRoutes } from './routes/authRoutes'
import { dashboardRoutes } from './routes/dashboardRoutes'
import { ticketRoutes } from './routes/ticketRoutes'
import { userRoutes } from './routes/userRoutes'

// The app is built here and started in server.ts, so tests can use it without a real server.
export const app = express()

// Stops the response from advertising which framework the server runs on.
app.disable('x-powered-by')

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
