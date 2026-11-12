import { readFileSync } from 'node:fs';
import admin from 'firebase-admin';
admin.initializeApp({credential: admin.credential.cert(JSON.parse(readFileSync('./serviceAccountKey.json','utf8')))});
const s = await admin.firestore().collection('trips').where('passengerId','==','prueba').get();
s.docs.forEach(d=>{const x=d.data();console.log(d.id,x.status,x.paymentStatus,x.paymentId?'pid:si':'pid:no',x.paidAt?'paidAt:si':'paidAt:no')});
process.exit(0);
