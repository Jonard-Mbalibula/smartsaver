import express from "express";
import pool from "../db.js";

const router = express.Router();

// Record repayment with validation: loan must be approved, no over-repayment
router.post("/", async (req, res) => {
  const { loan_id, amount, date } = req.body;
  if (!loan_id || typeof amount !== 'number' || amount <= 0 || !date) {
    return res.status(400).json({ message: "loan_id, positive amount, and date are required" });
  }
  const [[loan]] = await pool.query("SELECT id, status, total_payable FROM loans WHERE id=?", [loan_id]);
  if (!loan) return res.status(404).json({ message: "Loan not found" });
  if (loan.status !== 'approved') return res.status(400).json({ message: "Repayments allowed only for approved loans" });
  const [[sumRow]] = await pool.query("SELECT COALESCE(SUM(amount),0) AS repaid FROM repayments WHERE loan_id=?", [loan_id]);
  const remaining = Number(loan.total_payable) - Number(sumRow.repaid);
  if (amount > remaining) return res.status(400).json({ message: `Over-repayment not allowed. Remaining: ${remaining.toFixed(2)}` });
  await pool.query("INSERT INTO repayments (loan_id, amount, date) VALUES (?, ?, ?)", [loan_id, amount, date]);
  res.json({ message: "Repayment recorded" });
});

// List repayments by loan
router.get("/", async (req, res) => {
  const { loan_id } = req.query;
  let sql = "SELECT * FROM repayments";
  const params = [];
  if (loan_id) {
    sql += " WHERE loan_id=?";
    params.push(loan_id);
  }
  sql += " ORDER BY date DESC";
  const [rows] = await pool.query(sql, params);
  res.json(rows);
});

export default router;





