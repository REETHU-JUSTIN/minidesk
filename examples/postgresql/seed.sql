-- Sample data for LOCAL DEVELOPMENT ONLY. Never run this on a deployed database.
--
-- Every sample account has the password: MiniDesk-Demo-2026
-- The value below is a bcrypt hash of that public demo password.
-- It is safe to publish only because these accounts exist on your own machine.

-- OVERRIDING SYSTEM VALUE lets us choose the IDs ourselves, so the sample data is predictable.
INSERT INTO users (id, name, email, password_hash, role, created_at) OVERRIDING SYSTEM VALUE VALUES
  (1, 'Alex Morgan', 'admin@example.com', '$2b$10$p5GKUXn1TdPK/K/ORFiXGuzmmAgMbMNikxYe/eG7B2xXIHy8dI81y', 'admin', '2026-09-01T12:00:00Z'),
  (2, 'Sam Carter', 'sam@example.com', '$2b$10$p5GKUXn1TdPK/K/ORFiXGuzmmAgMbMNikxYe/eG7B2xXIHy8dI81y', 'agent', '2026-09-03T12:00:00Z'),
  (3, 'Maya Lee', 'maya@example.com', '$2b$10$p5GKUXn1TdPK/K/ORFiXGuzmmAgMbMNikxYe/eG7B2xXIHy8dI81y', 'agent', '2026-09-08T12:00:00Z'),
  (4, 'Priya Nair', 'priya@example.com', '$2b$10$p5GKUXn1TdPK/K/ORFiXGuzmmAgMbMNikxYe/eG7B2xXIHy8dI81y', 'customer', '2026-10-02T12:00:00Z'),
  (5, 'Liam Walsh', 'liam@example.com', '$2b$10$p5GKUXn1TdPK/K/ORFiXGuzmmAgMbMNikxYe/eG7B2xXIHy8dI81y', 'customer', '2026-10-09T12:00:00Z'),
  (6, 'Noah Kim', 'noah@example.com', '$2b$10$p5GKUXn1TdPK/K/ORFiXGuzmmAgMbMNikxYe/eG7B2xXIHy8dI81y', 'customer', '2026-10-15T12:00:00Z');

INSERT INTO tickets (id, title, description, category, priority, status, customer_id, assigned_agent_id, created_at, updated_at) OVERRIDING SYSTEM VALUE VALUES
  (1001, 'Update the email on my account', 'Please change my account email to my new work address.', 'general', 'low', 'resolved', 5, 3, '2026-10-22T12:00:00Z', '2026-10-23T12:00:00Z'),
  (1002, 'Export to CSV is missing a column', 'The exported file no longer includes the project name column.', 'technical', 'low', 'open', 4, NULL, '2026-10-24T12:00:00Z', '2026-10-24T12:00:00Z'),
  (1003, 'Charged twice for the same month', 'My bank statement shows two identical charges for October.', 'billing', 'high', 'in_progress', 6, 2, '2026-10-26T12:00:00Z', '2026-10-27T12:00:00Z'),
  (1004, 'Team member cannot accept invitation', 'My colleague gets an error page when opening the invitation link.', 'account', 'medium', 'in_progress', 5, 3, '2026-10-28T12:00:00Z', '2026-10-29T12:00:00Z'),
  (1005, 'How do I change my billing address?', 'I moved recently and need to update the address on my invoices.', 'billing', 'low', 'resolved', 6, 2, '2026-10-30T12:00:00Z', '2026-10-31T12:00:00Z'),
  (1006, 'App crashes when uploading a file', 'The app closes without an error message whenever I try to attach a file to a project. I have tried two browsers and see the same result.', 'technical', 'high', 'in_progress', 4, 3, '2026-11-01T12:00:00Z', '2026-11-01T15:40:00Z'),
  (1007, 'Password reset link has expired', 'The reset link in my email says it has expired, even though I just requested it.', 'account', 'medium', 'open', 5, NULL, '2026-11-02T12:00:00Z', '2026-11-02T12:00:00Z'),
  (1008, 'Cannot download my March invoice', 'The download button on the billing page does nothing when I click it.', 'billing', 'high', 'open', 4, 2, '2026-11-03T12:00:00Z', '2026-11-03T12:00:00Z');

INSERT INTO comments (id, ticket_id, user_id, message, created_at) OVERRIDING SYSTEM VALUE VALUES
  (1, 1006, 4, 'It happens every time I upload a PDF larger than 5 MB.', '2026-11-01T12:12:00Z'),
  (2, 1006, 3, 'Thanks, Priya. I can reproduce this and I am looking into it now.', '2026-11-01T15:40:00Z');

-- We chose the IDs above, so tell each ID counter where to continue from.
SELECT setval(pg_get_serial_sequence('users', 'id'), (SELECT MAX(id) FROM users));
SELECT setval(pg_get_serial_sequence('tickets', 'id'), (SELECT MAX(id) FROM tickets));
SELECT setval(pg_get_serial_sequence('comments', 'id'), (SELECT MAX(id) FROM comments));
