
import React, { useRef, useState } from 'react';

import {
  View,
  Text,
  Pressable,
  Image,
  StyleSheet,
  Alert,
  Modal,
} from 'react-native';

import * as ImagePicker from 'expo-image-picker';
import {
  CameraView,
  useCameraPermissions,
} from 'expo-camera';

import { Ionicons } from '@expo/vector-icons';

const ImagePickerField = ({
  label,
  value,
  onChange,
  error,
}) => {

  const cameraRef = useRef(null);

  const [permission, requestPermission] =
    useCameraPermissions();

  const [camaraVisible, setCamaraVisible] =
    useState(false);

  const [camaraLista, setCamaraLista] =
    useState(false);

  // Identificar el tipo de fotografía
  const textoLabel = (label || '').toLowerCase();

  const esPerfil = textoLabel.includes('perfil');

  const esVehiculo =
    textoLabel.includes('vehículo') ||
    textoLabel.includes('vehiculo');

  // Seleccionar origen de imagen
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

  // Abrir galería
  const abrirGaleria = async () => {
    const resultado =
      await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: esPerfil ? [1, 1] : [4, 3],
        quality: 0.8,
      });

    if (!resultado.canceled) {
      onChange(resultado.assets[0].uri);
    }
  };

  // Abrir cámara personalizada
  const abrirCamara = async () => {
    if (!permission?.granted) {
      const respuesta = await requestPermission();

      if (!respuesta.granted) {
        Alert.alert(
          'Permiso necesario',
          'Debes permitir el acceso a la cámara.'
        );
        return;
      }
    }

    setCamaraLista(false);
    setCamaraVisible(true);
  };

  // Tomar fotografía
  const tomarFoto = async () => {
    if (!cameraRef.current || !camaraLista) {
      return;
    }

    try {
      const foto = await cameraRef.current.takePictureAsync({
        quality: 0.8,
      });

      if (foto?.uri) {
        onChange(foto.uri);
        setCamaraVisible(false);
      }
    } catch (error) {
      Alert.alert(
        'Error',
        'No fue posible tomar la fotografía.'
      );
    }
  };

  return (
    <View style={styles.container}>

      {/* LABEL */}
      <Text style={styles.label}>
        {label}
      </Text>

      {/* IMAGEN PRINCIPAL */}
      <View
        style={[
          styles.contenedorImagen,
          esPerfil
            ? styles.contenedorPerfil
            : styles.contenedorVehiculo,
        ]}
      >

        <Pressable
          onPress={seleccionarImagen}
          style={[
            styles.selector,
            esPerfil ? styles.perfil : styles.vehiculo,
            error ? styles.inputError : null,
          ]}
        >

          {value ? (
            <Image
              source={{ uri: value }}
              style={styles.imagen}
            />
          ) : (
            <View style={styles.placeholder}>

              <Ionicons
                name={
                  esPerfil
                    ? 'person'
                    : 'car-sport'
                }
                size={esPerfil ? 65 : 75}
                color="#999999"
              />

              <Text style={styles.textoPlaceholder}>
                {esPerfil
                  ? 'Foto de perfil'
                  : 'Foto del vehículo'}
              </Text>

            </View>
          )}

        </Pressable>

        {/* BOTÓN DE CÁMARA */}
        <Pressable
          style={[
            styles.botonCamara,
            esPerfil
              ? styles.botonCamaraPerfil
              : styles.botonCamaraVehiculo,
          ]}
          onPress={seleccionarImagen}
        >
          <Ionicons
            name="camera"
            size={20}
            color="#FFFFFF"
          />
        </Pressable>

      </View>

      {/* MENSAJE DE ERROR */}
      {error ? (
        <Text style={styles.errorText}>
          {error}
        </Text>
      ) : null}


      {/* ================================= */}
      {/* CÁMARA PERSONALIZADA */}
      {/* ================================= */}

      <Modal
        visible={camaraVisible}
        animationType="slide"
        onRequestClose={() => setCamaraVisible(false)}
      >

        <View style={styles.pantallaCamara}>

          {/* CÁMARA FRONTAL O TRASERA */}
          <CameraView
            ref={cameraRef}
            style={StyleSheet.absoluteFill}
            facing={esPerfil ? 'front' : 'back'}
            onCameraReady={() => setCamaraLista(true)}
          />

          {/* GUÍA SUPERPUESTA */}
          <View
            style={styles.capaGuia}
            pointerEvents="none"
          >

            <Text style={styles.instruccionCamara}>
              {esPerfil
                ? 'Ubica tu rostro dentro del círculo'
                : 'Encuadra el vehículo y asegúrate de que la placa sea visible'}
            </Text>

            {esPerfil ? (

              /* GUÍA PARA FOTO DE PERFIL */
              <View style={styles.guiaPerfil}>

                <Ionicons
                  name="person"
                  size={90}
                  color="rgba(255,255,255,0.35)"
                />

              </View>

            ) : (

              /* GUÍA PARA FOTO DEL VEHÍCULO */
              <View style={styles.guiaVehiculo}>

                <Text style={styles.textoGuia}>
                  VEHÍCULO
                </Text>

                <View style={styles.guiaPlaca}>
                  <Text style={styles.textoPlaca}>
                    PLACA
                  </Text>
                </View>

              </View>

            )}

          </View>

          {/* CONTROLES DE CÁMARA */}
          <View style={styles.controlesCamara}>

            <Pressable
              style={styles.botonCerrar}
              onPress={() => setCamaraVisible(false)}
            >
              <Ionicons
                name="close"
                size={28}
                color="#FFFFFF"
              />
            </Pressable>

            <Pressable
              style={[
                styles.botonCapturar,
                !camaraLista && styles.botonDeshabilitado,
              ]}
              onPress={tomarFoto}
              disabled={!camaraLista}
            >
              <View style={styles.circuloCaptura} />
            </Pressable>

            <View style={styles.espacioControl} />

          </View>

        </View>

      </Modal>

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
    marginBottom: 12,
    color: '#222222',
  },

  contenedorImagen: {
    position: 'relative',
    alignSelf: 'center',
  },

  contenedorPerfil: {
    width: 130,
    height: 130,
  },

  contenedorVehiculo: {
    width: '100%',
    height: 180,
  },

  selector: {
    overflow: 'hidden',
    backgroundColor: '#F0F0F0',
    borderWidth: 1,
    borderColor: '#CCCCCC',
    alignItems: 'center',
    justifyContent: 'center',
  },

  perfil: {
    width: 130,
    height: 130,
    borderRadius: 65,
  },

  vehiculo: {
    width: '100%',
    height: 180,
    borderRadius: 12,
  },

  placeholder: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
  },

  textoPlaceholder: {
    fontSize: 13,
    color: '#777777',
  },

  imagen: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },

  botonCamara: {
    position: 'absolute',
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#2563EB',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: '#FFFFFF',
  },

  botonCamaraPerfil: {
    bottom: 0,
    right: 0,
  },

  botonCamaraVehiculo: {
    bottom: 8,
    right: 8,
  },

  inputError: {
    borderColor: '#D93025',
    borderWidth: 2,
  },

  errorText: {
    color: '#D93025',
    fontSize: 12,
    marginTop: 5,
  },

  // PANTALLA DE CÁMARA

  pantallaCamara: {
    flex: 1,
    backgroundColor: '#000000',
  },

  capaGuia: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 60,
  },

  instruccionCamara: {
    position: 'absolute',
    top: 65,
    left: 25,
    right: 25,
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
    backgroundColor: 'rgba(0,0,0,0.45)',
    padding: 12,
    borderRadius: 10,
  },

  // CÍRCULO PARA EL ROSTRO

  guiaPerfil: {
    width: 270,
    height: 270,
    borderRadius: 135,
    borderWidth: 3,
    borderColor: '#FFFFFF',
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.04)',
    marginTop: 200,
  },

  // RECTÁNGULO PARA EL VEHÍCULO

  guiaVehiculo: {
    width: '90%',
    height: '48%',
    borderWidth: 3,
    borderColor: '#FFFFFF',
    borderRadius: 15,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    marginTop: 200,
  },

  textoGuia: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: 'bold',
    backgroundColor: 'rgba(0,0,0,0.5)',
    padding: 6,
    borderRadius: 5,
  },

  // GUÍA ADICIONAL PARA LA PLACA

  guiaPlaca: {
    width: '65%',
    height: 45,
    borderWidth: 2,
    borderColor: '#FFD700',
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },

  textoPlaca: {
    color: '#FFD700',
    fontWeight: 'bold',
    fontSize: 13,
  },

  // BOTONES DE CÁMARA

  controlesCamara: {
    position: 'absolute',
    bottom: 45,
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
  },

  botonCerrar: {
    width: 50,
    height: 50,
    alignItems: 'center',
    justifyContent: 'center',
  },

  botonCapturar: {
    width: 75,
    height: 75,
    borderRadius: 40,
    borderWidth: 4,
    borderColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },

  circuloCaptura: {
    width: 58,
    height: 58,
    borderRadius: 30,
    backgroundColor: '#FFFFFF',
  },

  botonDeshabilitado: {
    opacity: 0.4,
  },

  espacioControl: {
    width: 50,
  },

});

export default ImagePickerField;
