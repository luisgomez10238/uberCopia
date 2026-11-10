
import { PRICING } from '../config/pricing';

export const calculateFare = ({
  distanceKm,
  durationMin,
  category,
  tip = 0,
}) => {

  const distancia = Math.max(0, Number(distanceKm) || 0);
  const duracion = Math.max(0, Number(durationMin) || 0);
  const propina = Math.max(0, Number(tip) || 0);

  // Obtenemos el multiplicador de la categoría.
  const multiplicador =
    PRICING.categoryMultiplier[category] ??
    PRICING.categoryMultiplier.economy;

  // Calculamos la tarifa sin propina.
  const tarifaBase =
    PRICING.baseFare +
    distancia * PRICING.perKm +
    duracion * PRICING.perMinute;

  // Aplicamos el multiplicador y la tarifa mínima.
  const tarifaViaje = Math.round(
    Math.max(
      PRICING.minimumFare,
      tarifaBase * multiplicador
    )
  );

  // La propina no genera comisión.
  const fare = tarifaViaje + propina;

  // La comisión se calcula solamente sobre la tarifa del viaje.
  const commission = Math.round(
    tarifaViaje * PRICING.commissionRate
  );

  // Ganancia del conductor: tarifa menos comisión más propina.
  const driverEarnings = fare - commission;

  return {
    fare,
    commission,
    driverEarnings,
  };
};
