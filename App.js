import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { RegistrationProvider } from './src/context/RegistrationContext';
import RegistroConductorScreen from './src/screens/RegistroConductorScreen';

export default function App() {
  return (
    <RegistrationProvider>
      <NavigationContainer>
        <RegistroConductorScreen />
      </NavigationContainer>
      <StatusBar style="auto" />
    </RegistrationProvider>
  );
}