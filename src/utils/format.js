// AI-assisted: see docs/AI_LOG.md #9
// $19.200 (separador de miles con punto, sin depender de Intl)
export const formatearCOP = (valor) =>
  `${Number(valor) < 0 ? '-' : ''}$${Math.abs(Math.round(Number(valor) || 0))
    .toString()
    .replace(/\B(?=(\d{3})+(?!\d))/g, '.')}`;

// 8,5 km
export const formatearKm = (km) => `${Number(km || 0).toFixed(1).replace('.', ',')} km`;

export const ETIQUETA_CATEGORIA = { economy: 'Económico', xl: 'XL', premium: 'Premium' };

export const ETIQUETA_PAGO = {
  mercadopago: 'Mercado Pago',
  stripe: 'Tarjeta (Stripe)',
  cash: 'Efectivo',
};

// Timestamp de Firestore | Date | número -> Date (o null)
export const aFecha = (valor) => {
  if (!valor) return null;
  const fecha = typeof valor.toDate === 'function' ? valor.toDate() : new Date(valor);
  return Number.isNaN(fecha.getTime()) ? null : fecha;
};

export const formatearFechaHora = (valor) => {
  const fecha = aFecha(valor);
  if (!fecha) return 'Fecha no disponible';
  const dia = String(fecha.getDate()).padStart(2, '0');
  const mes = String(fecha.getMonth() + 1).padStart(2, '0');
  const hora = String(fecha.getHours()).padStart(2, '0');
  const min = String(fecha.getMinutes()).padStart(2, '0');
  return `${dia}/${mes}/${fecha.getFullYear()} ${hora}:${min}`;
};
