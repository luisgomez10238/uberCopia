import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { RegistrationProvider } from './src/context/RegistrationContext';
import { SessionProvider } from './src/context/Sessioncontext';
import RootNavigator from './src/navigation/Rootnavigator';

export default function App() {
  return (
    <RegistrationProvider>
      <SessionProvider>
        <NavigationContainer>
          <RootNavigator />
        </NavigationContainer>
        <StatusBar style="auto" />
      </SessionProvider>
    </RegistrationProvider>
  );
}