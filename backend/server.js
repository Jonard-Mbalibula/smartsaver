import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import dotenv from "dotenv";
import membersRoutes from "./src/routes/members.js";
import contributionsRoutes from "./src/routes/contributions.js";
import loansRoutes from "./src/routes/loans.js";
import repaymentsRoutes from "./src/routes/repayments.js";
import reportsRoutes from "./src/routes/reports.js";
import feedRoutes from "./src/routes/feed.js";
import settingsRoutes from "./src/routes/settings.js";
import authRoutes from "./src/routes/auth.js";
import { requireAuth, requireRole } from "./src/middleware/auth.js";
import pool from "./src/db.js";
import bcrypt from "bcryptjs";

dotenv.config();
const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(bodyParser.json());

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/members", requireAuth, membersRoutes);
app.use("/api/contributions", requireAuth, contributionsRoutes);
app.use("/api/loans", requireAuth, loansRoutes);
app.use("/api/repayments", requireAuth, repaymentsRoutes);
app.use("/api/reports", requireAuth, reportsRoutes);
app.use("/api/feed", requireAuth, feedRoutes);
app.use("/api/settings", requireAuth, settingsRoutes);

app.get("/", (req, res) => {
  res.send("Smartsaver Backend Running...");
});
// Example admin-only route guard
// app.use('/api/settings', requireAuth, requireRole('admin'))

async function ensureDefaultAdmin() {
  const email = "mbalibulajonard@gmail.com";
  const name = "Admin";
  const password = "Mbalibula@20";
  const role = "admin";
  const [[exists]] = await pool.query("SELECT id FROM users WHERE email=?", [email]);
  if (!exists) {
    const hash = await bcrypt.hash(password, 10);
    await pool.query(
      "INSERT INTO users (name, email, password_hash, role) VALUES (?,?,?,?)",
      [name, email, hash, role]
    );
    console.log("✅ Seeded default admin:", email);
  }
}

(async () => {
  try {
    await ensureDefaultAdmin();
  } catch (e) {
    console.error("Failed to ensure default admin:", e?.message || e);
  }
  app.listen(PORT, () => {
    console.log(`✅ Backend running at http://localhost:${PORT}`);
  });
})();
