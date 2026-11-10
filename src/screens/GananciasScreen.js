
import React from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';

import { Ionicons } from '@expo/vector-icons';
import useEarnings from '../Hooks/useEarnings';

// Formatea los valores en pesos colombianos.
const formatearDinero = (valor) => {
  return Number(valor || 0).toLocaleString('es-CO', {
    style: 'currency',
    currency: 'COP',
    maximumFractionDigits: 0,
  });
};

// Componente reutilizable para mostrar cada indicador.
const TarjetaIndicador = ({ titulo, valor, icono, dinero = true }) => {
  return (
    <View style={styles.tarjetaIndicador}>
      <View style={styles.iconoContenedor}>
        <Ionicons name={icono} size={22} color="#2563EB" />
      </View>

      <Text style={styles.tituloIndicador}>
        {titulo}
      </Text>

      <Text style={styles.valorIndicador}>
        {dinero ? formatearDinero(valor) : valor}
      </Text>
    </View>
  );
};

// Componente que agrupa los seis indicadores de un periodo.
const ResumenPeriodo = ({ titulo, resumen }) => {
  return (
    <View style={styles.seccion}>
      <Text style={styles.tituloSeccion}>
        {titulo}
      </Text>

      <View style={styles.contenedorTarjetas}>
        <TarjetaIndicador
          titulo="Número de viajes"
          valor={resumen.totalViajes}
          icono="car-outline"
          dinero={false}
        />

        <TarjetaIndicador
          titulo="Total facturado"
          valor={resumen.totalFacturado}
          icono="cash-outline"
        />

        <TarjetaIndicador
          titulo="Comisiones"
          valor={resumen.totalComisiones}
          icono="business-outline"
        />

        <TarjetaIndicador
          titulo="Propinas"
          valor={resumen.totalPropinas}
          icono="gift-outline"
        />

        <TarjetaIndicador
          titulo="Ganancia neta"
          valor={resumen.gananciaNeta}
          icono="wallet-outline"
        />

        <TarjetaIndicador
          titulo="Promedio por viaje"
          valor={resumen.promedioPorViaje}
          icono="stats-chart-outline"
        />
      </View>
    </View>
  );
};

export default function GananciasScreen() {

  // Obtenemos los datos calculados por nuestro custom hook.
  const {
    hoy,
    semana,
    mes,
    saldo,
    cargando,
    error,
  } = useEarnings();

  // Estado de carga.
  if (cargando) {
    return (
      <View style={styles.estado}>
        <ActivityIndicator size="large" color="#2563EB" />

        <Text style={styles.textoEstado}>
          Cargando ganancias...
        </Text>
      </View>
    );
  }

  // Estado de error.
  if (error) {
    return (
      <View style={styles.estado}>
        <Ionicons
          name="alert-circle-outline"
          size={45}
          color="#DC2626"
        />

        <Text style={styles.textoError}>
          No se pudieron cargar las ganancias.
        </Text>

        <Text style={styles.descripcion}>
          {error}
        </Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.pantalla}
      contentContainerStyle={styles.contenido}
    >

      {/* Encabezado */}
      <View style={styles.encabezado}>
        <Text style={styles.titulo}>
          Mis ganancias
        </Text>

        <Text style={styles.subtitulo}>
          Consulta tus ingresos y actividad.
        </Text>
      </View>

      {/* Saldo del conductor */}
      <View style={styles.tarjetaSaldo}>
        <View style={styles.filaSaldo}>
          <Ionicons
            name="wallet-outline"
            size={23}
            color="#FFFFFF"
          />

          <Text style={styles.textoSaldo}>
            Saldo del conductor
          </Text>
        </View>

        <Text style={styles.valorSaldo}>
          {formatearDinero(saldo)}
        </Text>

        <Text style={styles.descripcionSaldo}>
          Ganancias electrónicas menos comisiones
          pendientes de viajes en efectivo.
        </Text>
      </View>

      {/* Resumen de hoy */}
      <ResumenPeriodo
        titulo="Hoy"
        resumen={hoy}
      />

      {/* Resumen de la semana */}
      <ResumenPeriodo
        titulo="Esta semana"
        resumen={semana}
      />

      {/* Resumen del mes */}
      <ResumenPeriodo
        titulo="Este mes"
        resumen={mes}
      />

    </ScrollView>
  );
}

const styles = StyleSheet.create({

  pantalla: {
    flex: 1,
    backgroundColor: '#F3F4F6',
  },

  contenido: {
    padding: 20,
    paddingBottom: 35,
  },

  encabezado: {
    marginBottom: 22,
  },

  titulo: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#111827',
  },

  subtitulo: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 5,
  },

  tarjetaSaldo: {
    backgroundColor: '#2563EB',
    borderRadius: 18,
    padding: 22,
    marginBottom: 28,
  },

  filaSaldo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 9,
  },

  textoSaldo: {
    color: '#DBEAFE',
    fontSize: 15,
  },

  valorSaldo: {
    color: '#FFFFFF',
    fontSize: 32,
    fontWeight: 'bold',
    marginVertical: 14,
  },

  descripcionSaldo: {
    color: '#DBEAFE',
    fontSize: 12,
    lineHeight: 19,
  },

  seccion: {
    marginBottom: 25,
  },

  tituloSeccion: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 14,
  },

  contenedorTarjetas: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },

  tarjetaIndicador: {
    backgroundColor: '#FFFFFF',
    width: '48%',
    borderRadius: 14,
    padding: 14,
    marginBottom: 12,
    elevation: 2,
  },

  iconoContenedor: {
    backgroundColor: '#DBEAFE',
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 11,
  },

  tituloIndicador: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 7,
  },

  valorIndicador: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#111827',
  },

  estado: {
    flex: 1,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 25,
  },

  textoEstado: {
    marginTop: 12,
    color: '#374151',
    fontSize: 15,
  },

  textoError: {
    fontSize: 17,
    fontWeight: 'bold',
    color: '#DC2626',
    marginTop: 12,
  },

  descripcion: {
    fontSize: 13,
    color: '#6B7280',
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 20,
  },

});
