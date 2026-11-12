// AI-assisted: see docs/AI_LOG.md #9
import React from 'react';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { Ionicons } from '@expo/vector-icons';
import InicioScreen from '../screens/Inicioscreen';
import PerfilScreen from '../screens/Perfilscreen';
import Historialscreen from '../screens/historial/Historialscreen';
import GananciasScreen from '../screens/ganancias/GananciasScreen';

const Drawer = createDrawerNavigator();

const icono = (nombre) => ({ color, size }) => (
  <Ionicons name={nombre} size={size} color={color} />
);

export default function DriverDrawer() {
  return (
    <Drawer.Navigator
      screenOptions={{
        headerTitleAlign: 'center',
        drawerActiveTintColor: '#145BB8',
      }}
    >
      <Drawer.Screen
        name="Inicio"
        component={InicioScreen}
        options={{
          headerShown: false, // el mapa ocupa toda la pantalla
          drawerIcon: icono('home-outline'),
        }}
      />
      <Drawer.Screen
        name="Historial"
        component={Historialscreen}
        options={{
          title: 'Historial de carreras',
          drawerIcon: icono('time-outline'),
        }}
      />
      <Drawer.Screen
        name="Ganancias"
        component={GananciasScreen}
        options={{
          title: 'Ganancias',
          drawerIcon: icono('wallet-outline'),
        }}
      />
      <Drawer.Screen
        name="Perfil"
        component={PerfilScreen}
        options={{
          title: 'Perfil y configuración',
          drawerIcon: icono('person-circle-outline'),
        }}
      />
    </Drawer.Navigator>
  );
}