-- Real schema, written to run identically (with minor type syntax
-- differences) against SQLite (local dev, via node:sqlite) and Postgres
-- (production, e.g. Supabase). The swap point is lib/db/client.ts, which
-- picks the driver based on DATABASE_URL — this file is the source of truth
-- for both.

CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  email_verified_at TEXT,
  workspace_name TEXT NOT NULL,
  tier TEXT NOT NULL DEFAULT 'free',
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS sessions (
  id TEXT PRIMARY KEY,
  session_token TEXT UNIQUE NOT NULL,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  expires_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS verification_tokens (
  id TEXT PRIMARY KEY,
  token TEXT UNIQUE NOT NULL,
  purpose TEXT NOT NULL, -- 'email_verify' | 'password_reset'
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  expires_at TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS sources (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  provider TEXT NOT NULL, -- 'figma' | 'github'
  status TEXT NOT NULL DEFAULT 'connected',
  access_token TEXT,
  refresh_token TEXT,
  external_name TEXT,
  figma_file_key TEXT,   -- Figma: key from the file URL (/file/:key/...)
  github_repo TEXT,      -- GitHub: "owner/repo"
  token_expires_at TEXT, -- ISO datetime; NULL means non-expiring (GitHub PAT)
  connected_at TEXT NOT NULL DEFAULT (datetime('now')),
  UNIQUE(user_id, provider)
);

CREATE TABLE IF NOT EXISTS scans (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  report_json TEXT NOT NULL,
  scanned_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_scans_user_scanned ON scans(user_id, scanned_at);
CREATE INDEX IF NOT EXISTS idx_sessions_token ON sessions(session_token);
