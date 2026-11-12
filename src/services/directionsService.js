import { decodificarPolyline } from '../utils/polyline';

const CLAVE = process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY;

// Una sola consulta por tramo del viaje (recogida o destino),
// nunca en cada movimiento del conductor: así se cuida el cupo gratuito.
export const obtenerRuta = async (origen, destino) => {
  if (!CLAVE) {
    throw new Error('Falta EXPO_PUBLIC_GOOGLE_MAPS_API_KEY en el archivo .env');
  }

  const url =
    'https://maps.googleapis.com/maps/api/directions/json' +
    `?origin=${origen.lat},${origen.lng}` +
    `&destination=${destino.lat},${destino.lng}` +
    `&mode=driving&language=es&key=${CLAVE}`;

  const respuesta = await fetch(url);
  const datos = await respuesta.json();

  if (datos.status !== 'OK' || !datos.routes?.length) {
    throw new Error(`No se pudo calcular la ruta (${datos.status})`);
  }

  const ruta = datos.routes[0];
  const tramo = ruta.legs[0];

  return {
    puntos: decodificarPolyline(ruta.overview_polyline.points),
    distanciaKm: tramo.distance.value / 1000,
    duracionMin: Math.round(tramo.duration.value / 60),
  };
};
