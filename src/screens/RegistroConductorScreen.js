import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useRegistration } from '../context/RegistrationContext';
import DatosPersonalesScreen from './Datospersonalesscreen';
import VehiculoScreen from './Vehiculoscreen';

const Tab = createBottomTabNavigator();

// Hay algún error visible en la sección?
const tieneErrores = (erroresSeccion) => Object.values(erroresSeccion).some(Boolean);

export default function RegistroConductorScreen() {
  const { errores } = useRegistration();

  return (
    <Tab.Navigator
      screenOptions={{
        headerTitleAlign: 'center',
        tabBarIconStyle: { display: 'none' }, // pestañas solo con texto
        tabBarLabelStyle: { fontSize: 15, fontWeight: '600' },
        tabBarItemStyle: { justifyContent: 'center' },
        tabBarActiveTintColor: '#000000',
        tabBarInactiveTintColor: '#888888',
        tabBarBadgeStyle: { backgroundColor: '#D93025' },
      }}
    >
      <Tab.Screen
        name="DatosPersonales"
        component={DatosPersonalesScreen}
        options={{
          title: 'Datos personales',
          tabBarBadge: tieneErrores(errores.personal) ? '!' : undefined,
        }}
      />
      <Tab.Screen
        name="Vehiculo"
        component={VehiculoScreen}
        options={{
          title: 'Vehículo',
          tabBarBadge: tieneErrores(errores.vehiculo) ? '!' : undefined,
        }}
      />
      {/* Pestaña 3 (Documentos y pagos): siguiente entrega */}
    </Tab.Navigator>
  );
}