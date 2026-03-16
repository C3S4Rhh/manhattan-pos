'use client'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'

export default function Reportes({ ventas, gastos }: { ventas: any[], gastos: any[] }) {
  const [fecha, setFecha] = useState(new Date().toLocaleDateString('sv-SE'))
  const [nombreCajero, setNombreCajero] = useState('Cargando...')

  // Obtener nombre del cajero al cargar
  useEffect(() => {
    const fetchCajero = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data } = await supabase.from('perfiles').select('nombre, apellido').eq('id', user.id).single();
        if (data) setNombreCajero(`${data.nombre} ${data.apellido}`);
      }
    };
    fetchCajero();
  }, []);
  
  const ventasFiltradas = ventas.filter((v: any) => {
    if (!v.creado_at) return false;
    const fechaVentaLocal = new Date(v.creado_at).toLocaleDateString('sv-SE');
    return fechaVentaLocal === fecha;
  });

  const gastosFiltrados = gastos?.filter((g: any) => {
    const fechaGasto = new Date(g.creado_at).toLocaleDateString('sv-SE');
    return fechaGasto === fecha;
  }) || [];

  const resumen = ventasFiltradas.reduce((acc: any, v: any) => {
    if (!acc.productos[v.nombre_producto]) {
      acc.productos[v.nombre_producto] = { nombre: v.nombre_producto, cantidad: 0, total: 0 }
    }
    acc.productos[v.nombre_producto].cantidad += 1
    acc.productos[v.nombre_producto].total += Number(v.precio_venta)

    const metodo = v.metodo_pago || 'ef';
    acc.metodos[metodo] = (acc.metodos[metodo] || 0) + Number(v.precio_venta);

    return acc
  }, { productos: {}, metodos: { ef: 0, qr: 0, pya: 0 } })
  
  const listaProductos: any[] = Object.values(resumen.productos)
  const totalVentas = listaProductos.reduce((a: number, b: any) => a + b.total, 0);
  const totalGastos = gastosFiltrados.reduce((a: number, b: any) => a + Number(b.monto), 0);
  const efectivoNeto = resumen.metodos.ef - totalGastos;

