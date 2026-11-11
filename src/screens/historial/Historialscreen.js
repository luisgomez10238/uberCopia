
import React from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
  Pressable,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { useSession } from '../../context/SessionContext';
import useTripHistory from '../../Hooks/useTripHistory';

import FiltroFecha from '../../components/Historial/FiltroFecha';
import FiltroPago from '../../components/Historial/FiltroFecha';
import ViajeCard from '../../components/Historial/ViajeCard';

export default function HistorialScreen() {
  const { usuario } = useSession();

  const {
    viajes,
    filtroFecha,
    setFiltroFecha,
    filtroPago,
    setFiltroPago,
    fechaInicio,
    setFechaInicio,
    fechaFin,
    setFechaFin,
    cargando,
    cargandoMas,
    actualizando,
    error,
    hayMas,
    cargarMas,
    actualizar,
  } = useTripHistory(usuario?.uid);

  const encabezado = (
    <View>
      <View style={styles.encabezado}>
        <Text style={styles.titulo}>Historial de viajes</Text>
        <Text style={styles.subtitulo}>
          Consulta tus viajes y ganancias anteriores
        </Text>
      </View>

      <View style={styles.filtros}>
        <FiltroFecha
          valor={filtroFecha}
          onChange={setFiltroFecha}
          fechaInicio={fechaInicio}
          setFechaInicio={setFechaInicio}
          fechaFin={fechaFin}
          setFechaFin={setFechaFin}
        />

        <FiltroPago
          valor={filtroPago}
          onChange={setFiltroPago}
        />
      </View>

      <Text style={styles.resultados}>
        {viajes.length} viajes cargados
      </Text>

      {error ? (
        <View style={styles.errorContainer}>
          <Text style={styles.errorTexto}>{error}</Text>

          <Pressable onPress={actualizar}>
            <Text style={styles.reintentar}>Reintentar</Text>
          </Pressable>
        </View>
      ) : null}
    </View>
  );

  if (cargando && viajes.length === 0) {
    return (
      <View style={styles.centrado}>
        <ActivityIndicator size="large" color="#2563EB" />
        <Text style={styles.textoCargando}>
          Cargando historial...
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.contenedor}>
      <FlatList
        data={viajes}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <ViajeCard viaje={item} />
        )}
        ListHeaderComponent={encabezado}
        contentContainerStyle={styles.lista}
        refreshControl={
          <RefreshControl
            refreshing={actualizando}
            onRefresh={actualizar}
            colors={['#2563EB']}
          />
        }
        ListEmptyComponent={
          !error ? (
            <View style={styles.vacio}>
              <Ionicons
                name="receipt-outline"
                size={48}
                color="#94A3B8"
              />

              <Text style={styles.vacioTitulo}>
                No hay viajes para mostrar
              </Text>

              <Text style={styles.vacioTexto}>
                Cuando completes viajes, aparecerán aquí.
              </Text>
            </View>
          ) : null
        }
        ListFooterComponent={
          cargandoMas ? (
            <ActivityIndicator
              size="small"
              color="#2563EB"
              style={styles.pie}
            />
          ) : hayMas ? (
            <Pressable
              style={styles.botonMas}
              onPress={cargarMas}
            >
              <Text style={styles.textoBotonMas}>
                Cargar más viajes
              </Text>
              <Ionicons
                name="chevron-down"
                size={18}
                color="#2563EB"
              />
            </Pressable>
          ) : viajes.length > 0 ? (
            <Text style={styles.finLista}>
              No hay más viajes para mostrar.
            </Text>
          ) : null
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  contenedor: {
    flex: 1,
    backgroundColor: '#F4F7FB',
  },
  lista: {
    padding: 16,
    paddingBottom: 30,
    flexGrow: 1,
  },
  encabezado: {
    backgroundColor: '#FFFFFF',
    padding: 18,
    borderRadius: 14,
    marginBottom: 14,
  },
  titulo: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#172B4D',
  },
  subtitulo: {
    fontSize: 14,
    color: '#64748B',
    marginTop: 5,
  },
  filtros: {
    backgroundColor: '#FFFFFF',
    padding: 15,
    borderRadius: 14,
    marginBottom: 12,
    gap: 8,
  },
  resultados: {
    color: '#64748B',
    fontSize: 12,
    marginBottom: 12,
  },
  vacio: {
    alignItems: 'center',
    paddingVertical: 45,
    paddingHorizontal: 20,
  },
  vacioTitulo: {
    color: '#334155',
    fontSize: 16,
    fontWeight: '700',
    marginTop: 12,
  },
  vacioTexto: {
    color: '#94A3B8',
    fontSize: 13,
    textAlign: 'center',
    marginTop: 6,
  },
  centrado: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F4F7FB',
  },
  textoCargando: {
    color: '#64748B',
    marginTop: 12,
  },
  pie: {
    padding: 18,
  },
  botonMas: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 7,
    padding: 15,
  },
  textoBotonMas: {
    color: '#2563EB',
    fontWeight: '700',
  },
  finLista: {
    textAlign: 'center',
    color: '#94A3B8',
    fontSize: 12,
    padding: 18,
  },
  errorContainer: {
    backgroundColor: '#FEF2F2',
    padding: 12,
    borderRadius: 9,
    marginBottom: 12,
  },
  errorTexto: {
    color: '#991B1B',
    fontSize: 12,
  },
  reintentar: {
    color: '#B91C1C',
    fontWeight: '700',
    marginTop: 8,
  },
});
