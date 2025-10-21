import express from "express";
import cors from "cors";
import bodyParser from "body-parser";

const app = express();
const PORT = 5000;

app.use(cors());
app.use(bodyParser.json());

// Mock data
const mockData = {
  members: [],
  contributions: [],
  loans: [],
  repayments: [],
  settings: { interest_rate: 0.10 }
};

// Mock auth middleware
const mockAuth = (req, res, next) => {
  const token = req.headers.authorization?.replace('Bearer ', '');
  if (token === 'mock-token') {
    req.user = { id: 1, name: "Admin", email: "mbalibulajonard@gmail.com", role: "admin" };
    next();
  } else {
    res.status(401).json({ message: "Unauthorized" });
  }
};

// Auth routes
app.post("/api/auth/login", (req, res) => {
  const { email, password } = req.body;
  if (email === "mbalibulajonard@gmail.com" && password === "Mbalibula@20") {
    res.json({ 
      token: "mock-token", 
      user: { id: 1, name: "Admin", email: "mbalibulajonard@gmail.com", role: "admin" } 
    });
  } else {
    res.status(401).json({ message: "Invalid credentials" });
  }
});

// Reports summary
app.get("/api/reports/summary", mockAuth, (req, res) => {
  const total_savings = mockData.contributions.reduce((sum, c) => sum + Number(c.amount), 0);
  const total_loaned = mockData.loans.filter(l => l.status === 'approved').reduce((sum, l) => sum + Number(l.principal), 0);
  const total_interest_earned = mockData.loans.filter(l => l.status === 'approved').reduce((sum, l) => sum + Number(l.interest), 0);
  const total_repaid = mockData.repayments.reduce((sum, r) => sum + Number(r.amount), 0);
  const total_balance = total_savings + total_interest_earned - (total_loaned - total_repaid);
  
  res.json({
    total_savings,
    total_loaned,
    total_interest_earned,
    total_repaid,
    total_balance
  });
});

// Members routes
app.get("/api/members", mockAuth, (req, res) => {
  res.json(mockData.members);
});

app.post("/api/members", mockAuth, (req, res) => {
  const { name, phone, email, joining_date } = req.body;
  const newMember = {
    id: mockData.members.length + 1,
    name,
    phone,
    email,
    joining_date,
    total_contributions: 0,
    total_repaid: 0,
    total_loan_payable: 0
  };
  mockData.members.push(newMember);
  res.json({ message: "Member created" });
});

app.get("/api/members/:id", mockAuth, (req, res) => {
  const { id } = req.params;
  const member = mockData.members.find(m => m.id == id);
  if (!member) return res.status(404).json({ message: "Member not found" });
  
  const contributions = mockData.contributions.filter(c => c.member_id == id);
  const loans = mockData.loans.filter(l => l.member_id == id);
  const repayments = mockData.repayments.filter(r => loans.some(l => l.id == r.loan_id));
  
  res.json({ member, contributions, loans, repayments });
});

// Contributions routes
app.get("/api/contributions", mockAuth, (req, res) => {
  res.json(mockData.contributions);
});

app.post("/api/contributions", mockAuth, (req, res) => {
  const { member_id, amount, date, cycle } = req.body;
  const newContribution = {
    id: mockData.contributions.length + 1,
    member_id,
    amount,
    date,
    cycle
  };
  mockData.contributions.push(newContribution);
  res.json({ message: "Contribution recorded" });
});

// Loans routes
app.get("/api/loans", mockAuth, (req, res) => {
  const loansWithRemaining = mockData.loans.map(loan => {
    const repaid = mockData.repayments.filter(r => r.loan_id === loan.id).reduce((sum, r) => sum + Number(r.amount), 0);
    return {
      ...loan,
      remaining: Number(loan.total_payable) - repaid
    };
  });
  res.json(loansWithRemaining);
});

