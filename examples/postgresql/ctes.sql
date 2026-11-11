-- Common table expressions (CTEs) on the MiniDesk schema.
-- Run against a database with schema.sql and seed.sql from this folder loaded:
--   psql -h localhost -p 5433 -U postgres -d minidesk -f examples/postgresql/ctes.sql
-- Only the last example changes data, and it's rolled back.

\echo '1. Each agent''s workload'
-- WITH names a query's result, so the main query can use it like a table.
-- This is easier to read than a subquery nested inside another query.
WITH active_tickets AS (
  SELECT assigned_agent_id, priority
  FROM tickets
  WHERE status <> 'resolved' AND assigned_agent_id IS NOT NULL
)
SELECT u.name AS agent,
       COUNT(*) AS active,
       COUNT(*) FILTER (WHERE a.priority = 'high') AS high_priority
FROM active_tickets a
JOIN users u ON u.id = a.assigned_agent_id
GROUP BY u.name
ORDER BY active DESC, agent;

\echo '2. Several CTEs: customers with open tickets, and their latest comment'
WITH open_counts AS (
  SELECT customer_id, COUNT(*) AS open_tickets
  FROM tickets
  WHERE status = 'open'
  GROUP BY customer_id
),
latest_comment AS (
  -- DISTINCT ON keeps the first row for each customer, after sorting newest first.
  SELECT DISTINCT ON (t.customer_id) t.customer_id, c.message, c.created_at
  FROM comments c
  JOIN tickets t ON t.id = c.ticket_id
  ORDER BY t.customer_id, c.created_at DESC
)
SELECT u.name AS customer,
       oc.open_tickets,
       COALESCE(lc.message, '(no comments)') AS latest_comment
FROM open_counts oc
JOIN users u ON u.id = oc.customer_id
LEFT JOIN latest_comment lc ON lc.customer_id = oc.customer_id
ORDER BY u.name;

\echo '3. Recursive CTE: tickets created each day, including days with none'
-- A recursive CTE has a starting row, then a part that refers to itself, repeated until it
-- stops producing rows. Here it builds a list of dates, so days with no tickets still appear.
WITH RECURSIVE days AS (
  SELECT DATE '2026-10-22' AS day
  UNION ALL
  SELECT day + 1 FROM days WHERE day < DATE '2026-10-31'
)
SELECT d.day, COUNT(t.id) AS tickets_created
FROM days d
LEFT JOIN tickets t ON t.created_at::date = d.day
GROUP BY d.day
ORDER BY d.day;

\echo '4. A CTE that changes data: resolve tickets, and report what changed'
-- RETURNING passes the changed rows to the next query in the same statement.
BEGIN;
WITH resolved AS (
  UPDATE tickets
  SET status = 'resolved', updated_at = now()
  WHERE status = 'in_progress' AND priority = 'high'
  RETURNING id, title
)
SELECT id, title FROM resolved ORDER BY id;
ROLLBACK; -- undoes the change, so the example can be run again
