
import React from 'react';
import { ScrollView, StyleSheet, View, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRegistration } from '../context/RegistrationContext';
import FormField from '../components/FormField';
import DropdownField from '../components/DropdownField';
import DateField from '../components/DateField';
import ImagePickerField from '../components/ImagePickerField';
import { GENEROS, IDIOMAS } from '../constants/options';

export default function DatosPersonalesScreen() {
  const { registro, errores, actualizarPersonal, tocarCampo } = useRegistration();
  const { personal } = registro;
  const error = errores.personal;

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
          <Ionicons name="person-outline" size={25} color="#FFFFFF" />
        </View>
        <Text style={styles.titulo}>Datos personales</Text>
        <Text style={styles.subtitulo}>
          Completa tu información para crear tu perfil de conductor.
        </Text>
      </View>

      <View style={styles.tarjeta}>
        <Text style={styles.tituloSeccion}>Fotografía de perfil</Text>
        <Text style={styles.descripcion}>
          Selecciona una fotografía clara de tu rostro.
        </Text>

        <ImagePickerField
          label="Foto de perfil"
          value={personal.fotoPerfil}
          onChange={(uri) => actualizarPersonal('fotoPerfil', uri)}
          error={error.fotoPerfil}
        />
      </View>

      <View style={styles.tarjeta}>
        <View style={styles.encabezadoSeccion}>
          <Ionicons name="person-circle-outline" size={22} color="#1769D2" />
          <Text style={styles.tituloSeccion}>Información básica</Text>
        </View>

        <FormField
          label="Nombre completo"
          value={personal.nombre}
          onChangeText={(texto) => actualizarPersonal('nombre', texto)}
          onBlur={() => tocarCampo('personal', 'nombre')}
          error={error.nombre}
          autoCapitalize="words"
          maxLength={50}
          placeholder="Ej: María Pérez"
        />

        <FormField
          label="Documento de identidad"
          value={personal.documento}
          onChangeText={(texto) => actualizarPersonal('documento', texto)}
          onBlur={() => tocarCampo('personal', 'documento')}
          error={error.documento}
          keyboardType="numeric"
          maxLength={10}
          placeholder="6 a 10 dígitos"
        />

        <FormField
          label="Número de celular"
          value={personal.telefono}
          onChangeText={(texto) => actualizarPersonal('telefono', texto)}
          onBlur={() => tocarCampo('personal', 'telefono')}
          error={error.telefono}
          keyboardType="phone-pad"
          maxLength={10}
          placeholder="10 dígitos"
        />

        <DateField
          label="Fecha de nacimiento"
          value={personal.fechaNacimiento}
          onChange={(fecha) => actualizarPersonal('fechaNacimiento', fecha)}
          error={error.fechaNacimiento}
        />

        <DropdownField
          label="Género"
          value={personal.genero}
          onValueChange={(valor) => actualizarPersonal('genero', valor)}
          options={GENEROS}
          error={error.genero}
        />
      </View>

      <View style={styles.tarjeta}>
        <View style={styles.encabezadoSeccion}>
          <Ionicons name="mail-outline" size={22} color="#1769D2" />
          <Text style={styles.tituloSeccion}>Contacto y preferencias</Text>
        </View>

        <FormField
          label="Correo electrónico"
          value={personal.correo}
          onChangeText={(texto) => actualizarPersonal('correo', texto)}
          onBlur={() => tocarCampo('personal', 'correo')}
          error={error.correo}
          keyboardType="email-address"
          autoCorrect={false}
          placeholder="nombre@dominio.com"
        />

        <DropdownField
          label="Idioma"
          value={personal.idioma}
          onValueChange={(valor) => actualizarPersonal('idioma', valor)}
          options={IDIOMAS}
          error={error.idioma}
        />
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
    marginBottom: 15,
  },
  tituloSeccion: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#172B4D',
    marginBottom: 5,
  },
  descripcion: {
    fontSize: 13,
    color: '#718096',
    marginBottom: 15,
  },
});
