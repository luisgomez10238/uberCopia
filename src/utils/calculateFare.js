import { PRICING } from '../config/pricing';


export const calculateFare = ({ distanceKm, durationMin, category, tip = 0 }) => {
  const distancia = Math.max(0, Number(distanceKm) || 0);
  const duracion = Math.max(0, Number(durationMin) || 0);
  const propina = Math.max(0, Math.round(Number(tip) || 0));

  const multiplicador =
    PRICING.categoryMultiplier[category] ?? PRICING.categoryMultiplier.economy;

  const tarifaBruta =
    (PRICING.baseFare +
      distancia * PRICING.perKm +
      duracion * PRICING.perMinute) *
    multiplicador;

  const fare = Math.round(Math.max(PRICING.minimumFare, tarifaBruta) / 100) * 100;

  const commission = Math.round(fare * PRICING.commissionRate);
  const driverEarnings = fare - commission + propina;

  return { fare, commission, driverEarnings };
};