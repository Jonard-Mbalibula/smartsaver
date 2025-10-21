import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { getMemberProfile, exportMemberStatementPdf, exportMemberSavingsCsv } from '../lib/api.js'
import { Link } from 'react-router-dom'

export default function MemberProfile(){
  const { id } = useParams()
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(()=>{
    (async()=>{
      try{
        setData(await getMemberProfile(id))
      } finally {
        setLoading(false)
      }
    })()
  },[id])

  if (loading) return <div className="muted">Loading...</div>
  if (!data?.member) return <div className="muted">Not found</div>

  const { member, contributions, loans, repayments } = data

  const totalPayable = loans.reduce((s,l)=> s + Number(l.total_payable||0), 0)
  const totalRepaid = repayments.reduce((s,r)=> s + Number(r.amount||0), 0)
  const totalRemaining = Math.max(0, totalPayable - totalRepaid)

  return (
    <div>
      <h3>Member Profile</h3>
      <div className="card" style={{marginBottom:12}}>
        <div className="row" style={{gap:16, justifyContent:'space-between'}}>
          <div className="row" style={{gap:16}}>
            <div><strong>Name:</strong> {member.name}</div>
            <div><strong>Email:</strong> {member.email||'-'}</div>
            <div><strong>Phone:</strong> {member.phone||'-'}</div>
            <div><strong>Joined:</strong> {member.joining_date}</div>
          </div>
          <button className="button" onClick={async()=>{
            const blob = await exportMemberStatementPdf(member.id)
            const url = URL.createObjectURL(blob); const a = document.createElement('a'); a.href = url; a.download = `member_${member.id}_statement.pdf`; a.click(); URL.revokeObjectURL(url)
          }}>Download Statement (PDF)</button>
          <button className="button" onClick={async()=>{
            const blob = await exportMemberSavingsCsv(member.id)
            const url = URL.createObjectURL(blob); const a = document.createElement('a'); a.href = url; a.download = `member_${member.id}_savings.csv`; a.click(); URL.revokeObjectURL(url)
          }}>Download Savings (CSV)</button>
        </div>
      </div>

      <div className="grid">
        <div className="card" style={{gridColumn:'span 3'}}>
          <h4>Summary</h4>
          <div className="row" style={{gap:24, marginTop:6}}>
            <div><strong>Total Payable:</strong> ${totalPayable.toFixed(2)}</div>
            <div><strong>Total Repaid:</strong> ${totalRepaid.toFixed(2)}</div>
            <div><strong>Remaining:</strong> ${totalRemaining.toFixed(2)}</div>
            {totalRemaining <= 0 && <span className="badge">All loans paid</span>}
          </div>
        </div>
        <div className="card">
          <h4>Contributions</h4>
          <table className="table">
            <thead><tr><th>ID</th><th>Amount</th><th>Date</th><th>Cycle</th></tr></thead>
            <tbody>
              {contributions.map(c=> (
                <tr key={c.id}><td>{c.id}</td><td>${Number(c.amount).toFixed(2)}</td><td>{c.date}</td><td>{c.cycle||'-'}</td></tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="card">
          <h4>Loans</h4>
          <table className="table">
            <thead><tr><th>ID</th><th>Principal</th><th>Interest</th><th>Total</th><th>Status</th><th>Due</th><th>Remaining</th><th>Actions</th></tr></thead>
            <tbody>
              {loans.map(l=> {
                const repaid = repayments.filter(r=> r.loan_id === l.id).reduce((s,r)=> s + Number(r.amount), 0)
                const remaining = Number(l.total_payable) - repaid
                return (
                  <tr key={l.id}>
                    <td><Link to={`/loans/${l.id}`}>{l.id}</Link></td>
                    <td>${Number(l.principal).toFixed(2)}</td>
                    <td>${Number(l.total_payable - l.principal).toFixed(2)}</td>
                    <td>${Number(l.total_payable).toFixed(2)}</td>
                    <td>{l.status} {remaining <= 0 && (<span className="badge" style={{marginLeft:8}}>Paid</span>)}</td>
                    <td>{l.due_date}</td>
                    <td>
                      ${remaining.toFixed(2)}
                      {(() => {
                        const total = Number(l.total_payable||0)
                        const paid = Math.max(0, total - Number(remaining))
                        const pct = total > 0 ? Math.min(100, Math.max(0, (paid / total) * 100)) : 0
                        const color = pct < 33 ? '#ef4444' : pct < 67 ? '#f59e0b' : '#22c55e'
                        return (
                          <div className="row" style={{gap:8, marginTop:6}}>
                            <div className="progress" style={{ width:140 }}>
                              <span style={{ width: `${pct}%`, background: color }} />
                            </div>
                            <span className="muted" style={{minWidth:46}}>{pct.toFixed(0)}%</span>
                          </div>
                        )
                      })()}
                    </td>
                    <td><Link to={`/repayments?loan_id=${l.id}`}>Record repayment</Link></td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
        <div className="card">
          <h4>Repayments</h4>
          <table className="table">
            <thead><tr><th>ID</th><th>Loan</th><th>Amount</th><th>Date</th></tr></thead>
            <tbody>
              {repayments.map(r=> (
                <tr key={r.id}><td>{r.id}</td><td>{r.loan_id}</td><td>${Number(r.amount).toFixed(2)}</td><td>{r.date}</td></tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}






