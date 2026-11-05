# PostgreSQL and SQL

---

## Relational Schema Design

### 1. Concept Explanation

A relational database stores data in tables of rows and columns. Each row has a **primary key** that identifies it, and a **foreign key** links it to a row in another table. Splitting data so that each fact is stored once is called **normalization**.

### 2. Project Implementation

MiniDesk has three tables: `users`, `tickets` and `comments`. A ticket stores its customer's ID rather than their name, so a changed name only needs updating in one place. See the [database guide](../DATABASE_GUIDE.md) for the diagram.

### 3. Code Reference

**File:** [database/schema.sql](../../database/schema.sql)

```sql
id                INTEGER GENERATED ALWAYS AS IDENTITY (START WITH 1001) PRIMARY KEY,
```

```sql
customer_id       INTEGER NOT NULL REFERENCES users (id) ON DELETE RESTRICT,
```

```sql
assigned_agent_id INTEGER REFERENCES users (id) ON DELETE SET NULL,
```

```sql
ticket_id  INTEGER NOT NULL REFERENCES tickets (id) ON DELETE CASCADE,
```

- `GENERATED ALWAYS AS IDENTITY` lets the database create IDs. It's the modern replacement for `SERIAL`.
- `REFERENCES` creates a foreign key.
- Each `ON DELETE` choice describes what the data means: tickets need a customer, but they can exist with no agent, and comments mean nothing without their ticket.

### 4. Why We Used It

Tickets, users and comments are clearly related, and support data must stay correct. A relational database enforces those relationships itself. Storing each fact once also means data can't disagree with itself.

### 5. Real-Time Scenario

An admin deletes ticket 1006. `CASCADE` removes its comments automatically, so no orphaned rows are left. If agent Maya's account is deleted, her tickets stay but become unassigned, because of `SET NULL`. I tested both.

### 6. Interview Questions

- **Theory:** What's the difference between a primary key and a foreign key?
- **Theory:** What is normalization?
- **Theory:** What are the types of table relationships?
- **Theory:** SQL or NoSQL?
- **Practical:** Explain your database design.
- **Practical:** Why did you choose those `ON DELETE` rules?

### 7. Project-Based Answers

**Primary versus foreign key?**
A primary key uniquely identifies a row. A foreign key references another table's primary key. `tickets.id` is a primary key, and `tickets.customer_id` is a foreign key to `users`.

**What is normalization?**
Organizing data so each fact is stored once, reducing duplication and inconsistencies. A ticket stores `customer_id` rather than a copy of the customer's name.

**What are the relationship types?**
One-to-one, one-to-many and many-to-many. All of mine are one-to-many, such as a ticket having many comments. Many-to-many, like tags on tickets, would need a join table.

**SQL or NoSQL?**
SQL suits structured, related data that needs strong consistency, which describes support tickets. NoSQL suits flexible documents or very large scale. I chose PostgreSQL because my data is relational and I need joins and constraints.

**Explain your design.**
Three tables. `users` has a role column. `tickets` references `users` twice, for the customer and the agent. `comments` references both `tickets` and `users`.

**Why those `ON DELETE` rules?**
`RESTRICT` on the customer, so ticket history isn't lost. `SET NULL` on the agent, because a ticket should outlive one agent's account. `CASCADE` on comments, because they belong to their ticket.

### 8. Follow-up Questions

- **Why does `tickets` reference `users` twice?** A ticket has two different people, a customer and an agent, and both are users.
- **Why a single `users` table with a role, rather than separate tables?** They share the same fields and login, so one table is simpler.
- **What is denormalization?** Deliberately storing duplicate data to speed up reads, and accepting the extra work of keeping it in sync.

---

## Constraints

### 1. Concept Explanation

Constraints are rules the database enforces on its data.

| Constraint | Rule |
|---|---|
| `NOT NULL` | Must have a value |
| `UNIQUE` | No duplicates |
| `CHECK` | Must pass a condition |
| `PRIMARY KEY` | Unique and not null |
| `FOREIGN KEY` | Must match a row in another table |

### 2. Project Implementation

Every table uses them for required fields, allowed values and text lengths. `users.email` is `UNIQUE`, and the sign-up code relies on that rule directly.

