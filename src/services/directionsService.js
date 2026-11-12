// AI-assisted: see docs/AI_LOG.md #10
import { decodificarPolyline } from '../utils/polyline';

// Ruta con OSRM (OpenStreetMap): gratis y sin llave. El documento lo lista
// como alternativa a Google Directions. Es un servidor público de demostración.
const URL_OSRM = 'https://router.project-osrm.org/route/v1/driving';

// Una sola consulta por tramo del viaje (recogida o destino),
// nunca en cada movimiento del conductor.
export const obtenerRuta = async (origen, destino) => {
  // OSRM recibe las coordenadas como longitud,latitud
  const coordenadas =
    `${origen.lng},${origen.lat};${destino.lng},${destino.lat}`;

  const respuesta = await fetch(
    `${URL_OSRM}/${coordenadas}?overview=full&geometries=polyline`
  );

  if (!respuesta.ok) {
    throw new Error(`No se pudo calcular la ruta (HTTP ${respuesta.status})`);
  }

  const datos = await respuesta.json();
  const ruta = datos.routes?.[0];

  if (datos.code !== 'Ok' || !ruta?.geometry) {
    throw new Error(`No se pudo calcular la ruta (${datos.code || 'SIN_RUTA'})`);
  }

  return {
    puntos: decodificarPolyline(ruta.geometry),
    distanciaKm: ruta.distance / 1000,
    duracionMin: Math.round(ruta.duration / 60),
  };
};
