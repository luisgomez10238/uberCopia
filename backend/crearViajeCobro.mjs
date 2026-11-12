// AI-assisted: see docs/AI_LOG.md #16
// Crea un viaje de prueba "completed" con pago por tarjeta usando Firebase Admin
// (no depende de las reglas de Firestore ni guarda contraseñas).
// Uso: node crearViajeCobro.mjs correo-del-conductor@ejemplo.com
import { readFileSync } from 'node:fs';
import admin from 'firebase-admin';

const correo = process.argv[2];
if (!correo) {
  console.error('Uso: node crearViajeCobro.mjs correo-del-conductor@ejemplo.com');
  process.exit(1);
}

admin.initializeApp({
  credential: admin.credential.cert(JSON.parse(readFileSync('./serviceAccountKey.json', 'utf8'))),
});

const usuario = await admin.auth().getUserByEmail(correo);

const ref = await admin.firestore().collection('trips').add({
  driverId: usuario.uid,
  passengerId: 'prueba',
  status: 'completed',
  category: 'economy',
  distanceKm: 8.5,
  durationMin: 22,
  fare: 15000,
  commission: 3000,
  commissionRate: 0.2,
  driverEarnings: 12000,
  tip: 0,
  paymentMethod: 'card',
  paymentStatus: 'pending',
  origin: { lat: 6.2442, lng: -75.5812, address: 'Origen de prueba' },
  destination: { lat: 6.2086, lng: -75.5659, address: 'Destino de prueba' },
  createdAt: admin.firestore.FieldValue.serverTimestamp(),
  completedAt: admin.firestore.FieldValue.serverTimestamp(), // el historial ordena por este campo
});

console.log('Viaje creado. ID:', ref.id);
process.exit(0);