app.post("/api/loans", mockAuth, (req, res) => {
  const { member_id, principal, due_date } = req.body;
  const interest_rate = mockData.settings.interest_rate;
  const interest = principal * interest_rate;
  const total_payable = principal + interest;
  
  const newLoan = {
    id: mockData.loans.length + 1,
    member_id,
    principal,
    interest_rate,
    interest,
    total_payable,
    status: 'pending',
    due_date,
    created_at: new Date().toISOString()
  };
  mockData.loans.push(newLoan);
  res.json({ message: "Loan request created", interest, total_payable, rate: interest_rate });
});

app.post("/api/loans/:id/decision", mockAuth, (req, res) => {
  const { id } = req.params;
  const { action } = req.body;
  const loan = mockData.loans.find(l => l.id == id);
  if (!loan) return res.status(404).json({ message: "Loan not found" });
  
  loan.status = action === "approve" ? "approved" : "rejected";
  res.json({ message: `Loan ${loan.status}` });
});

app.get("/api/loans/:id", mockAuth, (req, res) => {
  const { id } = req.params;
  const loan = mockData.loans.find(l => l.id == id);
  if (!loan) return res.status(404).json({ message: "Not found" });
  
  const repaid = mockData.repayments.filter(r => r.loan_id === loan.id).reduce((sum, r) => sum + Number(r.amount), 0);
  res.json({ ...loan, remaining: Number(loan.total_payable) - repaid });
});

// Repayments routes
app.get("/api/repayments", mockAuth, (req, res) => {
  res.json(mockData.repayments);
});

app.post("/api/repayments", mockAuth, (req, res) => {
  const { loan_id, amount, date } = req.body;
  const loan = mockData.loans.find(l => l.id == loan_id);
  if (!loan) return res.status(404).json({ message: "Loan not found" });
  if (loan.status !== 'approved') return res.status(400).json({ message: "Repayments allowed only for approved loans" });
  
  const repaid = mockData.repayments.filter(r => r.loan_id == loan_id).reduce((sum, r) => sum + Number(r.amount), 0);
  const remaining = Number(loan.total_payable) - repaid;
  if (amount > remaining) return res.status(400).json({ message: `Over-repayment not allowed. Remaining: ${remaining.toFixed(2)}` });
  
  const newRepayment = {
    id: mockData.repayments.length + 1,
    loan_id,
    amount,
    date
  };
  mockData.repayments.push(newRepayment);
  res.json({ message: "Repayment recorded" });
});

// Settings routes
app.get("/api/settings", mockAuth, (req, res) => {
  res.json(mockData.settings);
});

app.put("/api/settings", mockAuth, (req, res) => {
  const { interest_rate } = req.body;
  mockData.settings.interest_rate = interest_rate;
  res.json({ message: "Settings updated", interest_rate });
});

// Reports routes
app.get("/api/reports/contributions/pdf", mockAuth, (req, res) => {
  res.setHeader("Content-Type", "application/pdf");
  res.setHeader("Content-Disposition", "attachment; filename=contributions.pdf");
  res.send("PDF content would be here");
});

app.get("/api/reports/loans/excel", mockAuth, (req, res) => {
  res.setHeader("Content-Disposition", "attachment; filename=loans.xlsx");
  res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
  res.send("Excel content would be here");
});

app.get("/api/reports/members/:id/statement.pdf", mockAuth, (req, res) => {
  res.setHeader("Content-Type", "application/pdf");
  res.setHeader("Content-Disposition", `attachment; filename=member_${req.params.id}_statement.pdf`);
  res.send("PDF content would be here");
});

app.get("/api/reports/members/:id/savings.csv", mockAuth, (req, res) => {
  res.setHeader("Content-Type", "text/csv");
  res.setHeader("Content-Disposition", `attachment; filename=member_${req.params.id}_savings.csv`);
  res.send("CSV content would be here");
});

app.get("/", (req, res) => {
  res.send("Smartsaver Backend Running...");
});

app.listen(PORT, () => {
  console.log(`✅ Backend running at http://localhost:${PORT}`);
  console.log(`🔑 Login with: mbalibulajonard@gmail.com / Mbalibula@20`);
});
