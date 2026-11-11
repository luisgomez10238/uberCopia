import { doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../config/firebase';
import { subirImagen } from './cloudinary';

// Solo se pueden editar estos datos. El documento de identidad, el correo, el
// vehículo y el estado de aprobación no se cambian desde la app.
export async function actualizarPerfil(uid, { nombre, telefono, genero, idioma, fotoNueva }) {
  const cambios = {
    fullName: nombre.trim(),
    phone: telefono,
    gender: genero,
    language: idioma,
    updatedAt: serverTimestamp(),
  };

  if (fotoNueva) {
    cambios.profilePhotoUrl = await subirImagen(fotoNueva, `drivers/${uid}`);
  }

  await updateDoc(doc(db, 'drivers', uid), cambios);
}