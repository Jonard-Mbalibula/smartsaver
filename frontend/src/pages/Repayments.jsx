import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { createRepayment, listLoans, listRepayments } from '../lib/api.js'
import { useToast } from '../components/Toaster.jsx'

export default function Repayments(){
  const [searchParams] = useSearchParams()
  const toast = useToast()
  const [loans, setLoans] = useState([])
  const [rows, setRows] = useState([])
  const [form, setForm] = useState({ loan_id:'', amount:'', date: new Date().toISOString().slice(0,10) })

  async function refresh(){ setRows(await listRepayments()) }
  useEffect(()=>{ (async()=>{ 
    setLoans(await listLoans()); 
    const q = searchParams.get('loan_id')
    if (q) setForm(f=>({ ...f, loan_id: q }))
    refresh() 
  })() },[searchParams])

  async function onSubmit(e){
    e.preventDefault()
    try{
      await createRepayment({ ...form, amount: Number(form.amount) })
      setForm({ loan_id:'', amount:'', date: new Date().toISOString().slice(0,10) })
      refresh()
    } catch(err){
      toast.notify(err?.response?.data?.message || 'Failed to record repayment', 'error')
    }
  }

  return (
    <div>
      <h3>Repayments</h3>
      <form className="row" onSubmit={onSubmit} style={{gap:8, margin:'12px 0'}}>
        <select className="select" value={form.loan_id} onChange={e=>setForm({...form, loan_id:e.target.value})} required>
          <option value="">Select loan</option>
          {loans.map(l=> <option key={l.id} value={l.id}>#{l.id} - Member {l.member_id} - ${Number(l.total_payable).toFixed(2)}</option>)}
        </select>
        <input className="input" type="number" step="0.01" placeholder="Amount" value={form.amount} onChange={e=>setForm({...form, amount:e.target.value})} required/>
        <input className="input" type="date" value={form.date} onChange={e=>setForm({...form, date:e.target.value})} required/>
        <button className="button" type="submit">Record</button>
      </form>

      <div className="row" style={{gap:8, margin:'8px 0'}}>
        {(() => {
          const loan = loans.find(l=> String(l.id) === String(form.loan_id))
          if (!loan) return null
          const remaining = Number(loan.remaining ?? (loan.total_payable || 0))
          return <span className="badge">Remaining: ${remaining.toFixed(2)}</span>
        })()}
      </div>

      <div className="card">
        <table className="table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Loan</th>
              <th>Amount</th>
              <th>Date</th>
            </tr>
          </thead>
          <tbody>
            {rows.map(r=> (
              <tr key={r.id}>
                <td>{r.id}</td>
                <td>{r.loan_id}</td>
                <td>${Number(r.amount).toFixed(2)}</td>
                <td>{r.date}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}






