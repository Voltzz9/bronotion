-- Users table
CREATE TABLE users (
    user_id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    avatar_url VARCHAR(255),
    is_OAuth BOOLEAN DEFAULT FALSE,
    is_Manual BOOLEAN DEFAULT TRUE
);

-- Tags table
CREATE TABLE tags (
    tag_id SERIAL PRIMARY KEY,
    name VARCHAR(50) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT unique_tag_name UNIQUE (name)
);

-- Notes table
CREATE TABLE notes (
    note_id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    content TEXT,
    user_id INTEGER NOT NULL,
    tag_id INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    is_deleted BOOLEAN NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (tag_id) REFERENCES tags(tag_id) ON DELETE SET NULL 
);

-- Shared_notes table (for note sharing functionality)
CREATE TABLE shared_notes (
    shared_note_id SERIAL PRIMARY KEY,
    note_id INTEGER NOT NULL,
    shared_with_user_id INTEGER NOT NULL,
    can_edit BOOLEAN DEFAULT FALSE,
    shared_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (note_id) REFERENCES notes(note_id) ON DELETE CASCADE,
    FOREIGN KEY (shared_with_user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    UNIQUE (note_id, shared_with_user_id)
);

-- Active_editors table (for real-time collaboration)
CREATE TABLE active_editors (
    active_editor_id SERIAL PRIMARY KEY,
    note_id INTEGER NOT NULL,
    user_id INTEGER NOT NULL,
    last_active TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (note_id) REFERENCES notes(note_id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    UNIQUE (note_id, user_id)
);

-- OAuth Users table
CREATE TABLE oauth_users (
    oauth_user_id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL,
    provider VARCHAR(50) NOT NULL, -- e.g., 'google', 'facebook', etc.
    provider_user_id VARCHAR(100) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    UNIQUE (provider, provider_user_id)
);

-- Manual Users table
CREATE TABLE manual_users (
    manual_user_id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL,
    registration_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    password_hash VARCHAR(255) NOT NULL,  -- Store password hash for manual authentication
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);
