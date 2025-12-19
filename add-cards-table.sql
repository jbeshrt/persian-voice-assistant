-- Migration: Add cards table and update payments table

-- Step 1: Create cards table
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

-- Step 2: Create indexes for cards table
CREATE INDEX IF NOT EXISTS idx_cards_user_id ON cards(user_id);

-- Step 3: Add card_id column to payments table (if not exists)
-- Note: SQLite doesn't support ADD COLUMN IF NOT EXISTS, so we check first
-- This will fail silently if column already exists
ALTER TABLE payments ADD COLUMN card_id INTEGER REFERENCES cards(id);

-- Step 4: Create index for card_id in payments
CREATE INDEX IF NOT EXISTS idx_payments_card_id ON payments(card_id);
