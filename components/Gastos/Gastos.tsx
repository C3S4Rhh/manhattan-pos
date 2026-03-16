'use client'
import { useGastosLogic } from '@/hooks/useGastosLogic'
import { estilosGastos } from './UI'

export default function Gastos({ gastos, alTerminar }: any) {
  const {
    concepto, setConcepto, monto, setMonto, fecha, setFecha, notas, setNotas,
    registrarGasto, abrirModal, cerrarModal, confirmarEliminacion, 
    showModal, gastosFiltrados, totalGastos, exportarPDF
  } = useGastosLogic(gastos, alTerminar);

  return (
    <div className={estilosGastos.contenedor}>
      
      {/* FORMULARIO DE REGISTRO */}
      <form onSubmit={registrarGasto} className={estilosGastos.cardForm}>
        <div className="flex justify-between items-center">
          <h2 className="text-[10px] font-black text-red-600 uppercase tracking-[0.2em]">💸 Salida de Efectivo</h2>
          <input 
            type="date" 
            value={fecha} 
            onChange={(e) => setFecha(e.target.value)}
            className="bg-red-50 text-red-600 text-[10px] font-black px-3 py-1 rounded-full uppercase outline-none cursor-pointer border-none" 
          />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-4">
            <input 
              placeholder="¿QUÉ SE GASTÓ? (EJ: CARNE)" 
              value={concepto} 
              onChange={(e) => setConcepto(e.target.value)} 
              className={estilosGastos.input} 
            />
            <div className="relative">
              <span className="absolute left-4 top-4 font-black text-gray-400">Bs</span>
              <input 
                type="number" 
                placeholder="0.00" 
                value={monto} 
                onChange={(e) => setMonto(e.target.value)} 
                className={estilosGastos.input + " pl-12"} 
              />
            </div>
          </div>
          <textarea 
            placeholder="DETALLE (KG, LIBRAS...)" 
            value={notas} 
            onChange={(e) => setNotas(e.target.value)} 
            className={estilosGastos.areaTexto} 
          />
        </div>
        <button className={estilosGastos.botonGuardar}>GUARDAR REGISTRO</button>
      </form>

      {/* LISTA DE REGISTROS Y REPORTES */}
      <div className={estilosGastos.listaContenedor}>
        <div className="flex justify-between items-start mb-6 px-2">
          <div className="space-y-2">
            <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
              Gastos del {new Date(fecha + "T00:00:00").toLocaleDateString('es-BO')}
            </h3>
            <button 
              onClick={exportarPDF}
              className="flex items-center gap-2 bg-red-50 text-red-700 px-4 py-2 rounded-2xl text-[9px] font-black uppercase hover:bg-red-100 transition-all border border-red-100 shadow-sm active:scale-95"
            >
              <span className="text-sm">📄</span> Descargar Reporte PDF
            </button>
          </div>
          <div className="text-right">
            <p className="text-[8px] font-bold text-gray-400 uppercase">Total Egresos</p>
            <p className="text-xl font-black text-red-600">Bs {totalGastos.toFixed(2)}</p>
          </div>
        </div>

        <div className="space-y-3">
          {gastosFiltrados.length > 0 ? (
            gastosFiltrados.map((g: any) => (
              <div key={g.id} className={estilosGastos.itemGasto}>
                <div className="flex justify-between items-center">
                  <div className="flex flex-col">
                    <span className="text-[11px] font-black text-gray-800 uppercase mb-1">{g.concepto}</span>
                    <span className="text-[10px] text-gray-400 font-bold italic">
                      {new Date(g.fecha_gasto || g.creado_at).toLocaleTimeString('es-BO', {hour:'2-digit', minute:'2-digit'})}
                    </span>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-sm font-black text-red-500 bg-white px-4 py-2 rounded-xl shadow-sm italic">
                      - Bs {Number(g.monto).toFixed(2)}
                    </span>
                    <button 
                      onClick={() => abrirModal(g.id)} 
                      className="text-gray-300 hover:text-red-500 transition-colors text-lg"
                    >
                      🗑️
                    </button>
                  </div>
                </div>
                {g.notas && (
                  <div className="text-center mt-4 p-3 bg-red-50/30 rounded-2xl border border-dashed border-red-100 text-[13px] text-gray-600 font-bold italic leading-relaxed">
                    "{g.notas}"
                  </div>
                )}
              </div>
            ))
          ) : (
            <div className="text-center py-12 text-gray-300 text-[10px] font-black uppercase italic tracking-widest">
              No hay gastos registrados en esta fecha
            </div>
          )}
        </div>
      </div>

      {/* MODAL DE CONFIRMACIÓN */}
      {showModal && (
        <div className={estilosGastos.modalOverlay}>
          <div className={estilosGastos.modalCaja}>
            <div className="text-4xl animate-bounce">⚠️</div>
            <h3 className="font-black text-gray-800 uppercase text-sm tracking-tighter">¿Eliminar registro?</h3>
            <p className="text-gray-400 text-[11px] font-bold leading-relaxed px-4">
              Esta acción afectará el balance de **Spinach**.
            </p>
            <div className="flex flex-col gap-2 pt-2">
              <button 
                onClick={confirmarEliminacion} 
                className="bg-red-500 text-white py-4 rounded-2xl font-black text-[10px] uppercase shadow-lg shadow-red-200"
              >
                Sí, eliminar para siempre
              </button>
              <button 
                onClick={cerrarModal} 
                className="text-gray-400 py-2 font-black text-[10px] uppercase hover:text-gray-600 transition-colors"
              >
                No, mantener
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}