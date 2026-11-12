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

## Firestore

- Colección `drivers/{uid}`: perfil del conductor. Al registrarse queda en estado
  `pending`; para poder ponerse Disponible hay que cambiar `status` a `approved`
  en la base de datos.
- Colección `trips`: viajes. Estados: `requested`, `accepted`, `driver_arriving`,
  `in_progress`, `completed`, `paid`, `cancelled` y `rejected`.
- Las reglas de seguridad deben permitir al conductor leer sus viajes y cambiar
  su estado.
- El historial necesita índices compuestos en Firestore. Si falla, Metro muestra
  un enlace para crearlos.

## Estructura

```
src/
  Hooks/        useDriverLocation, useTripRequests, useActiveTrip, useEarnings, useTripHistory
  components/   Registro/ y Historial/
  config/       firebase.js, pricing.js (tarifa y comisión)
  constants/    opciones de listas
  context/      RegistrationContext, SessionContext
  navigation/   RootNavigator (Stack), DriverDrawer (Drawer)
  screens/      login/, historial/, ganancias/, viaje/, Inicio, Perfil
  services/     driverservice, driverStatusService, tripService, directionsService, cloudinary
  utils/        calculateFare, validators, format, polyline, preferences
```

## Estado del proyecto

Hecho: registro en tres pestañas con validaciones, sesión persistente, Inicio con
mapa y disponibilidad, solicitudes con temporizador de 15 s, viaje en curso con
ruta, resumen y cobro en efectivo, historial con filtros y detalle, ganancias,
perfil y cálculo de tarifa, comisión y ganancia neta.

Notificaciones push: se usa `expo-notifications` con el servicio de Expo, probado en un
iPhone físico con Expo Go. No se usó `@react-native-firebase/messaging` (FCM directo)
porque en iOS exige un build propio y una cuenta de Apple Developer. Los avisos se
envían con `crearViajePrueba.mjs`; para viajes reales haría falta un servidor.

Pendiente: pagos con pasarela (Mercado Pago o Stripe en modo de prueba) e idioma
español/inglés en toda la app.

## Uso de IA

Se usaron herramientas de inteligencia artificial durante el desarrollo. Todo el
detalle está en la bitácora: [docs/AI_LOG.md](docs/AI_LOG.md). Los bloques de código
asistidos están marcados con un comentario `// AI-assisted: see docs/AI_LOG.md #N`.
