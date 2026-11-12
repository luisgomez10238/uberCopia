import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  Pressable,
  ActivityIndicator,
  BackHandler,
  Alert,
  StyleSheet,
} from 'react-native';
import MapView, { Marker, Polyline } from 'react-native-maps';
import { Ionicons } from '@expo/vector-icons';
import { doc, onSnapshot } from 'firebase/firestore';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { db } from '../../config/firebase';
import { useSession } from '../../context/SessionContext';
import useDriverLocation from '../../Hooks/useDriverLocation';
import { obtenerRuta } from '../../services/directionsService';
import {
  marcarEnCamino,
  pasajeroABordo,
  cancelarViaje,
  finalizarViaje,
} from '../../services/tripService';

const AZUL = '#145BB8';

export default function ViajeEnCursoScreen({ route, navigation }) {
  const { viajeId } = route.params;
  const { usuario } = useSession();
  const uid = usuario?.uid;
  const insets = useSafeAreaInsets();
  const mapRef = useRef(null);

  const [viaje, setViaje] = useState(null);
  const [tramo, setTramo] = useState(null); // { puntos, distanciaKm, duracionMin }
  const [errorRuta, setErrorRuta] = useState('');
  const [error, setError] = useState('');
  const [procesando, setProcesando] = useState(false);
  const ultimoTramo = useRef('');

  // Solo para la posición inicial; el seguimiento en tiempo real lo hace Inicio
  const { ubicacion } = useDriverLocation({ activo: false });
  const tieneUbicacion = !!ubicacion;
  const ubicacionRef = useRef(null);
  ubicacionRef.current = ubicacion;

  const fase = viaje?.status === 'in_progress' ? 'destino' : 'recogida';

  // 1. Escuchar el viaje en tiempo real
  useEffect(() => {
    const cancelar = onSnapshot(
      doc(db, 'trips', viajeId),
      (documento) => {
        if (documento.exists()) setViaje({ id: documento.id, ...documento.data() });
      },
      () => setError('No se pudo seguir el viaje.')
    );
    return () => cancelar();
  }, [viajeId]);

  // 2. accepted -> driver_arriving apenas se abre la pantalla
  useEffect(() => {
    if (viaje?.status === 'accepted') {
      marcarEnCamino(viajeId, uid).catch(() => {});
    }
  }, [viaje?.status, viajeId, uid]);

  // 3. Ruta del tramo actual: una sola consulta por tramo
  useEffect(() => {
    if (!viaje) return;
    if (fase === 'recogida' && !tieneUbicacion) return;

    const clave = `${viaje.id}:${fase}`;
    if (ultimoTramo.current === clave) return;
    ultimoTramo.current = clave;

    const origen =
      fase === 'recogida'
        ? ubicacionRef.current
        : { lat: viaje.origin.lat, lng: viaje.origin.lng };
    const destino =
      fase === 'recogida'
        ? { lat: viaje.origin.lat, lng: viaje.origin.lng }
        : { lat: viaje.destination.lat, lng: viaje.destination.lng };

    setErrorRuta('');
    obtenerRuta(origen, destino)
      .then(setTramo)
      .catch((e) => {
        setTramo(null);
        setErrorRuta(e.message);
      });
  }, [viaje, fase, tieneUbicacion]);

  // 4. Encuadrar el mapa en la ruta
  useEffect(() => {
    if (!tramo?.puntos?.length || !mapRef.current) return;
    mapRef.current.fitToCoordinates(
      tramo.puntos.map((p) => ({ latitude: p.lat, longitude: p.lng })),
      { edgePadding: { top: 120, right: 50, bottom: 300, left: 50 }, animated: true }
    );
  }, [tramo]);

  // 5. Qué hacer cuando el viaje termina o se cancela
  useEffect(() => {
    if (viaje?.status === 'cancelled') navigation.goBack();
    if (viaje?.status === 'completed' || viaje?.status === 'paid') {
      navigation.replace('ResumenViaje', { viajeId });
    }
  }, [viaje?.status, navigation, viajeId]);

  // 6. El viaje no se abandona con "atrás": se finaliza o se cancela
  useEffect(() => {
    const suscripcion = BackHandler.addEventListener('hardwareBackPress', () => true);
    return () => suscripcion.remove();
  }, []);

  const ejecutar = useCallback(async (accion) => {
    if (procesando) return;
    setProcesando(true);
    setError('');
    try {
      await accion();
    } catch (e) {
      setError(e.message || 'No se pudo completar la acción.');
    } finally {
      setProcesando(false);
    }
  }, [procesando]);

  const alPasajeroABordo = () => ejecutar(() => pasajeroABordo(viajeId, uid));
  const alFinalizar = () =>
    ejecutar(() => finalizarViaje(viajeId, uid, tramo?.puntos));
  const alCancelar = () =>
    Alert.alert('Cancelar viaje', '¿Seguro que quieres cancelar este viaje?', [
      { text: 'No', style: 'cancel' },
      {
        text: 'Sí, cancelar',
        style: 'destructive',
        onPress: () => ejecutar(() => cancelarViaje(viajeId, uid)),
      },
    ]);

  if (!viaje) {
    return (
      <View style={styles.cargando}>
        <ActivityIndicator size="large" color={AZUL} />
      </View>
    );
  }

  const haciaRecogida = fase === 'recogida';
  const direccion = haciaRecogida ? viaje.origin?.address : viaje.destination?.address;

  return (
    <View style={styles.pantalla}>
      <MapView
        ref={mapRef}
        style={StyleSheet.absoluteFill}
        showsUserLocation
        initialRegion={{
          latitude: viaje.origin.lat,
          longitude: viaje.origin.lng,
          latitudeDelta: 0.03,
          longitudeDelta: 0.03,
        }}
      >
        <Marker
          coordinate={{ latitude: viaje.origin.lat, longitude: viaje.origin.lng }}
          title="Recogida"
          pinColor="green"
        />
        <Marker
          coordinate={{ latitude: viaje.destination.lat, longitude: viaje.destination.lng }}
          title="Destino"
          pinColor="red"
        />
        {tramo?.puntos?.length ? (
          <Polyline
            coordinates={tramo.puntos.map((p) => ({ latitude: p.lat, longitude: p.lng }))}
            strokeWidth={5}
            strokeColor={AZUL}
          />
        ) : null}
      </MapView>

      <View style={[styles.panel, { paddingBottom: insets.bottom + 16 }]}>
        <Text style={styles.fase}>
          {haciaRecogida ? 'Ve a recoger al pasajero' : 'Lleva al pasajero a su destino'}
        </Text>

        <View style={styles.filaDireccion}>
          <Ionicons
            name={haciaRecogida ? 'location' : 'flag'}
            size={20}
            color={haciaRecogida ? '#16834A' : '#C0392B'}
          />
          <Text style={styles.direccion} numberOfLines={2}>
            {direccion || 'Dirección no disponible'}
          </Text>
        </View>

        {tramo ? (
          <Text style={styles.detalle}>
            {tramo.distanciaKm.toFixed(1)} km · {tramo.duracionMin} min
          </Text>
        ) : errorRuta ? (
          <Text style={styles.error}>{errorRuta}</Text>
        ) : (
          <Text style={styles.detalle}>Calculando ruta…</Text>
        )}

        {error ? <Text style={styles.error}>{error}</Text> : null}

        {haciaRecogida ? (
          <>
            <Pressable
              style={[styles.boton, procesando && styles.deshabilitado]}
              onPress={alPasajeroABordo}
              disabled={procesando}
            >
              <Text style={styles.textoBoton}>Pasajero a bordo</Text>
            </Pressable>
            <Pressable style={styles.botonSecundario} onPress={alCancelar} disabled={procesando}>
              <Text style={styles.textoSecundario}>Cancelar viaje</Text>
            </Pressable>
          </>
        ) : (
          <Pressable
            style={[styles.boton, procesando && styles.deshabilitado]}
            onPress={alFinalizar}
            disabled={procesando}
          >
            <Text style={styles.textoBoton}>Finalizar viaje</Text>
          </Pressable>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  pantalla: { flex: 1, backgroundColor: '#F2F6FC' },
  cargando: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  panel: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    elevation: 10,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 10,
  },
  fase: { fontSize: 18, fontWeight: '700', color: '#172B4D', marginBottom: 12 },
  filaDireccion: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  direccion: { flex: 1, fontSize: 15, color: '#172B4D' },
  detalle: { marginTop: 8, fontSize: 14, color: '#5E6C84' },
  error: { marginTop: 8, fontSize: 13, color: '#C0392B' },
  boton: {
    marginTop: 16,
    backgroundColor: AZUL,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  deshabilitado: { opacity: 0.6 },
  textoBoton: { color: '#FFFFFF', fontSize: 16, fontWeight: '700' },
  botonSecundario: { marginTop: 10, paddingVertical: 10, alignItems: 'center' },
  textoSecundario: { color: '#C0392B', fontSize: 15, fontWeight: '600' },
});
