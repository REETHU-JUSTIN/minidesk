# MiniDesk Project Overview

MiniDesk is a MERN stack support ticket management system. Customers raise tickets, agents take ownership and resolve them, and admins oversee everything. It's a smaller version of tools like Zendesk and Freshdesk, built to learn full-stack development end to end.

## The problem it solves

Support requests that arrive by email or chat are easy to lose, and it's hard to tell who owns each one or what state it's in. MiniDesk gives every request a single record, with an owner, a priority, a status and a conversation history.

## Who uses it

| Role | What they can do |
|---|---|
| **Customer** | Sign up, create tickets, see only their own tickets, edit a ticket while it's open, and comment |
| **Agent** | See all tickets, assign tickets to themselves, change status, and comment |
| **Admin** | Everything an agent can do, plus assign any agent, edit or delete any ticket, and view all users |

Customers can only create accounts for themselves. Admin and agent accounts are created with a server-side script.

## Features

- Sign-up, sign-in and sign-out with JWT, and sessions that survive a page refresh
- Role-based pages, buttons and API permissions
- Ticket creation, editing, assignment, status changes and deletion
- Comments on each ticket
- Search, status and priority filters, and pagination
- A dashboard with ticket counts by status and recent tickets
- A notifications menu showing recently updated tickets
- Validation in both the browser and the API
- Clear loading, error and empty states
- A responsive layout for desktop and phone
- Rate limiting on login and sign-up

## Technologies

| Area | Technologies |
|---|---|
| Frontend | React 19, JavaScript, Vite, Tailwind CSS 4, React Router 7, Redux Toolkit, Context API, React Hook Form, Axios, Lucide icons |
| Backend | Node.js 22, Express 5, JavaScript, JWT, bcrypt, express-rate-limit |
| Database | MongoDB, using Mongoose schemas, populate and aggregation pipelines |
| Testing | Vitest, React Testing Library, Supertest, Postman |
| Tooling | Git and GitHub, oxlint, Docker and Docker Compose (written, not yet run) |

## How it fits together

```
Browser
  React pages and components
  Context: who is signed in
  Redux: tickets and dashboard data
  Services and Axios: attach the token, handle errors
        |
        |  HTTPS + JSON, with "Authorization: Bearer <token>"
        v
Express API
  Middleware: CORS, JSON, rate limits, authenticate, authorize, validate
  Controllers: read requests, send responses
  Services: business rules and MongoDB queries
  Error handler: one response shape for every error
        |
        |  Mongoose connection pool
        v
MongoDB
  users  <-  tickets (with embedded comments)
```

## What happens when an agent resolves a ticket

1. The agent picks **Resolved** on the ticket page.
2. `TicketDetails` dispatches the `updateTicket` thunk, which calls `ticketService.updateTicket`.
3. Axios sends `PUT /api/tickets/1006`, and its interceptor attaches the agent's token.
4. Express runs `authenticate`, which verifies the token and loads the agent, then validation, which accepts only known fields.
5. `ticketService.updateTicket` checks the agent may change status, then updates the document with `$set`.
6. The updated ticket returns as JSON. The Redux reducer stores it, and the page and list both show the new status.

## Security

- **Passwords:** hashed with bcrypt, and never returned by the API.
- **Login tokens:** JWTs signed with a secret from an environment variable, and checked on every protected request.
- **Permissions:** enforced on the server, at both route and record level. Customers get a 404 for other people's tickets, so they can't discover which ticket numbers exist.
- **NoSQL injection:** prevented by strict type checks, ID format checks and escaped search text.
- **Abuse:** rate limiting on login and sign-up.
- **Errors:** internal details are logged on the server and never sent to clients.
- **Secrets:** kept in `.env` files that Git ignores.

## Testing

- **176 automated tests:** 62 frontend tests with React Testing Library, and 114 backend tests with Supertest against a temporary MongoDB server.
- **Tests that catch bugs:** deliberately breaking the code in 18 ways, such as removing permission checks, was caught by the tests every time.
- **Postman:** a collection of 20 requests with automated checks.
- **One-off browser checks:** 72 checks through the full stack in a real browser, run during development. They aren't stored as a permanent test suite.

## Current status

The application is complete and works from end to end on a local machine.

**Not done:**
- **Deployment:** it isn't deployed, although a [deployment guide](DEPLOYMENT_GUIDE.md) is ready.
- **Docker:** the Docker files have never been run, because Docker wasn't available.
- **Continuous integration:** a GitHub Actions workflow is written in `examples/ci-cd/`, but isn't turned on.

**Known limitations:**
- **Password reset:** "Forgot password" asks users to contact an admin, because no email service is set up.
- **Simultaneous edits:** if two people edit the same ticket at once, the last save wins.
- **Notifications:** they show recently updated tickets, rather than personal notifications.
- **Updates:** there are no live updates, so other people's changes appear on the next load.
- **Title search:** it can't use a normal database index, which is fine at this size.
- **References:** MongoDB doesn't enforce links between documents, so the API checks them.
- **Modal focus:** keyboard focus isn't trapped inside modals.
- **Rate limits:** the counts are kept in memory, so several servers would need a shared store.
- **End-to-end tests:** none are stored in the repository.

## Describing it in an interview

> "MiniDesk is a full-stack support ticket system, a bit like a small Zendesk. Customers raise tickets, agents take ownership and update them, and admins manage everything. Each role only sees what it's allowed to, and that's enforced on the server.
>
> The frontend uses React and Redux Toolkit. The backend is Node.js and Express with MongoDB and Mongoose, using JWT for authentication and bcrypt for passwords. It has 176 automated tests across the frontend and API."

If asked what was hardest, these are true examples:
- Stopping older responses from overwriting newer ones when users clicked quickly.
- Making sure customers couldn't reach other customers' tickets by changing an ID in the URL.

## For your resume

> **MiniDesk: Support Ticket Management System** | [github.com/REETHU-JUSTIN/minidesk](https://github.com/REETHU-JUSTIN/minidesk)
> *MongoDB, Express, React, Node.js, JavaScript, Redux Toolkit, JWT*
> - Developed a MERN stack support ticket system with customer, agent and admin roles, enforcing permissions on the server at route and record level.
> - Built REST APIs with JWT authentication, bcrypt password hashing, request validation, rate limiting and centralized error handling.
> - Designed MongoDB schemas with Mongoose, using embedded comments, references with populate, aggregation pipelines and indexes.
> - Created a responsive React interface with search, filters and a dashboard, using Redux Toolkit, the Context API and Axios interceptors.
> - Wrote 176 automated tests with Vitest, React Testing Library and Supertest, and verified they catch deliberately introduced bugs.

Don't add "deployed" or "Docker" to this until they're true. If you deploy it, add the live link.
