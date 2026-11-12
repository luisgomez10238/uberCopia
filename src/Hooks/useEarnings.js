
import { useEffect, useMemo, useState } from 'react';

import {
  collection,
  onSnapshot,
  query,
  where,
} from 'firebase/firestore';

import { db } from '../config/firebase';
import { useSession } from '../context/SessionContext';

// Convierte la fecha del viaje en un objeto Date.
const obtenerFecha = (viaje) => {
  const fecha = viaje.completedAt || viaje.createdAt;

  if (!fecha) return null;

  if (typeof fecha.toDate === 'function') {
    return fecha.toDate();
  }

  const resultado = new Date(fecha);

  return Number.isNaN(resultado.getTime()) ? null : resultado;
};

// Convierte los valores monetarios en números.
const obtenerNumero = (valor) => {
  const numero = Number(valor);

  return Number.isFinite(numero) ? numero : 0;
};

// Comprueba si el viaje terminó correctamente.
const esViajeFinalizado = (viaje) => {
  const estado = String(viaje.status || '').toLowerCase();

  return ['completed', 'paid'].includes(estado);
};

// Obtiene las fechas de inicio y final de cada periodo.
const obtenerRango = (periodo) => {
  const ahora = new Date();

  const inicio = new Date(ahora);
  inicio.setHours(0, 0, 0, 0);

  let fin = new Date(inicio);

  if (periodo === 'hoy') {
    fin.setDate(fin.getDate() + 1);
  }

  if (periodo === 'semana') {
    // La semana comienza el lunes.
    const diasDesdeLunes = (inicio.getDay() + 6) % 7;

    inicio.setDate(inicio.getDate() - diasDesdeLunes);

    fin = new Date(inicio);
    fin.setDate(fin.getDate() + 7);
  }

  if (periodo === 'mes') {
    inicio.setDate(1);

    fin = new Date(inicio);
    fin.setMonth(fin.getMonth() + 1);
  }

  return { inicio, fin };
};

// Calcula los seis indicadores de un conjunto de viajes.
const calcularResumen = (viajes) => {
  const totalViajes = viajes.length;

  const totalFacturado = viajes.reduce(
    (total, viaje) => total + obtenerNumero(viaje.fare),
    0
  );

  const totalComisiones = viajes.reduce(
    (total, viaje) => total + obtenerNumero(viaje.commission),
    0
  );

  const totalPropinas = viajes.reduce(
    (total, viaje) => total + obtenerNumero(viaje.tip),
    0
  );

  const gananciaNeta = viajes.reduce(
    (total, viaje) => total + obtenerNumero(viaje.driverEarnings),
    0
  );

  const promedioPorViaje =
    totalViajes > 0 ? gananciaNeta / totalViajes : 0;

  return {
    totalViajes,
    totalFacturado,
    totalComisiones,
    totalPropinas,
    gananciaNeta,
    promedioPorViaje,
  };
};

// Determina si un pago electrónico está confirmado.
const pagoElectronicoConfirmado = (viaje) => {
  const estadoPago = String(
    viaje.paymentStatus || ''
  ).toLowerCase();

  return (
    ['paid', 'approved', 'aprobado', 'completed'].includes(estadoPago) ||
    String(viaje.status || '').toLowerCase() === 'paid'
  );
};

// Hook personalizado para consultar y calcular las ganancias.
export default function useEarnings() {
  const { usuario } = useSession();

  const [viajes, setViajes] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);

  // Escucha en tiempo real los viajes del conductor.
  useEffect(() => {
    if (!usuario?.uid) {
      setViajes([]);
      setCargando(false);
      return;
    }

    setCargando(true);
    setError(null);

    const consulta = query(
      collection(db, 'trips'),
      where('driverId', '==', usuario.uid)
    );

    const cancelar = onSnapshot(
      consulta,
      (snapshot) => {
        const datos = snapshot.docs.map((documento) => ({
          id: documento.id,
          ...documento.data(),
        }));

        setViajes(datos);
        setCargando(false);
      },
      (errorFirebase) => {
        console.error(
          'Error al consultar las ganancias:',
          errorFirebase
        );

        setError(errorFirebase.message);
        setCargando(false);
      }
    );

    // Cancelamos la escucha cuando el componente se desmonta.
    return cancelar;
  }, [usuario?.uid]);

  // Filtra los viajes finalizados y los ordena por fecha.
  const viajesFinalizados = useMemo(() => {
    return viajes
      .filter(esViajeFinalizado)
      .sort((a, b) => {
        const fechaA = obtenerFecha(a)?.getTime() || 0;
        const fechaB = obtenerFecha(b)?.getTime() || 0;

        return fechaB - fechaA;
      });
  }, [viajes]);

  // Calcula los indicadores de hoy.
  const hoy = useMemo(() => {
    const { inicio, fin } = obtenerRango('hoy');

    const viajesHoy = viajesFinalizados.filter((viaje) => {
      const fecha = obtenerFecha(viaje);

      return fecha && fecha >= inicio && fecha < fin;
    });

    return calcularResumen(viajesHoy);
  }, [viajesFinalizados]);

  // Calcula los indicadores de la semana.
  const semana = useMemo(() => {
    const { inicio, fin } = obtenerRango('semana');

    const viajesSemana = viajesFinalizados.filter((viaje) => {
      const fecha = obtenerFecha(viaje);

      return fecha && fecha >= inicio && fecha < fin;
    });

    return calcularResumen(viajesSemana);
  }, [viajesFinalizados]);

  // Calcula los indicadores del mes.
  const mes = useMemo(() => {
    const { inicio, fin } = obtenerRango('mes');

    const viajesMes = viajesFinalizados.filter((viaje) => {
      const fecha = obtenerFecha(viaje);

      return fecha && fecha >= inicio && fecha < fin;
    });

    return calcularResumen(viajesMes);
  }, [viajesFinalizados]);

  // Calcula el saldo del conductor.
  const saldo = useMemo(() => {
    return viajesFinalizados.reduce((total, viaje) => {
      const metodoPago = String(
        viaje.paymentMethod || ''
      ).toLowerCase();

      // En efectivo, el conductor recibe el dinero
      // y debe descontar la comisión de la plataforma.
      if (['cash', 'efectivo'].includes(metodoPago)) {
        return total - obtenerNumero(viaje.commission);
      }

      // En pagos electrónicos, sumamos la ganancia
      // cuando la pasarela confirma el pago.
      if (pagoElectronicoConfirmado(viaje)) {
        return total + obtenerNumero(viaje.driverEarnings);
      }

      return total;
    }, 0);
  }, [viajesFinalizados]);

  return {
    viajes: viajesFinalizados,
    hoy,
    semana,
    mes,
    saldo,
    cargando,
    error,
  };
}
