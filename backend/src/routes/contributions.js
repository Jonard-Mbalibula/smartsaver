import express from "express";
import pool from "../db.js";

const router = express.Router();

// Create a contribution
router.post("/", async (req, res) => {
  const { member_id, amount, date, cycle } = req.body;
  await pool.query(
    "INSERT INTO contributions (member_id, amount, date, cycle) VALUES (?, ?, ?, ?)",
    [member_id, amount, date, cycle]
  );
  res.json({ message: "Contribution recorded" });
});

// List contributions (with optional filters)
router.get("/", async (req, res) => {
  const { member_id } = req.query;
  let sql = "SELECT * FROM contributions";
  const params = [];
  if (member_id) {
    sql += " WHERE member_id=?";
    params.push(member_id);
  }
  sql += " ORDER BY date DESC";
  const [rows] = await pool.query(sql, params);
  res.json(rows);
});

// Aggregation summaries
router.get("/summary/group", async (_req, res) => {
  const [[row]] = await pool.query(
    "SELECT COALESCE(SUM(amount),0) AS total_group_savings FROM contributions"
  );
  res.json(row);
});

export default router;













