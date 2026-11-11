import { useCallback, useEffect, useRef, useState } from 'react';
import { AppState } from 'react-native';
import * as Location from 'expo-location';

/**
 * Ubicación del conductor.
 * - Pide el permiso y obtiene una posición inicial (para pintar el mapa).
 * - Mientras `activo` sea true, sigue la ubicación y llama a `onUbicacion`
 *   cada `intervaloMs` (por defecto 5 s) como máximo.
 * - Al pasar `activo` a false, o al salir de la pantalla, el seguimiento se
 *   detiene (función de limpieza del useEffect).
 */
export default function useDriverLocation({
  activo,
  onUbicacion,
  intervaloMs = 5000,
}) {
  const [ubicacion, setUbicacion] = useState(null); // { lat, lng }
  const [permiso, setPermiso] = useState(null); // null | 'granted' | 'denied'
  const [error, setError] = useState('');

  // Siempre se llama a la versión más reciente del callback sin reiniciar el seguimiento
  const onUbicacionRef = useRef(onUbicacion);
  useEffect(() => {
    onUbicacionRef.current = onUbicacion;
  }, [onUbicacion]);

  // 1) Permiso: se pide al entrar y se revisa al volver de los ajustes del celular
  const revisarPermiso = useCallback(async (pedir) => {
    try {
      const respuesta = pedir
        ? await Location.requestForegroundPermissionsAsync()
        : await Location.getForegroundPermissionsAsync();
      setPermiso(respuesta.status === 'granted' ? 'granted' : 'denied');
    } catch (e) {
      setPermiso('denied');
    }
  }, []);

  useEffect(() => {
    revisarPermiso(true);

    const suscripcion = AppState.addEventListener('change', (estado) => {
      if (estado === 'active') revisarPermiso(false);
    });
    return () => suscripcion.remove();
  }, [revisarPermiso]);

  // 2) Posición inicial (aunque esté No disponible, para mostrar el mapa)
  useEffect(() => {
    if (permiso !== 'granted') return undefined;

    let cancelado = false;
    Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced })
      .then((pos) => {
        if (!cancelado) {
          setUbicacion({ lat: pos.coords.latitude, lng: pos.coords.longitude });
          setError('');
        }
      })
      .catch(() => {
        if (!cancelado) setError('No se pudo obtener tu ubicación');
      });

    return () => {
      cancelado = true;
    };
  }, [permiso]);

  // 3) Seguimiento: solo mientras el conductor está Disponible
  useEffect(() => {
    if (!activo || permiso !== 'granted') return undefined;

    let cancelado = false;
    let seguimiento = null;
    let ultimaEscritura = 0; // 0 => la primera posición se envía de inmediato

    Location.watchPositionAsync(
      {
        accuracy: Location.Accuracy.High,
        timeInterval: intervaloMs, // solo Android
        distanceInterval: 10, // metros (Android e iOS)
      },
      (pos) => {
        const coords = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        setUbicacion(coords);

        // iOS ignora timeInterval, así que el límite se aplica aquí
        const ahora = Date.now();
        if (ahora - ultimaEscritura >= intervaloMs) {
          ultimaEscritura = ahora;
          onUbicacionRef.current?.(coords);
        }
      }
    )
      .then((sub) => {
        if (cancelado) sub.remove(); // ya se salió de la pantalla
        else seguimiento = sub;
      })
      .catch(() => {
        if (!cancelado) setError('No se pudo iniciar el seguimiento de ubicación');
      });

    return () => {
      cancelado = true;
      if (seguimiento) seguimiento.remove();
    };
  }, [activo, permiso, intervaloMs]);

  return { ubicacion, permiso, error };
}