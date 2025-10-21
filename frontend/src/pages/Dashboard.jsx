import { useEffect, useState } from 'react'
import { getSummary, listLoans, getMonthlySavings, exportMonthlySavingsCsv } from '../lib/api.js'
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, BarChart, Bar, PieChart, Pie, Cell } from 'recharts'

export default function Dashboard(){
  const [summary, setSummary] = useState(null)
  const [loading, setLoading] = useState(true)
  const [outstanding, setOutstanding] = useState(0)
  const [monthly, setMonthly] = useState([])

  useEffect(() => {
    (async () => {
      try {
        const data = await getSummary()
        setSummary(data)
        // Fetch loans to compute outstanding remaining amount
        const loans = await listLoans()
        const totalRemaining = loans.reduce((sum, l) => sum + Number(l.remaining ?? (l.total_payable || 0)), 0)
        setOutstanding(totalRemaining)
        setMonthly(await getMonthlySavings())
      } finally {
        setLoading(false)
      }
    })()
  }, [])

  const growth = monthly.length ? monthly.map(m=> ({ month: m.month, amount: m.total })) : Array.from({length: 8}).map((_,i)=>({ month: `M${i+1}`, amount: (summary?.total_savings||0) * (i+1)/8 }))
  const loansVs = [
    { name: 'Loaned', value: summary?.total_loaned||0 },
    { name: 'Repaid', value: summary?.total_repaid||0 }
  ]
  const colors = ['#22c55e', '#38bdf8', '#fbbf24', '#ef4444']

  if (loading) return <div className="muted">Loading...</div>

  return (
    <div className="dashboard">
      <div className="grid">
        <div className="card"><h4>Total Savings</h4><div className="row"><strong>${Number(summary.total_savings).toFixed(2)}</strong></div></div>
        <div className="card"><h4>Total Loans</h4><div className="row"><strong>${Number(summary.total_loaned).toFixed(2)}</strong></div></div>
        <div className="card"><h4>Total Interest Earned</h4><div className="row"><strong>${Number(summary.total_interest_earned).toFixed(2)}</strong></div></div>
        <div className="card"><h4>Outstanding Loans</h4><div className="row"><strong>${Number(outstanding).toFixed(2)}</strong></div></div>
        <div className="card"><h4>Balance Available</h4><div className="row"><strong>${Number(summary.total_balance).toFixed(2)}</strong></div></div>
      </div>

      <div className="grid" style={{marginTop:16}}>
        <div className="card" style={{gridColumn:'span 2'}}>
          <div className="row" style={{justifyContent:'space-between'}}>
            <h4>Savings Growth</h4>
            <button className="button" onClick={async()=>{
              const blob = await exportMonthlySavingsCsv();
              const url = URL.createObjectURL(blob); const a = document.createElement('a'); a.href = url; a.download = 'savings_monthly.csv'; a.click(); URL.revokeObjectURL(url)
            }}>Download CSV</button>
          </div>
          <div style={{height:260}}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={growth}>
                <XAxis dataKey="month" stroke="#334155" />
                <YAxis stroke="#334155" />
                <Tooltip />
                <Line type="monotone" dataKey="amount" stroke="#22c55e" strokeWidth={2} dot={false}/>
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="card" style={{gridColumn:'span 1'}}>
          <h4>Member Contributions</h4>
          <div style={{height:260}}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={growth}>
                <XAxis dataKey="month" stroke="#334155" />
                <YAxis stroke="#334155" />
                <Tooltip />
                <Bar dataKey="amount" fill="#38bdf8" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="card" style={{gridColumn:'span 1'}}>
          <h4>Loans vs Repayments</h4>
          <div style={{height:260}}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={loansVs} dataKey="value" nameKey="name" outerRadius={80}>
                  {loansVs.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  )
}





