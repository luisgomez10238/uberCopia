import { doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../config/firebase';

// Disponible / No disponible. Las reglas de Firestore solo permiten
// isAvailable: true si el conductor ya está aprobado.
export const actualizarDisponibilidad = (uid, disponible) =>
  updateDoc(doc(db, 'drivers', uid), {
    isAvailable: disponible,
    availabilityUpdatedAt: serverTimestamp(),
  });

// Ubicación en tiempo real que leerá la app del pasajero (onSnapshot)
export const actualizarUbicacion = (uid, { lat, lng }) =>
  updateDoc(doc(db, 'drivers', uid), {
    location: { lat, lng },
    locationUpdatedAt: serverTimestamp(),
  });

// Token de notificaciones push del celular (Expo Push Service)
export const guardarTokenPush = (uid, token) =>
  updateDoc(doc(db, 'drivers', uid), {
    expoPushToken: token,
    pushTokenUpdatedAt: serverTimestamp(),
  });
