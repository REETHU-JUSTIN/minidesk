-- MiniDesk database schema.
-- WARNING: running this deletes the existing tables and all their data.

DROP TABLE IF EXISTS comments;
DROP TABLE IF EXISTS tickets;
DROP TABLE IF EXISTS users;

CREATE TABLE users (
  id            INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  name          TEXT NOT NULL CHECK (char_length(name) BETWEEN 2 AND 100),
  -- UNIQUE also creates an index, which makes finding a user by email fast.
  email         TEXT NOT NULL UNIQUE CHECK (email = lower(email)),
  password_hash TEXT NOT NULL,
  role          TEXT NOT NULL DEFAULT 'customer' CHECK (role IN ('admin', 'agent', 'customer')),
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE tickets (
  id                INTEGER GENERATED ALWAYS AS IDENTITY (START WITH 1001) PRIMARY KEY,
  title             TEXT NOT NULL CHECK (char_length(title) BETWEEN 5 AND 120),
  description       TEXT NOT NULL CHECK (char_length(description) BETWEEN 10 AND 5000),
  category          TEXT NOT NULL CHECK (category IN ('general', 'billing', 'technical', 'account')),
  priority          TEXT NOT NULL CHECK (priority IN ('low', 'medium', 'high')),
  status            TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'resolved')),
  -- RESTRICT: a customer who has tickets can't be deleted.
  customer_id       INTEGER NOT NULL REFERENCES users (id) ON DELETE RESTRICT,
  -- SET NULL: if an agent is deleted, their tickets simply become unassigned.
  assigned_agent_id INTEGER REFERENCES users (id) ON DELETE SET NULL,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE comments (
  id         INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  -- CASCADE: deleting a ticket also deletes its comments.
  ticket_id  INTEGER NOT NULL REFERENCES tickets (id) ON DELETE CASCADE,
  user_id    INTEGER NOT NULL REFERENCES users (id) ON DELETE RESTRICT,
  message    TEXT NOT NULL CHECK (char_length(message) BETWEEN 1 AND 2000),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indexes speed up the searches this app runs most often.
-- The cost is a little extra storage and slightly slower writes.
CREATE INDEX idx_tickets_status ON tickets (status);
CREATE INDEX idx_tickets_priority ON tickets (priority);
CREATE INDEX idx_tickets_customer_id ON tickets (customer_id);
CREATE INDEX idx_tickets_assigned_agent_id ON tickets (assigned_agent_id);
CREATE INDEX idx_tickets_created_at ON tickets (created_at DESC);
CREATE INDEX idx_comments_ticket_id ON comments (ticket_id);
