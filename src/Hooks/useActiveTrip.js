import { useEffect, useState } from 'react';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { db } from '../config/firebase';

const ESTADOS_ACTIVOS = ['accepted', 'driver_arriving', 'in_progress'];

// Viaje que el conductor tiene en curso (si lo hay). Sirve también para
// retomarlo si cierra y vuelve a abrir la app a mitad del viaje.
export default function useActiveTrip({ driverId }) {
  const [viajeActivo, setViajeActivo] = useState(null);

  useEffect(() => {
    if (!driverId) {
      setViajeActivo(null);
      return undefined;
    }

    const consulta = query(
      collection(db, 'trips'),
      where('driverId', '==', driverId),
      where('status', 'in', ESTADOS_ACTIVOS)
    );

    const cancelar = onSnapshot(
      consulta,
      (resultado) => {
        const documento = resultado.docs[0];
        setViajeActivo(documento ? { id: documento.id, ...documento.data() } : null);
      },
      (error) => console.warn('[viaje] no se pudo escuchar el viaje activo', error?.message)
    );

    return () => cancelar();
  }, [driverId]);

  return { viajeActivo };
}
