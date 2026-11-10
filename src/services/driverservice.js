import { createUserWithEmailAndPassword, deleteUser } from 'firebase/auth';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '../config/firebase';
import { subirImagen } from './cloudinary';

// El modelo de datos usa economy / xl / premium
const CATEGORIAS = {
  economico: 'economy',
  economy: 'economy',
  xl: 'xl',
  premium: 'premium',
};

const MENSAJES_AUTH = {
  'auth/email-already-in-use': 'Ya existe una cuenta con ese correo',
  'auth/invalid-email': 'El correo no es válido',
  'auth/weak-password': 'La contraseña es muy débil (mínimo 6 caracteres)',
  'auth/operation-not-allowed': 'Activa el método Correo/contraseña en Firebase Authentication',
  'auth/network-request-failed': 'Sin conexión. Revisa tu internet e inténtalo de nuevo',
  'auth/too-many-requests': 'Demasiados intentos. Espera un momento e inténtalo de nuevo',
};

// Fecha local en formato YYYY-MM-DD (evita desfases por zona horaria)
const aTextoFecha = (fecha) => {
  const mes = String(fecha.getMonth() + 1).padStart(2, '0');
  const dia = String(fecha.getDate()).padStart(2, '0');
  return `${fecha.getFullYear()}-${mes}-${dia}`;
};

// Ejecuta un paso y, si falla, deja en la consola el error completo (con su
// stack) y marca en qué paso ocurrió.
const paso = async (nombre, funcion) => {
  try {
    return await funcion();
  } catch (error) {
    console.error(`[registrarConductor] falló en: ${nombre}`, error);
    if (!error.paso) error.paso = nombre;
    throw error;
  }
};

/**
 * Registra al conductor:
 * 1) prepara los datos,
 * 2) crea la cuenta en Firebase Auth,
 * 3) sube las fotos a Cloudinary,
 * 4) guarda el perfil en Firestore (drivers/{uid}) con status "pending".
 * Si algo falla después de crear la cuenta, la elimina para no dejar usuarios a medias.
 * Devuelve el uid del conductor.
 */
export async function registrarConductor(registro, contrasena) {
  const { personal, vehiculo } = registro;
  let usuario = null;

  try {
    const { fechaTexto, categoria } = await paso('preparar los datos', async () => ({
      fechaTexto: aTextoFecha(personal.fechaNacimiento),
      categoria: CATEGORIAS[vehiculo.categoria],
    }));

    const credencial = await paso('crear la cuenta (Firebase Auth)', () =>
      createUserWithEmailAndPassword(auth, personal.correo.trim(), contrasena)
    );
    usuario = credencial.user;

    const [profilePhotoUrl, vehiclePhotoUrl] = await paso(
      'subir las fotos (Cloudinary)',
      () =>
        Promise.all([
          subirImagen(personal.fotoPerfil, `drivers/${usuario.uid}`),
          subirImagen(vehiculo.fotoVehiculo, `drivers/${usuario.uid}`),
        ])
    );

    await paso('guardar en Firestore', () =>
      setDoc(doc(db, 'drivers', usuario.uid), {
        uid: usuario.uid,
        fullName: personal.nombre.trim(),
        documentId: personal.documento,
        phone: personal.telefono,
        birthDate: fechaTexto,
        gender: personal.genero,
        email: personal.correo.trim(),
        language: personal.idioma,
        profilePhotoUrl,
        vehicle: {
          category: categoria,
          plate: vehiculo.placa,
          brand: vehiculo.marca.trim(),
          model: vehiculo.modelo.trim(),
          year: Number(vehiculo.anio),
          color: vehiculo.color,
          capacity: Number(vehiculo.capacidad),
          photoUrl: vehiclePhotoUrl,
        },
        status: 'pending', // pasa a "approved" cambiándolo a mano en Firestore
        isAvailable: false,
        createdAt: serverTimestamp(),
      })
    );

    return usuario.uid;
  } catch (error) {
    if (usuario) {
      try {
        await deleteUser(usuario);
      } catch (e) {
        // si no se pudo borrar, no tapamos el error original
      }
    }

    const amigable = MENSAJES_AUTH[error.code];
    if (amigable) throw new Error(amigable);

    // Mientras desarrollas, el mensaje indica el paso que falló.
    // (Cuando todo funcione, puedes quitar el "(en: ...)")
    throw new Error(
      `${error.message || 'No se pudo completar el registro'}${
        error.paso ? ` (en: ${error.paso})` : ''
      }`
    );
  }
}