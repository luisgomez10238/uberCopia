import React from 'react';
import { ScrollView, StyleSheet } from 'react-native';
import { useRegistration } from '../context/RegistrationContext';
import FormField from '../components/FormField';
import DropdownField from '../components/DropdownField';
import ImagePickerField from '../components/ImagePickerField';
import { CATEGORIAS_VEHICULO, COLORES_VEHICULO } from '../constants/options';

export default function VehiculoScreen() {
  const { registro, errores, actualizarVehiculo, tocarCampo } = useRegistration();
  const { vehiculo } = registro;
  const error = errores.vehiculo;

  return (
    <ScrollView
      contentContainerStyle={styles.contenido}
      keyboardShouldPersistTaps="handled"
      automaticallyAdjustKeyboardInsets
    >
      <DropdownField
        label="Categoría"
        value={vehiculo.categoria}
        onValueChange={(valor) => actualizarVehiculo('categoria', valor)}
        options={CATEGORIAS_VEHICULO}
        error={error.categoria}
      />

      <FormField
        label="Placa"
        value={vehiculo.placa}
        onChangeText={(texto) => actualizarVehiculo('placa', texto)}
        onBlur={() => tocarCampo('vehiculo', 'placa')}
        error={error.placa}
        autoCapitalize="characters"
        autoCorrect={false}
        maxLength={6}
        placeholder="ABC123"
      />

      <FormField
        label="Marca"
        value={vehiculo.marca}
        onChangeText={(texto) => actualizarVehiculo('marca', texto)}
        onBlur={() => tocarCampo('vehiculo', 'marca')}
        error={error.marca}
        autoCapitalize="words"
        maxLength={30}
        placeholder="Ej: Kia"
      />

      <FormField
        label="Modelo"
        value={vehiculo.modelo}
        onChangeText={(texto) => actualizarVehiculo('modelo', texto)}
        onBlur={() => tocarCampo('vehiculo', 'modelo')}
        error={error.modelo}
        autoCapitalize="words"
        maxLength={30}
        placeholder="Ej: Picanto"
      />

      <FormField
        label="Año"
        value={vehiculo.anio}
        onChangeText={(texto) => actualizarVehiculo('anio', texto)}
        onBlur={() => tocarCampo('vehiculo', 'anio')}
        error={error.anio}
        keyboardType="numeric"
        maxLength={4}
        placeholder="Ej: 2020"
      />

      <DropdownField
        label="Color"
        value={vehiculo.color}
        onValueChange={(valor) => actualizarVehiculo('color', valor)}
        options={COLORES_VEHICULO}
        error={error.color}
      />

      <FormField
        label="Capacidad de pasajeros"
        value={vehiculo.capacidad}
        onChangeText={(texto) => actualizarVehiculo('capacidad', texto)}
        onBlur={() => tocarCampo('vehiculo', 'capacidad')}
        error={error.capacidad}
        keyboardType="numeric"
        maxLength={2}
        placeholder="XL: mínimo 6"
      />

      <ImagePickerField
        label="Foto del vehículo (la placa debe verse)"
        value={vehiculo.fotoVehiculo}
        onChange={(uri) => actualizarVehiculo('fotoVehiculo', uri)}
        error={error.fotoVehiculo}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  contenido: {
    padding: 20,
    paddingBottom: 40,
  },
});