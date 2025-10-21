import { NavLink, Route, Routes, Navigate } from 'react-router-dom'
import Dashboard from './pages/Dashboard.jsx'
import Members from './pages/Members.jsx'
import Contributions from './pages/Contributions.jsx'
import Loans from './pages/Loans.jsx'
import Reports from './pages/Reports.jsx'
import MemberProfile from './pages/MemberProfile.jsx'
import Repayments from './pages/Repayments.jsx'
import Settings from './pages/Settings.jsx'
import LoanDetail from './pages/LoanDetail.jsx'
import Login from './pages/Login.jsx'
import AuthProvider, { useAuth } from './components/AuthProvider.jsx'

function Protected({ children }){
  const { token } = useAuth()
  if (!token) return <Navigate to="/login" replace />
  return children
}

export default function App() {
  return (
    <AuthProvider>
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
            <Route path="/login" element={<Login />} />
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
    </AuthProvider>
  )
}





