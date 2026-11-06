import React, { useState } from 'react';
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  Platform,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';

const DateField = ({
  label,
  value,
  onChange,
  error,
}) => {
  const [mostrarSelector, setMostrarSelector] = useState(false);

  const fechaInicial = value || new Date(2000, 0, 1);

  const manejarCambio = (event, fechaSeleccionada) => {
    // Android: el selector es un diálogo que se cierra al elegir o cancelar.
    if (Platform.OS === 'android') {
      setMostrarSelector(false);
    }

    if (event.type === 'dismissed') {
      return;
    }

    if (fechaSeleccionada) {
      onChange(fechaSeleccionada);
    }
  };

  // iOS: el selector (spinner) queda incrustado en la pantalla y no se cierra
  // solo, así que se cierra con el botón "Listo".
  const cerrarSelectorIOS = () => {
    if (!value) {
      onChange(fechaInicial); // si no movió el selector, confirma la fecha mostrada
    }
    setMostrarSelector(false);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>

      <Pressable
        style={[
          styles.input,
          error ? styles.inputError : null,
        ]}
        onPress={() => setMostrarSelector(true)}
      >
        <Text style={value ? styles.fecha : styles.placeholder}>
          {value
            ? value.toLocaleDateString('es-CO')
            : 'Selecciona tu fecha de nacimiento'}
        </Text>
      </Pressable>

      {mostrarSelector && (
        <DateTimePicker
          value={fechaInicial}
          mode="date"
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          maximumDate={new Date()}
          onChange={manejarCambio}
        />
      )}

      {mostrarSelector && Platform.OS === 'ios' && (
        <Pressable style={styles.botonListo} onPress={cerrarSelectorIOS}>
          <Text style={styles.textoListo}>Listo</Text>
        </Pressable>
      )}

      {error ? (
        <Text style={styles.errorText}>{error}</Text>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },

  label: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 6,
    color: '#222222',
  },

  input: {
    minHeight: 48,
    justifyContent: 'center',
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: '#CCCCCC',
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
  },

  fecha: {
    fontSize: 16,
    color: '#222222',
  },

  placeholder: {
    fontSize: 16,
    color: '#888888',
  },

  botonListo: {
    alignSelf: 'flex-end',
    marginTop: 4,
    paddingVertical: 8,
    paddingHorizontal: 16,
  },

  textoListo: {
    fontSize: 16,
    fontWeight: '600',
    color: '#007AFF',
  },

  inputError: {
    borderColor: '#D93025',
  },

  errorText: {
    color: '#D93025',
    fontSize: 12,
    marginTop: 5,
  },
});

export default DateField;