import React from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useSession } from '../context/Sessioncontext';
import LoginScreen from '../screens/LoginScreen';
import RegistroConductorScreen from '../screens/RegistroConductorScreen';
import PendienteScreen from '../screens/Pendientescreen';
import InicioScreen from '../screens/Inicioscreen';

const Stack = createNativeStackNavigator();

export default function RootNavigator() {
  const { usuario, conductor, cargando } = useSession();

  // Mientras Firebase restaura la sesión y se lee el perfil
  if (cargando) {
    return (
      <View style={styles.cargando}>
        <ActivityIndicator size="large" color="#145BB8" />
      </View>
    );
  }

  // Solo hay "sesión de conductor" cuando existe la cuenta Y su perfil.
  // (Mientras se registra, la cuenta existe unos segundos antes que el perfil:
  //  por eso se sigue mostrando el registro hasta que el perfil esté guardado.)
  const tieneSesion = !!usuario && !!conductor;

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {tieneSesion ? (
        conductor.status === 'approved' ? (
          <Stack.Screen name="Inicio" component={InicioScreen} />
        ) : (
          <Stack.Screen name="Pendiente" component={PendienteScreen} />
        )
      ) : (
        <>
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen
            name="Registro"
            component={RegistroConductorScreen}
            options={{ headerShown: true, title: 'Registro de conductor' }}
          />
        </>
      )}
    </Stack.Navigator>
  );
}

const styles = StyleSheet.create({
  cargando: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F2F6FC',
  },
});