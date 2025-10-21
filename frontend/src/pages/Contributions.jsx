import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { createContribution, listContributions, listMembers } from '../lib/api.js'
import { downloadCsv } from '../lib/csv.js'
import { useToast } from '../components/Toaster.jsx'

export default function Contributions(){
  const toast = useToast()
  const [members, setMembers] = useState([])
  const [rows, setRows] = useState([])
  const [form, setForm] = useState({ member_id:'', amount:'', date: new Date().toISOString().slice(0,10), cycle:'' })
  const totalForSelected = rows.filter(r=> String(r.member_id) === String(form.member_id)).reduce((s,r)=> s + Number(r.amount||0), 0)
  const [sortKey, setSortKey] = useState('date')
  const [sortDir, setSortDir] = useState('desc')
  const [memberFilter, setMemberFilter] = useState('')

  async function refresh(){ setRows(await listContributions()) }
  useEffect(()=>{ (async()=>{ setMembers(await listMembers()); refresh() })() },[])

  async function onSubmit(e){
    e.preventDefault()
    try{
      await createContribution({ ...form, amount: Number(form.amount) })
      setForm({ member_id:'', amount:'', date: new Date().toISOString().slice(0,10), cycle:'' })
      refresh()
    } catch(err){
      toast.notify('Failed to record contribution', 'error')
    }
  }

  function sortBy(key){
    if (sortKey === key){ setSortDir(d=> d==='asc'?'desc':'asc') } else { setSortKey(key); setSortDir('asc') }
  }
  const filtered = rows.filter(r=> !memberFilter || String(r.member_id) === memberFilter)
  const sorted = [...filtered].sort((a,b)=>{
    const av = a[sortKey]; const bv = b[sortKey]
    if (av === bv) return 0
    return (av > bv ? 1 : -1) * (sortDir==='asc'?1:-1)
  })

  return (
    <div>
      <h3>Contributions</h3>
      <form className="row" onSubmit={onSubmit} style={{gap:8, margin:'12px 0'}}>
        <select className="select" value={form.member_id} onChange={e=>setForm({...form, member_id:e.target.value})} required>
          <option value="">Select member</option>
          {members.map(m=> <option key={m.id} value={m.id}>{m.name}</option>)}
        </select>
        <input className="input" type="number" step="0.01" placeholder="Amount" value={form.amount} onChange={e=>setForm({...form, amount:e.target.value})} required/>
        <input className="input" type="date" value={form.date} onChange={e=>setForm({...form, date:e.target.value})} required/>
        <input className="input" placeholder="Cycle (e.g., Week 1)" value={form.cycle} onChange={e=>setForm({...form, cycle:e.target.value})}/>
        <button className="button" type="submit">Record</button>
        {form.member_id && (
          <span className="badge" title="Cumulative contributions for selected member">
            Total: ${totalForSelected.toFixed(2)}
          </span>
        )}
      </form>

      <div className="row" style={{gap:8, margin:'8px 0'}}>
        <select className="select" value={memberFilter} onChange={e=>setMemberFilter(e.target.value)}>
          <option value="">Filter: All members</option>
          {members.map(m=> <option key={m.id} value={String(m.id)}>{m.name}</option>)}
        </select>
        <button className="button" onClick={()=>downloadCsv('contributions.csv', sorted)}>Export CSV</button>
      </div>

      <div className="card">
        <table className="table">
          <thead>
            <tr>
              <th style={{cursor:'pointer'}} onClick={()=>sortBy('id')}>ID</th>
              <th>Member</th>
              <th style={{cursor:'pointer'}} onClick={()=>sortBy('amount')}>Amount</th>
              <th style={{cursor:'pointer'}} onClick={()=>sortBy('date')}>Date</th>
              <th>Cycle</th>
            </tr>
          </thead>
          <tbody>
            {sorted.map(r=> (
              <tr key={r.id}>
                <td>{r.id}</td>
                <td><Link to={`/members/${r.member_id}`}>{r.member_id}</Link></td>
                <td>${Number(r.amount).toFixed(2)}</td>
                <td>{r.date}</td>
                <td>{r.cycle||'-'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}





