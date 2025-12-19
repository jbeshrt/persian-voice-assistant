-- Persian Voice Payment Assistant Database Schema

CREATE TABLE IF NOT EXISTS payments (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
  card_number TEXT NOT NULL,           -- Last 4 digits only
  amount REAL NOT NULL,
  currency TEXT DEFAULT 'IRR',          -- Iranian Rial
  payment_type TEXT DEFAULT 'online',   -- online, in-person, etc.
  voice_transcript TEXT,                -- What user said
  session_id TEXT,                      -- For tracking conversation sessions
  status TEXT DEFAULT 'logged',         -- logged, processed, failed
  metadata TEXT                         -- JSON for additional data
);

CREATE INDEX IF NOT EXISTS idx_timestamp ON payments(timestamp);
CREATE INDEX IF NOT EXISTS idx_session ON payments(session_id);
CREATE INDEX IF NOT EXISTS idx_status ON payments(status);
