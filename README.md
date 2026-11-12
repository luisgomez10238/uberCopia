# UberClone — Versión Conductor

Aplicación móvil del conductor, inspirada en Uber, hecha con React Native y Expo
(iOS y Android). El conductor se registra, se pone Disponible, recibe solicitudes
de viaje en tiempo real, las atiende, cobra y consulta su historial y sus ganancias.

## Tecnologías

- React Native + Expo (SDK 58), React Navigation (Stack, Tabs y Drawer)
- Firebase Authentication y Firestore (tiempo real con `onSnapshot`)
- Cloudinary (fotos de perfil, vehículo y documentos)
- `expo-location` y `react-native-maps`
- Rutas con OSRM (OpenStreetMap), gratuito y sin llave
- Pagos con tarjeta: Stripe en modo de prueba, con un backend en Node.js y Express (`backend/`)

## Instalación

Requisitos: Node.js 20 o superior, un celular con Expo Go o un emulador, y un
proyecto de Firebase con Authentication (correo y contraseña) y Firestore.

```bash
npm install
cp .env.example .env     # en Windows: copy .env.example .env
# completa los valores del archivo .env
npx expo start
```

## Variables de entorno

Los nombres están en [`.env.example`](.env.example). El archivo `.env` real está
excluido de Git. Solo se usan credenciales de prueba.

La app necesita además `EXPO_PUBLIC_BACKEND_URL`, la dirección del backend de pagos.
En un celular no sirve `localhost`: usa la IP de tu computador en la red Wi-Fi, por
ejemplo `http://192.168.1.10:4242` (se consulta con `ipconfig` en Windows). El celular
y el computador deben estar en la misma red.

## Pagos con Stripe (modo de prueba)

El conductor cobra los viajes pagados con tarjeta desde el resumen del viaje. La app
nunca toca datos de tarjeta: abre la página de pago alojada por Stripe (Checkout).

Flujo:

1. La app envía solo el `tripId` a `POST /create-checkout-session`.
2. El backend lee la tarifa y la propina del viaje en Firestore (la app no envía el
   monto), crea la sesión de Stripe en COP y devuelve la URL de pago. COP es una
   moneda de dos decimales, por eso el monto se envía multiplicado por 100.
3. El pasajero paga en la página de Stripe.
4. Stripe avisa al backend en `POST /webhook` con el evento `checkout.session.completed`.
   El backend valida la firma del aviso y, con Firebase Admin, deja el viaje en
   `status: 'paid'` con `paymentStatus`, `paymentId` y `paidAt`.
5. La app escucha el viaje con `onSnapshot` y muestra el estado Pagado.

### Cómo levantar el backend

Requisitos: Node.js 20 o superior, una cuenta de Stripe en modo de prueba y el
[Stripe CLI](https://docs.stripe.com/stripe-cli).

1. En la consola de Firebase: Configuración del proyecto, Cuentas de servicio, Generar
   nueva clave privada. Guarda el archivo como `backend/serviceAccountKey.json`.
   Está excluido de Git; nunca lo subas.
2. Crea `backend/.env` a partir de `backend/.env.example` y completa:
   - `STRIPE_SECRET_KEY`: la clave secreta de prueba (`sk_test_...`) del panel de Stripe.
   - `STRIPE_WEBHOOK_SECRET`: el `whsec_...` que muestra el paso 4.
   - `FIREBASE_SERVICE_ACCOUNT_PATH` y `PORT` ya traen un valor por defecto.
3. Instala y arranca el servidor:
   ```bash
   cd backend
   npm install
   npm start        # escucha en http://localhost:4242
   ```
4. En otra terminal, reenvía los avisos de Stripe al backend local:
   ```bash
   stripe login
   stripe listen --events checkout.session.completed --forward-to http://localhost:4242/webhook
   ```
   Copia el `whsec_...` que imprime a `STRIPE_WEBHOOK_SECRET` y reinicia el servidor.
5. Crea un viaje de prueba con pago por tarjeta (usa el Admin SDK, no las reglas):
   ```bash
   cd backend
   node crearViajeCobro.mjs correo-del-conductor@ejemplo.com
   ```
6. En la app: Historial, abre el viaje, "Ir a cobrar este viaje", "Pagar con tarjeta".
   Tarjeta de prueba: `4242 4242 4242 4242`, cualquier fecha futura y cualquier CVC.
   Al terminar, vuelve a la app: el estado cambia a Pagado.

Las claves (`sk_test_`, `whsec_`, la cuenta de servicio) solo viven en archivos
excluidos de Git y nunca en el código de la app.

## Firestore

- Colección `drivers/{uid}`: perfil del conductor. Al registrarse queda en estado
  `pending`; para poder ponerse Disponible hay que cambiar `status` a `approved`
  en la base de datos.
- Colección `trips`: viajes. Estados: `requested`, `accepted`, `driver_arriving`,
  `in_progress`, `completed`, `paid`, `cancelled` y `rejected`.
- Las reglas de seguridad deben permitir al conductor leer sus viajes y cambiar
  su estado. El paso a `paid` de los viajes con tarjeta lo hace solo el backend
  (Admin SDK); el conductor solo puede marcar `paid` los viajes en efectivo.
- El historial necesita índices compuestos en Firestore. Si falla, Metro muestra
  un enlace para crearlos.

## Estructura

```
backend/        server.js (Stripe y webhook), crearViajeCobro.mjs (viaje de prueba)
src/
  Hooks/        useDriverLocation, useTripRequests, useActiveTrip, useEarnings, useTripHistory
  components/   Registro/ y Historial/
  config/       firebase.js, pricing.js (tarifa y comisión)
  constants/    opciones de listas
  context/      RegistrationContext, SessionContext
  navigation/   RootNavigator (Stack), DriverDrawer (Drawer)
  screens/      login/, historial/, ganancias/, viaje/, Inicio, Perfil
  services/     driverservice, driverStatusService, tripService, directionsService, paymentService, cloudinary
  utils/        calculateFare, validators, format, polyline, preferences
```

## Estado del proyecto

Hecho: registro en tres pestañas con validaciones, sesión persistente, Inicio con
mapa y disponibilidad, solicitudes con temporizador de 15 s, viaje en curso con
ruta, resumen, cobro en efectivo y con tarjeta (Stripe, modo de prueba), historial con filtros y detalle, ganancias,
perfil y cálculo de tarifa, comisión y ganancia neta.

Notificaciones push: se usa `expo-notifications` con el servicio de Expo, probado en un
iPhone físico con Expo Go. No se usó `@react-native-firebase/messaging` (FCM directo)
porque en iOS exige un build propio y una cuenta de Apple Developer. Los avisos se
envían con `crearViajePrueba.mjs`; para viajes reales haría falta un servidor.

Pendiente: idioma español/inglés en toda la app. Se intentó Mercado Pago, pero no
fue posible crear el Checkout con la cuenta disponible, por eso se usó Stripe.
Stripe solo se probó en modo de prueba; no se manejan datos de tarjeta reales.

## Uso de IA

Se usaron herramientas de inteligencia artificial durante el desarrollo. Todo el
detalle está en la bitácora: [docs/AI_LOG.md](docs/AI_LOG.md). Los bloques de código
asistidos están marcados con un comentario `// AI-assisted: see docs/AI_LOG.md #N`.
