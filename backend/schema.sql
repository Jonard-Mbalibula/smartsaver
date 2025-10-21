-- SmartSaver Database Schema

CREATE TABLE IF NOT EXISTS users (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(120) NOT NULL,
  email VARCHAR(160) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role ENUM('admin','member') NOT NULL DEFAULT 'member',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Seed admin if none exists (email: admin@local, password to be set manually)
INSERT INTO users (name, email, password_hash, role)
SELECT 'Admin', 'admin@local', '$2b$10$K9jvLwN0n2nWmG3p6m6GJe9t1hZcP0yCzK6p6o4E0QwK1tTt0p7eG', 'admin'
WHERE NOT EXISTS (SELECT 1 FROM users);

CREATE TABLE IF NOT EXISTS settings (
  id INT PRIMARY KEY AUTO_INCREMENT,
  interest_rate DECIMAL(5,4) NOT NULL DEFAULT 0.10
);

INSERT INTO settings (interest_rate) SELECT 0.10 WHERE NOT EXISTS (SELECT 1 FROM settings);

CREATE TABLE IF NOT EXISTS members (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(120) NOT NULL,
  email VARCHAR(160),
  phone VARCHAR(40),
  joining_date DATE NOT NULL
);

CREATE TABLE IF NOT EXISTS contributions (
  id INT PRIMARY KEY AUTO_INCREMENT,
  member_id INT NOT NULL,
  amount DECIMAL(12,2) NOT NULL,
  date DATE NOT NULL,
  cycle VARCHAR(40),
  FOREIGN KEY (member_id) REFERENCES members(id) ON DELETE CASCADE,
  INDEX idx_contrib_member_date (member_id, date)
);

CREATE TABLE IF NOT EXISTS loans (
  id INT PRIMARY KEY AUTO_INCREMENT,
  member_id INT NOT NULL,
  principal DECIMAL(12,2) NOT NULL,
  interest_rate DECIMAL(5,4) NOT NULL DEFAULT 0.10,
  interest DECIMAL(12,2) NOT NULL,
  total_payable DECIMAL(12,2) NOT NULL,
  status ENUM('pending','approved','rejected') NOT NULL DEFAULT 'pending',
  due_date DATE NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (member_id) REFERENCES members(id) ON DELETE CASCADE,
  INDEX idx_loans_member_status (member_id, status)
);

CREATE TABLE IF NOT EXISTS repayments (
  id INT PRIMARY KEY AUTO_INCREMENT,
  loan_id INT NOT NULL,
  amount DECIMAL(12,2) NOT NULL,
  date DATE NOT NULL,
  FOREIGN KEY (loan_id) REFERENCES loans(id) ON DELETE CASCADE,
  INDEX idx_repayments_loan_date (loan_id, date)
);





