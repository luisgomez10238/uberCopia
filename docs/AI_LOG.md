# Bitácora de uso de IA — Deysi Gómez

Herramienta usada en todas las entradas: **Claude (Anthropic)**.
Los prompts están copiados tal como se escribieron. 

> Esta bitácora se redactó a partir del historial de la conversación. El resumen
> de cada respuesta es breve; los hashes son los commits donde quedó el cambio.

---

### Entrada #1
- Fecha: 2026-11-04
- Integrante: Deysi Lorena Gómez 
- Herramienta: Claude
- Objetivo: Entender el documento de requisitos y revisar el código inicial del registro
- Prompt: "Tengo un proyecto la primera entrega son las pestañas 1 y 2 analiza el documento y luego te paso el codigo que ya realizo mi compañero ."
- Resumen de la respuesta: Análisis del documento (registro en pestañas, validaciones) y revisión del código del compañero, con errores y sugerencias.
- Qué se usó / modificó / descartó: Se usó el análisis del documento como guía. En el código del compañero se detectó que importaba `reglas` y `obtenerError`, que no existían, y se crearon en `validators.js`.
- Archivos y commit: src/components/*, src/screens/* del registro — ca49e12
- Verificación: Fue una revisión sin código ejecutable. Los errores señalados se contrastaron con el código del proyecto.
- Aprendizaje: Las validaciones del codigo anterior Tenian errores y se cambiaron 

### Entrada #2
- Fecha: 2026-11-04
- Integrante: Deysi Lorena Gómez 
- Herramienta: Claude
- Objetivo: Armar el contexto del registro (`RegistrationContext`) y las validaciones
- Prompt: "como quedaria mi archivo context adecuado para funcionar con mis validaciones"
- Otros prompts de la misma entrada: "como es mejor?", "si contexto solo para estado", "React"
- Resumen de la respuesta: Propuesta de contexto solo para el estado, con reglas de validación por campo (`reglas`, `obtenerError`, `normalizar`) y errores mostrados bajo cada campo.
- Qué se usó / modificó / descartó: Se eligió usar el contexto solo para el estado, con las reglas de validación en `validators.js` (`reglas`, `obtenerError`, `normalizar`).
- Archivos y commit: src/context/RegistrationContext.js, src/utils/validators.js — ca49e12
- Verificación: Se emulo en el celular 
- Aprendizaje: El contexto guarda los datos de las tres pestañas en un solo lugar y verifica que se cumplan las reglas. Con eso sé cuándo las tres pestañas están completas y válidas para habilitar el botón de enviar el registro.

### Entrada #3
- Fecha: 2026-11-04 y 2026-11-06
- Integrante: Deysi Lorena Gómez 
- Herramienta: Claude
- Objetivo: Corregir el selector de fecha que no se cerraba y el selector de lista en iOS
- Prompt: "porque mi selecionador de fecha no se cierra?"
- Otro prompt: el código de `DropdownField` pegado completo, con la frase "en ios se ve muy feo"
- Resumen de la respuesta: Botón "Listo" para cerrar el selector de fecha en iOS y un selector de lista tipo modal con Cancelar y Listo.
- Qué se usó / modificó / descartó: En `DateField` se agregó el botón "Listo" para cerrar el selector en iOS. En `DropdownField` se reemplazó el selector nativo por un selector modal con Cancelar y Listo.
- Archivos y commit: src/components/DateField.js, src/components/DropdownField.js — 2ba5a15
- Verificación: se ha registrado una prueba en el Celular.
- Aprendizaje: En iOS el selector de fecha aparece como una rueda y no se cierra solo. El botón "Listo" confirma la fecha elegida y cierra el selector. Si el usuario no movió la rueda, guarda la fecha que aparece inicialmente.

### Entrada #4
- Fecha: 2026-11-06 a 2026-11-09
- Integrante: Luis Alberto Gomez
- Herramienta: Claude
- Objetivo: Conectar el registro a Firebase y construir la pestaña Documentos
- Prompt: "necesito unirlo a firebase"
- Otros prompts: "Como deberia quedar mi pantalla de Documentos para el registro", "explicame como se configura todo lo de firebase", "pero obviamente el conductor debe de poner contraseña", "Datos personales"
- Resumen de la respuesta: Configuración de Firebase Authentication y Firestore, subida de fotos a Cloudinary, pantalla de Documentos con fechas de vencimiento y términos, y guardado del conductor en estado pendiente.
- Qué se usó / modificó / descartó: Se usaron Firebase Authentication, Firestore y Cloudinary con upload preset sin firma. El servicio de registro guarda los documentos, el correo de Mercado Pago y el porcentaje de comisión aceptado.
- Archivos y commit: src/config/firebase.js, src/services/cloudinary.js, src/services/driverservice.js, src/screens/Documentosscreen.js — 5323869
- Verificación: Se ha registrado una prueba en el Celular.
- Aprendizaje: Cloudinary se usa para subir y almacenar las fotos del registro (perfil, vehículo y documentos). En vez de guardar las imágenes en Firebase, se suben a Cloudinary y la URL segura que devuelve se guarda en Firestore.

### Entrada #5
- Fecha: 2026-11-09
- Integrante: Luis Alberto Gomez
- Herramienta: Claude
- Objetivo: Arreglar los errores al enviar el registro
- Prompt: "al enviar el registro me sale undefined is not a function"
- Otro prompt: "me salio formDataPart implementation"
- Resumen de la respuesta: Seguimiento por pasos en el servicio de registro para ubicar el fallo, y cambio de la subida a Cloudinary a `XMLHttpRequest`.
- Qué se usó / modificó / descartó: Se usó el seguimiento por pasos para ubicar el fallo. La subida a Cloudinary pasó a `XMLHttpRequest` porque `fetch` de Expo rechaza `{uri, type, name}` dentro de FormData.
- Archivos y commit: src/services/cloudinary.js, src/services/driverservice.js — 5323869
- Verificación: se ha registrado una prueba en el celular.
- Aprendizaje: `fetch` daba un error de implementación de `FormData` (formDataPart) al enviar imágenes desde Expo. Se cambió a `XMLHttpRequest`, que permite enviar el archivo con su URI, tipo y nombre.

### Entrada #6
- Fecha: 2026-11-09
- Integrante: Deysi Lorena Gomez
- Herramienta: Claude
- Objetivo: Que el registro pendiente persista al reiniciar la app
- Prompt: "al momento de hacer el registro queda pendiente pero si reincio la app vuelve al formulario , no deberia de haber persistencia ahi?"
- Resumen de la respuesta: Persistencia de Auth con AsyncStorage, `SessionContext` y navegador condicional según la sesión y el estado del conductor.
- Qué se usó / modificó / descartó: Se agregó `SessionContext` y un navegador condicional (Login y Registro, Pendiente o Drawer) según la sesión y el estado del conductor.
- Archivos y commit: src/context/Sessioncontext.js, src/navigation/Rootnavigator.js — 96efba3
- Verificación: No se ha registrado una prueba en el Celular.
- Aprendizaje: La app volvía al formulario porque no guardaba la información de la sesión, y entonces creía que el conductor no se había registrado. Se solucionó guardando la sesión en el celular y leyéndola al abrir la app.

### Entrada #7
- Fecha: 2026-11-10 y 2026-11-11
- Integrante: Luis Alberto Gomez
- Herramienta: Claude
- Objetivo: Lógica de la pantalla de Inicio, ubicación en tiempo real y perfil
- Prompt: "como debo de implementar la logica del home?"
- Otros prompts: "por que usar expo-location ?", "como se crea la build para ios", "Con que me recomiendas seguir? yo quiero crear la parte de perfil y configuracion en el inicionScreen"
- Resumen de la respuesta: Diseño del hook `useDriverLocation` con limpieza del seguimiento, interruptor Disponible y explicación de `expo-location` y de las builds de iOS.
- Qué se usó / modificó / descartó: Se usó `expo-location` (permiso, posición inicial y seguimiento cada unos 5 segundos), con la función de limpieza del `useEffect`.
- Archivos y commit: src/Hooks/useDriverLocation.js, src/screens/Inicioscreen.js — 5dce65d; src/screens/Perfilscreen.js — 51cf5f2
- Verificación: se ha registrado una prueba en el Celular.
- Aprendizaje: La función de limpieza detiene el seguimiento de la ubicación cuando el conductor deja de estar disponible o sale de la pantalla.

### Entrada #8
- Fecha: 2026-11-11
- Integrante: Luis Alberto Gomez
- Herramienta: Claude
- Objetivo: Crear el hook `useTripRequests` (solicitudes con temporizador de 15 s)
- Prompt: "Vamos con el useTripRequests"
- Otro prompt: "como deberia crear el useTripRequests ?"
- Resumen de la respuesta: Estructura del hook: suscripción en tiempo real, aceptar y rechazar con transacciones y temporizador. Después se corrigió el temporizador para usar la hora real y no ejecutar el rechazo dentro de `setState`.
- Qué se usó / modificó / descartó: Se conservó la estructura del hook ya existente en el proyecto. Se modificó solo el temporizador: ahora usa la hora real y el rechazo automático ya no corre dentro de `setState`.
- Archivos y commit: src/Hooks/useTripRequests.js — 898f3a7
- Verificación: Se creó un viaje de prueba en - Aprendizaje: Cuando se acaban los 15 segundos, la solicitud se rechaza automáticamente: el viaje queda en estado `rejected` con el motivo `expired` y la tarjeta desaparece.

### Entrada #9
- Fecha: 2026-11-11
- Integrante: Deysi Lorena Gómez 
- Herramienta: Claude
- Objetivo: Revisar el proyecto completo, corregir errores y agregar el detalle del historial
- Prompt: "pero mira como esta mi proyecto actualmente para que me corrijas los archivos y me des sugerencias"
- Otros prompts: "vamos paso a paso me estan dandoi muchos archivos", "ya", "como hago para que lo hagas tu ? solo quiero que corrijas los archivos y los nuevos o las nuevas funciones No"
- Resumen de la respuesta: Corrección de `calculateFare` (redondeo a 100 COP y propina fuera de la tarifa), Drawer con Historial y Ganancias, filtro por método de pago, detalle del viaje con mapa y la ruta guardada. Los cambios se aplicaron directamente en los archivos del proyecto.
- Qué se usó / modificó / descartó: Se aplicaron las correcciones una por una. Quedaron propuestas, pero sin aplicar al proyecto, las correcciones de `useEarnings` (saldo en efectivo) y `useTripHistory` (consultas desordenadas).
- Archivos y commit: src/utils/calculateFare.js, src/navigation/DriverDrawer.js, src/components/Historial/FiltroPago.js, ViajeCard.js, EstadoPago.js, src/screens/historial/DetalleViajeScreen.js, src/utils/format.js — 898f3a7
- Verificación: `calculateFare` probado con el ejemplo del documento (8,5 km y 22 min: Económico 19.200 / 3.840 / 15.360; XL 26.900 / 5.380 / 21.520).
- Aprendizaje: Se comprendio los errores que habian el codigo actual 

### Entrada #10
- Fecha: 2026-11-11
- Integrante: Luis Alberto Gomez Orrego 
- Herramienta: Claude
- Objetivo: Viaje en curso con estados, ruta, finalizar y cancelar
- Prompt: "vamos a viaje"
- Resumen de la respuesta: Pantalla de viaje en curso, hook `useActiveTrip`, servicio de cambios de estado con transacciones, y cálculo de ruta una sola vez por tramo. Al finalizar se usa `calculateFare` y se guarda `commissionRate`.
- Qué se usó / modificó / descartó: Se descartó Google Directions/Routes API porque Google exigía un pago único de activación; se usó OSRM, que el documento lista como alternativa gratuita.
- Archivos y commit: src/screens/viaje/ViajeEnCursoScreen.js, src/Hooks/useActiveTrip.js, src/services/tripService.js, src/services/directionsService.js, src/utils/polyline.js — 898f3a7 y edcd610
- Verificación: Se probó en el celular: aceptar el viaje, pasajero a bordo, finalizar y ver la ruta en el mapa.
- Aprendizaje: Un viaje tiene dos tramos: del conductor al punto de recogida y de la recogida al destino. La ruta se pide cuando empieza cada tramo, no cada vez que cambia la ubicación del conductor, para evitar solicitudes innecesarias y repetir cálculos de rutas que no han cambiado.

### Entrada #11
- Fecha: 2026-11-11
- Integrante: Deysi Lorena Gómez 
- Herramienta: Claude
- Objetivo: Crear viajes de prueba en Firestore y ajustar las reglas de seguridad
- Prompt: "pasame el cuerpo completo de la coleccion Trip"
- Otros prompts: "y como seria el de prueba", "no hay manera de de insertar codigo en firebase para crear un documento?", "como lo ejecuto?", "salio permission-denied", y las reglas de Firestore pegadas completas
- Resumen de la respuesta: Estructura de la colección `trips`, un script de Node para crear un viaje de prueba y reglas de Firestore para crear, aceptar, rechazar y cambiar el estado del viaje.
- Qué se usó / modificó / descartó: Se usaron el script y las reglas propuestas. La regla `create` de `trips` es solo para pruebas y debe borrarse antes de entregar.
- Archivos y commit: crearViajePrueba.mjs, reglas de Firestore (consola de Firebase) — edcd610
- Verificación: El viaje de prueba se creó y apareció en la app.
- Aprendizaje: Se Aprende A crear una Coleccion Trip

### Entrada #12
- Fecha: 2026-11-11
- Integrante: Deysi Lorena Gomez
- Herramienta: Claude
- Objetivo: Pantalla de cobro y resumen del viaje, con pago en efectivo
- Prompt: "ya que parte sigue del codigo?"
- Otro prompt: "Si"
- Resumen de la respuesta: Pantalla de resumen con tarifa, comisión, ganancia neta y estado del pago, y botón "Cobro recibido" que deja el viaje en `paid`.
- Qué se usó / modificó / descartó: Se usó la pantalla tal cual. El cobro en efectivo necesita en Firestore la regla de `completed` a `paid`.
- Archivos y commit: src/screens/viaje/ResumenViajeScreen.js, src/services/tripService.js — edcd610
- Verificación: Revisión de sintaxis e imports del código. No se ha registrado una prueba en el celular del botón "Cobro recibido".
- Aprendizaje: 

### Entrada #13
- Fecha: 2026-11-12
- Integrante: Luis Alberto Gomez
- Herramienta: Claude
- Objetivo: Consultas sobre notificaciones push y pagos (sin código en el repositorio)
- Prompt: "las FCM se pueden hacer sin build?"
- Otros prompts: "pero explicame la diferencian entre expo notifications", "pero con firebase puedo probar en ios?", "Explicame como haremos el backend de pagos", "Vamos con Stripe en modo prueba"
- Resumen de la respuesta: Comparación entre `@react-native-firebase/messaging` y `expo-notifications` según la documentación oficial, y plan del backend de pagos. Los pagos con pasarela quedaron pendientes.
- Qué se usó / modificó / descartó: Solo informativo. Mercado Pago y Stripe se descartaron por ahora.
- Archivos y commit: ninguno
- Verificación: Revisión de documentación oficial.
- Aprendizaje: No se puede crear el backend de la pasarela de pagos debido a problemas con la cuenta de mercado pago


### Entrada #14
- Fecha: 2026-11-12
- Integrante: Deysi Lorena Gomez
- Herramienta: Claude
- Objetivo: Crear esta bitácora, el README y el `.env.example`
- Prompt: "1. ya hecho 2. ya hecho 3.hazlo"
- Resumen de la respuesta: Redacción de `docs/AI_LOG.md`, `README.md` y `.env.example`.
- Qué se usó / modificó / descartó: Se usaron los tres archivos y se limpió el `.gitignore`, que tenía caracteres corruptos.
- Archivos y commit: docs/AI_LOG.md, README.md, .env.example — (agregar hash)
- Verificación: Se comprobó con `git check-ignore` que `.env` está ignorado y se revisó que el `.gitignore` quedara en texto plano.
- Aprendizaje: La bitácora documenta cómo se usó la IA: el problema, el prompt, la solución propuesta, los cambios hechos en el código y cómo se verificó. Sirve para demostrar que la IA fue una herramienta de apoyo y que las soluciones se revisaron, se entendieron y se probaron.

### Entrada #15
- Fecha: 2026-11-12
- Integrante: Luis Alberto Gomez
- Herramienta: Claude
- Objetivo: Notificaciones push de nuevas solicitudes con `expo-notifications`
- Prompt: "Vamos a crear las notificaiones push"
- Otros prompts: "Hagamoslo con expo", "pruebo en un ios fisico", "hagamoslo con fcm", "Si lo hacemos con expo lo puedo probar en mi ios?", "Si"
- Resumen de la respuesta: Comparación entre `@react-native-firebase/messaging` y `expo-notifications` según la documentación oficial. Para probar en un iPhone físico con Expo Go se eligió `expo-notifications` con el servicio de Expo, porque FCM directo en iOS exige un build de iOS y una cuenta de Apple Developer. Hook que pide el permiso, obtiene el token y lo guarda en `drivers/{uid}`, y script de prueba que envía el aviso.
- Qué se usó / modificó / descartó: Se descartó `@react-native-firebase/messaging` (FCM directo) por los requisitos de iOS. El documento nombra esa librería, por eso conviene confirmar con el profesor que acepta `expo-notifications`.
- Archivos y commit: src/Hooks/usePushNotifications.js, src/services/driverStatusService.js, src/screens/Inicioscreen.js, crearViajePrueba.mjs, app.json — (agregar hash)
- Verificación: Se probó en un iPhone físico con Expo Go: al ejecutar el script que crea el viaje de prueba, llegó la notificación. En Expo Go aparece con el nombre y el icono de Expo Go.
- Aprendizaje: Se aprendio que para Utilzar Fcm Se necesita una pro build nativa que solo se puede compliar en un ios o Con una cuenta de pago

### Entrada #16
- Fecha: 2026-11-12
- Integrante: Luis Alberto Gomez
- Herramienta: Claude
- Objetivo: Backend de pagos con Stripe en modo prueba (sesión de pago, webhook) y botón de pago con tarjeta en la app
- Prompt: "Creo que ya tengo el stripe en modo prueba"
- Otros prompts: "Vamos con Stripe en modo prueba", "Como puedo hacer lo de los pagos?", "si las veo", "ya hice el pago", "no hay boton de pagar"
- Resumen de la respuesta: Servidor Express con dos rutas: `/create-checkout-session`, que lee la tarifa y la propina desde Firestore y crea la sesión de Stripe Checkout en COP (moneda de dos decimales, monto en pesos × 100), y `/webhook`, que valida la firma de Stripe y deja el viaje en `paid` con Firebase Admin. En la app, un servicio que pide la sesión y un botón "Pagar con tarjeta" en el resumen del viaje, más un acceso desde el detalle del historial. Un script con Admin SDK crea viajes de prueba sin depender de las reglas de Firestore.
- Qué se usó / modificó / descartó: Se descartó Mercado Pago porque la cuenta no permitió crear el Checkout. Se descartó `@stripe/stripe-react-native` porque exige un build de desarrollo y se usa la página de pago alojada de Stripe, que funciona en Expo Go. Se descartó recibir el monto desde la app para no confiar en el cliente. Las claves van solo en `backend/.env` y `serviceAccountKey.json`, ambos ignorados por Git.
- Archivos y commit: backend/server.js, backend/package.json, backend/.env.example, backend/crearViajeCobro.mjs, src/services/paymentService.js, src/screens/viaje/ResumenViajeScreen.js, src/screens/historial/DetalleViajeScreen.js, .env.example, .gitignore — (agregar hash)
- Verificación: Se creó una sesión con la tarjeta de prueba 4242 4242 4242 4242 y el Stripe CLI reenvió el evento `checkout.session.completed`. En Firestore el viaje quedó con `status: 'paid'`, `paymentStatus`, `paymentId` y `paidAt`. (Agregar aquí el resultado de la prueba desde el celular.)
- Aprendizaje: Solo se cambia a paid cuando se llega al mensaje de comprobacion de stripe para que el usuario no pueda volver sin pagar , El COP en Stripe es una moneda de dos decimales. Stripe espera la unidad mínima, los centavos. Por eso 15.000 pesos se envían como 1500000.
