import express from "express";
import pool from "../db.js";
import PdfPrinter from "pdfmake";
import XLSX from "xlsx";

const router = express.Router();

// Dashboard summary metrics
router.get("/summary", async (_req, res) => {
  const [[savings]] = await pool.query("SELECT COALESCE(SUM(amount),0) AS total_savings FROM contributions");
  const [[loaned]] = await pool.query("SELECT COALESCE(SUM(principal),0) AS total_loaned FROM loans WHERE status='approved'");
  const [[interestEarned]] = await pool.query(
    "SELECT COALESCE(SUM(interest),0) AS total_interest FROM loans WHERE status='approved'"
  );
  const [[repaid]] = await pool.query("SELECT COALESCE(SUM(amount),0) AS total_repaid FROM repayments");
  const total_balance = savings.total_savings + interestEarned.total_interest - (loaned.total_loaned - repaid.total_repaid);
  res.json({
    total_savings: savings.total_savings,
    total_loaned: loaned.total_loaned,
    total_interest_earned: interestEarned.total_interest,
    total_repaid: repaid.total_repaid,
    total_balance
  });
});

// Monthly savings (grouped contributions)
router.get("/savings/monthly", async (_req, res) => {
  const [rows] = await pool.query(
    `SELECT DATE_FORMAT(date, '%Y-%m') AS month, COALESCE(SUM(amount),0) AS total
     FROM contributions
     GROUP BY DATE_FORMAT(date, '%Y-%m')
     ORDER BY month ASC`
  );
  res.json(rows);
});

// Monthly savings CSV
router.get("/savings/monthly.csv", async (_req, res) => {
  const [rows] = await pool.query(
    `SELECT DATE_FORMAT(date, '%Y-%m') AS month, COALESCE(SUM(amount),0) AS total
     FROM contributions
     GROUP BY DATE_FORMAT(date, '%Y-%m')
     ORDER BY month ASC`
  );
  const header = 'month,total\n';
  const body = rows.map(r => `${r.month},${r.total}`).join('\n');
  const csv = header + body + '\n';
  res.setHeader("Content-Type", "text/csv");
  res.setHeader("Content-Disposition", "attachment; filename=savings_monthly.csv");
  res.send(csv);
});

// Member statement PDF (contributions, loans, repayments summary)
router.get("/members/:id/statement.pdf", async (req, res) => {
  const { id } = req.params;
  const [[member]] = await pool.query("SELECT * FROM members WHERE id=?", [id]);
  if (!member) return res.status(404).json({ message: "Member not found" });
  const [contribs] = await pool.query(
    "SELECT id, amount, date, cycle FROM contributions WHERE member_id=? ORDER BY date ASC",
    [id]
  );
  const [loans] = await pool.query(
    `SELECT l.*, (l.total_payable - COALESCE((SELECT SUM(r.amount) FROM repayments r WHERE r.loan_id = l.id), 0)) AS remaining
     FROM loans l WHERE l.member_id=? ORDER BY l.id ASC`,
    [id]
  );
  const [repayments] = await pool.query(
    `SELECT r.id, r.amount, r.date, r.loan_id FROM repayments r
     JOIN loans l ON l.id = r.loan_id WHERE l.member_id=? ORDER BY r.date ASC`,
    [id]
  );

  const contribTotal = contribs.reduce((s, r) => s + Number(r.amount), 0);
  const totalPayable = loans.reduce((s, l) => s + Number(l.total_payable||0), 0);
  const totalRepaid = repayments.reduce((s, r) => s + Number(r.amount||0), 0);
  const remaining = Math.max(0, totalPayable - totalRepaid);

  const printer = new PdfPrinter({
    Roboto: {
      normal: "node_modules/pdfmake/fonts/Roboto-Regular.ttf",
      bold: "node_modules/pdfmake/fonts/Roboto-Medium.ttf"
    }
  });

  const docDefinition = {
    content: [
      { text: `Member Statement - ${member.name} (#${member.id})`, style: "header" },
      { text: `Email: ${member.email||'-'}    Phone: ${member.phone||'-'}    Joined: ${member.joining_date}`, margin:[0,0,0,8] },
      { text: `Savings Total: $${contribTotal.toFixed(2)}    Loans Total: $${totalPayable.toFixed(2)}    Repaid: $${totalRepaid.toFixed(2)}    Remaining: $${remaining.toFixed(2)}` , margin:[0,0,0,12] },
      { text: "Contributions", style: "subheader" },
      { table: { body: [["ID","Amount","Date","Cycle"], ...contribs.map(c=> [c.id, c.amount, c.date, c.cycle||'-']) ] }, layout: 'lightHorizontalLines', margin:[0,0,0,12] },
      { text: "Loans", style: "subheader" },
      { table: { body: [["ID","Principal","Interest","Total","Status","Due","Remaining"], ...loans.map(l=> [l.id, l.principal, l.interest|| (l.total_payable-l.principal), l.total_payable, l.status, l.due_date, l.remaining||0]) ] }, layout: 'lightHorizontalLines', margin:[0,0,0,12] },
      { text: "Repayments", style: "subheader" },
      { table: { body: [["ID","Loan","Amount","Date"], ...repayments.map(r=> [r.id, r.loan_id, r.amount, r.date]) ] }, layout: 'lightHorizontalLines' }
    ],
    styles: { header: { fontSize: 16, bold: true }, subheader: { fontSize: 13, bold: true, margin:[0,8,0,4] } }
  };

  const pdfDoc = printer.createPdfKitDocument(docDefinition);
  res.setHeader("Content-Type", "application/pdf");
  pdfDoc.pipe(res);
  pdfDoc.end();
});

