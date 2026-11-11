
import { useCallback, useEffect, useState } from 'react';
import {
  collection,
  getDocs,
  limit,
  orderBy,
  query,
  startAfter,
  where,
} from 'firebase/firestore';

import { db } from '../config/firebase';

const TAMANO_PAGINA = 20;

function obtenerInicioDia(fecha) {
  const resultado = new Date(fecha);
  resultado.setHours(0, 0, 0, 0);
  return resultado;
}

function obtenerRangoFechas(filtro, fechaInicio, fechaFin) {
  const ahora = new Date();

  if (filtro === 'hoy') {
    const inicio = obtenerInicioDia(ahora);
    const fin = new Date(inicio);
    fin.setDate(fin.getDate() + 1);
    return { inicio, fin };
  }

  if (filtro === 'semana') {
    const inicio = obtenerInicioDia(ahora);
    const dia = inicio.getDay();
    inicio.setDate(inicio.getDate() - (dia === 0 ? 6 : dia - 1));

    const fin = new Date(ahora);
    fin.setHours(23, 59, 59, 999);
    return { inicio, fin: new Date(fin.getTime() + 1) };
  }

  if (filtro === 'mes') {
    const inicio = new Date(
      ahora.getFullYear(),
      ahora.getMonth(),
      1
    );
    const fin = new Date(ahora);
    fin.setHours(23, 59, 59, 999);
    return { inicio, fin: new Date(fin.getTime() + 1) };
  }

  if (filtro === 'personalizado') {
    const primera = obtenerInicioDia(fechaInicio);
    const segunda = obtenerInicioDia(fechaFin);

    const inicio = primera <= segunda ? primera : segunda;
    const ultimoDia = primera <= segunda ? segunda : primera;

    const fin = new Date(ultimoDia);
    fin.setDate(fin.getDate() + 1);

    return { inicio, fin };
  }

  return null;
}

export default function useTripHistory(driverId) {
  const [viajes, setViajes] = useState([]);
  const [filtroFecha, setFiltroFecha] = useState('hoy');
  const [filtroPago, setFiltroPago] = useState('todos');

  const [fechaInicio, setFechaInicio] = useState(new Date());
  const [fechaFin, setFechaFin] = useState(new Date());

  const [cargando, setCargando] = useState(true);
  const [cargandoMas, setCargandoMas] = useState(false);
  const [actualizando, setActualizando] = useState(false);
  const [error, setError] = useState('');

  const [ultimoDocumento, setUltimoDocumento] = useState(null);
  const [hayMas, setHayMas] = useState(false);

  const construirConsulta = useCallback((cursor = null) => {
    if (!driverId) return null;

    const condiciones = [
      where('driverId', '==', driverId),
    ];

    const rango = obtenerRangoFechas(
      filtroFecha,
      fechaInicio,
      fechaFin
    );

    if (rango) {
      condiciones.push(
        where('completedAt', '>=', rango.inicio),
        where('completedAt', '<', rango.fin)
      );
    }

    if (filtroPago !== 'todos') {
      condiciones.push(
        where('paymentMethod', '==', filtroPago)
      );
    }

    const partes = [
      collection(db, 'trips'),
      ...condiciones,
      orderBy('completedAt', 'desc'),
    ];

    if (cursor) {
      partes.push(startAfter(cursor));
    }

    partes.push(limit(TAMANO_PAGINA));

    return query(...partes);
  }, [driverId, filtroFecha, filtroPago, fechaInicio, fechaFin]);

  const cargarPrimeraPagina = useCallback(async () => {
    if (!driverId) {
      setViajes([]);
      setCargando(false);
      setError('No se encontró la sesión del conductor.');
      return;
    }

    setCargando(true);
    setError('');
    setUltimoDocumento(null);
    setHayMas(false);

    try {
      const consulta = construirConsulta();
      const resultado = await getDocs(consulta);

      const datos = resultado.docs.map((documento) => ({
        id: documento.id,
        ...documento.data(),
      }));

      setViajes(datos);
      setUltimoDocumento(
        resultado.docs[resultado.docs.length - 1] || null
      );
      setHayMas(resultado.docs.length === TAMANO_PAGINA);
    } catch (errorConsulta) {
      console.error('Error consultando viajes:', errorConsulta);
      setError('No se pudo cargar el historial.');
    } finally {
      setCargando(false);
      setActualizando(false);
    }
  }, [driverId, construirConsulta]);

  const cargarMas = useCallback(async () => {
    if (!ultimoDocumento || !hayMas || cargandoMas) return;

    setCargandoMas(true);

    try {
      const consulta = construirConsulta(ultimoDocumento);
      const resultado = await getDocs(consulta);

      const datos = resultado.docs.map((documento) => ({
        id: documento.id,
        ...documento.data(),
      }));

      setViajes((anteriores) => [...anteriores, ...datos]);

      if (resultado.docs.length > 0) {
        setUltimoDocumento(
          resultado.docs[resultado.docs.length - 1]
        );
      }

      setHayMas(resultado.docs.length === TAMANO_PAGINA);
    } catch (errorConsulta) {
      console.error('Error cargando más viajes:', errorConsulta);
      setError('No se pudieron cargar más viajes.');
    } finally {
      setCargandoMas(false);
    }
  }, [ultimoDocumento, hayMas, cargandoMas, construirConsulta]);

  useEffect(() => {
    cargarPrimeraPagina();
  }, [cargarPrimeraPagina]);

  const actualizar = () => {
    setActualizando(true);
    cargarPrimeraPagina();
  };

  return {
    viajes,
    filtroFecha,
    setFiltroFecha,
    filtroPago,
    setFiltroPago,
    fechaInicio,
    setFechaInicio,
    fechaFin,
    setFechaFin,
    cargando,
    cargandoMas,
    actualizando,
    error,
    hayMas,
    cargarMas,
    actualizar,
  };
}
