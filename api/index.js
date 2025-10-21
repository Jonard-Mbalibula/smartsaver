import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import { Pool } from "pg";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const app = express();
const JWT_SECRET = process.env.JWT_SECRET || "dev_secret_change_me";

// PostgreSQL connection
const pool = new Pool({
  connectionString: process.env.POSTGRES_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

app.use(cors());
app.use(bodyParser.json());

// Mock data for development
const mockData = {
  members: [],
  contributions: [],
  loans: [],
  repayments: [],
  settings: { interest_rate: 0.10 }
};

// Auth middleware
const requireAuth = (req, res, next) => {
  const token = req.headers.authorization?.replace('Bearer ', '');
  if (!token) return res.status(401).json({ message: "No token provided" });
  
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({ message: "Invalid token" });
  }
};

// Database helper
const query = async (text, params) => {
  try {
    const result = await pool.query(text, params);
    return result;
  } catch (error) {
    console.error('Database error:', error);
    throw error;
  }
};

// Auth routes
app.post("/api/auth/login", async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ message: "email and password required" });
  
  try {
    const result = await query("SELECT * FROM users WHERE email = $1", [email]);
    const user = result.rows[0];
    
    if (!user) return res.status(401).json({ message: "Invalid credentials" });
    
    const validPassword = await bcrypt.compare(password, user.password_hash);
    if (!validPassword) return res.status(401).json({ message: "Invalid credentials" });
    
    const token = jwt.sign(
      { sub: user.id, role: user.role, name: user.name, email: user.email },
      JWT_SECRET,
      { expiresIn: "7d" }
    );
    
    res.json({
      token,
      user: { id: user.id, name: user.name, email: user.email, role: user.role }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: "Server error" });
  }
});

app.post("/api/auth/register", async (req, res) => {
  const { name, email, password, role } = req.body;
  if (!name || !email || !password) return res.status(400).json({ message: "name, email, password required" });
  
  try {
    const hash = await bcrypt.hash(password, 10);
    await query(
      "INSERT INTO users (name, email, password_hash, role) VALUES ($1, $2, $3, $4)",
      [name, email, hash, role || 'member']
    );
    res.json({ message: "Registered" });
  } catch (error) {
    if (error.code === '23505') {
      res.status(400).json({ message: "Email already exists" });
    } else {
      console.error('Registration error:', error);
      res.status(500).json({ message: "Server error" });
    }
  }
});

// Reports summary
app.get("/api/reports/summary", requireAuth, async (req, res) => {
  try {
    const contributionsResult = await query("SELECT COALESCE(SUM(amount), 0) AS total FROM contributions");
    const loansResult = await query("SELECT COALESCE(SUM(principal), 0) AS total FROM loans WHERE status = 'approved'");
    const interestResult = await query("SELECT COALESCE(SUM(interest), 0) AS total FROM loans WHERE status = 'approved'");
    const repaymentsResult = await query("SELECT COALESCE(SUM(amount), 0) AS total FROM repayments");
    
    const total_savings = Number(contributionsResult.rows[0].total);
    const total_loaned = Number(loansResult.rows[0].total);
    const total_interest_earned = Number(interestResult.rows[0].total);
    const total_repaid = Number(repaymentsResult.rows[0].total);
    const total_balance = total_savings + total_interest_earned - (total_loaned - total_repaid);
    
    res.json({
      total_savings,
      total_loaned,
      total_interest_earned,
      total_repaid,
      total_balance
    });
  } catch (error) {
    console.error('Summary error:', error);
    res.status(500).json({ message: "Server error" });
  }
});

// Members routes
app.get("/api/members", requireAuth, async (req, res) => {
  try {
    const result = await query(`
      SELECT m.id, m.name, m.email, m.phone, m.joining_date,
             COALESCE(SUM(c.amount), 0) AS total_contributions,
             COALESCE(SUM(r.amount), 0) AS total_repaid,
             COALESCE(SUM(l.principal + (l.principal * l.interest_rate)), 0) AS total_loan_payable
      FROM members m
      LEFT JOIN contributions c ON c.member_id = m.id
      LEFT JOIN loans l ON l.member_id = m.id
      LEFT JOIN repayments r ON r.loan_id = l.id
      GROUP BY m.id
      ORDER BY m.id DESC
    `);
    res.json(result.rows);
  } catch (error) {
    console.error('Members error:', error);
    res.status(500).json({ message: "Server error" });
  }
});

app.post("/api/members", requireAuth, async (req, res) => {
  const { name, phone, email, joining_date } = req.body;
  try {
    await query(
      "INSERT INTO members (name, phone, email, joining_date) VALUES ($1, $2, $3, $4)",
      [name, phone, email, joining_date]
    );
    res.json({ message: "Member created" });
  } catch (error) {
    console.error('Create member error:', error);
    res.status(500).json({ message: "Server error" });
  }
});

app.get("/api/members/:id", requireAuth, async (req, res) => {
  const { id } = req.params;
  try {
    const memberResult = await query("SELECT * FROM members WHERE id = $1", [id]);
    const member = memberResult.rows[0];
    if (!member) return res.status(404).json({ message: "Member not found" });
    
    const contributionsResult = await query(
      "SELECT id, amount, date, cycle FROM contributions WHERE member_id = $1 ORDER BY date DESC",
      [id]
    );
    const loansResult = await query(
      "SELECT id, principal, interest_rate, (principal + principal*interest_rate) AS total_payable, status, due_date FROM loans WHERE member_id = $1 ORDER BY id DESC",
      [id]
    );
    const repaymentsResult = await query(
      "SELECT r.id, r.amount, r.date, r.loan_id FROM repayments r JOIN loans l ON l.id = r.loan_id WHERE l.member_id = $1 ORDER BY r.date DESC",
      [id]
    );
    
    res.json({
      member,
      contributions: contributionsResult.rows,
      loans: loansResult.rows,
      repayments: repaymentsResult.rows
    });
  } catch (error) {
    console.error('Member profile error:', error);
    res.status(500).json({ message: "Server error" });
  }
});

