import { doc, runTransaction, serverTimestamp } from 'firebase/firestore';
import { db } from '../config/firebase';
import { PRICING } from '../config/pricing';
import { calculateFare } from '../utils/calculateFare';

// Cambia el estado del viaje validando dentro de una transacción que
// sigue siendo de este conductor y que está en un estado de origen válido.
const cambiarEstado = (viajeId, uid, desde, hacia, extra = {}, calcular) =>
  runTransaction(db, async (transaccion) => {
    const referencia = doc(db, 'trips', viajeId);
    const resultado = await transaccion.get(referencia);

    if (!resultado.exists()) throw new Error('El viaje ya no existe.');

    const datos = resultado.data();

    if (datos.driverId !== uid) throw new Error('Este viaje no es tuyo.');
    if (!desde.includes(datos.status)) {
      throw new Error('El viaje cambió de estado. Intenta de nuevo.');
    }

    transaccion.update(referencia, {
      status: hacia,
      ...extra,
      ...(calcular ? calcular(datos) : {}),
    });
  });

export const marcarEnCamino = (viajeId, uid) =>
  cambiarEstado(viajeId, uid, ['accepted'], 'driver_arriving', {
    arrivingAt: serverTimestamp(),
  });

export const pasajeroABordo = (viajeId, uid) =>
  cambiarEstado(viajeId, uid, ['accepted', 'driver_arriving'], 'in_progress', {
    startedAt: serverTimestamp(),
  });

export const cancelarViaje = (viajeId, uid) =>
  cambiarEstado(viajeId, uid, ['accepted', 'driver_arriving'], 'cancelled', {
    cancelledAt: serverTimestamp(),
    cancelledBy: 'driver',
  });

// Guarda como máximo `limite` puntos de la ruta para no inflar el documento
const reducirRuta = (puntos = [], limite = 150) => {
  if (puntos.length <= limite) return puntos;
  const paso = Math.ceil(puntos.length / limite);
  return puntos.filter((_, i) => i % paso === 0 || i === puntos.length - 1);
};

// Cierra el viaje con la MISMA función que usa la estimación (calculateFare)
// y guarda el porcentaje de comisión aplicado en ese momento.
export const finalizarViaje = (viajeId, uid, ruta) =>
  cambiarEstado(
    viajeId,
    uid,
    ['in_progress'],
    'completed',
    {
      completedAt: serverTimestamp(),
      commissionRate: PRICING.commissionRate,
      route: reducirRuta(ruta),
    },
    (datos) =>
      calculateFare({
        distanceKm: datos.distanceKm,
        durationMin: datos.durationMin,
        category: datos.category,
        tip: datos.tip || 0,
      })
  );
