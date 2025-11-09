import { NavLink, Route, Routes, Navigate } from 'react-router-dom'
// ... (all other imports)
import AuthProvider, { useAuth } from './components/AuthProvider.jsx'

// The existing Protected wrapper remains the same
function Protected({ children }){
  const { token } = useAuth()
  if (!token) return <Navigate to="/login" replace />
  return children
}

// ----------------------------------------------------
// NEW: Layout Component for Authenticated Users
// ----------------------------------------------------
function Layout() {
  return (
    <div className="app">
      <aside className="sidebar">
        <h2>SmartSaver</h2>
        <nav>
          <NavLink to="/" end>Dashboard</NavLink>
          <NavLink to="/members">Members</NavLink>
          <NavLink to="/contributions">Contributions</NavLink>
          <NavLink to="/loans">Loans</NavLink>
          <NavLink to="/reports">Reports</NavLink>
          <NavLink to="/repayments">Repayments</NavLink>
          <NavLink to="/settings">Settings</NavLink>
        </nav>
      </aside>
      <main className="content">
        <Routes>
          {/* Protected Routes that use the Layout */}
          <Route path="/" element={<Protected><Dashboard /></Protected>} />
          <Route path="/members" element={<Protected><Members /></Protected>} />
          <Route path="/members/:id" element={<Protected><MemberProfile /></Protected>} />
          <Route path="/contributions" element={<Protected><Contributions /></Protected>} />
          <Route path="/loans" element={<Protected><Loans /></Protected>} />
          <Route path="/loans/:id" element={<Protected><LoanDetail /></Protected>} />
          <Route path="/reports" element={<Protected><Reports /></Protected>} />
          <Route path="/repayments" element={<Protected><Repayments /></Protected>} />
          <Route path="/settings" element={<Protected><Settings /></Protected>} />
        </Routes>
      </main>
    </div>
  )
}
// ----------------------------------------------------


export default function App() {
  return (
    <AuthProvider>
      <Routes>
        {/* Unprotected Route (Login) - No Layout */}
        <Route path="/login" element={<Login />} />

        {/* Catch-all Route for everything else (which requires Layout and protection) */}
        <Route path="/*" element={<Layout />} />
      </Routes>
    </AuthProvider>
  )
}