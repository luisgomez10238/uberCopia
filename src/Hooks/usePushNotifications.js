// AI-assisted: see docs/AI_LOG.md #15
import { useEffect } from 'react';
import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import Constants from 'expo-constants';

import { guardarTokenPush } from '../services/driverStatusService';

// Con la app abierta, también se muestra el aviso
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

const obtenerToken = async () => {
  // Las notificaciones push remotas solo funcionan en un celular físico
  if (!Device.isDevice) return null;

  // En Android el canal debe existir antes de pedir el permiso y el token
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'Solicitudes de viaje',
      importance: Notifications.AndroidImportance.MAX,
    });
  }

  const actual = await Notifications.getPermissionsAsync();
  let estado = actual.status;
  if (estado !== 'granted') {
    estado = (await Notifications.requestPermissionsAsync()).status;
  }
  if (estado !== 'granted') return null;

  const projectId =
    Constants?.expoConfig?.extra?.eas?.projectId ??
    Constants?.easConfig?.projectId;

  if (!projectId) {
    throw new Error('Falta extra.eas.projectId en app.json');
  }

  const { data } = await Notifications.getExpoPushTokenAsync({ projectId });
  return data;
};

// Pide el permiso, obtiene el token del celular y lo guarda en el perfil
// del conductor para que se le puedan enviar avisos de nuevas solicitudes.
export default function usePushNotifications({ uid }) {
  useEffect(() => {
    if (!uid) return undefined;

    let cancelado = false;

    obtenerToken()
      .then((token) => {
        if (!cancelado && token) return guardarTokenPush(uid, token);
        return null;
      })
      .catch((e) =>
        console.warn('[push] no se pudo registrar el token:', e?.message)
      );

    return () => {
      cancelado = true;
    };
  }, [uid]);
}
