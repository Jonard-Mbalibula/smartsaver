import express from "express";
import pool from "../db.js";

const router = express.Router();

// Issue a loan
router.post("/", async (req, res) => {
  const { member_id, principal, interest_rate, due_date } = req.body;
  await pool.query(
    "INSERT INTO loans (member_id, principal, interest_rate, due_date) VALUES (?, ?, ?, ?)",
    [member_id, principal, interest_rate, due_date]
  );
  res.json({ message: "✅ Loan issued" });
});

// Get all loans
router.get("/", async (req, res) => {
  const [rows] = await pool.query("SELECT * FROM loans");
  res.json(rows);
});

export default router;
