import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const CheckboxField = ({ label, value, onChange, error }) => {
  return (
    <View style={styles.container}>
      <Pressable
        style={styles.fila}
        onPress={() => onChange(!value)}
        accessibilityRole="checkbox"
        accessibilityState={{ checked: !!value }}
      >
        <Ionicons
          name={value ? 'checkbox' : 'square-outline'}
          size={26}
          color={error ? '#D93025' : '#1769D2'}
        />
        <Text style={styles.texto}>{label}</Text>
      </Pressable>

      {error ? <Text style={styles.errorText}>{error}</Text> : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 8,
  },
  fila: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
  },
  texto: {
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
    color: '#222222',
  },
  errorText: {
    color: '#D93025',
    fontSize: 12,
    marginTop: 5,
  },
});

export default CheckboxField;