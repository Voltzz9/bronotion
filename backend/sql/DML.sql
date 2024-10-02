DO $$
BEGIN
    -- Populate "User" table
    INSERT INTO "User" (name, username, password_hash, email, "emailVerified", image) VALUES
    ('John Doe', 'johnd', '$2a$12$eImiTXuWVxfM37uY4JANjQ==', 'john@example.com', '2023-01-01 10:00:00+00', 'https://example.com/john.jpg'),
    ('Jane Smith', 'janes', '$2a$12$KIXg8rf/8d5f8f8f8f8f8f==', 'jane@example.com', '2023-01-02 11:00:00+00', 'https://example.com/jane.jpg'),
    ('Bob Johnson', 'bobj', '$2a$12$7QJ8f8f8f8f8f8f8f8f8f==', 'bob@example.com', '2023-01-03 12:00:00+00', 'https://example.com/bob.jpg');

    -- Insert into "UserAuthMethod" table
    INSERT INTO "UserAuthMethod" (user_id, "isOAuth", "isManual") VALUES
    (1, false, true),
    (2, true, false),
    (3, false, true);
    
    -- Check if the above insertion was successful
    -- Populate "Account" table
    INSERT INTO "Account" ("user_id", type, provider, "provider_account_id", refresh_token, access_token, expires_at, token_type, scope, id_token, session_state) VALUES
    (2, 'oauth', 'google', '12345', 'refresh_token_1', 'access_token_1', 1672531200, 'bearer', 'email profile', 'id_token_1', 'active');

    -- Populate "Session" table
    INSERT INTO "Session" ("user_id", expires, "session_token") VALUES
    (1, '2024-01-01 00:00:00+00', 'session_token_1'),
    (2, '2024-01-02 00:00:00+00', 'session_token_2'),
    (3, '2024-01-03 00:00:00+00', 'session_token_3');

    -- Populate "VerificationToken" table
    INSERT INTO "VerificationToken" (identifier, expires, token) VALUES
    ('john@example.com', '2023-12-31 23:59:59+00', 'verification_token_1'),
    ('jane@example.com', '2023-12-31 23:59:59+00', 'verification_token_2');

    -- Populate "Tag" table
    INSERT INTO "Tag" (name) VALUES
    ('work'),
    ('personal'),
    ('ideas');

    -- Populate "Note" table
    INSERT INTO "Note" (title, content, "user_id", updated_at) VALUES
    ('Meeting Notes', 'Discussed project timeline and goals', 1, now()),
    ('Shopping List', 'Milk, eggs, bread', 2, now()),
    ('Project Idea', 'App for tracking daily habits', 3, now());

    -- Populate "NoteTag" table
    INSERT INTO "NoteTag" ("note_id", "tag_id") VALUES
    (1, 1), -- Meeting Notes - work
    (2, 2), -- Shopping List - personal
    (3, 3); -- Project Idea - ideas

    -- Populate "SharedNote" table
    INSERT INTO "SharedNote" ("note_id", "shared_with_user_id", "can_edit") VALUES
    (1, 2, false), -- John shared Meeting Notes with Jane (read-only)
    (3, 1, true);  -- Bob shared Project Idea with John (can edit)

    -- Populate "ActiveEditor" table
    INSERT INTO "ActiveEditor" ("note_id", "user_id") VALUES
    (1, 1), -- John editing Meeting Notes
    (3, 3); -- Bob editing Project Idea
END $$;
