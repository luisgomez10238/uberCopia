// Decodifica el formato "encoded polyline" de Google Directions
// y devuelve [{ lat, lng }, ...]
export const decodificarPolyline = (texto) => {
  const puntos = [];
  let indice = 0;
  let lat = 0;
  let lng = 0;

  while (indice < texto.length) {
    let resultado = 0;
    let desplazamiento = 0;
    let byte;

    do {
      byte = texto.charCodeAt(indice++) - 63;
      resultado |= (byte & 0x1f) << desplazamiento;
      desplazamiento += 5;
    } while (byte >= 0x20);
    lat += resultado & 1 ? ~(resultado >> 1) : resultado >> 1;

    resultado = 0;
    desplazamiento = 0;
    do {
      byte = texto.charCodeAt(indice++) - 63;
      resultado |= (byte & 0x1f) << desplazamiento;
      desplazamiento += 5;
    } while (byte >= 0x20);
    lng += resultado & 1 ? ~(resultado >> 1) : resultado >> 1;

    puntos.push({ lat: lat / 1e5, lng: lng / 1e5 });
  }

  return puntos;
};
