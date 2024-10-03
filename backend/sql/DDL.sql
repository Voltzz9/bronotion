-- Users table
CREATE TABLE "User" (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255),
  username VARCHAR(255),
  email VARCHAR(255) UNIQUE,
  password_hash VARCHAR(255),
  "emailVerified" TIMESTAMPTZ,
  image TEXT
);

-- User Authentication Methods table
CREATE TABLE "UserAuthMethod" (
  user_id INTEGER PRIMARY KEY,
  "isOAuth" BOOLEAN DEFAULT FALSE,
  "isManual" BOOLEAN DEFAULT TRUE,
  FOREIGN KEY (user_id) REFERENCES "User"(id) ON DELETE CASCADE
);

-- Accounts table
CREATE TABLE "Account" (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL,
  type VARCHAR(255) NOT NULL,
  provider VARCHAR(255) NOT NULL,
  provider_account_id VARCHAR(255) NOT NULL,
  refresh_token TEXT,
  access_token TEXT,
  expires_at BIGINT,
  token_type TEXT,
  scope TEXT,
  id_token TEXT,
  session_state TEXT,
  oauth_token_secret TEXT,
  oauth_token TEXT,
  FOREIGN KEY (user_id) REFERENCES "User"(id) ON DELETE CASCADE,
  UNIQUE(provider, provider_account_id)
);

-- Sessions table
CREATE TABLE "Session" (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL,
  expires TIMESTAMPTZ NOT NULL,
  session_token VARCHAR(255) NOT NULL UNIQUE,
  FOREIGN KEY (user_id) REFERENCES "User"(id) ON DELETE CASCADE
);

-- Verification token table
CREATE TABLE "VerificationToken" (
  identifier TEXT NOT NULL,
  expires TIMESTAMPTZ NOT NULL,
  token TEXT NOT NULL,
  PRIMARY KEY (identifier, token)
);

-- Tags table
CREATE TABLE "Tag" (
  tag_id SERIAL PRIMARY KEY,
  name VARCHAR(50) NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Notes table
CREATE TABLE "Note" (
  note_id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  content TEXT,
  user_id INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  is_deleted BOOLEAN NOT NULL DEFAULT FALSE,
  FOREIGN KEY (user_id) REFERENCES "User"(id) ON DELETE CASCADE
);

-- Note Tags table
CREATE TABLE "NoteTag" (
  note_id INTEGER NOT NULL,
  tag_id INTEGER NOT NULL,
  PRIMARY KEY (note_id, tag_id),
  FOREIGN KEY (note_id) REFERENCES "Note"(note_id) ON DELETE CASCADE,
  FOREIGN KEY (tag_id) REFERENCES "Tag"(tag_id) ON DELETE CASCADE
);

-- Shared Notes table
CREATE TABLE "SharedNote" (
  shared_note_id SERIAL PRIMARY KEY,
  note_id INTEGER NOT NULL,
  shared_with_user_id INTEGER NOT NULL,
  can_edit BOOLEAN DEFAULT FALSE,
  shared_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (note_id) REFERENCES "Note"(note_id) ON DELETE CASCADE,
  FOREIGN KEY (shared_with_user_id) REFERENCES "User"(id) ON DELETE CASCADE,
  UNIQUE (note_id, shared_with_user_id)
);

-- Active Editors table
CREATE TABLE "ActiveEditor" (
  active_editor_id SERIAL PRIMARY KEY,
  note_id INTEGER NOT NULL,
  user_id INTEGER NOT NULL,
  last_active TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (note_id) REFERENCES "Note"(note_id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES "User"(id) ON DELETE CASCADE,
  UNIQUE (note_id, user_id)
);
