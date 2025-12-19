-- Migration: Add users table and update payments table
-- Step 1: Create users table
CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  token TEXT UNIQUE NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  last_active DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Step 2: Create new payments table with user_id
CREATE TABLE IF NOT EXISTS payments_new (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
  card_number TEXT NOT NULL,
  amount REAL NOT NULL,
  currency TEXT DEFAULT 'IRR',
  payment_type TEXT DEFAULT 'online',
  voice_transcript TEXT,
  session_id TEXT,
  status TEXT DEFAULT 'logged',
  metadata TEXT,
  FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Step 3: Create a default user for existing payments
INSERT OR IGNORE INTO users (token) VALUES ('DEFAULT000000001');

-- Step 4: Migrate existing data (if any)
INSERT INTO payments_new (user_id, timestamp, card_number, amount, currency, payment_type, voice_transcript, session_id, status, metadata)
SELECT 
  (SELECT id FROM users WHERE token = 'DEFAULT000000001'),
  timestamp, card_number, amount, currency, payment_type, voice_transcript, session_id, status, metadata
FROM payments;

-- Step 5: Drop old table
DROP TABLE payments;

-- Step 6: Rename new table
ALTER TABLE payments_new RENAME TO payments;

-- Step 7: Create indexes
CREATE INDEX IF NOT EXISTS idx_users_token ON users(token);
CREATE INDEX IF NOT EXISTS idx_payments_user_id ON payments(user_id);
CREATE INDEX IF NOT EXISTS idx_timestamp ON payments(timestamp);
CREATE INDEX IF NOT EXISTS idx_session ON payments(session_id);
CREATE INDEX IF NOT EXISTS idx_status ON payments(status);
