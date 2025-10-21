import express from "express";
import pool from "../db.js";

const router = express.Router();

// Add a contribution
router.post("/", async (req, res) => {
  const { member_id, amount, date, cycle } = req.body;
  await pool.query(
    "INSERT INTO contributions (member_id, amount, date, cycle) VALUES (?, ?, ?, ?)",
    [member_id, amount, date, cycle]
  );
  res.json({ message: "✅ Contribution added" });
});

// Get all contributions
router.get("/", async (req, res) => {
  const [rows] = await pool.query("SELECT * FROM contributions");
  res.json(rows);
});

export default router;
