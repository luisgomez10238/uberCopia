import React from 'react';
import { ScrollView, StyleSheet } from 'react-native';
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
      contentContainerStyle={styles.contenido}
      keyboardShouldPersistTaps="handled"
      automaticallyAdjustKeyboardInsets
    >
      <ImagePickerField
        label="Foto de perfil"
        value={personal.fotoPerfil}
        onChange={(uri) => actualizarPersonal('fotoPerfil', uri)}
        error={error.fotoPerfil}
      />

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
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  contenido: {
    padding: 20,
    paddingBottom: 40,
  },
});