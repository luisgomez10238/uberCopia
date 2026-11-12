// AI-assisted: see docs/AI_LOG.md #5
// Sube imágenes a Cloudinary con un "upload preset" SIN FIRMA (unsigned).
// Así el API secret de Cloudinary nunca va en la app.
const CLOUD_NAME = process.env.EXPO_PUBLIC_CLOUDINARY_CLOUD_NAME;
const UPLOAD_PRESET = process.env.EXPO_PUBLIC_CLOUDINARY_UPLOAD_PRESET;

// Se usa XMLHttpRequest en lugar de fetch: el fetch de las versiones nuevas de
// Expo no acepta archivos en el formato { uri, type, name } dentro de FormData
// (error "Unsupported FormData part implementation"), pero XMLHttpRequest sí.
const enviarFormulario = (url, formData) =>
  new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open('POST', url);
    xhr.timeout = 60000;

    xhr.onload = () => {
      let datos = null;
      try {
        datos = JSON.parse(xhr.responseText);
      } catch (e) {
        // respuesta que no es JSON: se informa abajo con el código HTTP
      }

      if (xhr.status >= 200 && xhr.status < 300 && datos?.secure_url) {
        resolve(datos.secure_url);
      } else {
        reject(
          new Error(
            datos?.error?.message ||
              `No se pudo subir la imagen (código ${xhr.status})`
          )
        );
      }
    };

    xhr.onerror = () => reject(new Error('Sin conexión al subir la imagen'));
    xhr.ontimeout = () => reject(new Error('Se agotó el tiempo al subir la imagen'));

    xhr.send(formData); // sin Content-Type manual: se arma solo con el boundary
  });

export async function subirImagen(uri, carpeta) {
  if (!uri) {
    throw new Error('Falta la imagen que se quiere subir');
  }
  if (!CLOUD_NAME || !UPLOAD_PRESET) {
    throw new Error('Falta la configuración de Cloudinary en el archivo .env');
  }

  const formData = new FormData();
  formData.append('file', { uri, type: 'image/jpeg', name: 'foto.jpg' });
  formData.append('upload_preset', UPLOAD_PRESET);
  formData.append('folder', carpeta);

  return enviarFormulario(
    `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`,
    formData
  );
}