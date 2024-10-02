DO $$
DECLARE
    new_user_id INTEGER;
BEGIN
   -- Populate users table
INSERT INTO users (name, username, email, "emailVerified", image) VALUES
('John Doe', 'johnd', 'john@example.com', '2023-01-01 10:00:00+00', 'https://example.com/john.jpg'),
('Jane Smith', 'janes', 'jane@example.com', '2023-01-02 11:00:00+00', 'https://example.com/jane.jpg'),
('Bob Johnson', 'bobj', 'bob@example.com', '2023-01-03 12:00:00+00', 'https://example.com/bob.jpg');

-- Populate user_auth_methods table
INSERT INTO user_auth_methods (user_id, "isOAuth", "isManual") VALUES
(1, false, true),
(2, true, false),
(3, false, true);

-- Populate accounts table
INSERT INTO accounts ("userId", type, provider, "providerAccountId", refresh_token, access_token, expires_at, token_type, scope, id_token, session_state) VALUES
(2, 'oauth', 'google', '12345', 'refresh_token_1', 'access_token_1', 1672531200, 'bearer', 'email profile', 'id_token_1', 'active');

-- Populate sessions table
INSERT INTO sessions ("userId", expires, "sessionToken") VALUES
(1, '2024-01-01 00:00:00+00', 'session_token_1'),
(2, '2024-01-02 00:00:00+00', 'session_token_2'),
(3, '2024-01-03 00:00:00+00', 'session_token_3');

-- Populate verification_token table
INSERT INTO verification_token (identifier, expires, token) VALUES
('john@example.com', '2023-12-31 23:59:59+00', 'verification_token_1'),
('jane@example.com', '2023-12-31 23:59:59+00', 'verification_token_2');

-- Populate tags table
INSERT INTO tags (name) VALUES
('work'),
('personal'),
('ideas');

-- Populate notes table
INSERT INTO notes (title, content, user_id) VALUES
('Meeting Notes', 'Discussed project timeline and goals', 1),
('Shopping List', 'Milk, eggs, bread', 2),
('Project Idea', 'App for tracking daily habits', 3);

-- Populate note_tags table
INSERT INTO note_tags (note_id, tag_id) VALUES
(1, 1), -- Meeting Notes - work
(2, 2), -- Shopping List - personal
(3, 3); -- Project Idea - ideas

-- Populate shared_notes table
INSERT INTO shared_notes (note_id, shared_with_user_id, can_edit) VALUES
(1, 2, false), -- John shared Meeting Notes with Jane (read-only)
(3, 1, true);  -- Bob shared Project Idea with John (can edit)

-- Populate active_editors table
INSERT INTO active_editors (note_id, user_id) VALUES
(1, 1), -- John editing Meeting Notes
(3, 3); -- Bob editing Project Idea
END $$;
