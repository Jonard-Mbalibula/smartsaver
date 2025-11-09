import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../components/AuthProvider.jsx'
import { useToast } from '../components/Toaster.jsx'

export default function Login(){
  const nav = useNavigate()
  const auth = useAuth()
  const toast = useToast()
  const [form, setForm] = useState({ email:'', password:'' })
  const [loading, setLoading] = useState(false)

  async function onSubmit(e){
    e.preventDefault()
    setLoading(true)
    try{
      await auth.login(form.email, form.password)
      nav('/')
    }catch(err){
      toast.notify(err?.response?.data?.message || 'Login failed', 'error')
    }finally{
      setLoading(false)
    }
  }

  return (
    <div style={{display:'grid', placeItems:'center', minHeight:'80vh'}}>
      <form className="card" onSubmit={onSubmit} style={{width:360, display:'flex', flexDirection:'column', gap:10}}>
        <h3>Sign in</h3>
        <input className="input" placeholder="Email" value={form.email} onChange={e=>setForm({...form, email:e.target.value})} required />
        <input className="input" type="password" placeholder="Password" value={form.password} onChange={e=>setForm({...form, password:e.target.value})} required />
        <button className="button" type="submit" disabled={loading}>{loading? 'Signing in...' : 'Sign in'}</button>
      </form>
    </div>
  )
}










