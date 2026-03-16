import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'

export const useGastosLogic = (gastos: any[], alTerminar: any) => {
  const [concepto, setConcepto] = useState('')
  const [monto, setMonto] = useState('')
  const [fecha, setFecha] = useState(new Date().toISOString().split('T')[0])
  const [notas, setNotas] = useState('')
  
  const [showModal, setShowModal] = useState(false)
  const [idAEliminar, setIdAEliminar] = useState<number | null>(null)

  // Lógica de filtrado y totales
  const gastosFiltrados = gastos?.filter((g: any) => {
    const fechaDb = g.fecha_gasto || g.creado_at || g.created_at
    return new Date(fechaDb).toISOString().split('T')[0] === fecha
  }) || []

  const totalGastos = gastosFiltrados.reduce((acc: number, g: any) => acc + Number(g.monto), 0)

  // Registro en Supabase
  const registrarGasto = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!concepto || !monto) return

    const { error } = await supabase.from('gastos').insert([
      { 
        concepto: concepto.toUpperCase(), 
        monto: Number(monto),
        fecha_gasto: fecha,
        notas: notas 
      }
    ])

    if (!error) {
      setConcepto(''); setMonto(''); setNotas('')
      if (alTerminar) await alTerminar()
    } else {
      alert("Error al guardar: " + error.message)
    }
  }

  const confirmarEliminacion = async () => {
    if (!idAEliminar) return
    const { error } = await supabase.from('gastos').delete().eq('id', idAEliminar)
    if (!error && alTerminar) await alTerminar()
    cerrarModal()
  }

  const abrirModal = (id: number) => {
    setIdAEliminar(id)
    setShowModal(true)
  }

  const cerrarModal = () => {
    setIdAEliminar(null)
    setShowModal(false)
  }

  // FUNCIÓN PDF PROFESIONAL
  const exportarPDF = () => {
    if (gastosFiltrados.length === 0) return alert("No hay datos para exportar en esta fecha");

    const doc = new jsPDF();
    const fechaFormateada = new Date(fecha + "T00:00:00").toLocaleDateString('es-BO');

    // Título centrado y negrita
    doc.setFontSize(18);
    doc.setFont("helvetica", "bold");
    doc.text("GASTOS DE SPINACH", 105, 20, { align: "center" });

    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text(`Reporte de gastos - Fecha: ${fechaFormateada}`, 105, 28, { align: "center" });

    // Configuración de tabla
    const columnas = ["PRODUCTO", "DESCRIPCIÓN", "FECHA", "PRECIO (Bs)"];
    const filas = gastosFiltrados.map(g => [
      g.concepto,
      g.notas || "Sin detalle",
      fechaFormateada,
      Number(g.monto).toFixed(2)
    ]);

    // Fila de total
    filas.push([
      { content: 'TOTAL GENERAL', colSpan: 3, styles: { halign: 'right', fontStyle: 'bold' } }, 
      { content: `${totalGastos.toFixed(2)}`, styles: { fontStyle: 'bold' } }
    ]);

    autoTable(doc, {
      startY: 35,
      head: [columnas],
      body: filas,
      theme: 'grid',
      headStyles: { fillColor: [239, 68, 68], textColor: [255, 255, 255], fontStyle: 'bold', halign: 'center' },
      styles: { fontSize: 9, cellPadding: 4 },
      columnStyles: { 3: { halign: 'right' } }
    });

    doc.save(`Reporte_Gastos_Spinach_${fecha}.pdf`);
  };

  return {
    concepto, setConcepto, monto, setMonto, fecha, setFecha, notas, setNotas,
    registrarGasto, abrirModal, cerrarModal, confirmarEliminacion, 
    showModal, gastosFiltrados, totalGastos, exportarPDF
  }
}