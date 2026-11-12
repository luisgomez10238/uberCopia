import React, { useState } from 'react';
import {
  ScrollView,
  View,
  Text,
  Pressable,
  ActivityIndicator,
  StyleSheet,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../../config/firebase';
import FormField from '../../components/Registro/FormField';
import { validarCorreo } from '../../utils/validators';

const MENSAJES_AUTH = {
  'auth/invalid-credential': 'Correo o contraseña incorrectos',
  'auth/user-not-found': 'Correo o contraseña incorrectos',
  'auth/wrong-password': 'Correo o contraseña incorrectos',
  'auth/invalid-email': 'El correo no es válido',
  'auth/too-many-requests': 'Demasiados intentos. Espera un momento e inténtalo de nuevo',
  'auth/network-request-failed': 'Sin conexión. Revisa tu internet e inténtalo de nuevo',
};

export default function LoginScreen({ navigation }) {
  const [correo, setCorreo] = useState('');
  const [contrasena, setContrasena] = useState('');
  const [errores, setErrores] = useState({});
  const [errorEnvio, setErrorEnvio] = useState('');
  const [cargando, setCargando] = useState(false);

  const iniciarSesion = async () => {
    const nuevos = {};
    if (!correo.trim()) nuevos.correo = 'El correo es obligatorio';
    else if (!validarCorreo(correo)) nuevos.correo = 'Ingresa un correo válido';
    if (!contrasena) nuevos.contrasena = 'La contraseña es obligatoria';

    setErrores(nuevos);
    setErrorEnvio('');
    if (Object.keys(nuevos).length > 0) return;

    setCargando(true);
    try {
      await signInWithEmailAndPassword(auth, correo.trim(), contrasena);
      // Al iniciar sesión, RootNavigator cambia de pantalla solo.
    } catch (e) {
      setErrorEnvio(MENSAJES_AUTH[e.code] || 'No se pudo iniciar sesión');
      setCargando(false);
    }
  };

  return (
    <ScrollView
      style={styles.pantalla}
      contentContainerStyle={styles.contenido}
      keyboardShouldPersistTaps="handled"
      automaticallyAdjustKeyboardInsets
    >
      <View style={styles.encabezado}>
        <View style={styles.icono}>
          <Ionicons name="car-sport-outline" size={28} color="#FFFFFF" />
        </View>
        <Text style={styles.titulo}>Bienvenido, conductor</Text>
        <Text style={styles.subtitulo}>Inicia sesión para continuar.</Text>
      </View>

      <View style={styles.tarjeta}>
        <FormField
          label="Correo electrónico"
          value={correo}
          onChangeText={setCorreo}
          error={errores.correo}
          keyboardType="email-address"
          autoCorrect={false}
          placeholder="nombre@dominio.com"
        />

        <FormField
          label="Contraseña"
          value={contrasena}
          onChangeText={setContrasena}
          error={errores.contrasena}
          secureTextEntry
          autoCorrect={false}
          placeholder="Tu contraseña"
        />

        {errorEnvio ? <Text style={styles.errorEnvio}>{errorEnvio}</Text> : null}

        <Pressable
          style={[styles.boton, cargando && styles.botonDeshabilitado]}
          onPress={iniciarSesion}
          disabled={cargando}
        >
          {cargando ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={styles.textoBoton}>Iniciar sesión</Text>
          )}
        </Pressable>
      </View>

      <Pressable onPress={() => navigation.navigate('Registro')}>
        <Text style={styles.enlace}>¿No tienes cuenta? Regístrate como conductor</Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  pantalla: { flex: 1, backgroundColor: '#F2F6FC' },
  contenido: { padding: 16, paddingTop: 60, paddingBottom: 35 },
  encabezado: {
    backgroundColor: '#145BB8',
    padding: 22,
    borderRadius: 18,
    marginBottom: 18,
  },
  icono: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.20)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 13,
  },
  titulo: { fontSize: 23, fontWeight: 'bold', color: '#FFFFFF', marginBottom: 7 },
  subtitulo: { fontSize: 14, color: '#E5F0FF' },
  tarjeta: {
    backgroundColor: '#FFFFFF',
    padding: 17,
    borderRadius: 17,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E4EBF5',
  },
  errorEnvio: {
    fontSize: 13,
    color: '#D93025',
    textAlign: 'center',
    marginBottom: 10,
  },
  boton: {
    backgroundColor: '#145BB8',
    minHeight: 52,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  botonDeshabilitado: { backgroundColor: '#A9B8CE' },
  textoBoton: { color: '#FFFFFF', fontSize: 16, fontWeight: 'bold' },
  enlace: {
    textAlign: 'center',
    color: '#145BB8',
    fontSize: 14,
    fontWeight: '600',
    marginTop: 6,
  },
});