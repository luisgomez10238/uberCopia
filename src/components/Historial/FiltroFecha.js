
import React, { useState } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';

const OPCIONES = [
  { label: 'Hoy', value: 'hoy' },
  { label: 'Semana', value: 'semana' },
  { label: 'Mes', value: 'mes' },
  { label: 'Personalizado', value: 'personalizado' },
];

export default function FiltroFecha({
  valor,
  onChange,
  fechaInicio,
  setFechaInicio,
  fechaFin,
  setFechaFin,
}) {
  const [mostrarInicio, setMostrarInicio] = useState(false);
  const [mostrarFin, setMostrarFin] = useState(false);

  return (
    <View>
      <Text style={styles.titulo}>Filtrar por fecha</Text>

      <View style={styles.opciones}>
        {OPCIONES.map((opcion) => (
          <Pressable
            key={opcion.value}
            onPress={() => onChange(opcion.value)}
            style={[
              styles.opcion,
              valor === opcion.value && styles.activa,
            ]}
          >
            <Text
              style={[
                styles.textoOpcion,
                valor === opcion.value && styles.textoActivo,
              ]}
            >
              {opcion.label}
            </Text>
          </Pressable>
        ))}
      </View>

      {valor === 'personalizado' && (
        <View style={styles.rango}>
          <Pressable
            style={styles.botonFecha}
            onPress={() => setMostrarInicio(true)}
          >
            <Text style={styles.textoFecha}>
              Desde: {fechaInicio.toLocaleDateString('es-CO')}
            </Text>
          </Pressable>

          <Pressable
            style={styles.botonFecha}
            onPress={() => setMostrarFin(true)}
          >
            <Text style={styles.textoFecha}>
              Hasta: {fechaFin.toLocaleDateString('es-CO')}
            </Text>
          </Pressable>
        </View>
      )}

      {mostrarInicio && (
        <DateTimePicker
          value={fechaInicio}
          mode="date"
          maximumDate={new Date()}
          onChange={(evento, fecha) => {
            setMostrarInicio(false);
            if (fecha) setFechaInicio(fecha);
          }}
        />
      )}

      {mostrarFin && (
        <DateTimePicker
          value={fechaFin}
          mode="date"
          maximumDate={new Date()}
          onChange={(evento, fecha) => {
            setMostrarFin(false);
            if (fecha) setFechaFin(fecha);
          }}
        />
      )}
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
  rango: {
    gap: 8,
    marginBottom: 15,
  },
  botonFecha: {
    backgroundColor: '#EFF6FF',
    padding: 11,
    borderRadius: 9,
  },
  textoFecha: {
    color: '#1D4ED8',
    fontSize: 13,
    fontWeight: '600',
  },
});
