// Parámetros de tarifa y comisión: único lugar donde se configuran.
export const PRICING = {
  baseFare: 3500,        // COP
  perKm: 1200,           // COP por km
  perMinute: 250,        // COP por minuto
  minimumFare: 6000,     // COP
  categoryMultiplier: { economy: 1.0, xl: 1.4, premium: 1.8 },
  commissionRate: 0.2,   // 20 % sobre la tarifa del viaje
};