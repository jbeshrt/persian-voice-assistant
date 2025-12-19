-- Persian Voice Payment Assistant Database Schema

-- Users table for token-based authentication
CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  token TEXT UNIQUE NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  last_active DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Payments table with user reference
CREATE TABLE IF NOT EXISTS payments (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
  card_number TEXT NOT NULL,           -- Last 4 digits only
  amount REAL NOT NULL,
  currency TEXT DEFAULT 'IRR',          -- Iranian Rial
  payment_type TEXT DEFAULT 'online',   -- online, in-person, etc.
  voice_transcript TEXT,                -- What user said
  session_id TEXT,                      -- For tracking conversation sessions
  status TEXT DEFAULT 'logged',         -- logged, processed, failed
  metadata TEXT,                        -- JSON for additional data
  FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_users_token ON users(token);
CREATE INDEX IF NOT EXISTS idx_payments_user_id ON payments(user_id);
CREATE INDEX IF NOT EXISTS idx_timestamp ON payments(timestamp);
CREATE INDEX IF NOT EXISTS idx_session ON payments(session_id);
CREATE INDEX IF NOT EXISTS idx_status ON payments(status);
