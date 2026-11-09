# MiniDesk Interview Guide

Interviewers rarely stop at "What is useState?" They follow up with "Where did you use it, and why?" These notes prepare you for both. Every concept is explained using MiniDesk's real code.

## How each concept is organized

1. **Concept Explanation:** the idea, from the basics.
2. **Project Implementation:** where it's used in MiniDesk.
3. **Code Reference:** the file, the code, and the important lines.
4. **Why We Used It:** the problem it solves.
5. **Real-Time Scenario:** what happens when someone uses the app.
6. **Interview Questions:** theory and practical questions.
7. **Project-Based Answers:** how to answer, in your own words, using this project.
8. **Follow-up Questions:** what an interviewer may ask next.

## Topics

| Guide | Concepts |
|---|---|
| [JavaScript](interview/javascript.md) | Arrow functions, destructuring, spread and rest, array methods, `?.` and `??`, Promises and async/await, closures, events, modules |
| [TypeScript](interview/typescript.md) | Basic types, interfaces, union types, optional and nullable, narrowing, generics, utility types, type assertions |
| [HTML, CSS and Tailwind](interview/html-css-tailwind.md) | Semantic HTML and accessibility, Tailwind and design tokens, responsive layout |
| [React fundamentals](interview/react-fundamentals.md) | Components and JSX, props, lists and keys, conditional rendering, lifting state up |
| [React Hooks](interview/react-hooks.md) | `useState`, `useEffect`, `useRef`, `useMemo`, `useCallback` and `memo`, custom Hooks, Rules of Hooks |
| [React forms](interview/react-forms.md) | Controlled inputs, React Hook Form, validation |
| [React Router](interview/react-router.md) | Routes and layout routes, protected routes, URL parameters and navigation |
| [Context API](interview/context-api.md) | Context and the auth provider, choosing between local state, Context and Redux |
| [Redux Toolkit](interview/redux-toolkit.md) | Store and slices, async thunks, reading and dispatching, race conditions |
| [Frontend architecture](interview/frontend-architecture.md) | The service layer |
| [Node.js and Express](interview/nodejs-express.md) | The event loop, REST and status codes, routes and layers, middleware, error handling, validation, environment variables and CORS |
| [Authentication](interview/authentication.md) | Password hashing with bcrypt, JWT, role-based authorization |
| [PostgreSQL and SQL](interview/postgresql.md) | Schema design, constraints, joins, aggregation, indexes, parameterized queries, connection pooling |
| [API integration](interview/api-integration.md) | Axios and interceptors, how the frontend and backend work together |
| [Testing](interview/testing.md) | Testing fundamentals, React Testing Library, mocking, API testing with Supertest |
| [Docker and deployment](interview/docker-deployment.md) | Images and containers, Docker Compose, production configuration |
| [Rapid-fire review](interview/rapid-fire-questions.md) | 91 short questions for last-minute revision |

## How to use these notes

1. Open the code reference in your editor and read it there.
2. Cover the Project-Based Answers and say your answer out loud.
3. Check it against the notes, and put it in your own words. Answers you've memorized word for word tend to fall apart at the first follow-up.
4. Change the code, break it, and see what happens. You'll answer far more confidently about things you've actually tried.

## Be accurate about the project's current state

An interviewer may look closely at your project, so describe it as it really is. The frontend, API and PostgreSQL database are connected and work together. It has an automated test suite. It isn't deployed, and its Docker files haven't been run, so don't claim either. These notes are updated whenever the code changes.
