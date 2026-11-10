import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSession } from '../context/Sessioncontext';

// Pantalla provisional: aquí irán el mapa y el interruptor Disponible / No disponible.
export default function InicioScreen() {
  const { conductor, cerrarSesion } = useSession();

  return (
    <View style={styles.pantalla}>
      <Ionicons name="checkmark-circle" size={76} color="#1E8E3E" />
      <Text style={styles.titulo}>Cuenta aprobada</Text>
      <Text style={styles.texto}>
        Hola{conductor?.fullName ? `, ${conductor.fullName}` : ''}. Aquí irá el
        mapa con el interruptor Disponible / No disponible.
      </Text>

      <Pressable style={styles.boton} onPress={cerrarSesion}>
        <Text style={styles.textoBoton}>Cerrar sesión</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  pantalla: {
    flex: 1,
    backgroundColor: '#F2F6FC',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 30,
  },
  titulo: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#172B4D',
    marginTop: 14,
    marginBottom: 8,
  },
  texto: {
    fontSize: 14,
    color: '#718096',
    textAlign: 'center',
    lineHeight: 21,
    marginBottom: 26,
  },
  boton: {
    borderWidth: 1,
    borderColor: '#145BB8',
    borderRadius: 14,
    paddingVertical: 13,
    paddingHorizontal: 28,
  },
  textoBoton: { color: '#145BB8', fontSize: 15, fontWeight: 'bold' },
});