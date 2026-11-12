// AI-assisted: see docs/AI_LOG.md #9
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function EstadoPago({ estado }) {
  const estados = {
    approved: 'Aprobado',
    aprobado: 'Aprobado',
    pending: 'Pendiente',
    pendiente: 'Pendiente',
    rejected: 'Rechazado',
    rechazado: 'Rechazado',
    cash: 'Efectivo',
    paid: 'Aprobado',
  };

  const valor = String(estado || '').toLowerCase();

  let color = '#64748B';

  if (['approved', 'aprobado', 'paid', 'cash'].includes(valor)) {
    color = '#16834A';
  } else if (['pending', 'pendiente'].includes(valor)) {
    color = '#B7791F';
  } else if (['rejected', 'rechazado'].includes(valor)) {
    color = '#C0392B';
  }

  return (
    <View style={[styles.contenedor, { backgroundColor: `${color}18` }]}>
      <Text style={[styles.texto, { color }]}>
        {estados[valor] || estado || 'No especificado'}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  contenedor: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 15,
  },
  texto: {
    fontSize: 11,
    fontWeight: '700',
  },
});
