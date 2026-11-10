import { useEffect, useMemo, useState } from 'react';
import {
  collection,
  onSnapshot,
  query,
  where,
} from 'firebase/firestore';

import { db } from '../config/firebase';
import { useSession } from '../context/Sessioncontext';

// Convierte la fecha almacenada en Firestore a un objeto Date.
const obtenerFecha = (viaje) => {
  const fecha = viaje.completedAt || viaje.createdAt;

  if (!fecha) return null;

  if (typeof fecha.toDate === 'function') {
    return fecha.toDate();
  }

  const resultado = new Date(fecha);

  return Number.isNaN(resultado.getTime()) ? null : resultado;
};

// Convierte los valores monetarios a números.
const obtenerNumero = (valor) => {
  const numero = Number(valor);
  return Number.isFinite(numero) ? numero : 0;
};

// Solo contamos viajes que terminaron correctamente.
const esViajeFinalizado = (viaje) => {
  return ['completed', 'paid'].includes(
    String(viaje.status || '').toLowerCase()
  );
};

// Calcula el inicio y el final de cada periodo.
const obtenerRango = (periodo) => {
  const ahora = new Date();
  let inicio = new Date(ahora);
  let fin = new Date(ahora);

  inicio.setHours(0, 0, 0, 0);

  if (periodo === 'hoy') {
    fin.setDate(fin.getDate() + 1);
  }

  if (periodo === 'semana') {
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

// Calcula los indicadores de un grupo de viajes.
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

  return {
    totalViajes,
    totalFacturado,
    totalComisiones,
    totalPropinas,
    gananciaNeta,
    promedioPorViaje:
      totalViajes > 0 ? gananciaNeta / totalViajes : 0,
  };
};

export default function useEarnings() {
  const { usuario } = useSession();

  const [viajes, setViajes] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);

  // Escucha en tiempo real los viajes del conductor actual.
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
        console.error('Error al consultar ganancias:', errorFirebase);
        setError(errorFirebase.message);
        setCargando(false);
      }
    );

    // Detiene la suscripción cuando el hook se desmonta.
    return cancelar;
  }, [usuario?.uid]);

  // Excluimos los viajes cancelados o que no han finalizado.
  const viajesFinalizados = useMemo(() => {
    return viajes
      .filter(esViajeFinalizado)
      .sort((a, b) => {
        const fechaA = obtenerFecha(a)?.getTime() || 0;
        const fechaB = obtenerFecha(b)?.getTime() || 0;

        return fechaB - fechaA;
      });
  }, [viajes]);

  // Ganancias del día.
  const hoy = useMemo(() => {
    const { inicio, fin } = obtenerRango('hoy');

    const filtrados = viajesFinalizados.filter((viaje) => {
      const fecha = obtenerFecha(viaje);

      return fecha && fecha >= inicio && fecha < fin;
    });

    return calcularResumen(filtrados);
  }, [viajesFinalizados]);

  // Ganancias de la semana (desde el lunes).
  const semana = useMemo(() => {
    const { inicio, fin } = obtenerRango('semana');

    const filtrados = viajesFinalizados.filter((viaje) => {
      const fecha = obtenerFecha(viaje);

      return fecha && fecha >= inicio && fecha < fin;
    });

    return calcularResumen(filtrados);
  }, [viajesFinalizados]);

  // Ganancias del mes actual.
  const mes = useMemo(() => {
    const { inicio, fin } = obtenerRango('mes');

    const filtrados = viajesFinalizados.filter((viaje) => {
      const fecha = obtenerFecha(viaje);

      return fecha && fecha >= inicio && fecha < fin;
    });

    return calcularResumen(filtrados);
  }, [viajesFinalizados]);

  // Saldo: ganancias de pagos electrónicos confirmados
  // menos las comisiones de los viajes en efectivo recibidos.
  const saldo = useMemo(() => {
    return viajesFinalizados.reduce((total, viaje) => {
      const metodo = String(viaje.paymentMethod || '').toLowerCase();
      const estadoPago = String(viaje.paymentStatus || '').toLowerCase();

      const pagoConfirmado =
        ['paid', 'approved', 'aprobado'].includes(estadoPago) ||
        viaje.status === 'paid';

      if (metodo === 'cash') {
        const efectivoRecibido =
          pagoConfirmado ||
          ['cash', 'efectivo'].includes(estadoPago);

        if (efectivoRecibido) {
          return total - obtenerNumero(viaje.commission);
        }
      } else if (pagoConfirmado) {
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
