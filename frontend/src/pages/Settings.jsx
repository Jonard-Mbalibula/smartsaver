import { useEffect, useState } from 'react'
import { getSettings, updateSettings } from '../lib/api.js'

export default function Settings(){
  const [form, setForm] = useState({ interest_rate: 0.10 })
  const [saving, setSaving] = useState(false)

  useEffect(()=>{ (async()=>{ setForm(await getSettings()) })() },[])

  async function onSubmit(e){
    e.preventDefault()
    setSaving(true)
    try{
      const rateNum = typeof form.interest_rate === 'string' ? Number(form.interest_rate) : form.interest_rate
      await updateSettings({ interest_rate: rateNum })
    } finally {
      setSaving(false)
    }
  }

  return (
    <div>
      <h3>Settings</h3>
      <form className="row" onSubmit={onSubmit} style={{gap:8, margin:'12px 0'}}>
        <label style={{display:'flex', alignItems:'center', gap:8}}>
          <span>Interest Rate</span>
          <input className="input" type="number" step="0.001" value={form.interest_rate}
                 onChange={e=>setForm({...form, interest_rate:e.target.value})} />
        </label>
        <button className="button" type="submit" disabled={saving}>{saving ? 'Saving...' : 'Save'}</button>
      </form>
      <div className="muted">Used when creating new loans.</div>
    </div>
  )
}






