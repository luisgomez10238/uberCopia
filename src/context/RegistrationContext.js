import React, {
  createContext,
  useContext,
  useState,
  useMemo,
  useCallback,
} from 'react';
import { reglas, obtenerError, normalizar } from '../utils/validators';

const RegistrationContext = createContext(null);

const datosIniciales = {
  personal: {
    fotoPerfil: null,
    nombre: '',
    documento: '',
    telefono: '',
    fechaNacimiento: null,
    genero: '',
    correo: '',
    idioma: 'es',
  },
  vehiculo: {
    categoria: '',
    placa: '',
    marca: '',
    modelo: '',
    anio: '',
    color: '',
    capacidad: '',
    fotoVehiculo: null,
  },
  documentos: {}, // pestaña 3: se llenará en la siguiente entrega
};

const tocadosIniciales = { personal: {}, vehiculo: {}, documentos: {} };

// Campos sin onBlur (selectores, fecha, imágenes): se marcan como tocados
// en cuanto el usuario cambia su valor.
const CAMPOS_SIN_BLUR = {
  personal: ['fotoPerfil', 'fechaNacimiento', 'genero', 'idioma'],
  vehiculo: ['categoria', 'color', 'fotoVehiculo'],
};

export const RegistrationProvider = ({ children }) => {
  const [registro, setRegistro] = useState(datosIniciales);
  const [tocados, setTocados] = useState(tocadosIniciales);

  const actualizarSeccion = useCallback((seccion, campo, valor) => {
    const valorLimpio = normalizar(seccion, campo, valor);

    setRegistro((anterior) => ({
      ...anterior,
      [seccion]: { ...anterior[seccion], [campo]: valorLimpio },
    }));

    if (CAMPOS_SIN_BLUR[seccion]?.includes(campo)) {
      setTocados((anterior) => ({
        ...anterior,
        [seccion]: { ...anterior[seccion], [campo]: true },
      }));
    }
  }, []);

  const actualizarPersonal = useCallback(
    (campo, valor) => actualizarSeccion('personal', campo, valor),
    [actualizarSeccion]
  );

  const actualizarVehiculo = useCallback(
    (campo, valor) => actualizarSeccion('vehiculo', campo, valor),
    [actualizarSeccion]
  );

  // Marca un campo como tocado (llamar en onBlur de los TextInput)
  const tocarCampo = useCallback((seccion, campo) => {
    setTocados((anterior) => ({
      ...anterior,
      [seccion]: { ...anterior[seccion], [campo]: true },
    }));
  }, []);

  // Marca todos los campos de una sección (llamar al pulsar "Enviar")
  const tocarSeccion = useCallback((seccion) => {
    setTocados((anterior) => {
      const todos = {};
      Object.keys(reglas[seccion]).forEach((campo) => {
        todos[campo] = true;
      });
      return { ...anterior, [seccion]: todos };
    });
  }, []);

  const limpiarRegistro = useCallback(() => {
    setRegistro(datosIniciales);
    setTocados(tocadosIniciales);
  }, []);

  // Todos los errores reales, sin importar si el campo fue tocado
  const todosLosErrores = useMemo(() => {
    const resultado = {};
    Object.keys(reglas).forEach((seccion) => {
      resultado[seccion] = {};
      Object.keys(reglas[seccion]).forEach((campo) => {
        resultado[seccion][campo] = obtenerError(seccion, campo, registro);
      });
    });
    return resultado;
  }, [registro]);

  // Solo los errores que el usuario debe ver
  const errores = useMemo(() => {
    const resultado = {};
    Object.keys(todosLosErrores).forEach((seccion) => {
      resultado[seccion] = {};
      Object.keys(todosLosErrores[seccion]).forEach((campo) => {
        // Si ya eligió categoría y escribió una capacidad, se revalida al
        // cambiar la categoría (ej: pasar a XL con capacidad 4).
        const capacidadRevalidada =
          seccion === 'vehiculo' &&
          campo === 'capacidad' &&
          tocados.vehiculo.categoria &&
          registro.vehiculo.capacidad !== '';

        const visible = tocados[seccion][campo] || capacidadRevalidada;

        resultado[seccion][campo] = visible
          ? todosLosErrores[seccion][campo]
          : null;
      });
    });
    return resultado;
  }, [todosLosErrores, tocados, registro.vehiculo.capacidad]);

  const seccionValida = useMemo(() => {
    const resultado = {};
    Object.keys(todosLosErrores).forEach((seccion) => {
      resultado[seccion] = Object.values(todosLosErrores[seccion]).every(
        (error) => !error
      );
    });
    return resultado;
  }, [todosLosErrores]);

  // OJO: mientras `documentos` no tenga reglas, esta sección cuenta como válida.
  // No habilites "Enviar registro" con esto hasta implementar la pestaña 3.
  const formularioValido =
    seccionValida.personal && seccionValida.vehiculo && seccionValida.documentos;

  const value = useMemo(
    () => ({
      registro,
      errores,
      seccionValida,
      formularioValido,
      actualizarPersonal,
      actualizarVehiculo,
      tocarCampo,
      tocarSeccion,
      limpiarRegistro,
    }),
    [
      registro,
      errores,
      seccionValida,
      formularioValido,
      actualizarPersonal,
      actualizarVehiculo,
      tocarCampo,
      tocarSeccion,
      limpiarRegistro,
    ]
  );

  return (
    <RegistrationContext.Provider value={value}>
      {children}
    </RegistrationContext.Provider>
  );
};

export const useRegistration = () => {
  const contexto = useContext(RegistrationContext);
  if (!contexto) {
    throw new Error(
      'useRegistration debe utilizarse dentro de RegistrationProvider'
    );
  }
  return contexto;
};