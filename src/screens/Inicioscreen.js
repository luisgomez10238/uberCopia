
import React, { useCallback, useEffect, useRef, useState } from 'react';

import {
  View,
  Text,
  Switch,
  Pressable,
  ActivityIndicator,
  Linking,
  StyleSheet,
  Alert,
  ScrollView,
} from 'react-native';

import MapView from 'react-native-maps';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useSession } from '../context/SessionContext';

import useDriverLocation from '../Hooks/useDriverLocation';
import useTripRequests from '../Hooks/useTripRequests';
import useActiveTrip from '../Hooks/useActiveTrip';

import {
  actualizarDisponibilidad,
  actualizarUbicacion,
} from '../services/driverStatusService';

import {
  leerUltimoEstadoDisponible,
  guardarUltimoEstadoDisponible,
} from '../utils/preferences';

// Formato de dinero colombiano
const formatoDinero = (valor) =>
  new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    maximumFractionDigits: 0,
  }).format(valor || 0);

export default function InicioScreen() {
  const { usuario, conductor } = useSession();

  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const mapRef = useRef(null);

  const uid = usuario?.uid;

  const [disponible, setDisponible] = useState(false);
  const [preferenciaLista, setPreferenciaLista] = useState(false);
  const [procesandoSolicitud, setProcesandoSolicitud] = useState(false);

  // 1. Guardar ubicación en Firestore
  const guardarUbicacion = useCallback(
    (coords) => {
      if (!uid) return;

      actualizarUbicacion(uid, coords).catch((e) =>
        console.warn(
          '[home] no se pudo guardar la ubicación',
          e?.message
        )
      );
    },
    [uid]
  );

  // 2. Hook de ubicación
  const {
    ubicacion,
    permiso,
    error,
  } = useDriverLocation({
    activo: disponible,
    onUbicacion: guardarUbicacion,
  });

  // Solo está disponible si tiene permiso de ubicación
  const estaDisponible =
    disponible && permiso === 'granted';

  // Viaje en curso (si lo hay): abre la pantalla del viaje
  const { viajeActivo } = useActiveTrip({ driverId: uid });

  useEffect(() => {
    if (viajeActivo?.id) {
      navigation.navigate('ViajeEnCurso', { viajeId: viajeActivo.id });
    }
  }, [viajeActivo?.id, navigation]);

  // 3. Hook de solicitudes de viajes
  const {
    solicitudActiva,
    segundosRestantes,
    cargandoSolicitud,
    errorSolicitud,
    aceptarSolicitud,
    rechazarSolicitud,
  } = useTripRequests({
    driverId: uid,
    activo: estaDisponible && !viajeActivo,
  });

  // 4. Restaurar última disponibilidad guardada
  useEffect(() => {
    if (!uid) return undefined;

    let cancelado = false;

    leerUltimoEstadoDisponible(uid).then((valor) => {
      if (!cancelado) {
        setDisponible(valor);
        setPreferenciaLista(true);
      }
    });

    return () => {
      cancelado = true;
    };
  }, [uid]);

  // 5. Mantener disponibilidad sincronizada con Firestore
  useEffect(() => {
    if (!uid || !preferenciaLista || permiso === null) {
      return undefined;
    }

    actualizarDisponibilidad(uid, estaDisponible).catch((e) =>
      console.warn(
        '[home] no se pudo guardar la disponibilidad',
        e?.message
      )
    );
  }, [uid, preferenciaLista, permiso, estaDisponible]);

  // 6. Al salir de Inicio, dejar al conductor no disponible
  useEffect(() => {
    return () => {
      if (uid) {
        actualizarDisponibilidad(uid, false).catch(() => {});
      }
    };
  }, [uid]);

  // 7. El mapa sigue la ubicación del conductor
  useEffect(() => {
    if (!ubicacion || !mapRef.current) return;

    mapRef.current.animateToRegion(
      {
        latitude: ubicacion.lat,
        longitude: ubicacion.lng,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      },
      500
    );
  }, [ubicacion]);

  // 8. Cambiar disponibilidad
  const alternar = useCallback(
    (valor) => {
      if (valor && conductor?.status !== 'approved') {
        Alert.alert(
          'Cuenta no aprobada',
          'Tu cuenta debe estar aprobada para recibir viajes.'
        );
        return;
      }

      setDisponible(valor);
      guardarUltimoEstadoDisponible(uid, valor);
    },
    [uid, conductor?.status]
  );

  // 9. Aceptar solicitud
  const manejarAceptar = async () => {
    if (!solicitudActiva || procesandoSolicitud) return;

    try {
      setProcesandoSolicitud(true);

      // Al aceptar, useActiveTrip abre la pantalla del viaje
      await aceptarSolicitud(solicitudActiva.id);
    } catch (e) {
      Alert.alert(
        'No se pudo aceptar',
        e?.message || 'Intenta nuevamente.'
      );
    } finally {
      setProcesandoSolicitud(false);
    }
  };

  // 10. Rechazar solicitud
  const manejarRechazar = async () => {
    if (!solicitudActiva || procesandoSolicitud) return;

    try {
      setProcesandoSolicitud(true);

      await rechazarSolicitud(solicitudActiva.id);

    } catch (e) {
      Alert.alert(
        'Error',
        'No se pudo rechazar la solicitud.'
      );
    } finally {
      setProcesandoSolicitud(false);
    }
  };

  const nombre =
    conductor?.fullName?.split(' ')[0] ?? '';

  return (
    <View style={styles.pantalla}>

      {/* MAPA */}
      {ubicacion ? (
        <MapView
          ref={mapRef}
          style={StyleSheet.absoluteFill}
          initialRegion={{
            latitude: ubicacion.lat,
            longitude: ubicacion.lng,
            latitudeDelta: 0.01,
            longitudeDelta: 0.01,
          }}
          showsUserLocation
        />
      ) : (
        <View style={styles.cargandoMapa}>
          {permiso === 'denied' ? (
            <Text style={styles.textoSecundario}>
              Necesitamos tu ubicación para mostrar el mapa.
            </Text>
          ) : (
            <ActivityIndicator
              size="large"
              color="#145BB8"
            />
          )}
        </View>
      )}

      {/* BARRA SUPERIOR */}
      <View
        style={[
          styles.barraSuperior,
          { top: insets.top + 10 },
        ]}
      >
        <Pressable
          onPress={() => navigation.openDrawer()}
          hitSlop={12}
        >
          <Ionicons
            name="menu"
            size={26}
            color="#172B4D"
          />
        </Pressable>

        <Text style={styles.saludo}>
          Hola{nombre ? `, ${nombre}` : ''}
        </Text>

        <View style={styles.espaciador} />
      </View>

      {/* TARJETA DE SOLICITUD */}
      {solicitudActiva && estaDisponible ? (
        <View
          style={[
            styles.tarjetaSolicitud,
            { top: insets.top + 85 },
          ]}
        >
          <View style={styles.encabezadoSolicitud}>
            <View>
              <Text style={styles.tituloSolicitud}>
                ¡Nuevo viaje!
              </Text>

              <Text style={styles.subtituloSolicitud}>
                Tienes una solicitud entrante
              </Text>
            </View>

            <View style={styles.temporizador}>
              <Ionicons
                name="time-outline"
                size={18}
                color="#D97706"
              />

              <Text style={styles.textoTemporizador}>
                {segundosRestantes}s
              </Text>
            </View>
          </View>

          <ScrollView
            style={styles.contenidoSolicitud}
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.datoRuta}>
              <Ionicons
                name="radio-button-on"
                size={18}
                color="#16A34A"
              />

              <View style={styles.datoTexto}>
                <Text style={styles.etiqueta}>
                  Punto de recogida
                </Text>

                <Text style={styles.valor}>
                  {solicitudActiva.origin?.address ||
                    'Origen no especificado'}
                </Text>
              </View>
            </View>

            <View style={styles.lineaRuta} />

            <View style={styles.datoRuta}>
              <Ionicons
                name="location"
                size={19}
                color="#DC2626"
              />

              <View style={styles.datoTexto}>
                <Text style={styles.etiqueta}>
                  Destino
                </Text>

                <Text style={styles.valor}>
                  {solicitudActiva.destination?.address ||
                    'Destino no especificado'}
                </Text>
              </View>
            </View>

            <View style={styles.divisor} />

            <View style={styles.filaDetalles}>
              <View style={styles.detalle}>
                <Ionicons
                  name="navigate-outline"
                  size={19}
                  color="#145BB8"
                />

                <Text style={styles.etiqueta}>
                  Distancia
                </Text>

                <Text style={styles.valor}>
                  {solicitudActiva.distanceKm ?? 0} km
                </Text>
              </View>

              <View style={styles.detalle}>
                <Ionicons
                  name="time-outline"
                  size={19}
                  color="#145BB8"
                />

                <Text style={styles.etiqueta}>
                  Duración
                </Text>

                <Text style={styles.valor}>
                  {solicitudActiva.durationMin ?? 0} min
                </Text>
              </View>

              <View style={styles.detalle}>
                <Ionicons
                  name="car-outline"
                  size={19}
                  color="#145BB8"
                />

                <Text style={styles.etiqueta}>
                  Categoría
                </Text>

                <Text style={styles.valor}>
                  {solicitudActiva.category || 'Economy'}
                </Text>
              </View>
            </View>

            <View style={styles.divisor} />

            <View style={styles.filaPago}>
              <Text style={styles.etiqueta}>
                Método de pago
              </Text>

              <Text style={styles.valor}>
                {solicitudActiva.paymentMethod || 'No especificado'}
              </Text>
            </View>

            <View style={styles.filaPago}>
              <Text style={styles.etiqueta}>
                Tarifa estimada
              </Text>

              <Text style={styles.valor}>
                {formatoDinero(
                  solicitudActiva.estimatedFare
                )}
              </Text>
            </View>

            <View style={styles.filaGanancia}>
              <Text style={styles.textoGanancia}>
                Tu ganancia estimada
              </Text>

              <Text style={styles.valorGanancia}>
                {formatoDinero(
                  solicitudActiva.estimatedDriverEarnings
                )}
              </Text>
            </View>
          </ScrollView>

          {/* BOTONES */}
          <View style={styles.botonesSolicitud}>
            <Pressable
              style={[
                styles.botonRechazar,
                procesandoSolicitud && styles.botonDeshabilitado,
              ]}
              onPress={manejarRechazar}
              disabled={procesandoSolicitud}
            >
              <Text style={styles.textoBotonRechazar}>
                Rechazar
              </Text>
            </Pressable>

            <Pressable
              style={[
                styles.botonAceptar,
                procesandoSolicitud && styles.botonDeshabilitado,
              ]}
              onPress={manejarAceptar}
              disabled={procesandoSolicitud}
            >
              {procesandoSolicitud ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text style={styles.textoBotonAceptar}>
                  Aceptar viaje
                </Text>
              )}
            </Pressable>
          </View>
        </View>
      ) : null}

      {/* PANEL DE DISPONIBILIDAD */}
      <View
        style={[
          styles.panel,
          { paddingBottom: insets.bottom + 16 },
        ]}
      >
        <View style={styles.filaEstado}>
          <View style={styles.textos}>
            <Text style={styles.estado}>
              {estaDisponible
                ? 'Disponible'
                : 'No disponible'}
            </Text>

            <Text style={styles.textoSecundario}>
              {estaDisponible
                ? 'Compartiendo tu ubicación para recibir viajes.'
                : 'Actívalo para empezar a recibir solicitudes.'}
            </Text>
          </View>

          <Switch
            value={estaDisponible}
            onValueChange={alternar}
            disabled={
              permiso !== 'granted' ||
              !preferenciaLista
            }
            trackColor={{
              false: '#C9D3E0',
              true: '#1E8E3E',
            }}
          />
        </View>

        {permiso === 'denied' ? (
          <View style={styles.avisoPermiso}>
            <Text style={styles.errorTexto}>
              Activa el permiso de ubicación para poder
              ponerte Disponible.
            </Text>

            <Pressable
              onPress={() => Linking.openSettings()}
            >
              <Text style={styles.enlace}>
                Abrir ajustes
              </Text>
            </Pressable>
          </View>
        ) : null}

        {error ? (
          <Text style={styles.errorTexto}>
            {error}
          </Text>
        ) : null}

        {cargandoSolicitud && estaDisponible ? (
          <View style={styles.estadoSolicitudes}>
            <ActivityIndicator
              size="small"
              color="#145BB8"
            />

            <Text style={styles.textoSecundario}>
              Buscando solicitudes...
            </Text>
          </View>
        ) : null}

        {errorSolicitud ? (
          <Text style={styles.errorTexto}>
            {errorSolicitud}
          </Text>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  pantalla: {
    flex: 1,
    backgroundColor: '#F2F6FC',
  },

  cargandoMapa: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 30,
  },

  barraSuperior: {
    position: 'absolute',
    left: 16,
    right: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E4EBF5',
    zIndex: 2,
  },

  saludo: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#172B4D',
  },

  espaciador: {
    width: 26,
  },

  panel: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#FFFFFF',
    paddingTop: 18,
    paddingHorizontal: 20,
    borderTopLeftRadius: 22,
    borderTopRightRadius: 22,
    borderWidth: 1,
    borderColor: '#E4EBF5',
    zIndex: 2,
  },

  filaEstado: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },

  textos: {
    flex: 1,
  },

  estado: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#172B4D',
    marginBottom: 3,
  },

  textoSecundario: {
    fontSize: 13,
    color: '#718096',
    lineHeight: 19,
  },

  avisoPermiso: {
    marginTop: 12,
  },

  errorTexto: {
    fontSize: 13,
    color: '#D93025',
    marginTop: 8,
  },

  enlace: {
    fontSize: 14,
    fontWeight: '600',
    color: '#145BB8',
    marginTop: 6,
  },

  estadoSolicitudes: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 12,
  },

  tarjetaSolicitud: {
    position: 'absolute',
    left: 16,
    right: 16,
    maxHeight: '65%',
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E4EBF5',
    elevation: 8,
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    zIndex: 3,
  },

  encabezadoSolicitud: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },

  tituloSolicitud: {
    fontSize: 21,
    fontWeight: 'bold',
    color: '#172B4D',
  },

  subtituloSolicitud: {
    fontSize: 12,
    color: '#718096',
    marginTop: 3,
  },

  temporizador: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 11,
    paddingVertical: 8,
    borderRadius: 12,
  },

  textoTemporizador: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#B45309',
  },

  contenidoSolicitud: {
    flexShrink: 1,
  },

  datoRuta: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
  },

  datoTexto: {
    flex: 1,
  },

  etiqueta: {
    fontSize: 12,
    color: '#718096',
    marginBottom: 3,
  },

  valor: {
    fontSize: 14,
    fontWeight: '600',
    color: '#172B4D',
  },

  lineaRuta: {
    height: 18,
    width: 2,
    backgroundColor: '#D5DEEA',
    marginLeft: 8,
    marginVertical: 3,
  },

  divisor: {
    height: 1,
    backgroundColor: '#E4EBF5',
    marginVertical: 13,
  },

  filaDetalles: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },

  detalle: {
    alignItems: 'center',
    flex: 1,
    gap: 4,
  },

  filaPago: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 9,
    gap: 10,
  },

  filaGanancia: {
    backgroundColor: '#EAF5EE',
    borderRadius: 12,
    padding: 12,
    marginTop: 4,
  },

  textoGanancia: {
    color: '#166534',
    fontSize: 13,
    fontWeight: '600',
  },

  valorGanancia: {
    color: '#166534',
    fontSize: 21,
    fontWeight: 'bold',
    marginTop: 4,
  },

  botonesSolicitud: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 14,
  },

  botonRechazar: {
    flex: 1,
    backgroundColor: '#FEECEC',
    paddingVertical: 14,
    alignItems: 'center',
    borderRadius: 12,
  },

  textoBotonRechazar: {
    color: '#C62828',
    fontWeight: 'bold',
    fontSize: 14,
  },

  botonAceptar: {
    flex: 1.5,
    backgroundColor: '#145BB8',
    paddingVertical: 14,
    alignItems: 'center',
    borderRadius: 12,
  },

  textoBotonAceptar: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 14,
  },

  botonDeshabilitado: {
    opacity: 0.5,
  },
});
