import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  Pressable,
  ActivityIndicator,
  ScrollView,
  StyleSheet,
} from 'react-native';
import { doc, onSnapshot } from 'firebase/firestore';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { db } from '../../config/firebase';
import { useSession } from '../../context/SessionContext';
import EstadoPago from '../../components/Historial/EstadoPago';
import { marcarEfectivoCobrado } from '../../services/tripService';
import { formatearCOP, ETIQUETA_PAGO } from '../../utils/format';

const AZUL = '#145BB8';

// Cash -> Efectivo; si no, lo que diga la pasarela; si ya está pagado, Aprobado
const estadoDePago = (viaje) => {
  if (viaje.paymentMethod === 'cash') return 'cash';
  if (viaje.paymentStatus) return viaje.paymentStatus;
  return viaje.status === 'paid' ? 'approved' : 'pending';
};

export default function ResumenViajeScreen({ route, navigation }) {
  const { viajeId } = route.params;
  const { usuario } = useSession();
  const uid = usuario?.uid;
  const insets = useSafeAreaInsets();

  const [viaje, setViaje] = useState(null);
  const [error, setError] = useState('');
  const [procesando, setProcesando] = useState(false);

  // El conductor escucha el cambio en tiempo real (por ejemplo, cuando la
  // pasarela confirma el pago y el backend deja el viaje en "paid")
  useEffect(() => {
    const cancelar = onSnapshot(
      doc(db, 'trips', viajeId),
      (documento) => {
        if (documento.exists()) setViaje({ id: documento.id, ...documento.data() });
      },
      () => setError('No se pudo cargar el resumen del viaje.')
    );
    return () => cancelar();
  }, [viajeId]);

  const alCobrarEfectivo = async () => {
    if (procesando) return;
    setProcesando(true);
    setError('');
    try {
      await marcarEfectivoCobrado(viajeId, uid);
    } catch (e) {
      setError(e.message || 'No se pudo registrar el cobro.');
    } finally {
      setProcesando(false);
    }
  };

  const alTerminar = () => navigation.navigate('Drawer');

  if (!viaje) {
    return (
      <View style={styles.cargando}>
        <ActivityIndicator size="large" color={AZUL} />
      </View>
    );
  }

  const esEfectivo = viaje.paymentMethod === 'cash';
  const pagado = viaje.status === 'paid';
  const porcentaje = Math.round((viaje.commissionRate ?? 0) * 100);

  return (
    <View style={styles.pantalla}>
      <ScrollView contentContainerStyle={[styles.contenido, { paddingTop: insets.top + 24 }]}>
        <Text style={styles.titulo}>Resumen del viaje</Text>

        <View style={styles.tarjeta}>
          <Fila etiqueta="Tarifa final" valor={formatearCOP(viaje.fare)} />
          <Fila
            etiqueta={`Comisión de la plataforma (${porcentaje} %)`}
            valor={`- ${formatearCOP(viaje.commission)}`}
          />
          {viaje.tip ? <Fila etiqueta="Propina" valor={`+ ${formatearCOP(viaje.tip)}`} /> : null}
          <View style={styles.separador} />
          <Fila
            etiqueta="Tu ganancia neta"
            valor={formatearCOP(viaje.driverEarnings)}
            destacado
          />
        </View>

        <View style={styles.tarjeta}>
          <Fila
            etiqueta="Método de pago"
            valor={ETIQUETA_PAGO[viaje.paymentMethod] || viaje.paymentMethod || '—'}
          />
          <View style={styles.filaEstado}>
            <Text style={styles.etiqueta}>Estado del pago</Text>
            <EstadoPago estado={estadoDePago(viaje)} />
          </View>
        </View>

        {esEfectivo && !pagado ? (
          <Text style={styles.nota}>
            Cobra {formatearCOP((viaje.fare || 0) + (viaje.tip || 0))} en efectivo al pasajero. Como la
            plataforma no recibe ese dinero, la comisión se descuenta de tu saldo.
          </Text>
        ) : null}

        {!esEfectivo && !pagado ? (
          <Text style={styles.nota}>Esperando la confirmación del pago del pasajero…</Text>
        ) : null}

        {error ? <Text style={styles.error}>{error}</Text> : null}
      </ScrollView>

      <View style={[styles.pie, { paddingBottom: insets.bottom + 16 }]}>
        {esEfectivo && !pagado ? (
          <Pressable
            style={[styles.boton, procesando && styles.deshabilitado]}
            onPress={alCobrarEfectivo}
            disabled={procesando}
          >
            <Text style={styles.textoBoton}>Cobro recibido</Text>
          </Pressable>
        ) : (
          <Pressable style={styles.boton} onPress={alTerminar}>
            <Text style={styles.textoBoton}>Volver al inicio</Text>
          </Pressable>
        )}
      </View>
    </View>
  );
}

function Fila({ etiqueta, valor, destacado }) {
  return (
    <View style={styles.fila}>
      <Text style={[styles.etiqueta, destacado && styles.etiquetaDestacada]}>{etiqueta}</Text>
      <Text style={[styles.valor, destacado && styles.valorDestacado]}>{valor}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  pantalla: { flex: 1, backgroundColor: '#F2F6FC' },
  cargando: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  contenido: { paddingHorizontal: 20, paddingBottom: 24 },
  titulo: { fontSize: 24, fontWeight: '700', color: '#172B4D', marginBottom: 16 },
  tarjeta: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 14,
  },
  fila: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 6,
    gap: 12,
  },
  filaEstado: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 6,
  },
  separador: { height: 1, backgroundColor: '#E2E8F0', marginVertical: 8 },
  etiqueta: { flex: 1, fontSize: 14, color: '#5E6C84' },
  etiquetaDestacada: { fontSize: 16, fontWeight: '700', color: '#172B4D' },
  valor: { fontSize: 15, fontWeight: '600', color: '#172B4D' },
  valorDestacado: { fontSize: 20, fontWeight: '800', color: '#16834A' },
  nota: { fontSize: 13, color: '#5E6C84', lineHeight: 19, marginTop: 4 },
  error: { fontSize: 13, color: '#C0392B', marginTop: 10 },
  pie: { paddingHorizontal: 20, paddingTop: 12, backgroundColor: '#F2F6FC' },
  boton: {
    backgroundColor: AZUL,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  deshabilitado: { opacity: 0.6 },
  textoBoton: { color: '#FFFFFF', fontSize: 16, fontWeight: '700' },
});
