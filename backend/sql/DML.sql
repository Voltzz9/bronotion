DO $$
DECLARE
    new_user_id INTEGER;
BEGIN
    -- User 1
    INSERT INTO users (username, email, avatar_url, is_OAuth, is_Manual)
    VALUES ('admin', 'admin@example.com', 'https://avatars.githubusercontent.com/u/91885586?v=4', FALSE, TRUE)
    RETURNING user_id INTO new_user_id;

    INSERT INTO manual_users (user_id, password_hash)
    VALUES (new_user_id, crypt('admin', gen_salt('bf')));

    -- User 2
    INSERT INTO users (username, email, avatar_url, is_OAuth, is_Manual)
    VALUES ('jane_doe', 'jane.doe@example.com', NULL, FALSE, TRUE)
    RETURNING user_id INTO new_user_id;

    INSERT INTO manual_users (user_id, password_hash)
    VALUES (new_user_id, crypt('jane_password', gen_salt('bf')));

    -- User 3
    INSERT INTO users (username, email, avatar_url, is_OAuth, is_Manual)
    VALUES ('john_smith', 'john.smith@example.com', NULL, FALSE, TRUE)
    RETURNING user_id INTO new_user_id;

    INSERT INTO manual_users (user_id, password_hash)
    VALUES (new_user_id, crypt('john_password', gen_salt('bf')));
END $$;
