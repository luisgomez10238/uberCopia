import React from 'react';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { Ionicons } from '@expo/vector-icons';
import inicioscreen from '../screens/Inicioscreen';
import Perfilscreen from '../screens/Perfilscreen.js';

const Drawer = createDrawerNavigator();

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
        component={inicioscreen}
        options={{
          headerShown: false, // el mapa ocupa toda la pantalla
          drawerIcon: ({ color, size }) => (
            <Ionicons name="home-outline" size={size} color={color} />
          ),
        }}
      />
      <Drawer.Screen
        name="Perfil"
        component={Perfilscreen}
        options={{
          title: 'Perfil y configuración',
          drawerIcon: ({ color, size }) => (
            <Ionicons name="person-circle-outline" size={size} color={color} />
          ),
        }}
      />
      
    </Drawer.Navigator>
  );
}