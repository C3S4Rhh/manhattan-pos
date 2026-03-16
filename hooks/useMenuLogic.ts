'use client'
import { useState } from 'react'
import { api } from '@/lib/api'
import { supabase } from '@/lib/supabase'

export const useMenuLogic = (alTerminar: any) => {
  const [cliente, setCliente] = useState('')
  const [notas, setNotas] = useState('')
  const [carrito, setCarrito] = useState<any[]>([])
  const [showModal, setShowModal] = useState(false)
  const [datosParaImprimir, setDatosParaImprimir] = useState<any>(null)

  const gestionarCarrito = (p: any, accion: 'sumar' | 'restar') => {
    const existe = carrito.find(item => item.id === p.id);
    if (accion === 'sumar') {
      if (p.stock <= (existe?.cantidad || 0)) return alert("¡Sin stock!");
      if (existe) {
        setCarrito(carrito.map(i => i.id === p.id ? { ...i, cantidad: i.cantidad + 1 } : i));
      } else {
        setCarrito([...carrito, { ...p, cantidad: 1 }]);
      }
    } else {
      if (!existe) return;
      if (existe.cantidad > 1) {
        setCarrito(carrito.map(i => i.id === p.id ? { ...i, cantidad: i.cantidad - 1 } : i));
      } else {
        setCarrito(carrito.filter(i => i.id !== p.id));
      }
    }
  };

  // --- CAMBIO: Ahora handleConfirmar recibe el método de pago ---
  const handleConfirmar = async (metodo: string) => {
    if (!cliente.trim() || carrito.length === 0) return alert("Datos incompletos");
    const totalPedido = carrito.reduce((a, b) => a + (b.precio * b.cantidad), 0);
    
    try {
      // Enviamos cliente, carrito, notas y el nuevo parámetro metodo
      const { error } = await api.registrarPedido(cliente, carrito, notas, metodo);
      
      if (!error) {
        const hoy = new Date();
        hoy.setHours(0, 0, 0, 0);
        const hoyISO = hoy.toISOString();

        const { data: vHoy } = await supabase
          .from('ventas')
          .select('creado_at')
          .gte('creado_at', hoyISO);
        
        const nroPedido = new Set(vHoy?.map(v => v.creado_at)).size;
        
        setDatosParaImprimir({
          cliente: cliente,
          carrito: [...carrito],
          total: totalPedido,
          notas: notas,
          metodo: metodo, // Guardamos el método para el ticket si lo necesitas
          nro: `#${nroPedido}`
        });

        setShowModal(true); 
      } else { 
        alert("Error al registrar"); 
      }
    } catch (err) { 
      console.error(err);
      alert("Error de conexión"); 
    }
  };

  const finalizarTodo = () => {
    setShowModal(false);
    setCarrito([]); 
    setCliente(''); 
    setNotas('');
    setDatosParaImprimir(null);
    if (alTerminar) alTerminar();
  };

  return {
    cliente, setCliente, 
    notas, setNotas, 
    carrito, setCarrito,
    gestionarCarrito, 
    handleConfirmar, 
    showModal, 
    setShowModal,
    datosParaImprimir, 
    finalizarTodo
  };
};