import AsyncStorage from '@react-native-async-storage/async-storage';

// AsyncStorage solo para preferencias (nunca datos sensibles).
// La clave lleva el uid para que cada conductor tenga la suya en el mismo celular.
const claveDisponible = (uid) => `@uberclone/ultimoEstadoDisponible:${uid}`;

export const leerUltimoEstadoDisponible = async (uid) => {
  try {
    return (await AsyncStorage.getItem(claveDisponible(uid))) === 'true';
  } catch (error) {
    return false;
  }
};

export const guardarUltimoEstadoDisponible = async (uid, disponible) => {
  try {
    await AsyncStorage.setItem(claveDisponible(uid), disponible ? 'true' : 'false');
  } catch (error) {
    console.warn('[preferences] no se pudo guardar el estado', error?.message);
  }
};