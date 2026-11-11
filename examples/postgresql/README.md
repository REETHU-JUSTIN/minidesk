# PostgreSQL: CTEs and Stored Procedures

**Tested:** both files ran correctly on a copy of the schema here. They left the data unchanged, and ran again cleanly.

MiniDesk now uses MongoDB, but it was first built on PostgreSQL. This folder keeps that work so you can still study SQL:

- [schema.sql](schema.sql) and [seed.sql](seed.sql): the original tables and sample data.
- [minidesk-sql/](minidesk-sql/ticketService.ts): the original service files, for reference. They aren't compiled.
- [INTERVIEW_NOTES.md](INTERVIEW_NOTES.md): SQL interview notes based on that code.

The complete PostgreSQL version of the app is saved under the Git tag `postgres-version`.

## Run it

Use a PostgreSQL database with `schema.sql` and `seed.sql` loaded, such as a `minidesk` database. Use port `5433` for your PostgreSQL 18 server.

```bash
psql -h localhost -p 5433 -U postgres -d minidesk -f examples/postgresql/ctes.sql
psql -h localhost -p 5433 -U postgres -d minidesk -f examples/postgresql/stored-procedures.sql
```

Or open each file in pgAdmin's Query Tool, and press F5. Both files undo their changes. `stored-procedures.sql` creates everything in a separate `examples` schema and drops it at the end.

---

## Common Table Expressions (CTEs)

### 1. Concept Explanation

A CTE uses `WITH` to name a query's result, so the main query can use it like a table. It's often easier to read than nested subqueries. There are three kinds worth knowing:

- **Plain CTEs**, for readability.
- **Recursive CTEs**, which refer to themselves, for sequences and hierarchies.
- **Data-modifying CTEs**, which use `RETURNING` to pass changed rows on to the next query.

### 2. Project Implementation

`ctes.sql` answers four support-desk questions using MiniDesk's tables:
1. Each agent's workload.
2. Customers with open tickets, and their latest comment.
3. Tickets created each day, including days with none.
4. Resolving tickets and reporting which ones changed.

### 3. Code Reference

**File:** [examples/postgresql/ctes.sql](ctes.sql)

```sql
WITH active_tickets AS (
  SELECT assigned_agent_id, priority
  FROM tickets
  WHERE status <> 'resolved' AND assigned_agent_id IS NOT NULL
)
```

```sql
WITH RECURSIVE days AS (
  SELECT DATE '2026-10-22' AS day
  UNION ALL
  SELECT day + 1 FROM days WHERE day < DATE '2026-10-31'
)
```

```sql
RETURNING id, title
```

- The recursive CTE starts with one row, then keeps adding the next day until its condition stops it. A `LEFT JOIN` to tickets then shows days with zero tickets too.
- `RETURNING` hands the updated rows straight to the next query, so changing and reporting happen in one statement.

### 4. Why Use It

CTEs break a complex query into named steps, which is easier to read, review and debug. A recursive CTE handles problems like date ranges or tree structures that plain SQL can't express.

### 5. Real-Time Scenario

A support manager wants a daily report of new tickets for the last month, including quiet days. A query grouping by date would leave those days out entirely. The recursive CTE first builds every date, then counts tickets on each.

### 6. Interview Questions

- **Theory:** What is a CTE, and how does it differ from a subquery?
- **Theory:** How does a recursive CTE work?
- **Practical:** Write a query showing each agent's workload.

### 7. Project-Based Answers

**CTE versus subquery?**
They often produce the same plan, but a CTE has a name, can be referenced several times, and reads from top to bottom. My workload example names "active tickets" first, then groups them.

**How does a recursive CTE work?**
It has a starting part, then `UNION ALL` with a part that refers to the CTE itself. PostgreSQL repeats that part on the newest rows until it returns nothing. My example stops at the end date.

**Write the workload query.**
A CTE selects unresolved, assigned tickets, then I join `users` for names, and group by agent, with `COUNT(*) FILTER (WHERE priority = 'high')` for high-priority counts.

### 8. Follow-up Questions

- **Can a recursive CTE run forever?** Yes, if its condition never stops it, so always include a limit.
- **Are CTEs slower?** In current PostgreSQL versions, simple CTEs are usually merged into the main query. `MATERIALIZED` forces them to run separately.
- **What does `DISTINCT ON` do?** It keeps the first row for each value, after sorting. I used it to get each customer's latest comment.

---

## Functions, Triggers and Stored Procedures

### 1. Concept Explanation

These all run code inside the database:

| Kind | Called with | Returns a value? | Typical use |
|---|---|---|---|
| Function | `SELECT my_function()` | Yes | Calculations and reusable queries |
| Trigger function | Automatically, on `INSERT`, `UPDATE` or `DELETE` | Changes the row | Keeping columns consistent, audit logs |
| Procedure | `CALL my_procedure()` | No | Multi-step operations |

PL/pgSQL is PostgreSQL's procedural language, with variables, `IF` and error handling.

### 2. Project Implementation

`stored-procedures.sql` creates three things:
1. A function returning ticket counts, like MiniDesk's dashboard query.
2. A trigger that sets `updated_at` automatically. The original app did this in its `UPDATE` query instead.
3. A procedure that assigns a ticket, and rejects anyone who isn't an agent.

### 3. Code Reference

**File:** [examples/postgresql/stored-procedures.sql](stored-procedures.sql)

```sql
RETURNS TABLE (total BIGINT, open BIGINT, in_progress BIGINT, resolved BIGINT)
```

```sql
NEW.updated_at := now(); -- NEW is the row as it will be saved
```

```sql
RAISE EXCEPTION 'User % is not an agent', p_agent_id;
```

- A trigger function can change `NEW` before the row is saved.
- `RAISE EXCEPTION` stops the operation with an error, like throwing `AppError` in MiniDesk's services.

### 4. Why Use It

Logic in the database applies however the data is changed, whether through the app, a script or a manual fix. A trigger can't be forgotten the way an `updated_at = now()` in application code can.

### 5. Real-Time Scenario

An admin fixes a ticket's title directly in pgAdmin. With the trigger, `updated_at` still changes, so the ticket shows as recently updated. Without it, only changes made through MiniDesk's API would update the time.

### 6. Interview Questions

- **Theory:** What's the difference between a function and a stored procedure?
- **Theory:** What is a trigger?
- **Theory:** Should business logic live in the database or the application?
- **Practical:** Why didn't the original MiniDesk use stored procedures?

### 7. Project-Based Answers

**Function versus procedure?**
A function returns a value and can be used inside a query. A procedure is called with `CALL`, returns nothing, and can manage transactions.

**What is a trigger?**
A function that runs automatically when rows change. My example updates `updated_at` before every ticket update.

**Database or application?**
It's a trade-off. In the database, rules apply to every client and data travels less. In the application, logic is easier to test and version, and to understand for developers who don't know SQL deeply.

**Why didn't the original MiniDesk use them?**
Its rules depend on who's signed in, which the app already knows, so they're simplest in TypeScript services, with tests. A trigger for `updated_at` would be a reasonable improvement.

### 8. Follow-up Questions

- **What does `STABLE` mean on a function?** It promises the function only reads data, which lets PostgreSQL optimize calls.
- **What's the difference between `BEFORE` and `AFTER` triggers?** `BEFORE` can change the row before it's saved. `AFTER` sees the saved row, which suits logging.
- **How are database functions versioned?** Through migration files in source control, the same as schema changes.
