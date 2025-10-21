import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { api } from '../lib/api.js'

const AuthCtx = createContext({ user:null, token:null, login:async()=>{}, logout:()=>{} })
export function useAuth(){ return useContext(AuthCtx) }

export default function AuthProvider({ children }){
  const [token, setToken] = useState(localStorage.getItem('token')||null)
  const [user, setUser] = useState(() => {
    const raw = localStorage.getItem('user'); return raw ? JSON.parse(raw) : null
  })

  useEffect(()=>{
    api.interceptors.request.use(cfg=>{
      if (token) cfg.headers.Authorization = `Bearer ${token}`
      return cfg
    })
  },[token])

  const value = useMemo(()=>({
    user, token,
    async login(email, password){
      const { data } = await api.post('/auth/login', { email, password })
      setToken(data.token); localStorage.setItem('token', data.token)
      setUser(data.user); localStorage.setItem('user', JSON.stringify(data.user))
    },
    logout(){ setToken(null); setUser(null); localStorage.removeItem('token'); localStorage.removeItem('user') }
  }),[user, token])

  return <AuthCtx.Provider value={value}>{children}</AuthCtx.Provider>
}





