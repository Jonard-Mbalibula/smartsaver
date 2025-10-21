import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { getLoan, listRepayments } from '../lib/api.js'

export default function LoanDetail(){
  const { id } = useParams()
  const [loan, setLoan] = useState(null)
  const [repayments, setRepayments] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(()=>{
    (async()=>{
      try{
        const l = await getLoan(id)
        setLoan(l)
        setRepayments(await listRepayments({ loan_id: id }))
      } finally {
        setLoading(false)
      }
    })()
  },[id])

  if (loading) return <div className="muted">Loading...</div>
  if (!loan) return <div className="muted">Not found</div>

  const remaining = Number(loan.total_payable) - repayments.reduce((s,r)=> s + Number(r.amount), 0)

  return (
    <div>
      <h3>Loan #{loan.id}</h3>
      <div className="card" style={{marginBottom:12}}>
        <div className="row" style={{gap:16}}>
          <div><strong>Member:</strong> <Link to={`/members/${loan.member_id}`}>{loan.member_id}</Link></div>
          <div><strong>Principal:</strong> ${Number(loan.principal).toFixed(2)}</div>
          <div><strong>Interest:</strong> ${Number(loan.interest||0).toFixed(2)}</div>
          <div><strong>Total:</strong> ${Number(loan.total_payable||0).toFixed(2)}</div>
          <div><strong>Status:</strong> {loan.status}</div>
          <div><strong>Due:</strong> {loan.due_date}</div>
          <div><strong>Remaining:</strong> ${remaining.toFixed(2)}</div>
          <div><Link className="button" to={`/repayments?loan_id=${loan.id}`}>Record repayment</Link></div>
        </div>
      </div>

      <div className="card">
        <h4>Repayments</h4>
        <table className="table">
          <thead><tr><th>ID</th><th>Amount</th><th>Date</th></tr></thead>
          <tbody>
            {repayments.map(r=> (
              <tr key={r.id}><td>{r.id}</td><td>${Number(r.amount).toFixed(2)}</td><td>{r.date}</td></tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}






