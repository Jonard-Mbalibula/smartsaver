import express from "express";
import pool from "../db.js";

const router = express.Router();

router.get("/", async (_req, res) => {
  const [contributions] = await pool.query(
    "SELECT 'contribution' as type, id, member_id, amount, date FROM contributions ORDER BY date DESC LIMIT 5"
  );
  const [loans] = await pool.query(
    "SELECT 'loan' as type, id, member_id, principal as amount, due_date as date FROM loans ORDER BY due_date DESC LIMIT 5"
  );
  const feed = [...contributions, ...loans].sort((a, b) => new Date(b.date) - new Date(a.date));
  res.json(feed);
});

export default router;








