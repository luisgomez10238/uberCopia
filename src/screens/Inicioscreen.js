import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  Switch,
  Pressable,
  ActivityIndicator,
  Linking,
  StyleSheet,
} from 'react-native';
import MapView from 'react-native-maps';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useSession } from '../context/SessionContext';
import useDriverLocation from '../Hooks/useDriverLocation';
import {
  actualizarDisponibilidad,
  actualizarUbicacion,
} from '../services/driverStatusService';
import {
  leerUltimoEstadoDisponible,
  guardarUltimoEstadoDisponible,
} from '../utils/preferences';

// AI-assisted: see docs/AI_LOG.md #.
export default function InicioScreen() {
  const { usuario, conductor, cerrarSesion } = useSession();
  const uid = usuario.uid;
  const insets = useSafeAreaInsets();
  const mapRef = useRef(null);

  const [disponible, setDisponible] = useState(false);
  const [preferenciaLista, setPreferenciaLista] = useState(false);

  // Cada posición (máx. cada 5 s) se guarda en Firestore
  const guardarUbicacion = useCallback(
    (coords) => {
      actualizarUbicacion(uid, coords).catch((e) =>
        console.warn('[home] no se pudo guardar la ubicación', e?.message)
      );
    },
    [uid]
  );

  // El seguimiento solo corre si está Disponible y hay permiso (ver el hook)
  const { ubicacion, permiso, error } = useDriverLocation({
    activo: disponible,
    onUbicacion: guardarUbicacion,
  });

  // Estado real: sin permiso de ubicación no puede estar Disponible
  const estaDisponible = disponible && permiso === 'granted';

  // 1) Restaura el último estado guardado en el celular
  useEffect(() => {
    let cancelado = false;
    leerUltimoEstadoDisponible(uid).then((valor) => {
      if (!cancelado) {
        setDisponible(valor);
        setPreferenciaLista(true);
      }
    });
    return () => {
      cancelado = true;
    };
  }, [uid]);

  // 2) Mantiene Firestore sincronizado con el estado real
  useEffect(() => {
    if (!preferenciaLista || permiso === null) return;
    actualizarDisponibilidad(uid, estaDisponible).catch((e) =>
      console.warn('[home] no se pudo guardar la disponibilidad', e?.message)
    );
  }, [uid, preferenciaLista, permiso, estaDisponible]);

  // 3) Al salir de la pantalla queda No disponible en Firestore (mejor esfuerzo)
  useEffect(
    () => () => {
      actualizarDisponibilidad(uid, false).catch(() => {});
    },
    [uid]
  );

  // 4) El mapa sigue al conductor
  useEffect(() => {
    if (!ubicacion || !mapRef.current) return;
    mapRef.current.animateToRegion(
      {
        latitude: ubicacion.lat,
        longitude: ubicacion.lng,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      },
      500
    );
  }, [ubicacion]);

  const alternar = useCallback(
    (valor) => {
      // Solo un conductor aprobado puede ponerse Disponible
      if (valor && conductor?.status !== 'approved') return;
      setDisponible(valor);
      guardarUltimoEstadoDisponible(uid, valor);
    },
    [uid, conductor?.status]
  );

  const salir = async () => {
    // Antes de cerrar sesión (después ya no habría permiso para escribir)
    await actualizarDisponibilidad(uid, false).catch(() => {});
    cerrarSesion();
  };

  const nombre = conductor?.fullName?.split(' ')[0] ?? '';

  return (
    <View style={styles.pantalla}>
      {ubicacion ? (
        <MapView
          ref={mapRef}
          style={StyleSheet.absoluteFill}
          initialRegion={{
            latitude: ubicacion.lat,
            longitude: ubicacion.lng,
            latitudeDelta: 0.01,
            longitudeDelta: 0.01,
          }}
          showsUserLocation
        />
      ) : (
        <View style={styles.cargandoMapa}>
          {permiso === 'denied' ? (
            <Text style={styles.textoSecundario}>
              Necesitamos tu ubicación para mostrar el mapa.
            </Text>
          ) : (
            <ActivityIndicator size="large" color="#145BB8" />
          )}
        </View>
      )}

      {/* Barra superior */}
      <View style={[styles.barraSuperior, { top: insets.top + 10 }]}>
        <Text style={styles.saludo}>Hola{nombre ? `, ${nombre}` : ''}</Text>
        <Pressable onPress={salir}>
          <Text style={styles.cerrarSesion}>Cerrar sesión</Text>
        </Pressable>
      </View>

      {/* Panel de disponibilidad */}
      <View style={[styles.panel, { paddingBottom: insets.bottom + 16 }]}>
        <View style={styles.filaEstado}>
          <View style={styles.textos}>
            <Text style={styles.estado}>
              {estaDisponible ? 'Disponible' : 'No disponible'}
            </Text>
            <Text style={styles.textoSecundario}>
              {estaDisponible
                ? 'Compartiendo tu ubicación para recibir viajes.'
                : 'Actívalo para empezar a recibir solicitudes.'}
            </Text>
          </View>

          <Switch
            value={estaDisponible}
            onValueChange={alternar}
            disabled={permiso !== 'granted' || !preferenciaLista}
            trackColor={{ false: '#C9D3E0', true: '#1E8E3E' }}
          />
        </View>

        {permiso === 'denied' ? (
          <View style={styles.avisoPermiso}>
            <Text style={styles.errorTexto}>
              Activa el permiso de ubicación para poder ponerte Disponible.
            </Text>
            <Pressable onPress={() => Linking.openSettings()}>
              <Text style={styles.enlace}>Abrir ajustes</Text>
            </Pressable>
          </View>
        ) : null}

        {error ? <Text style={styles.errorTexto}>{error}</Text> : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  pantalla: { flex: 1, backgroundColor: '#F2F6FC' },
  cargandoMapa: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 30,
  },
  barraSuperior: {
    position: 'absolute',
    left: 16,
    right: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E4EBF5',
  },
  saludo: { fontSize: 16, fontWeight: 'bold', color: '#172B4D' },
  cerrarSesion: { fontSize: 14, fontWeight: '600', color: '#145BB8' },
  panel: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#FFFFFF',
    paddingTop: 18,
    paddingHorizontal: 20,
    borderTopLeftRadius: 22,
    borderTopRightRadius: 22,
    borderWidth: 1,
    borderColor: '#E4EBF5',
  },
  filaEstado: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  textos: { flex: 1 },
  estado: { fontSize: 20, fontWeight: 'bold', color: '#172B4D', marginBottom: 3 },
  textoSecundario: { fontSize: 13, color: '#718096', lineHeight: 19 },
  avisoPermiso: { marginTop: 12 },
  errorTexto: { fontSize: 13, color: '#D93025', marginTop: 8 },
  enlace: { fontSize: 14, fontWeight: '600', color: '#145BB8', marginTop: 6 },
});