# MiniDesk Folder Structure

What every folder and file is for. Tests sit next to the code they test on the frontend, and in a separate `tests` folder on the backend.

## Top level

```
Minidesk/
├── frontend/              The React app that runs in the browser
├── backend/               The Express API
├── database/              SQL for the tables and sample data
├── docs/                  Guides, API reference, interview notes, Postman collection
├── examples/              Practice topics outside MiniDesk: MongoDB, PostgreSQL, Git,
│                          CI/CD, Docker, AWS, Agile
├── docker-compose.yml     Runs the database, API and frontend together (untested)
├── .env.example           Settings needed by docker-compose.yml
├── .dockerignore          Keeps secrets and large folders out of Docker builds
├── .gitignore             Keeps secrets, node_modules and builds out of Git
└── README.md              How to run the project
```

## Frontend

```
frontend/
├── src/
│   ├── main.tsx                     Starts React, and wraps the app in Redux, the router and auth
│   ├── App.tsx                      Every route, and which roles may see each one
│   ├── index.css                    Tailwind, plus the brand color tokens
│   │
│   ├── pages/                       One component per screen
│   │   ├── LoginPage.tsx, RegisterPage.tsx, ForgotPasswordPage.tsx
│   │   ├── DashboardPage.tsx        Ticket counts and recent tickets
│   │   ├── TicketListPage.tsx       My Tickets and All Tickets, with search, filters and pages
│   │   ├── TicketDetailsPage.tsx    One ticket: details, comments, managing it
│   │   ├── CreateTicketPage.tsx
│   │   ├── UsersPage.tsx            Admins only
│   │   ├── SettingsPage.tsx         Your profile
│   │   └── NotFoundPage.tsx
│   │
│   ├── components/
│   │   ├── common/                  Reusable pieces: Button, Card, Badge, Input, Select,
│   │   │                            Textarea, Modal, Pagination, Spinner, ErrorMessage,
│   │   │                            StatCard, Logo
│   │   ├── layout/                  The app's frame and route guards
│   │   │   ├── AppLayout.tsx        Sidebar and top bar around every signed-in page
│   │   │   ├── AuthLayout.tsx       The centered card for sign-in pages
│   │   │   ├── Sidebar.tsx, TopNav.tsx, NotificationMenu.tsx, ProfileMenu.tsx
│   │   │   ├── ProtectedRoute.tsx   Requires sign-in and, optionally, certain roles
│   │   │   └── GuestRoute.tsx       Sends signed-in users away from the login page
│   │   └── tickets/                 Ticket features: TicketTable, TicketFilters,
│   │                                TicketForm, TicketEditForm, TicketManagePanel,
│   │                                TicketComments, CommentList, CommentForm
│   │
│   ├── context/
│   │   ├── AuthContext.ts           The auth context and its type
│   │   └── AuthProvider.tsx         Holds the signed-in user, handles login and logout
│   ├── features/                    Redux slices, one folder per feature
│   │   ├── tickets/ticketsSlice.ts  Ticket list and selected ticket, with async thunks
│   │   └── dashboard/dashboardSlice.ts
│   ├── store/
│   │   ├── store.ts                 Combines the slices into one store
│   │   ├── hooks.ts                 Typed useAppDispatch and useAppSelector
│   │   └── actions.ts               userLoggedOut, which every slice clears itself on
│   ├── services/                    The only code that talks to the API
│   │   ├── api.ts                   Axios instance and interceptors: token, errors, expired sessions
│   │   └── authService.ts, ticketService.ts, userService.ts
│   ├── hooks/                       useAuth, useDebounce, useCloseOnOutside
│   ├── types/index.ts               Shapes of users, tickets, comments and API responses
│   ├── utils/                       formatDate, getInitials, ticketLabels, validationRules
│   └── test/                        Test setup, and renderWithProviders for component tests
│
├── vite.config.ts                   Build and test settings
├── Dockerfile, nginx.conf           Container image and its web server (untested)
├── vercel.json                      Makes page refreshes work on Vercel
└── .env.example                     VITE_API_URL, the API's address
```

