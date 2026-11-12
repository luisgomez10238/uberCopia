// AI-assisted: see docs/AI_LOG.md #16
import 'dotenv/config';
import { readFileSync } from 'node:fs';
import express from 'express';
import cors from 'cors';
import Stripe from 'stripe';
import admin from 'firebase-admin';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

admin.initializeApp({
  credential: admin.credential.cert(
    JSON.parse(readFileSync(process.env.FIREBASE_SERVICE_ACCOUNT_PATH || './serviceAccountKey.json', 'utf8'))
  ),
});
const db = admin.firestore();

const app = express();
app.use(cors());

// Webhook de Stripe. Va ANTES de express.json() porque necesita el cuerpo
// crudo para validar la firma.
app.post('/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  let evento;
  try {
    evento = stripe.webhooks.constructEvent(
      req.body,
      req.headers['stripe-signature'],
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (error) {
    console.error('Firma de webhook inválida:', error.message);
    return res.status(400).send('Firma inválida');
  }

  if (evento.type === 'checkout.session.completed') {
    const sesion = evento.data.object;
    const tripId = sesion.metadata?.tripId;

    if (sesion.payment_status === 'paid' && tripId) {
      try {
        const ref = db.collection('trips').doc(tripId);
        await db.runTransaction(async (t) => {
          const snap = await t.get(ref);
          if (!snap.exists) throw new Error(`Viaje ${tripId} no existe`);
          // Idempotente: Stripe puede reenviar el mismo evento.
          if (snap.data().status === 'paid') return;
          t.update(ref, {
            status: 'paid',
            paymentStatus: 'paid',
            paymentId: sesion.payment_intent,
            paidAt: admin.firestore.FieldValue.serverTimestamp(),
          });
        });
        console.log(`Viaje ${tripId} marcado como pagado`);
      } catch (error) {
        console.error('Error actualizando viaje:', error.message);
        return res.status(500).send('Error actualizando viaje');
      }
    }
  }

  res.json({ received: true });
});

app.use(express.json());

app.get('/health', (_req, res) => res.json({ ok: true }));

// Crea una sesión de Stripe Checkout. El monto se lee de Firestore (no del
// cliente). COP es moneda de 2 decimales: el monto va en centavos (pesos * 100).
app.post('/create-checkout-session', async (req, res) => {
  try {
    const { tripId } = req.body;
    if (!tripId) return res.status(400).json({ error: 'tripId requerido' });

    const snap = await db.collection('trips').doc(tripId).get();
    if (!snap.exists) return res.status(404).json({ error: 'Viaje no encontrado' });

    const viaje = snap.data();
    if (viaje.status !== 'completed') {
      return res.status(409).json({ error: 'El viaje debe estar finalizado para cobrarse' });
    }
    if (viaje.paymentMethod === 'cash') {
      return res.status(409).json({ error: 'Este viaje se paga en efectivo' });
    }

    const totalCop = Math.round((viaje.fare || 0) + (viaje.tip || 0));
    if (totalCop <= 0) return res.status(409).json({ error: 'Monto inválido' });

    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      line_items: [
        {
          quantity: 1,
          price_data: {
            currency: 'cop',
            unit_amount: totalCop * 100,
            product_data: { name: 'Viaje UberClone' },
          },
        },
      ],
      metadata: { tripId },
      success_url: 'https://example.com/pago-exitoso',
      cancel_url: 'https://example.com/pago-cancelado',
    });

    res.json({ url: session.url, sessionId: session.id });
  } catch (error) {
    console.error('Error creando sesión:', error.message);
    res.status(500).json({ error: 'No se pudo crear la sesión de pago' });
  }
});

const port = process.env.PORT || 4242;
app.listen(port, () => console.log(`Backend escuchando en http://localhost:${port}`));