### 3. Code Reference

**File:** [database/schema.sql](../../database/schema.sql)

```sql
email         TEXT NOT NULL UNIQUE CHECK (email = lower(email)),
```

```sql
status            TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'resolved')),
```

**File:** [backend/src/services/authService.ts](../../backend/src/services/authService.ts)

```ts
if ((error as { code?: string }).code === UNIQUE_VIOLATION) {
  throw new AppError(409, 'An account with this email already exists.')
}
```

- If two sign-ups use the same email at the same moment, the database lets one through, and the code turns the other's error into a clear message.

### 4. Why We Used It

The database is the last line of defense. Application checks can have bugs, and other tools can connect directly, but constraints always apply. The `UNIQUE` rule is also the only reliable way to prevent duplicates, because checking first and then inserting leaves a gap for another request.

### 5. Real-Time Scenario

Two people sign up with the same email at the same instant. If the code checked first, both could see "not taken", and both insert. With the constraint, only one succeeds, and the other gets a 409. A test sends five sign-ups at once, and exactly one wins.

### 6. Interview Questions

- **Theory:** What are database constraints?
- **Theory:** Why have constraints if the application already validates?
- **Theory:** What is a race condition in the context of a database?
- **Practical:** How do you guarantee unique emails?

### 7. Project-Based Answers

**What are constraints?**
Rules enforced by the database, like `NOT NULL`, `UNIQUE`, `CHECK` and foreign keys.

**Why have both?**
Validation gives users clear messages early. Constraints guarantee correctness, even with a bug or direct database access.

**What is a database race condition?**
Two operations interleaving so the result is wrong, like two sign-ups both passing a "does this email exist?" check.

**How do you guarantee unique emails?**
With a `UNIQUE` constraint. I insert and catch error code `23505`, which turns into a 409. Emails are also stored lowercase, enforced by a `CHECK`, so `A@x.com` and `a@x.com` can't both exist.

### 8. Follow-up Questions

- **Why `CHECK` rather than a PostgreSQL `ENUM`?** `CHECK` is easier to read and change. Changing an `ENUM` needs more steps.
- **How did you test them?** I ran bad inserts directly in SQL, bypassing the app, and all nine were rejected.
- **Is there any downside to constraints?** A small write cost, and bad data has to be handled as an error, which is the point.

---

## SQL Joins

### 1. Concept Explanation

A join combines rows from two tables, based on a related column.

| Join | Returns |
|---|---|
| `INNER JOIN` (or `JOIN`) | Only rows with a match in both tables |
| `LEFT JOIN` | All left rows, with `NULL` where there's no match |
| `RIGHT JOIN` | All right rows, with `NULL` where there's no match |
| `FULL JOIN` | All rows from both |

### 2. Project Implementation

- **Ticket queries:** join `users` twice, for customer and agent names.
- **Comment queries:** join `users` for the author's name.

### 3. Code Reference

**File:** [backend/src/services/ticketService.ts](../../backend/src/services/ticketService.ts)

