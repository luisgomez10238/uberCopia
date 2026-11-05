
import React from 'react';
import {View,Text,StyleSheet,} from 'react-native';
import { Picker } from '@react-native-picker/picker';

const DropdownField = ({
  label,
  value,
  onValueChange,
  options,
  placeholder = 'Selecciona una opción',
  error,
}) => {
  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>

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
          <Picker.Item
            label={placeholder}
            value=""
          />

          {options.map((option) => (
            <Picker.Item
              key={option.value}
              label={option.label}
              value={option.value}
            />
          ))}
        </Picker>
      </View>

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
