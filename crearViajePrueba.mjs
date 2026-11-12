import { initializeApp } from 'firebase/app';
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';
import { getFirestore, collection, addDoc, serverTimestamp } from 'firebase/firestore';

const CORREO = 'luisgomezpku@gmail.com'; // CAMBIAR
const CLAVE = 'lorena12';                       // CAMBIAR
const CATEGORIA = 'economy';                         // la de tu vehículo
const ORIGEN = { lat: 6.2442, lng: -75.5812 };       // CAMBIAR: cerca de ti
const DESTINO = { lat: 4.2086, lng: -75.5659 };      // CAMBIAR: a unos km

const app = initializeApp({
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
});

const auth = getAuth(app);
const { user } = await signInWithEmailAndPassword(auth, CORREO, CLAVE);

const ref = await addDoc(collection(getFirestore(app), 'trips'), {
  driverId: user.uid,
  passengerId: 'prueba',
  status: 'requested',
  category: CATEGORIA,
  distanceKm: 8.5,
  durationMin: 22,
  paymentMethod: 'cash',
  paymentStatus: 'pending',
  tip: 0,
  origin: { ...ORIGEN, address: 'Origen de prueba' },
  destination: { ...DESTINO, address: 'Destino de prueba' },
  createdAt: serverTimestamp(),
});

console.log('Viaje creado:', ref.id);
process.exit(0);