```ts
FROM tickets t
JOIN users customer ON customer.id = t.customer_id
LEFT JOIN users agent ON agent.id = t.assigned_agent_id`
```

- `customer` and `agent` are aliases. They're needed because the same table appears twice.
- Every ticket has a customer, so `JOIN` is right there.
- An unassigned ticket has no agent, so `LEFT JOIN` keeps it, with `NULL` for the agent's name.

### 4. Why We Used It

Tickets store IDs, but the screen needs names. A join gets both in a single query. The alternative, querying for each ticket's names one at a time, would be far slower.

### 5. Real-Time Scenario

An admin opens All Tickets. Ticket 1007 has no agent. If I'd used `JOIN` for the agent, ticket 1007 would silently vanish from the list. With `LEFT JOIN`, it appears, and the page shows "Unassigned".

### 6. Interview Questions

- **Theory:** What's the difference between `INNER JOIN` and `LEFT JOIN`?
- **Theory:** What is the N+1 query problem?
- **Theory:** What is a self-join?
- **Practical:** Show me a join from your project.
- **Practical:** Why do you join `users` twice?

### 7. Project-Based Answers

**`INNER` versus `LEFT`?**
`INNER JOIN` returns only matches. `LEFT JOIN` keeps every row from the left table. I use `LEFT JOIN` for agents, so unassigned tickets aren't lost.

**What is N+1?**
One query to get a list, then one more per item, which gets slow quickly. I avoid it by joining names in the original query, so a page of tickets takes one query.

**What is a self-join?**
A table joined to itself, such as employees and their managers. Mine is related but different: `tickets` joins `users` twice.

**Show me a join.**
My ticket query selects from `tickets t`, joins `users customer` on the customer ID, and left joins `users agent` on the assigned agent ID.

**Why twice?**
A ticket references two different users. Each needs its own alias, so the query can read both names.

### 8. Follow-up Questions

- **What would a plain `JOIN` on the agent do?** It would hide every unassigned ticket, without any error.
- **Should you put filters in `ON` or `WHERE`?** For a `LEFT JOIN`, a filter in `WHERE` on the right table can turn it into an inner join, so it's important to know the difference.
- **Are joins slow?** Not with indexes on the joined columns. Primary keys are indexed automatically.

---

## Aggregation

### 1. Concept Explanation

Aggregate functions calculate one value from many rows: `COUNT`, `SUM`, `AVG`, `MIN` and `MAX`. `GROUP BY` calculates per group, `HAVING` filters groups, and `FILTER` limits one aggregate to certain rows.

### 2. Project Implementation

- **Dashboard:** counts tickets by status with `COUNT` and `FILTER`.
- **Ticket list:** `COUNT` provides the total for pagination.

### 3. Code Reference

**File:** [backend/src/services/dashboardService.ts](../../backend/src/services/dashboardService.ts)

```ts
COUNT(*)::int AS total,
COUNT(*) FILTER (WHERE status = 'open')::int AS open,
```

```ts
WHERE ($1::int IS NULL OR customer_id = $1)`,
```

- `FILTER` counts only the matching rows, so one query returns all four numbers.
- `::int` is needed because `COUNT` returns `bigint`, which the driver returns as text.
- The `WHERE` means "all tickets if `$1` is null, otherwise this customer's".

### 4. Why We Used It

Loading every ticket and counting in JavaScript gets slow as data grows, and sends a lot of data for no reason. The database does it far more efficiently. One query also means all the numbers come from the same moment.

### 5. Real-Time Scenario

A customer opens the dashboard. The query runs for just their tickets and returns four numbers, like 3 total and 2 open. An admin runs the same query with `NULL`, and gets counts for all tickets.

### 6. Interview Questions

- **Theory:** What's the difference between `WHERE` and `HAVING`?
- **Theory:** What does `GROUP BY` do?
- **Practical:** How did you implement your dashboard statistics?
- **Practical:** Why calculate them in SQL rather than JavaScript?

### 7. Project-Based Answers

**`WHERE` versus `HAVING`?**
`WHERE` filters rows before grouping, and `HAVING` filters groups after. Finding customers with over five tickets would use `HAVING COUNT(*) > 5`.

**What does `GROUP BY` do?**
It collapses rows into groups, so aggregates run per group. My dashboard doesn't need it, because the numbers are fixed columns, but `GROUP BY status` would also work and return one row per status.

**How did you implement the statistics?**
One query using `COUNT(*) FILTER (WHERE ...)` for each status, with an optional customer filter so customers only count their own.

**Why SQL rather than JavaScript?**
The database can do it without sending every row over the network, so it stays fast as data grows.

### 8. Follow-up Questions

- **Why does `::int` matter?** Without it, `COUNT` arrives as a string like `"8"`, and `"8" + 1` gives `"81"` in JavaScript. A test checks that the stats are numbers.
- **How would you add an average resolution time?** `AVG(updated_at - created_at)` filtered on resolved tickets, though a dedicated `resolved_at` column would be more accurate.
- **Could these numbers be cached?** Yes, for very large tables, but it isn't needed here.

---

## Indexes

### 1. Concept Explanation

Without an index, the database reads every row to find matches, which is a **sequential scan**. An index is a sorted structure, usually a B-tree, that finds rows quickly, like a book's index. The cost is extra storage and slightly slower writes, because each index must be updated.

