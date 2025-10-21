import express from "express";
import pool from "../db.js";

const router = express.Router();

// Get all members
router.get("/", async (req, res) => {
  const [rows] = await pool.query("SELECT * FROM members");
  res.json(rows);
});

// Add new member
router.post("/", async (req, res) => {
  const { name, phone, email, joining_date } = req.body;
  await pool.query(
    "INSERT INTO members (name, phone, email, joining_date) VALUES (?, ?, ?, ?)",
    [name, phone, email, joining_date]
  );
  res.json({ message: "✅ Member added" });
});

export default router;
