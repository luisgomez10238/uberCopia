
export const validarNombre = (nombre) => {
  return /^[A-Za-zÁÉÍÓÚáéíóúÑñÜü\s]{1,50}$/.test(nombre.trim());
};

export const validarDocumento = (documento) => {
  return /^\d{6,10}$/.test(documento);
};

export const validarTelefono = (telefono) => {
  return /^\d{10}$/.test(telefono);
};

export const validarCorreo = (correo) => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correo.trim());
};

export const validarPlaca = (placa) => {
  return /^[A-Z]{3}\d{3}$/.test(placa);
};

export const validarFecha = (fecha) => {
  const anioActual = new Date().getFullYear();

  return /^\d{4}$/.test(fecha) &&
    Number(anio) <= anioActual;
};

export const validarCapacidad = (capacidad, categoria) => {
  if (!/^\d+$/.test(String(capacidad))) {
    return false;
  }

  const cantidad = Number(capacidad);

  if (categoria === 'xl') {
    return cantidad >= 6;
  }

  return cantidad >= 1;
};

export const validarFechaNacimiento = (fecha) => {
  if (!(fecha instanceof Date) || Number.isNaN(fecha.getTime())) {
    return false;
  }

  const hoy = new Date();
  let edad = hoy.getFullYear() - fecha.getFullYear();

  const aunNoCumple =
    hoy.getMonth() < fecha.getMonth() ||
    (hoy.getMonth() === fecha.getMonth() &&
      hoy.getDate() < fecha.getDate());

  if (aunNoCumple) {
    edad--;
  }

  return edad >= 18 && fecha <= hoy;
};