### 2. Project Implementation

Primary keys and `UNIQUE` columns get indexes automatically. I added six more, for the columns MiniDesk filters and sorts by most.

### 3. Code Reference

**File:** [database/schema.sql](../../database/schema.sql)

```sql
CREATE INDEX idx_tickets_customer_id ON tickets (customer_id);
CREATE INDEX idx_tickets_assigned_agent_id ON tickets (assigned_agent_id);
CREATE INDEX idx_tickets_created_at ON tickets (created_at DESC);
CREATE INDEX idx_comments_ticket_id ON comments (ticket_id);
```

- PostgreSQL doesn't automatically index foreign keys, so these are added by hand.
- `DESC` matches the "newest first" sort.

### 4. Why We Used It

These queries run constantly: every customer loads their tickets, and every ticket page loads its comments. Without indexes, each would scan the whole table, which would become noticeably slow with enough data.

### 5. Real-Time Scenario

With 20,000 tickets, a query for one agent's tickets could read every row. I added 20,000 test rows and used `EXPLAIN`, which showed PostgreSQL using `idx_tickets_assigned_agent_id` for that query, and `idx_tickets_created_at` for the sort.

### 6. Interview Questions

- **Theory:** What is an index, and how does it work?
- **Theory:** What are the downsides?
- **Theory:** When wouldn't a query use an index?
- **Practical:** Which columns did you index, and why?
- **Practical:** How do you know whether a query uses an index?

### 7. Project-Based Answers

**What is an index?**
A separate sorted structure that lets the database find rows without reading the whole table. By default, it's a B-tree.

**What are the downsides?**
Extra storage, and slower writes. So I only index columns that queries actually use.

**When wouldn't it be used?**
On very small tables, where a scan is faster, or for patterns like `ILIKE '%text%'`, where a leading wildcard can't use a normal index. That's the case with my title search, which is fine at this size.

**Which did you index?**
The foreign keys, because they're used for filtering, plus status, priority and `created_at`, for filters and sorting.

**How do you know?**
With `EXPLAIN`. I tested on 20,000 rows, and it showed an index scan. With only eight sample tickets, PostgreSQL may scan the table instead, because that's actually faster.

### 8. Follow-up Questions

- **What is a composite index?** An index on several columns, such as `(status, created_at)`. Column order matters.
- **How would you speed up title search?** PostgreSQL's full-text search, or a trigram index with `pg_trgm`.
- **Does `UNIQUE` create an index?** Yes, which is why login's email lookup is already fast.

---

## Parameterized Queries and SQL Injection

### 1. Concept Explanation

**SQL injection** happens when user text becomes part of a SQL command. If code builds `"... WHERE email = '" + email + "'"`, someone can enter text that changes what the query does.

**Parameterized queries** send the SQL and the values separately. Values can never run as code, whatever they contain.

### 2. Project Implementation

Every query uses `$1`-style parameters. The few parts built dynamically, like column names, come only from fixed lists in the code.

### 3. Code Reference

**File:** [backend/src/services/authService.ts](../../backend/src/services/authService.ts)

```ts
`SELECT ${PUBLIC_USER_COLUMNS}, password_hash AS "passwordHash" FROM users WHERE email = $1`,
[email],
```

- `$1` is a placeholder, and the value travels separately.
- `PUBLIC_USER_COLUMNS` is a fixed string from the code, not user input.

**File:** [backend/src/services/ticketService.ts](../../backend/src/services/ticketService.ts)

```ts
const escapedSearch = search.replace(/[\\%_]/g, '\\$&')
addCondition((p) => `t.title ILIKE ${p}`, `%${escapedSearch}%`)
```

```ts
const sortColumn = sort === 'updated' ? 't.updated_at' : 't.created_at'
```

- Parameters stop injection, but `%` and `_` are still wildcards inside `ILIKE`, so they're escaped.
- Column names can't be parameters, so this one is chosen from exactly two fixed values.

### 4. Why We Used It

SQL injection is one of the most damaging and common web vulnerabilities. It can expose or destroy a whole database. Parameters remove it entirely, and they're no extra effort.

### 5. Real-Time Scenario

