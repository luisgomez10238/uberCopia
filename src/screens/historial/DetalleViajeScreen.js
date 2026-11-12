// AI-assisted: see docs/AI_LOG.md #9
import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  ScrollView,
  View,
  Text,
  ActivityIndicator,
  StyleSheet,
} from 'react-native';
import MapView, { Marker, Polyline } from 'react-native-maps';
import { Ionicons } from '@expo/vector-icons';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../config/firebase';
import EstadoPago from '../../components/Historial/EstadoPago';
import {
  formatearCOP,
  formatearKm,
  formatearFechaHora,
  ETIQUETA_CATEGORIA,
  ETIQUETA_PAGO,
} from '../../utils/format';

const aCoordenada = (punto) => ({ latitude: punto.lat, longitude: punto.lng });
const esPunto = (p) => typeof p?.lat === 'number' && typeof p?.lng === 'number';

const Fila = ({ etiqueta, valor, fuerte }) => (
  <View style={styles.fila}>
    <Text style={styles.etiqueta}>{etiqueta}</Text>
    <Text style={[styles.valor, fuerte && styles.valorFuerte]}>{valor}</Text>
  </View>
);

const Estrellas = ({ calificacion }) => {
  if (!calificacion) return <Text style={styles.valor}>Sin calificar</Text>;
  return (
    <View style={styles.estrellas}>
      {[1, 2, 3, 4, 5].map((n) => (
        <Ionicons
          key={n}
          name={n <= calificacion ? 'star' : 'star-outline'}
          size={18}
          color="#E8A317"
        />
      ))}
    </View>
  );
};

