// AI-assisted: see docs/AI_LOG.md #11
import { initializeApp } from 'firebase/app';
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';
import { getFirestore, collection, addDoc, doc, getDoc, serverTimestamp } from 'firebase/firestore';

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
  status: 'completed',
  category: CATEGORIA,
  distanceKm: 8.5,
  durationMin: 22,
  paymentMethod: 'card',
  paymentStatus: 'pending',
  tip: 0,
  origin: { ...ORIGEN, address: 'Origen de prueba' },
  destination: { ...DESTINO, address: 'Destino de prueba' },
  createdAt: serverTimestamp(),
});

console.log('Viaje creado:', ref.id);

// Aviso push al celular del conductor (token guardado por la app en drivers/{uid})
const perfil = await getDoc(doc(getFirestore(app), 'drivers', user.uid));
const token = perfil.data()?.expoPushToken;

if (token) {
  const respuesta = await fetch('https://exp.host/--/api/v2/push/send', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify({
      to: token,
      title: '¡Nuevo viaje!',
      body: 'Tienes una solicitud entrante',
      sound: 'default',
      channelId: 'default',
      data: { tripId: ref.id },
    }),
  });
  console.log('Respuesta de Expo:', await respuesta.text());
} else {
  console.log('El conductor aún no tiene token push (abre la app en el celular primero).');
}

process.exit(0);