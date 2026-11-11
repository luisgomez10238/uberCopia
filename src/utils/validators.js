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


/* -------------------------------------------------------------------------- */
/*  Documentos (pestaña 3)                                                    */
/* -------------------------------------------------------------------------- */

// Años de antigüedad desde los cuales el vehículo debe tener revisión
// técnico-mecánica. CONFIRMA este valor con la normativa o con tu profesor.
export const ANIOS_PARA_REVISION = 6;

// "Posterior a hoy": la fecha de vencimiento debe ser a partir de mañana.
export const validarFechaVencimiento = (fecha) => {
  if (!(fecha instanceof Date) || Number.isNaN(fecha.getTime())) {
    return false;
  }

  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);

  const vencimiento = new Date(fecha);
  vencimiento.setHours(0, 0, 0, 0);

  return vencimiento > hoy;
};

// La revisión técnico-mecánica aplica según el año del vehículo.
export const requiereRevision = (anio) => {
  const texto = String(anio ?? '');
  return (
    validarFecha(texto) &&
    new Date().getFullYear() - Number(texto) >= ANIOS_PARA_REVISION
  );
};

const ANIO_MINIMO = 1980;

const vacio = (valor) =>
  valor === null || valor === undefined || String(valor).trim() === '';

const errorVencimiento = (fecha, de) => {
  if (!fecha) return `La fecha de vencimiento ${de} es obligatoria`;
  if (!validarFechaVencimiento(fecha)) {
    return 'La fecha de vencimiento debe ser posterior a hoy';
  }
  return null;
};

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

    // La contraseña no se recorta ni se normaliza; Firebase exige mínimo 6
    contrasena: ({ personal }) => {
      const { contrasena } = personal;
      if (vacio(contrasena)) return 'La contraseña es obligatoria';
      if (contrasena.length < 6) {
        return 'La contraseña debe tener mínimo 6 caracteres';
      }
      return null;
    },

    confirmacion: ({ personal }) => {
      const { confirmacion, contrasena } = personal;
      if (vacio(confirmacion)) return 'Confirma tu contraseña';
      if (confirmacion !== contrasena) return 'Las contraseñas no coinciden';
      return null;
    },
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

  documentos: {
    licenciaNumero: ({ documentos }) => {
      const { licenciaNumero } = documentos;
      if (vacio(licenciaNumero)) return 'El número de licencia es obligatorio';
      if (!/^\d{6,15}$/.test(licenciaNumero)) {
        return 'Debe ser numérico, entre 6 y 15 dígitos';
      }
      return null;
    },

    licenciaFoto: ({ documentos }) =>
      !documentos.licenciaFoto ? 'La foto de la licencia es obligatoria' : null,

    licenciaVencimiento: ({ documentos }) =>
      errorVencimiento(documentos.licenciaVencimiento, 'de la licencia'),

    soatFoto: ({ documentos }) =>
      !documentos.soatFoto ? 'La foto del SOAT es obligatoria' : null,

    soatVencimiento: ({ documentos }) =>
      errorVencimiento(documentos.soatVencimiento, 'del SOAT'),

    // Solo se exige si el año del vehículo lo requiere
    revisionFoto: ({ documentos, vehiculo }) =>
      requiereRevision(vehiculo.anio) && !documentos.revisionFoto
        ? 'La foto de la revisión técnico-mecánica es obligatoria'
        : null,

    revisionVencimiento: ({ documentos, vehiculo }) =>
      requiereRevision(vehiculo.anio)
        ? errorVencimiento(documentos.revisionVencimiento, 'de la revisión')
        : null,

    correoMercadoPago: ({ documentos }) => {
      const { correoMercadoPago } = documentos;
      if (vacio(correoMercadoPago)) {
        return 'El correo de Mercado Pago es obligatorio';
      }
      if (!validarCorreo(correoMercadoPago)) {
        return 'Ingresa un correo válido (ej: nombre@dominio.com)';
      }
      return null;
    },

    aceptaTerminos: ({ documentos }) =>
      documentos.aceptaTerminos
        ? null
        : 'Debes aceptar los términos y la comisión para continuar',
  },
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
  documentos: {
    licenciaNumero: soloDigitos,
  },
};

export const normalizar = (seccion, campo, valor) => {
  const funcion = normalizadores[seccion]?.[campo];
  return funcion && typeof valor === 'string' ? funcion(valor) : valor;
};