-- SmartSaver PostgreSQL Schema for Vercel

-- Users table
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  name VARCHAR(120) NOT NULL,
  email VARCHAR(160) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role VARCHAR(20) NOT NULL DEFAULT 'member',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Settings table
CREATE TABLE IF NOT EXISTS settings (
  id SERIAL PRIMARY KEY,
  interest_rate DECIMAL(5,4) NOT NULL DEFAULT 0.10
);

-- Members table
CREATE TABLE IF NOT EXISTS members (
  id SERIAL PRIMARY KEY,
  name VARCHAR(120) NOT NULL,
  email VARCHAR(160),
  phone VARCHAR(40),
  joining_date DATE NOT NULL
);

-- Contributions table
CREATE TABLE IF NOT EXISTS contributions (
  id SERIAL PRIMARY KEY,
  member_id INTEGER NOT NULL REFERENCES members(id) ON DELETE CASCADE,
  amount DECIMAL(12,2) NOT NULL,
  date DATE NOT NULL,
  cycle VARCHAR(40)
);

-- Loans table
CREATE TABLE IF NOT EXISTS loans (
  id SERIAL PRIMARY KEY,
  member_id INTEGER NOT NULL REFERENCES members(id) ON DELETE CASCADE,
  principal DECIMAL(12,2) NOT NULL,
  interest_rate DECIMAL(5,4) NOT NULL DEFAULT 0.10,
  interest DECIMAL(12,2) NOT NULL,
  total_payable DECIMAL(12,2) NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'pending',
  due_date DATE NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Repayments table
CREATE TABLE IF NOT EXISTS repayments (
  id SERIAL PRIMARY KEY,
  loan_id INTEGER NOT NULL REFERENCES loans(id) ON DELETE CASCADE,
  amount DECIMAL(12,2) NOT NULL,
  date DATE NOT NULL
);

-- Insert default settings
INSERT INTO settings (interest_rate) VALUES (0.10) ON CONFLICT DO NOTHING;

-- Insert default admin user (password: Mbalibula@20)
INSERT INTO users (name, email, password_hash, role) 
VALUES ('Admin', 'mbalibulajonard@gmail.com', '$2b$10$K9jvLwN0n2nWmG3p6m6GJe9t1hZcP0yCzK6p6o4E0QwK1tTt0p7eG', 'admin')
ON CONFLICT (email) DO NOTHING;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_contrib_member_date ON contributions(member_id, date);
CREATE INDEX IF NOT EXISTS idx_loans_member_status ON loans(member_id, status);
CREATE INDEX IF NOT EXISTS idx_repayments_loan_date ON repayments(loan_id, date);
