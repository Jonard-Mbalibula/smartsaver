import { createContext, useContext, useMemo, useState } from 'react'

const ToastCtx = createContext({ notify: () => {} })

export function useToast(){ return useContext(ToastCtx) }

export default function Toaster({ children }){
  const [toasts, setToasts] = useState([])
  const api = useMemo(()=>({
    notify(msg, type='error'){
      const id = Math.random().toString(36).slice(2)
      setToasts(t=>[...t, { id, msg, type }])
      setTimeout(()=> setToasts(t=> t.filter(x=>x.id!==id)), 3000)
    }
  }),[])

  return (
    <ToastCtx.Provider value={api}>
      {children}
      <div style={{ position:'fixed', right:16, bottom:16, display:'flex', flexDirection:'column', gap:8 }}>
        {toasts.map(t=> (
          <div key={t.id} className="card" style={{ background: t.type==='error' ? '#3f1d1d' : '#0b1220', borderColor: t.type==='error' ? '#7f1d1d' : '#1f2937' }}>
            {t.msg}
          </div>
        ))}
      </div>
    </ToastCtx.Provider>
  )
}


