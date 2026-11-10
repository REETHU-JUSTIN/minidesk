-- Functions, triggers and stored procedures on the MiniDesk schema.
-- Run against a database with database/schema.sql and seed.sql loaded:
--   psql -h localhost -p 5433 -U postgres -d minidesk -f examples/postgresql/stored-procedures.sql
-- Everything is created in a separate "examples" schema and removed at the end,
-- so the MiniDesk tables are left unchanged.

CREATE SCHEMA IF NOT EXISTS examples;

\echo '1. A function that returns a table'
-- Like MiniDesk's dashboard query, but stored in the database and called by name.
-- STABLE tells PostgreSQL the function only reads data.
CREATE OR REPLACE FUNCTION examples.ticket_counts(p_customer_id INTEGER DEFAULT NULL)
RETURNS TABLE (total BIGINT, open BIGINT, in_progress BIGINT, resolved BIGINT)
LANGUAGE sql
STABLE
AS $$
  SELECT COUNT(*),
         COUNT(*) FILTER (WHERE status = 'open'),
         COUNT(*) FILTER (WHERE status = 'in_progress'),
         COUNT(*) FILTER (WHERE status = 'resolved')
  FROM tickets
  WHERE p_customer_id IS NULL OR customer_id = p_customer_id;
$$;

SELECT 'everyone' AS scope, * FROM examples.ticket_counts()
UNION ALL
SELECT 'customer 4', * FROM examples.ticket_counts(4);

\echo '2. A trigger that keeps updated_at current'
-- MiniDesk sets updated_at in its UPDATE queries. A trigger would do it automatically,
-- even for updates made outside the app.
CREATE OR REPLACE FUNCTION examples.set_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at := now(); -- NEW is the row as it will be saved
  RETURN NEW;
END;
$$;

CREATE TRIGGER example_set_updated_at
BEFORE UPDATE ON tickets
FOR EACH ROW
EXECUTE FUNCTION examples.set_updated_at();

BEGIN;
UPDATE tickets SET title = 'Updated by the trigger example' WHERE id = 1002;
SELECT id, title, updated_at > created_at AS updated_at_moved FROM tickets WHERE id = 1002;
ROLLBACK;

\echo '3. A procedure with checks and a clear error'
-- Procedures are called with CALL and don't return a value. RAISE EXCEPTION stops
-- the work and reports an error, like throwing AppError in MiniDesk's services.
CREATE OR REPLACE PROCEDURE examples.assign_ticket(p_ticket_id INTEGER, p_agent_id INTEGER)
LANGUAGE plpgsql
AS $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM users WHERE id = p_agent_id AND role = 'agent') THEN
    RAISE EXCEPTION 'User % is not an agent', p_agent_id;
  END IF;

  UPDATE tickets SET assigned_agent_id = p_agent_id WHERE id = p_ticket_id;

  -- FOUND is true if the last statement affected any rows.
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Ticket % does not exist', p_ticket_id;
  END IF;
END;
$$;

BEGIN;
CALL examples.assign_ticket(1007, 3);
SELECT t.id, u.name AS assigned_to FROM tickets t JOIN users u ON u.id = t.assigned_agent_id WHERE t.id = 1007;
ROLLBACK;

\echo 'Assigning to a customer should fail with a clear message:'
DO $$
BEGIN
  CALL examples.assign_ticket(1007, 4);
EXCEPTION WHEN OTHERS THEN
  RAISE NOTICE 'Caught error: %', SQLERRM;
END;
$$;

\echo 'Removing the examples'
DROP TRIGGER example_set_updated_at ON tickets;
DROP SCHEMA examples CASCADE;