// Contributions routes
app.get("/api/contributions", requireAuth, async (req, res) => {
  try {
    const result = await query("SELECT * FROM contributions ORDER BY date DESC");
    res.json(result.rows);
  } catch (error) {
    console.error('Contributions error:', error);
    res.status(500).json({ message: "Server error" });
  }
});

app.post("/api/contributions", requireAuth, async (req, res) => {
  const { member_id, amount, date, cycle } = req.body;
  try {
    await query(
      "INSERT INTO contributions (member_id, amount, date, cycle) VALUES ($1, $2, $3, $4)",
      [member_id, amount, date, cycle]
    );
    res.json({ message: "Contribution recorded" });
  } catch (error) {
    console.error('Create contribution error:', error);
    res.status(500).json({ message: "Server error" });
  }
});

// Loans routes
app.get("/api/loans", requireAuth, async (req, res) => {
  try {
    const result = await query(`
      SELECT l.*, (l.total_payable - COALESCE((SELECT SUM(r.amount) FROM repayments r WHERE r.loan_id = l.id), 0)) AS remaining
      FROM loans l
      ORDER BY l.id DESC
    `);
    res.json(result.rows);
  } catch (error) {
    console.error('Loans error:', error);
    res.status(500).json({ message: "Server error" });
  }
});

app.post("/api/loans", requireAuth, async (req, res) => {
  const { member_id, principal, due_date } = req.body;
  try {
    const settingsResult = await query("SELECT interest_rate FROM settings LIMIT 1");
    const rate = settingsResult.rows[0]?.interest_rate || 0.10;
    const interest = principal * rate;
    const total_payable = principal + interest;
    
    await query(
      "INSERT INTO loans (member_id, principal, interest_rate, interest, total_payable, status, due_date) VALUES ($1, $2, $3, $4, $5, 'pending', $6)",
      [member_id, principal, rate, interest, total_payable, due_date]
    );
    res.json({ message: "Loan request created", interest, total_payable, rate });
  } catch (error) {
    console.error('Create loan error:', error);
    res.status(500).json({ message: "Server error" });
  }
});

app.post("/api/loans/:id/decision", requireAuth, async (req, res) => {
  const { id } = req.params;
  const { action } = req.body;
  if (!['approve', 'reject'].includes(action)) return res.status(400).json({ message: "action must be 'approve' or 'reject'" });
  
  try {
    const status = action === "approve" ? "approved" : "rejected";
    await query("UPDATE loans SET status = $1 WHERE id = $2", [status, id]);
    res.json({ message: `Loan ${status}` });
  } catch (error) {
    console.error('Loan decision error:', error);
    res.status(500).json({ message: "Server error" });
  }
});

// Repayments routes
app.get("/api/repayments", requireAuth, async (req, res) => {
  try {
    const result = await query("SELECT * FROM repayments ORDER BY date DESC");
    res.json(result.rows);
  } catch (error) {
    console.error('Repayments error:', error);
    res.status(500).json({ message: "Server error" });
  }
});

app.post("/api/repayments", requireAuth, async (req, res) => {
  const { loan_id, amount, date } = req.body;
  try {
    const loanResult = await query("SELECT id, status, total_payable FROM loans WHERE id = $1", [loan_id]);
    const loan = loanResult.rows[0];
    if (!loan) return res.status(404).json({ message: "Loan not found" });
    if (loan.status !== 'approved') return res.status(400).json({ message: "Repayments allowed only for approved loans" });
    
    const repaidResult = await query("SELECT COALESCE(SUM(amount), 0) AS repaid FROM repayments WHERE loan_id = $1", [loan_id]);
    const remaining = Number(loan.total_payable) - Number(repaidResult.rows[0].repaid);
    if (amount > remaining) return res.status(400).json({ message: `Over-repayment not allowed. Remaining: ${remaining.toFixed(2)}` });
    
    await query("INSERT INTO repayments (loan_id, amount, date) VALUES ($1, $2, $3)", [loan_id, amount, date]);
    res.json({ message: "Repayment recorded" });
  } catch (error) {
    console.error('Create repayment error:', error);
    res.status(500).json({ message: "Server error" });
  }
});

// Settings routes
app.get("/api/settings", requireAuth, async (req, res) => {
  try {
    const result = await query("SELECT interest_rate FROM settings LIMIT 1");
    res.json(result.rows[0] || { interest_rate: 0.10 });
  } catch (error) {
    console.error('Settings error:', error);
    res.status(500).json({ message: "Server error" });
  }
});

app.put("/api/settings", requireAuth, async (req, res) => {
  const { interest_rate } = req.body;
  try {
    await query("UPDATE settings SET interest_rate = $1 LIMIT 1", [interest_rate]);
    res.json({ message: "Settings updated", interest_rate });
  } catch (error) {
    console.error('Update settings error:', error);
    res.status(500).json({ message: "Server error" });
  }
});

// Health check
app.get("/api/health", (req, res) => {
  res.json({ status: "OK", timestamp: new Date().toISOString() });
});

export default app;
