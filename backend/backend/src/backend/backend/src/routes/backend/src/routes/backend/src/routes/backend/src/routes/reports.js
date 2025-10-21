import express from "express";
import pool from "../db.js";
import PdfPrinter from "pdfmake";
import XLSX from "xlsx";

const router = express.Router();

// Export contributions report as PDF
router.get("/contributions/pdf", async (req, res) => {
  const [rows] = await pool.query("SELECT * FROM contributions");

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
    styles: {
      header: { fontSize: 18, bold: true }
    }
  };

  const pdfDoc = printer.createPdfKitDocument(docDefinition);
  res.setHeader("Content-Type", "application/pdf");
  pdfDoc.pipe(res);
  pdfDoc.end();
});

// Export loans report as Excel
router.get("/loans/excel", async (req, res) => {
  const [rows] = await pool.query("SELECT * FROM loans");
  const worksheet = XLSX.utils.json_to_sheet(rows);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Loans");
  const buffer = XLSX.write(workbook, { type: "buffer", bookType: "xlsx" });

  res.setHeader("Content-Disposition", "attachment; filename=loans.xlsx");
  res.setHeader(
    "Content-Type",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
  );
  res.send(buffer);
});

export default router;
