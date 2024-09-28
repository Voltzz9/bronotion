DO $$
DECLARE
    admin_user_id INTEGER;
BEGIN
    -- First, insert into the users table
    INSERT INTO users (username, email, avatar_url, is_OAuth, is_Manual)
    VALUES ('admin', 'admin@example.com', NULL, FALSE, TRUE)
    RETURNING user_id INTO admin_user_id;

    -- Then, insert into the manual_users table with hashed password
    INSERT INTO manual_users (user_id, password_hash)
    VALUES (admin_user_id, crypt('admin', gen_salt('bf')));
END $$;
