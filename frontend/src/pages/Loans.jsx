import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { createLoan, decideLoan, listLoans, listMembers } from '../lib/api.js'
import { downloadCsv } from '../lib/csv.js'
import { useToast } from '../components/Toaster.jsx'

export default function Loans(){
  const toast = useToast()
  const [members, setMembers] = useState([])
  const [rows, setRows] = useState([])
  const [form, setForm] = useState({ member_id:'', principal:'', due_date: new Date().toISOString().slice(0,10) })
  const [sortKey, setSortKey] = useState('id')
  const [sortDir, setSortDir] = useState('desc')
  const [statusFilter, setStatusFilter] = useState('')

  async function refresh(){ setRows(await listLoans()) }
  useEffect(()=>{ (async()=>{ setMembers(await listMembers()); refresh() })() },[])

  async function onSubmit(e){
    e.preventDefault()
    try{
      await createLoan({ ...form, principal: Number(form.principal) })
      setForm({ member_id:'', principal:'', due_date: new Date().toISOString().slice(0,10) })
      refresh()
    } catch(err){
      toast.notify('Failed to create loan', 'error')
    }
  }

  async function onDecision(id, action){
    try{
      await decideLoan(id, action)
      refresh()
    } catch(err){
      toast.notify('Failed to update loan status', 'error')
    }
  }

  function sortBy(key){
    if (sortKey === key){ setSortDir(d=> d==='asc'?'desc':'asc') } else { setSortKey(key); setSortDir('asc') }
  }
  const filtered = rows.filter(r=> !statusFilter || r.status === statusFilter)
  const sorted = [...filtered].sort((a,b)=>{
    const av = a[sortKey]; const bv = b[sortKey]
    if (av === bv) return 0
    return (av > bv ? 1 : -1) * (sortDir==='asc'?1:-1)
  })

  return (
    <div>
      <h3>Loans</h3>
      <form className="row" onSubmit={onSubmit} style={{gap:8, margin:'12px 0'}}>
        <select className="select" value={form.member_id} onChange={e=>setForm({...form, member_id:e.target.value})} required>
          <option value="">Select member</option>
          {members.map(m=> <option key={m.id} value={m.id}>{m.name}</option>)}
        </select>
        <input className="input" type="number" step="0.01" placeholder="Principal" value={form.principal} onChange={e=>setForm({...form, principal:e.target.value})} required/>
        <input className="input" type="date" value={form.due_date} onChange={e=>setForm({...form, due_date:e.target.value})} required/>
        <button className="button" type="submit">Request</button>
      </form>

      <div className="row" style={{gap:8, margin:'8px 0'}}>
        <select className="select" value={statusFilter} onChange={e=>setStatusFilter(e.target.value)}>
          <option value="">Filter: All status</option>
          <option value="pending">Pending</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
        </select>
        <button className="button" onClick={()=>downloadCsv('loans.csv', sorted)}>Export CSV</button>
      </div>
      <div className="card">
        <table className="table">
          <thead>
            <tr>
              <th style={{cursor:'pointer'}} onClick={()=>sortBy('id')}>ID</th>
              <th>Member</th>
              <th style={{cursor:'pointer'}} onClick={()=>sortBy('principal')}>Principal</th>
              <th style={{cursor:'pointer'}} onClick={()=>sortBy('interest')}>Interest</th>
              <th style={{cursor:'pointer'}} onClick={()=>sortBy('total_payable')}>Total Payable</th>
              <th style={{cursor:'pointer'}} onClick={()=>sortBy('status')}>Status</th>
              <th style={{cursor:'pointer'}} onClick={()=>sortBy('remaining')}>Remaining</th>
              <th style={{cursor:'pointer'}} onClick={()=>sortBy('due_date')}>Due Date</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {sorted.map(r=> (
              <tr key={r.id}>
                <td>{r.id}</td>
                <td><Link to={`/members/${r.member_id}`}>{r.member_id}</Link></td>
                <td>${Number(r.principal).toFixed(2)}</td>
                <td>${Number(r.interest||0).toFixed(2)}</td>
                <td>${Number(r.total_payable||0).toFixed(2)}</td>
                <td>{r.status} {Number(r.remaining||0) <= 0 && (<span className="badge" style={{marginLeft:8}}>Paid</span>)}</td>
                <td>
                  ${Number(r.remaining|| (r.total_payable - 0)).toFixed(2)}
                  {(() => {
                    const total = Number(r.total_payable||0)
                    const remaining = Number(r.remaining||0)
                    const paid = Math.max(0, total - remaining)
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
                <td>{r.due_date}</td>
                <td className="row" style={{gap:8}}>
                  {r.status==='pending' && (<>
                    <button className="button" onClick={()=>onDecision(r.id,'approve')}>Approve</button>
                    <button className="button" onClick={()=>onDecision(r.id,'reject')}>Reject</button>
                  </>)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}





