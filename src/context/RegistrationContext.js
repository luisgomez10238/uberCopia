import React, {
  createContext,
  useContext,
  useState,
  useMemo,
  useCallback,
} from 'react';
import { reglas, obtenerError } from '../utils/validators';

const RegistrationContext = createContext();

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
  documentos: {},
};

const tocadosIniciales = { personal: {}, vehiculo: {}, documentos: {} };

export const RegistrationProvider = ({ children }) => {
  const [registro, setRegistro] = useState(datosIniciales);
  const [tocados, setTocados] = useState(tocadosIniciales);

  const actualizarPersonal = useCallback((campo, valor) => {
    setRegistro((anterior) => ({
      ...anterior,
      personal: { ...anterior.personal, [campo]: valor },
    }));
  }, []);

  const actualizarVehiculo = useCallback((campo, valor) => {
    setRegistro((anterior) => ({
      ...anterior,
      vehiculo: { ...anterior.vehiculo, [campo]: valor },
    }));
  }, []);

  // Marca un campo como tocado (llamar en onBlur)
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
        resultado[seccion][campo] = tocados[seccion][campo]
          ? todosLosErrores[seccion][campo]
          : null;
      });
    });
    return resultado;
  }, [todosLosErrores, tocados]);

  const seccionValida = useMemo(() => {
    const resultado = {};
    Object.keys(todosLosErrores).forEach((seccion) => {
      resultado[seccion] = Object.values(todosLosErrores[seccion]).every(
        (error) => !error
      );
    });
    return resultado;
  }, [todosLosErrores]);

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