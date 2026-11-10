import { initializeApp, getApps, getApp } from 'firebase/app';
import { initializeAuth, getAuth, getReactNativePersistence } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Las variables EXPO_PUBLIC_* se leen del archivo .env (excluido de Git).
// Se escriben completas, sin dinámicos, para que Expo las reemplace al compilar.
const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
};

if (!firebaseConfig.apiKey || !firebaseConfig.projectId) {
  throw new Error(
    'Falta la configuración de Firebase. Copia .env.example a .env y completa los valores.'
  );
}

// getApps() evita inicializar dos veces cuando Expo recarga el código (Fast Refresh)
const app = getApps().length ? getApp() : initializeApp(firebaseConfig);

// La sesión del conductor se guarda en AsyncStorage (permitido: no es dato sensible)
let auth;
try {
  auth = initializeAuth(app, {
    persistence: getReactNativePersistence(AsyncStorage),
  });
} catch (error) {
  // Ya estaba inicializado (recarga en caliente)
  auth = getAuth(app);
}

const db = getFirestore(app);

export { app, auth, db };