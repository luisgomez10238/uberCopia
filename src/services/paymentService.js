// AI-assisted: see docs/AI_LOG.md #16
// Pide al backend una sesión de Stripe Checkout para un viaje. El monto lo
// calcula el backend desde Firestore; la app solo envía el id del viaje.
const URL_BACKEND = process.env.EXPO_PUBLIC_BACKEND_URL;

export const crearSesionDePago = async (viajeId) => {
  if (!URL_BACKEND) throw new Error('Falta EXPO_PUBLIC_BACKEND_URL en .env');

  const respuesta = await fetch(`${URL_BACKEND}/create-checkout-session`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ tripId: viajeId }),
  });
  const datos = await respuesta.json();
  if (!respuesta.ok) throw new Error(datos.error || 'No se pudo iniciar el pago.');
  return datos.url;
};
