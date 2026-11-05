
import React from 'react';
import {
  View,
  Text,
  Pressable,
  Image,
  StyleSheet,
  Alert,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';

const ImagePickerField = ({
  label,
  value,
  onChange,
  error,
}) => {
  const seleccionarImagen = () => {
    Alert.alert(
      'Seleccionar imagen',
      '¿De dónde quieres obtener la imagen?',
      [
        {
          text: 'Cancelar',
          style: 'cancel',
        },
        {
          text: 'Galería',
          onPress: abrirGaleria,
        },
        {
          text: 'Cámara',
          onPress: abrirCamara,
        },
      ]
    );
  };

  const abrirGaleria = async () => {
    const resultado =
      await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

    if (!resultado.canceled) {
      onChange(resultado.assets[0].uri);
    }
  };

  const abrirCamara = async () => {
    const permiso =
      await ImagePicker.requestCameraPermissionsAsync();

    if (!permiso.granted) {
      Alert.alert(
        'Permiso necesario',
        'Debes permitir el acceso a la cámara para tomar una foto.'
      );
      return;
    }

    const resultado =
      await ImagePicker.launchCameraAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

    if (!resultado.canceled) {
      onChange(resultado.assets[0].uri);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>

      <Pressable
        style={[
          styles.selector,
          error ? styles.inputError : null,
        ]}
        onPress={seleccionarImagen}
      >
        {value ? (
          <Image
            source={{ uri: value }}
            style={styles.imagen}
          />
        ) : (
          <View style={styles.placeholder}>
            <Text style={styles.icono}>+</Text>
            <Text style={styles.textoPlaceholder}>
              Seleccionar imagen
            </Text>
          </View>
        )}
      </Pressable>

      {error ? (
        <Text style={styles.errorText}>{error}</Text>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 20,
  },

  label: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
    color: '#222222',
  },

  selector: {
    minHeight: 150,
    borderWidth: 1,
    borderColor: '#CCCCCC',
    borderRadius: 10,
    overflow: 'hidden',
    backgroundColor: '#FFFFFF',
  },

  placeholder: {
    minHeight: 150,
    alignItems: 'center',
    justifyContent: 'center',
  },

  icono: {
    fontSize: 32,
    color: '#666666',
  },

  textoPlaceholder: {
    fontSize: 14,
    color: '#666666',
  },

  imagen: {
    width: '100%',
    height: 200,
    resizeMode: 'cover',
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

export default ImagePickerField;
