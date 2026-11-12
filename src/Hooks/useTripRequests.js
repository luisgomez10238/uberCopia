
import { useState, useEffect, useCallback, useRef } from 'react';

import {
  collection,
  query,
  where,
  onSnapshot,
  doc,
  runTransaction,
  serverTimestamp,
} from 'firebase/firestore';

import { db } from '../config/firebase';
import { calculateFare } from '../utils/calculateFare';

const TIEMPO_SOLICITUD = 15;
// AI-assisted:
export default function useTripRequests({
  driverId,
  activo,
}) {
  const [solicitudActiva, setSolicitudActiva] = useState(null);
  const [segundosRestantes, setSegundosRestantes] =
    useState(TIEMPO_SOLICITUD);

  const [cargandoSolicitud, setCargandoSolicitud] = useState(false);
  const [errorSolicitud, setErrorSolicitud] = useState('');

  const expiracionEnCurso = useRef(null);

  // 1. Escuchar solicitudes pendientes en tiempo real
  useEffect(() => {
    if (!driverId || !activo) {
      setSolicitudActiva(null);
      setSegundosRestantes(TIEMPO_SOLICITUD);
      setCargandoSolicitud(false);
      return undefined;
    }

    setCargandoSolicitud(true);
    setErrorSolicitud('');

    const consulta = query(
      collection(db, 'trips'),
      where('driverId', '==', driverId),
      where('status', '==', 'requested')
    );

    const cancelar = onSnapshot(
      consulta,
      (resultado) => {
        const solicitudes = resultado.docs.map((documento) => {
          const datos = documento.data();

          // Calculamos una estimación con la tarifa configurada
          const estimacion = calculateFare({
            distanceKm: datos.distanceKm,
            durationMin: datos.durationMin,
            category: datos.category,
          });

          return {
            id: documento.id,
            ...datos,
            estimatedFare:
              datos.estimatedFare ?? estimacion.fare,
            estimatedCommission:
              estimacion.commission,
            estimatedDriverEarnings:
              datos.estimatedDriverEarnings ??
              estimacion.driverEarnings,
          };
        });

        // Mostrar primero la solicitud más antigua
        solicitudes.sort((a, b) => {
          const fechaA = a.createdAt?.toMillis?.() ?? 0;
          const fechaB = b.createdAt?.toMillis?.() ?? 0;

          return fechaA - fechaB;
        });

        setSolicitudActiva((actual) => {
          if (actual) {
            const siguePendiente = solicitudes.find(
              (solicitud) => solicitud.id === actual.id
            );

            if (siguePendiente) return siguePendiente;
          }

          return solicitudes[0] ?? null;
        });

        setCargandoSolicitud(false);
      },
      (error) => {
        console.error(
          'Error escuchando solicitudes:',
          error
        );

        setErrorSolicitud(
          'No se pudieron recibir las solicitudes.'
        );

        setCargandoSolicitud(false);
      }
    );

    // Limpiar la suscripción al dejar de estar disponible
    // o al salir de la pantalla
    return () => {
      cancelar();
    };
  }, [driverId, activo]);

  // 2. Rechazar una solicitud
  const rechazarSolicitud = useCallback(
    async (solicitudId, motivo = 'driver_rejected') => {
      if (!driverId || !solicitudId) return;

      const referencia = doc(db, 'trips', solicitudId);

      try {
        await runTransaction(db, async (transaccion) => {
          const resultado = await transaccion.get(referencia);

          if (!resultado.exists()) {
            throw new Error('La solicitud ya no existe.');
          }

          const datos = resultado.data();

          if (
            datos.driverId !== driverId ||
            datos.status !== 'requested'
          ) {
            return;
          }

          transaccion.update(referencia, {
            status: 'rejected',
            rejectedAt: serverTimestamp(),
            rejectedBy: driverId,
            rejectionReason: motivo,
          });
        });

        setSolicitudActiva((actual) =>
          actual?.id === solicitudId ? null : actual
        );

        setSegundosRestantes(TIEMPO_SOLICITUD);
      } catch (error) {
        console.error('Error rechazando solicitud:', error);
        setErrorSolicitud('No se pudo rechazar la solicitud.');
        throw error;
      }
    },
    [driverId]
  );

  // 3. Aceptar una solicitud
  const aceptarSolicitud = useCallback(
    async (solicitudId) => {
      if (!driverId || !solicitudId) return false;

      const referencia = doc(db, 'trips', solicitudId);

      try {
        await runTransaction(db, async (transaccion) => {
          const resultado = await transaccion.get(referencia);

          if (!resultado.exists()) {
            throw new Error('La solicitud ya no existe.');
          }

          const datos = resultado.data();

          if (
            datos.driverId !== driverId ||
            datos.status !== 'requested'
          ) {
            throw new Error(
              'Esta solicitud ya no está disponible.'
            );
          }

          transaccion.update(referencia, {
            status: 'accepted',
            acceptedAt: serverTimestamp(),
          });
        });

        setSolicitudActiva(null);
        setSegundosRestantes(TIEMPO_SOLICITUD);
        return true;

      } catch (error) {
        console.error('Error aceptando solicitud:', error);
        setErrorSolicitud(
          error.message || 'No se pudo aceptar el viaje.'
        );
        throw error;
      }
    },
    [driverId]
  );

  // 4. Temporizador de 15 segundos (calculado con la hora real)
  useEffect(() => {
    if (!solicitudActiva?.id || !activo) {
      setSegundosRestantes(TIEMPO_SOLICITUD);
      return undefined;
    }

    const solicitudId = solicitudActiva.id;
    const limite = Date.now() + TIEMPO_SOLICITUD * 1000;

    expiracionEnCurso.current = null;

    const actualizar = () => {
      const restantes = Math.max(
        0,
        Math.ceil((limite - Date.now()) / 1000)
      );

      setSegundosRestantes(restantes);

      if (restantes <= 0 && expiracionEnCurso.current !== solicitudId) {
        expiracionEnCurso.current = solicitudId;
        clearInterval(intervalo);
        rechazarSolicitud(solicitudId, 'expired').catch(() => {});
      }
    };

    const intervalo = setInterval(actualizar, 500);
    actualizar();

    // Detener el temporizador si cambia la solicitud
    // o se desmonta el componente
    return () => clearInterval(intervalo);
  }, [solicitudActiva?.id, activo, rechazarSolicitud]);

  return {
    solicitudActiva,
    segundosRestantes,
    cargandoSolicitud,
    errorSolicitud,
    aceptarSolicitud,
    rechazarSolicitud,
  };
}
