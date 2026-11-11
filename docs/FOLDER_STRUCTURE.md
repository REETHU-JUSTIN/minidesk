# MiniDesk Folder Structure

What every folder and file is for. Tests sit next to the code they test on the frontend, and in a separate `tests` folder on the backend.

## Top level

```
Minidesk/
├── frontend/              The React app that runs in the browser
├── backend/               The Express API
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
│   ├── main.jsx                     Starts React, and wraps the app in Redux, the router and auth
│   ├── App.jsx                      Every route, and which roles may see each one
│   ├── index.css                    Tailwind, plus the brand color tokens
│   │
│   ├── pages/                       One component per screen
│   │   ├── LoginPage.jsx, RegisterPage.jsx, ForgotPasswordPage.jsx
│   │   ├── DashboardPage.jsx        Ticket counts and recent tickets
│   │   ├── TicketListPage.jsx       My Tickets and All Tickets, with search, filters and pages
│   │   ├── TicketDetailsPage.jsx    One ticket: details, comments, managing it
│   │   ├── CreateTicketPage.jsx
│   │   ├── UsersPage.jsx            Admins only
│   │   ├── SettingsPage.jsx         Your profile
│   │   └── NotFoundPage.jsx
│   │
│   ├── components/
│   │   ├── common/                  Reusable pieces: Button, Card, Badge, Input, Select,
│   │   │                            Textarea, Modal, Pagination, Spinner, ErrorMessage,
│   │   │                            StatCard, Logo
│   │   ├── layout/                  The app's frame and route guards
│   │   │   ├── AppLayout.jsx        Sidebar and top bar around every signed-in page
│   │   │   ├── AuthLayout.jsx       The centered card for sign-in pages
│   │   │   ├── Sidebar.jsx, TopNav.jsx, NotificationMenu.jsx, ProfileMenu.jsx
│   │   │   ├── ProtectedRoute.jsx   Requires sign-in and, optionally, certain roles
│   │   │   └── GuestRoute.jsx       Sends signed-in users away from the login page
│   │   └── tickets/                 Ticket features: TicketTable, TicketFilters,
│   │                                TicketForm, TicketEditForm, TicketManagePanel,
│   │                                TicketComments, CommentList, CommentForm
│   │
│   ├── context/
│   │   ├── AuthContext.js           The auth context and its type
│   │   └── AuthProvider.jsx         Holds the signed-in user, handles login and logout
│   ├── features/                    Redux slices, one folder per feature
│   │   ├── tickets/ticketsSlice.js  Ticket list and selected ticket, with async thunks
│   │   └── dashboard/dashboardSlice.js
│   ├── store/
│   │   ├── store.js                 Combines the slices into one store
│   │   ├── hooks.js                 useAppDispatch and useAppSelector
│   │   └── actions.js               userLoggedOut, which every slice clears itself on
│   ├── services/                    The only code that talks to the API
│   │   ├── api.js                   Axios instance and interceptors: token, errors, expired sessions
│   │   └── authService.js, ticketService.js, userService.js
│   ├── hooks/                       useAuth, useDebounce, useCloseOnOutside
│   ├── utils/                       formatDate, getInitials, ticketLabels, validationRules
│   └── test/                        Test setup, and renderWithProviders for component tests
│
├── vite.config.js                   Build and test settings
├── Dockerfile, nginx.conf           Container image and its web server (untested)
├── vercel.json                      Makes page refreshes work on Vercel
└── .env.example                     VITE_API_URL, the API's address
```

## Backend

```
backend/
├── src/
│   ├── server.js                    Checks the database, starts listening, shuts down cleanly
│   ├── app.js                       Builds the Express app: middleware, routes, error handling
│   ├── config/
│   │   ├── env.js                   Reads and checks settings, and stops if a secret is missing
│   │   └── db.js                    Connects to MongoDB
│   ├── routes/                      URL to controller, with middleware: auth, tickets,
│   │                                dashboard, users
│   ├── middleware/
│   │   ├── authenticate.js          Verifies the JWT, and sets req.user
│   │   ├── authorize.js             Checks the user's role
│   │   ├── validate.js              Checks and cleans request bodies
│   │   ├── rateLimits.js            Limits failed logins and sign-ups
│   │   └── errorHandler.js          Turns every error into one response shape
│   ├── controllers/                 Read requests and send responses: auth, ticket,
│   │                                comment, dashboard, user
│   ├── models/                      Mongoose schemas: User.js, Ticket.js
│   ├── services/                    Business rules and queries: auth, ticket, comment,
│   │                                dashboard, user
│   ├── utils/
│   │   ├── AppError.js              An error with an HTTP status, safe to show clients
│   │   └── validators.js            Validation for every request
│   └── scripts/
│       ├── sampleData.js, loadSampleData.js   The sample accounts and tickets
│       ├── resetDatabase.js         npm run db:reset: local development only, wipes data
│       ├── setupDatabase.js         npm run db:setup: creates indexes on a new database
│       └── createUser.js            npm run user:create: makes admin and agent accounts
│
├── tests/                           API tests against a temporary MongoDB server
│   ├── helpers.js, globalSetup.js   Test database setup and shared tools
│   └── auth, authenticate, tickets, errors, rateLimit, validators .test.js
│
├── vitest.config.js                 Test settings
├── Dockerfile                       Container image (untested)
└── .env.example                     Every setting the API reads
```

## Docs

```
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
├── postgresql/                      SQL practice, the original schema and queries, and SQL interview notes
├── git/README.md                    Branching, merge conflicts, pull requests
├── ci-cd/                           ci.yml, a GitHub Actions workflow that isn't turned on, and README.md
├── docker/README.md                 Docker commands and concepts
├── aws/README.md                    How MiniDesk would run on AWS
└── agile/README.md                  MiniDesk as user stories and sprints
```

## Where to look for common tasks

| You want to... | Start here |
|---|---|
| Add a page | `frontend/src/App.jsx`, then `pages/` |
| Add an API endpoint | `backend/src/routes/`, then a controller and a service |
| Change who may do what | `backend/src/services/ticketService.js` and the `authorize` calls in `routes/`, then match the frontend |
| Change a validation rule | `backend/src/utils/validators.js` and `frontend/src/utils/validationRules.js` |
| Add a field | `backend/src/models/`, `sampleData.js`, and the service's mapper |
| Change colors | `frontend/src/index.css` |
| Change how API errors appear | `frontend/src/services/api.js` |
