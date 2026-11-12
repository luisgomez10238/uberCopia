import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';

// Los valores coinciden con el campo paymentMethod del viaje
const OPCIONES = [
  { label: 'Todos', value: 'todos' },
  { label: 'Mercado Pago', value: 'mercadopago' },
  { label: 'Stripe', value: 'stripe' },
  { label: 'Efectivo', value: 'cash' },
];

export default function FiltroPago({ valor, onChange }) {
  return (
    <View>
      <Text style={styles.titulo}>Filtrar por método de pago</Text>

      <View style={styles.opciones}>
        {OPCIONES.map((opcion) => (
          <Pressable
            key={opcion.value}
            onPress={() => onChange(opcion.value)}
            style={[styles.opcion, valor === opcion.value && styles.activa]}
          >
            <Text
              style={[styles.textoOpcion, valor === opcion.value && styles.textoActivo]}
            >
              {opcion.label}
            </Text>
          </Pressable>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  titulo: {
    fontSize: 15,
    fontWeight: '700',
    color: '#172B4D',
    marginBottom: 10,
  },
  opciones: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 15,
  },
  opcion: {
    paddingHorizontal: 13,
    paddingVertical: 9,
    borderRadius: 20,
    backgroundColor: '#F1F5F9',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  activa: {
    backgroundColor: '#2563EB',
    borderColor: '#2563EB',
  },
  textoOpcion: {
    color: '#475569',
    fontSize: 12,
    fontWeight: '600',
  },
  textoActivo: {
    color: '#FFFFFF',
  },
});