Someone searches for `'; DROP TABLE users; --`. In a string-built query, this could delete the users table. Here, it's just text to look for in titles, so the result is zero tickets and the table is untouched. A test runs this exact attack.

### 6. Interview Questions

- **Theory:** What is SQL injection?
- **Theory:** How do parameterized queries prevent it?
- **Theory:** Does an ORM prevent it?
- **Practical:** How did you protect your queries?
- **Practical:** How do you build a query with optional filters safely?

### 7. Project-Based Answers

**What is SQL injection?**
When user input is treated as SQL code, letting an attacker read or change data.

**How do parameters prevent it?**
The SQL structure and the values reach the database separately, so a value can only ever be data.

**Does an ORM prevent it?**
Usually, because they use parameters internally. But raw query options can still be misused. I wrote SQL by hand to learn it.

**How did you protect your queries?**
Every value uses `$1`-style parameters. I tested attacks in search and login, and they were treated as plain text.

**How do you build optional filters safely?**
`listTickets` builds a list of conditions and a matching list of values, numbering the placeholders as it goes. Only fixed SQL strings are joined together, and every value stays a parameter.

### 8. Follow-up Questions

- **Why can't column names be parameters?** Parameters only hold values, so I choose column names from a fixed list.
- **What's the risk with `LIKE` wildcards?** Not injection, but `%` could match everything, so I escape them.
- **What else limits damage?** A database user with only the permissions it needs, instead of a superuser, which I'd use in production.

---

## Connection Pooling

### 1. Concept Explanation

Opening a database connection is slow, because it involves a network handshake and authentication. A **pool** keeps several connections open and lends them out per query, then takes them back.

### 2. Project Implementation

`config/db.ts` creates one pool, which all services share. `server.ts` checks the connection at startup.

### 3. Code Reference

**File:** [backend/src/config/db.ts](../../backend/src/config/db.ts)

```ts
export const pool = new Pool({
  host: env.dbHost,
```

```ts
types.setTypeParser(types.builtins.TIMESTAMPTZ, (value) => new Date(value).toISOString())
```

- `pool.query` borrows a connection, runs the query and returns it automatically.
- The type parser makes all timestamps ISO text, matching what the API promises.

**File:** [backend/src/server.ts](../../backend/src/server.ts)

```ts
await pool.query('SELECT 1')
```

- A bad password gives a clear message at startup, rather than an error on the first request.

### 4. Why We Used It

A connection for every request would add delay and could overwhelm the database, which supports a limited number of connections. A pool reuses them and limits how many are in use.

### 5. Real-Time Scenario

Sixty requests arrive at once. The pool runs up to 10 queries at a time, and the rest wait briefly for a free connection. A test confirmed that all sixty succeeded.

### 6. Interview Questions

- **Theory:** What is connection pooling, and why is it used?
- **Theory:** What happens when the pool is full?
- **Theory:** What is a transaction?
- **Practical:** How do you connect to the database?
- **Practical:** Where did you use a transaction?

### 7. Project-Based Answers

**What is pooling?**
Reusing a set of open connections rather than opening one per request. It's faster and protects the database from too many connections.

**What happens when it's full?**
New queries wait in a queue for a free connection. The `pg` pool defaults to 10 connections.

**What is a transaction?**
A group of statements that all succeed or all fail, using `BEGIN`, `COMMIT` and `ROLLBACK`. The properties are called ACID: atomicity, consistency, isolation and durability.

**How do you connect?**
With one `Pool` from the `pg` library, using settings from environment variables, shared by all services.

**Where did you use a transaction?**
In `resetDatabase.ts`, so a failure in the schema or seed leaves the database unchanged. My API routes mostly run single statements, which are atomic on their own.

### 8. Follow-up Questions

- **Should `updateTicket` use a transaction?** Its read-then-write means two simultaneous edits could interleave, with the last one winning. For a small app this is acceptable, and a transaction with row locking would be stricter.
- **Why `Pool` in the API, but `Client` in the reset script?** A transaction needs all statements on one connection, and the script runs once and exits.
- **Why do IDs have gaps after a failed insert?** Sequences don't roll back, so a rolled-back insert still uses up numbers. That's normal, and I saw it during testing.
