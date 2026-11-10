import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSession } from '../context/Sessioncontext';

export default function PendienteScreen() {
  const { conductor, cerrarSesion } = useSession();
  const rechazado = conductor?.status === 'rejected';

  return (
    <View style={styles.pantalla}>
      <Ionicons
        name={rechazado ? 'close-circle' : 'time'}
        size={76}
        color={rechazado ? '#D93025' : '#E8A317'}
      />
      <Text style={styles.titulo}>
        {rechazado ? 'Registro no aprobado' : 'Cuenta pendiente de aprobación'}
      </Text>
      <Text style={styles.texto}>
        {conductor?.fullName ? `${conductor.fullName}, ` : ''}
        {rechazado
          ? 'tu registro no fue aprobado. Contacta a soporte para más información.'
          : 'estamos revisando tu información. No podrás ponerte Disponible hasta que tu cuenta sea aprobada. Esta pantalla se actualiza sola cuando eso ocurra.'}
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
    textAlign: 'center',
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