// AI-assisted: see docs/AI_LOG.md #6
import React from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useSession } from '../context/SessionContext';
import LoginScreen from '../screens/login/LoginScreen';
import RegistroConductorScreen from '../screens/login/RegistroConductorScreen';
import PendienteScreen from '../screens/PendienteScreen';
import DetalleViajeScreen from '../screens/historial/DetalleViajeScreen';
import ViajeEnCursoScreen from '../screens/viaje/ViajeEnCursoScreen';
import ResumenViajeScreen from '../screens/viaje/ResumenViajeScreen';
import DriverDrawer from './DriverDrawer';

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
          <>
            <Stack.Screen name="Drawer" component={DriverDrawer} />
            {/* Flujo del viaje (Stack): el detalle abre encima del Drawer.
                Aquí también irán ViajeEnCurso y ResumenViaje. */}
            <Stack.Screen
              name="ViajeEnCurso"
              component={ViajeEnCursoScreen}
              options={{ gestureEnabled: false }}
            />
            <Stack.Screen
              name="ResumenViaje"
              component={ResumenViajeScreen}
              options={{ gestureEnabled: false }}
            />
            <Stack.Screen
              name="DetalleViaje"
              component={DetalleViajeScreen}
              options={{ headerShown: true, title: 'Detalle del viaje' }}
            />
          </>
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