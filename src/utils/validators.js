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
  return /^[A-Z]{3}\d{3}$/.test(placa.trim().toUpperCase());
};

export const validarFecha = (fecha) => {
  const anioActual = new Date().getFullYear();

  return /^\d{4}$/.test(fecha) &&
    Number(fecha) <= anioActual;
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


const ANIO_MINIMO = 1980;

const vacio = (valor) =>
  valor === null || valor === undefined || String(valor).trim() === '';

export const reglas = {
  personal: {
    fotoPerfil: ({ personal }) =>
      !personal.fotoPerfil ? 'La foto de perfil es obligatoria' : null,

    nombre: ({ personal }) => {
      const { nombre } = personal;
      if (vacio(nombre)) return 'El nombre completo es obligatorio';
      if (nombre.trim().length > 50) return 'Máximo 50 caracteres';
      if (!validarNombre(nombre)) return 'Solo se permiten letras y espacios';
      return null;
    },

    documento: ({ personal }) => {
      const { documento } = personal;
      if (vacio(documento)) return 'El documento de identidad es obligatorio';
      if (!validarDocumento(documento)) {
        return 'Debe ser numérico, entre 6 y 10 dígitos';
      }
      return null;
    },

    telefono: ({ personal }) => {
      const { telefono } = personal;
      if (vacio(telefono)) return 'El número de celular es obligatorio';
      if (!validarTelefono(telefono)) return 'Debe tener exactamente 10 dígitos';
      return null;
    },

    fechaNacimiento: ({ personal }) => {
      const { fechaNacimiento } = personal;
      if (!fechaNacimiento) return 'La fecha de nacimiento es obligatoria';
      if (!validarFechaNacimiento(fechaNacimiento)) {
        return 'Debes ser mayor de 18 años';
      }
      return null;
    },

    genero: ({ personal }) =>
      vacio(personal.genero) ? 'Selecciona un género' : null,

    correo: ({ personal }) => {
      const { correo } = personal;
      if (vacio(correo)) return 'El correo electrónico es obligatorio';
      if (!validarCorreo(correo)) {
        return 'Ingresa un correo válido (ej: nombre@dominio.com)';
      }
      return null;
    },

    idioma: ({ personal }) =>
      personal.idioma === 'es' || personal.idioma === 'en'
        ? null
        : 'Selecciona un idioma',
  },

  vehiculo: {
    categoria: ({ vehiculo }) =>
      vacio(vehiculo.categoria) ? 'Selecciona una categoría' : null,

    placa: ({ vehiculo }) => {
      const { placa } = vehiculo;
      if (vacio(placa)) return 'La placa es obligatoria';
      if (!validarPlaca(placa)) return 'Formato inválido. Ejemplo: ABC123';
      return null;
    },

    marca: ({ vehiculo }) => {
      const { marca } = vehiculo;
      if (vacio(marca)) return 'La marca es obligatoria';
      if (marca.trim().length > 30) return 'Máximo 30 caracteres';
      return null;
    },

    modelo: ({ vehiculo }) => {
      const { modelo } = vehiculo;
      if (vacio(modelo)) return 'El modelo es obligatorio';
      if (modelo.trim().length > 30) return 'Máximo 30 caracteres';
      return null;
    },

    anio: ({ vehiculo }) => {
      const { anio } = vehiculo;
      if (vacio(anio)) return 'El año es obligatorio';
      if (!validarFecha(anio)) {
        return `Ingresa un año de 4 dígitos, máximo ${new Date().getFullYear()}`;
      }
      if (Number(anio) < ANIO_MINIMO) {
        return `El año no puede ser menor a ${ANIO_MINIMO}`;
      }
      return null;
    },

    color: ({ vehiculo }) =>
      vacio(vehiculo.color) ? 'Selecciona un color' : null,

    capacidad: ({ vehiculo }) => {
      const { capacidad, categoria } = vehiculo;
      if (vacio(capacidad)) return 'La capacidad de pasajeros es obligatoria';
      if (!validarCapacidad(capacidad, categoria)) {
        return categoria === 'xl'
          ? 'La categoría XL exige mínimo 6 pasajeros'
          : 'Ingresa un número válido de pasajeros';
      }
      return null;
    },

    fotoVehiculo: ({ vehiculo }) =>
      !vehiculo.fotoVehiculo
        ? 'La foto del vehículo es obligatoria (la placa debe verse)'
        : null,
  },

  documentos: {}, // pestaña 3: pendiente
};

export const obtenerError = (seccion, campo, registro) => {
  const regla = reglas[seccion]?.[campo];
  return regla ? regla(registro) : null;
};

/* -------------------------------------------------------------------------- */
/*  Normalización de lo que escribe el usuario                                */
/* -------------------------------------------------------------------------- */

const soloDigitos = (texto) => texto.replace(/\D/g, '');

const normalizadores = {
  personal: {
    documento: soloDigitos,
    telefono: soloDigitos,
  },
  vehiculo: {
    placa: (texto) => texto.replace(/\s/g, '').toUpperCase(),
    anio: soloDigitos,
    capacidad: soloDigitos,
  },
};

export const normalizar = (seccion, campo, valor) => {
  const funcion = normalizadores[seccion]?.[campo];
  return funcion && typeof valor === 'string' ? funcion(valor) : valor;
};