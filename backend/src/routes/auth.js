import express from "express";
import pool from "../db.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || "dev_secret_change_me";

router.post("/register", async (req, res) => {
  const { name, email, password, role } = req.body;
  if (!name || !email || !password) return res.status(400).json({ message: "name, email, password required" });
  const hash = await bcrypt.hash(password, 10);
  try {
    await pool.query("INSERT INTO users (name, email, password_hash, role) VALUES (?,?,?,?)", [name, email, hash, role || 'member']);
  } catch (e) {
    return res.status(400).json({ message: "Email already exists" });
  }
  res.json({ message: "Registered" });
});

router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ message: "email and password required" });
  const [[user]] = await pool.query("SELECT * FROM users WHERE email=?", [email]);
  if (!user) return res.status(401).json({ message: "Invalid credentials" });
  const ok = await bcrypt.compare(password, user.password_hash);
  if (!ok) return res.status(401).json({ message: "Invalid credentials" });
  const token = jwt.sign({ sub: user.id, role: user.role, name: user.name, email: user.email }, JWT_SECRET, { expiresIn: "7d" });
  res.json({ token, user: { id: user.id, name: user.name, email: user.email, role: user.role } });
});

export default router;










