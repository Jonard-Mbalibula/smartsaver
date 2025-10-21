import express from "express";
import pool from "../db.js";

const router = express.Router();

// List members with aggregate stats
router.get("/", async (req, res) => {
  const [rows] = await pool.query(
    `SELECT m.id, m.name, m.email, m.phone, m.joining_date,
            COALESCE(SUM(c.amount), 0) AS total_contributions,
            COALESCE(SUM(r.amount), 0) AS total_repaid,
            COALESCE(SUM(l.principal + (l.principal * l.interest_rate)), 0) AS total_loan_payable
     FROM members m
     LEFT JOIN contributions c ON c.member_id = m.id
     LEFT JOIN loans l ON l.member_id = m.id
     LEFT JOIN repayments r ON r.loan_id = l.id
     GROUP BY m.id
     ORDER BY m.id DESC`
  );
  res.json(rows);
});

// Create member
router.post("/", async (req, res) => {
  const { name, phone, email, joining_date } = req.body;
  await pool.query(
    "INSERT INTO members (name, phone, email, joining_date) VALUES (?, ?, ?, ?)",
    [name, phone, email, joining_date]
  );
  res.json({ message: "Member created" });
});

// Update member
router.put("/:id", async (req, res) => {
  const { id } = req.params;
  const { name, phone, email, joining_date } = req.body;
  await pool.query(
    "UPDATE members SET name=?, phone=?, email=?, joining_date=? WHERE id=?",
    [name, phone, email, joining_date, id]
  );
  res.json({ message: "Member updated" });
});

// Delete member
router.delete("/:id", async (req, res) => {
  const { id } = req.params;
  await pool.query("DELETE FROM members WHERE id=?", [id]);
  res.json({ message: "Member deleted" });
});

// Member profile with timelines
router.get("/:id", async (req, res) => {
  const { id } = req.params;
  const [[member]] = await pool.query("SELECT * FROM members WHERE id=?", [id]);
  const [contribs] = await pool.query(
    "SELECT id, amount, date, cycle FROM contributions WHERE member_id=? ORDER BY date DESC",
    [id]
  );
  const [loans] = await pool.query(
    `SELECT id, principal, interest_rate, (principal + principal*interest_rate) AS total_payable, status, due_date
     FROM loans WHERE member_id=? ORDER BY id DESC`,
    [id]
  );
  const [repayments] = await pool.query(
    `SELECT r.id, r.amount, r.date, r.loan_id FROM repayments r
     JOIN loans l ON l.id = r.loan_id WHERE l.member_id=? ORDER BY r.date DESC`,
    [id]
  );

  res.json({ member, contributions: contribs, loans, repayments });
});

export default router;




