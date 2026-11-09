import React from 'react';
import { ScrollView, StyleSheet, View, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
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
      style={styles.pantalla}
      contentContainerStyle={styles.contenido}
      keyboardShouldPersistTaps="handled"
      automaticallyAdjustKeyboardInsets
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.encabezado}>
        <View style={styles.iconoEncabezado}>
          <Ionicons name="car-sport-outline" size={26} color="#FFFFFF" />
        </View>

        <Text style={styles.titulo}>Datos del vehículo</Text>

        <Text style={styles.subtitulo}>
          Registra la información del vehículo con el que prestarás el servicio.
        </Text>
      </View>

      <View style={styles.tarjeta}>
        <View style={styles.encabezadoSeccion}>
          <Ionicons name="options-outline" size={22} color="#1769D2" />
          <Text style={styles.tituloSeccion}>Tipo de servicio</Text>
        </View>

        <DropdownField
          label="Categoría del vehículo"
          value={vehiculo.categoria}
          onValueChange={(valor) => actualizarVehiculo('categoria', valor)}
          options={CATEGORIAS_VEHICULO}
          error={error.categoria}
        />
      </View>

      <View style={styles.tarjeta}>
        <View style={styles.encabezadoSeccion}>
          <Ionicons name="car-outline" size={22} color="#1769D2" />
          <Text style={styles.tituloSeccion}>Información del vehículo</Text>
        </View>

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

        <View style={styles.fila}>
          <View style={styles.columna}>
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
          </View>

          <View style={styles.columna}>
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
          </View>
        </View>

        <View style={styles.fila}>
          <View style={styles.columna}>
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
          </View>

          <View style={styles.columna}>
            <DropdownField
              label="Color"
              value={vehiculo.color}
              onValueChange={(valor) => actualizarVehiculo('color', valor)}
              options={COLORES_VEHICULO}
              error={error.color}
            />
          </View>
        </View>

        <FormField
          label="Capacidad de pasajeros"
          value={vehiculo.capacidad}
          onChangeText={(texto) => actualizarVehiculo('capacidad', texto)}
          onBlur={() => tocarCampo('vehiculo', 'capacidad')}
          error={error.capacidad}
          keyboardType="numeric"
          maxLength={2}
          placeholder="Ej: 4"
        />
      </View>

      <View style={styles.tarjeta}>
        <View style={styles.encabezadoSeccion}>
          <Ionicons name="camera-outline" size={22} color="#1769D2" />
          <Text style={styles.tituloSeccion}>Fotografía del vehículo</Text>
        </View>

        <Text style={styles.descripcion}>
          Toma una fotografía donde se vea el vehículo completo y su placa.
        </Text>

        <ImagePickerField
          label="Foto del vehículo (la placa debe verse)"
          value={vehiculo.fotoVehiculo}
          onChange={(uri) => actualizarVehiculo('fotoVehiculo', uri)}
          error={error.fotoVehiculo}
        />
      </View>

      <View style={styles.nota}>
        <Ionicons name="information-circle-outline" size={19} color="#1769D2" />
        <Text style={styles.textoNota}>
          Verifica que la placa sea visible y legible en la fotografía.
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  pantalla: {
    flex: 1,
    backgroundColor: '#F2F6FC',
  },
  contenido: {
    padding: 16,
    paddingBottom: 35,
  },
  encabezado: {
    backgroundColor: '#145BB8',
    padding: 22,
    borderRadius: 18,
    marginBottom: 18,
  },
  iconoEncabezado: {
    width: 45,
    height: 45,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.20)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 13,
  },
  titulo: {
    fontSize: 23,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 7,
  },
  subtitulo: {
    fontSize: 14,
    color: '#E5F0FF',
    lineHeight: 21,
  },
  tarjeta: {
    backgroundColor: '#FFFFFF',
    padding: 17,
    borderRadius: 17,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E4EBF5',
  },
  encabezadoSeccion: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 9,
    marginBottom: 16,
  },
  tituloSeccion: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#172B4D',
  },
  descripcion: {
    fontSize: 13,
    color: '#718096',
    marginBottom: 15,
    lineHeight: 19,
  },
  fila: {
    flexDirection: 'row',
    gap: 12,
  },
  columna: {
    flex: 1,
    minWidth: 0,
  },
  nota: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 9,
    paddingHorizontal: 5,
    marginBottom: 10,
  },
  textoNota: {
    flex: 1,
    fontSize: 12,
    color: '#718096',
    lineHeight: 18,
  },
});