// Recibe solo el id: el viaje se lee de Firestore (los Timestamp no son
// valores serializables para los parámetros de navegación).
export default function DetalleViajeScreen({ route }) {
  const { viajeId } = route.params;
  const mapRef = useRef(null);

  const [viaje, setViaje] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelado = false;

    getDoc(doc(db, 'trips', viajeId))
      .then((snap) => {
        if (cancelado) return;
        if (snap.exists()) setViaje({ id: snap.id, ...snap.data() });
        else setError('No se encontró el viaje');
      })
      .catch(() => {
        if (!cancelado) setError('No se pudo cargar el viaje');
      })
      .finally(() => {
        if (!cancelado) setCargando(false);
      });

    return () => {
      cancelado = true;
    };
  }, [viajeId]);

  // Ruta guardada del viaje; si no existe, se une origen y destino con una línea recta
  const puntosRuta = useMemo(() => {
    if (!viaje) return [];
    if (Array.isArray(viaje.route) && viaje.route.length > 1) {
      return viaje.route.filter(esPunto).map(aCoordenada);
    }
    return [viaje.origin, viaje.destination].filter(esPunto).map(aCoordenada);
  }, [viaje]);

  const ajustarMapa = () => {
    if (puntosRuta.length > 1) {
      mapRef.current?.fitToCoordinates(puntosRuta, {
        edgePadding: { top: 60, right: 60, bottom: 60, left: 60 },
        animated: false,
      });
    }
  };

  if (cargando) {
    return (
      <View style={styles.centrado}>
        <ActivityIndicator size="large" color="#2563EB" />
      </View>
    );
  }

  if (error || !viaje) {
    return (
      <View style={styles.centrado}>
        <Text style={styles.error}>{error || 'No se pudo cargar el viaje'}</Text>
      </View>
    );
  }

  const estadoPago =
    String(viaje.paymentMethod || '').toLowerCase() === 'cash'
      ? 'cash'
      : viaje.paymentStatus || (viaje.status === 'paid' ? 'approved' : 'pending');

  const tasa =
    typeof viaje.commissionRate === 'number'
      ? `${Math.round(viaje.commissionRate * 100)} %`
      : '';

  return (
    <ScrollView style={styles.pantalla} contentContainerStyle={styles.contenido}>
      {/* Mapa con la ruta dibujada (Polyline), sin llamar a ninguna API */}
      {puntosRuta.length > 1 ? (
        <MapView
          ref={mapRef}
          style={styles.mapa}
          onMapReady={ajustarMapa}
          initialRegion={{
            latitude: puntosRuta[0].latitude,
            longitude: puntosRuta[0].longitude,
            latitudeDelta: 0.05,
            longitudeDelta: 0.05,
          }}
          scrollEnabled={false}
          zoomEnabled={false}
          pitchEnabled={false}
          rotateEnabled={false}
        >
          <Polyline coordinates={puntosRuta} strokeColor="#145BB8" strokeWidth={4} />
          {esPunto(viaje.origin) ? (
            <Marker coordinate={aCoordenada(viaje.origin)} title="Origen" pinColor="green" />
          ) : null}
          {esPunto(viaje.destination) ? (
            <Marker coordinate={aCoordenada(viaje.destination)} title="Destino" pinColor="red" />
          ) : null}
        </MapView>
      ) : (
        <View style={[styles.mapa, styles.sinMapa]}>
          <Text style={styles.etiqueta}>Este viaje no tiene ruta guardada</Text>
        </View>
      )}

      <View style={styles.tarjeta}>
        <View style={styles.encabezado}>
          <Text style={styles.fecha}>{formatearFechaHora(viaje.completedAt)}</Text>
          <EstadoPago estado={estadoPago} />
        </View>

        <Text style={styles.direccion}>
          {viaje.origin?.address || 'Origen no disponible'}
        </Text>
        <Ionicons name="arrow-down" size={16} color="#718096" style={styles.flecha} />
        <Text style={styles.direccion}>
          {viaje.destination?.address || 'Destino no disponible'}
        </Text>
      </View>

      <View style={styles.tarjeta}>
        <Fila etiqueta="Categoría" valor={ETIQUETA_CATEGORIA[viaje.category] ?? viaje.category ?? '—'} />
        <Fila etiqueta="Distancia" valor={formatearKm(viaje.distanceKm)} />
        <Fila etiqueta="Duración" valor={`${viaje.durationMin ?? 0} min`} />
        <Fila etiqueta="Método de pago" valor={ETIQUETA_PAGO[viaje.paymentMethod] ?? '—'} />
      </View>

      <View style={styles.tarjeta}>
        <Fila etiqueta="Tarifa del viaje" valor={formatearCOP(viaje.fare)} />
        <Fila
          etiqueta={tasa ? `Comisión (${tasa})` : 'Comisión'}
          valor={`-${formatearCOP(viaje.commission)}`}
        />
        <Fila etiqueta="Propina" valor={formatearCOP(viaje.tip)} />
        <Fila etiqueta="Tu ganancia neta" valor={formatearCOP(viaje.driverEarnings)} fuerte />
      </View>

      <View style={styles.tarjeta}>
        <View style={styles.fila}>
          <Text style={styles.etiqueta}>Calificación del pasajero</Text>
          <Estrellas calificacion={viaje.rating} />
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  pantalla: { flex: 1, backgroundColor: '#F2F6FC' },
  contenido: { padding: 16, paddingBottom: 40 },
  centrado: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 },
  error: { fontSize: 14, color: '#D93025', textAlign: 'center' },
  mapa: { height: 220, borderRadius: 16, overflow: 'hidden', marginBottom: 14 },
  sinMapa: {
    backgroundColor: '#E4EBF5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  tarjeta: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E4EBF5',
  },
  encabezado: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  fecha: { fontSize: 14, fontWeight: '700', color: '#172B4D' },
  direccion: { fontSize: 14, color: '#172B4D', lineHeight: 20 },
  flecha: { marginVertical: 4 },
  fila: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 7,
  },
  etiqueta: { fontSize: 13, color: '#718096' },
  valor: { fontSize: 14, fontWeight: '600', color: '#172B4D' },
  valorFuerte: { fontSize: 18, fontWeight: 'bold', color: '#1E8E3E' },
  estrellas: { flexDirection: 'row', gap: 2 },
});
