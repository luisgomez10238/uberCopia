// AI-assisted: see docs/AI_LOG.md #3
import React, { useState } from 'react';
import {
  View,
  Text,
  Pressable,
  Modal,
  StyleSheet,
  Platform,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';

const DropdownField = ({
  label,
  value,
  onValueChange,
  options,
  placeholder = 'Selecciona una opción',
  error,
}) => {
  const [modalVisible, setModalVisible] = useState(false);
  const [seleccion, setSeleccion] = useState('');

  const opcionActual = options.find((option) => option.value === value);

  // iOS: abre el selector en un panel inferior con la rueda
  const abrirModal = () => {
    setSeleccion(value || options[0]?.value || '');
    setModalVisible(true);
  };

  const confirmar = () => {
    onValueChange(seleccion);
    setModalVisible(false);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>

      {Platform.OS === 'ios' ? (
        <>
          <Pressable
            style={[styles.input, error ? styles.inputError : null]}
            onPress={abrirModal}
          >
            <Text style={opcionActual ? styles.valor : styles.placeholder}>
              {opcionActual ? opcionActual.label : placeholder}
            </Text>
            <Text style={styles.flecha}>⌄</Text>
          </Pressable>

          <Modal
            visible={modalVisible}
            transparent
            animationType="slide"
            onRequestClose={() => setModalVisible(false)}
          >
            <Pressable
              style={styles.fondo}
              onPress={() => setModalVisible(false)}
            />
            <View style={styles.panel}>
              <View style={styles.barra}>
                <Pressable onPress={() => setModalVisible(false)}>
                  <Text style={styles.botonCancelar}>Cancelar</Text>
                </Pressable>
                <Text style={styles.tituloPanel}>{label}</Text>
                <Pressable onPress={confirmar}>
                  <Text style={styles.botonListo}>Listo</Text>
                </Pressable>
              </View>

              <Picker
                selectedValue={seleccion}
                onValueChange={(nuevo) => setSeleccion(nuevo)}
                itemStyle={styles.itemRueda}
              >
                {options.map((option) => (
                  <Picker.Item
                    key={option.value}
                    label={option.label}
                    value={option.value}
                  />
                ))}
              </Picker>
            </View>
          </Modal>
        </>
      ) : (
        <View
          style={[
            styles.pickerContainer,
            error ? styles.inputError : null,
          ]}
        >
          <Picker
            selectedValue={value}
            onValueChange={onValueChange}
            style={styles.picker}
          >
            <Picker.Item label={placeholder} value="" />

            {options.map((option) => (
              <Picker.Item
                key={option.value}
                label={option.label}
                value={option.value}
              />
            ))}
          </Picker>
        </View>
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

  // Android
  pickerContainer: {
    borderWidth: 1,
    borderColor: '#CCCCCC',
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: '#FFFFFF',
  },

  picker: {
    height: 52,
    width: '100%',
  },

  // iOS: campo que luce igual que un FormField
  input: {
    minHeight: 48,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: '#CCCCCC',
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
  },

  valor: {
    fontSize: 16,
    color: '#222222',
  },

  placeholder: {
    fontSize: 16,
    color: '#888888',
  },

  flecha: {
    fontSize: 18,
    color: '#888888',
  },

  fondo: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.35)',
  },

  panel: {
    backgroundColor: '#FFFFFF',
    paddingBottom: 24,
  },

  barra: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#CCCCCC',
  },

  tituloPanel: {
    fontSize: 15,
    fontWeight: '600',
    color: '#222222',
  },

  botonCancelar: {
    fontSize: 16,
    color: '#888888',
  },

  botonListo: {
    fontSize: 16,
    fontWeight: '600',
    color: '#007AFF',
  },

  itemRueda: {
    color: '#222222',
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

export default DropdownField;