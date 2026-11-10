import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useMemo,
  useCallback,
} from 'react';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { doc, onSnapshot } from 'firebase/firestore';
import { auth, db } from '../config/firebase';

const SessionContext = createContext(null);

export const SessionProvider = ({ children }) => {
  const [usuario, setUsuario] = useState(null);       // cuenta de Firebase Auth
  const [conductor, setConductor] = useState(null);   // documento drivers/{uid}
  const [cargandoAuth, setCargandoAuth] = useState(true);
  const [cargandoPerfil, setCargandoPerfil] = useState(false);

  // 1) Sesión: Firebase la restaura solo al abrir la app (la guarda en AsyncStorage)
  useEffect(() => {
    const cancelar = onAuthStateChanged(auth, (u) => {
      setUsuario(u);
      setCargandoPerfil(!!u);
      if (!u) setConductor(null);
      setCargandoAuth(false);
    });
    return cancelar; // función de limpieza
  }, []);

  // 2) Perfil del conductor en tiempo real: si cambias status a "approved" en
  //    Firestore, la app lo detecta sin reiniciar.
  useEffect(() => {
    if (!usuario) return undefined;

    const cancelar = onSnapshot(
      doc(db, 'drivers', usuario.uid),
      (snap) => {
        setConductor(snap.exists() ? { id: snap.id, ...snap.data() } : null);
        setCargandoPerfil(false);
      },
      (error) => {
        console.error('[session] no se pudo leer el perfil del conductor', error);
        setConductor(null);
        setCargandoPerfil(false);
      }
    );

    return cancelar; // función de limpieza
  }, [usuario?.uid]);

  const cerrarSesion = useCallback(() => signOut(auth), []);

  const value = useMemo(
    () => ({
      usuario,
      conductor,
      cargando: cargandoAuth || (!!usuario && cargandoPerfil),
      cerrarSesion,
    }),
    [usuario, conductor, cargandoAuth, cargandoPerfil, cerrarSesion]
  );

  return (
    <SessionContext.Provider value={value}>{children}</SessionContext.Provider>
  );
};

export const useSession = () => {
  const contexto = useContext(SessionContext);
  if (!contexto) {
    throw new Error('useSession debe utilizarse dentro de SessionProvider');
  }
  return contexto;
};