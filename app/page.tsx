'use client'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import Menu from '@/components/Menu'
import Tickets from '@/components/Tickets'
import Reportes from '@/components/Reportes'
import Gestion from '@/components/Gestion'
import Gastos from '@/components/Gastos'
import Balance from '@/components/Balance'

export default function Home() {
  const [vista, setVista] = useState('menu')
  const [productos, setProductos] = useState<any[]>([])
  const [ventas, setVentas] = useState<any[]>([])
  const [gastos, setGastos] = useState<any[]>([])
  
  // ESTADOS PARA SEGURIDAD
  const [rol, setRol] = useState<'admin' | 'cajero'>('cajero')
  const [mostrarPin, setMostrarPin] = useState(false)
  const [pinIngresado, setPinIngresado] = useState('')

  const PIN_CORRECTO = "1234" // Tu clave secreta

  const cargarDatos = async () => {
    const { data: p } = await supabase.from('productos').select('*').order('nombre')
    const { data: v } = await supabase.from('ventas').select('*').order('creado_at', { ascending: false })
    const { data: g } = await supabase.from('gastos').select('*').order('created_at', { ascending: false })
    
    if (p) setProductos(p)
    if (v) setVentas([...v])
    if (g) setGastos([...g])
  }

  useEffect(() => { cargarDatos() }, [vista])

  // Lógica del Teclado
  const manejarTecla = (num: string) => {
    if (pinIngresado.length < 4) {
      const nuevoPin = pinIngresado + num
      setPinIngresado(nuevoPin)
      
      if (nuevoPin === PIN_CORRECTO) {
        setRol('admin')
        setMostrarPin(false)
        setPinIngresado('')
      } else if (nuevoPin.length === 4) {
        alert("PIN INCORRECTO")
        setPinIngresado('')
      }
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-10 font-sans">
      {/* MODAL DEL TECLADO NUMÉRICO */}
      {mostrarPin && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 w-full max-w-xs shadow-2xl text-center">
            <h2 className="text-gray-400 font-black text-xs uppercase mb-4 tracking-widest">Acceso Administrador</h2>
            <div className="flex justify-center gap-3 mb-8">
              {[1, 2, 3, 4].map((_, i) => (
                <div key={i} className={`w-4 h-4 rounded-full border-2 border-purple-200 ${pinIngresado.length > i ? 'bg-purple-600 border-purple-600' : 'bg-gray-100'}`} />
              ))}
            </div>
            <div className="grid grid-cols-3 gap-3">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(n => (
                <button key={n} onClick={() => manejarTecla(n.toString())} className="h-14 bg-gray-50 rounded-2xl text-xl font-black text-gray-700 active:bg-purple-100 active:text-purple-700 transition-colors">{n}</button>
              ))}
              <button onClick={() => { setMostrarPin(false); setPinIngresado(''); }} className="h-14 bg-red-50 text-red-500 rounded-2xl font-black text-xs">EXIT</button>
              <button onClick={() => manejarTecla('0')} className="h-14 bg-gray-50 rounded-2xl text-xl font-black text-gray-700">0</button>
              <button onClick={() => setPinIngresado('')} className="h-14 bg-gray-50 text-gray-400 rounded-2xl font-black text-xs">DEL</button>
            </div>
          </div>
        </div>
      )}

      <header className="bg-white shadow-md mb-4 sticky top-0 z-50 print:hidden text-center p-4">
        <div className="flex justify-between items-center max-w-5xl mx-auto mb-2">
           <h1 className="text-xl font-black text-orange-600 uppercase tracking-tighter">SPINACH 🍱</h1>
           <button 
             onClick={() => rol === 'admin' ? setRol('cajero') : setMostrarPin(true)}
             className={`px-3 py-1 rounded-full text-[9px] font-black uppercase border-2 transition-all ${rol === 'admin' ? 'border-purple-600 bg-purple-50 text-purple-600' : 'border-gray-200 text-gray-400'}`}
           >
             {rol === 'admin' ? '🔓 ADMIN' : '🔒 CAJERO'}
           </button>
        </div>

        <div className="flex gap-2 overflow-x-auto pb-2 justify-start md:justify-center no-scrollbar">
          <button onClick={() => setVista('menu')} className={`px-4 py-2 rounded-xl text-[11px] font-black uppercase flex-shrink-0 ${vista === 'menu' ? 'bg-orange-500 text-white' : 'bg-gray-100 text-gray-500'}`}>Vender 💰</button>
          {rol === 'admin' && (
            <>
              <button onClick={() => setVista('gastos')} className={`px-4 py-2 rounded-xl text-[11px] font-black uppercase flex-shrink-0 ${vista === 'gastos' ? 'bg-red-500 text-white' : 'bg-gray-100 text-gray-500'}`}>Gastos 💸</button>
              <button onClick={() => setVista('balance')} className={`px-4 py-2 rounded-xl text-[11px] font-black uppercase flex-shrink-0 ${vista === 'balance' ? 'bg-green-600 text-white' : 'bg-gray-100 text-gray-500'}`}>Balance 📊</button>
            </>
          )}
          <button onClick={() => setVista('reporte')} className={`px-4 py-2 rounded-xl text-[11px] font-black uppercase flex-shrink-0 ${vista === 'reporte' ? 'bg-black text-white' : 'bg-gray-100 text-gray-500'}`}>Cierre 🖨️</button>
          <button onClick={() => setVista('historial')} className={`px-4 py-2 rounded-xl text-[11px] font-black uppercase flex-shrink-0 ${vista === 'historial' ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-500'}`}>Tickets 🕒</button>
          <button onClick={() => setVista('admin')} className={`px-4 py-2 rounded-xl text-[11px] font-black uppercase flex-shrink-0 ${vista === 'admin' ? 'bg-purple-600 text-white' : 'bg-gray-100 text-gray-500'}`}>Gestión ⚙️</button>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-2">
        {vista === 'menu' && <Menu productos={productos} ventas={ventas} alTerminar={cargarDatos} />}
        {vista === 'gastos' && rol === 'admin' && <Gastos gastos={gastos} alTerminar={cargarDatos} />}
        {vista === 'balance' && rol === 'admin' && <Balance ventas={ventas} gastos={gastos} />}
        {vista === 'reporte' && <Reportes ventas={ventas} gastos={gastos} />}
        {vista === 'historial' && <Tickets ventas={ventas} alTerminar={cargarDatos} />}
        {vista === 'admin' && <Gestion productos={productos} alTerminar={cargarDatos} />}
      </main>
    </div>
  )
}