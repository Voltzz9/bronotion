DO $$
DECLARE
    alice_id UUID;
    bob_id UUID;
    charlie_id UUID;
BEGIN
    -- Ensure UUID extension is available for UUIDs
    CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

    -- Insert mock users and store their IDs
    INSERT INTO "User" (id, name, username, password_hash, email, "emailVerified", image)
    VALUES
        (uuid_generate_v4(), 'Alice Smith', 'alice_smith', '$2b$12$e.gO4Wg6IvR1ZAl/Fr8Uuey4BfV6gi3EYuk/JOnUNy6Br1ZeF59ye', 'alice@example.com', NOW(), 'https://example.com/images/alice.jpg')
    RETURNING id INTO alice_id;

    INSERT INTO "User" (id, name, username, password_hash, email, "emailVerified", image)
    VALUES
        (uuid_generate_v4(), 'Bob Johnson', 'bob_johnson', '$2b$12$e.gO4Wg6IvR1ZAl/Fr8Uuey4BfV6gi3EYuk/JOnUNy6Br1ZeF59ye', 'bob@example.com', NULL, 'https://example.com/images/bob.jpg')
    RETURNING id INTO bob_id;

    INSERT INTO "User" (id, name, username, password_hash, email, "emailVerified", image)
    VALUES
        (uuid_generate_v4(), 'Charlie Brown', 'charlie_brown', '$2b$12$e.gO4Wg6IvR1ZAl/Fr8Uuey4BfV6gi3EYuk/JOnUNy6Br1ZeF59ye', 'charlie@example.com', NOW(), 'https://example.com/images/charlie.jpg')
    RETURNING id INTO charlie_id;

    -- Insert mock user authentication methods
    INSERT INTO "UserAuthMethod" ("user_id", "isOAuth", "isManual")
    VALUES
        (alice_id::text, TRUE, FALSE),
        (bob_id::text, FALSE, TRUE),
        (charlie_id::text, TRUE, TRUE);

    -- Insert mock accounts
    INSERT INTO "Account" ("user_id", "type", "provider", "provider_account_id", "refresh_token", "access_token", "expires_at", "token_type", "scope", "id_token", "session_state", "oauth_token_secret", "oauth_token")
    VALUES
        (alice_id::text, 'oauth', 'google', 'google-provider-account', 'refresh_token_1', 'access_token_1', NULL, 'Bearer', NULL, NULL, NULL, NULL, NULL),
        (bob_id::text, 'oauth', 'github', 'github-provider-account', 'refresh_token_2', 'access_token_2', NULL, 'Bearer', NULL, NULL, NULL, NULL, NULL),
        (charlie_id::text, 'manual', 'email', 'email-provider-account', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL);

    -- Insert mock sessions
    INSERT INTO "Session" ("user_id", "expires", "sessionToken")
    VALUES
        (alice_id::text, NOW() + INTERVAL '2 hours', 'session-token-alice'),
        (bob_id::text, NOW() + INTERVAL '2 hours', 'session-token-bob'),
        (charlie_id::text, NOW() + INTERVAL '2 hours', 'session-token-charlie');

    -- Insert mock verification tokens
    INSERT INTO "VerificationToken" ("identifier", "expires", "token")
    VALUES
        ('alice@example.com', NOW() + INTERVAL '1 day', 'verification-token-alice'),
        ('bob@example.com', NOW() + INTERVAL '1 day', 'verification-token-bob'),
        ('charlie@example.com', NOW() + INTERVAL '1 day', 'verification-token-charlie');

    -- Insert mock tags with updated_at
    INSERT INTO "Tag" ("name", "updated_at")
    VALUES
        ('Important', NOW()),
        ('Urgent', NOW()),
        ('Personal', NOW()),
        ('Work', NOW()),
        ('Ideas', NOW());

    -- Insert mock notes
    INSERT INTO "Note" ("title", "content", "user_id", "updated_at")
    VALUES
        ('Meeting Notes', 'Notes from the team meeting.', alice_id::text, NOW()),
        ('Project Plan', 'Plan for the new project.', bob_id::text, NOW()),
        ('Grocery List', 'Eggs, Milk, Bread', charlie_id::text, NOW());

    -- Insert mock note-tag relationships
    INSERT INTO "NoteTag" ("note_id", "tag_id")
    VALUES
        (1, 1),  -- Meeting Notes - Important
        (1, 4),  -- Meeting Notes - Work
        (2, 2),  -- Project Plan - Urgent
        (3, 3);  -- Grocery List - Personal

    -- Insert mock shared notes
    INSERT INTO "SharedNote" ("note_id", "shared_with_user_id", "can_edit")
    VALUES
        (1, bob_id::text, TRUE),  -- Meeting Notes shared with Bob
        (2, charlie_id::text, FALSE);  -- Project Plan shared with Charlie

    -- Insert mock active editors
    INSERT INTO "ActiveEditor" ("note_id", "user_id")
    VALUES
        (1, bob_id::text),  -- Bob is editing Meeting Notes
        (2, charlie_id::text);  -- Charlie is editing Project Plan

END $$;
