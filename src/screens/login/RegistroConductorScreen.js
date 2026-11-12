import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';

import DatosPersonalesScreen from './Datospersonalesscreen';
import VehiculoScreen from '../login/Vehiculoscreen';
import DocumentosScreen from './Documentosscreen';
import { useRegistration } from '../../context/RegistrationContext';

const Tab = createBottomTabNavigator();

export default function RegistroConductorScreen() {
  const { errores } = useRegistration();

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,

        tabBarActiveTintColor: '#145BB8',
        tabBarInactiveTintColor: '#8996A8',

        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '700',
          marginBottom: 5,
        },

        tabBarIcon: ({ color, size, focused }) => {
          const iconos = {
            DatosPersonales: ['person-circle', 'person-circle-outline'],
            Vehiculo: ['car-sport', 'car-sport-outline'],
            Documentos: ['document-text', 'document-text-outline'],
          };
          const iconName = iconos[route.name][focused ? 0 : 1];

          return (
            <Ionicons
              name={iconName}
              size={size + 2}
              color={color}
            />
          );
        },

        tabBarStyle: {
          height: 68,
          paddingTop: 8,
          paddingBottom: 7,
          backgroundColor: '#FFFFFF',
          borderTopColor: '#E5ECF5',
          borderTopWidth: 1,
          elevation: 10,
        },

        tabBarItemStyle: {
          paddingVertical: 1,
        },

        tabBarBadgeStyle: {
          backgroundColor: '#D93025',
          color: '#FFFFFF',
          fontSize: 10,
          fontWeight: 'bold',
        },
      })}
    >
      <Tab.Screen
        name="DatosPersonales"
        component={DatosPersonalesScreen}
        options={{
          title: 'Datos personales',
          tabBarBadge: Object.values(errores.personal).some(Boolean)
            ? '!'
            : undefined,
        }}
      />

      <Tab.Screen
        name="Vehiculo"
        component={VehiculoScreen}
        options={{
          title: 'Vehículo',
          tabBarBadge: Object.values(errores.vehiculo).some(Boolean)
            ? '!'
            : undefined,
        }}
      />

      <Tab.Screen
        name="Documentos"
        component={DocumentosScreen}
        options={{
          title: 'Documentos',
          tabBarBadge: Object.values(errores.documentos).some(Boolean)
            ? '!'
            : undefined,
        }}
      />
    </Tab.Navigator>
  );
}