## Backend

```
backend/
├── src/
│   ├── server.ts                    Checks the database, starts listening, shuts down cleanly
│   ├── app.ts                       Builds the Express app: middleware, routes, error handling
│   ├── config/
│   │   ├── env.ts                   Reads and checks settings, and stops if a secret is missing
│   │   └── db.ts                    The PostgreSQL connection pool
│   ├── routes/                      URL to controller, with middleware: auth, tickets,
│   │                                dashboard, users
│   ├── middleware/
│   │   ├── authenticate.ts          Verifies the JWT, and sets req.user
│   │   ├── authorize.ts             Checks the user's role
│   │   ├── validate.ts              Checks and cleans request bodies
│   │   ├── rateLimits.ts            Limits failed logins and sign-ups
│   │   └── errorHandler.ts          Turns every error into one response shape
│   ├── controllers/                 Read requests and send responses: auth, ticket,
│   │                                comment, dashboard, user
│   ├── services/                    Business rules and SQL: auth, ticket, comment,
│   │                                dashboard, user
│   ├── utils/
│   │   ├── AppError.ts              An error with an HTTP status, safe to show clients
│   │   └── validators.ts            Validation for every request
│   ├── types/                       Data shapes, and req.user for Express
│   └── scripts/
│       ├── resetDatabase.ts         npm run db:reset: local development only, wipes data
│       ├── setupDatabase.ts         npm run db:setup: creates tables on a new, empty database
│       └── createUser.ts            npm run user:create: makes admin and agent accounts
│
├── tests/                           API tests against a real test database
│   ├── helpers.ts, globalSetup.ts   Test database setup and shared tools
│   └── auth, authenticate, tickets, errors, rateLimit, validators .test.ts
│
├── vitest.config.mts                Test settings, which force the minidesk_test database
├── tsconfig.json                    Type checking, including tests
├── tsconfig.build.json              Compiling to dist/, without tests
├── Dockerfile                       Container image (untested)
└── .env.example                     Every setting the API reads
```

## Database and docs

```
database/
├── schema.sql                       Tables, rules and indexes. Deletes existing tables first.
└── seed.sql                         Sample data with a public demo password. Local use only.

docs/
├── PROJECT_OVERVIEW.md              What MiniDesk is, and how it fits together
├── FOLDER_STRUCTURE.md              This file
├── API_DOCUMENTATION.md             Every endpoint, status code and response shape
├── DATABASE_GUIDE.md                Setup, ER diagram, relationships, queries
├── DEPLOYMENT_GUIDE.md              How to put it online, plus a pre-launch checklist
├── LEARNING_GUIDE.md                What was built in each phase, and exercises
├── INTERVIEW_QUESTIONS.md           Index of the interview notes
├── interview/                       One guide per technology, using real project code
└── MiniDesk.postman_collection.json 20 API requests with automated checks
```

## Examples

```
examples/
├── README.md                        What each example covers, and whether it was tested
├── mongodb/                         crud.js, aggregation.js, package.json, README.md
├── postgresql/                      ctes.sql, stored-procedures.sql, README.md
├── git/README.md                    Branching, merge conflicts, pull requests
├── ci-cd/                           ci.yml, a GitHub Actions workflow that isn't turned on, and README.md
├── docker/README.md                 Docker commands and concepts
├── aws/README.md                    How MiniDesk would run on AWS
└── agile/README.md                  MiniDesk as user stories and sprints
```

## Where to look for common tasks

| You want to... | Start here |
|---|---|
| Add a page | `frontend/src/App.tsx`, then `pages/` |
| Add an API endpoint | `backend/src/routes/`, then a controller and a service |
| Change who may do what | `backend/src/services/ticketService.ts` and the `authorize` calls in `routes/`, then match the frontend |
| Change a validation rule | `backend/src/utils/validators.ts` and `frontend/src/utils/validationRules.ts` |
| Add a database column | `database/schema.sql`, `seed.sql`, the SQL in services, and both `types` files |
| Change colors | `frontend/src/index.css` |
| Change how API errors appear | `frontend/src/services/api.ts` |
