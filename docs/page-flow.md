## SmartSaver - Page Flow

### Top-level Navigation (sidebar)
- Dashboard: `/`
- Members: `/members`
- Contributions: `/contributions`
- Loans: `/loans`
- Reports: `/reports`

### Pages and Primary Actions
- Dashboard
  - Fetch summary metrics from `GET /api/reports/summary`
  - Display KPI cards and charts (growth, contributions bar, loans vs repayments pie)

- Members
  - List members with aggregate stats from `GET /api/members`
  - Create member via `POST /api/members`
  - Potential next: click row to view profile timeline (`GET /api/members/:id`)

- Contributions
  - Populate member select via `GET /api/members`
  - Record a contribution via `POST /api/contributions`
  - List contributions via `GET /api/contributions`

- Loans
  - Populate member select via `GET /api/members`
  - Request a loan via `POST /api/loans`
  - Approve/Reject loan via `POST /api/loans/:id/decision`
  - List loans via `GET /api/loans`

- Reports
  - Download contributions PDF via `GET /api/reports/contributions/pdf`
  - Download loans Excel via `GET /api/reports/loans/excel`

### Proposed Additions
- Member Profile page: `/members/:id`
  - Timeline for contributions, loans, repayments using `GET /api/members/:id`

- Repayments page: `/repayments`
  - Record repayment via `POST /api/repayments`
  - List by loan via `GET /api/repayments?loan_id=...`

- Settings page: `/settings`
  - View/update interest rate stored in `settings` table
  - Loans route to use dynamic interest rate

### Route Map (Frontend)
BrowserRouter → Sidebar links → `Routes` in `src/App.jsx` map to pages listed above.

### Data Flow
- `frontend/src/lib/api.js` centralizes API calls under `/api`
- Backend routes mounted in `backend/server.js` under `/api/*`

### Next Steps
1) Implement Member Profile, Repayments, and Settings pages
2) Wire loans creation to dynamic interest from Settings
3) Add basic input validation and error alerts on forms

