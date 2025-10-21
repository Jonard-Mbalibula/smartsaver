import express from "express";
import pool from "../db.js";

const router = express.Router();

// Get current settings
router.get("/", async (_req, res) => {
  const [[row]] = await pool.query("SELECT interest_rate FROM settings LIMIT 1");
  res.json(row || { interest_rate: 0.10 });
});

// Update interest rate
router.put("/", async (req, res) => {
  const { interest_rate } = req.body;
  if (typeof interest_rate !== "number") {
    return res.status(400).json({ message: "interest_rate must be a number" });
  }
  await pool.query("UPDATE settings SET interest_rate=? LIMIT 1", [interest_rate]);
  res.json({ message: "Settings updated", interest_rate });
});

export default router;






