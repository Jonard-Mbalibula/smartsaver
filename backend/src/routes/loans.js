import express from "express";
import pool from "../db.js";

const router = express.Router();

// interest rate will be fetched from settings table

// Create loan (pending approval)
router.post("/", async (req, res) => {
  const { member_id, principal, due_date } = req.body;
  if (!member_id || typeof principal !== 'number' || principal <= 0 || !due_date) {
    return res.status(400).json({ message: "member_id, positive principal and due_date are required" });
  }
  const [[settings]] = await pool.query("SELECT interest_rate FROM settings LIMIT 1");
  const rate = settings?.interest_rate ?? 0.10;
  const interest = principal * rate;
  const total_payable = principal + interest;
  await pool.query(
    `INSERT INTO loans (member_id, principal, interest_rate, interest, total_payable, status, due_date)
     VALUES (?, ?, ?, ?, ?, 'pending', ?)`,
    [member_id, principal, rate, interest, total_payable, due_date]
  );
  res.json({ message: "Loan request created", interest, total_payable, rate });
});

// Approve or reject loan
router.post("/:id/decision", async (req, res) => {
  const { id } = req.params;
  const { action } = req.body; // 'approve' or 'reject'
  if (!['approve','reject'].includes(action)) return res.status(400).json({ message: "action must be 'approve' or 'reject'" });
  const [[exists]] = await pool.query("SELECT id FROM loans WHERE id=?", [id]);
  if (!exists) return res.status(404).json({ message: "Loan not found" });
  const status = action === "approve" ? "approved" : "rejected";
  await pool.query("UPDATE loans SET status=? WHERE id=?", [status, id]);
  res.json({ message: `Loan ${status}` });
});

// List loans
router.get("/", async (_req, res) => {
  const [rows] = await pool.query(
    `SELECT l.*, (l.total_payable - COALESCE((SELECT SUM(r.amount) FROM repayments r WHERE r.loan_id = l.id), 0)) AS remaining
     FROM loans l
     ORDER BY l.id DESC`
  );
  res.json(rows);
});

// Get single loan
router.get("/:id", async (req, res) => {
  const { id } = req.params;
  const [[row]] = await pool.query(
    `SELECT l.*, (l.total_payable - COALESCE((SELECT SUM(r.amount) FROM repayments r WHERE r.loan_id = l.id), 0)) AS remaining
     FROM loans l WHERE l.id=?`,
    [id]
  );
  if (!row) return res.status(404).json({ message: "Not found" });
  res.json(row);
});

export default router;





