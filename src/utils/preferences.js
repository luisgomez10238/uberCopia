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

// Idioma de la app ('es' | 'en'): preferencia, no dato sensible
const CLAVE_IDIOMA = '@uberclone/idioma';

export const leerIdioma = async () => {
  try {
    return (await AsyncStorage.getItem(CLAVE_IDIOMA)) || 'es';
  } catch (error) {
    return 'es';
  }
};

export const guardarIdioma = async (idioma) => {
  try {
    await AsyncStorage.setItem(CLAVE_IDIOMA, idioma);
  } catch (error) {
    console.warn('[preferences] no se pudo guardar el idioma', error?.message);
  }
};