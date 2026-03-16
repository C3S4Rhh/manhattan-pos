'use client'
import { useState } from 'react'
import { supabase } from '@/lib/supabase'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [cargando, setCargando] = useState(false)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setCargando(true)
    
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      alert("Error: " + error.message)
      setCargando(false)
    } else {
      // Si el login es exitoso, Next.js te enviará a la página principal
      window.location.href = '/' 
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-md bg-white rounded-[3rem] shadow-2xl p-10 border-t-8 border-green-600">
        <div className="text-center mb-10">
          <h1 className="text-4xl font-black text-green-700 italic tracking-tighter">SPINACH 🍱</h1>
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mt-2">Sistema de Gestión</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label className="text-[10px] font-black text-gray-400 uppercase ml-4">Correo Electrónico</label>
            <input 
              type="email" 
              required
              className="w-full mt-1 p-4 bg-gray-50 border-none rounded-2xl font-bold focus:ring-2 focus:ring-green-500 outline-none transition-all"
              placeholder="admin@spinach.com"
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div>
            <label className="text-[10px] font-black text-gray-400 uppercase ml-4">Contraseña</label>
            <input 
              type="password" 
              required
              className="w-full mt-1 p-4 bg-gray-50 border-none rounded-2xl font-bold focus:ring-2 focus:ring-green-500 outline-none transition-all"
              placeholder="••••••••"
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <button 
            disabled={cargando}
            className="w-full bg-green-600 text-white font-black py-4 rounded-2xl uppercase shadow-xl shadow-green-200 hover:bg-green-700 active:scale-95 transition-all disabled:opacity-50"
          >
            {cargando ? 'Verificando...' : 'Entrar al Sistema'}
          </button>
        </form>
      </div>
    </div>
  )
}