// Member savings CSV (contributions by member, optional date range)
router.get("/members/:id/savings.csv", async (req, res) => {
  const { id } = req.params;
  const { start, end } = req.query;
  let sql = "SELECT id, amount, date, cycle FROM contributions WHERE member_id=?";
  const params = [id];
  if (start && end) { sql += " AND date BETWEEN ? AND ?"; params.push(start, end); }
  sql += " ORDER BY date ASC";
  const [rows] = await pool.query(sql, params);
  const header = 'id,amount,date,cycle\n';
  const body = rows.map(r => `${r.id},${r.amount},${r.date},${r.cycle||''}`).join('\n');
  const csv = header + body + '\n';
  res.setHeader("Content-Type", "text/csv");
  res.setHeader("Content-Disposition", `attachment; filename=member_${id}_savings.csv`);
  res.send(csv);
});

// Group Savings Summary PDF (date range)
router.get("/savings/summary.pdf", async (req, res) => {
  const { start, end } = req.query;
  let where = "";
  const params = [];
  if (start && end) { where = "WHERE c.date BETWEEN ? AND ?"; params.push(start, end); }

  const [rows] = await pool.query(
    `SELECT m.id AS member_id, m.name, COALESCE(SUM(c.amount),0) AS total
     FROM members m
     LEFT JOIN contributions c ON c.member_id = m.id ${where}
     GROUP BY m.id, m.name
     ORDER BY m.name ASC`,
    params
  );
  const total = rows.reduce((s,r)=> s + Number(r.total||0), 0);
  const contributors = rows.filter(r=> Number(r.total)>0).length;

  const printer = new PdfPrinter({
    Roboto: {
      normal: "node_modules/pdfmake/fonts/Roboto-Regular.ttf",
      bold: "node_modules/pdfmake/fonts/Roboto-Medium.ttf"
    }
  });

  const docDefinition = {
    content: [
      { text: "Savings Summary", style: "header" },
      { text: start && end ? `Range: ${start} to ${end}` : "All time", margin:[0,0,0,8] },
      { text: `Total Savings: $${total.toFixed(2)}    Contributors: ${contributors}`, margin:[0,0,0,12] },
      { table: { body: [["Member","Total"], ...rows.map(r=> [r.name, r.total]) ] }, layout: 'lightHorizontalLines' }
    ],
    styles: { header: { fontSize: 16, bold: true } }
  };

  const pdfDoc = printer.createPdfKitDocument(docDefinition);
  res.setHeader("Content-Type", "application/pdf");
  pdfDoc.pipe(res);
  pdfDoc.end();
});

// Contributions PDF report
router.get("/contributions/pdf", async (req, res) => {
  const { start, end } = req.query;
  let sql = "SELECT * FROM contributions";
  const params = [];
  if (start && end) { sql += " WHERE date BETWEEN ? AND ?"; params.push(start, end); }
  sql += " ORDER BY date DESC";
  const [rows] = await pool.query(sql, params);

  const printer = new PdfPrinter({
    Roboto: {
      normal: "node_modules/pdfmake/fonts/Roboto-Regular.ttf",
      bold: "node_modules/pdfmake/fonts/Roboto-Medium.ttf"
    }
  });

  const docDefinition = {
    content: [
      { text: "Contributions Report", style: "header" },
      {
        table: {
          body: [
            ["ID", "Member", "Amount", "Date", "Cycle"],
            ...rows.map(r => [r.id, r.member_id, r.amount, r.date, r.cycle])
          ]
        }
      }
    ],
    styles: { header: { fontSize: 16, bold: true } }
  };

  const pdfDoc = printer.createPdfKitDocument(docDefinition);
  res.setHeader("Content-Type", "application/pdf");
  pdfDoc.pipe(res);
  pdfDoc.end();
});

// Contributions CSV (optional date range)
router.get("/contributions.csv", async (req, res) => {
  const { start, end } = req.query;
  let sql = "SELECT id, member_id, amount, date, cycle FROM contributions";
  const params = [];
  if (start && end) { sql += " WHERE date BETWEEN ? AND ?"; params.push(start, end); }
  sql += " ORDER BY date DESC";
  const [rows] = await pool.query(sql, params);
  const header = 'id,member_id,amount,date,cycle\n';
  const body = rows.map(r => `${r.id},${r.member_id},${r.amount},${r.date},${r.cycle||''}`).join('\n');
  const csv = header + body + '\n';
  res.setHeader("Content-Type", "text/csv");
  res.setHeader("Content-Disposition", "attachment; filename=contributions.csv");
  res.send(csv);
});

// Loans Excel report
router.get("/loans/excel", async (_req, res) => {
  const [rows] = await pool.query("SELECT * FROM loans ORDER BY id DESC");
  const worksheet = XLSX.utils.json_to_sheet(rows);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Loans");
  const buffer = XLSX.write(workbook, { type: "buffer", bookType: "xlsx" });
  res.setHeader("Content-Disposition", "attachment; filename=loans.xlsx");
  res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
  res.send(buffer);
});

export default router;





