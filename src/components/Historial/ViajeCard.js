import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import EstadoPago from './EstadoPago';

const dinero = (valor) =>
  Number(valor || 0).toLocaleString('es-CO', {
    style: 'currency',
    currency: 'COP',
    maximumFractionDigits: 0,
  });

const fechaTexto = (valor) => {
  if (!valor) return 'Fecha no disponible';

  const fecha =
    typeof valor.toDate === 'function'
      ? valor.toDate()
      : new Date(valor);

  if (Number.isNaN(fecha.getTime())) return 'Fecha no disponible';

  return fecha.toLocaleString('es-CO', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

const categoriaTexto = (categoria) => {
  const categorias = {
    economy: 'Económico',
    xl: 'XL',
    premium: 'Premium',
  };

  return categorias[String(categoria || '').toLowerCase()]
    || categoria
    || 'No especificada';
};

const metodoTexto = (metodo) => {
  const metodos = {
    cash: 'Efectivo',
    mercadopago: 'Mercado Pago',
    stripe: 'Stripe',
  };

  return metodos[String(metodo || '').toLowerCase()]
    || 'No especificado';
};

// Estado de pago que se muestra: Aprobado, Pendiente, Rechazado o Efectivo
const estadoDePago = (viaje) => {
  if (String(viaje.paymentMethod || '').toLowerCase() === 'cash') return 'cash';
  if (viaje.paymentStatus) return viaje.paymentStatus;
  return viaje.status === 'paid' ? 'approved' : 'pending';
};

export default function ViajeCard({ viaje, onPress }) {
  const estadoPago = estadoDePago(viaje);

  return (
    <Pressable
      style={styles.tarjeta}
      onPress={onPress}
      accessibilityRole="button"
    >
      <View style={styles.filaSuperior}>
        <View style={styles.fechaContainer}>
          <Ionicons
            name="calendar-outline"
            size={17}
            color="#64748B"
          />
          <Text style={styles.fecha}>
            {fechaTexto(viaje.completedAt)}
          </Text>
        </View>

        <EstadoPago estado={estadoPago} />
      </View>

      <View style={styles.ruta}>
        <View style={styles.iconosRuta}>
          <Ionicons
            name="radio-button-on"
            size={13}
            color="#16834A"
          />
          <View style={styles.lineaRuta} />
          <Ionicons
            name="location"
            size={16}
            color="#2563EB"
          />
        </View>

        <View style={styles.direcciones}>
          <Text style={styles.etiqueta}>ORIGEN</Text>
          <Text style={styles.direccion}>
            {viaje.origin?.address || 'Origen no disponible'}
          </Text>

          <View style={styles.separador} />

          <Text style={styles.etiqueta}>DESTINO</Text>
          <Text style={styles.direccion}>
            {viaje.destination?.address || 'Destino no disponible'}
          </Text>
        </View>
      </View>

      <View style={styles.detalles}>
        <Text style={styles.detalle}>
          <Ionicons name="car-outline" size={15} />{' '}
          {categoriaTexto(viaje.category)}
        </Text>

        <Text style={styles.detalle}>
          {Number(viaje.distanceKm || 0).toFixed(1)} km
        </Text>

        <Text style={styles.detalle}>
          {viaje.durationMin || 0} min
        </Text>
      </View>

      <View style={styles.divisor} />

      <View style={styles.filaDinero}>
        <Text style={styles.textoDinero}>Tarifa del viaje</Text>
        <Text style={styles.valorDinero}>
          {dinero(viaje.fare)}
        </Text>
      </View>

      <View style={styles.filaDinero}>
        <Text style={styles.textoDinero}>Comisión</Text>
        <Text style={styles.valorDinero}>
          {dinero(viaje.commission)}
        </Text>
      </View>

      <View style={styles.filaDinero}>
        <Text style={styles.textoDinero}>Propina</Text>
        <Text style={styles.valorDinero}>
          {dinero(viaje.tip)}
        </Text>
      </View>

      <View style={styles.ganancia}>
        <Text style={styles.textoGanancia}>Tu ganancia</Text>
        <Text style={styles.valorGanancia}>
          {dinero(viaje.driverEarnings)}
        </Text>
      </View>

      <View style={styles.metodo}>
        <Ionicons
          name="wallet-outline"
          size={17}
          color="#64748B"
        />
        <Text style={styles.detalle}>
          Pago: {metodoTexto(viaje.paymentMethod)}
        </Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  tarjeta: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 14,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#E8EDF4',
  },
  filaSuperior: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  fechaContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flex: 1,
  },
  fecha: {
    color: '#64748B',
    fontSize: 12,
  },
  ruta: {
    flexDirection: 'row',
    marginTop: 18,
  },
  iconosRuta: {
    alignItems: 'center',
    marginRight: 12,
    paddingTop: 2,
  },
  lineaRuta: {
    width: 1,
    height: 35,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    marginVertical: 3,
  },
  direcciones: {
    flex: 1,
  },
  etiqueta: {
    color: '#94A3B8',
    fontSize: 10,
    fontWeight: '700',
    marginBottom: 3,
  },
  direccion: {
    color: '#172B4D',
    fontSize: 13,
    fontWeight: '500',
  },
  separador: {
    height: 13,
  },
  detalles: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 15,
    marginTop: 18,
  },
  detalle: {
    color: '#64748B',
    fontSize: 12,
  },
  divisor: {
    height: 1,
    backgroundColor: '#E2E8F0',
    marginVertical: 14,
  },
  filaDinero: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 9,
  },
  textoDinero: {
    color: '#64748B',
    fontSize: 13,
  },
  valorDinero: {
    color: '#334155',
    fontSize: 13,
    fontWeight: '600',
  },
  ganancia: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#EFF6FF',
    padding: 12,
    borderRadius: 9,
    marginTop: 4,
  },
  textoGanancia: {
    color: '#1E40AF',
    fontSize: 14,
    fontWeight: '700',
  },
  valorGanancia: {
    color: '#1D4ED8',
    fontSize: 16,
    fontWeight: 'bold',
  },
  metodo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    marginTop: 13,
  },
});