const imprimirPDF = () => {
    const win = window.open('', '', 'width=800,height=900');
    if (!win) return;

    const fechaFormateada = new Date(fecha + "T00:00:00").toLocaleDateString('es-BO', { dateStyle: 'full' });

    win.document.write(`
      <html>
        <head>
          <title>Reporte Spinach</title>
          <style>
            /* ELIMINA CABECERAS Y PIES DE PÁGINA DEL NAVEGADOR */
            @page { 
              size: auto; 
              margin: 0mm; 
            }
            
            body { 
              font-family: 'Helvetica', sans-serif; 
              padding: 50px; /* Margen interno para que no pegue al borde */
              color: #333; 
              line-height: 1.5; 
              margin: 0;
            }

            .header { text-align: center; border-bottom: 3px solid #15803d; padding-bottom: 10px; margin-bottom: 30px; }
            .header h1 { margin: 0; color: #15803d; text-transform: uppercase; letter-spacing: 3px; font-size: 28px; }
            .header p { margin: 5px 0; font-weight: bold; color: #666; font-size: 12px; }
            
            .info-row { display: flex; justify-content: space-between; margin-bottom: 25px; font-size: 13px; font-weight: bold; background: #f9f9f9; padding: 10px; border-radius: 5px; }
            
            .stats-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 15px; margin-bottom: 30px; }
            .stat-box { padding: 15px; border-radius: 10px; border: 1px solid #ddd; text-align: center; }
            .stat-box small { font-size: 9px; font-weight: 900; text-transform: uppercase; color: #999; display: block; margin-bottom: 5px; }
            .stat-box p { margin: 0; font-size: 16px; font-weight: bold; color: #222; }

            table { width: 100%; border-collapse: collapse; margin-bottom: 30px; }
            th { text-align: left; padding: 12px; border-bottom: 2px solid #333; text-transform: uppercase; font-size: 11px; }
            td { padding: 10px 12px; border-bottom: 1px solid #eee; font-size: 13px; text-transform: uppercase; }
            
            .totales-area { margin-left: auto; width: 280px; margin-top: 20px; }
            .total-item { display: flex; justify-content: space-between; padding: 5px 0; font-size: 13px; }
            .total-final { display: flex; justify-content: space-between; padding: 12px; background: #15803d; color: white; border-radius: 6px; margin-top: 10px; font-weight: bold; font-size: 16px; }
            
            .firma-container { margin-top: 80px; display: flex; justify-content: center; }
            .firma-box { width: 250px; border-top: 1px solid #333; text-align: center; padding-top: 10px; }
            .firma-box p { margin: 0; font-size: 12px; font-weight: bold; text-transform: uppercase; }

            .footer-digital { text-align: center; margin-top: 50px; font-size: 10px; color: #999; border-top: 1px dotted #ccc; padding-top: 10px; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>SPINACH 🍱</h1>
            <p>REPORTE DE CIERRE DIARIO</p>
          </div>

          <div class="info-row">
            <span>FECHA: ${fechaFormateada.toUpperCase()}</span>
            <span>CIERRE: #00${fecha.replace(/-/g, '')}</span>
          </div>

          <div style="margin-bottom: 20px; font-size: 13px;">
            <strong>RESPONSABLE DE CAJA:</strong> <span style="text-transform: uppercase;">${nombreCajero}</span>
          </div>

          <div class="stats-grid">
            <div class="stat-box">
              <small>Efectivo</small>
              <p>Bs ${resumen.metodos.ef.toFixed(2)}</p>
            </div>
            <div class="stat-box">
              <small>QR / Transferencia</small>
              <p>Bs ${resumen.metodos.qr.toFixed(2)}</p>
            </div>
            <div class="stat-box">
              <small>PedidosYa</small>
              <p>Bs ${resumen.metodos.pya.toFixed(2)}</p>
            </div>
          </div>

          <table>
            <thead>
              <tr>
                <th>Producto Vendido</th>
                <th style="text-align: center;">Cant.</th>
                <th style="text-align: right;">Total Bruto</th>
              </tr>
            </thead>
            <tbody>
              ${listaProductos.map(item => `
                <tr>
                  <td>${item.nombre}</td>
                  <td style="text-align: center;">${item.cantidad}</td>
                  <td style="text-align: right;">Bs ${item.total.toFixed(2)}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>

          <div class="totales-area">
            <div class="total-item">
              <span>Subtotal Ventas:</span>
              <span>Bs ${totalVentas.toFixed(2)}</span>
            </div>
            <div class="total-item" style="color: #b91c1c;">
              <span>Total Gastos del Día:</span>
              <span>- Bs ${totalGastos.toFixed(2)}</span>
            </div>
            <div class="total-final">
              <span>EFECTIVO REAL:</span>
              <span>Bs ${efectivoNeto.toFixed(2)}</span>
            </div>
          </div>

          <div class="firma-container">
            <div class="firma-box">
              <p>${nombreCajero}</p>
              <small style="color: #999; font-size: 10px;">Firma del Responsable</small>
            </div>
          </div>

          <div class="footer-digital">
            Documento generado por Spinach POS — ${new Date().toLocaleString('es-BO')}
          </div>

          <script>
            window.onload = () => { 
              window.print(); 
              setTimeout(() => { window.close(); }, 500);
            }
          </script>
        </body>
      </html>
    `);
    win.document.close();
  };

  return (
    <div className="bg-white p-4 md:p-8 rounded-2xl shadow-sm border w-full max-w-4xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h2 className="text-xl md:text-2xl font-black text-green-700 uppercase italic">Gestión de Caja</h2>
          <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Responsable: {nombreCajero}</p>
        </div>
        
        <div className="flex flex-wrap gap-2 w-full md:w-auto">
          <input 
            type="date" 
            value={fecha} 
            onChange={(e) => setFecha(e.target.value)} 
            className="flex-1 md:flex-none p-2 border rounded-xl font-bold outline-green-500 text-sm" 
          />
          <button 
            onClick={imprimirPDF} 
            className="flex-1 md:flex-none bg-green-600 text-white px-6 py-2 rounded-xl font-bold shadow-lg text-sm active:scale-95 transition flex items-center justify-center gap-2"
          >
            DESCARGAR REPORTE 📄
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100 flex flex-col items-center">
          <span className="text-[9px] font-black text-gray-400 uppercase mb-1">Efectivo</span>
          <span className="text-xl font-black text-gray-700 italic">Bs {resumen.metodos.ef.toFixed(2)}</span>
        </div>
        <div className="p-4 bg-blue-50 rounded-2xl border border-blue-100 flex flex-col items-center">
          <span className="text-[9px] font-black text-blue-400 uppercase mb-1">QR</span>
          <span className="text-xl font-black text-blue-700 italic">Bs {resumen.metodos.qr.toFixed(2)}</span>
        </div>
        <div className="p-4 bg-orange-50 rounded-2xl border border-orange-100 flex flex-col items-center">
          <span className="text-[9px] font-black text-orange-400 uppercase mb-1">PedidosYa</span>
          <span className="text-xl font-black text-orange-700 italic">Bs {resumen.metodos.pya.toFixed(2)}</span>
        </div>
      </div>

      <div className="bg-gray-50/50 rounded-3xl p-6 mb-6">
        <p className="text-[10px] font-black text-gray-400 uppercase mb-4 tracking-tighter">Resumen de Ventas</p>
        <div className="space-y-3">
          {listaProductos.length > 0 ? (
            listaProductos.map((item, i) => (
              <div key={i} className="flex justify-between items-center text-sm border-b border-gray-100 pb-2">
                <span className="text-gray-600 uppercase font-black tracking-tighter">{item.nombre} (x{item.cantidad})</span>
                <span className="font-bold text-gray-900">Bs {item.total.toFixed(2)}</span>
              </div>
            ))
          ) : (
            <p className="text-center text-gray-400 text-xs py-4">Sin ventas este día</p>
          )}
        </div>
      </div>

      <div className="p-6 bg-green-700 rounded-3xl text-white flex justify-between items-center shadow-xl">
        <div>
          <span className="font-black uppercase text-[10px] block opacity-70">Saldo Neto en Caja</span>
          <span className="text-3xl font-black italic">Bs {efectivoNeto.toFixed(2)}</span>
        </div>
        <div className="text-right flex flex-col">
          <span className="text-[10px] font-black opacity-70 uppercase">Total Bruto</span>
          <span className="text-lg font-bold">Bs {totalVentas.toFixed(2)}</span>
        </div>
      </div>
    </div>
  )
}