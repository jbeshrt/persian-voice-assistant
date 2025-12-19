-- Persian Voice Payment Assistant Database Schema

-- Users table for token-based authentication
CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  token TEXT UNIQUE NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  last_active DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Cards table for saved payment cards
CREATE TABLE IF NOT EXISTS cards (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  card_number TEXT NOT NULL,
  cvv2 TEXT NOT NULL,
  expire_month TEXT NOT NULL,
  expire_year TEXT NOT NULL,
  card_name TEXT,
  is_default INTEGER DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Payments table with user and card reference
CREATE TABLE IF NOT EXISTS payments (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  card_id INTEGER,
  timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
  card_number TEXT NOT NULL,           -- Last 4 digits only
  amount REAL NOT NULL,
  currency TEXT DEFAULT 'IRR',          -- Iranian Rial
  payment_type TEXT DEFAULT 'online',   -- online, in-person, etc.
  voice_transcript TEXT,                -- What user said
  session_id TEXT,                      -- For tracking conversation sessions
  status TEXT DEFAULT 'logged',         -- logged, processed, failed
  metadata TEXT,                        -- JSON for additional data
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (card_id) REFERENCES cards(id)
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_users_token ON users(token);
CREATE INDEX IF NOT EXISTS idx_cards_user_id ON cards(user_id);
CREATE INDEX IF NOT EXISTS idx_payments_user_id ON payments(user_id);
CREATE INDEX IF NOT EXISTS idx_payments_card_id ON payments(card_id);
CREATE INDEX IF NOT EXISTS idx_timestamp ON payments(timestamp);
CREATE INDEX IF NOT EXISTS idx_session ON payments(session_id);
CREATE INDEX IF NOT EXISTS idx_status ON payments(status);
