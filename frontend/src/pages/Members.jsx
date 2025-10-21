import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { createMember, listMembers } from '../lib/api.js'
import { downloadCsv } from '../lib/csv.js'
import { useToast } from '../components/Toaster.jsx'

export default function Members(){
  const toast = useToast()
  const [rows, setRows] = useState([])
  const [form, setForm] = useState({ name:'', email:'', phone:'', joining_date: new Date().toISOString().slice(0,10) })
  const [filter, setFilter] = useState('')
  const [sortKey, setSortKey] = useState('id')
  const [sortDir, setSortDir] = useState('desc')

  async function refresh(){ setRows(await listMembers()) }
  useEffect(()=>{ refresh() },[])

  async function onSubmit(e){
    e.preventDefault()
    try{
      await createMember(form)
      setForm({ name:'', email:'', phone:'', joining_date: new Date().toISOString().slice(0,10) })
      refresh()
    } catch(err){
      toast.notify('Failed to create member', 'error')
    }
  }

  function sortBy(key){
    if (sortKey === key){ setSortDir(d=> d==='asc'?'desc':'asc') } else { setSortKey(key); setSortDir('asc') }
  }
  const filtered = rows.filter(r=> !filter || r.name.toLowerCase().includes(filter.toLowerCase()))
  const sorted = [...filtered].sort((a,b)=>{
    const av = a[sortKey]; const bv = b[sortKey]
    if (av === bv) return 0
    return (av > bv ? 1 : -1) * (sortDir==='asc'?1:-1)
  })

  return (
    <div>
      <h3>Members</h3>
      <form className="row" onSubmit={onSubmit} style={{gap:8, margin:'12px 0'}}>
        <input className="input" placeholder="Name" value={form.name} onChange={e=>setForm({...form, name:e.target.value})} required/>
        <input className="input" placeholder="Email" value={form.email} onChange={e=>setForm({...form, email:e.target.value})}/>
        <input className="input" placeholder="Phone" value={form.phone} onChange={e=>setForm({...form, phone:e.target.value})}/>
        <input className="input" type="date" value={form.joining_date} onChange={e=>setForm({...form, joining_date:e.target.value})} required/>
        <button className="button" type="submit">Add</button>
      </form>

      <div className="row" style={{gap:8, margin:'8px 0'}}>
        <input className="input" placeholder="Filter by name" value={filter} onChange={e=>setFilter(e.target.value)} />
        <button className="button" onClick={()=>downloadCsv('members.csv', rows)}>Export CSV</button>
      </div>
      <div className="card">
        <table className="table">
          <thead>
            <tr>
              <th style={{cursor:'pointer'}} onClick={()=>sortBy('id')}>ID</th>
              <th style={{cursor:'pointer'}} onClick={()=>sortBy('name')}>Name</th>
              <th>Email</th>
              <th>Phone</th>
              <th style={{cursor:'pointer'}} onClick={()=>sortBy('total_contributions')}>Total Contributions</th>
              <th style={{cursor:'pointer'}} onClick={()=>sortBy('total_loan_payable')}>Total Loan Payable</th>
            </tr>
          </thead>
          <tbody>
            {sorted.map(r=> (
              <tr key={r.id}>
                <td>{r.id}</td>
                <td><Link to={`/members/${r.id}`}>{r.name}</Link></td>
                <td>{r.email||'-'}</td>
                <td>{r.phone||'-'}</td>
                <td>${Number(r.total_contributions||0).toFixed(2)}</td>
                <td>${Number(r.total_loan_payable||0).toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}





